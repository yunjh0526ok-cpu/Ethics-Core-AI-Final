import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scale, Users, Bot, Crown, ArrowRight, CheckSquare, LayoutDashboard, 
  HeartHandshake, Gavel, Radar, ArrowLeft, MessageSquare, 
  Send, AlertTriangle, UserCheck, Brain, Search, FileText, Sparkles, 
  Siren, ShieldAlert
} from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- TYPE DEFINITIONS ---
interface ChatMessage {
    role: 'user' | 'ai';
    text: string;
}

const renderStyledText = (text: string) => {
    return text.split('\n').map((line, i) => {
        if (line.trim().startsWith('>')) {
            return <div key={i} className="my-2 p-3 bg-slate-900/80 border-l-4 border-blue-500 rounded-r-lg text-slate-300 text-sm italic">{line.replace('>', '').trim()}</div>;
        }
        return (
            <p key={i} className="mb-2 leading-relaxed text-slate-300">
                {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        const content = part.slice(2, -2);
                        return <strong key={j} className="text-blue-400 font-bold">{content}</strong>;
                    }
                    return part;
                })}
            </p>
        );
    });
};

const DIAGNOSIS_CATEGORIES = [
  { id: 'corruption', label: '신종 부패 진단', color: 'text-yellow-500', icon: Scale, desc: '출장비 횡령, 모바일 향응 등 진화한 부패 징후 포착', checklist: ["1. 직무 정보를 이용해 부동산/주식에 투자했다.", "2. 채용 점수를 조작하거나 요건을 임의 변경했다.", "3. 관용 차량 등 공용물을 개인 용무에 썼다.", "4. 감사 회피를 위해 쪼개기 결제를 했다.", "5. 특정 업체에 특혜를 주고 보상을 약속받았다.", "6. 허위 출장을 신청하거나 사적 관광을 했다.", "7. 허가 없는 외부 활동으로 과도한 수입을 올렸다.", "8. 모바일 기프티콘, 상품권 등을 받았다.", "9. 직무관련자에게 저서 구매나 경조사비를 전가했다.", "10. 식사 후 돌아와 지문만 찍고 귀가했다."] },
  { id: 'gapjil', label: '스마트 갑질 진단', color: 'text-orange-500', icon: Crown, desc: '투명인간 취급, 책임 전가 등 교묘한 괴롭힘 판별', checklist: ["1. 중요 정보 공유에서 특정인을 고의 배제했다.", "2. 사적 심부름을 시키며 의전이라 합리화했다.", "3. 연가 신청 사유를 캐묻고 승인을 미뤘다.", "4. 민감한 업무 책임을 부하에게 떠넘겼다.", "5. 인격 모독 후 예민한 사람으로 몰았다.", "6. 퇴근 후/주말에 업무 카톡으로 압박했다.", "7. 불참 시 불이익을 암시하며 회식을 강요했다.", "8. 자신의 학위 논문 작성을 부하에게 시켰다.", "9. 공포 분위기를 조성해 정신적 고통을 주었다.", "10. 합리적 이유 없이 기피 업무만 몰아주었다."] },
  { id: 'euljil', label: '역공형 을질 진단', color: 'text-purple-500', icon: Users, desc: '무고성 신고, 악의적 태업 등 관리자 위협 행위 진단', checklist: ["1. 정당한 지시를 괴롭힘이라며 신고 협박했다.", "2. 익명 커뮤니티에 상사 비방글을 유포했다.", "3. 대화를 몰래 녹음해 협박용으로 썼다.", "4. 지시를 고의 지연하거나 누락해 방해했다.", "5. 아주 작은 협조 요청도 내 일 아니라며 거부했다.", "6. 중요 이슈를 은폐하거나 늑장 보고했다.", "7. 비협조적인 태도로 팀 분위기를 저해했다.", "8. 바쁜 시기에 당일 통보 연차를 남용했다.", "9. 공개적으로 상사 지시에 반박해 권위를 무너뜨렸다.", "10. 동료를 선동해 상사를 집단 고립시켰다."] }
];

