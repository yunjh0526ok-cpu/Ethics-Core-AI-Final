import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Thermometer, MessageCircle, Sparkles, ArrowLeft, RefreshCw, Loader2, WifiOff, ArrowRight, Venus, Mars, BookOpen, ChevronDown, ChevronUp, Send, Search } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

type TabType = 'gender' | 'cases' | 'lang' | 'temp';

const TEMP_QUESTIONS = [
  { id: 0, question: "상대방이 말할 때 나는?", options: [{ label: "끝까지 들으며 공감한다", value: 5 }, { label: "듣다가 내 말을 끼워 넣는다", value: 3 }, { label: "딴 생각을 하거나 폰을 본다", value: 1 }] },
  { id: 1, question: "갈등이 생겼을 때 나는?", options: [{ label: "솔직하게 말하고 함께 해결한다", value: 5 }, { label: "일단 피하고 나중에 풀린다", value: 3 }, { label: "속으로만 삭히고 넘긴다", value: 1 }] },
  { id: 2, question: "상대방의 힘든 일에 나는?", options: [{ label: "먼저 연락하고 챙긴다", value: 5 }, { label: "알면 챙기지만 먼저 찾진 않는다", value: 3 }, { label: "각자 알아서라고 생각한다", value: 1 }] },
  { id: 3, question: "상대방이 내 말에 동의 안 할 때 나는?", options: [{ label: "왜 그렇게 생각하는지 물어본다", value: 5 }, { label: "한 번 더 설득하고 넘긴다", value: 3 }, { label: "답답하거나 화가 난다", value: 1 }] },
  { id: 4, question: "이 관계에서 나는 지금?", options: [{ label: "편안하고 솔직하게 나를 표현할 수 있다", value: 5 }, { label: "좋지만 어딘가 불편함이 있다", value: 3 }, { label: "지치거나 거리감이 느껴진다", value: 1 }] },
];

const getTempResult = (score: number) => {
  if (score >= 20) return { emoji: "🔥", label: "뜨거움 (85°C+)", color: "text-red-400", bg: "border-red-500/40", desc: "이 관계, 정말 따뜻하네요.", advice: "지금 이 온기를 말로 표현해보세요. '고마워', '네가 있어서 다행이야' 한 마디가 온도를 더 올려줍니다." };
  if (score >= 14) return { emoji: "☀️", label: "따뜻함 (50~84°C)", color: "text-amber-400", bg: "border-amber-500/40", desc: "전반적으로 괜찮은 관계예요.", advice: "서로 불편했던 것 하나씩 꺼내 이야기해보세요." };
  if (score >= 8) return { emoji: "🌤️", label: "미지근함 (20~49°C)", color: "text-blue-300", bg: "border-blue-400/40", desc: "관계가 조금 식어가고 있어요.", advice: "오늘 먼저 연락해보세요. 작은 관심이 온도를 다시 올려줍니다." };
  return { emoji: "❄️", label: "차가움 (0~19°C)", color: "text-slate-400", bg: "border-slate-500/40", desc: "많이 지쳐있거나 거리감이 생긴 상태예요.", advice: "'우리 요즘 좀 어색한 것 같아'라고 먼저 말해보는 것도 용기입니다." };
};

