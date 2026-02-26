import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Bot, Send, UserCheck, ShieldAlert, Scale, BookOpen,
  Siren, FileText, CheckCircle2, AlertTriangle, Gavel, Building2,
  Landmark, GraduationCap, Users, BookMarked, Shield, Calculator,
  Search, MessageSquare
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

type ModeType = 'corruption' | 'recovery' | 'lecture' | 'amendment';

// ==================== 개정 이력 데이터 (새 개정 시 여기에만 추가!) ====================
const AMENDMENT_HISTORY = [
  {
    version: "v3",
    law: "법률 제20426호",
    date: "2024.09.27",
    label: "2024년 3차 개정",
    badge: "최신",
    badgeColor: "bg-red-500",
    isLatest: true,
    items: [
      {
        category: "형사처벌 신설",
        icon: "⚖️",
        tag: "강화",
        tagColor: "bg-red-500/20 text-red-400 border-red-500/30",
        before: "금전 제재(환수금·제재부가금)만 가능 — 형사처벌 근거 없음",
        after: "허위청구: 3년 이하 징역 또는 3천만원 이하 벌금\n과다청구: 1년 이하 징역 또는 1천만원 이하 벌금\n※ 과다청구 알면서 지급한 공무원도 동일 처벌",
        point: "이제 돈만 돌려줘도 끝이 아님 — 전과 기록까지 남음",
      },
      {
        category: "이자 환수 합리화",
        icon: "💰",
        tag: "완화",
        tagColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        before: "귀책사유 없어도 이자 전액 환수 (불합리)",
        after: "수급자의 귀책사유가 있는 경우에만 이자 환수\n※ 개별법에 이자 규정 없어도 본법으로 이자 환수 가능(명확화)",
        point: "담당자 안내에 따라 집행한 경우 → 이자 면제 주장 가능",
      },
      {
        category: "자진신고 감면 정밀화",
        icon: "🙋",
        tag: "변경",
        tagColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        before: "사전통지 전 자진신고 → 제재부가금 전액 무조건 면제",
        after: "행정청 인지 전 신고 → 전액 면제 유지\n행정청 인지 후 신고 → 면제 또는 감경 (재량)",
        point: "조사 착수 소문 나기 전에 즉시 신고하는 것이 최선",
      },
      {
        category: "비실명 대리신고 도입",
        icon: "🕵️",
        tag: "신설",
        tagColor: "bg-green-500/20 text-green-400 border-green-500/30",
        before: "신고자 본인이 직접 실명으로 신고해야 함",
        after: "변호사를 선임하여 신고자 인적사항 비공개로 대리 신고 가능\n권익위 자문변호사단 통해 무료 법률상담 및 대리신고 지원",
        point: "신원 노출 두려움 없이 내부고발 가능",
      },
      {
        category: "신고자 친족·동거인 구조금",
        icon: "👨‍👩‍👧",
        tag: "신설",
        tagColor: "bg-green-500/20 text-green-400 border-green-500/30",
        before: "신고자 본인만 구조금 신청 가능",
        after: "신고자의 친족 또는 동거인도 피해 시 구조금 신청 가능\n대상: 치료비, 이사비, 소송비용, 임금 손실액 등",
        point: "신고로 인한 가족 피해까지 국가가 보호",
      },
    ]
  },
  {
    version: "v2",
    law: "법률 제19931호",
    date: "2023.12.19",
    label: "2023년 2차 개정",
    badge: "",
    badgeColor: "",
    isLatest: false,
    items: [
      {
        category: "포상금 상한액 상향",
        icon: "🏆",
        tag: "강화",
        tagColor: "bg-red-500/20 text-red-400 border-red-500/30",
        before: "포상금 최대 2억원",
        after: "포상금 최대 5억원으로 상향",
        point: "적극적 신고 유인 강화",
      },
      {
        category: "고액부정청구자 명단공표 강화",
        icon: "📢",
        tag: "강화",
        tagColor: "bg-red-500/20 text-red-400 border-red-500/30",
        before: "명단공표 대상·기준 불명확",
        after: "1억원 이상 확정 시 기업명·대표자명 대국민 공표\n공표 기간 5년, 관보 및 홈페이지 게재",
        point: "사회적 낙인 효과 강화 → 부정청구 억제",
      },
    ]
  },
  {
    version: "v1",
    law: "법률 제16704호",
    date: "2020.01.01",
    label: "최초 시행",
    badge: "",
    badgeColor: "",
    isLatest: false,
    items: [
      {
        category: "법률 최초 시행",
        icon: "📋",
        tag: "신설",
        tagColor: "bg-green-500/20 text-green-400 border-green-500/30",
        before: "공공재정 부정수급 통합 법률 없음 (개별법 산재)",
        after: "공공재정환수법 제정: 허위·과다·목적외 3유형 환수 근거\n제재부가금: 허위5배·과다3배·목적외2배\n고액부정청구자 명단공표 제도 도입",
        point: "공공재정 부정수급 일반법 탄생",
      },
    ]
  },
];


const PUBLIC_ORG_TYPES = [
  { label: "중앙부처", icon: Landmark },
  { label: "지방자치단체", icon: Building2 },
  { label: "교육자치단체", icon: GraduationCap },
  { label: "공공기관", icon: Shield },
  { label: "지방의회", icon: Users },
  { label: "국공립대학", icon: BookMarked },
];

const LAW_CATEGORIES = [
  { label: "청탁금지법", prompt: "청탁금지법(김영란법)의 주요 위반 사례와 2024년 개정 기준(음식물 5만원)을 실제 징계·처벌 판례 중심으로 설명해줘." },
  { label: "이해충돌방지법", prompt: "이해충돌방지법의 사적 이해관계자 신고 의무, 직무상 비밀 이용 금지 등 핵심 조항을 실제 처벌 사례와 판례 중심으로 설명해줘." },
  { label: "행동강령", prompt: "공무원 행동강령의 주요 금지 행위와 실제 위반 징계 사례(감봉·정직·파면 수위 포함)를 구체적으로 설명해줘." },
  { label: "윤리강령", prompt: "공직자 윤리강령 위반 실제 사례와 처벌 결과를 구체적으로 설명해줘." },
  { label: "근로기준법", prompt: "공직사회 근로기준법 위반 및 갑질 관련 실제 처벌 판례와 징계 사례를 설명해줘." },
  { label: "공익신고자보호법", prompt: "공익신고자 보호법 위반으로 실제 처벌받은 판례와 신고자 보호 성공 사례를 구체적으로 설명해줘." },
  { label: "부패방지권익위법", prompt: "부패방지 및 국민권익위원회법에 따른 부패 신고 절차와 실제 신고로 처리된 사례를 설명해줘." },
  { label: "공직자윤리법", prompt: "공직자윤리법의 재산등록·취업제한·선물신고 위반 실제 사례와 징계 처분 결과를 판례 중심으로 설명해줘." },
  { label: "공공재정환수법", prompt: "공공재정환수법에 따른 실제 환수 처분 사례와 제재부가금 부과 결과, 이의신청 성공 사례를 구체적으로 설명해줘." },
  { label: "청렴도평가", prompt: "국민권익위원회의 공공기관 청렴도 평가 기준과 실제 하위 기관의 처분 사례, 청렴도 향상 우수 사례를 설명해줘." },
  { label: "부패영향평가", prompt: "부패영향평가 제도의 목적, 절차, 실제 법령·정책에 적용된 사례와 개선된 사례를 구체적으로 설명해줘." },
  { label: "신고사례", prompt: "공직사회에서 실제 부패 신고로 처리된 대표 사례들을 신고 유형별(청탁금지법·이해충돌·갑질 등)로 구체적인 처리 결과와 함께 설명해줘." },
];

