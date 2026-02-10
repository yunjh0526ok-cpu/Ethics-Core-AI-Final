import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, GraduationCap, Lock, Cpu, Network, BookOpen } from 'lucide-react';

const VisionCard = ({ icon: Icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ delay, duration: 0.6 }}
    whileHover={{ y: -10, rotateX: 5, rotateY: 5 }}
    className="relative group perspective-1000"
  >
    <div className="relative p-6 h-full bg-slate-900/40 border border-slate-700/50 backdrop-blur-sm rounded-2xl overflow-hidden hover:border-cyber-accent/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,110,30,0.15)]">
      {/* Decorative Scanner Line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyber-accent to-transparent -translate-x-full group-hover:animate-[scan_2s_linear_infinite] opacity-50" />
      
      {/* Icon Container with Tooltip */}
      <div className="relative group/icon inline-flex w-12 h-12 rounded-xl bg-slate-800/80 items-center justify-center mb-4 text-cyber-400 group-hover:text-white group-hover:bg-cyber-500/20 transition-all duration-300 cursor-help">
        <Icon className="w-6 h-6" />
        
        {/* Tooltip */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900/95 border border-cyber-accent/30 text-cyber-accent text-xs font-bold rounded opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-[0_0_10px_rgba(6,182,212,0.3)] backdrop-blur-sm z-20">
            {title}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95"></div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyber-accent transition-colors">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-200 transition-colors break-keep">
        {desc}
      </p>
    </div>
  </motion.div>
);

const BusinessItem = ({ label, sub }: { label: string, sub: string }) => (
    <div className="flex items-center gap-3 p-3 border-b border-slate-800 hover:bg-white/5 transition-colors">
        <div className="w-1.5 h-1.5 rounded-full bg-cyber-accent shadow-[0_0_8px_#06b6d4]"></div>
        <div>
            <div className="text-white font-bold text-base">{label}</div>
            <div className="text-slate-500 text-xs group-hover:text-cyber-400 transition-colors">{sub}</div>
        </div>
    </div>
);

const Vision: React.FC = () => {
  return (
    <section id="vision" className="relative z-10 py-16 px-4 w-full max-w-7xl mx-auto scroll-mt-24">
      {/* Section Header */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <span className="text-cyber-accent font-tech tracking-widest text-xs uppercase mb-2 block">Our Vision & Scope</span>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-2xl">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-400 via-cyber-purple to-[#ff6e1e]">Ethics-CoreAI</span>로 완성하는<br className="md:hidden" /> 청렴 기관
        </h2>
        <p className="text-slate-300 max-w-3xl mx-auto text-lg leading-relaxed font-light">
          AI기술적 진보와 윤리적 가치의 완벽한 조화를 통해<br className="hidden md:block" />
          가장 투명하고 강력한 조직의 미래를 설계합니다.
        </p>
      </motion.div>

      {/* Vision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <VisionCard 
          icon={ShieldCheck} 
          title="청렴 (Integrity)" 
          desc="보여주기식 캠페인이 아닌, 데이터로 증명되는 투명성. AI가 부패 유발 요인을 사전에 정밀 탐지하여 청렴 생태계를 설계합니다."
          delay={0.1}
        />
        <VisionCard 
          icon={GraduationCap} 
          title="AI 교육 (AI Education)" 
          desc="이론 중심의 지루한 강의는 이제 그만. 생성형 AI 롤플레잉과 실시간 피드백으로 내면의 윤리 의식을 깨우는 몰입형 교육을 제공합니다."
          delay={0.2}
        />
        <VisionCard 
          icon={Lock} 
          title="공정·신뢰·보안" 
          desc="편향 없는 AI 알고리즘으로 공정한 평가를 실현하고, 24시간 깨어있는 가디언 시스템이 조직의 신뢰 자산을 철통같이 보호합니다."
          delay={0.3}
        />
      </div>

      {/* Business Scope */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
         <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
         >
             <h3 className="text-2xl font-bold text-white mb-4 border-l-4 border-[#ff6e1e] pl-4">
                Business Scope
             </h3>
             <div className="bg-slate-900/30 backdrop-blur-md rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
                <BusinessItem label="Generative AI Role-Playing" sub="현실보다 더 리얼한 AI 딜레마 시뮬레이션 교육" />
                <BusinessItem label="Corruption Detection Radar" sub="빅데이터 기반 부패 이상 징후 조기 경보 시스템" />
                <BusinessItem label="Deep-Dive Culture Analysis" sub="숨겨진 갈등과 불만을 읽어내는 조직 감성 온도계" />
                <BusinessItem label="Iron-Clad Security Guardian" sub="24시간 잠들지 않는 AI 청렴 보안 솔루션" />
             </div>
         </motion.div>

         <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[300px] w-full bg-gradient-to-br from-slate-900 to-[#020205] rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden group"
         >
            {/* Abstract Tech Graphic */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1),transparent_70%)]" />
            
            {/* Rotating Rings (Reduced size) */}
            <div className="absolute w-48 h-48 border border-cyber-500/20 rounded-full animate-[spin_10s_linear_infinite]" />
            <div className="absolute w-36 h-36 border border-[#ff6e1e]/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
            
            {/* Center Hub (Reduced size) */}
            <div className="relative z-10 text-center">
                <div className="w-16 h-16 mx-auto bg-slate-800 rounded-xl flex items-center justify-center border border-cyber-accent/30 shadow-[0_0_30px_rgba(6,182,212,0.3)] mb-3 group-hover:scale-110 transition-transform duration-500">
                    <Cpu className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-tech text-white mb-1">Ethics Core</h4>
                <div className="flex gap-4 justify-center text-[10px] font-mono text-slate-500 mt-2">
                    <span className="flex items-center gap-1"><Network className="w-3 h-3" /> CONNECT</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> LEARN</span>
                </div>
            </div>
         </motion.div>
      </div>
    </section>
  );
};

export default Vision;