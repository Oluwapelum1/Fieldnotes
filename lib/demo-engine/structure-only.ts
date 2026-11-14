// lib/demo-engine/structure-only.ts — Pure structure-only pass for visitor-pasted custom text (Honesty Rule 3.1)

export interface StructureOnlyResult {
  isScriptedFallback: true;
  honestNotice: string;
  lineCount: number;
  wordCount: number;
  charCount: number;
  lines: Array<{
    id: string;
    index: number;
    text: string;
    highlighted: boolean;
  }>;
  placeholderSteps: Array<{
    id: string;
    label: string;
    detail: string;
  }>;
  placeholderChips: Array<{
    label: string;
    type: 'sourced' | 'inferred' | 'unknown';
    description: string;
  }>;
}

export const HONEST_CUSTOM_INPUT_NOTICE =
  "This demo is scripted, so it can't read your text. Here is what the live product would show: steps, sources and anything it is unsure about.";

/**
 * Pure function that performs a strictly structural pass on visitor-supplied text.
 * Counts lines and words, highlights the first and last non-empty lines, and returns
 * structural placeholder steps and chips without ever pretending to analyse content.
 */
export function runStructureOnlyPass(
  rawText: string,
  customNotice?: string
): StructureOnlyResult {
  const trimmed = rawText.trim();
  const rawLines = trimmed.length > 0 ? trimmed.split(/\r?\n/) : [];
  const nonEmptyLines = rawLines
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const words =
    trimmed.length > 0 ? trimmed.split(/\s+/).filter((w) => w.length > 0) : [];

  const lineCount = nonEmptyLines.length;
  const wordCount = words.length;
  const charCount = trimmed.length;

  const lines = nonEmptyLines.map((text, index) => ({
    id: `custom-line-${index + 1}`,
    index,
    text,
    highlighted: index === 0 || (lineCount > 1 && index === lineCount - 1),
  }));

  return {
    isScriptedFallback: true,
    honestNotice: customNotice ?? HONEST_CUSTOM_INPUT_NOTICE,
    lineCount,
    wordCount,
    charCount,
    lines,
    placeholderSteps: [
      {
        id: 'struct-s1',
        label: 'Count structure',
        detail: `${lineCount} ${lineCount === 1 ? 'line' : 'lines'}, ${wordCount} ${wordCount === 1 ? 'word' : 'words'} measured locally`,
      },
      {
        id: 'struct-s2',
        label: 'Boundary markers',
        detail:
          lineCount > 1
            ? 'Highlighted first line (line 1) and last line (line ' + lineCount + ')'
            : 'Highlighted line 1',
      },
      {
        id: 'struct-s3',
        label: 'Live product preview',
        detail: 'Placeholder cards showing how steps, source chips, and caveats appear',
      },
    ],
    placeholderChips: [
      {
        label: 'line 1',
        type: 'sourced',
        description: 'Example sourced chip pointing to your opening line',
      },
      {
        label: 'inferred',
        type: 'inferred',
        description: 'Example inferred badge when two lines are combined',
      },
      {
        label: 'check',
        type: 'unknown',
        description: 'Example red-pencil caveat when a number or date needs checking',
      },
    ],
  };
}

