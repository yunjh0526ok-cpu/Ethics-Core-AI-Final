# Law Proxy (Korea Region)

This proxy runs in a Korea-hosted server and relays `law.go.kr` search requests.

## 1) Start locally

```bash
cd law-proxy
npm install
npm start
```

## 2) Required environment variables

- `LAW_GO_KR_OC` (or `ETHICS_LAW_OC`)
- `ALLOWED_ORIGINS` (comma-separated frontend origins)
- `PORT` (optional, default `8080`)

## 3) API

- `GET /health`
- `POST /law-search`
  - body: `{ "query": "청탁금지법" }`
  - returns: raw JSON from `https://www.law.go.kr/DRF/lawSearch.do`

## 4) Deploy quickly (Render example)

1. Create a new Web Service from this `law-proxy` directory.
2. Build command: `npm install`
3. Start command: `npm start`
4. Region: Singapore or nearest Asia region.
5. Add env:
   - `LAW_GO_KR_OC=ethics`
   - `ALLOWED_ORIGINS=https://ethics-core-ai.vercel.app,https://ethics-core-ai-final.vercel.app`
6. Copy generated URL, e.g. `https://ethics-law-proxy.onrender.com/law-search`

## 5) Connect to Vercel app

Set this in Vercel (`ethics-core-ai-final`):

- `LAW_PROXY_BASE_URL=https://<your-proxy-domain>/law-search`

Then redeploy production.
