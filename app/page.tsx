// app/page.tsx — Root index page rendering the default locale landing page inside LocaleLayout (NotebookProvider)
import React from 'react';
import LocaleLayout from './[locale]/layout';
import LocaleLandingPage from './[locale]/page';
import { siteConfig } from '@/lib/config-loader';

export default async function IndexPage() {
  const params = Promise.resolve({ locale: siteConfig.defaultLocale });
  return (
    <LocaleLayout params={params}>
      <LocaleLandingPage params={params} />
    </LocaleLayout>
  );
}


