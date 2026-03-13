import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Play, Users, BarChart3, Settings,
  Shield, Briefcase, PartyPopper, Handshake,
  ChevronRight, Clock, Zap, Star, Lock, Sparkles,
  Loader2, Check, X, Copy, QrCode
} from 'lucide-react';

// ─── 타입 정의 ───────────────────────────────────────────────
type Category = 'integrity' | 'workshop' | 'teambuilding' | 'party';
type Step = 'dashboard' | 'create' | 'lobby';

interface Session {
  id: string;
  title: string;
  category: Category;
  code: string;
  participants: number;
  createdAt: string;
  status: 'active' | 'ended' | 'draft';
}

// ─── 카테고리 설정 ────────────────────────────────────────────
const CATEGORIES: Record<Category, {
  label: string; icon: React.ReactNode;
  color: string; border: string; bg: string;
  gradient: string; desc: string; tag: string;
}> = {
  integrity: {
    label: '청렴·공정',
    icon: <Shield className="w-6 h-6" />,
    color: 'text-cyan-400',
    border: 'border-cyan-500/40',
    bg: 'bg-cyan-500/10',
    gradient: 'from-cyan-600 to-blue-700',
    desc: '청탁금지법·이해충돌·갑질 예방 교육',
    tag: '공공기관·기업 필수',
  },
  workshop: {
    label: '기업 워크숍',
    icon: <Briefcase className="w-6 h-6" />,
    color: 'text-violet-400',
    border: 'border-violet-500/40',
    bg: 'bg-violet-500/10',
    gradient: 'from-violet-600 to-purple-700',
    desc: 'HR 교육·역량 개발·성과 회고',
    tag: '기업 HR 담당자',
  },
  teambuilding: {
    label: '팀빌딩',
    icon: <Handshake className="w-6 h-6" />,
    color: 'text-amber-400',
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/10',
    gradient: 'from-amber-500 to-orange-600',
    desc: '팀워크·소통·협업 강화 프로그램',
    tag: '사내 모임·MT',
  },
  party: {
    label: '일반 행사·파티',
    icon: <PartyPopper className="w-6 h-6" />,
    color: 'text-pink-400',
    border: 'border-pink-500/40',
    bg: 'bg-pink-500/10',
    gradient: 'from-pink-500 to-rose-600',
    desc: '네트워킹·기념행사·파티 퀴즈',
    tag: 'MC·이벤트 진행자',
  },
};

// ─── 더미 세션 데이터 ─────────────────────────────────────────
const DUMMY_SESSIONS: Session[] = [
  { id: '1', title: '2025 청렴도 향상 교육', category: 'integrity', code: 'ECO-4821', participants: 42, createdAt: '2026.03.10', status: 'ended' },
  { id: '2', title: '상반기 HR 워크숍', category: 'workshop', code: 'ECO-7734', participants: 18, createdAt: '2026.03.12', status: 'active' },
  { id: '3', title: '3월 팀빌딩 데이', category: 'teambuilding', code: 'ECO-2291', participants: 0, createdAt: '2026.03.13', status: 'draft' },
];

// ─── 세션 코드 생성 ───────────────────────────────────────────
const generateCode = () => `ECO-${Math.floor(1000 + Math.random() * 9000)}`;

