import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Users, Play, CheckCircle2, XCircle,
  Zap, Clock, BarChart3, RefreshCw,
  ChevronRight, Star, Shield, Briefcase, Handshake, PartyPopper, Volume2, VolumeX
} from 'lucide-react';

type Category = 'integrity' | 'workshop' | 'teambuilding' | 'party';
type Screen = 'join' | 'question' | 'final';

interface Question {
  id: number;
  category: Category;
  story: string;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
  emoji: string;
}

interface Participant { name: string; score: number; }

interface QuizStageProps {
  initialCategories?: string[];   // FacilitatorDashboard에서 전달
  initialCode?: string;
}

// ─── 전체 문제 풀 ─────────────────────────────────────────────
const ALL_QUESTIONS: Question[] = [
  // ── 청렴·공정 ──
  {
    id: 101, category: 'integrity', emoji: '🍱',
    story: "김 과장은 민원인 박 사장에게 점심을 대접받았어요. 삼겹살에 냉면까지... 계산서가 딱 49,000원! 김 과장, 이거 괜찮은 건가요?",
    text: "2024년 8월 개정 청탁금지법, 음식물 한도는?",
    options: ["3만원 (옛날 기준!)", "5만원 ✅ (2024 개정)", "7만원", "10만원"],
    correct: 1,
    explanation: "2024년 8월 27일부터 음식물 한도 3만원→5만원 상향! 49,000원은 OK 😄 선물 5만원, 경조사비 5만원은 동일합니다."
  },
  {
    id: 102, category: 'integrity', emoji: '🏠',
    story: "이 주무관은 신도시 개발 업무를 맡았는데... 어라? 개발 예정지 바로 옆에 본인 땅이 있어요! 팀장은 '그냥 일해'라고 하는데...",
    text: "이 주무관이 반드시 해야 할 행동은?",
    options: ["조용히 땅 팔기 🤫", "소속기관장에게 사적 이해관계 신고 📋", "팀장 말 듣고 그냥 진행", "익명으로 스스로 민원 신고"],
    correct: 1,
    explanation: "이해충돌방지법 제5조! 직무 관련 본인 부동산은 반드시 신고해야 해요. 신고하면 직무 회피·재배정이 가능합니다 💪"
  },
  {
    id: 103, category: 'integrity', emoji: '😤',
    story: "최 팀장은 신입 박 씨를 매일 갈굽니다. '너 왜 이렇게 느려?' '넌 왜 태어났냐?' 야근 중 커피 심부름에 청소까지... 박 씨는 퇴근 후 매일 울어요.",
    text: "박 씨 신고 후 회사(사용자)의 법적 의무는?",
    options: ["'원래 다 그렇게 해' 무혐의", "경고 1회로 끝", "지체 없이 사실 확인 조사 실시 ⚖️", "경찰에 바로 신고"],
    correct: 2,
    explanation: "근로기준법 제76조의3! 신고 접수 시 사용자는 즉시 조사해야 합니다. 안 하면 사용자도 처벌받아요. 용기 내서 신고하세요! 🙌"
  },
  {
    id: 104, category: 'integrity', emoji: '📢',
    story: "정 주임은 기관에서 불법 예산 횡령을 목격했어요. 신고하고 싶은데 보복이 무섭습니다. 신고 후 불이익을 준 상사는 어떻게 될까요?",
    text: "공익신고를 이유로 불이익을 준 자의 처벌은?",
    options: ["주의 처분", "감봉 3개월", "3년 이하 징역 또는 3천만원 이하 벌금 💥", "5년 이하 징역"],
    correct: 2,
    explanation: "공익신고자 보호법 제30조! 불이익 조치를 하면 3년 이하 징역 또는 3천만원 이하 벌금! 법이 보호합니다 🛡️"
  },
  {
    id: 105, category: 'integrity', emoji: '📊',
    story: "우리 기관 청렴도 결과 발표! 외부 민원인들은 '꽤 괜찮아요'라고 했는데, 내부 직원들은 '글쎄요...'라고 했어요. 종합 점수는 어떻게 산출될까요?",
    text: "국민권익위원회 종합청렴도 산출 방식은?",
    options: ["외부청렴도만 반영", "내부청렴도만 반영", "외부+내부+정책고객평가 가중 합산 📐", "민원 만족도 단일 지표"],
    correct: 2,
    explanation: "종합청렴도 = 외부+내부+정책고객평가 가중 합산! 외부는 좋은데 내부가 낮으면 깎여요. 내부부터 챙겨야겠죠? 😅"
  },
  {
    id: 106, category: 'integrity', emoji: '💰',
    story: "공무원 오 계장이 업체 담당자에게 '우리 애 결혼하는데...' 했더니 업체에서 축의금 100만원을 보냈어요. 오 계장, 이거 받아도 되나요?",
    text: "청탁금지법상 경조사비 한도는?",
    options: ["3만원", "5만원 ✅", "10만원", "상한 없음 (친한 사이면 OK)"],
    correct: 1,
    explanation: "경조사비 한도는 5만원! 100만원은 당연히 위법입니다 😱 오 계장은 95만원을 돌려보내야 해요. '우리 친해서~'는 통하지 않아요!"
  },

  // ── 기업 워크숍 ──
  {
    id: 201, category: 'workshop', emoji: '😰',
    story: "회의 중 김 대리가 '저 아이디어 있는데요...' 했다가 팀장한테 '그게 말이 돼요?'라고 눌렸어요. 다음 회의부터 아무도 말을 안 합니다.",
    text: "조직 내 자유로운 발언을 가능하게 하는 핵심 개념은?",
    options: ["워라밸", "심리적 안전감 🛡️", "MBO", "애자일"],
    correct: 1,
    explanation: "에이미 에드먼슨의 '심리적 안전감'! 구글 Project Aristotle도 고성과 팀 1순위로 꼽았어요. '좋은 의견이에요'부터 시작해봐요 🙏"
  },
  {
    id: 202, category: 'workshop', emoji: '🎯',
    story: "구글 직원들은 목표를 전 직원이 볼 수 있게 공개합니다. 달성률 70%도 성공으로 보는 독특한 시스템! 100% 달성은 오히려 목표가 낮다는 신호래요.",
    text: "이 목표 관리 시스템의 이름은?",
    options: ["KPI", "OKR 🎯", "BSC", "MBO"],
    correct: 1,
    explanation: "OKR = Objectives + Key Results! 인텔에서 시작해 구글이 대중화. 70% 달성이 적당한 도전이라는 독특한 철학 🚀"
  },
  {
    id: 203, category: 'workshop', emoji: '🤸',
    story: "줄다리기 실험! 혼자 할 때는 100% 힘을 썼는데, 8명이 함께 하니 각자 50%밖에 안 써요. '나 하나쯤이야...' 라는 생각, 다들 한 번씩 해봤죠? 😅",
    text: "집단 내 개인 노력 감소 현상의 이름은?",
    options: ["피터의 법칙", "파킨슨 법칙", "링겔만 효과 😴", "호손 효과"],
    correct: 2,
    explanation: "링겔만 효과 = 사회적 태만! 집단이 커질수록 개인 기여도 감소. 해결책은 개인 역할 명확화와 기여도 가시화! 👀"
  },
  {
    id: 204, category: 'workshop', emoji: '🌟',
    story: "'잘했어! 잘했어! 잘했어! 잘했어! 잘했어! 근데 이건 아니야.' 연구에 따르면 이 비율이 관계를 유지시킨다고 해요. 부부도, 팀도 마찬가지!",
    text: "관계 유지를 위한 긍정:부정 황금 비율은?",
    options: ["1:1", "3:1", "5:1 🌟", "10:1"],
    correct: 2,
    explanation: "존 고트만 박사의 연구! 긍정:부정 = 5:1 이상일 때 관계가 유지됩니다. 오늘부터 칭찬 5번 하고 지적 1번 해보세요 😊"
  },
  {
    id: 205, category: 'workshop', emoji: '💬',
    story: "팀장 오 과장이 직원 최 대리와 매주 30분 단둘이 만납니다. 업무 보고가 아니라 '요즘 어때요? 뭐가 힘들어요?'를 묻습니다. 최 대리는 요즘 출근이 즐겁습니다.",
    text: "오 과장이 하고 있는 이것의 핵심 목적은?",
    options: ["업무 진행 점검", "성과 평가 준비", "구성원 성장 지원과 신뢰 구축 💝", "프로젝트 리뷰"],
    correct: 2,
    explanation: "1on1 미팅의 핵심은 신뢰 구축! 업무 보고 NO, 성장과 고민 나누기 YES. 실리콘밸리 최고 리더들의 필수 루틴 👏"
  },

  // ── 팀빌딩 ──
  {
    id: 301, category: 'teambuilding', emoji: '🔥',
    story: "회의에서 팀장이 먼저 '내 생각엔 이렇게 해야 해'라고 말하면... 팀원들은 그냥 '네, 좋습니다'합니다. 아무도 반대 의견을 안 내요. 이 팀의 가장 큰 문제는?",
    text: "팀에서 가장 중요한 기반은?",
    options: ["빠른 실행력 ⚡", "소통과 심리적 안전감 💬", "완벽한 업무 분장", "강력한 리더십"],
    correct: 1,
    explanation: "'저는 다르게 생각하는데요'라고 말할 수 있는 분위기가 혁신의 시작! 팀장님, 먼저 '내가 틀릴 수도 있어'라고 말해보세요 🙌"
  },
  {
    id: 302, category: 'teambuilding', emoji: '💡',
    story: "아이디어 회의에서 '우주에서 광고하기', '강아지한테 직접 마케팅', '냉장고 안에 광고판 설치'... 황당한 아이디어들이 쏟아집니다. 이게 맞는 방식일까요?",
    text: "브레인스토밍에서 가장 중요한 규칙은?",
    options: ["현실 가능한 아이디어만", "아이디어 비판 금지 🚫", "리더가 방향 먼저 제시", "시간 내에 딱 3개만"],
    correct: 1,
    explanation: "브레인스토밍의 황금률 = 판단 보류! '그거 말이 돼요?' 한 마디가 천 개의 아이디어를 죽입니다. 황당한 것에서 혁신이 나와요 ✍️"
  },
  {
    id: 303, category: 'teambuilding', emoji: '🤝',
    story: "영업팀 박 대리와 개발팀 이 대리가 사사건건 부딪힙니다. 팀장은 '어른답게 알아서 해결해'라고 했고, 두 사람은 서로 카톡도 안 합니다.",
    text: "갈등의 가장 건강한 해결 방법은?",
    options: ["시간이 지나면 해결돼 ⏰", "팀장이 중재해야지", "당사자가 직접 대화 🗣️", "부서를 분리해버리기"],
    correct: 2,
    explanation: "갈등은 회피할수록 커집니다! '저 사실 이 부분이 불편했어요'라고 직접 말하는 게 최선. 직접 해결한 팀이 장기적으로 더 강해져요 💪"
  },
  {
    id: 304, category: 'teambuilding', emoji: '🏆',
    story: "회식 날 '우리 팀의 강점이 뭐야?'라고 물었어요. '다들 착하잖아' '야근을 잘 해' '갈등이 없어'... 아무도 진짜 강점을 모르는 것 같습니다.",
    text: "고성과 팀 분석 모델 GRPI에서 가장 먼저 필요한 것은?",
    options: ["Role(역할 명확화)", "Goal(명확한 목표) 🎯", "Process(업무 프로세스)", "Interpersonal(대인관계)"],
    correct: 1,
    explanation: "GRPI = Goal → Role → Process → Interpersonal 순서! '우리 팀 이번 분기 목표가 뭐야?'를 모두가 같은 답을 해야 합니다! 🎯"
  },
  {
    id: 305, category: 'teambuilding', emoji: '🎉',
    story: "신입 강 씨가 데이터 분석을 잘못해서 발표를 망쳤어요. 팀장은 '괜찮아, 그게 어려운 분석이었어. 다음엔 같이 해보자'라고 했어요.",
    text: "이 팀장이 만들고 있는 팀 문화는?",
    options: ["무한 관용 문화 😅", "실수 허용 + 성장 중심 문화 🌱", "성과 없이 격려만", "책임감 없는 문화"],
    correct: 1,
    explanation: "실수를 처벌하면 아무도 도전 안 합니다! 픽사·구글의 공통점이 바로 '실수는 배움의 과정' 문화예요 🌟"
  },

  // ── 파티·넌센스 ──
  {
    id: 401, category: 'party', emoji: '🤔',
    story: "사과나무에서 사과가 떨어지고 있어요. 조심하세요! 그런데 이 나무에서 무언가가 자랍니다. 과연 무엇이 자랄까요?",
    text: "사과나무에서 자라는 것은?",
    options: ["배 🍐", "감 🍊", "사과 🍎", "바나나 🍌"],
    correct: 2,
    explanation: "당연히 사과죠! 😂 사과나무에서 사과가 자랍니다. 너무 당연해서 오히려 헷갈렸죠? 이게 바로 넌센스 퀴즈의 매력!"
  },
  {
    id: 402, category: 'party', emoji: '🐄',
    story: "어떤 동물이 울면 '음메~'라고 해요. 이 동물은 네 다리가 있고, 흑백 무늬가 있으며, 우유를 만들어냅니다. 과연 이 동물은?",
    text: "이 동물의 이름은?",
    options: ["말 🐴", "소 🐄", "돼지 🐷", "양 🐑"],
    correct: 1,
    explanation: "'음메~' 하는 건 소! 근데 이걸 틀리는 사람이 꼭 있다는 게 함정 😄 너무 생각하면 오히려 틀려요! 단순하게 생각하세요~"
  },
  {
    id: 403, category: 'party', emoji: '🚂',
    story: "서울에서 부산까지 가는 기차가 있어요. 이 기차는 시속 300km로 달립니다. 기차가 반쯤 왔을 때 기관사가 갑자기 사라졌어요. 기차는 어떻게 됐을까요?",
    text: "기차는 어디에 도착했을까요?",
    options: ["서울로 돌아갔다", "멈춰버렸다", "부산에 도착했다 🚂", "허공에 떴다"],
    correct: 2,
    explanation: "KTX는 자동운행 시스템이라 기관사 없어도 달립니다! 😄 실제로 KTX는 ATO(자동열차운전장치)로 운행돼요. 기관사는 감시·비상 대응이 주 역할!"
  },
  {
    id: 404, category: 'party', emoji: '❄️',
    story: "겨울에 냉장고를 켜면 냉장고는 냉장고 안을 차갑게 합니다. 그러면 냉장고 밖은 어떻게 될까요? 물리 시간이 생각나네요...",
    text: "냉장고를 켜면 냉장고 밖 온도는?",
    options: ["더 차가워진다 🥶", "변화 없다", "더 따뜻해진다 🔥", "냉장고가 폭발한다 💥"],
    correct: 2,
    explanation: "냉장고는 내부 열을 외부로 방출합니다! 그래서 냉장고 뒷면이 뜨겁죠 🔥 한여름에 냉방 목적으로 냉장고 문 열면 오히려 방이 더 더워져요. 물리의 역설!"
  },
  {
    id: 405, category: 'party', emoji: '🍕',
    story: "피자 한 판을 8명이 공평하게 나눠 먹으려면 8조각으로 잘라야 해요. 수학 시간이 갑자기 떠오르네요. 그런데 가장 중요한 건... 누가 먼저 집느냐죠!",
    text: "피자 한 판 8등분 시 한 조각의 각도는?",
    options: ["30도 📐", "45도 ✅", "60도", "90도"],
    correct: 1,
    explanation: "360도 ÷ 8 = 45도! 근데 사실 중요한 건 손 빠른 사람이 가장 큰 조각 가져간다는 것... 🍕 피자 집을 땐 속도가 생명!"
  },
  {
    id: 406, category: 'party', emoji: '🌍',
    story: "세계 지도를 펼쳐보면 어떤 나라는 이웃 나라가 엄청 많아요. 땅이 넓으면 이웃도 많겠죠? 중국과 러시아가 공동 1위라는 놀라운 사실!",
    text: "가장 많은 나라와 국경을 접한 나라는? (공동 1위)",
    options: ["중국 🇨🇳 (14개국)", "러시아 🇷🇺 (14개국)", "브라질 🇧🇷 (10개국)", "독일 🇩🇪 (9개국)"],
    correct: 0,
    explanation: "중국과 러시아 공동 1위 각 14개국! 러시아로 알고 계셨다면 중국도 정답이에요 🥇🥇 이런 공동 정답 문제도 있답니다~"
  },
  {
    id: 407, category: 'party', emoji: '🦷',
    story: "치과에 가기 싫은 이유 1위는 '아파서'입니다. 그런데 치과 의자에 앉으면 왜 갑자기 이가 안 아플 것 같은 기분이 들까요? 이게 바로 심리학의 묘미!",
    text: "치과 가기 직전 갑자기 이가 안 아픈 것 같은 이 심리는?",
    options: ["플라세보 효과", "화이트코트 효과 🏥", "자기기만 😅", "소망적 사고"],
    correct: 3,
    explanation: "소망적 사고(Wishful Thinking)! '안 아프면 그냥 집에 가도 되잖아?'라는 심리예요 😄 하지만 치과는 꼭 가야 합니다! 나중에 더 아파요!"
  },
  {
    id: 408, category: 'party', emoji: '🎲',
    story: "전 세계 어딘가에서 지금도 누군가 하고 있는 보드게임! 감옥도 가고 집도 사고 파산도 하는... 가족 모임마다 싸움이 나는 바로 그 게임!",
    text: "세계에서 가장 많이 팔린 보드게임은?",
    options: ["체스 ♟️", "모노폴리 🏠", "스크래블 🔤", "클루에도 🔍"],
    correct: 1,
    explanation: "모노폴리! 1935년 출시 후 47개 언어, 114개국 판매. 한 판 평균 2시간인데 가족 싸움 포함하면 4시간... 😂 역대 최다 판매 보드게임!"
  },
];

