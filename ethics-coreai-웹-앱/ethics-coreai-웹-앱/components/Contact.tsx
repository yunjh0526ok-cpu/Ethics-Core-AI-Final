import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, Globe, User, ArrowRight } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <section id="contact" className="relative z-10 py-24 px-4 w-full max-w-7xl mx-auto">
      <div className="relative rounded-[3rem] overflow-hidden border border-slate-800 bg-[#0a0a12] p-8 md:p-16 text-center">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.1),transparent_50%)]" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-accent to-transparent opacity-50" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <span className="text-cyber-accent font-tech text-sm tracking-widest uppercase mb-4 block">Let's Work Together</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8">Ready to Connect?</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-16">
            AI 기반의 청렴 윤리 경영 솔루션, 지금 바로 상담하세요.<br/>
            조직의 투명한 미래를 위한 파트너가 되어드리겠습니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
             {/* Profile */}
             <div className="flex flex-col items-center group p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-cyber-purple/60 transition-all hover:bg-slate-900 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]">
                <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                   <User className="w-8 h-8 text-cyber-purple" />
                </div>
                <p className="text-slate-400 font-bold text-sm tracking-wide mb-2 group-hover:text-cyber-purple transition-colors">청렴공정AI센터 (Ethics-Core AI)</p>
                <h3 className="text-white font-black text-3xl md:text-4xl mb-1">주양순 대표</h3>
             </div>

             {/* Phone */}
             <div className="flex flex-col items-center group p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-green-500/60 transition-all hover:bg-slate-900 hover:shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                   <Phone className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-slate-400 font-bold text-sm tracking-wide mb-2 group-hover:text-green-500 transition-colors">Direct Contact</p>
                <h3 className="text-white font-black text-3xl md:text-4xl mb-1 tracking-tight">010-6667-1467</h3>
             </div>

             {/* Email */}
             <div className="flex flex-col items-center group p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-[#ff6e1e]/60 transition-all hover:bg-slate-900 hover:shadow-[0_0_30px_rgba(255,110,30,0.1)]">
                <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(255,110,30,0.3)]">
                   <Mail className="w-8 h-8 text-[#ff6e1e]" />
                </div>
                <p className="text-slate-400 font-bold text-sm tracking-wide mb-2 group-hover:text-[#ff6e1e] transition-colors">Email Address</p>
                <div className="text-center">
                    <h3 className="text-white font-bold text-xl md:text-2xl break-all mb-1">yszoo1467@naver.com</h3>
                    <p className="text-slate-400 font-medium text-lg break-all">yangjang297@gmail.com</p>
                </div>
             </div>
          </div>

          <a 
            href="https://blog.naver.com/yszoo1467" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-12 py-5 bg-white text-black rounded-full font-black text-xl hover:bg-slate-200 transition-all shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:scale-105"
          >
            <Globe className="w-6 h-6" />
            홈페이지(블로그) 방문하기
            <ArrowRight className="w-6 h-6" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;