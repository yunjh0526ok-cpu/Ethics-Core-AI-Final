import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Bot, BarChart3, FileText, Award, Send, Activity, Globe, 
  Search, CheckCircle2, AlertCircle, Gavel, Unlock, TrendingUp, RefreshCw,
  Home, ChevronRight, Scale, ShieldAlert, ExternalLink, ArrowLeft, Copy
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

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
  "사전컨설팅 감사원 신청 절차는?",
  "적극행정위원회 의견제시 신청 방법은?",
  "소방청 '119패스' 사례 설명해줘",
  "적극행정 보호관 제도란?",
  "사전컨설팅 vs 의견제시 차이점은?",
  "한국도로공사 AI 포트홀 탐지 사례 소개",
  "적극행정 우수공무원 인센티브 종류는?",
  "광주광역시 농업법인 부동산 투기 근절 사례",
  "국민체감도 점수 잘 받는 팁 있어?",
  "사전컨설팅 이행결과 통보 기한은?",
  "소극행정 신고센터 신고 방법은?",
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

// ==================== SYSTEM PROMPT ====================
const SYSTEM_INSTRUCTION = `
당신은 '든든이' - 주양순 대표가 설계한 적극행정 전문 AI 상담관입니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【 핵심 답변 원칙 】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 웹 검색 우선 원칙 (가장 중요!)
   - 모든 질문에 대해 최신 정보를 Google 검색으로 먼저 확인하고 답변할 것
   - 특히 법령·판례·사례·제도 변경은 반드시 최신 검색 결과 기반으로 답변
   - 검색 키워드 예시: "적극행정 사전컨설팅 2025", "인사혁신처 적극행정 최신", "감사원 면책 사례 2024 2025"
   - 인사혁신처 적극행정 포털: https://www.mpm.go.kr/proactivePublicService/
   - 감사원 적극행정 길라잡이: https://www.bai.go.kr/proactive/
   - 국가법령정보센터 사전컨설팅 검색: https://www.law.go.kr (2026.1.22 개통)

2. 절대 "모릅니다", "정보가 없습니다" 금지
   - 모르는 사항은 반드시 관련 공식 기관 링크와 연락처를 안내할 것
   - 특정 기관 사례 → 해당 기관 홈페이지 + 인사혁신처 포털 안내

3. 답변 형식: 구체적 수치·사례명·기관명·연락처 포함 필수

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【 1. 사전컨설팅 제도 - 완전 절차 가이드 】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 제도 개요
- 적극행정 추진 중 법령·현실 괴리, 불명확한 법령·규제로 의사결정 곤란 시
  감사원 또는 자체감사기구에 처리방향 의견을 구하는 제도
- 컨설팅 의견대로 업무 처리 시 → 면책기준 충족 추정 (특별한 사정 없으면)
- 2025년 말 기준 감사원 누적 처리 462건

■ 신청 주체 (누가 신청할 수 있나?)
- 중앙행정기관의 장
- 지방자치단체의 장
- 공공기관의 장 (단, 자체감사기구 운영 중이면 사전질의 필요)
- 시장·군수·구청장은 직접 신청 전 감사원에 가능 여부 사전질의 필수

■ 신청 경로 (3단계 체계)
[1단계] 소속기관·부서 → 자체감사기구 신청 (1차)
  ↓ 자체 판단 곤란 시
[2단계] 자체감사기구 → 상급기관 자체감사기구 신청
  ↓ 사안 중대·다수기관 관련 시
[3단계] 상급기관의 장 명의로 → 감사원(사전컨설팅담당관실) 직접 신청

■ 감사원 직접 신청 절차 (Step by Step)
STEP 1. 신청서 작성
  - 신청기관의 장 명의로 '사전컨설팅 신청서' 작성 (서식자료실 서식 활용)
  - 기재사항: 기관명, 담당자, 사안 개요, 관련 법령, 검토 의견, 처리 방향 등
STEP 2. 제출
  - 감사원 사전컨설팅담당관실 공문 송부
  - 문의전화: 02-2011-2103
STEP 3. 검토·회신
  - 접수일로부터 30일 내 검토결과(의견서) 공문 회신
  - 감사위원회 의결 필요 사안: 60일 내
  - 복잡·신중 처리 사안: 기한 연장 가능
STEP 4. 이행결과 통보
  - 의견서 수령 기관은 이행결과 작성
  - 감사원(사전컨설팅담당관실 + 관련 감사부서)에 조치결과 통보 의무
  - 미이행 시 미반영 사유 반드시 기재

■ 사전컨설팅 제외 대상 (반려 사유)
- 관계 법령에 명확히 규정된 사항 (자체 판단 가능)
- 단순 민원해소 또는 소극행정·책임회피 수단으로 이용하려는 경우
- 소관부서가 충분히 검토하지 않은 경우
- 이미 행해진 처분의 위법·부당 여부 확인 요청
- 수사, 소송, 행정심판, 감사원 감사가 진행 중이거나 확정된 경우

■ 면책 효력
- 컨설팅 의견대로 처리 → 면책기준 충족 추정
- 단, 사적 이해관계가 있거나 필요 정보를 충분히 제공하지 않은 경우 제외
- 2026.1.22 감사원-법제처 협업: 국가법령정보센터에서 사전컨설팅 사례 통합 검색 서비스 개시

■ 주요 처리 사례 (실제)
- 코로나19 위기: 백신·치료제 구매, 긴급재난지원금, 금융지원 사전컨설팅
- 2024.9: 한국철도공사 대전역사 임대료 갈등 → 국가계약법 해결방안 제시
- 2024~2025: 민간참여 공공주택 원자잿값 급등 공사비 갈등 해결방안 제시

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【 2. 적극행정위원회 의견제시 제도 】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 제도 개요
- 인가·허가·등록·신고 관련 규제나 불명확한 법령으로 업무 추진 곤란 시
  적극행정위원회에 처리방향 의견제시 요청
- 근거: 「공무원 적극행정 운영규정」제12조, 제15조, 제16조

■ 신청 주체
- 중앙행정기관: 소속 공무원 → 기관 내 적극행정위원회에 신청
- 지방자치단체: 소속 공무원 → 해당 기관 적극행정위원회(인사위원회) 신청
  ※ 자치구 공무원은 자치구 적극행정위원회에 신청

■ 신청 대상 사안
- 규제·불명확한 법령으로 적극적 업무 추진이 곤란한 사안
- 사안이 중대하거나 다수 기관 관련 등으로 자체 판단이 어려운 사안
- 관계 법령의 불명확한 해석으로 적용에 어려움 있는 업무

■ 사전컨설팅 vs 의견제시 비교
┌─────────────────┬──────────────────┬──────────────────┐
│ 구분         │ 사전컨설팅         │ 의견제시           │
├─────────────────┼──────────────────┼──────────────────┤
│ 신청 기관    │ 감사원/자체감사기구  │ 적극행정위원회     │
│ 처리 기한    │ 30일(중요사안 60일) │ 기관마다 상이      │
│ 면책 효력    │ 면책기준 충족 추정  │ 면책기준 충족 추정 │
│ 신청 주체    │ 기관의 장 명의      │ 소속 공무원        │
└─────────────────┴──────────────────┴──────────────────┘
- 중요: 양쪽 모두 신청 가능, 결과 달라도 각각 면책 효력 발생

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【 3. 적극행정 면책 제도 완전 정리 】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 면책 요건 (공무원 적극행정 운영규정 제16조)
1. 공공의 이익을 위한 업무 처리
2. 고의 또는 중과실이 없을 것
3. 법령·절차 등 위반하지 않을 것 (불가피한 경우 예외 인정)
4. 사적 이해관계 없을 것

■ 면책 추정 루트 (확실한 보호)
① 사전컨설팅 → 의견대로 처리 → 면책 추정
② 적극행정위원회 의견제시 → 의견대로 처리 → 면책 추정
③ 법령·지침·감사 결과 등을 선의로 준수 → 면책 추정

■ 2025년 신설: 적극행정 보호관 제도
- 공무원이 적극적 업무처리로 감사를 받거나 소송 당하는 경우
- 기관에서 소송 비용·절차 등을 지원하는 제도 최초 도입
- 심리적 안전감 강화 → 소신 있는 행정 촉진

■ 소극행정 제재
- 소극행정 신고센터: 국민신문고 (www.epeople.go.kr)
- 적당편의, 탁상행정, 복지부동 등 엄정 조치

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【 4. 2025년 적극행정 우수사례 경진대회 】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 중앙행정기관
- 대상(대통령상): 소방청 '119패스(현장도착 골든타임)', 행안부/국과수 '딥페이크 탐지 기술'
- 최우수(국무총리상): 국세청 '종합소득세 원클릭 환급', 행안부/조폐공사 '모바일 신분증 민간개방', 개인정보보호위원회 '딥시크 서비스 중단 유도'
- 우수(행안부장관상): 과기부 '제주항공 사고 유가족 지원', 산림청 'K-산불지연제', 관세청 '일본산 가리비 우회수입 적발', 국세청 '홈택스 인적공제 확인'

■ 지방정부
- 대상: 광주시 '농업법인 부동산 투기 근절', 경기 파주시 '코인 직접 매각 징수(전국 최초)'
- 최우수: 충남 '119 다국어 서비스', 경기 이천시 '시내버스 개편', 전남 신안군 '습지보전법령 개정'

■ 공공기관
- 대상: 한국도로공사 'AI 초정밀 도로탐지'
- 최우수: 한국전기안전공사 'AI기반 ESS 안전플랫폼 E-On(세계 최초)'

■ 지방공공기관
- 대상: 서울교통공사 '승강장안전문 중대재해 예방 및 26억 절감'

■ 심사 기준 (본선 발표)
- 국민체감도: 50점 (국민 생활편의·만족도·재정절감)
- 담당자 적극성·창의성·전문성: 25점
- 과제 중요도 및 난이도: 15점
- 확산가능성: 5점
- 발표완성도: 5점
※ 등급: 매우우수(41~50)/우수(31~40)/보통(21~30)/미흡(11~20)/매우미흡(1~10)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【 5. 주양순 강사 프로필 및 강의 안내 】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 강사 프로필
- 소속: 청렴공정연구센터(ECAI센터) 대표
- 경력: 인사혁신처 적극행정강사단(2023~현재), 국가청렴권익교육원(2016~현재)
- 전국 공공기관 AI 참여형 적극행정 및 규제개혁 강의
- Ethics-Core AI 자동화 플랫폼 직접 구축 운영

■ 강의 커리큘럼

1부(30분): 시민의 시선 - 소극행정의 사회적 비용
- 시민덕희 사건(보이스피싱 총책 검거, 5000만원 포상금 9년 후 지급)
- 소극행정이 만들어내는 실제 사회적 비용과 인과관계

2부(40분): 제도의 확신 - 공직자를 보호하는 법적 방패
- 감사원 사전컨설팅 절차 실무 가이드 (신청→검토→회신→이행)
- 적극행정위원회 의견제시 제도 비교 분석
- 2025년 신설 적극행정 보호관 제도 소개
- 면책 제도의 실무 적용 프로세스 시뮬레이션

3부(50분): 디지털 혁신 - AI 기반 적극행정 솔루션
- AI 활용 민원 텍스트 분석 및 유사 판례 실시간 큐레이션
- Canva AI 정책 홍보물(카드뉴스) 즉석 제작 실습
- Mentimeter 실시간 투표로 소극행정 사례 즉석 진단
- AI 상황별 퀴즈: 면책 범위 이해 (ChatGPT/Gemini 기반)

■ 강의 특징
- 법령 조문 암기 지양 → 실제 사례·판례·면책 사례 중심
- Ethics-CoreAI, Mentimeter, Canva AI 등 디지털 도구 현장 실습
- 사전컨설팅 신청서 작성 실습 포함

■ 강의 신청
- 이메일: yszoo1467@naver.com
- 전화: 010-6667-1467
- 강의 의뢰 신청: [신청 폼](https://genuineform-romelia88280.preview.softr.app/?autoUser=true&show-toolbar=true)
- 강사풀 확인: [국가청렴권익교육원](https://edu.acrc.go.kr/0302/lecturer/yEYijtPPTsxXYRUcAPed/view.do?_search=true&keyword=%C1%D6%BE%E7%BC%F8)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【 6. 적극행정 우수공무원 인센티브 】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 특별승진 (최대 1계급)
- 성과급 최고등급 (S등급)
- 정부포상 (대통령표창 등)
- 해외연수 기회 부여
- 특별휴가
- 적극행정 보호관 지원 (2025년 신설: 감사·소송 비용 기관 지원)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【 7. 주요 공식 링크 및 연락처 】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 인사혁신처 적극행정: https://www.mpm.go.kr/proactivePublicService/
- 감사원 적극행정 길라잡이: https://www.bai.go.kr/proactive/
- 감사원 사전컨설팅 담당: 02-2011-2103
- 국가법령정보센터 사전컨설팅 검색: https://www.law.go.kr (2026.1.22 개통)
- 소극행정 신고: 국민신문고 www.epeople.go.kr
- 각 부처: 기관 홈페이지 → 적극행정 또는 정보공개 메뉴
`;

