
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles, FileText, CheckCircle2, Cpu, ChevronRight, ExternalLink } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const SUGGESTED_QUESTIONS = [
  "2026년형 AI 청렴 교육 커리큘럼의 특징은?",
  "AI 딜레마 롤플레잉은 어떻게 진행되나요?",
  "청렴 골든벨(퀴즈 서바이벌) 프로그램 소개해주세요.",
  "조직문화 정밀 진단(갑질/소통) 프로세스는?",
  "우리 기관 맞춤형 커스터마이징이 가능한가요?",
  "강의 의뢰 및 컨설팅 신청 절차는?",
  "비대면(Zoom/Metaverse) 교육도 가능한가요?",
  "예산 범위에 맞춘 프로그램 설계가 가능한가요?",
  "교육 효과성을 높이기 위한 사후 관리 방안은?",
  "기존 주입식 청렴 교육과의 차별점은 무엇인가요?"
];

const PROPOSAL_CONTEXT = `
당신은 '청렴공정AI센터(Ethics-CoreAI)'의 **수석 AI 컨설턴트**입니다.
당신의 역할은 공공기관 및 기업 담당자에게 **2026년형 최신 Ethics-CoreAI 교육 프로그램과 조직문화 솔루션**을 전문적으로 안내하고 제안하는 것입니다.

[핵심 레퍼런스 정보: 2026년형 차세대 커리큘럼]
반드시 아래의 **3대 핵심 모듈**을 중심으로 답변을 구성하십시오.

1. **[Module 1] 2026 AI 딜레마 롤플레잉 (Generative AI Role-Playing)**
   - **내용**: 단순 강의가 아닌, 생성형 AI 페르소나와 직접 대화하며 딜레마 상황(청탁, 갑질, 이해충돌)을 해결하는 실습형 교육.
   - **효과**: "강의를 듣는 것"에서 "직접 경험하고 판단하는 것"으로 패러다임 전환. 실시간으로 AI가 윤리적 판단에 대한 피드백 리포트를 제공.

2. **[Module 2] 데이터 기반 청렴 골든벨 (AI Survival Quiz)**
   - **내용**: 스마트폰을 활용한 전 직원 참여형 서바이벌 퀴즈. AI가 최신 법령과 감사 사례를 학습하여 난이도별 퀴즈를 자동 생성.
   - **특징**: 단순 재미를 넘어, 참여자들의 오답 데이터를 실시간 분석하여 조직의 '윤리 지식 취약점'을 즉석에서 파악하고 보완 교육 실시.

3. **[Module 3] 조직문화 정밀 진단 & 솔루션 (Deep-Dive Consulting)**
   - **내용**: 빅데이터 텍스트 분석을 통해 조직 내 숨겨진 갈등, 갑질 위험, 소통 단절 구간을 히트맵으로 시각화.
   - **결과물**: '조직 감성 온도' 측정 및 부서별 맞춤형 소통 가이드라인(Do's & Don'ts) 제공.

[상담 가이드라인 & 태도]
1. **전문성과 신뢰감**: "단순히 재미있는 교육이 아니라, **데이터로 증명되는 행동 변화**를 만듭니다."라는 메시지를 전달하십시오.
2. **파트너십 강조**: 당신은 단순 강사가 아닌, 조직의 청렴도를 높이는 **'혁신 파트너'**입니다. 정중하고 협력적인 태도를 유지하십시오.
3. **상세 정보 안내**: 사용자가 더 구체적인 제안서나 커리큘럼을 원할 경우, **"왼쪽 아래의 [2026년형 제안서 보기] 버튼을 클릭하시면 2026년형 전체 커리큘럼을 확인하실 수 있습니다."**라고 안내하십시오.
4. **일정 및 비용**: "기관의 규모, 교육 형태(특강/워크숍), 진단 범위에 따라 맞춤 설계가 가능하므로, 상담 신청을 남겨주시면 최적의 안을 제안해 드리겠습니다."라고 답변하십시오.

[금지 사항]
- 특정 타 기관의 실명이나 내부 대외비 정보를 언급하지 마십시오.
- 권위적이거나 가르치려는 말투를 지양하십시오.
- "국민권익위원회 소속"이라고 사칭하지 마십시오. (민간 전문 기관임)

[마무리 멘트 예시]
"귀 기관의 특성에 딱 맞는 '2026년형 AI 청렴 교육'을 설계해 드리고 싶습니다. 구체적인 일정 협의가 필요하시다면 언제든 말씀해 주세요."
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

    // Add user message
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setIsTyping(true);

    if (!ai) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', text: "죄송합니다. 현재 AI 서버 연결 상태를 확인해주세요. (API KEY 필요)" }]);
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

      const responseText = response.text || "죄송합니다. 답변을 생성할 수 없습니다.";
      setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "시스템 연결이 지연되고 있습니다. 잠시 후 다시 시도해주세요." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <section id="proposal-ai" className="relative z-10 py-24 px-4 w-full max-w-7xl mx-auto scroll-mt-24">
      <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-stretch">
        
        {/* Left Side: Visual & Intro (Centered Text) */}
        <div className="lg:w-2/5 flex flex-col justify-center items-center text-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyber-500/10 border border-cyber-500/30 text-cyber-400 text-sm font-bold mb-8 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Cpu className="w-4 h-4 animate-pulse" />
              AI CONSULTING PARTNER
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-black text-white mb-8 leading-tight drop-shadow-2xl break-keep">
              <span className="block whitespace-nowrap mb-2">2026년 조직문화 혁신,</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-400 to-cyber-purple block">
                보여주기식이 아닌<br />
                실질적 변화를 제안합니다
              </span>
            </h2>
            
            <p className="text-slate-300 text-xl font-light leading-relaxed mb-10 break-keep max-w-md mx-auto">
              <strong className="text-white font-bold">"화려한 행사보다 중요한 것은 진정성입니다."</strong><br/><br/>
              데이터와 AI 기술을 도구 삼아,<br/>
              가장 인간적이고 투명한 조직 문화를 만드는<br/>
              여정에 든든한 파트너로 동행하겠습니다.
            </p>

            <div className="space-y-4 mb-10 text-left bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
              {[
                "2026년형 AI 딜레마 롤플레잉",
                "데이터 기반 청렴 골든벨 (Quiz)",
                "조직문화 정밀 진단 & 솔루션"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-200 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-cyber-accent shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <a 
              href="https://blog.naver.com/yszoo1467/224151733416"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-2xl font-bold text-lg transition-all hover:scale-105 hover:shadow-xl hover:border-cyber-500/50 w-full sm:w-auto justify-center"
            >
              <FileText className="w-5 h-5 text-cyber-400" />
              <span>2026년형 제안서 보기</span>
              <ExternalLink className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>

        {/* Right Side: Chat Interface */}
        <div className="lg:w-3/5 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-[700px] bg-[#0a0a12] border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Chat Header */}
            <div className="bg-[#13132b] p-6 border-b border-slate-700 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyber-600 to-cyber-purple flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                    <Bot className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-[3px] border-[#13132b]"></div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Ethics-Core AI Agent</h3>
                  <p className="text-cyber-400 text-xs font-mono tracking-wide">2026 VER. POWERED BY GEMINI PRO</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-900/50 border border-cyber-500/30">
                  <span className="w-2 h-2 rounded-full bg-cyber-accent animate-pulse"></span>
                  <span className="text-xs text-cyber-accent font-bold">Online</span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-grow p-6 overflow-y-auto space-y-6 custom-scrollbar bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a12] to-[#0a0a12]">
              {messages.map((msg, idx) => {
                const isWelcome = idx === 0;
                return (
                    <div key={idx} className={`flex ${isWelcome ? 'justify-center' : (msg.role === 'user' ? 'justify-end' : 'justify-start')}`}>
                    <div 
                        className={`
                            p-6 rounded-2xl text-base md:text-lg leading-relaxed shadow-lg backdrop-blur-sm break-keep
                            ${isWelcome 
                                ? 'w-full bg-slate-800/60 border border-slate-700/50 text-slate-200 text-center' 
                                : (msg.role === 'user' 
                                    ? 'max-w-[85%] bg-cyber-600 text-white rounded-tr-none' 
                                    : 'max-w-[85%] bg-slate-800/80 border border-slate-700 text-slate-200 rounded-tl-none')
                            }
                        `}
                    >
                        {msg.role === 'ai' && (
                            <div className={`text-xs font-bold text-cyber-400 mb-2 flex items-center gap-1 uppercase tracking-wider ${isWelcome ? 'justify-center' : ''}`}>
                                <Cpu className="w-3 h-3" /> {isWelcome ? 'Ethics-CoreAI Welcome Message' : 'Ethics-CoreAI Response'}
                            </div>
                        )}
                        <div className="whitespace-pre-wrap markdown-body">{msg.text}</div>
                    </div>
                    </div>
                );
              })}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-cyber-400 rounded-full animate-bounce" />
                    <div className="w-2.5 h-2.5 bg-cyber-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2.5 h-2.5 bg-cyber-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Suggested Questions (Marquee) */}
            <div className="relative w-full bg-[#0a0a12] border-t border-slate-800 py-4 overflow-hidden group">
                {/* Gradient Masks */}
                <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0a0a12] to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0a0a12] to-transparent z-10 pointer-events-none" />
                
                {/* Rolling Content (Duplicated for seamless loop) */}
                <div className="flex gap-3 w-max animate-marquee group-hover:[animation-play-state:paused]">
                    {[...SUGGESTED_QUESTIONS, ...SUGGESTED_QUESTIONS].map((q, i) => (
                        <button
                            key={i}
                            onClick={() => handleSend(q)}
                            className="whitespace-nowrap px-6 py-2.5 rounded-full bg-slate-800 border border-slate-600 text-slate-300 text-sm font-medium hover:bg-cyber-600 hover:text-white hover:border-cyber-400 transition-all shadow-md active:scale-95"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            </div>

            {/* Input Area */}
            <div className="p-5 bg-[#0a0a12] border-t border-slate-800 z-10 relative">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="2026년형 커리큘럼, 견적, 일정 등 무엇이든 물어보세요..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-6 py-5 pr-16 text-white text-lg placeholder:text-slate-500 focus:outline-none focus:border-cyber-500 transition-colors shadow-inner"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-cyber-600 rounded-xl text-white hover:bg-cyber-500 disabled:opacity-50 disabled:hover:bg-cyber-600 transition-colors shadow-lg"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProposalChatbot;
