import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Thermometer, MessageCircle, Sparkles, ArrowLeft, RefreshCw, Loader2, WifiOff, Quote, ArrowRight, Venus, Mars } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

// ===================== 탭 타입 =====================
type TabType = 'gender' | 'sensitivity' | 'love' | 'temp';

// ===================== 관계 온도 진단 질문 =====================
const TEMP_QUESTIONS = [
  {
    id: 0,
    question: "상대방이 말할 때 나는?",
    options: [
      { label: "끝까지 들으며 공감한다", value: 5 },
      { label: "듣다가 내 말을 끼워 넣는다", value: 3 },
      { label: "딴 생각을 하거나 폰을 본다", value: 1 },
    ]
  },
  {
    id: 1,
    question: "갈등이 생겼을 때 나는?",
    options: [
      { label: "솔직하게 말하고 함께 해결한다", value: 5 },
      { label: "일단 피하고 나중에 풀린다", value: 3 },
      { label: "속으로만 삭히고 넘긴다", value: 1 },
    ]
  },
  {
    id: 2,
    question: "상대방의 힘든 일에 나는?",
    options: [
      { label: "먼저 연락하고 챙긴다", value: 5 },
      { label: "알면 챙기지만 먼저 찾진 않는다", value: 3 },
      { label: "각자 알아서라고 생각한다", value: 1 },
    ]
  },
  {
    id: 3,
    question: "상대방이 내 말에 동의 안 할 때 나는?",
    options: [
      { label: "왜 그렇게 생각하는지 물어본다", value: 5 },
      { label: "한 번 더 설득하고 넘긴다", value: 3 },
      { label: "답답하거나 화가 난다", value: 1 },
    ]
  },
  {
    id: 4,
    question: "이 관계에서 나는 지금?",
    options: [
      { label: "편안하고 솔직하게 나를 표현할 수 있다", value: 5 },
      { label: "좋지만 어딘가 불편함이 있다", value: 3 },
      { label: "지치거나 거리감이 느껴진다", value: 1 },
    ]
  },
];

const getTempResult = (score: number) => {
  if (score >= 20) return { emoji: "🔥", label: "뜨거움 (85°C+)", color: "text-red-400", bg: "border-red-500/40", desc: "이 관계, 정말 따뜻하네요. 서로를 진심으로 대하고 있어요. 이 온도 계속 유지하세요!", advice: "지금 이 온기를 말로 표현해보세요. '고마워', '네가 있어서 다행이야' 한 마디가 온도를 더 올려줍니다." };
  if (score >= 14) return { emoji: "☀️", label: "따뜻함 (50~84°C)", color: "text-amber-400", bg: "border-amber-500/40", desc: "전반적으로 괜찮은 관계예요. 다만 어딘가 아직 덜 열린 부분이 있어요.", advice: "서로 불편했던 것 하나씩 꺼내 이야기해보세요. 용기 있는 대화가 온도를 올립니다." };
  if (score >= 8) return { emoji: "🌤️", label: "미지근함 (20~49°C)", color: "text-blue-300", bg: "border-blue-400/40", desc: "관계가 조금 식어가고 있어요. 바빠서일 수도 있고, 쌓인 것이 있을 수도 있어요.", advice: "오늘 먼저 연락해보세요. 작은 관심이 온도를 다시 올려줍니다." };
  return { emoji: "❄️", label: "차가움 (0~19°C)", color: "text-slate-400", bg: "border-slate-500/40", desc: "많이 지쳐있거나 거리감이 생긴 상태예요. 억지로 유지하기보다 솔직한 대화가 필요해요.", advice: "억지로 따뜻한 척하지 않아도 돼요. '우리 요즘 좀 어색한 것 같아'라고 먼저 말해보는 것도 용기입니다." };
};

