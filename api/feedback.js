/**
 * POST /api/feedback — MongoDB `feedback` 컬렉션에 저장
 * 요청: { text, type: 'positive'|'negative', url, timestamp, userAgent }
 * 응답: { success: true, message: "피드백이 저장되었습니다" }
 *
 * demo 플래그 없음. MONGODB_URI 필수(503).
 */

const DEFAULT_ORIGINS =
  'https://ethics-core-ai.vercel.app,https://ethics-core-ai-final.vercel.app,http://localhost:3000,http://127.0.0.1:3000';

function originAllowed(origin) {
  if (!origin) return process.env.VERCEL_ENV !== 'production';
  const list = (process.env.FEEDBACK_ALLOWED_ORIGINS || process.env.GEMINI_ALLOWED_ORIGINS || DEFAULT_ORIGINS)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (list.includes(origin)) return true;
  if (origin.startsWith('https://') && origin.endsWith('.vercel.app')) return true;
  return false;
}

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(body);
}

function readBodyStream(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function parseJsonBody(req) {
  if (req.body != null && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  const raw = await readBodyStream(req);
  if (!raw || !raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const MAX_TEXT = 500;

/**
 * @param {unknown} body
 * @returns {{ ok: true, doc: Record<string, unknown> } | { ok: false, error: string }}
 */
export function normalizeFeedbackPayload(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'invalid_body' };
  }
  const o = /** @type {Record<string, unknown>} */ (body);
  const type = o.type === 'positive' || o.type === 'negative' ? o.type : null;
  if (!type) {
    return { ok: false, error: 'invalid_type' };
  }
  let text = typeof o.text === 'string' ? o.text.trim() : '';
  if (text.length > MAX_TEXT) text = text.slice(0, MAX_TEXT);
  const url = typeof o.url === 'string' ? o.url.trim().slice(0, 2048) : '';
  const timestamp =
    typeof o.timestamp === 'string' && o.timestamp.length > 0 ? o.timestamp : new Date().toISOString();
  const userAgent =
    typeof o.userAgent === 'string' ? o.userAgent.trim().slice(0, 512) : '';

  const doc = {
    text,
    type,
    url,
    timestamp,
    userAgent,
    createdAt: new Date(),
  };
  return { ok: true, doc };
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== 'POST') {
    return sendJson(res, 405, { success: false, error: 'Method not allowed' });
  }

  const origin = req.headers.origin;
  if (!originAllowed(origin)) {
    return sendJson(res, 403, { success: false, error: 'Forbidden' });
  }
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Vary', 'Origin');

  const uri = (process.env.MONGODB_URI || '').trim();
  if (!uri) {
    console.error('[api/feedback] MONGODB_URI is not set.');
    return sendJson(res, 503, {
      success: false,
      error: 'mongodb_not_configured',
      message: 'Set MONGODB_URI in .env',
    });
  }

  const body = await parseJsonBody(req);
  if (body === null) {
    return sendJson(res, 400, { success: false, error: 'invalid_json' });
  }

  const normalized = normalizeFeedbackPayload(body);
  if (!normalized.ok) {
    return sendJson(res, 400, { success: false, error: normalized.error });
  }

  try {
    const { MongoClient } = await import('mongodb');
    const client = new MongoClient(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 10_000 });
    await client.connect();
    try {
      const dbName = (process.env.MONGODB_DB_NAME || process.env.MONGODB_DB || 'ethics_ops').trim();
      const db = client.db(dbName);
      await db.collection('feedback').insertOne(normalized.doc);
      return sendJson(res, 200, {
        success: true,
        message: '피드백이 저장되었습니다',
      });
    } finally {
      await client.close().catch(() => {});
    }
  } catch (e) {
    console.error('[api/feedback] MongoDB error:', e);
    const msg = e instanceof Error ? e.message : 'mongodb_error';
    return sendJson(res, 503, {
      success: false,
      error: 'mongodb_connection_failed',
      message: msg,
    });
  }
}
