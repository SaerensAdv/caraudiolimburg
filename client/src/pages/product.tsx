import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Heart, 
  Star, 
  ShoppingCart, 
  Wrench, 
  Truck, 
  Shield,
  ChevronLeft,
  ChevronRight,
  Check,
  X
} from "lucide-react";
import type { Product } from "@shared/schema";

export default function ProductPage() {
  const { slug } = useParams();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: ["/api/products", slug],
    enabled: !!slug,
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ needsInstallation }: { needsInstallation: boolean }) => {
      await apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity,
        needsInstallation,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Product toegevoegd",
        description: `${product.name} is toegevoegd aan je winkelwagen.`,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <div className="container px-4 mx-auto py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="aspect-square bg-muted rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-12 bg-muted rounded w-1/4"></div>
                <div className="h-24 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <div className="container px-4 mx-auto py-8">
          <Card className="bg-card border-border p-12 text-center">
            <h1 className="text-2xl font-bold text-card-foreground mb-4">Product niet gevonden</h1>
            <p className="text-muted-foreground mb-6">Het product dat je zoekt bestaat niet of is niet meer beschikbaar.</p>
            <Button onClick={() => window.history.back()}>
              Ga terug
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const currentPrice = parseFloat(product.price);
  const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : null;
  const discount = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : null;
  const images = product.images || [];

  return (
    <div className="min-h-screen bg-background">
      <Header onCartOpen={() => setIsCartOpen(true)} />
      
      <div className="container px-4 mx-auto py-8">
        {/* Breadcrumb */}
        <nav className="mb-8" data-testid="breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
            <li><a href="/" className="hover:text-primary">Home</a></li>
            <li>/</li>
            <li><a href="/shop" className="hover:text-primary">Shop</a></li>
            <li>/</li>
            <li className="text-foreground">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4" data-testid="product-images">
            {images.length > 0 ? (
              <>
                <div 
                  className="aspect-square bg-cover bg-center rounded-2xl border border-border relative"
                  style={{ backgroundImage: `url(${images[selectedImageIndex]})` }}
                  data-testid="main-product-image"
                >
                  {discount && (
                    <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
                      -{discount}%
                    </Badge>
                  )}
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute left-4 top-1/2 transform -translate-y-1/2"
                        onClick={() => setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                        data-testid="button-previous-image"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2"
                        onClick={() => setSelectedImageIndex((prev) => (prev + 1) % images.length)}
                        data-testid="button-next-image"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
                
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        className={`aspect-square bg-cover bg-center rounded-lg border-2 transition-colors ${
                          index === selectedImageIndex ? 'border-primary' : 'border-border'
                        }`}
                        style={{ backgroundImage: `url(${image})` }}
                        onClick={() => setSelectedImageIndex(index)}
                        data-testid={`thumbnail-${index}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-square bg-muted rounded-2xl flex items-center justify-center">
                <span className="text-muted-foreground">Geen afbeelding beschikbaar</span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6" data-testid="product-details">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="text-sm">
                  Premium Merk
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  data-testid="button-wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current text-red-500' : 'text-muted-foreground'}`} />
                </Button>
              </div>
              
              <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="product-title">
                {product.name}
              </h1>
              
              {product.shortDescription && (
                <p className="text-lg text-muted-foreground" data-testid="product-short-description">
                  {product.shortDescription}
                </p>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2" data-testid="product-rating">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(4.8) • 24 reviews</span>
            </div>

            {/* Price */}
            <div className="space-y-2" data-testid="product-pricing">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-foreground">
                  €{currentPrice.toFixed(0)}
                </span>
                {originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    €{originalPrice.toFixed(0)}
                  </span>
                )}
              </div>
              
              <Badge 
                variant={product.stock && product.stock > 0 ? "default" : "secondary"}
                className={product.stock && product.stock > 0 ? "bg-green-600 text-white" : ""}
              >
                {product.stock && product.stock > 0 ? "Op voorraad" : "Uitverkocht"}
              </Badge>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4" data-testid="add-to-cart-section">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-foreground">Aantal:</label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    data-testid="button-decrease-quantity"
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-medium" data-testid="quantity-display">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={!product.stock || quantity >= product.stock}
                    data-testid="button-increase-quantity"
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => addToCartMutation.mutate({ needsInstallation: false })}
                  disabled={!product.stock || product.stock <= 0 || addToCartMutation.isPending}
                  data-testid="button-add-to-cart"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {addToCartMutation.isPending ? "Toevoegen..." : "In Winkelwagen"}
                </Button>
                
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  onClick={() => addToCartMutation.mutate({ needsInstallation: true })}
                  disabled={!product.stock || product.stock <= 0 || addToCartMutation.isPending}
                  data-testid="button-add-with-installation"
                >
                  <Wrench className="w-5 h-5 mr-2" />
                  Toevoegen + Installatie
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3" data-testid="product-benefits">
              <div className="flex items-center space-x-3">
                <Truck className="w-5 h-5 text-primary" />
                <span className="text-sm text-foreground">Gratis verzending vanaf €50</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm text-foreground">2 jaar garantie</span>
              </div>
              <div className="flex items-center space-x-3">
                <Wrench className="w-5 h-5 text-primary" />
                <span className="text-sm text-foreground">Professionele installatie beschikbaar</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Information Tabs */}
        <div className="mt-16" data-testid="product-information">
          <Card className="bg-card border-border">
            <CardContent className="p-8">
              <div className="space-y-8">
                {/* Description */}
                {product.description && (
                  <div>
                    <h3 className="text-xl font-semibold text-card-foreground mb-4">Beschrijving</h3>
                    <div className="text-muted-foreground prose prose-invert max-w-none">
                      <p>{product.description}</p>
                    </div>
                  </div>
                )}

                {/* Features */}
                {product.features && product.features.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-xl font-semibold text-card-foreground mb-4">Kenmerken</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {product.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Check className="w-4 h-4 text-primary" />
                            <span className="text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Specifications */}
                {product.specifications && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-xl font-semibold text-card-foreground mb-4">Specificaties</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(product.specifications as Record<string, any>).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-2 border-b border-border">
                            <span className="font-medium text-card-foreground">{key}</span>
                            <span className="text-muted-foreground">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
