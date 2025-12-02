import { useEffect, useState } from "react";

export function VerticalScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      
      setProgress(scrollPercent);
      setIsVisible(scrollTop > 200);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div 
      className={`fixed right-4 top-1/2 -translate-y-1/2 z-40 transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
    >
      {/* Track */}
      <div className="relative w-1 h-32 bg-white/10 rounded-full overflow-hidden">
        {/* Progress fill */}
        <div 
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#d0a760] to-[#d0a760]/60 rounded-full transition-all duration-150 ease-out"
          style={{ height: `${progress}%` }}
        />
        
        {/* Glow effect */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-[#d0a760] rounded-full shadow-[0_0_10px_rgba(208,167,96,0.6)] transition-all duration-150"
          style={{ bottom: `calc(${progress}% - 6px)` }}
        />
      </div>
      
      {/* Percentage label */}
      <div 
        className={`absolute -left-8 text-xs text-[#d0a760] font-medium transition-all duration-150`}
        style={{ bottom: `calc(${progress}% - 8px)` }}
      >
        {Math.round(progress)}%
      </div>
    </div>
  );
}
