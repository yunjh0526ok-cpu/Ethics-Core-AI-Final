
import React from 'react';
import { Hexagon, Box, Lock } from 'lucide-react';

interface NavbarProps {
  onNavigate: (view: 'home' | 'about' | 'proposal' | 'diagnostics' | 'admin' | 'integrity' | 'contact') => void;
  currentView: string;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView }) => {
  
  const getLinkClass = (viewName: string) => {
    const isActive = currentView === viewName;
    return `text-sm font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer ${
      isActive ? 'text-cyber-accent scale-105 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'text-slate-300 hover:text-white hover:scale-105'
    }`;
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-6 md:px-12 bg-[#020205]/80 backdrop-blur-md border-b border-white/5">
      {/* Logo Section */}
      <button onClick={() => onNavigate('home')} className="flex items-center gap-4 cursor-pointer group bg-transparent border-none p-0 outline-none">
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
        
        <div className="flex flex-col justify-center text-left">
          <span className="font-tech font-bold text-white text-xl md:text-2xl leading-none tracking-wide group-hover:text-cyber-accent transition-colors">
            Ethics-Core AI
          </span>
          <span className="font-sans font-black text-slate-200 text-lg md:text-xl leading-none tracking-tight mt-1 group-hover:text-white transition-colors">
            청렴공정AI센터
          </span>
        </div>
      </button>

      {/* Navigation Links */}
      <div className="hidden xl:flex items-center gap-8">
        {/* Security Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full mr-4">
            <Lock className="w-3 h-3 text-red-500" />
            <span className="text-[10px] font-bold text-red-400 tracking-wider uppercase">Security Active</span>
        </div>

        <button onClick={() => onNavigate('about')} className={getLinkClass('about')}>
          About
        </button>
        <button onClick={() => onNavigate('proposal')} className={getLinkClass('proposal')}>
          Core Proposal
        </button>
        <button onClick={() => onNavigate('diagnostics')} className={getLinkClass('diagnostics')}>
          Culture Scan
        </button>
        <button onClick={() => onNavigate('admin')} className={getLinkClass('admin')}>
          Admin Partner
        </button>
        <button onClick={() => onNavigate('integrity')} className={getLinkClass('integrity')}>
          Integrity Zone
        </button>
        <button 
          onClick={() => onNavigate('contact')}
          className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm hover:bg-slate-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)] tracking-wider"
        >
          Contact
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
