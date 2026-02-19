import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ShieldCheck, ArrowLeft, MessageSquare, Info, Star } from 'lucide-react';

const INITIAL_MESSAGE = "반갑습니다! 적극행정 전문 상담관 '든든이'입니다. 궁금하신 내용을 입력하시면 전문 상담 창으로 연결해 드립니다.";

const ProactiveAdministration: React.FC = () => {
  const [messages, setMessages] = useState([{ role: 'ai', text: INITIAL_MESSAGE }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      window.open("https://ai.studio/apps/drive/12B6y0KRn8rvyecX_2Ap", '_blank');
      setIsTyping(false);
    }, 1000);
  };

  const handleBack = () => {
    sessionStorage.setItem('hero_view_mode', 'consulting');
    const event = new CustomEvent('navigate', { detail: 'home' });
    window.dispatchEvent(event);
  };

  const goToRecovery = () => {
    sessionStorage.setItem('counseling_mode', 'recovery');
    const event = new CustomEvent('navigate', { detail: 'counseling_center' });
    window.dispatchEvent(event);
  };

  const goToCorruption = () => {
    sessionStorage.setItem('counseling_mode', 'corruption');
    const event = new CustomEvent('navigate', { detail: 'counseling_center' });
    window.dispatchEvent(event);
  };

  return (
    <section id="proactive-admin" className="relative z-10 py-24 px-4 w-full max-w-7xl mx-auto scroll-mt-24">
      <div className="mb-6 w-full max-w-7xl mx-auto px-4">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group px-4 py-2 rounded-full hover:bg-slate-800/50"
        >
          <div className="p-1.5 rounded-full bg-slate-800 border border-slate-700 group-hover:border-cyber-accent group-hover:bg-slate-700 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm">이전 화면으로</span>
        </button>
      </div>

      <div className="text-center mb-12">
        <span className="text-blue-400 font-tech tracking-widest text-xs uppercase mb-2 block">Government Innovation</span>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
          적극행정 AI 센터 <span className="text-blue-500">든든이</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
          대한민국 공무원의 소신 있는 행정을 지원합니다.<br/>
          <span className="text-white font-bold">법령 해석, 면책 요건, 2025 우수사례</span>까지 실시간으로 상담하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-6">
          <div className="p-8 rounded-[2.5rem] bg-slate-900/80 border border-slate-800 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck className="w-24 h-24 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
              상담 안내
            </h3>
            <ul className="space-y-4">
              {[
                { label: '실시간 상담', value: '24/7 AI 가동' },
                { label: '최신 데이터', value: '2025 우수사례 반영' },
                { label: '전문 분야', value: '적극행정 법령/면책' }
              ].map((item, i) => (
                <li key={i} className="flex justify-between items-center p-3 rounded-xl bg-slate-950/50 border border-slate-800/50">
                  <span className="text-slate-400 text-sm">{item.label}</span>
                  <span className="text-blue-400 font-bold text-sm">{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-8 relative">
          <div className="bg-slate-900/50 rounded-[2.5rem] border border-slate-800 backdrop-blur-xl h-[600px] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-900/20' 
                      : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start items-center gap-3 text-blue-400 px-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="text-xs font-tech tracking-tighter uppercase opacity-70">상담관 연결 중...</span>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            <div className="p-6 bg-slate-900/80 border-t border-slate-800">
              <div className="relative flex items-center gap-3">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="궁금하신 적극행정 내용을 입력하세요..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all text-sm"
                />
                <button 
                  onClick={() => handleSend()}
                  className="p-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-white transition-all shadow-lg shadow-blue-900/20 group"
                >
                  <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProactiveAdministration;
