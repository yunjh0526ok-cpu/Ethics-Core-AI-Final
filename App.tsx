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
import EcaCorruptionCounselor from './components/EcaCorruptionCounselor';
import RelationshipThermometer from './components/RelationshipThermometer';
import FacilitatorDashboard from './components/FacilitatorDashboard';
import QuizStage from './components/QuizStage';
type ViewName = 'home' | 'about' | 'proposal' | 'diagnostics' | 'admin' | 'integrity' | 'contact' | 'counseling_center' | 'relationship' | 'facilitator' | 'quiz';
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};
type UpdateReadyEvent = CustomEvent<ServiceWorkerRegistration>;

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewName>('home');
  const [quizCategories, setQuizCategories] = useState<string[]>([]);
  const [quizCode, setQuizCode] = useState('');
  const [quizOrgType, setQuizOrgType] = useState<'public' | 'local' | 'enterprise'>('public');
  const [quizPack, setQuizPack] = useState<'basic' | 'advanced' | 'case'>('basic');
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [updateRegistration, setUpdateRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);

  const routeView = (view: ViewName) => {
    setCurrentView(view);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    if (page === 'active-admin') {
      setCurrentView('admin');
    }
  }, []);

  useEffect(() => {
    const handleNavigation = (e: CustomEvent) => {
      const detail = e.detail;
      if (typeof detail === 'string') {
        routeView(detail as ViewName);
      } else if (detail && typeof detail === 'object') {
        routeView(detail.view as ViewName);
        if (detail.categories) setQuizCategories(detail.categories);
        if (detail.code) setQuizCode(detail.code);
        if (detail.orgType) setQuizOrgType(detail.orgType);
        if (detail.quizPack) setQuizPack(detail.quizPack);
      }
    };
    window.addEventListener('navigate', handleNavigation as EventListener);
    return () => window.removeEventListener('navigate', handleNavigation as EventListener);
  }, []);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') { e.preventDefault(); return false; }
      if (e.ctrlKey && e.shiftKey && ['I','i','J','j','C','c'].includes(e.key)) { e.preventDefault(); return false; }
      if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) { e.preventDefault(); return false; }
      if (e.ctrlKey && (e.key === 'S' || e.key === 's')) { e.preventDefault(); return false; }
      if (e.ctrlKey && (e.key === 'P' || e.key === 'p')) { e.preventDefault(); return false; }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') { navigator.clipboard.writeText(''); }
    };
    const handleDragStart = (e: DragEvent) => { e.preventDefault(); return false; };
    const securityInterval = setInterval(() => {
      console.clear();
      (function() { try { (function a(){ debugger; })(); } catch(e){} })();
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsIos(isIosDevice);
    if (!isStandalone && isIosDevice) setShowInstallBanner(true);

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };

    const onInstalled = () => {
      setShowInstallBanner(false);
      setInstallPromptEvent(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  useEffect(() => {
    const onUpdateReady = (event: Event) => {
      const detail = (event as UpdateReadyEvent).detail;
      if (!detail) return;
      setUpdateRegistration(detail);
      setShowUpdateBanner(true);
    };

    const onControllerChange = () => {
      window.location.reload();
    };

    window.addEventListener('app-update-ready', onUpdateReady as EventListener);
    navigator.serviceWorker?.addEventListener('controllerchange', onControllerChange);
    return () => {
      window.removeEventListener('app-update-ready', onUpdateReady as EventListener);
      navigator.serviceWorker?.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPromptEvent) return;
    await installPromptEvent.prompt();
    const choice = await installPromptEvent.userChoice;
    if (choice.outcome === 'accepted') {
      setShowInstallBanner(false);
      setInstallPromptEvent(null);
    }
  };

  const handleUpdateClick = () => {
    updateRegistration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
  };

  return (
    <div className="min-h-screen bg-[#020205] text-slate-200 font-sans transition-all duration-300 select-none">
      {showUpdateBanner && (
        <div className="fixed top-24 left-1/2 z-[101] w-[92%] max-w-xl -translate-x-1/2 rounded-2xl border border-emerald-500/30 bg-slate-900/95 p-4 shadow-2xl backdrop-blur">
          <p className="text-sm font-bold text-white">새 버전이 준비되었습니다.</p>
          <p className="mt-1 text-xs text-slate-300">지금 업데이트하면 최신 아이콘과 기능이 바로 적용됩니다.</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleUpdateClick}
              className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-black text-black hover:bg-emerald-400"
            >
              지금 업데이트
            </button>
            <button
              type="button"
              onClick={() => setShowUpdateBanner(false)}
              className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-bold text-slate-300 hover:border-slate-500"
            >
              나중에
            </button>
          </div>
        </div>
      )}
      {showInstallBanner && (
        <div className="fixed bottom-4 left-1/2 z-[100] w-[92%] max-w-xl -translate-x-1/2 rounded-2xl border border-cyan-500/30 bg-slate-900/95 p-4 shadow-2xl backdrop-blur">
          <p className="text-sm font-bold text-white">Ethics-Core AI를 홈 화면에 추가해 앱처럼 사용하세요.</p>
          <p className="mt-1 text-xs text-slate-300">
            {installPromptEvent
              ? '설치 후 주소창 없이 전체 화면으로 실행됩니다.'
              : isIos
                ? 'Safari에서 공유 버튼 -> 홈 화면에 추가를 선택하세요.'
                : '브라우저 메뉴에서 홈 화면 추가를 선택하세요.'}
          </p>
          <div className="mt-3 flex gap-2">
            {installPromptEvent && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-black text-black hover:bg-cyan-400"
              >
                홈 화면에 앱 추가
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowInstallBanner(false)}
              className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-bold text-slate-300 hover:border-slate-500"
            >
              닫기
            </button>
          </div>
        </div>
      )}
      <Navbar onNavigate={routeView} currentView={currentView} />
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
            <EcaCorruptionCounselor />
          </div>
        )}

        {currentView === 'relationship' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <RelationshipThermometer />
          </div>
        )}

        {currentView === 'facilitator' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <FacilitatorDashboard />
          </div>
        )}

        {currentView === 'quiz' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <QuizStage
              initialCategories={quizCategories}
              initialCode={quizCode}
              initialOrgType={quizOrgType}
              initialQuizPack={quizPack}
            />
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
