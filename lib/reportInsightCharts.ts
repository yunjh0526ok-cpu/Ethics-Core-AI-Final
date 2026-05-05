import type { CorpusScoreResult } from './insightCorpusScore';

export type ChartInsightMode = 'pending' | 'ok' | 'insufficient' | 'llm_only';

const LABELS = ['이해충돌', '갑질·괴롭힘', '금품·향응', '의사결정 투명성'] as const;

/** Gemini JSON 루트의 integrityRiskScores 맵을 4축 점수로 정규화 */
export function parseIntegrityRiskScoresFromRoot(
  obj: Record<string, unknown> | null,
): { label: string; value: number }[] | null {
  if (!obj) return null;
  const raw = obj.integrityRiskScores ?? obj.riskScores;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const m = raw as Record<string, unknown>;
  const out: { label: string; value: number }[] = [];
  for (const label of LABELS) {
    const v = m[label];
    const n = typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(String(v).replace(/,/g, '')) : NaN;
    if (!Number.isFinite(n)) return null;
    out.push({ label, value: Math.min(100, Math.max(0, Math.round(n))) });
  }
  return out.length === 4 ? out : null;
}

/**
 * 클라이언트 키워드 알고리즘 점수를 우선하고, 텍스트 코퍼스가 부족하면 모델 점수만 사용합니다.
 */
export function pickFinalWeaknessScores(
  algo: CorpusScoreResult,
  rawJson: Record<string, unknown> | null,
): { scores: { label: string; value: number }[]; mode: ChartInsightMode } {
  const llm = parseIntegrityRiskScoresFromRoot(rawJson);

  if (algo.sufficientForChart) {
    if (!llm) {
      return { scores: algo.scores, mode: 'ok' };
    }
    const merged = algo.scores.map((a, i) => {
      const b = llm[i]?.value ?? a.value;
      return { label: a.label, value: Math.round(a.value * 0.62 + b * 0.38) };
    });
    return { scores: merged, mode: 'ok' };
  }

  if (llm) {
    return { scores: llm, mode: 'llm_only' };
  }

  return {
    scores: LABELS.map((label) => ({ label, value: 0 })),
    mode: 'insufficient',
  };
}