const DUMMY_NAMES = ['김민준 🦁', '이서연 🌸', '박지호 🚀', '최하은 ⭐', '정우성 🎯', '한소희 💫', '오세진 🔥', '윤아름 🌈', '강태풍 ⚡'];

const CAT_CONFIG: Record<Category, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  integrity: { label: '청렴·공정', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', icon: <Shield className="w-4 h-4" /> },
  workshop: { label: '기업워크숍', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30', icon: <Briefcase className="w-4 h-4" /> },
  teambuilding: { label: '팀빌딩', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: <Handshake className="w-4 h-4" /> },
  party: { label: '파티·넌센스', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30', icon: <PartyPopper className="w-4 h-4" /> },
};

// ─── 폭죽 ─────────────────────────────────────────────────────
const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;
  const colors = ['#06b6d4', '#a78bfa', '#f59e0b', '#ec4899', '#10b981', '#f97316', '#ffffff', '#facc15'];
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 100 }).map((_, i) => (
        <motion.div key={i}
          initial={{ y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), opacity: 1, scale: 1 }}
          animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 100, opacity: 0, scale: 0.2, rotate: Math.random() * 1080 }}
          transition={{ duration: 2 + Math.random() * 3, delay: Math.random() * 1, ease: 'easeIn' }}
          className="absolute rounded-sm"
          style={{ width: 6 + Math.random() * 10, height: 6 + Math.random() * 10, backgroundColor: colors[Math.floor(Math.random() * colors.length)] }}
        />
      ))}
    </div>
  );
};