// ─── 메인 컴포넌트 ────────────────────────────────────────────
const FacilitatorDashboard: React.FC = () => {
  const [step, setStep] = useState<Step>('dashboard');
  const [sessions, setSessions] = useState<Session[]>(DUMMY_SESSIONS);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [sessionTitle, setSessionTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [newSession, setNewSession] = useState<Session | null>(null);
  const [copied, setCopied] = useState(false);
  const [filterCat, setFilterCat] = useState<Category | 'all'>('all');
  const [showQR, setShowQR] = useState(false);
  const qrRef = useRef<HTMLCanvasElement>(null);

  // QR 코드 생성 (canvas 직접 그리기)
  useEffect(() => {
    if (!showQR || !newSession || !qrRef.current) return;
    const canvas = qrRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = 200;
    canvas.width = size;
    canvas.height = size;
    // 외부 QR 라이브러리 없이 Google Chart API 이미지 사용
    const img = new Image();
    const qrText = encodeURIComponent(`https://ethics-core-ai.vercel.app/?code=${newSession.code}`);
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${qrText}&bgcolor=0f172a&color=06b6d4&format=png`;
    img.crossOrigin = 'anonymous';
    img.onload = () => { ctx.drawImage(img, 0, 0, size, size); };
    img.onerror = () => {
      // 폴백: 텍스트 표시
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(newSession.code, size / 2, size / 2);
    };
  }, [showQR, newSession]);

  const handleBack = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }));
  };

  const toggleCategory = (cat: Category) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleCreate = async () => {
    if (!sessionTitle.trim()) return;
    setCreating(true);
    await new Promise(r => setTimeout(r, 1200));
    // 카테고리 미선택 시 전체 포함
    const cats = selectedCategories.length > 0 ? selectedCategories : ['integrity', 'workshop', 'teambuilding', 'party'] as Category[];
    const primaryCat = cats[0];
    const session: Session = {
      id: Date.now().toString(),
      title: sessionTitle,
      category: primaryCat,
      code: generateCode(),
      participants: 0,
      createdAt: new Date().toLocaleDateString('ko-KR').replace(/\. /g, '.').replace('.', ''),
      status: 'draft',
    };
    setSessions(prev => [session, ...prev]);
    setNewSession(session);
    setCreating(false);
    setStep('lobby');
  };

  const handleCopyCode = () => {
    if (!newSession) return;
    navigator.clipboard.writeText(newSession.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredSessions = filterCat === 'all' ? sessions : sessions.filter(s => s.category === filterCat);

  return (
    <section className="relative z-10 py-16 px-4 w-full max-w-6xl mx-auto min-h-screen">

      {/* 뒤로가기 */}
      <div className="mb-8">
        <button
          onClick={step === 'dashboard' ? handleBack : () => setStep('dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group px-4 py-2 rounded-full hover:bg-slate-800/50"
        >
          <div className="p-1.5 rounded-full bg-slate-800 border border-slate-700 group-hover:border-cyan-500 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm">{step === 'dashboard' ? '이전 화면으로' : '대시보드로'}</span>
        </button>
      </div>

      <AnimatePresence mode="wait">

        {/* ── 대시보드 ── */}
        {step === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>

            {/* 헤더 */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-cyan-400 font-mono tracking-widest text-xs uppercase mb-2 block">Facilitator Dashboard</span>
                <h2 className="text-4xl md:text-5xl font-black text-white">
                  🎯 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">세션 관리</span>
                </h2>
                <p className="text-slate-400 mt-2 text-base">카테고리별 세션을 만들고 실시간으로 진행하세요.</p>
              </div>
              <button
                onClick={() => { setStep('create'); setSelectedCategories([]); setSessionTitle(''); }}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-base bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 self-start md:self-auto"
              >
                <Plus className="w-5 h-5" /> 새 세션 만들기
              </button>
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {[
                { label: '전체 세션', value: sessions.length, icon: <Zap className="w-5 h-5" />, color: 'text-cyan-400', border: 'border-cyan-500/30' },
                { label: '진행 중', value: sessions.filter(s => s.status === 'active').length, icon: <Play className="w-5 h-5" />, color: 'text-green-400', border: 'border-green-500/30' },
                { label: '총 참가자', value: sessions.reduce((a, s) => a + s.participants, 0), icon: <Users className="w-5 h-5" />, color: 'text-violet-400', border: 'border-violet-500/30' },
                { label: '완료 세션', value: sessions.filter(s => s.status === 'ended').length, icon: <Star className="w-5 h-5" />, color: 'text-amber-400', border: 'border-amber-500/30' },
              ].map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className={`bg-slate-900/60 border ${stat.border} rounded-2xl p-4 backdrop-blur-sm`}>
                  <div className={`${stat.color} mb-2`}>{stat.icon}</div>
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* 필터 탭 */}
            <div className="flex flex-wrap gap-2 mb-5">
              {(['all', 'integrity', 'workshop', 'teambuilding', 'party'] as const).map(cat => (
                <button key={cat} onClick={() => setFilterCat(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filterCat === cat
                    ? 'bg-gradient-to-r from-cyan-600 to-violet-600 text-white shadow-md'
                    : 'bg-slate-800/60 text-slate-400 border border-slate-700 hover:text-white'}`}>
                  {cat === 'all' ? '전체' : CATEGORIES[cat].label}
                </button>
              ))}
            </div>

            {/* 세션 목록 */}
            <div className="space-y-3">
              {filteredSessions.length === 0 && (
                <div className="text-center py-16 text-slate-500">세션이 없어요. 새 세션을 만들어보세요!</div>
              )}
              {filteredSessions.map((session, i) => {
                const cat = CATEGORIES[session.category];
                const statusMap = {
                  active: { label: '진행 중', color: 'text-green-400 bg-green-500/10 border-green-500/30' },
                  ended: { label: '완료', color: 'text-slate-400 bg-slate-800 border-slate-700' },
                  draft: { label: '대기 중', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
                };
                const status = statusMap[session.status];
                return (
                  <motion.div key={session.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    className={`flex items-center gap-4 p-4 md:p-5 rounded-2xl bg-slate-900/60 border ${cat.border} hover:bg-slate-800/60 transition-all group cursor-pointer backdrop-blur-sm`}>
                    <div className={`w-11 h-11 rounded-xl ${cat.bg} border ${cat.border} flex items-center justify-center ${cat.color} shrink-0`}>
                      {cat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-white font-bold text-sm md:text-base truncate">{session.title}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.color}`}>{status.label}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className={`font-mono font-bold ${cat.color}`}>{session.code}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{session.participants}명</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{session.createdAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${cat.bg} ${cat.color} hidden md:block`}>{cat.label}</span>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* 하단 업그레이드 배너 */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="text-white font-bold text-sm">AI 시나리오 자동생성 · 실시간 퀴즈 · 인사이트 리포트</p>
                  <p className="text-slate-400 text-xs mt-0.5">Standard 플랜 이상에서 사용 가능합니다.</p>
                </div>
              </div>
              <button className="px-4 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-black transition-colors shrink-0">
                업그레이드
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* ── 세션 생성 ── */}
        {step === 'create' && (
          <motion.div key="create" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-cyan-400 font-mono tracking-widest text-xs uppercase mb-2 block">New Session</span>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-2">새 세션 만들기</h2>
              <p className="text-slate-400 text-sm">카테고리를 선택하면 AI가 맞춤 콘텐츠를 준비해요.</p>
            </div>

            {/* 카테고리 선택 (다중 선택 가능) */}
            <div className="mb-3">
              <p className="text-slate-400 text-xs mb-3">퀴즈 카테고리 선택 <span className="text-slate-600">(미선택 시 전체 포함)</span></p>
              <div className="grid grid-cols-2 gap-3 mb-2">
                {(Object.entries(CATEGORIES) as [Category, typeof CATEGORIES[Category]][]).map(([key, cat]) => {
                  const isSelected = selectedCategories.includes(key);
                  return (
                    <button key={key} onClick={() => toggleCategory(key)}
                      className={`relative p-5 rounded-2xl border text-left transition-all group ${isSelected
                        ? `${cat.bg} ${cat.border} scale-[1.02] shadow-lg`
                        : 'bg-slate-900/60 border-slate-700 hover:border-slate-500'}`}>
                      <div className={`mb-3 ${isSelected ? cat.color : 'text-slate-500 group-hover:text-slate-300'} transition-colors`}>
                        {cat.icon}
                      </div>
                      <h4 className={`font-black text-sm mb-1 ${isSelected ? 'text-white' : 'text-slate-300'}`}>{cat.label}</h4>
                      <p className="text-[11px] text-slate-500 leading-snug">{cat.desc}</p>
                      <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold border ${isSelected ? `${cat.bg} ${cat.border} ${cat.color}` : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                        {cat.tag}
                      </span>
                      {isSelected && (
                        <div className={`absolute top-3 right-3 w-5 h-5 rounded-full bg-gradient-to-br ${cat.gradient} flex items-center justify-center`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {selectedCategories.length > 0 && (
                <p className="text-xs text-cyan-400 font-bold text-center">
                  ✅ {selectedCategories.map(c => CATEGORIES[c].label).join(' · ')} 선택됨
                </p>
              )}
              {selectedCategories.length === 0 && (
                <p className="text-xs text-slate-600 text-center">선택 없으면 4개 카테고리 전체 포함</p>
              )}
            </div>

            {/* 세션 제목 */}
            <div className="mb-6">
              <label className="text-slate-300 font-bold text-sm block mb-2">세션 제목</label>
              <input
                value={sessionTitle}
                onChange={e => setSessionTitle(e.target.value)}
                placeholder="예) 2026년 상반기 청렴 교육"
                className="w-full px-4 py-3.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-base focus:border-cyan-500 focus:outline-none placeholder:text-slate-600 transition-colors"
              />
            </div>

            {/* 생성 버튼 */}
            <button
              onClick={handleCreate}
              disabled={!sessionTitle.trim() || creating}
              className={`w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all ${sessionTitle.trim()
                ? 'bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white hover:scale-[1.01] shadow-lg'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}>
              {creating
                ? <><Loader2 className="w-5 h-5 animate-spin" /> 세션 생성 중...</>
                : <><Sparkles className="w-5 h-5" /> 세션 생성하기</>}
            </button>
          </motion.div>
        )}

        {/* ── 세션 로비 ── */}
        {step === 'lobby' && newSession && (
          <motion.div key="lobby" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="max-w-xl mx-auto text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
              className="text-6xl mb-4">🎉</motion.div>
            <h2 className="text-3xl font-black text-white mb-2">세션이 준비됐어요!</h2>
            <p className="text-slate-400 text-sm mb-8">참가자들에게 아래 코드를 공유하세요.</p>

            {/* 세션 코드 카드 */}
            <div className={`p-8 rounded-3xl border ${CATEGORIES[newSession.category].border} ${CATEGORIES[newSession.category].bg} mb-6 relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent" />
              </div>
              <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-3">Session Code</p>
              <p className="text-5xl font-black text-white font-mono tracking-wider mb-4">{newSession.code}</p>
              <p className={`text-sm font-bold ${CATEGORIES[newSession.category].color}`}>{newSession.title}</p>
            </div>

            {/* 버튼들 */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button onClick={handleCopyCode}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-slate-800 border border-slate-700 hover:border-cyan-500 text-white transition-all">
                {copied ? <><Check className="w-4 h-4 text-green-400" /> 복사됨!</> : <><Copy className="w-4 h-4" /> 코드 복사</>}
              </button>
              <button onClick={() => setShowQR(true)}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-slate-800 border border-slate-700 hover:border-violet-500 text-white transition-all">
                <QrCode className="w-4 h-4" /> QR 코드
              </button>
            </div>

            {/* QR 모달 */}
            <AnimatePresence>
              {showQR && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                  onClick={() => setShowQR(false)}>
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                    className="bg-[#0f172a] border border-slate-700 rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl">
                    <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                    <h4 className="text-white font-black text-lg mb-1">QR 코드</h4>
                    <p className="text-slate-400 text-xs mb-5">참가자가 스캔하면 바로 입장해요</p>
                    <div className="bg-slate-900 rounded-2xl p-4 inline-block mb-4 border border-slate-700">
                      <canvas ref={qrRef} className="rounded-xl" style={{ width: 200, height: 200 }} />
                    </div>
                    <p className={`font-mono font-black text-xl tracking-widest mb-1 ${newSession ? CATEGORIES[newSession.category].color : 'text-cyan-400'}`}>
                      {newSession?.code}
                    </p>
                    <p className="text-slate-500 text-xs">ethics-core-ai.vercel.app</p>
                    <button onClick={() => setShowQR(false)}
                      className="mt-5 w-full py-3 rounded-xl font-bold text-sm bg-slate-800 border border-slate-700 hover:border-cyan-500 text-white transition-all">
                      닫기
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => {
                const cats = selectedCategories.length > 0
                  ? selectedCategories
                  : ['integrity', 'workshop', 'teambuilding', 'party'];
                window.dispatchEvent(new CustomEvent('navigate', {
                  detail: { view: 'quiz', categories: cats, code: newSession.code, title: newSession.title }
                }));
              }}
              className={`w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 bg-gradient-to-r ${CATEGORIES[newSession.category].gradient} text-white hover:scale-[1.01] shadow-lg transition-all`}>
              <Play className="w-5 h-5" /> 세션 시작하기
            </button>

            <button onClick={() => setStep('dashboard')} className="mt-4 text-sm text-slate-500 hover:text-white transition-colors underline underline-offset-4">
              대시보드로 돌아가기
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </section>
  );
};

export default FacilitatorDashboard;