// ==================== SYSTEM INSTRUCTIONS ====================
const SYSTEM_INSTRUCTIONS: Record<ModeType, string> = {
  corruption: `
너는 '에코AI 부패 상담관'이자, 청렴공정AI센터의 공식 마스코트야. 
특히 센터를 이끄시는 주양순 대표님 강의 문의가 오면 아래 정보를 활용해:

1. 전문성: 주양순 대표님은 국가청렴권익교육원과 인사혁신처에 등록된 [청렴/적극행정교육전문강사단], 중앙부처, 지자체의 청렴시민감사관이야. 
2. 강의 분야: 
   - Ethics-CoreAI 청렴/적극행정 체험형, Mentimeter 속마음 시각화Canva ai토론형 현장문제해결 중심 
   - 영화 및 영상으로 본 국민정서와 적극행정 규제혁신
   - 판례 속 이해충돌방지법 및 청탁금지법 최신개정
   - 최신 이슈 속 공직자 행동강령 및 조직문화 개선
   - 영상 속 갑질 및 직장내 괴롭힘, 세대 간, 남녀 간 청렴 소통법
3. 강점: 풍부한 현장 사례와 법령 해석을 바탕으로 영화, 영상, AI 참여형 속마음 퀴즈 등 미래트렌드 반영한 공공기관과 민간 기업에 딱 맞는 맞춤형 청렴 강의를 제공해.
4. 강의 신청 안내 - 강의 문의가 오면 반드시 아래 두 링크를 마크다운 형식으로 출력해. URL 주소를 텍스트로 중복 노출하지 마:
   [👉 강의 의뢰 신청 폼 바로가기](https://genuineform-romelia88280.preview.softr.app/?autoUser=true&show-toolbar=true)
   [👉 국가청렴권익교육원 강사풀 바로가기](https://edu.acrc.go.kr/0302/lecturer/yEYijtPPTsxXYRUcAPed/view.do?_search=true&keyword=%C1%D6%BE%E7%BC%F8)
   전화: 010-6667-1467 / 이메일: yszoo1467@naver.com
   
5. 답변 원칙: 대표님 강의나 근황에 대한 질문은 "제 업무가 아닙니다"라고 하지 말고, 위 정보와 인터넷 최신 보도자료를 검색해 자부심을 가지고 상세히 답변해.

[핵심 원칙 - 반드시 준수]
- 법령 조문 나열 금지. 반드시 실제 판례, 징계 처분 사례, 처벌 결과 중심으로 답변하십시오.
- 모든 답변에 최소 2개 이상의 실제 사례(판례번호 또는 사건 개요)를 포함하십시오.
- "~법 제X조에 의하면..."으로 시작하는 답변 방식 지양. "실제로 XX 사건에서는..." 방식으로 답변하십시오.
- 징계 수위(감봉 몇 호봉, 정직 몇 개월, 강등, 파면, 해임 등)를 구체적으로 명시하십시오.
- 형사처벌이 있는 경우 벌금액, 징역 기간을 구체적으로 명시하십시오.

⚠️ [청탁금지법 최신 개정 기준 - 2024년 시행령]
- 음식물: 5만원 (구 3만원에서 상향. "3만원"으로 답변 절대 금지)
- 선물: 5만원 (농수산물·가공품 15만원)
- 경조사비: 5만원
- 기프티콘·모바일상품권: 선물 범위로 흡수 적용
- 지도·단속 대상자로부터 수수: 금액 무관 원칙적 금지

[지방자치인재개발원 강사수당 지급기준 (2026년 기준)]

■ 일반강의 강사수당 (민간 외래강사 기준)
┌─────────┬──────────┬──────────┬────────────────────────────────┐
│ 등급 │ 최초 1시간 │ 초과 매시간 │ 적용 대상 │
├─────────┼──────────┼──────────┼────────────────────────────────┤
│ 특1급 │ 40만원 │ 30만원 │ 전직 장관급·대학총장·국회의원·광역단체장·대기업 회장 │
│ 특2급 │ 30만원 │ 20만원 │ 전직 차관급·공기업 대표·기초자치단체장 │
│ 1급 │ 25만원 │ 12만원 │ 전직 4급이상 공무원, 변호사·의사·기술사(5년이상), 박사+5년이상, 대학교수 │
│ 2급 │ 15만원 │ 8만원 │ 전직 5급이하 공무원, 전문자격증 3년이상, 중소기업 임원급 │
│ 3급 │ 10만원 │ 5만원 │ 외국어·전산 강사, 취미소양 5년이상 경력자 │
│ 4급 │ 8만원 │ 4만원 │ 체육·레크리에이션 취미소양 강사 │
│ 5급 │ 6만원 │ 3만원 │ 교육운영 보조자 │
└─────────┴──────────┴──────────┴────────────────────────────────┘

■ 공직자 등(청탁금지법 적용자) 강사수당 상한액
- 특1급(장관급·국회의원 등): 최초 1시간 40만원 / 초과 20만원
- 특2급(차관급·기초단체장 등): 최초 1시간 30만원 / 초과 20만원
- 1급(4급이상 공무원·대학교수·언론인 등): 최초 1시간 25만원 / 초과 12만원
- 2급(5급이하 공무원·대학강사·공직유관단체직원): 최초 1시간 15만원 / 초과 8만원
- ※ 강의료+원고료+출연료 등 모든 사례금 합산 적용
- ※ 공직자는 소속기관장 사전 신고 필수

[주양순 대표 강의 안내]
- 전문 분야: 청렴교육, 적극행정, 조직문화개선, AI 기반 청렴혁신, 갑질·직장 내 괴롭힘 예방
- 활동: 인사혁신처 적극행정 강사단, 국가청렴권익교육원 등 전국 공공기관 출강
- 강의 특징: Ethics-CoreAI 활용 AI 실시간 실습, Mentimeter,Canva 인터랙티브 참여형 교육
- 문의: yszoo1467@naver.com / 010-6667-1467

[답변 구조]
- **[실제 사례 진단]**: 유사 실제 사건 2~3개를 구체적으로 제시 (사건 개요, 처분 결과)
- **[징계·처벌 수위]**: 실제 적용된 징계 종류와 수위를 명시
- **[관련 판례]**: "대법원 20XX다XXXXX", "국민권익위원회 결정 제20XX-X호" 형식으로 인용
- **[위반 가능성]**: 확률(%)과 위험도 (예: **85% 고위험**)
- **[상담관의 조언]**: 자진 신고, 증거 확보 등 실질적 대응 방안
- 어조: 냉철하고 실질적인 '부패 상담관' 톤 ("~입니다", "~처분을 받았습니다")
`,

  recovery: `
당신은 '에코AI 공공재정환수법 전문 상담관'입니다. 주양순 대표가 설계한 전문 AI입니다.
청렴공정연구센터(Ethics-Core AI Smart Platform)의 공공재정환수법 마스터 클래스 전문가입니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【 1. 법령 기본 체계 - 공공재정환수법 마스터 클래스 】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 제정 목적 및 핵심 정의 (법 제1조, 제2조)
- 공공재정 누수 방지를 위한 법적 근거
- "공공재정지급금": 국가·지자체·공공기관이 지급하는 보조금, 보험금, 출연금, 용역비, 공사대금 등 모든 금전적 급부
- "부정청구": 거짓·속임수·위계로 공공재정지급금을 청구하거나 수령하는 행위
- "과다청구": 정당한 금액보다 많이 청구하는 행위
- "목적 외 사용": 지급 목적과 다르게 사용하는 행위

■ 다른 법률과의 관계 (적용 우선순위)
- 공공재정환수법은 일반법으로, 개별 법률(보조금법, 국고금법 등)에 특별 규정이 있으면 개별법 우선 적용
- 개별법에 규정 없는 사항은 공공재정환수법 적용 (보충적 적용)
- "일반법"의 역할: 모든 공공재정 부정수급에 대한 최소한의 환수 근거 제공
- 중요: 보조금법, 사회보장급여법, 국가연구개발혁신법 등 개별법이 있는 경우 해당 법 우선

■ 환수 및 징벌적 제재부가금 (핵심!)
- 환수금 = 부정수령액 전액 (원금)
- 제재부가금 = 환수금에 추가로 부과하는 징벌적 금액
  · 허위청구(거짓·위계): 환수금의 **최대 5배**
  · 과다청구(금액 부풀리기): 환수금의 **최대 3배**
  · 목적 외 사용(용도 위반): 환수금의 **최대 2배**
- 법정이자: 국세기본법 시행령에 따른 이자율 적용 (구간별 적용)
  · 2020.01.01~2020.03.12: 2.1%
  · 2020.03.13~2021.03.15: 1.8%
  · 2021.03.16~2023.03.19: 1.2%
  · 2023.03.20~2024.03.21: 2.9%
  · 2024.03.22~현재: 3.5%
- 분할납부 가능 여부: 신청 시 기관 재량으로 허용 가능 (법령 별도 기준)

■ 고액부정청구자 명단공표 (사회적 낙인)
- 공표 대상: 1억원 이상 부정청구하여 환수결정이 확정된 자
- 공표 내용: 기업명, 대표자 이름, 부정청구 금액, 위반 내용 → 대국민 공개
- 공표 기간: 5년간 기관 홈페이지, 관보 게재
- 사전통지 후 소명 기회 부여, 이의 없으면 공표 확정
- 사회적 제재 효과: 향후 공공사업 입찰 배제, 금융기관 신용도 영향

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【 2. 실전 사례 - 유형별 부정수급 판례 】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 1) 지방의회/공직자 - 의정활동비, 여비 부정수급
- [사례1] 출석부 도장만 찍고 '돈'?: 지방의원이 회의 불참 상태에서 출석부에만 날인하여 의정비를 수령한 사안. 환수 처분 + 제재부가금 3배 + 형사고발(사기죄 적용)
- [사례2] 퇴근 후 다시 와서 '지문'만 콕!: 초과근무수당을 허위 청구한 공무원. 초과근무 미실시 사실이 CCTV 확인으로 입증. 환수 + 징계(정직 1개월) 처분
- [판례] 가지 많은 출장비 청구 (허위청구): 실제 출장 없이 출장비를 청구한 사안에서 법원은 "출장의 실질이 없는 허위청구에 해당"한다고 판시. 환수금 5배 제재부가금 정당 인정

■ 2) 창업벤처 부정수급 - 사업비 카드 사적 사용
- [사례1] 사업비 카드로 명품 패딩/정장 구매: 창업지원금으로 지급된 법인카드를 대표가 개인 명품의류 구매에 사용. 환수 + 제재부가금 2배(목적외사용) + 지원 자격 3년 박탈
- [사례2] 가족을 직원으로 허위 등록 (인건비 3,600만원): 실제 근무하지 않는 배우자를 직원으로 등록하여 인건비 수령. 허위청구에 해당 → 환수 + 5배 제재부가금
- [판례] 허위 세금계산서로 1억 환수(Payback): 실제 용역 없이 허위 세금계산서를 발행하여 연구개발비를 수령한 스타트업. 법원 "허위 청구의 전형적 사례" 판시, 형사처벌(사기) 병과

■ 3) R&D 연구개발비 부정수급
- [사례1] 이미 개발된 기술로 과제 신청 (허위청구): 기존 보유 기술을 신규 개발인 것처럼 속여 R&D 과제 선정. 국가연구개발혁신법 + 공공재정환수법 중복 적용. 환수 + 5배 제재부가금
- [사례2] 연구장비 4천만원 결제 후 1천만원 돌려받기 (장비 깡): 연구장비 구매 후 공급업체로부터 현금 환급받는 방식으로 연구비 유용. 환수 + 형사처벌
- [판례] 학생 연구원 인건비 공동관리 (Pooling): 연구실에서 학생들 인건비를 교수가 통합 관리하며 유용한 사안. 대법원 "인건비 풀링은 목적 외 사용에 해당" 판시

■ 4) 교통/지역 - 유가보조금, 체육회
- [사례1] 화물차 유가보조금 '카드강' (허위 결제): 실제 주유 없이 주유소와 공모하여 유가보조금 허위 수령. 환수 + 5배 제재부가금 + 형사처벌(사기죄, 보조금법 위반)
- [사례2] 운행하지 않은 버스에 유가보조금 청구: 폐차되거나 운행 중단된 차량에 유가보조금을 계속 청구. 환수 처분
- [판례] 지역 체육회 훈련비 횡령: 체육회 보조금을 임원이 횡령한 사안. 환수 + 제재부가금 + 명단공표(1억 이상)

■ 5) 교육/사회복지 시설 부정수급
- [사례1] 유령 교사 등록 및 간식비 유용: 어린이집에서 실제 근무하지 않는 보조교사를 등록하여 인건비 수령. 환수 + 5배 제재부가금 + 운영 정지
- [사례2] 방과후 수업 하지 않고 강사료 꿀꺽: 방과후 강사가 수업 미실시 후 강사료 청구. 환수 + 부정청구 사실 관할청 통보
- [판례] 근무시간 조작형 보조금 편취: 요양보호사 근무시간을 허위 기재하여 요양급여 청구. 법원 "반복적·조직적 허위청구"로 5배 제재부가금 정당 인정

■ 6) 개인복지 부정수급
- [사례1] 외제차 타는 기초생활수급자 (소득 은닉): 고가 차량 보유·소득 은닉 상태에서 기초생활급여 수령. 수급 자격 박탈 + 전액 환수 + 제재부가금
- [사례2] 위장 이혼하고 한집 살림 (맞벌이 혜택): 법적 이혼 상태를 유지하며 동거, 부양의무자 기준 회피. 환수 + 형사처벌(사기)
- [판례] 사망한 모친 연금 2년간 수령: 사망 신고 지연 또는 고의 미신고로 유족이 2년간 연금 수령. 환수 + 제재부가금 2배(부정한 방법) 부과

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【 3. 유권해석 - 주제별 2025년 최신 해석 사례 】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 연구개발(R&D) 유권해석
- Q: 연구과제 종료 후 잔액을 다음 과제에 사용해도 되나?
  A: 불가. 잔액은 반납 의무. 무단 이월 사용 시 목적 외 사용에 해당 → 환수 대상
- Q: 연구비로 해외 학회 참가 시 관광 포함하면?
  A: 학회 공식 일정 외 관광비용은 목적 외 사용. 개인 부담 처리 필수

■ 창업지원금 유권해석
- Q: 창업지원금으로 대표자 급여 지급 가능?
  A: 협약서에 명시된 경우만 가능. 미명시 시 목적 외 사용 → 환수
- Q: 공동창업자 중 1인이 탈퇴하면 지원금 전액 환수?
  A: 사업 지속 여부, 대체 인력 보완 여부에 따라 기관 재량. 즉시 신고가 핵심

■ 공사/계약 유권해석
- Q: 하도급 업체가 부정청구 시 원청도 책임지나?
  A: 원청이 묵인 또는 지시한 경우 연대 책임. 단순 관리 소홀이면 원청은 환수 면제 가능하나 계약 위반 제재
- Q: 공사비 예산 절감분을 다른 공종에 사용해도 되나?
  A: 설계변경 절차를 거치지 않은 임의 전용은 목적 외 사용 → 환수 대상

■ 복지/보조금 유권해석
- Q: 보조금 정산 기한을 넘기면 바로 환수 처분?
  A: 정당한 사유 없는 기한 초과 시 환수 가능하나, 기관이 사전 소명 기회 부여 후 처분. 즉시 소명 중요
- Q: 자진신고 시 제재부가금 감면되나?
  A: 법 제10조에 따라 자진신고 전 적발 전 전액 반환 시 제재부가금 면제 가능. 조사 개시 후 신고는 감면 폭 축소

■ 일반운영비 유권해석
- Q: 사업비로 노트북 구매? 사업계획서 미기재 시 불인정 및 환수 대상
  A: 사업계획서에 명시된 품목만 집행 가능. 미기재 품목 구매는 목적 외 사용으로 환수
- Q: 맹단공표 기준은?
  A: 부정청구금액 1억원 이상 + 환수결정 확정 시 공표. 분할 부정청구도 합산하여 1억 초과 시 해당

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【 4. 환수 계산 기준 - 이자율 적용 방법 】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 법정이자 계산 원칙
- 국세기본법 시행령 제43조의3에 따른 이자율을 구간별로 적용
- 수령일부터 환수 처분일까지 구간 분할하여 계산
- 단리 방식 적용 (복리 아님)
- 이자 = 환수금 × 해당 구간 이자율 × (해당 구간 일수 / 365)

■ 계산 예시 (1,000만원, 2023.12.01 수령, 2025.01.31 환수 통보 - 약 14개월)
- 구간①: 2023.12.01 ~ 2024.03.21 (112일) → 1,000만원 × 2.9% × (112/365) = 약 88,986원
- 구간②: 2024.03.22 ~ 2025.01.31 (316일) → 1,000만원 × 3.5% × (316/365) = 약 303,013원
- 이자 합계: 약 391,999원
- 총 납부액 (원금+이자만, 제재부가금 별도): 약 10,391,999원

■ 위반 유형별 총 납부 추정액 (1,000만원 기준, 위 이자 포함)
- 허위청구 (5배): 5,000만원 + 392만원 = 약 5,392만원
- 과다청구 (3배): 3,000만원 + 392만원 = 약 3,392만원
- 목적 외 사용 (2배): 2,000만원 + 392만원 = 약 2,392만원

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【 5. 이의신청 및 행정심판 가이드 】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 이의신청 절차
- 환수 처분 통보 수령 후 30일 이내 처분 기관에 이의신청
- 이의신청서 구성: 처분 경위 요약 + 불복 이유 + 소명자료
- 핵심 소명 포인트:
  · 지출의 목적 적합성 증빙 (영수증, 계약서, 사업계획서 대조)
  · 선의의 착오 또는 담당자 지도하 집행 여부
  · 내부 승인 절차 준수 여부
  · 자진신고 또는 조기 반환 사실

■ 행정심판 신청
- 이의신청 기각 후 90일 이내 행정심판위원회에 청구
- 또는 처분일로부터 180일 이내 직접 청구 가능
- 행정심판 승소 가능성 높은 케이스:
  · 처분 기관이 소명 기회를 주지 않은 경우 (절차 하자)
  · 제재부가금 배율 산정이 과도한 경우
  · 유사 사례와 형평성에 현저히 어긋나는 경우
  · 자진신고 감면 규정을 기관이 잘못 적용한 경우

■ 행정소송
- 행정심판 결과 수령 후 90일 이내 행정법원에 소 제기
- 집행정지 신청: 소송 중 강제 징수 막을 수 있음

■ 소멸시효
- 환수 청구권 소멸시효: 5년 (안 날로부터 기산)
- 단, 사기·위계 등 고의적 부정청구는 10년 적용 가능
- 시효 완성 주장은 이의신청 단계부터 적극 제출

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【 6. 핵심 원칙 및 답변 구조 】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[핵심 원칙]
- 법령 조문 나열보다 실제 환수 처분 사례, 행정심판 결과, 판례 중심으로 답변
- 실제 환수 금액, 제재부가금 배율, 이의신청 성공/실패 사례를 구체적으로 제시
- 계산이 필요한 경우 구간별 이자율을 적용하여 추정 총액 제시
- 자진신고 감면 혜택, 소멸시효 등 의뢰인에게 유리한 정보를 적극 안내

[답변 구조]
- **[환수 가능성 진단]**: 위반 유형(허위/과다/목적외) 판단 + 위험도 명시 (예: **허위청구 90% 고위험**)
- **[예상 환수액 계산]**: 원금 + 이자 + 제재부가금 배율별 시뮬레이션
- **[실제 처분 사례]**: 유사 사건의 환수 처분 결과 2개 이상 제시
- **[관련 판례·유권해석]**: 행정심판례, 대법원 판례, 기재부·권익위 유권해석 인용
- **[전문가 조언]**: 자진신고 여부, 이의신청 기간·절차·준비서류 등 구체적 가이드
- 어조: 전문적이고 신뢰감 있는 톤 ("~처분을 받을 수 있습니다", "~에 해당합니다")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【 7. ⚡ 2024년 9월 27일 개정법 핵심 변경사항 (반드시 숙지!) 】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 개정 배경
- 2020.1.1 최초 시행 이후 입법 공백 문제 지속 제기
- 2024.3.26 개정 공포 → 2024.9.27 시행 (법률 제20426호)
- 핵심: 부정수익자 제재 대폭 강화 + 신고자 보호 확대

■ ① 형사처벌 규정 신설 (완전히 새로운 제재!)
- 기존: 환수금·제재부가금 등 금전 제재만 가능 (형사처벌 근거 없음)
- 개정 후:
  · 허위청구 (거짓·부정한 방법으로 자격 없는데 청구): 최대 **3년 이하 징역 또는 3천만원 이하 벌금**
  · 과다청구 (받아야 할 금액보다 과다 청구): **1년 이하 징역 또는 1천만원 이하 벌금**
  · 과다청구임을 알면서 지급한 공무원도 동일 처벌
- 시사점: 기존에는 돈만 돌려주면 됐지만, 이제 형사처벌·전과 기록까지 따름

■ ② 이자 환수 합리화 (의뢰인에게 유리한 변경!)
- 기존: 귀책사유 없어도 이자까지 환수 (불합리)
- 개정 후: **수급자의 귀책사유가 있는 경우에만** 이자 환수
- 실무 포인트: 담당자 안내에 따라 집행한 경우, 법령 해석 오류로 인한 경우 → 이자 환수 면제 주장 가능
- 또한, 개별법에 이자 규정 없어도 공공재정환수법으로 이자 환수 가능하도록 명확화

■ ③ 자진신고 감면 제도 정밀화 (중요!)
- 기존: 사전통지 전 자진신고 → 무조건 제재부가금 전액 면제 (악용 소지 있었음)
- 개정 후: **행정청 인지 전** 자진신고 → 제재부가금 전액 면제 (유지)
              **행정청 인지 후** 자진신고 → 면제 또는 감경 (재량)
- 핵심: 행정청이 이미 정황을 포착한 뒤의 자진신고는 면제가 아닌 감경으로 조정
- 실무 조언: 조사 착수 소문이 나기 전에 즉시 자진신고하는 것이 최선

■ ④ 비실명 대리신고 제도 도입 (신고자 보호 강화!)
- 신고자가 자신의 인적사항을 밝히지 않고 **변호사를 선임하여 대리 신고** 가능
- 국민권익위원회 비실명 대리신고 자문변호사단 통해 무료 법률상담 및 대리신고 지원
- 신고자 신원 보호가 강화되어 내부고발 활성화 기대
- 신고 방법: 국민권익위원회 (www.acrc.go.kr) 또는 청렴포털 (www.clean.go.kr)

■ ⑤ 신고자 친족·동거인 구조금 신설
- 기존: 신고자 본인만 구조금 신청 가능
- 개정 후: 신고자의 **친족 또는 동거인**도 신고로 인해 피해를 입은 경우 구조금 신청 가능
- 구조금 대상: 치료비, 이사비, 소송비용, 불이익 기간 임금 손실액 등

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【 8. 신고자 포상금·보상금·구조금 완전 가이드 】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 포상금 (공익 기여 인정 시)
- 지급 요건: 신고로 공공기관 재산상 이익 또는 손실 방지, 정책·제도 개선에 기여한 경우
- 지급 한도: **최대 5억원** (2023.12.19 개정으로 상향)
- 신청: 국민권익위원회 → 보상심의위원회 심의 → 90일 내 결정

■ 보상금 (환수 직접 기여 시 - 더 큰 금액!)
- 지급 요건: 신고로 공공기관 수입 회복·증대 또는 비용 절감에 직접 기여한 경우
- 지급 기준: **보상대상가액의 30%**
- 지급 한도: **최대 30억원**
- 보상대상가액 = 환수금 + 제재부가금 합산액

■ 구조금 (신고로 인한 피해 구제)
- 지급 요건: 신고로 인해 불이익을 당한 경우 (본인 + 친족·동거인 포함)
- 대상 피해: 치료비, 이사비, 쟁송비용, 불이익 기간 임금 손실액
- 신청: 국민권익위원회 → 90일 내 결정

■ 신고자 보호 제재
- 신고자 인적사항 공개 금지 위반: 3년 이하 징역 또는 3천만원 이하 벌금
- 신고 방해·취소 강요: 1년 이하 징역 또는 1천만원 이하 벌금

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【 9. 담당자·기관 관점의 실무 유의사항 】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 공공기관 담당자 실무 핵심
- 오지급 발견 즉시 자체 환수 조치 및 사유 기록 → 처분 시 고의·과실 여부 판단 기준
- 귀책사유 없는 수급자에게는 이자 환수 면제 (2024 개정) → 담당자 안내 기록 중요
- 사전통지 절차 생략 시 처분 취소 위험 → 반드시 의견 제출 기회 부여
- 제재부가금 결정 시 위반 동기, 경위, 피해 회복 여부 등 재량 고려 요소 기록 필수

■ 수급자 대응 5단계 전략
1. 환수 통보 수령 즉시 → 날짜 확인 (이의신청 30일 기산점)
2. 귀책사유 유무 소명 자료 준비 (담당자 지도하 집행, 법령 해석 착오 등)
3. 이자 환수 면제 주장 (2024 개정: 귀책사유 없으면 이자 면제 가능)
4. 자진신고 감면 이미 활용 여부 확인 → 감경 폭 협상
5. 제재부가금 배율 경감 협상: 초범 여부, 위반 경위, 피해 회복 등 주장

■ 100만원 이하 소액·취약계층 특례
- 100만원 이하 소액 부정청구: 제재부가금 부과하지 않을 수 있음 (재량)
- 기초생활보장 급여 등 취약계층: 제재부가금 면제 가능
- 소명서 제출로 면제 요청 적극 활용

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【 10. 주요 관련 법령 연계 체계 및 신고 채널 】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 공공재정환수법과 함께 적용되는 법령 (우선순위)
- 보조금 관리에 관한 법률: 국고보조금 → 개별법 우선
- 지방자치단체 보조금 관리에 관한 법률 (2021 신설): 지자체 보조금
- 국가연구개발혁신법: R&D 과제비 부정사용
- 사회보장급여법: 복지급여 부정수급
- 고용보험법·산재보험법: 고용보험금·산재급여
- ※ 공공재정환수법은 개별법에 규정 없는 경우 보충 적용

■ 형사법 연계 (중복 부과 가능 - 이중처벌 아님!)
- 사기죄 (형법 제347조): 10년 이하 징역 또는 2천만원 이하 벌금
- 보조금법 위반: 10년 이하 징역 또는 3천만원 이하 벌금
- 공공재정환수법 형사처벌 (2024 개정): 허위청구 3년·과다청구 1년 이하 징역
- 행정적 환수·제재부가금 + 형사처벌 중복 부과 가능

■ 신고 채널
- 국민권익위원회 청렴포털: www.clean.go.kr
- 국민신문고: www.epeople.go.kr
- 감사원 부패·공익신고: www.bai.go.kr
- 각 부처 내부 감사부서 / 검찰·경찰 수사기관

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【 11. 주양순 대표 공공재정환수법 강의 안내 】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 강사 소개
- 주양순 대표 / 청렴공정연구센터(Ethics-Core AI Smart Platform) 대표
- 국가청렴권익교육원 등록 강사 / 인사혁신처 적극행정 전문강사단
- 중앙부처·지자체·공공기관 청렴시민감사관 활동
- 공공재정환수법 전문 AI 플랫폼(청렴공정연구센터) 설계·운영

■ 공공재정환수법 강의 특징 (타 강사와의 차별점)
- **법령 조문 암기식 강의 지양** → 실제 부정수급 판례·처분 사례 중심 현장형 강의
- 환수 계산기 직접 시연: 수강자가 본인 사례를 입력하며 환수금·제재부가금 실시간 계산
- Ethics-CoreAI 활용: AI 상담소·유권해석 검색 등 디지털 도구 실습 포함
- Mentimeter 속마음 퀴즈: "우리 기관에서 일어날 수 있는 부정수급 유형은?" 실시간 투표
- Canva AI 토론형: 실제 환수 처분 사례 카드뉴스 제작 → 팀별 발표 토론
- 2024 개정법(형사처벌 신설, 이자 합리화 등) 최신 내용 반영

■ 강의 커리큘럼 (기관 상황에 맞게 조정 가능)

▶ 기본형 (2~3시간)
1부. 공공재정환수법이란? (30분)
  - 왜 만들어졌나? 보조금법·개별법과의 차이
  - 허위·과다·목적외 3가지 유형 핵심 정리
  - 2024.9.27 개정: 형사처벌 신설이 우리에게 미치는 영향

2부. 우리 기관은 얼마나 위험한가? (60분)
  - 실전 사례 6대 유형별 판례 집중 분석
    (지방의회/공직자·창업벤처·R&D·교통·교육복지·개인복지)
  - 환수 계산기 시연: 1천만원 부정수급 시 총 납부액은?
  - Mentimeter 퀴즈: 우리 기관 위험 유형 실시간 점검

3부. 걸리면 어떻게 하나? 실전 대응법 (50분)
  - 이의신청 30일 기한, 준비 서류, 승소 전략
  - 자진신고 감면 제도: 언제 신고해야 면제받나?
  - 신고자 포상금·보상금 최대 30억원 수령 사례
  - AI 상담소 직접 실습

▶ 심화형 (4~6시간, 워크숍 포함)
  위 기본형 + 아래 추가
4부. 유권해석 실전 워크숍 (90분)
  - 주제별(R&D·창업·공사·복지·운영비) 팀 배정
  - 팀별 실제 유권해석 질의 사례 풀이
  - Canva AI로 우리 기관 예방 가이드 카드뉴스 제작·발표

5부. 내부 통제 시스템 점검 (60분)
  - 공공기관 담당자가 꼭 알아야 할 실무 체크리스트
  - 사전통지 절차, 이자 환수 면제 요건, 소액 특례 활용법
  - 우리 기관 맞춤 예방 대책 수립

■ 강의 대상 기관
- 지방자치단체 (보조금 담당 부서, 감사실, 회계·예산 부서)
- 중앙부처 및 소속기관 (보조금·R&D·위탁사업 담당자)
- 공공기관·지방공기업 (재무·감사 담당자)
- 교육청·국공립대학 (연구비·사업비 담당자)
- 보조금 수급 민간단체·사회복지법인·의료기관 (자체 예방 교육용)

■ 강의 신청 방법
강의 문의가 오면 반드시 아래 링크를 안내해줘:
[👉 강의 의뢰 신청 폼 바로가기](https://genuineform-romelia88280.preview.softr.app/?autoUser=true&show-toolbar=true)
[👉 국가청렴권익교육원 강사풀 바로가기](https://edu.acrc.go.kr/0302/lecturer/yEYijtPPTsxXYRUcAPed/view.do?_search=true&keyword=%C1%D6%BE%E7%BC%F8)
- 전화: 010-6667-1467
- 이메일: yszoo1467@naver.com

■ 강의 문의 답변 원칙
- 강의 관련 질문에 "제 업무가 아닙니다"라고 하지 말 것
- 강의 내용·방식·신청 방법을 자부심 있게 상세히 안내할 것
- 기관 유형에 맞는 커리큘럼(기본형/심화형)을 추천해줄 것
- 강사수당 기준 질문 시 지방자치인재개발원 기준(별도 섹션 참고)을 안내할 것
`
};