const CASES = [
  { id: 1, q: "팀장이 회의에서 여직원 의견은 자꾸 흘려듣고 남직원 의견만 채택해요. 이게 차별인가요?", a: "네, 이는 성별에 따른 발언권 차등으로 직장 내 성차별에 해당할 수 있습니다. 국가인권위원회는 회의 참여 기회 및 의견 반영에서의 성별 차등을 차별로 인정한 바 있습니다. 반복된다면 구체적 사례를 기록해 HR팀에 제기하거나 국가인권위 진정을 검토하세요.", tag: "발언권 차별", law: "남녀고용평등법 제2조, 국가인권위원회법" },
  { id: 2, q: "'여자가 야근하면 집안일은 누가 해?' 라는 말, 그냥 넘겨야 하나요?", a: "넘길 필요 없습니다. 이 말은 성역할 고정관념을 강요하는 발언으로, 반복 시 성희롱으로 볼 수 있습니다. '그런 말씀은 불편합니다'라고 명확히 표현하고, 반복될 경우 내용을 기록해 두세요.", tag: "성역할 고정관념", law: "남녀고용평등법 제12조" },
  { id: 3, q: "남성 육아휴직을 신청했더니 팀장이 '남자가 무슨 육아휴직이냐'고 했어요.", a: "명백한 위법입니다. 육아휴직은 성별 구분 없이 법적으로 보장된 권리입니다. 이를 막거나 불이익을 예고하는 언행은 남녀고용평등법 위반으로 500만원 이하 과태료 대상입니다.", tag: "육아휴직 불이익", law: "남녀고용평등법 제19조, 동법 제37조" },
  { id: 4, q: "회식 때마다 여직원한테 술 따르라고 강요해요. 거절하면 분위기를 망친다고 해요.", a: "강요 자체가 문제입니다. 술을 따르는 행위를 특정 성별에게만 요구하는 것은 성역할 강요이며, 거절에 대해 압박하는 것은 직장 내 괴롭힘과 성희롱이 동시에 성립될 수 있습니다.", tag: "회식 강요", law: "근로기준법 제76조의2, 남녀고용평등법 제12조" },
  { id: 5, q: "임신을 알리자마자 중요 프로젝트에서 빠지게 됐어요.", a: "임신을 이유로 한 업무 배제는 남녀고용평등법상 불이익 처우에 해당합니다. 이는 형사처벌(3년 이하 징역 또는 3천만원 이하 벌금) 대상입니다. 인사팀에 서면으로 이의를 제기하고, 고용노동부 진정을 검토하세요.", tag: "임신 불이익", law: "남녀고용평등법 제11조, 제37조" },
  { id: 6, q: "'여자는 감정적이라 리더십이 부족해'라는 말을 공개 회의에서 들었어요.", a: "성별을 이유로 역량을 일반화하는 발언은 성차별적 발언입니다. 공개 회의에서 반복된다면 조직 내 고충처리위원회에 제기하거나 국가인권위원회에 진정할 수 있습니다.", tag: "성별 고정관념 발언", law: "남녀고용평등법 제2조, 국가인권위원회법 제30조" },
  { id: 7, q: "팀장이 여직원에게만 '○○씨', 남직원에게는 '○○ 대리'라고 불러요.", a: "직급을 무시하고 성별에 따라 호칭을 달리하는 것은 성차별적 관행입니다. '저도 직급으로 불러주시면 좋겠습니다'라고 정중히 요청하세요.", tag: "호칭 차별", law: "남녀고용평등법 제2조" },
  { id: 8, q: "성희롱 신고를 했더니 오히려 제가 '예민한 사람'으로 낙인찍혔어요.", a: "2차 피해입니다. 신고 후 불이익 또는 낙인은 남녀고용평등법 제14조 위반입니다. 2차 피해 내용도 함께 기록해 고용노동부나 국가인권위에 신고하세요.", tag: "2차 피해", law: "남녀고용평등법 제14조 제6항" },
  { id: 9, q: "채용 면접에서 '결혼 계획이 있나요?'라는 질문을 받았어요.", a: "위법한 질문입니다. 채용 과정에서 결혼·임신·출산 계획을 묻는 것은 남녀고용평등법 제7조 위반입니다. 이를 이유로 탈락했다고 의심된다면 고용노동부에 진정할 수 있습니다.", tag: "채용 차별", law: "남녀고용평등법 제7조" },
  { id: 10, q: "'남자답게 참아라', '여자답게 배려해라' 같은 말이 반복돼요.", a: "성별 규범을 강요하는 발언으로 반복적이고 지속적인 경우 근로기준법 제76조의2 직장 내 괴롭힘으로 볼 수 있습니다. 발언 일시·장소·내용을 기록해두고 고충처리위원회에 신고하세요.", tag: "성별 규범 강요", law: "근로기준법 제76조의2" },
  { id: 11, q: "여직원에게만 커피 심부름, 청소 등을 시켜요.", a: "성별을 이유로 특정 업무를 부여하는 것은 직접 차별입니다. '제 직무가 아닌 것 같습니다'라고 정중히 거절할 수 있으며, 거절 후 불이익이 생기면 직장 내 괴롭힘 또는 성차별로 신고 가능합니다.", tag: "성별 업무 분장", law: "남녀고용평등법 제2조, 근로기준법 제76조의2" },
  { id: 12, q: "성인지 감수성 교육이 형식적으로만 진행돼요. 어떻게 해야 하나요?", a: "남녀고용평등법 제13조에 따라 직장 내 성희롱 예방교육은 연 1회 이상 실질적으로 실시해야 합니다. 형식적 교육은 과태료 부과 대상입니다. Ethics-Core AI의 AI 참여형 성인지 교육 프로그램 도입을 검토해보세요.", tag: "예방교육 형식화", law: "남녀고용평등법 제13조" },
];

