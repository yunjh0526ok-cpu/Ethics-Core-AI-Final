"use strict";
/**
 * ============================================================
 * Ethics-Core AI — PPT 완전 자동화 도구
 * 사용법: node auto_ppt.cjs "주제"
 * 필요:   GEMINI_API_KEY 환경변수 (또는 프로젝트 루트 .env / .env.local)
 * ============================================================
 * 동작: 주제 입력 → Gemini가 슬라이드 내용+데이터+법령 전부 생성
 *       → 편집 가능한 .pptx 자동 완성 (손댈 것 없음)
 */
 
const { GoogleGenAI } = require("@google/genai");
const pptxgen   = require("pptxgenjs");
const fs        = require("fs");
const path      = require("path");

/** pkg로 만든 .exe는 실행 파일이 있는 폴더를 루트로 씀 */
function appRoot() {
  const r = process.env.AUTO_PPT_APP_ROOT;
  if (r && String(r).trim()) return path.resolve(String(r).trim());
  return __dirname;
}

/** .env / .env.local 에서 아직 비어 있는 키만 채움 (외부 dotenv 없이) */
function loadEnvFiles() {
  const root = appRoot();
  for (const name of [".env.local", ".env"]) {
    const fp = path.join(root, name);
    if (!fs.existsSync(fp)) continue;
    const text = fs.readFileSync(fp, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq <= 0) continue;
      const key = t.slice(0, eq).trim();
      let val = t.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1);
      if (key && (process.env[key] === undefined || String(process.env[key]).trim() === ""))
        process.env[key] = val;
    }
  }
}
loadEnvFiles();

/** GUI에서 stdout으로 단계 전달 (탭 구분, 한 줄) */
function emitProgress(step, msg) {
  if (process.env.PPT_GUI_PROGRESS !== "1") return;
  const safe = String(msg).replace(/\t/g, " ").replace(/\r?\n/g, " ");
  process.stdout.write(`PPT_PROGRESS\t${step}\t${safe}\n`);
  if (typeof process.stdout.flush === "function") process.stdout.flush();
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isRetryableGeminiError(err, rawText) {
  const msg = (err && err.message) ? String(err.message) : String(err || "");
  const blob = msg + String(rawText || "");
  return /503|504|429|UNAVAILABLE|high demand|overloaded|RESOURCE_EXHAUSTED|try again later|temporarily/i.test(
    blob
  );
}

/** GUI JSON → Gemini에 넘길 통합 주제 문자열 */
/** Windows·Node에서 쓸 수 있는 .pptx 파일명 stem (확장자 제외) */
function safeWindowsFileBase(s) {
  let t = String(s || "")
    .replace(/[\x00-\x1f\x7f]/g, " ")
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, " ")
    .trim();
  t = t.replace(/[.\s]+$/g, "");
  t = t.slice(0, 80);
  if (!t) t = `ppt_${Date.now()}`;
  if (/^(con|prn|aux|nul|com\d|lpt\d)$/i.test(t)) t = `${t}_slide`;
  return t;
}

/** GUI 주제란 여러 줄일 때: 첫 줄만 파일명에 쓰고 [포함 키워드] 안내 문구는 제거 */
function fileStemFromGuiConfig(cfg) {
  const blob = String(cfg.topic || "").trim();
  const first =
    blob
      .split(/\r?\n/)
      .map((l) => l.trim())
      .find(Boolean) || "";
  let s = first.replace(/\[\s*포함\s*키워드\s*\]\s*/gi, "").replace(/\s+/g, " ").trim();
  if (!s) s = String(cfg.title || "").trim();
  if (!s) s = "presentation";
  return s;
}

function buildTopicFromConfig(c) {
  const lines = [];
  const topic = (c.topic || "").trim();
  if (topic) lines.push(`주제: ${topic}`);
  const org = (c.organization || "").trim();
  if (org) lines.push(`교육·주관 기관(meta.audience 등에 반영): ${org}`);
  const n = parseInt(String(c.slideCount || c.slides || 0), 10);
  if (n > 0) {
    lines.push(
      `전체 슬라이드는 약 ${n}장 분량에 맞춰 outline·sections·content_slides·data_slides·law_slides·case_slides 개수와 밀도를 설계하세요.`
    );
  }
  const kws = Array.isArray(c.keywords) ? c.keywords : [];
  const flat = kws.map((x) => String(x).trim()).filter(Boolean);
  if (flat.length) lines.push(`반드시 본문에 반영할 키워드: ${flat.join(", ")}`);
  return lines.join("\n") || topic;
}
 
// ── 브랜드 고정값 (절대 바뀌지 않는 것들) ─────────────────
const BRAND = {
  name_kor:  "청렴공정AI센터",
  name_eng:  "Ethics-Core AI",
  slogan:    "INTEGRITY INTELLIGENCE",
  rep:       "주양순 대표  ·  청렴&적극행정 전문강사",
  phone:     "010-6667-1467",
  email:     "yszoo1467@naver.com",
  blog:      "blog.naver.com/yszoo1467",
};
 