// ==================== QUICK MENUS ====================
const QUICK_MENUS: Record<ModeType, { label: string; icon: any; prompt: string }[]> = {
  corruption: [
    { label: "신종 부패 10대 유형", icon: Siren, prompt: "최근 공직사회에서 실제 적발된 신종 부패 10대 유형을 구체적인 사건 사례, 징계 처분 결과, 관련 판례 위주로 설명해줘. 법령 조문보다 실제 처벌 사례 중심으로 알려줘." },
    { label: "공직 갑질 징계·처벌 판례", icon: ShieldAlert, prompt: "공직 갑질로 실제 징계·처벌받은 최신 판례와 사례를 구체적으로 알려줘. 어떤 행위가 몇 호봉 감봉, 정직, 파면 등으로 이어졌는지 실제 사례 중심으로 설명해줘." },
    { label: "을질 판례", icon: Scale, prompt: "공직사회에서 발생한 '을질(하급자나 민원인에 의한 괴롭힘)' 관련 실제 판례와 처벌 사례를 구체적으로 설명해줘." },
    { label: "직장 내 괴롭힘 판례", icon: AlertTriangle, prompt: "공직사회 직장 내 괴롭힘의 빈번한 사례 유형과 실제 징계·형사처벌 판례를 구체적으로 설명해줘." },
    { label: "신고자보호 위반 판례", icon: CheckCircle2, prompt: "공익신고자 보호법 위반으로 실제 처벌받은 판례와 사례를 구체적으로 설명해줘." },
  ],
  recovery: [
    { label: "실전 사례 보기", icon: FileText, prompt: "공공재정환수법 실전 사례를 유형별(지방의회/공직자, 창업벤처, R&D, 교통/지역, 교육/사회복지, 개인복지)로 대표 판례와 처분 결과를 구체적으로 설명해줘." },
    { label: "법령 마스터 클래스", icon: BookOpen, prompt: "공공재정환수법의 핵심 내용을 설명해줘. 제정 목적, 환수 및 제재부가금 기준(허위5배·과다3배·목적외2배), 고액부정청구자 명단공표 제도, 다른 법률과의 관계까지 마스터 클래스 수준으로 정리해줘." },
    { label: "환수금 계산 방법", icon: Calculator, prompt: "공공재정환수법에 따른 환수금 계산 방법을 설명해줘. 국세기본법 이자율 구간별 적용 방법, 제재부가금 배율, 실제 계산 예시를 포함해서 알려줘." },
    { label: "유권해석 사례", icon: Search, prompt: "공공재정환수법 관련 2025년 최신 유권해석 사례를 주제별(R&D, 창업지원금, 공사/계약, 복지/보조금, 일반운영비)로 설명해줘. 실제 질의·회신 사례 중심으로 알려줘." },
    { label: "이의신청 방법", icon: Gavel, prompt: "공공재정 환수 결정에 불복하는 이의신청 절차, 기간(30일), 준비 서류, 행정심판 전략을 구체적으로 안내해줘. 승소 가능성을 높이는 핵심 포인트도 알려줘." },
    { label: "자진신고 감면", icon: MessageSquare, prompt: "공공재정환수법 제10조의 자진신고 감면 제도를 설명해줘. 조사 전 자진신고 시 제재부가금 면제 요건, 실제 감면 사례, 신고 절차를 구체적으로 알려줘." },
    { label: "⚡ 개정사항 비교 확인", icon: AlertTriangle, prompt: "__AMENDMENT_PAGE__" },
    { label: "신고 포상·보상금", icon: CheckCircle2, prompt: "공공재정 부정청구 신고자가 받을 수 있는 포상금(최대 5억원)과 보상금(최대 30억원, 환수액의 30%) 제도를 설명해줘. 신청 절차, 지급 요건, 구조금 제도, 비실명 대리신고 방법까지 구체적으로 알려줘." },
    { label: "📚 강의 신청 안내", icon: GraduationCap, prompt: "__LECTURE_PAGE__" },
  ]
};

