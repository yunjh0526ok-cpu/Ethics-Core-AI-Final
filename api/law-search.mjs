/**
 * 국가법령정보센터 공동활용 API 프록시 (OC·serviceKey는 서버 환경변수만 사용)
 * @see https://open.law.go.kr/LSO/openApi/guideResult.do
 */

const DEFAULT_ORIGINS =
  'https://ethics-core-ai.vercel.app,https://ethics-core-ai-final.vercel.app,http://localhost:3000,http://127.0.0.1:3000';

function originAllowed(origin) {
  if (!origin) return process.env.VERCEL_ENV !== 'production';
  const list = (process.env.GEMINI_ALLOWED_ORIGINS || DEFAULT_ORIGINS)
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

function normalizeLawList(raw) {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  const out = [];
  for (const item of arr) {
    if (!item || typeof item !== 'object') continue;
    const name = item.법령명한글 || item.법령명 || item.lawNm || item.lawName || item.lsNm;
    if (!name) continue;
    out.push({
      name: String(name).trim(),
      id: item.법령ID || item.lawId || item.lsId || '',
      enf: item.시행일자 || item.enfcDt || '',
      prom: item.공포일자 || item.promDt || '',
    });
  }
  return out;
}

/** lawSearch.do JSON 응답에서 법령 배열 추출 (필드명 변형 대응) */
export function extractLawsFromLawSearchJson(data) {
  if (!data || typeof data !== 'object') return [];
  const root = data.LawSearch || data.lawSearch || data;
  let laws = normalizeLawList(root?.law);
  if (!laws.length) laws = normalizeLawList(root?.법령);
  if (!laws.length && root && typeof root === 'object') {
    for (const v of Object.values(root)) {
      laws = normalizeLawList(v);
      if (laws.length) break;
    }
  }
  const seen = new Set();
  const dedup = [];
  for (const l of laws) {
    const k = `${l.name}|${l.id}`;
    if (seen.has(k)) continue;
    seen.add(k);
    dedup.push(l);
    if (dedup.length >= 20) break;
  }
  return dedup;
}

export function formatLawContext(laws) {
  if (!laws.length) return '';
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

/**
 * @param {string} oc 공동활용 OC (등록 이메일 @ 앞부분 등)
 * @param {string} query 검색어
 */
export async function handleLawSearch(oc, query) {
  const q = String(query ?? '')
    .trim()
    .slice(0, 220);
  if (!oc) return { context: '', laws: [], error: 'missing_oc' };
  if (!q) return { context: '', laws: [], error: 'empty_query' };

  const params = new URLSearchParams({
    OC: oc,
    target: 'law',
    type: 'JSON',
    query: q,
    display: '20',
  });
  const url = `https://www.law.go.kr/DRF/lawSearch.do?${params.toString()}`;

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 12_000);
  let res;
  try {
    res = await fetch(url, {
      headers: { Accept: 'application/json, text/plain, */*' },
      signal: ac.signal,
    });
  } catch {
    return { context: '', laws: [], error: 'fetch_failed' };
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    return { context: '', laws: [], error: `upstream_${res.status}` };
  }

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { context: '', laws: [], error: 'invalid_json' };
  }

  const laws = extractLawsFromLawSearchJson(data);
  const context = formatLawContext(laws);
  return { context, laws, query: q };
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

  const oc = (process.env.LAW_GO_KR_OC || process.env.ETHICS_LAW_OC || '').trim();
  if (!oc) {
    return sendJson(res, 503, { context: '', laws: [], error: 'law_api_not_configured' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return sendJson(res, 400, { error: 'Invalid JSON' });
    }
  }
  const query = body?.query ?? body?.q ?? '';
  try {
    const out = await handleLawSearch(oc, query);
    return sendJson(res, 200, out);
  } catch (e) {
    console.error('[api/law-search]', e);
    const msg = e instanceof Error ? e.message : 'law search error';
    return sendJson(res, 500, { context: '', laws: [], error: msg });
  }
}
