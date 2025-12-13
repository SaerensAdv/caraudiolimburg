import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollReveal, StaggerContainer } from "@/components/ScrollAnimations";
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Clock, 
  ArrowRight, 
  Mail, 
  Phone, 
  ShoppingBag,
  Wrench,
  Calendar
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function OrderConfirmationPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [location] = useLocation();

  const urlParams = new URLSearchParams(window.location.search);
  const paymentIntentId = urlParams.get('payment_intent');
  const redirectStatus = urlParams.get('redirect_status');
  
  // Handle non-succeeded payment statuses from redirect
  const paymentFailed = redirectStatus && redirectStatus !== 'succeeded';

  const { data: orderData, isLoading, isError } = useQuery({
    queryKey: ["/api/orders/by-payment-intent", paymentIntentId],
    queryFn: async () => {
      if (!paymentIntentId) throw new Error("No payment intent found");
      
      // First try to get existing order (for idempotency and card payments)
      try {
        const existingResponse = await apiRequest("GET", `/api/orders/by-payment-intent/${paymentIntentId}`);
        if (existingResponse.ok) {
          const existingOrder = await existingResponse.json();
          if (existingOrder && existingOrder.id) {
            // Order already exists, clear localStorage and return
            localStorage.removeItem('checkout_shipping_details');
            return existingOrder;
          }
        }
      } catch (e) {
        // Order doesn't exist yet, continue to create it
      }
      
      // Retrieve shipping details from localStorage (stored before redirect for iDEAL, Bancontact, etc.)
      const storedShippingDetails = localStorage.getItem('checkout_shipping_details');
      let shippingDetails = null;
      if (storedShippingDetails) {
        try {
          shippingDetails = JSON.parse(storedShippingDetails);
        } catch (e) {
          console.error('Failed to parse stored shipping details:', e);
        }
      }
      
      // Create order from redirect (iDEAL, Bancontact, etc.)
      const response = await apiRequest("POST", `/api/orders/create-from-redirect`, {
        paymentIntentId,
        shippingDetails
      });
      
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      
      const order = await response.json();
      
      // Only clear localStorage after successful order creation
      localStorage.removeItem('checkout_shipping_details');
      
      return order;
    },
    enabled: !!paymentIntentId && redirectStatus === 'succeeded',
  });

  // Show payment failed/cancelled message
  if (paymentFailed) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <ScrollReveal>
            <Card className="bg-zinc-900 border-zinc-800 p-8 md:p-12 text-center max-w-md mx-auto rounded-none">
              <div className="w-16 h-16 bg-orange-500/20 flex items-center justify-center mx-auto mb-6">
                <Package className="w-8 h-8 text-orange-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Betaling niet voltooid</h1>
              <p className="text-white/60 mb-8">
                Je betaling is niet voltooid of geannuleerd. 
                Je kunt het opnieuw proberen of een andere betaalmethode kiezen.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/checkout">
                  <Button className="bg-[#d0a760] text-black hover:bg-[#b8954e] rounded-none px-8 py-6">
                    Opnieuw proberen
                  </Button>
                </Link>
                <Link href="/shop">
                  <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800 hover:text-white rounded-none px-8 py-6">
                    Terug naar Shop
                  </Button>
                </Link>
              </div>
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
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-pulse">
              <div className="w-20 h-20 bg-zinc-800 mx-auto mb-6"></div>
              <div className="h-8 bg-zinc-800 w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-zinc-800 w-1/2 mx-auto"></div>
            </div>
            <p className="mt-6 text-white/60">Je bestelling wordt geladen...</p>
          </div>
        </div>
        <Footer />
        <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    );
  }

  if (isError || !paymentIntentId) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <ScrollReveal>
            <Card className="bg-zinc-900 border-zinc-800 p-8 md:p-12 text-center max-w-md mx-auto rounded-none">
              <div className="w-16 h-16 bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                <Package className="w-8 h-8 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Oops!</h1>
              <p className="text-white/60 mb-8">
                Er is iets misgegaan bij het verwerken van je bestelling. 
                Neem contact met ons op als je hulp nodig hebt.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/shop">
                  <Button className="bg-[#d0a760] text-black hover:bg-[#b8954e] rounded-none px-8 py-6">
                    Terug naar Shop
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800 hover:text-white rounded-none px-8 py-6">
                    Contact
                  </Button>
                </Link>
              </div>
            </Card>
          </ScrollReveal>
        </div>
        <Footer />
        <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    );
  }

  const steps = [
    {
      icon: Package,
      title: "Bestelling wordt voorbereid",
      description: "We controleren je bestelling en maken deze klaar voor verzending.",
      color: "#d0a760"
    },
    {
      icon: Truck,
      title: "Verzending",
      description: "Je ontvangt een track & trace code zodra je pakket onderweg is.",
      color: "#d0a760"
    },
    {
      icon: Wrench,
      title: "Installatie (indien van toepassing)",
      description: "Als je installatie hebt gekozen, nemen we binnen 2 werkdagen contact met je op.",
      color: "#d0a760"
    }
  ];

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header onCartOpen={() => setIsCartOpen(true)} />
      
      <div className="container px-4 md:px-8 lg:px-16 mx-auto py-12 md:py-16 flex-1">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-[#d0a760] flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-black" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Bestelling Bevestigd!</h1>
              <p className="text-white/60 text-lg">
                Dank je wel voor je bestelling. We hebben een bevestiging gestuurd naar je e-mailadres.
              </p>
            </div>
          </ScrollReveal>

          {orderData && (
            <>
              <ScrollReveal delay={100}>
                <Card className="bg-zinc-900 border-zinc-800 mb-6 rounded-none">
                  <CardHeader className="border-b border-zinc-800">
                    <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <span className="text-white text-xl">Bestelling #{orderData.orderNumber}</span>
                      <Badge className="bg-[#d0a760] text-black rounded-none px-4 py-1">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Bevestigd
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <span className="text-white/60 text-sm block mb-1">Totaal bedrag</span>
                        <p className="font-semibold text-[#d0a760] text-2xl">
                          €{parseFloat(orderData.total).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <span className="text-white/60 text-sm block mb-1">Besteldatum</span>
                        <p className="font-semibold text-white flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-[#d0a760]" />
                          {new Date(orderData.createdAt || Date.now()).toLocaleDateString('nl-NL', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {orderData.shippingAddress && (
                      <>
                        <Separator className="bg-zinc-800 my-6" />
                        <div>
                          <h3 className="font-semibold text-white mb-3 flex items-center">
                            <Truck className="w-4 h-4 mr-2 text-[#d0a760]" />
                            Leveradres
                          </h3>
                          <div className="text-white/60 bg-zinc-950 p-4 border border-zinc-800">
                            <p className="text-white font-medium">{orderData.shippingAddress.firstName} {orderData.shippingAddress.lastName}</p>
                            <p>{orderData.shippingAddress.address}</p>
                            <p>{orderData.shippingAddress.postalCode} {orderData.shippingAddress.city}</p>
                            {orderData.shippingAddress.phone && (
                              <p className="flex items-center mt-2">
                                <Phone className="w-4 h-4 mr-2" />
                                {orderData.shippingAddress.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <Card className="bg-zinc-900 border-zinc-800 mb-8 rounded-none">
                  <CardHeader className="border-b border-zinc-800">
                    <CardTitle className="text-white">Wat gebeurt er nu?</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <StaggerContainer staggerDelay={150}>
                      <div className="space-y-6">
                        {steps.map((step, index) => (
                          <div key={index} className="flex items-start space-x-4">
                            <div 
                              className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${step.color}20` }}
                            >
                              <step.icon className="w-6 h-6" style={{ color: step.color }} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white mb-1">{step.title}</h4>
                              <p className="text-sm text-white/60">{step.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </StaggerContainer>
                  </CardContent>
                </Card>
              </ScrollReveal>

              <ScrollReveal delay={300}>
                <div className="bg-zinc-900 border border-zinc-800 p-6 mb-8">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
                    <div className="w-12 h-12 bg-[#d0a760]/20 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-[#d0a760]" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Orderbevestiging verzonden</p>
                      <p className="text-white/60 text-sm">
                        Check je inbox (en spam folder) voor alle details van je bestelling.
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={400}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/shop">
                    <Button className="bg-[#d0a760] text-black hover:bg-[#b8954e] rounded-none px-8 py-6 text-lg font-semibold w-full sm:w-auto">
                      <ShoppingBag className="w-5 h-5 mr-2" />
                      Verder winkelen
                    </Button>
                  </Link>
                  <Link href="/customer-portal">
                    <Button 
                      variant="outline" 
                      className="border-zinc-700 text-white hover:bg-zinc-800 hover:text-white rounded-none px-8 py-6 text-lg w-full sm:w-auto"
                    >
                      Mijn Account
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </ScrollReveal>
            </>
          )}
        </div>
      </div>

      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
