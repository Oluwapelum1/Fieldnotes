// lib/config-schema.ts — Zod validation schemas for all Fieldnotes configuration files with detailed error messages
import { z } from 'zod';

export const SupportedLocaleSchema = z.enum(['en', 'es', 'de', 'ar', 'ja']);
export type SupportedLocale = z.infer<typeof SupportedLocaleSchema>;

export const SiteConfigSchema = z
  .object({
    productName: z.string().min(1, 'productName cannot be empty'),
    tagline: z.string().min(1, 'tagline cannot be empty'),
    defaultLocale: SupportedLocaleSchema,
    locales: z.array(SupportedLocaleSchema).min(1),
    defaultTheme: z.enum(['paper', 'night']),
    defaultMotion: z.enum(['full', 'calm', 'off']),
    liveEngineActive: z.boolean().default(false),
    showScriptedTag: z.boolean().default(true),
    allowCustomInputInDemo: z.boolean().default(true),
    allowPlaceholdersInProduction: z.boolean().default(false),
    failOnSampleInProduction: z.boolean().default(false),
    formEndpoint: z.string().url('formEndpoint must be a valid URL'),
    contactEmail: z.string().email('contactEmail must be a valid email'),
    securityContactEmail: z.string().email('securityContactEmail must be a valid email'),
    reportLimitationUrl: z.string().min(1),
    requestDeletionUrl: z.string().min(1),
    exportDataUrl: z.string().min(1),
    standingAiDisclosure: z.string().optional(),
    disableDisclosureReason: z.string().optional(),
    lastUpdated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'lastUpdated must be YYYY-MM-DD'),
    sampleFlag: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (!data.standingAiDisclosure || data.standingAiDisclosure.trim().length === 0) {
      if (!data.disableDisclosureReason || data.disableDisclosureReason.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['standingAiDisclosure'],
          message:
            'standingAiDisclosure is required unless explicitly disabled with a non-empty disableDisclosureReason.',
        });
      }
    }
    if (!data.showScriptedTag && !data.liveEngineActive) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['showScriptedTag'],
        message:
          'showScriptedTag cannot be false while liveEngineActive is false (Honesty Rule 1.6).',
      });
    }
  });

export type SiteConfig = z.infer<typeof SiteConfigSchema>;

export const InputBlockSchema = z.object({
  id: z.string().min(1),
  author: z.string().min(1),
  text: z.string().min(1),
  attended: z.boolean(),
});

export const ScenarioStepSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  detail: z.string().min(1),
  durationLabel: z.string().optional(),
  reads: z.array(z.string()),
  produces: z.array(z.string()),
});

export const ClaimSegmentSchema = z.object({
  text: z.string().min(1),
  sources: z.array(z.string()).default([]),
  claimType: z.enum(['sourced', 'inferred', 'unknown']).optional(),
  stepId: z.string().min(1),
});

export const OutputCardSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  segments: z.array(ClaimSegmentSchema).min(1),
});

export const CaveatSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  relatedBlocks: z.array(z.string()),
  conflictNote: z.string().optional(),
});

export const LeftOutItemSchema = z.object({
  text: z.string().min(1),
  reason: z.string().min(1),
});

export const ScenarioSchema = z
  .object({
    id: z.string().min(1),
    chipLabel: z.string().min(1),
    title: z.string().min(1),
    inputBlocks: z.array(InputBlockSchema).min(1),
    steps: z.array(ScenarioStepSchema).min(1),
    outputCards: z.array(OutputCardSchema).min(1),
    caveats: z.array(CaveatSchema),
    leftOut: z.array(LeftOutItemSchema),
    sampleRunSeconds: z.number().positive(),
    sample: z.boolean().default(true),
  })
  .superRefine((scenario, ctx) => {
    const blockIds = new Set(scenario.inputBlocks.map((b) => b.id));
    const stepIds = new Set(scenario.steps.map((s) => s.id));

    scenario.steps.forEach((step, sIdx) => {
      step.reads.forEach((readId) => {
        if (!blockIds.has(readId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['steps', sIdx, 'reads'],
            message: `Scenario "${scenario.id}" step "${step.id}" references non-existent inputBlock "${readId}". Fix by adding "${readId}" to inputBlocks or updating step.reads.`,
          });
        }
      });
    });

    let globalClaimIdx = 0;
    scenario.outputCards.forEach((card, cIdx) => {
      card.segments.forEach((seg, segIdx) => {
        const hasSources = seg.sources && seg.sources.length > 0;
        const hasValidLabel = seg.claimType === 'inferred' || seg.claimType === 'unknown';
        if (!hasSources && !hasValidLabel) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['outputCards', cIdx, 'segments', segIdx],
            message: `Scenario "${scenario.id}" claim index ${globalClaimIdx} (in card "${card.id}") has neither sources, an "inferred" label, nor an "unknown" label. Fix by adding valid inputBlock IDs to sources[] or setting claimType to "inferred" or "unknown".`,
          });
        }
        seg.sources.forEach((srcId) => {
          if (!blockIds.has(srcId)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['outputCards', cIdx, 'segments', segIdx, 'sources'],
              message: `Scenario "${scenario.id}" claim index ${globalClaimIdx} references non-existent source block "${srcId}".`,
            });
          }
        });
        if (!stepIds.has(seg.stepId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['outputCards', cIdx, 'segments', segIdx, 'stepId'],
            message: `Scenario "${scenario.id}" claim index ${globalClaimIdx} references non-existent stepId "${seg.stepId}".`,
          });
        }
        globalClaimIdx++;
      });
    });

    scenario.caveats.forEach((cav, cavIdx) => {
      cav.relatedBlocks.forEach((bId) => {
        if (!blockIds.has(bId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['caveats', cavIdx, 'relatedBlocks'],
            message: `Scenario "${scenario.id}" caveat "${cav.id}" references non-existent inputBlock "${bId}".`,
          });
        }
      });
    });
  });

