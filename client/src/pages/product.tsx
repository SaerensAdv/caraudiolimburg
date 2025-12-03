import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { ImageLightbox } from "@/components/ImageLightbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ScrollAnimations";
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
  ZoomIn,
  ArrowLeft,
  Package,
  Clock,
  Award,
  Headphones
} from "lucide-react";
import type { Product } from "@shared/schema";

export default function ProductPage() {
  const { slug } = useParams();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", slug],
    enabled: !!slug,
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ needsInstallation }: { needsInstallation: boolean }) => {
      if (!product) return;
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
        description: `${product?.name} is toegevoegd aan je winkelwagen.`,
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
      <div className="min-h-screen bg-black">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="aspect-square bg-zinc-900 animate-pulse" />
              <div className="space-y-4">
                <div className="h-8 bg-zinc-900 animate-pulse w-3/4" />
                <div className="h-4 bg-zinc-900 animate-pulse w-1/2" />
                <div className="h-12 bg-zinc-900 animate-pulse w-1/4" />
                <div className="h-24 bg-zinc-900 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center py-20">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                <Package className="w-12 h-12 text-white/20" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Product niet gevonden</h1>
              <p className="text-white/50 mb-8">
                Het product dat je zoekt bestaat niet of is niet meer beschikbaar.
              </p>
              <Button 
                onClick={() => window.history.back()}
                className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ga terug
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentPrice = parseFloat(product.price);
  const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : null;
  const discount = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : null;
  const images = product.images || [];
  const installationPrice = product.installationPrice ? parseFloat(product.installationPrice) : null;

  return (
    <div className="min-h-screen bg-black">
      <Header onCartOpen={() => setIsCartOpen(true)} />
      
      {/* Breadcrumb */}
      <div className="bg-zinc-950 border-b border-white/5">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm" data-testid="breadcrumb">
            <Link href="/" className="text-white/40 hover:text-[#d0a760] transition-colors">Home</Link>
            <span className="text-white/20">/</span>
            <Link href="/shop" className="text-white/40 hover:text-[#d0a760] transition-colors">Shop</Link>
            <span className="text-white/20">/</span>
            <span className="text-white">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Section - Black */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Product Images */}
            <ScrollReveal animation="fade-right">
              <div className="space-y-4" data-testid="product-images">
                {images.length > 0 ? (
                  <>
                    {/* Main Image */}
                    <div 
                      className="relative aspect-square bg-zinc-900 border border-zinc-800 cursor-zoom-in group overflow-hidden"
                      onClick={() => setIsLightboxOpen(true)}
                      data-testid="main-product-image"
                    >
                      <img 
                        src={images[selectedImageIndex]} 
                        alt={product.name}
                        className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Zoom indicator */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 p-3">
                          <ZoomIn className="w-6 h-6 text-black" />
                        </div>
                      </div>

                      {/* Discount badge */}
                      {discount && (
                        <Badge className="absolute top-4 left-4 bg-[#d0a760] text-black font-medium rounded-none text-sm px-3 py-1">
                          -{discount}%
                        </Badge>
                      )}

                      {/* Image navigation */}
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
                            }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-[#d0a760] text-white hover:text-black transition-all"
                            data-testid="button-previous-image"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImageIndex((prev) => (prev + 1) % images.length);
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-[#d0a760] text-white hover:text-black transition-all"
                            data-testid="button-next-image"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                    
                    {/* Thumbnails */}
                    {images.length > 1 && (
                      <div className="grid grid-cols-4 gap-3">
                        {images.map((image, index) => (
                          <button
                            key={index}
                            className={`aspect-square bg-zinc-900 border-2 transition-all duration-300 overflow-hidden ${
                              index === selectedImageIndex 
                                ? 'border-[#d0a760]' 
                                : 'border-zinc-800 hover:border-white/30'
                            }`}
                            onClick={() => setSelectedImageIndex(index)}
                            data-testid={`thumbnail-${index}`}
                          >
                            <img 
                              src={image} 
                              alt={`${product.name} ${index + 1}`}
                              className="w-full h-full object-contain p-2"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="aspect-square bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center">
                    <Package className="w-16 h-16 text-white/10 mb-4" />
                    <p className="text-white/30 text-sm">Geen afbeelding beschikbaar</p>
                  </div>
                )}
              </div>
            </ScrollReveal>

            {/* Product Details */}
            <ScrollReveal animation="fade-left">
              <div className="space-y-6" data-testid="product-details">
                {/* Header */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-[#d0a760]/10 text-[#d0a760] border-[#d0a760]/20 rounded-none">
                      Premium Audio
                    </Badge>
                    <button
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      className="p-2 hover:bg-white/5 transition-colors"
                      data-testid="button-wishlist"
                    >
                      <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-white/40'}`} />
                    </button>
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-3" data-testid="product-title">
                    {product.name}
                  </h1>
                  
                  {product.shortDescription && (
                    <p className="text-lg text-white/50" data-testid="product-short-description">
                      {product.shortDescription}
                    </p>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-3" data-testid="product-rating">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-[#d0a760] fill-current" />
                    ))}
                  </div>
                  <span className="text-white/40 text-sm">4.8 (24 reviews)</span>
                </div>

                {/* Price */}
                <div className="py-6 border-y border-white/10" data-testid="product-pricing">
                  <div className="flex items-baseline gap-4 mb-3">
                    <span className="text-4xl font-bold text-white">
                      €{currentPrice.toFixed(0)}
                    </span>
                    {originalPrice && (
                      <span className="text-xl text-white/30 line-through">
                        €{originalPrice.toFixed(0)}
                      </span>
                    )}
                  </div>
                  
                  {installationPrice && (
                    <p className="text-[#d0a760] text-sm">
                      + €{installationPrice.toFixed(0)} voor professionele installatie
                    </p>
                  )}

                  <div className="mt-4">
                    {product.stock && product.stock > 0 ? (
                      <span className="inline-flex items-center gap-2 text-green-500 text-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Op voorraad
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-orange-500 text-sm">
                        <Clock className="w-4 h-4" />
                        Op aanvraag leverbaar
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity and Add to Cart */}
                <div className="space-y-4" data-testid="add-to-cart-section">
                  <div className="flex items-center gap-4">
                    <span className="text-white/60 text-sm">Aantal:</span>
                    <div className="flex items-center border border-white/10">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="p-3 text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors"
                        data-testid="button-decrease-quantity"
                      >
                        -
                      </button>
                      <span className="w-12 text-center text-white font-medium" data-testid="quantity-display">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        disabled={!product.stock || quantity >= product.stock}
                        className="p-3 text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors"
                        data-testid="button-increase-quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      size="lg"
                      className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none h-14 text-base font-medium"
                      onClick={() => addToCartMutation.mutate({ needsInstallation: false })}
                      disabled={!product.stock || product.stock <= 0 || addToCartMutation.isPending}
                      data-testid="button-add-to-cart"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {addToCartMutation.isPending ? "Toevoegen..." : "In Winkelwagen"}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-[#d0a760] text-[#d0a760] hover:bg-[#d0a760]/10 rounded-none h-14 text-base font-medium"
                      onClick={() => addToCartMutation.mutate({ needsInstallation: true })}
                      disabled={!product.stock || product.stock <= 0 || addToCartMutation.isPending}
                      data-testid="button-add-with-installation"
                    >
                      <Wrench className="w-5 h-5 mr-2" />
                      + Installatie
                    </Button>
                  </div>
                </div>

                {/* Trust Indicators */}
                <StaggerContainer className="grid grid-cols-1 gap-3 pt-6" data-testid="product-benefits">
                  <StaggerItem>
                    <div className="flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800">
                      <div className="p-2 bg-[#d0a760]/10">
                        <Truck className="w-5 h-5 text-[#d0a760]" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">Gratis Verzending</p>
                        <p className="text-white/40 text-xs">Bij bestellingen vanaf €50</p>
                      </div>
                    </div>
                  </StaggerItem>
                  
                  <StaggerItem>
                    <div className="flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800">
                      <div className="p-2 bg-[#d0a760]/10">
                        <Shield className="w-5 h-5 text-[#d0a760]" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">2 Jaar Garantie</p>
                        <p className="text-white/40 text-xs">Volledige fabrieksgarantie</p>
                      </div>
                    </div>
                  </StaggerItem>
                  
                  <StaggerItem>
                    <div className="flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800">
                      <div className="p-2 bg-[#d0a760]/10">
                        <Award className="w-5 h-5 text-[#d0a760]" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">Professionele Installatie</p>
                        <p className="text-white/40 text-xs">Door gecertificeerde monteurs</p>
                      </div>
                    </div>
                  </StaggerItem>
                </StaggerContainer>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Product Information - White Section */}
      <section className="bg-white py-16 md:py-24" data-testid="product-information">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-up">
            <div className="max-w-4xl mx-auto">
              {/* Description */}
              {product.description && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-black mb-6">Beschrijving</h2>
                  <div className="text-black/70 leading-relaxed text-lg">
                    <p>{String(product.description)}</p>
                  </div>
                </div>
              )}

              {/* Features */}
              {product.features && Array.isArray(product.features) && product.features.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-black mb-6">Kenmerken</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(product.features as string[]).map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-zinc-50 border border-zinc-200">
                        <Check className="w-5 h-5 text-[#d0a760] flex-shrink-0 mt-0.5" />
                        <span className="text-black/80">{String(feature)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specifications */}
              {product.specifications && (
                <div>
                  <h2 className="text-2xl font-bold text-black mb-6">Specificaties</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications as Record<string, string | number | boolean>).map(([key, value]) => (
                      <div key={key} className="p-4 bg-zinc-50 border border-zinc-200">
                        <p className="text-xs text-black/40 uppercase tracking-wider mb-1">{key}</p>
                        <p className="text-lg font-medium text-black">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section - Black */}
      <section className="bg-black py-16 border-t border-white/5">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-up">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center p-3 bg-[#d0a760]/10 mb-6">
                <Headphones className="w-8 h-8 text-[#d0a760]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Vragen over dit product?
              </h2>
              <p className="text-white/50 mb-8">
                Onze experts staan klaar om al je vragen te beantwoorden en je te helpen met de beste keuze.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  asChild
                  className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none px-8 py-6"
                >
                  <a href="/contact">Stel een Vraag</a>
                </Button>
                <Button 
                  asChild
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 rounded-none px-8 py-6"
                >
                  <a href="/booking">Plan Installatie</a>
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <ImageLightbox 
        images={images}
        isOpen={isLightboxOpen}
        initialIndex={selectedImageIndex}
        onClose={() => setIsLightboxOpen(false)}
      />
    </div>
  );
}
