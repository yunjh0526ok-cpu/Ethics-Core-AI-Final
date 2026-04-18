import path from 'path';
import type { IncomingMessage, ServerResponse } from 'http';
import type { Plugin } from 'vite';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function readReqBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function geminiDevPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'gemini-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url || '').split('?')[0];
        if (url !== '/api/gemini') return next();

        const nodeRes = res as unknown as ServerResponse;
        if (req.method === 'OPTIONS') {
          nodeRes.statusCode = 204;
          nodeRes.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          nodeRes.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          return nodeRes.end();
        }
        if (req.method !== 'POST') {
          nodeRes.statusCode = 405;
          return nodeRes.end('Method not allowed');
        }

        let parsed: unknown;
        try {
          parsed = JSON.parse(await readReqBody(req));
        } catch {
          nodeRes.statusCode = 400;
          nodeRes.setHeader('Content-Type', 'application/json');
          return nodeRes.end(JSON.stringify({ error: 'Invalid JSON' }));
        }

        const incoming = (parsed as { payload?: unknown })?.payload ?? parsed;
        const key = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '';
        if (!key) {
          nodeRes.statusCode = 500;
          nodeRes.setHeader('Content-Type', 'application/json');
          return nodeRes.end(JSON.stringify({ error: 'Set GEMINI_API_KEY in .env for local Gemini proxy' }));
        }

        try {
          const { handleGeminiProxy } = await import('./api/gemini.mjs');
          const { text } = await handleGeminiProxy(key, incoming as Record<string, unknown>);
          nodeRes.statusCode = 200;
          nodeRes.setHeader('Content-Type', 'application/json');
          return nodeRes.end(JSON.stringify({ text }));
        } catch (e) {
          const message = e instanceof Error ? e.message : 'Gemini proxy error';
          nodeRes.statusCode = /Invalid|too large|Too many|Model not allowed/.test(message) ? 400 : 500;
          nodeRes.setHeader('Content-Type', 'application/json');
          return nodeRes.end(JSON.stringify({ error: message }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), geminiDevPlugin(env)],
    define: {
      /** Unsplash만 클라이언트(선택). Gemini 키는 번들에 넣지 않음 */
      'import.meta.env.VITE_UNSPLASH_ACCESS_KEY': JSON.stringify(env.VITE_UNSPLASH_ACCESS_KEY || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
