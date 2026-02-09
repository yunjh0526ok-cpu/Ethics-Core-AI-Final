
import React, { Suspense, useEffect } from 'react';
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

const App: React.FC = () => {
  // --- ETHICS-CORE AI SECURITY PROTOCOL ---
  useEffect(() => {
    // 1. Disable Context Menu (Right Click)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // 2. Disable Developer Shortcuts & Source View
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      
      // Ctrl+Shift+I/J/C (DevTools)
      if (e.ctrlKey && e.shiftKey && ['I','i','J','j','C','c'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+U (View Source) - Critical for code protection
      if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+S (Save Page) - Prevent saving local copy
      if (e.ctrlKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      
      // Ctrl+P (Print)
      if (e.ctrlKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 3. Print Screen Deterrence (Clipboard Cleaning)
    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === 'PrintScreen') {
            // Attempt to clear clipboard to discourage screenshotting sensitive UI
            navigator.clipboard.writeText(''); 
        }
    };
    
    // 4. Drag Protection
    const handleDragStart = (e: DragEvent) => {
        e.preventDefault();
        return false;
    };

    // 5. Active Security Loop (Console Clearing & Anti-Debugging)
    // This constantly clears the console to hide any logs and makes inspection difficult
    const securityInterval = setInterval(() => {
        // Clear console to hide React logs or potential info
        console.clear();
        
        // [SECURITY UPGRADE] Anti-Debugging Trap
        // If someone opens Developer Tools/Source Code, this anonymous function will 
        // trigger a 'debugger' breakpoint, freezing the browser execution repeatedly.
        // This makes inspecting the code extremely difficult and annoying for attackers.
        (function() { 
            try { 
                (function a(){
                    // Only triggers if DevTools is open/active
                    debugger; 
                })();
            } catch(e){} 
        })();
    }, 1000);

    // Attach Listeners
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

  return (
    <div className="min-h-screen bg-[#020205] text-slate-200 font-sans transition-all duration-300 select-none">
      <Navbar />
      <MouseTrail />
      
      <Suspense fallback={<div className="fixed inset-0 bg-black z-50 flex items-center justify-center text-white font-tech animate-pulse">Initializing Security Core...</div>}>
        <Background3D />
      </Suspense>
      
      <main className="relative w-full overflow-x-hidden">
        <Hero />
        <Vision />
        <Services />
        <ProposalChatbot />
        <Diagnostics />
        {/* Added ProactiveAdministration before MBTI_Latte */}
        <ProactiveAdministration />
        <MBTI_Latte />
        <Career />
        <Gallery />
        <Contact />
      </main>
      
      <Footer />
    </div>
  );
};

export default App;
