import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ShieldCheck, ArrowLeft, MessageSquare, Info, Star, CheckCircle, Activity, Users, Zap, AlertTriangle, Coins, Search, LayoutGrid, Briefcase, ExternalLink } from 'lucide-react';

const INITIAL_MESSAGE = "반갑습니다! 대한민국 적극행정 지킴이, AI 상담관 '든든이'입니다.\n\n2025년 적극행정 우수사례 경진대회 수상작(NEW) 데이터와 주양순 전문강사의 AI 기반 강의 정보가 업데이트되었습니다.\n\n최신 우수사례, 심사 배점 기준, 면책 제도, 강사단 모집 등 무엇이든 물어보시면 공직자 여러분께 힘이 되는 정확한 팩트만 답변해 드립니다.";
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
const ProactiveAdministration: React.FC = () => {
  const [messages, setMessages] = useState([{ role: 'ai', text: INITIAL_MESSAGE }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showBridge, setShowBridge] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const qaAnswers: Record<string, string> = {
    "적극행정 면책 제도(고의·중과실 배제) 신청 방법은?": "적극행정 면책은 공익을 위해 소신껏 업무를 처리한 경우 책임을 묻지 않는 제도입니다. 감사 기구에 '면책 건의서'를 제출하여 신청하며, 자체 감사 기구의 검토를 거쳐 결정됩니다.",
    "2025년 적극행정 우수사례 경진대회 최신 수상작 리스트": "2025년 최우수 사례로는 소방청의 '119패스(긴급차량 우선신호)'와 행안부의 '딥페이크 탐지 시스템' 등이 선정되어 공직 혁신을 이끌고 있습니다.",
    "주양순 전문강사의 '실패를 두려워않는 공직문화' 강의 커리큘럼": "주양순 강사님의 강의는 1. 적극행정의 본질 이해, 2. 면책 실무 가이드, 3. 우수사례 분석을 통한 동기 부여 등 현장 중심의 커리큘럼으로 구성되어 있습니다.",
    "사전 컨설팅 감사제도와 적극행정위원회 심의 차이점": "사전 컨설팅은 감사 기구에 자문을 구하는 것이고, 적극행정위원회는 법령이 불분명할 때 위원회 의결을 통해 추진 동력을 얻는 점에서 차이가 있습니다.",
    "적극행정 우수공무원 특별승진 및 파격 인센티브 기준": "우수공무원으로 선정되면 특별승진, 성과급 최고등급(S), 포상휴가, 교육훈련 우선권 등 인사상 파격적인 인센티브를 받을 수 있습니다.",
    "소방청 '119패스' 및 행안부 '딥페이크 탐지' 우수사례 분석": "119패스는 골든타임 확보를 위해 신호를 제어하는 시스템이며, 딥페이크 탐지는 최신 AI 기술로 범죄를 예방한 적극행정의 기술적 혁신 사례입니다.",
    "지방공무원 적극행정 운영 지침 및 면책 요건 가이드": "지침의 핵심은 '공공의 이익'과 '고의·중과실 없음'입니다. 절차적 하자가 없고 투명하게 결정된 사항이라면 법령 해석상의 차이로 인한 책임은 면제됩니다.",
    "규제 샌드박스 및 적극적 법령 해석 지원 신청 절차": "새로운 비즈니스 모델이나 규제 애로사항이 있을 경우, 소관 부처에 규제 확인을 신청하거나 적극행정위원회를 통해 법령 해석 지원을 요청할 수 있습니다.",
    "2026년 적극행정 전문강사단 정기 모집 기간 및 자격": "통상 매년 초 공고되며, 적극행정 관련 실무 경력이 풍부하거나 강의 역량이 검증된 공직자 및 민간 전문가를 대상으로 엄격한 심사를 통해 선발합니다.",
    "적극행정 면책 보호관 제도 및 법률 지원 서비스 안내": "면책 보호관은 소송이나 징계 절차에서 공무원을 조력하는 전문가입니다. 필요한 경우 변호사 선임 비용 등 법률적 지원도 함께 제공됩니다.",
    "적극행정 마일리지 제도 도입 및 운영 사례 공유": "적극행정 마일리지는 작은 실천에도 즉각적인 보상을 주는 제도로, 커피 쿠폰부터 상품권까지 다양한 인센티브를 통해 공직 활력을 제고하고 있습니다.",
    "징계 의결 제외를 위한 적극행정 면책 건의서 작성법": "건의서에는 업무 추진의 배경, 공익적 목적, 당시 상황에서의 최선이었음을 입증하는 자료, 그리고 고의가 없었음을 상세히 기술하는 것이 핵심입니다."
  };
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

 const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    // 1. 일단 사용자가 보낸 질문을 화면에 띄웁니다.
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      // 2. 질문 문구에서 'Q. ' 같은 불필요한 글자를 제거하고 깨끗하게 만듭니다.
      const cleanText = text.replace("Q. ", "").trim();
      
      // 3. 주머니(qaAnswers)를 뒤져서 비슷한 질문이 있는지 찾습니다.
      const foundKey = Object.keys(qaAnswers).find(key => 
        cleanText.includes(key.substring(0, 10)) || // 앞 10글자만 같아도 정답 인정
        key.includes(cleanText.substring(0, 10)) ||
        (text.includes("면책") && key.includes("면책")) ||
        (text.includes("119") && key.includes("119"))
      );

      const answer = qaAnswers[text] || qaAnswers[cleanText] || (foundKey ? qaAnswers[foundKey] : null);

      if (answer) {
        // 답변이 있으면 즉시 출력
        setMessages(prev => [...prev, { role: 'ai', text: answer }]);
        setIsTyping(false);
      } else {
        // 정말 아예 모르는 내용일 때만 팝업
        setIsTyping(false);
        setShowBridge(true);
      }
    }, 600); // 응답 속도도 더 빠르게 조절했습니다.
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
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { display: flex; width: max-content; animation: marquee 40s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
      `}</style>

      {/* 1. 상단 내비게이션 바 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050A15]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white leading-none tracking-tight">Ethics-Core AI</h1>
            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider mt-0.5">청렴공정AI센터</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <span className="text-red-500/80 flex items-center gap-1.5"><div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"/> Security Active</span>
          <span>About Center</span><span>AI Solutions</span><span>Portfolio</span>
        </div>
        <button className="px-5 py-2 rounded-full bg-white text-[#050A15] text-xs font-black shadow-xl shadow-white/5">Contact Us</button>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-[1400px] mx-auto">
        {/* 2. 헤더 섹션 */}
        <div className="text-center mb-16">
          <p className="text-blue-500 font-black tracking-[0.4em] text-[10px] uppercase mb-4 opacity-80">Government Innovation</p>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter">적극행정 AI 센터 <span className="text-blue-500">든든이</span></h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed font-medium opacity-90 underline decoration-blue-500 underline-offset-8">
            대한민국 공무원의 소신 있는 행정을 지원합니다.<br/>
            법령 해석, 면책 요건, 2025 우수사례까지 실시간으로 상담하세요.
          </p>
        </div>

        {/* 3. 흘러가는 Q&A (Marquee) */}
        <div className="mb-12 overflow-hidden whitespace-nowrap border-y border-white/5 py-6 bg-white/[0.01]">
          <div className="animate-marquee">
            {[...rollingQA, ...rollingQA].map((qa, i) => (
              <div key={i} onClick={() => handleSend(qa)}  // 👈 딱 이 자리에 이 글자를 복사해서 넣으세요!
           className="inline-flex items-center gap-3 px-8 py-3 mx-4 rounded-full bg-[#0D1425] border border-white/10 text-slate-400 text-sm hover:border-blue-500/50 transition-colors cursor-pointer group"
      >
        <Zap className="w-3 h-3 text-blue-500" />
        <span>{qa}</span>
      </div>
    ))}
  </div>
</div>
        className="inline-flex items-center gap-3 px-8 py-3 mx-4 rounded-full bg-[#0D1425] border border-white/10 text-slate-400 text-sm hover:border-blue-500/50 transition-colors cursor-pointer group">
                <Zap className="w-3 h-3 text-blue-500" />
                <span>{qa}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. 메인 콘텐츠 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* 좌측 대시보드 */}
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-[#0D1425] border border-white/5 shadow-2xl relative overflow-hidden group">
                <Activity className="w-5 h-5 text-blue-500 mb-3" />
                <p className="text-slate-500 text-[10px] font-black uppercase mb-1 tracking-widest leading-tight">Today's Consult</p>
                <div className="flex items-end gap-2"><span className="text-2xl font-black text-white leading-none">173</span><span className="text-[10px] font-bold text-emerald-500 mb-1">▲12%</span></div>
              </div>
              <div className="p-6 rounded-3xl bg-[#0D1425] border border-white/5 shadow-2xl relative overflow-hidden group">
                <CheckCircle className="w-5 h-5 text-emerald-500 mb-3" />
                <p className="text-slate-500 text-[10px] font-black uppercase mb-1 tracking-widest leading-tight">Solution Rate</p>
                <p className="text-2xl font-black text-white leading-none">98.9<span className="text-sm ml-0.5 opacity-50">%</span></p>
              </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-[#0D1425] border border-white/5 shadow-2xl">
              <div className="flex items-center gap-2 mb-8 border-b border-white/5 pb-4">
                <LayoutGrid className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">실시간 주요 이슈</h3>
              </div>
              <div className="space-y-6">
                {[ { tag: '적극행정 면책', val: 85 }, { tag: '사전컨설팅', val: 72 }, { tag: '2025 우수사례', val: 68 }, { tag: '주양순 강사', val: 55 } ].map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-[11px] font-bold text-slate-500"><span>#{item.tag}</span><span>{item.val}</span></div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div style={{ width: `${item.val}%` }} className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]" /></div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-blue-500" />
              <div><p className="text-[10px] font-black text-blue-400 uppercase mb-0.5">Special Support</p><p className="text-xs font-black text-white">적극행정 우수공무원 선발</p></div>
            </div>
          </div>

          {/* 우측 채팅 섹션 */}
          <div className="lg:col-span-9 relative flex flex-col h-[750px]">
            <div className="bg-[#0D1425] rounded-[3rem] border border-white/10 shadow-3xl flex flex-col h-full overflow-hidden relative">
              <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg"><ShieldCheck className="w-5 h-5 text-white" /></div>
                  <div><h3 className="text-md font-black text-white leading-tight">상담관 든든이</h3><p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest">Proactive Admin AI Partner</p></div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-3`}>
                    <div className={`max-w-[80%] p-6 rounded-[2rem] text-[15px] leading-relaxed shadow-xl ${
                      msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none shadow-blue-900/20' : 'bg-[#161D2F] text-slate-200 rounded-bl-none border border-white/5'
                    }`}>{msg.text}</div>
                  </div>
                ))}
                {isTyping && <div className="p-4 bg-blue-500/10 rounded-full w-fit animate-pulse text-[10px] font-black text-blue-400 uppercase tracking-widest">Analyzing...</div>}
                <div ref={scrollRef} />
              </div>

              <div className="p-8 bg-white/[0.01] border-t border-white/5 space-y-4">
                <div className="flex flex-wrap gap-2">
                   {["적극행정 면책 요건 확인", "2026년 전문강사단 자격", "사전컨설팅 신청 절차"].map(q => (
                     <button key={q} onClick={() => handleSend(q)} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-500 hover:text-white transition-all">Q. {q}</button>
                   ))}
                </div>
                <div className="relative flex items-center gap-4">
                  <input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="궁금한 내용을 입력하세요..." className="flex-1 bg-[#161D2F] border border-white/10 rounded-2xl px-8 py-5 text-white focus:outline-none focus:border-blue-500/50" />
                  <button onClick={() => handleSend()} className="p-5 bg-blue-600 rounded-2xl text-white shadow-xl"><Send className="w-6 h-6" /></button>
                </div>
              </div>

              <AnimatePresence>
                {showBridge && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-[#050A15]/95 backdrop-blur-xl rounded-[3rem] flex items-center justify-center p-8 text-center">
                    <div className="max-w-md w-full">
                      <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-500/30"><ShieldCheck className="w-10 h-10 text-blue-500" /></div>
                      <h3 className="text-2xl font-black text-white mb-4">적극행정 AI 상담관 연결</h3>
                      <p className="mb-10 text-slate-400 text-sm p-6 bg-white/5 rounded-3xl border border-white/5">주양순 전문강사의 최신 데이터가 탑재된 보안 상담 모드로 이동합니다.</p>
                      <button onClick={startExternalChat} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl">상담 시작하기 <ExternalLink className="w-5 h-5" /></button>
                      <button onClick={() => setShowBridge(false)} className="w-full py-4 text-slate-500 font-bold hover:text-white">돌아가기</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* 5. 하단 버튼 섹션 */}
        <div className="mt-12 flex justify-center gap-6">
          <button onClick={goToCorruption} className="flex items-center gap-4 px-10 py-5 rounded-[2rem] bg-[#0D1425] border border-white/10 text-slate-400 hover:text-red-400 transition-all shadow-xl group">
            <AlertTriangle className="w-6 h-6 text-red-600 group-hover:scale-110 transition-transform" />
            <div className="text-left"><p className="text-[9px] font-black uppercase opacity-50 tracking-widest">Anti-Corruption</p><p className="text-sm font-black">부패상담관 이동</p></div>
          </button>
          <button onClick={goToRecovery} className="flex items-center gap-4 px-10 py-5 rounded-[2rem] bg-[#0D1425] border border-white/10 text-slate-400 hover:text-emerald-400 transition-all shadow-xl group">
            <Coins className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
            <div className="text-left"><p className="text-[9px] font-black uppercase opacity-50 tracking-widest">Recovery Law</p><p className="text-sm font-black">공공재정환수법 상담소 이동</p></div>
          </button>
        </div>
      </main>
    </div>
  );
};

export default ProactiveAdministration;
