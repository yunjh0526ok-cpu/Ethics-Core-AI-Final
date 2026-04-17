import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    /** Vercel·로컬 모두 `VITE_GEMINI_API_KEY` 우선 (클라이언트 번들에 주입) */
    const geminiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || '';
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(geminiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey),
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(geminiKey),
        'import.meta.env.VITE_UNSPLASH_ACCESS_KEY': JSON.stringify(env.VITE_UNSPLASH_ACCESS_KEY || ''),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
