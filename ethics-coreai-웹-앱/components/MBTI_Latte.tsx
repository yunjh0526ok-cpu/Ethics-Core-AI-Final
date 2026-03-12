import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Zap, Quote, Coffee, ArrowRight, Heart, UserCog, Briefcase, Repeat, Stethoscope, CheckCircle2, Loader2, AlertTriangle, WifiOff, ArrowLeft } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

interface MBTIProfile {
  nickname: string;
  diagnosis: string;
  intention: string;
  latte: {
    original: string;
    translated: string;
  };
  tips: {
    manager: string;
    junior: string;
  };
  consultation: string; 
  color: string;
}

const QUIZ_QUESTIONS = [
  {
    id: 0,
    category: "Energy",
    question: "Q1. 점심시간이나 회식 자리에서 당신의 모습은?",
    options: [
      { label: "분위기를 주도하고 대화를 이끌어가는 편이다.", value: "E" },
      { label: "주로 경청하며 에너지를 비축하는 편이다.", value: "I" }
    ]
  },
  {
    id: 1,
    category: "Information",
    question: "Q2. 새로운 업무를 지시받았을 때 선호하는 방식은?",
    options: [
      { label: "정확한 가이드라인과 기존 선례(매뉴얼)가 편하다.", value: "S" },
      { label: "업무의 배경과 큰 그림(취지)을 이해하는 게 먼저다.", value: "N" }
    ]
  },
  {
    id: 2,
    category: "Decision",
    question: "Q3. 동료가 규정을 실수로 어겼을 때 나의 반응은?",
    options: [
      { label: "규정은 규정이다. 원칙대로 지적하고 바로잡는다.", value: "T" },
      { label: "그럴 수밖에 없었던 상황이나 사정을 먼저 들어본다.", value: "F" }
    ]
  },
  {
    id: 3,
    category: "Lifestyle",
    question: "Q4. 중요한 프로젝트 마감을 앞두고 나는?",
    options: [
      { label: "미리 세워둔 계획대로 착착 진행되어야 마음이 놓인다.", value: "J" },
      { label: "상황에 따라 유동적으로 대처하며 막판 스퍼트를 낸다.", value: "P" }
    ]
  }
];

