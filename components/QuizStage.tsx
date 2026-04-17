import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Users, Play, CheckCircle2, XCircle, Zap, Clock,
  BarChart3, RefreshCw, ChevronRight, Star, Volume2, VolumeX, Music2, Crown, FileText,
} from 'lucide-react';

const BGM_TRACKS = [
  { id: 'sh1', name: '신뢰 · 클래식 스위트 (차분)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'sh2', name: '집중 · 앰비언트 스위트', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 'sh3', name: '로파이 스튜디오 · 낮은 템포', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: 'sh4', name: '윤리 브리핑 · 미니멀 톤', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
] as const;
import { CAT_CONFIG, Category, INTEGRITY_TAGS, OrgType, Question, QuizPack, quizData } from '../data/quizData';

type Screen = 'join' | 'question' | 'final';
interface Participant { name: string; score: number; }
interface QuizStageProps {
  initialCategories?: string[];
  initialCode?: string;
  initialOrgType?: OrgType;
  initialQuizPack?: QuizPack;
}

const DUMMY_NAMES = ['김민준 🦁', '이서연 🌸', '박지호 🚀', '최하은 ⭐', '정우성 🎯', '한소희 💫'];

const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;
  const colors = ['#f97316', '#fb923c', '#fdba74', '#ffffff', '#ffedd5'];
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 80 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), opacity: 1, scale: 1 }}
          animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 100, opacity: 0, scale: 0.2, rotate: Math.random() * 1080 }}
          transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.8, ease: 'easeIn' }}
          className="absolute rounded-sm"
          style={{ width: 6 + Math.random() * 8, height: 6 + Math.random() * 8, backgroundColor: colors[Math.floor(Math.random() * colors.length)] }}
        />
      ))}
    </div>
  );
};