const C = {
  bg:"0D1B2A", surface:"132238", border:"1E3A5F", footer:"08101E",
  cyan:"00B4D8", teal:"00F5D4", gold:"C8A96E",
  white:"FFFFFF", muted:"A0B4C8", dim:"5A7A95", darknum:"1A3550",
};
const W=13.33, ML=0.55, FY=6.65, FONT="맑은 고딕";
 
// ══════════════════════════════════════════════════════════
// STEP 1: Gemini에게 슬라이드 전체 내용 생성 요청
// ══════════════════════════════════════════════════════════
async function generateFullContent(topic) {
  console.log(`\n🤖 Gemini가 "${topic}" 전체 내용 분석 중...`);
 
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY(또는 GOOGLE_API_KEY)가 설정되어 있지 않습니다.");
  }
  const ai = new GoogleGenAI({ apiKey });
  const preferred = (process.env.GEMINI_MODEL || "gemini-2.5-flash").trim();
  const modelCandidates = [...new Set([preferred, "gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-2.5-flash"])].filter(
    Boolean
  );
 
  const systemPrompt = `당신은 청렴공정AI센터(Ethics-Core AI) 주양순 대표의 전문 강의 콘텐츠 작성 AI입니다.
주양순 대표의 전문 분야:
- 공익신고자보호법 해설 및 실무
- 청렴·반부패 교육 (공공기관, 지자체)
- 적극행정 면책제도
- 청탁금지법, 이해충돌방지법
- 전) 국민권익위 청렴교실 센터장
- 현) 국토부·복지부 청렴시민감사관
 
규칙:
1. 반드시 실제 법령명·조항·시행연도를 정확하게 인용
2. 통계 수치는 실제 공공기관 데이터 기반으로 현실적으로 작성
3. 사례는 실제 발생한 유사 사례 형태로 구체적으로 작성
4. 강의 대상(공무원, 공공기관 직원)에 맞는 실무적 내용
5. JSON만 출력. 마크다운 블록 없이.`;
 
  const userPrompt = `주제: "${topic}"
 
이 주제로 완성된 강의 PPT 전체 내용을 JSON으로 생성하세요.
슬라이드 내용, 법령, 통계, 사례, 그래프 데이터를 모두 실제로 채워서 출력하세요.
 
{
  "meta": {
    "title": "슬라이드 메인 제목 (줄바꿈은 \\n 사용, 20자 이내)",
    "subtitle": "부제목 (30자 이내)",
    "audience": "교육 대상 (예: 중소벤처기업부 감사실)",
    "duration": "교육 시간 (예: 60분)",
    "year": "2025"
  },
 
  "outline": [
    "목차 항목 1",
    "목차 항목 2",
    "목차 항목 3",
    "목차 항목 4"
  ],
 
  "sections": [
    {
      "num": 1,
      "title": "섹션 제목 (15자 이내)",
      "desc": "섹션 한줄 설명"
    }
  ],
 
  "content_slides": [
    {
      "section": 1,
      "chapter_label": "CHAPTER 01  ›  세부제목",
      "title": "슬라이드 제목",
      "cards": [
        {
          "title": "카드 제목",
          "body": "실제 내용 3~4문장. 법령명, 조항, 구체적 사례 포함.",
          "highlight": "핵심 키워드나 수치 (선택)"
        }
      ]
    }
  ],
 
  "data_slides": [
    {
      "section": 1,
      "chapter_label": "CHAPTER 01  ›  현황",
      "title": "통계 슬라이드 제목",
      "insight": "이 데이터가 말하는 핵심 인사이트 1~2문장",
      "stats": [
        { "num": "실제 수치", "label": "지표 설명", "trend": "↑ 증가" }
      ],
      "chart": {
        "type": "bar",
        "title": "차트 제목",
        "unit": "건",
        "categories": ["2020", "2021", "2022", "2023", "2024"],
        "series": [
          { "name": "시리즈명", "values": [실제값1, 실제값2, 실제값3, 실제값4, 실제값5] }
        ],
        "source": "출처: 국민권익위원회 등 공공기관"
      }
    }
  ],
 
  "law_slides": [
    {
      "chapter_label": "CHAPTER 02  ›  법적 근거",
      "law_name": "법령 정식 명칭",
      "article": "제X조 (조항명)",
      "content": "실제 법령 내용을 풀어서 설명. 2~3문장.",
      "point": "실무적 핵심 포인트",
      "penalty": "위반 시 제재 내용 (해당하는 경우)"
    }
  ],
 
  "case_slides": [
    {
      "chapter_label": "CHAPTER 03  ›  실제 사례",
      "title": "사례 제목",
      "cases": [
        {
          "label": "사례 1",
          "situation": "상황 설명 (구체적으로)",
          "action": "취해진 조치",
          "result": "결과 및 교훈",
          "type": "위반" 
        },
        {
          "label": "사례 2",
          "situation": "상황 설명",
          "action": "취해진 조치",
          "result": "결과 및 교훈",
          "type": "모범"
        }
      ]
    }
  ],
 
  "summary": {
    "title": "핵심 정리",
    "points": [
      { "num": "01", "title": "요점 제목", "body": "실무 적용 핵심 내용 2문장." },
      { "num": "02", "title": "요점 제목", "body": "실무 적용 핵심 내용 2문장." },
      { "num": "03", "title": "요점 제목", "body": "실무 적용 핵심 내용 2문장." }
    ],
    "action_items": [
      "오늘 당장 실천할 것 1",
      "오늘 당장 실천할 것 2",
      "오늘 당장 실천할 것 3"
    ]
  }
}`;
 
  const combined = `${systemPrompt}\n\n---\n\n${userPrompt}`;

  let lastErr = null;
  for (let round = 0; round < 5; round++) {
    if (round > 0) {
      const wait = 2000 + round * 2500;
      emitProgress(2, `02 AI — 일시 부하, ${Math.round(wait / 1000)}초 후 재시도…`);
      console.warn(`[Gemini] ${wait}ms 대기 후 재시도 (round ${round})`);
      await delay(wait);
    }
    for (const m of modelCandidates) {
      try {
        emitProgress(
          2,
          round === 0 ? `02 AI — 요청 중 (${m})` : `02 AI — 재시도 (${m}, ${round + 1}차)`
        );
        const response = await ai.models.generateContent({
          model: m,
          contents: combined,
          config: {
            maxOutputTokens: 8192,
            temperature: 0.6,
          },
        });
        const raw =
          typeof response.text === "function" ? response.text() : response.text;
        const rawTrim = String(raw ?? "").trim();
        if (rawTrim.startsWith("{") && rawTrim.includes('"error"')) {
          let code = 0;
          let emsg = rawTrim;
          try {
            const ej = JSON.parse(rawTrim);
            code = Number(ej?.error?.code || 0);
            emsg = ej?.error?.message || rawTrim;
          } catch (_) {
            /* ignore */
          }
          if (code === 503 || code === 429 || code === 504 || isRetryableGeminiError(new Error(emsg), rawTrim)) {
            lastErr = new Error(emsg);
            console.warn(`[Gemini] 모델 ${m} 오류 응답:`, emsg.slice(0, 200));
            continue;
          }
          throw new Error(emsg.slice(0, 800));
        }
        const clean = rawTrim.replace(/^```json\s*/,"").replace(/\s*```$/,"").trim();
        try {
          const data = JSON.parse(clean);
          emitProgress(3, "03 JSON 검증 완료");
          console.log("✅ 콘텐츠 생성 완료");
          console.log(`   섹션: ${(data.sections||[]).length}개`);
          console.log(`   콘텐츠 슬라이드: ${(data.content_slides||[]).length}개`);
          console.log(`   데이터 슬라이드: ${(data.data_slides||[]).length}개`);
          console.log(`   법령 슬라이드: ${(data.law_slides||[]).length}개`);
          console.log(`   사례 슬라이드: ${(data.case_slides||[]).length}개`);
          return data;
        } catch (e) {
          console.error("❌ JSON 파싱 실패");
          console.error("원본 (앞 500자):", clean.slice(0,500));
          throw e;
        }
      } catch (e) {
        lastErr = e;
        if (!isRetryableGeminiError(e, "")) throw e;
        console.warn(`[Gemini] ${m}:`, e instanceof Error ? e.message : e);
      }
    }
  }
  const msg = lastErr instanceof Error ? lastErr.message : String(lastErr || "알 수 없음");
  throw new Error(
    `Gemini가 여러 번 재시도했지만 응답하지 못했습니다. 잠시 후 다시 시도하세요.\n원인: ${msg.slice(0, 400)}`
  );
}
 
