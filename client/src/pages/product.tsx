import { useState, useRef, useEffect, useCallback } from "react";
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
  ShieldCheck,
  CaretLeft,
  CaretRight,
  CaretDown,
  Check,
  MagnifyingGlassPlus,
  ArrowLeft,
  Package,
  Clock,
  Trophy,
  Warning,
  ShareNetwork,
  X,
  Plus,
  Minus,
  CreditCard,
  FileText,
  DownloadSimple,
  Play,
  Cube,
  Sparkle,
  Star
} from "@phosphor-icons/react";
import { SiRevolut, SiKlarna, SiVisa } from "react-icons/si";
import type { Product, SiteSettings, Brand, Category } from "@shared/schema";
import { trackViewItem, trackAddToCart } from "@/lib/dataLayer";
import { addRecentlyViewed } from "@/lib/recentlyViewed";

import bancontactLogo from "@assets/Bancontact-Original-logo-RGB_1770317016482.png";
import googlePayLogo from "@assets/Google_Pay_Logo.svg_1770317053129.png";
import applePayLogo from "@assets/Apple_Pay_logo.svg_1770317065102.png";
import mastercardLogo from "@assets/Mastercard-Emblem_1770317085225.png";
import idealLogo from "@assets/ideal-logo-1024_1770317108053.webp";

type ProductVariation = {
  id: string;
  label: string;
  price: string;
  originalPrice?: string | null;
  images?: string[] | null;
  specifications?: Record<string, string> | null;
  stock: number | null;
  sortOrder: number | null;
  isDefault: boolean | null;
  isActive?: boolean | null;
};

