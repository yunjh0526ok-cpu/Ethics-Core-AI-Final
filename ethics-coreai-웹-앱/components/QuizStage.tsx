import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Users, Play, CheckCircle2, XCircle,
  Trophy, Zap, Clock, BarChart3, RefreshCw,
  ChevronRight, Star, Shield, Briefcase, Handshake, PartyPopper
} from 'lucide-react';

// ─── 타입 ─────────────────────────────────────────────────────
type Category = 'integrity' | 'workshop' | 'teambuilding' | 'party';
type Screen = 'join' | 'waiting' | 'question' | 'answer' | 'result' | 'final';

interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface Participant {
  name: string;
  score: number;
  answers: (number | null)[];
}

// ─── 카테고리별 퀴즈 데이터 ────────────────────────────────────
const QUIZ_DATA: Record<Category, { title: string; color: string; gradient: string; icon: React.ReactNode; questions: Question[] }> = {
  integrity: {
    title: '청렴·공정 퀴즈',
    color: 'text-cyan-400',
    gradient: 'from-cyan-600 to-blue-700',
    icon: <Shield className="w-5 h-5" />,
    questions: [
      {
        id: 1,
        text: "2024년 8월 개정된 청탁금지법상 공직자가 받을 수 있는 음식물(식사비) 가액 기준은?",
        options: ["3만원", "5만원", "7만원", "10만원"],
        correct: 1,
        explanation: "2024년 8월 27일부터 청탁금지법 시행령 개정으로 음식물 한도가 3만원→5만원으로 상향됐습니다. 선물은 5만원(농수산물 15만원), 경조사비는 5만원입니다."
      },
      {
        id: 2,
        text: "이해충돌방지법상 공직자가 직무 관련 부동산을 보유한 경우 해야 할 의무는?",
        options: ["즉시 매각", "사적 이해관계 신고", "직무 회피 신청", "소속기관장 승인"],
        correct: 1,
        explanation: "이해충돌방지법 제5조에 따라 직무 관련 사적 이해관계(가족 취업, 친족 관계, 본인 부동산 등)가 있는 경우 소속기관장에게 신고해야 합니다."
      },
      {
        id: 3,
        text: "직장 내 괴롭힘 피해 신고 후 사용자가 반드시 해야 할 법적 의무는?",
        options: ["경찰 신고", "즉시 행위자 해고", "지체 없이 사실 확인 조사 실시", "노동부 보고"],
        correct: 2,
        explanation: "근로기준법 제76조의3에 따라 신고 접수 시 사용자는 지체 없이 사실 확인 조사를 해야 하며, 피해자 보호조치 의무도 있습니다."
      },
      {
        id: 4,
        text: "공익신고를 이유로 불이익 조치를 한 자에 대한 처벌은?",
        options: ["과태료 100만원", "과태료 500만원", "3년 이하 징역 또는 3천만원 이하 벌금", "5년 이하 징역 또는 5천만원 이하 벌금"],
        correct: 2,
        explanation: "공익신고자 보호법 제30조에 따라 공익신고를 이유로 불이익 조치를 한 자는 3년 이하의 징역 또는 3천만원 이하의 벌금에 처합니다."
      },
      {
        id: 5,
        text: "국민권익위원회 청렴도 측정에서 '종합청렴도' 산출 방식은?",
        options: [
          "외부청렴도만 반영",
          "내부청렴도만 반영",
          "외부청렴도+내부청렴도+정책고객평가 가중 합산",
          "민원인 만족도 단일 지표"
        ],
        correct: 2,
        explanation: "종합청렴도는 외부청렴도(민원인 대상), 내부청렴도(내부 직원 대상), 정책고객평가를 가중 합산하여 산출합니다. 기관 유형별로 가중치가 다릅니다."
      },
    ],
  },
  workshop: {
    title: '기업 워크숍 퀴즈',
    color: 'text-violet-400',
    gradient: 'from-violet-600 to-purple-700',
    icon: <Briefcase className="w-5 h-5" />,
    questions: [
      { id: 1, text: "심리적 안전감(Psychological Safety)을 처음 제시한 학자는?", options: ["피터 드러커", "에이미 에드먼슨", "다니엘 카너먼", "애덤 그랜트"], correct: 1, explanation: "하버드 경영대학원의 에이미 에드먼슨 교수가 1999년 심리적 안전감 개념을 체계화했습니다." },
      { id: 2, text: "OKR에서 'KR'이 의미하는 것은?", options: ["Key Result", "Key Resource", "Key Ratio", "Key Review"], correct: 0, explanation: "OKR은 Objectives(목표)와 Key Results(핵심 결과)의 약자로, 구글이 대중화한 목표 관리 방식입니다." },
      { id: 3, text: "팀 성과를 저해하는 '링겔만 효과'란?", options: ["리더 부재 시 성과 저하", "집단이 클수록 개인 기여도 감소", "부정적 피드백의 역효과", "과도한 목표 설정의 부작용"], correct: 1, explanation: "링겔만 효과는 집단 크기가 커질수록 개인의 노력이 줄어드는 '사회적 태만' 현상입니다." },
      { id: 4, text: "MZ세대가 중요시하는 직장 가치관 1위는? (2024 조사 기준)", options: ["높은 연봉", "워라밸", "성장 기회", "안정성"], correct: 1, explanation: "최근 여러 조사에서 MZ세대는 '일과 삶의 균형(워라밸)'을 직장 선택의 최우선 가치로 꼽고 있습니다." },
      { id: 5, text: "1on1 미팅의 주요 목적으로 가장 적절한 것은?", options: ["업무 진행 상황 점검", "성과 평가", "구성원 성장 지원과 신뢰 구축", "프로젝트 리뷰"], correct: 2, explanation: "1on1의 핵심은 업무 보고가 아니라 구성원의 성장, 어려움 해소, 신뢰 관계 구축에 있습니다." },
    ],
  },
  teambuilding: {
    title: '팀빌딩 퀴즈',
    color: 'text-amber-400',
    gradient: 'from-amber-500 to-orange-600',
    icon: <Handshake className="w-5 h-5" />,
    questions: [
      { id: 1, text: "우리 팀에서 가장 중요한 것은?", options: ["개인 성과", "소통과 신뢰", "빠른 실행력", "완벽한 계획"], correct: 1, explanation: "팀의 근간은 소통과 신뢰입니다. 심리적 안전감이 있어야 창의적 아이디어와 솔직한 피드백이 나옵니다." },
      { id: 2, text: "갈등이 생겼을 때 가장 건강한 해결 방법은?", options: ["무시하고 넘어간다", "감정이 식을 때까지 기다린다", "당사자가 직접 대화로 해결한다", "팀장에게 즉시 보고한다"], correct: 2, explanation: "갈등은 회피가 아닌 직접 대화로 해결할 때 팀이 성장합니다." },
      { id: 3, text: "팀워크를 높이는 '피드백'의 황금 비율은?", options: ["부정 7 : 긍정 3", "긍정 3 : 부정 1", "긍정 5 : 부정 1", "50:50 균형"], correct: 2, explanation: "존 고트만의 연구에 따르면 긍정적 상호작용이 부정적 상호작용보다 5배 이상일 때 관계가 유지됩니다." },
      { id: 4, text: "브레인스토밍 시 가장 중요한 규칙은?", options: ["가장 좋은 아이디어만 말한다", "아이디어 비판 금지", "발언 시간 동일하게 배분", "리더가 먼저 방향 제시"], correct: 1, explanation: "브레인스토밍의 핵심은 판단 보류(비판 금지)입니다. 자유로운 발산이 혁신적 아이디어를 만듭니다." },
      { id: 5, text: "팀 성과 모델 'GRPI'에서 G가 의미하는 것은?", options: ["Growth", "Goal", "Group", "Guide"], correct: 1, explanation: "GRPI는 Goal(목표), Role(역할), Process(프로세스), Interpersonal(대인관계)의 약자로 고성과 팀의 4요소입니다." },
    ],
  },
  party: {
    title: '파티 퀴즈',
    color: 'text-pink-400',
    gradient: 'from-pink-500 to-rose-600',
    icon: <PartyPopper className="w-5 h-5" />,
    questions: [
      { id: 1, text: "세계에서 가장 많이 팔린 보드게임은?", options: ["모노폴리", "체스", "스크래블", "클루"], correct: 0, explanation: "모노폴리는 1935년 출시 이후 전 세계 47개 언어, 114개국에서 판매된 역대 최다 판매 보드게임입니다." },
      { id: 2, text: "유튜브 역사상 가장 많이 조회된 영상 장르는?", options: ["K-POP", "게임", "어린이 동요", "스포츠"], correct: 2, explanation: "Baby Shark, Johny Johny 등 어린이 동요가 유튜브 최다 조회 순위 상위권을 차지하고 있습니다." },
      { id: 3, text: "에펠탑은 원래 몇 년 후 철거 예정이었나요?", options: ["10년", "20년", "50년", "영구 보존"], correct: 1, explanation: "에펠탑은 1889년 파리 만국박람회를 위해 건설된 임시 구조물로, 20년 후 철거 예정이었으나 무선 통신 안테나로 활용되며 살아남았습니다." },
      { id: 4, text: "피자 한 판을 8등분할 때 한 조각의 각도는?", options: ["30도", "45도", "60도", "90도"], correct: 1, explanation: "원은 360도이므로 8등분하면 360÷8 = 45도입니다!" },
      { id: 5, text: "가장 많은 나라와 국경을 접한 나라는?", options: ["러시아", "중국", "브라질", "독일"], correct: 0, explanation: "러시아는 노르웨이, 핀란드, 에스토니아, 라트비아, 벨라루스, 우크라이나, 조지아, 아제르바이잔, 카자흐스탄 등 14개국과 국경을 접하고 있습니다." },
    ],
  },
};

