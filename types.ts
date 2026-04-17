
export interface CareerItem {
  id: number;
  title: string;
  organization: string;
  period?: string;
  isCurrent?: boolean;
  description: string;
  link?: string;
}

export interface ServiceItem {
  id: number;
  title: string;
  description: string;
  iconType: 'presentation' | 'brain' | 'users' | 'shield' | 'message' | 'trophy';
  hashtags: string[];
}

export const CAREER_DATA: CareerItem[] = [
  { 
    id: 6, 
    title: "대표", 
    organization: "청렴공정AI센터 (Ethics-CoreAI)", 
    isCurrent: true,
    description: "AI 거버넌스와 윤리 경영의 융합. 데이터 기반의 조직 투명성 진단 및 차세대 리스크 매니지먼트 솔루션을 리딩합니다.",
    link: "https://blog.naver.com/yszoo1467"
  },
  { 
    id: 1, 
    title: "전문강사 (제2022-835호)", 
    organization: "국가청렴권익교육원", 
    isCurrent: true,
    description: "국가 차원의 반부패 리더십 확립. 고위직 대상 맞춤형 청렴 코칭 및 조직 윤리 시스템 고도화 자문.",
    link: "https://edu.acrc.go.kr/0302/lecturer/yEYijtPPTsxXYRUcAPed/view.do?_search=true&keyword=%C1%D6%BE%E7%BC%F8"
  },
  { 
    id: 2, 
    title: "적극행정 전문강사", 
    organization: "대한민국 인사혁신처 위촉", 
    isCurrent: true,
    description: "공직 혁신 마인드셋 전파. 관행적 규제를 넘어서는 창의적 해법과 적극행정 조직문화 솔루션 제공.",
    link: "https://www.mpm.go.kr/proactivePublicService/govdatacenter/cardnews-data/?boardId=bbs_0000000000000199&mode=view&cntId=149&category=%EA%B3%B5%EC%A7%80%EC%82%AC%ED%95%AD&pageIdx="
  },
  { 
    id: 3, 
    title: "대표 청렴시민감사관", 
    organization: "의료기관평가인증원", 
    isCurrent: true,
    description: "의료 투명성 감시 및 제도 설계. 환자 안전과 기관 신뢰도 제고를 위한 객관적 감사 및 프로세스 혁신.",
    link: "https://www.koiha.or.kr/web/kr/koihaPR/photoGallery_g_view_h.do"
  },
  { 
    id: 5, 
    title: "자문위원 (청렴시민감사관)", 
    organization: "국토교통부 국토지리정보원", 
    isCurrent: true,
    description: "국가 공간정보 정책의 투명성 제고. 사업 추진 단계별 부패 유발 요인 사전 발굴 및 예방적 컴플라이언스 가이드.",
    link: "#"
  },
  { 
    id: 4, 
    title: "교육전문강사", 
    organization: "교육부, 서울시교육청", 
    isCurrent: true,
    description: "미래 세대를 위한 윤리 기준 정립. 교육 공동체 특성에 최적화된 참여형 청렴 커리큘럼 설계 및 실행.",
    link: "#"
  },
  { 
    id: 7, 
    title: "청렴옴부즈만 (前)", 
    organization: "대한민국 국방부", 
    period: "2018 ~ 2022.11",
    description: "국방 청렴 생태계 조성. 독립적 시각에서의 고충 민원 해결 및 국방 행정 신뢰 회복을 위한 옴부즈만 활동.",
    link: "#"
  },
  { 
    id: 8, 
    title: "청렴교육센터장 (前)", 
    organization: "흥사단 투명사회운동본부", 
    description: "시민 사회 주도 투명성 운동 기획. 전문 강사 양성 시스템 구축 및 반부패 네트워크 확산의 구심점 역할.",
    link: "#"
  },
];

