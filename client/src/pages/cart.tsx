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
  Shield
} from "lucide-react";
import type { CartItem, Product } from "@shared/schema";

interface CartItemWithProduct extends CartItem {
  product: Product;
}

export default function Cart() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItems, isLoading } = useQuery({
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
      <div className="min-h-screen bg-background">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <div className="container px-4 mx-auto py-16">
          <Card className="bg-card border-border p-12 text-center max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-card-foreground mb-4">Inloggen vereist</h1>
            <p className="text-muted-foreground mb-6">
              Je moet ingelogd zijn om je winkelwagen te bekijken.
            </p>
            <Button onClick={() => window.location.href = '/api/login'} data-testid="button-login">
              Inloggen
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <div className="container px-4 mx-auto py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 bg-muted rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-48"></div>
                    <div className="h-4 bg-muted rounded w-32"></div>
                  </div>
                  <div className="h-8 bg-muted rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
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
      <div className="min-h-screen bg-background">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <div className="container px-4 mx-auto py-16">
          <Card className="bg-card border-border p-12 text-center max-w-md mx-auto" data-testid="empty-cart">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-card-foreground mb-4">Je winkelwagen is leeg</h1>
            <p className="text-muted-foreground mb-6">
              Voeg wat geweldige car audio producten toe om te beginnen!
            </p>
            <Link href="/shop">
              <Button data-testid="button-continue-shopping">
                Doorgaan met winkelen
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onCartOpen={() => setIsCartOpen(true)} />
      
      <div className="container px-4 mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Winkelwagen</h1>
          <p className="text-muted-foreground">
            {totalItems} {totalItems === 1 ? 'product' : 'producten'} in je winkelwagen
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4" data-testid="cart-items">
            {cartItems.map((item: any) => {
              const product = item.product;
              const price = parseFloat(product?.price || "0");
              const originalPrice = product?.originalPrice ? parseFloat(product.originalPrice) : null;
              
              return (
                <Card key={item.id} className="bg-card border-border" data-testid={`cart-item-${item.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0">
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

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-card-foreground mb-1" data-testid={`product-name-${item.id}`}>
                          {product?.name || "Onbekend product"}
                        </h3>
                        {product?.shortDescription && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {product.shortDescription}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-bold text-foreground" data-testid={`product-price-${item.id}`}>
                            €{price.toFixed(2)}
                          </span>
                          {originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              €{originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {item.needsInstallation && (
                          <Badge variant="secondary" className="text-xs">
                            <Wrench className="w-3 h-3 mr-1" />
                            Inclusief installatie
                          </Badge>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantityMutation.mutate({ id: item.id, quantity: item.quantity - 1 })}
                          disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                          data-testid={`button-decrease-${item.id}`}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-12 text-center font-medium" data-testid={`quantity-${item.id}`}>
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantityMutation.mutate({ id: item.id, quantity: item.quantity + 1 })}
                          disabled={updateQuantityMutation.isPending}
                          data-testid={`button-increase-${item.id}`}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Total Price */}
                      <div className="text-right">
                        <p className="font-bold text-foreground" data-testid={`item-total-${item.id}`}>
                          €{(price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItemMutation.mutate(item.id)}
                        disabled={removeItemMutation.isPending}
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-remove-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="bg-card border-border" data-testid="order-summary">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">Bestelling overzicht</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotaal</span>
                    <span className="text-foreground" data-testid="subtotal">€{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {installationFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Installatie</span>
                      <span className="text-foreground" data-testid="installation-fee">€{installationFee.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Verzending</span>
                    <span className="text-foreground" data-testid="shipping-cost">
                      {shipping === 0 ? "Gratis" : `€${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-card-foreground">Totaal</span>
                    <span className="text-card-foreground" data-testid="total">€{total.toFixed(2)}</span>
                  </div>
                </div>

                <Link href="/checkout">
                  <Button className="w-full mt-6" size="lg" data-testid="button-checkout">
                    Doorgaan naar betaling
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h4 className="font-semibold text-card-foreground mb-4">Waarom bij ons kopen?</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Truck className="w-4 h-4 text-primary" />
                    <span className="text-sm text-card-foreground">Gratis verzending vanaf €50</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-sm text-card-foreground">2 jaar garantie op alle producten</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Wrench className="w-4 h-4 text-primary" />
                    <span className="text-sm text-card-foreground">Professionele installatie service</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Continue Shopping */}
            <Link href="/shop">
              <Button variant="outline" className="w-full" data-testid="button-continue-shopping">
                Doorgaan met winkelen
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
