import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ShoppingCart, Wrench, Eye, Heart } from "lucide-react";
import { ProductQuickView } from "@/components/ProductQuickView";
import { useAuth } from "@/hooks/useAuth";
import { useGuestCart } from "@/lib/guestCart";
import type { Product } from "@shared/schema";
import carAudioLogo from "@assets/Caraudiolimburg-logo_1757008375383_1757016657436.png";
import fordFiestaImage from "@assets/ford-fiesta-real.webp";
import audisonImage from "@assets/audison-real.webp";
import audiA3Image from "@assets/audi-a3.png";

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

export function ProductCard({ product, featured = false }: ProductCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { isAuthenticated } = useAuth();
  const { addItem: addToGuestCart } = useGuestCart();
  
  // Check if product has a valid image
  const hasValidImage = product.images && product.images.length > 0 && product.images[product.primaryImageIndex || 0] && !imageError;

  const { data: wishlistStatus } = useQuery<{ inWishlist: boolean }>({
    queryKey: ["/api/wishlist/check", product.id],
    enabled: isAuthenticated,
    retry: false,
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/wishlist", { productId: product.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist/check", product.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Toegevoegd aan favorieten",
        description: "Het product is toegevoegd aan je favorieten.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Inloggen vereist",
          description: "Je moet inloggen om favorieten toe te voegen.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Fout",
        description: "Kon product niet toevoegen aan favorieten.",
        variant: "destructive",
      });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/wishlist/${product.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist/check", product.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Verwijderd uit favorieten",
        description: "Het product is verwijderd uit je favorieten.",
      });
    },
    onError: () => {
      toast({
        title: "Fout",
        description: "Kon product niet verwijderen uit favorieten.",
        variant: "destructive",
      });
    },
  });

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlistStatus?.inWishlist) {
      removeFromWishlistMutation.mutate();
    } else {
      addToWishlistMutation.mutate();
    }
  };

  const isWishlistLoading = addToWishlistMutation.isPending || removeFromWishlistMutation.isPending;

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

  const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : null;
  const currentPrice = parseFloat(product.price);
  const discount = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : null;

  const getImageSrc = (imagePath: string) => {
    if (imagePath.startsWith('@assets/Caraudiolimburg-logo_1757008375383_1757016657436.png')) {
      return carAudioLogo;
    }
    if (imagePath.includes('Android-Ford-Fiesta.png')) {
      return fordFiestaImage;
    }
    if (imagePath.includes('Audison-AV-3.0-II.png')) {
      return audisonImage;
    }
    if (imagePath.includes('Android-Audi-A3.png')) {
      return audiA3Image;
    }
    return imagePath;
  };

  return (
    <>
      <Card className={`bg-zinc-900 border-zinc-800 hover:border-[#d0a760]/70 transition-all duration-300 ease-out group overflow-hidden rounded-none hover:-translate-y-3 hover:shadow-[0_20px_50px_-12px_rgba(208,167,96,0.25)] h-full flex flex-col relative before:absolute before:inset-0 before:opacity-0 hover:before:opacity-100 before:bg-gradient-to-t before:from-[#d0a760]/5 before:to-transparent before:transition-opacity before:duration-300 before:pointer-events-none ${featured ? 'animated-gold-border' : ''}`} data-testid={`product-card-${product.id}`}>
        <Link href={`/webshop/${product.slug}`}>
          <div className="relative overflow-hidden">
            <div className={`aspect-square flex items-center justify-center ${hasValidImage ? 'bg-white' : 'bg-zinc-800 p-8'}`}>
              <img 
                src={hasValidImage ? getImageSrc(product.images![product.primaryImageIndex || 0]) : carAudioLogo} 
                alt={product.name}
                className={`group-hover:scale-105 transition-transform duration-500 ${hasValidImage ? 'w-full h-full object-cover' : 'max-w-full max-h-full object-contain'}`}
                onError={() => setImageError(true)}
              />
            </div>
            
            {/* Wishlist Button */}
            {isAuthenticated && (
              <button
                onClick={handleWishlistToggle}
                disabled={isWishlistLoading}
                className={`absolute top-3 right-3 p-2.5 transition-all duration-300 ease-out backdrop-blur-sm hover:scale-110 active:scale-95 ${
                  wishlistStatus?.inWishlist 
                    ? "bg-[#d0a760] text-black" 
                    : "bg-black/70 hover:bg-[#d0a760] text-white hover:text-black"
                } ${isWishlistLoading ? "opacity-50 cursor-wait" : ""}`}
                title={wishlistStatus?.inWishlist ? "Verwijderen uit favorieten" : "Toevoegen aan favorieten"}
                data-testid={`wishlist-toggle-${product.id}`}
              >
                <Heart 
                  className={`w-4 h-4 transition-transform duration-300 ${isWishlistLoading ? "animate-pulse" : ""}`} 
                  fill={wishlistStatus?.inWishlist ? "currentColor" : "none"}
                />
              </button>
            )}
            
            {/* Quick View Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsQuickViewOpen(true);
              }}
              className={`absolute ${isAuthenticated ? "top-14" : "top-3"} right-3 p-2.5 bg-black/70 hover:bg-[#d0a760] text-white hover:text-black transition-all duration-300 ease-out opacity-0 group-hover:opacity-100 backdrop-blur-sm hover:scale-110 active:scale-95`}
              title="Quick View"
              data-testid={`quick-view-${product.id}`}
            >
              <Eye className="w-4 h-4 transition-transform duration-300" />
            </button>
            
            {discount && (
              <Badge className="absolute top-3 left-3 bg-[#d0a760] text-black font-medium rounded-none" data-testid={`discount-badge-${product.id}`}>
                -{discount}%
              </Badge>
            )}
          </div>
        </Link>

        <CardContent className="p-3 sm:p-5 flex flex-col flex-grow">
          <Link href={`/webshop/${product.slug}`}>
            <h3 className="text-white font-medium mb-1 sm:mb-2 group-hover:text-[#d0a760] transition-all duration-300 cursor-pointer line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] text-[13px] sm:text-[15px] leading-snug" data-testid={`product-title-${product.id}`}>
              {product.name}
            </h3>
          </Link>

          <p className="text-white/50 text-xs sm:text-sm mb-2 sm:mb-4 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] hidden sm:block" data-testid={`product-description-${product.id}`}>
            {product.shortDescription || '\u00A0'}
          </p>

          <div className="mt-auto">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="flex items-baseline gap-1 sm:gap-2">
                <span className="text-lg sm:text-2xl font-bold text-[#d0a760] tracking-tight" data-testid={`product-price-${product.id}`}>
                  €{currentPrice.toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
                {originalPrice && (
                  <span className="text-xs sm:text-sm text-white/40 line-through">
                    €{originalPrice.toFixed(0)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-1 sm:gap-2">
              <Button 
                onClick={() => handleAddToCart(false)}
                disabled={addToCartMutation.isPending}
                size="sm"
                className="flex-1 bg-[#d0a760] text-black hover:bg-[#d0a760]/90 hover:shadow-md hover:shadow-[#d0a760]/30 rounded-none text-[10px] sm:text-xs font-medium transition-all duration-300 h-8 sm:h-9 min-h-[44px] sm:min-h-0"
                data-testid={`add-to-cart-${product.id}`}
              >
                <ShoppingCart className="w-3 h-3 mr-0.5 sm:mr-1" />
                <span className="hidden sm:inline">Toevoegen</span>
                <span className="sm:hidden">+</span>
              </Button>
              
              {product.installationPrice && (
                <Button 
                  onClick={() => handleAddToCart(true)}
                  disabled={addToCartMutation.isPending}
                  size="sm"
                  variant="outline"
                  className="border-[#d0a760] text-[#d0a760] hover:bg-[#d0a760] hover:text-black hover:shadow-md hover:shadow-[#d0a760]/30 rounded-none transition-all duration-300"
                  title="Inclusief installatie"
                  data-testid={`add-with-install-${product.id}`}
                >
                  <Wrench className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick View Modal */}
      <ProductQuickView 
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}
