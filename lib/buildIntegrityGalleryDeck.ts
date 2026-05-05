import pptxgen from 'pptxgenjs';
import { injectMorphIntoPptx } from './pptxInjectMorph';
import { DEFAULT_GALLERY_SECTIONS } from './pptOrchestratorShared.mjs';

const PptxGenJS =
  (pptxgen as unknown as { default?: typeof pptxgen }).default ?? pptxgen;

export type GallerySection = {
  /** 01..06 — Morph 객체 접두와 맞출 것 */
  id: string;
  titleEn: string;
  titleKo: string;
};

const COL = {
  page: '0B0F14',
  card: '151B26',
  stroke: '334155',
  title: 'F8FAFC',
  body: 'E2E8F0',
  accent: 'FDBA74',
} as const;

/** 갤러리(CONTENTS) 좌표 — 인치, LAYOUT_WIDE 기준 */
const GALLERY_BOX: Array<{ x: number; y: number; w: number; h: number }> = [
  { x: 0.42, y: 1.12, w: 4.05, h: 2.45 },
  { x: 4.55, y: 0.95, w: 2.38, h: 2.78 },
  { x: 7.08, y: 1.12, w: 5.82, h: 2.45 },
  { x: 0.42, y: 3.92, w: 4.05, h: 2.45 },
  { x: 4.55, y: 3.8, w: 2.38, h: 2.78 },
  { x: 7.08, y: 3.92, w: 5.82, h: 2.45 },
];

function thumbLayout(focusIdx: number, i: number): { x: number; y: number; w: number; h: number } {
  if (i === focusIdx) {
    return { x: 0.35, y: 1.02, w: 12.62, h: 5.52 };
  }
  const others = [0, 1, 2, 3, 4, 5].filter((j) => j !== focusIdx);
  const pos = others.indexOf(i);
  const gap = 0.1;
  const thumbW = (12.62 - gap * 4) / 5;
  return { x: 0.35 + pos * (thumbW + gap), y: 6.38, w: thumbW, h: 0.98 };
}

function morphObjectNames(id: string): { bg: string; txt: string } {
  return {
    bg: `!!Frame${id}_bg`,
    txt: `!!Frame${id}_txt`,
  };
}

type PptxSlide = ReturnType<InstanceType<typeof PptxGenJS>['addSlide']>;

function addGalleryFrame(
  slide: PptxSlide,
  pptx: InstanceType<typeof PptxGenJS>,
  section: GallerySection,
  box: { x: number; y: number; w: number; h: number },
  fontFace: string,
) {
  const names = morphObjectNames(section.id);
  slide.addShape(pptx.ShapeType.roundRect, {
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    objectName: names.bg,
    rectRadius: 0.08,
    fill: { color: COL.card },
    line: { color: COL.stroke, width: 1 },
    shadow: { type: 'outer', color: '000000', opacity: 0.35, blur: 6, offset: 3, angle: 270 },
  });

  const label = `${section.id}`.padStart(2, '0');
  slide.addText(
    [
      { text: `${label}\n`, options: { fontSize: 13, bold: true, color: COL.accent, fontFace } },
      { text: `${section.titleEn}\n`, options: { fontSize: 11, color: COL.title, fontFace } },
      { text: section.titleKo, options: { fontSize: 10, color: COL.body, fontFace } },
    ],
    {
      objectName: names.txt,
      x: box.x + 0.12,
      y: box.y + 0.12,
      w: box.w - 0.24,
      h: box.h - 0.2,
      valign: 'top',
      fontFace,
    },
  );
}

export const defaultIntegrityGallerySections: GallerySection[] =
  DEFAULT_GALLERY_SECTIONS.map((s) => ({
    id: String(s.id),
    titleEn: String(s.titleEn),
    titleKo: String(s.titleKo),
  }));

export type GalleryDeckHeadings = {
  /** 기본 `CONTENTS` */
  deckTitle?: string;
  /** 상단 부제(주제 한 줄 등) */
  deckSubtitle?: string;
  /** 파일 메타 제목 */
  pptxTitle?: string;
};

/** 생성된 덱 슬라이드(최대 6장)의 제목·부제로 갤러리 칸 텍스트만 덮어쓴다. Morph용 id·개수는 유지. */
export function mergeGallerySectionsWithSlides(
  slides: Array<{ title: string; subtitle: string }>,
): GallerySection[] {
  return defaultIntegrityGallerySections.map((def, i) => {
    const sl = slides[i];
    if (!sl) return def;
    const titleEn = (sl.subtitle || '').trim() || def.titleEn;
    const titleKo = (sl.title || '').trim() || def.titleKo;
    return {
      ...def,
      titleEn: titleEn.length > 96 ? `${titleEn.slice(0, 93)}...` : titleEn,
      titleKo: titleKo.length > 120 ? `${titleKo.slice(0, 117)}...` : titleKo,
    };
  });
}

/**
 * 다크 갤러리 목차 + 섹션별 줌 레이아웃(동일 Morph 이름) PPTX 생성.
 */
export async function buildIntegrityGalleryDeck(
  sections: GallerySection[] = defaultIntegrityGallerySections,
  headings?: GalleryDeckHeadings,
): Promise<ArrayBuffer> {
  if (sections.length !== 6) {
    throw new Error('buildIntegrityGalleryDeck: 현재 레이아웃은 6개 섹션을 기대합니다.');
  }

  const deckTitle = headings?.deckTitle?.trim() || 'CONTENTS';
  const deckSubtitle =
    headings?.deckSubtitle?.trim() || '영상 속 청렴 이야기 · 다크 갤러리 템플릿';

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Ethics-Core AI';
  pptx.title = headings?.pptxTitle?.trim() || 'Integrity stories — dark gallery (Morph)';
  const fontFace = 'Malgun Gothic';

  const addChrome = (slide: ReturnType<typeof pptx.addSlide>) => {
    slide.background = { color: COL.page };
    slide.addText(deckTitle, {
      x: 0.42,
      y: 0.28,
      w: 12,
      h: 0.55,
      fontSize: deckTitle.length > 14 ? 26 : 32,
      bold: true,
      color: COL.title,
      fontFace,
    });
    slide.addText(deckSubtitle, {
      x: 0.42,
      y: 0.72,
      w: 12,
      h: 0.35,
      fontSize: 12,
      color: COL.body,
      fontFace,
    });
  };

  const gallerySlide = pptx.addSlide();
  addChrome(gallerySlide);
  sections.forEach((sec, i) => {
    addGalleryFrame(gallerySlide, pptx, sec, GALLERY_BOX[i]!, fontFace);
  });

  for (let focus = 0; focus < 6; focus++) {
    const s = pptx.addSlide();
    addChrome(s);
    sections.forEach((sec, i) => {
      const box = thumbLayout(focus, i);
      addGalleryFrame(s, pptx, sec, box, fontFace);
    });
    s.addNotes(
      `Morph: 이전 슬라이드와 동일한 선택 창 이름(!!FrameXX_bg/txt)으로 전환됩니다. 포커스 섹션 ${sections[focus]!.id}.`,
    );
  }

  const raw = await pptx.write({ outputType: 'arraybuffer' });
  return injectMorphIntoPptx(raw as ArrayBuffer);
}
