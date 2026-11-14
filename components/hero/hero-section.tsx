// components/hero/hero-section.tsx — Hero section housing headline, subline, CTAs, and live scripted DemoWorkspace (Part 4.3)
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { Scenario } from '@/lib/config-schema';
import type { Messages } from '@/lib/config-loader';

const DemoWorkspace = dynamic(
  () => import('./demo-workspace').then((mod) => mod.DemoWorkspace),
  { ssr: true }
);

export interface HeroSectionProps {
  scenarios: Scenario[];
  messages: Messages['hero'];
  sampleLabel: string;
  showScriptedTag: boolean;
  allowCustomInput: boolean;
}

export function HeroSection({
  scenarios,
  messages,
  sampleLabel,
  showScriptedTag,
  allowCustomInput,
}: HeroSectionProps) {
  return (
    <section
      id="demo"
      aria-labelledby="hero-headline"
      className="relative pt-10 pb-20 sm:pt-14 sm:pb-28 px-[var(--side-margin)] max-w-[var(--container-max)] mx-auto"
    >
      {/* Headline & subline above the live demo workspace */}
      <div className="max-w-3xl mb-8 sm:mb-10">
        <h1
          id="hero-headline"
          className="font-serif text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-tight text-[var(--color-ink)]"
        >
          <span>{messages.headlineBefore}</span>
          <em className="italic font-normal text-[var(--color-ink-blue)]">
            {messages.headlineItalic}
          </em>
          <span>{messages.headlineAfter}</span>
        </h1>

        <p className="mt-4 font-sans text-lg sm:text-xl text-[var(--color-ink-muted)] leading-relaxed">
          {messages.subline}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <a
            href="#start-free-cta"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-[2px] bg-[var(--color-ink-blue)] text-[var(--color-card)] font-sans text-sm font-medium shadow-xs hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink-blue)]"
          >
            {messages.primaryCta}
          </a>
          <a
            href="#limits"
            className="inline-flex items-center gap-1.5 font-mono text-xs sm:text-sm text-[var(--color-ink-blue)] underline underline-offset-4 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)]"
          >
            <span>{messages.secondaryLink}</span>
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>

      {/* Live scripted demo workspace */}
      <DemoWorkspace
        scenarios={scenarios}
        messages={messages}
        sampleLabel={sampleLabel}
        showScriptedTag={showScriptedTag}
        allowCustomInput={allowCustomInput}
      />
    </section>
  );
}

