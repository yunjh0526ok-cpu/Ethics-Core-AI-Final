export type LawSearchItem = { name: string; id?: string; enf?: string; prom?: string };

export type LawSearchApiResult = {
  context: string;
  laws: LawSearchItem[];
  query?: string;
  error?: string;
};

function normalizeLawList(raw: unknown): LawSearchItem[] {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  const out: LawSearchItem[] = [];
  for (const item of arr) {
    if (!item || typeof item !== 'object') continue;
    const obj = item as Record<string, unknown>;
    const name = obj.법령명한글 || obj.법령명 || obj.lawNm || obj.lawName || obj.lsNm;
    if (!name) continue;
    out.push({
      name: String(name).trim(),
      id: String(obj.법령ID || obj.lawId || obj.lsId || ''),
      enf: String(obj.시행일자 || obj.enfcDt || ''),
      prom: String(obj.공포일자 || obj.promDt || ''),
    });
  }
  return out;
}

function parseLawSearchResponse(data: unknown): LawSearchItem[] {
  if (!data || typeof data !== 'object') return [];
  const root = (data as Record<string, unknown>).LawSearch || (data as Record<string, unknown>).lawSearch || data;
  let laws = normalizeLawList((root as Record<string, unknown>)?.law);
  if (!laws.length) laws = normalizeLawList((root as Record<string, unknown>)?.법령);
  if (!laws.length && root && typeof root === 'object') {
    for (const v of Object.values(root as Record<string, unknown>)) {
      laws = normalizeLawList(v);
      if (laws.length) break;
    }
  }
  const seen = new Set<string>();
  return laws.filter((l) => {
    const k = `${l.name}|${l.id || ''}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 20);
}

function formatLawContext(laws: LawSearchItem[]): string {
  return laws
    .map((l) => {
      const parts = [l.name];
      if (l.id) parts.push(`법령ID ${l.id}`);
      if (l.enf) parts.push(`시행일자 ${l.enf}`);
      if (l.prom) parts.push(`공포일자 ${l.prom}`);
      return `- ${parts.join(' · ')}`;
    })
    .join('\n');
}

async function fetchLawSearchDirect(q: string): Promise<LawSearchApiResult> {
  // 브라우저 직통 폴백: Vercel 서버 egress 이슈 시 즉시 사용
  const oc = (import.meta.env.VITE_LAW_GO_KR_OC || 'ethics').trim();
  if (!oc) return { context: '', laws: [], error: 'missing_public_oc' };
  const params = new URLSearchParams({
    OC: oc,
    target: 'law',
    type: 'JSON',
    query: q,
    display: '20',
  });
  const url = `https://www.law.go.kr/DRF/lawSearch.do?${params.toString()}`;
  try {
    const r = await fetch(url, { headers: { Accept: 'application/json, text/plain, */*' } });
    if (!r.ok) return { context: '', laws: [], error: `direct_http_${r.status}` };
    const data = (await r.json()) as unknown;
    const laws = parseLawSearchResponse(data);
    return { context: formatLawContext(laws), laws, query: q };
  } catch {
    return { context: '', laws: [], error: 'direct_fetch_failed' };
  }
}

/** 서버 프록시 `/api/law-search` → 국가법령정보센터 lawSearch */
export async function fetchLawSearchForQuery(userText: string): Promise<LawSearchApiResult> {
  const q = userText.trim().slice(0, 300);
  if (!q) return { context: '', laws: [] };
  try {
    const r = await fetch('/api/law-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ query: q }),
    });
    const data = (await r.json().catch(() => ({}))) as LawSearchApiResult;
    if (!r.ok) {
      // 서버 경로 실패 시 브라우저 직통으로 자동 폴백
      return fetchLawSearchDirect(q);
    }
    const out = {
      context: String(data.context ?? '').trim(),
      laws: Array.isArray(data.laws) ? data.laws : [],
      query: data.query,
      error: data.error,
    };
    if (!out.context && !out.laws.length) return fetchLawSearchDirect(q);
    return out;
  } catch {
    return fetchLawSearchDirect(q);
  }
}

/** Gemini `contents` 앞에 붙일 법령 검색 컨텍스트 블록 */
export function buildUserMessageWithLawContext(userText: string, lawBlock: string): string {
  const trimmed = userText.trim();
  if (!lawBlock.trim()) return trimmed;
  return (
    `【국가법령정보센터 공동활용 API 검색 요약】\n` +
    `다음 목록은 law.go.kr lawSearch 결과입니다. 답변에서 법령명·시행일·법령ID는 이 목록과 모순되지 않게 하고, 목록에 없는 조문·법령명을 만들어내지 마세요. ` +
    `세부 조문 내용은 사용자에게 law.go.kr에서 확인하도록 안내할 수 있습니다.\n\n` +
    `${lawBlock}\n\n` +
    `---\n\n` +
    `【사용자 질의】\n` +
    `${trimmed}`
  );
}