// ─── BGM 엔진 (베토벤 운명 느낌) ─────────────────────────────
class BGMEngine {
  private ctx: AudioContext | null = null;
  private nodes: AudioNode[] = [];
  private playing = false;
  private intervalId: NodeJS.Timeout | null = null;

  private getCtx() {
    if (!this.ctx) this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    return this.ctx;
  }

  // 베토벤 5번 운명 모티프: 솔솔솔 미♭ (단단단 장)
  private MOTIF = [
    { freq: 392, dur: 0.18, delay: 0 },     // 솔
    { freq: 392, dur: 0.18, delay: 0.22 },  // 솔
    { freq: 392, dur: 0.18, delay: 0.44 },  // 솔
    { freq: 311, dur: 0.6,  delay: 0.66 },  // 미♭ (길게)
    { freq: 349, dur: 0.18, delay: 1.5 },   // 파
    { freq: 349, dur: 0.18, delay: 1.72 },  // 파
    { freq: 349, dur: 0.18, delay: 1.94 },  // 파
    { freq: 294, dur: 0.6,  delay: 2.16 },  // 레 (길게)
  ];

  start(volume: number = 0.18) {
    if (this.playing) return;
    this.playing = true;
    this.playLoop(volume);
    // 3.2초마다 반복
    this.intervalId = setInterval(() => this.playLoop(volume), 3200);
  }

