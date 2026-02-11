
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scale, Users, Bot, Crown, ArrowRight, 
  Terminal, Search, BarChart3, CheckSquare, 
  ChevronRight, Siren, Send, LayoutDashboard, 
  HeartHandshake, FileEdit, Sparkles, AlertTriangle, Quote, FileText, Download, ShieldAlert, CheckCircle2, ExternalLink,
  Split, Lightbulb, Gavel, Radar, Zap, Scale as ScaleIcon, BookOpen, ShieldCheck,
  Target, Mic, FileSearch, Lock, UserCheck, Fingerprint, Link as LinkIcon, ArrowLeft
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// ... (Existing Imports and Types - Keep as is, omitted for brevity but logic below includes full file content structure)

// --- TYPE DEFINITIONS ---
interface ChatMessage {
    role: 'user' | 'ai';
    text: string;
    sources?: { uri: string; title: string }[]; 
}

// ... (Existing Constants: DIAGNOSIS_CATEGORIES, MOCK_LEGAL_ADVICE, etc. - Keep as is)
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
      "1. [비가시적 따돌림] 회의나 중요 정보 공유에서 특정 직원을 고의로 배제하거나 투명 인간 취급했다. (징계 사례: 정신적 피해 인정)",
      "2. [포장된 사적지시] 개인적인 식당 예약, 택배 수령 등을 시키며 \"이것도 다 의전을 배우는 과정\"이라고 합리화했다.",
      "3. [연가 사용 침해] 정당한 연가 신청에 대해 \"요즘 바쁜데 꼭 가야겠냐\"며 구체적인 사유를 캐묻거나 승인을 미뤘다.",
      "4. [업무 떠넘기기] 본인이 결정해야 할 민감하거나 책임질 소지가 있는 업무를 부하 직원에게 기안/전결하도록 강요했다.",
      "5. [가스라이팅] 인격적 모독을 하면서도 \"다 너 성장하라고 아끼니까 하는 충고야\"라며 피해자를 예민한 사람으로 몰았다.",
      "6. [SNS 업무폭탄] 급하지 않은 업무임에도 퇴근 후나 주말에 카톡/텔레그램을 보내 답장을 요구하거나 압박했다.",
      "7. [회식 강요] \"조직 생활도 평가의 일부\"라며 불참 시 인사상 불이익이 있을 것처럼 분위기를 조성했다.",
      "8. [사적 연구 전가] 상급자의 대학원 과제, 학위 논문, 외부 강의 자료 작성을 부하 직원에게 시켰다. (행동강령 위반)",
      "9. [감정 폭력] 대놓고 욕설은 안 했지만, 인사를 무시하거나 한숨 쉬기, 키보드 세게 치기 등으로 공포 분위기를 조성했다.",
      "10. [독박 업무] 합리적 이유 없이 특정 직원에게만 기피 업무를 몰아주거나, 반대로 허드렛일만 시켜 자괴감을 줬다."
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
      "2. [여론전] 블라인드 등 익명 커뮤니티에 상사에 대한 확인되지 않은 허위 사실이나 악의적 비방글을 유포했다.",
      "3. [녹음기 악용] 업무 협의 중인 상사의 발언을 몰래 녹음하여 꼬투리를 잡거나 협박용으로 사용했다.",
      "4. [악의적 태업] 업무 지시를 받았음에도 '못 들었다', '까먹었다'며 고의로 업무를 지연시키거나 누락했다.",
      "5. [R&R 방패] 조금이라도 자신의 업무 분장 범위를 벗어나는 협조 요청에 대해 '내 일 아니다'라며 무조건 거부했다.",
      "6. [정보 차단] 상사에게 보고해야 할 중요 이슈나 사고를 고의로 은폐하거나 늑장 보고하여 곤경에 빠뜨렸다.",
      "7. [분위기 조성] 회의 시간이나 업무 중에 대놓고 한숨을 쉬거나 비협조적인 태도를 보여 팀 분위기를 망쳤다.",
      "8. [병가 남용] 업무가 가장 바쁜 시기에 진단서 없이 당일 통보로 병가나 연차를 사용하여 업무 공백을 유발했다.",
      "9. [지시 불이행] 공개적인 자리에서 상사의 지시에 대놓고 반박하거나 면박을 주어 리더십을 무력화했다.",
      "10. [집단 따돌림] 동료들을 선동하여 상사의 지시를 집단적으로 거부하거나 상사를 고립시켰다."
    ]
  }
];

const MOCK_LEGAL_ADVICE = `
## 🔍 핵심 법률 진단
귀하께서 겪으신 상황은 **「공무원 행동강령」 위반 소지가 매우 높습니다**. 특히 정당한 이유 없는 사적 노무 지시는 징계 사유에 해당합니다.

## ⚖️ 관련 근거 및 판례
- **관련 규정**: 「공무원 행동강령」 제13조의3 (직무권한 등을 행사한 부당행위의 금지)
- **유사 사례**: 최근 소청심사위원회 결정례(2022)에 따르면, 상급자가 하급자에게 지속적인 사적 심부름을 시킨 경우 '성실 의무 위반'으로 감봉 처분이 내려진 바 있습니다.

## 🛡️ 상세 대응 가이드
1. **증거 확보**: 언제, 어디서, 어떤 지시를 받았는지 **업무 수첩에 상세히 기록**하십시오. 녹취가 있다면 더욱 좋습니다.
2. **거절 의사**: 정중하지만 단호하게 업무 관련성을 물으며 거절 의사를 표시해야 '을질' 논란을 피할 수 있습니다.
3. **상담**: 기관 내 **행동강령책임관(감사실)**에게 비공개 상담을 요청하십시오.
`;

const MOCK_MIND_CARE = "많이 힘들고 억울하셨겠습니다. 공직 사회의 특성상 어디에 말하기도 힘드셨을 텐데, 용기 내어 말씀해 주셔서 감사합니다. 제가 공직자 전문 AI 파트너로서 귀하의 신분 보장과 명예를 최우선으로 하여 돕겠습니다.";

