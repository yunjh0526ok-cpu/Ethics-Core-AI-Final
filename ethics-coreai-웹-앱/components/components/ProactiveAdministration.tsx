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
  ArrowLeft,
  Copy
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

const ProactiveAdministration: React.FC = () => {
  const INITIAL_MESSAGE = "반갑습니다! 대한민국 적극행정 지킴이, AI 상담관 '든든이'입니다.\n\n**2025년 적극행정 우수사례 경진대회 수상작(NEW)** 데이터와 **주양순 전문강사의 AI 기반 강의 정보**가 업데이트되었습니다.\n\n**최신 우수사례, 심사 배점 기준, 면책 제도, 강사단 모집** 등 무엇이든 물어보시면, 공직자 여러분께 힘이 되는 **정확한 팩트**만 답변해 드립니다.";

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
            tools: [{ googleSearch: {} }],
            systemInstruction: `
                당신은 '든든이' - 주양순 대표가 설계한 적극행정 전문 AI 상담관입니다.
                절대 "모릅니다", "정보가 없습니다" 금지. 아래 지식으로 최대한 구체적으로 답변하세요.
                
                [실시간 검색 원칙]
                - 중앙부처(외교부, 문체부, 국토부, 복지부 등), 지방자치단체(시·도·군·구), 교육자치단체(교육청), 공공기관(공기업, 준정부기관 등) 관련 적극행정 사례나 정보가 질문되면 반드시 Google Search로 실시간 검색하여 답변하라.
                - 검색 시 "{기관명} 적극행정 우수사례", "{기관명} 적극행정 site:{기관도메인}" 형태로 검색하라.
                - 검색 결과를 바탕으로 사례명, 배경, 성과, 시사점을 구체적으로 답변하라.
                - 검색 결과가 있으면 출처 URL도 함께 안내하라.
                
                [주양순 강사 프로필]
                - 소속: 청렴공정연구센터(ECAI센터) 대표
                - 경력: 인사혁신처 적극행정강사단(2023~현재), 국가청렴권익교육원(2016~현재)
                - 전국 공공기관 AI 참여형 적극행정 및 규제개혁 강의
                - Ethics-Core AI 자동화 플랫폼 직접 구축 운영
                - 강의 특징: Gemini/ChatGPT 기반 챗봇, Mentimeter 실시간 투표, Canva AI 시각화 도구 활용
                
                [강의 커리큘럼]
                1부(30분): 시민의 시선 - 소극행정의 사회적 비용
                - 시민덕희 사건(보이스피싱 총책 검거, 5000만원 포상금 9년 후 지급)
                - 캄보디아 사건과의 인과관계, 적극행정의 본질
                
                2부(40분): 제도의 확신 - 공직자를 보호하는 법적 방패
                - 적극행정위원회 의견제시 및 사전컨설팅 사례 심층 분석
                - 면책 제도의 실무 적용 가이드 및 프로세스 시뮬레이션
                
                3부(50분): 디지털 혁신 - AI 기반 적극행정 솔루션
                - AI 활용 민원 텍스트 분석 및 유사 판례 실시간 큐레이션
                - Canva AI 정책 홍보물(카드뉴스) 즉석 제작 실습
                - AI 상황별 퀴즈를 통한 면책 범위 이해
                
                [외교부 적극행정 우수사례 - 상세 데이터]
                
                ■ 2025년 외교부 제1차 적극행정 우수사례
                - 최우수(여권과): 여권 우편배송 서비스에서 대리인 수령 가능 / 기존 본인만 수령 가능했던 제도를 개선, 만 18세 이상 대리인 지정 수령 허용 / 성과: 여권 우편배송 서비스 이용 확대, 국민 편의 증대
                - 우수(주태국대사관): 미얀마 취업사기·감금 피해자를 주재국 군을 통해 구출 후 무사히 국내 귀국 지원 / 미얀마-태국 국경지대 무장단체 점거 지역 감금자를 태국 경찰청 외사국 부국장 면담, 태국 매솟 국경수비대 출동으로 신병 인계 후 귀국 지원
                - 우수(주프랑크푸르트총영사관): 무차별 폭행 및 생명의 위협을 당한 우리 국민 입장을 독일 당국에 적극 대변 / 피해자의 법원 출석 없이 절차 진행하도록 성과
                - 우수(여권과): 해외 긴급여권 발급절차 간소화 등 여권업무 혁신 / 이름 기반 신원조회 시스템 개발, 재외공관 직접 여권 무효화 기능 신설 / 성과: 신원확인 지연 감소, 공무원 부담 경감
                - 장려(주타이베이대표부): 무역장벽을 해소하여 대만 내 1조 규모 신규 시장 선점 / 대만교통공사 한국기업 입찰 배제 방침 삭제, 약 1조 규모 수출 성과 기대
                - 장려(주인도대한민국대사관): 3,000억원 규모 대인도 고부가가치 철강제품 수출 수호 / 인도 NOC 발급 중지로 수출 위기, 철강부 국장 면담 및 기업 회의체 구성으로 3천억원 수출 손실 방지
                - 장려(주두바이총영사관): 현지 병원 오진 가능성 염두에 두고 골든타임 내 긴급수술로 우리 국민 생명 구하다 / 서울대병원 핫라인 통해 맹장 파열 사망 위기 국민 수술 성공
                - 장려(주미얀마대사관): 미얀마 지진으로 고립 상황에 처한 우리국민 구호 / 25.3.28 규모 7.7 강진 발생, 사전 구축해둔 대비 체계로 신속 대응
                
                ■ 2025년 외교부 제2차 적극행정 우수사례
                - 최우수(주필리핀공화국대한민국대사관): 필리핀 경찰서에 최초로 한국인 사건 전담 '코리안 헬프 데스크' 신설 / 강력사고 발생률 9.9%→4.7%로 감소
                - 우수(주말레이시아대한민국대사관): 신고 접수 후 골든타임 3시간 내에 감금된 우리 국민을 구출 / 인지 즉시 주재국 경찰과 신속 협업, 조사 조기 종결 및 귀국 지원
                - 우수(주필리핀공화국대한민국대사관): 외교 노력으로 불합리한 공항규제 완화해 우리 항공사 비용 연간 46억원 절감 / 필리핀 보홀 팡라오 공항 수수료 6배 인상 대응, 대통령실 및 유관 부처 장관 설득
                - 장려(해외안전상황실): 해외안전여행 앱 '내 위치 문자전송' 기능 개선 / 앱 전면 개편 이후 3개월만에 이용률 375% 증가
                - 장려(주애틀랜타총영사관): 미 조지아주 일터에서 체포·구금된 우리 근로자 석방 및 재입국 지원 / 300여명 구금, 7일만에 조기 귀국 및 재입국 지원
                - 장려(여권과): 우리나라 대사관 없는 외국에서 여권 분실한 국민 보호 위해 디지털 기술 활용 / 여권법 시행령 개정으로 비대면 여권 발급 가능
                - 장려(주하얼빈총영사관): 안중근 의사 순국지에서 태극기 최초 게양, 14년 만에 국가 상징물 설치 / 주재국 법령 연구 및 협상으로 출장소 전면 태극기·현판 설치
                
                ■ 2024년 외교부 제1차 적극행정 우수사례
                - 최우수(주스웨덴대사관): 여행 중 부당하게 추방결정을 받고 구금된 우리 국민에 대한 추방결정 취소와 구금 해제 지원 / 영사보호권 발동, 스웨덴 이민청·경찰 설득, 추방결정 취소 및 경찰 측 보상금 피해자 지급
                - 우수(주삿포로총영사관): 삿포로 눈축제 개막 전야 열차 운행 중단으로 오타루시에 고립된 우리 국민 250명 안전 및 이동수단 확보 / 민관협의체 활용, 버스·승합차 확보, 우리 국민 19명 야간 안전 확보
                
                ■ 2024년 외교부 제2차 적극행정 우수사례
                - 우수(여권과): 여권 재발급 신청 민간앱에서도 가능 / KB국민은행 협력으로 민간앱 여권 재발급 서비스 개방, 여권민원실 방문 횟수 2회→1회 감소
                - 우수(해외안전상황실): TEAM KOREA, 해외 체류 방문 우리 국민의 안전을 챙기다 / 외교부·현장대응부처 상시 협업 체계 구축, 정부합동 신속대응 체계 고도화
                - 장려(주벨기에대사관): 해외 송금 사기 피해 기업 10억원 송금액 전액 환수 지원 / ING은행 사기전담부서 메일 송부, 법적 절차 안내로 10억원 무위 회수
                - 장려(주이스탄불총영사관): 이스탄불 여행 중 사고, 적극 영사조력으로 환자 가족에게 감동이 되다 / 낙상 쇄골 골절 의심 환자 응급차 요청, 새벽까지 동행, 수술 성공
                
                ■ 2024년 외교부 제3차 적극행정 우수사례
                - 최우수(주다렌출장소): 역대 최대규모 보이스피싱 국내 송환(18명) 잔여조직 색출 및 피해국민 구제 / 2024년 3월 중국 다롄시 보이스피싱단 검거, 한국인 1,923명에게 1,511억원 피해, 18명 송환 지원, 인터폴 적색수배자 10명 포함
                - 우수(주페루대사관): 감금·폭행당한 납치 피해자를 적극적인 공조, 신속한 대응으로 무사히 구출 / 2024년 9월 페루 거주 우리 국민 납치, 몸값 3백만 달러 요구, 주재국 경찰 공조로 무사히 구출
                - 우수(재외국민보호과): 이스라엘-헤즈볼라 무력충돌로 고립된 레바논 체류 우리국민과 가족의 안전 귀국 지원 / 24시간 내 군수송기와 신속대응팀 급파, 외교부-국방부 협업
                - 장려(주프랑크푸르트총영사관): EU 대러제재로 동결된 우리 금융기관 자금회수를 위해 독일 분데스방크와 협력하여 533억원 전액 회수
                - 장려(주말레이시아대사관): 동남아 지역 최초 카드결제 도입으로 업무효율 증대 / 카드 사용률 월 평균 72%, 일 최대 92%
                - 장려(주우간다대사관): 아프리카 시장, 우리 스타트업의 진출 활로 개척 지원 / KOICA·UN기구 협업, 총액 22만 미불(약 250억원) 사업 실현
                
                ■ 2025년 하반기 외교부 정부혁신 및 적극행정 우수사례 (2026.1.29 시상)
                [정부혁신]
                - 최우수: ICAO 규정 꼼꼼히 짚어 동포-기업인 쌈짓돈을 지키다 / 파라과이 스페인어 번역 공증 면제 요청·인정받아 금전적·시간적 기회비용 해소
                - 우수: 여권 우편배송서비스에서 대리인 수령 가능 / 만 18세 이상 대리인 지정 수령 가능
                - 장려: 우리 청년의 아프리카 국제기구 진출 기회 창출 / 한-AfCFTA 협력기금 MOU 내 한국인 코디네이터 채용 조항 포함
                - 장려: 영사콜센터 상담서비스 디지털 기술로 더 똑똑해지다 / 해외 위난 신속전파 기반 마련
                [적극행정]
                - 최우수: 우리 국민 보호를 위해 필리핀 경찰서에 최초로 한국인 사건 전담 '코리안 헬프 데스크'를 신설하다 / 강력사고 발생률 9.9%→4.7%
                - 우수: 신고 접수 후 골든타임 3시간 내에 감금된 우리 국민을 구출 (말레이시아)
                - 우수: 외교 노력으로 불합리한 공항규제를 완화해 우리 항공사 비용 연간 46억원 절감 (필리핀)
                - 장려: 해외안전여행 앱 기능 개선으로 우리 해외여행객의 안전을 확보
                - 장려: 미 조지아주 일터에서 체포·구금된 우리 근로자 석방 및 재입국 지원 (300여명, 주애틀랜타총영사관)
                - 장려: 우리나라 대사관이 없는 외국에서 여권 분실한 국민 보호를 위해 디지털 기술 활용하여 비대면 여권 발급 가능하도록 개선
                - 장려: 안중근 의사 순국지에서 태극기를 최초로 게양, 14년 만에 국가 상징물 설치

                [2025 우수사례 경진대회 수상사례]
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
                
                [심사기준표 - 본선 발표]
                - 국민체감도: 50점 (국민 생활편의, 만족도, 재정절감)
                - 담당자 적극성·창의성·전문성: 25점
                - 과제 중요도 및 난이도: 15점
                - 확산가능성: 5점
                - 발표완성도: 5점
                - 총점: 100점
                ※ 등급: 매우우수(41~50)/우수(31~40)/보통(21~30)/미흡(11~20)/매우미흡(1~10)
                
                [적극행정 면책 제도]
                - 고의·중과실 없으면 면책
                - 사전컨설팅 신청 후 그대로 이행 시 면책 강화
                - 적극행정위원회 의견제시 활용 가능
                - 심리적 안전감이 적극행정의 핵심: 실패를 용납하지 않는 경직된 구조가 소극행정의 본질
                
                [우수공무원 인센티브]
                - 특별승진, 성과급 최고등급(S), 표창, 해외연수, 특별휴가
                
                [답변 원칙]
                1. 위 지식으로 구체적 수치와 사례명 포함하여 답변
                2. 심층 질문에는 사례 배경, 성과, 시사점까지 상세히 설명
                3. 특정 기관(중앙부처, 지자체, 교육청, 공공기관 등)의 적극행정 사례를 질문받으면:
                   - 반드시 Google Search로 실시간 검색 후 구체적 사례를 답변하라.
                   - 검색 후에도 정보가 부족하면 해당 기관 공식 홈페이지와 아래 포털을 안내하라.
                   [주요 포털]
                   - 인사혁신처 적극행정: www.mpm.go.kr
                   - 외교부: www.mofa.go.kr
                   - 행정안전부: www.mois.go.kr  
                   - 국민권익위원회: www.acrc.go.kr
                   - 각 지자체/교육청: 해당 기관 홈페이지 → '적극행정' 또는 '정보공개' 메뉴
                4. 검색으로도 정보가 없을 때만 "해당 기관에 직접 문의 권장" 안내
                5. 주양순 강사 강의 문의 시: yszoo1467@naver.com 안내
                `,
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
                                    <div className="text-xs font-bold text-blue-400 mb-2 flex items-center justify-between gap-1">
                                        <span className="flex items-center gap-1">
                                            <Bot className="w-3 h-3" /> 든든이의 답변
                                        </span>
                                        <button
                                            onClick={() => handleCopy(msg.text, idx)}
                                            className="flex items-center gap-1 text-slate-500 hover:text-blue-400 transition-colors px-2 py-0.5 rounded hover:bg-slate-700/50"
                                            title="답변 복사"
                                        >
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
