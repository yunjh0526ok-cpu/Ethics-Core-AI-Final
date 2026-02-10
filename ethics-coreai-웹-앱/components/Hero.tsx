
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, ChevronRight, Play, ShieldCheck, ArrowRight, Video, MessageCircle } from 'lucide-react';
import ApplyModal from './ApplyModal';

const Hero: React.FC = () => {
  const [viewMode, setViewMode] = useState<'intro' | 'consulting'>('intro');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Auto-play video when entering consulting mode
  useEffect(() => {
    if (viewMode === 'consulting' && videoRef.current) {
        // Slight delay to ensure DOM is ready and transition is starting
        setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.currentTime = 0;
                videoRef.current.play().catch(e => console.log("Auto-play prevented", e));
            }
        }, 300);
    }
  }, [viewMode]);

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

  // 6대 핵심 상담 메뉴 (Fixed Text)
  const menuItems = [
    { label: "갑질 및 직장 내 괴롭힘 상담", action: "diagnostics", desc: "비가시적 괴롭힘 진단" },
    { label: "청렴 DNA 진단", action: "integrity", desc: "나의 청렴 MBTI 확인" },
    { label: "부패 상담관", action: "https://aistudio.google.com/app/shared/f1e78453716a44f0b2f155f9a6907c8c", desc: "청탁금지/이해충돌 법령" },
    { label: "공공재정 환수법 상담소", action: "https://gemini.google.com/share/1908208fb5d3", desc: "부정이익 환수 AI 자문" },
    { label: "적극행정 및 면책 상담", action: "admin", desc: "사전컨설팅 및 면책 제도" },
    { label: "강의 의뢰 및 사업 협업 문의", action: "contact", desc: "전문가 매칭 및 협업" }
  ];

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center z-10 px-4 overflow-hidden pt-20 md:pt-0">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber-500/10 blur-[120px] rounded-full pointer-events-none" />

      <AnimatePresence mode="wait">
        
        {/* ================= MODE 1: MAIN INTRO SCREEN ================= */}
        {viewMode === 'intro' && (
          <motion.div 
            key="intro"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-7xl mx-auto flex flex-col items-center relative z-10 w-full"
          >
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <span className="inline-block py-2.5 px-8 rounded-full bg-cyber-900/80 border border-cyber-500/30 text-cyber-400 text-base md:text-lg font-bold tracking-widest shadow-[0_0_20px_rgba(59,130,246,0.15)] backdrop-blur-md">
                청렴공정AI센터
              </span>
            </motion.div>

            {/* Main Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.2] mb-10 tracking-tight drop-shadow-2xl break-keep"
            >
              조직의 미래를 바꾸는<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-400 via-cyber-500 to-cyber-purple">Ethics-Core AI 혁신 파트너</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-3xl text-slate-300 font-light leading-relaxed max-w-5xl mx-auto mb-16 break-keep"
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
                className="flex flex-col sm:flex-row gap-6"
            >
                {/* BUTTON 1: 상담하기 (View Switch) */}
                <button 
                  onClick={() => setViewMode('consulting')}
                  className="px-10 py-5 bg-white text-black rounded-full font-black text-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.3)] group relative overflow-hidden min-w-[240px]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    상담하기 <MessageCircle className="w-5 h-5 fill-black" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
                </button>

                {/* BUTTON 2: 신청하기 (Open Modal) */}
                <button 
                  onClick={() => setIsApplyModalOpen(true)}
                  className="px-10 py-5 bg-transparent border-2 border-slate-600 text-white rounded-full font-bold text-xl hover:bg-slate-800/50 hover:border-white transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 group min-w-[240px]"
                >
                  신청하기
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
            className="w-full max-w-7xl mx-auto h-full min-h-[600px] flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 relative z-20 py-12"
          >
            {/* Close/Back Button */}
            <button 
              onClick={() => setViewMode('intro')}
              className="absolute top-0 right-4 md:-top-12 md:right-0 p-2 text-slate-400 hover:text-white transition-colors flex items-center gap-2 z-50 bg-black/20 rounded-full px-4 border border-white/10"
            >
               <X className="w-5 h-5" /> 메인으로
            </button>

            {/* LEFT: VIDEO AGENT */}
            <div className="w-full md:w-[45%] flex justify-center md:justify-end items-center p-4">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative w-full max-w-[400px] aspect-[9/16] rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] border border-cyber-accent/20 bg-black/40 backdrop-blur-sm group cursor-pointer"
                    onClick={() => {
                        if(videoRef.current) {
                            if(videoRef.current.paused) videoRef.current.play();
                            else videoRef.current.pause();
                        }
                    }}
                >
                    <video
                        ref={videoRef}
                        src="./agent_intro.mp4"
                        className="w-full h-full object-cover mix-blend-screen" 
                        playsInline
                        muted={false}
                        loop
                        onLoadedData={() => setIsVideoLoaded(true)}
                    />
                    
                    {!isVideoLoaded && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-slate-400 text-sm">
                             <Video className="w-8 h-8 mb-2 animate-pulse text-cyber-500" />
                             영상을 불러오는 중입니다...
                         </div>
                    )}

                    {/* Play Overlay (Visible when paused) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                             <Play className="w-8 h-8 text-white fill-white" />
                        </div>
                    </div>

                    {/* Status Indicator */}
                    <div className="absolute top-6 left-6 px-3 py-1 bg-black/60 backdrop-blur rounded-full border border-cyber-accent/30 flex items-center gap-2 pointer-events-none">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-cyber-accent">AI AGENT ONLINE</span>
                    </div>
                </motion.div>
            </div>

            {/* RIGHT: MENU WIDGET */}
            <div className="w-full md:w-[55%] flex justify-center md:justify-start items-center p-4">
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-cyber-500/30 rounded-[2rem] overflow-hidden shadow-2xl"
                >
                    {/* Character Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-cyber-purple p-6 flex items-center gap-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                        <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shadow-lg relative z-10">
                            <Bot className="w-8 h-8 text-white" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-white font-bold text-xl">AI 청렴 파트너</h3>
                            <p className="text-blue-100 text-sm opacity-90">무엇을 도와드릴까요?</p>
                        </div>
                    </div>

                    {/* Menu List */}
                    <div className="p-4 space-y-2.5 max-h-[500px] overflow-y-auto custom-scrollbar">
                        {menuItems.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleMenuClick(item.action)}
                                className="w-full group flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-cyber-600 hover:border-cyber-500 transition-all duration-300 text-left hover:shadow-lg hover:-translate-y-0.5"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-slate-950 flex items-center justify-center text-slate-400 group-hover:text-cyber-600 group-hover:bg-white text-sm font-bold transition-colors shrink-0">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <div className="text-slate-200 font-bold text-base group-hover:text-white">{item.label}</div>
                                        <div className="text-slate-500 text-xs group-hover:text-blue-100 mt-0.5">{item.desc}</div>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white opacity-50 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                            </button>
                        ))}
                    </div>
                    
                    {/* Footer Area */}
                    <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
                        <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Secure & Private Consultation
                        </p>
                    </div>
                </motion.div>
            </div>

          </motion.div>
        )}

      </AnimatePresence>
      
      {/* Apply Modal */}
      <ApplyModal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} />
    </section>
  );
};

export default Hero;
