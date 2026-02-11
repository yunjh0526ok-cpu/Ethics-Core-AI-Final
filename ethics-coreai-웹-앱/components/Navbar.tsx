
import React, { useState } from 'react';
import { Hexagon, Box, Lock, Menu, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  onNavigate: (view: 'home' | 'about' | 'proposal' | 'diagnostics' | 'admin' | 'integrity' | 'contact') => void;
  currentView: string;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const getLinkClass = (viewName: string) => {
    const isActive = currentView === viewName;
    return `text-sm font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer ${
      isActive ? 'text-cyber-accent scale-105 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'text-slate-300 hover:text-white hover:scale-105'
    }`;
  };

  const handleMobileNav = (view: any) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 md:py-6 md:px-12 bg-[#020205]/80 backdrop-blur-md border-b border-white/5 shadow-lg">
        {/* Logo Section */}
        <button onClick={() => onNavigate('home')} className="flex items-center gap-3 md:gap-4 cursor-pointer group bg-transparent border-none p-0 outline-none z-50 relative">
          <div className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
            {/* Outer Hexagon */}
            <Hexagon className="w-full h-full text-cyber-accent stroke-[1.5] fill-cyber-accent/5 group-hover:fill-cyber-accent/20 transition-all duration-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
            {/* Inner Cube/Core Graphic Simulation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Box className="w-5 h-5 md:w-6 md:h-6 text-white stroke-2" />
            </div>
            {/* Decorative Lines */}
            <div className="absolute -right-1 -bottom-1 w-2.5 h-2.5 bg-cyber-500 rounded-full animate-pulse"></div>
          </div>
          
          <div className="flex flex-col justify-center text-left">
            <span className="font-tech font-bold text-white text-lg md:text-2xl leading-none tracking-wide group-hover:text-cyber-accent transition-colors">
              Ethics-Core AI
            </span>
            <span className="font-sans font-black text-slate-200 text-sm md:text-xl leading-none tracking-tight mt-1 group-hover:text-white transition-colors">
              청렴공정AI센터
            </span>
          </div>
        </button>

        {/* DESKTOP Navigation Links (Hidden on Mobile) */}
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

        {/* MOBILE Hamburger Button (Visible < XL) */}
        <button 
          className="xl:hidden z-50 p-2 text-white relative hover:text-cyber-accent transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </button>
      </nav>

      {/* MOBILE Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[#020205]/95 backdrop-blur-xl xl:hidden flex flex-col pt-28 px-6 pb-10 overflow-y-auto"
          >
            {/* Mobile Menu Items */}
            <div className="flex flex-col gap-2">
              <MobileMenuItem label="About Company" sub="센터 소개 및 비전" onClick={() => handleMobileNav('about')} active={currentView === 'about'} />
              <MobileMenuItem label="Core Proposal" sub="2026년형 제안서" onClick={() => handleMobileNav('proposal')} active={currentView === 'proposal'} />
              <MobileMenuItem label="Culture Scan" sub="조직문화 진단" onClick={() => handleMobileNav('diagnostics')} active={currentView === 'diagnostics'} />
              <MobileMenuItem label="Admin Partner" sub="적극행정 파트너" onClick={() => handleMobileNav('admin')} active={currentView === 'admin'} />
              <MobileMenuItem label="Integrity Zone" sub="청렴 DNA & 번역기" onClick={() => handleMobileNav('integrity')} active={currentView === 'integrity'} />
              <MobileMenuItem label="Contact Us" sub="문의하기" onClick={() => handleMobileNav('contact')} active={currentView === 'contact'} highlight />
            </div>

            <div className="mt-auto pt-8 border-t border-white/10 text-center">
               <p className="text-slate-500 text-xs mb-2">Ethics-Core AI Digital Platform</p>
               <div className="flex justify-center items-center gap-2 text-red-400 text-xs font-bold bg-red-500/10 py-2 px-4 rounded-full mx-auto w-fit">
                  <Lock className="w-3 h-3" /> Security Protocol Active
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const MobileMenuItem = ({ label, sub, onClick, active, highlight }: { label: string, sub: string, onClick: () => void, active?: boolean, highlight?: boolean }) => (
  <button 
    onClick={onClick}
    className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group
      ${active 
        ? 'bg-cyber-900 border-cyber-accent text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
        : highlight 
          ? 'bg-white text-black border-white' 
          : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
      }
    `}
  >
    <div>
      <span className={`block text-lg font-bold font-tech uppercase tracking-wide ${highlight ? 'text-black' : active ? 'text-cyber-accent' : 'text-white'}`}>
        {label}
      </span>
      <span className={`text-xs ${highlight ? 'text-slate-600' : 'text-slate-500'} font-medium`}>{sub}</span>
    </div>
    <ChevronRight className={`w-5 h-5 ${highlight ? 'text-black' : active ? 'text-cyber-accent' : 'text-slate-600 group-hover:text-white'}`} />
  </button>
);

export default Navbar;
