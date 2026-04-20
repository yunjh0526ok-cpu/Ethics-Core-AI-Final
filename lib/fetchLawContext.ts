export type LawSearchItem = { name: string; id?: string; enf?: string; prom?: string };

export type LawSearchApiResult = {
  context: string;
  laws: LawSearchItem[];
  query?: string;
  error?: string;
};

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
      return { context: '', laws: [], error: (data as { error?: string }).error || `http_${r.status}` };
    }
    return {
      context: String(data.context ?? '').trim(),
      laws: Array.isArray(data.laws) ? data.laws : [],
      query: data.query,
      error: data.error,
    };
  } catch {
    return { context: '', laws: [], error: 'network' };
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