// ===================== 성인지 감수성 체크 문항 =====================
const SENSITIVITY_CHECKS = [
  { id: 1, text: "'여자니까 꼼꼼하겠네'라고 말하는 것은 칭찬이다." },
  { id: 2, text: "'남자가 왜 그렇게 예민해?'라는 말은 문제가 없다." },
  { id: 3, text: "회식 자리에서 여직원에게 술을 따르라고 하는 건 관행이다." },
  { id: 4, text: "임산부에게 '애는 언제 낳아요?'라고 묻는 건 친근감 표현이다." },
  { id: 5, text: "남성 육아휴직은 눈치 보이는 게 당연하다." },
  { id: 6, text: "'여자들끼리는 뒷담화를 많이 한다'는 말은 그냥 통계적 사실이다." },
];

const getSensitivityResult = (wrongs: number) => {
  if (wrongs === 0) return { emoji: "🌟", label: "성인지 감수성 만점!", color: "text-green-400", desc: "완벽해요! 상대방 입장에서 생각하는 능력이 뛰어납니다.", advice: "이 감수성을 주변에 자연스럽게 나눠주세요. 말 한마디가 조직문화를 바꿉니다." };
  if (wrongs <= 2) return { emoji: "👍", label: "감수성 양호", color: "text-blue-400", desc: "대부분 잘 알고 있지만 몇 가지 놓친 부분이 있어요.", advice: "틀린 항목을 다시 살펴보세요. '나쁜 의도가 없어도 상처가 된다'는 걸 기억하세요." };
  if (wrongs <= 4) return { emoji: "⚠️", label: "주의 필요", color: "text-amber-400", desc: "일부 고정관념이 남아있어요. 인식의 업데이트가 필요해요.", advice: "'이게 왜 문제지?' 싶은 항목이 있다면, 그 불편함이 시작점입니다. 조금만 더 생각해보세요." };
  return { emoji: "🚨", label: "성인지 감수성 점검 필요", color: "text-red-400", desc: "많은 고정관념이 자연스럽게 느껴지는 상태예요. 상대방은 상처받았을 수 있어요.", advice: "악의 없는 말도 상처가 됩니다. '그냥 농담인데'라는 생각부터 내려놓아 보세요." };
};

