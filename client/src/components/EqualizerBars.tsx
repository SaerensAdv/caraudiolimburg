import { cn } from "@/lib/utils";

const BRAND_COLORS = {
  orange: "#F97316",
  blue: "#3730A3", 
  green: "#22C55E",
  yellow: "#FACC15",
  pink: "#EC4899"
};

const BAR_HEIGHTS = {
  tall: "h-16 md:h-20",
  medium: "h-12 md:h-14",
  short: "h-6 md:h-8",
};

interface EqualizerBarsProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  animated?: boolean;
  variant?: "default" | "compact" | "inline";
}

export function EqualizerBars({ 
  className, 
  size = "md", 
  animated = true,
  variant = "default"
}: EqualizerBarsProps) {
  const sizeConfig = {
    xs: { gap: "gap-0.5", width: "w-1", heights: { tall: "h-4", medium: "h-3", short: "h-1.5" } },
    sm: { gap: "gap-1", width: "w-2 md:w-3", heights: { tall: "h-8", medium: "h-6", short: "h-3" } },
    md: { gap: "gap-1.5", width: "w-3 md:w-4", heights: { tall: "h-12 md:h-16", medium: "h-9 md:h-12", short: "h-4 md:h-6" } },
    lg: { gap: "gap-2", width: "w-4 md:w-6", heights: { tall: "h-16 md:h-24", medium: "h-12 md:h-16", short: "h-6 md:h-10" } }
  };

  const config = sizeConfig[size];

  const bars = [
    { color: BRAND_COLORS.orange, height: config.heights.tall, delay: "0s" },
    { color: BRAND_COLORS.blue, height: config.heights.medium, delay: "0.1s" },
    { color: BRAND_COLORS.green, height: config.heights.short, delay: "0.2s" },
    { color: BRAND_COLORS.yellow, height: config.heights.medium, delay: "0.15s" },
    { color: BRAND_COLORS.pink, height: config.heights.tall, delay: "0.05s" },
  ];

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

export { BRAND_COLORS };
