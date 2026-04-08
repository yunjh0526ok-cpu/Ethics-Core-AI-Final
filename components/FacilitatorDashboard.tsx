import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, createUserContent, createPartFromText, createPartFromBase64 } from '@google/genai';
import PptxGenJS from 'pptxgenjs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  ArrowLeft, Play, Copy, Check, ChevronLeft, ChevronRight, Sparkles, Lock, Download,
  FileImage, FileText, Trash2, LayoutTemplate, GripVertical,
} from 'lucide-react';

type Category = 'integrity' | 'workshop' | 'teambuilding' | 'party';
type OrgType = 'public' | 'local' | 'enterprise';
type QuizPack = 'basic' | 'advanced' | 'case';
type Step = 'dashboard' | 'lobby';
export type SlideTemplate = 'title' | 'twoColumn' | 'chart' | 'conclusion';

interface Session {
  id: string;
  title: string;
  category: Category;
  code: string;
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
}

const ai = import.meta.env.VITE_GEMINI_API_KEY ? new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY }) : null;
const generateCode = () => `ECO-${Math.floor(1000 + Math.random() * 9000)}`;

const FOOTER_BRAND = 'Ethics-Core AI · EcoStage';

const BG_BY_TEMPLATE: Record<SlideTemplate, string> = {
  title: 'https://source.unsplash.com/1600x900/?government,city,night',
  twoColumn: 'https://source.unsplash.com/1600x900/?ethics,documents,office',
  chart: 'https://source.unsplash.com/1600x900/?dashboard,data,monitoring',
  conclusion: 'https://source.unsplash.com/1600x900/?teamwork,success,meeting',
};

