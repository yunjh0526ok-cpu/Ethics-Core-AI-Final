import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ShieldCheck, ArrowLeft, MessageSquare, Info, Star, CheckCircle, Activity, Users, Zap, AlertTriangle, Coins, Search, LayoutGrid, Briefcase, Heart } from 'lucide-react';

const INITIAL_MESSAGE = "반갑습니다! 대한민국 적극행정 지킴이, AI 상담관 '든든이'입니다.\n\n2025년 적극행정 우수사례 경진대회 수상작(NEW) 데이터와 주양순 전문강사의 AI 기반 강의 정보가 업데이트되었습니다.\n\n최신 우수사례, 심사 배점 기준, 면책 제도, 강사단 모집 등 무엇이든 물어보시면 공직자 여러분께 힘이 되는 정확한 팩트만 답변해 드립니다.";

const ProactiveAdministration: React.FC = () => {
  const [messages, setMessages] = useState([{ role: 'ai', text: INITIAL_MESSAGE }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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
     
const rollingQA = [
    "적극행정 면책 제도(고의·중과실 배제) 신청 방법은?",
    "2025년 적극행정 우수사례 경진대회 최신 수상작 리스트",
    "주양순 전문강사의 '실패를 두려워않는 공직문화' 강의 커리큘럼",
    "사전 컨설팅 감사제도와 적극행정위원회 심의 차이점",
    "적극행정 우수공무원 특별승진 및 파격 인센티브 기준",
    "소방청 '119패스' 및 행안부 '딥페이크 탐지' 우수사례 분석",
    "지방공무원 적극행정 운영 지침 및 면책 요건 가이드",
    "규제 샌드박스 및 적극적 법령 해석 지원 신청 절차",
    "2026년 적극행정 전문강사단 정기 모집 기간 및 자격",
    "적극행정 면책 보호관 제도 및 법률 지원 서비스 안내",
    "적극행정 마일리지 제도 도입 및 운영 사례 공유",
    "징계 의결 제외를 위한 적극행정 면책 건의서 작성법"
  ];
      
return (
    <div className="min-h-screen bg-[#050A15] text-slate-300 font-sans selection:bg-blue-500/30">
      
      {/* 3. 스타일 태그는 return 바로 아래에 한 번만! */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      <nav className="fixed top-0 left-0 right-0 z-50 ...">
        {/* ... */}
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-[1400px] mx-auto">
        {/* 5. 중앙 헤더 섹션 */}
        <div className="text-center mb-16">
          <p className="...">Government Innovation</p>
          <h2 className="...">적극행정 AI 센터 <span className="text-blue-500">든든이</span></h2>
          <p className="...">
            대한민국 공무원의 소신 있는 행정을 지원합니다.<br/>
            <span className="text-white">법령 해석, 면책 요건, 2025 우수사례</span>까지 실시간으로 상담하세요.
          </p>
        </div>

           <div className="mb-12 overflow-hidden whitespace-nowrap border-y border-white/5 py-6 bg-white/[0.01]">
          <div className="animate-marquee">
            {[...rollingQA, ...rollingQA].map((qa, i) => (
              <div key={i} className="inline-flex items-center gap-3 px-8 py-3 mx-4 rounded-full bg-[#0D1425] border border-white/10 text-slate-400 text-sm hover:border-blue-500/50 transition-colors cursor-pointer group">
                <Zap className="w-3 h-3 text-blue-500 group-hover:animate-pulse" />
                <span>{qa}</span>
              </div>
            ))}
          </div>
        </div>
{/* ---------------------------------------------------------- */}

<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 3. 좌측 대시보드 (통계 & 실시간 이슈) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex gap-4">
              <div className="flex-1 p-6 rounded-3xl bg-[#0D1425] border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Activity className="w-8 h-8 text-blue-500" /></div>
                <p className="text-slate-500 text-[10px] font-black uppercase mb-2 tracking-tighter">Today's Consultations</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-white leading-none">173</span>
                  <span className="text-[10px] font-bold text-emerald-500 mb-1">▲12%</span>
                </div>
              </div>
              <div className="flex-1 p-6 rounded-3xl bg-[#0D1425] border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><CheckCircle className="w-8 h-8 text-emerald-500" /></div>
                <p className="text-slate-500 text-[10px] font-black uppercase mb-2 tracking-tighter">Solution Rate</p>
                <p className="text-3xl font-black text-white leading-none">98.9<span className="text-sm ml-0.5 opacity-50">%</span></p>
              </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-[#0D1425] border border-white/5 shadow-2xl overflow-hidden relative">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">실시간 주요 이슈</h3>
                </div>
              </div>
              <div className="space-y-6">
                {[
                  { tag: '적극행정 면책', val: 85 },
                  { tag: '사전컨설팅', val: 72 },
                  { tag: '2025 우수사례', val: 68 }
                ].map((item, idx) => (
                  <div key={idx} className="group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-400">#{item.tag}</span>
                      <span className="text-[10px] font-mono text-slate-600 font-bold">{item.val}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div style={{ width: `${item.val}%` }} className="h-full bg-blue-600 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. 중앙 메인 채팅창 */}
          <div className="lg:col-span-9 relative flex flex-col h-[750px]">
            <div className="bg-[#0D1425] rounded-[2.5rem] border border-white/10 shadow-3xl flex flex-col h-full overflow-hidden relative">
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-3`}>
                    <div className={`max-w-[80%] p-6 rounded-[2rem] text-[15px] leading-relaxed shadow-xl ${
                      msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-[#161D2F] text-slate-200 rounded-bl-none border border-white/5'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && <div className="p-4 bg-blue-500/10 rounded-full w-fit animate-pulse text-[10px] font-black text-blue-400 uppercase tracking-widest">AI Analyzing...</div>}
                <div ref={scrollRef} />
              </div>

              <div className="p-8 bg-white/[0.01] border-t border-white/5">
                <div className="relative flex items-center gap-4">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="궁금한 내용을 입력하세요..."
                    className="flex-1 bg-[#161D2F] border border-white/10 rounded-2xl px-8 py-5 text-white focus:outline-none"
                  />
                  <button onClick={() => handleSend()} className="p-5 bg-blue-600 hover:bg-blue-500 rounded-2xl text-white shadow-xl transition-all">
                    <Send className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* 브릿지 팝업 로직 */}
              <AnimatePresence>
                {showBridge && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-[#050A15]/95 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center p-8">
                    <div className="max-w-md w-full text-center">
                      <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-500/30">
                        <ShieldCheck className="w-10 h-10 text-blue-500" />
                      </div>
                      <h3 className="text-2xl font-black text-white mb-4">적극행정 AI 상담관 연결</h3>
                      <p className="mb-10 text-slate-400 text-sm leading-relaxed p-6 bg-white/5 rounded-3xl">주양순 전문강사의 최신 데이터가 탑재된<br/>전문 상담 모드로 이동합니다.</p>
                      <button onClick={startExternalChat} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3">상담 시작하기 <ExternalLink className="w-5 h-5" /></button>
                      <button onClick={() => setShowBridge(false)} className="w-full py-4 text-slate-500 font-bold hover:text-white transition-colors">돌아가기</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* 5. 하단 이동 버튼 */}
        <div className="mt-12 flex justify-center gap-6">
          <button onClick={goToCorruption} className="flex items-center gap-4 px-10 py-5 rounded-[2rem] bg-[#0D1425] border border-white/10 text-slate-400 hover:text-red-400 transition-all">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div className="text-left"><p className="text-[10px] font-black uppercase opacity-50">Anti-Corruption</p><p className="text-sm font-black">부패상담관 이동</p></div>
          </button>
          <button onClick={goToRecovery} className="flex items-center gap-4 px-10 py-5 rounded-[2rem] bg-[#0D1425] border border-white/10 text-slate-400 hover:text-emerald-400 transition-all">
            <Coins className="w-6 h-6 text-emerald-600" />
            <div className="text-left"><p className="text-[10px] font-black uppercase opacity-50">Recovery Law</p><p className="text-sm font-black">공공재정환수법 상담소 이동</p></div>
          </button>
        </div>
      </main>
    </div>
  );
};

export default ProactiveAdministration;
