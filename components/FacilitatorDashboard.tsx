import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { geminiGenerateContent } from '@/lib/geminiFetch';
import { scoreIntegrityCorpus, type CorpusScoreResult } from '@/lib/insightCorpusScore';
import { extractTextFromReportFiles } from '@/lib/extractReportText';
import { pickFinalWeaknessScores, type ChartInsightMode } from '@/lib/reportInsightCharts';
import { buildIntegrityGalleryDeck, mergeGallerySectionsWithSlides } from '@/lib/buildIntegrityGalleryDeck';
import {
  parseResearchJsonToGallery,
  ResearchGalleryParseError,
} from '@/lib/researchToGallery';
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
  FileImage, FileText, Trash2, ImagePlus, Crown, MonitorPlay, X,
  BarChart3, LayoutGrid, Flag, Presentation, Lightbulb, Target, Activity,
} from 'lucide-react';
import SessionToolEmbeds from './SessionToolEmbeds';

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
  titleFontPx: 30,
  bodyFontPx: 17,
  titleColor: '#ffffff',
  bodyColor: '#e2e8f0',
  textAlign: 'left',
};

const roundFlowCards = [
  { round: '라운드 1', title: '문제 정의하기', subtitle: '현장에서 가장 어려운 점은?' },
  { round: '라운드 2', title: '원인 분석하기', subtitle: '왜 이런 문제가 생길까?' },
  { round: '라운드 3', title: '해결방안 도출', subtitle: '우리가 내일부터 할 수 있는 것은?' },
] as const;

function pickCuratedBg(tpl: SlideTemplate, idx: number): string {
  const arr = CURATED_BG[tpl];
  return arr[idx % arr.length];
}

function deriveReportDeckTitle(topic: string, insight: ReportInsight | null, files: File[]): string {
  const direct = topic.trim();
  if (direct) return direct;
  const headline = insight?.executiveHeadline?.trim();
  if (headline) return headline;
  const firstFile = files[0]?.name?.trim();
  if (firstFile) {
    const stem = firstFile.replace(/\.[^.]+$/, '').trim();
    if (stem) return `${stem} 기반 인사이트 브리핑`;
  }
  return '업로드 자료 기반 인사이트 브리핑';
}

