import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Users, Play, CheckCircle2, XCircle,
  Trophy, Zap, Clock, BarChart3, RefreshCw,
  ChevronRight, Star, Shield, Briefcase, Handshake, PartyPopper, Volume2, VolumeX
} from 'lucide-react';

type Category = 'integrity' | 'workshop' | 'teambuilding' | 'party';
type Screen = 'join' | 'question' | 'final';

interface Question {
  id: number;
  story: string;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
  emoji: string;
}

interface Participant { name: string; score: number; }

const QUIZ_DATA: Record<Category, { title: string; color: string; gradient: string; bgColor: string; icon: React.ReactNode; questions: Question[] }> = {
  integrity: {
    title: '청렴·공정 퀴즈',
    color: 'text-cyan-400',
    gradient: 'from-cyan-600 to-blue-700',
    bgColor: 'bg-cyan-500/10',
    icon: <Shield className="w-5 h-5" />,
    questions: [
      {
        id: 1, emoji: '🍱',
        story: "김 과장은 오늘 민원인 박 사장에게 점심을 대접받았어요. 삼겹살에 냉면까지... 계산서를 보니 딱 49,000원! 김 과장, 괜찮은 건가요?",
        text: "2024년 8월 개정 청탁금지법, 음식물 한도는?",
        options: ["3만원 (아직 옛날 기준!)", "5만원 ✅ (2024 개정)", "7만원 (너무 관대한데?)", "10만원 (그럼 좋겠다)"],
        correct: 1,
        explanation: "2024년 8월 27일부터 음식물 한도 3만원→5만원 상향! 박 사장 점심 49,000원은 OK입니다 😄 선물 5만원, 경조사비 5만원은 동일합니다."
      },
      {
        id: 2, emoji: '🏠',
        story: "이 주무관은 신도시 개발 업무를 맡았는데... 어라? 개발 예정지 바로 옆에 본인 땅이 있네요! 팀장은 '그냥 일해'라고 했지만 이 주무관 마음이 불편합니다.",
        text: "이 주무관이 반드시 해야 할 행동은?",
        options: ["조용히 땅 팔기 🤫", "소속기관장에게 사적 이해관계 신고 📋", "팀장 말 듣고 그냥 진행", "익명으로 스스로 민원 신고"],
        correct: 1,
        explanation: "이해충돌방지법 제5조! 직무 관련 본인 부동산은 반드시 신고해야 해요. 신고하면 직무 회피·업무 재배정이 가능합니다. 정직하게 신고하면 오히려 보호받아요! 💪"
      },
      {
        id: 3, emoji: '😤',
        story: "최 팀장은 새로 온 신입 박 씨를 매일 갈굽니다. '너 왜 이렇게 느려?' '넌 왜 태어났냐?' 심지어 야근 중 커피 심부름에 청소까지... 박 씨는 퇴근 후 매일 울었어요.",
        text: "박 씨가 신고하면 회사(사용자)가 해야 할 법적 의무는?",
        options: ["'원래 다 그렇게 해' 무혐의", "경고 1회로 끝", "지체 없이 사실 확인 조사 실시 ⚖️", "경찰에 바로 신고"],
        correct: 2,
        explanation: "근로기준법 제76조의3! 직장 내 괴롭힘 신고 접수 시 사용자는 지체 없이 조사해야 합니다. 조사 안 하면 사용자도 처벌받아요. 박 씨, 용기 내서 신고하세요! 🙌"
      },
      {
        id: 4, emoji: '📢',
        story: "정 주임은 기관에서 불법 예산 횡령을 목격했어요. 신고하고 싶은데 보복이 무섭습니다. 그런데 신고 후 불이익을 준 상사, 과연 어떻게 될까요?",
        text: "공익신고를 이유로 불이익을 준 자의 처벌은?",
        options: ["주의 처분", "감봉 3개월", "3년 이하 징역 또는 3천만원 이하 벌금 💥", "5년 이하 징역"],
        correct: 2,
        explanation: "공익신고자 보호법 제30조! 불이익 조치를 하면 3년 이하 징역 또는 3천만원 이하 벌금입니다. 정 주임, 신고하세요! 법이 보호합니다! 🛡️"
      },
      {
        id: 5, emoji: '📊',
        story: "우리 기관 청렴도 결과가 나왔어요. 외부 민원인들은 '꽤 괜찮아요'라고 했는데, 내부 직원들은 '글쎄요...'라고 했어요. 종합 점수는 어떻게 나올까요?",
        text: "국민권익위원회 종합청렴도 산출 방식은?",
        options: ["외부청렴도만 반영", "내부청렴도만 반영", "외부+내부+정책고객평가 가중 합산 📐", "민원 만족도 단일 지표"],
        correct: 2,
        explanation: "종합청렴도 = 외부청렴도 + 내부청렴도 + 정책고객평가 가중 합산! 외부는 좋은데 내부가 낮으면 종합 점수 깎여요. 내부부터 챙겨야겠죠? 😅"
      },
    ],
  },
  workshop: {
    title: '기업 워크숍 퀴즈',
    color: 'text-violet-400',
    gradient: 'from-violet-600 to-purple-700',
    bgColor: 'bg-violet-500/10',
    icon: <Briefcase className="w-5 h-5" />,
    questions: [
      {
        id: 1, emoji: '😰',
        story: "회의 중 김 대리가 '저 아이디어 있는데요...' 하고 말했다가 팀장한테 '그게 말이 돼요?'라고 바로 눌렸어요. 다음 회의부터 아무도 말을 안 합니다. 팀장, 무슨 개념이 부족한 걸까요?",
        text: "조직 내 자유로운 발언을 가능하게 하는 개념은?",
        options: ["워라밸", "심리적 안전감 🛡️", "MBO", "애자일"],
        correct: 1,
        explanation: "하버드 에이미 에드먼슨 교수의 '심리적 안전감'! 구글 Project Aristotle도 고성과 팀의 1순위로 꼽았어요. 팀장님, '좋은 의견이에요'부터 시작해봐요! 🙏"
      },
      {
        id: 2, emoji: '🎯',
        story: "구글 직원들은 자기 목표를 전 직원이 볼 수 있게 공개합니다. '이번 분기 나는 이걸 달성하겠다!'고요. 달성률 70%도 성공으로 보는 독특한 시스템이에요.",
        text: "이 목표 관리 시스템의 이름은?",
        options: ["KPI", "OKR 🎯", "BSC", "MBO"],
        correct: 1,
        explanation: "OKR = Objectives + Key Results! 인텔에서 시작해 구글이 대중화. 100% 달성은 오히려 목표가 낮다는 신호! 70%가 적당한 도전이라는 독특한 철학입니다 🚀"
      },
      {
        id: 3, emoji: '🤸',
        story: "줄다리기 실험에서 혼자 할 때는 100% 힘을 썼는데, 8명이 함께 하니까 각자 50%밖에 안 씁니다. '나 하나쯤이야...' 라는 생각, 다들 한 번씩 해봤죠? 😅",
        text: "집단 내 개인 노력 감소 현상의 이름은?",
        options: ["피터의 법칙", "파킨슨 법칙", "링겔만 효과 😴", "호손 효과"],
        correct: 2,
        explanation: "링겔만 효과 = 사회적 태만! 집단이 커질수록 개인 기여도가 줄어듭니다. 해결책은 개인 역할을 명확히 하고 기여도를 가시화하는 것! 👀"
      },
      {
        id: 4, emoji: '💬',
        story: "팀장 오 과장이 직원 최 대리와 매주 30분씩 단둘이 대화합니다. 업무 보고가 아니라 '요즘 어때요? 뭐가 힘들어요?'를 묻습니다. 최 대리는 요즘 출근이 즐겁습니다.",
        text: "오 과장이 하고 있는 이것의 핵심 목적은?",
        options: ["업무 진행 상황 점검", "성과 평가 준비", "구성원 성장 지원과 신뢰 구축 💝", "프로젝트 리뷰"],
        correct: 2,
        explanation: "1on1 미팅의 핵심은 신뢰 구축! 업무 보고는 NO, 성장과 고민 나누기가 YES. 실리콘밸리 최고 리더들의 필수 루틴입니다. 오 과장 칭찬해요! 👏"
      },
      {
        id: 5, emoji: '🌟',
        story: "연구에 따르면 칭찬과 지적의 비율이 중요하다고 해요. '잘했어! 잘했어! 잘했어! 잘했어! 잘했어! 근데 이건 아니야.' 이 비율이 관계를 유지한다고 합니다.",
        text: "관계 유지를 위한 긍정:부정 황금 비율은?",
        options: ["1:1 (공평하게)", "3:1 (세 번 칭찬)", "5:1 🌟", "10:1 (무조건 칭찬)"],
        correct: 2,
        explanation: "존 고트만 박사의 연구! 긍정:부정 = 5:1 이상일 때 관계가 유지됩니다. 부부 관계, 팀 관계 모두 동일! 오늘부터 칭찬 5번 하고 지적 1번 해보세요 😊"
      },
    ],
  },
  teambuilding: {
    title: '팀빌딩 퀴즈',
    color: 'text-amber-400',
    gradient: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-500/10',
    icon: <Handshake className="w-5 h-5" />,
    questions: [
      {
        id: 1, emoji: '🔥',
        story: "우리 팀 회의 시간, 팀장이 먼저 '내 생각엔 이렇게 해야 해'라고 말하면... 나머지 팀원들은 그냥 '네, 좋습니다'합니다. 아무도 반대 의견을 안 내요. 이 팀의 가장 큰 문제는?",
        text: "팀에서 가장 중요한 기반은?",
        options: ["빠른 실행력 ⚡", "소통과 심리적 안전감 💬", "완벽한 업무 분장", "강력한 리더십"],
        correct: 1,
        explanation: "'저는 다르게 생각하는데요'라고 말할 수 있는 분위기가 혁신의 시작입니다. 팀장님, 먼저 '내 의견이 틀릴 수도 있어'라고 말해보세요! 🙌"
      },
      {
        id: 2, emoji: '💡',
        story: "마케팅팀 아이디어 회의. '우주에서 광고하기', '강아지한테 직접 마케팅', '냉장고 안에 광고판 설치'... 황당한 아이디어들이 쏟아집니다. 이게 맞는 방식일까요?",
        text: "브레인스토밍에서 가장 중요한 규칙은?",
        options: ["현실 가능한 아이디어만", "아이디어 비판 금지 🚫", "리더가 방향 먼저 제시", "시간 내에 딱 3개만"],
        correct: 1,
        explanation: "브레인스토밍의 황금률 = 판단 보류! '그거 말이 돼요?' 한 마디가 천 개의 아이디어를 죽입니다. 황당한 아이디어에서 혁신이 나와요! ✍️"
      },
      {
        id: 3, emoji: '🤝',
        story: "영업팀 박 대리와 개발팀 이 대리가 사사건건 부딪힙니다. 팀장은 '어른답게 알아서 해결해'라고 했고, 두 사람은 서로 카톡도 안 합니다.",
        text: "갈등의 가장 건강한 해결 방법은?",
        options: ["시간이 지나면 해결돼 ⏰", "팀장이 중재해야지", "당사자가 직접 대화 🗣️", "부서를 분리해버리기"],
        correct: 2,
        explanation: "갈등은 회피할수록 커집니다! '저 사실 이 부분이 불편했어요'라고 직접 말하는 게 최선. 갈등을 직접 해결한 팀이 장기적으로 더 강해집니다 💪"
      },
      {
        id: 4, emoji: '🎉',
        story: "신입 강 씨가 데이터 분석을 잘못해서 발표를 망쳤어요. 팀장은 '괜찮아, 그게 어려운 분석이었어. 다음엔 같이 해보자'라고 했습니다. 강 씨, 이후 어떻게 됐을까요?",
        text: "이 팀장이 만들고 있는 팀 문화는?",
        options: ["무한 관용 문화 😅", "실수 허용 + 성장 중심 문화 🌱", "성과 없이 격려만", "책임감이 없는 문화"],
        correct: 1,
        explanation: "실수를 처벌하면 아무도 도전 안 합니다! 픽사, 구글의 공통점이 바로 '실수는 배움의 과정' 문화예요. 강 씨는 이후 팀 최고 연구원이 됐다는 후문... 🌟"
      },
      {
        id: 5, emoji: '🏆',
        story: "회식 날 누군가 '우리 팀의 강점이 뭐야?'라고 물었어요. '음... 다들 착하잖아' '야근을 잘 해' '갈등이 없어'... 진짜 강점을 모르는 것 같습니다.",
        text: "고성과 팀 분석 모델 GRPI에서 가장 먼저 필요한 것은?",
        options: ["Role(역할 명확화)", "Goal(명확한 목표) 🎯", "Process(업무 프로세스)", "Interpersonal(대인관계)"],
        correct: 1,
        explanation: "GRPI = Goal → Role → Process → Interpersonal 순서! '우리 팀 이번 분기 목표가 뭐야?'를 모든 팀원이 같은 답을 할 수 있어야 합니다! 🎯"
      },
    ],
  },
  party: {
    title: '파티 퀴즈 🎉',
    color: 'text-pink-400',
    gradient: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-500/10',
    icon: <PartyPopper className="w-5 h-5" />,
    questions: [
      {
        id: 1, emoji: '🎲',
        story: "전 세계 어딘가에서 지금 이 순간도 누군가 하고 있는 보드게임이에요. 감옥도 가고, 집도 사고, 파산도 하는... 가족 모임마다 싸움이 나는 바로 그 게임!",
        text: "세계에서 가장 많이 팔린 보드게임은?",
        options: ["체스 ♟️", "모노폴리 🏠", "스크래블 🔤", "바둑 ⚫"],
        correct: 1,
        explanation: "모노폴리! 1935년 출시 후 47개 언어, 114개국 판매. 한 판 평균 소요 시간 2시간이지만 가족 싸움 포함하면 4시간... 그래도 역대 최다 판매! 😂"
      },
      {
        id: 2, emoji: '🦈',
        story: "유튜브에서 100억 뷰를 넘긴 영상들의 공통점이 있어요. 'Baby Shark doo doo doo~' 한번쯤 들어보셨죠? 이 노래가 속한 장르가 유튜브 최다 조회를 기록했습니다.",
        text: "유튜브 역사상 최다 조회 영상 장르는?",
        options: ["K-POP 🎵", "축구 하이라이트 ⚽", "어린이 동요 🧒", "먹방 🍜"],
        correct: 2,
        explanation: "Baby Shark는 무려 135억 뷰! 아이들이 하루에도 몇 번씩 반복 재생하는 파워... 부모님들은 이 노래가 꿈에도 나온다고 합니다. doo doo doo~ 🦈"
      },
      {
        id: 3, emoji: '🗼',
        story: "파리의 상징 에펠탑, 처음엔 파리 시민들이 엄청 싫어했어요. '흉물스럽다', '고철 덩어리'라고 했죠. 게다가 이 탑은 원래 사라질 운명이었어요!",
        text: "에펠탑 원래 철거 예정 시기는?",
        options: ["10년 후", "20년 후 🗓️", "50년 후", "처음부터 영구 보존"],
        correct: 1,
        explanation: "1889년 파리 만국박람회용 임시 구조물로 20년 후 철거 예정이었어요! 무선 통신 안테나로 쓰이면서 살아남았습니다. 지금은 프랑스 관광 수입 1위... 운명이란 🗼"
      },
      {
        id: 4, emoji: '🍕',
        story: "점심으로 피자를 시켰어요. 동그란 피자를 8명이 공평하게 나눠 먹으려면 8조각으로 잘라야 해요. 수학 시간이 갑자기 떠오르네요. 각 조각의 각도는?",
        text: "피자 한 판 8등분 시 한 조각의 각도는?",
        options: ["30도 📐", "45도 ✅", "60도", "90도"],
        correct: 1,
        explanation: "360도 ÷ 8 = 45도! 근데 사실 중요한 건... 가장 큰 조각 먼저 집는 사람이 옆에 있다는 것! 피자 집을 때 손 빠른 사람이 이깁니다 🍕"
      },
      {
        id: 5, emoji: '🌍',
        story: "세계 지도를 펼쳐보면 어떤 나라는 엄청 많은 이웃 나라를 갖고 있어요. 땅이 넓은 나라일수록 이웃 나라가 많겠죠? 과연 세계 1위는 어디일까요?",
        text: "가장 많은 나라와 국경을 접한 나라는? (공동 1위)",
        options: ["중국 🇨🇳 (14개국)", "러시아 🇷🇺 (14개국)", "브라질 🇧🇷 (10개국)", "독일 🇩🇪 (9개국)"],
        correct: 0,
        explanation: "중국과 러시아가 공동 1위 각 14개국! 정답을 러시아로 알고 계셨다면... 중국도 맞아요! 둘 다 정답인 재미있는 문제였죠? 🥇🥇"
      },
    ],
  },
};

