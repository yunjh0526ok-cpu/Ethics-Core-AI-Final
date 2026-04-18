import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { geminiGenerateContent } from '@/lib/geminiFetch';
import PptxGenJS from 'pptxgenjs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';
import {
  ArrowLeft, Play, Copy, Check, ChevronLeft, ChevronRight, Sparkles, Download,
  FileImage, FileText, Trash2, ImagePlus, Crown,
} from 'lucide-react';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
);

type Category = 'integrity' | 'workshop' | 'teambuilding' | 'party';
type OrgType = 'public' | 'local' | 'enterprise';
type QuizPack = 'basic' | 'advanced' | 'case';
type Step = 'dashboard' | 'lobby';
export type SlideTemplate = 'title' | 'twoColumn' | 'chart' | 'conclusion';
export type DeckAspect = '16:9' | '4:5' | '9:16' | '1:1';

interface Session {
  id: string;
  title: string;
  category: Category;
  code: string;
}

export interface SlideStyle {
  titleFontPx: number;
  bodyFontPx: number;
  titleColor: string;
  bodyColor: string;
  textAlign: 'left' | 'center';
}

export type FooterInsightKind = 'quote' | 'law';

export interface DeckSlide {
  template: SlideTemplate;
  title: string;
  subtitle: string;
  bullets: string[];
  leftColumn: string[];
  rightColumn: string[];
  chartLabels: string[];
  chartValues: number[];
  bgImage: string;
  caseStudy?: string;
  imageQuery?: string;
  /** 공직자 명언(quote) 또는 관련 법령 한 줄(law) */
  footerInsight?: string;
  footerInsightKind?: FooterInsightKind;
  style?: Partial<SlideStyle>;
}

const generateCode = () => `ECO-${Math.floor(1000 + Math.random() * 9000)}`;

const FOOTER_BRAND = 'Ethics-Core AI · EcoStage';

const CURATED_BG: Record<SlideTemplate, string[]> = {
  title: [
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1920&q=85',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1920&q=85',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=85',
  ],
  twoColumn: [
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1920&q=85',
    'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1920&q=85',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1920&q=85',
  ],
  chart: [
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1920&q=85',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1920&q=85',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1920&q=85',
  ],
  conclusion: [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=85',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1920&q=85',
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1920&q=85',
  ],
};

const BG_BY_TEMPLATE: Record<SlideTemplate, string> = {
  title: CURATED_BG.title[0],
  twoColumn: CURATED_BG.twoColumn[0],
  chart: CURATED_BG.chart[0],
  conclusion: CURATED_BG.conclusion[0],
};

const defaultSlideStyle: SlideStyle = {
  titleFontPx: 40,
  bodyFontPx: 17,
  titleColor: '#ffffff',
  bodyColor: '#e2e8f0',
  textAlign: 'left',
};

function pickCuratedBg(tpl: SlideTemplate, idx: number): string {
  const arr = CURATED_BG[tpl];
  return arr[idx % arr.length];
}

function emptyDeckFromTopic(topic: string): DeckSlide[] {
  const t = topic || 'AI 시대 공공 청렴';
  const order: SlideTemplate[] = ['title', 'twoColumn', 'chart', 'twoColumn', 'chart', 'twoColumn', 'chart', 'twoColumn', 'chart', 'conclusion'];
  return order.map((tpl, i) => {
    const base: DeckSlide = {
      template: tpl,
      title:
        tpl === 'title'
          ? t
          : tpl === 'conclusion'
            ? `${t} — 실행 과제 · 결론`
            : `${t} — 심화 ${Math.floor(i / 2) + 1}`,
      subtitle:
        tpl === 'title'
          ? '오프닝 · 법령·실무 초점'
          : tpl === 'chart'
            ? '리스크 프로파일'
            : tpl === 'conclusion'
              ? 'Next Step'
              : '현황 · 과제 · 사례',
      bullets:
        tpl === 'title'
          ? ['교육 목표·기대효과', '핵심 키워드 3가지', '세션 운영·토론 규칙']
          : tpl === 'conclusion'
            ? ['즉시: 결정 로그·신고 채널 재공지', '2주: 관리자 체크리스트 파일럿', '분기: 취약도 재측정·리포트 공유']
            : [],
      leftColumn:
        tpl === 'twoColumn'
          ? ['규정·제도는 존재하나 실행 편차', '민원·내부 신고 대응 일관성 이슈', '현장 정보 비대칭·설명 책임 부족']
          : [],
      rightColumn:
        tpl === 'twoColumn'
          ? ['결정 로그·근거 표준화', '교차검증·이해충돌 사전 점검', '피드백 루프·심리적 안전 설계']
          : [],
      chartLabels: tpl === 'chart' ? ['이해충돌', '갑질·괴롭힘', '금품·향응', '의사결정 투명성'] : [],
      chartValues: tpl === 'chart' ? [68 + (i % 3) * 2, 58, 52, 69].map((v) => Math.min(95, v + (i % 2))) : [],
      bgImage: pickCuratedBg(tpl, i),
      footerInsightKind: i % 2 === 0 ? 'law' : 'quote',
      footerInsight:
        i % 2 === 0
          ? `「국가공무원법」 제56조(청렴 의무) 요지: 직무 관련 사적 이익 추구 금지 등을 한 줄로 요약해 넣으세요.`
          : `이순신: "나의 나라를 위하여 싸우는 것이 나의 몫이다." — 주제와 연결해 각색 가능`,
      caseStudy:
        tpl === 'twoColumn'
          ? `「${t}」와 연결된 실무·원고 요지를 이 영역에 요약하세요.`
          : tpl === 'chart'
            ? `지표는 교육용 시각화이며, 수치 근거가 없으면 동일 값으로 표시하는 것이 안전합니다.`
            : undefined,
      style: { ...defaultSlideStyle },
    };
    return base;
  });
}

const defaultSlides: DeckSlide[] = emptyDeckFromTopic('AI 시대 공공 청렴');

