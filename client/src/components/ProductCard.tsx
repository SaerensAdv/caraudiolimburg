import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ShoppingCart, Wrench } from "lucide-react";
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
    <Card className="bg-zinc-900 border-zinc-800 hover:border-[#d0a760]/30 transition-all duration-300 group overflow-hidden" data-testid={`product-card-${product.id}`}>
      <Link href={`/product/${product.slug}`}>
        <div className="relative overflow-hidden">
          <div className="aspect-square bg-zinc-800 flex items-center justify-center p-8">
            <img 
              src={product.images?.[product.primaryImageIndex || 0] ? getImageSrc(product.images[product.primaryImageIndex || 0]) : carAudioLogo} 
              alt={product.name}
              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.currentTarget.src = carAudioLogo;
              }}
            />
          </div>
          
          {discount && (
            <Badge className="absolute top-3 left-3 bg-[#d0a760] text-black font-medium" data-testid={`discount-badge-${product.id}`}>
              -{discount}%
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-5">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-white font-medium mb-2 group-hover:text-[#d0a760] transition-colors cursor-pointer line-clamp-2" data-testid={`product-title-${product.id}`}>
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
              <span className="text-sm text-white/40 line-through" data-testid={`product-original-price-${product.id}`}>
                €{originalPrice.toFixed(0)}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1 bg-[#d0a760] text-black hover:bg-[#d0a760]/90"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              handleAddToCart(false);
            }}
            disabled={!product.stock || product.stock <= 0 || addToCartMutation.isPending}
            data-testid={`button-add-to-cart-${product.id}`}
          >
            <ShoppingCart className="w-4 h-4 mr-1.5" />
            {addToCartMutation.isPending ? "..." : "Toevoegen"}
          </Button>
          {product.canHaveInstallation && (
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-700 text-white/70 hover:text-white hover:bg-zinc-800 hover:border-zinc-600"
              onClick={(e) => {
                e.preventDefault();
                handleAddToCart(true);
              }}
              disabled={!product.stock || product.stock <= 0 || addToCartMutation.isPending}
              data-testid={`button-add-with-installation-${product.id}`}
            >
              <Wrench className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