// ==================== 유권해석 주제 (recovery 전용) ====================
const YUGEON_TOPICS = [
  { label: "연구개발(R&D)", icon: "🔬", prompt: "R&D 연구개발비 관련 유권해석 사례를 구체적으로 설명해줘. 연구비 풀링, 장비 깡, 허위과제 신청 등 주요 위반 유형과 판례를 알려줘." },
  { label: "창업지원금", icon: "🚀", prompt: "창업지원금 관련 유권해석 사례를 설명해줘. 사업비 카드 사적 사용, 허위 인건비, 대표자 급여 처리 등 주요 이슈와 판례를 알려줘." },
  { label: "공사/계약", icon: "🏗️", prompt: "공사·계약 관련 유권해석 사례를 설명해줘. 하도급 부정청구, 예산 전용, 허위 세금계산서 등 주요 위반 유형과 판례를 알려줘." },
  { label: "복지/보조금", icon: "💛", prompt: "복지급여·보조금 관련 유권해석 사례를 설명해줘. 소득 은닉, 위장 이혼, 유령 수급자 등 주요 부정수급 유형과 환수 판례를 알려줘." },
  { label: "일반운영비", icon: "💰", prompt: "일반운영비·사업비 관련 유권해석 사례를 설명해줘. 노트북 구매, 회식비 처리, 잔액 이월 등 주요 이슈와 허용 기준을 판례 중심으로 알려줘." },
];

