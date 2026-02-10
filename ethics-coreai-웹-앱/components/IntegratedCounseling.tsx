
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Scale, ExternalLink, AlertTriangle } from 'lucide-react';

const IntegratedCounseling: React.FC = () => {
  return (
    <section className="relative z-10 py-24 px-4 w-full max-w-7xl mx-auto min-h-screen">
      <div className="text-center mb-12">
         <span className="text-blue-400 font-tech tracking-widest text-xs uppercase mb-2 block">Integrated Counseling Center</span>
         <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
           6대 통합 상담센터
         </h2>
         <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
           외부 이동 없이 한 곳에서.<br/>
           <span className="text-white font-bold">부패 방지 법령</span>부터 <span className="text-white font-bold">공공재정 환수</span>까지 전문 AI가 상담해드립니다.
         </p>
      </div>

      <div className="flex flex-col gap-16">
        {/* 1. ECA Corruption Counselor Iframe */}
        <motion.div 
            id="corruption-frame"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full"
        >
            <div className="flex items-center gap-3 mb-4">
                <ShieldAlert className="w-8 h-8 text-blue-500" />
                <h3 className="text-2xl font-bold text-white">ECA 부패상담관</h3>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">AI Powered</span>
            </div>
            <div className="relative w-full h-[700px] bg-[#0f172a] rounded-3xl border border-slate-700 overflow-hidden shadow-2xl">
                {/* Overlay for warning/instruction if needed */}
                <iframe 
                    src="https://aistudio.google.com/app/shared/f1e78453716a44f0b2f155f9a6907c8c"
                    title="ECA Corruption Counselor"
                    className="w-full h-full border-none"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
                <div className="absolute bottom-0 left-0 w-full bg-slate-900/90 backdrop-blur text-center py-2 border-t border-slate-700">
                    <p className="text-xs text-slate-400 flex items-center justify-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-yellow-500" /> 
                        화면이 보이지 않을 경우 <a href="https://aistudio.google.com/app/shared/f1e78453716a44f0b2f155f9a6907c8c" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">여기<ExternalLink className="w-3 h-3"/></a>를 클릭하세요.
                    </p>
                </div>
            </div>
        </motion.div>

        {/* 2. Public Finance Recovery Iframe */}
        <motion.div 
            id="recovery-frame"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full"
        >
            <div className="flex items-center gap-3 mb-4">
                <Scale className="w-8 h-8 text-green-500" />
                <h3 className="text-2xl font-bold text-white">공공재정환수법 상담소</h3>
                <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30">Gemini Pro</span>
            </div>
            <div className="relative w-full h-[700px] bg-[#0f172a] rounded-3xl border border-slate-700 overflow-hidden shadow-2xl">
                <iframe 
                    src="https://gemini.google.com/share/1908208fb5d3"
                    title="Public Finance Recovery Counseling"
                    className="w-full h-full border-none"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
                <div className="absolute bottom-0 left-0 w-full bg-slate-900/90 backdrop-blur text-center py-2 border-t border-slate-700">
                    <p className="text-xs text-slate-400 flex items-center justify-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-yellow-500" /> 
                        화면이 보이지 않을 경우 <a href="https://gemini.google.com/share/1908208fb5d3" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline flex items-center gap-1">여기<ExternalLink className="w-3 h-3"/></a>를 클릭하세요.
                    </p>
                </div>
            </div>
        </motion.div>
      </div>
    </section>
  );
};

export default IntegratedCounseling;
