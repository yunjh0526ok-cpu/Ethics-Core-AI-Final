
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles, FileText, CheckCircle2, Cpu, ChevronRight, ExternalLink, Download, MessageSquare } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const SUGGESTED_QUESTIONS = [
  "우리 기관 맞춤형 커스터마이징이 가능한가요?",
  "강의 의뢰 및 컨설팅 신청 절차는?",
  "비대면(Zoom/메타버스) 교육도 가능해?",
  "예산 범위 내 맞춤형 프로그램 설계는?",
  "교육 효과 지속을 위한 사후 관리 전략은?",
  "2026년형 AI 딜레마 롤플레잉 진행 방식?",
  "데이터 기반 청렴 골든벨 프로그램 소개",
  "조직문화 진단 프로세스와 산출물은?"
];

const PROPOSAL_CONTEXT = `
당신은 '청렴공정AI센터(Ethics-CoreAI)'의 **수석 컨설턴트 AI**입니다.
당신의 역할은 교육 담당자에게 **2026년형 최신 교육 프로그램과 솔루션**을 전문적이고 신뢰감 있게 제안하는 것입니다.

[핵심 레퍼런스: 2026년형 차세대 커리큘럼]
1. **[모듈 1] Generative AI 롤플레잉 (실습형)**
   - 기존의 일방향 강의가 아닌, 생성형 AI 페르소나와 직접 대화하며 윤리적 딜레마를 해결하는 몰입형 교육.
   - 학습자의 답변을 AI가 실시간 분석하여 피드백 리포트 제공.

2. **[모듈 2] 데이터 기반 청렴 골든벨 (참여형)**
   - 스마트폰을 활용한 전 직원 서바이벌 퀴즈 대항전.
   - 오답 데이터를 실시간으로 분석하여 우리 조직의 취약 분야(예: 이해충돌, 갑질)를 즉석에서 도출.

3. **[모듈 3] 조직문화 정밀 진단 (컨설팅)**
   - 빅데이터 텍스트 분석을 통해 조직 내 숨겨진 갈등과 소통 단절 구간을 히트맵으로 시각화.
   - 부서별 맞춤형 '소통 가이드' 및 리더십 코칭 제공.

[상담 가이드]
1. **톤앤매너**: '에코' 같은 귀여운 말투가 아닌, **'수석 컨설턴트'다운 정중하고 명확하며 신뢰감 있는 화법**을 사용하십시오. (~습니다, ~합니다 체)
2. **파트너십 강조**: 단순한 교육 제공자가 아닌, 조직의 청렴도를 혁신하는 '전략적 파트너'임을 강조하십시오.
3. **제안서 유도**: 구체적인 커리큘럼이나 비용 문의 시, **"좌측 하단의 [2026년형 제안서 보기] 버튼을 통해 상세 내용을 확인하실 수 있습니다."**라고 안내하십시오.
4. **연락처 안내**: 추가 협의가 필요할 경우 'yszoo1467@naver.com' 또는 '010-6667-1467'로 문의하도록 안내하십시오.
`;

