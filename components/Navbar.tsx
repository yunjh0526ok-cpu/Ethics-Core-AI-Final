import React, { useState } from 'react';
import { Lock, Menu, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LogosBrand from './LogosBrand';

interface NavbarProps {
  onNavigate: (
    view:
      | 'home'
      | 'about'
      | 'proposal'
      | 'diagnostics'
      | 'admin'
      | 'integrity'
      | 'contact'
      | 'counseling_center'
      | 'relationship'
      | 'facilitator'
      | 'quiz'
      | 'ethics_drama'
      | 'dashboard',
  ) => void;
  currentView: string;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const getLinkClass = (viewName: string) => {
    const isActive = currentView === viewName;
    return `text-sm font-bold tracking-[0.08em] transition-all duration-300 cursor-pointer ${
      isActive ? 'text-[#38B2AC] scale-105' : 'text-slate-300 hover:text-white hover:scale-105'
    }`;
  };

  const handleMobileNav = (view: any) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 md:py-5 md:px-12 bg-[#0F172A]/75 backdrop-blur-md border-b border-[#B89150]/20 shadow-lg">
        {/* Logo Section */}
        <button onClick={() => onNavigate('home')} className="flex items-center gap-3 md:gap-4 cursor-pointer group bg-transparent border-none p-0 outline-none z-50 relative">
          <LogosBrand />
        </button>

        {/* DESKTOP Navigation */}
        <div
          className="hidden xl:flex items-center gap-6"
          style={{ fontFamily: "'Orbitron', Pretendard, system-ui, sans-serif" }}
        >
          <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full mr-4">
            <Lock className="w-3 h-3 text-red-500" />
            <span className="text-[10px] font-bold text-red-400 tracking-wider uppercase">Security Active</span>
          </div>

          <button onClick={() => onNavigate('about')} className={getLinkClass('about')}>ABOUT</button>
          <button onClick={() => onNavigate('proposal')} className={getLinkClass('proposal')}>CORE PROPOSAL</button>
          <button onClick={() => onNavigate('diagnostics')} className={getLinkClass('diagnostics')}>CULTURE SCAN</button>
          <button onClick={() => onNavigate('admin')} className={getLinkClass('admin')}>ADMIN PARTNER</button>
          <button onClick={() => onNavigate('integrity')} className={getLinkClass('integrity')}>INTEGRITY ZONE</button>
          <button onClick={() => onNavigate('ethics_drama')} className={getLinkClass('ethics_drama')}>ETHICS DRAMA</button>
          <button onClick={() => onNavigate('relationship')} className={getLinkClass('relationship')}>
            RELATION LAB
          </button>
          <button onClick={() => onNavigate('facilitator')} className={getLinkClass('facilitator')}>
            ECOSTAGE
          </button>
          <button onClick={() => onNavigate('dashboard')} className={getLinkClass('dashboard')}>
            OPS
          </button>
          <button 
            onClick={() => onNavigate('contact')}
            className="bg-[#B89150] text-[#0F172A] px-6 py-2.5 rounded-full font-bold text-sm hover:brightness-105 transition-colors shadow-[0_0_15px_rgba(184,145,80,0.35)] tracking-wide"
          >
            Contact
          </button>
        </div>

        {/* MOBILE Hamburger */}
        <button 
          className="xl:hidden z-50 p-2 text-white relative hover:text-[#38B2AC] transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </button>
      </nav>

      {/* MOBILE Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-[#0F172A]/95 px-6 pb-[max(2.5rem,env(safe-area-inset-bottom,0px))] pt-28 backdrop-blur-xl xl:hidden"
          >
            <div className="flex flex-col gap-2">
              <MobileMenuItem label="ABOUT" sub="Ethics-Core AI Vision" onClick={() => handleMobileNav('about')} active={currentView === 'about'} />
              <MobileMenuItem label="CORE PROPOSAL" sub="Policy & execution drafts" onClick={() => handleMobileNav('proposal')} active={currentView === 'proposal'} />
              <MobileMenuItem label="CULTURE SCAN" sub="Real-time integrity monitor" onClick={() => handleMobileNav('diagnostics')} active={currentView === 'diagnostics'} />
              <MobileMenuItem label="ADMIN PARTNER" sub="Impact dashboard" onClick={() => handleMobileNav('admin')} active={currentView === 'admin'} />
              <MobileMenuItem label="INTEGRITY ZONE" sub="Integrity DNA & translator" onClick={() => handleMobileNav('integrity')} active={currentView === 'integrity'} />
              <MobileMenuItem label="ETHICS DRAMA" sub="Speech & debate library" onClick={() => handleMobileNav('ethics_drama')} active={currentView === 'ethics_drama'} />
              <MobileMenuItem label="RELATION LAB" sub="Communication diagnostics" onClick={() => handleMobileNav('relationship')} active={currentView === 'relationship'} />
              <MobileMenuItem label="ECOSTAGE" sub="Facilitator session center" onClick={() => handleMobileNav('facilitator')} active={currentView === 'facilitator'} />
              <MobileMenuItem label="OPS" sub="Unified metrics dashboard" onClick={() => handleMobileNav('dashboard')} active={currentView === 'dashboard'} />
              <MobileMenuItem label="Contact" sub="Lectures, partnerships, policy advisory" onClick={() => handleMobileNav('contact')} active={currentView === 'contact'} highlight />
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
        ? 'bg-[#0F172A] border-[#38B2AC] text-white shadow-[0_0_15px_rgba(56,178,172,0.2)]' 
        : highlight 
          ? 'bg-[#B89150] text-[#0F172A] border-[#B89150]' 
          : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
      }
    `}
  >
    <div>
      <span className={`block text-lg font-bold tracking-wide ${highlight ? 'text-[#0F172A]' : active ? 'text-[#38B2AC]' : 'text-white'}`}>
        {label}
      </span>
      <span className={`text-xs ${highlight ? 'text-slate-600' : 'text-slate-500'} font-medium`}>{sub}</span>
    </div>
    <ChevronRight className={`w-5 h-5 ${highlight ? 'text-[#0F172A]' : active ? 'text-[#38B2AC]' : 'text-slate-600 group-hover:text-white'}`} />
  </button>
);

export default Navbar;