// ══════════════════════════════════════════════════════════
// STEP 2: 슬라이드 공통 요소
// ══════════════════════════════════════════════════════════
function addBg(s)   { s.background = { color: C.bg }; }
function addGrid(s) {
  [1.5,3.0,4.5,6.0].forEach(y =>
    s.addShape("line",{x:0,y,w:W,h:0,line:{color:C.border,width:0.3,transparency:72}}));
}
function addFooter(s, n) {
  s.addShape("rect",{x:0,y:FY,w:W,h:0.85,fill:{color:C.footer},line:{color:C.border,width:0.5}});
  s.addText(BRAND.name_eng,{x:ML,y:FY+0.09,w:3.5,h:0.28,fontSize:7,bold:true,color:C.cyan,fontFace:FONT,margin:0});
  s.addText(BRAND.slogan,{x:0,y:FY+0.09,w:W,h:0.28,fontSize:6,color:C.dim,align:"center",fontFace:FONT,margin:0,charSpacing:2});
  s.addText(`${BRAND.name_kor}  |  ${BRAND.phone}  |  ${BRAND.email}  |  ${BRAND.blog}`,
    {x:0,y:FY+0.46,w:W-0.5,h:0.26,fontSize:5.5,color:C.dim,align:"right",fontFace:FONT,margin:0});
  s.addText(String(n).padStart(2,"0"),{x:W-0.85,y:FY+0.09,w:0.65,h:0.28,
    fontSize:9,bold:true,color:C.muted,align:"right",fontFace:FONT,margin:0});
}
function addLogo(s) {
  s.addShape("hexagon",{x:ML,y:0.18,w:0.54,h:0.54,fill:{color:C.cyan,transparency:15},line:{color:C.teal,width:0.8}});
  s.addShape("hexagon",{x:ML+0.11,y:0.29,w:0.32,h:0.32,fill:{color:C.bg},line:{color:C.teal,width:0}});
  s.addText(BRAND.name_eng,{x:ML+0.65,y:0.18,w:5,h:0.28,fontSize:10.5,bold:true,color:C.white,fontFace:FONT,margin:0});
  s.addText(BRAND.name_kor,{x:ML+0.65,y:0.46,w:5,h:0.22,fontSize:8,color:C.cyan,fontFace:FONT,margin:0});
}
function addChap(s, t) {
  if(t) s.addText(t,{x:ML,y:0.14,w:12,h:0.28,fontSize:7.5,color:C.cyan,fontFace:FONT,margin:0,charSpacing:1});
}
function addTitleBar(s, t) {
  s.addText(t,{x:ML,y:0.52,w:12.2,h:0.62,fontSize:24,bold:true,color:C.white,fontFace:FONT,margin:0});
  s.addShape("rect",{x:ML,y:1.22,w:5.2,h:0.07,fill:{color:C.cyan},line:{color:C.cyan,width:0}});
}
 
