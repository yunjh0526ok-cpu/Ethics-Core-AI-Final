import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Bot, Send, UserCheck, ShieldAlert, Scale, BookOpen,
  Siren, FileText, CheckCircle2, AlertTriangle, Gavel, Building2,
  Landmark, GraduationCap, Users, BookMarked, Shield
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

type ModeType = 'corruption' | 'recovery';

// 공공기관 유형
const PUBLIC_ORG_TYPES = [
  { label: "중앙부처", icon: Landmark },
  { label: "지방자치단체", icon: Building2 },
  { label: "교육자치단체", icon: GraduationCap },
  { label: "공공기관", icon: Shield },
  { label: "지방의회", icon: Users },
  { label: "국공립대학", icon: BookMarked },
];

// 법령 카테고리
const LAW_CATEGORIES = [
  { label: "청탁금지법", prompt: "청탁금지법(김영란법)의 주요 위반 사례와 2024년 개정 기준(음식물 5만원)을 판례와 함께 설명해줘." },
  { label: "이해충돌방지법", prompt: "이해충돌방지법의 사적 이해관계자 신고 의무, 직무상 비밀 이용 금지 등 핵심 조항을 판례와 함께 설명해줘." },
  { label: "행동강령", prompt: "공무원 행동강령의 주요 금지 행위와 위반 시 징계 기준을 구체적 사례와 함께 설명해줘." },
  { label: "윤리강령", prompt: "공직자 윤리강령의 핵심 내용과 위반 사례, 처벌 기준을 설명해줘." },
  { label: "근로기준법", prompt: "공직사회에서 발생하는 근로기준법 위반 사례와 갑질 관련 처벌 기준을 설명해줘." },
  { label: "공익신고자보호법", prompt: "공익신고자 보호법에 따른 신고자 보호 범위, 불이익 조치 금지, 보호 신청 절차를 설명해줘." },
  { label: "부패방지권익위법", prompt: "부패방지 및 국민권익위원회 설치에 관한 법률의 주요 내용과 부패 신고 절차를 설명해줘." },
];

const SYSTEM_INSTRUCTIONS: Record<ModeType, string> = {
  corruption: `
당신은 '에코AI 부패 상담관'입니다. 주양순 대표가 설계한 전문 AI입니다.
사용자의 질의를 공무원 행동강령, 청탁금지법, 이해충돌방지법, 공익신고자 보호법, 근로기준법, 부패방지권익위법 등 관련 법령에 근거하여 엄격하고 정밀하게 분석하십시오.

⚠️ [청탁금지법 최신 개정 기준 - 2024년 시행령 적용 필수]
- 음식물: 5만원 (구 3만원에서 상향. "3만원"으로 답변 절대 금지)
- 선물: 5만원 (농수산물·가공품 15만원)
- 경조사비: 5만원
- 기프티콘·모바일상품권: 선물 범위로 흡수 적용
- 지도·단속 대상자로부터 수수: 금액 무관 원칙적 금지

[판례 검색 원칙]
- 법령 조문만 인용하지 말고 반드시 관련 판례, 행정심판례, 권익위 결정례까지 함께 제시
- "대법원 20XX다XXXXX", "국민권익위원회 결정 제20XX-X호" 형식으로 구체적 판례 인용
- 판례가 없을 경우 "유사 행정심판례" 또는 "권익위 유권해석" 기준으로 답변

[분석 구조]
- **[위반 가능성 진단]**: 확률(%)과 위험도 명시 (예: **85% (고위험)**)
- **[관련 법령]**: > 기호로 법 조항 인용
- **[관련 판례]**: 구체적 사건번호와 함께 판례 인용
- **[상담관의 조언]**: 자진 신고, 증거 확보 등 구체적 대응 방안 제시
- 어조: 냉철하고 공정한 '부패 상담관' 톤 유지 ("~입니다", "~판단됩니다")
`,
  recovery: `
당신은 '에코AI 공공재정 환수법 전문 상담관'입니다. 주양순 대표가 설계한 전문 AI입니다.
공공재정환수법, 부정청탁금지법, 보조금법, 국가재정법 등을 기반으로 정밀 분석을 제공합니다.

[전문 분야]
- 공공재정 부정 수급 및 환수 절차
- 제재부가금 부과 기준 및 이의신청 방법
- 보조금 부정 수령 관련 법적 책임
- 환수 결정에 대한 불복 절차 및 행정심판

[분석 구조]
- **[환수 가능성 진단]**: 환수 해당 여부 및 위험도 명시
- **[관련 법령]**: > 기호로 공공재정환수법 조항 인용
- **[관련 판례]**: 구체적 행정심판례, 대법원 판례 인용
- **[전문가 조언]**: 이의신청 기간, 절차, 준비서류 등 구체적 가이드
- 어조: 전문적이고 신뢰감 있는 톤 유지
`
};