const Diagnostics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'counseling' | 'law'>('diagnosis');
  const [diagCategory, setDiagCategory] = useState<string | null>(null);
  const [diagStep, setDiagStep] = useState<'select' | 'check' | 'result'>('select');
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'law' && chatLog.length === 0) {
        setChatLog([{ role: 'ai', text: `안녕하십니까. **에코AI 수석 부패상담관**입니다.\n\n귀하의 제보는 철저히 익명이 보장됩니다.` }]);
    }
  }, [activeTab]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatLog, isTyping]);

  const handleChatSend = async (text: string = chatInput) => {
    if (!text.trim()) return;
    setChatLog(prev => [...prev, { role: 'user', text: text }]);
    setChatInput('');
    setIsTyping(true);

    // 대표님 의견 반영: 언더바 없는 키부터 먼저 찾습니다!
    const key = process.env.NEXT_PUBLIC_APIKEY || process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY;

    try {
        const genAI = new GoogleGenerativeAI(key || "");
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: activeTab === 'law' ? "당신은 에코AI 수석 부패 감사관입니다." : "당신은 에코AI 마음치유 상담관입니다."
        });
        const result = await model.generateContent(text);
        const response = await result.response;
        setChatLog(prev => [...prev, { role: 'ai', text: response.text() }]);
    } catch (e) {
        setChatLog(prev => [...prev, { role: 'ai', text: "연결을 확인 중입니다. 잠시 후 시도해 주세요." }]);
    } finally {
        setIsTyping(false);
    }
  };

  const currentCategoryData = DIAGNOSIS_CATEGORIES.find(c => c.id === diagCategory);

  return (
    <section className="relative z-10 py-16 px-4 w-full max-w-7xl mx-auto min-h-screen bg-[#05050a] text-white">
      <div className="mb-12">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter">Echo AI Integrity</h1>
        <p className="text-blue-400 font-mono tracking-widest">DIGITAL PLATFORM</p>
      </div>

      <div className="flex border border-slate-800 rounded-lg overflow-hidden mb-8">
        <button onClick={() => setActiveTab('diagnosis')} className={`flex-1 py-4 font-bold ${activeTab === 'diagnosis' ? 'bg-slate-800 text-blue-400' : 'text-slate-500'}`}>에코AI 진단</button>
        <button onClick={() => setActiveTab('counseling')} className={`flex-1 py-4 font-bold ${activeTab === 'counseling' ? 'bg-slate-800 text-orange-400' : 'text-slate-500'}`}>마음치유</button>
        <button onClick={() => setActiveTab('law')} className={`flex-1 py-4 font-bold ${activeTab === 'law' ? 'bg-slate-800 text-blue-400' : 'text-slate-500'}`}>부패상담관</button>
      </div>

      <div className="bg-[#0b1120] border border-slate-800 rounded-3xl p-8 min-h-[500px]">
        <AnimatePresence mode="wait">
          {activeTab === 'diagnosis' ? (
            <motion.div key="diag" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {diagStep === 'select' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {DIAGNOSIS_CATEGORIES.map(cat => (
                    <div key={cat.id} className="p-8 rounded-2xl border border-slate-800 bg-[#0f172a] text-center">
                      <cat.icon className="w-12 h-12 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-4">{cat.label}</h3>
                      <button onClick={() => { setDiagCategory(cat.id); setDiagStep('check'); setCheckedItems([]); }} className="px-6 py-2 rounded-full border border-slate-600 hover:bg-white hover:text-black transition-all">시작</button>
                    </div>
                  ))}
                </div>
              )}
              {diagStep === 'check' && currentCategoryData && (
                <div>
                  <button onClick={() => setDiagStep('select')} className="text-slate-400 mb-4 block">← 뒤로가기</button>
                  <div className="space-y-3">
                    {currentCategoryData.checklist.map((item, i) => (
                      <div key={i} onClick={() => setCheckedItems(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])} className={`p-4 rounded-xl border cursor-pointer ${checkedItems.includes(i) ? 'border-blue-500 bg-slate-800' : 'border-slate-800'}`}>
                        {item}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setDiagStep('result')} className="mt-8 w-full py-4 bg-blue-600 rounded-xl font-bold">결과 보기</button>
                </div>
              )}
              {diagStep === 'result' && (
                <div className="text-center">
                  <h3 className="text-3xl font-bold mb-4">진단 점수: {checkedItems.length * 10}점</h3>
                  <button onClick={() => setActiveTab('counseling')} className="px-8 py-3 bg-blue-600 rounded-full font-bold">AI 상담 시작하기</button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[450px]">
              <div className="flex-grow overflow-y-auto mb-4 space-y-4">
                {chatLog.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-4 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-800'}`}>
                      {msg.role === 'ai' ? renderStyledText(msg.text) : msg.text}
                    </div>
                  </div>
