import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useGuestCart, type GuestCartItem } from "@/lib/guestCart";
import { 
  X, 
  Minus, 
  Plus, 
  Trash, 
  Bag, 
  ArrowRight,
  Wrench
} from "@phosphor-icons/react";
import type { CartItem } from "@shared/schema";
import carAudioLogo from "@assets/Caraudiolimburg-logo_1757008375383_1757016657436.png";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CartItemWithProduct extends CartItem {
  product: {
    id: string;
    name: string;
    price: string;
    originalPrice?: string;
    images?: string[];
    shortDescription?: string;
    stock?: number;
    primaryImageIndex?: number;
  };
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { items: guestCartItems, updateQuantity: updateGuestQuantity, removeItem: removeGuestItem } = useGuestCart();

  const { data: siteSettings } = useQuery({
    queryKey: ['/api/site-settings'],
  });
  const installationEnabled = siteSettings?.installationServiceEnabled ?? true;

  const { data: cartItems, isLoading: cartLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated && isOpen,
  });

  const { data: allProducts } = useQuery<{ id: string; name: string; price: string; originalPrice?: string; images?: string[]; primaryImageIndex?: number; stock?: number }[]>({
    queryKey: ["/api/products"],
    enabled: !isAuthenticated && isOpen && guestCartItems.length > 0,
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

  // Calculate totals
  const subtotal = displayItems.reduce((sum: number, item: any) => {
    const price = item.variation?.price ? parseFloat(item.variation.price) : parseFloat(item.product?.price || "0");
    return sum + (price * item.quantity);
  }, 0) || 0;

  const installationFee = installationEnabled
    ? displayItems.reduce((sum: number, item: any) => {
        if (item.needsInstallation && item.product?.canHaveInstallation && item.product?.installationPrice) {
          return sum + parseFloat(item.product.installationPrice);
        }
        return sum;
      }, 0)
    : 0;
  const shipping = subtotal >= 100 ? 0 : 15;
  const total = subtotal + installationFee + shipping;
  const itemCount = displayItems.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-96 bg-black border-l border-zinc-800 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-6 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-semibold text-white flex items-center">
                <Bag className="w-5 h-5 mr-2 text-[#d0a760]" />
                Winkelwagen
                {itemCount > 0 && (
                  <Badge className="ml-2 bg-[#d0a760] text-black" data-testid="cart-item-count">
                    {itemCount}
                  </Badge>
                )}
              </SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white/60 hover:text-white hover:bg-white/10"
                data-testid="button-close-cart"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </SheetHeader>

          {/* Content */}
          {isLoading ? (
            <div className="flex-1 p-6">
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-zinc-800"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-zinc-800 w-3/4"></div>
                        <div className="h-3 bg-zinc-800 w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : displayItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center space-y-4" data-testid="cart-empty">
                <Bag className="w-12 h-12 text-white/40 mx-auto" />
                <div>
                  <h3 className="font-semibold text-white mb-2">Je winkelwagen is leeg</h3>
                  <p className="text-sm text-white/60 mb-4">
                    Voeg wat geweldige producten toe!
                  </p>
                  <Link href="/webshop">
                    <Button onClick={onClose} className="bg-[#d0a760] text-black hover:bg-[#b8954e]" data-testid="button-continue-shopping-empty">
                      Ga naar shop
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <ScrollArea className="flex-1 px-6">
                <div className="space-y-4 py-4" data-testid="cart-items-list">
                  {displayItems.map((item: any) => {
                    const product = item.product;
                    const price = parseFloat(product?.price || "0");
                    const originalPrice = product?.originalPrice ? parseFloat(product.originalPrice) : null;
                    
                    return (
                      <Card key={item.id} className="bg-zinc-900 border-zinc-800" data-testid={`cart-item-${item.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            {/* Product Image */}
                            <div className="w-16 h-16 bg-white flex-shrink-0">
                              <img 
                                src={product?.images?.[product.primaryImageIndex || 0] || carAudioLogo}
                                alt={product?.name || "Product"} 
                                width={64}
                                height={64}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.src = carAudioLogo;
                                }}
                              />
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-white text-sm mb-1 truncate" data-testid={`cart-product-name-${item.id}`}>
                                {product?.name || "Onbekend product"}
                              </h4>
                              {item.variation?.label && (
                                <p className="text-[#d0a760]/70 text-xs mb-1 truncate">
                                  {item.variation.label}
                                </p>
                              )}
                              
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-bold text-[#d0a760] text-sm" data-testid={`cart-product-price-${item.id}`}>
                                  €{(item.variation?.price ? parseFloat(item.variation.price) : price).toFixed(2)}
                                </span>
                                {originalPrice && (
                                  <span className="text-xs text-white/40 line-through">
                                    €{originalPrice.toFixed(2)}
                                  </span>
                                )}
                              </div>

                              {installationEnabled && item.needsInstallation && (
                                <Badge className="text-xs bg-[#d0a760]/20 text-[#d0a760] border-[#d0a760]/30">
                                  <Wrench className="w-3 h-3 mr-1" />
                                  + Installatie
                                </Badge>
                              )}

                              {/* Quantity Controls */}
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                                    disabled={updateQuantityMutation.isPending}
                                    className="w-8 h-8 p-0 border-zinc-700 text-white hover:bg-zinc-800 hover:text-white"
                                    data-testid={`button-decrease-cart-${item.id}`}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <span className="text-sm font-medium w-8 text-center text-white" data-testid={`cart-quantity-${item.id}`}>
                                    {item.quantity}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                                    disabled={updateQuantityMutation.isPending || !!(product?.stock && item.quantity >= product.stock)}
                                    className="w-8 h-8 p-0 border-zinc-700 text-white hover:bg-zinc-800 hover:text-white"
                                    data-testid={`button-increase-cart-${item.id}`}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveItem(item)}
                                  disabled={removeItemMutation.isPending}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1"
                                  data-testid={`button-remove-cart-${item.id}`}
                                >
                                  <Trash className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="border-t border-zinc-800 p-6 space-y-4 bg-zinc-950">
                {/* Order Summary */}
                <div className="space-y-2" data-testid="cart-summary">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Subtotaal</span>
                    <span className="text-white" data-testid="cart-subtotal">€{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {installationEnabled && installationFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Installatie</span>
                      <span className="text-white" data-testid="cart-installation-fee">€{installationFee.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Verzending</span>
                    <span className="text-white" data-testid="cart-shipping">
                      {shipping === 0 ? "Gratis" : `€${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  <Separator className="bg-zinc-800" />
                  
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-white">Totaal</span>
                    <span className="text-[#d0a760]" data-testid="cart-total">€{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Link href="/checkout">
                    <Button 
                      className="w-full bg-[#d0a760] text-black hover:bg-[#b8954e]" 
                      size="lg"
                      onClick={onClose}
                      disabled={displayItems.length === 0}
                      data-testid="button-cart-checkout"
                    >
                      Naar Checkout
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  
                  <Link href="/cart">
                    <Button 
                      variant="outline" 
                      className="w-full border-zinc-700 text-white hover:bg-zinc-800 hover:text-white"
                      onClick={onClose}
                      data-testid="button-view-cart"
                    >
                      Bekijk winkelwagen
                    </Button>
                  </Link>

                  <Link href="/webshop">
                    <Button 
                      variant="ghost" 
                      className="w-full text-white/60 hover:text-white hover:bg-white/5"
                      onClick={onClose}
                      data-testid="button-continue-shopping"
                    >
                      Doorgaan met winkelen
                    </Button>
                  </Link>
                </div>

                {/* Free Shipping Notice */}
                {subtotal > 0 && subtotal < 100 && (
                  <div className="bg-[#d0a760]/10 border border-[#d0a760]/30 p-3" data-testid="free-shipping-notice">
                    <p className="text-xs text-center text-[#d0a760]">
                      Nog €{(100 - subtotal).toFixed(2)} voor gratis verzending!
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