// ─── 더미 참가자 ──────────────────────────────────────────────
const DUMMY_PARTICIPANTS: Participant[] = [
  { name: '김민준', score: 0, answers: [] },
  { name: '이서연', score: 0, answers: [] },
  { name: '박지호', score: 0, answers: [] },
  { name: '최하은', score: 0, answers: [] },
];

// ─── 메인 컴포넌트 ────────────────────────────────────────────
const QuizStage: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('join');
  const [code, setCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [category, setCategory] = useState<Category>('integrity');
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [participants, setParticipants] = useState<Participant[]>(DUMMY_PARTICIPANTS);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [isHost, setIsHost] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const quiz = QUIZ_DATA[category];
  const question = quiz.questions[currentQ];
  const totalQ = quiz.questions.length;

  // 타이머
  useEffect(() => {
    if (screen !== 'question') return;
    setTimeLeft(20);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleTimeUp();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [screen, currentQ]);

  const handleTimeUp = () => {
    if (selected === null) setSelected(-1);
    setShowAnswer(true);
    setTimeout(() => goNext(), 3000);
  };

  const handleJoin = () => {
    // ECO- 코드 확인 (데모용: 아무 코드나 허용)
    if (code.trim().length < 3 || !nickname.trim()) return;
    // 코드에서 카테고리 추론 (데모: 기본 integrity)
    const cat = code.toLowerCase().includes('w') ? 'workshop'
      : code.toLowerCase().includes('t') ? 'teambuilding'
      : code.toLowerCase().includes('p') ? 'party'
      : 'integrity';
    setCategory(cat as Category);
    setScreen('waiting');
    // 3초 후 퀴즈 시작 (데모용)
    setTimeout(() => startQuiz(), 3000);
  };

  const startQuiz = () => {
    setCurrentQ(0);
    setScore(0);
    setAnswers([]);
    setSelected(null);
    setShowAnswer(false);
    setScreen('question');
  };

  const handleSelect = (idx: number) => {
    if (selected !== null || showAnswer) return;
    clearInterval(timerRef.current!);
    setSelected(idx);
    setShowAnswer(true);
    const isCorrect = idx === question.correct;
    if (isCorrect) {
      const bonus = Math.ceil(timeLeft / 4);
      setScore(s => s + 100 + bonus * 10);
    }
    setAnswers(prev => [...prev, idx]);
    setTimeout(() => goNext(), 3000);
  };

  const goNext = () => {
    if (currentQ + 1 >= totalQ) {
      setScreen('final');
    } else {
      setCurrentQ(q => q + 1);
      setSelected(null);
      setShowAnswer(false);
      setScreen('question');
    }
  };

  const handleBack = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'facilitator' }));
  };

  const timerColor = timeLeft > 10 ? 'text-green-400' : timeLeft > 5 ? 'text-amber-400' : 'text-red-400';
  const timerBg = timeLeft > 10 ? 'bg-green-500' : timeLeft > 5 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <section className="relative z-10 py-16 px-4 w-full max-w-3xl mx-auto min-h-screen">

      {/* 뒤로가기 */}
      {screen === 'join' && (
        <div className="mb-8">
          <button onClick={handleBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group px-4 py-2 rounded-full hover:bg-slate-800/50">
            <div className="p-1.5 rounded-full bg-slate-800 border border-slate-700 group-hover:border-cyan-500 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm">이전 화면으로</span>
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">

        {/* ── 입장 화면 ── */}
        {screen === 'join' && (
          <motion.div key="join" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="max-w-md mx-auto">
            <div className="text-center mb-10">
              <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 1, delay: 0.5 }}
                className="text-6xl mb-4">🎯</motion.div>
              <span className="text-cyan-400 font-mono tracking-widest text-xs uppercase mb-2 block">Quiz Stage</span>
              <h2 className="text-4xl font-black text-white mb-2">세션 참가하기</h2>
              <p className="text-slate-400 text-sm">진행자에게 받은 코드를 입력하세요</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-700 rounded-3xl p-8 backdrop-blur-sm space-y-5">
              <div>
                <label className="text-slate-300 font-bold text-sm block mb-2">세션 코드</label>
                <input
                  value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="예) ECO-4821"
                  className="w-full px-4 py-4 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-xl font-mono font-black text-center tracking-widest focus:border-cyan-500 focus:outline-none placeholder:text-slate-600 placeholder:text-base placeholder:font-sans placeholder:tracking-normal transition-colors"
                  maxLength={8}
                />
              </div>
              <div>
                <label className="text-slate-300 font-bold text-sm block mb-2">닉네임</label>
                <input
                  value={nickname} onChange={e => setNickname(e.target.value)}
                  placeholder="화면에 표시될 이름"
                  className="w-full px-4 py-3.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-base focus:border-cyan-500 focus:outline-none placeholder:text-slate-600 transition-colors"
                  maxLength={10}
                />
              </div>

              <button onClick={handleJoin} disabled={code.trim().length < 3 || !nickname.trim()}
                className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.01] shadow-lg">
                <Zap className="w-5 h-5" /> 입장하기
              </button>
            </div>

            {/* 진행자 모드 */}
            <button onClick={() => { setIsHost(true); setCategory('integrity'); setScreen('waiting'); setTimeout(() => startQuiz(), 1000); }}
              className="mt-4 w-full py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-white border border-slate-800 hover:border-slate-600 transition-all flex items-center justify-center gap-2">
              <Play className="w-4 h-4" /> 진행자로 데모 시작
            </button>
          </motion.div>
        )}

        {/* ── 대기 화면 ── */}
        {screen === 'waiting' && (
          <motion.div key="waiting" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="text-center py-20">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-6xl mb-6">⏳</motion.div>
            <h2 className="text-3xl font-black text-white mb-2">잠시만 기다려주세요</h2>
            <p className="text-slate-400 mb-8">진행자가 세션을 시작하면 자동으로 연결됩니다</p>

            <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-6 max-w-sm mx-auto">
              <p className="text-slate-400 text-xs mb-3 font-bold uppercase tracking-wider">참가자 현황</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[...participants, { name: nickname || '나', score: 0, answers: [] }].map((p, i) => (
                  <motion.span key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                    className="px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-sm text-slate-300 font-bold flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    {p.name}
                  </motion.span>
                ))}
              </div>
              <p className="text-slate-500 text-xs mt-4">{participants.length + 1}명 접속 중</p>
            </div>
          </motion.div>
        )}

        {/* ── 퀴즈 화면 ── */}
        {screen === 'question' && (
          <motion.div key={`q-${currentQ}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>

            {/* 상단 HUD */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${QUIZ_DATA[category].color} bg-slate-800 border border-slate-700`}>
                  {QUIZ_DATA[category].icon}
                </div>
                <span className="text-slate-400 text-sm font-bold">{currentQ + 1} / {totalQ}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-white font-black text-sm">{score}</span>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 ${timerColor}`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-black text-sm tabular-nums">{timeLeft}s</span>
                </div>
              </div>
            </div>

            {/* 타이머 바 */}
            <div className="h-1.5 rounded-full bg-slate-800 mb-6 overflow-hidden">
              <motion.div className={`h-full rounded-full ${timerBg} transition-colors`}
                initial={{ width: '100%' }}
                animate={{ width: `${(timeLeft / 20) * 100}%` }}
                transition={{ duration: 1, ease: 'linear' }}
              />
            </div>

            {/* 진행 도트 */}
            <div className="flex gap-1.5 justify-center mb-8">
              {quiz.questions.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${
                  i < currentQ ? `w-8 ${QUIZ_DATA[category].gradient.includes('cyan') ? 'bg-cyan-500' : QUIZ_DATA[category].gradient.includes('violet') ? 'bg-violet-500' : QUIZ_DATA[category].gradient.includes('amber') ? 'bg-amber-500' : 'bg-pink-500'}`
                  : i === currentQ ? 'w-8 bg-white animate-pulse'
                  : 'w-4 bg-slate-700'
                }`} />
              ))}
            </div>

            {/* 질문 */}
            <div className="bg-slate-900/60 border border-slate-700 rounded-3xl p-7 mb-6 backdrop-blur-sm">
              <p className="text-white text-lg md:text-xl font-black leading-snug text-center break-keep">
                {question.text}
              </p>
            </div>

            {/* 보기 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {question.options.map((opt, idx) => {
                const isSelected = selected === idx;
                const isCorrect = idx === question.correct;
                const revealed = showAnswer;

                let style = 'bg-slate-900/60 border-slate-700 text-slate-200 hover:border-slate-500 hover:bg-slate-800/60';
                if (revealed) {
                  if (isCorrect) style = 'bg-green-500/20 border-green-500 text-white';
                  else if (isSelected && !isCorrect) style = 'bg-red-500/20 border-red-500 text-white opacity-70';
                  else style = 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-50';
                } else if (isSelected) {
                  style = 'bg-cyan-500/20 border-cyan-500 text-white scale-[1.01]';
                }

                return (
                  <motion.button key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={showAnswer}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-2xl border text-left font-bold text-sm transition-all flex items-center gap-3 ${style}`}
                  >
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                      revealed && isCorrect ? 'bg-green-500 text-white'
                      : revealed && isSelected && !isCorrect ? 'bg-red-500 text-white'
                      : 'bg-slate-800 text-slate-400'
                    }`}>
                      {revealed && isCorrect ? <CheckCircle2 className="w-4 h-4" /> : revealed && isSelected && !isCorrect ? <XCircle className="w-4 h-4" /> : ['①','②','③','④'][idx]}
                    </span>
                    <span className="break-keep leading-snug">{opt}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* 해설 */}
            <AnimatePresence>
              {showAnswer && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-5 rounded-2xl bg-slate-800/60 border border-slate-700">
                  <p className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">💡 해설</p>
                  <p className="text-slate-200 text-sm leading-relaxed">{question.explanation}</p>
                  {selected === question.correct && (
                    <p className="text-green-400 font-black text-sm mt-2">+{100 + Math.ceil(timeLeft / 4) * 10}점 획득!</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── 최종 결과 ── */}
        {screen === 'final' && (
          <motion.div key="final" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
              className="text-7xl mb-4">🏆</motion.div>
            <h2 className="text-4xl font-black text-white mb-1">퀴즈 완료!</h2>
            <p className="text-slate-400 mb-8">{nickname || '참가자'}님의 최종 점수예요</p>

            {/* 점수 카드 */}
            <div className={`p-8 rounded-3xl border bg-gradient-to-br ${
              score >= 400 ? 'from-amber-500/20 to-orange-600/10 border-amber-500/40'
              : score >= 200 ? 'from-cyan-500/20 to-blue-600/10 border-cyan-500/40'
              : 'from-slate-800/60 to-slate-900/60 border-slate-700'
            } mb-6`}>
              <p className="text-6xl font-black text-white mb-2">{score}</p>
              <p className="text-slate-400 text-sm">점</p>
              <p className="text-lg font-black mt-3 text-white">
                {score >= 400 ? '🥇 최고예요! 청렴 마스터!' : score >= 200 ? '🥈 훌륭해요!' : '🥉 다음엔 더 잘할 수 있어요!'}
              </p>
            </div>

            {/* 순위표 */}
            <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-5 mb-6 text-left">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> 참가자 순위
              </p>
              {[
                { name: nickname || '나', score, isMe: true },
                { name: '김민준', score: Math.floor(Math.random() * 200) + 300, isMe: false },
                { name: '이서연', score: Math.floor(Math.random() * 200) + 200, isMe: false },
                { name: '박지호', score: Math.floor(Math.random() * 200) + 100, isMe: false },
              ].sort((a, b) => b.score - a.score).map((p, i) => (
                <div key={i} className={`flex items-center gap-3 py-2.5 px-3 rounded-xl mb-1 ${p.isMe ? 'bg-cyan-500/10 border border-cyan-500/30' : ''}`}>
                  <span className="text-lg font-black w-6">{['🥇','🥈','🥉','4️⃣'][i]}</span>
                  <span className={`flex-1 font-bold text-sm ${p.isMe ? 'text-cyan-400' : 'text-slate-300'}`}>{p.name}{p.isMe ? ' (나)' : ''}</span>
                  <span className={`font-black text-sm ${p.isMe ? 'text-white' : 'text-slate-400'}`}>{p.score}점</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setScreen('join'); setScore(0); setCurrentQ(0); setAnswers([]); }}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-slate-800 border border-slate-700 hover:border-cyan-500 text-white transition-all">
                <RefreshCw className="w-4 h-4" /> 다시 하기
              </button>
              <button onClick={handleBack}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-600 to-violet-600 text-white hover:scale-[1.01] transition-all">
                <ChevronRight className="w-4 h-4" /> 대시보드로
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </section>
  );
};

export default QuizStage;
