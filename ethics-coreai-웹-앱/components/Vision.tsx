import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, GraduationCap, Lock, Cpu, Network, BookOpen, X, CheckCircle2 } from 'lucide-react';

// --- 모달 세부 데이터 ---
const CARD_DETAILS: Record<string, { title: string; points: string[] }> = {
  integrity: {
    title: "청렴 (Integrity)",
    points: [
      "AI 기반 부패 유발 요인 사전 탐지 시스템",
      "데이터로 증명되는 투명성 대시보드 구축",
      "청렴 생태계 설계 컨설팅",
      "익명 내부 신고 채널 운영",
      "청렴도 정밀 측정 및 리포트 제공"
    ]
  },
  education: {
    title: "AI 교육 (AI Education)",
    points: [
      "생성형 AI 롤플레잉 몰입형 교육",
      "실시간 피드백으로 윤리 의식 강화",
      "딜레마 시뮬레이션 실습",
      "조직 맞춤형 커리큘럼 설계",
      "교육 효과 데이터 분석 리포트"
    ]
  },
  trust: {
    title: "공정·신뢰·보안",
    points: [
      "편향 없는 AI 알고리즘 공정 평가",
      "24시간 가디언 시스템 운영",
      "조직 신뢰 자산 측정 및 관리",
      "보안 취약점 정밀 진단",
      "철통 보안 솔루션 구축"
    ]
  },
  roleplay: {
    title: "Generative AI Role-Playing",
    points: [
      "현실보다 더 리얼한 AI 딜레마 시뮬레이션",
      "학습자 답변 실시간 AI 분석 및 피드백",
      "윤리적 판단력 향상 프로그램",
      "부서별 맞춤형 시나리오 제공"
    ]
  },
  radar: {
    title: "Corruption Detection Radar",
    points: [
      "빅데이터 기반 부패 이상 징후 조기 경보",
      "조직 내 위험 신호 실시간 모니터링",
      "부패 패턴 분석 및 예측 시스템",
      "경보 발생 시 즉각 대응 프로세스"
    ]
  },
  culture: {
    title: "Deep-Dive Culture Analysis",
    points: [
      "숨겨진 갈등과 불만 텍스트 분석",
      "조직 감성 온도계 히트맵 시각화",
      "부서별 소통 단절 구간 파악",
      "맞춤형 조직문화 개선 로드맵"
    ]
  },
  security: {
    title: "Iron-Clad Security Guardian",
    points: [
      "24시간 잠들지 않는 AI 청렴 보안",
      "내부 정보 유출 실시간 감지",
      "보안 취약점 자동 스캔 및 알림",
      "조직 신뢰 자산 철통 보호"
    ]
  }
};

// --- VisionCard 컴포넌트 ---
const VisionCard = ({ icon: Icon, title, desc, delay, onClick }: {
  icon: any, title: string, desc: string, delay: number, onClick: () => void
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ delay, duration: 0.6 }}
    whileHover={{ y: -10, rotateX: 5, rotateY: 5 }}
    onClick={onClick}
    className="relative group perspective-1000 cursor-pointer"
  >
    <div className="relative p-6 h-full bg-slate-900/40 border border-slate-700/50 backdrop-blur-sm rounded-2xl overflow-hidden hover:border-cyber-accent/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,110,30,0.15)]">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyber-accent to-transparent -translate-x-full group-hover:animate-[scan_2s_linear_infinite] opacity-50" />

      <div className="relative group/icon inline-flex w-12 h-12 rounded-xl bg-slate-800/80 items-center justify-center mb-4 text-cyber-400 group-hover:text-white group-hover:bg-cyber-500/20 transition-all duration-300">
        <Icon className="w-6 h-6" />
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900/95 border border-cyber-accent/30 text-cyber-accent text-xs font-bold rounded opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-[0_0_10px_rgba(6,182,212,0.3)] backdrop-blur-sm z-20">
          {title}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95"></div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyber-accent transition-colors">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-200 transition-colors break-keep">
        {desc}
      </p>
      {/* 클릭 유도 힌트 */}
      <div className="mt-4 text-xs text-cyber-accent/60 font-bold flex items-center gap-1 group-hover:text-cyber-accent transition-colors">
        <span>자세히 보기</span>
        <span>→</span>
      </div>
    </div>
  </motion.div>
);

// --- BusinessItem 컴포넌트 ---
const BusinessItem = ({ label, sub, onClick }: { label: string, sub: string, onClick: () => void }) => (
  <div
    onClick={onClick}
    className="flex items-center gap-3 p-3 border-b border-slate-700/50 hover:bg-white/5 transition-colors cursor-pointer group"
  >
    <div className="w-1.5 h-1.5 rounded-full bg-cyber-accent shadow-[0_0_8px_#06b6d4] shrink-0"></div>
    <div className="flex-grow">
      <div className="text-white font-bold text-base group-hover:text-cyber-accent transition-colors">{label}</div>
      <div className="text-slate-400 text-xs">{sub}</div>
    </div>
    <span className="text-cyber-accent/50 group-hover:text-cyber-accent text-xs transition-colors">→</span>
  </div>
);

