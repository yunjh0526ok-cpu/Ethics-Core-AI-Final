import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, BrainCircuit, ShieldAlert, Handshake, CalendarDays, MapPin, Users, Building2, Mail, Phone, Loader2 } from 'lucide-react';
import { geminiGenerateContent } from '../lib/geminiFetch';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ApplyType = 'lecture' | 'partnership';

const corruptionRiskOptions = [
  '이해충돌 및 사적이해관계',
  '청탁금지법 위반 리스크',
  '예산·계약·입찰 부패 리스크',
  '채용·인사 공정성 리스크',
  '직장 내 괴롭힘 및 갑질 리스크',
  '정보보안·내부정보 유출 리스크',
];

const partnershipPurposeOptions = [
  '예비창업패키지 실증(PoC)',
  '공공기관 윤리 AI 협업',
  '기관 맞춤형 교육 플랫폼 구축',
  'SaaS 도입 및 정기 구독',
  '공동 연구 및 성과 확산',
];

const organizationScaleOptions = [
  '1~10명',
  '11~50명',
  '51~200명',
  '201~1,000명',
  '1,000명 이상',
  '공공기관/지자체',
];

const riskScoreMap: Record<string, number> = {
  '이해충돌 및 사적이해관계': 92,
  '청탁금지법 위반 리스크': 88,
  '예산·계약·입찰 부패 리스크': 96,
  '채용·인사 공정성 리스크': 90,
  '직장 내 괴롭힘 및 갑질 리스크': 85,
  '정보보안·내부정보 유출 리스크': 80,
};