// ══════════════════════════════════════════════════════════
// STEP 3: 각 슬라이드 생성 함수
// ══════════════════════════════════════════════════════════
 
// 슬라이드: 타이틀
function makeTitle(prs, meta, n) {
  const s = prs.addSlide(); addBg(s); addGrid(s); addLogo(s);
  s.addShape("line",{x:0,y:1.05,w:W,h:0,line:{color:C.border,width:0.7}});
  s.addText(meta.title,{x:ML,y:1.25,w:8.8,h:3.9,fontSize:34,bold:true,
    color:C.white,fontFace:FONT,margin:0,valign:"top",paraSpaceAfter:8});
  s.addText(meta.subtitle||"",{x:ML,y:4.8,w:8.8,h:0.45,fontSize:16,
    color:C.cyan,fontFace:FONT,margin:0});
  s.addShape("rect",{x:ML,y:5.32,w:2.8,h:0.08,fill:{color:C.cyan},line:{color:C.cyan,width:0}});
  s.addShape("rect",{x:ML+2.9,y:5.32,w:0.9,h:0.08,fill:{color:C.teal},line:{color:C.teal,width:0}});
  s.addText(`${BRAND.slogan} · ${meta.year||"2025"}`,
    {x:ML,y:5.5,w:8.6,h:0.35,fontSize:11,color:C.cyan,fontFace:FONT,margin:0,charSpacing:1});
  s.addText(`교육 대상: ${meta.audience||""}  |  ${meta.duration||""}`,
    {x:ML,y:5.95,w:8,h:0.26,fontSize:10,color:C.dim,fontFace:FONT,margin:0});
  s.addText(BRAND.rep,
    {x:ML,y:6.22,w:8,h:0.26,fontSize:10,color:C.muted,fontFace:FONT,margin:0});
  // 우측 장식
  s.addShape("rect",{x:10.18,y:1.15,w:2.92,h:5.25,fill:{color:C.surface},line:{color:C.border,width:0.5}});
  s.addShape("rect",{x:10.18,y:1.15,w:0.12,h:5.25,fill:{color:C.cyan},line:{color:C.cyan,width:0}});
  s.addShape("rect",{x:10.4,y:1.42,w:2.5,h:4.7,fill:{color:"0A1828"},line:{color:C.border,width:0.3}});
  addFooter(s,n);
}
 