const MBTI_DATA: Record<string, MBTIProfile> = {
  INTJ: { nickname: "청렴 알파고", diagnosis: "규정의 효율성을 따짐. 비효율적인 청렴 활동은 시간 낭비라 생각해서 안 함 (근데 부정부패는 더 싫어함).", intention: "시스템이 완벽해야 우리 모두가 편해진다는 큰 그림을 그리는 중임.", latte: { original: "그게 최선입니까? 근거가 뭡니까?", translated: "더 효율적인 방법이 있을 것 같아서 같이 고민해보자는 뜻이야." }, tips: { manager: "결론부터 말하고 감정 호소는 생략하세요. 논리로 설득하면 바로 OK함.", junior: "질문은 공격이 아니라 관심임. 당황하지 말고 데이터로 답하면 예쁨 받음." }, consultation: "🚑 처방: '인간 알러지' 주의보. 동료가 말 걸 때 '입력 오류' 표정 금지. 하루에 3번 영혼 없는 리액션이라도 해주세요. 사회성이 +1 상승합니다.", color: "text-purple-400" },
  INTP: { nickname: "청렴계의 이단아", diagnosis: "규정의 논리적 모순을 찾아내서 감사팀 당황시킴. '왜요?'라고 묻는데 진짜 궁금해서 묻는 거임 (반항 아님).", intention: "납득이 안 되면 움직이지 않을 뿐, 악의는 없음. 논리적이면 누구보다 잘 지킴.", latte: { original: "이 규정은 논리적으로 앞뒤가 안 맞는데요?", translated: "이 부분을 수정하면 우리 조직이 더 완벽해질 것 같아요." }, tips: { manager: "무조건 따르라고 강요하면 고장 남. '왜' 해야 하는지 이유를 설명해 줄 것.", junior: "아이디어 뱅크임. 엉뚱해 보여도 경청하면 업무 혁신 포인트 나옴." }, consultation: "🚑 처방: 머릿속에 있는 거 입 밖으로 낼 때 '3줄 요약' 필터 장착 필수. 남들은 당신의 논문급 설명을 들을 준비가 안 되어 있습니다.", color: "text-purple-300" },
  ENTJ: { nickname: "청렴 독재자", diagnosis: "내가 곧 법이자 정의임. 내 기준에 미달하는 업무 처리는 '직무 태만'으로 간주함. 불도저.", intention: "우리 팀을 최고로 만들고 싶어서 그러는 거임. 악기바리 아님.", latte: { original: "이걸 기안이라고 올린 거야? 다시 해.", translated: "네 능력은 이것보다 훨씬 뛰어나잖아. 퀄리티 좀 높여보자." }, tips: { manager: "칭찬은 구체적으로 성과 위주로. '열심히 했다'보다 '잘했다'를 원함.", junior: "변명 금지. 실수했으면 깔끔하게 인정하고 대안 제시하면 쿨하게 넘어감." }, consultation: "🚑 처방: 직원들이 당신을 피하는 건 존경심 때문이 아니라 살기 위해서입니다. 가끔은 '나도 잘 모르겠네'라고 말하는 연기력을 키우세요.", color: "text-purple-600" },
  ENTP: { nickname: "맑은 눈의 광인", diagnosis: "청렴 교육 때 강사한테 '그건 상황에 따라 다르지 않나요?'라며 공개 토론 신청함. 말빨로 아무도 못 이김.", intention: "기존 관습에 얽매이지 않고 더 나은 방법을 찾고 싶을 뿐임.", latte: { original: "왜요? 전 그렇게 생각 안 하는데요?", translated: "새로운 관점도 한번 고려해보는 건 어떨까요?" }, tips: { manager: "틀에 가두려 하지 말고 미션을 던져주면 알아서 잘함.", junior: "말싸움하려 들지 마셈. 그냥 '오, 신박한데요?' 하고 넘기는 게 정신건강에 좋음." }, consultation: "🚑 처방: '반박 시 니 말이 맞음' 마인드 장착 요망. 모든 회의를 토론 배틀로 만들지 마세요. 가끔은 그냥 '넵' 하고 넘어가면 평화가 옵니다.", color: "text-purple-500" },
  INFJ: { nickname: "청렴 간달프", diagnosis: "겉으론 웃고 있는데 속으로 윤리적 판결 내리는 중. 한 번 눈 밖에 나면 조용히 손절당함 (무서움).", intention: "조직의 도덕적 가치를 지키기 위해 끊임없이 고뇌하는 중임.", latte: { original: "(조용히 미소 지으며) 네, 알겠습니다...", translated: "(속마음: 저건 명백한 규정 위반인데... 나중에 문제 될 텐데...)" }, tips: { manager: "가치관을 건드리면 안 됨. 도덕적 명분을 주면 충성함.", junior: "진정성 있게 다가가야 함. 거짓말이나 아부는 귀신같이 알아챔." }, consultation: "🚑 처방: 인류애 충전 필요. 당신이 구원해야 할 대상은 세상이 아니라 '오늘 점심 메뉴'입니다. 생각을 끄고 멍때리기 10분 처방.", color: "text-green-400" },
  INFP: { nickname: "청렴한 유리멘탈", diagnosis: "거절을 못 해서 얼떨결에 뇌물 받을 위기 1순위. 받고 나서 집 가서 '어떡하지' 하고 이불 뒤집어쓰고 움.", intention: "상대방 무안하게 하기 싫고 상처 주기 싫어서 그런 거임. ㅠㅠ", latte: { original: "아... 네.. 감사합니다.. (동공지진)", translated: "마음만 감사히 받을게요! 제 마음 아시죠? (제발 가져가 주세요 ㅠㅠ)" }, tips: { manager: "말로만 지시하지 말고 메일/메신저로 명확한 가이드 주기 (거절 멘트 써주기).", junior: "상사가 쭈뼛거리면 내가 먼저 '이건 규정상 안 됩니다'라고 컷트해주기." }, consultation: "🚑 처방: '거절 근육' 단련 필요. 거울 보고 '싫은데요?' 10번 연습하기. 상사가 화내도 그건 당신 탓이 아니라 상사 성격 탓입니다.", color: "text-green-300" },
  ENFJ: { nickname: "청렴 사이비 교주", diagnosis: "'우리 다 같이 깨끗해지자!'며 캠페인 주도함. 근데 너무 열정적이라 주변 사람들이 기 빨려 함.", intention: "모두가 행복하고 정의로운 세상을 만들고 싶을 뿐임 (진심임).", latte: { original: "여러분! 우리 이번 청렴 퀴즈 1등 할 수 있죠? 파이팅!", translated: "함께 으쌰으쌰해서 좋은 결과 만들고 싶어요! 도와주실 거죠?" }, tips: { manager: "열정을 인정해 주고 리더 역할을 맡기면 날아다님.", junior: "맞장구 잘 쳐주면 밥 잘 사줌. 리액션이 생명." }, consultation: "🚑 처방: 오지랖 다이어트 요망. 남 챙기기 전에 본인 책상 정리부터... 가끔은 남들이 알아서 망하게 놔두는 것도 교육입니다.", color: "text-green-600" },
  ENFP: { nickname: "청렴 골든리트리버", diagnosis: "의욕 과다. '이거 대박이다!' 하고 일 벌리다가 절차 누락해서 경위서 씀. 악의는 없는데 사고뭉치.", intention: "조직에 활력을 불어넣고 싶어서 그런 거임. 규정이 너무 복잡한 게 죄임.", latte: { original: "팀장님! 이거 규정은 잘 모르겠는데 일단 하면 좋지 않을까요?!", translated: "좋은 아이디어가 있는데, 규정에 맞게 다듬어 주실 수 있나요?" }, tips: { manager: "아이디어는 칭찬하되, '마감기한'과 '절차'는 3번 확인시켜 주기.", junior: "지시 사항이 자주 바뀔 수 있음. 중간보고 자주 해서 방향 잡아야 함." }, consultation: "🚑 처방: '마무리 요정' 소환 시급. 일 벌리기 금지. 흥분해서 말할 때 숨 좀 쉬세요. 침착함 한 스푼 추가하면 완벽.", color: "text-green-500" },
  ISTJ: { nickname: "걷는 육법전서", diagnosis: "융통성 0g. 9시 00분 01초 출근도 지각이라 생각함. 영수증 풀칠 각도까지 맞춤.", intention: "규정을 지켜야 조직이 안전하게 돌아간다는 신념 때문임.", latte: { original: "규정 3조 2항에 따르면 이건 안 됩니다.", translated: "원칙대로 처리하는 게 가장 깔끔하고 뒤탈이 없어요." }, tips: { manager: "갑작스러운 업무 변경 금지. 미리미리 계획된 업무를 주는 게 좋음.", junior: "빈말 못함. 칭찬 안 해준다고 서운해 말 것. 무소식이 희소식." }, consultation: "🚑 처방: '그럴 수도 있지' 하루 3회 복창. 세상은 엑셀 파일처럼 딱딱 맞지 않습니다. 1mm 오차는 그냥 먼지라고 생각하세요.", color: "text-blue-400" },
  ISFJ: { nickname: "청렴 수호천사", diagnosis: "남의 부탁 거절 못 해서 야근함. 근데 불법적인 건 무서워서 손도 못 댐. 법 없이도 살 사람.", intention: "내가 좀 고생하더라도 팀의 평화를 지키고 싶음.", latte: { original: "제가 할게요... 괜찮아요...", translated: "도움이 필요하면 언제든 말해주세요. (사실 나도 좀 힘듦)" }, tips: { manager: "알아서 하겠거니 하지 말고 세심하게 챙겨줘야 함. 속으로 끙끙 앓음.", junior: "감사 표현 자주 하기. 작은 선물(커피)에 감동받음." }, consultation: "🚑 처방: '착한 아이 콤플렉스' 탈출 필요. 오늘 퇴근길에 아무 이유 없이 남한테 눈 흘겨보기 연습하세요. (물론 속으로만)", color: "text-blue-300" },
  ESTJ: { nickname: "인간 엑셀파일", diagnosis: "규정 준수 200%. 근데 님 때문에 팀원들 숨 막혀 죽음. 융통성 1도 없음.", intention: "사실은 누구보다 팀을 사고 없이 이끌고 싶은 책임감 때문임. (츤데레)", latte: { original: "이거 규정 찾아봤어? 확실해? 다시 확인해.", translated: "혹시 나중에 문제 생겨서 네가 다칠까 봐 걱정돼서 그래. 꼼꼼히 보자." }, tips: { manager: "지적하기 전에 '고생했다'는 말 먼저 하기 (돈 안 듦).", junior: "상사의 지적은 팩트체크일 뿐 감정은 없음. 상처받지 말고 근거만 제시하면 통과!" }, consultation: "🚑 처방: 혈압 주의보. 직원들이 당신 말을 듣는 건 논리 때문이 아니라 목소리 톤 때문일 수 있습니다. 볼륨 30% 줄이기.", color: "text-blue-500" },
  ESFJ: { nickname: "청렴 친목회장", diagnosis: "우리끼리 좋은 게 좋은 거지~ 하다가 봐주기식 감사로 걸릴 수 있음. 정에 약함.", intention: "팀워크와 화목한 분위기가 제일 중요하다고 생각함.", latte: { original: "우리가 남이야? 이번만 좀 넘어가 줘~", translated: "우리의 끈끈한 관계를 봐서 융통성을 발휘해 줄 수 있을까? (규정 내에서)" }, tips: { manager: "공과 사 구분을 명확히 해줘야 함. 사적인 자리에서 칭찬해주면 충성.", junior: "조직 내 평판이나 소문에 민감함. 맞장구 잘 쳐주기." }, consultation: "🚑 처방: 귀 얇음 주의. 남 챙기다 본인 멘탈 털립니다. '내 코가 석자다'를 가훈으로 삼으세요. 남 걱정은 유료 상담소로.", color: "text-blue-500" },
  ISTP: { nickname: "청렴 귀차니스트", diagnosis: "비리 저지르는 것도 귀찮아서 안 함. 효율성 따지다가 결재 라인 건너뛸 뻔함.", intention: "최소한의 노력으로 최대한의 성과(규정 준수)를 내고 싶음.", latte: { original: "이거 꼭 해야 돼요? 안 해도 문제없을 거 같은데.", translated: "불필요한 절차를 줄여서 업무 속도를 높이는 건 어떨까요?" }, tips: { manager: "구구절절 설명하지 말고 용건만 간단히. 간섭 싫어함.", junior: "일 잘하면 터치 안 함. 눈치껏 센스 있게 처리하면 좋아함." }, consultation: "🚑 처방: 영혼 탑재 요망. '아 진짜요?' 리액션 봇 설치 권장. 귀찮아하는 티를 낼수록 일이 더 꼬여서 귀찮아집니다.", color: "text-yellow-400" },
  ISFP: { nickname: "침대 밖은 위험해", diagnosis: "갈등 상황 자체가 스트레스라 비리 눈감아줄 뻔함. '좋은 게 좋은 거지' 하다가 독박 씀.", intention: "평화주의자. 모두가 상처받지 않고 조용히 지나갔으면 좋겠음.", latte: { original: "(난처한 표정으로) 아... 글쎄요... 하하...", translated: "제 입장이 좀 곤란해서요. 이해해 주셨으면 해요." }, tips: { manager: "압박하면 숨어버림. 부드러운 분위기에서 1:1로 대화해야 함.", junior: "감성적인 부분 챙겨주기. 업무 외적인 스트레스 안 주는 게 좋음." }, consultation: "🚑 처방: 할 말은 하기. 속으로 삭히면 병 됩니다. 침대 밖 세상은 생각보다 덜 위험해요. 싫은 건 싫다고 말해도 지구 안 멸망함.", color: "text-yellow-300" },
  ESTP: { nickname: "청렴 불도저", diagnosis: "문제 해결하느라 절차 무시해서 경고장 수집가. '일단 하고 나서 보고하면 되잖아?' 마인드.", intention: "답답한 건 못 참음. 빨리 문제를 해결해서 성과를 내고 싶음.", latte: { original: "야, 그냥 해! 내가 책임질게!", translated: "지금은 스피드가 생명이야. 문제 생기면 내가 커버해 줄게." }, tips: { manager: "사고 치기 전에 중간 점검 필수. 결과만 좋으면 과정 무시할 수 있음.", junior: "빙빙 돌려 말하지 말고 직설적으로 말해야 알아들음." }, consultation: "🚑 처방: '일단 저지르기' 금지. 행동하기 전에 3초만 생각합시다. 그 3초가 당신의 시말서를 줄여줍니다.", color: "text-red-400" },
  ESFP: { nickname: "핵인싸 감사관", diagnosis: "분위기 띄우다가 보안 사항 누설할 뻔함. 회식 자리에서 입조심 필수.", intention: "즐겁게 일하면 효율도 오른다고 믿음. 악의는 1도 없음.", latte: { original: "분위기 왜 이래? 오늘 회식이나 갈까?", translated: "팀 분위기 전환을 위해 다 같이 리프레시하는 시간 가져요!" }, tips: { manager: "자유로운 영혼임. 너무 조이면 튕겨 나감. 무대 만들어주기.", junior: "심각한 이야기 싫어함. 즐겁게 보고하면 통과." }, consultation: "🚑 처방: 진지함 5% 첨가. 가끔은 입에 지퍼를 채우세요. 세상 모든 순간이 파티는 아닙니다. 침묵을 즐기는 법을 배우세요.", color: "text-red-300" },
};