const ApplyModal: React.FC<ApplyModalProps> = ({ isOpen, onClose }) => {
  const [applyType, setApplyType] = useState<ApplyType>('lecture');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');

  const [lectureForm, setLectureForm] = useState({
    institutionName: '',
    participants: '',
    preferredDate: '',
    location: '',
    corruptionRisks: [] as string[],
    requestMemo: '',
  });

  const [partnershipForm, setPartnershipForm] = useState({
    institutionName: '',
    organizationScale: '',
    collaborationPurposes: [] as string[],
    timeline: '',
    objective: '',
  });

  const topRisk = useMemo(() => {
    if (!lectureForm.corruptionRisks.length) return null;
    const sorted = [...lectureForm.corruptionRisks].sort((a, b) => (riskScoreMap[b] ?? 0) - (riskScoreMap[a] ?? 0));
    return sorted[0];
  }, [lectureForm.corruptionRisks]);

  if (!isOpen) return null;

  const toggleLectureRisk = (risk: string) => {
    setLectureForm((prev) => ({
      ...prev,
      corruptionRisks: prev.corruptionRisks.includes(risk)
        ? prev.corruptionRisks.filter((item) => item !== risk)
        : [...prev.corruptionRisks, risk],
    }));
  };

  const togglePartnershipPurpose = (purpose: string) => {
    setPartnershipForm((prev) => ({
      ...prev,
      collaborationPurposes: prev.collaborationPurposes.includes(purpose)
        ? prev.collaborationPurposes.filter((item) => item !== purpose)
        : [...prev.collaborationPurposes, purpose],
    }));
  };

  const buildLectureFallback = () => {
    const riskLine = lectureForm.corruptionRisks.length ? lectureForm.corruptionRisks.join(', ') : '리스크 미선택';
    const priority = topRisk ? `${topRisk} (우선도 ${riskScoreMap[topRisk]}/100)` : '리스크 데이터가 부족해 기본 점검 권장';
    return [
      '[v2-core 사전 브리핑 - 강의/컨설팅]',
      `- 기관: ${lectureForm.institutionName || '미입력'}`,
      `- 예상 인원: ${lectureForm.participants || '미입력'}명`,
      `- 희망 일자/장소: ${lectureForm.preferredDate || '미입력'} / ${lectureForm.location || '미입력'}`,
      `- 기관 주요 부패 리스크 유형: ${riskLine}`,
      `- 우선 대응 과제: ${priority}`,
      '- 권장 프로그램: 리스크 집중형 워크숍 + 사례 기반 AI 시뮬레이션',
      '- 다음 단계: 사전 인터뷰(30분) -> 맞춤 커리큘럼 초안 제안',
    ].join('\n');
  };

  const buildPartnershipFallback = () => {
    const purposes = partnershipForm.collaborationPurposes.length ? partnershipForm.collaborationPurposes.join(', ') : '협업 목적 미선택';
    return [
      '[v2-core 사전 브리핑 - 사업 협력/파트너십]',
      `- 기관: ${partnershipForm.institutionName || '미입력'}`,
      `- 기관 규모: ${partnershipForm.organizationScale || '미입력'}`,
      `- 협업 목적: ${purposes}`,
      `- 추진 희망 시점: ${partnershipForm.timeline || '미입력'}`,
      '- 권장 협업 방식: 6주 PoC -> 성과지표 검증 -> 정식 도입',
      '- 다음 단계: 요구사항 인터뷰 및 업무 데이터 범위 정의',
    ].join('\n');
  };

  const generateLectureInsight = async () => {
    const prompt = `
너는 Ethics-Core AI v2-core 신청 분석관이다.
아래 입력을 기반으로 기관 담당자가 바로 보고 활용할 수 있는 "사전 분석 브리핑"을 한국어로 작성하라.

[입력]
- 신청 유형: 강의/컨설팅
- 기관명: ${lectureForm.institutionName || '미입력'}
- 인원: ${lectureForm.participants || '미입력'}
- 일자: ${lectureForm.preferredDate || '미입력'}
- 장소: ${lectureForm.location || '미입력'}
- 주요 부패 리스크 유형: ${lectureForm.corruptionRisks.join(', ') || '미선택'}
- 요청 메모: ${lectureForm.requestMemo || '미입력'}

[출력 형식]
1) 핵심 진단 요약 (2~3문장)
2) 우선 리스크 2개와 대응 제안
3) 추천 강의/컨설팅 구성안 (3단계)
4) 기관 담당자 확인 질문 3개
`.trim();

    const { text } = await geminiGenerateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return text?.trim() || buildLectureFallback();
  };

  const generatePartnershipInsight = async () => {
    const prompt = `
너는 Ethics-Core AI v2-core 파트너십 전략 분석관이다.
아래 입력을 기반으로 공공기관/예비창업패키지 협업에 맞는 사전 분석 브리핑을 한국어로 작성하라.

[입력]
- 신청 유형: 사업 협력/파트너십
- 기관명: ${partnershipForm.institutionName || '미입력'}
- 기관 규모: ${partnershipForm.organizationScale || '미입력'}
- 협업 목적: ${partnershipForm.collaborationPurposes.join(', ') || '미선택'}
- 추진 시점: ${partnershipForm.timeline || '미입력'}
- 세부 목적: ${partnershipForm.objective || '미입력'}

[출력 형식]
1) 협업 적합도 요약 (2~3문장)
2) 권장 협업 트랙 (PoC/파일럿/정식도입 중 선택 + 이유)
3) 8주 실행 로드맵
4) 초기 성과지표(KPI) 4개
`.trim();

    const { text } = await geminiGenerateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return text?.trim() || buildPartnershipFallback();
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = applyType === 'lecture' ? await generateLectureInsight() : await generatePartnershipInsight();
      setAnalysisResult(result);
    } catch {
      setAnalysisResult(applyType === 'lecture' ? buildLectureFallback() : buildPartnershipFallback());
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetCurrentForm = () => {
    if (applyType === 'lecture') {
      setLectureForm({
        institutionName: '',
        participants: '',
        preferredDate: '',
        location: '',
        corruptionRisks: [],
        requestMemo: '',
      });
    } else {
      setPartnershipForm({
        institutionName: '',
        organizationScale: '',
        collaborationPurposes: [],
        timeline: '',
        objective: '',
      });
    }
    setAnalysisResult('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] overflow-y-auto custom-scrollbar">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        <div className="flex min-h-full items-center justify-center p-4 py-16 md:py-12">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-6xl rounded-3xl border border-[#24304e] bg-[#090f1f]/95 p-5 md:p-8 shadow-2xl backdrop-blur-xl"
          >
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top_right,rgba(255,122,26,0.22),transparent_42%)]" />

            <button onClick={onClose} className="absolute right-4 top-4 z-50 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">
              <X className="h-6 w-6" />
            </button>

            <div className="relative z-10 mb-6 mt-1 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#13203b] to-[#ff7a1a] shadow-[0_0_20px_rgba(255,122,26,0.35)]">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">v2-core intelligent application system</p>
                <h3 className="text-xl font-black text-white md:text-3xl">기관 맞춤형 지능형 신청 허브</h3>
                <p className="mt-1 text-sm text-slate-300">신청 정보 입력 -&gt; AI 사전분석 -&gt; 맞춤 제안 트랙 추천</p>
              </div>
            </div>

            <div className="relative z-10 mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-700 bg-[#0b162f]/70 p-3">
                <BrainCircuit className="mb-2 h-5 w-5 text-orange-300" />
                <p className="text-xs font-bold text-white">01 Intake</p>
                <p className="mt-1 text-[11px] text-slate-400">기관/요청 맥락 수집</p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-[#0b162f]/70 p-3">
                <ShieldAlert className="mb-2 h-5 w-5 text-orange-300" />
                <p className="text-xs font-bold text-white">02 Risk Profiling</p>
                <p className="mt-1 text-[11px] text-slate-400">주요 리스크 유형 매핑</p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-[#0b162f]/70 p-3">
                <Handshake className="mb-2 h-5 w-5 text-orange-300" />
                <p className="text-xs font-bold text-white">03 AI Briefing</p>
                <p className="mt-1 text-[11px] text-slate-400">실행 가능한 제안 초안 생성</p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-[#0b162f]/70 p-3">
                <CalendarDays className="mb-2 h-5 w-5 text-orange-300" />
                <p className="text-xs font-bold text-white">04 Action Plan</p>
                <p className="mt-1 text-[11px] text-slate-400">일정/실행 단계 확정</p>
              </div>
            </div>

            <div className="relative z-10 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
              <div className="rounded-3xl border border-slate-700 bg-[#0a1329]/80 p-4 md:p-5">
                <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-[#0b162f] p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setApplyType('lecture');
                      setAnalysisResult('');
                    }}
                    className={`rounded-xl px-3 py-3 text-sm font-bold transition-all ${
                      applyType === 'lecture'
                        ? 'bg-gradient-to-r from-[#172a4d] to-[#ff7a1a] text-white shadow-lg'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    강의/컨설팅 신청
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setApplyType('partnership');
                      setAnalysisResult('');
                    }}
                    className={`rounded-xl px-3 py-3 text-sm font-bold transition-all ${
                      applyType === 'partnership'
                        ? 'bg-gradient-to-r from-[#172a4d] to-[#ff7a1a] text-white shadow-lg'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    사업 협력/파트너십 신청
                  </button>
                </div>

                {applyType === 'lecture' ? (
                  <div className="space-y-3">
                    <label className="block">
                      <span className="mb-1 block text-xs font-bold text-slate-300">기관명</span>
                      <input
                        value={lectureForm.institutionName}
                        onChange={(e) => setLectureForm((prev) => ({ ...prev, institutionName: e.target.value }))}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none focus:border-orange-400"
                        placeholder="예: OO시청, OO공단"
                      />
                    </label>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <label className="block">
                        <span className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-300"><Users className="h-3.5 w-3.5" /> 인원</span>
                        <input
                          type="number"
                          min={1}
                          value={lectureForm.participants}
                          onChange={(e) => setLectureForm((prev) => ({ ...prev, participants: e.target.value }))}
                          className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none focus:border-orange-400"
                          placeholder="예: 120"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-300"><CalendarDays className="h-3.5 w-3.5" /> 희망 일자</span>
                        <input
                          type="date"
                          value={lectureForm.preferredDate}
                          onChange={(e) => setLectureForm((prev) => ({ ...prev, preferredDate: e.target.value }))}
                          className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none focus:border-orange-400"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-300"><MapPin className="h-3.5 w-3.5" /> 장소</span>
                        <input
                          value={lectureForm.location}
                          onChange={(e) => setLectureForm((prev) => ({ ...prev, location: e.target.value }))}
                          className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none focus:border-orange-400"
                          placeholder="예: 대회의실, 온라인(ZOOM)"
                        />
                      </label>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-bold text-slate-300">기관의 주요 부패 리스크 유형 (복수 선택)</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {corruptionRiskOptions.map((risk) => {
                          const selected = lectureForm.corruptionRisks.includes(risk);
                          return (
                            <button
                              key={risk}
                              type="button"
                              onClick={() => toggleLectureRisk(risk)}
                              className={`rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-all ${
                                selected
                                  ? 'border-orange-400 bg-orange-500/15 text-orange-100'
                                  : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500'
                              }`}
                            >
                              {risk}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <label className="block">
                      <span className="mb-1 block text-xs font-bold text-slate-300">요청 사항</span>
                      <textarea
                        rows={3}
                        value={lectureForm.requestMemo}
                        onChange={(e) => setLectureForm((prev) => ({ ...prev, requestMemo: e.target.value }))}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none focus:border-orange-400"
                        placeholder="예: 팀장급 대상 이해충돌 사례 중심, 실습 포함 희망"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="block">
                      <span className="mb-1 block text-xs font-bold text-slate-300">기관명</span>
                      <input
                        value={partnershipForm.institutionName}
                        onChange={(e) => setPartnershipForm((prev) => ({ ...prev, institutionName: e.target.value }))}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none focus:border-orange-400"
                        placeholder="예: OO재단, OOO 스타트업"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-300"><Building2 className="h-3.5 w-3.5" /> 기관 규모</span>
                      <select
                        value={partnershipForm.organizationScale}
                        onChange={(e) => setPartnershipForm((prev) => ({ ...prev, organizationScale: e.target.value }))}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none focus:border-orange-400"
                      >
                        <option value="">규모를 선택하세요</option>
                        {organizationScaleOptions.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div>
                      <p className="mb-2 text-xs font-bold text-slate-300">협업 목적 (복수 선택)</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {partnershipPurposeOptions.map((purpose) => {
                          const selected = partnershipForm.collaborationPurposes.includes(purpose);
                          return (
                            <button
                              key={purpose}
                              type="button"
                              onClick={() => togglePartnershipPurpose(purpose)}
                              className={`rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-all ${
                                selected
                                  ? 'border-orange-400 bg-orange-500/15 text-orange-100'
                                  : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500'
                              }`}
                            >
                              {purpose}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <label className="block">
                      <span className="mb-1 block text-xs font-bold text-slate-300">추진 희망 시점</span>
                      <input
                        value={partnershipForm.timeline}
                        onChange={(e) => setPartnershipForm((prev) => ({ ...prev, timeline: e.target.value }))}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none focus:border-orange-400"
                        placeholder="예: 2026년 3분기 내 PoC 시작"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-bold text-slate-300">협업 목적 상세</span>
                      <textarea
                        rows={3}
                        value={partnershipForm.objective}
                        onChange={(e) => setPartnershipForm((prev) => ({ ...prev, objective: e.target.value }))}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none focus:border-orange-400"
                        placeholder="예: 예비창업패키지 데모데이 대응, 공공기관 공동실증 준비"
                      />
                    </label>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1b2d52] to-[#ff7a1a] px-4 py-2.5 text-sm font-black text-white shadow-lg transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                    AI 사전 분석 생성
                  </button>
                  <button
                    type="button"
                    onClick={resetCurrentForm}
                    className="rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-bold text-slate-300 transition-colors hover:border-slate-400 hover:text-white"
                  >
                    현재 폼 초기화
                  </button>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-700 bg-[#0d1a33]/70 p-3">
                  <p className="mb-2 text-xs font-bold text-slate-300">기타 신청 항목 바로가기</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => window.location.href = 'mailto:yszoo1467@naver.com'}
                      className="rounded-xl border border-slate-600 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-orange-400 hover:text-white"
                    >
                      청렴 시민 감사관/정책 자문 문의
                    </button>
                    <button
                      type="button"
                      onClick={() => window.open('https://blog.naver.com/yszoo1467/224180090553', '_blank')}
                      className="rounded-xl border border-slate-600 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-orange-400 hover:text-white"
                    >
                      AI 기반 미래대학 프로그램 보기
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-700 bg-[#0a1329]/80 p-4 md:p-5">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-black text-white">
                  <Sparkles className="h-4 w-4 text-orange-300" />
                  지능형 사전 분석 결과
                </h4>
                <p className="mb-3 text-xs text-slate-400">
                  신청 데이터와 선택된 리스크/협업 목적을 기반으로 기관 담당자가 바로 검토 가능한 초안을 제공합니다.
                </p>
                <div className="min-h-[310px] rounded-2xl border border-[#263454] bg-[#0a1226] p-3">
                  {analysisResult ? (
                    <pre className="whitespace-pre-wrap text-xs leading-relaxed text-slate-200">{analysisResult}</pre>
                  ) : (
                    <div className="flex h-full items-center justify-center text-center text-xs text-slate-500">
                      `AI 사전 분석 생성` 버튼을 누르면
                      <br />
                      v2-core 추천안이 여기에 나타납니다.
                    </div>
                  )}
                </div>

                <div className="mt-4 rounded-2xl border border-orange-500/25 bg-orange-500/10 p-3">
                  <p className="text-xs font-bold text-orange-200">담당자 연락 채널</p>
                  <div className="mt-2 space-y-1.5 text-xs text-slate-200">
                    <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-orange-300" /> yszoo1467@naver.com</p>
                    <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-orange-300" /> 010-6667-1467</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default ApplyModal;