const QuizStage: React.FC<QuizStageProps> = ({
  initialCategories = [],
  initialCode = '',
  initialOrgType = 'public',
  initialQuizPack = 'basic',
}) => {
  const [screen, setScreen] = useState<Screen>('join');
  const [code, setCode] = useState(initialCode);
  const [nickname, setNickname] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [confetti, setConfetti] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [bgmOn, setBgmOn] = useState(true);
  const [bgmTrackIdx, setBgmTrackIdx] = useState(0);
  const [showSubModal, setShowSubModal] = useState(false);
  const [lastBonus, setLastBonus] = useState(0);
  const [isFacilitator, setIsFacilitator] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bgmAudioRef = useRef<HTMLAudioElement | null>(null);

  const ensureAudioContext = () => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playSfx = (type: 'correct' | 'wrong' | 'start' | 'tick') => {
    if (!soundOn) return;
    const ctx = ensureAudioContext();
    if (!ctx) return;
    const makeTone = (freq: number, dur = 0.18, gain = 0.16, wave: OscillatorType = 'sine', delay = 0) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = wave;
      osc.frequency.value = freq;
      osc.connect(g);
      g.connect(ctx.destination);
      const t = ctx.currentTime + delay;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    };
    if (type === 'start') [392, 523, 659].forEach((f, i) => makeTone(f, 0.2, 0.15, 'triangle', i * 0.09));
    if (type === 'correct') [659, 784, 1047].forEach((f, i) => makeTone(f, 0.22, 0.18, 'sine', i * 0.08));
    if (type === 'wrong') [220, 164].forEach((f, i) => makeTone(f, 0.3, 0.2, 'sawtooth', i * 0.1));
    if (type === 'tick') makeTone(1200, 0.08, 0.1, 'square', 0);
  };

  const stopBgm = () => {
    if (bgmAudioRef.current) {
      bgmAudioRef.current.pause();
      bgmAudioRef.current.src = '';
      bgmAudioRef.current = null;
    }
  };

  const selectedCats = useMemo<Category[]>(
    () => (initialCategories.length ? initialCategories : ['integrity', 'workshop', 'teambuilding', 'party']) as Category[],
    [initialCategories]
  );

  const buildQuestions = (cats: Category[]) => {
    const pool = quizData.filter((q) => {
      if (!cats.includes(q.category)) return false;
      if (q.category !== 'integrity') return true;
      const tagged = INTEGRITY_TAGS[q.id];
      if (!tagged) return true;
      return tagged.orgTypes.includes(initialOrgType) && tagged.packs.includes(initialQuizPack);
    });
    const target = Math.min(15, Math.max(10, pool.length));
    let shuffled = [...pool].sort(() => Math.random() - 0.5);
    while (shuffled.length < target && pool.length > 0) {
      shuffled = [...shuffled, ...[...pool].sort(() => Math.random() - 0.5)];
    }
    return shuffled.slice(0, Math.min(target, shuffled.length));
  };

  useEffect(() => {
    if (initialCategories.length > 0 && initialCode) {
      setQuestions(buildQuestions(selectedCats));
      setCode(initialCode);
      setIsFacilitator(true);
      setNickname('진행자 🎤');
      setParticipants(DUMMY_NAMES.map((name) => ({ name, score: 0 })));
    }
  }, [initialCategories.length, initialCode, selectedCats, initialOrgType, initialQuizPack]);

  useEffect(() => {
    if (screen !== 'question' || !bgmOn) {
      stopBgm();
      return;
    }
    const url = BGM_TRACKS[bgmTrackIdx]?.url ?? BGM_TRACKS[0].url;
    const el = new Audio(url);
    el.loop = true;
    el.volume = 0.32;
    el.play().catch(() => {});
    bgmAudioRef.current = el;
    return () => stopBgm();
  }, [screen, bgmOn, bgmTrackIdx]);

  const question = questions[currentQ];
  const totalQ = questions.length;

  useEffect(() => {
    if (screen !== 'question') return;
    setTimeLeft(20);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setSelected(-1);
          setShowAnswer(true);
          playSfx('wrong');
          setTimeout(() => goNext(), 3000);
          return 0;
        }
        if (t <= 5) playSfx('tick');
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [screen, currentQ, soundOn]);

  const handleJoin = () => {
    if (code.trim().length < 3 || !nickname.trim()) return;
    if (!questions.length) setQuestions(buildQuestions(selectedCats));
    if (!participants.length) setParticipants(DUMMY_NAMES.map((name) => ({ name, score: 0 })));
    playSfx('start');
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setShowAnswer(false);
    setScreen('question');
  };

  const handleSelect = (idx: number) => {
    if (!question || selected !== null || showAnswer) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelected(idx);
    setShowAnswer(true);

    if (idx === question.correct) {
      const bonus = Math.ceil(timeLeft / 4) * 10;
      const gained = 100 + bonus;
      setLastBonus(gained);
      setScore((s) => s + gained);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 1200);
      playSfx('correct');
    } else {
      setLastBonus(0);
      playSfx('wrong');
    }
    setTimeout(() => goNext(), 3000);
  };

  const goNext = () => {
    if (currentQ + 1 >= totalQ) {
      stopBgm();
      setConfetti(true);
      setTimeout(() => setConfetti(false), 4000);
      setParticipants((prev) => prev.map((p) => ({ ...p, score: Math.floor(Math.random() * 450) + 100 })));
      setScreen('final');
      return;
    }
    setCurrentQ((q) => q + 1);
    setSelected(null);
    setShowAnswer(false);
  };

  const handleBack = () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'facilitator' }));

  const timerColor = timeLeft > 10 ? 'text-green-400' : timeLeft > 5 ? 'text-amber-400' : 'text-red-400 animate-pulse';
  const timerBg = timeLeft > 10 ? 'bg-green-500' : timeLeft > 5 ? 'bg-amber-500' : 'bg-red-500';
  const me = `${nickname || '나'} 👤`;
  const allParticipants = [...participants, { name: me, score }].sort((a, b) => b.score - a.score);
  const myRank = allParticipants.findIndex((p) => p.name === me) + 1;

  return (
    <section className="relative z-10 py-16 px-4 w-full max-w-3xl mx-auto min-h-screen">
      <Confetti active={confetti} />

      <div className="flex items-center justify-between mb-8">
        {(screen === 'join' || screen === 'final') ? (
          <button onClick={handleBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group px-4 py-2 rounded-full hover:bg-slate-800/50">
            <div className="p-1.5 rounded-full bg-[#111b36] border border-orange-300/30 group-hover:border-orange-300 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm">이전 화면으로</span>
          </button>
        ) : <div />}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {screen === 'question' && (
            <>
              <select
                value={bgmTrackIdx}
                onChange={(e) => setBgmTrackIdx(Number(e.target.value))}
                className="max-w-[200px] text-xs font-bold rounded-full border border-orange-400/40 bg-[#0f172a] text-orange-100 px-3 py-2"
              >
                {BGM_TRACKS.map((t, i) => (
                  <option key={t.id} value={i}>{t.name}</option>
                ))}
              </select>
              <button type="button" onClick={() => setBgmOn((s) => !s)} className={`p-2.5 rounded-full border transition-colors text-xs font-bold px-3 ${bgmOn ? 'bg-orange-500/20 border-orange-400/60 text-orange-200' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                <span className="inline-flex items-center gap-1"><Music2 className="w-3.5 h-3.5" /> {bgmOn ? 'BGM ON' : 'BGM OFF'}</span>
              </button>
            </>
          )}
          <button onClick={() => setSoundOn((s) => !s)} className="p-2.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors">
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {screen === 'join' && (
          <motion.div key="join" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <motion.div animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.15, 1] }} transition={{ duration: 1.3, delay: 0.2 }} className="text-7xl mb-4">🎯</motion.div>
              <span className="text-orange-300 font-mono tracking-widest text-xs uppercase mb-2 block">EcoStage Integrity Quiz</span>
              <h2 className="text-4xl font-black text-white mb-2">{isFacilitator ? '진행자 모드 🎤' : '청렴퀴즈 스테이지'}</h2>
              <p className="text-slate-400 text-sm">{isFacilitator ? '실시간 퀴즈를 시작할 준비가 끝났어요.' : '세션코드와 닉네임을 입력해 참여하세요.'}</p>
            </div>

            <div className="bg-gradient-to-br from-[#09132a]/95 to-[#1d1334]/95 border border-orange-300/30 rounded-3xl p-8 backdrop-blur-sm space-y-5 shadow-[0_20px_50px_rgba(249,115,22,0.16)]">
              <div>
                <label className="text-slate-300 font-bold text-sm block mb-2">세션 코드</label>
                <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="예) ECO-4821"
                  className="w-full px-4 py-4 bg-[#111d3d]/60 border border-orange-300/30 rounded-xl text-white text-xl font-mono font-black text-center tracking-widest focus:border-orange-300 focus:outline-none placeholder:text-slate-500"
                  maxLength={8}
                />
              </div>
              <div>
                <label className="text-slate-300 font-bold text-sm block mb-2">닉네임</label>
                <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="화면에 표시될 이름"
                  className="w-full px-4 py-3.5 bg-[#111d3d]/60 border border-orange-300/30 rounded-xl text-white text-base focus:border-orange-300 focus:outline-none placeholder:text-slate-500"
                  maxLength={10}
                />
              </div>
              <button onClick={handleJoin} disabled={code.trim().length < 3 || !nickname.trim()}
                className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 bg-gradient-to-r from-[#f97316] to-[#fb923c] hover:from-[#fb923c] hover:to-[#fdba74] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.01] shadow-lg">
                <Zap className="w-5 h-5" /> 입장하기
              </button>
            </div>
            <button onClick={() => {
              setNickname('진행자');
              setCode('ECO-0000');
              setQuestions(buildQuestions(['integrity', 'workshop', 'teambuilding', 'party']));
              setParticipants(DUMMY_NAMES.map((name) => ({ name, score: 0 })));
              playSfx('start');
              setScreen('question');
            }} className="mt-4 w-full py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-white border border-slate-800 hover:border-slate-600 transition-all flex items-center justify-center gap-2">
              <Play className="w-4 h-4" /> 진행자로 데모 시작
            </button>
          </motion.div>
        )}

        {screen === 'question' && question && (
          <motion.div key={`q-${currentQ}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${CAT_CONFIG[question.category].bg} ${CAT_CONFIG[question.category].border} ${CAT_CONFIG[question.category].color}`}>
                  {CAT_CONFIG[question.category].icon} {CAT_CONFIG[question.category].label}
                </span>
                <span className="text-slate-400 text-sm font-bold">{currentQ + 1}/{totalQ}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
                  <Users className="w-3.5 h-3.5 text-slate-400" /><span className="text-white font-black text-sm">{participants.length + 1}명</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
                  <Star className="w-3.5 h-3.5 text-amber-400" /><span className="text-white font-black text-sm">{score}</span>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 ${timerColor}`}>
                  <Clock className="w-3.5 h-3.5" /><span className="font-black text-sm tabular-nums">{timeLeft}s</span>
                </div>
              </div>
            </div>

            <div className="h-2 rounded-full bg-slate-800 mb-5 overflow-hidden">
              <motion.div className={`h-full rounded-full ${timerBg}`} style={{ width: `${(timeLeft / 20) * 100}%` }} transition={{ duration: 0.9, ease: 'linear' }} />
            </div>

            <div className="bg-slate-800/50 border border-orange-300/30 rounded-2xl px-6 py-5 mb-5">
              <div className="flex items-start gap-3">
                <span className="text-4xl shrink-0">{question.emoji}</span>
                <p className="text-slate-100 text-base md:text-lg leading-relaxed break-keep font-medium">{question.story}</p>
              </div>
            </div>

            <div className="bg-[#09142a]/85 border border-orange-300/40 rounded-2xl p-6 mb-6 shadow-[0_10px_30px_rgba(249,115,22,0.12)]">
              <p className="text-white text-xl md:text-2xl font-black leading-snug text-center break-keep">❓ {question.text}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {question.options.map((opt, idx) => {
                const isSelected = selected === idx;
                const isCorrect = idx === question.correct;
                const revealed = showAnswer;
                let style = 'bg-slate-900/60 border-slate-700 text-slate-200 hover:border-slate-500 hover:bg-slate-800/60';
                if (revealed) {
                  if (isCorrect) style = 'bg-green-500/20 border-green-400 text-white shadow-lg shadow-green-500/20';
                  else if (isSelected) style = 'bg-red-500/20 border-red-400 text-white opacity-70';
                  else style = 'bg-slate-900/30 border-slate-800 text-slate-600 opacity-40';
                } else if (isSelected) style = 'bg-orange-500/20 border-orange-300 text-white scale-[1.01]';
                return (
                  <motion.button key={idx} onClick={() => handleSelect(idx)} disabled={showAnswer} whileTap={{ scale: 0.97 }}
                    className={`p-5 rounded-2xl border text-left font-bold text-base md:text-lg transition-all flex items-center gap-3 ${style}`}>
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-base font-black shrink-0 ${revealed && isCorrect ? 'bg-green-500 text-white' : revealed && isSelected ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300'}`}>
                      {revealed && isCorrect ? <CheckCircle2 className="w-4 h-4" /> : revealed && isSelected && !isCorrect ? <XCircle className="w-4 h-4" /> : ['①', '②', '③', '④'][idx]}
                    </span>
                    <span className="break-keep leading-snug text-slate-100">{opt}</span>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {showAnswer && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 p-6 rounded-2xl bg-slate-800/75 border border-orange-300/30">
                  <p className="text-sm text-orange-200 font-bold mb-2 uppercase tracking-wider">해설</p>
                  <p className="text-slate-100 text-base md:text-lg leading-relaxed whitespace-pre-line">{question.explanation}</p>
                  {selected === question.correct && lastBonus > 0 && (
                    <p className="text-green-400 font-black text-xl mt-2">딩동댕! +{lastBonus}점</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {screen === 'final' && (
          <motion.div key="final" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-4">
            <div className="text-center mb-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="text-7xl mb-4">🏆</motion.div>
              <h2 className="text-4xl font-black text-white mb-1">퀴즈 완료!</h2>
              <p className="text-slate-400">{nickname || '참가자'}님의 최종 결과</p>
            </div>

            <div className="p-7 rounded-3xl border mb-5 text-center bg-orange-500/10 border-orange-500/40">
              <p className="text-7xl font-black text-white mb-1">{score}<span className="text-2xl text-slate-400 ml-1">점</span></p>
              <p className="text-xl font-black mt-3 text-white">{allParticipants.length}명 중 {myRank}위</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-5 mb-5">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4" /> 전체 순위</p>
              <div className="space-y-2">
                {allParticipants.map((p, i) => (
                  <div key={i} className={`flex items-center gap-3 py-2.5 px-3 rounded-xl ${p.name === me ? 'bg-orange-500/10 border border-orange-500/40' : 'bg-slate-800/40'}`}>
                    <span className="text-xl w-7 text-center shrink-0">{i + 1}</span>
                    <span className={`flex-1 font-bold text-sm ${p.name === me ? 'text-orange-200' : 'text-slate-300'}`}>{p.name}</span>
                    <span className="font-black text-sm tabular-nums text-white">{p.score}점</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <button type="button" onClick={() => { setScreen('join'); setScore(0); setCurrentQ(0); setSelected(null); setShowAnswer(false); setQuestions([]); }}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-slate-800 border border-slate-700 hover:border-orange-400 text-white transition-all">
                <RefreshCw className="w-4 h-4" /> 다시 하기
              </button>
              <button type="button" onClick={handleBack}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#f97316] to-[#fb923c] text-white hover:scale-[1.01] transition-all shadow-lg">
                <ChevronRight className="w-4 h-4" /> 대시보드로
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && localStorage.getItem('eca_plan') === 'standard') {
                    window.dispatchEvent(new CustomEvent('navigate', { detail: 'facilitator' }));
                    return;
                  }
                  setShowSubModal(true);
                }}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm border border-amber-400/50 text-amber-100 bg-amber-950/30"
              >
                <Crown className="w-4 h-4" /> 업종 평균 비교 · 심화 리포트
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && localStorage.getItem('eca_plan') === 'standard') {
                    window.dispatchEvent(new CustomEvent('navigate', { detail: 'facilitator' }));
                    return;
                  }
                  setShowSubModal(true);
                }}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm border border-cyan-400/40 text-cyan-100 bg-cyan-950/25"
              >
                <FileText className="w-4 h-4" /> PDF 결과 패키지
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showSubModal && (
        <div className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowSubModal(false)}>
          <div className="w-full max-w-md rounded-3xl border border-orange-300/35 bg-gradient-to-br from-[#07122b] to-[#1d1233] p-6" onClick={(e) => e.stopPropagation()}>
            <p className="text-orange-300 text-xs font-bold tracking-widest uppercase mb-2">EcoStage · Standard</p>
            <h3 className="text-white text-2xl font-black mb-2">심화 결과는 구독 후 이용</h3>
            <p className="text-slate-300 text-sm mb-4">
              업종 벤치마크, PDF 패키지, AI 정책 제언 리포트는 Standard 플랜에서 제공됩니다.
            </p>
            <div className="flex flex-col gap-2">
              <a href="mailto:yszoo1467@naver.com?subject=Ethics-Core%20AI%20구독%20문의" className="py-3 rounded-xl text-center font-bold bg-white text-black">구독 상담</a>
              <button type="button" onClick={() => { localStorage.setItem('eca_plan', 'standard'); setShowSubModal(false); }} className="py-3 rounded-xl font-bold border border-orange-300/50 text-orange-100">데모로 열기</button>
              <button type="button" onClick={() => setShowSubModal(false)} className="py-3 rounded-xl border border-slate-600 text-slate-400">닫기</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default QuizStage;
