import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ShoppingCart, Wrench, Eye } from "lucide-react";
import { ProductQuickView } from "@/components/ProductQuickView";
import type { Product } from "@shared/schema";
import carAudioLogo from "@assets/Caraudiolimburg-logo_1757008375383_1757016657436.png";
import fordFiestaImage from "@assets/ford-fiesta-real.webp";
import audisonImage from "@assets/audison-real.webp";
import audiA3Image from "@assets/audi-a3.png";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, needsInstallation }: { productId: string; needsInstallation: boolean }) => {
      await apiRequest("POST", "/api/cart", {
        productId,
        quantity: 1,
        needsInstallation,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
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
    addToCartMutation.mutate({ productId: product.id, needsInstallation });
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
      <Card className="bg-zinc-900 border-zinc-800 hover:border-[#d0a760]/50 transition-all duration-300 ease-out group overflow-hidden rounded-none hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50" data-testid={`product-card-${product.id}`}>
        <Link href={`/product/${product.slug}`}>
          <div className="relative overflow-hidden">
            <div className="aspect-square bg-zinc-800 flex items-center justify-center p-8">
              <img 
                src={product.images?.[product.primaryImageIndex || 0] ? getImageSrc(product.images[product.primaryImageIndex || 0]) : carAudioLogo} 
                alt={product.name}
                className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500 group-hover:animate-speaker-vibrate"
                onError={(e) => {
                  e.currentTarget.src = carAudioLogo;
                }}
              />
            </div>
            
            {/* Quick View Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsQuickViewOpen(true);
              }}
              className="absolute top-3 right-3 p-2.5 bg-black/70 hover:bg-[#d0a760] text-white hover:text-black transition-all duration-300 ease-out opacity-0 group-hover:opacity-100 backdrop-blur-sm hover:scale-110 active:scale-95"
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

        <CardContent className="p-5">
          <Link href={`/product/${product.slug}`}>
            <h3 className="text-white font-medium mb-2 group-hover:text-[#d0a760] transition-all duration-300 cursor-pointer line-clamp-2" data-testid={`product-title-${product.id}`}>
              {product.name}
            </h3>
          </Link>

          {product.shortDescription && (
            <p className="text-white/50 text-sm mb-4 line-clamp-2" data-testid={`product-description-${product.id}`}>
              {product.shortDescription}
            </p>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold text-white" data-testid={`product-price-${product.id}`}>
                €{currentPrice.toFixed(0)}
              </span>
              {originalPrice && (
                <span className="text-sm text-white/40 line-through">
                  €{originalPrice.toFixed(0)}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => handleAddToCart(false)}
              disabled={addToCartMutation.isPending}
              size="sm"
              className="flex-1 bg-white text-black hover:bg-[#d0a760] rounded-none text-xs"
              data-testid={`add-to-cart-${product.id}`}
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              Toevoegen
            </Button>
            
            {product.installationPrice && (
              <Button 
                onClick={() => handleAddToCart(true)}
                disabled={addToCartMutation.isPending}
                size="sm"
                variant="outline"
                className="border-[#d0a760] text-[#d0a760] hover:bg-[#d0a760] hover:text-black rounded-none"
                title="Inclusief installatie"
                data-testid={`add-with-install-${product.id}`}
              >
                <Wrench className="w-3 h-3" />
              </Button>
            )}
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
