// app/[locale]/changelog/page.tsx — Supporting Full Changelog page with filter chips, anchors per entry, and stamped badges (Part 4.14)
import React from 'react';
import Link from 'next/link';
import {
  siteConfig,
  changelogConfig,
  getMessagesForLocale,
} from '@/lib/config-loader';
import { normalizeLocale, SUPPORTED_LOCALES } from '@/lib/i18n';
import { Header } from '@/components/header/header';
import { Footer } from '@/components/footer/footer';
import { ChangelogFullList } from '@/components/changelog/changelog-full-list';

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function ChangelogPage({
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

      <main className="flex-1 py-12 sm:py-20 max-w-[var(--container-max)] mx-auto px-[var(--side-margin)] w-full">
        <div className="mb-8">
          <Link
            href={`/${locale}/`}
            className="font-mono text-xs text-[var(--color-ink-blue)] underline"
          >
            ← {siteConfig.productName}
          </Link>
          <h1 className="mt-3 font-serif text-[length:var(--text-h1)] leading-[var(--leading-h1)] text-[var(--color-ink)]">
            {messages.changelog.headlineBefore}
            <em className="italic font-normal text-[var(--color-ink-blue)]">
              {messages.changelog.headlineItalic}
            </em>
            {messages.changelog.headlineAfter}
          </h1>
          <p className="mt-2 font-sans text-sm text-[var(--color-ink-muted)]">
            {messages.changelog.marginNote}
          </p>
        </div>

        <ChangelogFullList
          config={changelogConfig}
          sampleLabel={messages.sampleBadge}
          filterAllLabel={messages.changelog.filterAll}
        />
      </main>

      <Footer
        site={siteConfig}
        messages={messages.footer}
        sampleLabel={messages.sampleBadge}
      />
    </>
  );
}

