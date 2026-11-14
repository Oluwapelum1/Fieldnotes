// app/[locale]/layout.tsx — Locale wrapper layout setting RTL/LTR direction and NotebookProvider context
import React from 'react';
import {
  LOCALE_METADATA,
  SUPPORTED_LOCALES,
  normalizeLocale,
} from '@/lib/i18n';
import { NotebookProvider } from '@/components/notebook-context';

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolved = await params;
  const locale = normalizeLocale(resolved.locale);
  const meta = LOCALE_METADATA[locale];

  return (
    <div dir={meta.dir} lang={meta.langTag} className="min-h-screen flex flex-col">
      <NotebookProvider locale={locale}>{children}</NotebookProvider>
    </div>
  );
}

