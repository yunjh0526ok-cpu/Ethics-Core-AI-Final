import React, { useEffect, useRef } from 'react';

const MouseTrail: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;

    const moveCursor = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Hardware accelerated transform for main cursor
      cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    };

    const animateFollower = () => {
      // Lerp for smooth following
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;
      
      follower.style.transform = `translate3d(${followerX - 8}px, ${followerY - 8}px, 0)`;
      requestAnimationFrame(animateFollower);
    };

    window.addEventListener('mousemove', moveCursor);
    animateFollower();

    return () => {
      window.removeEventListener('mousemove', moveCursor);
    };
  }, []);

  return (
    <>
      {/* Main minimal dot cursor - Neon Cyan */}
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 w-2.5 h-2.5 bg-[#00f3ff] rounded-full pointer-events-none z-[100] shadow-[0_0_10px_#00f3ff] mix-blend-screen"
        style={{ marginTop: -5, marginLeft: -5 }}
      />
      {/* Subtle follower ring - Neon Cyan */}
      <div 
        ref={followerRef}
        className="fixed top-0 left-0 w-8 h-8 border border-[#00f3ff]/50 rounded-full pointer-events-none z-[99] transition-opacity duration-300 shadow-[0_0_15px_rgba(0,243,255,0.2)]"
      />
    </>
  );
};

export default MouseTrail;