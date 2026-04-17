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
// ✅ 관계 온도계 추가
import RelationshipThermometer from './components/RelationshipThermometer';
// ✅ 퍼실리테이터 대시보드 추가
import FacilitatorDashboard from './components/FacilitatorDashboard';
// ✅ 퀴즈 스테이지 추가
import QuizStage from './components/QuizStage';

// ✅ 'relationship' + 'facilitator' + 'quiz' 뷰 추가
type ViewName = 'home' | 'about' | 'proposal' | 'diagnostics' | 'admin' | 'integrity' | 'contact' | 'counseling_center' | 'relationship' | 'facilitator' | 'quiz';

const App: React.FC = () => {
  const ECO_ADMIN_PASSWORD = import.meta.env.VITE_ECO_ADMIN_PASSWORD || '';
  const MAX_AUTH_ATTEMPTS = 5;
  const LOCK_SECONDS = 60;
  const [currentView, setCurrentView] = useState<ViewName>('home');
  const [quizCategories, setQuizCategories] = useState<string[]>([]);
  const [quizCode, setQuizCode] = useState('');
  const [quizOrgType, setQuizOrgType] = useState<'public' | 'local' | 'enterprise'>('public');
  const [quizPack, setQuizPack] = useState<'basic' | 'advanced' | 'case'>('basic');
  const [ecoAuthorized, setEcoAuthorized] = useState(() => sessionStorage.getItem('eco_admin_auth') === '1');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [pendingView, setPendingView] = useState<ViewName | null>(null);
  const [accessDenied, setAccessDenied] = useState('');
  const [authAttempts, setAuthAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [lockLeft, setLockLeft] = useState(0);

  const needsEcoAuth = (view: ViewName) => view === 'facilitator' || view === 'quiz';

  const routeWithAuth = (view: ViewName) => {
    if (needsEcoAuth(view) && !ecoAuthorized) {
      setPendingView(view);
      setShowAuthModal(true);
      setCurrentView('home');
      setAccessDenied('접근 권한이 없습니다. 관리자에게 문의하세요');
      setTimeout(() => setAccessDenied(''), 2600);
      return;
    }
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
      // 문자열이면 기존 방식
      if (typeof detail === 'string') {
        routeWithAuth(detail as ViewName);
      }
      // 객체이면 view + 추가 데이터
      else if (detail && typeof detail === 'object') {
        routeWithAuth(detail.view as ViewName);
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
    if (!lockUntil) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000));
      setLockLeft(left);
      if (left === 0) {
        setLockUntil(null);
        setAuthAttempts(0);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockUntil]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  return (
    <div className="min-h-screen bg-[#020205] text-slate-200 font-sans transition-all duration-300 select-none">
      <Navbar onNavigate={routeWithAuth} currentView={currentView} />
      <MouseTrail />
      
      <Suspense fallback={<div className="fixed inset-0 bg-black z-50 flex items-center justify-center text-white font-tech animate-pulse">Initializing Security Core...</div>}>
        <Background3D view={currentView} />
      </Suspense>
      
      <main className="relative w-full overflow-x-hidden pt-24 min-h-screen">
        {accessDenied && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-[#1a0f12]/95 border border-orange-300/40 text-orange-200 px-5 py-3 rounded-2xl text-sm font-bold shadow-[0_10px_30px_rgba(249,115,22,0.35)]">
            {accessDenied}
          </div>
        )}
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

        {/* ✅ 관계 온도계 뷰 추가 */}
        {currentView === 'relationship' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <RelationshipThermometer />
          </div>
        )}

        {/* ✅ 퍼실리테이터 대시보드 뷰 추가 */}
        {currentView === 'facilitator' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <FacilitatorDashboard />
          </div>
        )}

        {/* ✅ 퀴즈 스테이지 뷰 추가 */}
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

      {showAuthModal && (
        <div className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-orange-300/35 bg-gradient-to-br from-[#07122b] via-[#0e1a3a] to-[#241238] p-7 shadow-[0_30px_80px_rgba(249,115,22,0.25)]">
            <p className="text-orange-300 text-xs tracking-[0.2em] uppercase font-bold mb-2">EcoStage Access</p>
            <h3 className="text-2xl font-black text-white mb-2">관리자 인증</h3>
            <p className="text-slate-300 text-sm mb-5">에코스테이지는 관리자 권한이 필요합니다.</p>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="관리자 비밀번호 입력"
              className="w-full px-4 py-3 rounded-xl bg-[#111d3d]/70 border border-orange-300/30 text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-300"
            />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => { setShowAuthModal(false); setPendingView(null); setAdminPassword(''); }}
                className="py-3 rounded-xl border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (lockUntil && Date.now() < lockUntil) {
                    setAccessDenied(`로그인 시도 제한 중입니다. ${lockLeft}초 후 다시 시도하세요.`);
                    setCurrentView('home');
                    setTimeout(() => setAccessDenied(''), 2600);
                    return;
                  }
                  if (adminPassword === ECO_ADMIN_PASSWORD) {
                    setEcoAuthorized(true);
                    sessionStorage.setItem('eco_admin_auth', '1');
                    setShowAuthModal(false);
                    setAdminPassword('');
                    if (pendingView) setCurrentView(pendingView);
                    setPendingView(null);
                    setAccessDenied('');
                    setAuthAttempts(0);
                  } else {
                    const nextAttempts = authAttempts + 1;
                    setAuthAttempts(nextAttempts);
                    if (nextAttempts >= MAX_AUTH_ATTEMPTS) {
                      const until = Date.now() + LOCK_SECONDS * 1000;
                      setLockUntil(until);
                      setLockLeft(LOCK_SECONDS);
                      setAccessDenied(`접근 권한이 없습니다. 관리자에게 문의하세요 (${LOCK_SECONDS}초 잠금)`);
                    } else {
                      setAccessDenied(`접근 권한이 없습니다. 관리자에게 문의하세요 (남은 시도 ${MAX_AUTH_ATTEMPTS - nextAttempts}회)`);
                    }
                    setCurrentView('home');
                    setTimeout(() => setAccessDenied(''), 2600);
                  }
                }}
                disabled={!!(lockUntil && Date.now() < lockUntil)}
                className="py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#f97316] to-[#fb923c] hover:from-[#fb923c] hover:to-[#fdba74] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                인증
              </button>
            </div>
            {lockUntil && Date.now() < lockUntil && (
              <p className="mt-3 text-xs text-orange-300 font-semibold text-center">
                보안 잠금 활성화: {lockLeft}초 후 재시도 가능
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
