import React, { useMemo, useState } from 'react';
import { ExternalLink, LayoutGrid, Presentation } from 'lucide-react';

type ToolTab = 'padlet' | 'mentimeter';

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
    () => sanitizeSessionEmbedUrl(import.meta.env.VITE_PADLET_EMBED_URL as string | undefined),
    [],
  );
  const mentimeterUrl = useMemo(
    () => sanitizeSessionEmbedUrl(import.meta.env.VITE_MENTIMETER_EMBED_URL as string | undefined),
    [],
  );

  const [tab, setTab] = useState<ToolTab>(() => (padletUrl ? 'padlet' : 'mentimeter'));

  const activeUrl = tab === 'padlet' ? padletUrl : mentimeterUrl;
  const hasAny = Boolean(padletUrl || mentimeterUrl);

  if (!hasAny) {
    return (
      <div className="rounded-3xl border border-slate-600/40 bg-[#050814]/90 p-6 backdrop-blur-md">
        <h3 className="text-lg font-black text-white">현장 도구 (패들렛 · 멘티미터)</h3>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          패들렛 또는 멘티미터에서 <span className="font-bold text-slate-200">공유 → Embed</span> 로 받은{' '}
          <span className="font-mono text-cyan-200/90">https</span> 임베드 주소를 환경 변수에 넣으면 이 영역에 바로 표시됩니다. API 키는 필요하지
          않습니다.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-4 text-[11px] text-slate-500">
          <li>
            <code className="text-slate-400">VITE_PADLET_EMBED_URL</code> — 패들렛 임베드 URL
          </li>
          <li>
            <code className="text-slate-400">VITE_MENTIMETER_EMBED_URL</code> — 멘티미터 프레젠테이션 임베드 URL
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-violet-400/25 bg-gradient-to-br from-[#0c0a1a] to-[#12102a] p-5 shadow-xl backdrop-blur-md lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-black text-white">현장 도구</h3>
          <p className="mt-1 text-xs text-slate-400">임베드된 패들렛·멘티미터 화면에서 그대로 참여할 수 있습니다.</p>
        </div>
        {padletUrl && mentimeterUrl && (
          <div className="flex shrink-0 gap-1 rounded-xl border border-white/10 bg-black/30 p-1">
            <button
              type="button"
              onClick={() => setTab('padlet')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                tab === 'padlet' ? 'bg-violet-500/25 text-violet-100' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Padlet
            </button>
            <button
              type="button"
              onClick={() => setTab('mentimeter')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                tab === 'mentimeter' ? 'bg-violet-500/25 text-violet-100' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Presentation className="h-3.5 w-3.5" />
              Mentimeter
            </button>
          </div>
        )}
      </div>

      {activeUrl && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
            <span className="truncate text-[11px] font-mono text-slate-500">{activeUrl}</span>
            <a
              href={activeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/15 px-2 py-1 text-[10px] font-bold text-slate-200 hover:border-cyan-400/40 hover:text-white"
            >
              새 탭
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="relative w-full" style={{ minHeight: 'min(70vh, 720px)' }}>
            <iframe
              title={tab === 'padlet' ? 'Padlet embed' : 'Mentimeter embed'}
              src={activeUrl}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="clipboard-write; fullscreen; autoplay"
            />
          </div>
        </div>
      )}

      {!activeUrl && padletUrl && mentimeterUrl && (
        <p className="mt-3 text-xs text-amber-200/90">표시할 주소가 없습니다. 탭을 다시 선택해 주세요.</p>
      )}
    </div>
  );
};

export default SessionToolEmbeds;
