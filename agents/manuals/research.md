# Research 전용 매뉴얼

## 역할

주제에서 **목차 후보·섹션 제목·한 줄 요지·필요 근거 유형**만 추출한다. PPT 레이아웃·문장 다듬기는 하지 않는다.

## 출력 스키마 (예시)

```json
{
  "topic": "string",
  "sections": [
    {
      "id": "string",
      "order": 1,
      "title_en": "string",
      "title_ko": "string",
      "one_line": "string",
      "evidence_types": ["statute", "survey", "news", "internal_policy"]
    }
  ],
  "sources": [{ "label": "string", "url_or_ref": "string", "retrieved_at": "ISO-8601" }]
}
```

## 품질 규칙

- 섹션 수는 보통 5~8개. 사용자가 지정하면 그에 따른다.
- 제목은 **한국어 + 짧은 영문 부제** 형태를 우선한다.
- 실제 URL이 없으면 `sources`는 비우고 `evidence_types`만 제안한다.

## 금지

슬라이드 좌표, 색상 코드, Morph 이름 등 **템플릿/컴포저 영역**을 출력하지 않는다.

## 구현 참고

동일 스키마를 `lib/researchToGallery.ts`의 `parseResearchJsonToGallery` / `researchOutputToGallerySections`가 갤러리 6칸(`GallerySection`)으로 변환한다.
