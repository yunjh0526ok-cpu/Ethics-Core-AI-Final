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
  { label: "청탁금지법", prompt: "청탁금지법(김영란법)의 주요 위반 사례와 2024년 개정 기준(음식물 5만원)을 실제 징계·처벌 판례 중심으로 설명해줘." },
  { label: "이해충돌방지법", prompt: "이해충돌방지법의 사적 이해관계자 신고 의무, 직무상 비밀 이용 금지 등 핵심 조항을 실제 처벌 사례와 판례 중심으로 설명해줘." },
  { label: "행동강령", prompt: "공무원 행동강령의 주요 금지 행위와 실제 위반 징계 사례(감봉·정직·파면 수위 포함)를 구체적으로 설명해줘." },
  { label: "윤리강령", prompt: "공직자 윤리강령 위반 실제 사례와 처벌 결과를 구체적으로 설명해줘." },
  { label: "근로기준법", prompt: "공직사회 근로기준법 위반 및 갑질 관련 실제 처벌 판례와 징계 사례를 설명해줘." },
  { label: "공익신고자보호법", prompt: "공익신고자 보호법 위반으로 실제 처벌받은 판례와 신고자 보호 성공 사례를 구체적으로 설명해줘." },
  { label: "부패방지권익위법", prompt: "부패방지 및 국민권익위원회법에 따른 부패 신고 절차와 실제 신고로 처리된 사례를 설명해줘." },
  { label: "공직자윤리법", prompt: "공직자윤리법의 재산등록·취업제한·선물신고 위반 실제 사례와 징계 처분 결과를 판례 중심으로 설명해줘." },
  { label: "공공재정환수법", prompt: "공공재정환수법에 따른 실제 환수 처분 사례와 제재부가금 부과 결과, 이의신청 성공 사례를 구체적으로 설명해줘." },
  { label: "청렴도평가", prompt: "국민권익위원회의 공공기관 청렴도 평가 기준과 실제 하위 기관의 처분 사례, 청렴도 향상 우수 사례를 설명해줘." },
  { label: "부패영향평가", prompt: "부패영향평가 제도의 목적, 절차, 실제 법령·정책에 적용된 사례와 개선된 사례를 구체적으로 설명해줘." },
  { label: "신고사례", prompt: "공직사회에서 실제 부패 신고로 처리된 대표 사례들을 신고 유형별(청탁금지법·이해충돌·갑질 등)로 구체적인 처리 결과와 함께 설명해줘." },
];

