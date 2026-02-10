
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
  Scale,        // Added for Public Finance Recovery Law
  ShieldAlert,  // Added for Conflict of Interest Prevention
  ExternalLink  // Added for link indication
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- MOCK DATA FOR DASHBOARD ---
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

// --- HELPER FUNCTION FOR STYLING ---
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

const ProactiveAdministration: React.FC = () => {
  // --- STATE ---
  const INITIAL_MESSAGE = "반갑습니다! 대한민국 적극행정 지킴이, AI 상담관 '든든이'입니다.\n\n**2025년 적극행정 우수사례 경진대회 수상작(NEW)** 데이터와 **주양순 전문강사의 AI 기반 강의 정보**가 업데이트되었습니다.\n\n**최신 우수사례, 심사 배점 기준, 면책 제도, 강사단 모집** 등 무엇이든 물어보시면, 공직자 여러분께 힘이 되는 **정확한 팩트**만 답변해 드립니다.";

  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { 
      role: 'ai', 
      text: INITIAL_MESSAGE
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Live Counter Simulation
  const [todayCount, setTodayCount] = useState(142);
  const [processingRate, setProcessingRate] = useState(98.5);

  // Initialize API
  const ai = process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null;

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
                   - **소속/직위**: 청렴공정연구센터(AI센터) 대표, Ethics-CoreAI 대표.
                   - **주요경력**: 
                     - 인사혁신처 적극행정 전담강사 (2023~현재)
                     - 국가청렴권익교육원 청렴전문강사 (2016~현재)
                     - 국방부 청렴옴부즈만 (2018~2022)
                     - 現 보건복지부, 국토교통부(국토지리정보원) 청렴자문위원.
                   - **강의 주제**: "시차를 넘는 응답, AI로 설계하는 '국민 체감형' 적극행정 골든타임".
                   - **강의 특징 (차별점)**:
                     - **AI 자동화 플랫폼**: 정적인 PPT가 아닌 자체 개발 'Ethics-Core AI' 플랫폼 활용.
                     - **실시간 솔루션**: Gemini, ChatGPT, Mentimeter를 활용해 현장에서 민원 난제 해결 실습.
                     - **스토리텔링**: 영화 '시민 덕희' 사례와 보이스피싱 예방 실화를 연결하여 '골든타임'의 중요성 강조.
                     - **심리적 안전망**: 면책 제도와 사전컨설팅을 '공직자를 보호하는 방패'로 정의하여 두려움 해소.
                   - **커리큘럼 구성**:
                     - 1교시(30분): 시민의 시선 (시민덕희 사례, 사회적 비용).
                     - 2교시(40분): 제도의 확신 (면책 제도 및 사전컨설팅 실무 가이드).
                     - 3교시(50분): 디지털 혁신 (AI 기반 적극행정 솔루션 실습, Canva AI 등).

                2. **2025 적극행정 우수사례 경진대회 수상작 (핵심)**
                   - **[중앙행정기관]**
                     - **대상(대통령상)**: **소방청** '현장도착의 골든타임을 여는 119패스'
                     - **대상(대통령상)**: **행안부/국과수** '감쪽같은 조작, 과학으로 밝힌다 - 딥페이크 탐지 기술 본격 적용'
                     - **최우수상(국무총리상)**: 국세청(원클릭 환급), 행안부/조폐공사(모바일 신분증), 개보위(딥시크 개선), 청라초(통학버스 알림).
                   - **[지방자치단체]**
                     - **대상(대통령상)**: **광주광역시** '지방세 자료 연계 새로운 조사기법 개발로 농업법인 부동산 투기 근절'
                     - **대상(대통령상)**: **경기 파주시** '디지털 은닉 재산 끝까지 추적한다! 전국 최초 코인 직접 매각 징수'
                     - **최우수상(국무총리상)**: 충청남도(119 문자신고), 경기 이천시(똑버스), 전남 신안군(습지보전법령), 부산광역시(추모공원).
                   - **[공공기관/지방공공기관]**
                     - **대상(대통령상)**: **한국도로공사** '빗길 및 포트홀 사고로부터 국민 생명 지키는 AI 초정밀 도로탐지 기술'
                     - **대상(대통령상)**: **서울교통공사** '승강장안전문 휴먼에러 예방 및 26억 예산 절감'
                     - **최우수상(국무총리상)**: 한국전기안전공사(ESS 안전), 정보통신산업진흥원(AI 탐색기), 서울경제진흥원(침수 예방), 전남개발공사(청년 주거).

                3. **우수사례 심사 기준 (고득점 전략 가이드)**
                   - **국민체감도 (50점)**: 국민 편의 제고, 재정 절감 등 **체감할 수 있는 변화**가 가장 중요함.
                   - **담당자의 적극성·창의성·전문성 (25점)**: 새로운 관점의 해결책, 이해관계 조정 및 협업 노력.
                   - **과제의 중요도 및 난이도 (15점)**: 국가 경쟁력 제고, 난해한 민원 해결, 열악한 환경 극복.
                   - **확산가능성 (5점)**: 타 기관으로 확산될 가능성.
                   - **발표완성도 (5점)**: 전달력 및 공감 호응도.

                4. **2026 적극행정 일반 강사단 모집**
                   - **접수기간**: 2026. 2. 1.(일) ~ 2. 28.(토)
                   - **자격요건**: 적극행정 우수공무원 등 역량 보유자 + **양성교육(3.20) 이수 필수**.
                   - **선발절차**: 서류(60%) + 모의강의 영상(40%) → 합계 70점 이상.
                   - **접수처**: proactive111@korea.kr

                [답변 가이드]
                1. **주양순 강사 추천**: AI 활용 적극행정 교육이나 동기부여가 필요한 경우, **"주양순 대표의 'AI 기반 국민체감형 강의'를 추천합니다."**라고 답변하고, 그녀의 **디지털 실습 및 심리적 안전망 구축** 강점을 강조하세요.
                2. **심사 기준 연계**: 우수사례를 설명할 때, **"이 사례는 심사 기준 중 '국민체감도(50점)' 항목에서 높은 평가를 받았을 것으로 분석됩니다."**와 같이 전문적인 코멘트를 덧붙이세요.
                3. **스타일링**: 답변의 가독성을 위해 줄바꿈을 활용하고, **핵심 단어는 반드시 **(별표 두개)로 감싸서 강조** 처리하세요. (## 헤더 사용 금지)

                [금지 사항]
                - 2024년 이전 자료를 최신인 것처럼 말하지 마십시오. (반드시 위 2025년 데이터 우선)
                - 허위 사실이나 추측성 답변 금지.
            `
        }
      });

      const responseText = response.text || "죄송합니다. 답변을 생성할 수 없습니다.";
      setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "네트워크 연결이 불안정합니다." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <section id="proactive-admin" className="relative z-10 py-24 px-4 w-full max-w-7xl mx-auto scroll-mt-24">
      {/* Section Header */}
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
            {/* 1. Status Cards */}
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

            {/* 2. Keyword Monitor (Tag Cloud) */}
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

            {/* 3. Quick Info Card (Now Interactive) */}
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
                {/* Header */}
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
                        {/* Reset Button moved to the far right of the header */}
                        <button 
                            onClick={handleReset}
                            className="ml-2 p-1.5 px-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs text-slate-200 transition-colors flex items-center gap-1 border border-slate-600"
                            title="처음으로 돌아가기"
                        >
                            <Home className="w-3 h-3" /> 처음으로
                        </button>
                    </div>
                </div>

                {/* Chat Log */}
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
                                {/* Render Styled Text */}
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

                {/* Quick Questions (Marquee Chips) - shrink-0 to prevent collapsing */}
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

                {/* Input Area - shrink-0 to prevent collapsing */}
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

      {/* NEW: External Service Buttons (Below Main Content) */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 w-full"
      >
          {/* Card 1: Public Finance Recovery */}
          <button 
            onClick={() => window.open('https://gemini.google.com/share/1908208fb5d3', '_blank')} 
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
          
          {/* Card 2: ECA Corruption Counselor (Renamed) */}
          <button 
            onClick={() => window.open('https://ai.studio/apps/drive/1zzGfEevIBZBn6w9CrGeJiEBhbg2HrOQ6', '_blank')} 
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
