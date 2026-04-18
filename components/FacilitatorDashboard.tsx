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
  FileImage, FileText, Trash2, LayoutTemplate, GripVertical, ImagePlus, Crown,
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
  philosophyNote?: string;
  imageQuery?: string;
  /** 슬라이드와 1:1로 연동되는 발표 대본(발표자가 읽는 스크립트) */
  presenterScript?: string;
  style?: Partial<SlideStyle>;
}

const generateCode = () => `ECO-${Math.floor(1000 + Math.random() * 9000)}`;

const FOOTER_BRAND = 'Ethics-Core AI · EcoStage';

const PHILOSOPHY_SOURCE =
  '청렴공정연구센터 블로그(https://blog.naver.com/yszoo1467)가 강조하는 철학: 청렴·공정·윤리의 균형, 제도와 현장 실천의 일치, 투명한 의사결정과 책임 있는 거버넌스, 이해충돌·갑질 예방을 통한 신뢰 회복.';

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
          ? '오프닝 · 철학과 방향'
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
      philosophyNote:
        tpl === 'title'
          ? `주제「${t}」를 중심으로 세션에서 다룰 관점을 안내합니다. (원고·제목에 없는 내용은 추가하지 마세요.)`
          : `「${t}」와 직접 연결된 요점만 서술합니다. 원고에 없는 사실은 넣지 않습니다.`,
      caseStudy:
        tpl === 'twoColumn'
          ? `「${t}」에 대해 업로드한 원고에서 인용·요약할 문단을 여기에 두세요. 원고에 사례 문단이 없으면 이 칸은 비워 두는 것이 좋습니다.`
          : tpl === 'chart'
            ? `차트 라벨은 원고·제목에서 발췌한 표현으로 채우세요. 숫자 근거가 없으면 모든 막대를 동일 값(예: 50)으로 두는 편이 안전합니다.`
            : undefined,
      presenterScript:
        tpl === 'title'
          ? `안녕하세요. 오늘 주제는 "${t}"입니다. 세션 목표와 기대효과를 짚고 넘어가겠습니다.`
          : tpl === 'conclusion'
            ? `정리하겠습니다. "${t}"와 관련해 오늘 합의한 실행 과제를 다시 한 번 확인하겠습니다.`
            : `이 슬라이드에서는 "${t}"의 핵심 포인트를 설명합니다. 청중이 이해하기 쉬운 속도로 진행하세요.`,
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
  const philosophyNote = raw.philosophyNote != null ? String(raw.philosophyNote) : undefined;
  const imageQuery = raw.imageQuery != null ? String(raw.imageQuery) : undefined;
  const presenterScript = raw.presenterScript != null ? String(raw.presenterScript) : '';
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
    philosophyNote,
    imageQuery,
    presenterScript,
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
  executiveSummary: string;
  keyIssues: string[];
  solutions: string[];
  policyRecommendations: string[];
  recommendedCourses: string[];
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
  const [sourceText, setSourceText] = useState('');
  const [sourceFileName, setSourceFileName] = useState('');
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
  const deckSourceInputRef = useRef<HTMLInputElement>(null);

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
    '16:9': 'aspect-video w-full max-w-[min(100%,960px)]',
    '4:5': 'aspect-[4/5] w-full max-w-[min(100%,520px)]',
    '9:16': 'aspect-[9/16] w-full max-w-[min(100%,380px)]',
    '1:1': 'aspect-square w-full max-w-[min(100%,560px)]',
  };

  const onDeckSourceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setSourceFileName(f.name);
    try {
      const t = await f.text();
      setSourceText(t.slice(0, 200_000));
    } catch {
      setSourceText('');
      setSourceFileName('');
    }
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

  const generateScenarioSlides = async () => {
    const title = topicInput.trim();
    const source = sourceText.trim();
    if (!title && !source) return;
    setGenLoading(true);
    try {
      const sourceBlock = source
        ? `=== SOURCE_TEXT (ONLY USE THIS FOR FACTS; DO NOT INVENT) ===\n${source.slice(0, 120_000)}`
        : '=== SOURCE_TEXT ===\n(비어 있음 — 제목만으로 구성하되, 제목에 없는 사실·수치·법령·사례·통계를 추가하지 마세요.)';
      const prompt = `EcoStage 슬라이드 생성기. 아래 "제목"과 "SOURCE_TEXT"에만 충실하게 슬라이드를 만드세요.

절대 규칙 (위반 금지):
- 일반 상식, 뉴스, 법령, 판례, 통계, 외부 블로그·철학, 업로드되지 않은 파일 내용을 **추가하지 마세요**.
- SOURCE_TEXT가 비어 있으면 **제목 문자열만**을 근거로 문장을 구성하세요(제목에 없는 주장 금지).
- SOURCE_TEXT가 있으면 그 안의 문장·용어·구조만 재배열·요약·불릿화하세요. 없는 내용을 상상하지 마세요.
- philosophyNote / caseStudy 도 위 규칙을 동일하게 적용합니다(외부 해설·가상 사례 금지).
- chart 슬라이드: chartLabels는 SOURCE_TEXT 또는 제목에서 발췌한 짧은 구절이어야 하고, chartValues는 0~100 정수이되 **SOURCE_TEXT에 숫자가 없으면** 모든 값을 50으로 두세요.

형식:
- JSON 배열만 출력. 마크다운·코드펜스 금지.
- 슬라이드 **10~14개**.
- template은 "title" | "twoColumn" | "chart" | "conclusion" 만 사용. 첫 슬라이드는 title, 마지막은 conclusion, 중간은 twoColumn/chart 교차.
- 각 원소에 presenterScript 포함: 해당 슬라이드를 발표할 때 읽을 한국어 대본(4~10문장, 슬라이드 본문과 동일 사실만).

제목: "${title || '(제목 없음)'}"

${sourceBlock}

객체 스키마(배열 원소):
{
  "template": "title" | "twoColumn" | "chart" | "conclusion",
  "title": string,
  "subtitle": string,
  "bullets"?: string[],
  "leftColumn"?: string[],
  "rightColumn"?: string[],
  "chartLabels"?: string[],
  "chartValues"?: number[],
  "philosophyNote": string,
  "caseStudy": string,
  "presenterScript": string
}`;
      const { text } = await geminiGenerateContent({ model: 'gemini-2.5-flash', contents: prompt });
      const matched = text.match(/\[[\s\S]*\]/);
      if (!matched) throw new Error('format');
      const parsed = JSON.parse(matched[0]) as Record<string, unknown>[];
      const normalized = parsed.slice(0, 14).map((row, i) => normalizeAiSlide(row, i));
      const enriched: DeckSlide[] = normalized.map((s, i) => ({
        ...s,
        bgImage: pickCuratedBg(s.template, i),
      }));
      if (enriched.length < 10) {
        const pad = emptyDeckFromTopic(title || '세션').slice(enriched.length);
        enriched.push(...pad.slice(0, 10 - enriched.length));
      }
      setSlides(enriched);
      setSlideIdx(0);
    } catch {
      setSlides(emptyDeckFromTopic(title || '세션'));
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
        s.bullets.forEach((b, idx) => {
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
      if (s.philosophyNote) {
        slide.addText(`[철학·해설]\n${s.philosophyNote}`, {
          x: 0.7, y: noteY, w: 12, h: 1.5,
          fontSize: 11, color: 'CBD5E1', valign: 'top',
        });
        noteY += 1.55;
      }
      if (s.caseStudy) {
        slide.addText(`[Case Study]\n${s.caseStudy}`, {
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
      executiveSummary: `세션 자료를 기반으로 취약 신호를 정리했습니다. 핵심 키워드: ${k}`,
      keyIssues: [
        `부패 취약 키워드/표현: ${k}`,
        '조직 문화: 부서별 기준 편차, 보고 지연 패턴이 관찰될 수 있음',
        '교육생 고충: 보복 우려로 문제 제기를 주저할 수 있음',
      ],
      solutions: [
        '사례형 반복 훈련·시뮬레이션으로 판단 기준 공유',
        '관리자 공통 체크리스트·교차검증 루틴 도입',
        '익명 피드백 채널과 결정 로그 템플릿 병행',
      ],
      policyRecommendations: [
        '이해충돌 사전 점검표를 인허가·조달 전 단계에 의무화하고, 회의록에 이해관계자 맵을 첨부',
        '내부감사·민원응대 SLA를 수치화해 분기별 공개 리포트로 연결',
      ],
      recommendedCourses: ['청렴 리스크 시나리오 워크숍(8h)', '공정성 판단과 설명책임(4h)', '갑질·괴롭힘 예방 리더십(4h)'],
    };
  };

  const parseReportJson = (text: string): ReportInsight | null => {
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      const o = JSON.parse(m[0]) as Record<string, unknown>;
      const arr = (v: unknown) => (Array.isArray(v) ? v.map(String) : []);
      return {
        executiveSummary: String(o.executiveSummary ?? o.summary ?? ''),
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
        `다음은 공공·민간 청렴·공정 교육 세션의 종합 분석 자료입니다. 철학적 참고: ${PHILOSOPHY_SOURCE}\n` +
        `반드시 아래 JSON **한 개만** 출력하세요. 마크다운·코드펜스 금지.\n` +
        `{\n` +
        `  "executiveSummary": "경영진용 2~4문장 요약",\n` +
        `  "keyIssues": ["핵심 쟁점 bullet", "..."],\n` +
        `  "solutions": ["실행 가능한 솔루션 bullet", "..."],\n` +
        `  "policyRecommendations": ["제도·운영 정책 제언 (관행·지침 수준)", "..."],\n` +
        `  "recommendedCourses": ["추천 교육 과정명", "..."]\n` +
        `}\n` +
        `텍스트와 첨부 이미지·PDF를 모두 반영하세요. 한국어, 전문 보고서 톤.\n\n`;
      wireParts.push({ text: intro });
      if (rawText) wireParts.push({ text: `[직접 입력 텍스트]\n${rawText}` });

      for (const f of files) {
        if (f.size > MAX_BYTES) {
          wireParts.push({ text: `(파일 ${f.name}: 용량 초과로 건너뜀 — 4MB 이하만 분석)` });
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
      if (parsed && parsed.keyIssues.length) {
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
    return (
      <div className={`relative z-10 flex flex-col min-h-0 ${alignClass}`}>
        <p className="text-orange-200 uppercase text-xs tracking-[0.2em] font-bold mb-2 flex items-center gap-2 justify-between flex-wrap">
          <span className="inline-flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4" /> {s.subtitle} · {s.template}
          </span>
        </p>
        <h4
          className="font-black leading-tight mb-4 break-keep"
          style={{ color: st.titleColor, fontSize: `${Math.min(52, st.titleFontPx)}px` }}
        >
          {s.title}
        </h4>
        {s.template === 'title' || s.template === 'conclusion' ? (
          <ul className="space-y-3">
            {s.bullets.map((b, i) => (
              <li key={i} className="flex gap-3" style={{ color: st.bodyColor, fontSize: `${st.bodyFontPx}px` }}>
                <span className="text-orange-300 shrink-0">•</span>
                <span className="break-keep leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {s.template === 'twoColumn' ? (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-orange-300/25 bg-black/25 p-4 backdrop-blur-sm">
              <p className="text-orange-300 text-sm font-bold mb-2">현황 · 리스크</p>
              <ul className="space-y-2">
                {s.leftColumn.filter(Boolean).map((b, i) => (
                  <li key={i} className="break-keep leading-relaxed" style={{ color: st.bodyColor, fontSize: `${st.bodyFontPx}px` }}>• {b}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-orange-300/25 bg-black/25 p-4 backdrop-blur-sm">
              <p className="text-orange-300 text-sm font-bold mb-2">과제 · 개선</p>
              <ul className="space-y-2">
                {s.rightColumn.filter(Boolean).map((b, i) => (
                  <li key={i} className="break-keep leading-relaxed" style={{ color: st.bodyColor, fontSize: `${st.bodyFontPx}px` }}>• {b}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
        {s.template === 'chart' ? (
          <div className="space-y-3 mt-2">
            {s.chartLabels.map((label, i) => {
              const v = s.chartValues[i] ?? 0;
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm text-slate-200 mb-1">
                    <span>{label}</span>
                    <span className="font-mono text-orange-200">{v}</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-amber-300 rounded-full transition-all" style={{ width: `${Math.min(100, v)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
        {s.philosophyNote ? (
          <div className="mt-5 rounded-2xl border border-cyan-500/25 bg-cyan-950/30 p-4 text-left">
            <p className="text-cyan-200 text-xs font-bold uppercase tracking-wider mb-2">철학 · 전문 해설</p>
            <p className="text-slate-100 text-sm md:text-base leading-relaxed whitespace-pre-line">{s.philosophyNote}</p>
          </div>
        ) : null}
        {s.caseStudy ? (
          <div className="mt-3 rounded-2xl border border-amber-400/30 bg-amber-950/20 p-4 text-left">
            <p className="text-amber-200 text-xs font-bold uppercase tracking-wider mb-2">Case Study</p>
            <p className="text-slate-100 text-sm md:text-base leading-relaxed whitespace-pre-line">{s.caseStudy}</p>
          </div>
        ) : null}
        {s.presenterScript?.trim() ? (
          <div className="mt-3 rounded-2xl border border-violet-400/25 bg-violet-950/25 p-3 text-left">
            <p className="text-violet-200 text-[10px] font-bold uppercase tracking-wider mb-1">발표 스크립트</p>
            <p className="text-slate-200 text-xs leading-relaxed line-clamp-6 whitespace-pre-line">{s.presenterScript}</p>
          </div>
        ) : null}
        <div className="mt-auto pt-6 flex justify-between text-[10px] text-slate-500 border-t border-white/10">
          <span>{FOOTER_BRAND}</span>
          <span className="text-orange-300/80 font-mono">{slideIdx + 1} / {slides.length}</span>
        </div>
      </div>
    );
  };

  return (
    <section className="relative z-10 py-14 px-4 w-full max-w-6xl mx-auto min-h-screen">
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

          <div className="rounded-3xl border border-orange-300/30 bg-gradient-to-br from-[#070f24] to-[#1a1035] overflow-hidden">
            <div className="px-6 py-4 border-b border-orange-300/20 flex flex-col gap-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-orange-300 text-xs tracking-widest uppercase font-bold">PPT Studio · 10+ 슬라이드 · 풀 에디터</p>
                  <h3 className="text-white text-2xl font-black">원고·제목 기반 슬라이드 · 발표 스크립트 동기화</h3>
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

            <div className="p-5 grid lg:grid-cols-[1fr_320px] gap-5">
              <div>
                <div className="flex gap-2 mb-3 flex-wrap">
                  <input
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    placeholder="세션 제목 (원고 없을 때 최소 한 줄)"
                    className="flex-1 min-w-[200px] px-4 py-3 rounded-xl bg-[#111d3d]/70 border border-orange-300/30 text-white placeholder:text-slate-500"
                  />
                  <button
                    onClick={generateScenarioSlides}
                    disabled={genLoading || (!topicInput.trim() && !sourceText.trim())}
                    className="px-4 py-3 rounded-xl bg-gradient-to-r from-[#f97316] to-[#fb923c] font-bold text-white disabled:opacity-50"
                  >
                    {genLoading ? 'AI 생성 중' : 'AI로 10장+ 생성'}
                  </button>
                </div>
                <input
                  ref={deckSourceInputRef}
                  type="file"
                  accept=".txt,.md,.markdown,text/plain"
                  className="hidden"
                  onChange={onDeckSourceFile}
                />
                <div className="mb-4 rounded-xl border border-orange-300/20 bg-[#0a1228]/80 p-3 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => deckSourceInputRef.current?.click()}
                      className="px-3 py-2 rounded-lg border border-orange-300/40 text-orange-100 text-xs font-bold inline-flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" /> 원고 업로드 (.txt / .md)
                    </button>
                    {(sourceFileName || sourceText) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSourceText('');
                          setSourceFileName('');
                        }}
                        className="px-3 py-2 rounded-lg border border-slate-600 text-slate-400 text-xs font-bold"
                      >
                        원고 비우기
                      </button>
                    )}
                    {sourceFileName ? (
                      <span className="text-[11px] text-slate-400 truncate max-w-[200px]" title={sourceFileName}>
                        {sourceFileName}
                      </span>
                    ) : null}
                  </div>
                  <label className="text-[11px] text-slate-500 block">원고 텍스트 (업로드 또는 직접 붙여넣기 · AI는 이 범위 밖 지식을 쓰지 않도록 요청됩니다)</label>
                  <textarea
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value.slice(0, 200_000))}
                    rows={4}
                    placeholder="여기에 붙여넣거나 파일을 업로드하세요."
                    className="w-full rounded-lg bg-[#111d3d]/90 border border-orange-300/25 text-slate-100 text-xs py-2 px-2 placeholder:text-slate-600 resize-y min-h-[88px]"
                  />
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
                        <div className="relative z-10 flex-1 min-h-0 overflow-y-auto p-5 sm:p-7">
                          {renderSlidePreview()}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
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

              <div className="rounded-2xl border border-orange-300/25 bg-[#0a1630]/90 p-4 space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto">
                <p className="text-orange-200 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <GripVertical className="w-4 h-4" /> 슬라이드 편집
                </p>
                <button
                  type="button"
                  onClick={deleteCurrentSlide}
                  disabled={slides.length <= 1}
                  className="w-full py-2 rounded-lg border border-red-500/40 text-red-300 text-xs font-bold disabled:opacity-40 flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> 현재 슬라이드 삭제
                </button>
                <label className="text-[11px] text-slate-400">마스터 템플릿</label>
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
                <label className="text-[11px] text-slate-400">부제 / 라벨</label>
                <input
                  value={currentSlide.subtitle}
                  onChange={(e) => updateCurrentSlide({ subtitle: e.target.value })}
                  className="w-full rounded-lg bg-[#111d3d] border border-orange-300/30 text-white text-sm py-2 px-2"
                />
                <label className="text-[11px] text-slate-400">제목</label>
                <textarea
                  value={currentSlide.title}
                  onChange={(e) => updateCurrentSlide({ title: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg bg-[#111d3d] border border-orange-300/30 text-white text-sm py-2 px-2"
                />
                {(currentSlide.template === 'title' || currentSlide.template === 'conclusion') && (
                  <>
                    <label className="text-[11px] text-slate-400">불릿 (줄바꿈으로 구분)</label>
                    <textarea
                      value={currentSlide.bullets.join('\n')}
                      onChange={(e) =>
                        updateCurrentSlide({
                          bullets: e.target.value.split('\n').map((l) => l.trim()).filter(Boolean),
                        })
                      }
                      rows={5}
                      className="w-full rounded-lg bg-[#111d3d] border border-orange-300/30 text-white text-sm py-2 px-2"
                    />
                  </>
                )}
                {currentSlide.template === 'twoColumn' && (
                  <>
                    <label className="text-[11px] text-slate-400">좌측 컬럼 (줄바꿈)</label>
                    <textarea
                      value={currentSlide.leftColumn.join('\n')}
                      onChange={(e) =>
                        updateCurrentSlide({
                          leftColumn: e.target.value.split('\n').map((l) => l.trim()).filter(Boolean),
                        })
                      }
                      rows={4}
                      className="w-full rounded-lg bg-[#111d3d] border border-orange-300/30 text-white text-sm py-2 px-2"
                    />
                    <label className="text-[11px] text-slate-400">우측 컬럼 (줄바꿈)</label>
                    <textarea
                      value={currentSlide.rightColumn.join('\n')}
                      onChange={(e) =>
                        updateCurrentSlide({
                          rightColumn: e.target.value.split('\n').map((l) => l.trim()).filter(Boolean),
                        })
                      }
                      rows={4}
                      className="w-full rounded-lg bg-[#111d3d] border border-orange-300/30 text-white text-sm py-2 px-2"
                    />
                  </>
                )}
                {currentSlide.template === 'chart' && (
                  <>
                    <label className="text-[11px] text-slate-400">항목 라벨 (줄바꿈)</label>
                    <textarea
                      value={currentSlide.chartLabels.join('\n')}
                      onChange={(e) => {
                        const labels = e.target.value.split('\n').map((l) => l.trim()).filter(Boolean);
                        const values = labels.map((_, i) => currentSlide.chartValues[i] ?? 50);
                        updateCurrentSlide({ chartLabels: labels, chartValues: values });
                      }}
                      rows={4}
                      className="w-full rounded-lg bg-[#111d3d] border border-orange-300/30 text-white text-sm py-2 px-2"
                    />
                    <label className="text-[11px] text-slate-400">값 0~100 (쉼표 구분, 라벨 순서와 동일)</label>
                    <input
                      value={currentSlide.chartValues.join(',')}
                      onChange={(e) => {
                        const vals = e.target.value.split(',').map((n) => Math.min(100, Math.max(0, parseInt(n.trim(), 10) || 0)));
                        updateCurrentSlide({ chartValues: vals });
                      }}
                      className="w-full rounded-lg bg-[#111d3d] border border-orange-300/30 text-white text-sm py-2 px-2 font-mono"
                      placeholder="68,55,72,48"
                    />
                  </>
                )}
                <label className="text-[11px] text-slate-400">배경 이미지</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => slideBgInputRef.current?.click()}
                    className="flex-1 py-2 rounded-lg border border-orange-300/40 text-orange-100 text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <ImagePlus className="w-3.5 h-3.5" /> 업로드
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateCurrentSlide({ bgImage: pickCuratedBg(currentSlide.template, slideIdx + 3) })
                    }
                    className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 text-xs font-bold"
                  >
                    큐레이션
                  </button>
                </div>
                <label className="text-[11px] text-slate-400">배경 URL (선택)</label>
                <input
                  value={currentSlide.bgImage}
                  onChange={(e) => updateCurrentSlide({ bgImage: e.target.value })}
                  className="w-full rounded-lg bg-[#111d3d] border border-orange-300/30 text-white text-xs py-2 px-2 font-mono"
                  placeholder="https://..."
                />
                <label className="text-[11px] text-slate-400">타이포 · 색상 (캔버스형)</label>
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
                      className="w-full h-9 rounded-lg border border-orange-300/30 bg-[#111d3d] cursor-pointer"
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
                      className="w-full h-9 rounded-lg border border-orange-300/30 bg-[#111d3d] cursor-pointer"
                    />
                  </div>
                </div>
                <label className="text-[11px] text-slate-400">텍스트 정렬</label>
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
                  className="w-full rounded-lg bg-[#111d3d] border border-orange-300/30 text-white text-sm py-2 px-2"
                >
                  <option value="left">좌측</option>
                  <option value="center">중앙</option>
                </select>
                <label className="text-[11px] text-slate-400">철학·해설 (편집)</label>
                <textarea
                  value={currentSlide.philosophyNote ?? ''}
                  onChange={(e) => updateCurrentSlide({ philosophyNote: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg bg-[#111d3d] border border-orange-300/30 text-white text-xs py-2 px-2"
                />
                <label className="text-[11px] text-slate-400">Case Study (편집)</label>
                <textarea
                  value={currentSlide.caseStudy ?? ''}
                  onChange={(e) => updateCurrentSlide({ caseStudy: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg bg-[#111d3d] border border-orange-300/30 text-white text-xs py-2 px-2"
                />
                <label className="text-[11px] text-slate-400">발표 스크립트 (이 슬라이드 전용 · 미리보기와 동기화)</label>
                <textarea
                  value={currentSlide.presenterScript ?? ''}
                  onChange={(e) => updateCurrentSlide({ presenterScript: e.target.value })}
                  rows={5}
                  placeholder="이 슬라이드를 넘길 때 읽을 대본을 적습니다."
                  className="w-full rounded-lg bg-[#111d3d] border border-violet-400/30 text-white text-xs py-2 px-2 placeholder:text-slate-600"
                />
              </div>
            </div>
          </div>

          <div ref={reportRef} className="rounded-3xl border border-orange-300/30 bg-gradient-to-br from-[#07122b] to-[#1a1033] p-6">
            <h3 className="text-white text-2xl font-black mb-2">실시간 인사이트 리포트 (종합 분석형)</h3>
            <p className="text-slate-300 text-sm mb-4">
              텍스트뿐 아니라 이미지·PDF를 업로드하면 AI가 함께 분석합니다. (파일당 최대 4MB, 최대 6개 권장)
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              multiple
              className="hidden"
              onChange={onReportFiles}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mb-3 w-full py-3 rounded-xl border border-dashed border-orange-300/50 text-orange-200 text-sm font-bold hover:bg-orange-500/10"
            >
              이미지 또는 PDF 업로드
            </button>
            {reportFiles.length > 0 && (
              <ul className="mb-3 space-y-1 max-h-28 overflow-y-auto text-xs text-slate-300">
                {reportFiles.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2 bg-[#0b1734]/80 rounded-lg px-2 py-1">
                    <span className="truncate">{f.name}</span>
                    <button type="button" onClick={() => removeReportFile(i)} className="text-red-400 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="grid md:grid-cols-2 gap-3 mb-3">
              <textarea
                value={discussionInput}
                onChange={(e) => setDiscussionInput(e.target.value)}
                rows={6}
                placeholder="토론 요약 텍스트"
                className="w-full rounded-xl bg-[#111d3d]/70 border border-orange-300/30 p-3 text-slate-100 placeholder:text-slate-500"
              />
              <textarea
                value={surveyInput}
                onChange={(e) => setSurveyInput(e.target.value)}
                rows={6}
                placeholder="설문 분석 텍스트"
                className="w-full rounded-xl bg-[#111d3d]/70 border border-orange-300/30 p-3 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <button
              onClick={generateInsightReport}
              disabled={reportLoading}
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-[#f97316] to-[#fb923c] text-white disabled:opacity-50"
            >
              {reportLoading ? '분석 중...' : '종합 리포트 생성'}
            </button>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
              {weaknessScores.map((x) => (
                <div key={x.label} className="rounded-xl border border-orange-300/25 bg-[#0b1734]/70 p-3">
                  <p className="text-xs text-orange-200">{x.label}</p>
                  <p className="text-2xl font-black text-white">{x.value}</p>
                  <div className="h-2 rounded-full bg-slate-800 mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-amber-300" style={{ width: `${x.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-orange-300/25 bg-[#0a1630]/80 p-4 h-[280px]">
                <p className="text-orange-200 text-xs font-bold uppercase tracking-wider mb-2">취약도 분포 (Bar)</p>
                <Bar
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
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { ticks: { color: '#94a3b8', maxRotation: 45, minRotation: 0 }, grid: { color: 'rgba(148,163,184,0.12)' } },
                      y: { min: 0, max: 100, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.12)' } },
                    },
                  }}
                />
              </div>
              <div className="rounded-2xl border border-cyan-500/25 bg-[#0a1630]/80 p-4 h-[280px]">
                <p className="text-cyan-200 text-xs font-bold uppercase tracking-wider mb-2">조직 프로파일 (Radar)</p>
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
                        pointLabels: { color: '#e2e8f0', font: { size: 10 } },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-amber-400/35 bg-gradient-to-r from-amber-950/40 to-orange-950/30 p-5 relative overflow-hidden">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-amber-200 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <Crown className="w-4 h-4" /> 업종 벤치마크 (구독자 전용 인사이트)
                  </p>
                  <p className="text-white text-lg font-black mt-1">
                    귀하의 청렴 종합 지수 <span className="text-orange-300">{userIntegrityIndex}</span>
                    <span className="text-slate-400 text-base font-bold"> vs 동일 업종 평균 {industryBenchmark}</span>
                  </p>
                  <p className="text-slate-300 text-sm mt-2 max-w-xl">
                    구독 시 &quot;동일 업종 평균 대비 갭&quot;, 분기 추이, 부서별 시뮬레이션까지 제공됩니다.
                  </p>
                </div>
                {!subscribed && (
                  <button
                    type="button"
                    onClick={openSubscribe}
                    className="shrink-0 px-4 py-2 rounded-xl bg-white text-black text-sm font-black"
                  >
                    구독 알아보기
                  </button>
                )}
              </div>
              {!subscribed && (
                <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-4 text-center text-slate-400 text-sm blur-[3px] select-none pointer-events-none">
                  상세 비교 데이터는 Standard 구독 후 확인할 수 있습니다.
                </div>
              )}
              {subscribed && (
                <p className="mt-4 text-emerald-200 text-sm font-bold">
                  구독 활성화됨: 동일 업종 평균 대비 약 {Math.max(5, industryBenchmark - userIntegrityIndex)}%p 낮은 구간이 관찰됩니다. 아래 솔루션·정책 제언과 함께 개선 로드맵을 설계하세요.
                </p>
              )}
            </div>

            {reportInsight ? (
              <div className="mt-6 space-y-4">
                {reportInsight.executiveSummary ? (
                  <div className="rounded-2xl border border-orange-300/25 bg-[#0a1630]/70 p-4">
                    <p className="text-orange-200 text-xs font-bold uppercase tracking-wider mb-2">Executive Summary</p>
                    <p className="text-slate-100 leading-relaxed">{reportInsight.executiveSummary}</p>
                  </div>
                ) : null}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-red-400/25 bg-[#1a0f14]/60 p-4">
                    <p className="text-red-200 text-xs font-bold uppercase tracking-wider mb-2">핵심 쟁점</p>
                    <ul className="list-disc pl-5 space-y-2 text-slate-100 text-sm">
                      {reportInsight.keyIssues.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-emerald-400/25 bg-[#0f1a14]/60 p-4">
                    <p className="text-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">솔루션</p>
                    <ul className="list-disc pl-5 space-y-2 text-slate-100 text-sm">
                      {reportInsight.solutions.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="rounded-2xl border border-cyan-400/25 bg-[#0c1528]/70 p-4">
                  <p className="text-cyan-200 text-xs font-bold uppercase tracking-wider mb-2">AI 정책 제언</p>
                  <ul className="list-disc pl-5 space-y-2 text-slate-100 text-sm">
                    {reportInsight.policyRecommendations.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-amber-300/25 bg-[#1a1508]/60 p-4">
                  <p className="text-amber-200 text-xs font-bold uppercase tracking-wider mb-2">추천 교육 과정</p>
                  <ul className="list-disc pl-5 space-y-2 text-slate-100 text-sm">
                    {reportInsight.recommendedCourses.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-orange-300/25 bg-[#0a1630]/70 p-4">
                <p className="text-orange-200 text-xs tracking-wider uppercase font-bold mb-2">분석 메모</p>
                <p className="text-slate-100 whitespace-pre-line leading-relaxed">
                  {reportSummary || '리포트를 생성하면 구조화된 전문 보고서가 표시됩니다.'}
                </p>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={downloadReportPdf}
                className="flex-1 py-3 rounded-xl border border-orange-300/40 text-orange-200 font-bold"
              >
                <FileText className="w-4 h-4 inline mr-1" /> PDF 저장 {subscribed ? '' : '(구독)'}
              </button>
              <button
                type="button"
                onClick={downloadReportImage}
                className="flex-1 py-3 rounded-xl border border-orange-300/40 text-orange-200 font-bold"
              >
                <FileImage className="w-4 h-4 inline mr-1" /> 이미지 저장
              </button>
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