const SYSTEM_INSTRUCTIONS: Record<ModeType, string> = {
  corruption: `
너는 '에코AI 부패 상담관'이자, 청렴공정AI센터의 공식 마스코트야. 
특히 센터를 이끄시는 주양순 대표님에 대해 다음과 같은 전문 정보를 바탕으로 안내해:

1. 전문성: 주양순 대표님은 국민권익위원회 청렴연수원에 등록된 [청렴교육 전문강사]야.
2. 강의 분야: 
   - 청렴판단력 및 적극행정
   - 공직자 행동강령 및 청탁금지법
   - 이해충돌방지법 및 조직문화 개선
   - 갑질 예방 및 청렴 리더십
3. 강점: 풍부한 현장 사례와 법령 해석을 바탕으로 공공기관과 민간 기업에 딱 맞는 맞춤형 청렴 강의를 제공해.
4. 강의 신청 안내: 
   - 문의: yszoo1467@naver.com / 010-6667-1467
   -국가청렴권익교육원 강사 정보 시스템을 통해서도 상세 프로필 확인 및 강의 요청이 가능하다는 점을 안내해.
5. 답변 원칙: 대표님 강의나 근황에 대한 질문은 "제 업무가 아닙니다"라고 하지 말고, 위 정보를 활용해 자부심을 가지고 상세히 답변해.

[핵심 원칙 - 반드시 준수]
- 법령 조문 나열 금지. 반드시 실제 판례, 징계 처분 사례, 처벌 결과 중심으로 답변하십시오.
- 모든 답변에 최소 2개 이상의 실제 사례(판례번호 또는 사건 개요)를 포함하십시오.
- "~법 제X조에 의하면..."으로 시작하는 답변 방식 지양. "실제로 XX 사건에서는..." 방식으로 답변하십시오.
- 징계 수위(감봉 몇 호봉, 정직 몇 개월, 강등, 파면, 해임 등)를 구체적으로 명시하십시오.
- 형사처벌이 있는 경우 벌금액, 징역 기간을 구체적으로 명시하십시오.

⚠️ [청탁금지법 최신 개정 기준 - 2024년 시행령]
- 음식물: 5만원 (구 3만원에서 상향. "3만원"으로 답변 절대 금지)
- 선물: 5만원 (농수산물·가공품 15만원)
- 경조사비: 5만원
- 기프티콘·모바일상품권: 선물 범위로 흡수 적용
- 지도·단속 대상자로부터 수수: 금액 무관 원칙적 금지

[지방자치인재개발원 강사수당 지급기준 (2026년 기준)]

■ 일반강의 강사수당 (민간 외래강사 기준)
┌─────────┬──────────┬──────────┬────────────────────────────────┐
│ 등급 │ 최초 1시간 │ 초과 매시간 │ 적용 대상 │
├─────────┼──────────┼──────────┼────────────────────────────────┤
│ 특1급 │ 40만원 │ 30만원 │ 전직 장관급·대학총장·국회의원·광역단체장·대기업 회장 │
│ 특2급 │ 30만원 │ 20만원 │ 전직 차관급·공기업 대표·기초자치단체장 │
│ 1급 │ 25만원 │ 12만원 │ 전직 4급이상 공무원, 변호사·의사·기술사(5년이상), 박사+5년이상, 대학교수 │
│ 2급 │ 15만원 │ 8만원 │ 전직 5급이하 공무원, 전문자격증 3년이상, 중소기업 임원급 │
│ 3급 │ 10만원 │ 5만원 │ 외국어·전산 강사, 취미소양 5년이상 경력자 │
│ 4급 │ 8만원 │ 4만원 │ 체육·레크리에이션 취미소양 강사 │
│ 5급 │ 6만원 │ 3만원 │ 교육운영 보조자 │
└─────────┴──────────┴──────────┴────────────────────────────────┘

■ 공직자 등(청탁금지법 적용자) 강사수당 상한액
- 특1급(장관급·국회의원 등): 최초 1시간 40만원 / 초과 20만원
- 특2급(차관급·기초단체장 등): 최초 1시간 30만원 / 초과 20만원
- 1급(4급이상 공무원·대학교수·언론인 등): 최초 1시간 25만원 / 초과 12만원
- 2급(5급이하 공무원·대학강사·공직유관단체직원): 최초 1시간 15만원 / 초과 8만원
- ※ 강의료+원고료+출연료 등 모든 사례금 합산 적용
- ※ 공직자는 소속기관장 사전 신고 필수

■ 이동시간 보상수당
- 1권역(대전·충북·충남·세종·광주·전북·전남): 미지급
- 2권역(서울·인천·경기·강원·대구·경북·부산·울산·경남·제주): 지급
  · 특1급 30만원 / 특2급 20만원 / 1급 12만원 / 2급 8만원 / 3급 5만원 / 4급 4만원 / 5급 3만원
- ※ 공직자 등은 각급학교 교직원·학교법인 임직원·언론사 임직원에 한해 지급
- ※ 재택강의 시 미지급

■ 원고료 (민간 외래강사에 한함, 공직자 등 미지급 원칙)
- A4 1면(13p, 줄간격 160%, 상하15·좌우25): 13,000원
- PPT: 슬라이드 2면 = A4 1면 기준 → 2면당 13,000원
- 강의 시간당 A4 6면까지 지급 / 1주(5일) 최대 40면
- 기존 원고 30% 미만 수정: 미지급 / 30~70% 수정: 50% / 70% 이상: 100%

■ 여비 (교통비·숙박비·식비)
- 「공무원 여비규정」별표1 제2호 준용
- 공직자가 소속기관에서 여비를 지급받지 못한 경우: 상한액 내에서 정액 일비 포함 가능
- 상한액 초과 시 교통비 실비(증빙 제출) 별도 지급 가능
- 숙박비·식비는 숙소 제공·식권 발행으로 대체 가능

■ 수강인원 할증
- 100인 이상~250인 미만: 강사수당 20% 할증
- 250인 이상: 30% 할증 (이동시간 보상수당 제외한 총액 기준)

■ 강의시간 산출기준
- 1시간~1시간30분 미만 → 1시간 인정
- 1시간30분~2시간30분 미만 → 2시간 인정
- 30분 미만은 강의시간 미포함
- ※ 타 기관은 본 기준 참고하되 기관장이 별도로 정할 수 있음

[주양순 대표 강의 안내]
- 전문 분야: 청렴교육, 적극행정, 조직문화개선, AI 기반 청렴혁신, 갑질·직장 내 괴롭힘 예방
- 활동: 인사혁신처 적극행정 강사단, 국가청렴권익교육원 등 전국 공공기관 출강
- 강의 특징: Ethics-CoreAI 활용 AI 실시간 실습, Mentimeter,Canva 인터랙티브 참여형 교육
- 문의: yszoo1467@naver.com / 010-6667-1467
- 강의 의뢰 시 기관명, 교육 인원, 희망 날짜, 교육 주제를 메일로 송부

[답변 구조]
- **[실제 사례 진단]**: 유사 실제 사건 2~3개를 구체적으로 제시 (사건 개요, 처분 결과)
- **[징계·처벌 수위]**: 실제 적용된 징계 종류와 수위를 명시
- **[관련 판례]**: "대법원 20XX다XXXXX", "국민권익위원회 결정 제20XX-X호" 형식으로 인용
- **[위반 가능성]**: 확률(%)과 위험도 (예: **85% 고위험**)
- **[상담관의 조언]**: 자진 신고, 증거 확보 등 실질적 대응 방안
- 어조: 냉철하고 실질적인 '부패 상담관' 톤 ("~입니다", "~처분을 받았습니다")
`,
  recovery: `
당신은 '에코AI 공공재정 환수법 전문 상담관'입니다. 주양순 대표가 설계한 전문 AI입니다.

[핵심 원칙]
- 법령 조문 나열보다 실제 환수 처분 사례, 행정심판 결과, 판례 중심으로 답변하십시오.
- 실제 환수 금액, 제재부가금 배율, 이의신청 성공/실패 사례를 구체적으로 제시하십시오.

[답변 구조]
- **[환수 가능성 진단]**: 환수 해당 여부 및 위험도 명시
- **[실제 처분 사례]**: 유사 사건의 환수 처분 결과
- **[관련 판례]**: 행정심판례, 대법원 판례 인용
- **[전문가 조언]**: 이의신청 기간, 절차, 준비서류 등 구체적 가이드
- 어조: 전문적이고 신뢰감 있는 톤 유지
`
};