function emptyDeckFromTopic(topic: string): DeckSlide[] {
  const t = topic || '업로드 자료 기반 인사이트 브리핑';
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
          ? '업로드 파일 분석 기반 브리핑'
          : tpl === 'chart'
            ? '리스크 프로파일'
            : tpl === 'conclusion'
              ? '해결방안 · 실행 과제'
              : '문제정의 · 원인분석 · 해결방안',
      bullets:
        tpl === 'title'
          ? ['분석 대상·범위 요약', '핵심 문제 신호 3가지', '해결방안 도출 프레임']
          : tpl === 'conclusion'
            ? ['즉시: 문제정의 재확인·사실관계 잠금', '2주: 원인별 담당·지표 설정', '분기: 해결방안 실행률·재발률 추적']
            : [],
      leftColumn:
        tpl === 'twoColumn'
          ? ['문제정의: 반복되는 리스크 패턴', '문제정의: 현장 체감과 제도 간 간극', '원인분석: 의사결정 근거 기록 미흡']
          : [],
      rightColumn:
        tpl === 'twoColumn'
          ? ['원인분석: 책임·권한 경계 불명확', '해결방안: 검증 체크포인트 내재화', '해결방안: 실행·피드백 루프 운영']
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

const defaultSlides: DeckSlide[] = emptyDeckFromTopic('업로드 자료 기반 인사이트 브리핑');

function fallbackSlideTitle(tpl: SlideTemplate, idx: number): string {
  switch (tpl) {
    case 'title':
      return '인사이트 브리핑';
    case 'conclusion':
      return '결론 · 실행 과제';
    case 'chart':
      return '지표 요약';
    case 'twoColumn': {
      const labels = ['문제 정의', '원인 분석', '해결 방안', '실행 과제', '핵심 정리'];
      return labels[idx % labels.length];
    }
    default:
      return `슬라이드 ${idx + 1}`;
  }
}

/** AI가 title을 비운 경우 부제·템플릿으로 보강 (PPT·미리보기 공통) */
function ensureSlideTitle(rawTitle: string, rawSubtitle: string, tpl: SlideTemplate, idx: number): string {
  let t = String(rawTitle ?? '').replace(/\s+/g, ' ').trim();
  if (t) return t.length > 52 ? `${t.slice(0, 50)}…` : t;
  const sub = String(rawSubtitle ?? '').replace(/\s+/g, ' ').trim();
  if (sub) return sub.length > 44 ? `${sub.slice(0, 42)}…` : sub;
  return fallbackSlideTitle(tpl, idx);
}

function ensureAllSlideTitles(deck: DeckSlide[]): DeckSlide[] {
  return deck.map((s, i) => ({
    ...s,
    title: ensureSlideTitle(s.title, s.subtitle, s.template, i),
  }));
}

function slideShowTemplateIcon(tpl: SlideTemplate) {
  switch (tpl) {
    case 'title':
      return Presentation;
    case 'twoColumn':
      return LayoutGrid;
    case 'chart':
      return BarChart3;
    case 'conclusion':
      return Flag;
    default:
      return FileText;
  }
}

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
  const caseStudyRaw = raw.caseStudy != null ? String(raw.caseStudy) : undefined;
  const caseStudy =
    caseStudyRaw != null ? (caseStudyRaw.length > 420 ? `${caseStudyRaw.slice(0, 418)}…` : caseStudyRaw) : undefined;
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
  const resolvedTitle = ensureSlideTitle(title, subtitle, tpl, idx);
  return {
    template: tpl,
    title: resolvedTitle,
    subtitle: subtitle.length > 58 ? `${subtitle.slice(0, 56)}…` : subtitle,
    bullets: bullets.length
      ? bullets.map((b) => (String(b).length > 96 ? `${String(b).slice(0, 94)}…` : String(b)))
      : tpl === 'title' || tpl === 'conclusion'
        ? ['항목을 입력하세요']
        : [],
    leftColumn: leftColumn.length
      ? leftColumn.map((b) => (String(b).length > 110 ? `${String(b).slice(0, 108)}…` : String(b)))
      : [''],
    rightColumn: rightColumn.length
      ? rightColumn.map((b) => (String(b).length > 110 ? `${String(b).slice(0, 108)}…` : String(b)))
      : [''],
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

/** 리포트 기반 덱의 첫 번째 chart 슬라이드를 대시보드 취약도 수치와 일치시킵니다. */
function alignFirstChartSlideWithWeakness(
  deck: DeckSlide[],
  scores: { label: string; value: number }[],
): DeckSlide[] {
  if (!scores.length) return deck;
  let applied = false;
  const labels = scores.map((x) => x.label);
  const values = scores.map((x) => x.value);
  return deck.map((slide) => {
    if (slide.template !== 'chart' || applied) return slide;
    applied = true;
    return {
      ...slide,
      chartLabels: labels,
      chartValues: values,
      title: slide.title?.trim() ? slide.title : '청렴 취약도 (4축)',
      subtitle: slide.subtitle?.trim() ? slide.subtitle : '인사이트 리포트와 동일 지표',
    };
  });
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
  /** 한 줄 임팩트 헤드라인 (교육·국정 브리핑 톤) */
  executiveHeadline?: string;
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
  /** 모델이 추정한 4축 취약도 (0~100), 클라이언트와 블렌딩 가능 */
  integrityRiskScores?: Record<string, number>;
}

type OrchestratorStep = {
  step: 'orchestrator' | 'research' | 'report_draft' | 'editor' | 'security' | 'template_design' | 'slide_composer' | 'qa';
  status: 'pass' | 'fail' | 'skipped';
  detail: string;
};

type OrchestratorUiReport = {
  loadedManuals: string[];
  steps: OrchestratorStep[];
  warnings: string[];
};

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
  const [galleryExporting, setGalleryExporting] = useState(false);
  const [researchGalleryJson, setResearchGalleryJson] = useState('');
  const [researchGalleryWarning, setResearchGalleryWarning] = useState<string | null>(null);
  const [researchGalleryError, setResearchGalleryError] = useState<string | null>(null);
  const [orchestrating, setOrchestrating] = useState(false);
  const [orchestratorReport, setOrchestratorReport] = useState<OrchestratorUiReport | null>(null);
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
    { label: '이해충돌', value: 45 },
    { label: '갑질·괴롭힘', value: 45 },
    { label: '금품·향응', value: 45 },
    { label: '의사결정 투명성', value: 45 },
  ]);
  const [vulnerabilityChartMode, setVulnerabilityChartMode] = useState<ChartInsightMode>('pending');
  const [showSlideShow, setShowSlideShow] = useState(false);
  const qrRef = useRef<HTMLCanvasElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const slideShowRootRef = useRef<HTMLDivElement>(null);
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

  const weaknessChartKey = useMemo(
    () => `${vulnerabilityChartMode}-${weaknessScores.map((s) => s.value).join(',')}`,
    [vulnerabilityChartMode, weaknessScores],
  );

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

  const applyCuratedBackgroundsToDeck = () => {
    bgCurateSaltRef.current += 1;
    setSlides((prev) =>
      prev.map((slide, i) => ({
        ...slide,
        bgImage: pickCuratedBg(slide.template, i + bgCurateSaltRef.current * 5),
      })),
    );
  };

  const closeSlideShow = useCallback(() => {
    setShowSlideShow(false);
    if (typeof document !== 'undefined' && document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    }
  }, []);

  const openSlideShow = useCallback(() => {
    setShowSlideShow(true);
    requestAnimationFrame(() => {
      const el = slideShowRootRef.current;
      if (!el) return;
      const focusRoot = () => {
        el.focus({ preventScroll: true });
      };
      if (typeof el.requestFullscreen === 'function') {
        void el.requestFullscreen().then(focusRoot).catch(focusRoot);
      } else {
        focusRoot();
      }
    });
  }, []);

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

  useEffect(() => {
    if (!showSlideShow) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeSlideShow();
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSlideIdx((v) => (v === slides.length - 1 ? 0 : v + 1));
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSlideIdx((v) => (v === 0 ? slides.length - 1 : v - 1));
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [showSlideShow, slides.length, closeSlideShow]);

  useEffect(() => {
    if (!showSlideShow) return;
    const t = window.setTimeout(() => {
      slideShowRootRef.current?.focus({ preventScroll: true });
    }, 80);
    return () => window.clearTimeout(t);
  }, [showSlideShow, slideIdx]);

  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement && showSlideShow) {
        setShowSlideShow(false);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, [showSlideShow]);

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
    const title = deriveReportDeckTitle(topicInput, reportInsight, reportFiles);
    if (!topicInput.trim()) setTopicInput(title);
    setGenLoading(true);
    try {
      const bundle = {
        executiveHeadline: reportInsight.executiveHeadline,
        liveAnalysisSummary: reportInsight.liveAnalysisSummary,
        coreKeywords: reportInsight.coreKeywords,
        regulatoryRecommendations: reportInsight.regulatoryRecommendations,
        discussionBulletSummary: reportInsight.discussionBulletSummary,
        surveyStatisticalInsights: reportInsight.surveyStatisticalInsights,
      };
      const riskJson = JSON.stringify(weaknessScores);
      const prompt = `EcoStage **고급 브리핑 덱** 생성기. 아래 JSON은 **확정된 인사이트 리포트**와 **대시보드에서 이미 산출된 4축 취약도 수치**입니다.

【톤】국정·공공기관 임원 대상: 간결, 단정, 수사 과장 금지. 슬라이드당 메시지 **하나**.

【절대 금지】
- 리포트·수치에 없는 새 사실·통계·법령·판례번호·가상 사례
- "오늘은 ~에 대해 알아봅시다" 같은 유치한 오프닝
- "교육목표/기대효과" 중심의 일반론 문구
- bullet 한 줄이 100자 넘는 장문

【제목 필수 · 짧게】
- **모든 슬라이드**에 "title"을 반드시 채울 것. 비우거나 공백만 금지.
- title은 **한 줄, 14~28자** 권장(길면 잘림). 핵심 한 문장만.
- 긴 설명·라벨은 "subtitle"에 두고, title에만 본문을 몰아넣지 말 것.

【슬라이드 10~11장 구조(문제정의→원인분석→해결방안 흐름을 유지할 것)】
1) title: 업로드 자료에 맞는 제목 + 부제 "문제정의·원인분석·해결방안"
2) twoColumn: 좌 "문제정의", 우 "원인분석"
3) twoColumn: 좌 "문제정의(증거 인용)", 우 "원인분석(메커니즘)"
4) chart: **반드시** 아래 riskScores와 **동일한** chartLabels·chartValues 사용 (순서·숫자 일치):
   riskScores: ${riskJson}
5) twoColumn: 좌 "해결방안 후보", 우 "실행 시 병목·보완책"
6) twoColumn: 좌 "설문·정량 시사점", 우 "해결방안 우선순위"
7) chart 또는 twoColumn: 해결방안 전/후 비교 관점(데이터 없으면 가정임을 명시)
8) twoColumn: 좌 "즉시 실행(2주)", 우 "중기 실행(분기)"
9) conclusion: 핵심 3문장 + "최종 해결방안"

【twoColumn 규칙】각 컬럼 3~4 bullet, 각 bullet **72자 이내**.
【라벨 규칙】가능하면 subtitle 또는 title에 "문제정의"/"원인분석"/"해결방안" 중 하나를 명시.

【caseStudy】twoColumn 슬라이드마다 **퍼실리테이터가 그대로 읽을 한 문단**(질문 던지기·타이머 안내)을 넣을 것. chart·title·conclusion은 생략 가능.

【푸터】footerInsightKind는 전부 **"quote"**. footerInsight는 **실존 인물·출처 명확한** 명언 한 줄.

세션 제목: "${title}"

리포트 JSON:
${JSON.stringify(bundle).slice(0, 120_000)}

JSON **배열만** 출력. 마크다운·코드펜스 금지.

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
      const normalized = parsed.slice(0, 12).map((row, i) => normalizeAiSlide(row, i));
      let enriched: DeckSlide[] = normalized.map((s, i) => ({
        ...s,
        footerInsightKind: 'quote' as const,
        bgImage: pickCuratedBg(s.template, i),
      }));
      enriched = alignFirstChartSlideWithWeakness(enriched, weaknessScores);
      if (enriched.length < 9) {
        const pad = emptyDeckFromTopic(title).slice(enriched.length);
        enriched.push(...pad.slice(0, 9 - enriched.length));
      }
      enriched = ensureAllSlideTitles(enriched);
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
      const prompt = `EcoStage **주제 기반 고급 워크숍 덱**. 주제만 주어졌을 때 **국정원·공공기관 연수원급** 퍼실리테이션 시나리오를 슬라이드로 설계하세요.

주제: "${rawTopic}"
세션 제목: "${title}"

【톤】전문·간결. 유치한 도입·스토리텔링 과장 금지.

【제목 필수 · 짧게】
- **모든 슬라이드**에 "title"을 반드시 채울 것. 비우거나 공백만 금지.
- title은 **한 줄, 14~28자** 권장. 핵심만.
- 부연·단계 라벨은 subtitle에 두고 title은 비우지 말 것.

【슬라이드 11~12장 권장 구조】
1 title: 부제에 학습목표 1줄
2 twoColumn: 좌 "사전지식 점검 질문 3", 우 "오늘의 산출물·합의 규칙"
3 twoColumn: 좌 "시나리오 배경(가상이어도 교육용으로 명시)", 우 "이해관계자 맵"
4 twoColumn: **90분 진행 타임라인**(분 단위: 오프닝·본론·소그룹·전체 공유·정리)
5 chart: 주제와 맞는 **4개 축** 라벨(예: 이해충돌·갑질·금품·투명성 등 주제에 맞게 작명) + 교육용 **상대 비중** 0~100 정수(합≈100). 본문에 "실제 통계"라고 쓰지 말 것.
6 twoColumn: 소그룹 토론 카드(질문·역할·보고 방식)
7 twoColumn: 퍼실리테이터 **체크리스트**(시간·분위기·민감발언 대응)
8 twoColumn: 리스크 완화 액션 좌우 3개씩
9 chart: 선택(또는 twoColumn) — 주제별 2차 관점
10 conclusion: 핵심 3문장 + 현장 과제 2개

【twoColumn】컬럼당 3~4 bullet, **각 72자 이내**.

【caseStudy】가능한 한 twoColumn마다 **그대로 읽을 퍼실 멘트** 1문단(질문·타이머·플립차트 지시).

【푸터】footerInsightKind 전부 "quote", 실존 명언+출처.

JSON **배열만** 출력. 마크다운·코드펜스 금지.

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
      let enriched: DeckSlide[] = normalized.map((s, i) => ({
        ...s,
        footerInsightKind: 'quote' as const,
        bgImage: pickCuratedBg(s.template, i),
      }));
      if (enriched.length < 9) {
        const pad = emptyDeckFromTopic(title).slice(enriched.length);
        enriched.push(...pad.slice(0, 9 - enriched.length));
      }
      enriched = ensureAllSlideTitles(enriched);
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
      const pptTitle = ensureSlideTitle(s.title, s.subtitle, s.template, i);
      slide.addText(pptTitle, {
        x: 0.7, y: 0.85, w: 12, h: s.template === 'title' ? 1.05 : 0.85,
        fontSize: s.template === 'title' ? 26 : 20, color: 'FFFFFF', bold: true,
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
        slide.addText('문제정의 · 원인분석', { x: 0.7, y: contentTop - 0.05, w: 5.8, h: 0.3, fontSize: 12, color: 'FB923C', bold: true });
        slide.addText('해결방안 · 실행', { x: 6.9, y: contentTop - 0.05, w: 5.5, h: 0.3, fontSize: 12, color: 'FB923C', bold: true });
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

  const exportGalleryMorphPpt = async () => {
    if (!subscribed) {
      openSubscribe();
      return;
    }
    setGalleryExporting(true);
    setResearchGalleryError(null);
    try {
      const sessionTopic = topicInput.trim();
      let sections = mergeGallerySectionsWithSlides(slides);
      let deckSubtitle: string | undefined;
      let pptxTitle: string | undefined;
      let fileStem = sessionTopic;

      if (researchGalleryJson.trim()) {
        const r = parseResearchJsonToGallery(researchGalleryJson.trim());
        sections = r.sections;
        setResearchGalleryWarning(r.warnings.length ? r.warnings.join(' ') : null);
        const researchTopic = r.topic.trim();
        const headline = researchTopic || sessionTopic;
        fileStem = headline;
        if (researchTopic) {
          deckSubtitle = `${researchTopic} · Research 갤러리 · Morph`;
          pptxTitle = `${researchTopic} — research gallery Morph`;
        } else if (sessionTopic) {
          deckSubtitle = `${sessionTopic} · Research 갤러리 · Morph`;
          pptxTitle = `${sessionTopic} — research gallery Morph`;
        } else {
          deckSubtitle = 'Research 갤러리 · Morph';
        }
      } else {
        setResearchGalleryWarning(null);
        deckSubtitle = sessionTopic ? `${sessionTopic} · 다크 갤러리 · Morph 전환` : undefined;
        pptxTitle = sessionTopic ? `${sessionTopic} — gallery Morph` : undefined;
      }

      const buf = await buildIntegrityGalleryDeck(sections, {
        deckSubtitle,
        pptxTitle,
      });
      const stem = (fileStem || 'gallery_morph').replace(/\s+/g, '_').slice(0, 48);
      const blob = new Blob([buf], {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ECA_gallery_morph_${stem}.pptx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      if (err instanceof ResearchGalleryParseError) {
        setResearchGalleryError(err.message);
      } else {
        setResearchGalleryError('갤러리 PPT 생성 중 오류가 났습니다.');
      }
    } finally {
      setGalleryExporting(false);
    }
  };

  const exportOrchestratedGalleryPpt = async () => {
    if (!subscribed) {
      openSubscribe();
      return;
    }
    setOrchestrating(true);
    setResearchGalleryError(null);
    try {
      const loadedManuals = [
        '_common.md',
        'orchestrator.md',
        'research.md',
        'report_draft.md',
        'editor.md',
        'security.md',
        'template_design.md',
        'slide_composer.md',
        'qa.md',
      ];
      const steps: OrchestratorStep[] = [
        { step: 'orchestrator', status: 'pass', detail: '역할별 매뉴얼 로드 대상 확정' },
      ];
      const sessionTopic = topicInput.trim();
      let sections = mergeGallerySectionsWithSlides(slides);
      let topicForDeck = sessionTopic || '청렴 리더십';
      const warnings: string[] = [];

      if (researchGalleryJson.trim()) {
        const parsed = parseResearchJsonToGallery(researchGalleryJson.trim());
        sections = parsed.sections;
        if (parsed.topic.trim()) topicForDeck = parsed.topic.trim();
        if (parsed.warnings.length) warnings.push(...parsed.warnings);
        steps.push({ step: 'research', status: 'pass', detail: `Research JSON 매핑: ${sections.length}칸` });
      } else {
        steps.push({ step: 'research', status: 'pass', detail: '현재 슬라이드 메타로 6칸 구성' });
      }

      steps.push({ step: 'report_draft', status: 'skipped', detail: '갤러리 전용 빠른 파이프라인 모드' });
      steps.push({ step: 'editor', status: 'pass', detail: '긴 제목 자동 truncation 적용' });

      const securityCorpus = `${topicForDeck}\n${JSON.stringify(sections)}`;
      const blocked = [/\b\d{2,3}-\d{3,4}-\d{4}\b/, /\b\d{6}-\d{7}\b/, /password|api[_-]?key|secret/gi]
        .some((re) => re.test(securityCorpus));
      if (blocked) {
        steps.push({ step: 'security', status: 'fail', detail: '민감정보 패턴 감지로 생성 중단' });
        setOrchestratorReport({ loadedManuals, steps, warnings });
        setResearchGalleryError('보안 게이트 실패: 민감정보 패턴이 포함되어 생성이 중단되었습니다.');
        return;
      }
      steps.push({ step: 'security', status: 'pass', detail: '민감정보 패턴 미검출' });
      steps.push({ step: 'template_design', status: 'pass', detail: '다크 갤러리 템플릿 적용' });

      const buf = await buildIntegrityGalleryDeck(sections, {
        deckSubtitle: `${topicForDeck} · Orchestrator dark gallery · Morph`,
        pptxTitle: `${topicForDeck} — orchestrated gallery Morph`,
      });
      steps.push({ step: 'slide_composer', status: 'pass', detail: 'Morph 전환 주입 완료' });
      steps.push({ step: 'qa', status: 'pass', detail: `출력 버퍼 ${Math.max(1, Math.round(buf.byteLength / 1024))}KB` });

      const stem = topicForDeck.replace(/\s+/g, '_').slice(0, 48) || 'orchestrated_gallery';
      const blob = new Blob([buf], {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ECA_orchestrated_gallery_${stem}.pptx`;
      a.click();
      URL.revokeObjectURL(url);
      setOrchestratorReport({ loadedManuals, steps, warnings });
    } catch (err) {
      console.error(err);
      if (err instanceof ResearchGalleryParseError) {
        setResearchGalleryError(err.message);
      } else {
        setResearchGalleryError('오케스트레이터 실행 중 오류가 발생했습니다.');
      }
    } finally {
      setOrchestrating(false);
    }
  };

  const buildLocalInsight = (corpus: string, algo: CorpusScoreResult): ReportInsight => {
    const flat = corpus.replace(/\s+/g, ' ').trim();
    const cite = flat.slice(0, 280);
    const citeEllipsis = flat.length > 280 ? '…' : '';
    const dimLine = (['이해충돌', '갑질·괴롭힘', '금품·향응', '의사결정 투명성'] as const)
      .map((lab) => `${lab}: 신호가중 ${(algo.perDimensionRaw[lab] ?? 0).toFixed(2)}`)
      .join(' / ');
    const topKw = Object.entries(algo.perDimensionRaw)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([k]) => k);
    return {
      executiveHeadline: '로컬 분석: 코퍼스 키워드 신호 요약',
      liveAnalysisSummary:
        `□ 로컬 분석 (AI 응답 파싱 실패·보조)\n` +
        `- 코퍼스: ${algo.charCount}자 · 키워드 총신호 ${algo.totalRaw.toFixed(2)} · 축별 ${dimLine}\n` +
        `- 원문 발췌(그대로 인용): "${cite}${citeEllipsis}"\n` +
        `- 상대적으로 신호가 큰 축: ${topKw.length ? topKw.join(', ') : '(미미)'}`,
      coreKeywords:
        topKw.length > 0
          ? [...topKw, '키워드빈도', '정성신호']
          : ['이해충돌', '투명성', '내부통제', '신고응대'],
      regulatoryRecommendations: [
        '□ 클라이언트 키워드 매칭만 반영된 요약입니다. 법적 판단·징계 여부는 기관 절차로 확인하세요.',
        '□ 동일 코퍼스로 AI 리포트 재생성을 권장합니다.',
      ],
      discussionBulletSummary: [
        `□ 자동 추출 코퍼스 기준: ${algo.lowKeywordSignal ? '구체 키워드가 드물어 중립대 점수에 가깝게 표시됨' : '키워드 가중치로 4축 취약도를 산출함'}`,
        '□ 토론 원문에서 짧은 인용문을 뽑아 퍼실리테이터가 다시 정리하는 것이 안전합니다.',
      ],
      surveyStatisticalInsights: [
        '□ 설문 수치가 텍스트에 없으면 통계적 유의성은 산출하지 않았습니다.',
        `□ 차트 표시: ${algo.sufficientForChart ? (algo.lowKeywordSignal ? '참고용(키워드 희박)' : '코퍼스 기반') : '텍스트 부족으로 취약도 미표시'}`,
      ],
      keyIssues: [`키워드 신호 요약: ${dimLine}`],
      solutions: ['원문 인용 중심 토론 재구성', '리포트 재생성'],
      policyRecommendations: ['이해충돌 점검표 점검', '회의록·근거자료 유지'],
      recommendedCourses: ['청렴 리스크 시나리오 워크숍', '공정성 판단과 설명책임'],
    };
  };

  const parseReportJson = (text: string): { insight: ReportInsight | null; raw: Record<string, unknown> | null } => {
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return { insight: null, raw: null };
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
      const riskRaw = o.integrityRiskScores;
      let integrityRiskScores: Record<string, number> | undefined;
      if (riskRaw && typeof riskRaw === 'object' && !Array.isArray(riskRaw)) {
        integrityRiskScores = riskRaw as Record<string, number>;
      }
      if (!live && !core.length && !reg.length) {
        return { insight: null, raw: o };
      }
      const execHead = String(o.executiveHeadline ?? o.headline ?? o.deckTitle ?? '').trim();
      return {
        insight: {
          executiveHeadline: execHead || undefined,
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
          integrityRiskScores,
        },
        raw: o,
      };
    } catch {
      return { insight: null, raw: null };
    }
  };

  const generateInsightReport = async () => {
    setReportLoading(true);
    const rawText = `${discussionInput}\n${surveyInput}`.trim();
    let lastCorpusForCatch = rawText;
    let algo: CorpusScoreResult = scoreIntegrityCorpus('');
    try {
      const MAX_FILES = 6;
      const MAX_MODEL_BYTES = 4 * 1024 * 1024;
      const MAX_TEXT_EXTRACT_BYTES = 20 * 1024 * 1024;
      const files = reportFiles.slice(0, MAX_FILES);

      if (!rawText && files.length === 0) {
        setReportInsight(null);
        setReportSummary('토론·설문 텍스트 또는 이미지/PDF 파일을 업로드한 뒤 다시 생성해 주세요.');
        setVulnerabilityChartMode('pending');
        setWeaknessScores([
          { label: '이해충돌', value: 45 },
          { label: '갑질·괴롭힘', value: 45 },
          { label: '금품·향응', value: 45 },
          { label: '의사결정 투명성', value: 45 },
        ]);
        return;
      }

      const modelEligible = files.filter((f) => f.size <= MAX_MODEL_BYTES);
      const textExtractEligible = files.filter((f) => f.size <= MAX_TEXT_EXTRACT_BYTES);
      let fullCorpus = rawText;
      try {
        // 대용량 PDF도 로컬 텍스트 추출은 허용해 분석 불가 상태를 줄입니다.
        const { corpus: fileCorpus } = await extractTextFromReportFiles(textExtractEligible);
        fullCorpus = [rawText, fileCorpus].filter(Boolean).join('\n\n---\n\n');
      } catch {
        fullCorpus = rawText;
      }
      lastCorpusForCatch = fullCorpus;
      algo = scoreIntegrityCorpus(fullCorpus);

      const wireParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
      const intro =
        `당신은 **국정·공공기관 고위 과정·청렴 교육**용 브리핑 작가입니다. 문장은 짧고 단호하게, 수사는 절제하고 **근거·인용**으로 권위를 만드세요. 첨부·입력에 **실제로 나타난 문장·사례**에만 근거해 **JSON 한 개만** 출력하세요. 마크다운·코드펜스 금지.\n\n` +
        `【executiveHeadline — 필수】\n` +
        `- 한 줄, **32자 이내**. 오늘 세션의 **핵심 리스크 한 방**을 관료·임원이 스캔했을 때 바로 이해되게 쓰세요.\n` +
        `- 이모지·느낌표 남발 금지.\n\n` +
        `【실시간 분석 요약 liveAnalysisSummary — 필수】\n` +
        `- 토론 입력·설문 메모·텍스트 첨부·PDF/이미지에서 읽은 내용 중, **짧은 인용문을 최소 3곳** 포함하세요. 인용은 반드시 따옴표 「」 또는 " " 로 감싸고, 바로 뒤에 (출처: 토론입력/설문메모/파일명 중 하나)를 붙이세요.\n` +
        `- 인용문은 각각 8~60자 정도로 잘라도 됩니다. 원문에 없는 말을 지어내지 마세요.\n` +
        `- **금지**: 근거 없이 쓰는 「부서별 기준 편차」「일반적으로 조직에서는」「통상적으로」 같은 추상 일반론만으로 채우기.\n` +
        `- 각 문단은 "이 자료에서 드러난 구체적 문제" → "왜 청렴·공정 이슈와 연결되는지" 순으로 쓰세요.\n\n` +
        `【토론 요약 discussionBulletSummary — 필수】\n` +
        `- 4~10개 bullet. **각 bullet은 반드시 원문 짧은 인용(20자 이내 가능)으로 시작**한 뒤, 그 발언이 시사하는 쟁점을 한두 문장으로 설명하세요.\n` +
        `- 토론 텍스트가 비어 있고 PDF·이미지만 있으면, 그 자료에서 읽은 내용만으로 bullet을 구성하세요.\n\n` +
        `【설문 surveyStatisticalInsights】\n` +
        `- 설문 수치·표가 텍스트에 없으면 "수치 산출 불가"를 명시하고, 질문 문구에 나타난 우려만 정리하세요.\n\n` +
        `【취약도 integrityRiskScores】\n` +
        `- 키 이름 정확히: "이해충돌", "갑질·괴롭힘", "금품·향응", "의사결정 투명성" 각각 **0~100 정수**.\n` +
        `- 첨부·입력 전체에서 **관찰 가능한 근거**만으로 추정하세요. 근거가 없어 숫자를 채울 수 없으면 이 필드는 **null** 로 두세요(추측 금지).\n\n` +
        `【규제 regulatoryRecommendations】\n` +
        `- 5~8개. 각 bullet은 **실행 주체(누가)** + **수단(무엇을)** + **기한·지표(언제·어떻게 확인)** 중 최소 2가지를 포함하세요.\n` +
        `- 추상어 「강화」「제고」만 있는 문장 금지.\n\n` +
        `반드시 포함할 JSON 키:\n` +
        `{\n` +
        `  "executiveHeadline": "한 줄 32자 이내",\n` +
        `  "liveAnalysisSummary": "…",\n` +
        `  "coreKeywords": ["핵심 키워드 5~12개 — 자료에 등장한 표현 우선"],\n` +
        `  "regulatoryRecommendations": ["…"],\n` +
        `  "discussionBulletSummary": ["…"],\n` +
        `  "surveyStatisticalInsights": ["…"],\n` +
        `  "integrityRiskScores": { "이해충돌": 0, "갑질·괴롭힘": 0, "금품·향응": 0, "의사결정 투명성": 0 } | null,\n` +
        `  "solutions": ["실행 과제 (선택)"],\n` +
        `  "recommendedCourses": ["추천 교육 (선택)"]\n` +
        `}\n` +
        `철학 잡설·형이상학 금지. 없는 판례번호·법조문 인용 금지.\n\n`;
      wireParts.push({ text: intro });
      if (rawText) wireParts.push({ text: `[직접 입력: 토론·설문 메모 통합]\n${rawText.slice(0, 120_000)}` });

      for (const f of files) {
        if (f.size > MAX_MODEL_BYTES) {
          wireParts.push({
            text: `(파일 ${f.name}: 멀티모달 업로드는 4MB 초과로 생략, 로컬 텍스트 추출은 시도함)`,
          });
        }
      }

      for (const f of modelEligible) {
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
      const { insight: parsedInsight, raw } = parseReportJson(text);
      const { scores, mode } = pickFinalWeaknessScores(algo, raw);
      setWeaknessScores(scores);
      setVulnerabilityChartMode(mode);

      if (parsedInsight && (parsedInsight.liveAnalysisSummary.trim() || parsedInsight.coreKeywords.length)) {
        setReportInsight(parsedInsight);
        setReportSummary('');
      } else {
        const local = buildLocalInsight(fullCorpus, algo);
        setReportInsight(local);
        setReportSummary(text.trim() || '');
      }
    } catch {
      const ag = scoreIntegrityCorpus(lastCorpusForCatch);
      const local = buildLocalInsight(lastCorpusForCatch, ag);
      setReportInsight(local);
      setReportSummary('');
      const { scores, mode } = pickFinalWeaknessScores(ag, null);
      setWeaknessScores(scores);
      setVulnerabilityChartMode(mode);
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
    const titlePx = Math.max(14, Math.round(Math.min(34, st.titleFontPx * scale)));
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
          rows={aspectPreset === '9:16' ? 2 : 2}
          className={`${fc} font-bold leading-tight break-keep resize-none`}
          style={{ color: st.titleColor, fontSize: `${titlePx}px`, minHeight: '1.85em' }}
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
              <p className="text-orange-300 text-[11px] font-bold mb-2">문제정의 · 원인분석</p>
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
              <p className="text-orange-300 text-[11px] font-bold mb-2">해결방안 · 실행</p>
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

  const renderSlideShowContent = (s: DeckSlide, idx: number) => {
    const Icon = slideShowTemplateIcon(s.template);
    const headTitle = ensureSlideTitle(s.title, s.subtitle, s.template, idx);
    const barChartData = {
      labels: s.chartLabels,
      datasets: [
        {
          label: '지수',
          data: s.chartValues,
          backgroundColor: ['rgba(249,115,22,0.88)', 'rgba(251,146,60,0.85)', 'rgba(253,186,116,0.82)', 'rgba(234,88,12,0.88)'],
          borderRadius: 8,
        },
      ],
    };
    const radarChartData = {
      labels: s.chartLabels,
      datasets: [
        {
          label: '프로파일',
          data: s.chartValues,
          backgroundColor: 'rgba(34,211,238,0.18)',
          borderColor: 'rgba(34,211,238,0.95)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(249,115,22,0.95)',
        },
      ],
    };
    const barOpts = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 520, easing: 'easeOutQuart' as const },
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#e2e8f0', font: { size: 13 } }, grid: { color: 'rgba(148,163,184,0.1)' } },
        y: { min: 0, max: 100, ticks: { color: '#cbd5e1', font: { size: 12 } }, grid: { color: 'rgba(148,163,184,0.12)' } },
      },
    };
    const radarOpts = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 520, easing: 'easeOutQuart' as const },
      plugins: { legend: { display: false } },
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { color: '#64748b', backdropColor: 'transparent', font: { size: 11 } },
          grid: { color: 'rgba(148,163,184,0.18)' },
          angleLines: { color: 'rgba(148,163,184,0.18)' },
          pointLabels: { color: '#e2e8f0', font: { size: 11 } },
        },
      },
    };

    return (
      <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.34]"
          style={{ backgroundImage: `url(${s.bgImage})` }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#020617]/94 via-[#0c1428]/92 to-[#1e1035]/90" />

        <header className="relative z-[2] shrink-0 border-b border-white/10 px-5 pb-4 pt-5 shadow-sm md:px-10 md:pb-5 md:pt-6">
          <div className="mx-auto flex max-w-6xl flex-wrap items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-orange-400/40 bg-gradient-to-br from-orange-500/25 to-amber-600/10 text-orange-100 shadow-lg shadow-black/30 md:h-16 md:w-16">
              <Icon className="h-7 w-7 md:h-8 md:w-8" />
            </div>
            <div className="min-w-0 flex-1">
              {s.subtitle.trim() ? (
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-300/95 md:text-xs">{s.subtitle}</p>
              ) : null}
              <h2 className="mt-1.5 text-balance text-2xl font-bold leading-snug tracking-tight text-white md:text-3xl">
                {headTitle}
              </h2>
            </div>
          </div>
        </header>

        <div className="relative z-[2] flex min-h-0 flex-1 flex-col overflow-hidden px-5 py-4 md:px-10 md:py-5">
          {(s.template === 'title' || s.template === 'conclusion') && (
            <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center">
              <ul className="space-y-3 md:space-y-4">
                {s.bullets.filter(Boolean).map((b, i) => (
                  <li
                    key={i}
                    className="flex gap-3 rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-sm leading-relaxed text-slate-100 shadow-md backdrop-blur-sm md:text-base md:leading-relaxed"
                  >
                    <span className="mt-0.5 shrink-0 font-bold text-orange-400">▸</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {s.template === 'twoColumn' && (
            <div className="mx-auto grid w-full max-w-5xl flex-1 grid-cols-1 content-center gap-4 md:grid-cols-2 md:gap-6">
              <div className="rounded-2xl border border-cyan-400/30 bg-black/40 p-4 shadow-lg backdrop-blur-md md:p-5">
                <div className="mb-3 flex items-center gap-2 border-b border-cyan-500/20 pb-2 text-cyan-200">
                  <Target className="h-5 w-5 shrink-0 text-cyan-300" />
                  <span className="text-sm font-bold">문제정의 · 원인분석</span>
                </div>
                <ul className="space-y-2.5 text-sm leading-snug text-slate-100 md:text-[15px] md:leading-relaxed">
                  {s.leftColumn.filter(Boolean).map((b, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="shrink-0 text-orange-300">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-orange-400/30 bg-black/40 p-4 shadow-lg backdrop-blur-md md:p-5">
                <div className="mb-3 flex items-center gap-2 border-b border-orange-500/20 pb-2 text-orange-200">
                  <Lightbulb className="h-5 w-5 shrink-0 text-amber-300" />
                  <span className="text-sm font-bold">해결방안 · 실행</span>
                </div>
                <ul className="space-y-2.5 text-sm leading-snug text-slate-100 md:text-[15px] md:leading-relaxed">
                  {s.rightColumn.filter(Boolean).map((b, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="shrink-0 text-amber-300">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {s.template === 'chart' && s.chartLabels.length > 0 && (
            <div
              key={`ss-chart-${idx}-${s.chartLabels.join('-')}`}
              className="mx-auto flex w-full max-w-6xl flex-1 min-h-0 flex-col items-stretch justify-center gap-4 lg:flex-row lg:gap-5"
            >
              <div className="flex min-h-[220px] flex-[1.35] flex-col rounded-2xl border border-orange-300/35 bg-[#030712]/90 p-3 shadow-xl backdrop-blur-md md:min-h-[260px] lg:min-h-0">
                <p className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-orange-200/90">
                  <BarChart3 className="h-4 w-4" />
                  막대 비교
                </p>
                <div className="relative min-h-0 flex-1 w-full">
                  <Bar data={barChartData} options={barOpts} />
                </div>
              </div>
              <div className="flex min-h-[200px] w-full flex-col rounded-2xl border border-cyan-400/30 bg-[#030712]/90 p-3 shadow-xl backdrop-blur-md lg:max-w-[340px] lg:shrink-0">
                <p className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-cyan-200/90">
                  <Activity className="h-4 w-4 text-cyan-300" />
                  레이더 프로파일
                </p>
                <div className="relative min-h-0 flex-1 w-full">
                  <Radar data={radarChartData} options={radarOpts} />
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="relative z-[2] shrink-0 border-t border-white/10 bg-black/40 px-5 py-2.5 text-[11px] text-slate-400 backdrop-blur-sm md:px-10 md:text-xs">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
            <span className="truncate">{FOOTER_BRAND}</span>
            <span className="font-mono text-orange-200/90">
              {idx + 1} / {slides.length}
            </span>
          </div>
        </footer>
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

          <SessionToolEmbeds />

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
              {vulnerabilityChartMode === 'pending' && (
                <p className="text-xs text-slate-500 rounded-lg border border-slate-600/40 bg-black/20 px-3 py-2 leading-relaxed">
                  취약도 숫자·차트는 <span className="text-cyan-200 font-bold">리포트 생성</span> 후, 토론·설문·추출 텍스트의 키워드 분석과(가능 시) AI 보정값으로
                  갱신됩니다.
                </p>
              )}
              {vulnerabilityChartMode === 'insufficient' && (
                <div className="rounded-xl border border-amber-500/45 bg-amber-950/35 px-3 py-4 text-amber-50 text-sm space-y-1.5">
                  <p className="font-black text-amber-200">취약도 · 분석 불가</p>
                  <p className="text-xs text-amber-100/90 leading-relaxed">
                    분석용 텍스트가 약 80자 미만이거나, PDF에서 본문을 읽지 못해 점수를 낼 근거가 없습니다. 패들렛·토론 로그를 붙여 넣거나 txt/md로
                    올려 주세요. (스캔 PDF·이미지만 있는 경우, AI가 별도 점수를 주면 보조 표시됩니다.)
                  </p>
                </div>
              )}
              {vulnerabilityChartMode === 'llm_only' && (
                <p className="text-[11px] text-violet-200/95 rounded-lg border border-violet-500/35 bg-violet-950/25 px-3 py-2 leading-relaxed">
                  추출된 <strong>텍스트 코퍼스가 짧아</strong> 차트는 첨부·이미지를 읽은 <strong>AI 추정 점수</strong>만 반영했습니다. 참고용이며 법적 판단이
                  아닙니다.
                </p>
              )}
              {(vulnerabilityChartMode === 'ok' || vulnerabilityChartMode === 'llm_only') && (
                <>
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
                        key={`bar-${weaknessChartKey}`}
                        data={{
                          labels: weaknessScores.map((x) => x.label),
                          datasets: [
                            {
                              label: '지수',
                              data: weaknessScores.map((x) => x.value),
                              backgroundColor: 'rgba(249,115,22,0.75)',
                              borderRadius: 6,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          animation: { duration: 480, easing: 'easeOutQuart' as const },
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
                        key={`radar-${weaknessChartKey}`}
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
                          animation: { duration: 480, easing: 'easeOutQuart' as const },
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
                </>
              )}
              {(vulnerabilityChartMode === 'ok' || vulnerabilityChartMode === 'llm_only') && (
                <div className="rounded-xl border border-amber-400/30 bg-gradient-to-r from-amber-950/30 to-orange-950/20 p-3">
                  <p className="text-amber-200 text-[10px] font-black uppercase flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5" /> 벤치마크
                  </p>
                  <p className="text-white text-sm font-black mt-1">
                    청렴 지수 <span className="text-orange-300">{userIntegrityIndex}</span>
                    <span className="text-slate-400 text-xs font-bold"> vs 참고 {industryBenchmark}</span>
                  </p>
                </div>
              )}
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
                      {reportInsight.executiveHeadline && (
                        <div className="rounded-xl border border-white/15 bg-gradient-to-r from-[#0f172a] via-[#1e1b4b]/80 to-[#0c4a6e]/50 px-4 py-3 shadow-lg shadow-black/20">
                          <p className="text-[10px] font-black uppercase tracking-widest text-cyan-200/90 mb-1">Insight Brief</p>
                          <p className="text-white text-base md:text-lg font-black leading-snug tracking-tight">
                            {reportInsight.executiveHeadline}
                          </p>
                        </div>
                      )}
                      <div className="rounded-xl border border-orange-300/25 bg-[#0a1630]/70 p-4">
                        <p className="text-orange-200 text-[10px] font-bold uppercase mb-2 tracking-wide">실시간 분석 요약</p>
                        <p className="text-slate-100 whitespace-pre-line leading-relaxed text-sm">{reportInsight.liveAnalysisSummary}</p>
                      </div>
                      <div className="rounded-xl border border-violet-400/25 bg-[#0c1528]/70 p-4">
                        <p className="text-violet-200 text-[10px] font-bold uppercase mb-3 tracking-wide">핵심 키워드</p>
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
                      <div className="rounded-xl border border-emerald-400/25 bg-[#0f1a14]/60 p-4">
                        <p className="text-emerald-200 text-[10px] font-bold uppercase mb-2 tracking-wide">규제·운영 개선 제언</p>
                        <ul className="space-y-2 text-slate-100 text-sm leading-relaxed">
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
                    <div className="rounded-xl border border-orange-300/20 bg-[#0a1228]/80 p-4 space-y-3 max-h-[320px] overflow-y-auto">
                      <p className="text-orange-200 text-[10px] font-bold uppercase tracking-wide">토론 요약 (개조식 · AI)</p>
                      {reportInsight.discussionBulletSummary.map((line, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-2 border-b border-white/5 pb-3 last:border-0">
                          <p className="text-slate-100 text-sm flex-1 leading-relaxed">{line}</p>
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
                    <div className="rounded-xl border border-cyan-400/25 bg-[#0c1528]/70 p-4 space-y-3 max-h-[320px] overflow-y-auto">
                      <p className="text-cyan-200 text-[10px] font-bold uppercase tracking-wide">설문 분석</p>
                      {reportInsight.surveyStatisticalInsights.map((line, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-2 border-b border-white/5 pb-3 last:border-0">
                          <p className="text-slate-100 text-sm flex-1 leading-relaxed">{line}</p>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {roundFlowCards.map((card) => (
                    <div key={card.round} className="rounded-xl border border-blue-300/25 bg-[#081a37]/85 px-3 py-3">
                      <p className="text-[10px] text-orange-300 font-black uppercase tracking-wider">{card.round}</p>
                      <p className="text-white font-bold mt-1">{card.title}</p>
                      <p className="text-slate-400 text-xs mt-1">{card.subtitle}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-violet-500/25 bg-[#0a1228]/50 p-4 space-y-2">
                  <p className="text-[11px] text-violet-200/90 font-bold uppercase tracking-wide">
                    Research JSON → 갤러리 목차 (선택)
                  </p>
                  <textarea
                    value={researchGalleryJson}
                    onChange={(e) => {
                      setResearchGalleryJson(e.target.value);
                      setResearchGalleryError(null);
                      setResearchGalleryWarning(null);
                    }}
                    placeholder='{"topic":"…","sections":[{"order":1,"title_en":"INTRO","title_ko":"들어가며"}]}'
                    rows={4}
                    spellCheck={false}
                    className="w-full font-mono text-[11px] leading-snug px-3 py-2 rounded-lg bg-[#111d3d]/70 border border-violet-400/25 text-slate-200 placeholder:text-slate-600 resize-y min-h-[88px]"
                  />
                  {researchGalleryWarning ? (
                    <p className="text-amber-200/95 text-[11px] leading-relaxed">{researchGalleryWarning}</p>
                  ) : null}
                  {researchGalleryError ? (
                    <p className="text-rose-300 text-[11px] leading-relaxed">{researchGalleryError}</p>
                  ) : null}
                  <p className="text-slate-500 text-[10px] leading-relaxed">
                    비워 두면 현재 슬라이드 제목·부제로 6칸을 채웁니다. 채우면 Research 스키마(`agents/manuals/research.md`)가 우선합니다.
                  </p>
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
                    title="슬라이드 유형에 맞춰 준비된 추천 배경을 순서대로 바꿉니다."
                  >
                    추천 배경 바꾸기
                  </button>
                  <button
                    type="button"
                    onClick={applyCuratedBackgroundsToDeck}
                    className="shrink-0 px-3 py-2 rounded-lg border border-cyan-400/45 text-cyan-100 text-xs font-bold hover:bg-cyan-500/15 transition-colors"
                    title="덱 전체 슬라이드에 추천 배경을 일괄 적용합니다."
                  >
                    전체 추천 배경 적용
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
                                style: { ...defaultSlideStyle, ...currentSlide.style, titleFontPx: Number(e.target.value) || 30 },
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
                    onClick={openSlideShow}
                    className="px-4 py-2 rounded-xl border border-cyan-300/40 text-cyan-100 font-bold"
                    title="ESC 종료, 좌우 화살표 이동"
                  >
                    <MonitorPlay className="w-4 h-4 inline mr-1" /> 슬라이드 쇼
                  </button>
                  <button
                    onClick={exportPpt}
                    className="px-4 py-2 rounded-xl bg-orange-500 text-white font-bold"
                  >
                    <Download className="w-4 h-4 inline mr-1" /> PPT 다운로드 (로고·푸터·번호)
                  </button>
                  <button
                    type="button"
                    onClick={exportGalleryMorphPpt}
                    disabled={galleryExporting}
                    title="다크 갤러리 목차 + 섹션 줌, Morph 전환(선택 창 동일 이름)"
                    className="px-4 py-2 rounded-xl border border-violet-300/50 text-violet-100 font-bold disabled:opacity-50"
                  >
                    <LayoutGrid className="w-4 h-4 inline mr-1" />
                    {galleryExporting ? '갤러리 PPT 생성 중…' : '갤러리+Morph PPT'}
                  </button>
                  <button
                    type="button"
                    onClick={exportOrchestratedGalleryPpt}
                    disabled={orchestrating}
                    title="매뉴얼 분리 로드·보안 게이트를 거친 오케스트레이터 모드"
                    className="px-4 py-2 rounded-xl border border-emerald-300/50 text-emerald-100 font-bold disabled:opacity-50"
                  >
                    <Activity className="w-4 h-4 inline mr-1" />
                    {orchestrating ? '오케스트레이션 실행 중…' : '오케스트레이터 실행'}
                  </button>
                  <button
                    onClick={() => setSlideIdx((v) => (v === slides.length - 1 ? 0 : v + 1))}
                    className="px-4 py-2 rounded-xl border border-orange-300/40 text-orange-200"
                  >
                    다음 <ChevronRight className="w-4 h-4 inline" />
                  </button>
                </div>
                {orchestratorReport ? (
                  <div className="rounded-xl border border-emerald-400/25 bg-[#091727]/70 p-3 space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-200">
                      오케스트레이터 리포트
                    </p>
                    <p className="text-[11px] text-slate-400">
                      manuals: {orchestratorReport.loadedManuals.join(', ')}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {orchestratorReport.steps.map((s, idx) => (
                        <div key={`${s.step}-${idx}`} className="rounded-lg border border-white/10 px-2 py-1.5">
                          <p className="text-[11px] text-slate-200">
                            <span className={`font-bold ${s.status === 'pass' ? 'text-emerald-300' : s.status === 'fail' ? 'text-rose-300' : 'text-amber-300'}`}>
                              [{s.status}]
                            </span>{' '}
                            {s.step}
                          </p>
                          <p className="text-[11px] text-slate-400">{s.detail}</p>
                        </div>
                      ))}
                    </div>
                    {orchestratorReport.warnings.length ? (
                      <p className="text-[11px] text-amber-200">
                        경고: {orchestratorReport.warnings.join(' ')}
                      </p>
                    ) : null}
                  </div>
                ) : null}
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
      {showSlideShow && currentSlide && (
        <div
          ref={slideShowRootRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="슬라이드 쇼"
          className="fixed inset-0 z-[200] flex min-h-0 flex-col bg-slate-950 text-slate-100 outline-none"
          style={{ minHeight: '100dvh' }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              closeSlideShow();
            }
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              setSlideIdx((v) => (v === slides.length - 1 ? 0 : v + 1));
            }
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              setSlideIdx((v) => (v === 0 ? slides.length - 1 : v - 1));
            }
          }}
        >
          <button
            type="button"
            aria-label="이전 슬라이드"
            className="pointer-events-auto absolute bottom-20 left-0 top-24 z-[120] flex w-[min(16vw,132px)] cursor-pointer items-center justify-start border-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent pl-0.5 text-white transition hover:from-black/75"
            onClick={() => setSlideIdx((v) => (v === 0 ? slides.length - 1 : v - 1))}
          >
            <ChevronLeft className="h-11 w-11 drop-shadow-md md:h-12 md:w-12" />
          </button>
          <button
            type="button"
            aria-label="다음 슬라이드"
            className="pointer-events-auto absolute bottom-20 right-0 top-24 z-[120] flex w-[min(16vw,132px)] cursor-pointer items-center justify-end border-0 bg-gradient-to-l from-black/60 via-black/25 to-transparent pr-0.5 text-white transition hover:from-black/75"
            onClick={() => setSlideIdx((v) => (v === slides.length - 1 ? 0 : v + 1))}
          >
            <ChevronRight className="h-11 w-11 drop-shadow-md md:h-12 md:w-12" />
          </button>

          <div className="absolute inset-0 z-[10] min-h-0 overflow-hidden">
            {renderSlideShowContent(currentSlide, slideIdx)}
          </div>

          <div className="pointer-events-auto absolute right-3 top-3 z-[130] flex items-center gap-1.5 rounded-xl border border-white/15 bg-black/70 p-1.5 shadow-xl backdrop-blur-md md:right-5 md:top-5">
            <button
              type="button"
              aria-label="이전"
              className="rounded-lg px-2.5 py-2 text-white hover:bg-white/10"
              onClick={() => setSlideIdx((v) => (v === 0 ? slides.length - 1 : v - 1))}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="다음"
              className="rounded-lg px-2.5 py-2 text-white hover:bg-white/10"
              onClick={() => setSlideIdx((v) => (v === slides.length - 1 ? 0 : v + 1))}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="슬라이드 쇼 종료"
              className="rounded-lg px-2.5 py-2 text-red-200 hover:bg-red-500/20"
              onClick={closeSlideShow}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="pointer-events-none absolute bottom-3 left-1/2 z-[130] -translate-x-1/2 rounded-full border border-white/10 bg-black/55 px-4 py-2 text-center text-[10px] text-slate-300 shadow-lg backdrop-blur-md md:text-xs">
            화면 좌우 가장자리 또는 버튼 · ← → 키 · Esc 종료
          </div>
        </div>
      )}
    </section>
  );
};

export default FacilitatorDashboard;
