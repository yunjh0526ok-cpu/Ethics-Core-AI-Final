import React from 'react';
import { motion } from 'framer-motion';
import { SERVICE_DATA } from '../types';
import { BrainCircuit, Presentation, Users, Shield, MessageSquare, ChevronRight, Trophy } from 'lucide-react';

const getIcon = (type: string) => {
  switch (type) {
    case 'presentation': return <Presentation className="w-6 h-6" />;
    case 'brain': return <BrainCircuit className="w-6 h-6" />;
    case 'users': return <Users className="w-6 h-6" />;
    case 'shield': return <Shield className="w-6 h-6" />;
    case 'message': return <MessageSquare className="w-6 h-6" />;
    case 'trophy': return <Trophy className="w-6 h-6" />;
    default: return <BrainCircuit className="w-6 h-6" />;
  }
};

const Services: React.FC = () => {
  return (
    <section id="core-services" className="relative z-10 py-24 px-4 w-full max-w-7xl mx-auto scroll-mt-24">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-16 text-center"
      >
        <motion.h2 
          animate={{
            textShadow: [
              "0 0 0px rgba(59,130,246,0)",
              "0 0 25px rgba(59,130,246,0.5)",
              "0 0 0px rgba(59,130,246,0)"
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-4xl md:text-5xl font-bold text-white mb-4"
        >
          Core Services
        </motion.h2>
        <p className="text-slate-400 max-w-3xl mx-auto text-lg leading-relaxed">
           Ethics-CoreAI만의 차별화된 데이터 기반 솔루션으로<br className="hidden md:block" /> 투명하고 신뢰받는 조직을 설계합니다.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICE_DATA.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group"
          >
            <div className="relative h-full bg-gradient-to-br from-[#0a0a12] to-[#0f0f1a] rounded-3xl p-8 border border-slate-800 hover:border-cyber-500/50 transition-all duration-300 flex flex-col shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              
              {/* Icon & Title Row */}
              <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-cyber-400 group-hover:text-cyber-accent group-hover:border-cyber-accent/50 group-hover:bg-cyber-900/50 group-hover:scale-110 transition-all duration-300 shrink-0">
                    {getIcon(service.iconType)}
                  </div>
                  <h3 className="text-xl font-bold text-white leading-tight group-hover:text-cyber-400 transition-colors duration-300 break-keep">
                    {service.title}
                  </h3>
              </div>

              {/* Description */}
              <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-grow word-keep break-keep group-hover:text-slate-300 transition-colors duration-300">
                {service.description}
              </p>

              {/* Hashtags */}
              <div className="flex flex-wrap gap-2 mt-auto">
                {service.hashtags.map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-500 font-bold group-hover:border-cyber-500/30 group-hover:text-cyber-300 group-hover:bg-cyber-900/30 transition-all duration-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Services;