import { useEffect, useState } from "react";
import { useLocation } from "wouter";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const [location] = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    if (location !== displayLocation) {
      setIsTransitioning(true);
      
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setIsTransitioning(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

  return (
    <div 
      className={`transition-all duration-300 ease-out ${
        isTransitioning 
          ? 'opacity-0 translate-y-4' 
          : 'opacity-100 translate-y-0'
      }`}
    >
      {children}
    </div>
  );
}

export function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 30;
      });
    }, 100);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
      {/* Audio wave animation */}
      <div className="flex items-end justify-center gap-1 h-16 mb-8">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="w-1.5 bg-gradient-to-t from-[#d0a760]/50 to-[#d0a760] rounded-full animate-audio-loader"
            style={{
              animationDelay: `${i * 0.1}s`,
              height: '100%',
            }}
          />
        ))}
      </div>
      
      {/* Progress bar */}
      <div className="w-48 h-0.5 bg-white/10 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#d0a760]/50 via-[#d0a760] to-[#d0a760]/50 transition-all duration-200"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      
      {/* Brand text */}
      <p className="mt-6 text-white/40 text-sm tracking-widest uppercase">
        Car Audio Limburg
      </p>
    </div>
  );
}