function FormattedDescription({ text, hasFeatures = false }: { text: string; hasFeatures?: boolean }) {
  const blocks = text.split(/\n\n+/);
  
  return (
    <div className="space-y-6">
      {blocks.map((block, blockIndex) => {
        const lines = block.split('\n').filter(l => l.trim());
        const bulletLines = lines.filter(l => /^[•\-\*]\s/.test(l.trim()));
        const nonBulletLines = lines.filter(l => !/^[•\-\*]\s/.test(l.trim()));
        
        if (bulletLines.length > 0) {
          if (hasFeatures) {
            const remainingLines = nonBulletLines.filter(l => !(l.trim().endsWith(':') && l.trim().length < 60));
            if (remainingLines.length === 0) return null;
            return (
              <div key={blockIndex}>
                {remainingLines.map((line, i) => (
                  <p key={i} className="text-white/70 leading-relaxed text-base">{line}</p>
                ))}
              </div>
            );
          }
          const headerLine = nonBulletLines.length > 0 && nonBulletLines[0].trim().endsWith(':') ? nonBulletLines[0].trim() : null;
          return (
            <div key={blockIndex}>
              {headerLine && (
                <h3 className="text-white font-semibold text-base mb-3">{headerLine}</h3>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {bulletLines.map((line, i) => {
                  const cleanLine = line.trim().replace(/^[•\-\*]\s*/, '');
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 bg-zinc-800/50 border border-zinc-700/50">
                      <Check weight="duotone" className="w-4 h-4 text-[#d0a760] flex-shrink-0 mt-0.5" />
                      <span className="text-white/80 text-sm">{cleanLine}</span>
                    </div>
                  );
                })}
              </div>
              {nonBulletLines.filter(l => l !== headerLine?.replace(':', '') + ':' && l.trim() !== headerLine).map((line, i) => (
                <p key={`extra-${i}`} className="text-white/70 leading-relaxed text-base mt-3">{line}</p>
              ))}
            </div>
          );
        }
        
        return (
          <div key={blockIndex}>
            {lines.map((line, i) => {
              if (line.trim().endsWith(':') && line.trim().length < 60) {
                return <h3 key={i} className="text-white font-semibold text-base mb-1">{line.trim()}</h3>;
              }
              return <p key={i} className="text-white/70 leading-relaxed text-base">{line}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

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

  const { data: siteSettings } = useQuery<SiteSettings>({
    queryKey: ["/api/site-settings"],
  });

  const installationEnabled = siteSettings?.installationServiceEnabled ?? true;

  // Fetch upsell products for this product
  const { data: upsellProducts = [] } = useQuery<(Product & { upsellLabel?: string | null })[]>({
    queryKey: [`/api/products/${product?.id}/upsells`],
    enabled: !!product?.id,
  });

  // Fetch related products based on category
  const { data: relatedProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products", { categoryId: product?.categoryId, limit: 4 }],
    enabled: !!product?.categoryId,
  });

  const { data: etrustedAggregate } = useQuery<{ rating: number | null; count: number; enabled: boolean }>({
    queryKey: ["/api/etrusted/aggregate"],
  });

  const { data: brands } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const brandName = brands?.find(b => b.id === product?.brandId)?.name;
  const categoryName = categories?.find(c => c.id === product?.categoryId)?.name;
  const categorySlug = categories?.find(c => c.id === product?.categoryId)?.slug;

  // Filter out current product from related products
  const filteredRelatedProducts = relatedProducts
    .filter(p => p.id !== product?.id)
    .slice(0, 4);

  // Initialize default variation when product loads (only active ones)
  useEffect(() => {
    if (!product) return;
    addRecentlyViewed(product.id);
    const price = selectedVariation ? selectedVariation.price : product.price;
    trackViewItem({
      id: product.id,
      name: product.name,
      price,
      brand: brandName,
      category: categoryName,
      sku: product.sku,
    });
  }, [product?.id, brandName, categoryName]);

  useEffect(() => {
    if (product?.hasVariations && product.variations && product.variations.length > 0) {
      const activeVariations = product.variations.filter(v => v.isActive !== false);
      if (activeVariations.length > 0) {
        const defaultVariation = activeVariations.find(v => v.isDefault) || null;
        setSelectedVariation(defaultVariation);
      } else {
        setSelectedVariation(null);
      }
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
          variationLabel: selectedVariation?.label || null,
          variationPrice: selectedVariation?.price || null,
        });
      }
    },
    onSuccess: (_, variables) => {
      if (variables.authenticated) {
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      }
      if (product) {
        const price = selectedVariation ? selectedVariation.price : product.price;
        trackAddToCart({
          id: product.id,
          name: product.name,
          price,
          brand: brandName,
          category: categoryName,
          quantity,
          sku: product.sku,
        });
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
                <Package weight="duotone" className="w-12 h-12 text-white/20" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Product niet gevonden</h1>
              <p className="text-white/50 mb-8">
                Het product dat je zoekt bestaat niet of is niet meer beschikbaar.
              </p>
              <Button 
                onClick={() => window.history.back()}
                className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none"
              >
                <ArrowLeft weight="duotone" className="w-4 h-4 mr-2" />
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
  const baseImages = product.images || [];
  const images = (product.hasVariations && selectedVariation?.images && selectedVariation.images.length > 0)
    ? selectedVariation.images
    : baseImages;
  const installationPrice = (installationEnabled && product.installationPrice) ? parseFloat(product.installationPrice) : null;
  
  // Determine stock based on variation or product
  const effectiveStock = product.hasVariations && selectedVariation 
    ? selectedVariation.stock 
    : product.stock;
  const isInStock = effectiveStock !== null && effectiveStock > 0;
  const canAddToCart = product.hasVariations ? (selectedVariation && isInStock) : isInStock;

  const productDescription = product.shortDescription || product.description?.toString().substring(0, 160) || `Koop ${product.name} bij Car Audio Limburg. Premium car audio specialist.`;

  const availableTabs: { value: string; label: string; icon: typeof Play }[] = [];
  if (product.videoUrl) availableTabs.push({ value: 'video', label: 'Video', icon: Play });
  if (product.description || product.overviewContent) availableTabs.push({ value: 'description', label: 'Beschrijving', icon: FileText });
  if (product.features && Array.isArray(product.features) && product.features.length > 0) availableTabs.push({ value: 'features', label: 'Kenmerken', icon: Check });
  if (product.specifications && Object.keys(product.specifications as Record<string, unknown>).filter(k => !['manualUrl', 'techSheetUrl'].includes(k)).length > 0) availableTabs.push({ value: 'specifications', label: 'Specificaties', icon: FileText });
  if ((product.downloads && Array.isArray(product.downloads) && product.downloads.length > 0) || (product.specifications && ((product.specifications as Record<string, string>).manualUrl || (product.specifications as Record<string, string>).techSheetUrl))) availableTabs.push({ value: 'downloads', label: 'Downloads', icon: DownloadSimple });
  if (product.boxContent && Array.isArray(product.boxContent) && product.boxContent.length > 0) availableTabs.push({ value: 'box-content', label: 'In de doos', icon: Cube });

  return (
    <div className="min-h-screen bg-black" id="main-content">
      <SEO 
        title={brandName && !product.name.includes(brandName) ? `${brandName} ${product.name}` : product.name}
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
        brand={brandName}
        sku={product.sku || product.id}
        mpn={product.sku || undefined}
        category={categoryName}
        url={`/webshop/${product.slug}`}
        reviewCount={etrustedAggregate?.enabled && etrustedAggregate?.count ? etrustedAggregate.count : undefined}
        ratingValue={etrustedAggregate?.enabled && etrustedAggregate?.rating ? etrustedAggregate.rating : undefined}
      />
      <BreadcrumbSchema items={[
        { name: "Home", url: "/" },
        { name: "Producten", url: "/webshop" },
        ...(categoryName && categorySlug ? [{ name: categoryName, url: `/webshop?category=${categorySlug}` }] : []),
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
            onClick={() => navigate("/webshop")}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 hover:bg-white/10 transition-colors active:scale-95"
            data-testid="mobile-back-button"
            aria-label="Terug naar shop"
          >
            <ArrowLeft weight="duotone" className="w-6 h-6 text-white" />
          </button>
          
          <div className="flex items-center">
            <button 
              onClick={handleShare}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white/10 transition-colors active:scale-95"
              data-testid="mobile-share-button"
              aria-label="Deel dit product"
            >
              <ShareNetwork weight="duotone" className="w-5 h-5 text-white" />
            </button>
            <button 
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white/10 transition-colors active:scale-95"
              data-testid="mobile-wishlist-button"
              aria-label={isWishlisted ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
              aria-pressed={isWishlisted}
            >
              <Heart weight="duotone" className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 hover:bg-white/10 transition-colors active:scale-95"
              data-testid="mobile-cart-button"
              aria-label="Open winkelwagen"
            >
              <ShoppingCart weight="duotone" className="w-5 h-5 text-white" />
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
            <Link href="/webshop" className="text-white/40 hover:text-[#d0a760] transition-colors">Shop</Link>
            <span className="text-white/20">/</span>
            <span className="text-white">{product.name}</span>
          </nav>
        </div>
      </div>
      {/* Mobile Product Title - Above images */}
      <div className="md:hidden pt-16 px-4 pb-2 bg-black">
        <Badge className="bg-[#d0a760]/10 text-[#d0a760] border-[#d0a760]/20 rounded-none mb-3 inline-flex">
          Premium Audio
        </Badge>
        <h1 className="text-xl font-bold text-white" data-testid="mobile-product-title">
          {product.name}
        </h1>
        {product.shortDescription && (
          <p className="text-sm text-white/50 mt-2" data-testid="mobile-product-short-description">
            {product.shortDescription}
          </p>
        )}
      </div>

      {/* Product Section - Black */}
      <section className="pt-2 md:pt-0 py-8 md:py-24 pb-8 md:pb-24">
        <div className="container mx-auto px-4 mt-0 md:mt-[32px] mb-[48px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 lg:gap-16">
            {/* Product Images - Mobile Swipeable Gallery */}
            <ScrollReveal animation="fade-right">
              <div className="space-y-4" data-testid="product-images">
                {images.length > 0 ? (
                  <>
                    {/* Main Image - Swipeable on Mobile */}
                    <div 
                      ref={imageContainerRef}
                      role="button"
                      tabIndex={0}
                      aria-label="Klik om afbeelding te vergroten"
                      className="relative bg-white md:border md:border-zinc-800 md:cursor-zoom-in group overflow-hidden touch-pan-y focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d0a760] flex items-center justify-center min-h-[300px] max-h-[600px] md:min-h-[400px] md:max-h-[700px]"
                      onClick={() => setIsLightboxOpen(true)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsLightboxOpen(true); } }}
                      onTouchStart={images.length > 1 ? onTouchStart : undefined}
                      onTouchMove={images.length > 1 ? onTouchMove : undefined}
                      onTouchEnd={() => images.length > 1 && onTouchEnd(images)}
                      data-testid="main-product-image"
                    >
                      <img 
                        src={images[selectedImageIndex]} 
                        alt={product.name}
                        width={600}
                        height={600}
                        decoding="async"
                        loading={selectedImageIndex === 0 ? "eager" : "lazy"}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 select-none"
                        draggable={false}
                      />
                      
                      {/* Zoom indicator - Desktop only */}
                      <div className="hidden md:flex absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 p-3">
                          <MagnifyingGlassPlus weight="duotone" className="w-6 h-6 text-black" />
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
                            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] items-center justify-center bg-black/60 hover:bg-[#d0a760] text-white hover:text-black transition-all"
                            data-testid="button-previous-image"
                            aria-label="Vorige afbeelding"
                          >
                            <CaretLeft weight="duotone" className="w-6 h-6" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImageIndex((prev) => (prev + 1) % images.length);
                            }}
                            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] items-center justify-center bg-black/60 hover:bg-[#d0a760] text-white hover:text-black transition-all"
                            data-testid="button-next-image"
                            aria-label="Volgende afbeelding"
                          >
                            <CaretRight weight="duotone" className="w-6 h-6" />
                          </button>
                        </>
                      )}
                      
                      {/* Mobile Image Dots Indicator */}
                      {images.length > 1 && isMobile && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1" role="tablist" aria-label="Afbeelding selectie">
                          {images.map((_, index) => (
                            <button
                              key={index}
                              role="tab"
                              aria-selected={index === selectedImageIndex}
                              aria-label={`Afbeelding ${index + 1} van ${images.length}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImageIndex(index);
                              }}
                              className={`min-w-[44px] min-h-[44px] flex items-center justify-center transition-all duration-300`}
                              data-testid={`mobile-dot-${index}`}
                            >
                              <span className={`block h-2 transition-all duration-300 ${
                                index === selectedImageIndex 
                                  ? 'bg-[#d0a760] w-6' 
                                  : 'bg-white/30 w-2'
                              }`} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Thumbnails - Mobile: horizontal scroll, Desktop: grid */}
                    {images.length > 1 && (
                      <>
                        {/* Mobile thumbnails - horizontal scroll */}
                        <div className="flex md:hidden gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
                          {images.map((image, index) => (
                            <button
                              key={index}
                              className={`flex-shrink-0 w-16 h-16 bg-white border-2 transition-all duration-300 overflow-hidden snap-start ${
                                index === selectedImageIndex 
                                  ? 'border-[#d0a760]' 
                                  : 'border-zinc-800'
                              }`}
                              onClick={() => setSelectedImageIndex(index)}
                              data-testid={`mobile-thumbnail-${index}`}
                            >
                              <img 
                                src={image} 
                                alt={`${product.name} ${index + 1}`}
                                width={64}
                                height={64}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-contain bg-white"
                              />
                            </button>
                          ))}
                        </div>
                        {/* Desktop thumbnails - grid */}
                        <div className="hidden md:grid grid-cols-4 gap-3 px-4 md:px-0">
                          {images.map((image, index) => (
                            <button
                              key={index}
                              className={`aspect-square bg-white border-2 transition-all duration-300 overflow-hidden ${
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
                                width={100}
                                height={100}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-contain"
                              />
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="aspect-square bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center">
                    <Package weight="duotone" className="w-16 h-16 text-white/10 mb-4" />
                    <p className="text-white/30 text-sm">Geen afbeelding beschikbaar</p>
                  </div>
                )}
              </div>
            </ScrollReveal>

            {/* Product Details */}
            <ScrollReveal animation="fade-left">
              <div className="space-y-4 md:space-y-6 px-4 md:px-0" data-testid="product-details">
                {/* Header - Desktop only (mobile shows above images) */}
                <div className="hidden md:block">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-[#d0a760]/10 text-[#d0a760] border-[#d0a760]/20 rounded-none">
                      Premium Audio
                    </Badge>
                    {/* Desktop wishlist button */}
                    <button
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      className="p-2 hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d0a760]"
                      data-testid="button-wishlist"
                      aria-label={isWishlisted ? "Verwijderen uit verlanglijst" : "Toevoegen aan verlanglijst"}
                      aria-pressed={isWishlisted}
                    >
                      <Heart weight="duotone" className={`w-6 h-6 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-white/40'}`} />
                    </button>
                  </div>
                  
                  <h1 className="text-4xl font-bold text-white mb-3" data-testid="product-title">
                    {product.name}
                  </h1>
                  
                  {product.shortDescription && (
                    <p className="text-lg text-white/50" data-testid="product-short-description">
                      {product.shortDescription}
                    </p>
                  )}
                </div>


                {/* Variation Selector - Dropdown style */}
                {product.hasVariations && product.variations && product.variations.length > 0 && (
                  <div className="py-4 border-b border-white/10" data-testid="variation-selector">
                    <label className="text-white font-semibold text-sm mb-2 block">
                      Selecteer uw automodel:
                    </label>
                    <div className="relative">
                      <select
                        value={selectedVariation?.id || ""}
                        onChange={(e) => {
                          const variation = product.variations?.find(v => v.id === e.target.value);
                          setSelectedVariation(variation || null);
                          setSelectedImageIndex(0);
                        }}
                        className="w-full h-14 px-4 pr-12 bg-zinc-900 border-2 border-zinc-700 text-white text-base font-medium appearance-none cursor-pointer rounded-none focus:border-[#d0a760] focus:outline-none focus:ring-1 focus:ring-[#d0a760]/50 transition-colors"
                        data-testid="variation-dropdown"
                      >
                        <option value="" disabled>
                          — Selecteer een optie —
                        </option>
                        {product.variations
                          .filter(v => v.isActive !== false)
                          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                          .map((variation) => {
                            const isOutOfStock = variation.stock === null || variation.stock <= 0;
                            return (
                              <option
                                key={variation.id}
                                value={variation.id}
                                disabled={isOutOfStock}
                              >
                                {variation.label}{isOutOfStock ? " (Niet op voorraad)" : ""}{parseFloat(variation.price) !== currentPrice || !selectedVariation ? ` — €${parseFloat(variation.price).toFixed(0)}` : ""}
                              </option>
                            );
                          })}
                      </select>
                      <CaretDown weight="bold" className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d0a760] pointer-events-none" />
                    </div>
                    {product.hasVariations && !selectedVariation && (
                      <p className="text-[#d0a760]/80 text-xs mt-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-[#d0a760] animate-pulse" />
                        Selecteer een optie om door te gaan
                      </p>
                    )}
                    {selectedVariation && (
                      <p className="text-green-500/80 text-xs mt-2 flex items-center gap-1.5">
                        <Check weight="bold" className="w-3.5 h-3.5" />
                        {selectedVariation.label} geselecteerd
                      </p>
                    )}
                    {selectedVariation?.specifications && Object.keys(selectedVariation.specifications).length > 0 && (
                      <div className="mt-3 bg-zinc-900/80 border border-zinc-800 p-3" data-testid="variation-specs">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                          {Object.entries(selectedVariation.specifications).map(([key, value]) => (
                            <div key={key} className="flex justify-between col-span-2 sm:col-span-1">
                              <span className="text-white/50 text-xs">{key}</span>
                              <span className="text-white text-xs font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Trusted Shops Rating */}
                {etrustedAggregate?.enabled && etrustedAggregate?.rating && (
                  <a 
                    href="https://www.trstd.com/nl-nl/reviews/caraudiolimburg-nl" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 mb-4 group cursor-pointer"
                    data-testid="product-trusted-shops"
                  >
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} weight="fill" className={`w-4 h-4 ${i < Math.round(etrustedAggregate.rating!) ? 'text-[#d0a760]' : 'text-zinc-700'}`} />
                      ))}
                    </div>
                    <span className="text-white/70 text-sm group-hover:text-[#d0a760] transition-colors">
                      {etrustedAggregate.rating.toFixed(2)}/5 — {etrustedAggregate.count}+ beoordelingen
                    </span>
                    <ShieldCheck weight="duotone" className="w-4 h-4 text-[#d0a760]/60" />
                  </a>
                )}

                {/* Price - Mobile compact, Desktop full - Enhanced visibility */}
                <div className="py-6 md:py-8 border-y border-[#d0a760]/20 bg-zinc-900/50 -mx-4 px-4 md:mx-0 md:px-0 md:bg-gradient-to-r md:from-[#d0a760]/5 md:via-transparent md:to-[#d0a760]/5" data-testid="product-pricing">
                  <div className="flex items-baseline gap-3 md:gap-4 mb-3 md:mb-4">
                    <span className="text-4xl md:text-5xl font-bold text-white drop-shadow-[0_0_20px_rgba(208,167,96,0.3)]">
                      €{currentPrice.toFixed(0)}
                    </span>
                    {originalPrice && (
                      <span className="text-lg md:text-xl text-white/40 line-through">
                        €{originalPrice.toFixed(0)}
                      </span>
                    )}
                    {discount && (
                      <span className="ml-2 px-3 py-1 bg-green-500/20 text-green-400 text-sm font-semibold border border-green-500/30">
                        Bespaar €{(originalPrice! - currentPrice).toFixed(0)}
                      </span>
                    )}
                  </div>
                  
                  {installationEnabled && installationPrice && (
                    <p className="text-[#d0a760] text-sm font-medium flex items-center gap-2">
                      <Sparkle weight="duotone" className="w-4 h-4" />
                      + €{installationPrice.toFixed(0)} voor professionele installatie
                    </p>
                  )}

                  <div className="mt-3 md:mt-4 space-y-3">
                    {isInStock ? (
                      <div className="flex flex-col gap-1.5">
                        {effectiveStock !== null && effectiveStock >= 1 && effectiveStock <= 5 ? (
                          <span className="inline-flex items-center gap-2 text-amber-500 text-sm font-medium">
                            <Warning weight="duotone" className="w-4 h-4" />
                            Nog maar {effectiveStock} op voorraad
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 text-green-500 text-sm font-medium">
                            <Check weight="duotone" className="w-4 h-4" />
                            Op voorraad
                          </span>
                        )}
                        {currentPrice >= 50 && (
                          <span className="inline-flex items-center gap-2 text-[#d0a760] text-xs font-medium">
                            <Truck weight="duotone" className="w-3.5 h-3.5" />
                            Gratis verzending
                          </span>
                        )}
                        <span className="text-white/50 text-xs flex items-center gap-1">
                          <Clock weight="duotone" className="w-3 h-3" />
                          Bestel voor 16:00, morgen in huis
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        <span className="inline-flex items-center gap-2 text-red-500 text-sm font-medium">
                          <Clock weight="duotone" className="w-4 h-4" />
                          {product.hasVariations && !selectedVariation 
                            ? "Selecteer een optie" 
                            : "Niet op voorraad"}
                        </span>
                        {currentPrice >= 50 && (
                          <span className="inline-flex items-center gap-2 text-[#d0a760] text-xs font-medium">
                            <Truck weight="duotone" className="w-3.5 h-3.5" />
                            Gratis verzending
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Payment Methods */}
                    <div className="flex items-center gap-2 pt-2 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                      <span className="text-white/40 text-xs whitespace-nowrap flex-shrink-0">Betaalmethodes:</span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <div className="bg-[#1A1F71] px-2 py-1.5 rounded flex items-center justify-center" title="Visa">
                          <SiVisa className="w-7 h-5 text-white" />
                        </div>
                        <div className="bg-white px-1.5 py-1 rounded flex items-center justify-center" title="Mastercard">
                          <img src={mastercardLogo} alt="Mastercard" loading="lazy" decoding="async" className="h-5 w-auto" />
                        </div>
                        <div className="bg-black px-2 py-1.5 rounded flex items-center justify-center" title="Apple Pay">
                          <img src={applePayLogo} alt="Apple Pay" loading="lazy" decoding="async" className="h-4 w-auto invert" />
                        </div>
                        <div className="bg-white px-2 py-1.5 rounded flex items-center justify-center" title="Google Pay">
                          <img src={googlePayLogo} alt="Google Pay" loading="lazy" decoding="async" className="h-5 w-auto" />
                        </div>
                        <div className="bg-black px-2 py-1.5 rounded flex items-center justify-center" title="Revolut Pay">
                          <SiRevolut className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-white px-1.5 py-1 rounded flex items-center justify-center" title="Bancontact">
                          <img src={bancontactLogo} alt="Bancontact" loading="lazy" decoding="async" className="h-6 w-auto" />
                        </div>
                        <div className="bg-white px-1.5 py-1 rounded flex items-center justify-center" title="iDEAL">
                          <img src={idealLogo} alt="iDEAL" loading="lazy" decoding="async" className="h-6 w-auto" />
                        </div>
                        <div className="bg-[#FFB3C7] px-2 py-1.5 rounded flex items-center justify-center" title="Klarna">
                          <SiKlarna className="w-6 h-5 text-[#0A0B09]" />
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
                        <Minus weight="duotone" className="w-4 h-4" />
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
                        <Plus weight="duotone" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className={`grid gap-4 ${installationEnabled ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                    <Button
                      size="lg"
                      className="bg-[#d0a760] text-black hover:bg-[#c49650] rounded-none h-16 text-lg font-semibold shadow-[0_0_30px_rgba(208,167,96,0.4)] hover:shadow-[0_0_40px_rgba(208,167,96,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                      onClick={() => addToCartMutation.mutate({ needsInstallation: false, authenticated: isAuthenticated })}
                      disabled={!canAddToCart || addToCartMutation.isPending}
                      data-testid="button-add-to-cart"
                    >
                      <ShoppingCart weight="duotone" className="w-5 h-5 mr-2" />
                      {addToCartMutation.isPending ? "Toevoegen..." : "In Winkelwagen"}
                    </Button>
                    
                    {installationEnabled && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-2 border-[#d0a760] text-[#d0a760] hover:bg-[#d0a760] hover:text-black rounded-none h-16 text-base font-semibold flex flex-col items-center justify-center py-2 hover:shadow-[0_0_30px_rgba(208,167,96,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                      onClick={() => addToCartMutation.mutate({ needsInstallation: true, authenticated: isAuthenticated })}
                      disabled={!canAddToCart || addToCartMutation.isPending}
                      data-testid="button-add-with-installation"
                    >
                      <span className="flex items-center">
                        <Wrench weight="duotone" className="w-4 h-4 mr-1.5" />
                        + Professionele Installatie
                      </span>
                      {installationPrice && (
                        <span className="text-xs opacity-70 font-normal">
                          Totaal: €{(currentPrice + installationPrice).toFixed(0)}
                        </span>
                      )}
                    </Button>
                    )}
                  </div>
                  
                  {/* Installation Bundle Highlight */}
                  {installationEnabled && installationPrice && (
                    <div className="bg-[#d0a760]/5 border border-[#d0a760]/20 p-4 mt-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-[#d0a760]/10">
                          <ShieldCheck weight="duotone" className="w-5 h-5 text-[#d0a760]" />
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
                <div className="pt-6 md:pt-8" data-testid="product-benefits">
                  {/* Mobile: Compact horizontal badges */}
                  <div className="flex md:hidden gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-zinc-900/80 border border-zinc-700 whitespace-nowrap flex-shrink-0 hover:border-[#d0a760]/50 transition-colors">
                      <Truck weight="duotone" className="w-4 h-4 text-[#d0a760]" />
                      <span className="text-white text-xs font-medium">Gratis Verzending</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-zinc-900/80 border border-zinc-700 whitespace-nowrap flex-shrink-0 hover:border-[#d0a760]/50 transition-colors">
                      <ShieldCheck weight="duotone" className="w-4 h-4 text-[#d0a760]" />
                      <span className="text-white text-xs font-medium">2 Jaar Garantie</span>
                    </div>
                    {installationEnabled && (
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-zinc-900/80 border border-zinc-700 whitespace-nowrap flex-shrink-0 hover:border-[#d0a760]/50 transition-colors">
                      <Trophy weight="duotone" className="w-4 h-4 text-[#d0a760]" />
                      <span className="text-white text-xs font-medium">Prof. Installatie</span>
                    </div>
                    )}
                  </div>
                  
                  {/* Desktop: Full grid with stagger and enhanced styling */}
                  <StaggerContainer className="hidden md:grid grid-cols-1 gap-4">
                    <StaggerItem>
                      <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-zinc-900 to-zinc-900/50 border border-zinc-700 hover:border-[#d0a760]/40 transition-all duration-300 group">
                        <div className="p-3 bg-[#d0a760]/10 group-hover:bg-[#d0a760]/20 transition-colors">
                          <Truck weight="duotone" className="w-5 h-5 text-[#d0a760]" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">Gratis Verzending</p>
                          <p className="text-white/50 text-xs">Bij bestellingen vanaf €50</p>
                        </div>
                      </div>
                    </StaggerItem>
                    
                    <StaggerItem>
                      <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-zinc-900 to-zinc-900/50 border border-zinc-700 hover:border-[#d0a760]/40 transition-all duration-300 group">
                        <div className="p-3 bg-[#d0a760]/10 group-hover:bg-[#d0a760]/20 transition-colors">
                          <ShieldCheck weight="duotone" className="w-5 h-5 text-[#d0a760]" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">2 Jaar Garantie</p>
                          <p className="text-white/50 text-xs">Volledige fabrieksgarantie</p>
                        </div>
                      </div>
                    </StaggerItem>
                    
                    {installationEnabled && (
                    <StaggerItem>
                      <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-zinc-900 to-zinc-900/50 border border-zinc-700 hover:border-[#d0a760]/40 transition-all duration-300 group">
                        <div className="p-3 bg-[#d0a760]/10 group-hover:bg-[#d0a760]/20 transition-colors">
                          <Trophy weight="duotone" className="w-5 h-5 text-[#d0a760]" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">Professionele Installatie</p>
                          <p className="text-white/50 text-xs">Door gecertificeerde monteurs</p>
                        </div>
                      </div>
                    </StaggerItem>
                    )}
                  </StaggerContainer>
                  
                  {/* Scroll to description indicator - Desktop only */}
                  <div className="hidden md:flex justify-center mt-8">
                    <a 
                      href="#product-details" 
                      className="flex flex-col items-center gap-2 text-white/40 hover:text-[#d0a760] transition-colors group cursor-pointer"
                    >
                      <span className="text-xs font-medium">Bekijk productdetails</span>
                      <CaretDown weight="duotone" className="w-5 h-5 animate-bounce" />
                    </a>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
      {availableTabs.length > 0 && (
      <section className="bg-zinc-950 py-16 md:py-24 border-t border-[#d0a760]/10" data-testid="product-information" id="product-details">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-up">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-1 h-6 bg-[#d0a760]"></span>
                Product Details
              </h2>
              <Tabs defaultValue={availableTabs[0].value} className="w-full">
                <TabsList className="flex overflow-x-auto md:w-full justify-start bg-zinc-900/50 border-2 border-zinc-800 rounded-none p-1.5 h-auto gap-1 backdrop-blur-sm scrollbar-hide">
                  {availableTabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="flex-shrink-0 rounded-none px-4 md:px-6 py-3 md:py-3.5 text-xs md:text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 data-[state=active]:bg-[#d0a760] data-[state=active]:text-black data-[state=active]:shadow-[0_0_20px_rgba(208,167,96,0.3)] flex items-center gap-1.5 md:gap-2 transition-all duration-300 whitespace-nowrap"
                      >
                        <IconComponent weight="duotone" className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        {tab.label}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {availableTabs.some(t => t.value === 'video') && (
                  <TabsContent value="video" className="mt-6">
                    <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-8">
                      <div className="aspect-video bg-black rounded-none overflow-hidden">
                        <iframe
                          src={(() => {
                            const url = product.videoUrl!;
                            try {
                              const parsed = new URL(url);
                              let videoId = '';
                              if (parsed.hostname.includes('youtu.be')) {
                                videoId = parsed.pathname.slice(1);
                              } else if (parsed.searchParams.has('v')) {
                                videoId = parsed.searchParams.get('v')!;
                              } else if (parsed.pathname.includes('/embed/')) {
                                return url;
                              }
                              if (videoId) {
                                const start = parsed.searchParams.get('t')?.replace('s', '') || parsed.searchParams.get('start');
                                const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
                                return start ? `${embedUrl}?start=${start}` : embedUrl;
                              }
                            } catch {}
                            return url.replace('watch?v=', 'embed/');
                          })()}
                          title={`${product.name} video`}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  </TabsContent>
                )}

                {availableTabs.some(t => t.value === 'description') && (
                  <TabsContent value="description" className="mt-6">
                    <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-8">
                      <div className="prose prose-invert max-w-none">
                        <FormattedDescription text={String(product.overviewContent || product.description)} hasFeatures={Array.isArray(product.features) && (product.features as string[]).length > 0} />
                      </div>
                    </div>
                  </TabsContent>
                )}

                {availableTabs.some(t => t.value === 'features') && (
                  <TabsContent value="features" className="mt-6">
                    <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-8">
                      <h3 className="text-lg font-semibold text-white mb-4">Belangrijkste kenmerken</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(product.features as string[]).map((feature, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-zinc-800/50">
                            <Check weight="duotone" className="w-5 h-5 text-[#d0a760] flex-shrink-0 mt-0.5" />
                            <span className="text-white/80">{String(feature)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                )}

                {availableTabs.some(t => t.value === 'specifications') && (
                  <TabsContent value="specifications" className="mt-6">
                    <div className="bg-zinc-900 border border-zinc-800 p-3 sm:p-6 md:p-8 overflow-hidden">
                      <div className="space-y-8">
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
                                      <table className="w-full table-fixed">
                                        <tbody>
                                          {Object.entries(values as Record<string, string | number>).map(([key, value], index) => (
                                            <tr key={key} className={index % 2 === 0 ? 'bg-zinc-800/50' : ''}>
                                              <td className="px-2 sm:px-4 py-3 text-white/50 text-xs sm:text-sm font-medium w-[40%] break-words">{key}</td>
                                              <td className="px-2 sm:px-4 py-3 text-white font-medium text-sm break-words">{String(value)}</td>
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
                              <table className="w-full table-fixed">
                                <tbody>
                                  {Object.entries(specs)
                                    .filter(([key]) => !['manualUrl', 'techSheetUrl'].includes(key))
                                    .map(([key, value], index) => (
                                      <tr key={key} className={index % 2 === 0 ? 'bg-zinc-800/50' : ''}>
                                        <td className="px-2 sm:px-4 py-3 text-white/50 text-xs sm:text-sm font-medium uppercase tracking-wider w-[35%] break-words">{key}</td>
                                        <td className="px-2 sm:px-4 py-3 text-white font-medium text-sm break-words">{String(value)}</td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            );
                          }
                        })()}
                      </div>
                    </div>
                  </TabsContent>
                )}

                {availableTabs.some(t => t.value === 'downloads') && (
                  <TabsContent value="downloads" className="mt-6">
                    <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-8">
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
                            <FileText weight="duotone" className="w-6 h-6 text-[#d0a760]" />
                            <div className="flex-1">
                              <p className="font-medium text-white group-hover:text-[#d0a760]">{download.name}</p>
                            </div>
                            <DownloadSimple weight="duotone" className="w-5 h-5 text-white/30 group-hover:text-[#d0a760]" />
                          </a>
                        )) : null}
                        {product.specifications && (product.specifications as Record<string, string>).manualUrl ? (
                          <a 
                            href={(product.specifications as Record<string, string>).manualUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 bg-zinc-800/50 border border-zinc-700 hover:border-[#d0a760] transition-colors group"
                          >
                            <FileText weight="duotone" className="w-6 h-6 text-[#d0a760]" />
                            <div className="flex-1">
                              <p className="font-medium text-white group-hover:text-[#d0a760]">Handleiding (PDF)</p>
                            </div>
                            <DownloadSimple weight="duotone" className="w-5 h-5 text-white/30 group-hover:text-[#d0a760]" />
                          </a>
                        ) : null}
                        {product.specifications && (product.specifications as Record<string, string>).techSheetUrl ? (
                          <a 
                            href={(product.specifications as Record<string, string>).techSheetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 bg-zinc-800/50 border border-zinc-700 hover:border-[#d0a760] transition-colors group"
                          >
                            <FileText weight="duotone" className="w-6 h-6 text-[#d0a760]" />
                            <div className="flex-1">
                              <p className="font-medium text-white group-hover:text-[#d0a760]">Tech Sheet (PDF)</p>
                            </div>
                            <DownloadSimple weight="duotone" className="w-5 h-5 text-white/30 group-hover:text-[#d0a760]" />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </TabsContent>
                )}

                {availableTabs.some(t => t.value === 'box-content') && (
                  <TabsContent value="box-content" className="mt-6">
                    <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-8">
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white mb-4">Wat zit er in de doos?</h3>
                        <ul className="space-y-3">
                          {(product.boxContent as (string | { item: string; quantity?: number })[]).map((item, index) => (
                            <li key={index} className="flex items-start gap-3 p-3 bg-zinc-800/50 border border-zinc-700">
                              <Cube weight="duotone" className="w-5 h-5 text-[#d0a760] flex-shrink-0 mt-0.5" />
                              <span className="text-white/80">
                                {typeof item === 'string' ? item : `${item.quantity ? `${item.quantity}x ` : ''}${item.item}`}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </ScrollReveal>
        </div>
      </section>
      )}
      {/* Upsell / Recommended Accessories Section */}
      {upsellProducts.length > 0 && (
        <section className="bg-black py-16 md:py-24 border-t border-[#d0a760]/10" data-testid="upsell-products">
          <div className="container mx-auto px-4">
            <ScrollReveal animation="fade-up">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                  <span className="w-8 h-0.5 bg-[#d0a760]"></span>
                  Aanbevolen Accessoires
                  <span className="w-8 h-0.5 bg-[#d0a760]"></span>
                </h2>
                <p className="text-white/50">Maak uw setup compleet met deze accessoires</p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {upsellProducts.map((upsell) => (
                <ScrollReveal key={upsell.id} animation="fade-up">
                  <div className="bg-zinc-900 border border-zinc-800 hover:border-[#d0a760]/30 transition-all duration-300 group" data-testid={`upsell-product-${upsell.id}`}>
                    <Link href={`/webshop/${upsell.slug}`}>
                      <div className="relative aspect-[4/3] bg-white overflow-hidden">
                        {upsell.images && upsell.images[0] ? (
                          <img
                            src={upsell.images[0]}
                            alt={upsell.name}
                            width={300}
                            height={225}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Package weight="duotone" className="w-12 h-12 text-white/10" />
                          </div>
                        )}
                        {upsell.upsellLabel && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-[#d0a760] text-black text-xs font-medium px-2 py-1 rounded-none">
                              {upsell.upsellLabel}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="p-4 space-y-3">
                      <Link href={`/webshop/${upsell.slug}`}>
                        <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-[#d0a760] transition-colors cursor-pointer">
                          {upsell.name}
                        </h3>
                      </Link>
                      {upsell.shortDescription && (
                        <p className="text-white/40 text-xs line-clamp-2">{upsell.shortDescription}</p>
                      )}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[#d0a760] font-bold text-lg">€{parseFloat(upsell.price).toFixed(0)}</span>
                          {upsell.hasVariations && (
                            <span className="text-white/30 text-xs">vanaf</span>
                          )}
                        </div>
                        {!upsell.hasVariations ? (
                          <Button
                            size="sm"
                            className="bg-[#d0a760] text-black hover:bg-[#c49a50] rounded-none text-xs px-3 h-8"
                            onClick={(e) => {
                              e.preventDefault();
                              const doAdd = async () => {
                                if (isAuthenticated) {
                                  await apiRequest("POST", "/api/cart", {
                                    productId: upsell.id,
                                    quantity: 1,
                                    needsInstallation: false,
                                    variationId: null,
                                  });
                                  queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
                                } else {
                                  addToGuestCart({
                                    productId: upsell.id,
                                    quantity: 1,
                                    needsInstallation: false,
                                    variationId: null,
                                    variationLabel: null,
                                    variationPrice: null,
                                  });
                                }
                                toast({
                                  title: "Toegevoegd",
                                  description: `${upsell.name} is toegevoegd aan je winkelwagen.`,
                                });
                                setIsCartOpen(true);
                              };
                              doAdd();
                            }}
                          >
                            <ShoppingCart weight="bold" className="w-3.5 h-3.5 mr-1" />
                            Toevoegen
                          </Button>
                        ) : (
                          <Link href={`/webshop/${upsell.slug}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#d0a760]/30 text-[#d0a760] hover:bg-[#d0a760]/10 rounded-none text-xs px-3 h-8"
                            >
                              Bekijk opties
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Products / Upsell Section */}
      {filteredRelatedProducts.length > 0 && (
        <section className="bg-zinc-950 py-16 md:py-24 border-t border-[#d0a760]/10" data-testid="related-products">
          <div className="container mx-auto px-4">
            <ScrollReveal animation="fade-up">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                  <span className="w-8 h-0.5 bg-[#d0a760]"></span>
                  Gerelateerde Producten
                  <span className="w-8 h-0.5 bg-[#d0a760]"></span>
                </h2>
                <p className="text-white/50">Andere klanten bekeken ook</p>
              </div>
            </ScrollReveal>
            
            {/* Mobile: horizontal scroll with 2 visible items, Desktop: grid */}
            <div className="relative">
              <div className="md:hidden absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-zinc-950 to-transparent pointer-events-none z-10" />
              <div className="flex md:hidden gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
                {filteredRelatedProducts.map((relatedProduct) => (
                  <Link key={relatedProduct.id} href={`/webshop/${relatedProduct.slug}`}>
                    <div className="group cursor-pointer flex-shrink-0 w-[calc(50vw-24px)] snap-start" data-testid={`related-product-${relatedProduct.id}`}>
                    <div className="relative aspect-square bg-white border border-zinc-700 mb-3 overflow-hidden group-hover:border-[#d0a760]/50 transition-all duration-300">
                      {relatedProduct.images && relatedProduct.images[0] ? (
                        <img 
                          src={relatedProduct.images[0]} 
                          alt={relatedProduct.name}
                          width={180}
                          height={180}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package weight="duotone" className="w-10 h-10 text-white/10" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-white text-sm font-semibold line-clamp-2 mb-1">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[#d0a760] font-bold text-sm">€{parseFloat(relatedProduct.price).toFixed(0)}</span>
                      {relatedProduct.originalPrice && (
                        <span className="text-white/30 text-xs line-through">
                          €{parseFloat(relatedProduct.originalPrice).toFixed(0)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              {/* Scroll hint */}
              <div className="flex-shrink-0 w-8 flex items-center justify-center">
                <CaretRight weight="duotone" className="w-5 h-5 text-white/20" />
              </div>
            </div>
            </div>
            
            {/* Desktop grid */}
            <div className="hidden md:grid grid-cols-4 gap-6">
              {filteredRelatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} href={`/webshop/${relatedProduct.slug}`}>
                  <div className="group cursor-pointer" data-testid={`related-product-desktop-${relatedProduct.id}`}>
                    <div className="relative aspect-square bg-white border border-zinc-700 mb-4 overflow-hidden group-hover:border-[#d0a760]/50 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(208,167,96,0.15)]">
                      {relatedProduct.images && relatedProduct.images[0] ? (
                        <img 
                          src={relatedProduct.images[0]} 
                          alt={relatedProduct.name}
                          width={200}
                          height={200}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package weight="duotone" className="w-12 h-12 text-white/10" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-white text-sm font-semibold line-clamp-2 group-hover:text-[#d0a760] transition-colors duration-300 mb-1.5">
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
      {/* CTA Section - Black with gradient */}
      <section className="bg-gradient-to-b from-black via-zinc-950 to-black py-20 border-t border-[#d0a760]/10">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-up">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center p-4 bg-[#d0a760]/10 border border-[#d0a760]/20 mb-8">
                <Trophy weight="duotone" className="w-10 h-10 text-[#d0a760]" />
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-5">
                Vragen over dit product?
              </h2>
              <p className="text-white/60 mb-10 text-lg">
                Onze experts staan klaar om al je vragen te beantwoorden en je te helpen met de beste keuze.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  asChild
                  className="bg-[#d0a760] text-black hover:bg-[#c49650] rounded-none px-10 py-6 text-base font-semibold shadow-[0_0_30px_rgba(208,167,96,0.3)] hover:shadow-[0_0_40px_rgba(208,167,96,0.5)] hover:scale-[1.02] transition-all duration-300"
                >
                  <a href="/contact">Stel een Vraag</a>
                </Button>
                {installationEnabled && (
                <Button 
                  asChild
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 rounded-none px-10 py-6 text-base font-medium hover:scale-[1.02] transition-all duration-300"
                >
                  <a href="/contact">Neem Contact Op</a>
                </Button>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
      {/* Footer */}
      <div className="pb-44 md:pb-0">
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
                <Minus weight="duotone" className="w-4 h-4" />
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
                <Plus weight="duotone" className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-right">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">€{currentPrice.toFixed(0)}</span>
                {originalPrice && (
                  <span className="text-sm text-white/30 line-through">€{originalPrice.toFixed(0)}</span>
                )}
              </div>
              {installationEnabled && installationPrice && (
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
          <div className={`grid gap-3 ${installationEnabled ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <Button
              className="bg-[#d0a760] text-black hover:bg-[#c49650] active:scale-[0.97] rounded-none h-14 text-sm font-bold shadow-[0_0_25px_rgba(208,167,96,0.4)] transition-all duration-200"
              onClick={() => addToCartMutation.mutate({ needsInstallation: false, authenticated: isAuthenticated })}
              disabled={!canAddToCart || addToCartMutation.isPending}
              data-testid="mobile-button-add-to-cart"
            >
              <ShoppingCart weight="duotone" className="w-4 h-4 mr-1.5" />
              {addToCartMutation.isPending ? "..." : "In Winkelwagen"}
            </Button>
            
            {installationEnabled && (
            <Button
              variant="outline"
              className="border-2 border-[#d0a760] text-[#d0a760] hover:bg-[#d0a760] hover:text-black active:scale-[0.97] rounded-none h-14 text-sm font-bold transition-all duration-200 flex flex-col items-center justify-center py-1"
              onClick={() => addToCartMutation.mutate({ needsInstallation: true, authenticated: isAuthenticated })}
              disabled={!canAddToCart || addToCartMutation.isPending}
              data-testid="mobile-button-add-with-installation"
            >
              <span className="flex items-center">
                <Wrench weight="duotone" className="w-3.5 h-3.5 mr-1" />
                + Installatie
              </span>
              {installationPrice && (
                <span className="text-[10px] opacity-70 font-normal">
                  €{(currentPrice + installationPrice).toFixed(0)} totaal
                </span>
              )}
            </Button>
            )}
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
