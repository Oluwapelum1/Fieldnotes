// components/annotations/sample-tag.tsx — Visible mono "sample" badge rendered on all demo people, quotes, numbers, and logos (Part 1.6 & 2.6)
import React from 'react';

export function SampleTag({
  show = true,
  label = 'sample',
  className = '',
}: {
  show?: boolean;
  label?: string;
  className?: string;
}) {
  if (!show) return null;
  return (
    <span
      data-sample-flag="true"
      className={`inline-flex items-center px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wider rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-page)] text-[var(--color-ink-muted)] leading-none select-none ${className}`}
      title="Sample data included with the Fieldnotes template; replace in config before launch."
    >
      [{label}]
    </span>
  );
}

