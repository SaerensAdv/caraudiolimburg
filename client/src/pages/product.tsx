import { useState, useRef, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { ImageLightbox } from "@/components/ImageLightbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { useGuestCart } from "@/lib/guestCart";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ScrollAnimations";
import { SEO } from "@/components/SEO";
import { ProductSchema, BreadcrumbSchema } from "@/components/StructuredData";
import { 
  Heart, 
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
  Share2,
  X,
  Plus,
  Minus,
  CreditCard,
  FileText,
  Download,
  Play,
  Box
} from "lucide-react";
import { SiApplepay, SiGooglepay, SiRevolut, SiKlarna } from "react-icons/si";
import type { Product } from "@shared/schema";

type ProductVariation = {
  id: string;
  label: string;
  price: string;
  originalPrice?: string | null;
  stock: number | null;
  sortOrder: number | null;
  isDefault: boolean | null;
};

type ProductWithVariations = Product & {
  variations?: ProductVariation[];
};

export default function ProductPage() {
  const { slug } = useParams();
  const [, navigate] = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { addItem: addToGuestCart } = useGuestCart();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = (images: string[]) => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      setSelectedImageIndex((prev) => (prev + 1) % images.length);
    }
    if (isRightSwipe) {
      setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link gekopieerd",
        description: "Productlink is naar je klembord gekopieerd.",
      });
    }
  };

  const { data: product, isLoading } = useQuery<ProductWithVariations>({
    queryKey: ["/api/products", slug],
    enabled: !!slug,
  });

  // Fetch related products based on category
  const { data: relatedProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products", { categoryId: product?.categoryId, limit: 4 }],
    enabled: !!product?.categoryId,
  });

  // Filter out current product from related products
  const filteredRelatedProducts = relatedProducts
    .filter(p => p.id !== product?.id)
    .slice(0, 4);

  // Initialize default variation when product loads
  useEffect(() => {
    if (product?.hasVariations && product.variations && product.variations.length > 0) {
      const defaultVariation = product.variations.find(v => v.isDefault) || product.variations[0];
      setSelectedVariation(defaultVariation);
    } else {
      setSelectedVariation(null);
    }
  }, [product?.id, product?.hasVariations, product?.variations]);


  const addToCartMutation = useMutation({
    mutationFn: async ({ needsInstallation, authenticated }: { needsInstallation: boolean; authenticated: boolean }) => {
      if (!product) return;
      if (product.hasVariations && !selectedVariation) {
        throw new Error("Selecteer eerst een variatie");
      }
      
      if (authenticated) {
        await apiRequest("POST", "/api/cart", {
          productId: product.id,
          quantity,
          needsInstallation,
          variationId: selectedVariation?.id || null,
        });
      } else {
        addToGuestCart({
          productId: product.id,
          quantity,
          needsInstallation,
          variationId: selectedVariation?.id || null,
        });
      }
    },
    onSuccess: (_, variables) => {
      if (variables.authenticated) {
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      }
      toast({
        title: "Product toegevoegd",
        description: `${product?.name} is toegevoegd aan je winkelwagen.`,
      });
      setIsCartOpen(true);
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
              <div className="w-24 h-24 mx-auto bg-zinc-900 flex items-center justify-center mb-6">
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

  // Use variation price if product has variations and a variation is selected
  const currentPrice = product.hasVariations && selectedVariation 
    ? parseFloat(selectedVariation.price) 
    : parseFloat(product.price);
  const originalPrice = product.hasVariations && selectedVariation 
    ? (selectedVariation.originalPrice ? parseFloat(selectedVariation.originalPrice) : null)
    : (product.originalPrice ? parseFloat(product.originalPrice) : null);
  const discount = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : null;
  const images = product.images || [];
  const installationPrice = product.installationPrice ? parseFloat(product.installationPrice) : null;
  
  // Determine stock based on variation or product
  const effectiveStock = product.hasVariations && selectedVariation 
    ? selectedVariation.stock 
    : product.stock;
  const isInStock = effectiveStock !== null && effectiveStock > 0;
  const canAddToCart = product.hasVariations ? (selectedVariation && isInStock) : isInStock;

  const productDescription = product.shortDescription || product.description?.toString().substring(0, 160) || `Koop ${product.name} bij Car Audio Limburg. Professionele installatie beschikbaar.`;
  
  return (
    <div className="min-h-screen bg-black">
      <SEO 
        title={product.name}
        description={productDescription}
        canonical={`/webshop/${product.slug}`}
        ogImage={images[0] || undefined}
        ogType="product"
      />
      <ProductSchema
        name={product.name}
        description={productDescription}
        image={images.length > 0 ? images : ['https://caraudiolimburg.com/og-image.jpg']}
        price={currentPrice}
        availability={isInStock ? 'InStock' : 'OutOfStock'}
        sku={product.sku || product.id}
        url={`/webshop/${product.slug}`}
      />
      <BreadcrumbSchema items={[
        { name: "Home", url: "/" },
        { name: "Producten", url: "/webshop" },
        { name: product.name, url: `/webshop/${product.slug}` }
      ]} />
      
      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header onCartOpen={() => setIsCartOpen(true)} />
      </div>
      {/* Mobile App Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-lg border-b border-white/10 safe-area-top">
        <div className="flex items-center justify-between px-4 h-14">
          <button 
            onClick={() => navigate("/shop")}
            className="p-2 -ml-2 hover:bg-white/10 transition-colors active:scale-95"
            data-testid="mobile-back-button"
            aria-label="Terug naar shop"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={handleShare}
              className="p-2 hover:bg-white/10 transition-colors active:scale-95"
              data-testid="mobile-share-button"
              aria-label="Deel dit product"
            >
              <Share2 className="w-5 h-5 text-white" />
            </button>
            <button 
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="p-2 hover:bg-white/10 transition-colors active:scale-95"
              data-testid="mobile-wishlist-button"
              aria-label={isWishlisted ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
              aria-pressed={isWishlisted}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="p-2 -mr-2 hover:bg-white/10 transition-colors active:scale-95"
              data-testid="mobile-cart-button"
              aria-label="Open winkelwagen"
            >
              <ShoppingCart className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
      {/* Desktop Breadcrumb */}
      <div className="hidden md:block bg-zinc-950 border-b border-white/5">
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
      <section className="pt-16 md:pt-0 py-6 md:py-20 pb-36 md:pb-20">
        <div className="container mx-auto px-4 mt-[32px] mb-[32px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 lg:gap-16">
            {/* Product Images - Mobile Swipeable Gallery */}
            <ScrollReveal animation="fade-right">
              <div className="space-y-4" data-testid="product-images">
                {images.length > 0 ? (
                  <>
                    {/* Main Image - Swipeable on Mobile */}
                    <div 
                      ref={imageContainerRef}
                      className="relative aspect-square bg-zinc-900 md:border md:border-zinc-800 md:cursor-zoom-in group overflow-hidden touch-pan-y"
                      onClick={() => setIsLightboxOpen(true)}
                      onTouchStart={images.length > 1 ? onTouchStart : undefined}
                      onTouchMove={images.length > 1 ? onTouchMove : undefined}
                      onTouchEnd={() => images.length > 1 && onTouchEnd(images)}
                      data-testid="main-product-image"
                    >
                      <img 
                        src={images[selectedImageIndex]} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none"
                        draggable={false}
                      />
                      
                      {/* Zoom indicator - Desktop only */}
                      <div className="hidden md:flex absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 items-center justify-center">
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

                      {/* Image navigation - Desktop only */}
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
                            }}
                            className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-[#d0a760] text-white hover:text-black transition-all"
                            data-testid="button-previous-image"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImageIndex((prev) => (prev + 1) % images.length);
                            }}
                            className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-[#d0a760] text-white hover:text-black transition-all"
                            data-testid="button-next-image"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      
                      {/* Mobile Image Dots Indicator */}
                      {images.length > 1 && isMobile && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                          {images.map((_, index) => (
                            <button
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImageIndex(index);
                              }}
                              className={`w-2 h-2 transition-all duration-300 ${
                                index === selectedImageIndex 
                                  ? 'bg-[#d0a760] w-6' 
                                  : 'bg-white/30'
                              }`}
                              data-testid={`mobile-dot-${index}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Thumbnails - Desktop only */}
                    {images.length > 1 && (
                      <div className="hidden md:grid grid-cols-4 gap-3 px-4 md:px-0">
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
                              className="w-full h-full object-cover"
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
              <div className="space-y-4 md:space-y-6 px-4 md:px-0" data-testid="product-details">
                {/* Header */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-[#d0a760]/10 text-[#d0a760] border-[#d0a760]/20 rounded-none">
                      Premium Audio
                    </Badge>
                    {/* Desktop wishlist button */}
                    <button
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      className="hidden md:block p-2 hover:bg-white/5 transition-colors"
                      data-testid="button-wishlist"
                    >
                      <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-white/40'}`} />
                    </button>
                  </div>
                  
                  <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-3" data-testid="product-title">
                    {product.name}
                  </h1>
                  
                  {product.shortDescription && (
                    <p className="text-base md:text-lg text-white/50" data-testid="product-short-description">
                      {product.shortDescription}
                    </p>
                  )}
                </div>


                {/* Variation Selector */}
                {product.hasVariations && product.variations && product.variations.length > 0 && (
                  <div className="py-4 border-b border-white/10" data-testid="variation-selector">
                    <p className="text-white/60 text-sm mb-3">Kies een optie:</p>
                    <div className="flex flex-wrap gap-2 gap-y-3">
                      {product.variations
                        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                        .map((variation) => {
                          const variationStock = variation.stock;
                          const isOutOfStock = variationStock === null || variationStock <= 0;
                          const isSelected = selectedVariation?.id === variation.id;
                          
                          return (
                            <button
                              key={variation.id}
                              onClick={() => setSelectedVariation(variation)}
                              disabled={isOutOfStock}
                              className={`
                                min-h-[44px] px-4 py-2 border-2 transition-all duration-200
                                ${isSelected 
                                  ? 'border-[#d0a760] bg-[#d0a760]/10 text-white' 
                                  : 'border-zinc-700 bg-zinc-800 text-white/80 hover:border-zinc-500'
                                }
                                ${isOutOfStock 
                                  ? 'opacity-40 cursor-not-allowed line-through' 
                                  : 'cursor-pointer'
                                }
                              `}
                              data-testid={`variation-${variation.id}`}
                            >
                              <span className="font-medium">{variation.label}</span>
                              <span className="block text-xs text-white/50 mt-0.5">
                                €{parseFloat(variation.price).toFixed(0)}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                    {product.hasVariations && !selectedVariation && (
                      <p className="text-orange-400 text-xs mt-2">Selecteer een optie om door te gaan</p>
                    )}
                  </div>
                )}

                {/* Price - Mobile compact, Desktop full */}
                <div className="py-4 md:py-6 border-y border-white/10" data-testid="product-pricing">
                  <div className="flex items-baseline gap-3 md:gap-4 mb-2 md:mb-3">
                    <span className="text-3xl md:text-4xl font-bold text-white">
                      €{currentPrice.toFixed(0)}
                    </span>
                    {originalPrice && (
                      <span className="text-lg md:text-xl text-white/30 line-through">
                        €{originalPrice.toFixed(0)}
                      </span>
                    )}
                  </div>
                  
                  {installationPrice && (
                    <p className="text-[#d0a760] text-sm">
                      + €{installationPrice.toFixed(0)} voor professionele installatie
                    </p>
                  )}

                  <div className="mt-3 md:mt-4 space-y-3">
                    {isInStock ? (
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-2 text-green-500 text-sm font-medium">
                          <span className="w-2 h-2 bg-green-500 animate-pulse" />
                          Op voorraad
                          {effectiveStock !== null && effectiveStock <= 5 && effectiveStock > 0 && (
                            <span className="text-orange-400 text-xs font-normal ml-1">
                              - Nog {effectiveStock} beschikbaar!
                            </span>
                          )}
                        </span>
                        <span className="text-white/50 text-xs flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          Bestel voor 16:00, morgen in huis
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-orange-500 text-sm">
                        <Clock className="w-4 h-4" />
                        {product.hasVariations && !selectedVariation 
                          ? "Selecteer een optie" 
                          : "Niet op voorraad"}
                      </span>
                    )}
                    
                    {/* Payment Methods */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <span className="text-white/40 text-xs">Betaalmethodes:</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <div className="bg-zinc-800 p-1.5 rounded" title="Kaarten (Visa, Mastercard)">
                          <CreditCard className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-black p-1 rounded" title="Apple Pay">
                          <SiApplepay className="w-6 h-5 text-white" />
                        </div>
                        <div className="bg-white p-1 rounded" title="Google Pay">
                          <SiGooglepay className="w-6 h-5" />
                        </div>
                        <div className="bg-black p-1.5 rounded" title="Revolut Pay">
                          <SiRevolut className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-[#005498] px-1.5 py-1 rounded" title="Bancontact">
                          <span className="text-[10px] font-bold text-white">BC</span>
                        </div>
                        <div className="bg-[#CC0066] px-1.5 py-1 rounded" title="iDEAL">
                          <span className="text-[10px] font-bold text-white">iDEAL</span>
                        </div>
                        <div className="bg-[#FFB3C7] p-1 rounded" title="Klarna">
                          <SiKlarna className="w-5 h-4 text-[#0A0B09]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quantity and Add to Cart - Desktop only */}
                <div className="hidden md:block space-y-4" data-testid="add-to-cart-section">
                  <div className="flex items-center gap-4">
                    <span className="text-white/60 text-sm">Aantal:</span>
                    <div className="flex items-center border border-white/10">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="w-11 h-11 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors text-lg"
                        data-testid="button-decrease-quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center text-white font-medium" data-testid="quantity-display">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        disabled={effectiveStock === null || quantity >= effectiveStock}
                        className="w-11 h-11 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors text-lg"
                        data-testid="button-increase-quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      size="lg"
                      className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none h-14 text-base font-medium"
                      onClick={() => addToCartMutation.mutate({ needsInstallation: false, authenticated: isAuthenticated })}
                      disabled={!canAddToCart || addToCartMutation.isPending}
                      data-testid="button-add-to-cart"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {addToCartMutation.isPending ? "Toevoegen..." : "In Winkelwagen"}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-[#d0a760] text-[#d0a760] hover:bg-[#d0a760]/10 rounded-none h-14 text-base font-medium flex flex-col items-center justify-center py-2"
                      onClick={() => addToCartMutation.mutate({ needsInstallation: true, authenticated: isAuthenticated })}
                      disabled={!canAddToCart || addToCartMutation.isPending}
                      data-testid="button-add-with-installation"
                    >
                      <span className="flex items-center">
                        <Wrench className="w-4 h-4 mr-1.5" />
                        + Professionele Installatie
                      </span>
                      {installationPrice && (
                        <span className="text-xs text-[#d0a760]/70 font-normal">
                          Totaal: €{(currentPrice + installationPrice).toFixed(0)}
                        </span>
                      )}
                    </Button>
                  </div>
                  
                  {/* Installation Bundle Highlight */}
                  {installationPrice && (
                    <div className="bg-[#d0a760]/5 border border-[#d0a760]/20 p-4 mt-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-[#d0a760]/10">
                          <Shield className="w-5 h-5 text-[#d0a760]" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm mb-1">Bundel met Installatie</p>
                          <p className="text-white/60 text-xs">
                            Laat dit product professioneel inbouwen voor slechts €{installationPrice.toFixed(0)} extra. 
                            Inclusief 2 jaar installatiegarantie.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Trust Indicators - Mobile: Horizontal scroll, Desktop: Grid */}
                <div className="pt-4 md:pt-6" data-testid="product-benefits">
                  {/* Mobile: Compact horizontal badges */}
                  <div className="flex md:hidden gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                    <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 whitespace-nowrap flex-shrink-0">
                      <Truck className="w-4 h-4 text-[#d0a760]" />
                      <span className="text-white text-xs font-medium">Gratis Verzending</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 whitespace-nowrap flex-shrink-0">
                      <Shield className="w-4 h-4 text-[#d0a760]" />
                      <span className="text-white text-xs font-medium">2 Jaar Garantie</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 whitespace-nowrap flex-shrink-0">
                      <Award className="w-4 h-4 text-[#d0a760]" />
                      <span className="text-white text-xs font-medium">Prof. Installatie</span>
                    </div>
                  </div>
                  
                  {/* Desktop: Full grid with stagger */}
                  <StaggerContainer className="hidden md:grid grid-cols-1 gap-3">
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
                
                {/* Product Description - Visible directly under product info */}
                {(product.description || product.overviewContent) && (
                  <div className="pt-6 border-t border-white/10 mt-6" data-testid="product-description-preview">
                    <div className="text-white/70 leading-relaxed">
                      {product.overviewContent ? (
                        <p className="whitespace-pre-wrap">{product.overviewContent}</p>
                      ) : (
                        <p>{String(product.description)}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
      {/* Product Information Tabs - Dark Section */}
      <section className="bg-zinc-950 py-12 md:py-20 border-t border-white/5" data-testid="product-information">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-up">
            <div className="max-w-5xl mx-auto">
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="w-full justify-start bg-zinc-900 border border-zinc-800 rounded-none p-1 h-auto">
                  <TabsTrigger 
                    value="description" 
                    className="rounded-none px-6 py-3 text-sm font-medium text-white/60 data-[state=active]:bg-[#d0a760] data-[state=active]:text-black flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Beschrijving
                  </TabsTrigger>
                  <TabsTrigger 
                    value="specifications" 
                    className="rounded-none px-6 py-3 text-sm font-medium text-white/60 data-[state=active]:bg-[#d0a760] data-[state=active]:text-black flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Specificaties
                  </TabsTrigger>
                  <TabsTrigger 
                    value="box-content" 
                    className="rounded-none px-6 py-3 text-sm font-medium text-white/60 data-[state=active]:bg-[#d0a760] data-[state=active]:text-black flex items-center gap-2"
                  >
                    <Box className="w-4 h-4" />
                    In de doos
                  </TabsTrigger>
                </TabsList>

                {/* Description Tab - Combined Overview + Features + Video */}
                <TabsContent value="description" className="mt-6">
                  <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-8">
                    {product.videoUrl && (
                      <div className="mb-8">
                        <div className="aspect-video bg-black rounded-none overflow-hidden">
                          <iframe
                            src={product.videoUrl.replace('watch?v=', 'embed/')}
                            title={`${product.name} video`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}
                    <div className="prose prose-invert max-w-none mb-8">
                      {product.overviewContent ? (
                        <div className="text-white/70 leading-relaxed text-lg whitespace-pre-wrap">
                          {product.overviewContent}
                        </div>
                      ) : product.description ? (
                        <div className="text-white/70 leading-relaxed text-lg">
                          <p>{String(product.description)}</p>
                        </div>
                      ) : (
                        <p className="text-white/40 italic">Geen beschrijving beschikbaar.</p>
                      )}
                    </div>
                    
                    {/* Features integrated into description */}
                    {product.features && Array.isArray(product.features) && product.features.length > 0 && (
                      <div className="border-t border-zinc-800 pt-8">
                        <h3 className="text-lg font-semibold text-white mb-4">Belangrijkste kenmerken</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {(product.features as string[]).map((feature, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-zinc-800/50">
                              <Check className="w-5 h-5 text-[#d0a760] flex-shrink-0 mt-0.5" />
                              <span className="text-white/80">{String(feature)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Specifications Tab - Combined with Downloads */}
                <TabsContent value="specifications" className="mt-6">
                  <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-8">
                    {product.specifications && Object.keys(product.specifications as Record<string, unknown>).length > 0 ? (
                      <div className="space-y-8">
                        {/* Render specs by category if structured, or flat if simple */}
                        {(() => {
                          const specs = product.specifications as Record<string, unknown>;
                          const hasNestedSpecs = Object.values(specs).some(v => typeof v === 'object' && v !== null && !Array.isArray(v));
                          
                          if (hasNestedSpecs) {
                            return Object.entries(specs)
                              .filter(([key]) => !['manualUrl', 'techSheetUrl'].includes(key))
                              .map(([category, values]) => {
                                if (typeof values === 'object' && values !== null && !Array.isArray(values)) {
                                  const categoryLabels: Record<string, string> = {
                                    lf: 'Woofer Specificaties',
                                    hf: 'Tweeter Specificaties',
                                    electroAcoustic: 'Elektro-akoestische Specs',
                                    general: 'Algemeen'
                                  };
                                  return (
                                    <div key={category}>
                                      <h3 className="text-lg font-semibold text-[#d0a760] mb-4">{categoryLabels[category] || category}</h3>
                                      <table className="w-full">
                                        <tbody>
                                          {Object.entries(values as Record<string, string | number>).map(([key, value], index) => (
                                            <tr key={key} className={index % 2 === 0 ? 'bg-zinc-800/50' : ''}>
                                              <td className="px-4 py-3 text-white/50 text-sm font-medium w-1/2">{key}</td>
                                              <td className="px-4 py-3 text-white font-medium">{String(value)}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  );
                                }
                                return null;
                              });
                          } else {
                            return (
                              <table className="w-full">
                                <tbody>
                                  {Object.entries(specs)
                                    .filter(([key]) => !['manualUrl', 'techSheetUrl'].includes(key))
                                    .map(([key, value], index) => (
                                      <tr key={key} className={index % 2 === 0 ? 'bg-zinc-800/50' : ''}>
                                        <td className="px-4 py-3 text-white/50 text-sm font-medium uppercase tracking-wider w-1/3">{key}</td>
                                        <td className="px-4 py-3 text-white font-medium">{String(value)}</td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            );
                          }
                        })()}
                        
                        {/* Downloads section integrated */}
                        {((product.downloads && Array.isArray(product.downloads) && product.downloads.length > 0) || 
                          (product.specifications && (
                            (product.specifications as Record<string, string>).manualUrl || 
                            (product.specifications as Record<string, string>).techSheetUrl
                          ))) && (
                          <div className="border-t border-zinc-800 pt-8">
                            <h3 className="text-lg font-semibold text-white mb-4">Downloads</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {product.downloads && Array.isArray(product.downloads) ? (product.downloads as { name: string; url: string; type?: string }[]).map((download, index) => (
                                <a 
                                  key={index}
                                  href={download.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-4 p-4 bg-zinc-800/50 border border-zinc-700 hover:border-[#d0a760] transition-colors group"
                                >
                                  <FileText className="w-6 h-6 text-[#d0a760]" />
                                  <div className="flex-1">
                                    <p className="font-medium text-white group-hover:text-[#d0a760]">{download.name}</p>
                                  </div>
                                  <Download className="w-5 h-5 text-white/30 group-hover:text-[#d0a760]" />
                                </a>
                              )) : null}
                              {product.specifications && (product.specifications as Record<string, string>).manualUrl && (
                                <a 
                                  href={(product.specifications as Record<string, string>).manualUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-4 p-4 bg-zinc-800/50 border border-zinc-700 hover:border-[#d0a760] transition-colors group"
                                >
                                  <FileText className="w-6 h-6 text-[#d0a760]" />
                                  <div className="flex-1">
                                    <p className="font-medium text-white group-hover:text-[#d0a760]">Handleiding (PDF)</p>
                                  </div>
                                  <Download className="w-5 h-5 text-white/30 group-hover:text-[#d0a760]" />
                                </a>
                              )}
                              {product.specifications && (product.specifications as Record<string, string>).techSheetUrl && (
                                <a 
                                  href={(product.specifications as Record<string, string>).techSheetUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-4 p-4 bg-zinc-800/50 border border-zinc-700 hover:border-[#d0a760] transition-colors group"
                                >
                                  <FileText className="w-6 h-6 text-[#d0a760]" />
                                  <div className="flex-1">
                                    <p className="font-medium text-white group-hover:text-[#d0a760]">Tech Sheet (PDF)</p>
                                  </div>
                                  <Download className="w-5 h-5 text-white/30 group-hover:text-[#d0a760]" />
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-white/40 italic text-center py-8">Geen specificaties beschikbaar.</p>
                    )}
                  </div>
                </TabsContent>

                {/* Box Content Tab */}
                <TabsContent value="box-content" className="mt-6">
                  <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-8">
                    {product.boxContent && Array.isArray(product.boxContent) && product.boxContent.length > 0 ? (
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white mb-4">Wat zit er in de doos?</h3>
                        <ul className="space-y-3">
                          {(product.boxContent as (string | { item: string; quantity?: number })[]).map((item, index) => (
                            <li key={index} className="flex items-start gap-3 p-3 bg-zinc-800/50 border border-zinc-700">
                              <Box className="w-5 h-5 text-[#d0a760] flex-shrink-0 mt-0.5" />
                              <span className="text-white/80">
                                {typeof item === 'string' ? item : `${item.quantity ? `${item.quantity}x ` : ''}${item.item}`}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-white/40 italic text-center py-8">Geen inhoud informatie beschikbaar.</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollReveal>
        </div>
      </section>
      {/* Related Products / Upsell Section */}
      {filteredRelatedProducts.length > 0 && (
        <section className="bg-zinc-950 py-16 md:py-20 border-t border-white/5" data-testid="related-products">
          <div className="container mx-auto px-4">
            <ScrollReveal animation="fade-up">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Gerelateerde Producten
                </h2>
                <p className="text-white/50">Andere klanten bekeken ook</p>
              </div>
            </ScrollReveal>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {filteredRelatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} href={`/webshop/${relatedProduct.slug}`}>
                  <div className="group cursor-pointer" data-testid={`related-product-${relatedProduct.id}`}>
                    <div className="relative aspect-square bg-zinc-900 border border-zinc-800 mb-3 overflow-hidden">
                      {relatedProduct.images && relatedProduct.images[0] ? (
                        <img 
                          src={relatedProduct.images[0]} 
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="w-12 h-12 text-white/10" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-white text-sm font-medium line-clamp-2 group-hover:text-[#d0a760] transition-colors mb-1">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[#d0a760] font-bold">€{parseFloat(relatedProduct.price).toFixed(0)}</span>
                      {relatedProduct.originalPrice && (
                        <span className="text-white/30 text-xs line-through">
                          €{parseFloat(relatedProduct.originalPrice).toFixed(0)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      {/* CTA Section - Black */}
      <section className="bg-black py-16 border-t border-white/5">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-up">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center p-3 bg-[#d0a760]/10 mb-6">
                <Award className="w-8 h-8 text-[#d0a760]" />
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
      {/* Footer - Desktop only */}
      <div className="hidden md:block">
        <Footer />
      </div>
      {/* Mobile Sticky Bottom Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950 border-t border-white/10 safe-area-bottom">
        <div className="p-4">
          {/* Quantity selector row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center border border-white/10 bg-black/50">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-11 h-11 flex items-center justify-center text-white/60 hover:text-white active:bg-white/10 disabled:opacity-30 transition-colors"
                data-testid="mobile-button-decrease-quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center text-white font-medium text-sm" data-testid="mobile-quantity-display">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                disabled={effectiveStock === null || quantity >= effectiveStock}
                className="w-11 h-11 flex items-center justify-center text-white/60 hover:text-white active:bg-white/10 disabled:opacity-30 transition-colors"
                data-testid="mobile-button-increase-quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-right">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">€{currentPrice.toFixed(0)}</span>
                {originalPrice && (
                  <span className="text-sm text-white/30 line-through">€{originalPrice.toFixed(0)}</span>
                )}
              </div>
              {installationPrice && (
                <span className="text-[10px] text-[#d0a760]">
                  of €{(currentPrice + installationPrice).toFixed(0)} met installatie
                </span>
              )}
              {isInStock ? (
                <span className="text-xs text-green-500 block">
                  Op voorraad
                  {effectiveStock !== null && effectiveStock <= 5 && effectiveStock > 0 && (
                    <span className="text-orange-400"> - Nog {effectiveStock}!</span>
                  )}
                </span>
              ) : (
                <span className="text-xs text-orange-500 block">
                  {product.hasVariations && !selectedVariation ? "Kies optie" : "Niet op voorraad"}
                </span>
              )}
            </div>
          </div>
          
          {/* Action buttons row */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 active:scale-[0.98] rounded-none h-12 text-sm font-semibold transition-transform"
              onClick={() => addToCartMutation.mutate({ needsInstallation: false, authenticated: isAuthenticated })}
              disabled={!canAddToCart || addToCartMutation.isPending}
              data-testid="mobile-button-add-to-cart"
            >
              <ShoppingCart className="w-4 h-4 mr-1.5" />
              {addToCartMutation.isPending ? "..." : "In Wagen"}
            </Button>
            
            <Button
              variant="outline"
              className="border-[#d0a760] text-[#d0a760] hover:bg-[#d0a760]/10 active:scale-[0.98] rounded-none h-12 text-sm font-semibold transition-transform flex flex-col items-center justify-center py-1"
              onClick={() => addToCartMutation.mutate({ needsInstallation: true, authenticated: isAuthenticated })}
              disabled={!canAddToCart || addToCartMutation.isPending}
              data-testid="mobile-button-add-with-installation"
            >
              <span className="flex items-center">
                <Wrench className="w-3.5 h-3.5 mr-1" />
                + Installatie
              </span>
              {installationPrice && (
                <span className="text-[10px] text-[#d0a760]/70 font-normal">
                  €{(currentPrice + installationPrice).toFixed(0)} totaal
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
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