  private playLoop(volume: number) {
    if (!this.playing) return;
    const ctx = this.getCtx();
    this.MOTIF.forEach(({ freq, dur, delay }) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      // 현악기 느낌 = sawtooth + 필터
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1200;
      o.connect(filter); filter.connect(g); g.connect(ctx.destination);
      o.type = 'sawtooth';
      o.frequency.value = freq;
      const t = ctx.currentTime + delay;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(volume, t + 0.03);
      g.gain.setValueAtTime(volume, t + dur - 0.05);
      g.gain.linearRampToValueAtTime(0, t + dur);
      o.start(t); o.stop(t + dur + 0.1);
      this.nodes.push(o);
    });
  }

  stop() {
    this.playing = false;
    if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
    this.nodes.forEach(n => { try { (n as OscillatorNode).stop(); } catch (e) {} });
    this.nodes = [];
  }
}

// ─── 효과음 ──────────────────────────────────────────────────
const useSFX = (soundOn: boolean) => {
  const ctxRef = useRef<AudioContext | null>(null);
  const getCtx = () => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return ctxRef.current;
  };

  const play = useCallback((type: 'correct' | 'wrong' | 'tick' | 'start' | 'finish' | 'click') => {
    if (!soundOn) return;
    try {
      const ctx = getCtx();
      const VOL = 0.7; // 볼륨 UP

      if (type === 'correct') {
        // 팡파레! 도-미-솔-도 상승
        [[523,0],[659,0.12],[784,0.24],[1047,0.38]].forEach(([freq, delay]) => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.type = 'sine'; o.frequency.value = freq as number;
          const t = ctx.currentTime + (delay as number);
          g.gain.setValueAtTime(VOL, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
          o.start(t); o.stop(t + 0.3);
        });
        // 반짝이 효과음 추가
        setTimeout(() => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.type = 'sine'; o.frequency.setValueAtTime(1200, ctx.currentTime);
          o.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.15);
          g.gain.setValueAtTime(0.3, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.2);
        }, 500);

      } else if (type === 'wrong') {
        // 틀렸어요~ 하강 + 꽝 소리
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(330, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.5);
        g.gain.setValueAtTime(VOL, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
        o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.6);
        // 꽝 드럼
        const noise = ctx.createOscillator(); const ng = ctx.createGain();
        noise.connect(ng); ng.connect(ctx.destination);
        noise.type = 'square'; noise.frequency.value = 80;
        ng.gain.setValueAtTime(0.5, ctx.currentTime);
        ng.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        noise.start(ctx.currentTime); noise.stop(ctx.currentTime + 0.3);

      } else if (type === 'tick') {
        // 긴박한 틱톡
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = 1200; o.type = 'square';
        g.gain.setValueAtTime(0.4, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.07);

      } else if (type === 'start') {
        // 퀴즈 시작! 신나는 상승
        [261,329,392,494,523].forEach((freq, i) => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.value = freq; o.type = 'sine';
          const t = ctx.currentTime + i * 0.1;
          g.gain.setValueAtTime(0.4, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
          o.start(t); o.stop(t + 0.2);
        });

      } else if (type === 'finish') {
        // 🎺 완료 팡파레!
        const melody = [523,659,784,659,784,1047];
        melody.forEach((freq, i) => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.type = i === melody.length - 1 ? 'sine' : 'triangle';
          o.frequency.value = freq;
          const t = ctx.currentTime + i * 0.14;
          g.gain.setValueAtTime(VOL, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + (i === melody.length - 1 ? 0.6 : 0.18));
          o.start(t); o.stop(t + 0.7);
        });

      } else if (type === 'click') {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = 600; o.type = 'sine';
        g.gain.setValueAtTime(0.2, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.1);
      }
    } catch (e) {}
  }, [soundOn]);

  return play;
};

