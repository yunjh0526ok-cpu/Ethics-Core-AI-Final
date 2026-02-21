
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scale, Users, Bot, Crown, ArrowRight, 
  CheckSquare, LayoutDashboard, HeartHandshake, 
  Gavel, Radar, ArrowLeft, 
  Stethoscope, MessageSquare, Send, AlertTriangle, 
  UserCheck, Brain, Search, FileText, Sparkles, Sun,
  ShieldAlert, BookOpen, Siren
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

// --- TYPE DEFINITIONS ---
interface ChatMessage {
    role: 'user' | 'ai';
    text: string;
}

// --- MOCK DATA FOR IMMEDIATE DISPLAY ---
const MOCK_LEGAL_ADVICE = `
**[에코AI 부패 정밀 진단 결과]**
귀하가 질의하신 사안은 「공무원 행동강령」 상 **사적 이해관계 신고 의무** 위반 소지가 다분합니다.

1. **[위반 가능성 진단]**: ⚠️ **85% (고위험)**
2. **[관련 법령]**: 
   > **이해충돌방지법 제5조 (사적 이해관계자의 신고 및 회피 신청)**
   > 공직자는 직무관련자가 사적 이해관계자임을 안 경우 안 날부터 14일 이내에 신고하고 회피를 신청해야 한다.
3. **[감사관의 조언]**: 
   대가성이 없더라도 직무 관련성이 인정될 경우 **청탁금지법 제8조**에 의거하여 과태료 부과 대상이 될 수 있습니다. 즉시 감사관실에 자진 신고 후 상담을 진행하십시오.
`;

const STRATEGIC_ROADMAP = [
    { step: "01", title: "Mind Care", desc: "심리적 안정 및 감정 코칭", icon: Brain },
    { step: "02", title: "Fact Check", desc: "객관적 사실 관계 분석", icon: Search },
    { step: "03", title: "Legal Review", desc: "법적 위반 여부 정밀 검토", icon: Scale },
    { step: "04", title: "Simulation", desc: "AI 롤플레잉 실전 대응", icon: Bot }
];

const LEGAL_QUICK_MENU = [
    { label: "신종 부패 (10대 유형)", icon: Siren, prompt: "최근 공직사회에서 빈번하게 발생하는 '신종 부패 10대 유형'에 대해 설명해 주고, 내가 겪은 일이 이에 해당하지는 판단 기준을 알려줘." },
    { label: "청탁금지법 위반", icon: ShieldAlert, prompt: "청탁금지법(김영란법)의 주요 위반 사례와 처벌 기준, 그리고 예외 사유(3-5-5 규정 등)에 대해 명확히 분석해 줘." },
    { label: "이해충돌방지법", icon: Scale, prompt: "이해충돌방지법에 따른 '사적 이해관계자 신고' 의무와 '직무상 비밀 이용' 금지 조항에 대해 구체적인 예시를 들어 설명해 줘." }
];

const renderStyledText = (text: string) => {
    return text.split('\n').map((line, i) => {
        // Handle Blockquotes for Laws
        if (line.trim().startsWith('>')) {
            return (
                <div key={i} className="my-2 p-3 bg-slate-900/80 border-l-4 border-cyber-accent rounded-r-lg text-slate-300 text-sm italic font-serif">
                    {line.replace('>', '').trim()}
                </div>
            );
        }
        
        // Handle bolding and highlights
        return (
            <p key={i} className="mb-2 leading-relaxed">
                {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        const content = part.slice(2, -2);
                        // Quantitative Analysis Highlight
                        if (content.includes('%')) {
                            return <strong key={j} className="text-red-400 bg-red-900/20 px-1.5 py-0.5 rounded border border-red-500/30 mx-1">{content}</strong>;
                        }
                        return <strong key={j} className="text-cyber-accent font-bold">{content}</strong>;
                    }
                    return part;
                })}
            </p>
        );
    });
};

