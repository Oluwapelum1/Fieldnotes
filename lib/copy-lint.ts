// lib/copy-lint.ts — Pure copy-lint scanner for unverified compliance claims and banned hype filler (Part 1.6, 1.8, 5.5)

export interface CopyLintFinding {
  rule: 'unverified-claim' | 'banned-hype';
  matchedPhrase: string;
  path: string;
  excerpt: string;
  message: string;
}

export interface CopyLintInputEntry {
  path: string;
  text: string;
  evidenceUrl?: string;
}

const CLAIM_PATTERNS: Array<{ label: string; regex: RegExp }> = [
  { label: 'certified', regex: /\bcertified\b/i },
  { label: 'compliant', regex: /\bcompliant\b/i },
  { label: 'guaranteed', regex: /\bguaranteed\b/i },
  { label: '100 percent secure', regex: /\b100\s*(%|percent)\s*secure\b/i },
  { label: '100% accurate', regex: /\b100\s*(%|percent)\s*accurate\b/i },
  { label: 'never wrong', regex: /\bnever\s+wrong\b/i },
  { label: 'zero hallucinations', regex: /\bzero\s+hallucinations\b/i },
];

const HYPE_PATTERNS: Array<{ label: string; regex: RegExp }> = [
  { label: 'unlock', regex: /\bunlock(s|ed|ing)?\b/i },
  { label: 'elevate', regex: /\belevat(e|es|ed|ing)\b/i },
  { label: 'seamless', regex: /\bseamless(ly)?\b/i },
  { label: 'revolutionary', regex: /\brevolutionary\b/i },
  { label: 'game-changing', regex: /\bgame[- ]changing\b/i },
  { label: 'supercharge', regex: /\bsupercharg(e|es|ed|ing)\b/i },
];

/**
 * Pure function that lints a single text string with optional evidenceUrl.
 */
export function lintTextEntry(entry: CopyLintInputEntry): CopyLintFinding[] {
  const findings: CopyLintFinding[] = [];
  const { path, text, evidenceUrl } = entry;

  if (!text || typeof text !== 'string') return findings;

  const hasValidEvidence =
    typeof evidenceUrl === 'string' && /^https?:\/\/\S+/i.test(evidenceUrl.trim());

  // 1. Check compliance/security/accuracy guarantee words (allowed ONLY if evidenceUrl is present)
  if (!hasValidEvidence) {
    for (const pat of CLAIM_PATTERNS) {
      const match = text.match(pat.regex);
      if (match) {
        findings.push({
          rule: 'unverified-claim',
          matchedPhrase: match[0],
          path,
          excerpt: text.slice(0, 120),
          message: `[Copy-Lint] Unverified claim "${match[0]}" at "${path}". Claims of certification, compliance, guarantees, or accuracy require an evidenceUrl in the config entry.`,
        });
      }
    }
  }

  // 2. Check banned hype/filler words (never allowed)
  for (const pat of HYPE_PATTERNS) {
    const match = text.match(pat.regex);
    if (match) {
      findings.push({
        rule: 'banned-hype',
        matchedPhrase: match[0],
        path,
        excerpt: text.slice(0, 120),
        message: `[Copy-Lint] Banned hype word "${match[0]}" at "${path}". Replace with specific, humble notebook prose (Voice Rule 1.8).`,
      });
    }
  }

  return findings;
}

/**
 * Recursively extracts all text strings (and any sibling `evidenceUrl`) from a structured JSON object
 * and runs `lintTextEntry` across every field.
 */
export function lintStructuredObject(
  rootName: string,
  obj: unknown
): CopyLintFinding[] {
  const findings: CopyLintFinding[] = [];

  function walk(node: unknown, currentPath: string, inheritedEvidenceUrl?: string) {
    if (node === null || node === undefined) return;

    if (typeof node === 'string') {
      // Skip linting URLs or IDs
      if (/^https?:\/\//i.test(node)) return;
      findings.push(
        ...lintTextEntry({
          path: currentPath,
          text: node,
          evidenceUrl: inheritedEvidenceUrl,
        })
      );
      return;
    }

    if (Array.isArray(node)) {
      node.forEach((child, idx) => {
        walk(child, `${currentPath}[${idx}]`, inheritedEvidenceUrl);
      });
      return;
    }

    if (typeof node === 'object') {
      const record = node as Record<string, unknown>;
      const localEvidence =
        typeof record.evidenceUrl === 'string'
          ? record.evidenceUrl
          : inheritedEvidenceUrl;

      for (const [key, val] of Object.entries(record)) {
        if (key === 'id' || key === 'evidenceUrl' || key === 'glyph') continue;
        walk(val, `${currentPath}.${key}`, localEvidence);
      }
    }
  }

  walk(obj, rootName);
  return findings;
}

