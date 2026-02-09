
import React from 'react';
import { Hexagon, Box, Lock } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-6 md:px-12 bg-transparent backdrop-blur-[2px]">
      {/* Logo Section */}
      <a href="#" className="flex items-center gap-4 cursor-pointer group no-underline">
        <div className="relative w-12 h-12 flex items-center justify-center">
          {/* Outer Hexagon */}
          <Hexagon className="w-full h-full text-cyber-accent stroke-[1.5] fill-cyber-accent/5 group-hover:fill-cyber-accent/20 transition-all duration-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
          {/* Inner Cube/Core Graphic Simulation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Box className="w-6 h-6 text-white stroke-2" />
          </div>
          {/* Decorative Lines */}
          <div className="absolute -right-1 -bottom-1 w-2.5 h-2.5 bg-cyber-500 rounded-full animate-pulse"></div>
        </div>
        
        <div className="flex flex-col justify-center">
          <span className="font-tech font-bold text-white text-xl md:text-2xl leading-none tracking-wide group-hover:text-cyber-accent transition-colors">
            Ethics-Core AI
          </span>
          <span className="font-sans font-black text-slate-200 text-lg md:text-xl leading-none tracking-tight mt-1 group-hover:text-white transition-colors">
            청렴공정AI센터
          </span>
        </div>
      </a>

      {/* Navigation Links */}
      <div className="hidden lg:flex items-center gap-6">
        {/* Security Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full mr-2">
            <Lock className="w-3 h-3 text-red-500" />
            <span className="text-[10px] font-bold text-red-400 tracking-wider uppercase">Security Active</span>
        </div>

        <a 
          href="https://blog.naver.com/PostList.naver?blogId=yszoo1467&from=postList&categoryNo=8" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-slate-300 hover:text-white hover:scale-105 transition-all text-sm font-bold"
        >
          About Center
        </a>
        <a 
          href="#proposal-ai"
          className="text-slate-300 hover:text-cyber-accent hover:scale-105 transition-all text-sm font-bold"
        >
          AI Proposal
        </a>
        <a 
          href="#fun-zone"
          className="text-slate-300 hover:text-[#ff6e1e] hover:scale-105 transition-all text-sm font-bold"
        >
          Fun & Play
        </a>
        <a 
          href="https://blog.naver.com/PostList.naver?blogId=yszoo1467&from=postList&categoryNo=31&parentCategoryNo=31" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-slate-300 hover:text-white hover:scale-105 transition-all text-sm font-bold"
        >
          AI Solutions
        </a>
        <a 
          href="https://edu.acrc.go.kr/0302/lecturer/yEYijtPPTsxXYRUcAPed/view.do?_search=true&keyword=%C1%D6%BE%E7%BC%F8" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-slate-300 hover:text-white hover:scale-105 transition-all text-sm font-bold"
        >
          Core Services
        </a>
        <a 
          href="https://edu.acrc.go.kr/0302/lecturer/yEYijtPPTsxXYRUcAPed/resultPop.do" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-slate-300 hover:text-white hover:scale-105 transition-all text-sm font-bold"
        >
          Portfolio
        </a>
        <a 
          href="https://blog.naver.com/PostList.naver?blogId=yszoo1467&from=postList&categoryNo=8"
          target="_blank" 
          rel="noopener noreferrer" 
          className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm hover:bg-slate-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)]"
        >
          Contact Us
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