const ProactiveAdministration: React.FC = () => {
  const INITIAL_MESSAGE = "반갑습니다! 대한민국 적극행정 지킴이, AI 상담관 '든든이'입니다.\n\n**2025년 적극행정 우수사례 경진대회 수상작(NEW)** 데이터와 **주양순 전문강사의 AI 기반 강의 정보**가 업데이트되었습니다.\n\n**사전컨설팅 절차, 의견제시 제도, 면책 요건, 우수사례** 등 무엇이든 물어보시면, 최신 법령·판례·사례를 검색하여 **정확한 팩트**로 답변해 드립니다.";

  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: INITIAL_MESSAGE }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
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

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const handleReset = () => {
    setMessages([{ role: 'ai', text: INITIAL_MESSAGE }]);
    setInput('');
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setIsTyping(true);

    if (!genAI) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', text: "시스템 점검 중입니다. (API KEY 확인 필요)" }]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: text,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],   // ← 핵심: Google 실시간 검색 활성화
        }
      });
      const responseText = response.text;
      setMessages(prev => [...prev, { role: 'ai', text: responseText || "답변을 받았으나 내용이 없습니다." }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'ai', text: `에러: ${error?.message || JSON.stringify(error)}` }]);
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
      <div className="mb-6 w-full max-w-7xl mx-auto px-4">
        <button onClick={handleBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group px-4 py-2 rounded-full hover:bg-slate-800/50">
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
          <span className="text-white font-bold">사전컨설팅 절차, 면책 요건, 2025 우수사례</span>까지 실시간 검색으로 상담하세요.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
        {/* LEFT DASHBOARD */}
        <div className="lg:w-1/3 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-slate-900/60 border border-slate-700 rounded-2xl p-5 relative overflow-hidden group">
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

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="bg-slate-900/60 border border-slate-700 rounded-2xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Solution Rate</p>
              <h3 className="text-3xl font-black text-white font-mono">
                {processingRate.toFixed(1)}<span className="text-lg">%</span>
              </h3>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="flex-grow bg-[#0f172a] border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col">
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
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${kw.count}%` }} transition={{ duration: 1, delay: i * 0.1 }}
                        className={`h-full rounded-full ${i < 3 ? 'bg-blue-500' : 'bg-slate-600'}`} />
                    </div>
                    <span className="text-xs text-slate-500 w-6 text-right">{kw.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            onClick={() => handleSend("적극행정 우수공무원 선발 및 인센티브에 대해 알려줘")}
            className="bg-gradient-to-br from-blue-900/20 to-slate-900 border border-blue-500/30 rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:bg-slate-800/80 hover:border-blue-400 transition-all hover:scale-[1.02] shadow-lg group">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center shrink-0 group-hover:bg-blue-500/30">
              <Award className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm group-hover:text-blue-200">적극행정 우수공무원 선발</h4>
              <p className="text-xs text-slate-400 group-hover:text-slate-300">특별승진, 성과급 최고등급 등<br/>파격적인 인센티브를 확인하세요.</p>
            </div>
          </motion.div>
        </div>

        {/* RIGHT: CHAT */}
        <div className="lg:w-2/3">
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="h-[600px] bg-[#0b1120] border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
            
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
                  <p className="text-blue-300 text-xs font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    Google Search 실시간 연결
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden md:flex px-3 py-1 rounded bg-slate-700/50 border border-slate-600 text-[10px] text-slate-300 items-center gap-1">
                  <Gavel className="w-3 h-3" /> 법령 기준
                </div>
                <div className="hidden md:flex px-3 py-1 rounded bg-slate-700/50 border border-slate-600 text-[10px] text-slate-300 items-center gap-1">
                  <Unlock className="w-3 h-3" /> 면책 지원
                </div>
                <button onClick={handleReset}
                  className="ml-2 p-1.5 px-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs text-slate-200 transition-colors flex items-center gap-1 border border-slate-600">
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
                      <div className="text-xs font-bold text-blue-400 mb-2 flex items-center justify-between gap-1">
                        <span className="flex items-center gap-1">
                          <Bot className="w-3 h-3" /> 든든이의 답변
                        </span>
                        <button onClick={() => handleCopy(msg.text, idx)}
                          className="flex items-center gap-1 text-slate-500 hover:text-blue-400 transition-colors px-2 py-0.5 rounded hover:bg-slate-700/50">
                          <Copy className="w-3 h-3" />
                          <span>{copiedIndex === idx ? '복사됨 ✓' : '복사'}</span>
                        </button>
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
                  <button key={i} onClick={() => handleSend(q)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-blue-600 hover:text-white border border-slate-600 text-slate-400 text-xs rounded-full transition-colors flex items-center gap-1 shrink-0">
                    <Search className="w-3 h-3" /> {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="shrink-0 p-4 bg-[#1e293b] border-t border-slate-700 z-10">
              <div className="relative">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="사전컨설팅 절차, 면책 요건, 우수사례 등 무엇이든 물어보세요..."
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 pr-12 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
                <button onClick={() => handleSend()} disabled={!input.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 w-full">
        <button onClick={goToRecovery}
          className="group relative p-6 bg-[#0f172a] border border-green-500/30 rounded-2xl hover:border-green-400 transition-all hover:-translate-y-1 shadow-lg flex items-center gap-5 text-left">
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

        <button onClick={goToCorruption}
          className="group relative p-6 bg-[#0f172a] border border-blue-500/30 rounded-2xl hover:border-blue-400 transition-all hover:-translate-y-1 shadow-lg flex items-center gap-5 text-left">
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
