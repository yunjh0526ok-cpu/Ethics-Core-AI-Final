import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ShieldCheck, ArrowLeft, MessageSquare, Info, Star, CheckCircle, Activity, Users, Zap, AlertTriangle, Coins, Search, LayoutGrid, Briefcase, ExternalLink, X } from 'lucide-react';

const INITIAL_MESSAGE = "반갑습니다! 대한민국 적극행정 지킴이, AI 상담관 '든든이'입니다.\n\n2025년 적극행정 우수사례 경진대회 수상작(NEW) 데이터와 주양순 전문강사의 AI 기반 강의 정보가 업데이트되었습니다.\n\n최신 우수사례, 심사 배점 기준, 면책 제도, 강사단 모집 등 무엇이든 물어보시면 공직자 여러분께 힘이 되는 정확한 팩트만 답변해 드립니다.";

const ProactiveAdministration: React.FC = () => {
  const [messages, setMessages] = useState([{ role: 'ai', text: INITIAL_MESSAGE }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showBridge, setShowBridge] = useState(false); // 안내문 팝업 상태
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setIsTyping(true);

    // 1초 뒤에 주양순 강사의 안내문(브릿지) 팝업을 띄웁니다.
    setTimeout(() => {
      setIsTyping(false);
      setShowBridge(true);
    }, 1000);
  };

  const startExternalChat = () => {
    window.open("https://ai.studio/apps/drive/12B6y0KRn8rvyecX_2Ap", '_blank');
    setShowBridge(false);
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

  return (
    <div className="min-h-screen bg-[#050A15] text-slate-300 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* 1. 최상단 내비게이션 바 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050A15]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white leading-none tracking-tight">Ethics-Core AI</h1>
            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider mt-0.5">청렴공정AI센터</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <span className="flex items-center gap-1.5 text-red-500/80"><div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"/> Security Active</span>
          <span className="hover:text-white cursor-pointer transition-colors">AI Solutions</span>
          <span className="hover:text-white cursor-pointer transition-colors">Portfolio</span>
        </div>
        <button className="px-5 py-2 rounded-full bg-white text-[#050A15] text-xs font-black hover:bg-blue-50 transition-all shadow-xl shadow-white/5">
          Contact Us
        </button>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-[1400px] mx-auto">
        {/* 헤더 섹션 */}
        <div className="text-center mb-16">
          <p className="text-blue-500 font-black tracking-[0.4em] text-[10px] uppercase mb-4 opacity-80">Government Innovation</p>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter">
            적극행정 AI 센터 <span className="text-blue-500">든든이</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed font-medium opacity-90">
            주양순 전문강사의 지능형 알고리즘을 통해<br/>
            공직자 여러분의 <span className="text-white">적극행정 면책 및 우수사례</span>를 실시간 상담합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 좌측 대시보드 (디자인 유지) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="p-8 rounded-[2.5rem] bg-[#0D1425] border border-white/5 shadow-2xl">
              <div className="flex items-center gap-2 mb-8">
                <LayoutGrid className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">실시간 이슈</h3>
              </div>
              <div className="space-y-6">
                {[{ tag: '적극행정 면책', val: 85 }, { tag: '2025 우수사례', val: 68 }, { tag: '주양순 강사', val: 55 }].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-2 text-[11px] font-bold text-slate-400">
                      <span>#{item.tag}</span>
                      <span>{item.val}</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div style={{ width: `${item.val}%` }} className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 중앙 채팅창 */}
          <div className="lg:col-span-9 relative flex flex-col h-[700px]">
            <div className="bg-[#0D1425] rounded-[2.5rem] border border-white/10 shadow-3xl flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-3`}>
                    <div className={`max-w-[80%] p-6 rounded-[2rem] text-sm leading-relaxed ${
                      msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-[#161D2F] text-slate-200 rounded-bl-none border border-white/5'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-2 p-4 bg-blue-500/10 rounded-full w-fit animate-pulse">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Connecting...</span>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>

              <div className="p-8 bg-white/[0.01] border-t border-white/5">
                <div className="flex items-center gap-4">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="질문을 입력하시면 전문 상담 창으로 연결됩니다..."
                    className="flex-1 bg-[#161D2F] border border-white/10 rounded-2xl px-8 py-5 text-white"
                  />
                  <button onClick={() => handleSend()} className="p-5 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-600/20">
                    <Send className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* 🔥 [주양순 안내 브릿지 팝업] - 부패상담관 스타일 */}
            <AnimatePresence>
              {showBridge && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-[#050A15]/95 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center p-8"
                >
                  <div className="max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                      <ShieldCheck className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-4 tracking-tight">적극행정 AI 상담관 연결</h3>
                    <div className="space-y-4 mb-10 text-slate-400 text-sm leading-relaxed">
                      <p className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-white font-bold underline decoration-blue-500">주양순 전문강사</span>의 지식 데이터베이스와<br/>구글 Gemini AI가 결합된 상담 모드로 이동합니다.
                      </p>
                      <p className="px-4">보안이 강화된 외부 전문 상담 채널을 통해<br/>더욱 상세하고 정확한 면책 요건을 안내받으실 수 있습니다.</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={startExternalChat}
                        className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/30"
                      >
                        상담 시작하기 <ExternalLink className="w-5 h-5" />
                      </button>
                      <button onClick={() => setShowBridge(false)} className="w-full py-4 text-slate-500 font-bold hover:text-white transition-colors">돌아가기</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 하단 이동 버튼 */}
        <div className="mt-12 flex justify-center gap-6">
          <button onClick={goToCorruption} className="flex items-center gap-4 px-10 py-5 rounded-[2rem] bg-[#0D1425] border border-white/10 text-slate-400 hover:text-red-400 transition-all shadow-2xl">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div className="text-left"><p className="text-[10px] font-black opacity-50 uppercase">Anti-Corruption</p><p className="text-sm font-black">부패상담관 이동</p></div>
          </button>
          <button onClick={goToRecovery} className="flex items-center gap-4 px-10 py-5 rounded-[2rem] bg-[#0D1425] border border-white/10 text-slate-400 hover:text-emerald-400 transition-all shadow-2xl">
            <Coins className="w-6 h-6 text-emerald-600" />
            <div className="text-left"><p className="text-[10px] font-black opacity-50 uppercase">Recovery Law</p><p className="text-sm font-black">공공재정환수법 상담소 이동</p></div>
          </button>
        </div>
      </main>
    </div>
  );
};

export default ProactiveAdministration;
