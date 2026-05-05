# Orchestrator 전용 매뉴얼

## 역할

단계 실행 순서, 재시도, 게이트(pass/fail), 산출물 버전 관리만 담당한다. 본문 작성·디자인 디테일은 하위 에이전트에 위임한다.

## 로드 범위

- `_common.md`
- 이 파일
- (선택) 현재 단계 에이전트의 `입력/출력 스키마` 섹션만 발췌

## 역할별 매뉴얼 파일

`research.md`, `report_draft.md`, `editor.md`, `security.md`, `template_design.md`, `slide_composer.md`, `qa.md` — 실행 단계에 해당 파일만 로드한다.

## 단계 게이트(예시)

| 단계 후 | 통과 조건 |
|--------|-----------|
| Research | 출처 메타데이터 존재, 빈 섹션 없음 |
| Report | 목차·결론·분량 충족 |
| Edit | 금칙어/톤 위반 0건 |
| Security | 민감 패턴 미검출 또는 마스킹 완료 |
| Template | 다크 팔레트·레이아웃 타입 준수 |
| Composer | `objectName` 규칙 위반 0건 |
| QA | 슬라이드 수·파일 오픈 검증 |

## 실패 시

동일 단계 최대 2회 재시도 후 사용자 에스컬레이션 객체를 반환한다.

## 구현 참고

- 파이프라인 실행기: `lib/pptOrchestrator.ts`
- 샘플 실행: `npm run pptx:orchestrator -- "<주제>" [research.json 경로]`