// 슬라이드: 목차
function makeOutline(prs, outline, n) {
  const s = prs.addSlide(); addBg(s); addGrid(s); addLogo(s);
  s.addText("목  차",{x:ML,y:0.52,w:12,h:0.62,fontSize:26,bold:true,color:C.white,fontFace:FONT,margin:0});
  s.addShape("rect",{x:ML,y:1.22,w:3,h:0.07,fill:{color:C.cyan},line:{color:C.cyan,width:0}});
  outline.forEach((item,i)=>{
    const y=1.5+i*1.1;
    s.addShape("rect",{x:ML,y,w:0.45,h:0.45,fill:{color:C.surface},line:{color:C.cyan,width:0.5}});
    s.addText(String(i+1).padStart(2,"0"),{x:ML,y,w:0.45,h:0.45,
      fontSize:11,bold:true,color:C.cyan,align:"center",fontFace:FONT,margin:0});
    s.addText(item,{x:ML+0.6,y:y+0.03,w:11,h:0.38,
      fontSize:16,color:C.white,fontFace:FONT,margin:0});
    s.addShape("line",{x:ML,y:y+0.58,w:W-ML*2,h:0,line:{color:C.border,width:0.3}});
  });
  addFooter(s,n);
}
 
// 슬라이드: 섹션 구분
function makeSection(prs, sec, n) {
  const s = prs.addSlide(); addBg(s); addGrid(s);
  s.addText("0"+sec.num,{x:0.1,y:0.5,w:6.5,h:5.5,fontSize:200,bold:true,
    color:C.darknum,fontFace:FONT,margin:0});
  s.addShape("rect",{x:5.88,y:1.6,w:0.08,h:3.7,fill:{color:C.cyan},line:{color:C.cyan,width:0}});
  s.addText("SECTION  0"+sec.num,{x:6.12,y:1.65,w:7,h:0.35,
    fontSize:8.5,color:C.cyan,fontFace:FONT,margin:0,charSpacing:3});
  s.addText(sec.title,{x:6.12,y:2.18,w:6.8,h:2.8,fontSize:30,bold:true,
    color:C.white,fontFace:FONT,margin:0,valign:"top",paraSpaceAfter:10});
  if(sec.desc) s.addText(sec.desc,{x:6.12,y:5.15,w:6.8,h:0.55,
    fontSize:12,color:C.muted,fontFace:FONT,margin:0});
  addFooter(s,n);
}
 
// 슬라이드: 3단 카드 콘텐츠
function makeContent(prs, cs, n) {
  const s = prs.addSlide(); addBg(s); addGrid(s); addLogo(s);
  addChap(s, cs.chapter_label); addTitleBar(s, cs.title);
  const colors=[C.cyan,C.teal,C.gold];
  const cards = (cs.cards||[]).slice(0,3);
  const cw = cards.length===2 ? 6.1 : 3.99;
  const gap = cards.length===2 ? 0.2  : 0.165;
  cards.forEach((card,i)=>{
    const cx=ML+i*(cw+gap), col=colors[i], cy=1.42, ch=4.92;
    s.addShape("rect",{x:cx,y:cy,w:cw,h:ch,fill:{color:C.surface},line:{color:C.border,width:0.5}});
    s.addShape("rect",{x:cx,y:cy,w:0.1,h:ch,fill:{color:col},line:{color:col,width:0}});
    s.addText("0"+(i+1),{x:cx+cw-1.55,y:cy+ch-1.45,w:1.4,h:1.2,
      fontSize:46,bold:true,color:C.darknum,fontFace:FONT,margin:0,align:"right"});
    s.addText(card.title,{x:cx+0.22,y:cy+0.28,w:cw-0.35,h:0.38,
      fontSize:12,bold:true,color:col,fontFace:FONT,margin:0});
    if(card.highlight){
      s.addShape("rect",{x:cx+0.22,y:cy+0.73,w:cw-0.35,h:0.35,
        fill:{color:C.bg},line:{color:col,width:0.3}});
      s.addText(card.highlight,{x:cx+0.28,y:cy+0.76,w:cw-0.45,h:0.28,
        fontSize:9,bold:true,color:col,fontFace:FONT,margin:0});
    }
    const bodyY = card.highlight ? cy+1.15 : cy+0.75;
    s.addShape("line",{x:cx+0.22,y:bodyY-0.05,w:cw-0.35,h:0,line:{color:C.border,width:0.4}});
    s.addText(card.body,{x:cx+0.22,y:bodyY+0.1,w:cw-0.35,h:cy+ch-bodyY-0.3,
      fontSize:11,color:C.muted,fontFace:FONT,margin:0,valign:"top",paraSpaceAfter:5});
  });
  addFooter(s,n);
}
 