const MARQUEE_QA: Record<ModeType, string[]> = {
  corruption: [
    "Q. 상급자가 부당한 업무 지시를 했어요. 어떻게 해야 하나요?",
    "Q. 거래처에서 5만원 이하 선물을 받았는데 괜찮은가요?",
    "Q. 공무원인데 지인이 민원 처리를 부탁합니다. 청탁금지법 위반인가요?",
    "Q. 직무 관련 외부 강의료는 얼마까지 받을 수 있나요?",
    "Q. 이해충돌방지법상 사적 이해관계자 신고를 안 하면 어떻게 되나요?",
    "Q. 업무 중 알게 된 정보를 개인 투자에 활용해도 될까요?",
    "Q. 퇴직 공무원이 전 직장 관련 업무를 수행해도 되나요?",
    "Q. 익명으로 부패를 신고하면 신분이 보호되나요?",
    "Q. 동료가 금품을 수수하는 것을 목격했습니다. 신고 의무가 있나요?",
    "Q. 경조사비 10만원을 받았는데 위반인가요?",
    "Q. 당해년도 강사비 지급기준은 어떻게 되나요?",
    "Q. 주양순 청렴·적극행정·조직문화개선 강의내용과 방식 그리고 신청방법은?",
  ],
  recovery: [
    "Q. 보조금을 잘못 사용했을 때 환수 기준은 무엇인가요?",
    "Q. 환수 결정을 받았는데 이의신청 기간이 얼마나 되나요?",
    "Q. 제재부가금과 환수금은 어떻게 다른가요?",
    "Q. 공공재정 부정 수급 시 형사처벌도 받나요?",
    "Q. 환수 결정에 대한 행정심판 승소율을 높이는 방법은?",
    "Q. 보조금 정산 서류를 허위로 제출했을 때 처벌은?",
    "Q. 환수 통보를 받았는데 분할 납부가 가능한가요?",
    "Q. 위탁기관의 부정 수급에 대해 위탁 기관도 책임지나요?",
    "Q. 국고보조금 환수 처분 취소 소송 절차는 어떻게 되나요?",
    "Q. 5년 전 보조금 사업에 대해 환수 통보가 왔어요. 소멸시효가 지나지 않았나요?",
    "Q. 자진신고 전 적발 전에 반환하면 제재부가금 면제되나요?",
    "Q. 고액부정청구자 명단공표 기준 금액은 얼마인가요?",
    "Q. 2024년 개정으로 형사처벌 기준이 어떻게 바뀌었나요?",
    "Q. 귀책사유 없이 오지급받은 경우 이자도 내야 하나요?",
    "Q. 비실명 대리신고 제도는 어떻게 이용하나요?",
    "Q. 부정청구 신고하면 포상금을 얼마나 받을 수 있나요?",
    "Q. 주양순 대표의 공공재정환수법 강의를 우리 기관에 신청하려면?",
    "Q. 공공재정환수법 강의는 어떤 기관에 적합한가요?",
  ]
};

