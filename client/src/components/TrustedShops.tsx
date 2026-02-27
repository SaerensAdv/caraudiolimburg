import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Star, User, Shield, ArrowSquareOut } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import trustedShopsLogo from "@assets/trusted-shops-icon-logo-png_seeklogo-620346_1770318250295.png";

interface ETrustedReview {
  id: string;
  submittedAt: string;
  rating: number;
  title?: string;
  comment?: string;
  customerName?: string;
  reply?: {
    comment: string;
    createdAt: string;
  };
}

interface ETrustedReviewsResponse {
  reviews: ETrustedReview[];
  enabled: boolean;
}

interface ETrustedAggregateResponse {
  rating: number | null;
  count: number;
  enabled: boolean;
}

interface ETrustedConfigResponse {
  channelId: string;
  enabled: boolean;
}

export function TrustedShopsReviews({ limit = 6 }: { limit?: number }) {
  const { data, isLoading } = useQuery<ETrustedReviewsResponse>({
    queryKey: ["/api/etrusted/service-reviews", { limit }],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-zinc-100 border-zinc-200 rounded-none animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-zinc-200 rounded w-24 mb-4" />
              <div className="h-20 bg-zinc-200 rounded mb-4" />
              <div className="h-4 bg-zinc-200 rounded w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data?.enabled || !data?.reviews?.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {data.reviews.slice(0, limit).map((review) => (
        <Card 
          key={review.id} 
          className="bg-zinc-100 border-zinc-200 rounded-none hover:-translate-y-1 transition-transform duration-300"
          data-testid={`etrusted-review-${review.id}`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < review.rating ? 'text-[#d0a760] fill-current' : 'text-zinc-300'}`} 
                  />
                ))}
              </div>
              <Shield className="w-4 h-4 text-emerald-600" aria-label="Geverifieerde aankoop" />
            </div>
            
            {review.title && (
              <h4 className="font-medium text-zinc-900 mb-2">{review.title}</h4>
            )}
            
            <p className="text-zinc-700 mb-6 leading-relaxed line-clamp-4">
              "{review.comment || 'Geen commentaar'}"
            </p>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#d0a760]/20 flex items-center justify-center">
                <User className="w-5 h-5 text-[#d0a760]" />
              </div>
              <div>
                <p className="text-zinc-900 font-medium text-sm">
                  {review.customerName || 'Anoniem'}
                </p>
                <p className="text-zinc-500 text-xs">
                  {new Date(review.submittedAt).toLocaleDateString('nl-NL', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TrustedShopsAggregateRating({ variant = 'compact' }: { variant?: 'compact' | 'full' }) {
  const { data, isLoading } = useQuery<ETrustedAggregateResponse>({
    queryKey: ["/api/etrusted/aggregate"],
  });

  if (isLoading || !data?.enabled || !data?.rating) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2" data-testid="etrusted-aggregate-compact">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-4 h-4 ${i < Math.round(data.rating!) ? 'text-[#d0a760] fill-current' : 'text-zinc-300'}`} 
            />
          ))}
        </div>
        <span className="text-sm text-zinc-600">
          {data.rating.toFixed(1)} ({data.count} reviews)
        </span>
      </div>
    );
  }

  return (
    <Card className="bg-white border-zinc-200 rounded-none" data-testid="etrusted-aggregate-full">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-zinc-900">{data.rating.toFixed(1)}</div>
            <div className="flex items-center justify-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-5 h-5 ${i < Math.round(data.rating!) ? 'text-[#d0a760] fill-current' : 'text-zinc-300'}`} 
                />
              ))}
            </div>
          </div>
          <div className="border-l border-zinc-200 pl-4">
            <p className="text-sm text-zinc-600">Gebaseerd op</p>
            <p className="text-lg font-semibold text-zinc-900">{data.count} reviews</p>
            <div className="flex items-center gap-1 mt-1 text-emerald-600 text-xs">
              <Shield className="w-3 h-3" />
              <span>Geverifieerd door Trusted Shops</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function Trustbadge() {
  const { data } = useQuery<ETrustedConfigResponse>({
    queryKey: ["/api/etrusted/config"],
  });

  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    const checkIntro = () => {
      const seen = localStorage.getItem("cal_intro_seen");
      setIntroComplete(!!seen);
    };
    
    checkIntro();
    const interval = setInterval(checkIntro, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!data?.enabled || !data?.channelId || !introComplete) return;

    const existingScript = document.getElementById('trustedshops-badge-script');
    if (existingScript) return;

    const script = document.createElement('script');
    script.id = 'trustedshops-badge-script';
    script.async = true;
    script.src = `https://widgets.trustedshops.com/js/${data.channelId}.js`;
    document.body.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('trustedshops-badge-script');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [data?.channelId, data?.enabled, introComplete]);

  if (!data?.enabled || !introComplete) return null;

  return (
    <div 
      id="trustedShopsCheckout" 
      data-testid="trustbadge-widget"
      style={{ display: 'none' }}
    />
  );
}

export function TrustedShopsBadgeLink({ className = '' }: { className?: string }) {
  const { data: aggregate } = useQuery<ETrustedAggregateResponse>({
    queryKey: ["/api/etrusted/aggregate"],
  });

  const profileUrl = `https://www.trstd.com/nl-nl/reviews/caraudiolimburg-nl`;
  
  const rating = aggregate?.rating || 4.79;
  const count = aggregate?.count || 282;

  return (
    <a 
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 p-2 md:p-4 md:gap-3 bg-zinc-50 border border-zinc-200 rounded-none hover:bg-zinc-100 transition-colors ${className}`}
      data-testid="trusted-shops-badge-link"
    >
      <div className="w-9 h-9 md:w-12 md:h-12 flex items-center justify-center p-1 md:p-1.5 bg-[#d0a760] flex-shrink-0">
        <img 
          src={trustedShopsLogo}
          alt="Trusted Shops" 
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 md:gap-2">
          <span className="font-semibold text-[#d0a760] text-xs md:text-base">Trusted</span>
          <span className="text-xs md:text-sm text-zinc-600">
            {rating.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center text-xs md:text-sm text-zinc-500">
          <span className="truncate">250+ reviews</span>
          <ArrowSquareOut className="w-3 h-3 ml-1 flex-shrink-0" />
        </div>
      </div>
    </a>
  );
}
