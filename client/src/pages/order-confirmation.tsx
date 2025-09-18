import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Package, Truck, Clock, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function OrderConfirmationPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [location] = useLocation();
  const [order, setOrder] = useState<any>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  // Extract payment intent from URL
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const paymentIntentId = urlParams.get('payment_intent');
  const redirectStatus = urlParams.get('redirect_status');

  const confirmOrderMutation = useMutation({
    mutationFn: async () => {
      if (!paymentIntentId) throw new Error("No payment intent found");
      return await apiRequest("POST", "/api/orders/confirm", {
        paymentIntentId
      });
    },
    onSuccess: (data: any) => {
      setOrder(data.order);
      setConfirmationSent(true);
    },
    onError: (error) => {
      console.error("Error confirming order:", error);
    }
  });

  useEffect(() => {
    if (paymentIntentId && redirectStatus === 'succeeded' && !confirmationSent) {
      confirmOrderMutation.mutate();
    }
  }, [paymentIntentId, redirectStatus, confirmationSent]);

  if (confirmOrderMutation.isPending) {
    return (
      <div className="min-h-screen bg-background">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <div className="container px-4 mx-auto py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4"></div>
              <div className="h-8 bg-muted rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            </div>
            <p className="mt-4 text-muted-foreground">Je bestelling wordt verwerkt...</p>
          </div>
        </div>
      </div>
    );
  }

  if (confirmOrderMutation.isError || !paymentIntentId) {
    return (
      <div className="min-h-screen bg-background">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <div className="container px-4 mx-auto py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="bg-card border-border p-8">
              <CardContent>
                <h1 className="text-2xl font-bold text-card-foreground mb-4">Oops!</h1>
                <p className="text-muted-foreground mb-6">
                  Er is iets misgegaan bij het verwerken van je bestelling. 
                  Neem contact met ons op als je hulp nodig hebt.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => window.location.href = '/shop'}>
                    Terug naar Shop
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/contact'}>
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onCartOpen={() => setIsCartOpen(true)} />
      
      <div className="container px-4 mx-auto py-8">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Bestelling Bevestigd!</h1>
            <p className="text-muted-foreground">
              Dank je wel voor je bestelling. We hebben een bevestiging gestuurd naar je e-mailadres.
            </p>
          </div>

          {order && (
            <>
              {/* Order Details */}
              <Card className="bg-card border-border mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Bestelling #{order.orderNumber}</span>
                    <Badge variant="default" className="bg-green-600 text-white">
                      Bevestigd
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Totaal bedrag:</span>
                        <p className="font-semibold">€{parseFloat(order.totalAmount).toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Besteldatum:</span>
                        <p className="font-semibold">
                          {new Date(order.createdAt || Date.now()).toLocaleDateString('nl-NL')}
                        </p>
                      </div>
                    </div>

                    {order.shippingAddress && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="font-semibold mb-2">Leveradres</h3>
                          <div className="text-sm text-muted-foreground">
                            <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                            <p>{order.shippingAddress.address}</p>
                            <p>{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
                            {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* What's Next */}
              <Card className="bg-card border-border mb-6">
                <CardHeader>
                  <CardTitle>Wat gebeurt er nu?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Bestelling wordt voorbereid</h4>
                        <p className="text-sm text-muted-foreground">
                          We controleren je bestelling en maken deze klaar voor verzending.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <Truck className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Verzending</h4>
                        <p className="text-sm text-muted-foreground">
                          Je ontvangt een track & trace code zodra je pakket onderweg is.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Installatie (indien van toepassing)</h4>
                        <p className="text-sm text-muted-foreground">
                          Als je installatie hebt gekozen, nemen we binnen 2 werkdagen contact met je op.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-4 justify-center">
                <Button onClick={() => window.location.href = '/shop'}>
                  Verder winkelen
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/my-account'}>
                  Mijn Account
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}