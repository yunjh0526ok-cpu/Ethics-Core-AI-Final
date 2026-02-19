
import React, { Suspense, useEffect, useState } from 'react';
import Background3D from './components/Background3D';
import Hero from './components/Hero';
import Career from './components/Career';
import Services from './components/Services';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import MouseTrail from './components/MouseTrail';
import Vision from './components/Vision';
import Gallery from './components/Gallery';
import Diagnostics from './components/Diagnostics';
import Contact from './components/Contact';
import ProposalChatbot from './components/ProposalChatbot';
import MBTI_Latte from './components/MBTI_Latte';
import ProactiveAdministration from './components/ProactiveAdministration';
import IntegratedCounseling from './components/IntegratedCounseling';

type ViewName = 'home' | 'about' | 'proposal' | 'diagnostics' | 'admin' | 'integrity' | 'contact' | 'counseling_center';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewName>('home');

  // Handle direct links via query parameters (e.g., QR Code for Lectures)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    
    // Direct link for Proactive Administration (Lectures)
    if (page === 'active-admin') {
      setCurrentView('admin');
    }
  }, []);

  // Listen for custom navigation events
  useEffect(() => {
    const handleNavigation = (e: CustomEvent<ViewName>) => {
      setCurrentView(e.detail);
    };
    window.addEventListener('navigate', handleNavigation as EventListener);
    return () => window.removeEventListener('navigate', handleNavigation as EventListener);
  }, []);

  // --- ETHICS-CORE AI SECURITY PROTOCOL ---
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      if (e.ctrlKey && e.shiftKey && ['I','i','J','j','C','c'].includes(e.key)) {
        e.preventDefault();
        return false;
      }
      if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        return false;
      }
      if (e.ctrlKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        return false;
      }
      if (e.ctrlKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        return false;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === 'PrintScreen') {
            navigator.clipboard.writeText(''); 
        }
    };
    
    const handleDragStart = (e: DragEvent) => {
        e.preventDefault();
        return false;
    };

    // Console clearing to prevent inspection
    const securityInterval = setInterval(() => {
        console.clear();
        (function() { 
            try { 
                (function a(){
                    debugger; 
                })();
            } catch(e){} 
        })();
    }, 1000);

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('dragstart', handleDragStart);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('dragstart', handleDragStart);
      clearInterval(securityInterval);
    };
  }, []);

  // Smooth scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  return (
    <div className="min-h-screen bg-[#020205] text-slate-200 font-sans transition-all duration-300 select-none">
      <Navbar onNavigate={setCurrentView} currentView={currentView} />
      <MouseTrail />
      
      <Suspense fallback={<div className="fixed inset-0 bg-black z-50 flex items-center justify-center text-white font-tech animate-pulse">Initializing Security Core...</div>}>
        <Background3D view={currentView} />
      </Suspense>
      
      <main className="relative w-full overflow-x-hidden pt-24 min-h-screen">
        {currentView === 'home' && <Hero />}
        
        {currentView === 'about' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Vision />
            <Services />
            <Career />
            <Gallery />
          </div>
        )}

        {currentView === 'proposal' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ProposalChatbot />
          </div>
        )}

        {currentView === 'diagnostics' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Diagnostics />
          </div>
        )}

        {currentView === 'admin' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ProactiveAdministration />
          </div>
        )}

        {currentView === 'integrity' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <MBTI_Latte />
          </div>
        )}

        {currentView === 'counseling_center' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 여기를 아래 글자로 교체! */}
            <ProactiveAdministration />
          </div>
        )}

        {currentView === 'contact' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Contact />
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default App;
