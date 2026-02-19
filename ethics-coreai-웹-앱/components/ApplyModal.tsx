
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Presentation, Briefcase, ExternalLink, Mail, Phone, UserCheck, GraduationCap, Bot, Sparkles } from 'lucide-react';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApplyModal: React.FC<ApplyModalProps> = ({ isOpen, onClose }) => {
  const [showContact, setShowContact] = useState(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] overflow-y-auto custom-scrollbar">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />
        
        {/* Modal Wrapper */}
        <div className="flex min-h-full items-center justify-center p-4 py-16 md:py-12">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-[#0f172a]/90 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden p-6 md:p-10 flex flex-col mx-auto backdrop-blur-xl"
            >
              <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors z-50">
                <X className="w-6 h-6" />
              </button>

              {/* Header with Ethics-Core AI Mascot */}
              <div className="text-center mb-8 mt-2 flex flex-col items-center">
                  {/* Mascot Eco -> Ethics-Core AI Agent */}
                  <div className="relative mb-4 group cursor-pointer">
                      <div className="absolute inset-0 bg-cyber-500/30 rounded-full blur-xl animate-pulse group-hover:bg-cyber-500/50 transition-all"></div>
                      <div className="relative w-20 h-20 rounded-full bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-cyber-accent flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:scale-110 transition-transform duration-300">
                          <Bot className="w-10 h-10 text-white" />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
                              <Sparkles className="w-3 h-3 text-white fill-white" />
                          </div>
                      </div>
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-cyber-accent font-bold text-sm tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                          Ethics-Core AI Agent
                      </span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-black text-white mb-2">어떤 서비스를 원하시나요?</h3>
                  <p className="text-slate-400 text-sm md:text-base">Ethics-Core AI가 최적의 솔루션을 연결해 드립니다.</p>
              </div>

              {/* 
                 2x2 GRID LAYOUT (Fixed for Mobile & Desktop)
                 grid-cols-2: Always 2 columns
              */}
              <div className="grid grid-cols-2 gap-3 md:gap-6 w-full max-w-3xl mx-auto">
                {/* 1. 강의의뢰 및 신청폼 */}
                <button 
                  onClick={() => window.open('https://genuineform-romelia88280.preview.softr.app/?autoUser=true&show-toolbar=true', '_blank')}
                  className="group flex flex-col items-center p-4 md:p-8 rounded-2xl bg-slate-900/60 border border-slate-700 hover:bg-slate-800 hover:border-cyber-500 hover:scale-[1.02] transition-all duration-300 text-center h-full min-h-[160px] md:min-h-[220px] justify-between shadow-lg"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-cyber-500/10 border border-cyber-500/20 flex items-center justify-center mb-3 md:mb-5 group-hover:bg-cyber-500/20 transition-colors">
                        <Presentation className="w-6 h-6 md:w-8 md:h-8 text-cyber-500" />
                    </div>
                    <h4 className="text-sm md:text-lg font-bold text-white leading-tight break-keep">강의의뢰 및<br/>신청폼</h4>
                  </div>
                  <span className="text-[10px] md:text-xs text-cyber-400 font-bold flex items-center gap-1 group-hover:underline mt-2 opacity-80">
                    작성하기 <ExternalLink className="w-3 h-3" />
                  </span>
                </button>

                {/* 2. Ethics-Core AI 사업 컨설팅 신청 */}
                <button 
                  onClick={() => setShowContact(true)}
                  className="group flex flex-col items-center p-4 md:p-8 rounded-2xl bg-slate-900/60 border border-slate-700 hover:bg-slate-800 hover:border-purple-500 hover:scale-[1.02] transition-all duration-300 text-center h-full min-h-[160px] md:min-h-[220px] justify-between shadow-lg"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3 md:mb-5 group-hover:bg-purple-500/20 transition-colors">
                        <Briefcase className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
                    </div>
                    <h4 className="text-sm md:text-lg font-bold text-white leading-tight break-keep">Ethics-Core AI<br/>사업 컨설팅 신청</h4>
                  </div>
                  <span className="text-[10px] md:text-xs text-purple-400 font-bold flex items-center gap-1 group-hover:underline mt-2 opacity-80">
                    문의하기 <Mail className="w-3 h-3" />
                  </span>
                </button>

                {/* 3. 청렴 시민 감사관 의뢰 */}
                <button 
                  onClick={() => setShowContact(true)}
                  className="group flex flex-col items-center p-4 md:p-8 rounded-2xl bg-slate-900/60 border border-slate-700 hover:bg-slate-800 hover:border-green-500 hover:scale-[1.02] transition-all duration-300 text-center h-full min-h-[160px] md:min-h-[220px] justify-between shadow-lg"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-3 md:mb-5 group-hover:bg-green-500/20 transition-colors">
                        <UserCheck className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
                    </div>
                    <h4 className="text-sm md:text-lg font-bold text-white leading-tight break-keep">청렴 시민<br/>감사관 의뢰</h4>
                  </div>
                  <span className="text-[10px] md:text-xs text-green-400 font-bold flex items-center gap-1 group-hover:underline mt-2 opacity-80">
                    문의하기 <Mail className="w-3 h-3" />
                  </span>
                </button>

                {/* 4. AI 기반 청렴·인권교육 미래대학 프로그램 */}
                <button 
                  onClick={() => window.open('https://blog.naver.com/yszoo1467/224180090553', '_blank')}
                  className="group flex flex-col items-center p-4 md:p-8 rounded-2xl bg-slate-900/60 border border-slate-700 hover:bg-slate-800 hover:border-[#ff6e1e] hover:scale-[1.02] transition-all duration-300 text-center h-full min-h-[160px] md:min-h-[220px] justify-between shadow-lg"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-[#ff6e1e]/10 border border-[#ff6e1e]/20 flex items-center justify-center mb-3 md:mb-5 group-hover:bg-[#ff6e1e]/20 transition-colors">
                        <GraduationCap className="w-6 h-6 md:w-8 md:h-8 text-[#ff6e1e]" />
                    </div>
                    <h4 className="text-sm md:text-lg font-bold text-white leading-tight break-keep">AI 기반 청렴·인권<br/>미래대학 프로그램</h4>
                  </div>
                  <span className="text-[10px] md:text-xs text-[#ff6e1e] font-bold flex items-center gap-1 group-hover:underline mt-2 opacity-80">
                    프로그램 상세 보기 <ExternalLink className="w-3 h-3" />
                  </span>
                </button>
              </div>

              {/* Contact Info Overlay */}
              {showContact && (
                <div 
                    onClick={(e) => e.stopPropagation()}
                    className="absolute inset-0 bg-[#0f172a] z-20 flex flex-col items-center justify-center p-6 animate-in fade-in duration-200"
                >
                    <button onClick={() => setShowContact(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors">
                        <X className="w-6 h-6" />
                    </button>

                    <div className="text-center mb-8">
                        <div className="inline-block p-4 rounded-full bg-slate-800 mb-4 border border-slate-700">
                            <Mail className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="text-2xl font-bold text-white mb-2">문의 안내</h4>
                        <p className="text-slate-300 text-sm leading-relaxed break-keep max-w-md mx-auto">
                            실질적인 변화를 만드는 파트너십,<br/>
                            협업 제안 및 활동 문의는 아래 연락처로 부탁드립니다.
                        </p>
                    </div>
                    
                    <div className="w-full max-w-md space-y-4">
                        <a 
                            href="mailto:yszoo1467@naver.com"
                            className="flex items-center justify-center gap-3 bg-white text-black px-6 py-4 rounded-xl hover:bg-slate-200 transition-colors w-full font-bold text-base shadow-lg hover:scale-[1.02]"
                        >
                            <Mail className="w-5 h-5" /> yszoo1467@naver.com
                        </a>
                        <a 
                            href="tel:010-6667-1467"
                            className="flex items-center justify-center gap-3 bg-slate-800 text-white px-6 py-4 rounded-xl border border-slate-700 hover:border-purple-500 hover:text-purple-400 transition-colors w-full font-bold text-base hover:scale-[1.02]"
                        >
                            <Phone className="w-5 h-5" /> 010-6667-1467
                        </a>
                    </div>

                    <button 
                        onClick={() => setShowContact(false)}
                        className="mt-8 text-sm text-slate-500 hover:text-white underline decoration-slate-700 underline-offset-4"
                    >
                        이전 화면으로 돌아가기
                    </button>
                </div>
              )}
            </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default ApplyModal;