function normalizeAiSlide(raw: Record<string, unknown>, idx: number): DeckSlide {
  const order: SlideTemplate[] = ['title', 'twoColumn', 'chart', 'conclusion'];
  const tpl = (raw.template as SlideTemplate) && ['title', 'twoColumn', 'chart', 'conclusion'].includes(raw.template as string)
    ? (raw.template as SlideTemplate)
    : order[idx % 4];
  const title = String(raw.title ?? '');
  const subtitle = String(raw.subtitle ?? '');
  const bullets = Array.isArray(raw.bullets) ? (raw.bullets as string[]).map(String) : [];
  const leftColumn = Array.isArray(raw.leftColumn) ? (raw.leftColumn as string[]).map(String) : [];
  const rightColumn = Array.isArray(raw.rightColumn) ? (raw.rightColumn as string[]).map(String) : [];
  let chartLabels = Array.isArray(raw.chartLabels) ? (raw.chartLabels as string[]).map(String) : [];
  let chartValues = Array.isArray(raw.chartValues) ? (raw.chartValues as number[]).map((n) => Number(n) || 0) : [];
  if (tpl === 'chart' && chartLabels.length === 0) {
    chartLabels = ['항목 1', '항목 2', '항목 3', '항목 4'];
    chartValues = [50, 50, 50, 50];
  }
  const caseStudy = raw.caseStudy != null ? String(raw.caseStudy) : undefined;
  const imageQuery = raw.imageQuery != null ? String(raw.imageQuery) : undefined;
  let footerInsight = raw.footerInsight != null ? String(raw.footerInsight).trim() : '';
  const k = raw.footerInsightKind;
  let footerInsightKind: FooterInsightKind =
    k === 'quote' || k === 'law' ? k : 'law';
  const legacyPhil = raw.philosophyNote != null ? String(raw.philosophyNote).trim() : '';
  if (!footerInsight && legacyPhil) {
    footerInsight = legacyPhil;
    footerInsightKind = 'law';
  }
  return {
    template: tpl,
    title,
    subtitle,
    bullets: bullets.length ? bullets : tpl === 'title' || tpl === 'conclusion' ? ['항목을 입력하세요'] : [],
    leftColumn: leftColumn.length ? leftColumn : [''],
    rightColumn: rightColumn.length ? rightColumn : [''],
    chartLabels,
    chartValues,
    bgImage: pickCuratedBg(tpl, idx),
    caseStudy,
    imageQuery,
    footerInsight: footerInsight || undefined,
    footerInsightKind,
    style: { ...defaultSlideStyle },
  };
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = r.result as string;
      const i = s.indexOf(',');
      resolve(i >= 0 ? s.slice(i + 1) : s);
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function mimeForFile(file: File): string {
  if (file.type) return file.type;
  if (file.name.toLowerCase().endsWith('.pdf')) return 'application/pdf';
  return 'application/octet-stream';
}

async function fetchLogoDataUrl(): Promise<string | undefined> {
  try {
    const base = import.meta.env.BASE_URL || '/';
    const res = await fetch(`${base}logo.png`);
    if (!res.ok) return undefined;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result as string);
      r.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
}

export interface ReportInsight {
  /** 실시간 분석 요약 (공공기관 보고서형 서술·개조 혼합 가능) */
  liveAnalysisSummary: string;
  /** 핵심 키워드 */
  coreKeywords: string[];
  /** 규제·제도 개선 제언 */
  regulatoryRecommendations: string[];
  /** 토론 요약 (개조식 bullet) */
  discussionBulletSummary: string[];
  /** 설문 분석 (표본·비율·유의성 등 통계적 인사이트 위주) */
  surveyStatisticalInsights: string[];
  /** 하위 호환·부가 */
  executiveSummary?: string;
  keyIssues?: string[];
  solutions?: string[];
  policyRecommendations?: string[];
  recommendedCourses?: string[];
}

const FacilitatorDashboard: React.FC = () => {
  const [step, setStep] = useState<Step>('dashboard');
  const [session, setSession] = useState<Session | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(['integrity']);
  const [selectedOrgType, setSelectedOrgType] = useState<OrgType>('public');
  const [selectedQuizPack, setSelectedQuizPack] = useState<QuizPack>('basic');
  const [topicInput, setTopicInput] = useState('');
  /** 리포트 없이 주제만으로 AI 시나리오·PPT 초안 */
  const [topicOnlyInput, setTopicOnlyInput] = useState('');
  const [aspectPreset, setAspectPreset] = useState<DeckAspect>('16:9');
  const [genLoading, setGenLoading] = useState(false);
  const [slides, setSlides] = useState<DeckSlide[]>(defaultSlides);
  const [slideIdx, setSlideIdx] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [discussionInput, setDiscussionInput] = useState('');
  const [surveyInput, setSurveyInput] = useState('');
  const [reportSummary, setReportSummary] = useState('');
  const [reportInsight, setReportInsight] = useState<ReportInsight | null>(null);
  const [insightTab, setInsightTab] = useState<'report' | 'discussion' | 'survey'>('report');
  const [reportFiles, setReportFiles] = useState<File[]>([]);
  const [weaknessScores, setWeaknessScores] = useState([
    { label: '이해충돌', value: 68 },
    { label: '갑질·괴롭힘', value: 62 },
    { label: '금품·향응', value: 55 },
    { label: '의사결정 투명성', value: 71 },
  ]);
  const qrRef = useRef<HTMLCanvasElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const slideBgInputRef = useRef<HTMLInputElement>(null);
  const bgCurateSaltRef = useRef(0);
  const [subscribed, setSubscribed] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('eca_plan') === 'standard',
  );
  const openSubscribe = () => setShowUpgradeModal(true);
  const userIntegrityIndex = useMemo(
    () => Math.round(weaknessScores.reduce((a, x) => a + x.value, 0) / weaknessScores.length),
    [weaknessScores],
  );
  const industryBenchmark = useMemo(() => Math.min(98, userIntegrityIndex + 15), [userIntegrityIndex]);

  const currentSlide = slides[slideIdx];

  const updateCurrentSlide = useCallback((patch: Partial<DeckSlide>) => {
    setSlides((prev) => {
      const next = [...prev];
      next[slideIdx] = { ...next[slideIdx], ...patch };
      return next;
    });
  }, [slideIdx]);

  const aspectBoxClass: Record<DeckAspect, string> = {
    '16:9': 'aspect-video w-full max-w-[min(100%,960px)] max-h-[min(72vh,540px)]',
    '4:5': 'aspect-[4/5] w-full max-w-[min(100%,440px)] max-h-[min(78vh,620px)]',
    '9:16': 'aspect-[9/16] w-full max-w-[min(100%,min(360px,42vw))] max-h-[min(82vh,720px)]',
    '1:1': 'aspect-square w-full max-w-[min(100%,480px)] max-h-[min(72vh,480px)]',
  };

  const deleteCurrentSlide = () => {
    if (slides.length <= 1) return;
    const idx = slideIdx;
    const next = slides.filter((_, i) => i !== idx);
    setSlides(next);
    setSlideIdx(Math.min(idx, next.length - 1));
  };

  useEffect(() => {
    if (!showQR || !session || !qrRef.current) return;
    const canvas = qrRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = 220;
    canvas.width = size;
    canvas.height = size;
    const img = new Image();
    const qrText = encodeURIComponent(`https://ethics-core-ai.vercel.app/?code=${session.code}`);
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${qrText}&bgcolor=0f172a&color=f97316&format=png`;
    img.crossOrigin = 'anonymous';
    img.onload = () => ctx.drawImage(img, 0, 0, size, size);
  }, [showQR, session]);

  const toggleCategory = (cat: Category) => {
    setSelectedCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  };

  const enterStage = () => {
    const cats: Category[] = selectedCategories.length
      ? selectedCategories
      : ['integrity', 'workshop', 'teambuilding', 'party'];
    setSession({
      id: Date.now().toString(),
      title: 'ECA 라이브 세션',
      category: cats[0],
      code: generateCode(),
    });
    setStep('lobby');
    setShowQR(true);
  };

  const startQuiz = () => {
    if (!session) return;
    const cats: Category[] = selectedCategories.length
      ? selectedCategories
      : ['integrity', 'workshop', 'teambuilding', 'party'];
    window.dispatchEvent(new CustomEvent('navigate', {
      detail: { view: 'quiz', categories: cats, code: session.code, orgType: selectedOrgType, quizPack: selectedQuizPack },
    }));
  };

  const importTextToCurrentSlide = useCallback(
    (raw: string, mode: 'bullet' | 'case' | 'title') => {
      const line = raw.replace(/^[▪•\-\d.)\s]+/u, '').trim();
      if (!line) return;
      setSlides((prev) => {
        const idx = slideIdx;
        const cur = prev[idx];
        if (!cur) return prev;
        const next = [...prev];
        if (mode === 'title') next[idx] = { ...cur, title: line };
        else if (mode === 'case') {
          const prevCase = cur.caseStudy?.trim();
          next[idx] = { ...cur, caseStudy: prevCase ? `${prevCase}\n${line}` : line };
        } else {
          const bullets = [...(cur.bullets.length ? cur.bullets : [''])];
          bullets.push(line);
          next[idx] = { ...cur, bullets };
        }
        return next;
      });
    },
    [slideIdx],
  );

  const generateSlidesFromReport = async () => {
    if (!reportInsight) return;
    const title = topicInput.trim() || 'ECA 세션';
    setGenLoading(true);
    try {
      const bundle = {
        liveAnalysisSummary: reportInsight.liveAnalysisSummary,
        coreKeywords: reportInsight.coreKeywords,
        regulatoryRecommendations: reportInsight.regulatoryRecommendations,
        discussionBulletSummary: reportInsight.discussionBulletSummary,
        surveyStatisticalInsights: reportInsight.surveyStatisticalInsights,
      };
      const prompt = `EcoStage PPT 변환기. 아래 객체는 **이미 생성·확정된 실시간 인사이트 리포트**입니다. 이 내용**만** 요약·배분하여 슬라이드 JSON 배열을 만드세요.

절대 금지:
- 리포트에 없는 새 사실·통계·법령·판례·가상 사례 생성
- 철학 잡설형 장문

슬라이드 개수: **9~11장**(목표 10장 전후).

템플릿: 첫 장 "title", 마지막 "conclusion", 중간 "twoColumn"과 "chart"를 교차.

푸터: 모든 슬라이드에서 footerInsightKind는 **반드시 "quote"**. footerInsight는 리포트 주제·키워드와 **어울리는 공직자·위인 명언 한 줄**(출처가 분명한 인용만).

세션 제목(표지 등에 활용): "${title}"

리포트:
${JSON.stringify(bundle).slice(0, 120_000)}

JSON 배열만 출력. 마크다운·코드펜스 금지.

원소 스키마:
{
  "template": "title" | "twoColumn" | "chart" | "conclusion",
  "title": string,
  "subtitle": string,
  "bullets"?: string[],
  "leftColumn"?: string[],
  "rightColumn"?: string[],
  "chartLabels"?: string[],
  "chartValues"?: number[],
  "caseStudy"?: string,
  "footerInsight": string,
  "footerInsightKind": "quote"
}

chart: 근거 없으면 chartValues 전부 50.`;
      const { text } = await geminiGenerateContent({ model: 'gemini-2.5-flash', contents: prompt });
      const matched = text.match(/\[[\s\S]*\]/);
      if (!matched) throw new Error('format');
      const parsed = JSON.parse(matched[0]) as Record<string, unknown>[];
      const normalized = parsed.slice(0, 12).map((row, i) => normalizeAiSlide(row, i));
      const enriched: DeckSlide[] = normalized.map((s, i) => ({
        ...s,
        footerInsightKind: 'quote' as const,
        bgImage: pickCuratedBg(s.template, i),
      }));
      if (enriched.length < 9) {
        const pad = emptyDeckFromTopic(title).slice(enriched.length);
        enriched.push(...pad.slice(0, 9 - enriched.length));
      }
      setSlides(enriched);
      setSlideIdx(0);
    } catch {
      setSlides(emptyDeckFromTopic(title));
      setSlideIdx(0);
    } finally {
      setGenLoading(false);
    }
  };

  const generateSlidesFromTopicScenario = async () => {
    const rawTopic = topicOnlyInput.trim() || topicInput.trim();
    if (!rawTopic) return;
    const title = topicInput.trim() || rawTopic;
    setGenLoading(true);
    try {
      const prompt = `EcoStage **주제 전용** 워크숍 설계기. 아래 주제만 주어졌습니다. 공직·조직 윤리 교육 맥락에서 **전문적인 퍼실리테이션 시나리오**(시간 배분·질문·소그룹 활동 힌트)를 담은 PPT 슬라이드 JSON 배열을 만드세요.

주제: "${rawTopic}"
세션 제목(표지·결론에 우선 사용): "${title}"

요구:
- 슬라이드 **10~12장**. 첫 장 "title", 마지막 "conclusion", 중간 "twoColumn"과 "chart"를 교차.
- **한 장**은 시나리오 타임라인(오프닝→본론→정리)을 bullet로.
- **한 장**은 퍼실리테이터용 체크리스트(진행·주의사항).
- chart: 주제와 연관된 **교육용 상대 비중**(0~100 정수, 합계 100에 가깝게). 근거 수치가 없으면 합리적 가정으로 채워도 됨(가상 통계 금지 문구는 슬라이드 본문에 넣지 말 것).
- footerInsightKind는 모두 **"quote"**. footerInsight는 공직자·위인 명언 한 줄(출처 분명한 인용만).
- 법령·판례는 일반적으로 알려진 조문명만 언급하고, 없는 판례번호를 지어내지 말 것.

JSON 배열만 출력. 마크다운·코드펜스 금지.

원소 스키마:
{
  "template": "title" | "twoColumn" | "chart" | "conclusion",
  "title": string,
  "subtitle": string,
  "bullets"?: string[],
  "leftColumn"?: string[],
  "rightColumn"?: string[],
  "chartLabels"?: string[],
  "chartValues"?: number[],
  "caseStudy"?: string,
  "footerInsight": string,
  "footerInsightKind": "quote"
}`;
      const { text } = await geminiGenerateContent({ model: 'gemini-2.5-flash', contents: prompt });
      const matched = text.match(/\[[\s\S]*\]/);
      if (!matched) throw new Error('format');
      const parsed = JSON.parse(matched[0]) as Record<string, unknown>[];
      const normalized = parsed.slice(0, 14).map((row, i) => normalizeAiSlide(row, i));
      const enriched: DeckSlide[] = normalized.map((s, i) => ({
        ...s,
        footerInsightKind: 'quote' as const,
        bgImage: pickCuratedBg(s.template, i),
      }));
      if (enriched.length < 9) {
        const pad = emptyDeckFromTopic(title).slice(enriched.length);
        enriched.push(...pad.slice(0, 9 - enriched.length));
      }
      setSlides(enriched);
      setSlideIdx(0);
      if (!topicInput.trim()) setTopicInput(title);
    } catch {
      setSlides(emptyDeckFromTopic(title));
      setSlideIdx(0);
    } finally {
      setGenLoading(false);
    }
  };

  const exportPpt = async () => {
    if (!subscribed) {
      openSubscribe();
      return;
    }
    const logoDataUrl = await fetchLogoDataUrl();
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';
    pptx.author = 'Ethics-Core AI';
    pptx.company = FOOTER_BRAND;
    pptx.title = topicInput || 'ECA Deck';

    const total = slides.length;

    slides.forEach((s, i) => {
      const slide = pptx.addSlide();
      slide.background = { color: '07122B' };
      slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 13.33, h: 7.5,
        fill: { color: '0E1A3A', transparency: 15 },
      });

      if (logoDataUrl) {
        slide.addImage({ data: logoDataUrl, x: 0.35, y: 0.25, w: 0.85, h: 0.85 });
      }

      slide.addText(FOOTER_BRAND, {
        x: 0.5, y: 6.95, w: 9, h: 0.35,
        fontSize: 9, color: '94A3B8', valign: 'middle',
      });
      slide.addText(`${i + 1} / ${total}`, {
        x: 12.1, y: 6.95, w: 1, h: 0.35,
        fontSize: 10, color: 'FDBA74', align: 'right', bold: true,
      });

      slide.addText(s.subtitle.toUpperCase(), {
        x: logoDataUrl ? 1.35 : 0.7, y: 0.35, w: 11, h: 0.35,
        fontSize: 11, color: 'FDBA74', bold: true,
      });
      slide.addText(s.title, {
        x: 0.7, y: 0.85, w: 12, h: s.template === 'title' ? 1.2 : 0.9,
        fontSize: s.template === 'title' ? 32 : 24, color: 'FFFFFF', bold: true,
      });

      const contentTop = s.template === 'title' ? 2.15 : 1.85;

      if (s.template === 'title' || s.template === 'conclusion') {
        s.bullets.filter(Boolean).forEach((b, idx) => {
          slide.addText(`• ${b}`, {
            x: 0.9, y: contentTop + idx * 0.72, w: 11.5, h: 0.65,
            fontSize: 18, color: 'E2E8F0',
          });
        });
      } else if (s.template === 'twoColumn') {
        slide.addText('현황 · 리스크', { x: 0.7, y: contentTop - 0.05, w: 5.5, h: 0.3, fontSize: 12, color: 'FB923C', bold: true });
        slide.addText('과제 · 개선', { x: 6.9, y: contentTop - 0.05, w: 5.5, h: 0.3, fontSize: 12, color: 'FB923C', bold: true });
        s.leftColumn.filter(Boolean).forEach((b, idx) => {
          slide.addText(`• ${b}`, { x: 0.75, y: contentTop + 0.35 + idx * 0.62, w: 5.9, h: 0.55, fontSize: 15, color: 'E2E8F0' });
        });
        s.rightColumn.filter(Boolean).forEach((b, idx) => {
          slide.addText(`• ${b}`, { x: 6.85, y: contentTop + 0.35 + idx * 0.62, w: 6, h: 0.55, fontSize: 15, color: 'E2E8F0' });
        });
      } else if (s.template === 'chart' && s.chartLabels.length && s.chartValues.length) {
        const chartData = [{
          name: '청렴 취약도',
          labels: s.chartLabels.slice(0, 8),
          values: s.chartValues.slice(0, 8),
        }];
        slide.addChart(pptx.ChartType.bar, chartData, {
          x: 0.9, y: contentTop, w: 11.5, h: 3.2,
          chartColors: ['F97316', 'FB923C', 'FDBA74', 'EA580C'],
          barDir: 'col',
          showTitle: false,
          showLegend: false,
          valAxisMaxVal: 100,
        });
      }
      let noteY = s.template === 'chart' ? contentTop + 3.35 : contentTop + 2.85;
      if (s.footerInsight?.trim()) {
        const tag = s.footerInsightKind === 'quote' ? '공직자 명언' : '관련 법령 한 줄';
        slide.addText(`[${tag}]\n${s.footerInsight}`, {
          x: 0.7, y: noteY, w: 12, h: 1.2,
          fontSize: 11, color: 'C4B5FD', valign: 'top',
        });
        noteY += 1.25;
      }
      if (s.caseStudy) {
        slide.addText(`[맥락·요약]\n${s.caseStudy}`, {
          x: 0.7, y: noteY, w: 12, h: 1.8,
          fontSize: 11, color: 'FDE68A', valign: 'top',
        });
      }
    });

    await pptx.writeFile({ fileName: `ECA_${(topicInput || 'scenario').replace(/\s+/g, '_')}.pptx` });
  };

  const buildLocalInsight = (rawText: string): ReportInsight => {
    const tokens = ['특혜', '청탁', '갑질', '불공정', '은폐', '불신', '침묵', '보복'];
    const found = tokens.filter((t) => rawText.includes(t));
    const k = found.length ? found.join(', ') : '이해충돌, 의사결정 불투명, 피드백 단절';
    return {
      liveAnalysisSummary: `□ 입력 자료 기반 실시간 요약\n- 취약 신호 키워드: ${k}\n- 조직 문화: 부서별 기준 편차·보고 지연 가능성\n- 교육생 고충: 보복 우려로 문제 제기 지연 가능`,
      coreKeywords: found.length ? found : ['이해충돌', '투명성', '내부통제', '신고응대'],
      regulatoryRecommendations: [
        '□ 이해충돌 사전 점검표를 인허가·조달 전 단계에 의무화하고 회의록에 이해관계자 맵 첨부',
        '□ 내부감사·민원응대 SLA 수치화 및 분기별 공개 리포트 연계',
      ],
      discussionBulletSummary: [
        '□ 토론 요지: 자료 내 반복 언급 이슈를 개조식으로 정리(상세는 입력 원문 참조)',
        '□ 합의 필요 사항: 실행 주체·기한·지표 미정 시 후속 워크숍에서 확정 권고',
      ],
      surveyStatisticalInsights: [
        '□ 설문 원문 부재 시: 표본·응답률·신뢰구간 산출 불가 — 설문 원시 응답(또는 집계표) 업로드 시 재분석 권고',
        '□ 자료 기반 키워드 빈도: 정성적 신호로만 해석(통계적 유의성 검정 미적용)',
      ],
      keyIssues: [`부패 취약 키워드/표현: ${k}`, '조직 문화: 부서별 기준 편차', '교육생 고충: 보복 우려'],
      solutions: ['사례형 반복 훈련·시뮬레이션', '관리자 체크리스트·교차검증', '익명 피드백·결정 로그 템플릿'],
      policyRecommendations: ['이해충돌 점검표 의무화', '민원응대 SLA 분기 공개'],
      recommendedCourses: ['청렴 리스크 시나리오 워크숍(8h)', '공정성 판단과 설명책임(4h)'],
    };
  };

  const parseReportJson = (text: string): ReportInsight | null => {
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      const o = JSON.parse(m[0]) as Record<string, unknown>;
      const arr = (v: unknown) => (Array.isArray(v) ? v.map(String) : []);
      const live = String(o.liveAnalysisSummary ?? o.executiveSummary ?? o.summary ?? '').trim();
      const core = arr(o.coreKeywords).length ? arr(o.coreKeywords) : arr(o.keyKeywords);
      const reg =
        arr(o.regulatoryRecommendations).length
          ? arr(o.regulatoryRecommendations)
          : arr(o.policyRecommendations).length
            ? arr(o.policyRecommendations)
            : arr(o.policy);
      const disc = arr(o.discussionBulletSummary).length ? arr(o.discussionBulletSummary) : arr(o.discussionSummary);
      const surv = arr(o.surveyStatisticalInsights).length ? arr(o.surveyStatisticalInsights) : arr(o.surveyAnalysis);
      if (!live && !core.length && !reg.length) return null;
      return {
        liveAnalysisSummary: live || '□ 분석 요약 생성 실패 — 원문을 확인하세요.',
        coreKeywords: core.length ? core : arr(o.keyIssues).slice(0, 8),
        regulatoryRecommendations: reg.length ? reg : ['□ 규제·제도 개선안: 자료 재검토 후 구체화 필요'],
        discussionBulletSummary: disc.length ? disc : ['□ 토론 요약: 입력된 토론 텍스트에서 핵심만 추출해 재작성하세요.'],
        surveyStatisticalInsights: surv.length
          ? surv
          : ['□ 설문: 원시 응답 또는 집계표가 있으면 표본·비율·유의성 해석을 추가하세요.'],
        executiveSummary: String(o.executiveSummary ?? ''),
        keyIssues: arr(o.keyIssues).length ? arr(o.keyIssues) : arr(o.coreIssues),
        solutions: arr(o.solutions),
        policyRecommendations: arr(o.policyRecommendations).length ? arr(o.policyRecommendations) : arr(o.policy),
        recommendedCourses: arr(o.recommendedCourses).length ? arr(o.recommendedCourses) : arr(o.courses),
      };
    } catch {
      return null;
    }
  };

  const generateInsightReport = async () => {
    setReportLoading(true);
    const rawText = `${discussionInput}\n${surveyInput}`.trim();
    try {
      setWeaknessScores((prev) => prev.map((v) => ({
        ...v,
        value: Math.max(35, Math.min(90, v.value + Math.floor(Math.random() * 11) - 5)),
      })));

      const MAX_FILES = 6;
      const MAX_BYTES = 4 * 1024 * 1024;
      const files = reportFiles.slice(0, MAX_FILES);

      if (!rawText && files.length === 0) {
        setReportInsight(null);
        setReportSummary('토론·설문 텍스트 또는 이미지/PDF 파일을 업로드한 뒤 다시 생성해 주세요.');
        return;
      }

      const wireParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
      const intro =
        `당신은 공공기관·교육기관용 실시간 분석 보고서 작성자입니다. 첨부·입력을 반영하여 **JSON 한 개만** 출력하세요. 마크다운·코드펜스 금지.\n` +
        `반드시 포함할 키:\n` +
        `{\n` +
        `  "liveAnalysisSummary": "실시간 분석 요약 — 개조식(□·-)과 짧은 문단 혼용, 공공 보고서 톤",\n` +
        `  "coreKeywords": ["핵심 키워드 5~12개"],\n` +
        `  "regulatoryRecommendations": ["규제·제도·운영 개선 제언 개조식 bullet 4~8개"],\n` +
        `  "discussionBulletSummary": ["토론 요약 개조식 4~10개 — 입력 토론이 없으면 자료 전반 논점으로 대체"],\n` +
        `  "surveyStatisticalInsights": ["설문 분석 bullet 3~8개 — 응답률·비율·항목 간 비교·해석 시 주의사항·가능하면 유의성 언급; 설문 원문 없으면 한계 명시"],\n` +
        `  "solutions": ["실행 과제 (선택)"],\n` +
        `  "recommendedCourses": ["추천 교육 (선택)"]\n` +
        `}\n` +
        `철학적 잡설·형이상학적 논지는 금지. 사실 기반·보수적 표현.\n\n`;
      wireParts.push({ text: intro });
      if (rawText) wireParts.push({ text: `[직접 입력: 토론·설문 메모 통합]\n${rawText}` });

      for (const f of files) {
        if (f.size > MAX_BYTES) {
          wireParts.push({ text: `(파일 ${f.name}: 용량 초과로 건너뜀 — 4MB 이하만 분석)` });
          continue;
        }
        const lower = f.name.toLowerCase();
        if (lower.endsWith('.txt') || lower.endsWith('.md') || lower.endsWith('.markdown')) {
          try {
            const t = await f.text();
            wireParts.push({ text: `[첨부 텍스트 파일: ${f.name}]\n${t.slice(0, 100_000)}` });
          } catch {
            wireParts.push({ text: `(파일 ${f.name}: 텍스트 읽기 실패)` });
          }
          continue;
        }
        const b64 = await fileToBase64(f);
        const mime = mimeForFile(f);
        if (mime.startsWith('image/') || mime === 'application/pdf') {
          wireParts.push({ inlineData: { mimeType: mime, data: b64 } });
          wireParts.push({ text: `(위 첨부 파일명: ${f.name})` });
        } else {
          wireParts.push({ text: `(미지원 형식 건너뜀: ${f.name})` });
        }
      }

      const { text } = await geminiGenerateContent({
        model: 'gemini-2.5-flash',
        useParts: true,
        parts: wireParts,
      });
      const parsed = parseReportJson(text);
      if (parsed && (parsed.liveAnalysisSummary.trim() || parsed.coreKeywords.length)) {
        setReportInsight(parsed);
        setReportSummary('');
      } else {
        const local = buildLocalInsight(rawText);
        setReportInsight(local);
        setReportSummary(text.trim() || '');
      }
    } catch {
      const local = buildLocalInsight(rawText);
      setReportInsight(local);
      setReportSummary('');
    } finally {
      setReportLoading(false);
    }
  };

  const downloadReportImage = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { backgroundColor: '#07122b', scale: 2 });
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ECA_Insight_Report.png';
    a.click();
  };

  const downloadReportPdf = async () => {
    if (!subscribed) {
      openSubscribe();
      return;
    }
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { backgroundColor: '#07122b', scale: 2 });
    const img = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const w = 190;
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(img, 'PNG', 10, 10, w, h);
    pdf.save('ECA_Insight_Report.pdf');
  };

  const onReportFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    setReportFiles((prev) => [...prev, ...list].slice(0, 8));
    e.target.value = '';
  };

  const removeReportFile = (idx: number) => {
    setReportFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const categoriesSummary = useMemo(
    () => (selectedCategories.length ? selectedCategories.join(' · ') : '전체 카테고리'),
    [selectedCategories],
  );

  const renderSlidePreview = () => {
    const s = currentSlide;
    const st = { ...defaultSlideStyle, ...s.style };
    const alignClass = st.textAlign === 'center' ? 'text-center' : 'text-left';
    const fc = `w-full rounded-lg bg-black/30 border border-white/15 text-slate-100 ${alignClass} focus:border-orange-400/55 outline-none ring-0 placeholder:text-slate-500`;
    const scale = aspectPreset === '16:9' ? 1 : aspectPreset === '4:5' ? 0.9 : aspectPreset === '1:1' ? 0.86 : 0.8;
    const titlePx = Math.max(15, Math.round(Math.min(42, st.titleFontPx * scale)));
    const bodyPx = Math.max(11, Math.round(st.bodyFontPx * scale));
    const twoColGrid = aspectPreset === '16:9' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4' : 'grid grid-cols-1 gap-2.5';

    const bulletsForEdit = s.bullets.length ? s.bullets : [''];
    const patchBullet = (i: number, v: string) => {
      const next = bulletsForEdit.map((b, j) => (j === i ? v : b));
      updateCurrentSlide({ bullets: next });
    };
    const leftRows = s.leftColumn.length ? s.leftColumn : [''];
    const rightRows = s.rightColumn.length ? s.rightColumn : [''];
    const patchLeft = (i: number, v: string) =>
      updateCurrentSlide({ leftColumn: leftRows.map((b, j) => (j === i ? v : b)) });
    const patchRight = (i: number, v: string) =>
      updateCurrentSlide({ rightColumn: rightRows.map((b, j) => (j === i ? v : b)) });
    const patchChartLabel = (i: number, v: string) => {
      const labels = [...s.chartLabels];
      labels[i] = v;
      updateCurrentSlide({ chartLabels: labels });
    };
    const patchChartValue = (i: number, v: number) => {
      const vals = [...s.chartValues];
      vals[i] = v;
      updateCurrentSlide({ chartValues: vals });
    };

    const footerKind = s.footerInsightKind ?? 'law';
    const footerTitle = footerKind === 'law' ? '관련 법령 한 줄' : '공직자 명언';

    return (
      <div className={`relative z-10 flex flex-col min-h-0 gap-2 ${alignClass}`}>
        <div className="flex flex-wrap items-center gap-2 mb-1 text-left">
          <span className="text-[10px] font-mono uppercase tracking-wider text-orange-300/90 shrink-0">{s.template}</span>
          <input
            value={s.subtitle}
            onChange={(e) => updateCurrentSlide({ subtitle: e.target.value })}
            className={`${fc} flex-1 min-w-0 text-[10px] sm:text-xs py-1`}
            placeholder="부제 / 라벨"
          />
        </div>
        <textarea
          value={s.title}
          onChange={(e) => updateCurrentSlide({ title: e.target.value })}
          rows={aspectPreset === '9:16' ? 2 : 3}
          className={`${fc} font-black leading-tight break-keep resize-none`}
          style={{ color: st.titleColor, fontSize: `${titlePx}px`, minHeight: '2.5em' }}
          placeholder="슬라이드 제목"
        />
        {s.template === 'title' || s.template === 'conclusion' ? (
          <ul className={`space-y-1.5 ${alignClass === 'text-center' ? 'items-center' : ''}`}>
            {bulletsForEdit.map((b, i) => (
              <li key={i} className="flex gap-2 items-start">
                <span className="text-orange-300 shrink-0 pt-1" style={{ fontSize: `${bodyPx}px` }}>•</span>
                <input
                  value={b}
                  onChange={(e) => patchBullet(i, e.target.value)}
                  className={`${fc} flex-1 leading-relaxed`}
                  style={{ color: st.bodyColor, fontSize: `${bodyPx}px` }}
                />
                {bulletsForEdit.length > 1 ? (
                  <button
                    type="button"
                    className="text-slate-500 hover:text-red-300 text-[10px] shrink-0 pt-1"
                    onClick={() => updateCurrentSlide({ bullets: bulletsForEdit.filter((_, j) => j !== i) })}
                  >
                    삭제
                  </button>
                ) : null}
              </li>
            ))}
            <li>
              <button
                type="button"
                className="text-[10px] font-bold text-orange-300/80 hover:text-orange-200"
                onClick={() => updateCurrentSlide({ bullets: [...bulletsForEdit, ''] })}
              >
                + 불릿 추가
              </button>
            </li>
          </ul>
        ) : null}
        {s.template === 'twoColumn' ? (
          <div className={twoColGrid}>
            <div className="rounded-xl border border-orange-300/25 bg-black/25 p-3 backdrop-blur-sm min-w-0">
              <p className="text-orange-300 text-[11px] font-bold mb-2">현황 · 리스크</p>
              <ul className="space-y-1.5">
                {leftRows.map((b, i) => (
                  <li key={i} className="flex gap-1 items-start">
                    <span className="text-orange-300/80 shrink-0 text-[10px] pt-1">•</span>
                    <input
                      value={b}
                      onChange={(e) => patchLeft(i, e.target.value)}
                      className={`${fc} flex-1 text-xs leading-snug`}
                      style={{ color: st.bodyColor, fontSize: `${bodyPx}px` }}
                    />
                    {leftRows.length > 1 ? (
                      <button type="button" className="text-[9px] text-slate-500 hover:text-red-300 shrink-0" onClick={() => updateCurrentSlide({ leftColumn: leftRows.filter((_, j) => j !== i) })}>×</button>
                    ) : null}
                  </li>
                ))}
                <li>
                  <button type="button" className="text-[10px] text-orange-300/80 font-bold" onClick={() => updateCurrentSlide({ leftColumn: [...leftRows, ''] })}>+ 행</button>
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-orange-300/25 bg-black/25 p-3 backdrop-blur-sm min-w-0">
              <p className="text-orange-300 text-[11px] font-bold mb-2">과제 · 개선</p>
              <ul className="space-y-1.5">
                {rightRows.map((b, i) => (
                  <li key={i} className="flex gap-1 items-start">
                    <span className="text-orange-300/80 shrink-0 text-[10px] pt-1">•</span>
                    <input
                      value={b}
                      onChange={(e) => patchRight(i, e.target.value)}
                      className={`${fc} flex-1 text-xs leading-snug`}
                      style={{ color: st.bodyColor, fontSize: `${bodyPx}px` }}
                    />
                    {rightRows.length > 1 ? (
                      <button type="button" className="text-[9px] text-slate-500 hover:text-red-300 shrink-0" onClick={() => updateCurrentSlide({ rightColumn: rightRows.filter((_, j) => j !== i) })}>×</button>
                    ) : null}
                  </li>
                ))}
                <li>
                  <button type="button" className="text-[10px] text-orange-300/80 font-bold" onClick={() => updateCurrentSlide({ rightColumn: [...rightRows, ''] })}>+ 행</button>
                </li>
              </ul>
            </div>
          </div>
        ) : null}
        {s.template === 'chart' ? (
          <div className="space-y-2 mt-1">
            {s.chartLabels.map((label, i) => {
              const v = s.chartValues[i] ?? 0;
              return (
                <div key={i} className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <input
                      value={label}
                      onChange={(e) => patchChartLabel(i, e.target.value)}
                      className={`${fc} flex-1 min-w-0 text-xs py-0.5`}
                    />
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={v}
                      onChange={(e) => patchChartValue(i, Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                      className="w-14 rounded bg-black/40 border border-white/15 text-orange-200 text-xs font-mono px-1 py-0.5 text-center"
                    />
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-amber-300 rounded-full transition-all" style={{ width: `${Math.min(100, v)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
        <div className="mt-2 rounded-xl border border-violet-400/30 bg-violet-950/20 p-2.5 text-left space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-violet-200 text-[10px] font-bold uppercase tracking-wider">{footerTitle}</span>
            <select
              value={footerKind}
              onChange={(e) => updateCurrentSlide({ footerInsightKind: e.target.value as FooterInsightKind })}
              className="text-[10px] rounded bg-black/40 border border-white/20 text-slate-200 py-0.5 px-1"
            >
              <option value="law">법령 한 줄</option>
              <option value="quote">공직자 명언</option>
            </select>
          </div>
          <textarea
            value={s.footerInsight ?? ''}
            onChange={(e) => updateCurrentSlide({ footerInsight: e.target.value })}
            rows={aspectPreset === '9:16' ? 2 : 3}
            className={`${fc} text-xs leading-relaxed resize-none min-h-[3rem]`}
            placeholder={footerKind === 'law' ? '예: 국가공무원법 제56조 — 청렴 의무 요지' : '예: 인용할 명언 한 줄'}
          />
        </div>
        <div className="rounded-xl border border-amber-400/25 bg-amber-950/15 p-2.5 text-left">
          <p className="text-amber-200 text-[10px] font-bold uppercase tracking-wider mb-1">맥락 · 요약 (선택)</p>
          <textarea
            value={s.caseStudy ?? ''}
            onChange={(e) => updateCurrentSlide({ caseStudy: e.target.value })}
            rows={aspectPreset === '9:16' ? 2 : 3}
            className={`${fc} text-xs leading-relaxed resize-none`}
            placeholder="슬라이드 보조 설명"
          />
        </div>
        <div className="mt-auto pt-3 flex justify-between text-[9px] text-slate-500 border-t border-white/10 gap-2">
          <span className="truncate">{FOOTER_BRAND}</span>
          <span className="text-orange-300/80 font-mono shrink-0">{slideIdx + 1} / {slides.length}</span>
        </div>
      </div>
    );
  };

  return (
    <section className="relative z-10 py-14 px-4 w-full max-w-[1400px] mx-auto min-h-screen">
      <div className="mb-7">
        <button
          onClick={step === 'dashboard' ? () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' })) : () => setStep('dashboard')}
          className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {step === 'dashboard' ? '이전 화면으로' : '대시보드로'}
        </button>
      </div>

      {step === 'dashboard' && (
        <div className="space-y-7">
          <div className="rounded-3xl border border-orange-300/25 bg-gradient-to-br from-[#07122b] to-[#1a1033] p-6">
            <h2 className="text-3xl md:text-4xl font-black text-white">청렴 퀴즈/슬라이드 시작</h2>
            <p className="text-slate-300 mt-1">복잡한 단계 없이 즉시 입장 코드를 생성합니다.</p>
            <div className="grid md:grid-cols-2 gap-4 mt-5">
              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-200">카테고리</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['integrity', 'workshop', 'teambuilding', 'party'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => toggleCategory(c)}
                      className={`px-3 py-2 rounded-xl text-xs border font-bold ${
                        selectedCategories.includes(c)
                          ? 'bg-orange-500/20 border-orange-300 text-orange-100'
                          : 'bg-slate-900/60 border-slate-700 text-slate-400'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-200">기관/문항군</p>
                <div className="flex gap-2 flex-wrap">
                  {(['public', 'local', 'enterprise'] as const).map((x) => (
                    <button
                      key={x}
                      onClick={() => setSelectedOrgType(x)}
                      className={`px-3 py-2 rounded-xl text-xs border ${
                        selectedOrgType === x ? 'bg-orange-500/20 border-orange-300 text-orange-100' : 'border-slate-700 text-slate-400'
                      }`}
                    >
                      {x}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(['basic', 'advanced', 'case'] as const).map((x) => (
                    <button
                      key={x}
                      onClick={() => setSelectedQuizPack(x)}
                      className={`px-3 py-2 rounded-xl text-xs border ${
                        selectedQuizPack === x ? 'bg-orange-500/20 border-orange-300 text-orange-100' : 'border-slate-700 text-slate-400'
                      }`}
                    >
                      {x}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={enterStage}
              className="mt-5 w-full py-4 rounded-2xl font-black bg-gradient-to-r from-[#f97316] to-[#fb923c] text-white"
            >
              ECA 스테이지 입장
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 items-start">
            <div
              ref={reportRef}
              className="rounded-3xl border border-cyan-300/30 bg-gradient-to-br from-[#06121f] to-[#101a2e] p-5 lg:p-6 space-y-4"
            >
              <h3 className="text-white text-xl lg:text-2xl font-black">실시간 인사이트 리포트 (Text)</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                이미지·PDF·텍스트 파일을 올리고 토론·설문 메모를 입력한 뒤 <span className="text-cyan-200 font-bold">리포트 생성</span>을 실행하세요.
                PPT는 오른쪽에서 리포트 확정 후에만 생성합니다.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf,.txt,.md,.markdown,text/plain"
                multiple
                className="hidden"
                onChange={onReportFiles}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 rounded-xl border border-dashed border-cyan-400/45 text-cyan-100 text-sm font-bold hover:bg-cyan-500/10"
              >
                분석 파일 업로드 (이미지·PDF·txt·md)
              </button>
              {reportFiles.length > 0 && (
                <ul className="space-y-1 max-h-24 overflow-y-auto text-xs text-slate-300">
                  {reportFiles.map((f, i) => (
                    <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2 bg-[#0b1734]/80 rounded-lg px-2 py-1">
                      <span className="truncate">{f.name}</span>
                      <button type="button" onClick={() => removeReportFile(i)} className="text-red-400 p-1 shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 mb-1">토론 입력 (원문)</p>
                  <textarea
                    value={discussionInput}
                    onChange={(e) => setDiscussionInput(e.target.value)}
                    rows={5}
                    placeholder="토론 로그·메모"
                    className="w-full rounded-xl bg-[#111d3d]/70 border border-cyan-500/25 p-3 text-slate-100 text-xs placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 mb-1">설문 입력 (원문)</p>
                  <textarea
                    value={surveyInput}
                    onChange={(e) => setSurveyInput(e.target.value)}
                    rows={5}
                    placeholder="설문 문항·응답 메모"
                    className="w-full rounded-xl bg-[#111d3d]/70 border border-cyan-500/25 p-3 text-slate-100 text-xs placeholder:text-slate-500"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={generateInsightReport}
                disabled={reportLoading}
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 text-white disabled:opacity-50"
              >
                {reportLoading ? '분석 중…' : '인사이트 리포트 생성'}
              </button>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {weaknessScores.map((x) => (
                  <div key={x.label} className="rounded-lg border border-cyan-500/20 bg-[#0b1734]/70 p-2">
                    <p className="text-[10px] text-cyan-200 truncate">{x.label}</p>
                    <p className="text-lg font-black text-white">{x.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="rounded-xl border border-orange-300/25 bg-[#0a1630]/80 p-3 h-[200px]">
                  <p className="text-orange-200 text-[10px] font-bold uppercase mb-1">취약도 (Bar)</p>
                  <Bar
                    data={{
                      labels: weaknessScores.map((x) => x.label),
                      datasets: [{ label: '지수', data: weaknessScores.map((x) => x.value), backgroundColor: 'rgba(249,115,22,0.75)', borderRadius: 6 }],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { ticks: { color: '#94a3b8', maxRotation: 45, font: { size: 9 } }, grid: { color: 'rgba(148,163,184,0.12)' } },
                        y: { min: 0, max: 100, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.12)' } },
                      },
                    }}
                  />
                </div>
                <div className="rounded-xl border border-cyan-500/25 bg-[#0a1630]/80 p-3 h-[200px]">
                  <p className="text-cyan-200 text-[10px] font-bold uppercase mb-1">프로파일 (Radar)</p>
                  <Radar
                    data={{
                      labels: weaknessScores.map((x) => x.label),
                      datasets: [
                        {
                          label: '프로파일',
                          data: weaknessScores.map((x) => x.value),
                          backgroundColor: 'rgba(34,211,238,0.2)',
                          borderColor: 'rgba(34,211,238,0.95)',
                          borderWidth: 2,
                          pointBackgroundColor: 'rgba(249,115,22,0.9)',
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        r: {
                          min: 0,
                          max: 100,
                          ticks: { color: '#64748b', backdropColor: 'transparent' },
                          grid: { color: 'rgba(148,163,184,0.2)' },
                          angleLines: { color: 'rgba(148,163,184,0.2)' },
                          pointLabels: { color: '#e2e8f0', font: { size: 9 } },
                        },
                      },
                    }}
                  />
                </div>
              </div>
              <div className="rounded-xl border border-amber-400/30 bg-gradient-to-r from-amber-950/30 to-orange-950/20 p-3">
                <p className="text-amber-200 text-[10px] font-black uppercase flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" /> 벤치마크
                </p>
                <p className="text-white text-sm font-black mt-1">
                  청렴 지수 <span className="text-orange-300">{userIntegrityIndex}</span>
                  <span className="text-slate-400 text-xs font-bold"> vs 참고 {industryBenchmark}</span>
                </p>
              </div>
              {reportInsight ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1 border-b border-white/10 pb-2">
                    {(['report', 'discussion', 'survey'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setInsightTab(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                          insightTab === t ? 'bg-cyan-500/25 text-cyan-100 border border-cyan-400/40' : 'text-slate-400 border border-transparent'
                        }`}
                      >
                        {t === 'report' ? '요약·키워드·규제' : t === 'discussion' ? '토론 요약' : '설문 분석'}
                      </button>
                    ))}
                  </div>
                  {insightTab === 'report' && (
                    <div className="space-y-3 text-sm">
                      <div className="rounded-xl border border-orange-300/25 bg-[#0a1630]/70 p-3">
                        <p className="text-orange-200 text-[10px] font-bold uppercase mb-1">실시간 분석 요약</p>
                        <p className="text-slate-100 whitespace-pre-line leading-relaxed text-xs">{reportInsight.liveAnalysisSummary}</p>
                      </div>
                      <div className="rounded-xl border border-violet-400/25 bg-[#0c1528]/70 p-3">
                        <p className="text-violet-200 text-[10px] font-bold uppercase mb-2">핵심 키워드</p>
                        <div className="flex flex-wrap gap-1.5">
                          {reportInsight.coreKeywords.map((k, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-100 text-xs border border-violet-400/30">
                              {k}
                              <button
                                type="button"
                                className="text-[9px] text-violet-200 hover:text-white underline"
                                onClick={() => importTextToCurrentSlide(k, 'bullet')}
                              >
                                →슬라이드
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-xl border border-emerald-400/25 bg-[#0f1a14]/60 p-3">
                        <p className="text-emerald-200 text-[10px] font-bold uppercase mb-1">규제 개선 제언</p>
                        <ul className="space-y-1.5 text-slate-100 text-xs">
                          {reportInsight.regulatoryRecommendations.map((t, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-emerald-400 shrink-0">□</span>
                              <span>{t.replace(/^[▪□•\-\s]+/, '')}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {(reportInsight.solutions?.length ?? 0) > 0 && (
                        <div className="rounded-xl border border-slate-600/40 bg-black/20 p-3 text-xs text-slate-300">
                          <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">실행 과제 (부가)</p>
                          <ul className="list-disc pl-4 space-y-0.5">
                            {(reportInsight.solutions ?? []).map((t, i) => (
                              <li key={i}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  {insightTab === 'discussion' && (
                    <div className="rounded-xl border border-orange-300/20 bg-[#0a1228]/80 p-3 space-y-2 max-h-[280px] overflow-y-auto">
                      <p className="text-orange-200 text-[10px] font-bold uppercase">토론 요약 (개조식 · AI 생성)</p>
                      {reportInsight.discussionBulletSummary.map((line, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-2 border-b border-white/5 pb-2">
                          <p className="text-slate-100 text-xs flex-1 leading-relaxed">{line}</p>
                          <div className="flex flex-wrap gap-1 shrink-0">
                            <button type="button" className="text-[10px] px-2 py-0.5 rounded bg-white/10 hover:bg-orange-500/30 text-orange-100" onClick={() => importTextToCurrentSlide(line, 'bullet')}>→ 불릿</button>
                            <button type="button" className="text-[10px] px-2 py-0.5 rounded bg-white/10 hover:bg-amber-500/30 text-amber-100" onClick={() => importTextToCurrentSlide(line, 'case')}>→ 맥락</button>
                            <button type="button" className="text-[10px] px-2 py-0.5 rounded bg-white/10 hover:bg-cyan-500/30 text-cyan-100" onClick={() => importTextToCurrentSlide(line, 'title')}>→ 제목</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {insightTab === 'survey' && (
                    <div className="rounded-xl border border-cyan-400/25 bg-[#0c1528]/70 p-3 space-y-2 max-h-[280px] overflow-y-auto">
                      <p className="text-cyan-200 text-[10px] font-bold uppercase">설문 분석 (통계·유의성 인사이트)</p>
                      {reportInsight.surveyStatisticalInsights.map((line, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-2 border-b border-white/5 pb-2">
                          <p className="text-slate-100 text-xs flex-1 leading-relaxed">{line}</p>
                          <div className="flex flex-wrap gap-1 shrink-0">
                            <button type="button" className="text-[10px] px-2 py-0.5 rounded bg-white/10 hover:bg-orange-500/30 text-orange-100" onClick={() => importTextToCurrentSlide(line, 'bullet')}>→ 불릿</button>
                            <button type="button" className="text-[10px] px-2 py-0.5 rounded bg-white/10 hover:bg-amber-500/30 text-amber-100" onClick={() => importTextToCurrentSlide(line, 'case')}>→ 맥락</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-cyan-500/20 bg-[#0a1630]/60 p-3">
                  <p className="text-cyan-200/80 text-[10px] font-bold uppercase mb-1">분석 메모</p>
                  <p className="text-slate-300 text-xs whitespace-pre-line leading-relaxed">
                    {reportSummary || '리포트 생성 후 요약·키워드·규제 제언·토론/설문 탭이 채워집니다.'}
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <button type="button" onClick={downloadReportPdf} className="flex-1 py-2.5 rounded-xl border border-cyan-400/35 text-cyan-100 text-xs font-bold">
                  PDF {subscribed ? '' : '(구독)'}
                </button>
                <button type="button" onClick={downloadReportImage} className="flex-1 py-2.5 rounded-xl border border-cyan-400/35 text-cyan-100 text-xs font-bold">
                  이미지
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-orange-300/30 bg-gradient-to-br from-[#070f24] to-[#1a1035] overflow-hidden">
            <div className="px-6 py-4 border-b border-orange-300/20 flex flex-col gap-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-orange-300 text-xs tracking-widest uppercase font-bold">PPT Studio · 리포트 연동</p>
                  <h3 className="text-white text-2xl font-black">인사이트 기반 슬라이드 · 인라인 편집</h3>
                </div>
                <div className="text-sm text-slate-300 font-mono">
                  {slideIdx + 1} / {slides.length}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">캔버스 비율</span>
                {(['16:9', '4:5', '9:16', '1:1'] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAspectPreset(a)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      aspectPreset === a
                        ? 'bg-orange-500/25 border-orange-300 text-orange-100'
                        : 'border-slate-600 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <input
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    placeholder="세션 제목 (표지·결론 슬라이드에 사용)"
                    className="flex-1 min-w-[200px] px-4 py-3 rounded-xl bg-[#111d3d]/70 border border-orange-300/30 text-white placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={generateSlidesFromReport}
                    disabled={genLoading || !reportInsight}
                    className="px-4 py-3 rounded-xl bg-gradient-to-r from-[#f97316] to-[#fb923c] font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed"
                    title={!reportInsight ? '먼저 왼쪽에서 인사이트 리포트를 생성하세요.' : ''}
                  >
                    {genLoading ? 'PPT 생성 중…' : 'PPT 생성 (리포트 기반)'}
                  </button>
                </div>
                <div className="rounded-xl border border-cyan-500/25 bg-[#0a1228]/50 p-4 space-y-3">
                  <p className="text-[11px] text-cyan-200/90 font-bold uppercase tracking-wide">
                    주제만으로 시나리오 + PPT
                  </p>
                  <textarea
                    value={topicOnlyInput}
                    onChange={(e) => setTopicOnlyInput(e.target.value)}
                    placeholder="예) 공무원 이해충돌 사례 기반 토론 세션, 조직 내 심리적 안전감 워크숍"
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-[#111d3d]/70 border border-cyan-400/25 text-white text-sm placeholder:text-slate-500 resize-y min-h-[72px]"
                  />
                  <button
                    type="button"
                    onClick={generateSlidesFromTopicScenario}
                    disabled={genLoading || (!topicOnlyInput.trim() && !topicInput.trim())}
                    className="w-full sm:w-auto px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                    title={!topicOnlyInput.trim() && !topicInput.trim() ? '주제 입력란 또는 위 세션 제목 중 하나를 입력하세요.' : ''}
                  >
                    {genLoading ? '생성 중…' : 'AI 시나리오 + PPT (주제)'}
                  </button>
                </div>
                <input
                  ref={slideBgInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = '';
                    if (!f?.type.startsWith('image/')) return;
                    updateCurrentSlide({ bgImage: URL.createObjectURL(f) });
                  }}
                />

                <div className="flex flex-wrap items-end gap-2 rounded-xl border border-orange-300/15 bg-[#0a1228]/60 p-3">
                  <div className="flex-1 min-w-[140px]">
                    <label className="text-[10px] text-slate-500 block mb-0.5">템플릿</label>
                    <select
                      value={currentSlide.template}
                      onChange={(e) => {
                        const tpl = e.target.value as SlideTemplate;
                        updateCurrentSlide({ template: tpl, bgImage: pickCuratedBg(tpl, slideIdx) });
                      }}
                      className="w-full rounded-lg bg-[#111d3d] border border-orange-300/30 text-white text-sm py-2 px-2"
                    >
                      <option value="title">타이틀</option>
                      <option value="twoColumn">투 컬럼</option>
                      <option value="chart">차트</option>
                      <option value="conclusion">결론</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={deleteCurrentSlide}
                    disabled={slides.length <= 1}
                    className="shrink-0 px-3 py-2 rounded-lg border border-red-500/40 text-red-300 text-xs font-bold disabled:opacity-40 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> 슬라이드 삭제
                  </button>
                  <button
                    type="button"
                    onClick={() => slideBgInputRef.current?.click()}
                    className="shrink-0 px-3 py-2 rounded-lg border border-orange-300/40 text-orange-100 text-xs font-bold inline-flex items-center gap-1"
                  >
                    <ImagePlus className="w-3.5 h-3.5" /> 배경
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      bgCurateSaltRef.current += 1;
                      updateCurrentSlide({
                        bgImage: pickCuratedBg(
                          currentSlide.template,
                          slideIdx + bgCurateSaltRef.current * 7,
                        ),
                      });
                    }}
                    className="shrink-0 px-3 py-2 rounded-lg border border-orange-300/50 text-orange-100 text-xs font-bold hover:bg-orange-500/15 transition-colors"
                    title="템플릿별 큐레이션 배경을 순서대로 바꿉니다."
                  >
                    배경 큐레이션
                  </button>
                  <details className="flex-1 min-w-[200px] border border-white/10 rounded-lg bg-black/25 px-2 py-1">
                    <summary className="text-[11px] text-orange-200 cursor-pointer font-bold list-none [&::-webkit-details-marker]:hidden">
                      타이포 · 배경 URL
                    </summary>
                    <div className="mt-2 space-y-2 pb-2 border-t border-white/10 pt-2">
                      <label className="text-[10px] text-slate-500">배경 URL</label>
                      <input
                        value={currentSlide.bgImage}
                        onChange={(e) => updateCurrentSlide({ bgImage: e.target.value })}
                        className="w-full rounded-lg bg-[#111d3d] border border-orange-300/30 text-white text-xs py-1.5 px-2 font-mono"
                        placeholder="https://..."
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-500">제목(px)</span>
                          <input
                            type="number"
                            min={24}
                            max={64}
                            value={currentSlide.style?.titleFontPx ?? defaultSlideStyle.titleFontPx}
                            onChange={(e) =>
                              updateCurrentSlide({
                                style: { ...defaultSlideStyle, ...currentSlide.style, titleFontPx: Number(e.target.value) || 40 },
                              })
                            }
                            className="w-full rounded-lg bg-[#111d3d] border border-orange-300/30 text-white text-sm py-1 px-2"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500">본문(px)</span>
                          <input
                            type="number"
                            min={12}
                            max={28}
                            value={currentSlide.style?.bodyFontPx ?? defaultSlideStyle.bodyFontPx}
                            onChange={(e) =>
                              updateCurrentSlide({
                                style: { ...defaultSlideStyle, ...currentSlide.style, bodyFontPx: Number(e.target.value) || 17 },
                              })
                            }
                            className="w-full rounded-lg bg-[#111d3d] border border-orange-300/30 text-white text-sm py-1 px-2"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-500">제목색</span>
                          <input
                            type="color"
                            value={currentSlide.style?.titleColor ?? defaultSlideStyle.titleColor}
                            onChange={(e) =>
                              updateCurrentSlide({
                                style: { ...defaultSlideStyle, ...currentSlide.style, titleColor: e.target.value },
                              })
                            }
                            className="w-full h-8 rounded-lg border border-orange-300/30 bg-[#111d3d] cursor-pointer"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500">본문색</span>
                          <input
                            type="color"
                            value={currentSlide.style?.bodyColor ?? defaultSlideStyle.bodyColor}
                            onChange={(e) =>
                              updateCurrentSlide({
                                style: { ...defaultSlideStyle, ...currentSlide.style, bodyColor: e.target.value },
                              })
                            }
                            className="w-full h-8 rounded-lg border border-orange-300/30 bg-[#111d3d] cursor-pointer"
                          />
                        </div>
                      </div>
                      <label className="text-[10px] text-slate-500">정렬</label>
                      <select
                        value={currentSlide.style?.textAlign ?? defaultSlideStyle.textAlign}
                        onChange={(e) =>
                          updateCurrentSlide({
                            style: {
                              ...defaultSlideStyle,
                              ...currentSlide.style,
                              textAlign: e.target.value as 'left' | 'center',
                            },
                          })
                        }
                        className="w-full rounded-lg bg-[#111d3d] border border-orange-300/30 text-white text-sm py-1.5 px-2"
                      >
                        <option value="left">좌측</option>
                        <option value="center">중앙</option>
                      </select>
                    </div>
                  </details>
                </div>

                <div className="flex justify-center w-full">
                  <div className={`relative mx-auto rounded-2xl border border-orange-300/30 overflow-hidden shadow-lg ${aspectBoxClass[aspectPreset]}`}>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${slideIdx}-${currentSlide.template}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="absolute inset-0 flex flex-col min-h-0"
                      >
                        <div
                          className="absolute inset-0 bg-cover bg-center opacity-[0.38]"
                          style={{ backgroundImage: `url(${currentSlide.bgImage})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-[#06112a]/88 via-[#0b1738]/85 to-[#2a1237]/86" />
                        <div
                          className={`relative z-10 flex-1 min-h-0 overflow-y-auto overflow-x-hidden ${
                            aspectPreset === '9:16' || aspectPreset === '1:1' ? 'p-3 sm:p-4' : aspectPreset === '4:5' ? 'p-4 sm:p-5' : 'p-5 sm:p-7'
                          }`}
                        >
                          {renderSlidePreview()}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => setSlideIdx((v) => (v === 0 ? slides.length - 1 : v - 1))}
                    className="px-4 py-2 rounded-xl border border-orange-300/40 text-orange-200"
                  >
                    <ChevronLeft className="w-4 h-4 inline" /> 이전
                  </button>
                  <button
                    onClick={exportPpt}
                    className="px-4 py-2 rounded-xl bg-orange-500 text-white font-bold"
                  >
                    <Download className="w-4 h-4 inline mr-1" /> PPT 다운로드 (로고·푸터·번호)
                  </button>
                  <button
                    onClick={() => setSlideIdx((v) => (v === slides.length - 1 ? 0 : v + 1))}
                    className="px-4 py-2 rounded-xl border border-orange-300/40 text-orange-200"
                  >
                    다음 <ChevronRight className="w-4 h-4 inline" />
                  </button>
                </div>
            </div>
          </div>
          </div>

        </div>
      )}

      {step === 'lobby' && session && (
        <div className="max-w-2xl mx-auto rounded-3xl border border-orange-300/35 bg-gradient-to-br from-[#07122b] to-[#1d1233] p-8 text-center">
          <p className="text-orange-300 text-xs uppercase tracking-[0.2em] font-bold mb-2">ECA Stage Lobby</p>
          <h3 className="text-white text-4xl font-black mb-3">입장 코드 대기 화면</h3>
          <p className="text-slate-300 mb-5">교육생은 PIN 또는 QR로 즉시 입장하세요.</p>
          <div className="mx-auto w-fit p-4 rounded-2xl bg-[#0b1734] border border-orange-300/30 mb-4">
            <canvas ref={qrRef} style={{ width: 220, height: 220 }} />
          </div>
          <p className="text-6xl font-black text-white tracking-widest font-mono">{session.code}</p>
          <p className="text-slate-400 text-sm mt-1">{categoriesSummary}</p>
          <div className="grid grid-cols-3 gap-2 mt-6">
            <button
              onClick={() => {
                navigator.clipboard.writeText(session.code);
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              }}
              className="py-3 rounded-xl border border-slate-600 text-slate-200"
            >
              {copied ? (
                <>
                  <Check className="inline w-4 h-4 mr-1" />
                  복사됨
                </>
              ) : (
                <>
                  <Copy className="inline w-4 h-4 mr-1" />
                  코드 복사
                </>
              )}
            </button>
            <button
              onClick={() => setStep('dashboard')}
              className="py-3 rounded-xl border border-orange-300/35 text-orange-200 font-bold"
            >
              <Sparkles className="inline w-4 h-4 mr-1" />
              슬라이드 시작
            </button>
            <button
              onClick={startQuiz}
              className="py-3 rounded-xl bg-gradient-to-r from-[#f97316] to-[#fb923c] text-white font-black"
            >
              <Play className="inline w-4 h-4 mr-1" />
              퀴즈 시작
            </button>
          </div>
        </div>
      )}

      {showUpgradeModal && (
        <div
          className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl border border-orange-300/35 bg-gradient-to-br from-[#07122b] to-[#1d1233] p-6"
          >
            <h4 className="text-white font-black text-2xl mb-2">Ethics-Core AI · Standard</h4>
            <p className="text-slate-300 text-sm mb-3">
              PDF·PPT보내기, 업종 벤치마크, 고급 리포트 등 심화 기능은 결과 확인 단계에서 구독으로 열립니다.
            </p>
            <ul className="text-slate-200 text-sm space-y-1 mb-4">
              <li>- 월 구독: 39,000원 (VAT 별도)</li>
              <li>- 상담: yszoo1467@naver.com / 010-6667-1467</li>
              <li>- PDF 리포트·추천 교육 패키지·업종 비교 데이터 포함</li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300"
              >
                닫기
              </button>
              <a
                href="mailto:yszoo1467@naver.com?subject=Ethics-Core%20AI%20Standard%20구독%20문의"
                className="flex-1 py-3 rounded-xl text-center font-bold border border-orange-300/50 text-orange-100"
              >
                구독 상담 (메일)
              </a>
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('eca_plan', 'standard');
                  setSubscribed(true);
                  setShowUpgradeModal(false);
                }}
                className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-[#f97316] to-[#fb923c] text-white"
              >
                데모로 기능 열기
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default FacilitatorDashboard;
