import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ShieldCheck, ArrowLeft, MessageSquare, Info, Star, CheckCircle, Activity, Users, Zap, AlertTriangle, Coins } from 'lucide-react';

const INITIAL_MESSAGE = "반갑습니다! 적극행정 전문 상담관 '든든이'입니다. 궁금하신 내용을 입력하시면 전문 상담 창으로 연결해 드립니다.";

const ProactiveAdministration: React.FC = () => {
  const [messages, setMessages] = useState([{ role: 'ai', text: INITIAL_MESSAGE }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [todayCount, setTodayCount] = useState(143);
  const [processingRate, setProcessingRate] = useState(98.6);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTodayCount(prev => prev + Math.floor(Math.random() * 2));
      setProcessingRate(prev => {
        const change = (Math.random() - 0.5) * 0.1;
        return Math.min(100, Math.max(95, prev + change));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      window.open("https://ai.studio/apps/drive/12B6y0KRn8rvyecX_2Ap", '_blank');
      setIsTyping(false);
    }, 1000);
  };

  const handleBack = () => {
    sessionStorage.setItem('hero_view_mode', 'consulting');
    const event = new CustomEvent('navigate', { detail: 'home' });
    window.dispatchEvent(event);
  };

  const goToRecovery = () => {
    sessionStorage.setItem('counseling_mode', 'recovery');
    const event = new CustomEvent('navigate', { detail: 'counseling_center' });
    window.dispatchEvent(event);
  };

  const goToCorruption = () => {
    sessionStorage.setItem('counseling_mode', 'corruption');
    const event = new CustomEvent('navigate', { detail: 'counseling_center' });
    window.dispatchEvent(event);
  };

  const rollingQA = [
    "적극행정 면책 제도가 궁금해요",
    "2025년 우수사례는 어떤 게 있나요?",
    "주양순 강사님 강의 커리큘럼은?",
    "사전 컨설팅 신청은 어떻게 하나요?",
    "적극행정 우수공무원 인센티브는?"
  ];

  return (
    <section id="proactive-admin" className="relative z-10 py-24 px-4 w-full max-w-7xl mx-auto scroll-mt-24">
      {/* 1. 상단 내비게이션 및 메뉴 이동 버튼 */}
      <div className="mb-8 w-full max-w-7xl mx-auto px-4 flex flex-wrap justify-between items-center gap-4">
        <button onClick={handleBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-all group px-4 py-2 rounded-full hover:bg-slate-800/50 border border-transparent hover:border-slate-700">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm text-slate-300">이전 화면으로</span>
        </button>
        
        <div className="flex gap-3">
          <button onClick={goToCorruption} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-900/50 transition-all text-sm font-bold shadow-lg">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            부패상담관 이동
          </button>
          <button onClick={goToRecovery} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-900/50 transition-all text-sm font-bold shadow-lg">
            <Coins className="w-4 h-4 text-emerald-500" />
            공공재정환수법 상담소 이동
          </button>
        </div>
      </div>

      {/* 2. 헤더 섹션 */}
      <div className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 blur-[120px] -z-10" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-blue-400 font-mono tracking-[0.3em] text-xs uppercase mb-3 block opacity-80">Government Innovation AI Hub</span>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
                적극행정 AI 센터 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">든든이</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed font-light">
                <span className="text-white font-medium">주양순 전문강사</span>의 실시간 솔루션과 2025 최신 우수사례 기반,<br/>
                대한민국 공무원의 소신 있는 행정을 지능적으로 지원합니다.
            </p>
        </motion.div>
      </div>

      {/* 3. 흐르는 Q&A (Marquee) */}
      <div className="mb-12 overflow-hidden whitespace-nowrap relative py-4">
        <div className="flex animate-marquee gap-8">
          {[...rollingQA, ...rollingQA].map((qa, i) => (
            <div key={i} className="flex items-center gap-3 px-6 py-3 rounded-full bg-slate-900/50 border border-slate-800 text-slate-400 text-sm hover:border-blue-500/30 transition-colors cursor-default">
              <Zap className="w-3 h-3 text-blue-500" />
              {qa}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 4. 좌측 대시보드 */}
        <div className="lg:col-span-4 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-[2rem] bg-slate-900/80 border border-slate-800 backdrop-blur-sm shadow-xl hover:border-blue-500/30 transition-all group">
              <Activity className="w-5 h-5 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-tighter">오늘의 상담</p>
              <p className="text-3xl font-black text-white leading-none">{todayCount}</p>
            </div>
            <div className="p-6 rounded-[2rem] bg-slate-900/80 border border-slate-800 backdrop-blur-sm shadow-xl hover:border-emerald-500/30 transition-all group">
              <CheckCircle className="w-5 h-5 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-tighter">실시간 해결률</p>
              <p className="text-3xl font-black text-white leading-none">{processingRate.toFixed(1)}%</p>
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 relative overflow-hidden group shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-400" />
              전문 상담 정보
            </h3>
            <div className="space-y-4 relative z-10">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                <p className="text-blue-400 text-xs font-bold mb-1 uppercase tracking-widest">주양순 전문강사</p>
                <p className="text-slate-300 text-sm leading-relaxed font-light">AI 자동화 플랫폼 활용 실시간 솔루션 & 적극행정 전문 교육 및 심리적 안전망 구축</p>
              </div>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                <p className="text-indigo-400 text-xs font-bold mb-1 uppercase tracking-widest">2025 우수사례</p>
                <p className="text-slate-300 text-sm leading-relaxed font-light">소방청 119패스, 행안부 딥페이크 탐지 등 최신 경진대회 데이터베이스 상시 업데이트</p>
              </div>
            </div>
          </div>
        </div>

        {/* 5. 우측 채팅창 */}
        <div className="lg:col-span-8 relative">
          <div className="bg-slate-900/40 rounded-[3rem] border border-slate-800/50 backdrop-blur-2xl h-[650px] flex flex-col overflow-hidden shadow-3xl">
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-3`}>
                  <div className={`max-w-[85%] p-5 rounded-[2rem] text-sm leading-relaxed shadow-lg ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-br-none shadow-blue-900/20' 
                      : 'bg-slate-800/80 text-slate-200 rounded-bl-none border border-slate-700/50 backdrop-blur-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start items-center gap-4 px-6 py-3 bg-blue-500/10 rounded-full w-fit border border-blue-500/20 animate-pulse">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  </div>
                  <span className="text-[10px] font-bold text-blue-400 tracking-[0.2em] uppercase">Consultant Connecting</span>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            <div className="p-8 bg-slate-950/50 border-t border-slate-800/50 backdrop-blur-xl">
              <div className="relative flex items-center gap-4">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="궁금하신 적극행정 내용을 입력하세요..."
                  className="flex-1 bg-slate-900/80 border border-slate-700/50 rounded-[1.5rem] px-8 py-5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-base shadow-inner"
                />
                <button 
                  onClick={() => handleSend()}
                  className="p-5 bg-gradient-to-tr from-blue-600 to-indigo-600 hover:scale-105 active:scale-95 rounded-[1.5rem] text-white transition-all shadow-xl shadow-blue-600/30 group"
                >
                  <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProactiveAdministration;
