/**
 * 브라우저에서는 API 키 없이 /api/gemini 로만 호출 (키는 서버 전용 GEMINI_API_KEY)
 */
export type GeminiClientPayload = Record<string, unknown> & { model: string };

const REQUEST_TIMEOUT_MS = 30000;

export async function geminiGenerateContent(payload: GeminiClientPayload): Promise<{ text: string }> {
  const run = async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const r = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        signal: controller.signal,
        body: JSON.stringify({ payload }),
      });
      let data: { text?: string; error?: string } = {};
      try {
        data = (await r.json()) as { text?: string; error?: string };
      } catch {
        /* ignore */
      }
      if (!r.ok) {
        const raw = data.error || `Gemini proxy ${r.status}`;
        if (r.status === 503 || /UNAVAILABLE|high demand|overloaded/i.test(raw)) {
          throw new Error('AI 요청이 일시적으로 몰렸습니다. 잠시 후 다시 시도해 주세요.');
        }
        throw new Error(raw);
      }
      return { text: data.text ?? '' };
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    return await run();
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('aborted') || msg.includes('timeout') || msg.includes('Gemini proxy 5')) {
      return run();
    }
    throw err;
  }
}
