import React, { useMemo } from 'react';
import { ExternalLink } from 'lucide-react';

/** Share 링크를 임베드에 쓰기 쉬운 형태로만 보정합니다. 공식 Embed 코드가 있으면 그걸 우선하세요. */
function normalizeSessionToolUrl(raw: string): string {
  const u = new URL(raw.trim());
  const host = u.hostname.toLowerCase();

  if (host === 'mentimeter.com' || host === 'www.mentimeter.com' || host.endsWith('.mentimeter.com')) {
    const m = u.pathname.match(/^(\/app\/presentation\/[^/]+)\/edit\/?$/i);
    if (m) u.pathname = m[1];
  }

  return u.toString();
}

function sanitizeSessionEmbedUrl(raw: string | undefined): string | null {
  const s = (raw || '').trim();
  if (!s) return null;
  try {
    const normalized = normalizeSessionToolUrl(s);
    const u = new URL(normalized);
    if (u.protocol !== 'https:') return null;
    const host = u.hostname.toLowerCase();
    const allowed =
      host === 'padlet.com' ||
      host.endsWith('.padlet.com') ||
      host === 'mentimeter.com' ||
      host === 'www.mentimeter.com' ||
      host.endsWith('.mentimeter.com');
    if (!allowed) return null;
    return u.toString();
  } catch {
    return null;
  }
}

const SessionToolEmbeds: React.FC = () => {
  const padletUrl = useMemo(
    () => sanitizeSessionEmbedUrl(import.meta.env.VITE_PADLET_EMBED_URL as string | undefined) || 'https://padlet.com/auth/signup',
    [],
  );
  const mentimeterUrl = useMemo(
    () =>
      sanitizeSessionEmbedUrl(import.meta.env.VITE_MENTIMETER_EMBED_URL as string | undefined) ||
      'https://www.mentimeter.com/app/home',
    [],
  );

  return (
    <div className="rounded-3xl border border-violet-400/25 bg-gradient-to-br from-[#0c0a1a] to-[#12102a] p-5 shadow-xl backdrop-blur-md lg:p-6">
      <div>
        <h3 className="text-xl font-black text-white">현장 도구 바로가기</h3>
        <p className="mt-1 text-xs text-slate-400">이미지 카드를 클릭하면 각 서비스 로그인/실행 페이지로 이동합니다.</p>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <a
          href={mentimeterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group overflow-hidden rounded-2xl border border-cyan-400/25 bg-[#060b1e] transition hover:border-cyan-300/60"
        >
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <img
              src="https://logo.clearbit.com/mentimeter.com"
              alt="Mentimeter"
              className="h-7 w-7 rounded bg-white object-contain p-1"
              loading="lazy"
            />
            <p className="font-black text-cyan-100">Mentimeter</p>
          </div>
          <div className="flex min-h-[140px] items-end justify-between bg-gradient-to-br from-cyan-900/30 to-blue-900/20 p-4">
            <p className="text-sm font-bold text-slate-100">발표/투표 화면 열기</p>
            <ExternalLink className="h-4 w-4 text-cyan-200 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </a>

        <a
          href={padletUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group overflow-hidden rounded-2xl border border-fuchsia-400/25 bg-[#12081c] transition hover:border-fuchsia-300/60"
        >
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <img
              src="https://logo.clearbit.com/padlet.com"
              alt="Padlet"
              className="h-7 w-7 rounded bg-white object-contain p-1"
              loading="lazy"
            />
            <p className="font-black text-fuchsia-100">Padlet</p>
          </div>
          <div className="flex min-h-[140px] items-end justify-between bg-gradient-to-br from-fuchsia-900/30 to-violet-900/20 p-4">
            <p className="text-sm font-bold text-slate-100">보드/로그인 화면 열기</p>
            <ExternalLink className="h-4 w-4 text-fuchsia-200 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </a>
      </div>
    </div>
  );
};

export default SessionToolEmbeds;