const LANG_EXAMPLES = [
  { situation: "회의 중 발언", text: "그냥 알아서 해요, 일단 시작해요" },
  { situation: "업무 피드백", text: "틀렸어, 다시 해" },
  { situation: "감정 표현", text: "왜 이렇게 예민하게 받아들여요?" },
];

const RelationshipThermometer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('gender');
  const [genderInput, setGenderInput] = useState('');
  const [genderResult, setGenderResult] = useState('');
  const [genderPlan, setGenderPlan] = useState({ male: '번역 버튼을 누르면 처방전이 나옵니다 💊', female: '입력한 내용에 따라 대처법을 알려드려요 😊' });
  const [genderLoading, setGenderLoading] = useState(false);
  const [genderFallback, setGenderFallback] = useState(false);
  const [openCase, setOpenCase] = useState<number | null>(null);
  const [caseQuestion, setCaseQuestion] = useState('');
  const [caseAnswer, setCaseAnswer] = useState('');
  const [caseLoading, setCaseLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [langInput, setLangInput] = useState('');
  const [langResult, setLangResult] = useState('');
  const [langLoading, setLangLoading] = useState(false);
  const [langFallback, setLangFallback] = useState(false);
  const [tempStep, setTempStep] = useState(0);
  const [tempScores, setTempScores] = useState<number[]>([]);
  const [tempDone, setTempDone] = useState(false);

  const cleanText = (t: string) => t.replace(/\*\*/g, '').replace(/##/g, '').replace(/__/g, '').trim();

  const handleBack = () => {
    sessionStorage.setItem('hero_view_mode', 'consulting');
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }));
  };

  const handleGenderTranslate = async () => {
    if (!genderInput.trim()) return;
    setGenderLoading(true); setGenderResult(''); setGenderFallback(false);
    try {
      if (!genAI) throw new Error('no key');
      const res = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `다음 말이나 상황을 분석해줘: "${genderInput}"`,
        config: {
          systemInstruction: `당신은 남녀 간 소통 갈등을 따뜻하게 해결하는 AI입니다. 반드시 JSON으로만 출력. 마크다운 금지.
1. translatedText: 상대방 입장 공감적 재해석
2. maleTip: 남성/선배 소통 방법 1줄
3. femaleTip: 여성/후배 대처법 1줄
한국어로.`,
          responseMimeType: 'application/json',
          responseSchema: { type: Type.OBJECT, properties: { translatedText: { type: Type.STRING }, maleTip: { type: Type.STRING }, femaleTip: { type: Type.STRING } }, required: ['translatedText', 'maleTip', 'femaleTip'] }
        }
      });
      const raw = typeof res.text === 'function' ? res.text() : (res.text || '{}');
      const json = JSON.parse(raw.replace(/```json|```/g, '').trim());
      setGenderResult(cleanText(json.translatedText || ''));
      setGenderPlan({ male: cleanText(json.maleTip || ''), female: cleanText(json.femaleTip || '') });
    } catch {
      setGenderResult('서로 다른 언어를 쓰는 것 같지만, 사실 원하는 건 같아요. 인정받고 싶고, 존중받고 싶은 마음이죠.');
      setGenderPlan({ male: "'왜 그렇게 생각해?'라는 질문 하나가 갈등을 줄여줍니다.", female: '불편하면 그 자리에서 바로 말하는 게 쌓이지 않아요.' });
      setGenderFallback(true);
    } finally { setGenderLoading(false); }
  };

  const handleLangTranslate = async () => {
    if (!langInput.trim()) return;
    setLangLoading(true); setLangResult(''); setLangFallback(false);
    try {
      if (!genAI) throw new Error('no key');
      const res = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `직장에서 들은 말이나 상황: "${langInput}"`,
        config: {
          systemInstruction: `당신은 직장 내 남녀 간 언어 뉘앙스 차이를 분석하는 관계 언어 번역기 AI입니다.
반드시 JSON으로만 출력. 마크다운 금지.
1. senderMeaning: 말한 사람의 실제 의도 (1~2문장)
2. receiverFeeling: 듣는 사람이 느끼는 감정/오해 (1~2문장)
3. betterExpression: 오해 없이 전달하는 더 나은 표현 방법
4. tip: 소통 팁 1줄
한국어로.`,
          responseMimeType: 'application/json',
          responseSchema: { type: Type.OBJECT, properties: { senderMeaning: { type: Type.STRING }, receiverFeeling: { type: Type.STRING }, betterExpression: { type: Type.STRING }, tip: { type: Type.STRING } }, required: ['senderMeaning', 'receiverFeeling', 'betterExpression', 'tip'] }
        }
      });
      const raw = typeof res.text === 'function' ? res.text() : (res.text || '{}');
      const json = JSON.parse(raw.replace(/```json|```/g, '').trim());
      setLangResult(JSON.stringify(json));
    } catch {
      setLangResult(JSON.stringify({ senderMeaning: '말한 사람은 효율적으로 소통하려 했을 수 있어요.', receiverFeeling: '듣는 사람은 무시당하거나 배려받지 못한 느낌을 받았을 수 있어요.', betterExpression: "'이렇게 하면 어떨까요? 혹시 다른 생각 있으면 말해줘요'처럼 의견을 묻는 형태로 바꿔보세요.", tip: '말의 내용보다 톤과 여지를 남기는 방식이 관계를 지킵니다.' }));
      setLangFallback(true);
    } finally { setLangLoading(false); }
  };

  const handleCaseQuestion = async () => {
    if (!caseQuestion.trim()) return;
    setCaseLoading(true); setCaseAnswer('');
    try {
      if (!genAI) throw new Error('no key');
      const res = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `직장 내 성인지 감수성 질문: "${caseQuestion}"`,
        config: { systemInstruction: `당신은 직장 내 성인지 감수성, 성차별, 성희롱 전문 AI 상담관입니다. 관련 법령, 판례, 신고 절차를 포함해 답변하세요. 마크다운 기호 사용 금지. 한국어로. 구조: 1)상황 판단 2)관련 법령 3)대응 방법 4)신고 기관` }
      });
      const raw = typeof res.text === 'function' ? res.text() : (res.text || '');
      setCaseAnswer(cleanText(raw));
    } catch {
      setCaseAnswer('현재 AI 연결이 원활하지 않습니다. 국가인권위원회(1331) 또는 고용노동부(1350)으로 직접 문의하세요.');
    } finally { setCaseLoading(false); }
  };

  const handleTempSelect = (score: number) => {
    const ns = [...tempScores, score];
    setTempScores(ns);
    if (tempStep < TEMP_QUESTIONS.length - 1) setTempStep(p => p + 1);
    else setTempDone(true);
  };

  const tempTotal = tempScores.reduce((a, b) => a + b, 0);
  const tempResult = getTempResult(tempTotal);
  const filteredCases = CASES.filter(c => !searchTerm || c.q.includes(searchTerm) || c.tag.includes(searchTerm));

  const tabs = [
    { key: 'gender' as TabType, label: '성별 갈등 통역기', icon: '🔄' },
    { key: 'cases' as TabType, label: '성인지 사례 Q&A', icon: '📚' },
    { key: 'lang' as TabType, label: '관계 언어 번역기', icon: '💬' },
    { key: 'temp' as TabType, label: '관계 온도 진단', icon: '🌡️' },
  ];

  return (
    <section className="relative z-10 py-24 px-4 w-full max-w-7xl mx-auto border-t border-slate-800">
      <div className="mb-6">
        <button onClick={handleBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group px-4 py-2 rounded-full hover:bg-slate-800/50">
          <div className="p-1.5 rounded-full bg-slate-800 border border-slate-700 group-hover:border-cyber-accent transition-all"><ArrowLeft className="w-4 h-4" /></div>
          <span className="font-bold text-sm">이전 화면으로</span>
        </button>
      </div>
      <div className="text-center mb-12">
        <span className="text-cyber-accent font-tech tracking-widest text-xs uppercase mb-2 block">Relation Lab</span>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">💝 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-400 to-cyber-purple">관계 온도계</span></h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">성별 갈등 통역부터 직장 내 성인지 사례까지.<br /><span className="text-white font-bold">AI가 관계의 온도를 재고, 따뜻하게 만들어드려요.</span></p>
      </div>
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all ${activeTab === tab.key ? 'bg-gradient-to-r from-cyber-500 to-cyber-purple text-white shadow-lg shadow-cyber-500/30' : 'bg-slate-800/60 text-slate-400 hover:text-white border border-slate-700 hover:border-cyber-accent/50'}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'gender' && (
          <motion.div key="gender" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto bg-[#0a0a12]/40 backdrop-blur-xl border border-cyber-500/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cyber-500/20">
              <div className="flex gap-1"><Mars className="w-6 h-6 text-blue-400" /><Venus className="w-6 h-6 text-cyber-accent" /></div>
              <div><h3 className="text-2xl font-black text-white">성별 갈등 통역기</h3><p className="text-cyber-accent/60 text-sm">그 말이 왜 불편했는지 AI가 설명해드려요</p></div>
            </div>
            <div className="space-y-5">
              <textarea value={genderInput} onChange={e => setGenderInput(e.target.value)} placeholder="예) 팀장이 '여자가 왜 이렇게 예민해?' 라고 했어요." className="w-full h-28 bg-slate-900/60 border border-cyber-500/20 rounded-2xl p-4 text-white text-base focus:border-cyber-accent focus:outline-none resize-none placeholder:text-slate-500" />
              <button onClick={handleGenderTranslate} disabled={genderLoading || !genderInput.trim()} className="w-full py-3.5 rounded-xl font-black text-base flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyber-purple hover:from-blue-500 hover:to-purple-500 text-white disabled:opacity-50 transition-all">
                {genderLoading ? <><RefreshCw className="w-5 h-5 animate-spin" /> 분석 중...</> : <><Sparkles className="w-5 h-5" /> 공감 번역하기</>}
              </button>
              {genderResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div className="bg-gradient-to-br from-slate-900/80 to-cyber-900/30 border border-cyber-500/30 rounded-2xl p-6">
                    <p className="text-slate-100 text-base leading-relaxed text-center whitespace-pre-wrap">{genderResult}</p>
                    {genderFallback && <p className="text-center text-xs text-slate-500 mt-2 flex items-center justify-center gap-1"><WifiOff className="w-3 h-3" /> OFFLINE</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-slate-800/60 p-4 rounded-xl border border-blue-500/30"><strong className="text-blue-400 text-sm block mb-1">남성/선배 처방전</strong><p className="text-slate-300 text-sm">{genderPlan.male}</p></div>
                    <div className="bg-slate-800/60 p-4 rounded-xl border border-cyber-500/30"><strong className="text-cyber-accent text-sm block mb-1">여성/후배 처방전</strong><p className="text-slate-300 text-sm">{genderPlan.female}</p></div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'cases' && (
          <motion.div key="cases" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-3xl mx-auto space-y-4">
            <div className="bg-[#0a0a12]/40 backdrop-blur-xl border border-cyber-purple/20 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-cyber-purple/20">
                <BookOpen className="w-7 h-7 text-cyber-purple" />
                <div><h3 className="text-2xl font-black text-white">성인지 감수성 사례 Q&A</h3><p className="text-cyber-purple/60 text-sm">직장 내 성차별·성희롱 실제 사례와 법적 대응법</p></div>
              </div>
              <div className="relative mb-5">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="키워드 검색 (예: 육아휴직, 회식, 채용, 2차 피해)" className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-cyber-purple/20 rounded-xl text-white text-sm focus:border-cyber-purple focus:outline-none placeholder:text-slate-500" />
              </div>
              <div className="space-y-2">
                {filteredCases.map((c, i) => (
                  <div key={c.id} className="border border-slate-700 rounded-xl overflow-hidden">
                    <button onClick={() => setOpenCase(openCase === c.id ? null : c.id)} className="w-full p-4 flex items-start justify-between gap-3 text-left hover:bg-slate-800/60 transition-colors">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="text-cyber-purple font-black text-sm shrink-0 mt-0.5">Q{i + 1}</span>
                        <div>
                          <p className="text-slate-200 text-sm font-medium leading-snug">{c.q}</p>
                          <span className="inline-block mt-1.5 px-2 py-0.5 bg-cyber-purple/10 border border-cyber-purple/30 rounded-full text-xs text-cyber-purple/80">{c.tag}</span>
                        </div>
                      </div>
                      {openCase === c.id ? <ChevronUp className="w-4 h-4 text-cyber-purple shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 mt-1" />}
                    </button>
                    <AnimatePresence>
                      {openCase === c.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                          <div className="px-4 pb-4 pt-2 bg-slate-900/40 border-t border-slate-700">
                            <p className="text-slate-300 text-sm leading-relaxed mb-3">{c.a}</p>
                            <div className="text-xs text-slate-500 bg-slate-800/60 px-3 py-2 rounded-lg"><span className="text-cyber-purple font-bold">📋 관련 법령: </span>{c.law}</div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
                {filteredCases.length === 0 && <div className="text-center py-8 text-slate-500 text-sm">검색 결과가 없어요.</div>}
              </div>
            </div>
            <div className="bg-[#0a0a12]/40 backdrop-blur-xl border border-cyber-purple/20 rounded-3xl p-6 shadow-2xl">
              <h4 className="text-white font-black text-lg mb-1 flex items-center gap-2"><Sparkles className="w-5 h-5 text-cyber-purple" /> 내 상황 직접 물어보기</h4>
              <p className="text-slate-400 text-sm mb-4">위 사례에 없는 상황이라면 AI에게 직접 물어보세요. 관련 법령·판례·대응 방법을 알려드려요.</p>
              <textarea value={caseQuestion} onChange={e => setCaseQuestion(e.target.value)} placeholder="예) 팀장이 제 외모를 자꾸 평가해요. 이게 성희롱인가요?" className="w-full h-24 bg-slate-900/60 border border-cyber-purple/20 rounded-xl p-4 text-white text-sm focus:border-cyber-purple focus:outline-none resize-none placeholder:text-slate-500 mb-3" />
              <button onClick={handleCaseQuestion} disabled={caseLoading || !caseQuestion.trim()} className="w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyber-purple hover:from-blue-500 hover:to-purple-500 text-white disabled:opacity-50 transition-all">
                {caseLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> AI가 분석 중...</> : <><Send className="w-4 h-4" /> AI 상담 받기</>}
              </button>
              {caseAnswer && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-slate-900/60 border border-cyber-purple/30 rounded-xl p-5">
                  <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{caseAnswer}</p>
                  <div className="mt-4 pt-3 border-t border-slate-700 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>📞 국가인권위원회: 1331</span><span>📞 고용노동부: 1350</span><span>📞 여성긴급전화: 1366</span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'lang' && (
          <motion.div key="lang" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto bg-[#0a0a12]/40 backdrop-blur-xl border border-cyber-500/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cyber-500/20">
              <MessageCircle className="w-7 h-7 text-cyber-accent" />
              <div><h3 className="text-2xl font-black text-white">관계 언어 번역기</h3><p className="text-cyber-accent/60 text-sm">같은 말, 다르게 들리는 이유를 AI가 분석해드려요</p></div>
            </div>
            <div className="mb-5 grid grid-cols-1 md:grid-cols-3 gap-2">
              {LANG_EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => setLangInput(ex.text)} className="p-3 bg-slate-800/60 border border-cyber-500/20 rounded-xl text-left hover:border-cyber-accent/50 transition-colors group">
                  <p className="text-cyber-accent text-xs font-bold mb-1">{ex.situation}</p>
                  <p className="text-slate-300 text-xs">{ex.text}</p>
                  <p className="text-slate-600 text-xs mt-1 group-hover:text-cyber-accent transition-colors">→ 클릭해서 분석</p>
                </button>
              ))}
            </div>
            <div className="space-y-4">
              <textarea value={langInput} onChange={e => setLangInput(e.target.value)} placeholder="예) '그냥 알아서 해요'라는 말이 뭘 어떻게 하라는 건지 모르겠어요." className="w-full h-28 bg-slate-900/60 border border-cyber-500/20 rounded-2xl p-4 text-white text-base focus:border-cyber-accent focus:outline-none resize-none placeholder:text-slate-500" />
              <button onClick={handleLangTranslate} disabled={langLoading || !langInput.trim()} className="w-full py-3.5 rounded-xl font-black text-base flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyber-purple hover:from-blue-500 hover:to-purple-500 text-white disabled:opacity-50 transition-all">
                {langLoading ? <><RefreshCw className="w-5 h-5 animate-spin" /> 분석 중...</> : <><Sparkles className="w-5 h-5" /> 뉘앙스 번역하기</>}
              </button>
              {langResult && (() => {
                let json: any = {};
                try { json = JSON.parse(langResult); } catch {}
                return (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-slate-800/60 p-4 rounded-xl border border-blue-500/30"><strong className="text-blue-400 text-xs block mb-2 uppercase tracking-wider">💬 말한 사람의 의도</strong><p className="text-slate-300 text-sm">{json.senderMeaning}</p></div>
                      <div className="bg-slate-800/60 p-4 rounded-xl border border-cyber-accent/30"><strong className="text-cyber-accent text-xs block mb-2 uppercase tracking-wider">😟 듣는 사람의 감정</strong><p className="text-slate-300 text-sm">{json.receiverFeeling}</p></div>
                    </div>
                    <div className="bg-slate-900/60 border border-cyber-accent/30 rounded-xl p-4"><strong className="text-cyber-accent text-xs block mb-2 uppercase tracking-wider">✨ 더 나은 표현 방법</strong><p className="text-slate-200 text-sm leading-relaxed">{json.betterExpression}</p></div>
                    <div className="bg-slate-800/60 border border-slate-600 rounded-xl p-3 flex items-start gap-2"><span className="text-yellow-400">💡</span><p className="text-slate-300 text-sm">{json.tip}</p></div>
                    {langFallback && <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1"><WifiOff className="w-3 h-3" /> OFFLINE</p>}
                    <button onClick={() => { setLangInput(''); setLangResult(''); }} className="w-full py-2.5 rounded-xl text-sm font-bold bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4" /> 새로운 상황 분석하기</button>
                  </motion.div>
                );
              })()}
            </div>
          </motion.div>
        )}

        {activeTab === 'temp' && (
          <motion.div key="temp" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto bg-[#0a0a12]/40 backdrop-blur-xl border border-cyber-accent/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cyber-accent/20">
              <Thermometer className="w-8 h-8 text-cyber-accent" />
              <div><h3 className="text-2xl font-black text-white">관계 온도 진단</h3><p className="text-cyber-accent/60 text-sm">지금 이 관계, 온도가 몇 도인가요?</p></div>
            </div>
            {!tempDone ? (
              <div>
                <div className="flex gap-1.5 mb-6 justify-center">
                  {TEMP_QUESTIONS.map((_, i) => <div key={i} className={`h-2 flex-1 rounded-full transition-colors ${i < tempStep ? 'bg-cyber-accent' : i === tempStep ? 'bg-cyber-accent animate-pulse' : 'bg-slate-800'}`} />)}
                </div>
                <p className="text-center text-cyber-accent text-xs font-bold mb-3 uppercase tracking-widest">STEP {tempStep + 1} / {TEMP_QUESTIONS.length}</p>
                <h4 className="text-xl font-bold text-white text-center mb-6">{TEMP_QUESTIONS[tempStep].question}</h4>
                <div className="space-y-3">
                  {TEMP_QUESTIONS[tempStep].options.map((opt, idx) => (
                    <button key={idx} onClick={() => handleTempSelect(opt.value)} className="w-full p-4 rounded-xl bg-slate-900/60 border border-slate-700 hover:border-orange-500 hover:bg-slate-800/80 transition-all text-left group flex items-center justify-between">
                      <span className="text-slate-200 text-base group-hover:text-white">{opt.label}</span>
                      <ArrowRight className="w-4 h-4 text-cyber-accent opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <div className="text-6xl mb-4">{tempResult.emoji}</div>
                <h4 className={`text-2xl font-black mb-2 ${tempResult.color}`}>{tempResult.label}</h4>
                <p className="text-slate-300 mb-6">{tempResult.desc}</p>
                <div className={`border ${tempResult.bg} rounded-2xl p-5 bg-slate-900/60 text-left mb-6`}><p className="text-slate-300 text-sm leading-relaxed">💡 {tempResult.advice}</p></div>
                <button onClick={() => { setTempStep(0); setTempScores([]); setTempDone(false); }} className="w-full py-3 rounded-xl font-bold bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4" /> 다시 진단하기</button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default RelationshipThermometer;
