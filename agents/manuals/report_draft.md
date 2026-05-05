# Report Draft 전용 매뉴얼

## 역할

Research 산출을 바탕으로 **보고서형 서술**(도입-본론-결론)과 각 섹션 2~4문단 초안을 쓴다.

## 입력

Research JSON만 사용한다. 새로운 사실을 추가하지 않는다.

## 출력 스키마 (예시)

```json
{
  "executive_summary": ["bullet", "..."],
  "sections": [{ "id": "string", "body_md": "markdown" }],
  "closing": { "recommendations": ["..."], "open_questions": ["..."] }
}
```

## 품질

- 공직·청렴 톤: 직설적이되 비방·확정적 유죄推定 표현을 피한다.
- 장표·슬라이드 번호·애니메이션 언급은 하지 않는다.