export type Scenario = z.infer<typeof ScenarioSchema>;
export const ScenarioListSchema = z.array(ScenarioSchema).min(1);

export const LimitEntrySchema = z.object({
  id: z.string().min(1),
  limitation: z.string().min(1),
  checkWhen: z.string().min(1),
  workaround: z.string().min(1),
  status: z.enum(['Limitation', 'Planned', 'Fixed']),
  lastReviewed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'lastReviewed must be YYYY-MM-DD format'),
  sample: z.boolean().default(true),
  evidenceUrl: z.string().url().optional(),
});

export const LimitsConfigSchema = z.object({
  lastReviewedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'lastReviewedDate must be YYYY-MM-DD'),
  sample: z.boolean().default(true),
  entries: z.array(LimitEntrySchema).min(3, 'limits.json must contain at least 3 limitation entries.'),
});
export type LimitsConfig = z.infer<typeof LimitsConfigSchema>;

export const DataJourneyNodeSchema = z
  .object({
    id: z.enum(['your-data', 'in-transit', 'processing', 'storage', 'deletion']),
    title: z.string().min(1),
    statementTemplate: z.string().min(1),
    detail: z.string().min(1),
    fillInValues: z.record(z.string(), z.union([z.string(), z.number()])).default({}),
    subprocessors: z.array(z.string()).default([]),
    evidenceUrl: z.string().url().optional(),
    placeholder: z.boolean().default(false),
    sample: z.boolean().default(true),
  })
  .superRefine((node, ctx) => {
    if (!node.evidenceUrl && !node.placeholder) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['evidenceUrl'],
        message: `DataJourney node "${node.id}" must either provide an evidenceUrl or set placeholder: true. Fix by adding an evidenceUrl or flagging placeholder: true.`,
      });
    }
  });

export const SubprocessorSchema = z.object({
  name: z.string().min(1),
  purpose: z.string().min(1),
  region: z.string().min(1),
  sample: z.boolean().default(true),
});

export const DataRegionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  location: z.string().min(1),
  retentionDays: z.number().int().nonnegative(),
});

export const DataJourneyConfigSchema = z.object({
  sample: z.boolean().default(true),
  regions: z.array(DataRegionSchema).min(1),
  nodes: z.array(DataJourneyNodeSchema).length(5),
  subprocessors: z.array(SubprocessorSchema),
});
export type DataJourneyConfig = z.infer<typeof DataJourneyConfigSchema>;

export const IntegrationItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(['Email', 'Docs', 'Chat', 'CRM', 'Storage']),
  glyph: z.enum([
    'envelope-grid',
    'tray-stack',
    'stamp-seal',
    'sheet-matrix',
    'binder-tabs',
    'ledger-lines',
    'signal-wave',
    'thread-knot',
    'relay-ring',
    'funnel-prism',
    'contact-card',
    'deal-compass',
    'vault-cube',
    'archive-crate',
    'bucket-cylinder',
  ]),
  reads: z.string().min(1),
  writes: z.string().min(1),
  needs: z.string().min(1),
  seed: z.number().int(),
  sample: z.boolean().default(true),
});

export const IntegrationsConfigSchema = z.object({
  sample: z.boolean().default(true),
  categories: z.array(z.enum(['Email', 'Docs', 'Chat', 'CRM', 'Storage'])).length(5),
  items: z.array(IntegrationItemSchema).length(15),
});
export type IntegrationsConfig = z.infer<typeof IntegrationsConfigSchema>;

export const PlanSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    monthlyPricePerUser: z.number().nonnegative(),
    whoItsFor: z.string().min(1),
    features: z.array(z.string().min(1)).length(5),
    ctaLabel: z.string().min(1),
    mostTeamsStartHere: z.boolean().default(false),
    mostTeamsEvidenceUrl: z.string().url().optional(),
    sample: z.boolean().default(true),
  })
  .superRefine((plan, ctx) => {
    if (plan.mostTeamsStartHere && !plan.mostTeamsEvidenceUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['mostTeamsEvidenceUrl'],
        message: `Plan "${plan.id}" sets mostTeamsStartHere: true without mostTeamsEvidenceUrl. Provide data evidence or set mostTeamsStartHere: false.`,
      });
    }
  });

export const ComparisonRowSchema = z.object({
  feature: z.string().min(1),
  values: z.record(z.string(), z.string()),
});

