/**
 * Unified ops metrics: Ethics Core AI, LexGuard, LogosWeb
 * MongoDB: `process.env.MONGODB_URI` (또는 Vite dev에서 loadEnv 병합 후 동일).
 * 응답에 demo 필드 없음 — URI 없음→503, 연결 실패→503.
 * 컬렉션: `users`, `logs` (앱별 `app` 필드)
 */

const DEFAULT_ORIGINS =
  'https://ethics-core-ai.vercel.app,https://ethics-core-ai-final.vercel.app,http://localhost:3000,http://127.0.0.1:3000';

export const APP_DEFS = [
  { appId: 'ethics_core_ai', label: 'Ethics Core AI' },
  { appId: 'lexguard', label: 'LexGuard' },
  { appId: 'logos_web', label: 'LogosWeb' },
];

const ACTIVE_MS = 15 * 60 * 1000;
const LOG_WINDOW_MS = 24 * 60 * 60 * 1000;

function originAllowed(origin) {
  if (!origin) return process.env.VERCEL_ENV !== 'production';
  const list = (process.env.METRICS_ALLOWED_ORIGINS || process.env.GEMINI_ALLOWED_ORIGINS || DEFAULT_ORIGINS)
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

function logWindowFilter(appKey, logSince) {
  return {
    app: appKey,
    $or: [
      { createdAt: { $gte: logSince } },
      { timestamp: { $gte: logSince } },
      { ts: { $gte: logSince } },
      { at: { $gte: logSince } },
    ],
  };
}

function errorClause() {
  return {
    $or: [
      { level: 'error' },
      { severity: 'error' },
      { type: 'error' },
      { statusCode: { $gte: 500 } },
      { status: { $gte: 500 } },
    ],
  };
}

/**
 * @param {import('mongodb').Db} db
 */
export async function aggregateMetrics(db) {
  const now = Date.now();
  const activeSince = new Date(now - ACTIVE_MS);
  const logSince = new Date(now - LOG_WINDOW_MS);

  const apps = [];
  for (const def of APP_DEFS) {
    const appKey = def.appId;
    const userFilter = { app: appKey };

    const users = await db.collection('users').countDocuments(userFilter);
    const activeUsers = await db.collection('users').countDocuments({
      ...userFilter,
      $or: [
        { lastSeenAt: { $gte: activeSince } },
        { lastActivityAt: { $gte: activeSince } },
        { updatedAt: { $gte: activeSince } },
      ],
    });

    const lf = logWindowFilter(appKey, logSince);
    const totalLogs = await db.collection('logs').countDocuments(lf);
    const errorLogs = await db.collection('logs').countDocuments({
      $and: [lf, errorClause()],
    });

    const errorRate = totalLogs > 0 ? Math.round((errorLogs / totalLogs) * 1e6) / 1e6 : 0;

    apps.push({
      appId: appKey,
      label: def.label,
      users,
      activeUsers,
      errorRate,
    });
  }

  return {
    apps,
    updatedAt: new Date().toISOString(),
  };
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== 'GET') {
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

  const uri = (process.env.MONGODB_URI || '').trim();
  if (!uri) {
    console.error('[api/metrics] MONGODB_URI is not set. Add it to .env (see .env.example).');
    return sendJson(res, 503, {
      error: 'mongodb_not_configured',
      message: 'Set MONGODB_URI in .env',
    });
  }

  try {
    const { MongoClient } = await import('mongodb');
    const client = new MongoClient(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 10_000 });
    await client.connect();
    try {
      const dbName = (process.env.MONGODB_DB_NAME || process.env.MONGODB_DB || 'ethics_ops').trim();
      const db = client.db(dbName);
      const payload = await aggregateMetrics(db);
      return sendJson(res, 200, payload);
    } finally {
      await client.close().catch(() => {});
    }
  } catch (e) {
    console.error('[api/metrics] MongoDB error:', e);
    const msg = e instanceof Error ? e.message : 'metrics_error';
    return sendJson(res, 503, {
      error: 'mongodb_connection_failed',
      message: msg,
    });
  }
}
