export const DEFAULT_GALLERY_SECTIONS = [
  { id: '01', titleEn: 'INTRO', titleKo: '주제 소개' },
  { id: '02', titleEn: 'CORE ISSUE', titleKo: '핵심 쟁점' },
  { id: '03', titleEn: 'CASE', titleKo: '사례 분석' },
  { id: '04', titleEn: 'RISK CHECK', titleKo: '위험 요인 점검' },
  { id: '05', titleEn: 'ACTION', titleKo: '실행 방안' },
  { id: '06', titleEn: 'WRAP-UP', titleKo: '정리 및 제언' },
];

function toPaddedId(index) {
  return String(index + 1).padStart(2, '0');
}

function trimOrFallback(value, fallback) {
  if (typeof value !== 'string') return fallback;
  const v = value.trim();
  return v || fallback;
}

export function mapResearchSectionsToGallery(inputSections) {
  const warnings = [];
  const safeInput = Array.isArray(inputSections) ? inputSections : [];

  const mapped = DEFAULT_GALLERY_SECTIONS.map((base, idx) => {
    const src = safeInput[idx];
    if (!src) {
      warnings.push(`sections[${idx}] 없음: 기본 텍스트 사용`);
      return { ...base };
    }

    const rawEn = trimOrFallback(src.title_en, base.titleEn);
    const rawKo = trimOrFallback(src.title_ko, base.titleKo);
    const titleEn = rawEn.length > 96 ? `${rawEn.slice(0, 93)}...` : rawEn;
    const titleKo = rawKo.length > 120 ? `${rawKo.slice(0, 117)}...` : rawKo;

    return {
      id: toPaddedId(idx),
      titleEn,
      titleKo,
    };
  });

  if (safeInput.length > DEFAULT_GALLERY_SECTIONS.length) {
    warnings.push(`초과 섹션 ${safeInput.length - DEFAULT_GALLERY_SECTIONS.length}개는 잘림`);
  }

  return { sections: mapped, warnings };
}