// --- DATA: 3대 진단 카테고리 (질문지 30개 100% 보존) ---
const DIAGNOSIS_CATEGORIES = [
  { 
    id: 'corruption', 
    label: '신종 부패 진단', 
    sub: 'Modern Corruption',
    color: 'text-yellow-500', 
    bg: 'bg-yellow-500', 
    border: 'border-yellow-500',
    icon: Scale,
    desc: '출장비 횡령, 모바일 향응, 사적 노무 등 은밀하게 진화한 신종 부패 징후 포착',
    checklist: [
      "1. [이해충돌] 직무상 알게 된 개발/정책 정보를 이용하여 본인 또는 가족 명의로 부동산이나 주식에 투자한 적이 있다.",
      "2. [채용비리] 지인이나 특정인의 자녀를 채용하기 위해 면접 점수를 조작하거나 채용 요건을 임의로 변경했다.",
      "3. [사적노무] 관용 차량이나 공공 근로자를 개인적인 용무(이사, 김장, 자녀 등하교 등)에 동원했다.",
      "4. [쪼개기 결제] 법인카드 한도나 감사 적발을 피하기 위해 건당 결제 금액을 고의로 나누어 결제했다.",
      "5. [우회적 특혜] 특정 업체에 일감을 몰아주는 대가로 퇴직 후 재취업을 보장받거나 자문료 명목의 돈을 약속받았다.",
      "6. [출장비 횡령] 실제 수행하지 않은 허위 출장을 신청하거나, 출장지에서 업무와 무관한 사적 관광을 즐겼다.",
      "7. [겸직 위반] 기관의 허가 없이 유튜브 활동, 외부 강의 등을 통해 과도한 부수입을 올리고 업무를 소홀히 했다.",
      "8. [모바일 향응] 현금 대신 추적이 어려운 모바일 상품권, 기프티콘, 고가의 숙박권 등을 요구하거나 받았다.",
      "9. [갑질형 부패] 산하기관이나 직무관련자에게 자신의 저서 구매를 강요하거나, 경조사 비용을 전가했다.",
      "10. [초과근무 부정] 퇴근 후 운동이나 식사를 하고 돌아와서 초과근무 지문만 찍고 귀가하는 행위를 반복했다."
    ]
  },
  { 
    id: 'gapjil', 
    label: '스마트 갑질 진단', 
    sub: 'Digital Power Abuse',
    color: 'text-[#ff6e1e]', 
    bg: 'bg-[#ff6e1e]', 
    border: 'border-[#ff6e1e]',
    icon: Crown,
    desc: '투명인간 취급, 책임 전가, 감정 폭력 등 교묘해진 비가시적 괴롭힘 정밀 판별',
    checklist: [
      "1. [비가시적 따돌림] 회의나 중요 정보 공유에서 특정 직원을 고의로 배제하거나 투명 인간 취급했다.",
      "2. [포장된 사적지시] 개인적인 식당 예약, 택배 수령 등을 시키며 '의전 교육'이라고 합리화했다.",
      "3. [연가 사용 침해] 정당한 연가 신청에 대해 구체적인 사유를 캐묻거나 승인을 고의로 미뤘다.",
      "4. [업무 떠넘기기] 본인이 책임질 소지가 있는 민감한 업무를 부하 직원에게 기안/전결하도록 강요했다.",
      "5. [가스라이팅] 인격적 모독을 하며 '다 너 성장하라고 하는 소리'라며 피해자를 예민한 사람으로 몰았다.",
      "6. [SNS 업무폭탄] 퇴근 후나 주말에 급하지 않은 업무 카톡을 보내 즉각적인 답장을 압박했다.",
      "7. [회식 강요] 불참 시 인사상 불이익이 있을 것처럼 분위기를 조성하며 참석을 강제했다.",
      "8. [사적 연구 전가] 자신의 학위 논문이나 외부 강의 자료 작성을 부하 직원에게 시켰다.",
      "9. [감정 폭력] 인사를 무시하거나 한숨 쉬기, 공포 분위기 조성 등으로 정신적 고통을 주었다.",
      "10. [독박 업무] 합리적 이유 없이 특정 직원에게만 기피 업무나 허드렛일을 몰아주었다."
    ]
  },
  { 
    id: 'euljil', 
    label: '역공형 을질 진단', 
    sub: 'Weaponized Subordination',
    color: 'text-cyber-purple', 
    bg: 'bg-cyber-purple', 
    border: 'border-cyber-purple',
    icon: Users,
    desc: '무고성 신고 협박, 녹음기 악용, 악의적 태업 등 관리자를 위협하는 역공 행위 진단',
    checklist: [
      "1. [무고성 신고] 정당한 업무 지시나 근태 지적을 '직장 내 괴롭힘'이라며 신고하겠다고 협박했다.",
      "2. [여론전] 블라인드 등 익명 커뮤니티에 상사에 대한 허위 사실이나 비방글을 유포했다.",
      "3. [녹음기 악용] 업무 협의 중인 상사의 발언을 몰래 녹음하여 꼬투리를 잡거나 협박용으로 사용했다.",
      "4. [악의적 태업] 업무 지시를 고의로 지연시키거나 '까먹었다'며 누락하여 업무를 방해했다.",
      "5. [R&R 방패] 자신의 업무 분장 범위를 벗어나는 아주 작은 협조 요청도 '내 일 아니다'라며 거부했다.",
      "6. [정보 차단] 상사에게 보고해야 할 중요 이슈를 고의로 은폐하거나 늑장 보고하여 곤경에 빠뜨렸다.",
      "7. [분위기 조성] 회의 시간 중 대놓고 비협조적인 태도를 보여 팀 전체의 사기를 저하시켰다.",
      "8. [병가 남용] 업무가 바쁜 시기에 진단서 없이 당일 통보로 연차를 사용하여 공백을 유발했다.",
      "9. [지시 불이행] 공개적인 자리에서 상사의 지시에 대놓고 반박하여 리더십을 무력화했다.",
      "10. [집단 따돌림] 동료들을 선동하여 상사의 지시를 집단적으로 거부하거나 상사를 고립시켰다."
    ]
  }
];

