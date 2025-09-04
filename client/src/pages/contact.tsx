import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle,
  Send,
  Car,
  Calendar
} from "lucide-react";

const contactSchema = z.object({
  firstName: z.string().min(2, "Voornaam is verplicht"),
  lastName: z.string().min(2, "Achternaam is verplicht"), 
  email: z.string().email("Ongeldig e-mailadres"),
  phone: z.string().min(8, "Telefoonnummer is verplicht"),
  subject: z.string().min(3, "Onderwerp is verplicht"),
  message: z.string().min(10, "Bericht moet minimaal 10 karakters bevatten"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contact() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement contact form submission to backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Bericht verzonden!",
        description: "We nemen zo snel mogelijk contact met u op.",
      });
      
      reset();
    } catch (error) {
      toast({
        title: "Fout bij verzenden",
        description: "Probeer het opnieuw of bel ons direct.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header onCartClick={() => setIsCartOpen(true)} />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-50 to-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Contact & Bezoekadres
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Een vraag over een product, prijs of onze inbouwservice? We streven ernaar om binnen 48 uur te reageren. 
              Voor het beste advies hebben we graag een foto van uw origineel scherm inclusief het dashboard.
            </p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-4 gap-6 mb-16">
              <Card className="text-center">
                <CardContent className="p-6">
                  <MapPin className="h-12 w-12 text-[#d0a760] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Adres</h3>
                  <p className="text-gray-600">
                    Dr. Nolenslaan 157c<br />
                    6136 GM Sittard<br />
                    Nederland
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <Phone className="h-12 w-12 text-[#d0a760] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Telefoon</h3>
                  <p className="text-gray-600">
                    <a 
                      href="tel:0852733625" 
                      className="hover:text-[#d0a760] transition-colors"
                      data-testid="link-phone"
                    >
                      085 - 27 33 625
                    </a>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">WhatsApp beschikbaar</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <Mail className="h-12 w-12 text-[#d0a760] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">E-mail</h3>
                  <p className="text-gray-600">
                    <a 
                      href="mailto:info@caraudiolimburg.nl" 
                      className="hover:text-[#d0a760] transition-colors"
                      data-testid="link-email"
                    >
                      info@caraudiolimburg.nl
                    </a>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">We reageren binnen 48 uur</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <Clock className="h-12 w-12 text-[#d0a760] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Openingstijden</h3>
                  <div className="text-gray-600 text-sm">
                    <p className="font-medium">Showroom:</p>
                    <p>Ma-Do: 13:30 - 17:30</p>
                    <p>Vr: 08:30 - 15:00</p>
                    <p className="font-medium mt-2">Inbouwstudio:</p>
                    <p>Ma-Do: 08:30 - 17:30</p>
                    <p>Vr: 08:30 - 12:30</p>
                    <p className="text-red-600 text-xs mt-1">Enkel op afspraak</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Contact Section */}
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-[#d0a760]" />
                    Stuur ons een bericht
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Voornaam *</Label>
                        <Input
                          id="firstName"
                          {...register("firstName")}
                          className={errors.firstName ? "border-red-500" : ""}
                          data-testid="input-firstName"
                        />
                        {errors.firstName && (
                          <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Achternaam *</Label>
                        <Input
                          id="lastName"
                          {...register("lastName")}
                          className={errors.lastName ? "border-red-500" : ""}
                          data-testid="input-lastName"
                        />
                        {errors.lastName && (
                          <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">E-mailadres *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        className={errors.email ? "border-red-500" : ""}
                        data-testid="input-email"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone">Telefoonnummer *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        {...register("phone")}
                        className={errors.phone ? "border-red-500" : ""}
                        data-testid="input-phone"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="subject">Onderwerp *</Label>
                      <Input
                        id="subject"
                        {...register("subject")}
                        placeholder="Bijv. Offerte aanvraag Alpine systeem"
                        className={errors.subject ? "border-red-500" : ""}
                        data-testid="input-subject"
                      />
                      {errors.subject && (
                        <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="message">Uw bericht *</Label>
                      <Textarea
                        id="message"
                        rows={5}
                        {...register("message")}
                        placeholder="Vertel ons over uw auto, wensen en budget..."
                        className={errors.message ? "border-red-500" : ""}
                        data-testid="textarea-message"
                      />
                      {errors.message && (
                        <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-[#d0a760] hover:bg-[#b8954e]"
                      data-testid="button-submit"
                    >
                      {isSubmitting ? (
                        "Verzenden..."
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Bericht verzenden
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-[#d0a760]" />
                      Direct contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start border-[#d0a760] text-[#d0a760] hover:bg-[#d0a760] hover:text-white"
                      data-testid="button-whatsapp"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp: 047 563 63 63
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start border-[#d0a760] text-[#d0a760] hover:bg-[#d0a760] hover:text-white"
                      data-testid="button-call"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Bellen: 047 563 63 63
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-[#d0a760]" />
                      Afspraak maken
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Plan direct een afspraak voor installatie of adviesgesprek. 
                      We nemen contact op om de details te bespreken.
                    </p>
                    <Button 
                      className="w-full bg-[#d0a760] hover:bg-[#b8954e]"
                      data-testid="button-appointment"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Afspraak inplannen
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Car className="h-5 w-5 text-[#d0a760]" />
                      Offerte op maat
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Heeft u een specifiek audiosysteem in gedachten? 
                      We maken graag een persoonlijke offerte voor uw voertuig.
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full border-[#d0a760] text-[#d0a760] hover:bg-[#d0a760] hover:text-white"
                      data-testid="button-quote"
                    >
                      <Car className="h-4 w-4 mr-2" />
                      Offerte aanvragen
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section Placeholder */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Bezoek onze werkplaats
              </h2>
              <p className="text-xl text-gray-600">
                Industrieweg 12, 6040 Roermond - Makkelijk bereikbaar vanaf de A2
              </p>
            </div>
            
            <Card className="overflow-hidden">
              <div className="h-96 bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-16 w-16 text-[#d0a760] mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-700">
                    Interactieve kaart komt hier
                  </p>
                  <p className="text-gray-600">
                    Google Maps integratie voor routebeschrijving
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}