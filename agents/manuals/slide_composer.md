# Slide Composer 전용 매뉴얼

## 역할

Template Design 토큰과 섹션 메타를 받아 **PptxGenJS**로 슬라이드를 조립하고, Morph용 OOXML 주입은 공용 유틸 `pptxInjectMorph`에 위임한다.

## 구현 기준(이 저장소)

- 생성: `lib/buildIntegrityGalleryDeck.ts` (`mergeGallerySectionsWithSlides`로 미리보기 덱의 `title`/`subtitle`을 갤러리 6칸에 매핑 가능)
- Morph 주입: `lib/pptxInjectMorph.ts` (PptxGenJS는 전환 API가 없어 **ZIP 후처리**로 `p:morph` 삽입)
- Research JSON: `lib/researchToGallery.ts` → `GallerySection[]` (Facilitator **Research JSON → 갤러리** 입력과 동일)

## 객체 이름

- `template_design.md`의 `!!Frame{n}_bg`, `!!Frame{n}_txt`를 그대로 `objectName`에 넣는다.
- 한 슬라이드 내에서 이름 중복 금지.

## 슬라이드 순서(갤러리 → 줌)

1. CONTENTS 갤러리(모든 프레임 갤러리 좌표)
2. 각 섹션마다 1장: 포커스 프레임은 크게, 나머지는 하단 썸네일 크기로 **같은 이름 유지**

## 검수 체크리스트

- [ ] `LAYOUT_WIDE` (13.33×7.5인치)
- [ ] 배경 `0B0F14`
- [ ] 모든 Morph 대상 슬라이드에 동일 12개 객체 존재(6×bg + 6×txt)
- [ ] 보내기 전 `injectMorphIntoPptx` 호출

## 읽지 않는 것

Research/Report 본문 전체. **섹션 제목·부제·순번** 필드만 입력으로 받는다.
