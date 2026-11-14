// components/cta/cta-section.tsx — Final Call To Action card with interactive plan selector, inline validation, unticked consent checkbox, honeypot, and folding paper plane (Part 4.12)
'use client';

import React, { useState } from 'react';
import type { Messages } from '@/lib/config-loader';
import { useNotebook } from '../notebook-context';
import { AnnotationMark } from '../annotations/annotation-mark';

export interface CtaSectionProps {
  messages: Messages['cta'];
  formEndpoint: string;
  contactEmail: string;
}

type CtaFormState = 'idle' | 'validating' | 'sending' | 'success' | 'error';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PLAN_OPTIONS = [
  { id: 'free', label: 'Free ($0)' },
  { id: 'team', label: 'Team ($19/mo)' },
  { id: 'business', label: 'Business ($49/mo)' },
];

export function CtaSection({
  messages,
  formEndpoint,
  contactEmail,
}: CtaSectionProps) {
  const {
    isRtl,
    selectedPlanId,
    setSelectedPlanId,
    billingPeriod,
    setBillingPeriod,
  } = useNotebook();
  const [email, setEmail] = useState<string>('');
  const [consent, setConsent] = useState<boolean>(false); // Unticked by default (Part 4.12)
  const [honeypot, setHoneypot] = useState<string>('');
  const [formState, setFormState] = useState<CtaFormState>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const validateEmail = (val: string): boolean => {
    return EMAIL_REGEX.test(val.trim());
  };

  const handleBlur = () => {
    if (email.trim().length > 0 && !validateEmail(email)) {
      setFormState('validating');
      setErrorMsg(messages.errorInvalidEmail);
    } else if (formState === 'validating') {
      setFormState('idle');
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Honeypot check: silently succeed if filled by a bot
    if (honeypot.trim().length > 0) {
      setFormState('success');
      return;
    }

    if (!validateEmail(email)) {
      setFormState('validating');
      setErrorMsg(messages.errorInvalidEmail);
      return;
    }

    setFormState('sending');
    setErrorMsg('');

    try {
      // If using the default template placeholder endpoint, simulate completion cleanly
      if (formEndpoint.includes('example.invalid')) {
        await new Promise((r) => setTimeout(r, 320));
        setFormState('success');
        return;
      }

      const res = await fetch(formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          plan: selectedPlanId,
          billingPeriod,
          marketingConsent: consent,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      setFormState('success');
    } catch {
      setFormState('error');
      setErrorMsg(messages.errorServer);
    }
  };

  return (
    <section
      id="start-free-cta"
      aria-labelledby="final-cta-heading"
      className="py-16 sm:py-24 border-t border-[var(--color-border-warm)] max-w-[var(--container-max)] mx-auto px-[var(--side-margin)]"
    >
      <div className="p-6 sm:p-10 rounded-[2px] border-2 border-[var(--color-ink-blue)] bg-[var(--color-card)] shadow-[var(--shadow-card)] max-w-3xl mx-auto">
        <h2
          id="final-cta-heading"
          className="font-serif text-[length:var(--text-h1)] leading-[var(--leading-h1)] text-[var(--color-ink)]"
        >
          <span>{messages.headlineBefore}</span>
          <em className="italic font-normal text-[var(--color-ink-blue)]">
            {messages.headlineItalic}
          </em>
          <span>{messages.headlineAfter}</span>
        </h2>

        {/* Synced Plan & Billing Selector */}
        <div className="mt-4 pt-3 border-t border-dashed border-[var(--color-border-warm)] flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[var(--color-ink-muted)] me-1">Plan:</span>
            {PLAN_OPTIONS.map((opt) => {
              const active = selectedPlanId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedPlanId(opt.id)}
                  aria-pressed={active}
                  className={`px-2.5 py-1 rounded-[2px] border cursor-pointer transition-colors ${
                    active
                      ? 'border-[var(--color-ink-blue)] bg-[var(--color-ink-blue)] text-[var(--color-card)] font-semibold'
                      : 'border-[var(--color-border-warm)] bg-[var(--color-page)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() =>
              setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')
            }
            className="px-2.5 py-1 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-page)] text-[var(--color-ink-blue)] cursor-pointer hover:border-[var(--color-ink-blue)]"
          >
            Billing: {billingPeriod === 'monthly' ? 'Monthly' : 'Yearly (-20%)'}
          </button>
        </div>

        {formState === 'success' ? (
          <div
            role="status"
            aria-live="polite"
            className="mt-6 p-4 rounded-[2px] border border-[var(--color-green-pen)] bg-[var(--color-green-pen-soft)] flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              {/* Folding paper plane SVG */}
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-green-pen)"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="shrink-0 transition-transform duration-500 translate-x-1 -translate-y-0.5"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
              <p className="font-sans text-sm text-[var(--color-ink)] leading-relaxed">
                {messages.successMessage.replace('{email}', contactEmail)} (Plan:{' '}
                <strong className="uppercase">{selectedPlanId}</strong>)
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFormState('idle');
                setEmail('');
              }}
              className="px-2.5 py-1 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)] font-mono text-xs text-[var(--color-ink)] cursor-pointer"
            >
              Reset
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            {/* Hidden honeypot field (Part 4.12) */}
            <div className="sr-only" aria-hidden="true">
              <label htmlFor="cta-hp-field">{messages.honeypotLabel}</label>
              <input
                id="cta-hp-field"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
              <div className="flex-1">
                <label
                  htmlFor="cta-email-input"
                  className="block font-mono text-xs text-[var(--color-ink)] font-medium mb-1.5"
                >
                  {messages.emailLabel}
                </label>
                <input
                  id="cta-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleBlur}
                  placeholder={messages.emailPlaceholder}
                  aria-invalid={
                    formState === 'validating' || formState === 'error'
                  }
                  className="w-full px-3.5 py-2.5 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-page)] font-sans text-sm text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)]"
                />
              </div>

              <div className="relative flex items-center gap-2">
                <div aria-hidden="true" className="hidden md:block">
                  <AnnotationMark
                    kind="arrow"
                    seed={912}
                    width={42}
                    height={22}
                    color="ink-blue"
                    flipRtl={isRtl}
                  />
                </div>
                <button
                  type="submit"
                  disabled={formState === 'sending'}
                  className="px-6 py-2.5 rounded-[2px] bg-[var(--color-ink-blue)] text-[var(--color-card)] font-sans text-sm font-medium cursor-pointer hover:opacity-95 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink-blue)]"
                >
                  {formState === 'sending'
                    ? messages.sending
                    : messages.submitButton}
                </button>
              </div>
            </div>

            {/* Error or inline validation message */}
            {(formState === 'validating' || formState === 'error') && errorMsg && (
              <div
                role="alert"
                className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-[2px] bg-[var(--color-red-pencil-soft)] border border-[var(--color-red-pencil)] font-mono text-xs text-[var(--color-red-pencil)]"
              >
                <span>{errorMsg}</span>
                {formState === 'error' && (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="underline font-semibold cursor-pointer"
                  >
                    {messages.retryButton}
                  </button>
                )}
              </div>
            )}

            {/* Separate unticked marketing consent checkbox & No card needed note */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <label className="inline-flex items-start gap-2 font-sans text-xs text-[var(--color-ink-muted)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 accent-[var(--color-ink-blue)]"
                />
                <span>{messages.consentLabel}</span>
              </label>

              <span className="font-mono text-xs text-[var(--color-ink-muted)]">
                {messages.noCardNeeded}
              </span>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