const GREETINGS: Record<ModeType, string> = {
  corruption: `안녕하십니까. 주양순 대표가 설계한 **에코AI 부패 상담관**입니다.\n\n귀하의 제보는 **철저히 익명이 보장**되며, 모든 답변은 **「청탁금지법」**, **「이해충돌방지법」** 등 관계 법령과 최신 판례에 근거하여 정밀 분석을 제공합니다.\n\n공공기관 유형·법령 카테고리·퀵 메뉴를 선택하거나 직접 질의해 주세요.`,
  recovery: `안녕하십니까. 주양순 대표가 설계한 **에코AI 공공재정환수법 전문 상담관**입니다.\n\n**청렴공정연구센터 공공재정환수법 마스터 클래스** 기반으로 운영됩니다.\n\n✅ **실전 사례** (지방의회·창업벤처·R&D·교통·복지·개인)\n✅ **법령 마스터** (환수·제재부가금 5배·3배·2배·명단공표)\n✅ **환수 계산기** (구간별 이자율 시뮬레이션)\n✅ **유권해석** (R&D·창업·공사·복지·운영비)\n✅ **이의신청·행정심판** 가이드\n\n상단 퀵 메뉴를 선택하거나 직접 질의해 주세요.`
};

// ==================== 텍스트 렌더링 ====================
const renderStyledText = (text: string): React.ReactNode[] => {
  return text.split('\n').map((line, i) => {
    if (line.trim().startsWith('>')) {
      return (
        <div key={i} className="my-3 p-3 bg-slate-900/80 border-l-4 border-cyan-500 rounded-r-lg text-slate-300 text-sm leading-loose break-keep italic">
          {line.replace('>', '').trim()}
        </div>
      );
    }
    const parseLine = (raw: string): React.ReactNode[] => {
      const nodes: React.ReactNode[] = [];
      const regex = /(\[([^\]]+)\]\((https?:\/\/[^)]+)\))|(\*\*(.+?)\*\*)|(https?:\/\/\S+)/g;
      let last = 0;
      let match;
      let k = 0;
      while ((match = regex.exec(raw)) !== null) {
        if (match.index > last) nodes.push(<span key={k++}>{raw.slice(last, match.index)}</span>);
        if (match[1]) {
          nodes.push(<a key={k++} href={match[3]} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-cyan-400 underline font-bold hover:text-cyan-300 transition-colors cursor-pointer">{match[2]}</a>);
        } else if (match[4]) {
          const content = match[5];
          if (content.includes('%')) {
            nodes.push(<strong key={k++} className="text-red-400 bg-red-900/20 px-1.5 py-0.5 rounded border border-red-500/30 mx-1 text-sm">{content}</strong>);
          } else {
            nodes.push(<strong key={k++} className="text-cyan-400 font-bold">{content}</strong>);
          }
        } else if (match[6]) {
          nodes.push(<a key={k++} href={match[6]} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline break-all font-bold hover:text-blue-300 cursor-pointer">{match[6]}</a>);
        }
        last = match.index + match[0].length;
      }
      if (last < raw.length) nodes.push(<span key={k++}>{raw.slice(last)}</span>);
      return nodes;
    };
    return <p key={i} className="mb-2 leading-loose text-sm break-keep">{parseLine(line)}</p>;
  });
};

