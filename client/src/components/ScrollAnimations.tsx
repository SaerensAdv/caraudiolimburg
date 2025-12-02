import { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
  once?: boolean;
}

export function ScrollReveal({ 
  children, 
  className = "", 
  delay = 0, 
  direction = "up",
  duration = 700,
  once = true 
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [once]);

  const getTransform = () => {
    switch (direction) {
      case "up": return "translateY(40px)";
      case "down": return "translateY(-40px)";
      case "left": return "translateX(40px)";
      case "right": return "translateX(-40px)";
      default: return "none";
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "none" : getTransform(),
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  baseDelay?: number;
}

export function StaggerContainer({ 
  children, 
  className = "", 
  staggerDelay = 100,
  baseDelay = 0 
}: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children) ? children.map((child, index) => (
        <div
          key={index}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "none" : "translateY(30px)",
            transition: `opacity 600ms ease-out ${baseDelay + index * staggerDelay}ms, transform 600ms ease-out ${baseDelay + index * staggerDelay}ms`,
          }}
        >
          {child}
        </div>
      )) : children}
    </div>
  );
}

interface ParallaxProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  direction?: "up" | "down";
}

export function Parallax({ 
  children, 
  className = "", 
  speed = 0.3,
  direction = "up" 
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const scrolled = window.innerHeight - rect.top;
        const multiplier = direction === "up" ? -1 : 1;
        setOffset(scrolled * speed * multiplier * 0.1);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed, direction]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: `translateY(${offset}px)`,
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}

export function SectionDivider({ 
  variant = "wave",
  fromColor = "black",
  toColor = "white",
  flip = false
}: { 
  variant?: "wave" | "angle" | "curve" | "steps";
  fromColor?: "black" | "white";
  toColor?: "black" | "white";
  flip?: boolean;
}) {
  const bgFrom = fromColor === "black" ? "#000000" : "#ffffff";
  const bgTo = toColor === "black" ? "#000000" : "#ffffff";

  const paths = {
    wave: "M0,64 C320,96 480,32 640,64 C800,96 960,32 1120,64 C1280,96 1440,64 1440,64 L1440,128 L0,128 Z",
    angle: "M0,128 L1440,0 L1440,128 Z",
    curve: "M0,128 Q720,0 1440,128 L1440,128 L0,128 Z",
    steps: "M0,96 L360,96 L360,64 L720,64 L720,32 L1080,32 L1080,0 L1440,0 L1440,128 L0,128 Z"
  };

  return (
    <div 
      className="relative h-24 -mt-px -mb-px overflow-hidden"
      style={{ 
        backgroundColor: bgFrom,
        transform: flip ? "scaleY(-1)" : "none"
      }}
    >
      <svg
        className="absolute bottom-0 left-0 w-full h-full"
        viewBox="0 0 1440 128"
        preserveAspectRatio="none"
      >
        <path d={paths[variant]} fill={bgTo} />
      </svg>
    </div>
  );
}

export function GoldAccentLine({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setWidth(100);
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`relative h-px overflow-hidden ${className}`}>
      <div 
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-[#d0a760] to-transparent"
        style={{
          width: `${width}%`,
          transition: "width 1s ease-out",
        }}
      />
    </div>
  );
}

export function FadeInText({ 
  children, 
  className = "",
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        filter: isVisible ? "blur(0)" : "blur(10px)",
        transition: `opacity 800ms ease-out ${delay}ms, filter 800ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export function CountUp({ 
  end, 
  duration = 2000, 
  prefix = "", 
  suffix = "",
  className = "" 
}: { 
  end: number; 
  duration?: number; 
  prefix?: string; 
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasStarted]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count}{suffix}
    </span>
  );
}

export function ImageReveal({ 
  src, 
  alt, 
  className = "" 
}: { 
  src: string; 
  alt: string; 
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <div
        className="absolute inset-0 bg-[#d0a760] z-10"
        style={{
          transform: isRevealed ? "translateX(100%)" : "translateX(0)",
          transition: "transform 800ms ease-in-out",
        }}
      />
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        style={{
          transform: isRevealed ? "scale(1)" : "scale(1.1)",
          transition: "transform 1200ms ease-out",
        }}
      />
    </div>
  );
}
