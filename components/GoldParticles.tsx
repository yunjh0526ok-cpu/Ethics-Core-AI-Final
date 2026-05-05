import React, { useEffect, useRef } from 'react';

const GoldParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles = Array.from({ length: 56 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.6 + 0.4,
      v: Math.random() * 0.0006 + 0.00015,
      a: Math.random() * 0.55 + 0.25,
    }));

    let raf = 0;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.y -= p.v;
        if (p.y < -0.04) {
          p.y = 1.03;
          p.x = Math.random();
        }
        const x = p.x * width;
        const y = p.y * height;
        const alpha = p.a * (0.55 + 0.45 * Math.sin((Date.now() / 1000) * 1.6 + p.x * 10));
        ctx.beginPath();
        ctx.fillStyle = `rgba(184,145,80,${Math.max(0.08, alpha)})`;
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[1] opacity-70" aria-hidden="true" />;
};

export default GoldParticles;
