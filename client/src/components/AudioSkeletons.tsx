import { cn } from "@/lib/utils";

export function AudioEqualizerSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-end justify-center gap-1 h-12", className)}>
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="bg-gradient-to-t from-[#d0a760]/30 to-[#d0a760]/60 rounded-sm animate-pulse"
          style={{
            width: '4px',
            height: `${20 + Math.sin(i) * 15}px`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: `${0.8 + Math.random() * 0.4}s`,
          }}
        />
      ))}
    </div>
  );
}

export function AudioWaveformSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-0.5 h-8", className)}>
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="bg-gradient-to-b from-[#d0a760]/40 to-[#d0a760]/80 rounded-full animate-pulse"
          style={{
            width: '2px',
            height: `${8 + Math.sin(i * 0.5) * 12}px`,
            animationDelay: `${i * 0.05}s`,
            animationDuration: '1.2s',
          }}
        />
      ))}
    </div>
  );
}

export function VolumeSliderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-2 bg-zinc-800 rounded-full overflow-hidden", className)}>
      <div 
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#d0a760]/50 to-[#d0a760] animate-pulse"
        style={{
          width: '60%',
          animationDuration: '1.5s',
        }}
      />
      <div 
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#d0a760] rounded-full border-2 border-black animate-bounce"
        style={{
          left: '56%',
          animationDelay: '0.3s',
        }}
      />
    </div>
  );
}

export function ProductAudioSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-zinc-900 border border-zinc-800 overflow-hidden", className)} data-testid="product-audio-skeleton">
      {/* Image skeleton with shimmer effect */}
      <div className="aspect-square bg-zinc-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skeleton-shimmer" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-2 border-[#d0a760]/20 flex items-center justify-center">
            <div className="w-6 h-6 bg-[#d0a760]/20 rounded-sm animate-pulse" />
          </div>
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="p-5">
        <div className="h-[15px] bg-zinc-800 rounded-sm mb-2 w-full skeleton-shimmer-subtle" />
        <div className="h-[15px] bg-zinc-800 rounded-sm mb-4 w-2/3 skeleton-shimmer-subtle" style={{ animationDelay: '0.1s' }} />
        
        <div className="h-[13px] bg-zinc-800/60 rounded-sm mb-4 w-4/5 skeleton-shimmer-subtle" style={{ animationDelay: '0.2s' }} />
        
        <div className="flex items-center justify-between mb-4">
          <div className="h-7 w-24 bg-[#d0a760]/15 rounded-sm skeleton-shimmer-subtle" style={{ animationDelay: '0.3s' }} />
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1 h-9 bg-[#d0a760]/20 rounded-none skeleton-shimmer-subtle" style={{ animationDelay: '0.4s' }} />
          <div className="w-9 h-9 bg-zinc-800 rounded-none skeleton-shimmer-subtle" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>
    </div>
  );
}

export function CategoryAudioSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-zinc-900 border border-zinc-800 p-6 animate-pulse", className)}>
      <div className="w-14 h-14 bg-zinc-800 mb-4 mx-auto" />
      <div className="h-4 bg-zinc-800 animate-pulse" />
    </div>
  );
}

export function BrandAudioSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-zinc-900 border border-zinc-800 p-6 text-center animate-pulse", className)}>
      <div className="w-16 h-16 bg-zinc-800 mx-auto mb-3" />
      <div className="h-4 bg-zinc-800 animate-pulse" />
    </div>
  );
}

export function AudioLoadingSpinner({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-12 h-12", 
    lg: "w-20 h-20"
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <div className="absolute inset-0 border-4 border-[#d0a760]/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-[#d0a760] rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex gap-0.5">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-0.5 bg-[#d0a760] animate-pulse"
                style={{
                  height: `${20 + i * 10}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.8s',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableRowAudioSkeleton({ columns = 6 }: { columns?: number }) {
  return (
    <tr className="border-b border-zinc-800 animate-pulse">
      {[...Array(columns)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="flex items-center gap-2">
            {i === 0 && (
              <div className="w-2 h-2 bg-[#d0a760]/40 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
            )}
            <div 
              className={`h-4 bg-zinc-800 rounded animate-pulse ${
                i === 0 ? 'w-20' : i === columns - 1 ? 'w-16' : 'w-full'
              }`}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          </div>
        </td>
      ))}
    </tr>
  );
}

export function FullPageAudioLoading() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <AudioLoadingSpinner size="lg" className="mb-8" />
      
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white mb-2">Car Audio Limburg</h2>
        <p className="text-white/60 mb-6">Loading premium audio experience...</p>
        
        <AudioWaveformSkeleton className="mb-4" />
        
        <div className="w-64 h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#d0a760] to-[#d0a760]/60 animate-pulse" style={{ width: '70%' }} />
        </div>
      </div>
    </div>
  );
}