const getSafeFallback = (input: string) => {
  if (input.includes('라떼') || input.includes('나 때는') || input.includes('요즘')) {
    return {
      translatedText: "선배님의 찬란했던 과거 무용담을 공유해주셔서 감사합니다. (리스펙!)",
      managerTip: "과거 이야기는 1절만 하셔도 충분히 존경받습니다. '그때 내가' 대신 '네 생각은?'으로 바꿔보세요.",
      juniorTip: "눈을 반짝이며 경청하는 척 고개를 끄덕이세요. 3분이면 끝납니다. 끝나면 '많이 배웠습니다'로 마무리."
    };
  }
  if (input.includes('회식') || input.includes('술')) {
    return {
      translatedText: "팀원들과 친목을 다지고 싶은데, 방법이 서투르시군요. (마음만은 20대)",
      managerTip: "회식은 업무의 연장이 아니라 '선택'입니다. 점심 회식이나 카페 미팅을 제안해보세요.",
      juniorTip: "선약이 있다고 정중히 거절하되, '다음 점심은 제가 쏘겠습니다'로 방어하세요."
    };
  }
  return {
    translatedText: "팀을 위한 진심 어린 걱정이 담긴 조언입니다. (단지 표현이 조금 거칠 뿐...)",
    managerTip: "걱정하는 마음을 '질문'으로 바꿔보세요. '왜 못 해?'가 아닌 '어디서 막혔어?'가 잔소리를 멘토링으로 바꿉니다.",
    juniorTip: "알맹이(의도)만 챙기고 껍데기(말투)는 버리세요. '아, 제가 부족했군요. 이렇게 해보겠습니다'가 멘탈 승리입니다."
  };
};

