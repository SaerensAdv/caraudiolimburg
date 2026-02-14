import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState, useMemo, useRef } from 'react';
import { SEO } from '@/components/SEO';
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
import { useGuestCart, clearGuestCart } from '@/lib/guestCart';
import type { Product } from '@shared/schema';
import { trackBeginCheckout } from '@/lib/dataLayer';
import { 
  Wrench, 
  Lock, 
  CreditCard, 
  User, 
  MapPin, 
  Check,
  Bag as ShoppingBag,
  Truck,
  CaretRight as ChevronRight,
  ShieldCheck,
  WarningCircle as AlertCircle,
  CheckCircle,
  Package,
  ArrowClockwise as RefreshCw,
  Shield
} from '@phosphor-icons/react';
import carAudioLogo from "@assets/Caraudiolimburg-logo_1757008375383_1757016657436.webp";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const checkoutFormSchema = z.object({
  email: z.string().email("Voer een geldig e-mailadres in"),
  firstName: z.string().min(1, "Voornaam is verplicht").min(2, "Voornaam moet minimaal 2 karakters zijn"),
  lastName: z.string().min(1, "Achternaam is verplicht").min(2, "Achternaam moet minimaal 2 karakters zijn"),
  address: z.string().min(1, "Adres is verplicht").min(5, "Voer een volledig adres in"),
  city: z.string().min(1, "Stad is verplicht").min(2, "Stad moet minimaal 2 karakters zijn"),
  postalCode: z.string().min(1, "Postcode is verplicht").regex(/^[1-9][0-9]{3}\s?[A-Za-z]{2}$/, "Voer een geldige postcode in (bijv. 1234 AB)"),
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
                className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border-2 transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#d0a760] border-[#d0a760] text-black shadow-lg shadow-[#d0a760]/20' 
                    : 'bg-transparent border-zinc-700 text-zinc-500'
                }`}
                data-testid={`progress-step-${step.id}`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 md:w-6 md:h-6" />
                ) : (
                  <Icon className="w-5 h-5 md:w-6 md:h-6" />
                )}
              </div>
              <span className={`hidden md:block text-sm font-medium transition-colors ${
                isActive ? 'text-white' : 'text-zinc-500'
              }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 md:w-16 h-0.5 mx-2 md:mx-4 transition-colors ${
                step.id < currentStep ? 'bg-[#d0a760]' : 'bg-zinc-700'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const FormField = ({ 
  label, 
  error, 
  children,
  required = true 
}: { 
  label: string; 
  error?: string; 
  children: React.ReactNode;
  required?: boolean;
}) => (
  <div className="space-y-2">
    <Label className="text-zinc-300 text-sm font-medium flex items-center gap-1">
      {label}
      {required && <span className="text-[#d0a760]">*</span>}
    </Label>
    {children}
    {error && (
      <div className="flex items-center gap-2 text-red-400 text-sm mt-1.5 animate-in slide-in-from-top-1 duration-200">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>{error}</span>
      </div>
    )}
  </div>
);

const CheckoutForm = ({ clientSecret, orderTotal, cartItems, isGuest = false }: { clientSecret: string; orderTotal: number; cartItems: any[]; isGuest?: boolean }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    watch,
    trigger,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      country: "Nederland",
    },
    mode: "onBlur",
  });

  const checkoutTrackedRef = useRef(false);
  useEffect(() => {
    if (checkoutTrackedRef.current || !cartItems || cartItems.length === 0) return;
    checkoutTrackedRef.current = true;
    trackBeginCheckout(
      cartItems.map((item: any) => ({
        id: item.product?.id || item.productId,
        name: item.product?.name || '',
        price: item.variationPrice || item.product?.price || '0',
        quantity: item.quantity,
        sku: item.product?.sku,
      })),
      orderTotal,
    );
  }, [cartItems, orderTotal]);

  const email = watch("email");
  const firstName = watch("firstName");
  const lastName = watch("lastName");
  const address = watch("address");
  const city = watch("city");
  const postalCode = watch("postalCode");

  useEffect(() => {
    if (email && email.includes("@") && !errors.email) {
      setCurrentStep(2);
    }
    if (firstName && lastName && address && city && postalCode && !errors.firstName && !errors.lastName && !errors.address && !errors.city && !errors.postalCode) {
      setCurrentStep(3);
    }
  }, [email, firstName, lastName, address, city, postalCode, errors]);

  const onSubmit = async (data: CheckoutFormData) => {
    if (!stripe || !elements) {
      return;
    }

    if (!acceptedTerms) {
      toast({
        title: "Voorwaarden accepteren",
        description: "Accepteer de algemene voorwaarden om door te gaan.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    localStorage.setItem('checkout_shipping_details', JSON.stringify(data));
    localStorage.setItem('checkout_is_guest', isGuest ? 'true' : 'false');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation${isGuest ? '?guest=true' : ''}`,
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
        const confirmEndpoint = isGuest ? "/api/guest-orders/confirm" : "/api/orders/confirm";
        await apiRequest("POST", confirmEndpoint, {
          paymentIntentId: paymentIntent.id,
          shippingDetails: data,
          guestEmail: isGuest ? data.email : undefined,
        });

        toast({
          title: "Betaling succesvol",
          description: "Je bestelling wordt verwerkt!",
        });

        if (isGuest) {
          clearGuestCart();
        }

        window.location.href = `/order-confirmation?payment_intent=${paymentIntent.id}&redirect_status=succeeded${isGuest ? '&guest=true' : ''}`;
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
  
  const { data: siteSettings } = useQuery({
    queryKey: ['/api/site-settings'],
  });
  const installationEnabled = siteSettings?.installationServiceEnabled ?? true;
  const installationFee = installationEnabled && cartItems.some((item: any) => item.needsInstallation) ? 89 : 0;
  const shipping = subtotal >= 100 ? 0 : 15;

  const totalItems = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);

  const inputBaseClasses = "bg-black border-zinc-700 text-white placeholder:text-zinc-500 h-12 rounded-none transition-all duration-200 focus:ring-2 focus:ring-[#d0a760] focus:border-[#d0a760] focus:bg-zinc-900/50";
  const inputErrorClasses = "border-red-500/50 focus:ring-red-500/50 focus:border-red-500";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
      <div className="lg:col-span-7 order-2 lg:order-1">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" data-testid="checkout-form">
          <div className="bg-zinc-900/80 border border-zinc-800 p-6 md:p-8 backdrop-blur-sm" data-testid="section-contact">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 flex items-center justify-center transition-colors ${
                currentStep >= 1 ? 'bg-[#d0a760]' : 'bg-zinc-800'
              }`}>
                {currentStep > 1 ? (
                  <Check className="w-5 h-5 text-black" />
                ) : (
                  <User className="w-5 h-5 text-black" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Contact informatie</h3>
                <p className="text-xs text-zinc-500">Voor bevestiging en updates over je bestelling</p>
              </div>
            </div>
            <FormField label="E-mailadres" error={errors.email?.message}>
              <Input
                {...register("email")}
                type="email"
                placeholder="jouw@email.nl"
                className={`${inputBaseClasses} ${errors.email ? inputErrorClasses : ''}`}
                data-testid="input-email"
              />
            </FormField>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 p-6 md:p-8 backdrop-blur-sm" data-testid="section-shipping">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 flex items-center justify-center transition-colors ${
                currentStep >= 2 ? 'bg-[#d0a760]' : 'bg-zinc-800'
              }`}>
                {currentStep > 2 ? (
                  <Check className="w-5 h-5 text-black" />
                ) : (
                  <MapPin className={`w-5 h-5 ${currentStep >= 2 ? 'text-black' : 'text-zinc-500'}`} />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Bezorgadres</h3>
                <p className="text-xs text-zinc-500">Waar mogen we je bestelling bezorgen?</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="Voornaam" error={errors.firstName?.message}>
                <Input
                  {...register("firstName")}
                  placeholder="Jan"
                  className={`${inputBaseClasses} ${errors.firstName ? inputErrorClasses : ''}`}
                  data-testid="input-first-name"
                />
              </FormField>
              <FormField label="Achternaam" error={errors.lastName?.message}>
                <Input
                  {...register("lastName")}
                  placeholder="Jansen"
                  className={`${inputBaseClasses} ${errors.lastName ? inputErrorClasses : ''}`}
                  data-testid="input-last-name"
                />
              </FormField>
              <div className="md:col-span-2">
                <FormField label="Straat en huisnummer" error={errors.address?.message}>
                  <Input
                    {...register("address")}
                    placeholder="Hoofdstraat 123"
                    className={`${inputBaseClasses} ${errors.address ? inputErrorClasses : ''}`}
                    data-testid="input-address"
                  />
                </FormField>
              </div>
              <FormField label="Postcode" error={errors.postalCode?.message}>
                <Input
                  {...register("postalCode")}
                  placeholder="1234 AB"
                  className={`${inputBaseClasses} ${errors.postalCode ? inputErrorClasses : ''}`}
                  data-testid="input-postal-code"
                />
              </FormField>
              <FormField label="Stad" error={errors.city?.message}>
                <Input
                  {...register("city")}
                  placeholder="Sittard"
                  className={`${inputBaseClasses} ${errors.city ? inputErrorClasses : ''}`}
                  data-testid="input-city"
                />
              </FormField>
              <div className="md:col-span-2">
                <FormField label="Land" error={errors.country?.message} required={false}>
                  <Input
                    {...register("country")}
                    className={`${inputBaseClasses} bg-zinc-800/50 cursor-not-allowed`}
                    data-testid="input-country"
                    disabled
                  />
                </FormField>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 p-6 md:p-8 backdrop-blur-sm" data-testid="section-payment">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 flex items-center justify-center transition-colors ${
                currentStep >= 3 ? 'bg-[#d0a760]' : 'bg-zinc-800'
              }`}>
                <CreditCard className={`w-5 h-5 ${currentStep >= 3 ? 'text-black' : 'text-zinc-500'}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Betaalmethode</h3>
                <p className="text-xs text-zinc-500">Kies je favoriete betaalmethode</p>
              </div>
            </div>
            <div className="mb-6">
              <PaymentElement 
                options={{
                  layout: 'tabs',
                }}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
              <div className="flex items-center gap-3 p-3 bg-black/50 border border-zinc-800">
                <Lock className="w-5 h-5 text-[#d0a760]" />
                <div>
                  <p className="text-xs text-white font-medium">256-bit SSL</p>
                  <p className="text-xs text-zinc-500">Versleutelde verbinding</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-black/50 border border-zinc-800">
                <ShieldCheck className="w-5 h-5 text-[#d0a760]" />
                <div>
                  <p className="text-xs text-white font-medium">Stripe Beveiliging</p>
                  <p className="text-xs text-zinc-500">PCI-DSS gecertificeerd</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 p-6 backdrop-blur-sm">
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="sr-only peer"
                  data-testid="checkbox-terms"
                />
                <div className={`w-6 h-6 border-2 transition-all duration-200 flex items-center justify-center ${
                  acceptedTerms 
                    ? 'bg-[#d0a760] border-[#d0a760]' 
                    : 'border-zinc-600 group-hover:border-zinc-500'
                }`}>
                  {acceptedTerms && <Check className="w-4 h-4 text-black" />}
                </div>
              </div>
              <span className="text-sm text-zinc-300 leading-relaxed">
                Ik ga akkoord met de{" "}
                <a 
                  href="/algemene-voorwaarden" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#d0a760] hover:underline font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  algemene voorwaarden
                </a>
                {" "}en het{" "}
                <a 
                  href="/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#d0a760] hover:underline font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  privacybeleid
                </a>
              </span>
            </label>
          </div>

          <div className="hidden lg:block">
            <Button
              type="submit"
              size="lg"
              className={`w-full bg-[#d0a760] hover:bg-[#b8954e] text-black font-bold h-16 rounded-none text-lg transition-all duration-200 ${
                acceptedTerms && !isProcessing ? 'hover:scale-[1.01] shadow-lg shadow-[#d0a760]/20' : 'opacity-60 cursor-not-allowed'
              }`}
              disabled={!stripe || isProcessing || !acceptedTerms}
              data-testid="button-place-order"
            >
              {isProcessing ? (
                <span className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-black border-t-transparent animate-spin rounded-none" />
                  Bezig met verwerken...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6" />
                  Bestelling plaatsen • €{orderTotal.toFixed(2)}
                </span>
              )}
            </Button>
            {!acceptedTerms && (
              <p className="text-center text-zinc-500 text-xs mt-3">
                Accepteer de voorwaarden om door te gaan
              </p>
            )}
          </div>
        </form>
      </div>

      <div className="lg:col-span-5 order-1 lg:order-2">
        <div className="lg:sticky lg:top-24 space-y-6">
          <div className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-sm overflow-hidden" data-testid="order-summary">
            <div className="bg-gradient-to-r from-[#d0a760]/20 to-transparent p-5 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#d0a760] flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Je bestelling</h3>
                  <p className="text-xs text-zinc-500">{totalItems} {totalItems === 1 ? 'product' : 'producten'}</p>
                </div>
              </div>
            </div>
            
            <div className="p-5">
              <div className="space-y-4 mb-6 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item: any) => (
                  <div key={item.id} className="flex items-start gap-4 pb-4 border-b border-zinc-800/50 last:border-0 last:pb-0" data-testid={`summary-item-${item.id}`}>
                    <div className="w-20 h-20 bg-zinc-800 flex-shrink-0 border border-zinc-700 relative overflow-hidden">
                      <img 
                        src={item.product?.images?.[item.product.primaryImageIndex || 0] || carAudioLogo}
                        alt={item.product?.name || "Product"}
                        width={80}
                        height={80}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = carAudioLogo;
                        }}
                      />
                      <div className="absolute top-0 right-0 bg-[#d0a760] text-black text-xs font-bold w-6 h-6 flex items-center justify-center">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white line-clamp-2 leading-tight">
                        {item.product?.name}
                      </p>
                      {installationEnabled && item.needsInstallation && (
                        <Badge className="mt-2 text-xs bg-[#d0a760]/20 text-[#d0a760] border border-[#d0a760]/30 rounded-none">
                          <Wrench className="w-3 h-3 mr-1" />
                          + Installatie
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-bold text-[#d0a760] flex-shrink-0">
                      €{(parseFloat(item.product?.price || "0") * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="bg-zinc-700 my-5" />
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Subtotaal</span>
                  <span className="text-white font-medium">€{subtotal.toFixed(2)}</span>
                </div>
                
                {installationEnabled && installationFee > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-[#d0a760]" />
                      Installatie
                    </span>
                    <span className="text-white font-medium">€{installationFee.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#d0a760]" />
                    Verzending
                  </span>
                  <span className={shipping === 0 ? "text-green-400 font-medium flex items-center gap-1" : "text-white font-medium"}>
                    {shipping === 0 ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Gratis
                      </>
                    ) : (
                      `€${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                
                <Separator className="bg-zinc-700 my-2" />
                
                <div className="flex justify-between items-center pt-2">
                  <div>
                    <span className="text-lg font-semibold text-white">Totaal</span>
                    <p className="text-xs text-zinc-500">Inclusief BTW</p>
                  </div>
                  <span className="text-2xl font-bold text-[#d0a760]">€{orderTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 p-5 backdrop-blur-sm">
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#d0a760]" />
              Veilig & betrouwbaar winkelen
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span>30 dagen retour</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span>2 jaar garantie</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span>Gratis verzending €100+</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span>SSL beveiliging</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
              <CreditCard className="w-4 h-4" />
              <span>iDEAL</span>
            </div>
            <div className="w-px h-4 bg-zinc-700" />
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
              <CreditCard className="w-4 h-4" />
              <span>Bancontact</span>
            </div>
            <div className="w-px h-4 bg-zinc-700" />
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
              <CreditCard className="w-4 h-4" />
              <span>Visa</span>
            </div>
            <div className="w-px h-4 bg-zinc-700" />
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
              <CreditCard className="w-4 h-4" />
              <span>Mastercard</span>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/95 border-t border-zinc-800 z-40 backdrop-blur-sm">
        <Button
          type="submit"
          form="checkout-form"
          size="lg"
          className={`w-full bg-[#d0a760] hover:bg-[#b8954e] text-black font-bold h-14 rounded-none text-lg ${
            !acceptedTerms || isProcessing ? 'opacity-60' : ''
          }`}
          disabled={!stripe || isProcessing || !acceptedTerms}
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
              <Lock className="w-5 h-5" />
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
  const [guestEmail, setGuestEmail] = useState("");
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { items: guestCartItems } = useGuestCart();

  const { data: cartItems = [] } = useQuery({
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
      };
    }).filter(item => item.product);
  }, [isAuthenticated, allProducts, guestCartItems]);

  const cartItemsArray = isAuthenticated 
    ? (Array.isArray(cartItems) ? cartItems : [])
    : guestCartWithProducts;

  const isGuest = !isAuthenticated;

  const subtotal = cartItemsArray.reduce((sum: number, item: any) => {
    const price = parseFloat(item.product?.price || "0");
    return sum + (price * item.quantity);
  }, 0);
  
  const { data: checkoutSiteSettings } = useQuery({
    queryKey: ['/api/site-settings'],
  });
  const checkoutInstallationEnabled = checkoutSiteSettings?.installationServiceEnabled ?? true;
  const installationFee = checkoutInstallationEnabled && cartItemsArray.some((item: any) => item.needsInstallation) ? 89 : 0;
  const shipping = subtotal >= 100 ? 0 : 15;
  const total = subtotal + installationFee + shipping;

  useEffect(() => {
    if (total > 0) {
      if (isAuthenticated) {
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
      } else if (guestCartItems.length > 0 && guestEmail && guestEmail.includes('@')) {
        apiRequest("POST", "/api/guest-checkout/create-payment-intent", { 
          cartItems: guestCartItems,
          guestEmail 
        })
          .then((res) => res.json())
          .then((data) => {
            setClientSecret(data.clientSecret);
          })
          .catch((error) => {
            console.error("Guest payment intent error:", error);
            toast({
              title: "Fout bij laden van betaling",
              description: "Probeer de pagina te verversen.",
              variant: "destructive",
            });
          });
      }
    }
  }, [isAuthenticated, total, toast, guestCartItems, guestEmail]);

  if (cartItemsArray.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <div className="pt-24 pb-16">
          <div className="container px-4 mx-auto">
            <div className="max-w-md mx-auto">
              <div className="bg-zinc-900/80 border border-zinc-800 p-8 md:p-12 text-center backdrop-blur-sm">
                <div className="w-20 h-20 bg-zinc-800/50 flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-10 h-10 text-zinc-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-3">Winkelwagen is leeg</h1>
                <p className="text-zinc-400 mb-8 leading-relaxed">
                  Voeg producten toe aan je winkelwagen om door te gaan met afrekenen.
                </p>
                <Button 
                  onClick={() => window.location.href = '/webshop'}
                  className="bg-[#d0a760] hover:bg-[#b8954e] text-black font-semibold h-12 px-8 rounded-none transition-all hover:scale-[1.02]"
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
    if (isGuest && !guestEmail) {
      return (
        <div className="min-h-screen bg-zinc-950">
          <Header onCartOpen={() => setIsCartOpen(true)} />
          <div className="pt-24 pb-16">
            <div className="container px-4 mx-auto">
              <div className="max-w-md mx-auto">
                <div className="bg-zinc-900/80 border border-zinc-800 p-8 md:p-12 backdrop-blur-sm">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#d0a760] flex items-center justify-center mx-auto mb-6">
                      <User className="w-8 h-8 text-black" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Afrekenen als gast</h1>
                    <p className="text-zinc-400 text-sm">
                      Voer je e-mailadres in om door te gaan met afrekenen.
                    </p>
                  </div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const emailInput = form.elements.namedItem('guestEmailInput') as HTMLInputElement;
                    if (emailInput.value && emailInput.value.includes('@')) {
                      setGuestEmail(emailInput.value);
                    }
                  }}>
                    <div className="space-y-2 mb-6">
                      <Label className="text-zinc-300 text-sm">E-mailadres</Label>
                      <Input
                        name="guestEmailInput"
                        type="email"
                        placeholder="jouw@email.nl"
                        className="bg-black border-zinc-700 text-white placeholder:text-zinc-500 h-12 rounded-none focus:ring-2 focus:ring-[#d0a760] focus:border-[#d0a760]"
                        data-testid="input-guest-email"
                        required
                      />
                    </div>
                    <Button 
                      type="submit"
                      className="w-full bg-[#d0a760] hover:bg-[#b8954e] text-black font-semibold h-12 rounded-none transition-all hover:scale-[1.01]"
                      data-testid="button-continue-guest"
                    >
                      Doorgaan met afrekenen
                    </Button>
                  </form>
                  <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
                    <p className="text-zinc-500 text-sm mb-4">Heb je al een account?</p>
                    <Button 
                      variant="outline"
                      onClick={() => window.location.href = '/api/login'}
                      className="border-zinc-700 text-white hover:bg-zinc-800 h-10 rounded-none w-full"
                      data-testid="button-login-instead"
                    >
                      Inloggen
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-zinc-950">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <div className="pt-24 pb-16">
          <div className="container px-4 mx-auto">
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
              <div className="w-14 h-14 border-2 border-[#d0a760] border-t-transparent animate-spin mb-6" />
              <p className="text-zinc-400 text-lg">Betaling laden...</p>
              <p className="text-zinc-500 text-sm mt-2">Even geduld aub</p>
            </div>
          </div>
        </div>
        <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <SEO title="Afrekenen" noindex={true} />
      <Header onCartOpen={() => setIsCartOpen(true)} />
      
      <div className="pt-20 bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800">
        <div className="container px-4 mx-auto py-8 md:py-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Checkout</h1>
            <p className="text-zinc-400">Voltooi je bestelling veilig en eenvoudig</p>
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
                    boxShadow: '0 0 0 2px rgba(208, 167, 96, 0.2)',
                  },
                  '.Input--invalid': {
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                  },
                  '.Label': {
                    color: '#d4d4d8',
                    fontSize: '14px',
                    fontWeight: '500',
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
                  '.Error': {
                    color: '#f87171',
                    fontSize: '13px',
                  },
                },
              },
            }}
          >
            <CheckoutForm clientSecret={clientSecret} orderTotal={total} cartItems={cartItemsArray} isGuest={isGuest} />
          </Elements>
        ) : (
          <div className="max-w-lg mx-auto">
            <div className="bg-zinc-900/80 border border-zinc-800 p-8 md:p-12 text-center backdrop-blur-sm">
              <div className="w-16 h-16 bg-zinc-800/50 flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-8 h-8 text-zinc-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Betaling tijdelijk niet beschikbaar</h3>
              <p className="text-zinc-400 mb-8 leading-relaxed">
                De betaalfunctionaliteit wordt momenteel geconfigureerd. Neem contact met ons op om je bestelling te plaatsen.
              </p>
              <Button 
                onClick={() => window.location.href = 'mailto:info@caraudiolimburg.shop'}
                className="bg-[#d0a760] hover:bg-[#b8954e] text-black font-semibold h-12 px-8 rounded-none transition-all hover:scale-[1.02]"
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
