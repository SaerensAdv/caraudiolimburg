import { useEffect, useState } from "react";

export function BassPulse({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <div className="absolute inset-0 animate-bass-pulse">
        <div className="absolute inset-0 bg-gradient-radial from-[#d0a760]/5 via-transparent to-transparent" />
      </div>
    </div>
  );
}

export function AudioWaveBackground({ className = "" }: { className?: string }) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg
        className="absolute bottom-0 left-0 w-full h-32 opacity-10"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        style={{ transform: `translateX(${scrollY * 0.1}px)` }}
      >
        <path
          d="M0,60 Q150,20 300,60 T600,60 T900,60 T1200,60 L1200,120 L0,120 Z"
          fill="url(#goldGradient)"
          className="animate-wave-slow"
        />
        <path
          d="M0,80 Q100,40 200,80 T400,80 T600,80 T800,80 T1000,80 T1200,80 L1200,120 L0,120 Z"
          fill="url(#goldGradient2)"
          className="animate-wave-medium"
          style={{ transform: `translateX(${scrollY * -0.05}px)` }}
        />
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d0a760" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#d0a760" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#d0a760" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="goldGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d0a760" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#d0a760" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#d0a760" stopOpacity="0.2" />
          </linearGradient>
        </defs>
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
