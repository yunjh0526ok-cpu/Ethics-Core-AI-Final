
import React from 'react';
import { motion } from 'framer-motion';
import { CAREER_DATA } from '../types';
import { ExternalLink, Award, Building2 } from 'lucide-react';

const Career: React.FC = () => {
  return (
    <section id="about" className="relative z-10 py-24 px-4 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-end justify-between mb-12 border-b border-slate-800 pb-6">
        <div>
           <motion.h2 
             initial={{ opacity: 0, x: -20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="text-4xl md:text-5xl font-black text-white mb-2"
           >
             PROFESSIONAL AUTHORITY
           </motion.h2>
           <p className="text-cyber-accent font-mono text-lg">Governance & Integrity Leadership</p>
        </div>
        <p className="hidden md:block text-slate-500 text-sm max-w-md text-right">
          대한민국 주요 정부 기관 및 공공 기관이 신뢰하는<br/> 
          청렴 윤리 및 AI 거버넌스 전문가입니다.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {CAREER_DATA.map((item, index) => (
          <motion.a
            key={item.id}
            href={item.link || "#"}
            target={item.link && item.link !== "#" ? "_blank" : undefined}
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            className="group relative block bg-[#0a0a12] border border-slate-800 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:bg-slate-900 hover:border-cyber-500/50 hover:-translate-y-1 hover:shadow-xl h-full min-h-[220px]"
          >
            {/* Background Gradient on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyber-900/0 to-cyber-900/0 group-hover:from-cyber-900/20 group-hover:to-cyber-purple/10 transition-all duration-300" />

            <div className="relative z-10 h-full flex flex-col">
              <div className="flex justify-between items-start mb-4">
                 <div className={`p-2 rounded-lg transition-colors ${item.isCurrent ? 'bg-cyber-900 text-cyber-accent group-hover:bg-cyber-500 group-hover:text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {item.organization.includes("청렴") ? <Award className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                 </div>
                 {item.link && item.link !== "#" && (
                   <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-cyber-400 transition-colors" />
                 )}
              </div>
              
              <div className="mb-auto">
                <h3 className="text-white font-bold text-lg leading-tight mb-1 group-hover:text-cyber-accent transition-colors break-keep">
                  {/* Parsing parentheses to make inner text smaller */}
                  {item.organization.includes('(') ? (
                    <>
                      {item.organization.split('(')[0]}
                      <span className="text-sm font-normal opacity-70 ml-1">
                        ({item.organization.split('(')[1]}
                      </span>
                    </>
                  ) : (
                    item.organization
                  )}
                </h3>
                <p className="text-slate-400 text-xs font-mono mb-3 uppercase tracking-wider">{item.title}</p>
              </div>

              <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 group-hover:text-slate-300 transition-colors mt-2">
                {item.description}
              </p>
            </div>

            {/* Bottom Accent Line */}
            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyber-accent group-hover:w-full transition-all duration-500" />
          </motion.a>
        ))}
      </div>
    </section>
  );
};

export default Career;
