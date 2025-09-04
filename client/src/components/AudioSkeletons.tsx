import { cn } from "@/lib/utils";

// Audio Equalizer Bars Animation
export function AudioEqualizerSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-end justify-center gap-1 h-12", className)}>
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="bg-gradient-to-t from-primary/30 to-primary/60 rounded-sm animate-pulse"
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

// Audio Waveform Animation  
export function AudioWaveformSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-0.5 h-8", className)}>
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="bg-gradient-to-b from-primary/40 to-primary/80 rounded-full animate-pulse"
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

// Volume Slider Animation
export function VolumeSliderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-2 bg-muted rounded-full overflow-hidden", className)}>
      <div 
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/50 to-primary animate-pulse"
        style={{
          width: '60%',
          animationDuration: '1.5s',
        }}
      />
      <div 
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-background animate-bounce"
        style={{
          left: '56%',
          animationDelay: '0.3s',
        }}
      />
    </div>
  );
}

// Product Card Audio Skeleton
export function ProductAudioSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card rounded-2xl p-6 border border-border animate-pulse", className)} data-testid="product-audio-skeleton">
      {/* Product Image Skeleton with Speaker Pattern */}
      <div className="aspect-square bg-gradient-to-br from-muted to-muted/70 rounded-xl mb-4 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary/20 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-primary/30 rounded-full animate-ping" />
          </div>
        </div>
        <div className="absolute top-2 left-2 w-4 h-4 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
        <div className="absolute top-2 right-2 w-4 h-4 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        <div className="absolute bottom-2 left-2 w-4 h-4 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
        <div className="absolute bottom-2 right-2 w-4 h-4 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: '0.8s' }} />
      </div>
      
      {/* Title Skeleton */}
      <div className="h-5 bg-gradient-to-r from-muted to-muted/50 rounded-md mb-2 animate-pulse" />
      
      {/* Brand Badge Skeleton */}
      <div className="h-6 w-20 bg-primary/20 rounded-full mb-3 animate-pulse" />
      
      {/* Audio Features Skeleton */}
      <div className="mb-4">
        <AudioWaveformSkeleton />
      </div>
      
      {/* Price Skeleton */}
      <div className="h-6 w-24 bg-gradient-to-r from-primary/30 to-primary/60 rounded-md mb-4 animate-pulse" />
      
      {/* Volume Control Skeleton */}
      <VolumeSliderSkeleton className="mb-4" />
      
      {/* Button Skeleton */}
      <div className="h-10 bg-gradient-to-r from-primary/40 to-primary/70 rounded-lg animate-pulse" />
    </div>
  );
}

// Category Audio Skeleton
export function CategoryAudioSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card border border-border rounded-xl p-4 animate-pulse", className)}>
      {/* Icon Skeleton with Speaker */}
      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/40 rounded-xl mb-3 mx-auto relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <AudioEqualizerSkeleton className="h-6" />
        </div>
      </div>
      
      {/* Category Name */}
      <div className="h-4 bg-muted rounded-md mb-2 animate-pulse" />
      <div className="h-3 w-16 bg-muted/60 rounded-md mx-auto animate-pulse" />
    </div>
  );
}

// Brand Audio Skeleton  
export function BrandAudioSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card border border-border rounded-xl p-6 text-center group cursor-pointer animate-pulse", className)}>
      {/* Brand Logo Skeleton */}
      <div className="w-16 h-16 bg-gradient-to-br from-muted to-muted/70 rounded-xl mx-auto mb-3 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary/30 rounded-full animate-spin" style={{ animationDuration: '2s' }} />
        </div>
      </div>
      
      {/* Brand Name */}
      <div className="h-4 bg-muted rounded-md animate-pulse" />
    </div>
  );
}

// Audio Loading Spinner
export function AudioLoadingSpinner({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-12 h-12", 
    lg: "w-20 h-20"
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
        
        {/* Spinning audio wave */}
        <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
        
        {/* Center equalizer */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex gap-0.5">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-0.5 bg-primary animate-pulse"
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

// Table Row Audio Skeleton
export function TableRowAudioSkeleton({ columns = 6 }: { columns?: number }) {
  return (
    <tr className="border-b border-border animate-pulse">
      {[...Array(columns)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="flex items-center gap-2">
            {i === 0 && (
              <div className="w-2 h-2 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
            )}
            <div 
              className={`h-4 bg-gradient-to-r from-muted to-muted/70 rounded animate-pulse ${
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

// Full Page Audio Loading
export function FullPageAudioLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <AudioLoadingSpinner size="lg" className="mb-8" />
      
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">Car Audio Limburg</h2>
        <p className="text-muted-foreground mb-6">Loading premium audio experience...</p>
        
        {/* Audio Waveform Loading */}
        <AudioWaveformSkeleton className="mb-4" />
        
        {/* Loading Progress */}
        <div className="w-64 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-accent animate-pulse" style={{ width: '70%' }} />
        </div>
      </div>
    </div>
  );
}