function emptyDeckFromTopic(topic: string): DeckSlide[] {
  return [
    {
      template: 'title',
      title: topic ? `${topic}` : '청렴 교육 오프닝',
      subtitle: '타이틀 슬라이드',
      bullets: ['교육 목표와 기대 효과', '오늘의 핵심 키워드 3가지', '세션 운영 방식 안내'],
      leftColumn: [''],
      rightColumn: [''],
      chartLabels: ['이해충돌', '갑질', '투명성', '금품'],
      chartValues: [68, 55, 72, 48],
      bgImage: BG_BY_TEMPLATE.title,
    },
    {
      template: 'twoColumn',
      title: topic ? `${topic} — 현황 vs 과제` : '현황과 과제',
      subtitle: '투 컬럼',
      bullets: [],
      leftColumn: ['규정·제도는 존재하나 현장 실행이 제각각', '민원·내부 신고 대응 일관성 부족'],
      rightColumn: ['설명 가능한 결정 로그 표준화 필요', '관리자 공통 체크리스트·교차검증 도입'],
      chartLabels: [],
      chartValues: [],
      bgImage: BG_BY_TEMPLATE.twoColumn,
    },
    {
      template: 'chart',
      title: topic ? `${topic} — 리스크 프로파일` : '조직 리스크 프로파일',
      subtitle: '차트 슬라이드',
      bullets: [],
      leftColumn: [],
      rightColumn: [],
      chartLabels: ['이해충돌', '갑질·괴롭힘', '금품·향응', '의사결정 투명성'],
      chartValues: [72, 58, 52, 69],
      bgImage: BG_BY_TEMPLATE.chart,
    },
    {
      template: 'conclusion',
      title: topic ? `${topic} — 실행 과제` : '결론 · Next Step',
      subtitle: '결론 슬라이드',
      bullets: ['즉시: 결정 로그 템플릿·신고 채널 재공지', '2주: 부서장 체크리스트 파일럿', '분기: 취약도 재측정·리포트 공유'],
      leftColumn: [],
      rightColumn: [],
      chartLabels: [],
      chartValues: [],
      bgImage: BG_BY_TEMPLATE.conclusion,
    },
  ];
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
    chartLabels = ['이해충돌', '갑질', '투명성', '금품'];
    chartValues = [68, 58, 72, 52];
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
    bgImage: BG_BY_TEMPLATE[tpl],
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

const FacilitatorDashboard: React.FC = () => {
  const [step, setStep] = useState<Step>('dashboard');
  const [session, setSession] = useState<Session | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(['integrity']);
  const [selectedOrgType, setSelectedOrgType] = useState<OrgType>('public');
  const [selectedQuizPack, setSelectedQuizPack] = useState<QuizPack>('basic');
  const [topicInput, setTopicInput] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [slides, setSlides] = useState<DeckSlide[]>(defaultSlides);
  const [slideIdx, setSlideIdx] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [discussionInput, setDiscussionInput] = useState('');
  const [surveyInput, setSurveyInput] = useState('');
  const [reportSummary, setReportSummary] = useState('');
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

  const isAdminUnlocked = typeof window !== 'undefined' && sessionStorage.getItem('eco_admin_auth') === '1';
  const isStandardPlan = typeof window !== 'undefined' && localStorage.getItem('eca_plan') === 'standard';
  const premiumEnabled = isAdminUnlocked || isStandardPlan;

  const currentSlide = slides[slideIdx];

  const updateCurrentSlide = useCallback((patch: Partial<DeckSlide>) => {
    setSlides((prev) => {
      const next = [...prev];
      next[slideIdx] = { ...next[slideIdx], ...patch };
      return next;
    });
  }, [slideIdx]);

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
    if (!topicInput.trim()) return;
    if (!premiumEnabled) return setShowUpgradeModal(true);
    setGenLoading(true);
    try {
      if (!ai) throw new Error('no key');
      const prompt = `주제: ${topicInput}
청렴 교육 발표용 슬라이드 정확히 4장을 JSON 배열로 생성하세요. 순서 고정:
1) template "title"
2) template "twoColumn"
3) template "chart"
4) template "conclusion"

스키마 예시:
[
 {"template":"title","title":"...","subtitle":"...","bullets":["","",""]},
 {"template":"twoColumn","title":"...","subtitle":"...","leftColumn":["",""],"rightColumn":["",""]},
 {"template":"chart","title":"...","subtitle":"...","chartLabels":["","","",""],"chartValues":[60,70,55,65]},
 {"template":"conclusion","title":"...","subtitle":"...","bullets":["","",""]}
]
chartValues는 0~100 정수. 한국어로 간결하게. JSON만 출력.`;
      const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      const text = res.text || '';
      const matched = text.match(/\[[\s\S]*\]/);
      if (!matched) throw new Error('format');
      const parsed = JSON.parse(matched[0]) as Record<string, unknown>[];
      setSlides(parsed.slice(0, 4).map((row, i) => normalizeAiSlide(row, i)));
      setSlideIdx(0);
    } catch {
      setSlides(emptyDeckFromTopic(topicInput));
      setSlideIdx(0);
    } finally {
      setGenLoading(false);
    }
  };

  const exportPpt = async () => {
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
          x: 0.9, y: contentTop, w: 11.5, h: 3.8,
          chartColors: ['F97316', 'FB923C', 'FDBA74', 'EA580C'],
          barDir: 'col',
          showTitle: false,
          showLegend: false,
          valAxisMaxVal: 100,
        });
      }
    });

    await pptx.writeFile({ fileName: `ECA_${(topicInput || 'scenario').replace(/\s+/g, '_')}.pptx` });
  };

  const buildLocalInsight = (rawText: string) => {
    const tokens = ['특혜', '청탁', '갑질', '불공정', '은폐', '불신', '침묵', '보복'];
    const found = tokens.filter((t) => rawText.includes(t));
    const k = found.length ? found.join(', ') : '이해충돌, 의사결정 불투명, 피드백 단절';
    return `심층 분석 결과 (텍스트·업로드 자료 종합):\n\n` +
      `• 부패 취약 키워드: ${k}\n` +
      `• 조직 문화: 부서별 기준 편차, 보고 지연 패턴이 관찰될 수 있습니다.\n` +
      `• 교육생 고충: 보복 우려로 문제 제기를 주저할 수 있습니다.\n` +
      `• 제언: 사례형 반복 훈련, 관리자 체크리스트, 익명 피드백 채널을 병행하세요.\n` +
      `• 업로드 파일이 있는 경우 내용을 반영해 상기를 조정하세요.`;
  };

  const generateInsightReport = async () => {
    if (!premiumEnabled) return setShowUpgradeModal(true);
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

      if (!ai) {
        setReportSummary(buildLocalInsight(rawText));
        return;
      }

      if (!rawText && files.length === 0) {
        setReportSummary('토론·설문 텍스트 또는 이미지/PDF 파일을 업로드한 뒤 다시 생성해 주세요.');
        return;
      }

      const parts: ReturnType<typeof createPartFromText>[] = [];
      const intro = `다음은 공공기관 청렴 교육 세션의 종합 분석 자료입니다. ` +
        `텍스트와 첨부 이미지·PDF를 모두 반영해 요약하세요.\n` +
        `출력 형식:\n` +
        `1) 부패 취약 키워드/표현\n` +
        `2) 조직 문화 특징\n` +
        `3) 교육생 고충·불만 신호\n` +
        `4) 구체적 개선 제언 (실행 가능한 행동 위주)\n` +
        `한국어로 전문 보고서 톤으로 작성하세요.\n\n`;
      parts.push(createPartFromText(intro));
      if (rawText) parts.push(createPartFromText(`[직접 입력 텍스트]\n${rawText}`));

      for (const f of files) {
        if (f.size > MAX_BYTES) {
          parts.push(createPartFromText(`(파일 ${f.name}: 용량 초과로 건너뜀 — 4MB 이하만 분석)`));
          continue;
        }
        const b64 = await fileToBase64(f);
        const mime = mimeForFile(f);
        if (mime.startsWith('image/') || mime === 'application/pdf') {
          parts.push(createPartFromBase64(b64, mime));
          parts.push(createPartFromText(`(위 첨부 파일명: ${f.name})`));
        } else {
          parts.push(createPartFromText(`(미지원 형식 건너뜀: ${f.name})`));
        }
      }

      const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: createUserContent(parts),
      });
      setReportSummary(res.text || buildLocalInsight(rawText));
    } catch {
      setReportSummary(buildLocalInsight(rawText));
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
    return (
      <div className="relative z-10 flex flex-col min-h-[360px]">
        <p className="text-orange-200 uppercase text-xs tracking-[0.2em] font-bold mb-2 flex items-center gap-2">
          <LayoutTemplate className="w-4 h-4" /> {s.subtitle} · {s.template}
        </p>
        <h4 className="text-white text-3xl md:text-5xl font-black leading-tight mb-6">{s.title}</h4>
        {s.template === 'title' || s.template === 'conclusion' ? (
          <ul className="space-y-3">
            {s.bullets.map((b, i) => (
              <li key={i} className="text-slate-100 text-lg md:text-xl flex gap-3">
                <span className="text-orange-300 shrink-0">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {s.template === 'twoColumn' ? (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-orange-300/25 bg-black/20 p-4">
              <p className="text-orange-300 text-sm font-bold mb-2">현황 · 리스크</p>
              <ul className="space-y-2">
                {s.leftColumn.filter(Boolean).map((b, i) => (
                  <li key={i} className="text-slate-100 text-base md:text-lg">• {b}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-orange-300/25 bg-black/20 p-4">
              <p className="text-orange-300 text-sm font-bold mb-2">과제 · 개선</p>
              <ul className="space-y-2">
                {s.rightColumn.filter(Boolean).map((b, i) => (
                  <li key={i} className="text-slate-100 text-base md:text-lg">• {b}</li>
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
            <div className="px-6 py-4 border-b border-orange-300/20 flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-orange-300 text-xs tracking-widest uppercase font-bold">PPT Studio · 4 Master Templates</p>
                <h3 className="text-white text-2xl font-black">타이틀 · 투컬럼 · 차트 · 결론</h3>
              </div>
              <div className="text-sm text-slate-300 font-mono">
                {slideIdx + 1} / {slides.length}
              </div>
            </div>

            <div className="p-5 grid lg:grid-cols-[1fr_320px] gap-5">
              <div>
                <div className="flex gap-2 mb-4 flex-wrap">
                  <input
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    placeholder="주제 입력 (예: 인허가 이해충돌 예방)"
                    className="flex-1 min-w-[200px] px-4 py-3 rounded-xl bg-[#111d3d]/70 border border-orange-300/30 text-white placeholder:text-slate-500"
                  />
                  <button
                    onClick={generateScenarioSlides}
                    disabled={genLoading}
                    className="px-4 py-3 rounded-xl bg-gradient-to-r from-[#f97316] to-[#fb923c] font-bold text-white disabled:opacity-50"
                  >
                    {genLoading ? 'AI 생성 중' : 'AI로 4장 생성'}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${slideIdx}-${currentSlide.template}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="relative min-h-[420px] rounded-2xl border border-orange-300/30 overflow-hidden p-8"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-[0.12]"
                      style={{ backgroundImage: `url(${currentSlide.bgImage})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#06112a]/93 via-[#0b1738]/91 to-[#2a1237]/90" />
                    {renderSlidePreview()}
                  </motion.div>
                </AnimatePresence>

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

              <div className="rounded-2xl border border-orange-300/25 bg-[#0a1630]/90 p-4 space-y-3">
                <p className="text-orange-200 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <GripVertical className="w-4 h-4" /> 슬라이드 편집
                </p>
                <label className="text-[11px] text-slate-400">마스터 템플릿</label>
                <select
                  value={currentSlide.template}
                  onChange={(e) => {
                    const tpl = e.target.value as SlideTemplate;
                    updateCurrentSlide({ template: tpl, bgImage: BG_BY_TEMPLATE[tpl] });
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

            <div className="mt-5 rounded-2xl border border-orange-300/25 bg-[#0a1630]/70 p-4">
              <p className="text-orange-200 text-xs tracking-wider uppercase font-bold mb-2">심층 분석 결과</p>
              <p className="text-slate-100 whitespace-pre-line leading-relaxed">
                {reportSummary || '리포트를 생성하면 분석 결과가 표시됩니다.'}
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={downloadReportPdf}
                className="flex-1 py-3 rounded-xl border border-orange-300/40 text-orange-200 font-bold"
              >
                <FileText className="w-4 h-4 inline mr-1" /> PDF 저장
              </button>
              <button
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
            <h4 className="text-white font-black text-2xl mb-2">Standard 플랜 안내</h4>
            <p className="text-slate-300 text-sm mb-3">AI 슬라이드 생성, PPT 내보내기, 멀티모달 리포트 등</p>
            <ul className="text-slate-200 text-sm space-y-1 mb-4">
              <li>- 월 구독: 39,000원</li>
              <li>- 신청: yszoo1467@naver.com / 010-6667-1467</li>
              <li>- 결제 완료 후 관리자 승인 활성화</li>
            </ul>
            <div className="flex gap-2">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  if (isAdminUnlocked) {
                    localStorage.setItem('eca_plan', 'standard');
                    setShowUpgradeModal(false);
                  }
                }}
                className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-[#f97316] to-[#fb923c] text-white disabled:opacity-50"
                disabled={!isAdminUnlocked}
              >
                {isAdminUnlocked ? (
                  '관리자 즉시 활성화'
                ) : (
                  <>
                    <Lock className="inline w-4 h-4 mr-1" />
                    관리자 인증 필요
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default FacilitatorDashboard;