const renderStyledText = (text: string, colorClass: string, bgClass: string) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={index} className={`${colorClass} ${bgClass} font-bold px-1 py-0.5 rounded mx-0.5 box-decoration-clone inline-block leading-tight`}>
          {part.slice(2, -2)}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

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
                const {x, y} = getCoords(1.1, i);
                return (
                    <g key={i}>
                        <line x1={center} y1={center} x2={getCoords(1, i).x} y2={getCoords(1, i).y} stroke="#334155" strokeWidth="1" />
                        <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
                            {axis}
                        </text>
                    </g>
                );
            })}
            <motion.polygon
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
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

const Diagnostics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'tactics' | 'counseling'>('diagnosis');
  const [diagCategory, setDiagCategory] = useState<string | null>(null);
  const [diagStep, setDiagStep] = useState<'select' | 'check' | 'result'>('select');
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [tacticsStep, setTacticsStep] = useState<'mindcare' | 'analysis' | 'legal_check' | 'simulation' | 'report'>('mindcare');
  const [tacticsInput, setTacticsInput] = useState(''); 
  const [generatedReport, setGeneratedReport] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{ analysis: string } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [mindChatLog, setMindChatLog] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const [mindChatInput, setMindChatInput] = useState('');
  const mindChatEndRef = useRef<HTMLDivElement>(null);
  const [isMindTyping, setIsMindTyping] = useState(false);
  const [legalAgreements, setLegalAgreements] = useState({
    truth: false,
    defamation: false,
    protection: false,
    caution: false 
  });
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const ai = process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog, isTyping]);

  useEffect(() => {
    mindChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mindChatLog, isMindTyping]);

  useEffect(() => {
    setDiagStep('select');
    setDiagCategory(null);
    setCheckedItems([]);
    setTacticsStep('mindcare');
    setTacticsInput('');
    setGeneratedReport('');
    setSimulationResult(null);
    setMindChatLog([{ 
        role: 'ai', 
        text: "안녕하십니까. Ethics-CoreAI 심리 대응 센터입니다.\n\n불안하고 답답한 마음, 저에게 털어놓으셔도 됩니다.\n\n다만, **공직자 신분을 고려하여 억울하게 역풍(품위유지 위반 등)을 맞지 않도록**\n제가 관련 법령에 근거해 세밀하게 상황을 여쭤볼 수 있습니다.\n\n이는 **귀하를 법적으로 안전하게 보호하기 위함**이니\n안심하고 이야기해 주세요." 
    }]);
    setLegalAgreements({ truth: false, defamation: false, protection: false, caution: false });
  }, [activeTab]);

  const selectCategory = (id: string) => {
    setDiagCategory(id);
    setDiagStep('check');
    setCheckedItems([]);
  };

  const toggleCheck = (idx: number) => {
    if (checkedItems.includes(idx)) {
      setCheckedItems(prev => prev.filter(i => i !== idx));
    } else {
      setCheckedItems(prev => [...prev, idx]);
    }
  };

  const finishDiagnosis = () => {
    setDiagStep('result');
  };

  const startConsultFromDiagnosis = () => {
    const category = DIAGNOSIS_CATEGORIES.find(c => c.id === diagCategory);
    if (!category) return;
    const selectedContents = checkedItems.map(idx => category.checklist[idx]).join('\n');
    let initialMsg = '';
    if (checkedItems.length > 0) {
        initialMsg = `[${category.label} 결과 기반 상담 요청]\n\n자가 진단 결과, 저는 다음 항목들에 해당한다고 체크했습니다:\n\n${selectedContents}\n\n위 구체적인 상황들이 공무원 행동강령이나 법령상 어떤 위반 소지가 있는지 판례나 규정을 근거로 상세히 분석해 주세요.`;
    } else {
        initialMsg = `[${category.label} 관련 상담]\n\n자가 진단 결과 특이사항은 없었으나, 혹시 주의해야 할 ${category.label}의 주요 위반 사례나 예방 수칙을 알려주세요.`;
    }
    setActiveTab('counseling');
    setChatLog([{ role: 'user', text: initialMsg }]);
    generateLegalResponse(initialMsg);
  };

  const getRadarData = () => {
    let scores = [0.2, 0.2, 0.2, 0.2, 0.2];
    checkedItems.forEach(idx => {
       if ([0, 3].includes(idx)) scores[0] += 0.3; 
       if ([4, 5, 9].includes(idx)) scores[1] += 0.25; 
       if ([2, 8].includes(idx)) scores[2] += 0.4; 
       if ([1, 6].includes(idx)) scores[3] += 0.4; 
       if ([7].includes(idx)) scores[4] += 0.4; 
       scores = scores.map(s => Math.min(1, s + 0.05));
    });
    return scores.map(s => Math.min(1, s)); 
  };

  const handleMindChatSubmit = async () => {
    if (!mindChatInput.trim()) return;
    const msg = mindChatInput;
    setMindChatLog(prev => [...prev, { role: 'user', text: msg }]);
    setMindChatInput('');
    setIsMindTyping(true);

    if (!ai) {
        setTimeout(() => {
            setMindChatLog(prev => [...prev, { role: 'ai', text: MOCK_MIND_CARE }]);
            setIsMindTyping(false);
        }, 1500);
        return;
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: msg,
            config: {
                systemInstruction: `
                    당신은 **공공기관 공직자 전담** 심리/법률 치유 파트너 'AI Legal Partner'입니다.
                    사용자는 직장 내 괴롭힘이나 부패/부당 지시로 고통받는 **공무원 또는 공공기관 임직원**입니다.
                    
                    [상담 원칙]
                    1. **공직자 특화 공감**: "공직 사회의 특수성(위계 질서, 폐쇄성)"을 이해하며 공감해주세요.
                    2. **우선 적용 법령**: 조언 시 **「공무원 행동강령」, 「부패방지권익위법」, 「공공기관 내부 지침」**을 최우선 기준으로 삼으세요. (근로기준법은 보조적 수단)
                    3. **안전장치 마련**: 감정적 대응은 **품위유지의무 위반**이나 **무고/명예훼손**으로 역공당할 수 있음을 부드럽게 경고하세요.
                    
                    [답변 스타일]
                    - 가독성을 위해 줄바꿈을 자주 하고, 따뜻하지만 단호한 전문가의 어조를 유지하세요.
                    - 핵심 내용은 **(별표 두개)로 강조**하세요.
                `,
            }
        });
        const text = response.text || "제가 항상 곁에 있겠습니다. 당신은 보호받고 있습니다.";
        setMindChatLog(prev => [...prev, { role: 'ai', text: text }]);
    } catch (e) {
        setMindChatLog(prev => [...prev, { role: 'ai', text: "당신의 마음을 충분히 이해합니다. 제가 끝까지 돕겠습니다." }]);
    } finally {
        setIsMindTyping(false);
    }
  };

  const handleSimulation = async () => {
    setIsSimulating(true);
    setTacticsStep('simulation');

    if (!ai) {
        setTimeout(() => {
            setSimulationResult({
                analysis: "객관적 사실 관계 불충분...",
            });
            setIsSimulating(false);
        }, 2000);
        return;
    }

    try {
        const prompt = `
            사용자 상황: "${tacticsInput}"
            위 상황은 **공공기관 공직자**가 겪은 사례입니다. **AI 감사관(Audit AI)**의 관점에서 분석해줘.
            1. **[핵심 쟁점]**: **공무원 행동강령, 부패방지권익위법, 형법(모욕/명예훼손)**, 남녀고용평등법 위반 여부를 1줄로 요약.
            2. **[증거 확보]**: 감사실 신고를 위한 핵심 증거 (비밀녹음 주의, 업무수첩, 공문서 등) 1~2개.
            3. **[법적 리스크]**: **무고죄, 사실적시 명예훼손** 및 징계 양정 기준 역풍 가능성 1줄.
            *답변은 줄글이 아닌, 위 3가지 항목에 대해 명확하게 구분된 짧은 문장(카드 형태)으로 제공.*
        `;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                systemInstruction: "당신은 복잡한 법률 정보를 '전략 카드' 형태로 보여주기 위해 핵심만 추출하는 AI 분석관입니다. 긴 설명보다 명확한 '행동 지침(Action Item)'을 우선시합니다."
            }
        });
        setSimulationResult({ analysis: response.text || "" });
    } catch (e) {
        setSimulationResult({ analysis: "분석 실패. 다시 시도해주세요." });
    } finally {
        setIsSimulating(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!tacticsInput.trim()) return;
    setIsGeneratingReport(true);
    setTacticsStep('report');

    if (!ai) {
        setTimeout(() => {
            setGeneratedReport(`[사건 발생 보고서 Mock] ...`);
            setIsGeneratingReport(false);
        }, 2000);
        return;
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: tacticsInput,
            config: {
                systemInstruction: `
                    사용자의 진술을 바탕으로 '고충 사건 접수서(Draft)'를 작성하되,
                    상단에 반드시 **"본 문서는 AI가 작성한 초안으로 법적 효력이 없으며, 제출 전 반드시 전문가의 검토가 필요합니다."**라는 문구를 굵게 삽입하십시오.
                    감정적 언어를 배제하고, 육하원칙에 따라 건조하게 사실만 나열하십시오.
                    *작성 기준: 공공기관 감사실 제출용 양식*
                    - 관련 근거: 공무원 행동강령, 부패방지권익위법 등 명시
                `,
            }
        });
        setGeneratedReport(response.text || "리포트 생성 실패");
    } catch (e) {
        setGeneratedReport("리포트 생성 중 오류가 발생했습니다.");
    } finally {
        setIsGeneratingReport(false);
    }
  };

  const handleLegalChatSubmit = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatLog(prev => [...prev, { role: 'user', text: msg }]);
    setChatInput('');
    await generateLegalResponse(msg);
  };

  const generateLegalResponse = async (userMsg: string) => {
    setIsTyping(true);
    if (!ai) {
        setTimeout(() => {
            setChatLog(prev => [...prev, { role: 'ai', text: MOCK_LEGAL_ADVICE }]);
            setIsTyping(false);
        }, 2000);
        return;
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: userMsg,
            config: {
                systemInstruction: `
                    당신은 **공공기관 및 공직자 전담** 'Ethics-Core AI' 수석 법률 파트너입니다.
                    [핵심 역할]
                    사용자의 고민에 대해 **공직자 행동강령, 부패방지법, 이해충돌방지법** 등 공적 규범을 최우선으로 적용하여 진단하고, 실질적인 해결책을 제시하십시오.
                    [답변 작성 가이드]
                    1. **상세하고 친절한 어조**: 3줄 요약처럼 딱딱하게 끊지 말고, 전문 상담가처럼 **충분한 설명과 공감**을 담아 작성하십시오.
                    2. **사실 기반(Fact Check)**: 막연한 조언이 아닌, **유사한 소청심사례, 대법원 판례, 권익위 의결례**를 구체적으로 언급하여 신뢰를 주십시오.
                    3. **구체적 대응 전략 (Step-by-Step)**: 증거 수집 방법, 기관 내 신고 절차, 법적 보호 장치를 상세히 안내하십시오.
                    *주의: 검색된 출처 URL은 본문에 텍스트로 적지 마십시오. 시스템이 '참고한 출처' 버튼으로 자동 생성합니다.*
                `,
                tools: [{ googleSearch: {} }]
            }
        });
        
        let sources: { uri: string; title: string }[] = [];
        if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            sources = response.candidates[0].groundingMetadata.groundingChunks
                .map((chunk: any) => ({
                    uri: chunk.web?.uri,
                    title: chunk.web?.title || "관련 법령/판례 자료"
                }))
                .filter((s: any) => s.uri);
        }
        setChatLog(prev => [...prev, { role: 'ai', text: response.text || "답변 불가", sources: sources }]);
    } catch (error) {
        setChatLog(prev => [...prev, { role: 'ai', text: "시스템 연결 지연. 잠시 후 다시 시도해주세요." }]);
    } finally {
        setIsTyping(false);
    }
  };

  const handleBack = () => {
    sessionStorage.setItem('hero_view_mode', 'consulting');
    const event = new CustomEvent('navigate', { detail: 'home' });
    window.dispatchEvent(event);
  };

  return (
    <section id="diagnostics" className="relative w-full py-24 bg-transparent overflow-hidden min-h-screen flex flex-col justify-center">
      {/* Back Button */}
      <div className="mb-6 w-full max-w-7xl mx-auto px-4 relative z-10">
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

      <div className="max-w-7xl mx-auto px-4 relative z-10 w-full">
        <div className="mb-12 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-2">INTEGRITY INTELLIGENCE</h2>
            <p className="text-xl text-cyber-accent font-mono">Ethics-Core AI Digital Platform</p>
        </div>

        <div className="bg-[#0a0a12]/80 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[700px] flex flex-col relative">
          <div className="flex flex-col lg:flex-row border-b border-slate-800">
            <div className="p-6 md:p-8 lg:w-1/4 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950/60">
               <h2 className="text-2xl font-black text-white font-tech tracking-wider flex items-center gap-3">
                 <Terminal className="w-6 h-6 text-cyber-accent" />
                 ETHICS CMD
               </h2>
               <p className="text-slate-500 text-sm mt-1">AI Integrated System</p>
            </div>
            <div className="flex-1 flex flex-col md:flex-row bg-slate-900/40">
               <button 
                 onClick={() => setActiveTab('diagnosis')}
                 className={`flex-1 relative p-6 flex flex-col justify-center items-start transition-all duration-300 group ${activeTab === 'diagnosis' ? 'bg-slate-900/60' : 'bg-transparent hover:bg-slate-900/30'}`}
               >
                 <div className="flex items-center gap-3 mb-2">
                    <LayoutDashboard className={`w-6 h-6 ${activeTab === 'diagnosis' ? 'text-cyber-accent' : 'text-slate-600'}`} />
                    <span className={`font-bold text-xl tracking-tight ${activeTab === 'diagnosis' ? 'text-white' : 'text-slate-500'}`}>AI부패·갑질·을질 진단</span>
                 </div>
                 <p className="text-sm text-slate-500 text-left">최신 판례 데이터를 기반으로 한 30가지 행동강령 위반 유형 정밀 진단</p>
                 {activeTab === 'diagnosis' && <div className="absolute bottom-0 left-0 w-full h-1 bg-cyber-accent shadow-[0_0_10px_#06b6d4]" />}
               </button>
               <div className="w-[1px] bg-slate-800 hidden md:block" />
               <button 
                 onClick={() => setActiveTab('tactics')}
                 className={`flex-1 relative p-6 flex flex-col justify-center items-start transition-all duration-300 group ${activeTab === 'tactics' ? 'bg-[#1a100d]/60' : 'bg-transparent hover:bg-slate-900/30'}`}
               >
                 <div className="flex items-center gap-3 mb-2">
                    <HeartHandshake className={`w-6 h-6 ${activeTab === 'tactics' ? 'text-[#ff6e1e]' : 'text-slate-600'}`} />
                    <span className={`font-bold text-xl ${activeTab === 'tactics' ? 'text-white' : 'text-slate-500'}`}>AI 심리 치유 & 실전 대응</span>
                 </div>
                 <p className="text-sm text-slate-500 text-left">심리 보호부터 증거 확보 전략, 신고서 자동 작성까지 완벽 가이드</p>
                 {activeTab === 'tactics' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#ff6e1e] shadow-[0_0_10px_#ff6e1e]" />}
               </button>
               <div className="w-[1px] bg-slate-800 hidden md:block" />
               <button 
                 onClick={() => setActiveTab('counseling')}
                 className={`flex-1 relative p-6 flex flex-col justify-center items-start transition-all duration-300 group ${activeTab === 'counseling' ? 'bg-slate-900/60' : 'bg-transparent hover:bg-slate-900/30'}`}
               >
                 <div className="flex items-center gap-3 mb-2">
                    <ScaleIcon className={`w-6 h-6 ${activeTab === 'counseling' ? 'text-cyber-purple' : 'text-slate-600'}`} />
                    <span className={`font-bold text-xl tracking-tight ${activeTab === 'counseling' ? 'text-white' : 'text-slate-500'}`}>AI부패·갑질·을질 법령자문</span>
                 </div>
                 <p className="text-sm text-slate-500 text-left">공무원 행동강령 및 감사 징계 사례에 기반한 실시간 법률 팩트체크</p>
                 {activeTab === 'counseling' && <div className="absolute bottom-0 left-0 w-full h-1 bg-cyber-purple shadow-[0_0_10px_#8b5cf6]" />}
               </button>
            </div>
          </div>
          <div className="flex-grow p-6 relative bg-transparent overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === 'diagnosis' && (
                <motion.div
                  key="diagnosis"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full flex flex-col"
                >
                    {diagStep === 'select' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-center">
                            {DIAGNOSIS_CATEGORIES.map((cat) => (
                                <button 
                                    key={cat.id} 
                                    onClick={() => selectCategory(cat.id)}
                                    className={`relative group h-[340px] rounded-3xl border border-slate-700 bg-slate-900/60 backdrop-blur-sm hover:bg-slate-900/80 hover:border-2 hover:${cat.border} transition-all duration-300 flex flex-col items-center justify-center p-8 text-center overflow-hidden`}
                                >
                                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-${cat.color.split('-')[1]}-500`} />
                                    <div className={`w-20 h-20 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:${cat.color} group-hover:border-current`}>
                                        <cat.icon className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-2">{cat.label}</h3>
                                    <span className={`text-sm font-mono uppercase tracking-widest ${cat.color} mb-6`}>{cat.sub}</span>
                                    <p className="text-slate-400 group-hover:text-slate-200 transition-colors">{cat.desc}</p>
                                    <div className={`mt-8 px-6 py-2 rounded-full border border-slate-600 text-slate-400 group-hover:bg-${cat.bg} group-hover:text-white group-hover:border-transparent transition-all flex items-center gap-2`}>
                                        진단 시작 <ArrowRight className="w-4 h-4" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                    {diagStep === 'check' && diagCategory && (
                        <div className="max-w-5xl mx-auto w-full h-full flex flex-col">
                            <div className="mb-8 flex items-center gap-4 border-b border-slate-800 pb-4">
                                <button onClick={() => setDiagStep('select')} className="p-2 hover:bg-slate-800 rounded-full text-slate-400"><ArrowRight className="w-6 h-6 rotate-180" /></button>
                                <h3 className={`text-2xl font-bold ${DIAGNOSIS_CATEGORIES.find(c=>c.id===diagCategory)?.color}`}>
                                    {DIAGNOSIS_CATEGORIES.find(c=>c.id===diagCategory)?.label} 체크리스트 (10문항)
                                </h3>
                            </div>
                            <div className="flex-grow space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                                {DIAGNOSIS_CATEGORIES.find(c=>c.id===diagCategory)?.checklist.map((item, idx) => (
                                    <div 
                                        key={idx}
                                        onClick={() => toggleCheck(idx)}
                                        className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 backdrop-blur-sm ${checkedItems.includes(idx) ? 'bg-slate-800/80 border-cyber-accent' : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/60'}`}
                                    >
                                        <div className={`mt-1 w-6 h-6 rounded border flex items-center justify-center shrink-0 ${checkedItems.includes(idx) ? 'bg-cyber-accent border-cyber-accent' : 'border-slate-600'}`}>
                                            {checkedItems.includes(idx) && <CheckSquare className="w-4 h-4 text-black" />}
                                        </div>
                                        <span className={`text-base md:text-lg ${checkedItems.includes(idx) ? 'text-white font-medium' : 'text-slate-400'}`}>{item}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button onClick={finishDiagnosis} className="px-10 py-4 bg-cyber-600 hover:bg-cyber-500 text-white font-bold rounded-xl text-lg flex items-center gap-2 shadow-lg">
                                    진단 완료 <BarChart3 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                    {diagStep === 'result' && (
                        <div className="w-full h-full flex flex-col lg:flex-row gap-8 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="flex-1 bg-slate-900/50 border border-slate-700 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md">
                                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-accent to-transparent opacity-50" />
                                <div className="relative w-56 h-56 mb-8 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="112" cy="112" r="100" stroke="#1e293b" strokeWidth="15" fill="none" />
                                        <motion.circle 
                                            cx="112" cy="112" r="100" 
                                            stroke={checkedItems.length <= 2 ? '#22c55e' : checkedItems.length <= 6 ? '#eab308' : '#ef4444'} 
                                            strokeWidth="15" 
                                            fill="none" 
                                            strokeDasharray="628" 
                                            strokeDashoffset="628"
                                            initial={{ strokeDashoffset: 628 }}
                                            animate={{ strokeDashoffset: 628 - (628 * (checkedItems.length * 10) / 100) }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute flex flex-col items-center">
                                        <span className="text-6xl font-black text-white">{checkedItems.length * 10}</span>
                                        <span className="text-sm text-slate-400 font-mono tracking-widest mt-1">RISK SCORE</span>
                                    </div>
                                </div>
                                <h3 className={`text-3xl font-bold mb-4 ${checkedItems.length <= 2 ? 'text-green-500' : checkedItems.length <= 6 ? 'text-yellow-500' : 'text-red-500'}`}>
                                    {checkedItems.length <= 2 ? '관심 단계 (Attention)' : checkedItems.length <= 6 ? '경고 단계 (Warning)' : '위험 단계 (Danger)'}
                                </h3>
                                <p className="text-slate-400 text-center text-sm leading-relaxed max-w-sm mb-6">
                                    총 10개 항목 중 <strong className="text-white">{checkedItems.length}개</strong>의 위험 징후가 포착되었습니다.
                                </p>
                                <button onClick={startConsultFromDiagnosis} className="w-full py-4 bg-cyber-600 hover:bg-cyber-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:scale-105">
                                    <Bot className="w-5 h-5" /> AI 심층 상담 시작
                                </button>
                            </div>
                            <div className="flex-1 bg-slate-900/50 border border-slate-700 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[400px] backdrop-blur-md">
                                <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                                    <Radar className="w-5 h-5 text-cyber-accent" /> Risk Dimensions
                                </h4>
                                <div className="w-full max-w-[300px] aspect-square">
                                    <RadarChart 
                                        data={getRadarData()} 
                                        color={DIAGNOSIS_CATEGORIES.find(c => c.id === diagCategory)?.color || 'text-cyber-accent'} 
                                    />
                                </div>
                            </div>
                            <div className="flex-1 bg-slate-900/50 border border-slate-700 rounded-3xl p-6 flex flex-col backdrop-blur-md">
                                <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-500" /> Critical Violations
                                </h4>
                                <div className="flex-grow space-y-3 overflow-y-auto pr-1 custom-scrollbar max-h-[400px]">
                                    {checkedItems.map(idx => {
                                        const category = DIAGNOSIS_CATEGORIES.find(c => c.id === diagCategory);
                                        return (
                                            <div key={idx} className="bg-slate-800 p-4 rounded-xl border-l-4 border-red-500">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="bg-red-500/20 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">High Risk</span>
                                                    <span className="text-slate-500 text-xs font-mono">CODE-{idx+1}</span>
                                                </div>
                                                <p className="text-slate-300 text-sm leading-snug">{category?.checklist[idx]}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-800">
                                    <button onClick={() => setDiagStep('select')} className="w-full py-3 text-slate-400 hover:text-white text-sm font-bold transition-colors">
                                        진단 초기화
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
              )}
              {activeTab === 'tactics' && (
                <motion.div
                  key="tactics"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full flex flex-col"
                >
                    <div className="mb-6 flex flex-wrap items-center gap-2 text-xs md:text-sm font-mono uppercase tracking-wider text-slate-500 justify-center md:justify-start">
                        <span className={tacticsStep === 'mindcare' ? "text-[#ff6e1e] font-bold" : ""}>1. MIND CARE</span> <ChevronRight className="w-3 h-3" />
                        <span className={tacticsStep === 'analysis' ? "text-[#ff6e1e] font-bold" : ""}>2. SITUATION</span> <ChevronRight className="w-3 h-3" />
                        <span className={tacticsStep === 'legal_check' ? "text-[#ff6e1e] font-bold" : ""}>3. SAFETY CHECK</span> <ChevronRight className="w-3 h-3" />
                        <span className={tacticsStep === 'simulation' ? "text-[#ff6e1e] font-bold" : ""}>4. STRATEGY</span> <ChevronRight className="w-3 h-3" />
                        <span className={tacticsStep === 'report' ? "text-[#ff6e1e] font-bold" : ""}>5. REPORT</span>
                    </div>
                    <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar h-full">
                        {tacticsStep === 'mindcare' && (
                            <div className="max-w-5xl mx-auto h-full flex flex-col justify-center">
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#ff6e1e]/10 border border-[#ff6e1e]/30 mb-3 shadow-[0_0_30px_rgba(255,110,30,0.2)]">
                                        <HeartHandshake className="w-8 h-8 text-[#ff6e1e]" />
                                    </div>
                                    <h3 className="text-3xl font-black text-white mb-2 tracking-tight">AI COUNSELOR</h3>
                                    <p className="text-slate-400 text-base">
                                        당신의 마음을 보호하되, 객관적 진실을 함께 찾습니다.
                                    </p>
                                </div>
                                <div className="bg-[#1a100d]/80 backdrop-blur-sm border border-[#ff6e1e]/20 rounded-[2rem] p-6 md:p-8 mb-4 overflow-y-auto space-y-6 shadow-inner h-[450px] custom-scrollbar relative">
                                    {mindChatLog.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-center'}`}>
                                            <div className={`max-w-[90%] p-6 rounded-2xl text-base md:text-lg leading-relaxed shadow-lg ${
                                                msg.role === 'user' 
                                                ? 'bg-[#ff6e1e] text-white rounded-tr-none font-warm' 
                                                : 'bg-[#2a1d1a] text-slate-100 border border-[#ff6e1e]/30 rounded-tl-none w-full text-center font-warm'
                                            }`}>
                                                {msg.role === 'ai' && (
                                                    <div className="flex items-center justify-center gap-2 mb-4 text-sm font-black text-[#ff6e1e] tracking-[0.2em] uppercase border-b border-[#ff6e1e]/20 pb-3 font-sans">
                                                        <Sparkles className="w-4 h-4"/> AI LEGAL PARTNER
                                                    </div>
                                                )}
                                                <div className="whitespace-pre-wrap opacity-95">
                                                    {renderStyledText(msg.text, 'text-[#ff6e1e]', 'bg-[#ff6e1e]/10')}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {isMindTyping && (
                                        <div className="flex justify-center">
                                            <div className="bg-[#2a1d1a] border border-[#ff6e1e]/30 p-4 rounded-full flex items-center gap-2">
                                                <div className="w-2 h-2 bg-[#ff6e1e] rounded-full animate-bounce" />
                                                <div className="w-2 h-2 bg-[#ff6e1e] rounded-full animate-bounce delay-100" />
                                                <div className="w-2 h-2 bg-[#ff6e1e] rounded-full animate-bounce delay-200" />
                                            </div>
                                        </div>
                                    )}
                                    <div ref={mindChatEndRef} />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <div className="relative w-full">
                                        <textarea 
                                            value={mindChatInput}
                                            onChange={(e) => setMindChatInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if(e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleMindChatSubmit();
                                                }
                                            }}
                                            placeholder="감정보다는 '언제, 어디서, 무슨 일이 있었는지' 사실 위주로 말씀해주시면 더 정확합니다..."
                                            className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-6 py-4 pr-16 text-white font-warm text-base focus:outline-none focus:border-[#ff6e1e] resize-none h-[70px] shadow-lg leading-relaxed placeholder:text-slate-500 placeholder:font-sans"
                                        />
                                        <button 
                                            onClick={handleMindChatSubmit}
                                            disabled={!mindChatInput.trim() || isMindTyping}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-[#ff6e1e] rounded-xl text-white hover:bg-[#e05d15] disabled:opacity-50 transition-colors"
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="flex justify-end">
                                        <button 
                                            onClick={() => setTacticsStep('analysis')}
                                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 border border-slate-700 transition-colors"
                                        >
                                            신고 절차 진행 <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {tacticsStep === 'analysis' && (
                            <div className="max-w-3xl mx-auto mt-4 h-full flex flex-col">
                                <div className="mb-4">
                                    <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                                        <Siren className="w-6 h-6 text-[#ff6e1e]" /> 정식 신고 준비 (Fact Check)
                                    </h3>
                                    <p className="text-slate-400 text-sm">
                                        신고서(진정서) 작성을 위해 육하원칙에 따라 사건을 기술해 주세요.<br/>
                                        작성된 내용은 다음 단계에서 법적/규정적 검토를 거칩니다.
                                    </p>
                                </div>
                                <textarea 
                                    value={tacticsInput}
                                    onChange={(e) => setTacticsInput(e.target.value)}
                                    placeholder="예) 2024년 5월 20일 오후 3시경, 팀장님이 회의실에서..."
                                    className="flex-grow w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 text-white text-lg focus:border-[#ff6e1e] focus:outline-none resize-none mb-6 leading-relaxed custom-scrollbar"
                                />
                                <div className="flex justify-between items-center pb-4">
                                    <button onClick={() => setTacticsStep('mindcare')} className="text-slate-500 hover:text-white flex items-center gap-2">
                                        <ChevronRight className="w-4 h-4 rotate-180" /> 심리 케어로 돌아가기
                                    </button>
                                    <button 
                                        onClick={() => setTacticsStep('legal_check')} 
                                        disabled={!tacticsInput.trim()} 
                                        className="px-8 py-4 bg-[#ff6e1e] hover:bg-[#e05d15] text-white font-bold rounded-xl text-lg shadow-[0_0_20px_rgba(255,110,30,0.3)] disabled:opacity-50 flex items-center gap-2"
                                    >
                                        법적 보호 검토 (필수) <ShieldAlert className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                        {tacticsStep === 'legal_check' && (
                            <div className="max-w-3xl mx-auto h-full flex flex-col justify-center">
                                <div className="bg-[#1a0f0f]/80 backdrop-blur-md border border-red-900/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-[#ff6e1e]" />
                                    <div className="text-center mb-8">
                                        <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                        <h3 className="text-3xl font-bold text-white mb-2">신고 전 필수 확인 사항 (Strategic Protection)</h3>
                                        <p className="text-slate-400">귀하의 안전을 위한 전략적 보호 단계입니다.</p>
                                    </div>
                                    <div className="space-y-4 mb-8">
                                        <div 
                                            onClick={() => setLegalAgreements(p => ({...p, truth: !p.truth}))}
                                            className={`p-4 rounded-xl border cursor-pointer flex items-center gap-4 transition-all ${legalAgreements.truth ? 'bg-green-500/10 border-green-500' : 'bg-slate-900/50 border-slate-800'}`}
                                        >
                                            <div className={`w-6 h-6 rounded border flex items-center justify-center ${legalAgreements.truth ? 'bg-green-500 border-green-500' : 'border-slate-600'}`}>
                                                {legalAgreements.truth && <CheckSquare className="w-4 h-4 text-white" />}
                                            </div>
                                            <span className="text-slate-200 text-sm md:text-base">작성 내용은 100% 사실에 기반하였음을 확인합니다.</span>
                                        </div>
                                         <div 
                                            onClick={() => setLegalAgreements(p => ({...p, defamation: !p.defamation}))}
                                            className={`p-4 rounded-xl border cursor-pointer flex items-center gap-4 transition-all ${legalAgreements.defamation ? 'bg-green-500/10 border-green-500' : 'bg-slate-900/50 border-slate-800'}`}
                                        >
                                            <div className={`w-6 h-6 rounded border flex items-center justify-center ${legalAgreements.defamation ? 'bg-green-500 border-green-500' : 'border-slate-600'}`}>
                                                {legalAgreements.defamation && <CheckSquare className="w-4 h-4 text-white" />}
                                            </div>
                                            <span className="text-slate-200 text-sm md:text-base">공익 목적의 신고이며, 비방 목적이 아님을 인지합니다.</span>
                                        </div>
                                        <div 
                                            onClick={() => setLegalAgreements(p => ({...p, protection: !p.protection}))}
                                            className={`p-4 rounded-xl border cursor-pointer flex items-center gap-4 transition-all ${legalAgreements.protection ? 'bg-green-500/10 border-green-500' : 'bg-slate-900/50 border-slate-800'}`}
                                        >
                                            <div className={`w-6 h-6 rounded border flex items-center justify-center ${legalAgreements.protection ? 'bg-green-500 border-green-500' : 'border-slate-600'}`}>
                                                {legalAgreements.protection && <CheckSquare className="w-4 h-4 text-white" />}
                                            </div>
                                            <span className="text-slate-200 text-sm md:text-base">증거가 부족할 경우 신고가 기각될 수 있음을 인지하였습니다.</span>
                                        </div>
                                         <div 
                                            onClick={() => setLegalAgreements(p => ({...p, caution: !p.caution}))}
                                            className={`p-4 rounded-xl border cursor-pointer flex items-center gap-4 transition-all ${legalAgreements.caution ? 'bg-green-500/10 border-green-500' : 'bg-slate-900/50 border-slate-800'}`}
                                        >
                                            <div className={`w-6 h-6 rounded border flex items-center justify-center ${legalAgreements.caution ? 'bg-green-500 border-green-500' : 'border-slate-600'}`}>
                                                {legalAgreements.caution && <CheckSquare className="w-4 h-4 text-white" />}
                                            </div>
                                            <span className="text-slate-200 text-sm md:text-base font-bold text-green-200">최종 동의합니다.</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleSimulation} 
                                        disabled={!Object.values(legalAgreements).every(v => v)} 
                                        className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-lg shadow-[0_0_20px_rgba(34,197,94,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        위험성 고지 확인 및 전략 시뮬레이션 <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                        {tacticsStep === 'simulation' && (
                             <div className="max-w-6xl mx-auto h-full flex flex-col">
                                 {isSimulating ? (
                                     <div className="flex-grow flex flex-col items-center justify-center text-center">
                                         <div className="w-16 h-16 border-4 border-cyber-accent border-t-transparent rounded-full animate-spin mb-6" />
                                         <h3 className="text-2xl font-bold text-white mb-2">Analyzing Strategy...</h3>
                                     </div>
                                 ) : (
                                     <div className="h-full flex flex-col overflow-y-auto pr-2 custom-scrollbar pb-6">
                                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6 hover:border-slate-500 transition-colors">
                                                <div className="flex items-center gap-2 mb-4 text-cyber-400 font-bold">
                                                    <FileSearch className="w-5 h-5" /> 핵심 쟁점 (Key Issue)
                                                </div>
                                                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap markdown-body">
                                                    {simulationResult?.analysis.split('2.')[0].replace('1.', '').trim()}
                                                </div>
                                            </div>
                                            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6 hover:border-slate-500 transition-colors">
                                                <div className="flex items-center gap-2 mb-4 text-green-400 font-bold">
                                                    <Mic className="w-5 h-5" /> 증거 확보 전략 (Action)
                                                </div>
                                                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap markdown-body">
                                                    {simulationResult?.analysis.split('2.')[1]?.split('3.')[0].trim() || "증거 확보 전략 분석 중..."}
                                                </div>
                                            </div>
                                            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6 hover:border-slate-500 transition-colors">
                                                <div className="flex items-center gap-2 mb-4 text-red-400 font-bold">
                                                    <Lock className="w-5 h-5" /> 예상 리스크 (Risk)
                                                </div>
                                                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap markdown-body">
                                                    {simulationResult?.analysis.split('3.')[1]?.trim() || "리스크 분석 중..."}
                                                </div>
                                            </div>
                                         </div>
                                         <div className="flex justify-center">
                                             <button 
                                                 onClick={handleGenerateReport}
                                                 className="px-8 py-3 bg-[#ff6e1e] hover:bg-[#e05d15] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,110,30,0.3)]"
                                             >
                                                 리포트 초안 생성 <FileEdit className="w-4 h-4" />
                                             </button>
                                         </div>
                                     </div>
                                 )}
                             </div>
                        )}
                        {tacticsStep === 'report' && (
                             <div className="max-w-4xl mx-auto h-full flex flex-col">
                                {isGeneratingReport ? (
                                    <div className="flex-grow flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 border-4 border-[#ff6e1e] border-t-transparent rounded-full animate-spin mb-6" />
                                        <h3 className="text-2xl font-bold text-white mb-2">Generating Final Report...</h3>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col">
                                        <div className="flex-grow bg-white/90 backdrop-blur text-black p-8 rounded-xl overflow-y-auto shadow-2xl font-serif leading-relaxed whitespace-pre-wrap text-sm md:text-base relative">
                                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5">
                                                <span className="text-9xl font-black -rotate-45">DRAFT</span>
                                            </div>
                                            {generatedReport}
                                        </div>
                                        <div className="mt-6 flex justify-center gap-4">
                                            <button onClick={() => setTacticsStep('simulation')} className="text-slate-500 hover:text-white text-sm">전략 화면으로</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
              )}
              {activeTab === 'counseling' && (
                  <motion.div
                    key="counseling"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="h-full flex flex-col"
                  >
                     <div className="bg-[#13132b]/80 p-6 rounded-t-3xl border-b border-slate-800 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-cyber-purple/20 border border-cyber-purple flex items-center justify-center">
                            <Bot className="w-6 h-6 text-cyber-purple" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Ethics-Core AI 전문 법률 파트너</h3>
                            <p className="text-cyber-purple text-xs font-mono flex items-center gap-2">
                                <Search className="w-3 h-3" /> GOOGLE SEARCH GROUNDING ACTIVE
                            </p>
                        </div>
                     </div>
                     <div className="flex-grow bg-[#0a0a12]/40 border border-t-0 border-slate-800 p-8 mb-4 overflow-y-auto rounded-b-3xl">
                        {chatLog.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                                <Bot className="w-16 h-16 text-slate-600 mb-4" />
                                <h3 className="text-2xl font-bold text-slate-400 mb-2">무엇을 도와드릴까요?</h3>
                                <p className="text-slate-500 max-w-md">
                                    "공무원 행동강령 위반 사례 알려줘"<br/>
                                    "직장 내 괴롭힘 판단 기준(고용노동부)은?"<br/>
                                    <strong>웹 검색을 통해 팩트에 기반한 정확한 답변을 드립니다.</strong>
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {chatLog.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[90%] p-6 rounded-2xl text-lg leading-relaxed shadow-lg backdrop-blur-sm ${msg.role === 'user' ? 'bg-slate-700/80 text-white rounded-tr-none' : 'bg-[#13132b]/80 border border-slate-700 text-slate-200 rounded-tl-none'}`}>
                                            {msg.role === 'ai' && (
                                                <div className="mb-4 pb-2 border-b border-slate-700 flex items-center justify-between">
                                                    <span className="text-xs font-bold text-cyber-purple flex items-center gap-1"><BookOpen className="w-3 h-3"/> AI LEGAL ANALYSIS</span>
                                                </div>
                                            )}
                                            <div className="whitespace-pre-wrap">
                                                {renderStyledText(msg.text, 'text-cyber-accent', 'bg-cyber-accent/10')}
                                            </div>
                                            {msg.sources && msg.sources.length > 0 && (
                                                <div className="mt-6 pt-4 border-t border-slate-700/50">
                                                    <div className="flex items-center gap-2 mb-3">
                                                         <Search className="w-4 h-4 text-cyber-accent" />
                                                         <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">참고한 출처 (References)</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {msg.sources.map((src, i) => (
                                                            <a 
                                                                key={i} 
                                                                href={src.uri} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer" 
                                                                className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:border-cyber-accent rounded-lg text-xs text-slate-300 hover:text-white transition-all duration-300 group max-w-full"
                                                            >
                                                                <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center shrink-0 group-hover:bg-cyber-accent/20">
                                                                    <LinkIcon className="w-3 h-3 text-cyber-accent" />
                                                                </div>
                                                                <span className="truncate max-w-[200px]">{src.title}</span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                     </div>
                     <div className="relative">
                        <textarea 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => {
                                if(e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleLegalChatSubmit();
                                }
                            }}
                            placeholder="궁금하신 법령이나 현재 상황을 상세히 입력해주세요..."
                            className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl px-6 py-4 pr-20 text-white text-lg focus:outline-none focus:border-cyber-purple resize-none h-[80px] scrollbar-hide backdrop-blur-sm"
                        />
                        <button 
                            onClick={handleLegalChatSubmit}
                            disabled={!chatInput.trim() || isTyping}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-cyber-purple rounded-xl text-white hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                     </div>
                  </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Diagnostics;