export const SERVICE_DATA: ServiceItem[] = [
  { 
    id: 1, 
    title: "청렴/적극행정 강의 및 컨설팅", 
    description: "단순 전달식 강의가 아닙니다. 생성형 AI를 활용해 실제 업무 현장에서 겪을법한 딜레마 상황을 시뮬레이션으로 구현합니다. 참여자는 AI와의 롤플레잉을 통해 자신의 윤리적 판단에 대한 실시간 피드백을 받고, 데이터 기반의 맞춤형 코칭으로 실질적인 행동 변화를 경험합니다.", 
    iconType: "presentation",
    hashtags: ["#맞춤형피드백", "#실전시뮬레이션", "#행동변화유도"]
  },
  { 
    id: 2, 
    title: "조직문화 솔루션", 
    description: "Ethics-CoreAI의 자연어 처리(NLP) 엔진이 조직 내 비정형 소통 데이터를 분석하여 '조직 감성 온도'를 측정합니다. 수직적 위계로 인해 소통이 단절된 구간을 히트맵으로 시각화하고, 심리적 안전감을 높일 수 있는 최적의 팀 빌딩 전략과 행동 가이드를 AI가 제안합니다.", 
    iconType: "users",
    hashtags: ["#소통히트맵", "#심리적안전감", "#데이터기반혁신"]
  },
  { 
    id: 3, 
    title: "청렴/적극행정 골든벨", 
    description: "지루한 교육을 혁신합니다. AI가 최신 법령과 실제 감사 사례를 학습하여 생성한 고난도 퀴즈를 전 직원이 스마트폰으로 실시간 서바이벌 방식으로 풀이합니다. 참여자들의 오답 패턴을 실시간 분석하여 조직 내 취약한 윤리 지식 영역을 즉석에서 파악하고 보완합니다.", 
    iconType: "trophy",
    hashtags: ["#AI퀴즈생성", "#실시간데이터분석", "#에듀테인먼트"]
  },
  { 
    id: 4, 
    title: "Core Insight 리포팅", 
    description: "표면 아래 숨겨진 조직의 진짜 문제를 찾아냅니다. [가상 시나리오] 겉으로는 평온해 보이는 부서라도, AI가 구성원의 익명 투표와 발언 패턴을 교차 분석하여 '팀장 리더십에 대한 신뢰 저하가 업무 지연의 주원인'임을 도출해냅니다. 이를 통해 막연한 추측이 아닌, 데이터가 지목하는 핵심 뇌관을 제거하는 정밀한 해결책을 제시합니다.", 
    iconType: "brain",
    hashtags: ["#AI패턴분석", "#숨겨진갈등발굴", "#정밀솔루션"]
  },
  { 
    id: 5, 
    title: "가디언 통합 보안 포털", 
    description: "사후 수습이 아닌 사전 예방 시스템입니다. [가상 시나리오] 평소와 다른 시간대의 법인카드 결제나 비정상적인 대용량 파일 전송이 감지되면, AI 가디언이 리스크 점수를 산출하여 즉시 경고 알림을 발송합니다. 24시간 깨어있는 지능형 감시 체계가 횡령 및 정보 유출 사고를 발생 전에 차단하여 조직의 자산을 보호합니다.", 
    iconType: "shield",
    hashtags: ["#이상징후탐지", "#AI실시간모니터링", "#사전예방"]
  },
  { 
    id: 6, 
    title: "부패 및 갑질 상담소", 
    description: "누구나 안심할 수 있는 24시간 익명 AI 상담소입니다. 감정 분석 AI가 신고자의 불안한 심리에 공감하며 대화를 이끌고, 축적된 판례 빅데이터를 기반으로 신고 내용의 법적/규정적 위반 여부를 1차 진단합니다. 이후 전문 상담관에게 핵심 분석 정보를 전달하여 신속하고 정확한 피해 구제를 지원합니다.", 
    iconType: "message",
    hashtags: ["#감정분석AI", "#법률데이터기반", "#익명케어"]
  },
];