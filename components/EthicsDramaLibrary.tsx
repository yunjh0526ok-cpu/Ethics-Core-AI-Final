import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Film, Sparkles } from 'lucide-react';
import { ETHICS_DRAMA_STORY_SEEDS } from '@/lib/ethicsDramaSeedData';

type Seed = (typeof ETHICS_DRAMA_STORY_SEEDS)[number];

function BoldLines({ text, className }: { text: string; className?: string }) {
  const lines = text.split('\n');
  return (
    <div className={className}>
      {lines.map((line, li) => (
        <p key={li} className={li > 0 ? 'mt-2' : ''}>
          {line.split(/(\*\*[^*]+\*\*)/g).map((chunk, i) => {
            const m = chunk.match(/^\*\*([^*]+)\*\*$/);
            if (m)
              return (
                <strong key={i} className="font-bold text-white">
                  {m[1]}
                </strong>
              );
            return <span key={i}>{chunk}</span>;
          })}
        </p>
      ))}
    </div>
  );
}

const EthicsDramaLibrary: React.FC = () => {
  const seeds = useMemo(() => ETHICS_DRAMA_STORY_SEEDS, []);
  const [active, setActive] = useState<Seed | null>(null);
  const [quizPick, setQuizPick] = useState<string | null>(null);

  const goBackApp = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }));
  };

  return (
    <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-4">
      <button
        type="button"
        onClick={goBackApp}
        className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-cyan-300"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        홈으로
      </button>

      <section className="mb-10 rounded-3xl border border-cyan-500/25 bg-slate-900/70 p-6 shadow-[0_0_40px_-12px_rgba(34,211,238,0.35)] backdrop-blur-md md:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <Film className="h-8 w-8 text-cyan-400" />
          <div>
            <p className="font-tech text-[11px] font-black uppercase tracking-[0.2em] text-cyan-400">
              Ethics-Drama
            </p>
            <h1 className="text-2xl font-black text-white md:text-3xl">에틱스 드라마 · 9편 킬러 라이브러리</h1>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-sm font-medium leading-relaxed text-slate-300 md:text-base">
          국가법령·판례 취지를 바탕으로 한 3막 구조(유혹 → 적발 → 후폭풍), 딜레마 퀴즈, 징계·표창 분포를 한 화면에서 읽을 수 있습니다.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-black text-cyan-100">
          <BookOpen className="h-3.5 w-3.5" />
          총 {seeds.length}편
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {seeds.map((s) => (
          <motion.button
            key={s.slug}
            type="button"
            layout
            onClick={() => {
              setActive(s);
              setQuizPick(null);
            }}
            className="group flex flex-col rounded-2xl border border-slate-700/80 bg-slate-900/60 p-5 text-left transition hover:border-cyan-500/50 hover:shadow-[0_20px_50px_-20px_rgba(34,211,238,0.45)]"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-cyan-500/25 to-violet-500/20 text-2xl">
                {s.heroEmoji}
              </span>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-black text-cyan-100">
                {s.category}
              </span>
            </div>
            <h2 className="text-lg font-black leading-snug text-white md:text-xl">{s.title}</h2>
            <p className="mt-2 line-clamp-3 text-sm font-semibold text-slate-300">{s.hook}</p>
            <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-slate-500 group-hover:text-cyan-300/90">
              <Sparkles className="h-3.5 w-3.5" />
              3막 · 퀴즈 · 차트
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm md:items-center"
            role="dialog"
            aria-modal
            aria-labelledby="drama-title"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-600 bg-[#0a0c12] p-5 shadow-2xl md:p-8"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-cyan-400">
                    {active.category}
                  </p>
                  <h2 id="drama-title" className="mt-1 text-xl font-black text-white md:text-2xl">
                    {active.heroEmoji} {active.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-bold text-slate-300 hover:border-cyan-500/50 hover:text-white"
                >
                  닫기
                </button>
              </div>

              <div className="space-y-6 text-sm leading-relaxed text-slate-300">
                <div>
                  <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-violet-300">
                    1막 · 유혹
                  </h3>
                  <BoldLines text={active.stageStart} />
                </div>
                <div>
                  <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-amber-300">
                    2막 · 적발
                  </h3>
                  <BoldLines text={active.stageConflict} />
                </div>
                <div>
                  <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-rose-300">
                    3막 · 후폭풍
                  </h3>
                  <BoldLines text={active.stageFall} />
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                  <h3 className="mb-2 text-xs font-black uppercase text-cyan-200">정리</h3>
                  <BoldLines text={active.outcome} />
                </div>

                {active.lawRefs?.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-xs font-black uppercase text-slate-400">관련 법령</h3>
                    <ul className="flex flex-wrap gap-2">
                      {active.lawRefs.map((r, i) => (
                        <li
                          key={i}
                          className="rounded-full border border-slate-600 bg-slate-800/80 px-2.5 py-1 text-[11px] font-bold text-slate-200"
                        >
                          {r.statute} {r.clause}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="rounded-xl border border-cyan-500/25 bg-cyan-950/20 p-4">
                  <h3 className="mb-3 text-xs font-black uppercase text-cyan-200">Dilemma Quiz</h3>
                  <p className="mb-3 font-semibold text-white">{active.quizQuestion}</p>
                  <div className="space-y-2">
                    {active.quizOptions.map((opt) => {
                      const show = quizPick !== null;
                      const isCorrect = opt.id === active.quizCorrectOptionId;
                      const isPicked = opt.id === quizPick;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setQuizPick(opt.id)}
                          className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm font-semibold transition ${
                            show && isCorrect
                              ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-100'
                              : show && isPicked && !isCorrect
                                ? 'border-rose-500/50 bg-rose-500/10 text-rose-100'
                                : 'border-slate-600 bg-slate-900/60 text-slate-200 hover:border-cyan-500/40'
                          }`}
                        >
                          {opt.label}
                          {show && (isPicked || isCorrect) && (
                            <p className="mt-2 text-xs font-medium leading-relaxed text-slate-300">
                              {opt.commentary}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {active.disciplineStats?.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-xs font-black uppercase text-slate-400">분포(교육·사례 참고)</h3>
                    <div className="space-y-2">
                      {active.disciplineStats.map((d) => {
                        const max = Math.max(...active.disciplineStats.map((x) => x.count), 1);
                        const w = Math.round((d.count / max) * 100);
                        return (
                          <div key={d.type}>
                            <div className="mb-0.5 flex justify-between text-[11px] font-bold text-slate-400">
                              <span>{d.type}</span>
                              <span>{d.count}</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500"
                                style={{ width: `${w}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {active.authorNote && (
                  <p className="border-t border-slate-800 pt-4 text-xs italic text-slate-500">{active.authorNote}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EthicsDramaLibrary;