// --- 메인 Vision 컴포넌트 ---
const Vision: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  return (
    <section id="vision" className="relative z-10 py-16 px-4 w-full max-w-[1800px] mx-auto scroll-mt-24 overflow-hidden">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-16 max-w-7xl mx-auto"
      >
        <span className="text-cyber-accent font-tech tracking-widest text-xs uppercase mb-2 block">Our Vision & Scope</span>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-2xl">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-400 via-cyber-purple to-[#ff6e1e]">Ethics-CoreAI</span>로 완성하는<br className="md:hidden" /> 청렴 기관
        </h2>
        <p className="text-slate-300 max-w-3xl mx-auto text-lg leading-relaxed font-light">
          AI기술적 진보와 윤리적 가치의 완벽한 조화를 통해<br className="hidden md:block" />
          가장 투명하고 강력한 조직의 미래를 설계합니다.
        </p>
      </motion.div>

      {/* Vision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-24 max-w-7xl mx-auto">
        <VisionCard
          icon={ShieldCheck}
          title="청렴 (Integrity)"
          desc="보여주기식 캠페인이 아닌, 데이터로 증명되는 투명성. AI가 부패 유발 요인을 사전에 정밀 탐지하여 청렴 생태계를 설계합니다."
          delay={0.1}
          onClick={() => setSelectedCard('integrity')}
        />
        <VisionCard
          icon={GraduationCap}
          title="AI 교육 (AI Education)"
          desc="이론 중심의 지루한 강의는 이제 그만. 생성형 AI 롤플레잉과 실시간 피드백으로 내면의 윤리 의식을 깨우는 몰입형 교육을 제공합니다."
          delay={0.2}
          onClick={() => setSelectedCard('education')}
        />
        <VisionCard
          icon={Lock}
          title="공정·신뢰·보안"
          desc="편향 없는 AI 알고리즘으로 공정한 평가를 실현하고, 24시간 깨어있는 가디언 시스템이 조직의 신뢰 자산을 철통같이 보호합니다."
          delay={0.3}
          onClick={() => setSelectedCard('trust')}
        />
      </div>

      {/* Split Layout */}
      <div className="flex flex-col xl:flex-row items-center justify-center gap-12 xl:gap-[380px] w-full relative">

        {/* Left: Business Scope */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-[450px]"
        >
          <h3 className="text-2xl font-bold text-white mb-6 border-l-4 border-[#ff6e1e] pl-4 drop-shadow-lg">
            Business Scope
          </h3>
          <div className="bg-slate-900/20 backdrop-blur-sm rounded-[2rem] border border-slate-700/50 overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <BusinessItem label="Generative AI Role-Playing" sub="현실보다 더 리얼한 AI 딜레마 시뮬레이션 교육" onClick={() => setSelectedCard('roleplay')} />
              <BusinessItem label="Corruption Detection Radar" sub="빅데이터 기반 부패 이상 징후 조기 경보 시스템" onClick={() => setSelectedCard('radar')} />
              <BusinessItem label="Deep-Dive Culture Analysis" sub="숨겨진 갈등과 불만을 읽어내는 조직 감성 온도계" onClick={() => setSelectedCard('culture')} />
              <BusinessItem label="Iron-Clad Security Guardian" sub="24시간 잠들지 않는 AI 청렴 보안 솔루션" onClick={() => setSelectedCard('security')} />
            </div>
          </div>
        </motion.div>

        {/* Right: Ethics Core Graphic */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative h-[320px] w-full max-w-[450px] bg-[#0a0a12]/10 backdrop-blur-sm rounded-[2rem] border border-slate-700/50 flex items-center justify-center overflow-hidden group shadow-2xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05),transparent_70%)]" />
          <div className="absolute w-48 h-48 border border-cyber-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
          <div className="absolute w-36 h-36 border border-[#ff6e1e]/30 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 mx-auto bg-slate-800/80 backdrop-blur rounded-xl flex items-center justify-center border border-cyber-accent/30 shadow-[0_0_30px_rgba(6,182,212,0.3)] mb-3 group-hover:scale-110 transition-transform duration-500">
              <Cpu className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-xl font-tech text-white mb-1 shadow-black drop-shadow-md">Ethics Core</h4>
            <div className="flex gap-4 justify-center text-[10px] font-mono text-slate-400 mt-2">
              <span className="flex items-center gap-1"><Network className="w-3 h-3" /> CONNECT</span>
              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> LEARN</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 모달 */}
      <AnimatePresence>
        {selectedCard && CARD_DETAILS[selectedCard] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-[#0f172a] border border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              {/* 닫기 버튼 */}
              <button
                onClick={() => setSelectedCard(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-2xl font-black text-white mb-6 border-l-4 border-cyber-accent pl-4">
                {CARD_DETAILS[selectedCard].title}
              </h3>

              <ul className="space-y-4 mb-8">
                {CARD_DETAILS[selectedCard].points.map((point, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3 text-slate-300"
                  >
                    <CheckCircle2 className="w-5 h-5 text-cyber-accent shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </motion.li>
                ))}
              </ul>

              <button
                onClick={() => setSelectedCard(null)}
                className="w-full py-3 bg-cyber-600 hover:bg-cyber-500 text-white rounded-xl font-bold transition-colors"
              >
                닫기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Vision;