const ProposalChatbot: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { 
      role: 'ai', 
      text: "안녕하십니까. Ethics-CoreAI 수석 컨설턴트입니다.\n\n2026년형 차세대 AI 활용 청렴 교육 커리큘럼과\n조직문화 진단 솔루션에 대해 안내해 드리겠습니다.\n\n궁금하신 점을 편하게 말씀해 주세요." 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize API
  const ai = process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null;

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setIsTyping(true);

    if (!ai) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', text: "시스템 연결 상태를 확인해주십시오. (API Key Missing)" }]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: text,
        config: {
          systemInstruction: PROPOSAL_CONTEXT,
        }
      });

      const responseText = response.text || "제안 내용을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "네트워크 연결이 원활하지 않습니다." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <section id="proposal-ai" className="relative z-10 py-24 px-4 w-full mx-auto scroll-mt-24 overflow-hidden">
      {/* 
         Layout: Symmetrical split with EQUAL size boxes.
         Gap increased to 400px to frame the central robot perfectly.
      */}
      <div className="w-full max-w-[1800px] mx-auto flex flex-col xl:flex-row items-center justify-center gap-12 xl:gap-[400px] min-h-[800px]">
        
        {/* ================= LEFT SIDE: INFO PANEL (BOXED) ================= */}
        <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-[500px] h-[700px] bg-[#0b1120]/80 border border-slate-700/50 rounded-[2.5rem] p-8 flex flex-col relative backdrop-blur-xl shadow-2xl"
        >
            <div className="flex-grow flex flex-col items-center xl:items-start text-center xl:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-xs font-bold mb-6 uppercase tracking-wider shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    <Cpu className="w-3 h-3" /> AI CONSULTING PARTNER
                </div>
                
                <h2 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight drop-shadow-2xl">
                    2026년 조직문화 혁신,<br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">보여주기식이 아닌</span><br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-400">실질적 변화를</span><br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">제안합니다</span>
                </h2>
                
                <p className="text-white font-bold text-lg mb-4 drop-shadow-md">
                "화려한 행사보다 중요한 것은 진정성입니다."
                </p>
                <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-md">
                데이터와 AI 기술을 도구 삼아,<br/>
                가장 인간적이고 투명한 조직 문화를 만드는<br/>
                여정에 든든한 파트너로 동행하겠습니다.
                </p>

                <div className="space-y-3 w-full max-w-md mb-8">
                    <div className="p-4 bg-[#0f172a]/80 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-colors flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                            <CheckCircle2 className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-slate-200 font-bold text-sm">2026년형 AI 딜레마 롤플레잉</span>
                    </div>
                    <div className="p-4 bg-[#0f172a]/80 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-colors flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                            <CheckCircle2 className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-slate-200 font-bold text-sm">데이터 기반 청렴 골든벨 (Quiz)</span>
                    </div>
                    <div className="p-4 bg-[#0f172a]/80 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-colors flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                            <CheckCircle2 className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-slate-200 font-bold text-sm">조직문화 정밀 진단 & 솔루션</span>
                    </div>
                </div>
            </div>

            <a 
              href="https://blog.naver.com/yszoo1467/224151733416"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto group w-full py-4 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-blue-900 hover:to-slate-800 border border-slate-600 hover:border-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>2026년형 제안서 보기</span>
              <ExternalLink className="w-3 h-3 opacity-50 group-hover:translate-x-1 transition-transform" />
            </a>
        </motion.div>

        {/* ================= RIGHT SIDE: CHAT INTERFACE (BOXED) ================= */}
        <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-[500px] h-[700px] bg-[#0b1120]/80 border border-slate-700/50 rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden relative backdrop-blur-xl"
        >
            {/* Header */}
            <div className="bg-[#13132b]/80 p-6 border-b border-slate-700/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 border border-white/10 flex items-center justify-center shadow-lg">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#13132b] animate-pulse"></div>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg">Ethics-Core AI Agent</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-blue-200 text-[10px] font-mono tracking-widest uppercase">2026 VER. POWERED BY GEMINI PRO</span>
                        </div>
                    </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-600 text-[10px] text-green-400 font-bold flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Online
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-grow p-6 overflow-y-auto space-y-6 custom-scrollbar bg-slate-900/30">
                
                {/* Welcome Message Block */}
                {messages.length === 1 && (
                    <div className="flex justify-center animate-in fade-in zoom-in duration-500">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 max-w-md text-center shadow-lg">
                            <div className="flex justify-center mb-4">
                                <span className="text-[10px] font-bold text-blue-400 tracking-widest uppercase flex items-center gap-2">
                                    <Sparkles className="w-3 h-3" /> Ethics-CoreAI Welcome Message
                                </span>
                            </div>
                            <p className="text-slate-200 text-base leading-relaxed whitespace-pre-wrap font-medium">
                                {messages[0].text}
                            </p>
                        </div>
                    </div>
                )}

                {/* Messages Loop (Skip first if shown in welcome block, or show all normally) */}
                {messages.length > 1 && messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div 
                            className={`
                                max-w-[85%] p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-md break-keep
                                ${msg.role === 'user' 
                                    ? 'bg-[#3b82f6] text-white rounded-tr-none font-medium' 
                                    : 'bg-[#1e293b] text-slate-200 border border-slate-700 rounded-tl-none'
                                }
                            `}
                        >
                            <div className="whitespace-pre-wrap markdown-body">{msg.text}</div>
                        </div>
                    </div>
                ))}
                
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-[#1e293b] border border-slate-700 p-4 rounded-2xl rounded-tl-none flex items-center gap-1.5 w-16 justify-center">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-100" />
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-200" />
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* Quick Chips */}
            <div className="px-4 py-3 bg-[#0b1120]/80 border-t border-slate-800 backdrop-blur-sm overflow-x-auto whitespace-nowrap custom-scrollbar shrink-0">
                <div className="flex gap-2">
                    {SUGGESTED_QUESTIONS.map((q, i) => (
                        <button
                            key={i}
                            onClick={() => handleSend(q)}
                            className="px-4 py-2 rounded-full bg-slate-800 border border-slate-600 hover:border-blue-500 hover:text-white text-slate-400 text-xs font-medium transition-colors"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#13132b] border-t border-slate-700 shrink-0">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="2026년형 커리큘럼, 견적, 일정 등 무엇이든 물어보세요..."
                        className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-5 py-4 pr-14 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    />
                    <button 
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isTyping}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProposalChatbot;
