// tests/demo-states.test.ts — Behaviour tests for DemoWorkspace states, custom input honesty notice, source chip popovers, and Show your work (Part 5.9)
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DemoWorkspace } from '../components/hero/demo-workspace';
import { NotebookProvider } from '../components/notebook-context';
import { getScenariosForLocale, getMessagesForLocale } from '../lib/config-loader';
import {
  runStructureOnlyPass,
  HONEST_CUSTOM_INPUT_NOTICE,
} from '../lib/demo-engine/structure-only';

describe('Demo States & Behaviour Tests (Part 5.9)', () => {
  const scenarios = getScenariosForLocale('en');
  const messages = getMessagesForLocale('en');

  it('renders scenario 1 in its finished state by default (readable with JS off / SSR) and shows the scripted demo tag', () => {
    render(
      React.createElement(
        NotebookProvider,
        { locale: 'en' },
        React.createElement(DemoWorkspace, {
          scenarios,
          messages: messages.hero,
          sampleLabel: messages.sampleBadge,
          showScriptedTag: true,
          allowCustomInput: true,
        })
      )
    );

    expect(screen.getByTestId('scripted-demo-tag').textContent).toContain(
      'Sample run, scripted for this demo'
    );
    expect(screen.getByText('Summary')).toBeTruthy();
    expect(screen.getByText('Decisions')).toBeTruthy();
    expect(screen.getByText('Open questions')).toBeTruthy();
  });

  it('opens Show your work panel and limits visible step arrows to at most 3 at once', () => {
    const { container } = render(
      React.createElement(
        NotebookProvider,
        { locale: 'en' },
        React.createElement(DemoWorkspace, {
          scenarios,
          messages: messages.hero,
          sampleLabel: messages.sampleBadge,
          showScriptedTag: true,
          allowCustomInput: true,
          initialShowWork: true,
        })
      )
    );

    const arrows = container.querySelectorAll('[data-step-arrow]');
    expect(arrows.length).toBeLessThanOrEqual(3);
  });

  it('opens a source chip quote popover on click and closes it on Escape', () => {
    render(
      React.createElement(
        NotebookProvider,
        { locale: 'en' },
        React.createElement(DemoWorkspace, {
          scenarios,
          messages: messages.hero,
          sampleLabel: messages.sampleBadge,
          showScriptedTag: true,
          allowCustomInput: true,
        })
      )
    );

    const chipButtons = screen.getAllByRole('button', { name: /m1, m5/i });
    expect(chipButtons.length).toBeGreaterThan(0);

    fireEvent.click(chipButtons[0]);
    expect(screen.getByRole('dialog')).toBeTruthy();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('runs a pure structure-only pass on custom visitor input and never claims to understand content', () => {
    const res = runStructureOnlyPass(
      'First line of custom text\nMiddle line\nLast line of custom text'
    );

    expect(res.isScriptedFallback).toBe(true);
    expect(res.honestNotice).toBe(HONEST_CUSTOM_INPUT_NOTICE);
    expect(res.lineCount).toBe(3);
    expect(res.wordCount).toBe(12);
    expect(res.lines[0].highlighted).toBe(true);
    expect(res.lines[1].highlighted).toBe(false);
    expect(res.lines[2].highlighted).toBe(true);
  });
});
