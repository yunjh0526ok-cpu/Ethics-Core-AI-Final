
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 py-12 border-t border-slate-800 bg-slate-950 text-center">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-2xl font-bold text-white mb-2 font-tech">Ethics-CoreAI</h3>
        
        {/* Updated Copyright Text */}
        <p className="text-slate-500 text-xs md:text-sm mb-8">
          Copyright © 2026 Ethics-Core AI. All rights reserved. 무단 전재 및 재배포 금지
        </p>
        
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