export const PricingConfigSchema = z.object({
  baseCurrency: z.string().min(3).max(3),
  yearlyDiscountPercent: z.number().min(0).max(100),
  taxNotice: z.string().min(1),
  freePlanLimits: z.array(z.string().min(1)).min(1),
  cancellationPolicy: z.string().min(1),
  refundPolicy: z.string().min(1),
  sample: z.boolean().default(true),
  plans: z.array(PlanSchema).length(3),
  comparisonRows: z.array(ComparisonRowSchema).min(1),
});
export type PricingConfig = z.infer<typeof PricingConfigSchema>;

export const ChangelogEntrySchema = z
  .object({
    id: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
    version: z.string().min(1),
    tag: z.enum(['New', 'Improved', 'Fixed']),
    title: z.string().min(1),
    summary: z.string().min(1),
    evidenceUrl: z.string().url().optional(),
    sample: z.boolean().default(true),
  })
  .superRefine((entry, ctx) => {
    const pctRegex = /\b\d+(\.\d+)?\s*(%|percent\b)\s*(faster|quicker|speedup|better|more accurate)/i;
    if (pctRegex.test(entry.title) || pctRegex.test(entry.summary)) {
      if (!entry.evidenceUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['summary'],
          message: `Changelog entry "${entry.id}" contains a percentage speed/accuracy claim without an evidenceUrl.`,
        });
      }
    }
  });

export const ChangelogConfigSchema = z
  .object({
    sample: z.boolean().default(true),
    entries: z.array(ChangelogEntrySchema).min(6),
  })
  .superRefine((cfg, ctx) => {
    for (let i = 1; i < cfg.entries.length; i++) {
      if (cfg.entries[i].date > cfg.entries[i - 1].date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['entries', i, 'date'],
          message: `Changelog entries must be sorted in descending chronological order. Entry "${cfg.entries[i].id}" (${cfg.entries[i].date}) is newer than "${cfg.entries[i - 1].id}" (${cfg.entries[i - 1].date}).`,
        });
      }
    }
  });
export type ChangelogConfig = z.infer<typeof ChangelogConfigSchema>;

export const FaqItemSchema = z
  .object({
    id: z.string().min(1),
    question: z.string().min(1),
    answer: z.string().min(1),
    isDataQuestion: z.boolean().default(false),
    dataJourneyNodeRef: z
      .enum(['your-data', 'in-transit', 'processing', 'storage', 'deletion'])
      .optional(),
    sample: z.boolean().default(true),
  })
  .superRefine((item, ctx) => {
    if (item.isDataQuestion && !item.dataJourneyNodeRef) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dataJourneyNodeRef'],
        message: `FAQ item "${item.id}" is a data/learning question (isDataQuestion: true) and must reference a dataJourneyNodeRef.`,
      });
    }
  });

export const FaqConfigSchema = z.object({
  sample: z.boolean().default(true),
  locales: z.record(SupportedLocaleSchema, z.array(FaqItemSchema).min(8)),
});
export type FaqConfig = z.infer<typeof FaqConfigSchema>;

export const CurrencyEntrySchema = z.object({
  code: z.string().length(3),
  symbol: z.string().min(1),
  name: z.string().min(1),
  rateFromBase: z.number().positive('Currency rate must be strictly positive'),
  decimals: z.number().int().min(0).max(2),
});

export const CurrenciesConfigSchema = z.object({
  baseCurrency: z.string().length(3),
  asOfDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'asOfDate must be YYYY-MM-DD'),
  sample: z.boolean().default(true),
  currencies: z.array(CurrencyEntrySchema).min(1),
});
export type CurrenciesConfig = z.infer<typeof CurrenciesConfigSchema>;

export interface ValidationResult<T> {
  ok: boolean;
  data?: T;
  errors: string[];
}

export function validateWithFileContext<T>(
  fileName: string,
  schema: z.ZodType<T>,
  rawData: unknown,
  options?: { isProduction?: boolean; allowPlaceholdersInProduction?: boolean }
): ValidationResult<T> {
  const parsed = schema.safeParse(rawData);
  const errors: string[] = [];

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const fieldPath = issue.path.length > 0 ? issue.path.join('.') : 'root';
      errors.push(`[${fileName}] Field "${fieldPath}": ${issue.message}`);
    }
    return { ok: false, errors };
  }

  // Extra production check for DataJourney placeholders
  if (
    options?.isProduction &&
    !options?.allowPlaceholdersInProduction &&
    fileName.includes('data-journey')
  ) {
    const dj = parsed.data as unknown as DataJourneyConfig;
    if (dj && Array.isArray(dj.nodes)) {
      dj.nodes.forEach((node, idx) => {
        if (node.placeholder) {
          errors.push(
            `[${fileName}] Field "nodes.${idx}.placeholder" (node "${node.id}"): Placeholder statements are not allowed in production builds unless allowPlaceholdersInProduction is true. Fix by supplying real statement copy, setting placeholder: false, and adding an evidenceUrl.`
          );
        }
      });
    }
  }

  return {
    ok: errors.length === 0,
    data: parsed.data,
    errors,
  };
}