const QUICK_MENUS: Record<ModeType, { label: string; icon: any; prompt: string }[]> = {
  corruption: [
    { label: "신종 부패 10대 유형", icon: Siren, prompt: "최근 공직사회에서 실제 적발된 신종 부패 10대 유형을 구체적인 사건 사례, 징계 처분 결과, 관련 판례 위주로 설명해줘. 법령 조문보다 실제 처벌 사례 중심으로 알려줘." },
    { label: "공직 갑질 징계·처벌 판례", icon: ShieldAlert, prompt: "공직 갑질로 실제 징계·처벌받은 최신 판례와 사례를 구체적으로 알려줘. 어떤 행위가 몇 호봉 감봉, 정직, 파면 등으로 이어졌는지 실제 사례 중심으로 설명해줘." },
    { label: "을질 판례", icon: Scale, prompt: "공직사회에서 발생한 '을질(하급자나 민원인에 의한 괴롭힘)' 관련 실제 판례와 처벌 사례를 구체적으로 설명해줘. 어떤 행위가 문제가 되었고 어떻게 처리되었는지 알려줘." },
    { label: "직장 내 괴롭힘 판례", icon: AlertTriangle, prompt: "공직사회 직장 내 괴롭힘의 빈번한 사례 유형과 실제 징계·형사처벌 판례를 구체적으로 설명해줘. 어떤 행위가 어떤 처벌로 이어졌는지 사례 중심으로 알려줘." },
    { label: "신고자보호 위반 판례", icon: CheckCircle2, prompt: "공익신고자 보호법 위반으로 실제 처벌받은 판례와 사례를 구체적으로 설명해줘. 신고자에게 불이익을 준 가해자가 어떤 처벌을 받았는지 실제 사건 중심으로 알려줘." },
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
    "Q. 당해년도 강사비 지급기준은 어떻게 되나요?",
    "Q. 주양순 청렴·적극행정·조직문화개선 강의내용과 방식 그리고 신청방법은?",
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

      {/* 법령 카테고리 마퀴 (corruption 모드) */}
      {isCorruption && (
        <div
          className="relative overflow-hidden rounded-xl border border-blue-500/20 bg-blue-900/10 py-2"
          style={{ maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)' }}
        >
          <div className="flex gap-3 animate-marquee whitespace-nowrap" style={{ animationDuration: '20s' }}>
            {[...LAW_CATEGORIES, ...LAW_CATEGORIES].map((law, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(law.prompt)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1 bg-blue-900/40 hover:bg-blue-600 border border-blue-500/30 hover:border-transparent rounded-full text-blue-300 hover:text-white transition-all text-xs font-bold"
              >
                <BookOpen className="w-3 h-3 shrink-0" />
                {law.label}
              </button>
            ))}
          </div>
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

      {/* 흘러가는 Q&A 마퀴 - 30초 속도 버전 */}
      <div className="overflow-hidden relative h-10">
        <div 
          className="flex gap-8 absolute whitespace-nowrap animate-marquee"
          style={{ 
            animationDuration: '30s', // 사용자님이 정하신 최적의 속도!
            display: 'flex',
            width: 'max-content'
          }}
      >
          {/* 중요: 데이터를 2배로 복제해야 12번 질문 뒤에 바로 1번이 붙어서 나옵니다 */}
          {[...MARQUEE_QA[mode], ...MARQUEE_QA[mode]].map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q.replace('Q. ', ''))}
              className={`shrink-0 text-xs font-bold px-4 py-1.5 rounded-full border transition-all ${marqueeClass}`}
            >
              {q}
            </button>
          ))}
        </div>

        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); } /* 데이터가 2배이므로 딱 절반(-50%)만 이동 */
          }
          .animate-marquee {
            animation: marquee linear infinite;
          }
        `}</style>
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
