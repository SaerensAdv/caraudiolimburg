import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartSidebar } from '@/components/CartSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Wrench, 
  Lock, 
  CreditCard, 
  User, 
  MapPin, 
  Check,
  ShoppingBag,
  Truck,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import carAudioLogo from "@assets/Caraudiolimburg-logo_1757008375383_1757016657436.png";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const checkoutFormSchema = z.object({
  email: z.string().email("Ongeldig e-mailadres"),
  firstName: z.string().min(1, "Voornaam is verplicht"),
  lastName: z.string().min(1, "Achternaam is verplicht"),
  address: z.string().min(1, "Adres is verplicht"),
  city: z.string().min(1, "Stad is verplicht"),
  postalCode: z.string().min(1, "Postcode is verplicht"),
  country: z.string().min(1, "Land is verplicht"),
});

type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

const CheckoutProgress = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, label: 'Contact', icon: User },
    { id: 2, label: 'Verzending', icon: MapPin },
    { id: 3, label: 'Betaling', icon: CreditCard },
  ];

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4" data-testid="checkout-progress">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = step.id <= currentStep;
        const isCompleted = step.id < currentStep;
        
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <div 
                className={`w-10 h-10 flex items-center justify-center border-2 transition-all ${
                  isActive 
                    ? 'bg-[#d0a760] border-[#d0a760] text-black' 
                    : 'bg-transparent border-zinc-300 dark:border-zinc-700 text-muted-foreground'
                }`}
                data-testid={`progress-step-${step.id}`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span className={`hidden md:block text-sm font-medium ${
                isActive ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className={`w-5 h-5 mx-2 md:mx-4 ${
                step.id < currentStep ? 'text-[#d0a760]' : 'text-zinc-300 dark:text-zinc-700'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const CheckoutForm = ({ clientSecret, orderTotal, cartItems }: { clientSecret: string; orderTotal: number; cartItems: any[] }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      country: "Nederland",
    },
  });

  const email = watch("email");
  const firstName = watch("firstName");
  const address = watch("address");

  useEffect(() => {
    if (email && email.includes("@")) {
      setCurrentStep(2);
    }
    if (firstName && address) {
      setCurrentStep(3);
    }
  }, [email, firstName, address]);

  const onSubmit = async (data: CheckoutFormData) => {
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    // Store shipping details in localStorage for redirect-based payments (iDEAL, Bancontact, etc.)
    localStorage.setItem('checkout_shipping_details', JSON.stringify(data));

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation`,
        payment_method_data: {
          billing_details: {
            name: `${data.firstName} ${data.lastName}`,
            email: data.email,
            address: {
              line1: data.address,
              city: data.city,
              postal_code: data.postalCode,
              country: 'NL',
            },
          },
        },
      },
    });

    if (error) {
      setIsProcessing(false);
      toast({
        title: "Betaling mislukt",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        await apiRequest("POST", "/api/orders/confirm", {
          paymentIntentId: paymentIntent.id,
          shippingDetails: data,
        });

        toast({
          title: "Betaling succesvol",
          description: "Je bestelling wordt verwerkt!",
        });

        window.location.href = `/order-confirmation?payment_intent=${paymentIntent.id}&redirect_status=succeeded`;
      } catch (confirmError) {
        console.error("Order confirmation error:", confirmError);
        toast({
          title: "Bestelling fout",
          description: "Betaling gelukt, maar er was een probleem met de bestelling. Neem contact op.",
          variant: "destructive",
        });
      }
    }
    
    setIsProcessing(false);
  };

  const subtotal = cartItems.reduce((sum: number, item: any) => {
    const price = parseFloat(item.product?.price || "0");
    return sum + (price * item.quantity);
  }, 0);
  
  const installationFee = cartItems.some((item: any) => item.needsInstallation) ? 89 : 0;
  const shipping = subtotal >= 50 ? 0 : 5.95;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
      <div className="lg:col-span-7 order-2 lg:order-1">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" data-testid="checkout-form">
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8" data-testid="section-contact">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[#d0a760] flex items-center justify-center">
                <User className="w-4 h-4 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Contact informatie</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-muted-foreground text-sm mb-2 block">E-mailadres</Label>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="jouw@email.nl"
                  className="bg-background border-zinc-300 dark:border-zinc-700 text-foreground placeholder:text-muted-foreground h-12 rounded-none focus:ring-2 focus:ring-[#d0a760] focus:border-[#d0a760]"
                  data-testid="input-email"
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-2">{errors.email.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8" data-testid="section-shipping">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[#d0a760] flex items-center justify-center">
                <MapPin className="w-4 h-4 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Bezorgadres</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-muted-foreground text-sm mb-2 block">Voornaam</Label>
                <Input
                  {...register("firstName")}
                  placeholder="Jan"
                  className="bg-background border-zinc-300 dark:border-zinc-700 text-foreground placeholder:text-muted-foreground h-12 rounded-none focus:ring-2 focus:ring-[#d0a760] focus:border-[#d0a760]"
                  data-testid="input-first-name"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500 mt-2">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName" className="text-muted-foreground text-sm mb-2 block">Achternaam</Label>
                <Input
                  {...register("lastName")}
                  placeholder="Jansen"
                  className="bg-background border-zinc-300 dark:border-zinc-700 text-foreground placeholder:text-muted-foreground h-12 rounded-none focus:ring-2 focus:ring-[#d0a760] focus:border-[#d0a760]"
                  data-testid="input-last-name"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500 mt-2">{errors.lastName.message}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address" className="text-muted-foreground text-sm mb-2 block">Straat en huisnummer</Label>
                <Input
                  {...register("address")}
                  placeholder="Hoofdstraat 123"
                  className="bg-background border-zinc-300 dark:border-zinc-700 text-foreground placeholder:text-muted-foreground h-12 rounded-none focus:ring-2 focus:ring-[#d0a760] focus:border-[#d0a760]"
                  data-testid="input-address"
                />
                {errors.address && (
                  <p className="text-sm text-red-500 mt-2">{errors.address.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="postalCode" className="text-muted-foreground text-sm mb-2 block">Postcode</Label>
                <Input
                  {...register("postalCode")}
                  placeholder="1234 AB"
                  className="bg-background border-zinc-300 dark:border-zinc-700 text-foreground placeholder:text-muted-foreground h-12 rounded-none focus:ring-2 focus:ring-[#d0a760] focus:border-[#d0a760]"
                  data-testid="input-postal-code"
                />
                {errors.postalCode && (
                  <p className="text-sm text-red-500 mt-2">{errors.postalCode.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="city" className="text-muted-foreground text-sm mb-2 block">Stad</Label>
                <Input
                  {...register("city")}
                  placeholder="Sittard"
                  className="bg-background border-zinc-300 dark:border-zinc-700 text-foreground placeholder:text-muted-foreground h-12 rounded-none focus:ring-2 focus:ring-[#d0a760] focus:border-[#d0a760]"
                  data-testid="input-city"
                />
                {errors.city && (
                  <p className="text-sm text-red-500 mt-2">{errors.city.message}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="country" className="text-muted-foreground text-sm mb-2 block">Land</Label>
                <Input
                  {...register("country")}
                  className="bg-background border-zinc-300 dark:border-zinc-700 text-foreground h-12 rounded-none focus:ring-2 focus:ring-[#d0a760] focus:border-[#d0a760]"
                  data-testid="input-country"
                  disabled
                />
              </div>
            </div>
          </div>

          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8" data-testid="section-payment">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[#d0a760] flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Betaalmethode</h3>
            </div>
            <div className="mb-6">
              <PaymentElement 
                options={{
                  layout: 'tabs',
                }}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-zinc-200/50 dark:bg-black/50 p-3 border border-zinc-200 dark:border-zinc-800">
              <Lock className="w-4 h-4 text-[#d0a760]" />
              <span>Je betaalgegevens zijn veilig versleuteld met 256-bit SSL</span>
            </div>
          </div>

          <div className="hidden lg:block">
            <Button
              type="submit"
              size="lg"
              className="w-full bg-[#d0a760] hover:bg-[#b8954e] text-black font-semibold h-14 rounded-none text-lg"
              disabled={!stripe || isProcessing}
              data-testid="button-place-order"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent animate-spin" />
                  Bezig met verwerken...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  Bestelling plaatsen • €{orderTotal.toFixed(2)}
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>

      <div className="lg:col-span-5 order-1 lg:order-2">
        <div className="lg:sticky lg:top-24">
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8" data-testid="order-summary">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[#d0a760] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Bestelling overzicht</h3>
              <Badge className="ml-auto bg-zinc-200 dark:bg-zinc-800 text-muted-foreground rounded-none">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </Badge>
            </div>
            
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
              {cartItems.map((item: any) => (
                <div key={item.id} className="flex items-start gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800 last:border-0" data-testid={`summary-item-${item.id}`}>
                  <div className="w-16 h-16 bg-background flex-shrink-0 border border-zinc-200 dark:border-zinc-800">
                    <img 
                      src={item.product?.images?.[item.product.primaryImageIndex || 0] || carAudioLogo}
                      alt={item.product?.name || "Product"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = carAudioLogo;
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.product?.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Aantal: {item.quantity}
                    </p>
                    {item.needsInstallation && (
                      <Badge className="mt-2 text-xs bg-[#d0a760]/20 text-[#d0a760] border border-[#d0a760]/30 rounded-none">
                        <Wrench className="w-3 h-3 mr-1" />
                        Installatie
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-[#d0a760]">
                    €{(parseFloat(item.product?.price || "0") * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <Separator className="bg-zinc-200 dark:bg-zinc-800 my-6" />
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotaal</span>
                <span className="text-foreground">€{subtotal.toFixed(2)}</span>
              </div>
              
              {installationFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-[#d0a760]" />
                    Installatie
                  </span>
                  <span className="text-foreground">€{installationFee.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#d0a760]" />
                  Verzending
                </span>
                <span className={shipping === 0 ? "text-[#d0a760]" : "text-foreground"}>
                  {shipping === 0 ? "Gratis" : `€${shipping.toFixed(2)}`}
                </span>
              </div>
              
              <Separator className="bg-zinc-200 dark:bg-zinc-800" />
              
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-semibold text-foreground">Totaal</span>
                <span className="text-2xl font-bold text-[#d0a760]">€{orderTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-zinc-200/50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#d0a760] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Veilig & Betrouwbaar</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    30 dagen retourgarantie • Gratis verzending vanaf €50
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-zinc-200 dark:border-zinc-800 z-40">
        <Button
          type="submit"
          form="checkout-form"
          size="lg"
          className="w-full bg-[#d0a760] hover:bg-[#b8954e] text-black font-semibold h-14 rounded-none text-lg"
          disabled={!stripe || isProcessing}
          data-testid="button-place-order-mobile"
          onClick={handleSubmit(onSubmit)}
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-black border-t-transparent animate-spin" />
              Verwerken...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              Betalen • €{orderTotal.toFixed(2)}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default function Checkout() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const cartItemsArray = Array.isArray(cartItems) ? cartItems : [];

  const subtotal = cartItemsArray.reduce((sum: number, item: any) => {
    const price = parseFloat(item.product?.price || "0");
    return sum + (price * item.quantity);
  }, 0);
  
  const installationFee = cartItemsArray.some((item: any) => item.needsInstallation) ? 89 : 0;
  const shipping = subtotal >= 50 ? 0 : 5.95;
  const total = subtotal + installationFee + shipping;

  useEffect(() => {
    if (isAuthenticated && total > 0) {
      apiRequest("POST", "/api/create-payment-intent", { amount: total })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          toast({
            title: "Fout bij laden van betaling",
            description: "Probeer de pagina te verversen.",
            variant: "destructive",
          });
        });
    }
  }, [isAuthenticated, total, toast]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <div className="pt-24 pb-16">
          <div className="container px-4 mx-auto">
            <div className="max-w-md mx-auto">
              <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 md:p-12 text-center">
                <div className="w-16 h-16 bg-[#d0a760] flex items-center justify-center mx-auto mb-6">
                  <User className="w-8 h-8 text-black" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-4">Inloggen vereist</h1>
                <p className="text-muted-foreground mb-8">
                  Je moet ingelogd zijn om een bestelling te plaatsen.
                </p>
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  className="bg-[#d0a760] hover:bg-[#b8954e] text-black font-semibold h-12 px-8 rounded-none"
                  data-testid="button-login"
                >
                  Inloggen
                </Button>
              </div>
            </div>
          </div>
        </div>
        <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    );
  }

  if (!cartItems || cartItemsArray.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <div className="pt-24 pb-16">
          <div className="container px-4 mx-auto">
            <div className="max-w-md mx-auto">
              <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 md:p-12 text-center">
                <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-4">Winkelwagen is leeg</h1>
                <p className="text-muted-foreground mb-8">
                  Voeg producten toe aan je winkelwagen om door te gaan.
                </p>
                <Button 
                  onClick={() => window.location.href = '/products'}
                  className="bg-[#d0a760] hover:bg-[#b8954e] text-black font-semibold h-12 px-8 rounded-none"
                  data-testid="button-shop"
                >
                  Naar Shop
                </Button>
              </div>
            </div>
          </div>
        </div>
        <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-background">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <div className="pt-24 pb-16">
          <div className="container px-4 mx-auto">
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
              <div className="w-12 h-12 border-2 border-[#d0a760] border-t-transparent animate-spin mb-4" />
              <p className="text-muted-foreground">Betaling laden...</p>
            </div>
          </div>
        </div>
        <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onCartOpen={() => setIsCartOpen(true)} />
      
      <div className="pt-20 bg-zinc-100 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container px-4 mx-auto py-8 md:py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-light text-foreground mb-2">Checkout</h1>
            <p className="text-muted-foreground">Voltooi je bestelling veilig en eenvoudig</p>
          </div>
          <CheckoutProgress currentStep={3} />
        </div>
      </div>

      <div className="container px-4 mx-auto py-8 md:py-12 pb-32 lg:pb-12">
        {stripePromise ? (
          <Elements 
            stripe={stripePromise} 
            options={{ 
              clientSecret,
              appearance: {
                theme: 'night',
                variables: {
                  colorPrimary: '#d0a760',
                  colorBackground: '#000000',
                  colorText: '#ffffff',
                  colorDanger: '#ef4444',
                  fontFamily: 'system-ui, sans-serif',
                  borderRadius: '0px',
                  colorTextPlaceholder: '#71717a',
                },
                rules: {
                  '.Input': {
                    backgroundColor: '#000000',
                    border: '1px solid #3f3f46',
                    padding: '12px 16px',
                  },
                  '.Input:focus': {
                    border: '1px solid #d0a760',
                    boxShadow: '0 0 0 1px #d0a760',
                  },
                  '.Label': {
                    color: '#a1a1aa',
                    fontSize: '14px',
                    marginBottom: '8px',
                  },
                  '.Tab': {
                    border: '1px solid #3f3f46',
                    backgroundColor: '#18181b',
                  },
                  '.Tab:hover': {
                    backgroundColor: '#27272a',
                  },
                  '.Tab--selected': {
                    backgroundColor: '#d0a760',
                    color: '#000000',
                    border: '1px solid #d0a760',
                  },
                },
              },
            }}
          >
            <CheckoutForm clientSecret={clientSecret} orderTotal={total} cartItems={cartItemsArray} />
          </Elements>
        ) : (
          <div className="max-w-lg mx-auto">
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 md:p-12 text-center">
              <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Betaling tijdelijk niet beschikbaar</h3>
              <p className="text-muted-foreground mb-8">
                De betaalfunctionaliteit wordt momenteel geconfigureerd. Neem contact met ons op om je bestelling te plaatsen.
              </p>
              <Button 
                onClick={() => window.location.href = 'mailto:info@caraudiolimburg.shop'}
                className="bg-[#d0a760] hover:bg-[#b8954e] text-black font-semibold h-12 px-8 rounded-none"
                data-testid="button-contact"
              >
                Neem contact op
              </Button>
            </div>
          </div>
        )}
      </div>

      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