// ===== 버그 수정 핵심: actionPlan 초기값을 null로 설정 =====
const INITIAL_ACTION_PLAN = {
  manager: "번역하기 버튼을 누르면 맞춤 처방전이 나옵니다 💊",
  junior: "입력한 내용에 따라 상황별 대처법을 알려드려요 😊"
};

const MBTI_Latte: React.FC = () => {
  const [selectedMBTI, setSelectedMBTI] = useState<string | null>(null);
  const [quizStep, setQuizStep] = useState(0);
  const [mbtiResultBuffer, setMbtiResultBuffer] = useState<string[]>(['', '', '', '']);
  const [latteInput, setLatteInput] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  // ===== 버그 수정: 초기값을 명확한 안내 문구로 설정 =====
  const [actionPlan, setActionPlan] = useState<{ manager: string; junior: string }>(INITIAL_ACTION_PLAN);

  const cleanText = (text: string) => text.replace(/\*\*/g, '').replace(/##/g, '').replace(/__/g, '').trim();

  const handleQuizSelect = (value: string) => {
    const newBuffer = [...mbtiResultBuffer];
    newBuffer[quizStep] = value;
    setMbtiResultBuffer(newBuffer);
    if (quizStep < 3) {
      setQuizStep(prev => prev + 1);
    } else {
      const finalMBTI = newBuffer.join('');
      setSelectedMBTI(finalMBTI);
      setQuizStep(4);
    }
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setMbtiResultBuffer(['', '', '', '']);
    setSelectedMBTI(null);
  };

  const handleTranslate = async () => {
    if (!latteInput.trim()) return;
    setIsTranslating(true);
    setTranslatedText('');
    setUsingFallback(false);

    // ===== 버그 수정: 로딩 중 상태를 별도로 표시, actionPlan은 건드리지 않음 =====
    try {
      if (!genAI) throw new Error("API Key missing");

      const systemInstruction = `
        당신은 유머러스하고 통찰력 있는 '꼰대어 번역기'이자 '소통 코치'입니다.
        사용자가 입력한 말이나 상황을 분석하여 반드시 다음 JSON 형식으로만 출력하세요.
        출력 텍스트에 마크다운 기호(**, ##, __ 등)를 절대 포함하지 마십시오.
        
        1. translatedText: 요즘 세대가 듣기 좋게 순화하거나 재치 있는 밈으로 번역. 괄호 안에 숨겨진 본심(애정/걱정)을 유머러스하게 추가.
        2. managerTip: 입력된 내용과 직접 연관된 상사/선배를 위한 구체적인 소통 행동 가이드 1줄. 반드시 입력 내용에 맞춰 작성할 것.
        3. juniorTip: 입력된 내용을 들었을 때 후배/부하직원이 실제로 쓸 수 있는 구체적인 대처법 1줄. 반드시 입력 내용에 맞춰 작성할 것.
        
        Tone: Witty, Insightful, Trendy. 한국어로 답할 것.
      `;

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), 15000)
      );

      const apiPromise = genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `다음 말 또는 상황을 번역해줘: "${latteInput}"`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translatedText: { type: Type.STRING },
              managerTip: { type: Type.STRING },
              juniorTip: { type: Type.STRING }
            },
            required: ["translatedText", "managerTip", "juniorTip"]
          }
        }
      });

      const response = await Promise.race([apiPromise, timeoutPromise]) as any;
      
      // ===== 버그 수정: response.text를 올바르게 파싱 =====
      const rawText = typeof response.text === 'function' ? response.text() : (response.text || "{}");
      const cleanJsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const json = JSON.parse(cleanJsonStr);

      // ===== 버그 수정: 값이 있을 때만 업데이트, 없으면 fallback =====
      const managerTip = cleanText(json.managerTip || '');
      const juniorTip = cleanText(json.juniorTip || '');
      const translated = cleanText(json.translatedText || '');

      if (!translated) throw new Error("Empty response");

      setTranslatedText(translated);
      setActionPlan({
        manager: managerTip || getSafeFallback(latteInput).managerTip,
        junior: juniorTip || getSafeFallback(latteInput).juniorTip,
      });

    } catch (e: any) {
      console.warn("Switching to Offline Fallback Mode", e?.message);
      const fallback = getSafeFallback(latteInput);
      setTranslatedText(fallback.translatedText);
      setActionPlan({ manager: fallback.managerTip, junior: fallback.juniorTip });
      setUsingFallback(true);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleBack = () => {
    sessionStorage.setItem('hero_view_mode', 'consulting');
    const event = new CustomEvent('navigate', { detail: 'home' });
    window.dispatchEvent(event);
  };

  return (
    <section id="fun-zone" className="relative z-10 py-24 px-4 w-full max-w-7xl mx-auto border-t border-slate-800">
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

      <div className="text-center mb-16">
        <span className="text-amber-500 font-tech tracking-widest text-xs uppercase mb-2 block">Playground</span>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-[#ff6e1e]">Fun & Integrity</span> Zone
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
          단순한 성격 검사가 아닙니다. <span className="text-white font-bold">4단계 실전 퀴즈</span>로 나의 숨겨진 '청렴 DNA'를 진단하고,<br className="hidden md:block" />
          <span className="text-white font-bold">AI 소통 통역사</span>가 처방하는 맞춤형 전략으로 세대 간의 벽을 유쾌하게 허물어보세요.
        </p>
      </div>

      <div className="flex flex-col xl:flex-row items-center justify-center gap-12 xl:gap-[280px] w-full min-h-[700px]">
        {/* LEFT: MBTI DIAGNOSIS */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="w-full max-w-[1050px] bg-[#0a0a12]/15 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 relative overflow-hidden flex flex-col min-h-[700px] shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="mb-6 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <h3 className="text-2xl font-bold text-white">MBTI 청렴 감수성 진단</h3>
          </div>

          <div className="relative flex-grow flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {quizStep < 4 ? (
                <motion.div key="quiz" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full justify-center">
                  <div className="mb-8">
                    <div className="flex gap-2 mb-4 justify-center">
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} className={`h-2 w-12 rounded-full transition-colors ${i <= quizStep ? 'bg-cyber-purple' : 'bg-slate-800'}`} />
                      ))}
                    </div>
                    <span className="block text-center text-cyber-purple font-bold text-sm tracking-widest uppercase mb-2">
                      STEP {quizStep + 1} / 4 : {QUIZ_QUESTIONS[quizStep].category}
                    </span>
                    <h4 className="text-2xl md:text-3xl font-bold text-white text-center leading-snug word-keep break-keep">
                      {QUIZ_QUESTIONS[quizStep].question}
                    </h4>
                  </div>
                  <div className="grid gap-4">
                    {QUIZ_QUESTIONS[quizStep].options.map((opt, idx) => (
                      <button key={idx} onClick={() => handleQuizSelect(opt.value)} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-700 hover:border-cyber-purple hover:bg-slate-800/80 transition-all text-left group relative overflow-hidden">
                        <div className="absolute inset-0 bg-cyber-purple/0 group-hover:bg-cyber-purple/5 transition-colors" />
                        <span className="text-lg text-slate-200 font-medium group-hover:text-white transition-colors relative z-10">{opt.label}</span>
                        <ArrowRight className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-purple opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                selectedMBTI && (
                  <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 h-full">
                    <div className="flex justify-between items-start border-b border-slate-700 pb-4">
                      <div>
                        <span className="text-xs text-slate-500 font-mono tracking-widest">YOUR INTEGRITY TYPE</span>
                        <h4 className={`text-4xl font-black ${MBTI_DATA[selectedMBTI].color} tracking-tighter mb-1`}>{selectedMBTI}</h4>
                        <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-sm text-white font-bold backdrop-blur-md">{MBTI_DATA[selectedMBTI].nickname}</div>
                      </div>
                      <button onClick={resetQuiz} className="text-slate-500 hover:text-white text-xs flex items-center gap-1"><RefreshCw className="w-3 h-3" /> 다시 진단하기</button>
                    </div>
                    <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-slate-950/40 p-4 rounded-xl border-l-4 border-red-500 backdrop-blur-sm">
                          <span className="flex items-center gap-2 text-xs text-red-400 font-bold mb-2 uppercase"><Zap className="w-3 h-3" /> 팩폭 진단</span>
                          <p className="text-slate-200 text-sm md:text-base font-medium leading-relaxed break-keep">{MBTI_DATA[selectedMBTI].diagnosis}</p>
                        </div>
                        <div className="bg-slate-950/40 p-4 rounded-xl border-l-4 border-green-500 backdrop-blur-sm">
                          <span className="flex items-center gap-2 text-xs text-green-400 font-bold mb-2 uppercase"><Heart className="w-3 h-3" /> 속마음 변호</span>
                          <p className="text-slate-200 text-sm md:text-base font-medium leading-relaxed break-keep italic">"{MBTI_DATA[selectedMBTI].intention}"</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700 backdrop-blur-sm">
                          <span className="flex items-center gap-2 text-[10px] text-slate-400 font-bold mb-1 uppercase"><Briefcase className="w-3 h-3" /> To. 상사님</span>
                          <p className="text-slate-300 text-xs leading-snug">{MBTI_DATA[selectedMBTI].tips.manager}</p>
                        </div>
                        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700 backdrop-blur-sm">
                          <span className="flex items-center gap-2 text-[10px] text-slate-400 font-bold mb-1 uppercase"><UserCog className="w-3 h-3" /> To. 후배님</span>
                          <p className="text-slate-300 text-xs leading-snug">{MBTI_DATA[selectedMBTI].tips.junior}</p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 border border-slate-600/50 rounded-xl p-4 shadow-lg relative overflow-hidden group backdrop-blur-md">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#ff6e1e]/10 rounded-full -mr-8 -mt-8 blur-xl group-hover:bg-[#ff6e1e]/20 transition-all"></div>
                        <div className="flex items-start gap-3 relative z-10">
                          <div className="bg-[#ff6e1e]/20 p-2 rounded-full text-[#ff6e1e] shrink-0"><Stethoscope className="w-5 h-5" /></div>
                          <div>
                            <span className="text-xs font-bold text-[#ff6e1e] uppercase mb-1 block">실전 AI 긴급 상담소</span>
                            <p className="text-slate-200 text-sm font-medium leading-relaxed break-keep">{MBTI_DATA[selectedMBTI].consultation}</p>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-800">
                        <p className="text-xs text-slate-500 mb-2">다른 유형 결과 보기</p>
                        <div className="flex flex-wrap gap-1">
                          {Object.keys(MBTI_DATA).map(t => (
                            <button key={t} onClick={() => setSelectedMBTI(t)} className={`px-2 py-1 text-[10px] rounded border ${selectedMBTI === t ? 'bg-slate-700 text-white border-slate-500' : 'bg-transparent text-slate-500 border-slate-800 hover:bg-slate-800'}`}>{t}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* RIGHT: LATTE TRANSLATOR */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="w-full max-w-[1050px] bg-[#0a0a12]/15 backdrop-blur-xl border border-amber-900/30 rounded-3xl p-8 relative overflow-hidden flex flex-col min-h-[700px] shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="mb-8 flex items-center gap-3 border-b border-amber-900/30 pb-4">
            <Coffee className="w-8 h-8 text-amber-500" />
            <div>
              <h3 className="text-3xl font-black text-white">마법의 소통 번역기</h3>
              <p className="text-amber-200/60 text-sm">꼰대어 판독 및 순화 시스템</p>
            </div>
          </div>

          <div className="flex-grow flex flex-col gap-6">
            <div className="relative">
              <label className="text-sm text-amber-500 font-bold mb-2 block pl-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                입력 (꼰대어 / 잔소리 / 불편한 말)
              </label>
              <textarea
                value={latteInput}
                onChange={(e) => setLatteInput(e.target.value)}
                placeholder="예) 요즘 애들은 헝그리 정신이 없어. 나 때는 밤새서 일했어. (입력 후 번역하기 클릭)"
                className="w-full h-32 bg-[#1a100d]/60 border border-amber-900/50 rounded-2xl p-5 text-white text-lg focus:border-amber-500 focus:outline-none resize-none placeholder:text-slate-500 custom-scrollbar backdrop-blur-sm shadow-inner transition-colors"
              />
            </div>

            <div className="flex justify-center z-10">
              <button
                onClick={handleTranslate}
                disabled={isTranslating || !latteInput.trim()}
                className="w-full md:w-auto px-12 py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-50 transition-all hover:scale-[1.02] bg-amber-600 hover:bg-amber-500 text-white"
              >
                {isTranslating ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                {isTranslating ? 'AI가 분석 중...' : 'MZ 언어로 순화하기'}
              </button>
            </div>

            <div className="relative flex-grow min-h-[200px]">
              <label className="text-sm text-amber-500 font-bold mb-2 block pl-1 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>번역 결과</span>
                </div>
                {usingFallback && <span className="text-slate-500 flex items-center gap-1 text-[10px]"><WifiOff className="w-3 h-3" /> OFFLINE MODE</span>}
              </label>

              <div className="w-full h-full bg-gradient-to-br from-slate-900/80 to-[#1a1500]/80 border border-amber-500/30 rounded-2xl p-8 flex flex-col relative overflow-hidden backdrop-blur-md shadow-2xl">
                {isTranslating && (
                  <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center">
                    <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-3" />
                    <p className="text-amber-400 font-bold text-lg animate-pulse">감정 필터링 중...</p>
                  </div>
                )}
                {translatedText ? (
                  <div className="w-full h-full overflow-y-auto custom-scrollbar flex flex-col justify-center animate-in fade-in zoom-in duration-300">
                    <p className="text-amber-100 font-warm text-2xl md:text-3xl leading-relaxed break-keep whitespace-pre-wrap text-center drop-shadow-lg">
                      <Quote className="w-6 h-6 inline-block mb-4 mr-2 rotate-180 text-amber-500/50 align-top" />
                      {translatedText}
                      <Quote className="w-6 h-6 inline-block mt-4 ml-2 text-amber-500/50 align-bottom" />
                    </p>
                  </div>
                ) : (
                  <div className="text-slate-500/50 h-full flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-800 rounded-xl">
                    <p className="mb-2"><Coffee className="w-10 h-10 mx-auto opacity-50" /></p>
                    <p className="text-lg">서로 상처주지 않는<br /><strong>따뜻한 말 한마디</strong>를 찾아보세요.</p>
                  </div>
                )}
              </div>
            </div>

            {/* ===== 버그 수정: 처방전 영역 — 로딩 상태 별도 표시 ===== */}
            <div className="mt-2 pt-4 border-t border-amber-900/30">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="w-4 h-4 text-green-500" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">속 시원한 소통 처방전 (Action Plan)</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700 hover:border-green-500/50 transition-colors backdrop-blur-sm relative">
                  {isTranslating && <div className="absolute inset-0 bg-slate-900/60 rounded-lg flex items-center justify-center"><Loader2 className="w-4 h-4 text-green-400 animate-spin" /></div>}
                  <strong className="text-green-400 text-sm block mb-1">To. 상사님 💼</strong>
                  <p className="text-slate-300 text-sm leading-snug">{actionPlan.manager}</p>
                </div>
                <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700 hover:border-amber-500/50 transition-colors backdrop-blur-sm relative">
                  {isTranslating && <div className="absolute inset-0 bg-slate-900/60 rounded-lg flex items-center justify-center"><Loader2 className="w-4 h-4 text-amber-400 animate-spin" /></div>}
                  <strong className="text-amber-400 text-sm block mb-1">To. 후배님 🌱</strong>
                  <p className="text-slate-300 text-sm leading-snug">{actionPlan.junior}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MBTI_Latte;