// ==================== 메인 컴포넌트 ====================
const EcaCorruptionCounselor: React.FC = () => {
  const [mode, setMode] = useState<ModeType | null>(null);
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState('v3');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedMode = sessionStorage.getItem('counseling_mode');
    if (savedMode === 'corruption') { setMode('corruption'); sessionStorage.removeItem('counseling_mode'); }
    else if (savedMode === 'recovery') { setMode('recovery'); sessionStorage.removeItem('counseling_mode'); }
  }, []);

  useEffect(() => {
    if (mode) setChatLog([{ role: 'ai', text: GREETINGS[mode] }]);
  }, [mode]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, isTyping]);

  const handleBack = () => {
    if (mode === 'lecture' || mode === 'amendment') { setMode('recovery'); }
    else if (mode) { setMode(null); setChatLog([]); }
    else {
      sessionStorage.setItem('hero_view_mode', 'consulting');
      const event = new CustomEvent('navigate', { detail: 'home' });
      window.dispatchEvent(event);
    }
  };

  const handleSend = async (text: string = chatInput) => {
    if (!text.trim() || !mode) return;
    // 강의 안내 페이지로 이동
    if (text === '__LECTURE_PAGE__') { setMode('lecture'); return; }
    // 개정사항 비교 페이지로 이동
    if (text === '__AMENDMENT_PAGE__') { setMode('amendment'); return; }
    setChatLog(prev => [...prev, { role: 'user', text }]);
    setChatInput('');
    setIsTyping(true);
    if (!genAI) {
      setTimeout(() => { setChatLog(prev => [...prev, { role: 'ai', text: 'API Key가 설정되지 않았습니다. 관리자에게 문의하세요.' }]); setIsTyping(false); }, 1000);
      return;
    }
    try {
      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: text,
        config: { systemInstruction: SYSTEM_INSTRUCTIONS[mode] }
      });
      setChatLog(prev => [...prev, { role: 'ai', text: response.text || '답변을 받지 못했습니다.' }]);
    } catch (e: any) {
      setChatLog(prev => [...prev, { role: 'ai', text: `오류가 발생했습니다: ${e?.message || '알 수 없는 오류'}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  // ==================== 개정사항 비교 페이지 ====================
  if (mode === 'amendment') {
    const selected = AMENDMENT_HISTORY.find(h => h.version === selectedVersion)!;

    return (
      <section className="relative z-10 py-8 px-4 w-full max-w-4xl mx-auto min-h-screen flex flex-col gap-5">
        {/* 헤더 */}
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-2 rounded-full bg-slate-800 border border-slate-700 hover:border-yellow-400 transition-all shrink-0">
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              공공재정환수법 개정사항 비교
            </h2>
            <p className="text-xs text-yellow-400 font-bold">개정 시마다 자동 업데이트 · 개정 전/후 한눈 비교</p>
          </div>
        </div>

        {/* 최신 개정 알림 배너 */}
        <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-500/40 rounded-2xl">
          <span className="text-2xl shrink-0">🔔</span>
          <div>
            <p className="text-red-400 font-black text-sm">최신 개정 · {AMENDMENT_HISTORY[0].date} 시행</p>
            <p className="text-white text-sm font-bold">{AMENDMENT_HISTORY[0].label} ({AMENDMENT_HISTORY[0].law})</p>
            <p className="text-slate-400 text-xs mt-0.5">형사처벌 신설 · 이자환수 합리화 · 자진신고 정밀화 · 비실명 대리신고 도입</p>
          </div>
          <span className="ml-auto shrink-0 px-2 py-1 bg-red-500 text-white text-[10px] font-black rounded-full">NEW</span>
        </div>

        {/* 버전 탭 */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {AMENDMENT_HISTORY.map(h => (
            <button
              key={h.version}
              onClick={() => setSelectedVersion(h.version)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-black whitespace-nowrap border transition-all shrink-0 ${
                selectedVersion === h.version
                  ? 'bg-yellow-500 text-black border-yellow-400'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-yellow-500/50 hover:text-white'
              }`}
            >
              {h.isLatest && <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>}
              {h.label}
              {h.isLatest && <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] rounded-full">최신</span>}
            </button>
          ))}
        </div>

        {/* 선택된 버전 정보 */}
        <div className="flex items-center gap-3 px-1">
          <span className="text-slate-400 text-xs font-bold">{selected.law}</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400 text-xs">시행일 {selected.date}</span>
          <span className="ml-auto text-slate-500 text-xs">총 {selected.items.length}개 변경사항</span>
        </div>

        {/* 개정 항목 카드들 */}
        <div className="flex flex-col gap-4">
          {selected.items.map((item, i) => (
            <div key={i} className="bg-slate-900/70 border border-slate-700 rounded-2xl overflow-hidden">
              {/* 카드 헤더 */}
              <div className="flex items-center gap-3 px-5 py-3 bg-slate-800/60 border-b border-slate-700">
                <span className="text-xl">{item.icon}</span>
                <span className="text-white font-black text-sm">{item.category}</span>
                <span className={`ml-auto text-[10px] px-2 py-1 rounded-full border font-black ${item.tagColor}`}>{item.tag}</span>
              </div>

              {/* 개정 전/후 비교 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-700">
                {/* 개정 전 */}
                <div className="p-4">
                  <p className="text-xs font-black text-slate-500 mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-slate-600 rounded-full"></span>
                    개정 전
                  </p>
                  <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{item.before}</p>
                </div>
                {/* 개정 후 */}
                <div className="p-4 bg-slate-800/30">
                  <p className="text-xs font-black text-yellow-400 mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    개정 후
                  </p>
                  <p className="text-white text-sm leading-relaxed font-bold whitespace-pre-line">{item.after}</p>
                </div>
              </div>

              {/* 실무 포인트 */}
              <div className="flex items-start gap-2 px-5 py-3 bg-yellow-900/10 border-t border-yellow-500/20">
                <span className="text-yellow-400 text-xs font-black shrink-0 mt-0.5">💡 실무 포인트</span>
                <p className="text-yellow-300 text-xs leading-relaxed">{item.point}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 다음 개정 예고 안내 */}
        <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
          <span className="text-xl">📌</span>
          <div>
            <p className="text-slate-300 text-sm font-bold">개정사항 업데이트 안내</p>
            <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
              공공재정환수법 개정 시 이 페이지에 즉시 반영됩니다.
              법제처 국가법령정보센터 또는 기획재정부 공고를 통해 개정 여부를 확인하세요.
            </p>
          </div>
        </div>

        {/* 하단 버튼 */}
        <button onClick={handleBack}
          className="flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors px-6 py-3 rounded-full hover:bg-slate-800/50 mx-auto">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-bold text-sm">공공재정환수법 상담소로 돌아가기</span>
        </button>
      </section>
    );
  }

  // ==================== 강의 안내 페이지 ====================
  if (mode === 'lecture') {
    return (
      <section className="relative z-10 py-8 px-4 w-full max-w-4xl mx-auto min-h-screen flex flex-col gap-6">
        {/* 헤더 */}
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-2 rounded-full bg-slate-800 border border-slate-700 hover:border-green-400 transition-all shrink-0">
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-green-400" />
              공공재정환수법 강의 안내
            </h2>
            <p className="text-xs text-green-400 font-bold">주양순 대표 · 청렴공정연구센터</p>
          </div>
        </div>

        {/* 강사 프로필 */}
        <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/20 border border-green-500/30 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-600/30 border border-green-500/40 flex items-center justify-center shrink-0 text-2xl">👩‍🏫</div>
            <div>
              <h3 className="text-white font-black text-lg">주양순 대표</h3>
              <p className="text-green-400 text-sm font-bold mb-2">청렴공정연구센터(Ethics-Core AI Smart Platform)</p>
              <div className="flex flex-wrap gap-2">
                {["국가청렴권익교육원 등록강사", "인사혁신처 적극행정 전문강사단", "청렴시민감사관"].map((badge, i) => (
                  <span key={i} className="text-[10px] px-2 py-1 bg-green-900/40 border border-green-500/30 text-green-300 rounded-full font-bold">{badge}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 강의 특징 */}
        <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-5">
          <h4 className="text-white font-black mb-4 flex items-center gap-2">
            <span className="text-yellow-400">⭐</span> 타 강사와의 차별점
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { icon: "⚖️", title: "판례 중심 실전 강의", desc: "법령 조문 암기 지양 → 실제 환수 처분·판례 사례 중심" },
              { icon: "🧮", title: "환수 계산기 직접 시연", desc: "수강자가 본인 사례 입력 → 환수금·제재부가금 실시간 계산" },
              { icon: "🤖", title: "Ethics-CoreAI 실습", desc: "AI 상담소·유권해석 검색 등 디지털 도구 현장 실습" },
              { icon: "📊", title: "Mentimeter 속마음 퀴즈", desc: "우리 기관 위험 유형 실시간 투표·시각화" },
              { icon: "🎨", title: "Canva AI 토론형", desc: "환수 사례 카드뉴스 제작 → 팀별 발표·토론" },
              { icon: "📋", title: "2024 개정법 최신 반영", desc: "형사처벌 신설·이자 합리화 등 최신 개정 내용 포함" },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                <span className="text-xl shrink-0">{item.icon}</span>
                <div>
                  <p className="text-white text-xs font-black">{item.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 커리큘럼 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 기본형 */}
          <div className="bg-slate-900/60 border border-green-500/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 bg-green-600 text-white text-xs font-black rounded-lg">기본형</span>
              <span className="text-slate-400 text-xs">2~3시간</span>
            </div>
            <div className="space-y-3">
              {[
                { part: "1부", time: "30분", title: "공공재정환수법이란?", items: ["허위·과다·목적외 3유형 핵심", "2024 개정 형사처벌 신설 영향"] },
                { part: "2부", time: "60분", title: "우리 기관은 얼마나 위험한가?", items: ["6대 유형 판례 집중 분석", "환수 계산기 시연", "Mentimeter 퀴즈"] },
                { part: "3부", time: "50분", title: "걸리면 어떻게 하나?", items: ["이의신청 30일 기한·전략", "자진신고 감면 제도", "AI 상담소 실습"] },
              ].map((p, i) => (
                <div key={i} className="border-l-2 border-green-500/40 pl-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-green-400 text-xs font-black">{p.part}</span>
                    <span className="text-slate-500 text-[10px]">({p.time})</span>
                    <span className="text-white text-xs font-bold">{p.title}</span>
                  </div>
                  {p.items.map((item, j) => (
                    <p key={j} className="text-slate-400 text-[11px] ml-1">· {item}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* 심화형 */}
          <div className="bg-slate-900/60 border border-emerald-500/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 bg-emerald-600 text-white text-xs font-black rounded-lg">심화형</span>
              <span className="text-slate-400 text-xs">4~6시간 (워크숍)</span>
            </div>
            <div className="space-y-3">
              <div className="p-2 bg-emerald-900/20 rounded-lg border border-emerald-500/20">
                <p className="text-emerald-400 text-xs font-bold">기본형 전체 포함 +</p>
              </div>
              {[
                { part: "4부", time: "90분", title: "유권해석 실전 워크숍", items: ["R&D·창업·공사·복지·운영비 팀 배정", "실제 유권해석 질의 사례 풀이", "Canva AI 카드뉴스 제작·발표"] },
                { part: "5부", time: "60분", title: "내부 통제 시스템 점검", items: ["담당자 실무 체크리스트", "사전통지·이자면제·소액특례 활용", "기관 맞춤 예방 대책 수립"] },
              ].map((p, i) => (
                <div key={i} className="border-l-2 border-emerald-500/40 pl-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-emerald-400 text-xs font-black">{p.part}</span>
                    <span className="text-slate-500 text-[10px]">({p.time})</span>
                    <span className="text-white text-xs font-bold">{p.title}</span>
                  </div>
                  {p.items.map((item, j) => (
                    <p key={j} className="text-slate-400 text-[11px] ml-1">· {item}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 대상 기관 */}
        <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-5">
          <h4 className="text-white font-black mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-green-400" /> 강의 대상 기관
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              { icon: "🏛️", label: "지방자치단체", desc: "보조금·감사·회계·예산 부서" },
              { icon: "🏢", label: "중앙부처·소속기관", desc: "보조금·R&D·위탁사업 담당" },
              { icon: "🏗️", label: "공공기관·지방공기업", desc: "재무·감사 담당자" },
              { icon: "🎓", label: "교육청·국공립대학", desc: "연구비·사업비 담당자" },
              { icon: "❤️", label: "복지법인·의료기관", desc: "보조금 수급 민간단체" },
              { icon: "🚀", label: "창업·벤처기관", desc: "창업지원금 수급 기업" },
            ].map((org, i) => (
              <div key={i} className="flex gap-2 p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                <span className="text-lg shrink-0">{org.icon}</span>
                <div>
                  <p className="text-white text-xs font-bold">{org.label}</p>
                  <p className="text-slate-500 text-[10px]">{org.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 강의 신청 CTA */}
        <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/30 border border-green-500/40 rounded-2xl p-6">
          <h4 className="text-white font-black text-center mb-4 text-lg">📩 강의 신청 방법</h4>
          <div className="flex flex-col gap-3">
            <a href="https://genuineform-romelia88280.preview.softr.app/?autoUser=true&show-toolbar=true"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-green-600 hover:bg-green-500 text-white font-black rounded-xl transition-all text-sm shadow-lg shadow-green-900/40">
              <FileText className="w-4 h-4" />
              👉 강의 의뢰 신청 폼 바로가기
            </a>
            <a href="https://edu.acrc.go.kr/0302/lecturer/yEYijtPPTsxXYRUcAPed/view.do?_search=true&keyword=%C1%D6%BE%E7%BC%F8"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-slate-700 hover:bg-slate-600 text-white font-black rounded-xl transition-all text-sm border border-slate-600">
              <BookOpen className="w-4 h-4" />
              👉 국가청렴권익교육원 강사풀 바로가기
            </a>
            <div className="flex gap-3 mt-1">
              <div className="flex-1 flex items-center gap-2 p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                <span className="text-green-400 text-lg">📞</span>
                <div>
                  <p className="text-slate-400 text-[10px]">전화 문의</p>
                  <p className="text-white text-sm font-black">010-6667-1467</p>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-2 p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                <span className="text-green-400 text-lg">✉️</span>
                <div>
                  <p className="text-slate-400 text-[10px]">이메일 문의</p>
                  <p className="text-white text-sm font-black">yszoo1467@naver.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <button onClick={handleBack}
          className="flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors px-6 py-3 rounded-full hover:bg-slate-800/50 mx-auto">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-bold text-sm">공공재정환수법 상담소로 돌아가기</span>
        </button>
      </section>
    );
  }

  // ==================== 모드 선택 화면 ====================
  if (!mode) {
    return (
      <section className="relative z-10 py-16 px-4 w-full max-w-6xl mx-auto min-h-screen flex flex-col">
        <div className="mb-8">
          <button onClick={handleBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group px-4 py-2 rounded-full hover:bg-slate-800/50">
            <div className="p-1.5 rounded-full bg-slate-800 border border-slate-700 group-hover:border-cyan-400 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm">이전 화면으로</span>
          </button>
        </div>
        <div className="text-center mb-10">
          <span className="text-cyan-400 font-mono tracking-widest text-xs uppercase mb-3 block">Integrated AI Counseling</span>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4">6대 통합 상담센터</h1>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            <span className="text-white font-bold">부패 방지 법령</span>부터 <span className="text-white font-bold">공공재정 환수</span>까지,<br />
            전문 AI 상담관이 기다리고 있습니다.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            onClick={() => setMode('corruption')}
            className="group cursor-pointer bg-slate-900/80 border border-slate-700 hover:border-blue-500 rounded-3xl overflow-hidden shadow-xl hover:shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all duration-300 hover:-translate-y-1">
            <div className="h-3 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-black text-white">ECA 부패상담관</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">AI Powered</span>
                  </div>
                  <p className="text-xs text-blue-400 font-bold tracking-wider mt-0.5">청탁금지법 · 행동강령 · 이해충돌방지법</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {PUBLIC_ORG_TYPES.map((org, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-800/60 border border-slate-700 rounded-lg">
                    <org.icon className="w-3 h-3 text-blue-400 shrink-0" />
                    <span className="text-[10px] text-slate-300 font-bold leading-tight">{org.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-slate-400 text-sm leading-relaxed break-keep mb-5">복잡한 법령 해석, 딜레마 판단. 최신 판례와 권익위 결정례 기반 정밀 분석.</p>
              <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                <span className="text-slate-300 text-sm font-bold group-hover:text-blue-400 transition-colors">상담 시작하기</span>
                <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <ArrowLeft className="w-4 h-4 text-blue-400 group-hover:text-white rotate-180 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            onClick={() => setMode('recovery')}
            className="group cursor-pointer bg-slate-900/80 border border-slate-700 hover:border-green-500 rounded-3xl overflow-hidden shadow-xl hover:shadow-[0_0_30px_rgba(22,163,74,0.3)] transition-all duration-300 hover:-translate-y-1">
            <div className="h-3 bg-gradient-to-r from-green-600 to-emerald-600" />
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-green-600/20 border border-green-500/30 flex items-center justify-center shrink-0">
                  <Scale className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-black text-white">공공재정환수법 상담소</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 font-bold">Master Class</span>
                  </div>
                  <p className="text-xs text-green-400 font-bold tracking-wider mt-0.5">부정이익 환수 · 제재부가금 · 이의신청</p>
                </div>
              </div>
              {/* 마스터 클래스 5대 기능 뱃지 */}
              <div className="grid grid-cols-5 gap-1 mb-4">
                {[
                  { label: "실전사례", icon: "📋" },
                  { label: "법령마스터", icon: "⚖️" },
                  { label: "환수계산기", icon: "🧮" },
                  { label: "유권해석", icon: "🔍" },
                  { label: "AI상담소", icon: "🤖" },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1 px-1 py-2 bg-green-900/20 border border-green-500/20 rounded-lg text-center">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-[9px] text-green-300 font-bold leading-tight">{item.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-slate-400 text-sm leading-relaxed break-keep mb-5">환수 절차 및 이의 신청 가이드. 행정심판례 기반 전문 법률 자문.</p>
              <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                <span className="text-slate-300 text-sm font-bold group-hover:text-green-400 transition-colors">자문 구하기</span>
                <div className="w-8 h-8 rounded-full bg-green-600/20 flex items-center justify-center group-hover:bg-green-600 transition-colors">
                  <ArrowLeft className="w-4 h-4 text-green-400 group-hover:text-white rotate-180 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="mt-12 flex justify-center">
          <button onClick={handleBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group px-6 py-3 rounded-full hover:bg-slate-800/50">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-bold text-sm">이전 화면으로 돌아가기</span>
          </button>
        </div>
      </section>
    );
  }

  // ==================== 채팅 화면 ====================
  const isCorruption = mode === 'corruption';
  const accentBorder = isCorruption ? 'border-blue-500' : 'border-green-500';
  const accentText = isCorruption ? 'text-blue-400' : 'text-green-400';
  const accentBg = isCorruption ? 'bg-blue-600' : 'bg-green-600';
  const marqueeClass = isCorruption
    ? 'text-blue-300 border-blue-500/30 hover:bg-blue-600 hover:text-white hover:border-transparent'
    : 'text-green-300 border-green-500/30 hover:bg-green-600 hover:text-white hover:border-transparent';

  return (
    <section className="relative z-10 py-6 px-4 w-full max-w-5xl mx-auto min-h-screen flex flex-col gap-3">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <button onClick={handleBack} className="p-2 rounded-full bg-slate-800 border border-slate-700 hover:border-cyan-400 transition-all shrink-0">
          <ArrowLeft className="w-4 h-4 text-slate-400" />
        </button>
        <div className="min-w-0">
          <h2 className="text-base md:text-lg font-black text-white flex items-center gap-2 flex-wrap">
            {isCorruption ? <ShieldAlert className={`w-5 h-5 ${accentText} shrink-0`} /> : <Scale className={`w-5 h-5 ${accentText} shrink-0`} />}
            {isCorruption ? 'ECA 부패상담관' : '공공재정환수법 상담소'}
          </h2>
          <p className={`text-xs ${accentText} font-bold truncate`}>
            {isCorruption ? '청탁금지법 · 이해충돌방지법 · 행동강령 · 윤리강령 · 공익신고자보호법' : '실전사례 · 법령마스터 · 환수계산기 · 유권해석 · AI상담소'}
          </p>
        </div>
      </div>

      {/* 공공기관 유형 (corruption 모드) */}
      {isCorruption && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {PUBLIC_ORG_TYPES.map((org, idx) => (
            <button key={idx}
              onClick={() => handleSend(`${org.label} 소속 공직자로서 부패 관련 상담을 받고 싶습니다. ${org.label}에 적용되는 주요 청렴 법령과 유의사항을 안내해주세요.`)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-blue-600 border border-slate-700 hover:border-blue-500 rounded-full text-slate-300 hover:text-white transition-all whitespace-nowrap text-xs font-bold shrink-0">
              <org.icon className="w-3 h-3 shrink-0" />
              {org.label}
            </button>
          ))}
        </div>
      )}

      {/* 유권해석 주제 (recovery 모드) */}
      {!isCorruption && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {YUGEON_TOPICS.map((topic, idx) => (
            <button key={idx}
              onClick={() => handleSend(topic.prompt)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-green-600 border border-slate-700 hover:border-green-500 rounded-full text-slate-300 hover:text-white transition-all whitespace-nowrap text-xs font-bold shrink-0">
              <span>{topic.icon}</span>
              {topic.label}
            </button>
          ))}
        </div>
      )}

      {/* 법령 카테고리 마퀴 (corruption 모드) */}
      {isCorruption && (
        <div className="relative overflow-hidden rounded-xl border border-blue-500/20 bg-blue-900/10 py-2"
          style={{ maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)' }}>
          <div className="flex gap-3 animate-marquee whitespace-nowrap" style={{ animationDuration: '20s' }}>
            {[...LAW_CATEGORIES, ...LAW_CATEGORIES].map((law, idx) => (
              <button key={idx} onClick={() => handleSend(law.prompt)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1 bg-blue-900/40 hover:bg-blue-600 border border-blue-500/30 hover:border-transparent rounded-full text-blue-300 hover:text-white transition-all text-xs font-bold">
                <BookOpen className="w-3 h-3 shrink-0" />
                {law.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 퀵 메뉴 */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {QUICK_MENUS[mode].map((item, idx) => (
          <button key={idx} onClick={() => handleSend(item.prompt)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white transition-all whitespace-nowrap text-xs font-bold shrink-0">
            <item.icon className="w-3.5 h-3.5 shrink-0" />
            {item.label}
          </button>
        ))}
      </div>

      {/* 채팅 영역 */}
      <div className={`flex-grow rounded-2xl border ${accentBorder}/30 bg-slate-900/60 p-4 md:p-6 overflow-y-auto min-h-[350px] max-h-[55vh]`}>
        {chatLog.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`flex max-w-[92%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? accentBg : 'bg-slate-700'}`}>
                {msg.role === 'user' ? <UserCheck className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-loose break-keep shadow-lg ${msg.role === 'user' ? `${accentBg} text-white rounded-tr-none` : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'}`}>
                {msg.role === 'ai' ? renderStyledText(msg.text) : msg.text}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl rounded-tl-none flex gap-2 items-center">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* 흘러가는 Q&A 마퀴 */}
      <div className="overflow-hidden relative h-10">
        <div className="flex gap-8 absolute whitespace-nowrap animate-marquee" style={{ animationDuration: '30s', display: 'flex', width: 'max-content' }}>
          {[...MARQUEE_QA[mode], ...MARQUEE_QA[mode]].map((q, idx) => (
            <button key={idx} onClick={() => handleSend(q.replace('Q. ', ''))}
              className={`shrink-0 text-xs font-bold px-4 py-1.5 rounded-full border transition-all ${marqueeClass}`}>
              {q}
            </button>
          ))}
        </div>
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee { animation: marquee linear infinite; }
        `}</style>
      </div>

      {/* 입력창 */}
      <div className="relative">
        <input
          type="text"
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder={isCorruption ? "부패 의심 사례나 법령 질의를 입력하세요..." : "환수금 계산, 이의신청, 사례 질의를 입력하세요..."}
          className={`w-full bg-slate-900 border ${accentBorder}/50 rounded-full pl-5 pr-14 py-4 text-base md:text-sm text-white focus:outline-none focus:ring-1 transition-all shadow-lg placeholder:text-slate-600`}
        />
        <button onClick={() => handleSend()} disabled={!chatInput.trim() || isTyping}
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full text-white transition-all disabled:opacity-40 ${accentBg}`}>
          <Send className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};

export default EcaCorruptionCounselor;
