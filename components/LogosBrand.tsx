import React from 'react';

interface LogosBrandProps {
  compact?: boolean;
  subtitle?: string;
  className?: string;
}

const LogosBrand: React.FC<LogosBrandProps> = ({
  compact = false,
  subtitle = '청렴공정AI센터',
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative h-14 w-14 overflow-hidden">
        <img src="/logo-transparent.png" alt="Ethics-Core AI logo" className="h-full w-full object-contain" />
      </div>
      <div className="min-w-0">
        <p
          className="truncate bg-gradient-to-r from-sky-300 via-cyan-300 to-blue-400 bg-clip-text text-[28px] font-black leading-none tracking-[0.01em] text-transparent drop-shadow-[0_0_8px_rgba(56,189,248,0.25)]"
          style={{ fontFamily: "'Orbitron', Pretendard, system-ui, sans-serif" }}
        >
          Ethics-Core AI
        </p>
        {!compact && (
          <p
            className="truncate bg-gradient-to-r from-cyan-200 via-sky-200 to-blue-300 bg-clip-text pt-1 text-[14px] font-bold leading-none text-transparent drop-shadow-[0_0_6px_rgba(59,130,246,0.2)]"
            style={{ fontFamily: "'Pretendard', system-ui, sans-serif" }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default LogosBrand;
