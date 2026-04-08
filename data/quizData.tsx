import { Shield, Briefcase, Handshake, PartyPopper } from 'lucide-react';
import React from 'react';

export type Category = 'integrity' | 'workshop' | 'teambuilding' | 'party';
export type OrgType = 'public' | 'local' | 'enterprise';
export type QuizPack = 'basic' | 'advanced' | 'case';

export interface Question {
  id: number;
  category: Category;
  story: string;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
  emoji: string;
}

export const INTEGRITY_TAGS: Record<number, { orgTypes: OrgType[]; packs: QuizPack[] }> = {
  1001: { orgTypes: ['public', 'local', 'enterprise'], packs: ['basic'] },
  1002: { orgTypes: ['public', 'local'], packs: ['basic', 'case'] },
  1003: { orgTypes: ['public', 'local', 'enterprise'], packs: ['case'] },
  1004: { orgTypes: ['public', 'local', 'enterprise'], packs: ['advanced', 'case'] },
  1005: { orgTypes: ['public', 'local', 'enterprise'], packs: ['basic'] },
  1006: { orgTypes: ['public', 'local', 'enterprise'], packs: ['basic'] },
  1007: { orgTypes: ['public', 'local'], packs: ['case'] },
  1008: { orgTypes: ['public', 'local', 'enterprise'], packs: ['advanced'] },
  1009: { orgTypes: ['public', 'local', 'enterprise'], packs: ['case'] },
  1010: { orgTypes: ['public', 'local', 'enterprise'], packs: ['advanced'] },
  1011: { orgTypes: ['public', 'local', 'enterprise'], packs: ['basic'] },
  1012: { orgTypes: ['public', 'local', 'enterprise'], packs: ['advanced'] },
  1013: { orgTypes: ['public', 'local', 'enterprise'], packs: ['basic'] },
  1014: { orgTypes: ['public', 'local', 'enterprise'], packs: ['case'] },
};

