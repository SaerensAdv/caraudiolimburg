import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ScrollReveal, StaggerContainer, GoldAccentLine, SectionDivider } from "@/components/ScrollAnimations";
import { BassPulse } from "@/components/AudioPulseEffects";
import { Link } from "wouter";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle,
  Send,
  Car,
  Calendar,
  ArrowRight,
  ExternalLink
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
    <div className="min-h-screen bg-black">
      <Header onCartOpen={() => setIsCartOpen(true)} variant="transparent" />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <main className="flex-grow">
        {/* Hero Section - Dark with gold accents */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-20">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
          <BassPulse className="opacity-30" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
            <ScrollReveal direction="up" delay={100}>
              <div className="inline-flex items-center gap-2 mb-6">
                <div className="w-12 h-px bg-[#d0a760]" />
                <span className="text-[#d0a760] text-sm font-medium tracking-widest uppercase">Contact</span>
                <div className="w-12 h-px bg-[#d0a760]" />
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={200}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-6">
                Neem Contact Op
              </h1>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={300}>
              <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
                Een vraag over een product, prijs of onze inbouwservice? We streven ernaar om binnen 48 uur te reageren. 
                Voor het beste advies hebben we graag een foto van uw origineel scherm inclusief het dashboard.
              </p>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={400}>
              <GoldAccentLine className="mt-12 max-w-md mx-auto" />
            </ScrollReveal>
          </div>
        </section>

        {/* Contact Info Cards - White section */}
        <section className="bg-white py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <StaggerContainer 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" 
              staggerDelay={100}
            >
              {/* Address Card */}
              <ScrollReveal direction="up" delay={100}>
                <div className="bg-zinc-950 p-8 text-center h-full border border-zinc-800 hover:border-[#d0a760]/50 transition-colors duration-300">
                  <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-[#d0a760] text-[#d0a760]">
                    <MapPin className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">Adres</h3>
                  <p className="text-white/60 leading-relaxed">
                    Dr. Nolenslaan 157c<br />
                    6136 GM Sittard<br />
                    Nederland
                  </p>
                </div>
              </ScrollReveal>

              {/* Phone Card */}
              <ScrollReveal direction="up" delay={200}>
                <div className="bg-zinc-950 p-8 text-center h-full border border-zinc-800 hover:border-[#d0a760]/50 transition-colors duration-300">
                  <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-[#d0a760] text-[#d0a760]">
                    <Phone className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">Telefoon</h3>
                  <p className="text-white/60">
                    <a 
                      href="tel:0852733625" 
                      className="hover:text-[#d0a760] transition-colors"
                      data-testid="link-phone"
                    >
                      085 - 27 33 625
                    </a>
                  </p>
                  <p className="text-sm text-white/40 mt-2">WhatsApp beschikbaar</p>
                </div>
              </ScrollReveal>

              {/* Email Card */}
              <ScrollReveal direction="up" delay={300}>
                <div className="bg-zinc-950 p-8 text-center h-full border border-zinc-800 hover:border-[#d0a760]/50 transition-colors duration-300">
                  <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-[#d0a760] text-[#d0a760]">
                    <Mail className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">E-mail</h3>
                  <p className="text-white/60">
                    <a 
                      href="mailto:info@caraudiolimburg.nl" 
                      className="hover:text-[#d0a760] transition-colors"
                      data-testid="link-email"
                    >
                      info@caraudiolimburg.nl
                    </a>
                  </p>
                  <p className="text-sm text-white/40 mt-2">We reageren binnen 48 uur</p>
                </div>
              </ScrollReveal>

              {/* Opening Hours Card */}
              <ScrollReveal direction="up" delay={400}>
                <div className="bg-zinc-950 p-8 text-center h-full border border-zinc-800 hover:border-[#d0a760]/50 transition-colors duration-300">
                  <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-[#d0a760] text-[#d0a760]">
                    <Clock className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">Openingstijden</h3>
                  <div className="text-white/60 text-sm space-y-1">
                    <p className="text-[#d0a760] font-medium">Showroom:</p>
                    <p>Ma-Do: 13:30 - 17:30</p>
                    <p>Vr: 08:30 - 15:00</p>
                    <p className="text-[#d0a760] font-medium mt-3">Inbouwstudio:</p>
                    <p>Ma-Do: 08:30 - 17:30</p>
                    <p>Vr: 08:30 - 12:30</p>
                    <p className="text-red-400 text-xs mt-2">Enkel op afspraak</p>
                  </div>
                </div>
              </ScrollReveal>
            </StaggerContainer>
          </div>
        </section>

        {/* Transition: White to Black */}
        <SectionDivider variant="angle" fromColor="white" toColor="black" />

        {/* Contact Form & Quick Actions - Black section */}
        <section className="bg-black py-20 md:py-24 relative overflow-hidden">
          <BassPulse className="opacity-20" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Contact Form */}
              <ScrollReveal direction="left" delay={100}>
                <div className="bg-zinc-950 border border-zinc-800 p-8 md:p-10">
                  <div className="flex items-center gap-3 mb-8">
                    <Send className="h-6 w-6 text-[#d0a760]" />
                    <h2 className="text-2xl font-light text-white">Stuur ons een bericht</h2>
                  </div>
                  
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-white/80 mb-2 block">Voornaam *</Label>
                        <Input
                          id="firstName"
                          {...register("firstName")}
                          className={`bg-zinc-900 border-zinc-700 text-white placeholder:text-white/40 rounded-none focus:border-[#d0a760] focus:ring-[#d0a760] focus:ring-1 ${errors.firstName ? "border-red-500" : ""}`}
                          data-testid="input-firstName"
                        />
                        {errors.firstName && (
                          <p className="text-red-400 text-sm mt-1">{errors.firstName.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-white/80 mb-2 block">Achternaam *</Label>
                        <Input
                          id="lastName"
                          {...register("lastName")}
                          className={`bg-zinc-900 border-zinc-700 text-white placeholder:text-white/40 rounded-none focus:border-[#d0a760] focus:ring-[#d0a760] focus:ring-1 ${errors.lastName ? "border-red-500" : ""}`}
                          data-testid="input-lastName"
                        />
                        {errors.lastName && (
                          <p className="text-red-400 text-sm mt-1">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-white/80 mb-2 block">E-mailadres *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        className={`bg-zinc-900 border-zinc-700 text-white placeholder:text-white/40 rounded-none focus:border-[#d0a760] focus:ring-[#d0a760] focus:ring-1 ${errors.email ? "border-red-500" : ""}`}
                        data-testid="input-email"
                      />
                      {errors.email && (
                        <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-white/80 mb-2 block">Telefoonnummer *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        {...register("phone")}
                        className={`bg-zinc-900 border-zinc-700 text-white placeholder:text-white/40 rounded-none focus:border-[#d0a760] focus:ring-[#d0a760] focus:ring-1 ${errors.phone ? "border-red-500" : ""}`}
                        data-testid="input-phone"
                      />
                      {errors.phone && (
                        <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="subject" className="text-white/80 mb-2 block">Onderwerp *</Label>
                      <Input
                        id="subject"
                        {...register("subject")}
                        placeholder="Bijv. Offerte aanvraag Alpine systeem"
                        className={`bg-zinc-900 border-zinc-700 text-white placeholder:text-white/40 rounded-none focus:border-[#d0a760] focus:ring-[#d0a760] focus:ring-1 ${errors.subject ? "border-red-500" : ""}`}
                        data-testid="input-subject"
                      />
                      {errors.subject && (
                        <p className="text-red-400 text-sm mt-1">{errors.subject.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-white/80 mb-2 block">Uw bericht *</Label>
                      <Textarea
                        id="message"
                        rows={5}
                        {...register("message")}
                        placeholder="Vertel ons over uw auto, wensen en budget..."
                        className={`bg-zinc-900 border-zinc-700 text-white placeholder:text-white/40 rounded-none focus:border-[#d0a760] focus:ring-[#d0a760] focus:ring-1 resize-none ${errors.message ? "border-red-500" : ""}`}
                        data-testid="textarea-message"
                      />
                      {errors.message && (
                        <p className="text-red-400 text-sm mt-1">{errors.message.message}</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-[#d0a760] hover:bg-[#b8954e] text-black font-medium rounded-none py-6 text-base transition-all duration-300"
                      data-testid="button-submit"
                    >
                      {isSubmitting ? (
                        "Verzenden..."
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Bericht verzenden
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </ScrollReveal>

              {/* Quick Actions */}
              <div className="space-y-6">
                {/* WhatsApp Card */}
                <ScrollReveal direction="right" delay={100}>
                  <a 
                    href="https://wa.me/31475636363"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <div className="bg-zinc-950 border border-zinc-800 p-8 hover:border-[#d0a760]/50 transition-all duration-300 group-hover:bg-zinc-900">
                      <div className="flex items-start gap-6">
                        <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center border border-[#d0a760] text-[#d0a760] group-hover:bg-[#d0a760] group-hover:text-black transition-colors duration-300">
                          <MessageCircle className="h-7 w-7" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-medium text-white mb-2 flex items-center gap-2">
                            WhatsApp
                            <ExternalLink className="h-4 w-4 text-white/40" />
                          </h3>
                          <p className="text-white/60 mb-3">Direct contact via WhatsApp voor snelle vragen</p>
                          <span className="text-[#d0a760] font-medium">047 563 63 63</span>
                        </div>
                        <ArrowRight className="h-6 w-6 text-white/40 group-hover:text-[#d0a760] group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                  </a>
                </ScrollReveal>

                {/* Call Card */}
                <ScrollReveal direction="right" delay={200}>
                  <a 
                    href="tel:0852733625"
                    className="block group"
                  >
                    <div className="bg-zinc-950 border border-zinc-800 p-8 hover:border-[#d0a760]/50 transition-all duration-300 group-hover:bg-zinc-900">
                      <div className="flex items-start gap-6">
                        <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center border border-[#d0a760] text-[#d0a760] group-hover:bg-[#d0a760] group-hover:text-black transition-colors duration-300">
                          <Phone className="h-7 w-7" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-medium text-white mb-2">Bellen</h3>
                          <p className="text-white/60 mb-3">Spreek direct met een van onze specialisten</p>
                          <span className="text-[#d0a760] font-medium">085 - 27 33 625</span>
                        </div>
                        <ArrowRight className="h-6 w-6 text-white/40 group-hover:text-[#d0a760] group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                  </a>
                </ScrollReveal>

                {/* Appointment Card */}
                <ScrollReveal direction="right" delay={300}>
                  <Link href="/booking" className="block group">
                    <div className="bg-zinc-950 border border-zinc-800 p-8 hover:border-[#d0a760]/50 transition-all duration-300 group-hover:bg-zinc-900">
                      <div className="flex items-start gap-6">
                        <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center border border-[#d0a760] text-[#d0a760] group-hover:bg-[#d0a760] group-hover:text-black transition-colors duration-300">
                          <Calendar className="h-7 w-7" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-medium text-white mb-2">Afspraak maken</h3>
                          <p className="text-white/60 mb-3">Plan direct een afspraak voor installatie of adviesgesprek</p>
                          <span className="text-[#d0a760] font-medium">Plan nu in →</span>
                        </div>
                        <ArrowRight className="h-6 w-6 text-white/40 group-hover:text-[#d0a760] group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>

                {/* Quote Card */}
                <ScrollReveal direction="right" delay={400}>
                  <div className="bg-gradient-to-br from-[#d0a760]/20 to-transparent border border-[#d0a760]/30 p-8">
                    <div className="flex items-start gap-6">
                      <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center bg-[#d0a760] text-black">
                        <Car className="h-7 w-7" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-medium text-white mb-2">Offerte op maat</h3>
                        <p className="text-white/60 mb-4">
                          Heeft u een specifiek audiosysteem in gedachten? 
                          We maken graag een persoonlijke offerte voor uw voertuig.
                        </p>
                        <Button 
                          className="bg-[#d0a760] hover:bg-[#b8954e] text-black rounded-none px-6 py-5"
                          data-testid="button-quote"
                        >
                          <Car className="h-4 w-4 mr-2" />
                          Offerte aanvragen
                        </Button>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* Transition: Black to White */}
        <SectionDivider variant="curve" fromColor="black" toColor="white" />

        {/* Map Section - White section */}
        <section className="bg-white py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-light text-black mb-4">
                  Bezoek onze werkplaats
                </h2>
                <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
                  Dr. Nolenslaan 157c, 6136 GM Sittard - Makkelijk bereikbaar vanuit heel Limburg
                </p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={200}>
              <div className="bg-zinc-950 border border-zinc-800 overflow-hidden">
                <div className="h-[400px] md:h-[500px] bg-zinc-900 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black opacity-50" />
                  <div className="text-center relative z-10 px-4">
                    <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center border-2 border-[#d0a760] text-[#d0a760]">
                      <MapPin className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-light text-white mb-3">
                      Interactieve kaart
                    </h3>
                    <p className="text-white/60 mb-6 max-w-md mx-auto">
                      Google Maps integratie voor routebeschrijving naar onze showroom en werkplaats
                    </p>
                    <a 
                      href="https://maps.google.com/?q=Dr.+Nolenslaan+157c,+6136+GM+Sittard,+Nederland"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#d0a760] hover:text-[#b8954e] transition-colors"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={300}>
              <GoldAccentLine className="mt-12" />
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