// --- HELPER COMPONENT: RADAR CHART ---
const RadarChart = ({ data, color }: { data: number[], color: string }) => {
  const size = 200;
  const center = size / 2;
  const radius = size * 0.4;
  const axes = ["법규 위반", "조직 피해", "명예 훼손", "재정 손실", "고의성"];
  const angleSlice = (Math.PI * 2) / axes.length;

  const getCoords = (value: number, index: number) => {
    const angle = index * angleSlice - Math.PI / 2;
    return {
      x: center + radius * value * Math.cos(angle),
      y: center + radius * value * Math.sin(angle)
    };
  };

  const pathData = data.map((d, i) => {
    const coords = getCoords(d, i);
    return `${coords.x},${coords.y}`;
  }).join(" ");

  const strokeColor = color.includes('yellow') ? '#eab308' : color.includes('purple') ? '#8b5cf6' : '#ff6e1e';

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {[0.2, 0.4, 0.6, 0.8, 1].map((level, i) => (
          <polygon 
            key={i}
            points={axes.map((_, j) => {
              const {x, y} = getCoords(level, j);
              return `${x},${y}`;
            }).join(" ")}
            fill="none"
            stroke="#334155"
            strokeWidth="1"
            className="opacity-50"
          />
        ))}
        {axes.map((axis, i) => {
          const {x, y} = getCoords(1.15, i);
          return (
            <g key={i}>
              <line x1={center} y1={center} x2={getCoords(1, i).x} y2={getCoords(1, i).y} stroke="#334155" strokeWidth="1" />
              <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">{axis}</text>
            </g>
          );
        })}
        <motion.polygon
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          points={pathData}
          fill={strokeColor}
          fillOpacity="0.4"
          stroke={strokeColor}
          strokeWidth="2"
        />
        {data.map((d, i) => {
            const {x, y} = getCoords(d, i);
            return (
                <motion.circle 
                    key={i}
                    cx={x} 
                    cy={y} 
                    r="3" 
                    fill="#fff"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                />
            );
        })}
      </svg>
    </div>
  );
};

