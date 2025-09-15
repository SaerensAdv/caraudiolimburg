import { useState } from "react";
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
import { 
  X, 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  ArrowRight,
  Wrench
} from "lucide-react";
import type { CartItem } from "@shared/schema";

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
  };
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated && isOpen,
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

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItemMutation.mutate(id);
    } else {
      updateQuantityMutation.mutate({ id, quantity: newQuantity });
    }
  };

  const handleRemoveItem = (id: string) => {
    removeItemMutation.mutate(id);
  };

  // Calculate totals
  const subtotal = cartItems?.reduce((sum: number, item: CartItemWithProduct) => {
    const price = parseFloat(item.product?.price || "0");
    return sum + (price * item.quantity);
  }, 0) || 0;

  const installationFee = cartItems?.some((item: CartItem) => item.needsInstallation) ? 89 : 0;
  const shipping = subtotal >= 50 ? 0 : 5.95;
  const total = subtotal + installationFee + shipping;
  const itemCount = cartItems?.reduce((sum: number, item: CartItem) => sum + item.quantity, 0) || 0;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-96 bg-card border-l border-border p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-semibold text-card-foreground flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Winkelwagen
                {itemCount > 0 && (
                  <Badge variant="secondary" className="ml-2" data-testid="cart-item-count">
                    {itemCount}
                  </Badge>
                )}
              </SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-muted-foreground hover:text-primary"
                data-testid="button-close-cart"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </SheetHeader>

          {/* Content */}
          {!isAuthenticated ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center space-y-4" data-testid="cart-login-required">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="font-semibold text-card-foreground mb-2">Inloggen vereist</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Log in om je winkelwagen te bekijken
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/api/login'}
                    data-testid="button-login-cart"
                  >
                    Inloggen
                  </Button>
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex-1 p-6">
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-muted rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : !cartItems || cartItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center space-y-4" data-testid="cart-empty">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="font-semibold text-card-foreground mb-2">Je winkelwagen is leeg</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Voeg wat geweldige producten toe!
                  </p>
                  <Link href="/shop">
                    <Button onClick={onClose} data-testid="button-continue-shopping-empty">
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
                  {cartItems.map((item: CartItemWithProduct) => {
                    const product = item.product;
                    const price = parseFloat(product?.price || "0");
                    const originalPrice = product?.originalPrice ? parseFloat(product.originalPrice) : null;
                    
                    return (
                      <Card key={item.id} className="bg-background border-border" data-testid={`cart-item-${item.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            {/* Product Image */}
                            <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0">
                              {product?.images?.[product.primaryImageIndex || 0] ? (
                                <div 
                                  className="w-full h-full bg-cover bg-center rounded-lg"
                                  style={{ backgroundImage: `url(${product.images[product.primaryImageIndex || 0]})` }}
                                />
                              ) : (
                                <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                                  <span className="text-xs text-muted-foreground">Geen foto</span>
                                </div>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground text-sm mb-1 truncate" data-testid={`cart-product-name-${item.id}`}>
                                {product?.name || "Onbekend product"}
                              </h4>
                              
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-bold text-foreground text-sm" data-testid={`cart-product-price-${item.id}`}>
                                  €{price.toFixed(2)}
                                </span>
                                {originalPrice && (
                                  <span className="text-xs text-muted-foreground line-through">
                                    €{originalPrice.toFixed(2)}
                                  </span>
                                )}
                              </div>

                              {item.needsInstallation && (
                                <Badge variant="secondary" className="text-xs">
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
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                    disabled={updateQuantityMutation.isPending}
                                    className="w-8 h-8 p-0"
                                    data-testid={`button-decrease-cart-${item.id}`}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <span className="text-sm font-medium w-8 text-center" data-testid={`cart-quantity-${item.id}`}>
                                    {item.quantity}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                    disabled={updateQuantityMutation.isPending || (product?.stock && item.quantity >= product.stock)}
                                    className="w-8 h-8 p-0"
                                    data-testid={`button-increase-cart-${item.id}`}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveItem(item.id)}
                                  disabled={removeItemMutation.isPending}
                                  className="text-destructive hover:text-destructive p-1"
                                  data-testid={`button-remove-cart-${item.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
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
              <div className="border-t border-border p-6 space-y-4">
                {/* Order Summary */}
                <div className="space-y-2" data-testid="cart-summary">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotaal</span>
                    <span className="text-foreground" data-testid="cart-subtotal">€{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {installationFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Installatie</span>
                      <span className="text-foreground" data-testid="cart-installation-fee">€{installationFee.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Verzending</span>
                    <span className="text-foreground" data-testid="cart-shipping">
                      {shipping === 0 ? "Gratis" : `€${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-card-foreground">Totaal</span>
                    <span className="text-card-foreground" data-testid="cart-total">€{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Link href="/checkout">
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={onClose}
                      disabled={!cartItems || cartItems.length === 0}
                      data-testid="button-cart-checkout"
                    >
                      Naar Checkout
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  
                  <Link href="/cart">
                    <Button 
                      variant="outline" 
                      className="w-full border-border"
                      onClick={onClose}
                      data-testid="button-view-cart"
                    >
                      Bekijk winkelwagen
                    </Button>
                  </Link>

                  <Link href="/shop">
                    <Button 
                      variant="ghost" 
                      className="w-full"
                      onClick={onClose}
                      data-testid="button-continue-shopping"
                    >
                      Doorgaan met winkelen
                    </Button>
                  </Link>
                </div>

                {/* Free Shipping Notice */}
                {subtotal > 0 && subtotal < 50 && (
                  <div className="bg-secondary/50 border border-border rounded-lg p-3" data-testid="free-shipping-notice">
                    <p className="text-xs text-center text-muted-foreground">
                      Nog €{(50 - subtotal).toFixed(2)} voor gratis verzending!
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
