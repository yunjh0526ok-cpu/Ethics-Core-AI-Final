/**
 * 토론·설문·추출 텍스트 코퍼스에서 청렴 리스크 4축 점수를 키워드 빈도·가중치로 산출합니다.
 * (법적 판단 아님, 교육·워크숍용 시각화 목적)
 */

export const INTEGRITY_RISK_LABELS = ['이해충돌', '갑질·괴롭힘', '금품·향응', '의사결정 투명성'] as const;
export type IntegrityRiskLabel = (typeof INTEGRITY_RISK_LABELS)[number];

type DimSpec = { label: IntegrityRiskLabel; terms: readonly string[]; weight: number };

const DIMENSIONS: readonly DimSpec[] = [
  {
    label: '이해충돌',
    weight: 1.05,
    terms: [
      '이해충돌',
      '이해상충',
      '청탁',
      '청탁금지',
      '특혜',
      '사적이익',
      '낙찰',
      '입찰',
      '담합',
      '겸직',
      '가족채용',
      '민원',
      '허가',
      '조달',
      '리베이트',
      '스톡옵션',
      'conflict of interest',
      'nepotism',
      'bid rigging',
    ],
  },
  {
    label: '갑질·괴롭힘',
    weight: 1,
    terms: [
      '갑질',
      '괴롭힘',
      '직장내괴롭힘',
      '근로기준법',
      '욕설',
      '모욕',
      '왕따',
      '따돌림',
      '강요',
      '야근강요',
      '회식강요',
      '인격존중',
      '폭언',
      '보복',
      '가스라이팅',
      'harassment',
      'bullying',
      'abuse of power',
    ],
  },
  {
    label: '금품·향응',
    weight: 1,
    terms: [
      '금품',
      '향응',
      '뇌물',
      '접대',
      '골프',
      '술자리',
      '선물',
      '상품권',
      '봉투',
      '현금',
      '사례비',
      '감사',
      '경조사',
      'hospitality',
      'kickback',
      'gift',
    ],
  },
  {
    label: '의사결정 투명성',
    weight: 1,
    terms: [
      '불투명',
      '비공개',
      '은폐',
      '회의록',
      '기록',
      '내부정보',
      '설명의무',
      '이유',
      '공개거부',
      '절차',
      '부실',
      '책임',
      '감사',
      '통제',
      'opacity',
      'cover-up',
      'whistleblower',
      '신고',
      '익명',
    ],
  },
] as const;

const MIN_CORPUS_CHARS = 80;
/** 이 길이 미만이면 차트는 '분석 불가' */
export const MIN_CORPUS_FOR_CHART = MIN_CORPUS_CHARS;

function countOccurrences(haystack: string, needle: string): number {
  if (!needle.trim()) return 0;
  let n = 0;
  let pos = 0;
  while (pos < haystack.length) {
    const i = haystack.indexOf(needle, pos);
    if (i < 0) break;
    n += 1;
    pos = i + Math.max(1, needle.length);
  }
  return n;
}

function dimRawScore(corpus: string, corpusLower: string, spec: DimSpec): number {
  let sum = 0;
  for (const term of spec.terms) {
    const t = term.trim();
    if (!t) continue;
    const isAscii = /^[\x00-\x7F]+$/.test(t);
    const hay = isAscii ? corpusLower : corpus;
    const needle = isAscii ? t.toLowerCase() : t;
    const c = countOccurrences(hay, needle);
    if (c === 0) continue;
    // 반복 언급은 sqrt로 포화 (한 사건이 과도하게 점수를 밀어 올리지 않도록)
    sum += Math.sqrt(c) * spec.weight;
  }
  return sum;
}

/** 28~92 구간으로 스케일 */
function toDisplayScore(raw: number): number {
  if (raw <= 0) return 0;
  const v = 28 + Math.round(64 * (1 - Math.exp(-raw / 4.2)));
  return Math.min(92, Math.max(28, v));
}

export type CorpusScoreResult = {
  scores: { label: string; value: number }[];
  charCount: number;
  totalRaw: number;
  /** 차트·숫자 표시 가능 */
  sufficientForChart: boolean;
  /** 키워드 신호가 거의 없음 (값은 중립대에 가깝게) */
  lowKeywordSignal: boolean;
  perDimensionRaw: Record<string, number>;
};

export function scoreIntegrityCorpus(corpus: string): CorpusScoreResult {
  const trimmed = corpus.replace(/\u00a0/g, ' ').trim();
  const charCount = trimmed.length;
  const corpusLower = trimmed.toLowerCase();

  const perDimensionRaw: Record<string, number> = {};
  let totalRaw = 0;
  for (const spec of DIMENSIONS) {
    const r = dimRawScore(trimmed, corpusLower, spec);
    perDimensionRaw[spec.label] = r;
    totalRaw += r;
  }

  const sufficientForChart = charCount >= MIN_CORPUS_FOR_CHART;
  const lowKeywordSignal = sufficientForChart && totalRaw < 0.35;

  const scores = DIMENSIONS.map((spec) => {
    const raw = perDimensionRaw[spec.label] ?? 0;
    let value: number;
    if (!sufficientForChart) {
      value = 0;
    } else if (lowKeywordSignal) {
      // 키워드가 거의 없으면 문서 길이만 반영한 중립대 (모든 축 동일)
      const flat = Math.min(52, 40 + Math.floor(charCount / 400));
      value = flat;
    } else {
      value = toDisplayScore(raw);
    }
    return { label: spec.label, value };
  });

  return {
    scores,
    charCount,
    totalRaw,
    sufficientForChart,
    lowKeywordSignal,
    perDimensionRaw,
  };
}
