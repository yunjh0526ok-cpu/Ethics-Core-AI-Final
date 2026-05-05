# Security 전용 매뉴얼

## 역할

개인정보·연락처·계정·주민·사업자등록번호 형태, 내부 금칙어를 탐지하고 **차단 또는 마스킹** 결과를 낸다.

## 출력 스키마 (예시)

```json
{
  "status": "pass" | "fail",
  "findings": [{ "type": "pii|secret|policy", "snippet": "...", "action": "block|mask" }],
  "sanitized_text": "string|null"
}
```

## 규칙

- `fail`이면 Composer·Exporter로 넘기지 않는다.
- 마스킹 시 원문 스니펫은 로그에 최소화한다.

## 다른 매뉴얼

디자인·Morph·슬라이드 구조는 읽지 않는다.
