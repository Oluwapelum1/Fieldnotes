// components/hero/demo-workspace.tsx — Interactive Hero Demo Workspace with RAF timeline, highlighter sweeps, source chips, Show your work, and Structure-Only custom input (Part 3.1, 3.2, 3.3)
'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Scenario } from '@/lib/config-schema';
import type { DemoRunStatus } from '@/lib/demo-engine/types';
import { buildTimeline, computeSnapshotAtTime } from '@/lib/demo-engine/schedule';
import {
  runStructureOnlyPass,
  type StructureOnlyResult,
} from '@/lib/demo-engine/structure-only';
import type { Messages } from '@/lib/config-loader';
import { useNotebook } from '../notebook-context';
import { SourceChip } from '../chips/source-chip';
import { ShowYourWorkPanel } from '../show-your-work/show-your-work-panel';
import { AnnotationMark } from '../annotations/annotation-mark';
import { SampleTag } from '../annotations/sample-tag';

export interface DemoWorkspaceProps {
  scenarios: Scenario[];
  messages: Messages['hero'];
  sampleLabel: string;
  showScriptedTag: boolean;
  allowCustomInput: boolean;
  initialShowWork?: boolean;
}

export function DemoWorkspace({
  scenarios,
  messages,
  sampleLabel,
  showScriptedTag,
  allowCustomInput,
  initialShowWork = false,
}: DemoWorkspaceProps) {
  const { motion, isRtl } = useNotebook();

  // Safely fallback to scenario 0 if anything is malformed
  const validScenarios = useMemo(
    () => (Array.isArray(scenarios) && scenarios.length > 0 ? scenarios : []),
    [scenarios]
  );

  const [selectedIdx, setSelectedIdx] = useState(0);
  const activeScenario = validScenarios[selectedIdx] ?? validScenarios[0];

  // States: 'idle' | 'running' | 'paused' | 'done' | 'skipped' | 'custom' | 'error'
  // Preloaded in finished state on initial render so JS-off / SSR shows scenario 1 complete and readable
  const [status, setStatus] = useState<DemoRunStatus>(
    activeScenario ? 'idle' : 'error'
  );
  const [speed, setSpeed] = useState<1 | 2>(1);
  const [elapsedMs, setElapsedMs] = useState<number>(999999);
  const [showWork, setShowWork] = useState<boolean>(initialShowWork);
  const [pulseShowWork, setPulseShowWork] = useState<boolean>(false);
  const [mobileShowAllInput, setMobileShowAllInput] = useState<boolean>(false);

  // Step-by-step manual reveal mode when Motion is Off / reduced-motion
  const [stepByStepCount, setStepByStepCount] = useState<number | null>(null);

  // Highlight linking between Input, Output, and Show-your-work steps
  const [highlightedBlockIds, setHighlightedBlockIds] = useState<string[]>([]);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);

  // Custom input structure-only mode
  const [customModeOpen, setCustomModeOpen] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>(
    'Customer: Our March invoice includes an extra fee.\nSupport: Checking the billing log now.\nBilling: Found a duplicate line item; issuing a credit note today.'
  );
  const [customResult, setCustomResult] = useState<StructureOnlyResult | null>(null);

  // Screen reader polite announcement string (announced only at start and completion, never per-character)
  const [srAnnouncement, setSrAnnouncement] = useState<string>('');

  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const hiddenTimestampRef = useRef<number | null>(null);
  const hasAutoplayedRef = useRef<boolean>(false);

  // Persist Show your work in sessionStorage inside try/catch (Part 3.2)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('fieldnotes_show_work');
      if (saved === 'true') setShowWork(true);
      else if (saved === 'false') setShowWork(false);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const toggleShowWork = () => {
    const next = !showWork;
    setShowWork(next);
    setPulseShowWork(false);
    try {
      sessionStorage.setItem('fieldnotes_show_work', String(next));
    } catch {
      // Ignore
    }
  };

  const timeline = useMemo(() => {
    if (!activeScenario) return [];
    return buildTimeline(activeScenario, { speed });
  }, [activeScenario, speed]);

  const maxTimelineMs = useMemo(() => {
    if (timeline.length === 0) return 0;
    return timeline[timeline.length - 1].t;
  }, [timeline]);

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastFrameTimeRef.current = null;
  }, []);

  const finishRun = useCallback(
    (finalStatus: 'done' | 'skipped' = 'done') => {
      stopRaf();
      setElapsedMs(maxTimelineMs + 100);
      setStatus(finalStatus);
      if (!showWork && motion !== 'off') {
        setPulseShowWork(true);
      }
      if (activeScenario) {
        const sourceSet = new Set(
          activeScenario.outputCards.flatMap((c) =>
            c.segments.flatMap((s) => s.sources)
          )
        );
        setSrAnnouncement(
          messages.status.srDone
            .replace('{cards}', String(activeScenario.outputCards.length))
            .replace('{sources}', String(sourceSet.size))
            .replace('{caveats}', String(activeScenario.caveats.length))
        );
      }
    },
    [stopRaf, maxTimelineMs, showWork, motion, activeScenario, messages.status.srDone]
  );

  const startRun = useCallback(
    (scenarioIndex = selectedIdx) => {
      setCustomModeOpen(false);
      setCustomResult(null);
      setStepByStepCount(null);
      setSelectedIdx(scenarioIndex);

      if (motion === 'off') {
        // Under reduced motion or Off, skip to Done at once
        stopRaf();
        setElapsedMs(999999);
        setStatus('done');
        return;
      }

      stopRaf();
      setElapsedMs(0);
      setStatus('running');
      setSrAnnouncement(messages.status.srRunning);
    },
    [selectedIdx, motion, stopRaf, messages.status.srRunning]
  );

  // RAF loop when status === 'running'
  useEffect(() => {
    if (status !== 'running') {
      stopRaf();
      return;
    }

    const tickFrame = (now: number) => {
      if (lastFrameTimeRef.current === null) {
        lastFrameTimeRef.current = now;
      }
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      setElapsedMs((prev) => {
        const next = prev + delta;
        if (next >= maxTimelineMs) {
          // Schedule completion on next microtask
          queueMicrotask(() => finishRun('done'));
          return maxTimelineMs + 10;
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(tickFrame);
    };

    rafRef.current = requestAnimationFrame(tickFrame);
    return () => stopRaf();
  }, [status, maxTimelineMs, finishRun, stopRaf]);

  // Visibility change handler: pause clock when tab is hidden; if hidden > 5000 ms, jump to Done (Part 3.1)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        if (status === 'running') {
          hiddenTimestampRef.current = Date.now();
          stopRaf();
        }
      } else {
        if (status === 'running' && hiddenTimestampRef.current !== null) {
          const hiddenDuration = Date.now() - hiddenTimestampRef.current;
          hiddenTimestampRef.current = null;
          if (hiddenDuration > 5000) {
            finishRun('done');
          } else {
            lastFrameTimeRef.current = null;
            // Re-trigger effect by toggling a frame
            setElapsedMs((e) => e + 1);
          }
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [status, stopRaf, finishRun]);

  // Autoplay once when hero workspace is 60% visible and Motion intensity is Full (Part 3.1)
  useEffect(() => {
    if (hasAutoplayedRef.current || motion !== 'full') return;
    const el = workspaceRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (
            entry.isIntersecting &&
            entry.intersectionRatio >= 0.6 &&
            !hasAutoplayedRef.current &&
            motion === 'full'
          ) {
            hasAutoplayedRef.current = true;
            startRun(0);
          }
        }
      },
      { threshold: [0.6] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [motion, startRun]);

  // Compute current snapshot from pure timeline
  const snapshot = useMemo(() => {
    if (!activeScenario) return null;
    const isFinishedView =
      status === 'idle' || status === 'done' || status === 'skipped';
    const targetTime = isFinishedView ? maxTimelineMs + 100 : elapsedMs;
    return computeSnapshotAtTime(activeScenario, timeline, targetTime);
  }, [activeScenario, status, maxTimelineMs, elapsedMs, timeline]);

  // Active step bidirectional highlights
  const stepHighlightedBlocks = useMemo(() => {
    if (!activeScenario || !activeStepId) return [];
    const step = activeScenario.steps.find((s) => s.id === activeStepId);
    return step ? step.reads : [];
  }, [activeScenario, activeStepId]);

  const combinedHighlightedBlocks = useMemo(
    () => Array.from(new Set([...highlightedBlockIds, ...stepHighlightedBlocks])),
    [highlightedBlockIds, stepHighlightedBlocks]
  );

  // Space key toggles Pause/Resume when focus is inside the demo workspace (Part 3.1)
  const handleWorkspaceKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'BUTTON') return;
    if (e.key === ' ') {
      if (status === 'running') {
        e.preventDefault();
        setStatus('paused');
      } else if (status === 'paused') {
        e.preventDefault();
        setStatus('running');
      }
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    stopRaf();
    const res = runStructureOnlyPass(customText);
    setCustomResult(res);
    setStatus('custom');
  };

  if (!activeScenario || !snapshot) {
    return (
      <div
        role="alert"
        className="p-6 rounded-[2px] border border-[var(--color-red-pencil)] bg-[var(--color-card)] text-[var(--color-ink)]"
      >
        Scenario configuration could not be loaded.
      </div>
    );
  }

  const attendedTotal = activeScenario.inputBlocks.filter((b) => b.attended).length;

  // Status bar text
  let statusText = messages.status.idle;
  if (status === 'custom') {
    statusText = messages.status.custom;
  } else if (status === 'paused') {
    statusText = messages.status.paused;
  } else if (status === 'done' || status === 'skipped') {
    statusText = messages.status.done.replace(
      '{seconds}',
      String(activeScenario.sampleRunSeconds)
    );
  } else if (status === 'running') {
    const scaledElapsed = elapsedMs * speed;
    if (scaledElapsed < 1100) {
      statusText = messages.status.reading
        .replace('{total}', String(activeScenario.inputBlocks.length))
        .replace('{current}', String(Math.max(1, snapshot.readCount)))
        .replace('{attended}', String(attendedTotal));
    } else if (scaledElapsed < 1500) {
      statusText = messages.status.planning;
    } else {
      statusText = messages.status.writing;
    }
  }

  const visibleStepIdsForPanel =
    stepByStepCount !== null
      ? activeScenario.steps.slice(0, stepByStepCount).map((s) => s.id)
      : snapshot.visibleStepIds;

  return (
    <div
      ref={workspaceRef}
      tabIndex={-1}
      onKeyDown={handleWorkspaceKeyDown}
      data-testid="demo-workspace"
      className="relative w-full max-w-[1120px] mx-auto rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)] shadow-[var(--shadow-card)] text-[var(--color-ink)] fn-paper-grain"
    >
      {/* Decorative corner tape strips */}
      <div
        aria-hidden="true"
        className="hidden sm:block absolute -top-2.5 left-6 w-16 h-5 bg-[var(--color-tape)] -rotate-3 pointer-events-none border border-[var(--color-border-warm)]/40"
      />
      <div
        aria-hidden="true"
        className="hidden sm:block absolute -top-2.5 right-8 w-16 h-5 bg-[var(--color-tape)] rotate-2 pointer-events-none border border-[var(--color-border-warm)]/40"
      />

      {/* Screen-reader-only polite summary announcer (never announces per character) */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {srAnnouncement}
      </div>

      {/* Top status bar & playback controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-[var(--color-border-warm)] bg-[var(--color-page)]/60">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`w-2 h-2 rounded-full ${status === 'running'
                  ? 'bg-[var(--color-ink-blue)] animate-pulse'
                  : status === 'paused'
                    ? 'bg-[var(--color-red-pencil)]'
                    : 'bg-[var(--color-green-pen)]'
                }`}
            />
            <span
              data-testid="demo-status-line"
              className="font-mono text-xs text-[var(--color-ink)] font-medium"
            >
              {statusText}
            </span>
            <SampleTag show={activeScenario.sample} label={sampleLabel} />
          </div>

          {/* Mandatory Honesty Rule 1.6 & 3.1 visible scripted tag */}
          {showScriptedTag && (
            <div
              data-testid="scripted-demo-tag"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[var(--color-ink-muted)]"
            >
              <span className="px-1.5 py-0.5 rounded-[2px] bg-[var(--color-ink-blue-soft)] text-[var(--color-ink-blue)] font-medium">
                {messages.scriptedTag}
              </span>
            </div>
          )}
        </div>

        {/* Accessible playback & Show your work controls */}
        <div
          role="toolbar"
          aria-label="Demo playback controls"
          className="flex flex-wrap items-center gap-2"
        >
          <button
            type="button"
            onClick={() => startRun(selectedIdx)}
            className="px-2.5 py-1 rounded-[2px] border border-[var(--color-ink-blue)] bg-[var(--color-ink-blue)] text-[var(--color-card)] font-mono text-xs font-medium hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink-blue)]"
          >
            {messages.controls.replay}
          </button>

          {status === 'running' ? (
            <button
              type="button"
              onClick={() => setStatus('paused')}
              className="px-2.5 py-1 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)] text-[var(--color-ink)] font-mono text-xs hover:border-[var(--color-ink-blue)] focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)]"
            >
              {messages.controls.pause}
            </button>
          ) : status === 'paused' ? (
            <button
              type="button"
              onClick={() => setStatus('running')}
              className="px-2.5 py-1 rounded-[2px] border border-[var(--color-ink-blue)] bg-[var(--color-card)] text-[var(--color-ink-blue)] font-mono text-xs font-medium focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)]"
            >
              {messages.controls.resume}
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setSpeed((s) => (s === 1 ? 2 : 1))}
            aria-label={`Playback speed ${speed}x`}
            className="px-2 py-1 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)] font-mono text-xs tabular-nums text-[var(--color-ink)] hover:border-[var(--color-ink-blue)] focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)]"
          >
            {speed === 1 ? messages.controls.speed1x : messages.controls.speed2x}
          </button>

          {(status === 'running' || status === 'paused') && (
            <button
              type="button"
              onClick={() => finishRun('skipped')}
              className="px-2.5 py-1 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)] font-mono text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)]"
            >
              {messages.controls.skipToEnd}
            </button>
          )}

          {/* Reduced-motion / Off step-by-step button */}
          {motion === 'off' && (
            <button
              type="button"
              onClick={() => {
                setShowWork(true);
                setStepByStepCount((prev) => {
                  if (prev === null) return 1;
                  return prev < activeScenario.steps.length ? prev + 1 : 1;
                });
              }}
              className="px-2.5 py-1 rounded-[2px] border border-[var(--color-ink-blue)] bg-[var(--color-card)] font-mono text-xs text-[var(--color-ink-blue)] focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)]"
            >
              {stepByStepCount === null
                ? messages.controls.showStepByStep
                : `${messages.controls.nextStep} (${stepByStepCount}/${activeScenario.steps.length})`}
            </button>
          )}

          {/* Show your work toggle with hand-drawn circle annotation on completion */}
          <div className="relative inline-flex items-center">
            <button
              id="hero-show-your-work-toggle"
              type="button"
              aria-expanded={showWork}
              onClick={toggleShowWork}
              className={`px-3 py-1 rounded-[2px] border font-mono text-xs font-medium transition-transform duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink-blue)] ${showWork
                  ? 'border-[var(--color-ink-blue)] bg-[var(--color-ink-blue-soft)] text-[var(--color-ink-blue)]'
                  : 'border-[var(--color-border-warm)] bg-[var(--color-card)] text-[var(--color-ink)]'
                } ${pulseShowWork ? 'scale-[1.06]' : 'scale-100'}`}
            >
              {showWork
                ? messages.controls.hideYourWork
                : messages.controls.showYourWork}
            </button>
            {(status === 'done' || status === 'idle') && !showWork && (
              <div
                aria-hidden="true"
                className="hidden xl:flex items-center gap-1 absolute -bottom-7 right-0 pointer-events-none"
              >
                <span className="font-mono text-[11px] text-[var(--color-ink-blue)] whitespace-nowrap">
                  {messages.marginOpenSteps}
                </span>
                <AnnotationMark
                  kind="circle"
                  seed={88}
                  width={38}
                  height={20}
                  color="ink-blue"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main 3-column workbench: Scenario Rail | Input Pane | Output Pane (+ optional Show your work margin drawer) */}
      <div className="flex flex-col lg:flex-row">
        {/* Left rail: 3 scenario task chips + Try your own link */}
        <div className="w-full lg:w-[220px] shrink-0 p-4 border-b lg:border-b-0 lg:border-e border-[var(--color-border-warm)] bg-[var(--color-page)]/40">
          <div className="relative mb-2 flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--color-ink-muted)]">
              {messages.panes.tasksHeading}
            </span>
            {/* Hand-drawn margin note 'start here' with curved arrow to first chip (Annotation #1 in Hero) */}
            <span
              aria-hidden="true"
              className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--color-ink-blue)]"
            >
              <span>{messages.marginStartHere}</span>
              <AnnotationMark
                kind="arrow"
                seed={19}
                width={26}
                height={16}
                color="ink-blue"
                flipRtl={isRtl}
              />
            </span>
          </div>

          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-1 lg:pb-0">
            {validScenarios.map((scen, idx) => {
              const isSelected = !customModeOpen && idx === selectedIdx;
              return (
                <button
                  key={scen.id}
                  id={idx === 0 ? 'hero-first-scenario-chip' : undefined}
                  type="button"
                  onClick={() => startRun(idx)}
                  aria-pressed={isSelected}
                  className={`text-start px-3 py-2 rounded-[2px] border font-sans text-xs sm:text-sm leading-snug transition-colors shrink-0 lg:shrink focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)] ${isSelected
                      ? 'border-2 border-[var(--color-ink-blue)] bg-[var(--color-card-elevated)] font-medium text-[var(--color-ink)]'
                      : 'border-[var(--color-border-warm)] bg-[var(--color-card)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
                    }`}
                >
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-[var(--color-ink-blue)] mb-0.5">
                    0{idx + 1}
                  </span>
                  {scen.chipLabel}
                </button>
              );
            })}
          </div>

          {allowCustomInput && (
            <div className="mt-3 pt-3 border-t border-dashed border-[var(--color-border-warm)]">
              <button
                type="button"
                onClick={() => {
                  if (customModeOpen) {
                    setCustomModeOpen(false);
                    setCustomResult(null);
                    setStatus('done');
                  } else {
                    stopRaf();
                    setCustomModeOpen(true);
                    const initialPass = runStructureOnlyPass(customText);
                    setCustomResult(initialPass);
                    setStatus('custom');
                  }
                }}
                className="font-mono text-xs text-[var(--color-ink-blue)] underline hover:opacity-80 focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)]"
              >
                {customModeOpen ? messages.backToScenarios : messages.tryYourOwn}
              </button>
            </div>
          )}
        </div>

        {/* Centre-left & Centre-right panes: either Custom Input structure mode OR Scenario Input + Output */}
        {customModeOpen && customResult ? (
          <div className="flex-1 p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="demo-custom-textarea"
                className="block font-mono text-xs uppercase tracking-wider text-[var(--color-ink-muted)] mb-2"
              >
                {messages.tryYourOwn}
              </label>
              <form onSubmit={handleCustomSubmit} className="space-y-3">
                <textarea
                  id="demo-custom-textarea"
                  rows={5}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder={messages.customInputPlaceholder}
                  className="w-full p-3 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-page)] font-mono text-xs text-[var(--color-ink)] focus:outline-2 focus:outline-[var(--color-ink-blue)]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-[2px] bg-[var(--color-ink-blue)] text-[var(--color-card)] font-mono text-xs font-medium"
                >
                  {messages.customInputRunBtn}
                </button>
              </form>

              <div className="mt-4 space-y-1.5">
                {customResult.lines.map((ln) => (
                  <div
                    key={ln.id}
                    className={`p-2 rounded-[2px] border border-[var(--color-border-warm)] font-mono text-xs ${ln.highlighted ? 'fn-highlighter is-active' : 'bg-[var(--color-page)]'
                      }`}
                  >
                    <span className="text-[var(--color-ink-muted)] me-2">
                      #{ln.index + 1}
                    </span>
                    <span>{ln.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {/* Plain honest statement required by Part 3.1 */}
              <div
                data-testid="custom-input-honest-notice"
                className="p-3.5 rounded-[2px] border-s-4 border-[var(--color-red-pencil)] bg-[var(--color-red-pencil-soft)] text-sm text-[var(--color-ink)] leading-relaxed"
              >
                <p className="font-medium">{customResult.honestNotice}</p>
                <p className="mt-1 font-mono text-xs text-[var(--color-ink-muted)]">
                  Measured locally: {customResult.lineCount} lines ·{' '}
                  {customResult.wordCount} words · {customResult.charCount} characters
                </p>
              </div>

              <div className="p-3.5 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-page)]">
                <h4 className="font-mono text-xs uppercase tracking-wider text-[var(--color-ink-muted)] mb-2">
                  Structure steps preview
                </h4>
                <ol className="space-y-2 font-mono text-xs">
                  {customResult.placeholderSteps.map((st, idx) => (
                    <li key={st.id} className="flex gap-2">
                      <span className="text-[var(--color-ink-blue)] font-bold">
                        {idx + 1}.
                      </span>
                      <div>
                        <span className="font-semibold text-[var(--color-ink)]">
                          {st.label}:
                        </span>{' '}
                        <span className="text-[var(--color-ink-muted)]">{st.detail}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="p-3.5 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-page)]">
                <h4 className="font-mono text-xs uppercase tracking-wider text-[var(--color-ink-muted)] mb-2">
                  Example chips shown in live product
                </h4>
                <div className="space-y-2 text-xs">
                  {customResult.placeholderChips.map((ch) => (
                    <div key={ch.label} className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded-[2px] border border-[var(--color-border-warm)] font-mono text-[11px] uppercase">
                        [{ch.label}]
                      </span>
                      <span className="text-[var(--color-ink-muted)]">
                        {ch.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-w-0">
            {/* Input pane (5 columns on md+) */}
            <div className="md:col-span-5 p-4 border-b md:border-b-0 md:border-e border-[var(--color-border-warm)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--color-ink-muted)]">
                    {messages.panes.inputHeading} — {activeScenario.title}
                  </h3>
                </div>

                <ul className="space-y-2.5">
                  {activeScenario.inputBlocks.map((block, idx) => {
                    const isVisible = snapshot.visibleInputIds.includes(block.id);
                    const isAttended = snapshot.attendedInputIds.includes(block.id);
                    const isLinked = combinedHighlightedBlocks.includes(block.id);
                    const hiddenOnMobile = !mobileShowAllInput && idx >= 3;

                    return (
                      <li
                        key={block.id}
                        id={`demo-input-block-${block.id}`}
                        className={`${hiddenOnMobile ? 'hidden sm:block' : 'block'
                          } p-2.5 rounded-[2px] border transition-opacity duration-200 ${isLinked
                            ? 'border-[var(--color-ink-blue)] bg-[var(--color-ink-blue-soft)]'
                            : 'border-[var(--color-border-warm)] bg-[var(--color-page)]/70'
                          } ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-mono text-[11px] font-semibold text-[var(--color-ink-muted)]">
                            {block.author}
                          </span>
                          <span className="font-mono text-[10px] text-[var(--color-ink-muted)]">
                            [{block.id}]
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm leading-relaxed text-[var(--color-ink)]">
                          <span
                            className={`fn-highlighter ${isAttended || isLinked ? 'is-active' : ''
                              }`}
                          >
                            {block.text}
                          </span>
                        </p>
                      </li>
                    );
                  })}
                </ul>

                {/* Mobile collapse/expand button when > 3 input blocks (Part 3.1) */}
                {activeScenario.inputBlocks.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setMobileShowAllInput((v) => !v)}
                    className="sm:hidden mt-2 font-mono text-xs text-[var(--color-ink-blue)] underline"
                  >
                    {mobileShowAllInput
                      ? messages.panes.collapseInput
                      : messages.panes.showAllInput.replace(
                        '{count}',
                        String(activeScenario.inputBlocks.length)
                      )}
                  </button>
                )}
              </div>

              {/* Small planning margin notes */}
              <div className="mt-4 pt-2.5 border-t border-dashed border-[var(--color-border-warm)] flex flex-wrap gap-2">
                {activeScenario.steps.map((st, idx) => {
                  const appeared = snapshot.visibleStepIds.includes(st.id);
                  return (
                    <span
                      key={st.id}
                      className={`font-mono text-[11px] text-[var(--color-ink-blue)] transition-opacity ${appeared ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                      #{idx + 1} {st.label.toLowerCase()}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Output pane (7 columns on md+), aria-busy while running */}
            <div
              aria-busy={status === 'running'}
              className="md:col-span-7 p-4 flex flex-col justify-between min-h-[360px]"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--color-ink-muted)]">
                    {messages.panes.outputHeading}
                  </h3>
                  <SampleTag show={activeScenario.sample} label={sampleLabel} />
                </div>

                {/* Output cards: reserve layout height, reflow into 2-column grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeScenario.outputCards.map((card, cardIdx) => {
                    const isCardVisible = snapshot.visibleCardIds.includes(card.id);
                    const isProducedByActiveStep =
                      activeStepId !== null &&
                      activeScenario.steps
                        .find((s) => s.id === activeStepId)
                        ?.produces.includes(card.id);

                    return (
                      <div
                        key={card.id}
                        className={`${cardIdx === 0 ? 'sm:col-span-2' : 'sm:col-span-1'
                          } p-3.5 rounded-[2px] border transition-all duration-300 min-h-[108px] ${isProducedByActiveStep
                            ? 'border-[var(--color-ink-blue)] bg-[var(--color-card-elevated)]'
                            : 'border-[var(--color-border-warm)] bg-[var(--color-page)]/50'
                          } ${isCardVisible ? 'opacity-100' : 'opacity-0'}`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <h4 className="font-serif font-semibold text-sm text-[var(--color-ink)]">
                            {card.title}
                          </h4>
                          <span className="font-mono text-[10px] text-[var(--color-ink-muted)] uppercase">
                            card 0{cardIdx + 1}
                          </span>
                        </div>

                        <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
                          {card.segments.map((seg, segIdx) => {
                            const segKey = `${card.id}:${segIdx}`;
                            const streamedText = snapshot.cardSegmentsText[segKey] ?? '';
                            const showChip = snapshot.visibleChipKeys.includes(segKey);
                            const claimType =
                              seg.claimType ??
                              (seg.sources.length > 0 ? 'sourced' : 'unknown');
                            const stepNumber =
                              activeScenario.steps.findIndex(
                                (s) => s.id === seg.stepId
                              ) + 1;

                            return (
                              <div
                                key={segKey}
                                onMouseEnter={() => {
                                  setActiveStepId(seg.stepId);
                                  setHighlightedBlockIds(seg.sources);
                                }}
                                onMouseLeave={() => {
                                  setActiveStepId(null);
                                  setHighlightedBlockIds([]);
                                }}
                                className="inline-block w-full"
                              >
                                <span
                                  className={
                                    isProducedByActiveStep
                                      ? 'fn-highlighter is-active'
                                      : ''
                                  }
                                >
                                  {streamedText}
                                </span>
                                {showChip && (
                                  <>
                                    {stepNumber > 0 && (
                                      <span
                                        title={`Step ${stepNumber}`}
                                        className="inline-flex items-center justify-center ms-1 px-1 font-mono text-[10px] rounded-[2px] bg-[var(--color-ink-blue-soft)] text-[var(--color-ink-blue)]"
                                      >
                                        #{stepNumber}
                                      </span>
                                    )}
                                    <SourceChip
                                      claimType={claimType}
                                      sources={seg.sources}
                                      inputBlocks={activeScenario.inputBlocks}
                                      inferredLabel={messages.panes.inferredLabel}
                                      unknownLabel={messages.panes.unknownLabel}
                                      popoverTitle={messages.panes.sourcePopoverTitle}
                                      closeLabel={messages.panes.closePopover}
                                      onHighlightBlocks={setHighlightedBlockIds}
                                      seed={cardIdx * 31 + segIdx * 7 + 5}
                                    />
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Red-pencil caveat bracket & conflict note (Part 3.1) */}
              {activeScenario.caveats.length > 0 && (
                <div className="mt-4 space-y-2">
                  {activeScenario.caveats.map((cav, idx) => {
                    const isCavVisible = snapshot.visibleCaveatIds.includes(cav.id);
                    return (
                      <div
                        key={cav.id}
                        onMouseEnter={() => setHighlightedBlockIds(cav.relatedBlocks)}
                        onMouseLeave={() => setHighlightedBlockIds([])}
                        className={`relative flex items-start gap-2.5 p-3 rounded-[2px] bg-[var(--color-red-pencil-soft)] border border-[var(--color-red-pencil)]/40 transition-opacity duration-300 ${isCavVisible ? 'opacity-100' : 'opacity-0'
                          }`}
                      >
                        <AnnotationMark
                          kind="bracket-left"
                          seed={700 + idx}
                          width={14}
                          height={38}
                          color="red-pencil"
                          flipRtl={isRtl}
                        />
                        <div className="text-xs leading-relaxed">
                          <p className="font-mono font-semibold text-[var(--color-red-pencil)]">
                            {cav.text}
                          </p>
                          {cav.conflictNote && (
                            <p className="mt-1 font-mono text-[11px] text-[var(--color-ink-muted)]">
                              {cav.conflictNote}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right-hand margin drawer (or mobile accordion) for Show your work (Part 3.2) */}
        {showWork && !customModeOpen && (
          <ShowYourWorkPanel
            scenario={activeScenario}
            visibleStepIds={visibleStepIdsForPanel}
            activeStepId={activeStepId}
            onHoverStep={(sId) => setActiveStepId(sId)}
            stepsHeading={messages.panes.stepsHeading}
            leftOutHeading={messages.panes.leftOutHeading}
            stepProducedPrefix={messages.panes.stepProducedPrefix}
            sampleLabel={sampleLabel}
            isRtl={isRtl}
          />
        )}
      </div>
    </div>
  );
}