// 슬라이드: 데이터 + 차트 (Excel 편집 가능)
function makeData(prs, ds, n) {
  const s = prs.addSlide(); addBg(s); addGrid(s); addLogo(s);
  addChap(s, ds.chapter_label); addTitleBar(s, ds.title);
 
  // 인사이트 박스
  if(ds.insight){
    s.addShape("rect",{x:ML,y:1.32,w:W-ML*2,h:0.52,
      fill:{color:C.surface},line:{color:C.cyan,width:0.4}});
    s.addText("💡 "+ds.insight,{x:ML+0.15,y:1.35,w:W-ML*2-0.2,h:0.44,
      fontSize:10.5,color:C.cyan,fontFace:FONT,margin:0,italic:false});
  }
 
  // 좌측 통계 카드
  const sc=[C.teal,C.cyan,C.gold];
  (ds.stats||[]).slice(0,3).forEach((st,i)=>{
    const sy=1.98+i*1.55;
    s.addShape("rect",{x:ML,y:sy,w:5.0,h:1.38,fill:{color:C.surface},line:{color:C.border,width:0.5}});
    s.addShape("rect",{x:ML,y:sy,w:0.1,h:1.38,fill:{color:sc[i]},line:{color:sc[i],width:0}});
    s.addText(st.num,{x:ML+0.22,y:sy+0.1,w:3.5,h:0.7,
      fontSize:24,bold:true,color:sc[i],fontFace:FONT,margin:0});
    if(st.trend) s.addText(st.trend,{x:ML+3.5,y:sy+0.15,w:1.3,h:0.55,
      fontSize:10,bold:true,color:sc[i],fontFace:FONT,margin:0,align:"right"});
    s.addText(st.label,{x:ML+0.22,y:sy+0.84,w:4.6,h:0.38,
      fontSize:10,color:C.muted,fontFace:FONT,margin:0});
  });
 
  // 우측 차트 (pptxgenjs — Excel 편집 가능)
  const chart = ds.chart||{};
  const chartData = (chart.series||[{name:"데이터",values:[0]}]).map(s=>({
    name:   s.name,
    labels: chart.categories||[],
    values: s.values||[],
  }));
  s.addChart(prs.charts.BAR, chartData, {
    x:5.75, y:1.32, w:7.3, h:5.0,
    barDir:"col", barGrouping:"clustered",
    chartColors:[C.cyan,C.teal,C.gold,"00C8E8","5B8DB8"],
    showValue:true, dataLabelColor:C.white, dataLabelFontSize:8,
    catAxisLabelColor:C.muted, valAxisLabelColor:C.muted,
    valGridLine:{color:C.border,size:0.5}, catGridLine:{style:"none"},
    chartArea:{fill:{color:C.surface}}, plotArea:{fill:{color:C.bg}},
    showLegend: chartData.length>1,
    legendColor: C.muted, legendFontSize:9,
    showTitle:true, title:chart.title||"",
    titleColor:C.cyan, titleFontSize:11,
  });
 
  // 출처
  if(chart.source){
    s.addText(chart.source,{x:5.75,y:6.45,w:7.3,h:0.2,
      fontSize:7,color:C.dim,fontFace:FONT,margin:0,align:"right"});
  }
  addFooter(s,n);
}
 
// 슬라이드: 법령 조문
function makeLaw(prs, ls, n) {
  const s = prs.addSlide(); addBg(s); addGrid(s); addLogo(s);
  addChap(s, ls.chapter_label);
  // 법령명 배너
  s.addShape("rect",{x:ML,y:0.52,w:W-ML*2,h:0.68,
    fill:{color:C.surface},line:{color:C.cyan,width:0.5}});
  s.addText(`📋  ${ls.law_name}  /  ${ls.article}`,{
    x:ML+0.15,y:0.55,w:W-ML*2-0.2,h:0.6,
    fontSize:14,bold:true,color:C.cyan,fontFace:FONT,margin:0});
  // 골드 구분선
  s.addShape("rect",{x:ML,y:1.32,w:0.1,h:4.5,fill:{color:C.gold},line:{color:C.gold,width:0}});
  // 법령 내용
  s.addText(ls.content,{x:ML+0.28,y:1.4,w:W-ML*2-0.2,h:1.8,
    fontSize:15,color:C.white,fontFace:FONT,margin:0,valign:"top",paraSpaceAfter:10});
  // 실무 포인트
  s.addShape("rect",{x:ML+0.28,y:3.4,w:W-ML*2-0.2,h:0.62,
    fill:{color:"0A2040"},line:{color:C.teal,width:0.5}});
  s.addText("✔  "+ls.point,{x:ML+0.45,y:3.44,w:W-ML*2-0.4,h:0.52,
    fontSize:12,bold:true,color:C.teal,fontFace:FONT,margin:0});
  // 제재 내용
  if(ls.penalty){
    s.addShape("rect",{x:ML+0.28,y:4.18,w:W-ML*2-0.2,h:0.62,
      fill:{color:"200A0A"},line:{color:C.gold,width:0.5}});
    s.addText("⚠  위반 시: "+ls.penalty,{x:ML+0.45,y:4.22,w:W-ML*2-0.4,h:0.52,
      fontSize:12,color:C.gold,fontFace:FONT,margin:0});
  }
  addFooter(s,n);
}
 
