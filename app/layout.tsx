// app/layout.tsx — Root Next.js App Router layout loading Literata, Albert Sans, and Spline Sans Mono with swap display
import React from 'react';
import type { Metadata } from 'next';
import { Literata, Albert_Sans, Spline_Sans_Mono } from 'next/font/google';
import './globals.css';
import { siteConfig } from '@/lib/config-loader';

const literata = Literata({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-literata',
  preload: true,
});

const albertSans = Albert_Sans({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-albert',
  preload: false,
});

const splineMono = Spline_Sans_Mono({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-spline-mono',
  preload: false,
});

export const metadata: Metadata = {
  title: `${siteConfig.productName} — ${siteConfig.tagline}`,
  description:
    'See what the product does, how it got there, where it might be wrong, and what happens to your data, before you sign up.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${literata.variable} ${albertSans.variable} ${splineMono.variable}`}
    >
      <body className="antialiased selection:bg-[var(--color-marker)] selection:text-[var(--color-ink)]">
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}