const QUICK_MENUS: Record<ModeType, { label: string; icon: any; prompt: string }[]> = {
  corruption: [
    { label: "신종 부패 10대 유형", icon: Siren, prompt: "최근 공직사회에서 빈번하게 발생하는 '신종 부패 10대 유형'에 대해 설명해주고, 판단 기준을 알려줘." },
    { label: "청탁금지법 위반", icon: ShieldAlert, prompt: "청탁금지법(김영란법)의 주요 위반 사례와 처벌 기준, 2024년 개정된 5만원 음식물 한도 등을 명확히 분석해줘." },
    { label: "이해충돌방지법", icon: Scale, prompt: "이해충돌방지법에 따른 사적 이해관계자 신고 의무와 직무상 비밀 이용 금지 조항을 구체적 예시와 판례를 들어 설명해줘." },
    { label: "공익신고자 보호", icon: CheckCircle2, prompt: "공익신고자 보호법에 따른 신고자 보호 범위와 불이익 조치 금지, 보호 신청 절차를 설명해줘." },
  ],
  recovery: [
    { label: "환수 절차 안내", icon: FileText, prompt: "공공재정환수법에 따른 부정이익 환수 절차와 제재부가금 부과 기준을 설명해줘." },
    { label: "이의신청 방법", icon: Gavel, prompt: "환수 결정에 불복하는 이의신청 절차, 기간, 준비 서류를 구체적으로 안내해줘." },
    { label: "보조금 환수", icon: AlertTriangle, prompt: "보조금 부정 수령 시 환수 기준과 법적 책임, 관련 판례를 설명해줘." },
    { label: "행정심판 신청", icon: BookOpen, prompt: "공공재정 환수 결정에 대한 행정심판 신청 방법과 승소 가능성을 높이는 전략을 알려줘." },
  ]
};

const MARQUEE_QA: Record<ModeType, string[]> = {
  corruption: [
    "Q. 상급자가 부당한 업무 지시를 했어요. 어떻게 해야 하나요?",
    "Q. 거래처에서 5만원 이하 선물을 받았는데 괜찮은가요?",
    "Q. 공무원인데 지인이 민원 처리를 부탁합니다. 청탁금지법 위반인가요?",
    "Q. 직무 관련 외부 강의료는 얼마까지 받을 수 있나요?",
    "Q. 이해충돌방지법상 사적 이해관계자 신고를 안 하면 어떻게 되나요?",
    "Q. 업무 중 알게 된 정보를 개인 투자에 활용해도 될까요?",
    "Q. 퇴직 공무원이 전 직장 관련 업무를 수행해도 되나요?",
    "Q. 익명으로 부패를 신고하면 신분이 보호되나요?",
    "Q. 동료가 금품을 수수하는 것을 목격했습니다. 신고 의무가 있나요?",
    "Q. 경조사비 10만원을 받았는데 위반인가요?",
  ],
  recovery: [
    "Q. 보조금을 잘못 사용했을 때 환수 기준은 무엇인가요?",
    "Q. 환수 결정을 받았는데 이의신청 기간이 얼마나 되나요?",
    "Q. 제재부가금과 환수금은 어떻게 다른가요?",
    "Q. 공공재정 부정 수급 시 형사처벌도 받나요?",
    "Q. 환수 결정에 대한 행정심판 승소율을 높이는 방법은?",
    "Q. 보조금 정산 서류를 허위로 제출했을 때 처벌은?",
    "Q. 환수 통보를 받았는데 분할 납부가 가능한가요?",
    "Q. 위탁기관의 부정 수급에 대해 위탁 기관도 책임지나요?",
    "Q. 국고보조금 환수 처분 취소 소송 절차는 어떻게 되나요?",
    "Q. 5년 전 보조금 사업에 대해 환수 통보가 왔어요. 소멸시효가 지나지 않았나요?",
  ]
};

