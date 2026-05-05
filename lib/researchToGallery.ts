import { type GallerySection } from '@/lib/buildIntegrityGalleryDeck';
import { mapResearchSectionsToGallery } from '@/lib/pptOrchestratorShared.mjs';

/** `agents/manuals/research.md` 출력 스키마와 정합 */
export type ResearchSectionInput = {
  id?: string;
  order?: number;
  title_en: string;
  title_ko: string;
  one_line?: string;
  evidence_types?: string[];
};

export type ResearchOutputInput = {
  topic: string;
  sections: ResearchSectionInput[];
};

export type GalleryFromResearchResult = {
  sections: GallerySection[];
  /** Research `topic` — 갤러리 부제·파일명에 사용 */
  topic: string;
  warnings: string[];
};

export class ResearchGalleryParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResearchGalleryParseError';
  }
}

/**
 * Research 단계 JSON → 갤러리 6칸(Morph용 id 01~06 고정).
 * 섹션이 6개 미만이면 나머지는 기본 목차로 채운다.
 */
export function researchOutputToGallerySections(
  data: ResearchOutputInput,
): GalleryFromResearchResult {
  if (!Array.isArray(data.sections) || data.sections.length === 0) {
    throw new ResearchGalleryParseError('sections 배열이 비어 있거나 없습니다.');
  }
  const mapped = mapResearchSectionsToGallery(data.sections) as {
    sections: GallerySection[];
    warnings: string[];
  };

  return {
    sections: mapped.sections,
    topic: typeof data.topic === 'string' ? data.topic.trim() : '',
    warnings: mapped.warnings,
  };
}

/** Research JSON 문자열을 검증·변환한다. */
export function parseResearchJsonToGallery(text: string): GalleryFromResearchResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new ResearchGalleryParseError('JSON 파싱에 실패했습니다.');
  }
  if (typeof raw !== 'object' || raw === null) {
    throw new ResearchGalleryParseError('루트는 객체여야 합니다.');
  }
  const r = raw as Record<string, unknown>;
  if (!Array.isArray(r.sections)) {
    throw new ResearchGalleryParseError('최상위에 sections 배열이 필요합니다.');
  }

  const topic = typeof r.topic === 'string' ? r.topic : '';

  const sections: ResearchSectionInput[] = r.sections.map((item, idx) => {
    if (typeof item !== 'object' || item === null) {
      throw new ResearchGalleryParseError(`sections[${idx}]는 객체여야 합니다.`);
    }
    const o = item as Record<string, unknown>;
    const title_en = typeof o.title_en === 'string' ? o.title_en : '';
    const title_ko = typeof o.title_ko === 'string' ? o.title_ko : '';
    if (!title_en.trim() && !title_ko.trim()) {
      throw new ResearchGalleryParseError(
        `sections[${idx}]: title_en 또는 title_ko 중 하나는 비어 있지 않아야 합니다.`,
      );
    }
    return {
      id: typeof o.id === 'string' ? o.id : undefined,
      order: typeof o.order === 'number' ? o.order : undefined,
      title_en,
      title_ko,
      one_line: typeof o.one_line === 'string' ? o.one_line : undefined,
      evidence_types: Array.isArray(o.evidence_types)
        ? o.evidence_types.filter((x): x is string => typeof x === 'string')
        : undefined,
    };
  });

  return researchOutputToGallerySections({ topic, sections });
}
