
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Presentation, Briefcase, ExternalLink, Mail, Copy, Check } from 'lucide-react';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApplyModal: React.FC<ApplyModalProps> = ({ isOpen, onClose }) => {
  const [showEmail, setShowEmail] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("yszoo1467@naver.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-700 rounded-3xl shadow-2xl overflow-hidden p-8"
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors">
            <X className="w-6 h-6" />
          </button>

          <h3 className="text-2xl md:text-3xl font-black text-white text-center mb-2">어떤 서비스를 원하시나요?</h3>
          <p className="text-slate-400 text-center mb-10 text-sm">목적에 맞는 신청 메뉴를 선택해주세요.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Option 1: Lecture Application */}
            <button 
              onClick={() => window.open('https://genuineform-romelia88280.preview.softr.app/?autoUser=true&show-toolbar=true', '_blank')}
              className="group flex flex-col items-center p-8 rounded-2xl bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:border-cyber-500 hover:scale-[1.02] transition-all duration-300 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-cyber-500/10 border border-cyber-500/20 flex items-center justify-center mb-6 group-hover:bg-cyber-500/20">
                <Presentation className="w-8 h-8 text-cyber-500" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">강의 신청</h4>
              <p className="text-slate-400 text-sm mb-4">청렴, 적극행정, AI 교육 등<br/>전문 강의를 의뢰합니다.</p>
              <span className="text-xs text-cyber-400 font-bold flex items-center gap-1 group-hover:underline">
                신청서 작성하기 <ExternalLink className="w-3 h-3" />
              </span>
            </button>

            {/* Option 2: Business Application */}
            <button 
              onClick={() => setShowEmail(true)}
              className="group flex flex-col items-center p-8 rounded-2xl bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:border-purple-500 hover:scale-[1.02] transition-all duration-300 text-center relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:bg-purple-500/20">
                <Briefcase className="w-8 h-8 text-purple-500" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">사업/컨설팅 신청</h4>
              <p className="text-slate-400 text-sm mb-4">조직 진단, 자문, 캠페인 등<br/>협업을 제안합니다.</p>
              <span className="text-xs text-purple-400 font-bold flex items-center gap-1 group-hover:underline">
                문의처 확인하기 <Mail className="w-3 h-3" />
              </span>

              {/* Email Overlay */}
              {showEmail && (
                <div 
                    onClick={(e) => { e.stopPropagation(); }}
                    className="absolute inset-0 bg-slate-900 z-10 flex flex-col items-center justify-center p-6 animate-in fade-in duration-200"
                >
                    <p className="text-slate-300 text-sm mb-3 font-bold">아래 이메일로 제안서를 보내주세요.</p>
                    <div 
                        onClick={handleCopyEmail}
                        className="flex items-center gap-3 bg-black/50 px-4 py-3 rounded-xl border border-slate-700 cursor-pointer hover:border-white/50 transition-colors w-full justify-between"
                    >
                        <span className="text-white font-mono text-sm">yszoo1467@naver.com</span>
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                    </div>
                    <button 
                        onClick={() => setShowEmail(false)}
                        className="mt-4 text-xs text-slate-500 hover:text-white underline"
                    >
                        돌아가기
                    </button>
                </div>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ApplyModal;