const GREETINGS: Record<ModeType, string> = {
  corruption: `안녕하십니까. 주양순 대표가 설계한 **에코AI 부패 상담관**입니다.\n\n귀하의 제보는 **철저히 익명이 보장**되며, 모든 답변은 **「청탁금지법」**, **「이해충돌방지법」** 등 관계 법령과 최신 판례에 근거하여 정밀 분석을 제공합니다.\n\n공공기관 유형·법령 카테고리·퀵 메뉴를 선택하거나 직접 질의해 주세요.`,
  recovery: `안녕하십니까. 주양순 대표가 설계한 **에코AI 공공재정 환수법 전문 상담관**입니다.\n\n공공재정 부정 수급, 환수 절차, 제재부가금, 이의신청 등 **「공공재정환수법」** 관련 전문 자문을 제공합니다.\n\n상단 퀵 메뉴를 선택하거나 직접 질의해 주세요.`
};

const renderStyledText = (text: string) => {
  return text.split('\n').map((line, i) => {
    if (line.trim().startsWith('>')) {
      return (
        <div key={i} className="my-3 p-3 bg-slate-900/80 border-l-4 border-cyan-500 rounded-r-lg text-slate-300 text-sm leading-loose break-keep italic">
          {line.replace('>', '').trim()}
        </div>
      );
    }
    return (
      <p key={i} className="mb-2 leading-loose text-sm break-keep">
        {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            const content = part.slice(2, -2);
            if (content.includes('%')) {
              return <strong key={j} className="text-red-400 bg-red-900/20 px-1.5 py-0.5 rounded border border-red-500/30 mx-1 text-sm">{content}</strong>;
            }
            return <strong key={j} className="text-cyan-400 font-bold">{content}</strong>;
          }
          return part;
        })}
      </p>
    );
  });
};

