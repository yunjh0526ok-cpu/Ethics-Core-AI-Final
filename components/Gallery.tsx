
import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Newspaper, ExternalLink } from 'lucide-react';

const GALLERY_IMAGES = [
  { 
    id: 1, 
    // Image 1: Team Workshop / Brainstorming (Fits "Workshop")
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop', 
    title: 'AI 청렴/적극행정 워크숍', 
    desc: 'Generative AI Simulation Workshop',
    link: 'https://naver.me/5V8qK1CP'
  },
  { 
    id: 2, 
    // Image 2: Professional Consulting / Handshake (Fits "Consulting")
    url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=800&auto=format&fit=crop', 
    title: 'Ethics-CoreAI 맞춤컨설팅', 
    desc: 'Big Data Organization Analysis',
    link: 'https://blog.naver.com/yszoo1467/224151733416'
  },
  { 
    id: 3, 
    // Image 3: Reviewing Documents / Serious Atmosphere (Fits "Auditing/Inspector")
    url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=800&auto=format&fit=crop', 
    title: '청렴시민감사관 활동', 
    desc: 'AI-Based Auditing & Monitoring',
    link: 'https://kookbang.dema.mil.kr/newsWeb/20181024/1/ATCE_CTGR_0010010000/view.do'
  },
  { 
    id: 4, 
    // Image 4: Futuristic Lab / Tech Interaction (Fits "Future Tech & Ethics Lab")
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800&auto=format&fit=crop', 
    title: '청렴공정AI센터 사업현장', 
    desc: 'Future Tech & Ethics Lab',
    link: 'https://blog.naver.com/yszoo1467/223746134903'
  },
];

const Gallery: React.FC = () => {
  return (
    <section className="relative z-10 py-24 px-4 w-full max-w-7xl mx-auto border-b border-slate-800/50">
      <div className="flex flex-col md:flex-row items-end justify-between mb-12 px-4">
        <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-[#ff6e1e]/10 text-[#ff6e1e] text-xs font-bold rounded-full border border-[#ff6e1e]/20 flex items-center gap-1">
                    <Newspaper className="w-3 h-3" /> PRESS RELEASE
                </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">MEDIA & ACTIVITY</h2>
            <p className="text-slate-400 font-mono text-sm md:text-base">주요 언론 보도 및 현장 활동 기록</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-slate-500 text-sm mt-4 md:mt-0">
            <Camera className="w-4 h-4" />
            <span>Field Records 2023-2025</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {GALLERY_IMAGES.map((img, index) => (
          <motion.a
            key={img.id}
            href={img.link}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group relative h-[320px] w-full bg-[#0a0a12] border border-slate-800 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:border-[#ff6e1e]/50 transition-all duration-300 block hover:-translate-y-2"
          >
            {/* Image Container */}
            <div className="h-[65%] w-full overflow-hidden relative">
                <img 
                    src={img.url} 
                    alt={img.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a12] via-[#0a0a12]/20 to-transparent opacity-90" />
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white flex items-center gap-1 group-hover:bg-[#ff6e1e] transition-colors">
                    VIEW <ExternalLink className="w-3 h-3" />
                </div>
            </div>
            
            {/* Text Content */}
            <div className="p-5 flex flex-col justify-between h-[35%] bg-[#0a0a12] relative z-10">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[#ff6e1e] text-[10px] font-bold tracking-wider uppercase truncate max-w-full">{img.desc}</span>
                    </div>
                    <h3 className="text-white text-base font-bold leading-snug group-hover:text-[#ff6e1e] transition-colors break-keep">
                        {img.title}
                    </h3>
                </div>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
};

export default Gallery;
