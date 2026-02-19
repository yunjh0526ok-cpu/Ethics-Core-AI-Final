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
  {/* 그 뒤로 좌측 대시보드가 이어집니다 */}
        
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
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-[8px] font-black text-blue-400 uppercase tracking-tighter">Live</span>
                </div>
              </div>
              <div className="space-y-6">
                {[
                  { tag: '적극행정 면책', val: 85 },
                  { tag: '사전컨설팅', val: 72 },
                  { tag: '2025 우수사례', val: 68 },
                  { tag: '주양순 강사', val: 55 },
                  { tag: '규제 혁신', val: 35 },
                  { tag: '강사단 모집', val: 28 }
                ].map((item, idx) => (
                  <div key={idx} className="group cursor-default">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-400 group-hover:text-blue-400 transition-colors">#{item.tag}</span>
                      <span className="text-[10px] font-mono text-slate-600 font-bold tracking-widest">{item.val}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${item.val}%` }} className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div onClick={handleBack} className="p-6 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-between cursor-pointer hover:bg-blue-600/20 transition-all group">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><Briefcase className="w-5 h-5 text-white" /></div>
                 <div>
                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Special Support</p>
                   <p className="text-xs font-black text-white">적극행정 우수공무원 선발</p>
                 </div>
               </div>
               <ArrowLeft className="w-4 h-4 text-white rotate-180" />
            </div>
          </div>

          {/* 4. 중앙 메인 채팅창 (상담관 든든이) */}
          <div className="lg:col-span-9 relative flex flex-col h-[750px]">
            <div className="bg-[#0D1425] rounded-[2.5rem] border border-white/10 shadow-3xl flex flex-col h-full overflow-hidden relative">
              {/* 채팅 헤더 */}
              <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 relative">
                    <ShieldCheck className="w-6 h-6 text-white" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#050A15] rounded-full flex items-center justify-center border border-white/10">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight">상담관 든든이</h3>
                    <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Proactive Admin AI Partner</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-slate-400 hover:text-white transition-all"><Search className="w-3 h-3" /> 법령 기준</button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-slate-400 hover:text-white transition-all"><Star className="w-3 h-3" /> 면책 지원</button>
                  <button onClick={handleBack} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-slate-400 hover:text-white transition-all"><LayoutGrid className="w-3 h-3" /> 처음으로</button>
                </div>
              </div>

              {/* 메시지 영역 */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-3`}>
                    {msg.role === 'ai' && <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0"><Info className="w-4 h-4 text-blue-500" /></div>}
                    <div className={`max-w-[80%] p-6 rounded-[2rem] text-[15px] leading-relaxed shadow-xl whitespace-pre-wrap ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-[#161D2F] text-slate-200 rounded-bl-none border border-white/5'
                    }`}>
                      {msg.role === 'ai' && <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-1.5 animation-pulse"><div className="w-1 h-1 bg-blue-500 rounded-full" /> 든든이의 답변</div>}
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start items-center gap-4 px-6 py-4 bg-blue-500/5 rounded-full w-fit border border-blue-500/10">
                    <div className="flex gap-1.5"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" /><span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" /></div>
                    <span className="text-[10px] font-black text-blue-400 tracking-[0.2em] uppercase">AI Analyzing...</span>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>

              {/* 하단 추천 질문 & 입력부 */}
              <div className="p-8 bg-white/[0.01] border-t border-white/5 space-y-6">
                <div className="flex flex-wrap gap-2">
                   {[
                     "적극행정 면책 요건(고의/중과실)은?",
                     "2026년 전문강사단 지원 자격 및 기간?",
                     "사전컨설팅 감사 신청 절차는?",
                     "소방청 '119패스' 사례 설명해줘"
                   ].map((q, idx) => (
                     <button key={idx} onClick={() => handleSend(q)} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-slate-500 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/10 transition-all tracking-tight">
                       Q. {q}
                     </button>
                   ))}
                </div>
                <div className="relative flex items-center gap-4">
                  <div className="flex-1 relative group">
                    <input 
                      type="text" 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="적극행정 관련 궁금한 점을 입력하세요..."
                      className="w-full bg-[#161D2F] border border-white/10 rounded-2xl px-8 py-5 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all text-sm font-medium shadow-inner"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-blue-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                  <button 
                    onClick={() => handleSend()}
                    className="p-5 bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-2xl text-white transition-all shadow-xl shadow-blue-600/20 group"
                  >
                    <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. 하단 버튼 (부패/환수법 상담소 이동) */}
        <div className="mt-12 flex justify-center gap-6">
          <button onClick={goToCorruption} className="flex items-center gap-4 px-10 py-5 rounded-[2rem] bg-[#0D1425] border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-900/30 transition-all group shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/5 transition-all" />
            <AlertTriangle className="w-6 h-6 text-red-600 group-hover:scale-110 transition-transform" />
            <div className="text-left relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-0.5">Anti-Corruption</p>
              <p className="text-sm font-black tracking-tight">부패상담관 이동</p>
            </div>
          </button>
          <button onClick={goToRecovery} className="flex items-center gap-4 px-10 py-5 rounded-[2rem] bg-[#0D1425] border border-white/10 text-slate-400 hover:text-emerald-400 hover:border-emerald-900/30 transition-all group shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-all" />
            <Coins className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
            <div className="text-left relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-0.5">Recovery Law</p>
              <p className="text-sm font-black tracking-tight">공공재정환수법 상담소 이동</p>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
};

export default ProactiveAdministration;
