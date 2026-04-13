
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Mic, MessageSquare, ChevronRight, Volume2 } from 'lucide-react';

interface AISecretaryProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: any) => void;
}

const AISecretary: React.FC<AISecretaryProps> = ({ isOpen, onClose, onNavigate }) => {
  const [hasSpoken, setHasSpoken] = useState(false);

  useEffect(() => {
    if (isOpen && !hasSpoken) {
      const message = "반갑습니다! 에틱스 코어 AI, 주양순 청렴 파트너입니다. 무엇을 도와드릴까요?";
      
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Cancel previous speech
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'ko-KR';
        utterance.rate = 1.0;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      }
      setHasSpoken(true);
    }
    
    // Reset spoken state when closed so it speaks again next time
    if (!isOpen) {
        setHasSpoken(false);
    }
  }, [isOpen]);

  const handleMenuClick = (action: () => void) => {
    action();
    // Optional: Close secretary on selection or keep open? 
    // Keeping open might be better for multiple tasks, but for navigation usually close on mobile.
    // For now, we keep it open as a persistent assistant.
  };

  const menuItems = [
    { 
      label: "갑질·괴롭힘 상담", 
      desc: "비가시적 괴롭힘 진단",
      action: () => onNavigate('diagnostics') 
    },
    { 
      label: "청렴 DNA 진단", 
      desc: "나의 청렴 MBTI 확인",
      action: () => onNavigate('integrity') 
    },
    { 
      label: "부패 상담관 (AI)", 
      desc: "청탁금지/이해충돌 법령",
      action: () => onNavigate('counseling_center') // Scrolls to first iframe
    },
    { 
      label: "공공재정 환수 상담", 
      desc: "부정이익 환수 AI 자문",
      action: () => {
          onNavigate('counseling_center');
          // Small delay to allow view switch before scrolling
          setTimeout(() => {
              document.getElementById('recovery-frame')?.scrollIntoView({ behavior: 'smooth' });
          }, 500);
      }
    },
    { 
      label: "적극행정·면책", 
      desc: "사전컨설팅 및 면책 제도",
      action: () => onNavigate('admin') 
    },
    { 
      label: "강의·사업 문의", 
      desc: "전문가 매칭 및 협업",
      action: () => onNavigate('contact') 
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-[100] w-[350px] md:w-[400px] max-w-[calc(100vw-48px)] bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyber-purple p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg leading-none">AI 주양순 파트너</h3>
                <p className="text-blue-100 text-xs mt-1 flex items-center gap-1">
                  <Volume2 className="w-3 h-3" /> Voice Active
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Chat Bubble Area */}
          <div className="p-5 bg-[#0f172a]/95 h-[450px] overflow-y-auto custom-scrollbar">
            {/* AI Message */}
            <div className="flex gap-3 mb-6">
               <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                 <Mic className="w-4 h-4 text-white" />
               </div>
               <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700 text-slate-200 text-sm leading-relaxed shadow-lg">
                 반갑습니다! <strong className="text-white">에틱스 코어 AI</strong>입니다.<br/>
                 무엇을 도와드릴까요? 아래 메뉴를 선택해주세요.
               </div>
            </div>

            {/* Menu Buttons */}
            <div className="grid grid-cols-1 gap-2">
              {menuItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleMenuClick(item.action)}
                  className="group flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-blue-600 hover:border-blue-500 transition-all duration-200 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-blue-500 transition-colors">
                      <span className="font-bold text-xs">{idx + 1}</span>
                    </div>
                    <div>
                      <h4 className="text-slate-200 font-bold text-sm group-hover:text-white">{item.label}</h4>
                      <p className="text-slate-500 text-xs group-hover:text-blue-200">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 text-center">
             <span className="text-[10px] text-slate-500">Ethics-Core AI Digital Assistant Service</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AISecretary;
