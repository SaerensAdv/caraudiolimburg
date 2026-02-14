import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal, StaggerContainer } from "@/components/ScrollAnimations";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useGuestCart, type GuestCartItem } from "@/lib/guestCart";
import { 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  ArrowRight,
  Wrench,
  Truck,
  Shield,
  ArrowLeft,
  Lock,
  Package,
  CheckCircle,
  RefreshCw,
  CreditCard,
  ShieldCheck
} from "lucide-react";
import type { CartItem, Product } from "@shared/schema";
import carAudioLogo from "@assets/Caraudiolimburg-logo_1757008375383_1757016657436.png";

interface CartItemWithProduct extends CartItem {
  product: Product;
}

export default function Cart() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { items: guestCartItems, updateQuantity: updateGuestQuantity, removeItem: removeGuestItem } = useGuestCart();

  const { data: siteSettings } = useQuery({
    queryKey: ['/api/site-settings'],
  });
  const installationEnabled = siteSettings?.installationServiceEnabled ?? true;

  const { data: cartItems, isLoading: cartLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const { data: allProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: !isAuthenticated && guestCartItems.length > 0,
  });

  const guestCartWithProducts = useMemo(() => {
    if (isAuthenticated || !allProducts) return [];
    return guestCartItems.map(item => {
      const product = allProducts.find(p => p.id === item.productId);
      return {
        ...item,
        id: `guest-${item.productId}-${item.variationId || 'default'}`,
        product,
        variation: item.variationId ? {
          label: item.variationLabel || null,
          price: item.variationPrice || null,
        } : null,
      };
    }).filter(item => item.product);
  }, [isAuthenticated, allProducts, guestCartItems]);

  const isLoading = isAuthenticated ? cartLoading : !allProducts && guestCartItems.length > 0;
  const displayItems = isAuthenticated ? (cartItems || []) : guestCartWithProducts;

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      await apiRequest("PATCH", `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sessie verlopen",
          description: "Log opnieuw in om door te gaan.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Fout",
        description: "Kon aantal niet bijwerken.",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Product verwijderd",
        description: "Het product is uit je winkelwagen verwijderd.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sessie verlopen",
          description: "Log opnieuw in om door te gaan.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Fout",
        description: "Kon product niet verwijderen.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateQuantity = (item: any, newQuantity: number) => {
    if (isAuthenticated) {
      if (newQuantity <= 0) {
        removeItemMutation.mutate(item.id);
      } else {
        updateQuantityMutation.mutate({ id: item.id, quantity: newQuantity });
      }
    } else {
      if (newQuantity <= 0) {
        removeGuestItem(item.productId, item.variationId);
        toast({
          title: "Product verwijderd",
          description: "Het product is uit je winkelwagen verwijderd.",
        });
      } else {
        updateGuestQuantity(item.productId, newQuantity, item.variationId);
      }
    }
  };

  const handleRemoveItem = (item: any) => {
    if (isAuthenticated) {
      removeItemMutation.mutate(item.id);
    } else {
      removeGuestItem(item.productId, item.variationId);
      toast({
        title: "Product verwijderd",
        description: "Het product is uit je winkelwagen verwijderd.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <div className="container px-4 md:px-8 mx-auto py-8 flex-1">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-zinc-800/50 w-64 rounded-none"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-zinc-900/50 p-6 border border-zinc-800/50">
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 bg-zinc-800/50"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-zinc-800/50 w-48"></div>
                    <div className="h-4 bg-zinc-800/50 w-32"></div>
                  </div>
                  <div className="h-8 bg-zinc-800/50 w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
        <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    );
  }

  const totalItems = displayItems.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
  const subtotal = displayItems.reduce((sum: number, item: any) => {
    const price = item.variation?.price ? parseFloat(item.variation.price) : parseFloat(item.product?.price || "0");
    return sum + (price * item.quantity);
  }, 0) || 0;
  
  const installationFee = installationEnabled && displayItems.some((item: any) => item.needsInstallation) ? 89 : 0;
  const shipping = subtotal >= 100 ? 0 : 15;
  const total = subtotal + installationFee + shipping;
  
  const totalSavings = displayItems.reduce((sum: number, item: any) => {
    const hasVariation = !!item.variation?.price;
    const originalPrice = hasVariation 
      ? (item.variation?.originalPrice ? parseFloat(item.variation.originalPrice) : null)
      : (item.product?.originalPrice ? parseFloat(item.product.originalPrice) : null);
    const price = hasVariation ? parseFloat(item.variation.price) : parseFloat(item.product?.price || "0");
    if (originalPrice && originalPrice > price) {
      return sum + ((originalPrice - price) * item.quantity);
    }
    return sum;
  }, 0);

  if (displayItems.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <ScrollReveal>
            <Card className="bg-zinc-900/80 border-zinc-800 p-8 md:p-12 text-center max-w-md mx-auto rounded-none backdrop-blur-sm" data-testid="empty-cart">
              <div className="w-20 h-20 mx-auto mb-6 bg-zinc-800/50 flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-zinc-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">Je winkelwagen is leeg</h1>
              <p className="text-zinc-400 mb-8 leading-relaxed">
                Ontdek ons premium assortiment car audio producten en begin met winkelen!
              </p>
              <Link href="/webshop">
                <Button 
                  className="bg-[#d0a760] text-black hover:bg-[#b8954e] rounded-none px-8 py-6 text-lg font-semibold transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-[#d0a760]/20"
                  data-testid="button-continue-shopping"
                >
                  Bekijk producten
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </Card>
          </ScrollReveal>
        </div>
        <Footer />
        <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Header onCartOpen={() => setIsCartOpen(true)} />
      
      <div className="container px-4 md:px-8 lg:px-16 mx-auto py-8 md:py-12 flex-1">
        <ScrollReveal>
          <div className="mb-8">
            <Link href="/webshop">
              <Button 
                variant="ghost" 
                className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 p-0 px-2 mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Terug naar shop
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl md:text-4xl font-bold text-white">Winkelwagen</h1>
              <Badge className="bg-[#d0a760]/20 text-[#d0a760] border-[#d0a760]/30 rounded-none text-sm px-3 py-1">
                {totalItems} {totalItems === 1 ? 'product' : 'producten'}
              </Badge>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4" data-testid="cart-items">
            <StaggerContainer staggerDelay={100}>
              {displayItems.map((item: any) => {
                const product = item.product;
                const price = parseFloat(product?.price || "0");
                const originalPrice = product?.originalPrice ? parseFloat(product.originalPrice) : null;
                const hasSavings = originalPrice && originalPrice > price;
                const itemSavings = hasSavings ? (originalPrice - price) * item.quantity : 0;
                
                return (
                  <Card 
                    key={item.id} 
                    className="bg-zinc-900/80 border-zinc-800 rounded-none overflow-hidden group hover:border-zinc-700 transition-colors backdrop-blur-sm" 
                    data-testid={`cart-item-${item.id}`}
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        <Link href={`/webshop/${product?.slug || product?.id}`}>
                          <div className="w-full sm:w-32 h-40 sm:h-32 bg-zinc-800 flex-shrink-0 cursor-pointer relative overflow-hidden">
                            <img 
                              src={product?.images?.[product.primaryImageIndex || 0] || carAudioLogo}
                              alt={product?.name || "Product"}
                              width={128}
                              height={128}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.src = carAudioLogo;
                              }}
                            />
                            {hasSavings && (
                              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1">
                                -{Math.round(((originalPrice - price) / originalPrice) * 100)}%
                              </div>
                            )}
                          </div>
                        </Link>

                        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <Link href={`/webshop/${product?.slug || product?.id}`}>
                                <h3 className="font-semibold text-white text-lg hover:text-[#d0a760] transition-colors cursor-pointer leading-tight" data-testid={`product-name-${item.id}`}>
                                  {product?.name || "Onbekend product"}
                                </h3>
                              </Link>
                              {item.variation?.label && (
                                <p className="text-[#d0a760]/70 text-sm mt-0.5">{item.variation.label}</p>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(item)}
                                disabled={removeItemMutation.isPending}
                                className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 p-2 -mr-2 -mt-1 transition-colors"
                                data-testid={`button-remove-${item.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            {product?.shortDescription && (
                              <p className="text-sm text-zinc-400 mb-3 line-clamp-1">
                                {product.shortDescription}
                              </p>
                            )}

                            {installationEnabled && item.needsInstallation && (
                              <Badge className="text-xs bg-[#d0a760]/20 text-[#d0a760] border-[#d0a760]/30 rounded-none mb-3">
                                <Wrench className="w-3 h-3 mr-1" />
                                Inclusief installatie
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-end justify-between gap-4 mt-auto pt-2 border-t border-zinc-800/50">
                            <div className="flex items-center gap-1 bg-zinc-800/50 p-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                                disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                                className="w-9 h-9 p-0 text-zinc-300 hover:bg-zinc-700 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent rounded-none transition-colors"
                                data-testid={`button-decrease-${item.id}`}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-12 text-center font-semibold text-white text-lg" data-testid={`quantity-${item.id}`}>
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                                disabled={updateQuantityMutation.isPending}
                                className="w-9 h-9 p-0 text-zinc-300 hover:bg-zinc-700 hover:text-white rounded-none transition-colors"
                                data-testid={`button-increase-${item.id}`}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="text-right">
                              <div className="flex items-center gap-2 justify-end">
                                {originalPrice && (
                                  <span className="text-sm text-zinc-500 line-through">
                                    €{(originalPrice * item.quantity).toFixed(2)}
                                  </span>
                                )}
                                <p className="font-bold text-xl text-[#d0a760]" data-testid={`item-total-${item.id}`}>
                                  €{(price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                              <p className="text-xs text-zinc-500 mt-0.5" data-testid={`product-price-${item.id}`}>
                                €{price.toFixed(2)} per stuk
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </StaggerContainer>
          </div>

          <div className="space-y-6">
            <ScrollReveal delay={200}>
              <Card className="bg-zinc-900/80 border-zinc-800 rounded-none sticky top-24 backdrop-blur-sm overflow-hidden" data-testid="order-summary">
                <div className="bg-gradient-to-r from-[#d0a760]/20 to-transparent p-4 border-b border-zinc-800">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#d0a760]" />
                    Bestelling overzicht
                  </h3>
                </div>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Subtotaal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                      <span className="text-white font-medium" data-testid="subtotal">€{subtotal.toFixed(2)}</span>
                    </div>
                    
                    {installationEnabled && installationFee > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400 flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-[#d0a760]" />
                          Installatie
                        </span>
                        <span className="text-white font-medium" data-testid="installation-fee">€{installationFee.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[#d0a760]" />
                        Verzending
                      </span>
                      <span data-testid="shipping-cost">
                        {shipping === 0 ? (
                          <span className="text-green-400 font-medium flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Gratis
                          </span>
                        ) : (
                          <span className="text-white font-medium">€{shipping.toFixed(2)}</span>
                        )}
                      </span>
                    </div>
                    
                    {totalSavings > 0 && (
                      <div className="flex justify-between items-center bg-green-500/10 p-3 border border-green-500/20 -mx-2">
                        <span className="text-green-400 font-medium flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Jouw besparing
                        </span>
                        <span className="text-green-400 font-bold">-€{totalSavings.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <Separator className="bg-zinc-700 my-2" />
                    
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-white text-lg font-semibold">Totaal</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-[#d0a760]" data-testid="total">€{total.toFixed(2)}</span>
                        <p className="text-xs text-zinc-500 mt-0.5">Inclusief BTW</p>
                      </div>
                    </div>
                  </div>

                  {subtotal > 0 && subtotal < 100 && (
                    <div className="bg-[#d0a760]/10 border border-[#d0a760]/30 p-4 mt-6">
                      <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-[#d0a760] flex-shrink-0" />
                        <div>
                          <p className="text-sm text-white font-medium">
                            Nog €{(100 - subtotal).toFixed(2)} voor gratis verzending
                          </p>
                          <div className="w-full bg-zinc-700 h-1.5 mt-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-[#d0a760] h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min((subtotal / 100) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Link href="/checkout">
                    <Button 
                      className="w-full mt-6 bg-[#d0a760] text-black hover:bg-[#b8954e] rounded-none py-7 text-lg font-bold transition-all duration-200 hover:scale-[1.01] shadow-lg shadow-[#d0a760]/20 group" 
                      data-testid="button-checkout"
                    >
                      <Lock className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      Veilig afrekenen
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  
                  <div className="flex items-center justify-center gap-2 mt-4 text-zinc-500 text-xs">
                    <ShieldCheck className="w-4 h-4 text-[#d0a760]" />
                    <span>SSL beveiligde betaling</span>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <Card className="bg-zinc-900/80 border-zinc-800 rounded-none backdrop-blur-sm">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-white mb-5 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#d0a760]" />
                    Waarom bij ons kopen?
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 group">
                      <div className="w-11 h-11 bg-[#d0a760]/10 border border-[#d0a760]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#d0a760]/20 transition-colors">
                        <Truck className="w-5 h-5 text-[#d0a760]" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">Gratis verzending</p>
                        <p className="text-zinc-500 text-xs mt-0.5">Vanaf €100 bestelling</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 group">
                      <div className="w-11 h-11 bg-[#d0a760]/10 border border-[#d0a760]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#d0a760]/20 transition-colors">
                        <Shield className="w-5 h-5 text-[#d0a760]" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">2 jaar garantie</p>
                        <p className="text-zinc-500 text-xs mt-0.5">Op alle producten</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 group">
                      <div className="w-11 h-11 bg-[#d0a760]/10 border border-[#d0a760]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#d0a760]/20 transition-colors">
                        <Wrench className="w-5 h-5 text-[#d0a760]" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">Professionele installatie</p>
                        <p className="text-zinc-500 text-xs mt-0.5">Door vakkundige monteurs</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 group">
                      <div className="w-11 h-11 bg-[#d0a760]/10 border border-[#d0a760]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#d0a760]/20 transition-colors">
                        <RefreshCw className="w-5 h-5 text-[#d0a760]" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">30 dagen retour</p>
                        <p className="text-zinc-500 text-xs mt-0.5">Niet goed? Geld terug</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={350}>
              <div className="flex items-center justify-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400 text-xs">
                  <CreditCard className="w-4 h-4" />
                  <span>iDEAL</span>
                </div>
                <div className="w-px h-4 bg-zinc-700" />
                <div className="flex items-center gap-2 text-zinc-400 text-xs">
                  <CreditCard className="w-4 h-4" />
                  <span>Bancontact</span>
                </div>
                <div className="w-px h-4 bg-zinc-700" />
                <div className="flex items-center gap-2 text-zinc-400 text-xs">
                  <CreditCard className="w-4 h-4" />
                  <span>Visa/MC</span>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <Link href="/webshop">
                <Button 
                  variant="outline" 
                  className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-600 rounded-none py-6 transition-all" 
                  data-testid="button-continue-shopping"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Doorgaan met winkelen
                </Button>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </div>

      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
