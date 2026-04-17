/**
 * 브라우저에서는 API 키 없이 /api/gemini 로만 호출 (키는 서버 전용 GEMINI_API_KEY)
 */
export type GeminiClientPayload = Record<string, unknown> & { model: string };

export async function geminiGenerateContent(payload: GeminiClientPayload): Promise<{ text: string }> {
  const r = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ payload }),
  });
  let data: { text?: string; error?: string } = {};
  try {
    data = (await r.json()) as { text?: string; error?: string };
  } catch {
    /* ignore */
  }
  if (!r.ok) {
    throw new Error(data.error || `Gemini proxy ${r.status}`);
  }
  return { text: data.text ?? '' };
}
