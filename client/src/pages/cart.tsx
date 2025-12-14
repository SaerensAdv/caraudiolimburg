import { useState } from "react";
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
  Lock
} from "lucide-react";
import type { CartItem, Product } from "@shared/schema";
import carAudioLogo from "@assets/Caraudiolimburg-logo_1757008375383_1757016657436.png";

interface CartItemWithProduct extends CartItem {
  product: Product;
}

export default function Cart() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItems, isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <ScrollReveal>
            <Card className="bg-zinc-900 border-zinc-800 p-8 md:p-12 text-center max-w-md mx-auto rounded-none">
              <ShoppingBag className="w-16 h-16 text-[#d0a760] mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-white mb-4">Inloggen vereist</h1>
              <p className="text-white/60 mb-8">
                Je moet ingelogd zijn om je winkelwagen te bekijken.
              </p>
              <Button 
                onClick={() => window.location.href = '/api/login'} 
                className="bg-[#d0a760] text-black hover:bg-[#b8954e] rounded-none px-8 py-6 text-lg font-semibold"
                data-testid="button-login"
              >
                Inloggen
              </Button>
            </Card>
          </ScrollReveal>
        </div>
        <Footer />
        <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <div className="container px-4 md:px-8 mx-auto py-8 flex-1">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-zinc-800 w-64 rounded-none"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-zinc-900 p-6 border border-zinc-800">
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 bg-zinc-800"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-zinc-800 w-48"></div>
                    <div className="h-4 bg-zinc-800 w-32"></div>
                  </div>
                  <div className="h-8 bg-zinc-800 w-24"></div>
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

  const totalItems = cartItems?.reduce((sum: number, item: CartItem) => sum + item.quantity, 0) || 0;
  const subtotal = cartItems?.reduce((sum: number, item: any) => {
    const price = parseFloat(item.product?.price || "0");
    return sum + (price * item.quantity);
  }, 0) || 0;
  
  const installationFee = cartItems?.some((item: CartItem) => item.needsInstallation) ? 89 : 0;
  const shipping = subtotal >= 50 ? 0 : 5.95;
  const total = subtotal + installationFee + shipping;

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <ScrollReveal>
            <Card className="bg-zinc-900 border-zinc-800 p-8 md:p-12 text-center max-w-md mx-auto rounded-none" data-testid="empty-cart">
              <ShoppingBag className="w-16 h-16 text-white/40 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-white mb-4">Je winkelwagen is leeg</h1>
              <p className="text-white/60 mb-8">
                Voeg wat geweldige car audio producten toe om te beginnen!
              </p>
              <Link href="/shop">
                <Button 
                  className="bg-[#d0a760] text-black hover:bg-[#b8954e] rounded-none px-8 py-6 text-lg font-semibold"
                  data-testid="button-continue-shopping"
                >
                  Doorgaan met winkelen
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
    <div className="min-h-screen bg-black flex flex-col">
      <Header onCartOpen={() => setIsCartOpen(true)} />
      
      <div className="container px-4 md:px-8 lg:px-16 mx-auto py-8 md:py-12 flex-1">
        <ScrollReveal>
          <div className="mb-8">
            <Link href="/shop">
              <Button 
                variant="ghost" 
                className="text-white/60 hover:text-white hover:bg-transparent p-0 mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Terug naar shop
              </Button>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Winkelwagen</h1>
            <p className="text-white/60">
              {totalItems} {totalItems === 1 ? 'product' : 'producten'} in je winkelwagen
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4" data-testid="cart-items">
            <StaggerContainer staggerDelay={100}>
              {cartItems.map((item: any) => {
                const product = item.product;
                const price = parseFloat(product?.price || "0");
                const originalPrice = product?.originalPrice ? parseFloat(product.originalPrice) : null;
                
                return (
                  <Card key={item.id} className="bg-zinc-900 border-zinc-800 rounded-none" data-testid={`cart-item-${item.id}`}>
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <Link href={`/product/${product?.id}`}>
                          <div className="w-full sm:w-24 h-32 sm:h-24 bg-zinc-800 flex-shrink-0 cursor-pointer">
                            <img 
                              src={product?.images?.[product.primaryImageIndex || 0] || carAudioLogo}
                              alt={product?.name || "Product"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = carAudioLogo;
                              }}
                            />
                          </div>
                        </Link>

                        <div className="flex-1 min-w-0 w-full">
                          <Link href={`/product/${product?.id}`}>
                            <h3 className="font-semibold text-white mb-1 hover:text-[#d0a760] transition-colors cursor-pointer" data-testid={`product-name-${item.id}`}>
                              {product?.name || "Onbekend product"}
                            </h3>
                          </Link>
                          {product?.shortDescription && (
                            <p className="text-sm text-white/60 mb-2 line-clamp-1">
                              {product.shortDescription}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-bold text-[#d0a760]" data-testid={`product-price-${item.id}`}>
                              €{price.toFixed(2)}
                            </span>
                            {originalPrice && (
                              <span className="text-sm text-white/40 line-through">
                                €{originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>

                          {item.needsInstallation && (
                            <Badge className="text-xs bg-[#d0a760]/20 text-[#d0a760] border-[#d0a760]/30 rounded-none">
                              <Wrench className="w-3 h-3 mr-1" />
                              + Installatie
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantityMutation.mutate({ id: item.id, quantity: item.quantity - 1 })}
                              disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                              className="w-8 h-8 p-0 border-zinc-700 text-white hover:bg-zinc-800 hover:text-white rounded-none"
                              data-testid={`button-decrease-${item.id}`}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-10 text-center font-medium text-white" data-testid={`quantity-${item.id}`}>
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantityMutation.mutate({ id: item.id, quantity: item.quantity + 1 })}
                              disabled={updateQuantityMutation.isPending}
                              className="w-8 h-8 p-0 border-zinc-700 text-white hover:bg-zinc-800 hover:text-white rounded-none"
                              data-testid={`button-increase-${item.id}`}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          <p className="font-bold text-white min-w-[80px] text-right" data-testid={`item-total-${item.id}`}>
                            €{(price * item.quantity).toFixed(2)}
                          </p>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItemMutation.mutate(item.id)}
                            disabled={removeItemMutation.isPending}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2"
                            data-testid={`button-remove-${item.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
              <Card className="bg-zinc-900 border-zinc-800 rounded-none sticky top-24" data-testid="order-summary">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Bestelling overzicht</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Subtotaal</span>
                      <span className="text-white" data-testid="subtotal">€{subtotal.toFixed(2)}</span>
                    </div>
                    
                    {installationFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Installatie</span>
                        <span className="text-white" data-testid="installation-fee">€{installationFee.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Verzending</span>
                      <span className="text-white" data-testid="shipping-cost">
                        {shipping === 0 ? (
                          <span className="text-green-400">Gratis</span>
                        ) : (
                          `€${shipping.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    
                    <Separator className="bg-zinc-800" />
                    
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-white">Totaal</span>
                      <span className="text-[#d0a760]" data-testid="total">€{total.toFixed(2)}</span>
                    </div>
                  </div>

                  {subtotal > 0 && subtotal < 50 && (
                    <div className="bg-[#d0a760]/10 border border-[#d0a760]/30 p-3 mt-4">
                      <p className="text-xs text-center text-[#d0a760]">
                        Nog €{(50 - subtotal).toFixed(2)} voor gratis verzending!
                      </p>
                    </div>
                  )}

                  <Link href="/checkout">
                    <Button 
                      className="w-full mt-6 bg-[#d0a760] text-black hover:bg-[#b8954e] rounded-none py-6 text-lg font-semibold" 
                      data-testid="button-checkout"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Veilig afrekenen
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <Card className="bg-zinc-900 border-zinc-800 rounded-none">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-white mb-4">Waarom bij ons kopen?</h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#d0a760]/20 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-[#d0a760]" />
                      </div>
                      <span className="text-sm text-white">Gratis verzending vanaf €50</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#d0a760]/20 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-[#d0a760]" />
                      </div>
                      <span className="text-sm text-white">2 jaar garantie op alle producten</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#d0a760]/20 flex items-center justify-center">
                        <Wrench className="w-5 h-5 text-[#d0a760]" />
                      </div>
                      <span className="text-sm text-white">Professionele installatie service</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <Link href="/shop">
                <Button 
                  variant="outline" 
                  className="w-full border-zinc-700 text-white hover:bg-zinc-800 hover:text-white rounded-none py-6" 
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
