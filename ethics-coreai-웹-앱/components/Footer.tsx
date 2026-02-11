import React from 'react';
import { ShieldAlert, Lock } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 py-12 border-t border-slate-800 bg-slate-950 text-center">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-2xl font-bold text-white mb-2 font-tech">Ethics-CoreAI</h3>
        <p className="text-slate-500 text-sm mb-8">청렴공정AI센터 | Copyright © 2024. All rights reserved.</p>
        
        {/* Prominent Copyright Warning */}
        <div className="max-w-3xl mx-auto mb-10 p-6 bg-red-950/20 border border-red-900/50 rounded-2xl backdrop-blur-sm relative overflow-hidden group hover:bg-red-950/30 transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 opacity-50" />
            
            <div className="flex flex-col items-center justify-center gap-3">
                <div className="flex items-center gap-2 text-red-500 font-bold text-lg">
                    <ShieldAlert className="w-5 h-5 animate-pulse" />
                    <span>COPYRIGHT WARNING</span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed break-keep">
                    본 웹사이트의 모든 콘텐츠(디자인, UI/UX, 소스 코드, 문구, 이미지 등)는 <span className="text-white font-bold">저작권법의 보호</span>를 받습니다.<br />
                    사전 승인 없이 무단으로 복제, 도용, 전재, 재배포하거나 2차 저작물로 가공하는 행위는 엄격히 금지되며,<br />
                    위반 시 <span className="text-red-400 font-bold underline decoration-red-900/50 underline-offset-4">민형사상 법적 책임</span>을 물을 수 있음을 강력히 경고합니다.
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <Lock className="w-3 h-3" />
                    SECURE CONTENT PROTECTION ACTIVE
                </div>
            </div>
        </div>

        <div className="flex justify-center gap-6 text-slate-400 text-sm font-medium">
           <span className="hover:text-white cursor-pointer transition-colors">Contact</span>
           <span className="text-slate-700">•</span>
           <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
           <span className="text-slate-700">•</span>
           <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;