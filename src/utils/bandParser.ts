import type { BandScores } from '../types/ielts';

function extractScore(text: string, patterns: RegExp[]): number | null {
  for (const regex of patterns) {
    const match = text.match(regex);
    if (match && match[1]) {
      const val = parseFloat(match[1]);
      if (!Number.isNaN(val) && val >= 0 && val <= 9) {
        return val;
      }
    }
  }
  return null;
}

export function parseBandScoresFromMarkdown(markdown: string): BandScores {
  if (!markdown) {
    return { tr: null, cc: null, lr: null, gra: null, overall: null };
  }

  // Focus on Part 5 section if present to avoid false matches earlier in text
  const part5Index = markdown.search(/PART\s*5\s*[:\-]/i);
  const target = part5Index >= 0 ? markdown.slice(part5Index) : markdown;

  const tr = extractScore(target, [
    /\*{0,2}(?:TR|TA|Task Response|Task Achievement)\*{0,2}\s*[:\-]\s*\*{0,2}(\d(?:\.\d)?)/i,
  ]);
  const cc = extractScore(target, [
    /\*{0,2}(?:CC|Coherence and Cohesion|Coherence & Cohesion)\*{0,2}\s*[:\-]\s*\*{0,2}(\d(?:\.\d)?)/i,
  ]);
  const lr = extractScore(target, [
    /\*{0,2}(?:LR|Lexical Resource)\*{0,2}\s*[:\-]\s*\*{0,2}(\d(?:\.\d)?)/i,
  ]);
  const gra = extractScore(target, [
    /\*{0,2}(?:GRA|Grammatical Range(?: and| &) Accuracy)\*{0,2}\s*[:\-]\s*\*{0,2}(\d(?:\.\d)?)/i,
  ]);
  const overall = extractScore(target, [
    /\*{0,2}Overall(?:\s+Band(?:\s+Score)?)?\*{0,2}\s*[:\-]\s*\*{0,2}(\d(?:\.\d)?)/i,
  ]);

  return { tr, cc, lr, gra, overall };
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
