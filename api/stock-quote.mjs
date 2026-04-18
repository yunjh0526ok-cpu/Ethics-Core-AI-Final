/**
 * Broker quote proxy (NH/Kiwoom)
 * - Keeps credentials server-side only
 * - Normalizes quote response shape for frontend
 */

const SUPPORTED_BROKERS = new Set(['nh', 'kiwoom']);
const tokenCache = new Map();

function sendJson(res, status, obj) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(obj));
}

function parseJsonSafe(text) {
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

function getByPath(obj, dottedPath) {
  if (!dottedPath) return undefined;
  return dottedPath.split('.').reduce((acc, key) => {
    if (acc && typeof acc === 'object') return acc[key];
    return undefined;
  }, obj);
}

function getBrokerEnv(env, broker) {
  const upper = broker.toUpperCase();
  const baseUrl =
    env[`STOCK_${upper}_BASE_URL`] ||
    (broker === 'kiwoom' ? 'https://api.kiwoom.com' : '');
  const quotePath =
    env[`STOCK_${upper}_QUOTE_PATH`] ||
    (broker === 'kiwoom' ? '/api/dostk/stkinfo' : '');
  const quoteMethod = (env[`STOCK_${upper}_QUOTE_METHOD`] || (broker === 'kiwoom' ? 'POST' : 'GET')).toUpperCase();
  const quoteApiId = env[`STOCK_${upper}_QUOTE_API_ID`] || (broker === 'kiwoom' ? 'ka10001' : '');
  const quoteSymbolParam = env[`STOCK_${upper}_QUOTE_SYMBOL_PARAM`] || (broker === 'kiwoom' ? 'stk_cd' : 'symbol');
  const quoteUseQuery = (env[`STOCK_${upper}_QUOTE_USE_QUERY`] || (quoteMethod === 'GET' ? 'true' : 'false')).toLowerCase() === 'true';
  const contentType = env[`STOCK_${upper}_CONTENT_TYPE`] || 'application/json;charset=UTF-8';

  const authHeaderName = env[`STOCK_${upper}_AUTH_HEADER`] || 'Authorization';
  const authHeaderValue = env[`STOCK_${upper}_AUTH_VALUE`] || '';

  const tokenUrl = env[`STOCK_${upper}_TOKEN_URL`] || (broker === 'kiwoom' ? '/oauth2/token' : '');
  const tokenMethod = (env[`STOCK_${upper}_TOKEN_METHOD`] || 'POST').toUpperCase();
  const clientId = env[`STOCK_${upper}_CLIENT_ID`] || '';
  const clientSecret = env[`STOCK_${upper}_CLIENT_SECRET`] || '';
  const tokenBodyTemplate =
    env[`STOCK_${upper}_TOKEN_BODY`] ||
    (broker === 'kiwoom'
      ? '{"grant_type":"client_credentials","appkey":"${CLIENT_ID}","secretkey":"${CLIENT_SECRET}"}'
      : '');
  const tokenField = env[`STOCK_${upper}_TOKEN_FIELD`] || 'token';

  const nameField = env[`STOCK_${upper}_NAME_FIELD`] || '';
  const priceField = env[`STOCK_${upper}_PRICE_FIELD`] || '';
  const changeField = env[`STOCK_${upper}_CHANGE_FIELD`] || '';
  const changeRateField = env[`STOCK_${upper}_CHANGE_RATE_FIELD`] || '';
  const volumeField = env[`STOCK_${upper}_VOLUME_FIELD`] || '';

  return {
    baseUrl,
    quotePath,
    quoteMethod,
    quoteApiId,
    quoteSymbolParam,
    quoteUseQuery,
    contentType,
    authHeaderName,
    authHeaderValue,
    tokenUrl,
    tokenMethod,
    clientId,
    clientSecret,
    tokenBodyTemplate,
    tokenField,
    nameField,
    priceField,
    changeField,
    changeRateField,
    volumeField,
  };
}

function safeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function extractRawQuote(data) {
  if (data == null || typeof data !== 'object') return null;
  if (Array.isArray(data) && data.length > 0) return data[0];
  if (data.data && typeof data.data === 'object') return data.data;
  if (Array.isArray(data.output) && data.output.length > 0) return data.output[0];
  if (data.output && typeof data.output === 'object') return data.output;
  if (data.quote && typeof data.quote === 'object') return data.quote;
  return data;
}

function normalizeQuote(broker, symbol, raw, cfg) {
  const src = raw || {};
  const mappedName = getByPath(src, cfg.nameField);
  const mappedPrice = getByPath(src, cfg.priceField);
  const mappedChange = getByPath(src, cfg.changeField);
  const mappedChangeRate = getByPath(src, cfg.changeRateField);
  const mappedVolume = getByPath(src, cfg.volumeField);

  return {
    broker,
    symbol,
    name:
      String(mappedName || src.name || src.stockName || src.hts_kor_isnm || src.item_name || symbol),
    price: safeNumber(mappedPrice || src.price || src.stck_prpr || src.currentPrice || src.cur_prc),
    change: safeNumber(mappedChange || src.change || src.prdy_vrss || src.priceChange || src.diff_prc),
    changeRate: safeNumber(mappedChangeRate || src.changeRate || src.prdy_ctrt || src.fluctuationRate || src.diff_rt),
    volume: safeNumber(mappedVolume || src.volume || src.acml_vol || src.tradeVolume || src.tday_vol),
    asOf: new Date().toISOString(),
    raw: src,
  };
}

function buildTokenBody(cfg) {
  const body = cfg.tokenBodyTemplate
    .replaceAll('${CLIENT_ID}', cfg.clientId)
    .replaceAll('${CLIENT_SECRET}', cfg.clientSecret);
  return parseJsonSafe(body);
}

async function getBearerToken(cfg) {
  if (!cfg.tokenUrl || !cfg.clientId || !cfg.clientSecret) return '';
  const cacheKey = `${cfg.baseUrl}|${cfg.tokenUrl}|${cfg.clientId}`;
  const cached = tokenCache.get(cacheKey);
  const now = Date.now();
  if (cached && cached.expiresAt > now + 15_000) {
    return cached.token;
  }

  const tokenEndpoint = new URL(cfg.tokenUrl, cfg.baseUrl);
  const body = buildTokenBody(cfg);
  const response = await fetch(tokenEndpoint.toString(), {
    method: cfg.tokenMethod,
    headers: {
      Accept: 'application/json',
      'Content-Type': cfg.contentType,
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  const parsed = parseJsonSafe(text);
  if (!response.ok) {
    const msg = parsed?.message || parsed?.error_description || parsed?.error || `Token ${response.status}`;
    throw new Error(`토큰 발급 실패: ${String(msg)}`);
  }

  const tokenValue =
    getByPath(parsed, cfg.tokenField) ||
    parsed.access_token ||
    parsed.token ||
    parsed.authorization;
  if (!tokenValue) {
    throw new Error('토큰 응답에서 access token을 찾지 못했습니다.');
  }

  const expiresIn = Number(parsed.expires_in || 3600);
  tokenCache.set(cacheKey, {
    token: String(tokenValue),
    expiresAt: now + Math.max(60, expiresIn - 30) * 1000,
  });
  return String(tokenValue);
}

export async function fetchStockQuote(env, { broker, symbol }) {
  if (!SUPPORTED_BROKERS.has(broker)) {
    throw new Error('지원하지 않는 증권사입니다. broker는 nh 또는 kiwoom 이어야 합니다.');
  }
  if (!symbol || typeof symbol !== 'string') {
    throw new Error('종목코드(symbol)가 필요합니다.');
  }

  const cfg = getBrokerEnv(env, broker);
  if (!cfg.baseUrl || !cfg.quotePath) {
    throw new Error(
      `${broker.toUpperCase()} API 환경변수가 설정되지 않았습니다. STOCK_${broker.toUpperCase()}_BASE_URL / STOCK_${broker.toUpperCase()}_QUOTE_PATH 를 설정하세요.`,
    );
  }

  const normalizedSymbol = symbol.trim();
  const endpoint = new URL(cfg.quotePath, cfg.baseUrl);
  if (cfg.quoteUseQuery) {
    endpoint.searchParams.set(cfg.quoteSymbolParam, normalizedSymbol);
  }

  const headers = { Accept: 'application/json' };
  headers['Content-Type'] = cfg.contentType;
  if (cfg.quoteApiId) {
    headers['api-id'] = cfg.quoteApiId;
  }

  const bearer = await getBearerToken(cfg);
  if (bearer) {
    headers.Authorization = `Bearer ${bearer}`;
  }
  if (cfg.authHeaderValue) {
    headers[cfg.authHeaderName] = cfg.authHeaderValue;
  }

  const requestInit = { method: cfg.quoteMethod, headers };
  if (!cfg.quoteUseQuery) {
    requestInit.body = JSON.stringify({ [cfg.quoteSymbolParam]: normalizedSymbol });
  }

  const response = await fetch(endpoint.toString(), requestInit);
  const text = await response.text();
  const parsed = parseJsonSafe(text);

  if (!response.ok) {
    const msg = parsed?.message || parsed?.error || `Upstream ${response.status}`;
    throw new Error(`${broker.toUpperCase()} quote error: ${String(msg)}`);
  }

  const quote = normalizeQuote(broker, normalizedSymbol, extractRawQuote(parsed), cfg);
  if (quote.price == null) {
    throw new Error(
      `${broker.toUpperCase()} 응답에서 현재가를 찾지 못했습니다. STOCK_${broker.toUpperCase()}_QUOTE_PATH 또는 응답 매핑을 확인하세요.`,
    );
  }
  return quote;
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

  let parsed = req.body;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return sendJson(res, 400, { error: 'Invalid JSON' });
    }
  }
  if (!parsed || typeof parsed !== 'object') {
    return sendJson(res, 400, { error: 'Invalid body' });
  }

  const broker = String(parsed.broker || '').toLowerCase();
  const symbol = String(parsed.symbol || '');

  try {
    const quote = await fetchStockQuote(process.env, { broker, symbol });
    return sendJson(res, 200, { quote });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Stock quote error';
    const status =
      message.includes('필요') ||
      message.includes('지원하지 않는') ||
      message.includes('설정되지 않았') ||
      message.includes('찾지 못했습니다')
        ? 400
        : 500;
    return sendJson(res, status, { error: message });
  }
}