// 슬라이드: 사례 분석 (위반 vs 모범)
function makeCase(prs, cs, n) {
  const s = prs.addSlide(); addBg(s); addGrid(s); addLogo(s);
  addChap(s, cs.chapter_label); addTitleBar(s, cs.title);
  const typeColors = { "위반":"E05050", "모범":"00B4D8", "주의":"C8A96E" };
  const cases = (cs.cases||[]).slice(0,2);
  const cw = 6.05, ch=4.92, cy=1.42;
  cases.forEach((c,i)=>{
    const cx=ML+i*(cw+0.18);
    const col = typeColors[c.type]||C.cyan;
    s.addShape("rect",{x:cx,y:cy,w:cw,h:ch,fill:{color:C.surface},line:{color:C.border,width:0.5}});
    s.addShape("rect",{x:cx,y:cy,w:cw,h:0.42,fill:{color:col},line:{color:col,width:0}});
    s.addText(`[${c.type||"사례"}]  ${c.label}`,{x:cx+0.15,y:cy+0.06,w:cw-0.2,h:0.3,
      fontSize:12,bold:true,color:C.white,fontFace:FONT,margin:0});
    const rows=[
      {label:"상황", text:c.situation, y:0.55},
      {label:"조치", text:c.action,    y:1.88},
      {label:"결과", text:c.result,    y:3.18},
    ];
    rows.forEach(r=>{
      s.addText(r.label,{x:cx+0.15,y:cy+r.y,w:0.7,h:0.3,
        fontSize:9,bold:true,color:col,fontFace:FONT,margin:0});
      s.addShape("line",{x:cx+0.15,y:cy+r.y+0.33,w:cw-0.3,h:0,
        line:{color:C.border,width:0.3}});
      s.addText(r.text,{x:cx+0.15,y:cy+r.y+0.38,w:cw-0.3,h:1.1,
        fontSize:11,color:C.muted,fontFace:FONT,margin:0,valign:"top"});
    });
  });
  addFooter(s,n);
}
 
// 슬라이드: 핵심 정리
function makeSummary(prs, sm, n) {
  const s = prs.addSlide(); addBg(s); addGrid(s); addLogo(s);
  addChap(s,"SUMMARY"); addTitleBar(s, sm.title);
  const colors=[C.cyan,C.teal,C.gold], pts=(sm.points||[]).slice(0,3);
  const bw=(W-ML*2-0.3)/pts.length, bh=3.8, by=1.42;
  pts.forEach((pt,i)=>{
    const bx=ML+i*(bw+0.15), col=colors[i];
    s.addShape("rect",{x:bx,y:by,w:bw,h:bh,fill:{color:C.surface},line:{color:C.border,width:0.5}});
    s.addShape("rect",{x:bx,y:by,w:bw,h:0.12,fill:{color:col},line:{color:col,width:0}});
    s.addText(pt.num,{x:bx,y:by+0.15,w:bw,h:1.2,fontSize:52,bold:true,
      color:C.darknum,fontFace:FONT,margin:0,align:"right"});
    s.addText(pt.title,{x:bx+0.22,y:by+0.85,w:bw-0.35,h:0.42,
      fontSize:13,bold:true,color:col,fontFace:FONT,margin:0});
    s.addShape("line",{x:bx+0.22,y:by+1.35,w:bw-0.35,h:0,line:{color:C.border,width:0.4}});
    s.addText(pt.body,{x:bx+0.22,y:by+1.52,w:bw-0.35,h:bh-1.8,
      fontSize:11,color:C.muted,fontFace:FONT,margin:0,valign:"top",paraSpaceAfter:5});
  });
  // 실천 항목
  if((sm.action_items||[]).length>0){
    s.addShape("rect",{x:ML,y:5.42,w:W-ML*2,h:0.9,
      fill:{color:C.surface},line:{color:C.cyan,width:0.5}});
    s.addText("📌  오늘의 실천:  "+sm.action_items.join("  |  "),{
      x:ML+0.15,y:5.48,w:W-ML*2-0.2,h:0.75,
      fontSize:11,bold:true,color:C.teal,fontFace:FONT,margin:0});
  }
  addFooter(s,n);
}
 
