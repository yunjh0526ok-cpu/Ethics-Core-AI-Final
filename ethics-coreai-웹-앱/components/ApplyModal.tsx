
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Presentation, Briefcase, ExternalLink, Mail, Phone, UserCheck } from 'lucide-react';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApplyModal: React.FC<ApplyModalProps> = ({ isOpen, onClose }) => {
  const [showContact, setShowContact] = useState(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-5xl bg-[#0f172a] border border-slate-700 rounded-3xl shadow-2xl overflow-hidden p-8 flex flex-col"
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors z-50">
            <X className="w-6 h-6" />
          </button>

          <h3 className="text-2xl md:text-3xl font-black text-white text-center mb-2">어떤 서비스를 원하시나요?</h3>
          <p className="text-slate-400 text-center mb-10 text-sm">목적에 맞는 신청 메뉴를 선택해주세요.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Option 1: Lecture Application */}
            <button 
              onClick={() => window.open('https://genuineform-romelia88280.preview.softr.app/?autoUser=true&show-toolbar=true', '_blank')}
              className="group flex flex-col items-center p-8 rounded-2xl bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:border-cyber-500 hover:scale-[1.02] transition-all duration-300 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-cyber-500/10 border border-cyber-500/20 flex items-center justify-center mb-6 group-hover:bg-cyber-500/20 transition-colors">
                <Presentation className="w-8 h-8 text-cyber-500" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">강의 신청</h4>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">청렴, 적극행정, AI 교육 등<br/>전문 강의를 의뢰합니다.</p>
              <span className="text-xs text-cyber-400 font-bold flex items-center gap-1 group-hover:underline">
                신청서 작성하기 <ExternalLink className="w-3 h-3" />
              </span>
            </button>

            {/* Option 2: Business Application */}
            <button 
              onClick={() => setShowContact(true)}
              className="group flex flex-col items-center p-8 rounded-2xl bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:border-purple-500 hover:scale-[1.02] transition-all duration-300 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                <Briefcase className="w-8 h-8 text-purple-500" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">사업/컨설팅 신청</h4>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">조직 진단, 자문, 캠페인 등<br/>협업을 제안합니다.</p>
              <span className="text-xs text-purple-400 font-bold flex items-center gap-1 group-hover:underline">
                문의처 확인하기 <Mail className="w-3 h-3" />
              </span>
            </button>

            {/* Option 3: Citizen Auditor (New) */}
            <button 
              onClick={() => setShowContact(true)}
              className="group flex flex-col items-center p-8 rounded-2xl bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:border-green-500 hover:scale-[1.02] transition-all duration-300 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
                <UserCheck className="w-8 h-8 text-green-500" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">청렴시민감사관</h4>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">공공기관 감사 자문 및<br/>제도 개선을 제안합니다.</p>
              <span className="text-xs text-green-400 font-bold flex items-center gap-1 group-hover:underline">
                문의처 확인하기 <Mail className="w-3 h-3" />
              </span>
            </button>
          </div>

          {/* Contact Info Overlay (Covers the whole modal content) */}
          {showContact && (
            <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute inset-0 bg-[#0f172a] z-20 flex flex-col items-center justify-center p-6 animate-in fade-in duration-200"
            >
                <button onClick={() => setShowContact(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors">
                    <X className="w-6 h-6" />
                </button>

                <div className="text-center mb-8">
                    <div className="inline-block p-4 rounded-full bg-slate-800 mb-4">
                        <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-2">문의 안내</h4>
                    <p className="text-slate-300 text-sm leading-relaxed break-keep max-w-md mx-auto">
                        실질적인 변화를 만드는 파트너십,<br/>
                        협업 제안 및 감사관 활동 문의는 아래 연락처로 부탁드립니다.
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
    </AnimatePresence>
  );
};

export default ApplyModal;
