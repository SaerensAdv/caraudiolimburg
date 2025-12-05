import { cn } from "@/lib/utils";

const BRAND_COLORS = {
  orange: "#F97316",
  blue: "#3730A3", 
  green: "#22C55E",
  yellow: "#FACC15",
  pink: "#EC4899"
};

const LAYER_COUNT = 20;

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function getLayerColor(baseColor: string, layerIndex: number, totalLayers: number): string {
  const hsl = hexToHsl(baseColor);
  const depth = layerIndex / totalLayers;
  const newL = Math.max(10, hsl.l - (depth * 40));
  const newS = Math.min(100, hsl.s + (depth * 20));
  return `hsl(${hsl.h}, ${newS}%, ${newL}%)`;
}

function get3DAnimationStyle(animated: boolean, barIndex: number, delay: string): Record<string, string | undefined> {
  if (!animated) return {};
  const duration = 0.8 + barIndex * 0.1;
  return {
    animationName: "equalizer3d",
    animationDuration: `${duration}s`,
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
    animationDirection: "alternate",
    animationDelay: delay,
  };
}

interface EqualizerBarsProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  animated?: boolean;
  variant?: "default" | "compact" | "inline" | "3d";
}

export function EqualizerBars({ 
  className, 
  size = "md", 
  animated = true,
  variant = "default"
}: EqualizerBarsProps) {
  const sizeConfig = {
    xs: { gap: "gap-0.5", width: "w-1", heights: { tall: "h-4", medium: "h-3", short: "h-1.5" }, layerOffset: 0.5 },
    sm: { gap: "gap-1", width: "w-2 md:w-3", heights: { tall: "h-8", medium: "h-6", short: "h-3" }, layerOffset: 0.8 },
    md: { gap: "gap-1.5", width: "w-3 md:w-4", heights: { tall: "h-12 md:h-16", medium: "h-9 md:h-12", short: "h-4 md:h-6" }, layerOffset: 1.2 },
    lg: { gap: "gap-2", width: "w-4 md:w-6", heights: { tall: "h-16 md:h-24", medium: "h-12 md:h-16", short: "h-6 md:h-10" }, layerOffset: 1.5 }
  };

  const config = sizeConfig[size];

  const bars = [
    { color: BRAND_COLORS.orange, height: config.heights.tall, delay: "0s", heightPx: size === "lg" ? 96 : size === "md" ? 64 : size === "sm" ? 32 : 16 },
    { color: BRAND_COLORS.blue, height: config.heights.medium, delay: "0.1s", heightPx: size === "lg" ? 64 : size === "md" ? 48 : size === "sm" ? 24 : 12 },
    { color: BRAND_COLORS.green, height: config.heights.short, delay: "0.2s", heightPx: size === "lg" ? 40 : size === "md" ? 24 : size === "sm" ? 12 : 6 },
    { color: BRAND_COLORS.yellow, height: config.heights.medium, delay: "0.15s", heightPx: size === "lg" ? 64 : size === "md" ? 48 : size === "sm" ? 24 : 12 },
    { color: BRAND_COLORS.pink, height: config.heights.tall, delay: "0.05s", heightPx: size === "lg" ? 96 : size === "md" ? 64 : size === "sm" ? 32 : 16 },
  ];

  if (variant === "3d") {
    return (
      <div 
        className={cn("flex items-end justify-center", config.gap, className)}
        style={{ 
          perspective: "800px",
          perspectiveOrigin: "50% 50%"
        }}
        data-testid="equalizer-bars-3d"
      >
        {bars.map((bar, barIndex) => (
          <div
            key={barIndex}
            className="relative"
            style={{
              transformStyle: "preserve-3d",
              transform: animated ? undefined : "rotateX(-15deg) rotateY(-25deg)",
              ...get3DAnimationStyle(animated, barIndex, bar.delay),
            }}
          >
            {/* Front face - brightest */}
            <div
              className={cn(config.width, bar.height, "rounded-sm")}
              style={{
                backgroundColor: bar.color,
                boxShadow: `0 0 20px ${bar.color}40, inset 0 0 10px rgba(255,255,255,0.2)`,
                transform: "translateZ(0px)",
              }}
            />
            
            {/* Stacked layers for depth */}
            {Array.from({ length: LAYER_COUNT }, (_, i) => (
              <div
                key={i}
                className={cn(config.width, bar.height, "rounded-sm absolute inset-0")}
                style={{
                  backgroundColor: getLayerColor(bar.color, i + 1, LAYER_COUNT),
                  transform: `translateZ(${-(i + 1) * config.layerOffset}px)`,
                }}
                aria-hidden="true"
              />
            ))}
            
            {/* Back face - darkest */}
            <div
              className={cn(config.width, bar.height, "rounded-sm absolute inset-0")}
              style={{
                backgroundColor: getLayerColor(bar.color, LAYER_COUNT, LAYER_COUNT),
                transform: `translateZ(${-(LAYER_COUNT + 1) * config.layerOffset}px)`,
                boxShadow: `0 4px 20px rgba(0,0,0,0.5)`,
              }}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn("flex items-end", config.gap, className)}>
        {bars.map((bar, index) => (
          <div
            key={index}
            className={cn(
              config.width,
              "rounded-sm transition-all duration-300",
              animated && "animate-equalizer"
            )}
            style={{ 
              backgroundColor: bar.color,
              height: size === "xs" ? "8px" : size === "sm" ? "12px" : size === "md" ? "16px" : "24px",
              animationDelay: animated ? bar.delay : undefined,
              animationDuration: animated ? `${0.8 + index * 0.1}s` : undefined
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "flex items-end justify-center",
        config.gap,
        className
      )}
      data-testid="equalizer-bars"
    >
      {bars.map((bar, index) => (
        <div
          key={index}
          className={cn(
            config.width,
            bar.height,
            "rounded-sm transition-all duration-500",
            animated && "animate-equalizer"
          )}
          style={{ 
            backgroundColor: bar.color,
            animationDelay: animated ? bar.delay : undefined,
            animationDuration: animated ? `${0.8 + index * 0.1}s` : undefined
          }}
        />
      ))}
    </div>
  );
}

interface EqualizerDividerProps {
  className?: string;
  animated?: boolean;
}

export function EqualizerDivider({ className, animated = true }: EqualizerDividerProps) {
  return (
    <div className={cn("w-full flex items-center justify-center py-8 md:py-12", className)}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent" />
      <div className="px-6">
        <EqualizerBars size="sm" animated={animated} />
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent" />
    </div>
  );
}

interface EqualizerAccentProps {
  className?: string;
  color?: keyof typeof BRAND_COLORS;
}

export function EqualizerAccent({ className, color = "orange" }: EqualizerAccentProps) {
  return (
    <div 
      className={cn("w-1 h-full rounded-full", className)}
      style={{ backgroundColor: BRAND_COLORS[color] }}
    />
  );
}

export function EqualizerLineAccent({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Object.values(BRAND_COLORS).map((color, index) => (
        <div
          key={index}
          className="h-1 flex-1 rounded-full"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

