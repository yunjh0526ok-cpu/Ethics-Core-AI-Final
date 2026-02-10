
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Mail, MessageSquare } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface ConsultingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConsultingModal: React.FC<ConsultingModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { 
      role: 'ai', 
      text: "안녕하세요. 청렴공정AI센터 대표 주양순입니다.\n조직의 청렴도 향상이나 적극행정 컨설팅에 대해 무엇이든 물어보세요.\n진정성을 담아 답변해 드리겠습니다." 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Initialize API
  const ai = process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null;

  useEffect(() => {
    if (isOpen) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    if (!ai) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', text: "죄송합니다. 현재 AI 연결이 원활하지 않습니다." }]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMsg,
        config: {
          systemInstruction: `
            당신은 '청렴공정AI센터(Ethics-CoreAI)'의 **주양순 대표**입니다.
            
            [페르소나]
            - 전문성: 청렴 교육, 적극행정 면책, 조직문화 진단 분야의 대한민국 최고 전문가.
            - 태도: 정중하고 따뜻하며, 공직자들의 고충을 깊이 이해하고 공감하는 태도.
            - 말투: "~습니다", "~해요" 등 격식 있으면서도 부드러운 대화체 사용.

            [상담 목표]
            사용자의 문의(강의 요청, 컨설팅, 고민 상담)에 대해 전문적인 1차 답변을 제공하십시오.
            답변 끝에는 항상 "더 깊이 있는 논의나 구체적인 일정 조율이 필요하시다면 아래 이메일로 연락 부탁드립니다."라는 뉘앙스를 풍기세요.

            [필수 포함 문구]
            상담이 마무리되거나 구체적인 견적/일정 문의가 나오면 반드시 **"더 자세한 상담은 yszoo1467@naver.com으로 문의주세요."**라는 문구를 포함하여 안내하십시오.
          `
        }
      });

      const responseText = response.text || "죄송합니다. 답변을 생성할 수 없습니다.";
      setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요." }]);
    } finally {
      setIsTyping(false);
    }
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
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px]"
        >
          {/* Header */}
          <div className="bg-slate-900 p-4 flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyber-500 to-cyber-purple flex items-center justify-center text-white">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">청렴공정 상담소</h3>
                <p className="text-slate-400 text-xs">주양순 대표 AI (Direct Line)</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-[#0b1120] custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user' 
                  ? 'bg-cyber-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Persistent Contact Info */}
          <div className="bg-slate-900/50 p-2 text-center text-xs text-slate-400 border-t border-slate-800">
             <Mail className="w-3 h-3 inline-block mr-1" /> 더 자세한 상담은 <span className="text-cyber-400 font-bold select-all">yszoo1467@naver.com</span>으로 문의주세요.
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-900 border-t border-slate-700">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="문의 내용을 입력하세요..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-white text-sm focus:outline-none focus:border-cyber-500"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cyber-600 hover:bg-cyber-500 rounded-lg text-white transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConsultingModal;
