import { useEffect, useState } from "react";

export function BassPulse({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Central glow pulse */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="w-[800px] h-[800px] rounded-full animate-bass-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(208,167,96,0.15) 0%, rgba(208,167,96,0.08) 30%, rgba(208,167,96,0) 70%)',
          }}
        />
      </div>
      {/* Secondary outer ring */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="w-[1200px] h-[1200px] rounded-full animate-bass-pulse-slow"
          style={{
            background: 'radial-gradient(circle, rgba(208,167,96,0.08) 0%, rgba(208,167,96,0.03) 40%, rgba(208,167,96,0) 60%)',
            animationDelay: '0.5s',
          }}
        />
      </div>
    </div>
  );
}

export function AudioWaveBackground({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute bottom-0 left-0 right-0 h-40 overflow-hidden pointer-events-none ${className}`}>
      {/* Wave 1 - Front */}
      <svg
        className="absolute bottom-0 left-0 w-[200%] h-24 animate-wave-flow"
        viewBox="0 0 2400 100"
        preserveAspectRatio="none"
      >
        <path
          d="M0,50 Q150,20 300,50 T600,50 T900,50 T1200,50 T1500,50 T1800,50 T2100,50 T2400,50 L2400,100 L0,100 Z"
          fill="rgba(208,167,96,0.25)"
        />
      </svg>
      
      {/* Wave 2 - Middle */}
      <svg
        className="absolute bottom-0 left-0 w-[200%] h-20 animate-wave-flow-reverse"
        viewBox="0 0 2400 80"
        preserveAspectRatio="none"
        style={{ animationDuration: '12s' }}
      >
        <path
          d="M0,40 Q100,10 200,40 T400,40 T600,40 T800,40 T1000,40 T1200,40 T1400,40 T1600,40 T1800,40 T2000,40 T2200,40 T2400,40 L2400,80 L0,80 Z"
          fill="rgba(208,167,96,0.15)"
        />
      </svg>
      
      {/* Wave 3 - Back */}
      <svg
        className="absolute bottom-0 left-0 w-[200%] h-16 animate-wave-flow"
        viewBox="0 0 2400 60"
        preserveAspectRatio="none"
        style={{ animationDuration: '18s' }}
      >
        <path
          d="M0,30 Q200,5 400,30 T800,30 T1200,30 T1600,30 T2000,30 T2400,30 L2400,60 L0,60 Z"
          fill="rgba(208,167,96,0.08)"
        />
      </svg>
    </div>
  );
}

export function SpeakerPulseRing({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <div className="absolute inset-0 rounded-full border border-[#d0a760]/20 animate-speaker-ring-1" />
      <div className="absolute inset-2 rounded-full border border-[#d0a760]/30 animate-speaker-ring-2" />
      <div className="absolute inset-4 rounded-full border border-[#d0a760]/40 animate-speaker-ring-3" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-4 h-4 bg-[#d0a760]/50 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

export function FloatingAudioBars({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-end justify-center gap-1 h-8 ${className}`}>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-gradient-to-t from-[#d0a760]/30 to-[#d0a760]/80 animate-audio-bar"
          style={{
            height: "100%",
            animationDelay: `${i * 0.15}s`,
            animationDuration: `${0.8 + i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}

export function GlowingBorder({ children, className = "", active = true }: { children: React.ReactNode; className?: string; active?: boolean }) {
  return (
    <div className={`relative ${className}`}>
      {active && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#d0a760]/0 via-[#d0a760]/30 to-[#d0a760]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-glow-sweep" />
      )}
      {children}
    </div>
  );
}