// ===================== 컴포넌트 =====================
const RelationshipThermometer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('gender');

  // 성별 갈등 번역기 상태
  const [genderInput, setGenderInput] = useState('');
  const [genderResult, setGenderResult] = useState('');
  const [genderPlan, setGenderPlan] = useState({ male: '번역 버튼을 누르면 처방전이 나옵니다 💊', female: '입력한 내용에 따라 상황별 대처법을 알려드려요 😊' });
  const [genderLoading, setGenderLoading] = useState(false);
  const [genderFallback, setGenderFallback] = useState(false);

  // 성인지 감수성 체크 상태
  const [sensitivityAnswers, setSensitivityAnswers] = useState<Record<number, boolean>>({});
  const [sensitivityDone, setSensitivityDone] = useState(false);

  // 연애 상담 상태
  const [loveInput, setLoveInput] = useState('');
  const [loveResult, setLoveResult] = useState('');
  const [loveLoading, setLoveLoading] = useState(false);
  const [loveFallback, setLoveFallback] = useState(false);

  // 관계 온도 진단 상태
  const [tempStep, setTempStep] = useState(0);
  const [tempScores, setTempScores] = useState<number[]>([]);
  const [tempDone, setTempDone] = useState(false);

  const cleanText = (t: string) => t.replace(/\*\*/g, '').replace(/##/g, '').replace(/__/g, '').trim();

  const handleBack = () => {
    sessionStorage.setItem('hero_view_mode', 'consulting');
    const event = new CustomEvent('navigate', { detail: 'home' });
    window.dispatchEvent(event);
  };

  // ===== 성별 갈등 번역 =====
  const handleGenderTranslate = async () => {
    if (!genderInput.trim()) return;
    setGenderLoading(true);
    setGenderResult('');
    setGenderFallback(false);
    try {
      if (!genAI) throw new Error("No API Key");
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `다음 말이나 상황을 분석해줘: "${genderInput}"`,
        config: {
          systemInstruction: `
            당신은 남녀 간 소통 갈등을 유머러스하고 따뜻하게 해결하는 '관계 온도계 AI'입니다.
            입력된 말이나 상황을 분석해 반드시 JSON으로만 출력하세요. 마크다운 기호 절대 금지.
            1. translatedText: 상대방 입장에서 어떻게 들렸을지 공감적으로 재해석. 숨겨진 감정이나 의도를 유머있게 설명.
            2. maleTip: 이 상황에서 남성/선배 쪽이 실천할 수 있는 구체적인 소통 방법 1줄.
            3. femaleTip: 이 상황에서 여성/후배 쪽이 활용할 수 있는 구체적인 대처법 1줄.
            Tone: 따뜻하고 유머러스, 어느 성별도 비하하지 않음. 한국어로 답할 것.
          `,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translatedText: { type: Type.STRING },
              maleTip: { type: Type.STRING },
              femaleTip: { type: Type.STRING },
            },
            required: ["translatedText", "maleTip", "femaleTip"]
          }
        }
      });
      const rawText = typeof response.text === 'function' ? response.text() : (response.text || "{}");
      const json = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());
      setGenderResult(cleanText(json.translatedText || ''));
      setGenderPlan({
        male: cleanText(json.maleTip || '서로의 다름을 인정하는 것이 먼저입니다.'),
        female: cleanText(json.femaleTip || '불편함을 구체적으로 표현해보세요.'),
      });
    } catch {
      setGenderResult("서로 다른 언어를 쓰는 것 같지만, 사실 원하는 건 같아요. 인정받고 싶고, 존중받고 싶은 마음이죠.");
      setGenderPlan({
        male: "'왜 그렇게 생각해?'라는 질문 하나가 갈등을 줄여줍니다.",
        female: "불편하면 그 자리에서 바로 말하는 게 쌓이지 않아요."
      });
      setGenderFallback(true);
    } finally {
      setGenderLoading(false);
    }
  };

  // ===== 연애 상담 =====
  const handleLoveCounsel = async () => {
    if (!loveInput.trim()) return;
    setLoveLoading(true);
    setLoveResult('');
    setLoveFallback(false);
    try {
      if (!genAI) throw new Error("No API Key");
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `다음 연애/관계 고민을 상담해줘: "${loveInput}"`,
        config: {
          systemInstruction: `
            당신은 따뜻하고 현실적인 연애·직장 내 관계 상담 AI입니다.
            특히 직장 내 관계(썸, 짝사랑, 직장동료와의 연애 고민)에 특화되어 있습니다.
            공감 먼저, 조언은 현실적으로, 유머는 살짝 곁들이세요.
            반드시 JSON으로만 출력. 마크다운 기호 절대 금지.
            1. empathy: 고민자의 감정을 먼저 공감하는 말 (1~2문장)
            2. advice: 현실적이고 구체적인 조언 (2~3문장)
            3. oneLineCheer: 힘이 되는 한 줄 응원 메시지
            Tone: 친한 선배처럼 따뜻하게. 한국어로 답할 것.
          `,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              empathy: { type: Type.STRING },
              advice: { type: Type.STRING },
              oneLineCheer: { type: Type.STRING },
            },
            required: ["empathy", "advice", "oneLineCheer"]
          }
        }
      });
      const rawText = typeof response.text === 'function' ? response.text() : (response.text || "{}");
      const json = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());
      setLoveResult(
        `💙 ${cleanText(json.empathy || '')}\n\n💡 ${cleanText(json.advice || '')}\n\n✨ ${cleanText(json.oneLineCheer || '')}`
      );
    } catch {
      setLoveResult("💙 그 마음, 충분히 이해해요. 직장에서의 감정은 더 복잡하고 조심스럽죠.\n\n💡 지금 당장 결론 내리려 하지 마세요. 오늘 하루 그냥 자연스럽게 지내다 보면 답이 보여요.\n\n✨ 마음이 있다면 기회는 반드시 옵니다. 준비된 사람에게요.");
      setLoveFallback(true);
    } finally {
      setLoveLoading(false);
    }
  };

  // ===== 관계 온도 진단 =====
  const handleTempSelect = (score: number) => {
    const newScores = [...tempScores, score];
    setTempScores(newScores);
    if (tempStep < TEMP_QUESTIONS.length - 1) {
      setTempStep(prev => prev + 1);
    } else {
      setTempDone(true);
    }
  };

  const resetTemp = () => {
    setTempStep(0);
    setTempScores([]);
    setTempDone(false);
  };

  // ===== 성인지 감수성 =====
  const handleSensitivityAnswer = (id: number, isTrue: boolean) => {
    setSensitivityAnswers(prev => ({ ...prev, [id]: isTrue }));
  };

  const allAnswered = SENSITIVITY_CHECKS.every(q => sensitivityAnswers[q.id] !== undefined);
  const wrongCount = SENSITIVITY_CHECKS.filter(q => sensitivityAnswers[q.id] === true).length; // 모두 false가 정답
  const sensitivityResult = getSensitivityResult(wrongCount);

  const tempTotal = tempScores.reduce((a, b) => a + b, 0);
  const tempResult = getTempResult(tempTotal);

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'gender', label: '성별 갈등 통역기', icon: '🔄' },
    { key: 'sensitivity', label: '성인지 감수성 체크', icon: '🌈' },
    { key: 'love', label: '연애 공감 상담소', icon: '💝' },
    { key: 'temp', label: '관계 온도 진단', icon: '🌡️' },
  ];

  return (
    <section id="relationship-thermometer" className="relative z-10 py-24 px-4 w-full max-w-7xl mx-auto border-t border-slate-800">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group px-4 py-2 rounded-full hover:bg-slate-800/50"
        >
          <div className="p-1.5 rounded-full bg-slate-800 border border-slate-700 group-hover:border-pink-500 group-hover:bg-slate-700 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm">이전 화면으로</span>
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <span className="text-pink-400 font-tech tracking-widest text-xs uppercase mb-2 block">Relationship Zone</span>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
          💝 <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">관계 온도계</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
          남녀 갈등 통역부터 연애 상담까지.<br />
          <span className="text-white font-bold">AI가 관계의 온도를 재고, 따뜻하게 만들어드려요.</span>
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30'
                : 'bg-slate-800/60 text-slate-400 hover:text-white border border-slate-700 hover:border-pink-500/50'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ===== 탭 1: 성별 갈등 통역기 ===== */}
        {activeTab === 'gender' && (
          <motion.div key="gender" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto bg-[#0a0a12]/40 backdrop-blur-xl border border-pink-900/30 rounded-3xl p-8 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-pink-900/30">
              <div className="flex gap-1">
                <Mars className="w-6 h-6 text-blue-400" />
                <Venus className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">성별 갈등 통역기</h3>
                <p className="text-pink-200/60 text-sm">그 말이 왜 불편했는지 AI가 설명해드려요</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm text-pink-400 font-bold mb-2 block">불편했던 말 또는 상황을 입력하세요</label>
                <textarea
                  value={genderInput}
                  onChange={e => setGenderInput(e.target.value)}
                  placeholder="예) 팀장이 '여자가 왜 이렇게 예민해?' 라고 했어요. / 후배가 '남자는 다 그렇잖아요'라고 해서 기분이 나빴어요."
                  className="w-full h-28 bg-slate-900/60 border border-pink-900/40 rounded-2xl p-4 text-white text-base focus:border-pink-500 focus:outline-none resize-none placeholder:text-slate-500"
                />
              </div>

              <button
                onClick={handleGenderTranslate}
                disabled={genderLoading || !genderInput.trim()}
                className="w-full py-3.5 rounded-xl font-black text-base flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white disabled:opacity-50 transition-all hover:scale-[1.01]"
              >
                {genderLoading ? <><RefreshCw className="w-5 h-5 animate-spin" /> AI가 분석 중...</> : <><Sparkles className="w-5 h-5" /> 공감 번역하기</>}
              </button>

              {genderResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div className="bg-gradient-to-br from-slate-900/80 to-pink-950/30 border border-pink-500/20 rounded-2xl p-6">
                    <p className="text-pink-100 text-lg leading-relaxed text-center whitespace-pre-wrap">
                      <Quote className="w-5 h-5 inline-block mb-2 mr-1 rotate-180 text-pink-500/50 align-top" />
                      {genderResult}
                      <Quote className="w-5 h-5 inline-block mt-2 ml-1 text-pink-500/50 align-bottom" />
                    </p>
                    {genderFallback && <p className="text-center text-xs text-slate-500 mt-2 flex items-center justify-center gap-1"><WifiOff className="w-3 h-3" /> OFFLINE MODE</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-slate-800/60 p-4 rounded-xl border border-blue-500/30">
                      <strong className="text-blue-400 text-sm block mb-1 flex items-center gap-1"><Mars className="w-4 h-4" /> 남성/선배 처방전</strong>
                      <p className="text-slate-300 text-sm leading-snug">{genderPlan.male}</p>
                    </div>
                    <div className="bg-slate-800/60 p-4 rounded-xl border border-pink-500/30">
                      <strong className="text-pink-400 text-sm block mb-1 flex items-center gap-1"><Venus className="w-4 h-4" /> 여성/후배 처방전</strong>
                      <p className="text-slate-300 text-sm leading-snug">{genderPlan.female}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* ===== 탭 2: 성인지 감수성 체크 ===== */}
        {activeTab === 'sensitivity' && (
          <motion.div key="sensitivity" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto bg-[#0a0a12]/40 backdrop-blur-xl border border-purple-900/30 rounded-3xl p-8 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-purple-900/30">
              <span className="text-3xl">🌈</span>
              <div>
                <h3 className="text-2xl font-black text-white">성인지 감수성 체크</h3>
                <p className="text-purple-200/60 text-sm">내 말이 괜찮은지, AI보다 솔직하게 체크해드려요</p>
              </div>
            </div>

            <p className="text-slate-400 text-sm mb-6">아래 문장들이 <span className="text-white font-bold">맞다/틀리다</span>를 선택해주세요. (모두 답해야 결과가 나와요)</p>

            <div className="space-y-4 mb-6">
              {SENSITIVITY_CHECKS.map((q, i) => (
                <div key={q.id} className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
                  <p className="text-slate-200 text-sm mb-3"><span className="text-purple-400 font-bold mr-2">Q{i + 1}.</span>{q.text}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSensitivityAnswer(q.id, true)}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${sensitivityAnswers[q.id] === true ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                      ✓ 맞다
                    </button>
                    <button
                      onClick={() => handleSensitivityAnswer(q.id, false)}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${sensitivityAnswers[q.id] === false ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                      ✗ 틀리다
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {allAnswered && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`border ${sensitivityResult.bg} rounded-2xl p-6 bg-slate-900/60`}
              >
                <div className="text-center mb-4">
                  <span className="text-4xl block mb-2">{sensitivityResult.emoji}</span>
                  <h4 className={`text-xl font-black ${sensitivityResult.color}`}>{sensitivityResult.label}</h4>
                  <p className="text-slate-300 text-sm mt-2">{sensitivityResult.desc}</p>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-300 text-sm leading-relaxed">💡 {sensitivityResult.advice}</p>
                </div>
                <p className="text-center text-xs text-slate-500 mt-4">※ 모든 문장은 성별 고정관념을 담고 있어 '틀리다'가 정답이에요</p>
                <button onClick={() => { setSensitivityAnswers({}); setSensitivityDone(false); }} className="w-full mt-4 py-2.5 rounded-xl text-sm font-bold bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" /> 다시 풀기
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ===== 탭 3: 연애 공감 상담소 ===== */}
        {activeTab === 'love' && (
          <motion.div key="love" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto bg-[#0a0a12]/40 backdrop-blur-xl border border-rose-900/30 rounded-3xl p-8 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-rose-900/30">
              <Heart className="w-8 h-8 text-rose-400" />
              <div>
                <h3 className="text-2xl font-black text-white">연애 공감 상담소</h3>
                <p className="text-rose-200/60 text-sm">직장 내 연애부터 관계 고민까지, 판단 없이 들어드려요</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm text-rose-400 font-bold mb-2 block">고민을 편하게 털어놓으세요 💬</label>
                <textarea
                  value={loveInput}
                  onChange={e => setLoveInput(e.target.value)}
                  placeholder="예) 같은 팀 동료한테 마음이 생겼는데 어떻게 해야 할지 모르겠어요. / 좋아하는 사람한테 차였는데 매일 봐야 해서 너무 힘들어요."
                  className="w-full h-32 bg-slate-900/60 border border-rose-900/40 rounded-2xl p-4 text-white text-base focus:border-rose-500 focus:outline-none resize-none placeholder:text-slate-500"
                />
              </div>

              <button
                onClick={handleLoveCounsel}
                disabled={loveLoading || !loveInput.trim()}
                className="w-full py-3.5 rounded-xl font-black text-base flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white disabled:opacity-50 transition-all hover:scale-[1.01]"
              >
                {loveLoading ? <><RefreshCw className="w-5 h-5 animate-spin" /> AI가 공감 중...</> : <><Heart className="w-5 h-5" /> 상담받기</>}
              </button>

              {loveResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="bg-gradient-to-br from-slate-900/80 to-rose-950/30 border border-rose-500/20 rounded-2xl p-6">
                    <p className="text-rose-100 text-base leading-relaxed whitespace-pre-wrap">{loveResult}</p>
                    {loveFallback && <p className="text-center text-xs text-slate-500 mt-3 flex items-center justify-center gap-1"><WifiOff className="w-3 h-3" /> OFFLINE MODE</p>}
                  </div>
                  <button onClick={() => { setLoveInput(''); setLoveResult(''); }} className="w-full mt-3 py-2.5 rounded-xl text-sm font-bold bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4" /> 새 고민 상담하기
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* ===== 탭 4: 관계 온도 진단 ===== */}
        {activeTab === 'temp' && (
          <motion.div key="temp" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto bg-[#0a0a12]/40 backdrop-blur-xl border border-orange-900/30 rounded-3xl p-8 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-orange-900/30">
              <Thermometer className="w-8 h-8 text-orange-400" />
              <div>
                <h3 className="text-2xl font-black text-white">관계 온도 진단</h3>
                <p className="text-orange-200/60 text-sm">지금 이 관계, 온도가 몇 도인가요?</p>
              </div>
            </div>

            {!tempDone ? (
              <div>
                <div className="flex gap-1.5 mb-6 justify-center">
                  {TEMP_QUESTIONS.map((_, i) => (
                    <div key={i} className={`h-2 flex-1 rounded-full transition-colors ${i < tempStep ? 'bg-orange-500' : i === tempStep ? 'bg-orange-400 animate-pulse' : 'bg-slate-800'}`} />
                  ))}
                </div>
                <p className="text-center text-orange-400 text-xs font-bold mb-3 uppercase tracking-widest">STEP {tempStep + 1} / {TEMP_QUESTIONS.length}</p>
                <h4 className="text-xl font-bold text-white text-center mb-6 leading-snug">{TEMP_QUESTIONS[tempStep].question}</h4>
                <div className="space-y-3">
                  {TEMP_QUESTIONS[tempStep].options.map((opt, idx) => (
                    <button key={idx} onClick={() => handleTempSelect(opt.value)}
                      className="w-full p-4 rounded-xl bg-slate-900/60 border border-slate-700 hover:border-orange-500 hover:bg-slate-800/80 transition-all text-left group flex items-center justify-between"
                    >
                      <span className="text-slate-200 text-base group-hover:text-white">{opt.label}</span>
                      <ArrowRight className="w-4 h-4 text-orange-400 opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <div className="text-6xl mb-4">{tempResult.emoji}</div>
                <h4 className={`text-2xl font-black mb-2 ${tempResult.color}`}>{tempResult.label}</h4>
                <p className="text-slate-300 mb-6 leading-relaxed">{tempResult.desc}</p>
                <div className={`border ${tempResult.bg} rounded-2xl p-5 bg-slate-900/60 text-left mb-6`}>
                  <p className="text-slate-300 text-sm leading-relaxed">💡 {tempResult.advice}</p>
                </div>
                <button onClick={resetTemp} className="w-full py-3 rounded-xl font-bold bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" /> 다시 진단하기
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </section>
  );
};

export default RelationshipThermometer;
