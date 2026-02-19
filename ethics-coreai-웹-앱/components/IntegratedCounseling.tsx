
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Scale, ExternalLink, MessageCircle, ArrowRight, ArrowLeft, Bot, Sparkles, AlertTriangle } from 'lucide-react';

type ServiceType = 'corruption' | 'recovery';

const IntegratedCounseling: React.FC = () => {
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);

  // Check for navigation intent from other pages (Hero, Admin)
  useEffect(() => {
    const mode = sessionStorage.getItem('counseling_mode');
    if (mode === 'recovery') {
      setSelectedService('recovery');
      sessionStorage.removeItem('counseling_mode');
    } else if (mode === 'corruption') {
      setSelectedService('corruption');
      sessionStorage.removeItem('counseling_mode');
    }
  }, []);

  const handleBack = () => {
    if (selectedService) {
        setSelectedService(null); // Go back to grid view
    } else {
        // Go back to Home
        sessionStorage.setItem('hero_view_mode', 'consulting');
        const event = new CustomEvent('navigate', { detail: 'home' });
        window.dispatchEvent(event);
    }
  };

  const handleServiceClick = (service: ServiceType) => {
      setSelectedService(service);
  };

  const proceedToExternalLink = () => {
      if (selectedService === 'corruption') {
          window.open("https://ai.studio/apps/drive/1zzGfEevIBZBn6w9CrGeJiEBhbg2HrOQ6?fullscreenApplet=true", '_blank');
      } else if (selectedService === 'recovery') {
          window.open("https://gemini.google.com/share/1908208fb5d3", '_blank');
      }
  };

  const getServiceDetails = (service: ServiceType) => {
      if (service === 'corruption') {
          return {
              title: "ECA 부패상담관",
              subtitle: "청탁금지법 · 행동강령 · 이해충돌방지법",
              desc: "주양순 대표가 설계한 전문 AI입니다.\n안심하고 상담을 시작하세요.",
              themeColor: "text-blue-500",
              bgColor: "bg-blue-500",
              icon: ShieldAlert,
              gradient: "from-blue-600 to-indigo-600",
              hoverGradient: "hover:from-blue-500 hover:to-indigo-500"
          };
      } else {
          return {
              title: "공공재정 환수법 상담소",
              subtitle: "부정이익 환수 · 제재부가금 · 이의신청",
              desc: "주양순 대표가 설계한 전문 AI입니다.\n안심하고 상담을 시작하세요.",
              themeColor: "text-green-500",
              bgColor: "bg-green-500",
              icon: Scale,
              gradient: "from-green-600 to-emerald-600",
              hoverGradient: "hover:from-green-500 hover:to-emerald-500"
          };
      }
  };

  return (
    <section className="relative z-10 py-16 px-4 w-full max-w-6xl mx-auto min-h-[50vh] flex flex-col justify-center">
      {/* Top Back Button (Only visible in Grid View) */}
      {!selectedService && (
          <div className="mb-6 w-full max-w-6xl mx-auto px-4">
            <button 
                onClick={handleBack}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group px-4 py-2 rounded-full hover:bg-slate-800/50"
            >
                <div className="p-1.5 rounded-full bg-slate-800 border border-slate-700 group-hover:border-cyber-accent group-hover:bg-slate-700 transition-all">
                    <ArrowLeft className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm">이전 화면으로</span>
            </button>
          </div>
      )}

      <AnimatePresence mode="wait">
        {selectedService ? (
            /* ================= INSTRUCTION SCREEN (FOR BOTH) ================= */
            <motion.div
                key="intro"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-3xl mx-auto"
            >
                <div className="bg-gradient-to-br from-slate-900/95 to-[#0b1120]/95 border border-slate-700/50 rounded-[2.5rem] p-8 md:p-12 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col items-center text-center">
                    {/* Dynamic Background Decorative */}
                    <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${getServiceDetails(selectedService).gradient}`} />
                    <div className={`absolute top-10 right-10 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-10 ${getServiceDetails(selectedService).bgColor}`} />

                    {/* Logo/Badge */}
                    <div className="mb-6 relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-b from-slate-800 to-slate-950 border border-slate-700 flex items-center justify-center shadow-lg">
                            {React.createElement(getServiceDetails(selectedService).icon, { className: `w-12 h-12 ${getServiceDetails(selectedService).themeColor}` })}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-900 rounded-full border border-slate-700 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
                        {getServiceDetails(selectedService).title}
                    </h2>
                    <span className="inline-block px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-mono tracking-wider mb-8">
                        {getServiceDetails(selectedService).subtitle}
                    </span>

                    {/* Disclaimer Box (Specific Text Requested) */}
                    <div className="mb-10 max-w-2xl bg-slate-800/50 p-6 rounded-2xl border border-white/10 relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-900 border border-slate-700 rounded-full text-xs font-bold text-yellow-500 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> 안내 사항
                        </div>
                        <p className="text-lg text-white font-bold leading-relaxed whitespace-pre-wrap break-keep word-keep">
                            "주양순 대표가 설계한 전문 AI입니다.<br/>
                            안심하고 상담을 시작하세요"
                        </p>
                        <p className="text-slate-400 text-sm mt-3">
                            * 서비스 특성상 접속 시 구글의 보안 확인 문구가 나타날 수 있으나,<br/>
                            이는 공식 절차이오니 안심하고 사용하시기 바랍니다.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
                        <button
                            onClick={proceedToExternalLink}
                            className={`flex-1 py-4 bg-gradient-to-r ${getServiceDetails(selectedService).gradient} ${getServiceDetails(selectedService).hoverGradient} text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02]`}
                        >
                            전문가 AI 상담 시작하기 <ExternalLink className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleBack}
                            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-bold text-lg border border-slate-700 transition-colors"
                        >
                            이전 화면으로
                        </button>
                    </div>
                </div>
            </motion.div>
        ) : (
            /* ================= GRID VIEW ================= */
            <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
            >
                <div className="text-center mb-10">
                    <span className="text-blue-400 font-tech tracking-widest text-xs uppercase mb-2 block">Integrated Counseling Center</span>
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
                    6대 통합 상담센터
                    </h2>
                    <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
                    <span className="text-white font-bold">부패 방지 법령</span>부터 <span className="text-white font-bold">공공재정 환수</span>까지,<br/>
                    전문 AI 상담관이 기다리고 있습니다.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* 1. ECA Corruption Counselor Column */}
                    <div className="flex flex-col h-full">
                        <motion.div 
                            id="corruption-frame"
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="w-full flex-grow"
                        >
                            <div className="flex items-center justify-between mb-3 px-1">
                                <div className="flex items-center gap-2">
                                    <ShieldAlert className="w-5 h-5 text-blue-500" />
                                    <h3 className="text-lg font-bold text-white">ECA 부패상담관</h3>
                                </div>
                                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20">AI Powered</span>
                            </div>
                            
                            <button 
                                onClick={() => handleServiceClick('corruption')}
                                className="block group relative w-full h-[240px] bg-[#0f172a] rounded-2xl border border-slate-700 overflow-hidden shadow-lg hover:border-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all duration-300 hover:-translate-y-1"
                            >
                                <img 
                                    src="https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&q=80&w=800" 
                                    alt="AI Robot Counselor Connection" 
                                    className="w-full h-full object-cover opacity-40 group-hover:opacity-30 group-hover:scale-105 transition-all duration-700"
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center">
                                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
                                        <MessageCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="text-xl font-black text-white mb-2 leading-tight">
                                        청탁금지법 & 행동강령<br/>심층 상담
                                    </h4>
                                    <p className="text-slate-300 text-xs mb-4 max-w-[80%] leading-relaxed line-clamp-2">
                                        복잡한 법령 해석, 딜레마 판단.<br/>Google AI Studio 전문 상담관 연결.
                                    </p>
                                    <div className="px-5 py-2 bg-white/10 backdrop-blur border border-white/20 text-white rounded-full font-bold text-xs flex items-center gap-2 group-hover:bg-white group-hover:text-blue-900 transition-colors">
                                        입장하기 <ArrowRight className="w-3 h-3" />
                                    </div>
                                </div>
                            </button>
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="mt-5 p-5 bg-slate-900/40 border border-slate-800 rounded-2xl flex-grow flex items-center justify-center"
                        >
                            <p className="text-slate-400 text-sm leading-relaxed text-center word-keep break-keep">
                                "Ethics-Core AI는 부패 없는 투명한 사회를 꿈꿉니다. 주양순 대표의 전문 지식을 바탕으로 부패 방지 및 권익 구제에 대한 초동 상담을 지원합니다."
                            </p>
                        </motion.div>
                    </div>

                    {/* 2. Public Finance Recovery Column */}
                    <div className="flex flex-col h-full">
                        <motion.div 
                            id="recovery-frame"
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="w-full flex-grow"
                        >
                            <div className="flex items-center justify-between mb-3 px-1">
                                <div className="flex items-center gap-2">
                                    <Scale className="w-5 h-5 text-green-500" />
                                    <h3 className="text-lg font-bold text-white">공공재정환수법 상담소</h3>
                                </div>
                                <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20">Gemini Pro</span>
                            </div>
                            
                            <button 
                                onClick={() => handleServiceClick('recovery')}
                                className="block group relative w-full h-[240px] bg-[#0f172a] rounded-2xl border border-slate-700 overflow-hidden shadow-lg hover:border-green-500 hover:shadow-[0_0_20px_rgba(22,163,74,0.3)] transition-all duration-300 hover:-translate-y-1"
                            >
                                <img 
                                    src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800" 
                                    alt="AI Data Analysis" 
                                    className="w-full h-full object-cover opacity-40 group-hover:opacity-30 group-hover:scale-105 transition-all duration-700"
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center">
                                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
                                        <Scale className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="text-xl font-black text-white mb-2 leading-tight">
                                        부정이익 환수 &<br/>제재부가금 자문
                                    </h4>
                                    <p className="text-slate-300 text-xs mb-4 max-w-[80%] leading-relaxed line-clamp-2">
                                        환수 절차 및 이의 신청 가이드.<br/>Gemini Pro 법률 자문 연결.
                                    </p>
                                    <div className="px-5 py-2 bg-white/10 backdrop-blur border border-white/20 text-white rounded-full font-bold text-xs flex items-center gap-2 group-hover:bg-white group-hover:text-green-900 transition-colors">
                                        자문 구하기 <ArrowRight className="w-3 h-3" />
                                    </div>
                                </div>
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="mt-5 p-5 bg-slate-900/40 border border-slate-800 rounded-2xl flex-grow flex items-center justify-center"
                        >
                            <p className="text-slate-400 text-sm leading-relaxed text-center word-keep break-keep">
                                "공공재정 환수법은 투명한 국가 재정 운영의 핵심입니다. Ethics-Core AI가 공공재정 부정 청구 및 환수 제도에 대해 명확한 가이드라인을 제시해 드립니다."
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* Bottom Back Button */}
                <div className="mt-12 w-full flex justify-center">
                    <button 
                        onClick={handleBack}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group px-6 py-3 rounded-full hover:bg-slate-800/50"
                    >
                        <div className="p-2 rounded-full bg-slate-800 border border-slate-700 group-hover:border-cyber-accent group-hover:bg-slate-700 transition-all">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-base">이전 화면으로 돌아가기</span>
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default IntegratedCounseling;
