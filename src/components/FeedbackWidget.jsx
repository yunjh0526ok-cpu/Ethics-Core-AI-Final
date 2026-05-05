import React, { useCallback, useEffect, useState } from 'react';
import { MessageSquarePlus, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const MAX_LEN = 500;

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(/** @type {null | 'ok' | 'err'} */ (null));
  const [toastMsg, setToastMsg] = useState('');

  const len = text.length;

  const submit = useCallback(
    async (type) => {
      if (submitting) return;
      setSubmitting(true);
      setToast(null);
      try {
        const payload = {
          text: text.slice(0, MAX_LEN),
          type,
          url: typeof window !== 'undefined' ? window.location.href : '',
          timestamp: new Date().toISOString(),
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        };
        const r = await fetch('/api/feedback', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        let j = {};
        try {
          j = await r.json();
        } catch {
          j = {};
        }
        if (!r.ok) {
          const detail = j.message ? `${r.status}: ${j.message}` : `HTTP ${r.status}`;
          console.error('[FeedbackWidget] submit failed:', detail, j);
          setToast('err');
          setToastMsg(detail);
          return;
        }
        setToast('ok');
        setToastMsg(typeof j.message === 'string' ? j.message : '저장되었습니다.');
        setText('');
        setTimeout(() => {
          setOpen(false);
          setToast(null);
        }, 1600);
      } catch (e) {
        console.error('[FeedbackWidget]', e);
        setToast('err');
        setToastMsg(e instanceof Error ? e.message : 'network_error');
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, text],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="피드백 보내기"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[102] flex h-14 w-14 items-center justify-center rounded-full border border-[#B89150]/40 bg-[#0F172A]/95 text-[#B89150] shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md transition hover:border-[#B89150]/70 hover:bg-slate-900 hover:text-[#d4b87a] md:bottom-8 md:right-8"
        style={{ fontFamily: 'system-ui, Pretendard, sans-serif' }}
      >
        <MessageSquarePlus className="h-7 w-7" strokeWidth={2} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="닫기"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[103] bg-black/60 backdrop-blur-sm"
              onClick={() => !submitting && setOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="feedback-widget-title"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="fixed bottom-24 right-6 z-[104] w-[min(92vw,22rem)] rounded-2xl border border-[#B89150]/30 bg-[#0F172A]/98 p-5 shadow-2xl backdrop-blur-md md:right-8"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <h2 id="feedback-widget-title" className="text-lg font-black text-white">
                    피드백
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">의견을 남겨 주세요 (최대 {MAX_LEN}자)</p>
                </div>
                <button
                  type="button"
                  onClick={() => !submitting && setOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <textarea
                value={text}
                maxLength={MAX_LEN}
                onChange={(e) => setText(e.target.value)}
                placeholder="이 페이지나 서비스에 대한 의견을 적어 주세요."
                rows={5}
                disabled={submitting}
                className="mb-2 w-full resize-none rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#38B2AC] focus:outline-none focus:ring-1 focus:ring-[#38B2AC]/40"
              />
              <div className="mb-4 flex justify-end text-[11px] text-slate-500">
                {len}/{MAX_LEN}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => submit('positive')}
                  className="flex-1 min-w-[7rem] rounded-xl bg-emerald-600/90 px-3 py-2.5 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  👍 좋아요
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => submit('negative')}
                  className="flex-1 min-w-[7rem] rounded-xl bg-amber-700/90 px-3 py-2.5 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-50"
                >
                  🔧 개선 필요
                </button>
              </div>
              <button
                type="button"
                disabled={submitting}
                onClick={() => setOpen(false)}
                className="mt-3 w-full rounded-xl border border-slate-600 py-2 text-sm font-semibold text-slate-300 hover:border-slate-500 hover:bg-slate-800/80"
              >
                닫기
              </button>

              {toast && (
                <p
                  className={`mt-3 text-center text-xs font-semibold ${
                    toast === 'ok' ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {toast === 'ok' ? toastMsg : `오류: ${toastMsg}`}
                </p>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
