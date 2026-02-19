
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Bot, 
  BarChart3, 
  FileText, 
  Award, 
  Send, 
  Activity, 
  Globe, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  Gavel,
  Unlock,
  TrendingUp,
  RefreshCw,
  Home,
  ChevronRight,
  Scale,        
  ShieldAlert, 
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const KEYWORDS = [
  { text: "적극행정 면책", count: 85 },
  { text: "사전컨설팅", count: 72 },
  { text: "2025 우수사례", count: 68 },
  { text: "주양순 강사", count: 55 },
  { text: "규제 혁신", count: 35 },
  { text: "강사단 모집", count: 28 },
];

const SUGGESTED_QUESTIONS = [
  "2025년 적극행정 경진대회 대상 수상작은?",
  "주양순 강사의 적극행정 강의는?",
  "적극행정 면책 요건(고의/중과실)은?",
  "2026년 전문강사단 지원 자격 및 기간?",
  "사전컨설팅 감사 신청 절차는?",
  "소방청 '119패스' 사례 설명해줘",
  "적극행정 우수공무원 인센티브 종류는?",
  "광주광역시 지방세 조사기법 사례란?",
  "한국도로공사 AI 포트홀 탐지 사례 소개",
  "국민체감도 점수 잘 받는 팁 있어?"
];

const renderStyledText = (text: string) => {
  if (!text) return null;
  const cleanedText = text.replace(/^##\s+/gm, '').replace(/^###\s+/gm, '');
  const parts = cleanedText.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={index} className="text-blue-200 bg-blue-500/20 font-bold px-1.5 py-0.5 rounded mx-0.5 box-decoration-clone inline-block leading-snug border border-blue-500/30">
          {part.slice(2, -2)}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
};
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const ai = apiKey ? new GoogleGenAI(apiKey) : null;
const cleanText = (text: string) => text.replace(/\*\*/g, '').replace(/##/g, '').replace(/__/g, '');

const ProactiveAdministration: React.FC = () => {
  // 🌟 [진단용 코드 추가] 열쇠가 잘 배달됐는지 화면에 몰래 띄워봅니다.
  console.log("현재 연결된 키 상태:", apiKey ? "열쇠 있음(앞 4자리: " + apiKey.substring(0, 4) + ")" : "열쇠 없음");

  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'ai', 
      content: apiKey 
        ? "안녕하세요! 적극행정 상담관 든든이입니다. 무엇을 도와드릴까요?" 
        : "⚠️ [연결 오류] Vercel에서 API 키를 읽지 못하고 있습니다. 환경 변수 이름을 확인해주세요."
    }
  ]);
  
