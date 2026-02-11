
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, ChevronRight, ShieldCheck, ArrowRight, MessageCircle, Box, Home, Sparkles, ArrowLeft, Handshake, FileText, UserCheck } from 'lucide-react';
import ApplyModal from './ApplyModal';

const Hero: React.FC = () => {
  const [viewMode, setViewMode] = useState<'intro' | 'consulting'>('intro');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const handleMenuClick = (action: string) => {
      if (action.startsWith('http')) {
          if (action.includes('aistudio') || action.includes('gemini')) {
              const event = new CustomEvent('navigate', { detail: 'counseling_center' });
              window.dispatchEvent(event);
              
              setTimeout(() => {
                 const frameId = action.includes('aistudio') ? 'corruption-frame' : 'recovery-frame';
                 document.getElementById(frameId)?.scrollIntoView({ behavior: 'smooth' });
              }, 500);
          } else {
              window.open(action, '_blank');
          }
      } else {
          const event = new CustomEvent('navigate', { detail: action });
          window.dispatchEvent(event);
      }
  };

  // 1~5번 핵심 상담 메뉴 (6번은 왼쪽 박스로 이동)
  const menuItems = [
    { label: "갑질 및 직장 내 괴롭힘 상담", action: "diagnostics", desc: "비가시적 괴롭힘 진단" },
    { label: "청렴 DNA 진단", action: "integrity", desc: "나의 청렴 MBTI 확인" },
    { label: "부패 상담관", action: "https://aistudio.google.com/app/shared/f1e78453716a44f0b2f155f9a6907c8c", desc: "청탁금지/이해충돌 법령" },
    { label: "공공재정 환수법 상담소", action: "https://gemini.google.com/share/1908208fb5d3", desc: "부정이익 환수 AI 자문" },
    { label: "적극행정 및 면책 상담", action: "admin", desc: "사전컨설팅 및 면책 제도" }
  ];

  return (
    <section 
      className={`relative w-full min-h-screen flex flex-col z-10 px-4 overflow-hidden transition-all duration-700 ease-in-out ${
        viewMode === 'intro' 
          ? 'justify-start items-center pt-32 md:pt-32' // Mobile pt-32 (safe for Navbar)
          : 'justify-start md:justify-center items-center pt-32 md:pt-0' // Consulting view: justify-start on mobile to prevent top cut-off
      }`}
    >
      {/* Background Glow - Kept subtle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber-500/05 blur-[120px] rounded-full pointer-events-none" />

      <AnimatePresence mode="wait">
        
        {/* ================= MODE 1: MAIN INTRO SCREEN ================= */}
        {viewMode === 'intro' && (
          <motion.div 
            key="intro"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50, filter: 'blur(10px)' }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-7xl mx-auto flex flex-col items-center relative z-10 w-full"
          >
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6 md:mb-8"
            >
              <span className="inline-block py-2 px-6 rounded-full bg-cyber-900/80 border border-cyber-500/30 text-cyber-400 text-sm md:text-lg font-bold tracking-widest shadow-[0_0_20px_rgba(59,130,246,0.15)] backdrop-blur-md">
                Ethics-CoreAI Center
              </span>
            </motion.div>

            {/* Main Title */}
            {/* Responsive Text Size: text-3xl (Mobile) -> text-5xl (Tablet) -> text-8xl (Desktop) */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.2] mb-[12vh] sm:mb-[15vh] tracking-tight drop-shadow-2xl break-keep"
            >
              조직의 미래를 바꾸는<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-400 via-cyber-500 to-cyber-purple">Ethics-Core AI Innovation Partner</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-base sm:text-xl md:text-3xl text-slate-300 font-light leading-relaxed max-w-5xl mx-auto mb-8 sm:mb-10 mt-[12vh] sm:mt-[15vh] break-keep relative z-20 px-2"
            >
              복잡한 조직문화의 부패와 갑질 그리고<br/>
              상담과 신고의 불편함을 즉시 대응하고 실천하는<br/>
              <span className="text-white font-bold">청렴한 AI 솔루션</span>으로 해결해드립니다.
            </motion.p>

            {/* BUTTONS CONTAINER */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-20 relative z-20 w-full sm:w-auto px-4"
            >
                {/* BUTTON 1: 상담하기 (View Switch) */}
                <button 
                  onClick={() => setViewMode('consulting')}
                  className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-blue-600 to-cyber-purple text-white rounded-full font-black text-lg sm:text-xl hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all flex items-center justify-center gap-3 shadow-lg group relative overflow-hidden border border-white/10"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    상담하기 <MessageCircle className="w-5 h-5 fill-white" />
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>

                {/* BUTTON 2: 신청하기 (Open Modal) */}
                <button 
                  onClick={() => setIsApplyModalOpen(true)}
                  className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-blue-600 to-cyber-purple text-white rounded-full font-bold text-lg sm:text-xl hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all flex items-center justify-center gap-3 group border border-white/10 relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    신청하기 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
            </motion.div>
          </motion.div>
        )}

        {/* ================= MODE 2: CONSULTING SECTION ================= */}
        {viewMode === 'consulting' && (
          <motion.div 
            key="consulting"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full min-h-screen flex flex-col items-center relative z-20 pb-24 px-4 overflow-y-auto"
          >
            {/* 
              LAYOUT CONTAINER 
              - Stack vertically on mobile, row on XL
              - gap-12 on mobile, xl:gap-[450px] on desktop
            */}
            <div className="flex flex-col xl:flex-row items-center justify-center gap-12 xl:gap-[450px] w-full max-w-[1600px] my-auto relative z-10 pt-10 md:pt-0">
                
                {/* LEFT: PARTNER CARD */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="w-full max-w-[420px] h-[600px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-cyber-500/30 bg-slate-900/80 backdrop-blur-xl flex flex-col group hover:border-cyber-500 transition-colors duration-500 shrink-1"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-cyber-purple p-8 flex items-center gap-5 relative overflow-hidden shrink-0 h-[140px]">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-12 -mt-12 blur-3xl"></div>
                        <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shadow-lg relative z-10">
                            <Bot className="w-7 h-7 text-white" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-white font-bold text-xl">Ethics-CoreAI<br/>Professional Counselor</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                <p className="text-blue-100 text-sm opacity-90">Ethics-CoreAI Agent</p>
                            </div>
                        </div>
                    </div>

                    {/* Center Content */}
                    <div className="flex-grow flex flex-col items-center justify-center relative z-10 p-8 bg-gradient-to-b from-slate-900 to-[#020205]">
                         {/* Background Grid Pattern - Local overlay for box texture */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                        {/* Icon Container */}
                        <motion.div 
                          className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600/50 flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.15)] group-hover:scale-105 transition-transform duration-500 relative z-10"
                        >
                             <Sparkles className="w-10 h-10 text-cyber-400" />
                             <div className="absolute inset-0 rounded-full border border-cyber-500/30 animate-ping opacity-20" />
                        </motion.div>

                        <div className="relative z-10 w-full">
                          <h3 className="text-xl font-black text-white leading-tight mb-2 tracking-tight font-tech text-center">
                            Ethics-CoreAI Partner
                          </h3>
                          <p className="text-sm text-slate-300 font-medium leading-relaxed break-keep mb-6 text-center">
                            당신의 <span className="text-white font-bold">청렴 파트너</span>가 되어 드립니다.
                          </p>

                          {/* PARTNER LIST BUTTONS */}
                          <div className="space-y-3 w-full">
                              {/* Item 1 */}
                              <button 
                                onClick={() => handleMenuClick('contact')} 
                                className="w-full py-3 px-4 bg-slate-800/50 hover:bg-cyber-900/50 border border-slate-700 hover:border-cyber-500 rounded-xl flex items-center justify-between group/item transition-all"
                              >
                                  <div className="flex items-center gap-3">
                                      <div className="p-1.5 bg-slate-900 rounded-lg text-cyber-400 group-hover/item:text-white transition-colors">
                                          <Handshake className="w-4 h-4" />
                                      </div>
                                      <span className="text-slate-200 font-bold text-sm group-hover/item:text-white">강의 의뢰 및 사업 협업</span>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover/item:text-white" />
                              </button>

                              {/* Item 2 */}
                              <button 
                                onClick={() => handleMenuClick('contact')} 
                                className="w-full py-3 px-4 bg-slate-800/50 hover:bg-cyber-900/50 border border-slate-700 hover:border-cyber-500 rounded-xl flex items-center justify-between group/item transition-all"
                              >
                                  <div className="flex items-center gap-3">
                                      <div className="p-1.5 bg-slate-900 rounded-lg text-cyber-400 group-hover/item:text-white transition-colors">
                                          <UserCheck className="w-4 h-4" />
                                      </div>
                                      <span className="text-slate-200 font-bold text-sm group-hover/item:text-white">청렴 시민 감사관 문의</span>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover/item:text-white" />
                              </button>

                              {/* Item 3 */}
                              <button 
                                onClick={() => handleMenuClick('contact')} 
                                className="w-full py-3 px-4 bg-slate-800/50 hover:bg-cyber-900/50 border border-slate-700 hover:border-cyber-500 rounded-xl flex items-center justify-between group/item transition-all"
                              >
                                  <div className="flex items-center gap-3">
                                      <div className="p-1.5 bg-slate-900 rounded-lg text-cyber-400 group-hover/item:text-white transition-colors">
                                          <FileText className="w-4 h-4" />
                                      </div>
                                      <span className="text-slate-200 font-bold text-sm group-hover/item:text-white">청렴정책 자문위원 문의</span>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover/item:text-white" />
                              </button>
                          </div>
                        </div>
                    </div>
                    
                    {/* Footer Area */}
                    <div className="p-4 bg-slate-950 border-t border-slate-800 text-center shrink-0">
                        <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> System Operational
                        </p>
                    </div>
                </motion.div>

                {/* RIGHT: MENU WIDGET (Items 1-5 Only) */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="w-full max-w-[420px] h-[600px] bg-slate-900/80 backdrop-blur-xl border border-cyber-500/30 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col hover:border-cyber-500 transition-colors duration-500 shrink-1"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-cyber-purple p-8 flex items-center gap-5 relative overflow-hidden shrink-0 h-[140px]">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-12 -mt-12 blur-3xl"></div>
                        <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shadow-lg relative z-10">
                            <Box className="w-7 h-7 text-white" />
                        </div>
                        <div className="relative z-10">
                            {/* Updated Title */}
                            <h3 className="text-white font-bold text-xl">Ethics-CoreAI 전문상담관</h3>
                            <p className="text-blue-100 text-sm opacity-90 mt-1">원하시는 서비스를 선택해주세요.</p>
                        </div>
                    </div>

                    {/* Menu List */}
                    <div className="p-6 space-y-3 flex-grow overflow-y-auto custom-scrollbar flex flex-col justify-center bg-slate-900/40">
                        {menuItems.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleMenuClick(item.action)}
                                className="w-full group flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-cyber-600 hover:border-cyber-500 transition-all duration-300 text-left hover:shadow-lg hover:-translate-y-0.5"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-slate-400 group-hover:text-cyber-600 group-hover:bg-white text-sm font-bold transition-colors shrink-0">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="text-slate-200 font-bold text-base group-hover:text-white truncate">{item.label}</div>
                                        <div className="text-slate-500 text-xs group-hover:text-blue-100 mt-0.5 truncate">{item.desc}</div>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white opacity-50 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 shrink-0" />
                            </button>
                        ))}
                    </div>
                    
                    {/* Footer Area */}
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

      {/* BOTTOM CENTER BUTTON: MAIN (Outside main container to avoid transform issues) */}
      <AnimatePresence>
        {viewMode === 'consulting' && (
            <motion.button 
                key="main-back-button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.8 }}
                onClick={() => setViewMode('intro')}
                // Fixed: Explicit left-[44%] as requested by user to match previous layout
                className="fixed bottom-[5%] sm:bottom-[12%] left-[44%] -translate-x-1/2 z-[100] group bg-gradient-to-r from-blue-600 to-cyber-purple hover:from-blue-500 hover:to-purple-500 border border-white/20 rounded-full text-white font-black text-xs sm:text-sm px-6 sm:px-10 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:shadow-[0_0_40px_rgba(139,92,246,0.7)] transition-all duration-300 uppercase tracking-widest ring-2 ring-white/20 whitespace-nowrap"
            >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:-translate-x-1 transition-transform" />
                <Home className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="text-white ml-1">MAIN 메인 화면으로</span>
                {/* Button Glow Effect */}
                <div className="absolute inset-0 rounded-full ring-2 ring-white/20 animate-pulse-slow pointer-events-none" />
            </motion.button>
        )}
      </AnimatePresence>
      
      {/* Apply Modal */}
      <ApplyModal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} />
    </section>
  );
};

export default Hero;