// ══════════════════════════════════════════════════════════
// STEP 4: 전체 PPT 조립
// ══════════════════════════════════════════════════════════
async function buildPPT(topic, fileStem) {
  const stem = fileStem != null && String(fileStem).trim() ? fileStem : topic;
  emitProgress(1, "01 준비 — 설정·환경 확인 (auto_ppt 저장명=주제첫줄·2026-05)");
  const data = await generateFullContent(topic);
  emitProgress(4, "04 슬라이드 조립 시작 — 타이틀·목차");
  const prs  = new pptxgen();
  prs.layout = "LAYOUT_WIDE";
  prs.title  = data.meta.title.replace(/\n/," ");
  prs.author = BRAND.rep;
 
  console.log("\n📐 슬라이드 조립 중...");
  let n = 1;
 
  // 1) 타이틀
  makeTitle(prs, data.meta, n++);
  console.log("  ✓ 타이틀");
 
  // 2) 목차
  if((data.outline||[]).length>0){
    makeOutline(prs, data.outline, n++);
    console.log("  ✓ 목차");
  }
 
  emitProgress(5, "05 본문 — 섹션·카드 슬라이드");
  // 3) 섹션별 순서대로 조립
  const sections     = data.sections      || [];
  const contentSlides = data.content_slides || [];
  const dataSlides   = data.data_slides   || [];
  const lawSlides    = data.law_slides    || [];
  const caseSlides   = data.case_slides   || [];
 
  sections.forEach(sec => {
    makeSection(prs, sec, n++);
    console.log(`  ✓ 섹션 ${sec.num}: ${sec.title}`);
 
// 이 섹션에 속한 콘텐츠 슬라이드
    contentSlides.filter(cs=>(cs.section||1)===sec.num).forEach(cs=>{
      makeContent(prs, cs, n++);
      console.log(`    ✓ 콘텐츠: ${cs.title}`);
    });
    // 이 섹션에 속한 데이터 슬라이드
    dataSlides.filter(ds=>(ds.section||1)===sec.num).forEach(ds=>{
      makeData(prs, ds, n++);
      console.log(`    ✓ 데이터: ${ds.title}`);
    });
  });
 
  emitProgress(6, "06 데이터·법령·사례 슬라이드");
  // 4) 법령 슬라이드
  lawSlides.forEach(ls=>{
    makeLaw(prs, ls, n++);
    console.log(`  ✓ 법령: ${ls.law_name} ${ls.article}`);
  });
 
  // 5) 사례 슬라이드
  caseSlides.forEach(cs=>{
    makeCase(prs, cs, n++);
    console.log(`  ✓ 사례: ${cs.title}`);
  });
 
  // 6) 핵심 정리
  emitProgress(7, "07 핵심 정리 슬라이드");
  if(data.summary){
    makeSummary(prs, data.summary, n++);
    console.log("  ✓ 핵심 정리");
  }
 
  // 저장 (fileStem: GUI는 Gemini용 여러 줄 topic과 분리 — 줄바꿈·콜론 등으로 ENOENT 방지)
  emitProgress(8, "08 파일 저장 중");
  const safe = safeWindowsFileBase(stem);
  const outDir = path.join(appRoot(), "outputs");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${safe}.pptx`);
 
  await prs.writeFile({ fileName: outPath });
  console.log(`\n✅ 완성! 총 ${n-1}장`);
  console.log(`📁 ${outPath}`);
  console.log(`\n💡 사용법: node auto_ppt.cjs "다른 주제"\n`);
  emitProgress(9, `완료 — 총 ${n - 1}장, ${outPath}`);
  return outPath;
}
 
// ══════════════════════════════════════════════════════════
// 실행
// ══════════════════════════════════════════════════════════
function resolveTopicFromArgv() {
  const argv = process.argv.slice(2);
  if (argv[0] === "--config-json" && argv[1]) {
    const p = path.resolve(argv[1]);
    const cfg = JSON.parse(fs.readFileSync(p, "utf8"));
    process.env.PPT_GUI_PROGRESS = "1";
    const prompt = buildTopicFromConfig(cfg);
    const raw = fileStemFromGuiConfig(cfg);
    return { prompt, fileStem: raw };
  }
  const s = argv.join(" ").trim();
  return { prompt: s, fileStem: s };
}

const { prompt: topic, fileStem } = resolveTopicFromArgv();
if (!topic) {
  console.log(`
사용법: node auto_ppt.cjs "주제"
       node auto_ppt.cjs --config-json 경로\\gui-payload.json
 
예시:
  node auto_ppt.cjs "공익신고자보호법 2024 개정 핵심"
  node auto_ppt.cjs "적극행정 면책제도 실무"
  node auto_ppt.cjs "청탁금지법 위반 사례와 대응"
  node auto_ppt.cjs "이해충돌방지법 공직자 의무"
  node auto_ppt.cjs "중소벤처기업부 청렴교육"
`);
  process.exit(0);
}

const _gk =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!_gk) {
  console.error("❌ GEMINI_API_KEY 환경변수가 없습니다.");
  console.error("   프로젝트 루트 .env 또는 .env.local 에 GEMINI_API_KEY= 를 넣거나,");
  console.error("   set GEMINI_API_KEY=...  (Windows) / export GEMINI_API_KEY=... (Mac/Linux)");
  process.exit(1);
}

buildPPT(topic, fileStem).catch((e) => {
    if (process.env.PPT_GUI_PROGRESS === "1") {
      process.stdout.write(`PPT_ERROR\t${String(e.message).replace(/\t/g, " ")}\n`);
    }
    console.error("❌ 오류:", e.message);
    process.exit(1);
  });
 