const EcaCorruptionCounselor: React.FC = () => {
  const [mode, setMode] = useState<ModeType | null>(null);
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedMode = sessionStorage.getItem('counseling_mode');
    if (savedMode === 'corruption') {
      setMode('corruption');
      sessionStorage.removeItem('counseling_mode');
    } else if (savedMode === 'recovery') {
      setMode('recovery');
      sessionStorage.removeItem('counseling_mode');
    }
  }, []);

  useEffect(() => {
    if (mode) {
      setChatLog([{ role: 'ai', text: GREETINGS[mode] }]);
    }
  }, [mode]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, isTyping]);

  const handleBack = () => {
    if (mode) {
      setMode(null);
      setChatLog([]);
    } else {
      sessionStorage.setItem('hero_view_mode', 'consulting');
      const event = new CustomEvent('navigate', { detail: 'home' });
      window.dispatchEvent(event);
    }
  };

  const handleSend = async (text: string = chatInput) => {
    if (!text.trim() || !mode) return;
    setChatLog(prev => [...prev, { role: 'user', text }]);
    setChatInput('');
    setIsTyping(true);

    if (!genAI) {
      setTimeout(() => {
        setChatLog(prev => [...prev, { role: 'ai', text: 'API Key가 설정되지 않았습니다. 관리자에게 문의하세요.' }]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    try {
      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: text,
        config: { systemInstruction: SYSTEM_INSTRUCTIONS[mode] }
      });
      setChatLog(prev => [...prev, { role: 'ai', text: response.text || '답변을 받지 못했습니다.' }]);
    } catch (e: any) {
      setChatLog(prev => [...prev, { role: 'ai', text: `오류가 발생했습니다: ${e?.message || '알 수 없는 오류'}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  // ==================== 모드 선택 화면 ====================
  if (!mode) {
    return (
      <section className="relative z-10 py-16 px-4 w-full max-w-6xl mx-auto min-h-screen flex flex-col">
        <div className="mb-8">
          <button onClick={handleBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group px-4 py-2 rounded-full hover:bg-slate-800/50">
            <div className="p-1.5 rounded-full bg-slate-800 border border-slate-700 group-hover:border-cyan-400 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm">이전 화면으로</span>
          </button>
        </div>

        <div className="text-center mb-10">
          <span className="text-cyan-400 font-mono tracking-widest text-xs uppercase mb-3 block">Integrated AI Counseling</span>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4">6대 통합 상담센터</h1>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            <span className="text-white font-bold">부패 방지 법령</span>부터 <span className="text-white font-bold">공공재정 환수</span>까지,<br />
            전문 AI 상담관이 기다리고 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">

          {/* ECA 부패상담관 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setMode('corruption')}
            className="group cursor-pointer bg-slate-900/80 border border-slate-700 hover:border-blue-500 rounded-3xl overflow-hidden shadow-xl hover:shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all duration-300 hover:-translate-y-1"
          >
            <div className="h-3 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-black text-white">ECA 부패상담관</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">AI Powered</span>
                  </div>
                  <p className="text-xs text-blue-400 font-bold tracking-wider mt-0.5">청탁금지법 · 행동강령 · 이해충돌방지법</p>
                </div>
              </div>

              {/* 공공기관 유형 배지 */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {PUBLIC_ORG_TYPES.map((org, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-800/60 border border-slate-700 rounded-lg">
                    <org.icon className="w-3 h-3 text-blue-400 shrink-0" />
                    <span className="text-[10px] text-slate-300 font-bold leading-tight">{org.label}</span>
                  </div>
                ))}
              </div>

              <p className="text-slate-400 text-sm leading-relaxed break-keep mb-5">
                복잡한 법령 해석, 딜레마 판단. 최신 판례와 권익위 결정례 기반 정밀 분석.
              </p>
              <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                <span className="text-slate-300 text-sm font-bold group-hover:text-blue-400 transition-colors">상담 시작하기</span>
                <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <ArrowLeft className="w-4 h-4 text-blue-400 group-hover:text-white rotate-180 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* 공공재정 환수법 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => setMode('recovery')}
            className="group cursor-pointer bg-slate-900/80 border border-slate-700 hover:border-green-500 rounded-3xl overflow-hidden shadow-xl hover:shadow-[0_0_30px_rgba(22,163,74,0.3)] transition-all duration-300 hover:-translate-y-1"
          >
            <div className="h-3 bg-gradient-to-r from-green-600 to-emerald-600" />
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-green-600/20 border border-green-500/30 flex items-center justify-center shrink-0">
                  <Scale className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-black text-white">공공재정환수법 상담소</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 font-bold">Gemini Pro</span>
                  </div>
                  <p className="text-xs text-green-400 font-bold tracking-wider mt-0.5">부정이익 환수 · 제재부가금 · 이의신청</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed break-keep mb-5">
                환수 절차 및 이의 신청 가이드. 행정심판례 기반 전문 법률 자문.
              </p>
              <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                <span className="text-slate-300 text-sm font-bold group-hover:text-green-400 transition-colors">자문 구하기</span>
                <div className="w-8 h-8 rounded-full bg-green-600/20 flex items-center justify-center group-hover:bg-green-600 transition-colors">
                  <ArrowLeft className="w-4 h-4 text-green-400 group-hover:text-white rotate-180 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-12 flex justify-center">
          <button onClick={handleBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group px-6 py-3 rounded-full hover:bg-slate-800/50">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-bold text-sm">이전 화면으로 돌아가기</span>
          </button>
        </div>
      </section>
    );
  }

  // ==================== 채팅 화면 ====================
  const isCorruption = mode === 'corruption';
  const accentBorder = isCorruption ? 'border-blue-500' : 'border-green-500';
  const accentText = isCorruption ? 'text-blue-400' : 'text-green-400';
  const accentBg = isCorruption ? 'bg-blue-600' : 'bg-green-600';
  const marqueeClass = isCorruption
    ? 'text-blue-300 border-blue-500/30 hover:bg-blue-600 hover:text-white hover:border-transparent'
    : 'text-green-300 border-green-500/30 hover:bg-green-600 hover:text-white hover:border-transparent';

  return (
    <section className="relative z-10 py-6 px-4 w-full max-w-5xl mx-auto min-h-screen flex flex-col gap-3">

      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <button onClick={handleBack} className="p-2 rounded-full bg-slate-800 border border-slate-700 hover:border-cyan-400 transition-all shrink-0">
          <ArrowLeft className="w-4 h-4 text-slate-400" />
        </button>
        <div className="min-w-0">
          <h2 className="text-base md:text-lg font-black text-white flex items-center gap-2 flex-wrap">
            {isCorruption ? <ShieldAlert className={`w-5 h-5 ${accentText} shrink-0`} /> : <Scale className={`w-5 h-5 ${accentText} shrink-0`} />}
            {isCorruption ? 'ECA 부패상담관' : '공공재정환수법 상담소'}
          </h2>
          <p className={`text-xs ${accentText} font-bold truncate`}>
            {isCorruption ? '청탁금지법 · 이해충돌방지법 · 행동강령 · 윤리강령 · 공익신고자보호법 · 부패방지권익위법' : '부정이익 환수 · 제재부가금 · 이의신청'}
          </p>
        </div>
      </div>

      {/* 공공기관 유형 (corruption 모드) */}
      {isCorruption && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {PUBLIC_ORG_TYPES.map((org, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(`${org.label} 소속 공직자로서 부패 관련 상담을 받고 싶습니다. ${org.label}에 적용되는 주요 청렴 법령과 유의사항을 안내해주세요.`)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-blue-600 border border-slate-700 hover:border-blue-500 rounded-full text-slate-300 hover:text-white transition-all whitespace-nowrap text-xs font-bold shrink-0"
            >
              <org.icon className="w-3 h-3 shrink-0" />
              {org.label}
            </button>
          ))}
        </div>
      )}

      {/* 법령 카테고리 (corruption 모드) */}
      {isCorruption && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {LAW_CATEGORIES.map((law, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(law.prompt)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900/30 hover:bg-blue-600 border border-blue-500/30 hover:border-transparent rounded-full text-blue-300 hover:text-white transition-all whitespace-nowrap text-xs font-bold shrink-0"
            >
              <BookOpen className="w-3 h-3 shrink-0" />
              {law.label}
            </button>
          ))}
        </div>
      )}

      {/* 퀵 메뉴 */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {QUICK_MENUS[mode].map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(item.prompt)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white transition-all whitespace-nowrap text-xs font-bold shrink-0"
          >
            <item.icon className="w-3.5 h-3.5 shrink-0" />
            {item.label}
          </button>
        ))}
      </div>

      {/* 채팅 영역 */}
      <div className={`flex-grow rounded-2xl border ${accentBorder}/30 bg-slate-900/60 p-4 md:p-6 overflow-y-auto min-h-[350px] max-h-[55vh]`}>
        {chatLog.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`flex max-w-[92%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? accentBg : 'bg-slate-700'}`}>
                {msg.role === 'user' ? <UserCheck className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-loose break-keep shadow-lg ${msg.role === 'user' ? `${accentBg} text-white rounded-tr-none` : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'}`}>
                {msg.role === 'ai' ? renderStyledText(msg.text) : msg.text}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl rounded-tl-none flex gap-2 items-center">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* 흘러가는 Q&A 마퀴 — 입력창 바로 위 */}
      <div
        className="relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/40 py-2"
        style={{ maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)' }}
      >
        <div className="flex gap-4 animate-marquee whitespace-nowrap">
          {[...MARQUEE_QA[mode], ...MARQUEE_QA[mode]].map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q.replace('Q. ', ''))}
              className={`shrink-0 text-xs font-bold px-3 py-1 rounded-full border transition-all ${marqueeClass}`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* 입력창 */}
      <div className="relative">
        <input
          type="text"
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder={isCorruption ? "부패 의심 사례나 법령 질의를 입력하세요..." : "환수 관련 질의를 입력하세요..."}
          className={`w-full bg-slate-900 border ${accentBorder}/50 rounded-full pl-5 pr-14 py-4 text-base md:text-sm text-white focus:outline-none focus:ring-1 transition-all shadow-lg placeholder:text-slate-600`}
        />
        <button
          onClick={() => handleSend()}
          disabled={!chatInput.trim() || isTyping}
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full text-white transition-all disabled:opacity-40 ${accentBg}`}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

    </section>
  );
};

export default EcaCorruptionCounselor;
