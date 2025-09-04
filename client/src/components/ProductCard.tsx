import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Heart, Star } from "lucide-react";
import type { Product } from "@shared/schema";
import carAudioLogo from "@assets/Caraudiolimburg-logo_1757008375383_1757016657436.png";
import fordFiestaImage from "@assets/ford-fiesta-real.webp";
import audisonImage from "@assets/audison-real.webp";
import audiA3Image from "@assets/audi-a3.png";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
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

  // Determine the image source - use imported assets for all images
  const getImageSrc = (imagePath: string) => {
    if (imagePath.startsWith('@assets/Caraudiolimburg-logo_1757008375383_1757016657436.png')) {
      return carAudioLogo;
    }
    // Map specific product images to local assets
    if (imagePath.includes('Android-Ford-Fiesta.png')) {
      return fordFiestaImage;
    }
    if (imagePath.includes('Audison-AV-3.0-II.png')) {
      return audisonImage;
    }
    if (imagePath.includes('Android-Audi-A3.png')) {
      return audiA3Image;
    }
    // Fallback to original path
    return imagePath;
  };

  return (
    <Card className="bg-card border-border hover:shadow-2xl transition-all duration-300 group" data-testid={`product-card-${product.id}`}>
      <div className="relative overflow-hidden rounded-t-2xl">
        {product.images?.[0] ? (
          <div className="aspect-square bg-white flex items-center justify-center p-8">
            <img 
              src={getImageSrc(product.images[0])} 
              alt={product.name}
              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="aspect-square bg-muted rounded-t-2xl flex items-center justify-center">
            <span className="text-muted-foreground">Geen afbeelding</span>
          </div>
        )}
        
        {discount && (
          <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground" data-testid={`discount-badge-${product.id}`}>
            -{discount}%
          </Badge>
        )}
        
        {product.stock && product.stock <= 5 && product.stock > 0 && (
          <Badge className="absolute top-2 right-2 bg-orange-500 text-white" data-testid={`stock-warning-${product.id}`}>
            Laatste {product.stock}
          </Badge>
        )}
      </div>

      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-2">
          <Badge variant="secondary" className="text-xs font-medium" data-testid={`brand-badge-${product.id}`}>
            {/* Brand name would come from relation */}
            Premium
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="p-1"
            onClick={() => setIsWishlisted(!isWishlisted)}
            data-testid={`button-wishlist-${product.id}`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-red-500' : 'text-muted-foreground'}`} />
          </Button>
        </div>

        <Link href={`/product/${product.slug}`}>
          <h3 className="text-lg font-semibold text-card-foreground mb-2 hover:text-primary transition-colors cursor-pointer" data-testid={`product-title-${product.id}`}>
            {product.name}
          </h3>
        </Link>

        {product.shortDescription && (
          <p className="text-sm text-muted-foreground mb-3" data-testid={`product-description-${product.id}`}>
            {product.shortDescription}
          </p>
        )}

        <div className="flex items-center space-x-2 mb-3" data-testid={`product-rating-${product.id}`}>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">(24)</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xl font-bold text-foreground" data-testid={`product-price-${product.id}`}>
              €{currentPrice.toFixed(0)}
            </span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through ml-2" data-testid={`product-original-price-${product.id}`}>
                €{originalPrice.toFixed(0)}
              </span>
            )}
          </div>
          
          <Badge 
            variant={product.stock && product.stock > 0 ? "default" : "secondary"}
            className={product.stock && product.stock > 0 ? "bg-green-600 text-white" : ""}
            data-testid={`stock-status-${product.id}`}
          >
            {product.stock && product.stock > 0 ? "Op voorraad" : "Uitverkocht"}
          </Badge>
        </div>

        <div className="space-y-2">
          <Button
            className="w-full"
            onClick={() => handleAddToCart(false)}
            disabled={!product.stock || product.stock <= 0 || addToCartMutation.isPending}
            data-testid={`button-add-to-cart-${product.id}`}
          >
            {addToCartMutation.isPending ? "Toevoegen..." : "In Winkelwagen"}
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => handleAddToCart(true)}
            disabled={!product.stock || product.stock <= 0 || addToCartMutation.isPending}
            data-testid={`button-add-with-installation-${product.id}`}
          >
            + Installatie
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
