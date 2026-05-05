import express from 'express';

const app = express();
app.use(express.json({ limit: '256kb' }));

const PORT = Number(process.env.PORT || 8080);
const OC = String(process.env.LAW_GO_KR_OC || process.env.ETHICS_LAW_OC || '').trim();
const ALLOWED_ORIGINS = String(process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function cors(req, res) {
  const origin = req.headers.origin;
  if (!origin) return;
  if (!ALLOWED_ORIGINS.length || ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Vary', 'Origin');
}

app.options('/law-search', (req, res) => {
  cors(req, res);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(204).end();
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/law-search', async (req, res) => {
  cors(req, res);
  if (!OC) return res.status(503).json({ error: 'missing_oc' });
  const query = String(req.body?.query || req.body?.q || '')
    .trim()
    .slice(0, 220);
  if (!query) return res.status(400).json({ error: 'empty_query' });

  const params = new URLSearchParams({
    OC,
    target: 'law',
    type: 'JSON',
    query,
    display: '20',
  });

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 12000);
  try {
    const upstream = await fetch(`https://www.law.go.kr/DRF/lawSearch.do?${params.toString()}`, {
      headers: { Accept: 'application/json, text/plain, */*' },
      signal: ac.signal,
    });
    const text = await upstream.text();
    if (!upstream.ok) {
      return res.status(502).json({
        error: `upstream_${upstream.status}`,
        upstreamStatus: upstream.status,
        sample: text.slice(0, 180),
      });
    }
    // upstream 원문을 그대로 전달 (웹앱이 파싱)
    res.status(200).type('application/json; charset=utf-8').send(text);
  } catch (e) {
    const name = e && typeof e === 'object' && 'name' in e ? String(e.name) : '';
    if (name === 'AbortError') return res.status(504).json({ error: 'timeout' });
    return res.status(500).json({ error: 'fetch_failed' });
  } finally {
    clearTimeout(timer);
  }
});

app.listen(PORT, () => {
  console.log(`[law-proxy] listening on ${PORT}`);
});