export const quizData: Question[] = [
  { id: 1001, category: 'integrity', emoji: '🍱', story: '민원인과 점심 자리에서 1인당 4만 8천 원 식사가 나왔어요.', text: '청탁금지법(개정 반영) 기준으로 가장 적절한 판단은?', options: ['무조건 위반', '음식물 5만 원 한도 내라면 원칙적으로 가능', '직급이 높으면 예외', '친하면 예외'], correct: 1, explanation: '음식물 가액기준은 5만 원이지만 직무관련성/대가성은 별도 심사 대상입니다.\n출처: 청탁금지법 시행령(음식물 가액기준 개정).' },
  { id: 1002, category: 'integrity', emoji: '🏠', story: '인허가 담당자의 가족 명의 토지가 사업구역과 겹쳤습니다.', text: '우선 조치로 맞는 것은?', options: ['조용히 업무 지속', '사적 이해관계 신고 + 회피/기피 절차', '구두 보고만', '사업 종료 후 신고'], correct: 1, explanation: '사적 이해관계가 확인되면 즉시 신고 및 직무회피 절차가 기본입니다.\n출처: 이해충돌방지법 제5조(사적이해관계자의 신고 및 회피·기피).' },
  { id: 1003, category: 'integrity', emoji: '📱', story: '단체 메신저에서 상급자가 신입을 공개 조롱해 밈처럼 소비됩니다.', text: '갑질 예방 관점의 올바른 대응은?', options: ['농담으로 넘김', '증거 보존 후 공식 채널 신고/상담', '맞조롱', '무단 퇴사'], correct: 1, explanation: '디지털 괴롭힘도 조직 리스크입니다. 증거 보존과 공식 절차 활용이 재발 방지에 효과적입니다.\n출처: 근로기준법 제76조의2~3(직장 내 괴롭힘 금지·조치).' },
  { id: 1004, category: 'integrity', emoji: '🤖', story: 'AI 인사 추천이 특정 성향 인재만 반복 추천합니다.', text: '공공기관 AI 윤리 관점의 핵심 절차는?', options: ['AI 결과 즉시 확정', '표본 1건 점검', 'AI 분석 + 인간 교차검증 + 편향 점검', '민원 후 조치'], correct: 2, explanation: 'AI는 보조도구이며 최종 책임은 사람에게 있습니다. 교차검증과 편향 점검이 필수입니다.\n출처: 국가 AI 윤리기준(과기정통부), 행정 AI 활용 가이드라인.' },
  { id: 1005, category: 'integrity', emoji: '🎁', story: '업체가 "커피값"이라며 모바일 상품권 7만 원을 보냈습니다.', text: '가장 안전한 처리 방식은?', options: ['소액이라 수령', '즉시 반환 + 내부 신고/기록', '다음부터만 주의', '개인 계정은 예외'], correct: 1, explanation: '직무 관련 금품은 매우 엄격히 제한됩니다. 반환과 기록이 기본 대응입니다.\n출처: 청탁금지법 제8조(금품등의 수수 금지).' },
  { id: 1006, category: 'integrity', emoji: '🧧', story: '협력사에서 "경조사니까 괜찮죠?" 하며 20만 원을 전달했습니다.', text: '경조사비 기준에 대한 설명으로 맞는 것은?', options: ['무조건 가능', '한도 초과 시 원칙적으로 수수 금지', '현금만 금지', '법인카드면 허용'], correct: 1, explanation: '경조사비는 한도 기준이 있으며 초과 수수는 법 위반 소지가 큽니다.\n출처: 청탁금지법 시행령(경조사비 가액기준).' },
  { id: 1007, category: 'integrity', emoji: '🧾', story: '민원 처리 후 이해관계자가 기념품을 놓고 갔습니다.', text: '가장 적절한 조치는?', options: ['개인 보관', '부서 공용으로 사용', '반환 시도 + 불가 시 내부 규정에 따라 인계', 'SNS 인증샷'], correct: 2, explanation: '수수 금지 물품은 반환이 원칙이며 불가 시 소속기관 처리절차를 따릅니다.\n출처: 청탁금지법 제8조, 권익위 유권해석 사례.' },
  { id: 1008, category: 'integrity', emoji: '🗂️', story: '친구 회사가 입찰에 참여한다며 평가 기준을 슬쩍 물어봅니다.', text: '정답은?', options: ['친구니까 일부 공유', '공개된 정보만 안내하고 내부자료 비공개', '익명 계정으로 전달', '술자리에서 구두 공유'], correct: 1, explanation: '공개 가능한 정보와 비공개 내부정보를 명확히 구분해야 합니다.\n출처: 이해충돌방지법(직무상 비밀이용 금지), 공공기관 정보보안 규정.' },
  { id: 1009, category: 'integrity', emoji: '⚖️', story: '신고자에게 부서 이동 압박이 들어옵니다.', text: '공익신고자 보호법 취지에 맞는 설명은?', options: ['조직 재량', '신고 이유 불이익 금지 및 보호조치 가능', '성과 낮으면 예외', '익명 아니면 보호 불가'], correct: 1, explanation: '신고를 이유로 한 불이익은 금지되며 보호조치 신청이 가능합니다.\n출처: 공익신고자 보호법 제2조, 제15조, 제30조.' },
  { id: 1010, category: 'integrity', emoji: '🧑‍⚖️', story: '법원은 "직무 관련 식사라도 반복·대가성 있으면 위법 판단 가능"이라 봤습니다.', text: '이 판례가 강조하는 포인트는?', options: ['금액만 보면 됨', '관계·맥락·반복성까지 종합 판단', '친분이면 무조건 합법', '사후 반환하면 모두 면책'], correct: 1, explanation: '법원은 금액뿐 아니라 직무 관련성·대가성·반복성 등을 종합적으로 봅니다.\n출처: 청탁금지법 관련 대법원/하급심 판례 취지.' },
  { id: 1011, category: 'integrity', emoji: '📦', story: '명절 선물세트 6만 원이 부서로 배송됐습니다.', text: '가장 안전한 처리 방식은?', options: ['팀장 집으로 이동', '전 직원 추첨', '반환 또는 내부 절차에 따른 인계 기록', '조용히 소비'], correct: 2, explanation: '선물은 가액기준 및 직무관련성 심사가 필요하며, 기준 초과 시 반환 원칙입니다.\n출처: 청탁금지법 시행령(선물 가액기준), 권익위 FAQ.' },
  { id: 1012, category: 'integrity', emoji: '🧠', story: '기관에서 "AI가 추천했으니 그대로 결재" 문화가 생겼습니다.', text: '청렴 관점에서 가장 위험한 지점은?', options: ['결재 속도 증가', '책임 주체 불명확', '보고서 분량 감소', '회의 시간 단축'], correct: 1, explanation: '알고리즘 권위 편향은 책임 회피로 이어질 수 있어 인간 검토 책임선을 명확히 해야 합니다.\n출처: OECD AI Principles, 국가 AI 윤리기준.' },
  { id: 1013, category: 'integrity', emoji: '👀', story: '감사 직전 "기록은 나중에 정리하자"는 말이 나옵니다.', text: '가장 올바른 원칙은?', options: ['결과만 좋으면 됨', '실시간 기록·근거 관리가 기본', '구두 지시 우선', '감사 때만 문서화'], correct: 1, explanation: '투명성 핵심은 사후 포장이 아닌 과정 기록입니다.\n출처: 공공기록물 관리법, 내부통제 표준지침.' },
  { id: 1014, category: 'integrity', emoji: '📣', story: '신입이 "이건 이해충돌 아닌가요?" 질문했더니 분위기가 싸해졌습니다.', text: '건강한 조직 반응은?', options: ['질문자 눈치주기', '질문 자체를 리스크 감지 신호로 환영', '단톡방 퇴장', '회의 종료'], correct: 1, explanation: '질문 가능한 문화가 조기 리스크 탐지의 핵심입니다.\n출처: 국민권익위 청렴교육 가이드, 조직윤리 운영사례.' },

  { id: 2001, category: 'workshop', emoji: '🎯', story: '회의가 늘 "윗선 눈치"로 끝나 혁신 아이디어가 증발합니다.', text: '실행력을 높이는 핵심 문화는?', options: ['눈치 합의', '심리적 안전감 + 근거 토론', '리더 단독 결정', '회의 생략'], correct: 1, explanation: '고성과 팀은 안전한 발언 문화와 근거 기반 토론을 동시에 갖춥니다.\n출처: Google Project Aristotle 연구.' },
  { id: 2002, category: 'workshop', emoji: '🧭', story: '팀 목표가 매주 바뀌어 구성원이 멘붕입니다.', text: '먼저 정리할 것은?', options: ['야근', '명확한 Objective', '회식', '자리배치'], correct: 1, explanation: '목표가 명확해야 실행과 평가가 정렬됩니다.\n출처: OKR 방법론(Doerr).' },
  { id: 2003, category: 'workshop', emoji: '🧪', story: '신규 정책을 전면 도입했는데 부작용이 큽니다.', text: '더 나은 방식은?', options: ['전면 강행', '파일럿 테스트 후 확산', '공문만 재발송', '담당자 교체'], correct: 1, explanation: '시범운영-피드백-확산 구조가 실패 비용을 줄입니다.\n출처: 공공혁신 실험행정 사례.' },

  { id: 3001, category: 'teambuilding', emoji: '🤝', story: '부서 갈등이 생기면 늘 "시간이 해결"이라며 미룹니다.', text: '가장 건강한 해결 방식은?', options: ['회피', '인사이동', '당사자 구조화 대화', '단톡 폭로'], correct: 2, explanation: '구조화된 대화와 역할 재정렬이 갈등 재발을 줄입니다.\n출처: GRPI Team Model.' },
  { id: 3002, category: 'teambuilding', emoji: '🧩', story: '회의 시작 5분 만에 팀장이 답을 말해버립니다.', text: '발언 다양성을 높이려면?', options: ['리더 선발언', '라운드 로빈 발언', '침묵 유지', '메신저로만 의견'], correct: 1, explanation: '라운드 로빈은 조용한 구성원의 참여를 높입니다.\n출처: 퍼실리테이션 실무 가이드.' },
  { id: 3003, category: 'teambuilding', emoji: '⛳', story: '팀원마다 "우선순위 1번"이 다릅니다.', text: '처음 맞춰야 하는 것은?', options: ['개인 취향', '공통 목표 정의', '좌석 위치', '퇴근 순서'], correct: 1, explanation: '팀 성과는 공통 목표의 명확성에서 시작합니다.\n출처: GRPI Model.' },
  { id: 3004, category: 'teambuilding', emoji: '🛠️', story: '업무가 꼬일 때마다 "누가 할지"가 가장 오래 걸립니다.', text: '가장 효과적인 도구는?', options: ['눈치게임', 'R&R 명시', '랜덤 배정', '선착순'], correct: 1, explanation: '역할과 책임 명시는 반복 충돌을 줄입니다.\n출처: RACI 책임분담 프레임워크.' },
  { id: 3005, category: 'teambuilding', emoji: '🌱', story: '신입 실수에 팀이 과하게 비난합니다.', text: '학습 조직에 맞는 반응은?', options: ['공개 망신', '실수 리뷰 + 재발 방지 설계', '침묵', '업무 박탈'], correct: 1, explanation: '실수 학습 루프가 팀 역량을 높입니다.\n출처: Learning Organization 이론.' },
  { id: 3006, category: 'teambuilding', emoji: '🎤', story: '아이디어 회의가 늘 3명만 말하고 끝납니다.', text: '개선책으로 적절한 것은?', options: ['그대로 진행', '브레인라이팅 도입', '리더 독백', '발언 금지'], correct: 1, explanation: '브레인라이팅은 참여장벽을 낮춰 아이디어 양을 늘립니다.\n출처: 집단창의성 연구.' },
  { id: 3007, category: 'teambuilding', emoji: '🧯', story: '갈등 중 "네가 항상 문제야"라는 인신공격이 나왔습니다.', text: '비폭력 대화 원칙에 맞는 표현은?', options: ['너는 원래 그래', '관찰-느낌-요청으로 말하기', '대화 중단 선언', '뒷담화'], correct: 1, explanation: '행동 중심 피드백이 관계 손상을 줄입니다.\n출처: NVC(비폭력대화) 프레임.' },
  { id: 3008, category: 'teambuilding', emoji: '📈', story: '팀 회고가 "다음엔 잘하자"로 끝납니다.', text: '회고의 완성형은?', options: ['덕담으로 마무리', '다음 행동 1~2개를 일정/담당과 확정', '감상 공유만', '회고 생략'], correct: 1, explanation: '행동 항목까지 확정해야 회고가 실행으로 연결됩니다.\n출처: Agile Retrospective 실무.' },
  { id: 3009, category: 'teambuilding', emoji: '⚡', story: '팀원이 서로 "내 일이 더 바빠"를 외칩니다.', text: '협업 신뢰를 높이는 장치는?', options: ['야근 자랑', '업무 가시화(칸반 등)', '개인주의 강화', '침묵'], correct: 1, explanation: '업무 가시화는 오해를 줄이고 공정성을 높입니다.\n출처: Lean/Kanban 운영 원칙.' },
  { id: 3010, category: 'teambuilding', emoji: '🥳', story: '성과를 냈는데도 팀 분위기가 무덤입니다.', text: '지속 동기부여를 위한 좋은 습관은?', options: ['성과 무시', '작은 승리 축하 루틴', '실수만 지적', '성과 개인 독식'], correct: 1, explanation: '작은 성과 인정은 팀 효능감을 높입니다.\n출처: Positive Organizational Scholarship.' },

  { id: 4001, category: 'party', emoji: '🎉', story: '퀴즈 타임! 회의가 1시간, 안건 10개, 커피 1잔.', text: '먼저 고갈되는 것은?', options: ['커피', '집중력', '팀워크', '회의자료'], correct: 1, explanation: '정답은 집중력. 그래서 50분 회의 + 10분 정리가 꿀팁!\n출처: 교육용 아이스브레이킹 문항.' },
  { id: 4002, category: 'party', emoji: '🍕', story: '피자 8조각, 팀원 8명, 다들 "난 작은 거 먹을게"라고 합니다.', text: '현실에서 가장 먼저 사라지는 것은?', options: ['작은 조각', '겸손', '토핑', '콜라'], correct: 1, explanation: '정답은 겸손. 시작 30초 후엔 모두 큰 조각 탐색 모드!\n출처: 팀빌딩 넌센스.' },
  { id: 4003, category: 'party', emoji: '🕺', story: '회식 2차 제안이 나왔습니다. 모두 "내일 일정 봐야…"라며 폰을 켭니다.', text: '가장 빠른 앱 실행은?', options: ['메일', '택시 앱', '캘린더', '사내망'], correct: 1, explanation: '정답은 택시 앱. 생존 본능은 LTE보다 빠릅니다.\n출처: 행사 진행 유머 문항.' },
  { id: 4004, category: 'party', emoji: '🎤', story: '노래방에서 "저는 듣는 걸 좋아해요" 하던 동료가 마이크를 잡습니다.', text: '다음 장면으로 가장 가능성 높은 것은?', options: ['발라드 1곡', '메들리 4곡', '조용한 박수', '퇴장'], correct: 1, explanation: '정답은 메들리 4곡. 듣는 건 남의 노래였던 걸로.\n출처: 레크리에이션 퀴즈.' },
  { id: 4005, category: 'party', emoji: '📸', story: '단체사진 찍기 직전 "자연스럽게~"라는 주문이 나왔습니다.', text: '가장 부자연스러운 포즈는?', options: ['브이', '엄지척', '어색한 손하트', '무표정'], correct: 2, explanation: '정답은 어색한 손하트. 손가락만 떨리는 팀원 다수 발생.\n출처: 아이스브레이킹 문제.' },
  { id: 4006, category: 'party', emoji: '🧠', story: '팀장님이 "딱 5분만"이라고 말했습니다.', text: '체감 시간은?', options: ['진짜 5분', '약 12분', '약 30분', '영원'], correct: 2, explanation: '정답은 약 30분. 체감물리학은 늘 회의실에서 왜곡됩니다.\n출처: 넌센스 상황퀴즈.' },
  { id: 4007, category: 'party', emoji: '☕', story: '커피 머신 앞 줄에서 모두 급한 척하지만 메뉴 선택은 느립니다.', text: '줄이 느려지는 핵심 이유는?', options: ['머신 고장', '메뉴 고민 2분', '컵 부족', '의자 부족'], correct: 1, explanation: '정답은 메뉴 고민 2분. "아메리카노요... 아, 라떼로요."\n출처: 생활밀착 유머퀴즈.' },
  { id: 4008, category: 'party', emoji: '🧃', story: '워크숍 간식으로 젤리와 과자가 등장했습니다.', text: '가장 먼저 사라지는 간식은?', options: ['무설탕 젤리', '초코 과자', '견과류', '크래커'], correct: 1, explanation: '정답은 초코 과자. 회의 에너지는 당으로 충전됩니다.\n출처: 행사 아이스브레이크.' },
  { id: 4009, category: 'party', emoji: '🚌', story: '단체 버스에서 "다들 편하게 쉬세요" 안내가 나옵니다.', text: '10분 뒤 실제 풍경은?', options: ['전원 취침', '조용한 명상', '스낵 공유 + 수다', '독서 모임'], correct: 2, explanation: '정답은 스낵 공유 + 수다. 팀 유대감의 시작.\n출처: 레크리에이션 진행 사례.' },
  { id: 4010, category: 'party', emoji: '🎲', story: '랜덤 팀 뽑기에서 늘 친한 사람끼리 모입니다.', text: '이 현상의 이름으로 가장 적절한 것은?', options: ['완전 랜덤', '운명의 장난', '인간 자석 효과', '통계 착시'], correct: 2, explanation: '정답은 인간 자석 효과(유머 표현). 결국 옆자리 본능 승리.\n출처: 행사 유머 문항.' },
];

export const CAT_CONFIG: Record<Category, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  integrity: { label: '청렴·공정', color: 'text-orange-300', bg: 'bg-orange-500/10', border: 'border-orange-400/40', icon: <Shield className="w-4 h-4" /> },
  workshop: { label: '기업워크숍', color: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-400/40', icon: <Briefcase className="w-4 h-4" /> },
  teambuilding: { label: '팀빌딩', color: 'text-yellow-300', bg: 'bg-yellow-500/10', border: 'border-yellow-400/40', icon: <Handshake className="w-4 h-4" /> },
  party: { label: '파티·넌센스', color: 'text-rose-300', bg: 'bg-rose-500/10', border: 'border-rose-400/40', icon: <PartyPopper className="w-4 h-4" /> },
};
