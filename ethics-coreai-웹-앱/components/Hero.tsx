import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, ChevronRight, ShieldCheck, ArrowRight, MessageCircle, Box, Home, Sparkles, ArrowLeft, Handshake, UserCheck, GraduationCap, HelpCircle, ExternalLink, X, CheckCircle2, Phone, Mail, Calendar } from 'lucide-react';
import ApplyModal from './ApplyModal';

// --- 파트너 항목 세부 설명 데이터 ---
const PARTNER_DETAILS: Record<string, {
  title: string;
  subtitle: string;
  description: string;
  points: string[];
  cta: string;
}> = {
  lecture: {
    title: "강의 의뢰 및 사업 협업",
    subtitle: "단순 강의를 넘어, 조직 변화를 설계합니다",
    description: "주양순 대표는 인사혁신처 적극행정 강사단, 국가청렴권익교육원 등 전국 공공기관에서 활발히 활동 중인 AI 기반 청렴·적극행정 전문 강사입니다. 귀 기관의 특성에 맞는 맞춤형 솔루션을 제안드립니다.",
    points: [
      "AI 참여형 청렴·적극행정 강의 (전국 출강 가능)",
      "Gemini·ChatGPT 기반 실시간 AI 실습 강의",
      "Mentimeter 활용 인터랙티브 참여형 교육",
      "조직문화 정밀 진단 및 컨설팅",
      "청렴·갑질·이해충돌 예방 워크숍 설계",
      "기관 맞춤형 AI 교육 플랫폼 구축 협업"
    ],
    cta: "강의 의뢰 문의하기"
  },
  citizen: {
    title: "청렴 시민 감사관/정책 자문",
    subtitle: "시민의 눈으로, AI의 정밀함으로",
    description: "청렴공정연구센터(ECAI센터)는 공공기관의 청렴도 향상을 위한 정책 자문과 시민 감사 활동을 지원합니다. 데이터 기반의 객관적 분석으로 신뢰받는 조직 문화를 만들어 드립니다.",
    points: [
      "공공기관 청렴도 현황 진단 및 리포트",
      "AI 기반 부패 유발 요인 사전 탐지",
      "청렴 정책 수립 자문 및 로드맵 설계",
      "시민 감사관 교육 및 양성 프로그램",
      "이해충돌방지법·청탁금지법 준수 점검",
      "청렴 문화 확산을 위한 캠페인 기획"
    ],
    cta: "정책 자문 문의하기"
  },
  etc: {
    title: "기타 문의",
    subtitle: "어떤 문의든 성심껏 답변드립니다",
    description: "강의, 컨설팅, 협업 외에도 Ethics-CoreAI 플랫폼 활용, AI 교육 프로그램, 청렴 관련 연구 참여 등 다양한 분야에서 협력할 수 있습니다. 편하게 문의해 주세요.",
    points: [
      "Ethics-CoreAI 플랫폼 도입 문의",
      "청렴·적극행정 연구 협력",
      "AI 교육 콘텐츠 개발 협업",
      "언론·방송 자문 및 출연",
      "공공기관 AI 솔루션 도입 상담",
      "기타 협업 제안 및 파트너십"
    ],
    cta: "문의하기"
  }
};