const ProactiveAdministration: React.FC = () => {
  const INITIAL_MESSAGE = "반갑습니다! 대한민국 적극행정 지킴이, AI 상담관 '든든이'입니다.\n\n**2025년 적극행정 우수사례 경진대회 수상작(NEW)** 데이터와 **주양순 전문강사의 AI 기반 강의 정보**가 업데이트되었습니다.\n\n**최신 우수사례, 심사 배점 기준, 면책 제도, 강사단 모집** 등 무엇이든 물어보시면, 공직자 여러분께 힘이 되는 **정확한 팩트**만 답변해 드립니다.";

  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: INITIAL_MESSAGE }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [todayCount, setTodayCount] = useState(142);
  const [processingRate, setProcessingRate] = useState(98.5);

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

  const handleReset = () => {
    setMessages([{ role: 'ai', text: INITIAL_MESSAGE }]);
    setInput('');
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setIsTyping(true);

    if (!ai) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', text: "시스템 점검 중입니다. (API KEY 확인 필요)" }]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: text,
        config: {
            systemInstruction: `
                당신은 대한민국 공무원을 위한 **적극행정 AI 전문 상담관 '든든이'**입니다.
                [페르소나]
                - 이름: 든든이
                - 성격: 신뢰감 있고 전문적이며, 공무원의 고충을 이해하고 격려하는 어조.
                - 전문분야: 적극행정 법령, 면책 제도, 2025년 최신 우수사례, 심사 기준, **주양순 강사 정보**.
                [필수 지식 데이터베이스 (Fact Base)]
                아래 정보를 기반으로 정확하게 답변하십시오.
                1. **적극행정 전문강사 주양순 (핵심 프로필)**
                   - 소속: 청렴공정연구센터 대표, Ethics-CoreAI 대표.
                   - 주요경력: 인사혁신처 적극행정 전담강사, 국가청렴권익교육원 청렴전문강사.
                   - 강의 특징: AI 자동화 플랫폼 활용, 실시간 솔루션(Gemini 등), 시민 덕희 사례 스토리텔링.
                2. **2025 적극행정 우수사례 경진대회 수상작 (핵심)**
                   - 중앙: 소방청(119패스), 행안부/국과수(딥페이크 탐지).
                   - 지자체: 광주광역시(지방세 조사기법), 경기 파주시(코인 직접 매각).
                   - 공공기관: 한국도로공사(AI 포트홀 탐지), 서울교통공사(승강장안전문).
                3. **우수사례 심사 기준**: 국민체감도(50점), 담당자 적극성(25점) 등.
                4. **2026 적극행정 일반 강사단 모집**: 2.1~2.28 접수, 양성교육 필수.
                [답변 가이드]
                - 주양순 강사 추천 시: AI 활용 실습 및 심리적 안전망 구축 강점 강조.
                - 심사 기준 연계: 우수사례 설명 시 국민체감도 등 기준 언급.
                - 스타일링: 줄바꿈 활용, 핵심 단어 **(별표 두개) 강조**.
                [금지 사항]
                - 허위 사실이나 추측성 답변 금지.
            `
        }
      });
      setMessages(prev => [...prev, { role: 'ai', text: response.text || "답변 불가" }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "네트워크 연결이 불안정합니다." }]);
    } finally {
      setIsTyping(false);
    }
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
    <section id="proactive-admin" className="relative z-10 py-24 px-4 w-full max-w-7xl mx-auto scroll-mt-24">
      {/* Back Button */}
      <div className="mb-6 w-full max-w-7xl mx-auto px-4">
        <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group px-4 py-2 rounded-full hover:bg-slate-800/50"
        >
            <div className="p-1.5 rounded-full bg-slate-800 border border-slate-700 group-hover:border-cyber-accent group-hover:bg-slate-700 transition-all">
                <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm">이전 화면으로</span>
        </button>
      </div>

      <div className="text-center mb-12">
         <span className="text-blue-400 font-tech tracking-widest text-xs uppercase mb-2 block">Government Innovation</span>
         <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
           적극행정 AI 센터 <span className="text-blue-500">든든이</span>
         </h2>
         <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
           대한민국 공무원의 소신 있는 행정을 지원합니다.<br/>
           <span className="text-white font-bold">법령 해석, 면책 요건, 2025 우수사례</span>까지 실시간으로 상담하세요.
         </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
        
        {/* ================= LEFT: DASHBOARD (STATISTICS) ================= */}
        <div className="lg:w-1/3 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-slate-900/60 border border-slate-700 rounded-2xl p-5 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                        <Activity className="w-8 h-8 text-blue-400" />
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Today's Consultations</p>
                    <h3 className="text-3xl font-black text-white font-mono flex items-end gap-2">
                        {todayCount.toLocaleString()} 
                        <span className="text-xs text-green-400 font-bold mb-1.5 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-0.5" /> +12%
                        </span>
                    </h3>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-900/60 border border-slate-700 rounded-2xl p-5 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Solution Rate</p>
                    <h3 className="text-3xl font-black text-white font-mono">
                        {processingRate.toFixed(1)}<span className="text-lg">%</span>
                    </h3>
                </motion.div>
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex-grow bg-[#0f172a] border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col"
            >
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-700">
                    <h4 className="text-white font-bold flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-400 animate-pulse" /> 실시간 주요 이슈
                    </h4>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> LIVE
                    </span>
                </div>
                
                <div className="flex flex-col gap-3 justify-center h-full">
                    {KEYWORDS.map((kw, i) => (
                        <div key={i} className="flex items-center justify-between group cursor-default">
                            <span className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors">#{kw.text}</span>
                            <div className="flex items-center gap-2">
                                <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${kw.count}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        className={`h-full rounded-full ${i < 3 ? 'bg-blue-500' : 'bg-slate-600'}`}
                                    />
                                </div>
                                <span className="text-xs text-slate-500 w-6 text-right">{kw.count}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                onClick={() => handleSend("적극행정 우수공무원 선발 및 인센티브에 대해 알려줘")}
                className="bg-gradient-to-br from-blue-900/20 to-slate-900 border border-blue-500/30 rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:bg-slate-800/80 hover:border-blue-400 transition-all hover:scale-[1.02] shadow-lg group"
            >
                <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center shrink-0 group-hover:bg-blue-500/30">
                    <Award className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                </div>
                <div>
                    <h4 className="text-white font-bold text-sm group-hover:text-blue-200">적극행정 우수공무원 선발</h4>
                    <p className="text-xs text-slate-400 group-hover:text-slate-300">특별승진, 성과급 최고등급 등<br/>파격적인 인센티브를 확인하세요.</p>
                </div>
            </motion.div>
        </div>

        {/* ================= RIGHT: CHAT INTERFACE (DEUNDEUN) ================= */}
        <div className="lg:w-2/3">
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="h-[600px] bg-[#0b1120] border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
            >
                <div className="bg-[#1e293b] p-4 border-b border-slate-600 flex items-center justify-between z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
                                <ShieldCheck className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1e293b]"></div>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-base">상담관 든든이</h3>
                            <p className="text-blue-300 text-xs font-mono">Proactive Admin AI Partner</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex px-3 py-1 rounded bg-slate-700/50 border border-slate-600 text-[10px] text-slate-300 items-center gap-1">
                            <Gavel className="w-3 h-3" /> 법령 기준
                        </div>
                        <div className="hidden md:flex px-3 py-1 rounded bg-slate-700/50 border border-slate-600 text-[10px] text-slate-300 items-center gap-1">
                            <Unlock className="w-3 h-3" /> 면책 지원
                        </div>
                        <button 
                            onClick={handleReset}
                            className="ml-2 p-1.5 px-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs text-slate-200 transition-colors flex items-center gap-1 border border-slate-600"
                            title="처음으로 돌아가기"
                        >
                            <Home className="w-3 h-3" /> 처음으로
                        </button>
                    </div>
                </div>

                <div className="flex-grow p-6 overflow-y-auto space-y-5 bg-[#0b1120] custom-scrollbar relative">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-md whitespace-pre-wrap ${
                                msg.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-tr-none' 
                                : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
                            }`}>
                                {msg.role === 'ai' && (
                                    <div className="text-xs font-bold text-blue-400 mb-2 flex items-center gap-1">
                                        <Bot className="w-3 h-3" /> 든든이의 답변
                                    </div>
                                )}
                                {msg.role === 'ai' ? renderStyledText(msg.text) : msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-100" />
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-200" />
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>

                <div className="shrink-0 py-3 bg-[#0b1120] border-t border-slate-800 overflow-hidden relative z-10 group">
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0b1120] to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0b1120] to-transparent z-10 pointer-events-none" />
                    
                    <div className="flex w-max gap-2 animate-marquee group-hover:[animation-play-state:paused] px-4">
                        {[...SUGGESTED_QUESTIONS, ...SUGGESTED_QUESTIONS].map((q, i) => (
                            <button 
                                key={i} 
                                onClick={() => handleSend(q)}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-blue-600 hover:text-white border border-slate-600 text-slate-400 text-xs rounded-full transition-colors flex items-center gap-1 shrink-0"
                            >
                                <Search className="w-3 h-3" /> {q}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="shrink-0 p-4 bg-[#1e293b] border-t border-slate-700 z-10">
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="적극행정 관련 궁금한 점을 입력하세요..."
                            className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 pr-12 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <button 
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isTyping}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 w-full"
      >
          {/* Public Finance Recovery - Routes to Internal Instruction Page */}
          <button 
            onClick={goToRecovery}
            className="group relative p-6 bg-[#0f172a] border border-green-500/30 rounded-2xl hover:border-green-400 transition-all hover:-translate-y-1 shadow-lg flex items-center gap-5 text-left"
          >
              <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                   <Scale className="w-7 h-7 text-green-500" />
              </div>
              <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors flex items-center gap-2">
                      공공재정환수법 상담소 <ExternalLink className="w-4 h-4 opacity-50" />
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">부정이익 환수 및 제재부가금 AI 법률 상담</p>
              </div>
          </button>
          
          {/* ECA Corruption Counselor - NOW ALSO ROUTES TO INTERSTITIAL */}
          <button 
            onClick={goToCorruption}
            className="group relative p-6 bg-[#0f172a] border border-blue-500/30 rounded-2xl hover:border-blue-400 transition-all hover:-translate-y-1 shadow-lg flex items-center gap-5 text-left"
          >
              <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                   <ShieldAlert className="w-7 h-7 text-blue-500" />
              </div>
              <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                      ECA 부패상담관 <ExternalLink className="w-4 h-4 opacity-50" />
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">청탁금지법, 이해충돌방지법, 행동강령 등 부패 심층상담</p>
              </div>
          </button>
      </motion.div>
    </section>
  );
};

export default ProactiveAdministration;