// --- RISK GAUGE COMPONENT ---
const RiskGauge = ({ score, color }: { score: number, color: string }) => {
    const size = 180;
    const strokeWidth = 15;
    const center = size / 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const strokeColor = color.includes('yellow') ? '#eab308' : color.includes('purple') ? '#8b5cf6' : '#ff6e1e';

    return (
        <div className="relative flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                <circle cx={center} cy={center} r={radius} stroke="#1e293b" strokeWidth={strokeWidth} fill="none" />
                <motion.circle
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx={center} cy={center} r={radius} stroke={strokeColor} strokeWidth={strokeWidth} fill="none" strokeDasharray={circumference} strokeLinecap="round"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black text-white">{score}</span>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Risk Score</span>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const Diagnostics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'counseling' | 'law'>('diagnosis');
  const [diagCategory, setDiagCategory] = useState<string | null>(null);
  const [diagStep, setDiagStep] = useState<'select' | 'check' | 'result'>('select');
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial Greeting for Law Tab
  useEffect(() => {
    setChatLog([]); // 탭 바뀔 때 채팅 초기화
    if (activeTab === 'law') {
        setChatLog([{
            role: 'ai',
            text: `안녕하십니까. 주양순 대표가 설계한 **에코AI 전문 부패상담관**입니다.\n\n귀하의 제보는 **철저히 익명이 보장**되며, 모든 답변은 **「청탁금지법」**, **「이해충돌방지법」** 등 관계 법령에 근거하여 정밀 분석을 제공합니다.\n\n분석을 원하시는 사안을 말씀해 주시거나, 상단의 **퀵 메뉴**를 선택해 주세요.`
       }]);
    }
}, [activeTab]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog, isTyping, activeTab]);

  const handleBack = () => {
    sessionStorage.setItem('hero_view_mode', 'consulting');
    const event = new CustomEvent('navigate', { detail: 'home' });
    window.dispatchEvent(event);
  };

  const handleCategorySelect = (id: string) => {
    setDiagCategory(id);
    setDiagStep('check');
    setCheckedItems([]);
  };

  const toggleCheck = (index: number) => {
    setCheckedItems(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  const getRiskScore = () => checkedItems.length * 10;
  const getResultLevel = () => {
    const score = getRiskScore();
    if (score <= 20) return { level: '안전', desc: '청렴/갑질 리스크가 매우 낮습니다.', color: 'text-green-500' };
    if (score <= 50) return { level: '주의', desc: '잠재적 위험 요인이 감지되었습니다.', color: 'text-yellow-500' };
    return { level: '위험', desc: '즉각적인 개선과 전문가 상담이 필요합니다.', color: 'text-red-500' };
  };
  
  const getRadarData = () => {
    let scores = [0.2, 0.2, 0.2, 0.2, 0.2];
    checkedItems.forEach(idx => {
       if ([0, 3].includes(idx)) scores[0] += 0.3; // Law
       if ([4, 5, 9].includes(idx)) scores[1] += 0.25; // Org
       if ([2, 8].includes(idx)) scores[2] += 0.4; // Honor
       if ([1, 6].includes(idx)) scores[3] += 0.4; // Money
       if ([7].includes(idx)) scores[4] += 0.4; // Intent
    });
    return scores.map(s => Math.min(1, s)); 
  };

  const handleChatSend = async (text: string = chatInput) => {
    if (!text.trim()) return;
    const msg = text;
    setChatLog(prev => [...prev, { role: 'user', text: msg }]);
    setChatInput('');
    setIsTyping(true);

   if (!genAI) {  // ai → genAI
        setTimeout(() => {
            setChatLog(prev => [...prev, { role: 'ai', text: "시스템 점검 중입니다. (API Key Error)" }]);
            setIsTyping(false);
        }, 1000);
        return;
    }

    // Persona & Instruction Selection
    let systemInstruction = "";
    if (activeTab === 'law') {
        systemInstruction = `
            당신은 '에코AI 수석 부패 감사관'입니다. 
            사용자의 질의를 공무원 행동강령, 청탁금지법, 이해충돌방지법, 공익신고자 보호법 등 관련 법령에 근거하여 엄격하고 정밀하게 분석하십시오.
            
            [분석 가이드]
            1. **어조**: 냉철하고 공정하며 신뢰감 있는 '수석 감사관' 톤을 유지하십시오. ("~입니다", "~판단됩니다")
            2. **구조화된 출력**:
               - **[위반 가능성 진단]**: 확률(%)과 위험도(고위험/중위험/저위험)를 명시하십시오. (예: **85% (고위험)**)
               - **[관련 법령]**: 위반 소지가 있는 법 조항을 인용하십시오. (박스 처리 유도: > 기호 사용)
               - **[감사관의 조언]**: 구체적인 대응 방안(자진 신고, 증거 확보 등)을 제시하십시오.
            3. **신종 부패 연계**: '신종 부패 10대 유형'(출장비 횡령, 모바일 향응 수수, 사적 노무 동원 등)과 연관된 경우 이를 명시하십시오.
        `;
    } else {
        systemInstruction = "당신은 '에코AI 마음치유 상담관'입니다. 조직 내 갈등이나 부패, 갑질로 힘들어하는 사용자의 마음에 깊이 공감하고, 따뜻한 위로와 심리적 안정을 위한 조언을 해주세요. 차가운 법률 용어보다는 감성적인 언어를 사용하세요.";
    }

    try {
        const response = await genAI.models .generateContent({
            model: "gemini-2.5-flash",
            contents: msg,
            config: { systemInstruction }
        });
      const responseText = response.text;
      setChatLog(prev => [...prev, { role: 'ai', text: responseText || "답변을 받았으나 내용이 없습니다." }]);
    } catch (error: any) {
      setChatLog(prev => [...prev, { role: 'ai', text: `에러: ${error?.message || JSON.stringify(error)}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const currentCategoryData = DIAGNOSIS_CATEGORIES.find(c => c.id === diagCategory);

  return (
    <section id="diagnostics" className="relative z-10 py-16 px-4 w-full max-w-7xl mx-auto min-h-screen flex flex-col items-center">
       
       <div className="w-full max-w-7xl mb-8 flex justify-start">
        <button onClick={handleBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group px-4 py-2 rounded-full hover:bg-slate-800/50">
            <div className="p-1.5 rounded-full bg-slate-800 border border-slate-700 group-hover:border-cyber-accent group-hover:bg-slate-700 transition-all">
                <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm">이전 화면으로</span>
        </button>
      </div>

      <div className="text-left w-full max-w-7xl mb-12">
        <h1 className="text-5xl md:text-7xl font-black text-white mb-2 tracking-tight">ECHO AI INTELLIGENCE</h1>
        <p className="text-cyber-accent text-lg md:text-xl font-mono tracking-widest">Echo AI Digital Platform</p>
      </div>

      <div className="w-full max-w-7xl mb-8">
          <div className="flex flex-col md:flex-row border border-slate-700 rounded-lg overflow-hidden">
              <button onClick={() => setActiveTab('diagnosis')} className={`flex-1 py-6 px-4 text-center font-bold text-lg transition-all border-b-4 md:border-b-0 md:border-r border-slate-700 hover:bg-slate-800/50 ${activeTab === 'diagnosis' ? 'bg-[#0f172a] text-white border-b-cyber-accent md:border-r-slate-700' : 'bg-[#0a0a12] text-slate-500'}`}>
                  <div className="flex flex-col items-center justify-center gap-2"><LayoutDashboard className={`w-6 h-6 ${activeTab === 'diagnosis' ? 'text-cyber-accent' : 'text-slate-600'}`} /> 에코AI 진단</div>
                  <span className="text-xs font-normal mt-1 block text-slate-500">30가지 행동 강령 위반 유형 정밀 진단</span>
              </button>
              <button onClick={() => setActiveTab('counseling')} className={`flex-1 py-6 px-4 text-center font-bold text-lg transition-all border-b-4 md:border-b-0 md:border-r border-slate-700 hover:bg-slate-800/50 ${activeTab === 'counseling' ? 'bg-[#0f172a] text-white border-b-amber-500 md:border-r-slate-700' : 'bg-[#0a0a12] text-slate-500'}`}>
                  <div className="flex flex-col items-center justify-center gap-2"><HeartHandshake className={`w-6 h-6 ${activeTab === 'counseling' ? 'text-amber-500' : 'text-slate-600'}`} /> 에코AI 마음치유</div>
                  <span className="text-xs font-normal mt-1 block text-slate-500">심리 보호 및 신고서 자동 작성 가이드</span>
              </button>
              <button onClick={() => setActiveTab('law')} className={`flex-1 py-6 px-4 text-center font-bold text-lg transition-all hover:bg-slate-800/50 ${activeTab === 'law' ? 'bg-[#0f172a] text-white border-b-4 border-cyber-accent' : 'bg-[#0a0a12] text-slate-500'}`}>
                  <div className="flex flex-col items-center justify-center gap-2"><Gavel className={`w-6 h-6 ${activeTab === 'law' ? 'text-cyber-accent' : 'text-slate-600'}`} /> 에코AI 부패상담관</div>
                  <span className="text-xs font-normal mt-1 block text-slate-500">실시간 법률 팩트체크 및 분석 리포트</span>
              </button>
          </div>
      </div>

      <div className={`w-full max-w-7xl bg-[#0b1120] border border-slate-800 rounded-[2rem] p-8 md:p-12 min-h-[600px] relative shadow-2xl transition-colors duration-500 ${activeTab === 'counseling' ? 'border-amber-900/50 shadow-amber-900/20' : ''}`}>
          <AnimatePresence mode="wait">
              {activeTab === 'diagnosis' && (
                  <motion.div key="diagnosis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                      {diagStep === 'select' && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full items-stretch">
                              {DIAGNOSIS_CATEGORIES.map((cat) => (
                                  <div key={cat.id} className="group relative flex flex-col items-center text-center p-8 rounded-3xl border border-slate-800 bg-[#0f172a] hover:border-slate-600 transition-all duration-300 hover:-translate-y-2 shadow-lg">
                                      <div className="w-24 h-24 rounded-full border border-slate-600 flex items-center justify-center mb-8 group-hover:border-white transition-colors">
                                          <cat.icon className="w-10 h-10 text-white" />
                                      </div>
                                      <h3 className="text-2xl font-bold text-white mb-2">{cat.label}</h3>
                                      <p className={`text-xs font-bold ${cat.color} mb-6 uppercase tracking-widest font-mono`}>{cat.sub}</p>
                                      <p className="text-slate-400 text-sm leading-relaxed break-keep mb-10 flex-grow px-2">{cat.desc}</p>
                                      <button onClick={() => handleCategorySelect(cat.id)} className="px-8 py-3 rounded-full border border-slate-600 text-slate-300 text-sm font-bold hover:bg-white hover:text-black hover:border-white transition-all flex items-center gap-2">
                                          진단 시작 <ArrowRight className="w-4 h-4" />
                                      </button>
                                  </div>
                              ))}
                          </div>
                      )}
                      {diagStep === 'check' && currentCategoryData && (
                          <div className="max-w-4xl mx-auto">
                              <div className="flex items-center justify-between mb-8 border-b border-slate-700 pb-4">
                                  <button onClick={() => setDiagStep('select')} className="text-slate-400 hover:text-white flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> 뒤로가기</button>
                                  <h3 className={`text-2xl font-bold ${currentCategoryData.color}`}>{currentCategoryData.label} 체크리스트</h3>
                              </div>
                              <div className="space-y-4 mb-10">
                                  {currentCategoryData.checklist.map((item, idx) => (
                                      <div key={idx} onClick={() => toggleCheck(idx)} className={`p-5 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${checkedItems.includes(idx) ? `bg-slate-800 ${currentCategoryData.border} border-opacity-50` : 'bg-[#0f172a] border-slate-700 hover:bg-slate-800'}`}>
                                          <div className={`mt-1 w-6 h-6 rounded border flex items-center justify-center shrink-0 ${checkedItems.includes(idx) ? `${currentCategoryData.bg} border-transparent text-black` : 'border-slate-600 text-transparent'}`}><CheckSquare className="w-4 h-4" /></div>
                                          <span className={`text-base ${checkedItems.includes(idx) ? 'text-white font-bold' : 'text-slate-400'}`}>{item}</span>
                                      </div>
                                  ))}
                              </div>
                              <div className="flex justify-center">
                                  <button onClick={() => setDiagStep('result')} className={`px-16 py-4 rounded-full font-bold text-lg text-white shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all hover:scale-105 flex items-center gap-3 ${currentCategoryData.bg.replace('bg-', 'bg-')}`} style={{backgroundColor: currentCategoryData.color.includes('yellow') ? '#eab308' : currentCategoryData.color.includes('purple') ? '#8b5cf6' : '#ff6e1e'}}>
                                      결과 분석하기 <Radar className="w-5 h-5" />
                                  </button>
                              </div>
                          </div>
                      )}
                      {diagStep === 'result' && currentCategoryData && (
                          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-stretch h-full">
                              <div className="w-full md:w-1/2 flex flex-col gap-6">
                                  <div className="bg-[#0f172a] rounded-3xl p-8 border border-slate-700 flex flex-col items-center justify-center min-h-[300px]">
                                       <h4 className="text-slate-400 text-sm font-bold uppercase mb-6 tracking-widest">Risk Dimensions</h4>
                                       <div className="w-full aspect-square max-w-[280px]">
                                           <RadarChart data={getRadarData()} color={currentCategoryData.color} />
                                       </div>
                                  </div>
                                  <div className="bg-[#0f172a] rounded-3xl p-8 border border-slate-700 flex flex-col items-center justify-center">
                                      <RiskGauge score={getRiskScore()} color={currentCategoryData.color} />
                                      <div className={`mt-4 text-2xl font-black ${getResultLevel().color}`}>{getResultLevel().level} 단계</div>
                                      <p className="text-slate-400 text-sm mt-1">{getResultLevel().desc}</p>
                                  </div>
                              </div>
                              <div className="w-full md:w-1/2 flex flex-col">
                                  <div className="bg-slate-900/50 rounded-3xl p-8 border border-slate-800 h-full flex flex-col">
                                      <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-3"><Bot className="w-6 h-6 text-cyber-accent" /> 에코AI 솔루션 제안</h4>
                                      <ul className="space-y-4 flex-grow">
                                          <li className="flex items-start gap-4 p-4 bg-slate-900 rounded-xl border border-slate-700">
                                              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold shrink-0">1</div>
                                              <div><strong className="block text-white mb-1">스마트 신고 채널 활성화</strong><p className="text-slate-400 text-sm">익명성이 보장되는 채널을 통해 내부 자정 작용을 유도하세요.</p></div>
                                          </li>
                                          <li className="flex items-start gap-4 p-4 bg-slate-900 rounded-xl border border-slate-700">
                                              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold shrink-0">2</div>
                                              <div><strong className="block text-white mb-1">감수성 훈련 (Role-Playing)</strong><p className="text-slate-400 text-sm">관리자 대상의 AI 역할극 훈련으로 인식을 개선하세요.</p></div>
                                          </li>
                                      </ul>
                                      <div className="mt-8 pt-6 border-t border-slate-800">
                                          <button onClick={() => { setActiveTab('counseling'); }} className="w-full py-4 bg-cyber-600 hover:bg-cyber-500 text-white rounded-xl font-bold text-base transition-colors shadow-lg flex items-center justify-center gap-2">
                                              에코AI 전문가와 심층 상담하기 <MessageSquare className="w-5 h-5" />
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      )}
                  </motion.div>
              )}

              {(activeTab === 'counseling' || activeTab === 'law') && (
                  <motion.div key="chat-interface" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col">
                      
                      {/* === IMMEDIATE DATA DISPLAY SECTIONS === */}
                      
                      {/* LAW TAB: QUICK MENU & LEGAL REPORT */}
                      {activeTab === 'law' && (
                          <div className="mb-6 space-y-4">
                              {/* Quick Menu */}
                              <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                                  {LEGAL_QUICK_MENU.map((item, idx) => (
                                      <button 
                                          key={idx}
                                          onClick={() => handleChatSend(item.prompt)}
                                          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-cyber-600 border border-slate-700 hover:border-cyber-500 rounded-full text-slate-300 hover:text-white transition-all whitespace-nowrap text-sm font-bold shrink-0"
                                      >
                                          <item.icon className="w-4 h-4" />
                                          {item.label}
                                      </button>
                                  ))}
                              </div>

                              {/* Static Report (If user just arrived, optional context) */}
                              <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-6 bg-slate-900/60 border border-slate-700 rounded-2xl shadow-xl">
                                  <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
                                      <FileText className="w-5 h-5 text-cyber-accent" />
                                      <h4 className="text-white font-bold text-lg">AI 부패 분석 샘플</h4>
                                      <span className="text-[10px] bg-red-900/50 text-red-400 px-2 py-0.5 rounded border border-red-500/20">TEST MODE</span>
                                  </div>
                                  <div className="text-slate-300 text-sm">
                                      {renderStyledText(MOCK_LEGAL_ADVICE)}
                                  </div>
                              </motion.div>
                          </div>
                      )}

                      {/* COUNSELING TAB: STRATEGIC ROADMAP */}
                      {activeTab === 'counseling' && (
                          <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-6">
                              <div className="flex items-center gap-2 mb-4">
                                  <Bot className="w-5 h-5 text-amber-500" />
                                  <h4 className="text-white font-bold text-lg">에코AI 심리 치유 로드맵</h4>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  {STRATEGIC_ROADMAP.map((step, idx) => (
                                      <div key={idx} className="bg-gradient-to-br from-amber-900/20 to-orange-900/10 border border-amber-900/30 p-4 rounded-xl flex flex-col items-center text-center">
                                          <div className="w-10 h-10 rounded-full bg-amber-900/40 flex items-center justify-center mb-3 text-amber-300">
                                              {React.createElement(step.icon, { className: "w-5 h-5" })}
                                          </div>
                                          <span className="text-xs text-amber-500/80 font-bold mb-1">STEP {step.step}</span>
                                          <h5 className="text-white font-bold text-sm mb-1">{step.title}</h5>
                                          <p className="text-[10px] text-amber-200/60">{step.desc}</p>
                                      </div>
                                  ))}
                              </div>
                          </motion.div>
                      )}

                      <div className={`flex-grow rounded-2xl border p-6 mb-6 overflow-y-auto custom-scrollbar min-h-[300px] max-h-[500px] transition-colors duration-500 ${activeTab === 'counseling' ? 'bg-gradient-to-b from-slate-900/80 to-amber-950/20 border-amber-900/30' : 'bg-[#0f172a] border-slate-800'}`}>
                          {chatLog.length === 0 && (
                              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                  {activeTab === 'counseling' ? (
                                      <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-gradient-to-br from-amber-900/40 to-orange-950/40 border border-amber-700/30 p-8 rounded-3xl text-center max-w-lg shadow-[0_0_40px_rgba(245,158,11,0.1)]"
                                      >
                                          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
                                              <Sparkles className="w-8 h-8 text-amber-300" />
                                          </div>
                                          <h3 className="text-xl font-bold text-white mb-4">에코AI 마음치유 상담소</h3>
                                          <p className="text-amber-100/90 text-sm leading-relaxed whitespace-pre-wrap break-keep font-medium">
                                              "안녕하십니까. 주양순 대표가 설계한 <strong className="text-amber-300">'에코AI'</strong> 마음치유 상담소입니다.<br/><br/>
                                              당신의 울림(Echo)에 귀를 기울이겠습니다.<br/>
                                              불안하고 답답한 마음, 저에게 털어놓으셔도 됩니다."
                                          </p>
                                      </motion.div>
                                  ) : (
                                      <div className="flex flex-col items-center text-center">
                                        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-blue-900/30">
                                            <Gavel className="w-10 h-10 text-blue-400" />
                                        </div>
                                        <p className="text-lg font-bold text-slate-300 mb-2">에코AI 전문 부패상담관 연결됨</p>
                                        <p className="text-sm max-w-md text-center leading-relaxed text-slate-400">
                                            "귀하의 제보는 철저히 익명이 보장되며,<br/>
                                            관계 법령에 근거하여 정밀 분석을 제공합니다."
                                        </p>
                                      </div>
                                  )}
                              </div>
                          )}
                          {chatLog.map((msg, idx) => (
                              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-6`}>
                                  <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-4`}>
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-cyber-600' : 'bg-slate-700'}`}>
                                          {msg.role === 'user' ? <UserCheck className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                                      </div>
                                      <div className={`p-5 rounded-2xl text-sm leading-relaxed shadow-lg whitespace-pre-wrap ${msg.role === 'user' ? 'bg-cyber-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'}`}>
                                          {msg.role === 'ai' ? renderStyledText(msg.text) : msg.text}
                                      </div>
                                  </div>
                              </div>
                          ))}
                          {isTyping && (
                              <div className="flex justify-start mb-6">
                                  <div className="flex gap-4">
                                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center shrink-0"><Bot className="w-5 h-5 text-white" /></div>
                                      <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl rounded-tl-none flex gap-2 items-center">
                                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75" />
                                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150" />
                                      </div>
                                  </div>
                              </div>
                          )}
                          <div ref={scrollRef} />
                      </div>
                      
                      <div className="relative">
                          <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                            placeholder={activeTab === 'law' ? "부패 의심 사례나 법령 질의 내용을 입력하세요..." : "상담 내용을 입력하세요..."}
                            className={`w-full bg-[#0f172a] border rounded-full pl-6 pr-14 py-4 text-white focus:outline-none transition-all shadow-lg placeholder:text-slate-600 ${activeTab === 'counseling' ? 'border-amber-900/50 focus:border-amber-500 focus:ring-1 focus:ring-amber-500' : 'border-slate-700 focus:border-cyber-accent focus:ring-1 focus:ring-cyber-accent'}`}
                          />
                          <button onClick={() => handleChatSend()} disabled={!chatInput.trim() || isTyping} className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full text-white transition-colors disabled:opacity-50 shadow-md ${activeTab === 'counseling' ? 'bg-amber-600 hover:bg-amber-500 disabled:hover:bg-amber-600' : 'bg-cyber-600 hover:bg-cyber-500 disabled:hover:bg-cyber-600'}`}>
                              <Send className="w-5 h-5" />
                          </button>
                      </div>
                      {activeTab === 'counseling' && (
                          <div className="mt-4 flex justify-end">
                              <button onClick={() => handleChatSend("정식 신고 절차를 안내해주세요")} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-bold underline decoration-red-400/50 underline-offset-4">
                                  <AlertTriangle className="w-3 h-3" /> 정식 신고 절차 안내받기
                              </button>
                          </div>
                      )}
                  </motion.div>
              )}
          </AnimatePresence>
      </div>
    </section>
  );
};

export default Diagnostics;
