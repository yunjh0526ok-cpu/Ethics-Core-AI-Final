
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Scale, ExternalLink, MessageCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const IntegratedCounseling: React.FC = () => {
  const handleBack = () => {
    sessionStorage.setItem('hero_view_mode', 'consulting');
    const event = new CustomEvent('navigate', { detail: 'home' });
    window.dispatchEvent(event);
  };

  return (
    <section className="relative z-10 py-16 px-4 w-full max-w-6xl mx-auto min-h-[50vh] flex flex-col justify-center">
      {/* Back Button */}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. ECA Corruption Counselor (Link Updated) */}
        <motion.div 
            id="corruption-frame"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full"
        >
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-bold text-white">ECA 부패상담관</h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20">AI Powered</span>
            </div>
            
            <a 
                href="https://ai.studio/apps/drive/1zzGfEevIBZBn6w9CrGeJiEBhbg2HrOQ6?fullscreenApplet=true"
                target="_blank"
                rel="noopener noreferrer"
                className="block group relative w-full h-[240px] bg-[#0f172a] rounded-2xl border border-slate-700 overflow-hidden shadow-lg hover:border-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all duration-300 hover:-translate-y-1"
            >
                {/* Background Image */}
                <img 
                    src="https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&q=80&w=800" 
                    alt="AI Robot Counselor Connection" 
                    className="w-full h-full object-cover opacity-40 group-hover:opacity-30 group-hover:scale-105 transition-all duration-700"
                />
                
                {/* Compact Content Overlay */}
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
            </a>
        </motion.div>

        {/* 2. Public Finance Recovery (Link Updated) */}
        <motion.div 
            id="recovery-frame"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="w-full"
        >
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-green-500" />
                    <h3 className="text-lg font-bold text-white">공공재정환수법 상담소</h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20">Gemini Pro</span>
            </div>
            
            <a 
                href="https://gemini.google.com/share/1908208fb5d3"
                target="_blank"
                rel="noopener noreferrer"
                className="block group relative w-full h-[240px] bg-[#0f172a] rounded-2xl border border-slate-700 overflow-hidden shadow-lg hover:border-green-500 hover:shadow-[0_0_20px_rgba(22,163,74,0.3)] transition-all duration-300 hover:-translate-y-1"
            >
                {/* Background Image */}
                <img 
                    src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800" 
                    alt="AI Data Analysis" 
                    className="w-full h-full object-cover opacity-40 group-hover:opacity-30 group-hover:scale-105 transition-all duration-700"
                />
                
                {/* Compact Content Overlay */}
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
            </a>
        </motion.div>
      </div>
    </section>
  );
};

export default IntegratedCounseling;
