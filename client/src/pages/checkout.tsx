import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartSidebar } from '@/components/CartSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Wrench, Lock, CreditCard } from 'lucide-react';

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

const CheckoutForm = ({ clientSecret, orderTotal }: { clientSecret: string; orderTotal: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      country: "Nederland",
    },
  });

  const onSubmit = async (data: CheckoutFormData) => {
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
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

    setIsProcessing(false);

    if (error) {
      toast({
        title: "Betaling mislukt",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Betaling succesvol",
        description: "Je bestelling wordt verwerkt!",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" data-testid="checkout-form">
      {/* Contact Information */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Contact informatie</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">E-mailadres</Label>
              <Input
                {...register("email")}
                type="email"
                className="bg-input border-border"
                data-testid="input-email"
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Bezorgadres</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Voornaam</Label>
              <Input
                {...register("firstName")}
                className="bg-input border-border"
                data-testid="input-first-name"
              />
              {errors.firstName && (
                <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Achternaam</Label>
              <Input
                {...register("lastName")}
                className="bg-input border-border"
                data-testid="input-last-name"
              />
              {errors.lastName && (
                <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="address">Adres</Label>
              <Input
                {...register("address")}
                className="bg-input border-border"
                data-testid="input-address"
              />
              {errors.address && (
                <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="city">Stad</Label>
              <Input
                {...register("city")}
                className="bg-input border-border"
                data-testid="input-city"
              />
              {errors.city && (
                <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="postalCode">Postcode</Label>
              <Input
                {...register("postalCode")}
                className="bg-input border-border"
                data-testid="input-postal-code"
              />
              {errors.postalCode && (
                <p className="text-sm text-destructive mt-1">{errors.postalCode.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Betaling
          </h3>
          <div className="mb-4">
            <PaymentElement />
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span>Je betaalgegevens zijn veilig versleuteld</span>
          </div>
        </CardContent>
      </Card>

      {/* Place Order */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!stripe || isProcessing}
        data-testid="button-place-order"
      >
        {isProcessing ? "Bezig met verwerken..." : `Bestelling plaatsen • €${orderTotal.toFixed(2)}`}
      </Button>
    </form>
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

  const subtotal = cartItems?.reduce((sum: number, item: any) => {
    const price = parseFloat(item.product?.price || "0");
    return sum + (price * item.quantity);
  }, 0) || 0;
  
  const installationFee = cartItems?.some((item: any) => item.needsInstallation) ? 89 : 0;
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
        <div className="container px-4 mx-auto py-16">
          <Card className="bg-card border-border p-12 text-center max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-card-foreground mb-4">Inloggen vereist</h1>
            <p className="text-muted-foreground mb-6">
              Je moet ingelogd zijn om een bestelling te plaatsen.
            </p>
            <Button onClick={() => window.location.href = '/api/login'}>
              Inloggen
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <div className="container px-4 mx-auto py-16">
          <Card className="bg-card border-border p-12 text-center max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-card-foreground mb-4">Winkelwagen is leeg</h1>
            <p className="text-muted-foreground mb-6">
              Voeg producten toe aan je winkelwagen om door te gaan.
            </p>
            <Button onClick={() => window.location.href = '/shop'}>
              Naar shop
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-background">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <div className="container px-4 mx-auto py-16">
          <div className="h-screen flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onCartOpen={() => setIsCartOpen(true)} />
      
      <div className="container px-4 mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Checkout</h1>
          <p className="text-muted-foreground">Voltooi je bestelling veilig en eenvoudig</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            {stripePromise ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm clientSecret={clientSecret} orderTotal={total} />
              </Elements>
            ) : (
              <Card className="bg-card border-border p-8">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">Betaling tijdelijk niet beschikbaar</h3>
                <p className="text-muted-foreground mb-4">
                  De betaalfunctionaliteit wordt momenteel geconfigureerd. Neem contact met ons op om je bestelling te plaatsen.
                </p>
                <Button 
                  onClick={() => window.location.href = 'mailto:info@caraudiolimburg.shop'}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Neem contact op
                </Button>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="bg-card border-border" data-testid="order-summary">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">Bestelling overzicht</h3>
                
                <div className="space-y-4 mb-6">
                  {cartItems.map((item: any) => (
                    <div key={item.id} className="flex items-center space-x-3" data-testid={`summary-item-${item.id}`}>
                      <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0">
                        {item.product?.images?.[0] && (
                          <div 
                            className="w-full h-full bg-cover bg-center rounded-lg"
                            style={{ backgroundImage: `url(${item.product.images[0]})` }}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-card-foreground">
                          {item.product?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Aantal: {item.quantity}
                        </p>
                        {item.needsInstallation && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            <Wrench className="w-3 h-3 mr-1" />
                            + Installatie
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-card-foreground">
                        €{(parseFloat(item.product?.price || "0") * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotaal</span>
                    <span className="text-foreground">€{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {installationFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Installatie</span>
                      <span className="text-foreground">€{installationFee.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Verzending</span>
                    <span className="text-foreground">
                      {shipping === 0 ? "Gratis" : `€${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-card-foreground">Totaal</span>
                    <span className="text-card-foreground">€{total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
