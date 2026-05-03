import React, { Suspense, useEffect, useState } from 'react';
import Background3D from './components/Background3D';
import Hero from './components/Hero';
import Career from './components/Career';
import Services from './components/Services';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import MouseTrail from './components/MouseTrail';
import GoldParticles from './components/GoldParticles';
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
import EthicsDramaLibrary from './components/EthicsDramaLibrary';
import Dashboard from './src/components/Dashboard.jsx';
type ViewName =
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
  | 'dashboard';

function readViewFromLocation(): ViewName {
  if (typeof window === 'undefined') return 'home';
  if (window.location.pathname === '/dashboard') return 'dashboard';
  const params = new URLSearchParams(window.location.search);
  const page = params.get('page');
  if (page === 'active-admin') return 'admin';
  if (page === 'ethics-drama' || page === 'ethics_drama') return 'ethics_drama';
  return 'home';
}
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};
type UpdateReadyEvent = CustomEvent<ServiceWorkerRegistration>;

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewName>(readViewFromLocation);
  const [quizCategories, setQuizCategories] = useState<string[]>([]);
  const [quizCode, setQuizCode] = useState('');
  const [quizOrgType, setQuizOrgType] = useState<'public' | 'local' | 'enterprise'>('public');
  const [quizPack, setQuizPack] = useState<'basic' | 'advanced' | 'case'>('basic');
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [installError, setInstallError] = useState<string | null>(null);
  const [updateRegistration, setUpdateRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);

  const routeView = (view: ViewName) => {
    setCurrentView(view);
    if (typeof window === 'undefined') return;
    if (view === 'dashboard') {
      window.history.pushState({}, '', '/dashboard');
      return;
    }
    if (window.location.pathname === '/dashboard') {
      window.history.pushState(
        {},
        '',
        view === 'home' ? '/' : `/?page=${encodeURIComponent(view)}`,
      );
    }
  };

  useEffect(() => {
    const sync = () => setCurrentView(readViewFromLocation());
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
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
      if (!('ontouchstart' in window)) {
        (function () {
          try {
            (function a() {
              debugger;
            })();
          } catch {
            /* noop */
          }
        })();
      }
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
    const ua = window.navigator.userAgent;
    const uaLower = ua.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(uaLower) ||
      (typeof navigator.platform === 'string' &&
        navigator.platform === 'MacIntel' &&
        navigator.maxTouchPoints > 1);
    const inApp =
      /kakaotalk|instagram|fb_iab|fban|fbav|line\/|daumapps|twitter|whatsapp|naver\(inapp\)/i.test(
        ua,
      );
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    setIsIos(isIosDevice);
    setIsInAppBrowser(inApp);

    if (isStandalone) {
      setShowInstallBanner(false);
      setInstallPromptEvent(null);
      return;
    }

    if (isIosDevice) {
      setShowInstallBanner(true);
    } else if (inApp) {
      setShowInstallBanner(true);
    }

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
      setInstallError(null);
      setShowInstallBanner(true);
    };

    const onInstalled = () => {
      setShowInstallBanner(false);
      setInstallPromptEvent(null);
      setInstallError(null);
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
    setInstallError(null);
    try {
      await installPromptEvent.prompt();
      const choice = await installPromptEvent.userChoice;
      if (choice.outcome === 'accepted') {
        setShowInstallBanner(false);
      }
    } catch {
      setInstallError(
        '이 환경에서는 설치 창을 열 수 없습니다. Chrome 또는 Samsung Internet에서 이 주소를 연 뒤 다시 시도해 주세요.',
      );
    } finally {
      setInstallPromptEvent(null);
    }
  };

  const handleUpdateClick = () => {
    try {
      sessionStorage.setItem('eca-sw-reload-pending', '1');
    } catch {
      /* noop */
    }
    updateRegistration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
  };

  const openInSystemBrowserHref =
    typeof window !== 'undefined'
      ? (() => {
          const href = window.location.href;
          if (!/android/i.test(navigator.userAgent)) return href;
          const u = new URL(href);
          const scheme = u.protocol.replace(':', '') || 'https';
          const hostPathQuery = `${u.host}${u.pathname === '' ? '/' : u.pathname}${u.search}`;
          const fallback = encodeURIComponent(href);
          return `intent://${hostPathQuery}#Intent;scheme=${scheme};action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.android.chrome;S.browser_fallback_url=${fallback};end`;
        })()
      : '';

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans transition-all duration-300 select-none">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 12mm; }
          html, body { background: #ffffff !important; color: #000000 !important; font-family: 'Nanum Myeongjo', serif !important; }
          .no-print { display: none !important; }
          .print-sheet {
            background: #ffffff !important;
            color: #000000 !important;
            border: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
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
        <div
          className="fixed left-1/2 z-[100] w-[min(92vw,28rem)] max-w-xl -translate-x-1/2 rounded-2xl border border-cyan-500/30 bg-slate-900/95 p-4 shadow-2xl backdrop-blur sm:p-5"
          style={{
            bottom: 'max(1rem, calc(1rem + env(safe-area-inset-bottom, 0px)))',
          }}
        >
          <p className="text-sm font-bold leading-snug text-white sm:text-base">
            Ethics-Core AI를 홈 화면에 추가해 앱처럼 사용하세요.
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-300 sm:text-xs">
            {isInAppBrowser && !isIos ? (
              <>
                카카오·네이버·SNS 앱 안쪽 브라우저에서는 설치가 막히거나 실행이 되지 않을 수 있습니다.{' '}
                <span className="font-semibold text-cyan-200">Chrome에서 이 페이지를 연 뒤</span> 다시
                설치해 보세요.
              </>
            ) : installPromptEvent ? (
              '아래 버튼을 누르면 브라우저 설치 창이 열립니다. 설치 후 홈 화면 아이콘으로 실행하세요.'
            ) : isIos ? (
              <>
                Safari에서 <span className="font-semibold text-cyan-200">공유(□↑) → 홈 화면에 추가</span>를
                선택하세요. iPad는 동일합니다.
              </>
            ) : (
              <>
                Chrome 또는 Samsung Internet에서{' '}
                <span className="font-semibold text-cyan-200">메뉴 ⋮ → 홈 화면에 추가 / 앱 설치</span>를
                찾아 주세요. 태블릿·폰 모두 지원합니다.
              </>
            )}
          </p>
          {installError && (
            <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-[11px] text-amber-100">
              {installError}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {installPromptEvent && !isIos && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="rounded-lg bg-cyan-500 px-3 py-2.5 text-xs font-black text-black hover:bg-cyan-400 sm:py-2"
              >
                홈 화면에 앱 추가
              </button>
            )}
            {isInAppBrowser && !isIos && (
              <a
                href={openInSystemBrowserHref}
                className="inline-flex rounded-lg border border-cyan-400/50 bg-cyan-500/10 px-3 py-2.5 text-xs font-black text-cyan-100 hover:bg-cyan-500/20 sm:py-2"
              >
                Chrome에서 열기
              </a>
            )}
            <button
              type="button"
              onClick={() => {
                setShowInstallBanner(false);
                setInstallError(null);
              }}
              className="rounded-lg border border-slate-600 px-3 py-2.5 text-xs font-bold text-slate-300 hover:border-slate-500 sm:py-2"
            >
              닫기
            </button>
          </div>
        </div>
      )}
      <Navbar onNavigate={routeView} currentView={currentView} />
      <GoldParticles />
      <MouseTrail />

      <Suspense fallback={<div className="fixed inset-0 bg-black z-50 flex items-center justify-center text-white font-tech animate-pulse">Initializing Security Core...</div>}>
        <Background3D view={currentView} />
      </Suspense>

      <main
        className={`relative min-h-screen w-full overflow-x-hidden pt-24 ${
          showInstallBanner ? 'pb-36 sm:pb-32' : 'pb-8'
        }`}
      >
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

        {currentView === 'ethics_drama' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <EthicsDramaLibrary />
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

        {currentView === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Dashboard />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;