const Hero: React.FC = () => {
  const [viewMode, setViewMode] = useState<'intro' | 'consulting'>('intro');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);

  useEffect(() => {
    const savedMode = sessionStorage.getItem('hero_view_mode');
    if (savedMode === 'consulting') {
      setViewMode('consulting');
      sessionStorage.removeItem('hero_view_mode');
    }
  }, []);

  const handleMenuClick = (action: string) => {
    if (action === 'corruption_direct') {
      sessionStorage.setItem('counseling_mode', 'corruption');
      const event = new CustomEvent('navigate', { detail: 'counseling_center' });
      window.dispatchEvent(event);
    } else if (action === 'recovery_intro') {
      sessionStorage.setItem('counseling_mode', 'recovery');
      const event = new CustomEvent('navigate', { detail: 'counseling_center' });
      window.dispatchEvent(event);
    } else if (action.startsWith('http')) {
      window.open(action, '_blank');
    } else {
      const event = new CustomEvent('navigate', { detail: action });
      window.dispatchEvent(event);
    }
  };

  const handlePartnerClick = (item: any) => {
    if (item.isExternal) {
      window.open(item.action, '_blank');
    } else if (item.detailKey) {
      setSelectedPartner(item.detailKey);
    } else {
      handleMenuClick(item.action);
    }
  };

  const menuItems = [
    { label: "갑질 및 직장 내 괴롭힘 상담", action: "diagnostics", desc: "비가시적 괴롭힘 진단" },
    { label: "청렴 DNA 진단", action: "integrity", desc: "나의 청렴 MBTI 확인" },
    { label: "ECA 부패 상담관", action: "corruption_direct", desc: "청탁금지/이해충돌 법령 (AI Studio)" },
    { label: "공공재정 환수법 상담소", action: "recovery_intro", desc: "부정이익 환수 AI 자문 (Gemini)" },
    { label: "적극행정 및 면책 상담", action: "admin", desc: "사전컨설팅 및 면책 제도" }
  ];

  const partnerItems = [
    { label: "강의 의뢰 및 사업 협업", icon: Handshake, action: 'contact', detailKey: 'lecture', desc: "전문가 매칭 및 협업 제안" },
    { label: "청렴 시민 감사관/정책 자문", icon: UserCheck, action: 'contact', detailKey: 'citizen', desc: "청렴도 향상 정책 자문" },
    {
      label: "AI 기반 청렴·인권 미래대학",
      icon: GraduationCap,
      action: 'https://blog.naver.com/yszoo1467/224180090553',
      isExternal: true,
      desc: "차세대 윤리 교육 프로그램"
    },
    { label: "기타 문의", icon: HelpCircle, action: 'contact', detailKey: 'etc', desc: "일반 문의 및 상담" },
  ];

  return (
    <section
      className={`relative w-full min-h-screen flex flex-col z-10 px-4 overflow-hidden transition-all duration-700 ease-in-out ${
        viewMode === 'intro'
          ? 'justify-start items-center pt-32 md:pt-32'
          : 'justify-start md:justify-center items-center pt-32 md:pt-0'
      }`}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber-500/05 blur-[120px] rounded-full pointer-events-none" />

      <AnimatePresence mode="wait">

        {/* MODE 1: INTRO */}
        {viewMode === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50, filter: 'blur(10px)' }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-7xl mx-auto flex flex-col items-center relative z-10 w-full"
          >
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-6 md:mb-8">
              <span className="inline-block py-2 px-6 rounded-full bg-cyber-900/80 border border-cyber-500/30 text-cyber-400 text-sm md:text-lg font-bold tracking-widest shadow-[0_0_20px_rgba(59,130,246,0.15)] backdrop-blur-md">
                Ethics-CoreAI Center
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.2] mb-[12vh] sm:mb-[15vh] tracking-tight drop-shadow-2xl break-keep"
            >
              조직의 미래를 바꾸는<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-400 via-cyber-500 to-cyber-purple">Ethics-Core AI Innovation Partner</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-base sm:text-xl md:text-3xl text-slate-300 font-light leading-relaxed max-w-5xl mx-auto mb-8 sm:mb-10 mt-[12vh] sm:mt-[15vh] break-keep relative z-20 px-2"
            >
              복잡한 조직문화의 부패와 갑질 그리고<br />
              상담과 신고의 불편함을 즉시 대응하고 실천하는<br />
              <span className="text-white font-bold">청렴한 AI 솔루션</span>으로 해결해드립니다.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-20 relative z-20 w-full sm:w-auto px-4"
            >
              <button
                onClick={() => setViewMode('consulting')}
                className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-blue-600 to-cyber-purple text-white rounded-full font-black text-lg sm:text-xl hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all flex items-center justify-center gap-3 shadow-lg group relative overflow-hidden border border-white/10"
              >
                <span className="relative z-10 flex items-center gap-2">상담하기 <MessageCircle className="w-5 h-5 fill-white" /></span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-blue-600 to-cyber-purple text-white rounded-full font-bold text-lg sm:text-xl hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all flex items-center justify-center gap-3 group border border-white/10 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">신청하기 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* MODE 2: CONSULTING */}
        {viewMode === 'consulting' && (
          <motion.div
            key="consulting"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full min-h-screen flex flex-col items-center relative z-20 pb-24 px-4 overflow-y-auto"
          >
            <div className="flex flex-col xl:flex-row items-center justify-center gap-12 xl:gap-[450px] w-full max-w-[1600px] my-auto relative z-10 pt-10 md:pt-0">

              {/* LEFT: PARTNER CARD */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-[440px] h-[750px] bg-slate-900/80 backdrop-blur-xl border border-cyber-500/30 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col hover:border-cyber-500 transition-colors duration-500 shrink-1"
              >
                <div className="bg-gradient-to-r from-blue-600 to-cyber-purple p-8 flex items-center gap-5 relative overflow-hidden shrink-0 h-[140px]">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-12 -mt-12 blur-3xl"></div>
                  <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shadow-lg relative z-10">
                    <Handshake className="w-7 h-7 text-white" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-white font-bold text-xl">Ethics-Core AI 파트너</h3>
                    <p className="text-blue-100 text-sm opacity-90 mt-1 font-bold">당신의 '청렴' 파트너가 되어 드립니다.</p>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-grow overflow-y-auto custom-scrollbar flex flex-col justify-center bg-slate-900/40">
                  <div className="mb-2 px-2">
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                      강의 의뢰, 사업 협업, 청렴 자문 등<br />
                      <span className="text-white font-bold">전문적인 솔루션</span>을 제공합니다.
                    </p>
                  </div>

                  {partnerItems.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePartnerClick(item)}
                      className="w-full group flex items-center justify-between p-5 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-cyber-600 hover:border-cyber-500 transition-all duration-300 text-left hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-9 h-9 rounded-lg bg-slate-950 flex items-center justify-center transition-colors shrink-0 ${item.isExternal ? 'text-[#ff6e1e] group-hover:text-white group-hover:bg-[#ff6e1e]' : 'text-slate-400 group-hover:text-cyber-600 group-hover:bg-white'}`}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="text-slate-200 font-bold text-lg group-hover:text-white truncate">{item.label}</div>
                          <div className="text-slate-500 text-sm group-hover:text-blue-100 mt-1 truncate">{item.desc}</div>
                        </div>
                      </div>
                      {item.isExternal ? (
                        <ExternalLink className="w-5 h-5 text-slate-500 group-hover:text-white opacity-50 group-hover:opacity-100 transition-all shrink-0" />
                      ) : (
                        <ChevronRight className="w-6 h-6 text-slate-500 group-hover:text-white opacity-50 group-hover:opacity-100 transition-all group-hover:translate-x-1 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-slate-950 border-t border-slate-800 text-center shrink-0">
                  <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Partner Verification
                  </p>
                </div>
              </motion.div>

              {/* RIGHT: MENU WIDGET */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full max-w-[440px] h-[750px] bg-slate-900/80 backdrop-blur-xl border border-cyber-500/30 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col hover:border-cyber-500 transition-colors duration-500 shrink-1"
              >
                <div className="bg-gradient-to-r from-blue-600 to-cyber-purple p-8 flex items-center gap-5 relative overflow-hidden shrink-0 h-[140px]">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-12 -mt-12 blur-3xl"></div>
                  <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shadow-lg relative z-10">
                    <Box className="w-7 h-7 text-white" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-white font-bold text-xl">Ethics-CoreAI 전문상담관</h3>
                    <p className="text-blue-100 text-sm opacity-90 mt-1">원하시는 서비스를 선택해주세요.</p>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-grow overflow-y-auto custom-scrollbar flex flex-col justify-center bg-slate-900/40">
                  {menuItems.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleMenuClick(item.action)}
                      className="w-full group flex items-center justify-between p-5 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-cyber-600 hover:border-cyber-500 transition-all duration-300 text-left hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-lg bg-slate-950 flex items-center justify-center text-slate-400 group-hover:text-cyber-600 group-hover:bg-white text-base font-bold transition-colors shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="text-slate-200 font-bold text-lg group-hover:text-white truncate">{item.label}</div>
                          <div className="text-slate-500 text-sm group-hover:text-blue-100 mt-1 truncate">{item.desc}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-slate-500 group-hover:text-white opacity-50 group-hover:opacity-100 transition-all group-hover:translate-x-1 shrink-0" />
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-slate-950 border-t border-slate-800 text-center shrink-0">
                  <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Secure & Private Consultation
                  </p>
                </div>
              </motion.div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* BOTTOM BUTTON */}
      <AnimatePresence>
        {viewMode === 'consulting' && (
          <motion.button
            key="main-back-button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.8 }}
            onClick={() => setViewMode('intro')}
            className="fixed bottom-[5%] sm:bottom-[12%] left-[44%] -translate-x-1/2 z-[100] group bg-gradient-to-r from-blue-600 to-cyber-purple hover:from-blue-500 hover:to-purple-500 border border-white/20 rounded-full text-white font-black text-xs sm:text-sm px-6 sm:px-10 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:shadow-[0_0_40px_rgba(139,92,246,0.7)] transition-all duration-300 uppercase tracking-widest ring-2 ring-white/20 whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:-translate-x-1 transition-transform" />
            <Home className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <span className="text-white ml-1">MAIN 메인 화면으로</span>
            <div className="absolute inset-0 rounded-full ring-2 ring-white/20 animate-pulse-slow pointer-events-none" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 파트너 세부 설명 모달 */}
      <AnimatePresence>
        {selectedPartner && PARTNER_DETAILS[selectedPartner] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-sm px-4"
            onClick={() => setSelectedPartner(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              transition={{ duration: 0.3 }}
              className="bg-[#0f172a] border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* 모달 헤더 */}
              <div className="bg-gradient-to-r from-blue-600 to-cyber-purple p-6 relative">
                <button
                  onClick={() => setSelectedPartner(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <h3 className="text-white font-black text-xl mb-1">
                  {PARTNER_DETAILS[selectedPartner].title}
                </h3>
                <p className="text-blue-100 text-sm font-bold">
                  {PARTNER_DETAILS[selectedPartner].subtitle}
                </p>
              </div>

              {/* 모달 바디 */}
              <div className="p-6">
                <p className="text-slate-300 text-sm leading-relaxed mb-6 break-keep">
                  {PARTNER_DETAILS[selectedPartner].description}
                </p>

                <h4 className="text-white font-bold text-sm mb-3 border-l-4 border-cyber-accent pl-3">
                  제공 서비스
                </h4>
                <ul className="space-y-3 mb-6">
                  {PARTNER_DETAILS[selectedPartner].points.map((point, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-start gap-3 text-slate-300 text-sm"
                    >
                      <CheckCircle2 className="w-4 h-4 text-cyber-accent shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* 연락처 정보 */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 mb-4 space-y-2">
                  <div className="flex items-center gap-3 text-slate-300 text-sm">
                    <Mail className="w-4 h-4 text-cyber-accent shrink-0" />
                    <span>yszoo1467@naver.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300 text-sm">
                    <Phone className="w-4 h-4 text-cyber-accent shrink-0" />
                    <span>010-6667-1467</span>
                  </div>
                </div>

                {/* CTA 버튼 */}
                <button
                  onClick={() => {
                    setSelectedPartner(null);
                    handleMenuClick('contact');
                  }}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyber-purple hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-black text-base transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {PARTNER_DETAILS[selectedPartner].cta}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ApplyModal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} />
    </section>
  );
};

export default Hero;
