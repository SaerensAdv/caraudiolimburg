import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { X, ShoppingCart, Wrench, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useGuestCart } from "@/lib/guestCart";
import type { Product, SiteSettings } from "@shared/schema";

interface ProductQuickViewProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductQuickView({ product, isOpen, onClose }: ProductQuickViewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isAuthenticated } = useAuth();
  const { addItem: addToGuestCart } = useGuestCart();
  
  const { data: siteSettings } = useQuery<SiteSettings>({
    queryKey: ["/api/site-settings"],
  });
  const installationEnabled = siteSettings?.installationServiceEnabled ?? true;

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, needsInstallation, authenticated }: { productId: string; needsInstallation: boolean; authenticated: boolean }) => {
      if (authenticated) {
        await apiRequest("POST", "/api/cart", {
          productId,
          quantity: 1,
          needsInstallation,
        });
      } else {
        addToGuestCart({
          productId,
          quantity: 1,
          needsInstallation,
          variationId: null,
        });
      }
    },
    onSuccess: (_, variables) => {
      if (variables.authenticated) {
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      }
      toast({
        title: "Product toegevoegd",
        description: "Het product is toegevoegd aan je winkelwagen.",
      });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Inloggen vereist",
          description: "Je moet inloggen om producten toe te voegen.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Fout",
        description: "Kon product niet toevoegen aan winkelwagen.",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = (needsInstallation: boolean = false) => {
    addToCartMutation.mutate({ productId: product.id, needsInstallation, authenticated: isAuthenticated });
  };

  if (!isOpen) return null;

  const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : null;
  const currentPrice = parseFloat(product.price);
  const discount = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : null;
  const images = product.images || [];
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl md:max-h-[85vh] z-[71] bg-zinc-900 border border-zinc-800 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-medium text-white">Quick View</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white/60 hover:text-white hover:bg-white/10 rounded-none p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="relative bg-zinc-800 aspect-square">
              {images.length > 0 ? (
                <img 
                  src={images[currentImageIndex]} 
                  alt={product.name}
                  className="w-full h-full object-contain p-8"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20">
                  No image
                </div>
              )}

              {/* Image navigation */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  
                  {/* Image dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 transition-colors ${
                          idx === currentImageIndex ? 'bg-[#d0a760]' : 'bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Discount badge */}
              {discount && (
                <Badge className="absolute top-4 left-4 bg-[#d0a760] text-black font-medium rounded-none">
                  -{discount}%
                </Badge>
              )}
            </div>

            {/* Details Section */}
            <div className="p-6 flex flex-col">
              <div className="flex-1">
                <h3 className="text-2xl font-medium text-white mb-2">
                  {product.name}
                </h3>

                {product.shortDescription && (
                  <p className="text-white/60 mb-4">
                    {product.shortDescription}
                  </p>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl font-semibold text-white">
                    €{currentPrice.toFixed(0)}
                  </span>
                  {originalPrice && (
                    <span className="text-lg text-white/40 line-through">
                      €{originalPrice.toFixed(0)}
                    </span>
                  )}
                </div>

                {/* Features preview */}
                {product.features && product.features.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm text-white/40 uppercase tracking-wider mb-3">Kenmerken</h4>
                    <ul className="space-y-2">
                      {product.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="text-white/70 text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-[#d0a760]" />
                          {feature}
                        </li>
                      ))}
                      {product.features.length > 4 && (
                        <li className="text-[#d0a760] text-sm">
                          +{product.features.length - 4} meer...
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Stock status */}
                <div className="mb-6">
                  {product.stock && product.stock > 0 ? (
                    <span className="text-green-500 text-sm">
                      ✓ Op voorraad
                    </span>
                  ) : (
                    <span className="text-orange-500 text-sm">
                      Op aanvraag leverbaar
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-4 border-t border-zinc-800">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleAddToCart(false)}
                    disabled={addToCartMutation.isPending}
                    className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    In Winkelmand
                  </Button>

                  {installationEnabled && product.installationPrice && (
                    <Button
                      onClick={() => handleAddToCart(true)}
                      disabled={addToCartMutation.isPending}
                      variant="outline"
                      className="border-[#d0a760] text-[#d0a760] hover:bg-[#d0a760]/10 rounded-none"
                    >
                      <Wrench className="w-4 h-4 mr-2" />
                      + Installatie
                    </Button>
                  )}
                </div>

                <Link href={`/webshop/${product.slug}`} onClick={onClose}>
                  <Button
                    variant="ghost"
                    className="w-full text-white/60 hover:text-white hover:bg-white/5 rounded-none"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Bekijk alle details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Trigger button component for use in product cards
interface QuickViewButtonProps {
  onClick: () => void;
  className?: string;
}

export function QuickViewButton({ onClick, className = "" }: QuickViewButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`absolute top-3 right-3 p-2 bg-black/60 hover:bg-[#d0a760] text-white hover:text-black transition-all duration-200 opacity-0 group-hover:opacity-100 ${className}`}
      title="Quick View"
    >
      <Eye className="w-4 h-4" />
    </button>
  );
}
