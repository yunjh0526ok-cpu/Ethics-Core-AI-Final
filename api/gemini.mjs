/**
 * Vercel Serverless: Gemini 호출 전용 (API 키는 서버 환경변수 GEMINI_API_KEY만 사용)
 */
import { GoogleGenAI, createUserContent, createPartFromText, createPartFromBase64 } from '@google/genai';

const ALLOWED_MODELS = new Set([
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-3-flash-preview',
]);

const DEFAULT_ORIGINS =
  'https://ethics-core-ai.vercel.app,https://ethics-core-ai-final.vercel.app,http://localhost:3000,http://127.0.0.1:3000';

function originAllowed(origin) {
  /** 프로덕션에서는 Origin 없는 직접 호출(봇·curl) 차단 */
  if (!origin) return process.env.VERCEL_ENV !== 'production';
  const list = (process.env.GEMINI_ALLOWED_ORIGINS || DEFAULT_ORIGINS)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (list.includes(origin)) return true;
  if (origin.startsWith('https://') && origin.endsWith('.vercel.app')) return true;
  return false;
}

function sanitizePayload(incoming) {
  if (!incoming || typeof incoming !== 'object') return null;
  let cloned;
  try {
    cloned = JSON.parse(JSON.stringify(incoming));
  } catch {
    return null;
  }
  const raw = JSON.stringify(cloned);
  if (raw.length > 900000) return null;
  return cloned;
}

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(body);
}

/** Vite dev 서버와 공유 */
export async function handleGeminiProxy(apiKey, incoming) {
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY');
  const body = sanitizePayload(incoming);
  if (!body?.model) throw new Error('Invalid payload');
  if (!ALLOWED_MODELS.has(body.model)) {
    throw new Error(`Model not allowed: ${String(body.model)}`);
  }

  const allowedKeys = new Set(['model', 'contents', 'config', 'useParts', 'parts']);
  for (const k of Object.keys(body)) {
    if (!allowedKeys.has(k)) delete body[k];
  }

  const { useParts, parts, ...rest } = body;
  let payload = { ...rest };

  if (useParts && Array.isArray(parts)) {
    if (parts.length > 24) throw new Error('Too many parts');
    const { contents: _drop, ...restNoContents } = rest;
    const mapped = parts.map((p) => {
      if (p?.inlineData?.data && p?.inlineData?.mimeType) {
        const len = String(p.inlineData.data).length;
        if (len > 12_000_000) throw new Error('Inline payload too large');
        return createPartFromBase64(p.inlineData.data, p.inlineData.mimeType);
      }
      return createPartFromText(String(p?.text ?? ''));
    });
    payload = { ...restNoContents, contents: createUserContent(mapped) };
  }

  const ai = new GoogleGenAI({ apiKey });
  const requestedModel = String(body.model);
  const fallbackModels = [
    requestedModel,
    ...(requestedModel === 'gemini-2.5-flash' ? ['gemini-2.5-flash-lite', 'gemini-3-flash-preview'] : []),
    ...(requestedModel === 'gemini-3-flash-preview' ? ['gemini-2.5-flash', 'gemini-2.5-flash-lite'] : []),
  ].filter((m, i, arr) => arr.indexOf(m) === i && ALLOWED_MODELS.has(m));

  let lastError = null;
  for (const model of fallbackModels) {
    try {
      const out = await ai.models.generateContent({ ...payload, model });
      const text = typeof out.text === 'function' ? out.text() : out.text;
      return { text: text || '' };
    } catch (e) {
      lastError = e;
      const msg = e instanceof Error ? e.message : '';
      const isTemporaryUnavailable =
        msg.includes('503') ||
        msg.includes('UNAVAILABLE') ||
        msg.includes('high demand') ||
        msg.includes('overloaded');
      if (!isTemporaryUnavailable) break;
    }
  }
  throw (lastError || new Error('Gemini unavailable'));
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const origin = req.headers.origin;
  if (!originAllowed(origin)) {
    return sendJson(res, 403, { error: 'Forbidden' });
  }
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Vary', 'Origin');

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return sendJson(res, 500, { error: 'Server misconfigured' });
  }

  let parsed = req.body;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return sendJson(res, 400, { error: 'Invalid JSON' });
    }
  }
  if (parsed == null || typeof parsed !== 'object') {
    return sendJson(res, 400, { error: 'Invalid body' });
  }
  const incoming = parsed.payload ?? parsed;

  try {
    const { text } = await handleGeminiProxy(key, incoming);
    return sendJson(res, 200, { text });
  } catch (e) {
    console.error('[api/gemini]', e);
    const message = e instanceof Error ? e.message : 'Upstream or validation error';
    const status =
      message.includes('Invalid') ||
      message.includes('Too many') ||
      message.includes('too large') ||
      message.includes('Model not allowed')
        ? 400
        : 500;
    return sendJson(res, status, { error: message });
  }
}