// ─── 메인 컴포넌트 ────────────────────────────────────────────
const QuizStage: React.FC<QuizStageProps> = ({ initialCategories = [], initialCode = '' }) => {
  const [screen, setScreen] = useState<Screen>('join');
  const [code, setCode] = useState(initialCode);
  const [nickname, setNickname] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [confetti, setConfetti] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [lastBonus, setLastBonus] = useState(0);
  const [bgmOn, setBgmOn] = useState(true);
  const [isFacilitator, setIsFacilitator] = useState(false); // 진행자 모드
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const bgmRef = useRef<BGMEngine | null>(null);
  const play = useSFX(soundOn);

  // ── 진행자가 대시보드에서 세션 시작 → 자동으로 진행자 모드 진입
  useEffect(() => {
    if (initialCategories.length > 0 && initialCode) {
      const cats = initialCategories as Category[];
      const qs = buildQuestions(cats);
      setQuestions(qs);
      setCode(initialCode);
      setIsFacilitator(true);
      setNickname('진행자 🎤');
      const count = 5 + Math.floor(Math.random() * 4);
      setParticipants(DUMMY_NAMES.slice(0, count).map(n => ({ name: n, score: 0 })));
      // 카테고리 레이블 표시
      setScreen('join'); // 진행자도 닉네임 확인 후 시작
    }
  }, []);

  const question = questions[currentQ];
  const totalQ = questions.length;

  // 세션 코드로 카테고리 추출 및 문제 섞기
  const buildQuestions = (selectedCats: Category[]) => {
    const pool = ALL_QUESTIONS.filter(q => selectedCats.includes(q.category));
    // 셔플
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(10, shuffled.length));
  };

  // BGM
  useEffect(() => {
    if (!bgmRef.current) bgmRef.current = new BGMEngine();
    return () => { bgmRef.current?.stop(); };
  }, []);

  useEffect(() => {
    if (screen === 'question' && bgmOn) bgmRef.current?.start(0.2);
    else bgmRef.current?.stop();
  }, [screen, bgmOn]);

  // 타이머
  useEffect(() => {
    if (screen !== 'question') return;
    setTimeLeft(20);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); handleTimeUp(); return 0; }
        if (t <= 5) play('tick');
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [screen, currentQ]);

  const handleTimeUp = () => {
    setSelected(-1); setShowAnswer(true); play('wrong');
    setTimeout(() => goNext(), 3500);
  };

  const handleJoin = () => {
    if (code.trim().length < 3 || !nickname.trim()) return;
    // 진행자 모드: 이미 문제가 세팅됨, 일반 참가자: 전체 믹스
    if (questions.length === 0) {
      const cats: Category[] = ['integrity', 'workshop', 'teambuilding', 'party'];
      const qs = buildQuestions(cats);
      setQuestions(qs);
    }
    if (participants.length === 0) {
      const count = 5 + Math.floor(Math.random() * 4);
      setParticipants(DUMMY_NAMES.slice(0, count).map(n => ({ name: n, score: 0 })));
    }
    play('start');
    setCurrentQ(0); setScore(0); setSelected(null); setShowAnswer(false);
    setScreen('question');
  };

  const handleSelect = (idx: number) => {
    if (selected !== null || showAnswer) return;
    clearInterval(timerRef.current!);
    setSelected(idx); setShowAnswer(true);
    if (idx === question.correct) {
      const bonus = Math.ceil(timeLeft / 4) * 10;
      setLastBonus(100 + bonus); setScore(s => s + 100 + bonus); play('correct');
    } else { setLastBonus(0); play('wrong'); }
    setTimeout(() => goNext(), 3500);
  };

  const goNext = () => {
    if (currentQ + 1 >= totalQ) {
      bgmRef.current?.stop();
      play('finish');
      setConfetti(true); setTimeout(() => setConfetti(false), 5000);
      setParticipants(prev => prev.map(p => ({ ...p, score: Math.floor(Math.random() * 500) + 50 })));
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
        <div className="flex items-center gap-2">
          {screen === 'question' && (
            <button onClick={() => { setBgmOn(s => !s); }} className={`p-2.5 rounded-full border transition-colors text-xs font-bold px-3 ${bgmOn ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
              {bgmOn ? '🎵 BGM ON' : '🔇 BGM OFF'}
            </button>
          )}
          <button onClick={() => setSoundOn(s => !s)} className="p-2.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors">
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ── 입장 ── */}
        {screen === 'join' && (
          <motion.div key="join" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-md mx-auto">
            <div className="text-center mb-10">
              <motion.div animate={{ rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 1.5, delay: 0.3 }} className="text-7xl mb-4">🎯</motion.div>
              <span className="text-cyan-400 font-mono tracking-widest text-xs uppercase mb-2 block">EcoStage Quiz</span>
              <h2 className="text-4xl font-black text-white mb-2">
                {isFacilitator ? '진행자 모드 🎤' : '세션 참가하기'}
              </h2>
              <p className="text-slate-400 text-sm">
                {isFacilitator ? '닉네임을 입력하고 세션을 시작하세요' : '진행자에게 받은 코드를 입력하세요'}
              </p>
              {/* 선택된 카테고리 뱃지 */}
              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                {(isFacilitator ? (initialCategories.length > 0 ? initialCategories : Object.keys(CAT_CONFIG)) : Object.keys(CAT_CONFIG)).map((k) => {
                  const cfg = CAT_CONFIG[k as Category];
                  return (
                    <span key={k} className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.border} ${cfg.color} ${isFacilitator && initialCategories.includes(k) ? 'ring-1 ring-offset-1 ring-offset-slate-900' : ''}`}>
                      {isFacilitator && initialCategories.includes(k) ? '✓ ' : ''}{cfg.label}
                    </span>
                  );
                })}
              </div>
              {isFacilitator && (
                <p className="text-slate-500 text-xs mt-2">선택된 카테고리 문제 {Math.min(10, ALL_QUESTIONS.filter(q => (initialCategories.length > 0 ? initialCategories : Object.keys(CAT_CONFIG)).includes(q.category)).length)}문제 출제</p>
              )}
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
            <button onClick={() => {
              setNickname('진행자'); setCode('ECO-0000');
              const qs = buildQuestions(['integrity', 'workshop', 'teambuilding', 'party']);
              setQuestions(qs);
              setParticipants(DUMMY_NAMES.slice(0, 6).map(n => ({ name: n, score: 0 })));
              play('start');
              setCurrentQ(0); setScore(0); setSelected(null); setShowAnswer(false);
              setScreen('question');
            }} className="mt-4 w-full py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-white border border-slate-800 hover:border-slate-600 transition-all flex items-center justify-center gap-2">
              <Play className="w-4 h-4" /> 진행자로 데모 시작 (전체 카테고리 믹스)
            </button>
          </motion.div>
        )}

        {/* ── 퀴즈 ── */}
        {screen === 'question' && question && (
          <motion.div key={`q-${currentQ}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${CAT_CONFIG[question.category].bg} ${CAT_CONFIG[question.category].border} ${CAT_CONFIG[question.category].color}`}>
                  {CAT_CONFIG[question.category].icon} {CAT_CONFIG[question.category].label}
                </span>
                <span className="text-slate-400 text-sm font-bold">{currentQ + 1}/{totalQ}</span>
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
              {questions.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i < currentQ ? 'w-8 bg-cyan-500' : i === currentQ ? 'w-8 bg-white animate-pulse' : 'w-4 bg-slate-700'}`} />
              ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800/40 border border-slate-700 rounded-2xl px-5 py-4 mb-4">
              <div className="flex items-start gap-3">
                <span className="text-3xl shrink-0">{question.emoji}</span>
                <p className="text-slate-300 text-sm leading-relaxed break-keep">{question.story}</p>
              </div>
            </motion.div>

            <div className="bg-slate-900/70 border border-slate-600 rounded-2xl p-5 mb-5">
              <p className="text-white text-lg md:text-xl font-black leading-snug text-center break-keep">❓ {question.text}</p>
            </div>

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
              <button onClick={() => { setScreen('join'); setScore(0); setCurrentQ(0); setSelected(null); setShowAnswer(false); setQuestions([]); }}
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
