// app/[locale]/privacy/page.tsx — Supporting Privacy, Security, Subprocessors, Accessibility, and security.txt placeholder page (Part 4.14)
import React from 'react';
import Link from 'next/link';
import {
  siteConfig,
  dataJourneyConfig,
  getMessagesForLocale,
} from '@/lib/config-loader';
import { normalizeLocale, SUPPORTED_LOCALES } from '@/lib/i18n';
import { Header } from '@/components/header/header';
import { Footer } from '@/components/footer/footer';
import { DataJourneySection } from '@/components/data-journey/data-journey-section';
import { SampleTag } from '@/components/annotations/sample-tag';

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function PrivacyAndSecurityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolved = await params;
  const locale = normalizeLocale(resolved.locale);
  const messages = getMessagesForLocale(locale);

  return (
    <>
      <Header
        productName={siteConfig.productName}
        messages={messages.header}
        skipToContentLabel={messages.skipToContent}
      />

      <main className="flex-1 py-12 sm:py-20">
        <div className="max-w-[var(--container-max)] mx-auto px-[var(--side-margin)] mb-8">
          <Link
            href={`/${locale}/`}
            className="font-mono text-xs text-[var(--color-ink-blue)] underline"
          >
            ← {siteConfig.productName}
          </Link>
          <h1 className="mt-3 font-serif text-[length:var(--text-h1)] leading-[var(--leading-h1)] text-[var(--color-ink)]">
            {messages.footer.linkPrivacy}
          </h1>
          <p className="mt-2 font-mono text-xs text-[var(--color-red-pencil)]">
            Template notice: this page contains fill-in fields and sample subprocessors. Have qualified counsel review all data and security statements before publishing.
          </p>
        </div>

        {/* Full Data Journey diagram & Subprocessor table */}
        <div id="subprocessors">
          <DataJourneySection
            config={dataJourneyConfig}
            messages={messages.dataJourney}
            sampleLabel={messages.sampleBadge}
            requestDeletionUrl={siteConfig.requestDeletionUrl}
            exportDataUrl={siteConfig.exportDataUrl}
          />
        </div>

        {/* Reporting a security problem & standard security.txt placeholder (Part 4.14) */}
        <section
          id="security-txt"
          aria-labelledby="security-reporting-heading"
          className="max-w-[var(--container-max)] mx-auto px-[var(--side-margin)] py-12 border-t border-[var(--color-border-warm)]"
        >
          <div className="p-6 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)] space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2
                id="security-reporting-heading"
                className="font-serif text-xl font-semibold text-[var(--color-ink)]"
              >
                Reporting a security problem (/.well-known/security.txt)
              </h2>
              <SampleTag show={true} label={messages.sampleBadge} />
            </div>

            <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
              If you discover a vulnerability or data-handling bug, please email our security contact at{' '}
              <a
                href={`mailto:${siteConfig.securityContactEmail}`}
                className="font-mono text-[var(--color-ink-blue)] underline"
              >
                {siteConfig.securityContactEmail}
              </a>
              . Buyers using this template must replace the placeholder values below in{' '}
              <code>public/.well-known/security.txt</code> with real contact and key details before going live.
            </p>

            <pre className="p-4 rounded-[2px] bg-[var(--color-page)] border border-[var(--color-border-warm)] font-mono text-xs overflow-x-auto text-[var(--color-ink)]">
{`# Placeholder /.well-known/security.txt — Replace with real details before launch
Contact: mailto:${siteConfig.securityContactEmail}
Expires: 2027-11-10T00:00:00.000Z
Preferred-Languages: en, es, de, ar, ja
Canonical: https://example.invalid/.well-known/security.txt`}
            </pre>
          </div>
        </section>

        {/* Accessibility Statement section */}
        <section
          id="accessibility"
          aria-labelledby="a11y-statement-heading"
          className="max-w-[var(--container-max)] mx-auto px-[var(--side-margin)] py-12 border-t border-[var(--color-border-warm)]"
        >
          <div className="p-6 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)] space-y-3">
            <h2
              id="a11y-statement-heading"
              className="font-serif text-xl font-semibold text-[var(--color-ink)]"
            >
              {messages.footer.linkAccessibility}
            </h2>
            <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
              Fieldnotes is built to meet WCAG 2.2 AA contrast, keyboard navigation, and reduced-motion standards in both the Paper and Night notebooks. Every hand-drawn annotation is decorative and paired with plain text.
            </p>
          </div>
        </section>
      </main>

      <Footer
        site={siteConfig}
        messages={messages.footer}
        sampleLabel={messages.sampleBadge}
      />
    </>
  );
}

