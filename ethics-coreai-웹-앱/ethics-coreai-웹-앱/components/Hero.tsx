
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, ArrowRight } from 'lucide-react';
import ConsultingModal from './ConsultingModal';
import ApplyModal from './ApplyModal';

const Hero: React.FC = () => {
  const [isConsultingOpen, setIsConsultingOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  return (
    <>
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center z-10 px-4 pt-20">
        {/* Glow Effect behind text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="text-center max-w-6xl mx-auto flex flex-col items-center relative z-10">
          
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
            className="text-xl md:text-3xl text-slate-300 font-light leading-relaxed max-w-5xl mx-auto mb-14 break-keep"
          >
            복잡한 조직문화의 부패와 갑질 그리고 <br className="hidden lg:block" />
            상담과 신고의 불편함을 즉시 대응하고 실천하는 <br className="hidden lg:block" />
            <span className="text-white font-bold">청렴한 AI 솔루션</span>으로 해결해드립니다.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
          >
            <button 
              onClick={() => setIsConsultingOpen(true)}
              className="px-12 py-5 bg-white text-black rounded-full font-bold text-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 group shadow-[0_0_25px_rgba(255,255,255,0.2)]"
            >
              상담하기
              <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
            <button 
              onClick={() => setIsApplyOpen(true)}
              className="px-12 py-5 bg-transparent border-2 border-slate-600 text-white rounded-full font-bold text-xl hover:bg-slate-800/50 hover:border-slate-400 transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] flex items-center justify-center gap-2 group"
            >
              신청하기
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Modals */}
      <ConsultingModal isOpen={isConsultingOpen} onClose={() => setIsConsultingOpen(false)} />
      <ApplyModal isOpen={isApplyOpen} onClose={() => setIsApplyOpen(false)} />
    </>
  );
};

export default Hero;
