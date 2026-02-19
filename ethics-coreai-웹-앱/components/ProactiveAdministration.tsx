GitHub의 파일 내용을 전부 지우고 이 코드를 통째로 붙여넣으세요. ```typescript
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ShieldCheck, ArrowLeft, MessageSquare, Info, Star, CheckCircle, Activity, Users, Zap, AlertTriangle, Coins, Search, LayoutGrid, Briefcase, ExternalLink } from 'lucide-react';

const INITIAL_MESSAGE = "반갑습니다! 대한민국 적극행정 지킴이, AI 상담관 '든든이'입니다.\n\n2025년 적극행정 우수사례 경진대회 수상작(NEW) 데이터와 주양순 전문강사의 AI 기반 강의 정보가 업데이트되었습니다.\n\n최신 우수사례, 심사 배점 기준, 면책 제도, 강사단 모집 등 무엇이든 물어보시면 공직자 여러분께 힘이 되는 정확한 팩트만 답변해 드립니다.";

const ProactiveAdministration: React.FC = () => {
const [messages, setMessages] = useState([{ role: 'ai', text: INITIAL_MESSAGE }]);
const [input, setInput] = useState('');
const [isTyping, setIsTyping] = useState(false);
const [showBridge, setShowBridge] = useState(false);
const scrollRef = useRef<HTMLDivElement>(null);

const rollingQA = [
"적극행정 면책 제도(고의·중과실 배제) 신청 방법은?",
"2025년 적극행정 우수사례 경진대회 최신 수상작 리스트",
"주양순 전문강사의 '실패를 두려워않는 공직문화' 강의 커리큘럼",
"사전 컨설팅 감사제도와 적극행정위원회 심의 차이점",
"적극행정 우수공무원 특별승진 및 파격 인센티브 기준",
"소방청 '119패스' 및 행안부 '딥페이크 탐지' 우수사례 분석",
"지방공무원 적극행정 운영 지침 및 면책 요건 가이드",
"규제 샌드박스 및 적극적 법령 해석 지원 신청 절차",
"2026년 적극행정 전문강사단 정기 모집 기간 및 자격",
"적극행정 면책 보호관 제도 및 법률 지원 서비스 안내",
"적극행정 마일리지 제도 도입 및 운영 사례 공유",
"징계 의결 제외를 위한 적극행정 면책 건의서 작성법"
];

useEffect(() => {
scrollRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages, isTyping]);

const handleSend = async (text: string = input) => {
if (!text.trim()) return;
setMessages(prev => [...prev, { role: 'user', text }]);
setInput('');
setIsTyping(true);
setTimeout(() => {
setIsTyping(false);
setShowBridge(true);
}, 1000);
};

const startExternalChat = () => {
window.open("https://ai.studio/apps/drive/12B6y0KRn8rvyecX_2Ap", '_blank');
setShowBridge(false);
};

const handleBack = () => {
sessionStorage.setItem('hero_view_mode', 'consulting');
const event = new CustomEvent('navigate', { detail: 'home' });
window.dispatchEvent(event);
};

const goToRecovery = () => {
sessionStorage.setItem('counseling_mode', 'recovery');
const event = new CustomEvent('navigate', { detail: 'counseling_center' });
window.dispatchEvent(event);
};

const goToCorruption = () => {
sessionStorage.setItem('counseling_mode', 'corruption');
const event = new CustomEvent('navigate', { detail: 'counseling_center' });
window.dispatchEvent(event);
};

return (
<div className="min-h-screen bg-[#050A15] text-slate-300 font-sans selection:bg-blue-500/30">
<style>{@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .animate-marquee { display: flex; width: max-content; animation: marquee 40s linear infinite; } .animate-marquee:hover { animation-play-state: paused; }}</style>
