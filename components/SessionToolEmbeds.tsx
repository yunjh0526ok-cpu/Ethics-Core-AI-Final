import React, { useMemo } from 'react';
import { CheckCircle2, ExternalLink, LayoutGrid, Presentation } from 'lucide-react';

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
  const padletEnv = useMemo(
    () => sanitizeSessionEmbedUrl(import.meta.env.VITE_PADLET_EMBED_URL as string | undefined),
    [],
  );
  const padletUrl = padletEnv || 'https://padlet.com/auth/signup';
  const mentimeterUrl = useMemo(
    () =>
      sanitizeSessionEmbedUrl(import.meta.env.VITE_MENTIMETER_EMBED_URL as string | undefined) ||
      'https://www.mentimeter.com/app/home',
    [],
  );

  return (
    <div className="rounded-3xl border border-violet-400/25 bg-gradient-to-br from-[#0c0a1a] to-[#12102a] p-5 shadow-xl backdrop-blur-md lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-black text-white">현장 도구 바로가기</h3>
          <p className="mt-1 text-xs text-slate-400">이미지 카드를 클릭하면 각 서비스 로그인/실행 페이지로 이동합니다.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-bold text-slate-200 hover:border-cyan-400/40 hover:text-white"
          >
            이전으로
          </button>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }))}
            className="rounded-lg border border-cyan-400/35 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-100 hover:border-cyan-300/70 hover:bg-cyan-500/20"
          >
            홈
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <a
          href={mentimeterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group overflow-hidden rounded-2xl border border-cyan-400/25 bg-[#060b1e] transition hover:border-cyan-300/60"
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-cyan-500/20 text-cyan-100">
                <Presentation className="h-4 w-4" />
              </div>
              <p className="font-black text-cyan-100">Mentimeter</p>
            </div>
            <span className="rounded-full border border-cyan-300/40 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold text-cyan-100">
              추천
            </span>
          </div>
          <div className="flex min-h-[140px] flex-col justify-between bg-gradient-to-br from-cyan-900/30 to-blue-900/20 p-4">
            <div className="space-y-1 text-xs text-slate-300">
              <p>실시간 투표 · 퀴즈 · 워드클라우드</p>
              <p>참여 코드 안내 후 바로 진행</p>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <p className="text-sm font-bold text-slate-100">발표/투표 화면 열기</p>
              <ExternalLink className="h-4 w-4 text-cyan-200 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </a>

        <a
          href={padletUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group overflow-hidden rounded-2xl border border-fuchsia-400/25 bg-[#12081c] transition hover:border-fuchsia-300/60"
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-fuchsia-500/20 text-fuchsia-100">
                <LayoutGrid className="h-4 w-4" />
              </div>
              <p className="font-black text-fuchsia-100">Padlet</p>
            </div>
            <span className="rounded-full border border-fuchsia-300/40 bg-fuchsia-500/15 px-2 py-0.5 text-[10px] font-bold text-fuchsia-100">
              토론 보드
            </span>
          </div>
          <div className="flex min-h-[140px] flex-col justify-between bg-gradient-to-br from-fuchsia-900/30 to-violet-900/20 p-4">
            <div className="space-y-1 text-xs text-slate-300">
              <p>의견 수집 · 과제 업로드 · 공동 정리</p>
              <p>비공개 보드는 로그인 후 접근</p>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <p className="text-sm font-bold text-slate-100">보드/로그인 화면 열기</p>
              <ExternalLink className="h-4 w-4 text-fuchsia-200 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </a>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <p className="text-xs font-black tracking-wide text-slate-200">운영 체크</p>
        <div className="mt-2 grid gap-2 text-xs text-slate-300 md:grid-cols-2">
          <p className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
            멘티미터: 참여 코드/링크 사전 공지
          </p>
          <p className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
            패들렛: 접근권한(뷰어/로그인) 확인
          </p>
          <p className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
            시작 전 새 탭 동작 테스트 1회
          </p>
          <p className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
            URL 미설정 시 기본 로그인 페이지로 이동
          </p>
        </div>
        {!padletEnv && (
          <p className="mt-3 text-[11px] text-amber-200/90">
            `VITE_PADLET_EMBED_URL`이 비어 있어 현재 Padlet 카드는 가입/로그인 페이지로 이동합니다.
          </p>
        )}
      </div>
    </div>
  );
};

export default SessionToolEmbeds;
