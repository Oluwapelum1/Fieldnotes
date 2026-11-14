// app/not-found.tsx — Custom 404 page: "This page isn't in the notebook." with a hand-drawn crossed-out line and a link home (Part 4.14)
import React from 'react';
import Link from 'next/link';
import { AnnotationMark } from '@/components/annotations/annotation-mark';

export default function NotFoundPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-lg w-full p-8 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)] shadow-[var(--shadow-card)] text-center space-y-5">
        <div className="inline-flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider text-[var(--color-red-pencil)]">
          <AnnotationMark
            kind="cross"
            seed={404}
            width={18}
            height={18}
            color="red-pencil"
          />
          <span>404 · Missing page</span>
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl text-[var(--color-ink)]">
          This page isn&apos;t in the notebook.
        </h1>

        {/* Hand-drawn crossed-out line */}
        <div className="flex justify-center py-2">
          <AnnotationMark
            kind="wobbly-line"
            seed={4041}
            width={240}
            height={14}
            color="red-pencil"
          />
        </div>

        <p className="font-sans text-sm text-[var(--color-ink-muted)] leading-relaxed">
          The page you asked for was moved, deleted, or never written down.
        </p>

        <div className="pt-2">
          <Link
            href="/en/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-[2px] bg-[var(--color-ink-blue)] text-[var(--color-card)] font-mono text-xs font-medium hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink-blue)]"
          >
            ← Return to the notebook home
          </Link>
        </div>
      </div>
    </main>
  );
}