const DUMMY_NAMES = ['김민준 🦁', '이서연 🌸', '박지호 🚀', '최하은 ⭐', '정우성 🎯', '한소희 💫', '오세진 🔥', '윤아름 🌈'];

// ─── 폭죽 ─────────────────────────────────────────────────────
const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;
  const colors = ['#06b6d4', '#a78bfa', '#f59e0b', '#ec4899', '#10b981', '#f97316', '#ffffff'];
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 80 }).map((_, i) => (
        <motion.div key={i}
          initial={{ y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), opacity: 1, scale: 1 }}
          animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 100, opacity: 0, scale: 0.3, rotate: Math.random() * 720 }}
          transition={{ duration: 2.5 + Math.random() * 2, delay: Math.random() * 0.8, ease: 'easeIn' }}
          className="absolute rounded-sm"
          style={{ width: 8 + Math.random() * 8, height: 8 + Math.random() * 8, backgroundColor: colors[Math.floor(Math.random() * colors.length)] }}
        />
      ))}
    </div>
  );
};

// ─── 메인 ─────────────────────────────────────────────────────
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
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [confetti, setConfetti] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [lastBonus, setLastBonus] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const quiz = QUIZ_DATA[category];
  const question = quiz.questions[currentQ];
  const totalQ = quiz.questions.length;

  const getAudioCtx = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return audioCtxRef.current;
  };

  const playSound = useCallback((type: 'tick' | 'correct' | 'wrong' | 'start' | 'finish') => {
    if (!soundOn) return;
    try {
      const ctx = getAudioCtx();
      if (type === 'tick') {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = 880; o.type = 'sine';
        g.gain.setValueAtTime(0.08, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.08);
      } else if (type === 'correct') {
        [523, 659, 784].forEach((freq, i) => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.value = freq; o.type = 'sine';
          g.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.12);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.2);
          o.start(ctx.currentTime + i * 0.12); o.stop(ctx.currentTime + i * 0.12 + 0.2);
        });
      } else if (type === 'wrong') {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(200, ctx.currentTime);
        o.frequency.setValueAtTime(140, ctx.currentTime + 0.25);
        g.gain.setValueAtTime(0.2, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.35);
      } else if (type === 'start') {
        [261, 329, 392, 523].forEach((freq, i) => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.value = freq; o.type = 'sine';
          g.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.15);
          o.start(ctx.currentTime + i * 0.1); o.stop(ctx.currentTime + i * 0.1 + 0.15);
        });
      } else if (type === 'finish') {
        [523, 659, 784, 1047, 1319].forEach((freq, i) => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.value = freq; o.type = 'sine';
          g.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.13);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.13 + 0.3);
          o.start(ctx.currentTime + i * 0.13); o.stop(ctx.currentTime + i * 0.13 + 0.3);
        });
      }
    } catch (e) {}
  }, [soundOn]);

  useEffect(() => {
    if (screen !== 'question') return;
    setTimeLeft(20);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); handleTimeUp(); return 0; }
        if (t <= 5) playSound('tick');
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [screen, currentQ]);

  const handleTimeUp = () => {
    setSelected(-1); setShowAnswer(true); playSound('wrong');
    setTimeout(() => goNext(), 3500);
  };

  const handleJoin = () => {
    if (code.trim().length < 3 || !nickname.trim()) return;
    const count = 5 + Math.floor(Math.random() * 4);
    setParticipants(DUMMY_NAMES.slice(0, count).map(n => ({ name: n, score: 0 })));
    playSound('start');
    setCurrentQ(0); setScore(0); setSelected(null); setShowAnswer(false);
    setScreen('question');
  };

  const handleSelect = (idx: number) => {
    if (selected !== null || showAnswer) return;
    clearInterval(timerRef.current!);
    setSelected(idx); setShowAnswer(true);
    if (idx === question.correct) {
      const bonus = Math.ceil(timeLeft / 4) * 10;
      setLastBonus(100 + bonus); setScore(s => s + 100 + bonus); playSound('correct');
    } else { setLastBonus(0); playSound('wrong'); }
    setTimeout(() => goNext(), 3500);
  };

  const goNext = () => {
    if (currentQ + 1 >= totalQ) {
      playSound('finish'); setConfetti(true); setTimeout(() => setConfetti(false), 5000);
      setParticipants(prev => prev.map(p => ({ ...p, score: Math.floor(Math.random() * 450) + 50 })));
      setScreen('final');
    } else {
      setCurrentQ(q => q + 1); setSelected(null); setShowAnswer(false);
    }
  };

  const handleBack = () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'facilitator' }));

  const timerColor = timeLeft > 10 ? 'text-green-400' : timeLeft > 5 ? 'text-amber-400' : 'text-red-400 animate-pulse';
  const timerBg = timeLeft > 10 ? 'bg-green-500' : timeLeft > 5 ? 'bg-amber-500' : 'bg-red-500';

  const allParticipants = [...participants, { name: `${nickname || '나'} 👤`, score }].sort((a, b) => b.score - a.score);
  const myRank = allParticipants.findIndex(p => p.name === `${nickname || '나'} 👤`) + 1;
  const rankEmojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

  return (
    <section className="relative z-10 py-16 px-4 w-full max-w-3xl mx-auto min-h-screen">
      <Confetti active={confetti} />

      {/* 상단 바 */}
      <div className="flex items-center justify-between mb-8">
        {(screen === 'join' || screen === 'final') ? (
          <button onClick={handleBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group px-4 py-2 rounded-full hover:bg-slate-800/50">
            <div className="p-1.5 rounded-full bg-slate-800 border border-slate-700 group-hover:border-cyan-500 transition-all"><ArrowLeft className="w-4 h-4" /></div>
            <span className="font-bold text-sm">이전 화면으로</span>
          </button>
        ) : <div />}
        <button onClick={() => setSoundOn(s => !s)} className="p-2.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors">
          {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence mode="wait">

        {/* ── 입장 ── */}
        {screen === 'join' && (
          <motion.div key="join" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-md mx-auto">
            <div className="text-center mb-10">
              <motion.div animate={{ rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 1.5, delay: 0.3 }} className="text-7xl mb-4">🎯</motion.div>
              <span className="text-cyan-400 font-mono tracking-widest text-xs uppercase mb-2 block">EcoStage Quiz</span>
              <h2 className="text-4xl font-black text-white mb-2">세션 참가하기</h2>
              <p className="text-slate-400 text-sm">진행자에게 받은 코드를 입력하세요</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-700 rounded-3xl p-8 backdrop-blur-sm space-y-5">
              <div>
                <label className="text-slate-300 font-bold text-sm block mb-2">세션 코드</label>
                <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="예) ECO-4821"
                  className="w-full px-4 py-4 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-xl font-mono font-black text-center tracking-widest focus:border-cyan-500 focus:outline-none placeholder:text-slate-600 placeholder:text-base placeholder:font-sans placeholder:tracking-normal transition-colors" maxLength={8} />
              </div>
              <div>
                <label className="text-slate-300 font-bold text-sm block mb-2">닉네임</label>
                <input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="화면에 표시될 이름"
                  className="w-full px-4 py-3.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-base focus:border-cyan-500 focus:outline-none placeholder:text-slate-600 transition-colors" maxLength={10} />
              </div>
              <button onClick={handleJoin} disabled={code.trim().length < 3 || !nickname.trim()}
                className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.01] shadow-lg">
                <Zap className="w-5 h-5" /> 입장하기
              </button>
            </div>
            <button onClick={() => { setNickname('진행자'); setCode('ECO-0000'); const count = 6; setParticipants(DUMMY_NAMES.slice(0, count).map(n => ({ name: n, score: 0 }))); setCategory('integrity'); playSound('start'); setCurrentQ(0); setScore(0); setSelected(null); setShowAnswer(false); setScreen('question'); }}
              className="mt-4 w-full py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-white border border-slate-800 hover:border-slate-600 transition-all flex items-center justify-center gap-2">
              <Play className="w-4 h-4" /> 진행자로 데모 시작
            </button>
          </motion.div>
        )}

        {/* ── 퀴즈 ── */}
        {screen === 'question' && (
          <motion.div key={`q-${currentQ}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${quiz.bgColor} border border-slate-700`}>{quiz.icon}</div>
                <span className="text-slate-400 text-sm font-bold">{currentQ + 1} / {totalQ}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
                  <Users className="w-3.5 h-3.5 text-slate-400" /><span className="text-white font-black text-sm">{participants.length + 1}명</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
                  <Star className="w-3.5 h-3.5 text-amber-400" /><span className="text-white font-black text-sm">{score}</span>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 ${timerColor}`}>
                  <Clock className="w-3.5 h-3.5" /><span className="font-black text-sm tabular-nums">{timeLeft}s</span>
                </div>
              </div>
            </div>

            <div className="h-2 rounded-full bg-slate-800 mb-5 overflow-hidden">
              <motion.div className={`h-full rounded-full ${timerBg} transition-colors duration-500`} style={{ width: `${(timeLeft / 20) * 100}%` }} transition={{ duration: 0.9, ease: 'linear' }} />
            </div>

            <div className="flex gap-1.5 justify-center mb-5">
              {quiz.questions.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i < currentQ ? 'w-8 bg-cyan-500' : i === currentQ ? 'w-8 bg-white animate-pulse' : 'w-4 bg-slate-700'}`} />
              ))}
            </div>

            {/* 스토리 */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800/40 border border-slate-700 rounded-2xl px-5 py-4 mb-4">
              <div className="flex items-start gap-3">
                <span className="text-3xl shrink-0">{question.emoji}</span>
                <p className="text-slate-300 text-sm leading-relaxed break-keep">{question.story}</p>
              </div>
            </motion.div>

            {/* 질문 */}
            <div className="bg-slate-900/70 border border-slate-600 rounded-2xl p-5 mb-5">
              <p className="text-white text-lg md:text-xl font-black leading-snug text-center break-keep">❓ {question.text}</p>
            </div>

            {/* 보기 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {question.options.map((opt, idx) => {
                const isSelected = selected === idx;
                const isCorrect = idx === question.correct;
                const revealed = showAnswer;
                let style = 'bg-slate-900/60 border-slate-700 text-slate-200 hover:border-slate-500 hover:bg-slate-800/60 cursor-pointer';
                if (revealed) {
                  if (isCorrect) style = 'bg-green-500/20 border-green-400 text-white shadow-lg shadow-green-500/20';
                  else if (isSelected) style = 'bg-red-500/20 border-red-400 text-white opacity-70';
                  else style = 'bg-slate-900/30 border-slate-800 text-slate-600 opacity-40';
                } else if (isSelected) style = 'bg-cyan-500/20 border-cyan-400 text-white scale-[1.01]';
                return (
                  <motion.button key={idx} onClick={() => handleSelect(idx)} disabled={showAnswer} whileTap={{ scale: 0.97 }}
                    className={`p-4 rounded-2xl border text-left font-bold text-sm transition-all flex items-center gap-3 ${style}`}>
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${revealed && isCorrect ? 'bg-green-500 text-white' : revealed && isSelected ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      {revealed && isCorrect ? <CheckCircle2 className="w-4 h-4" /> : revealed && isSelected && !isCorrect ? <XCircle className="w-4 h-4" /> : ['①', '②', '③', '④'][idx]}
                    </span>
                    <span className="break-keep leading-snug">{opt}</span>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {showAnswer && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-5 rounded-2xl bg-slate-800/60 border border-slate-600">
                  <p className="text-xs text-slate-400 font-bold mb-2 uppercase tracking-wider">💡 해설</p>
                  <p className="text-slate-200 text-sm leading-relaxed">{question.explanation}</p>
                  {selected === question.correct && lastBonus > 0 && (
                    <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-green-400 font-black text-xl mt-2">🎉 +{lastBonus}점!</motion.p>
                  )}
                  {(selected === -1 || (selected !== null && selected !== question.correct)) && (
                    <p className="text-red-400 font-bold text-sm mt-2">😅 아쉽지만 다음 문제 화이팅!</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── 결과 ── */}
        {screen === 'final' && (
          <motion.div key="final" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-4">
            <div className="text-center mb-8">
              <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', delay: 0.2 }} className="text-7xl mb-4">🏆</motion.div>
              <h2 className="text-4xl font-black text-white mb-1">퀴즈 완료!</h2>
              <p className="text-slate-400">{nickname || '참가자'}님의 최종 결과</p>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className={`p-7 rounded-3xl border mb-5 text-center ${score >= 400 ? 'bg-amber-500/10 border-amber-500/40' : score >= 250 ? 'bg-cyan-500/10 border-cyan-500/40' : 'bg-slate-800/60 border-slate-700'}`}>
              <p className="text-7xl font-black text-white mb-1">{score}<span className="text-2xl text-slate-400 ml-1">점</span></p>
              <p className="text-xl font-black mt-3 text-white">
                {myRank === 1 ? '🥇 1등! 완전 청렴 마스터!' : myRank === 2 ? '🥈 2등! 훌륭해요!' : myRank === 3 ? '🥉 3등! 잘하셨어요!' : `${myRank}등! 다음엔 더 잘할 수 있어요!`}
              </p>
              <p className="text-slate-400 text-sm mt-1">{allParticipants.length}명 중 <span className="text-white font-black">{myRank}위</span></p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-slate-900/60 border border-slate-700 rounded-2xl p-5 mb-5">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> 전체 순위 ({allParticipants.length}명)
              </p>
              <div className="space-y-2">
                {allParticipants.map((p, i) => {
                  const isMe = p.name === `${nickname || '나'} 👤`;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.06 }}
                      className={`flex items-center gap-3 py-2.5 px-3 rounded-xl ${isMe ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-slate-800/40'}`}>
                      <span className="text-xl w-7 text-center shrink-0">{rankEmojis[i] || `${i + 1}`}</span>
                      <span className={`flex-1 font-bold text-sm ${isMe ? 'text-cyan-300' : 'text-slate-300'}`}>{p.name}{isMe ? ' ← 나!' : ''}</span>
                      <span className={`font-black text-sm tabular-nums ${isMe ? 'text-white' : 'text-slate-400'}`}>{p.score}점</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setScreen('join'); setScore(0); setCurrentQ(0); setSelected(null); setShowAnswer(false); }}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-slate-800 border border-slate-700 hover:border-cyan-500 text-white transition-all">
                <RefreshCw className="w-4 h-4" /> 다시 하기
              </button>
              <button onClick={handleBack}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-600 to-violet-600 text-white hover:scale-[1.01] transition-all shadow-lg">
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
