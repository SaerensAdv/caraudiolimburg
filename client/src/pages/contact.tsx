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
import { SEO } from "@/components/SEO";
import { LocalBusinessSchema, BreadcrumbSchema } from "@/components/StructuredData";
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
  ExternalLink,
  User,
  AtSign,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2
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
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to submit');

      toast({
        title: "✓ Bedankt voor je bericht!",
        description: (
          <div className="flex flex-col gap-1">
            <p>We reageren meestal binnen 24-48 uur.</p>
            <p className="text-xs text-muted-foreground">Je ontvangt een bevestiging per e-mail.</p>
          </div>
        ),
      });

      reset();
    } catch (error) {
      toast({
        title: "⚠ Oeps, dat ging niet goed",
        description: (
          <div className="flex flex-col gap-1">
            <p>Probeer het nog eens, of neem direct contact op.</p>
            <a href="tel:0852733625" className="text-[#d0a760] hover:underline font-medium">
              Bel: 085 - 27 33 625
            </a>
          </div>
        ),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <SEO 
        title="Contact"
        description="Neem contact op met Car Audio Limburg. Bel ons, stuur een WhatsApp of bezoek onze showroom in Sittard. Wij helpen je graag met al je car audio vragen."
        canonical="/contact"
        keywords="contact, car audio limburg, telefoon, whatsapp, showroom, Sittard"
      />
      <LocalBusinessSchema />
      <BreadcrumbSchema items={[
        { name: "Home", url: "/" },
        { name: "Contact", url: "/contact" }
      ]} />
      
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
                We Horen Graag Van Je
              </h1>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={300}>
              <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
                Heb je een vraag, wil je advies of gewoon even sparren over de mogelijkheden voor jouw auto? 
                Wij staan klaar om je te helpen en reageren meestal binnen 24-48 uur. Stuur gerust een foto 
                van je dashboard mee — dan kunnen we je nog beter adviseren!
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
                  <h3 className="text-lg font-semibold text-white mb-3">Kom Langs</h3>
                  <p className="text-white/60 leading-relaxed">
                    Dr. Nolenslaan 157-C (Hal 3)<br />
                    6136 GM Sittard<br />
                    Nederland
                  </p>
                  <p className="text-sm text-[#d0a760] mt-3">Je bent van harte welkom!</p>
                </div>
              </ScrollReveal>

              {/* Phone Card */}
              <ScrollReveal direction="up" delay={200}>
                <div className="bg-zinc-950 p-8 text-center h-full border border-zinc-800 hover:border-[#d0a760]/50 transition-colors duration-300">
                  <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-[#d0a760] text-[#d0a760]">
                    <Phone className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">Bel of App Ons</h3>
                  <p className="text-white/60">
                    <a 
                      href="tel:0852733625" 
                      className="hover:text-[#d0a760] transition-colors"
                      data-testid="link-phone"
                    >
                      085 - 27 33 625
                    </a>
                  </p>
                  <p className="text-sm text-white/40 mt-2">Ook bereikbaar via WhatsApp</p>
                </div>
              </ScrollReveal>

              {/* Email Card */}
              <ScrollReveal direction="up" delay={300}>
                <div className="bg-zinc-950 p-8 text-center h-full border border-zinc-800 hover:border-[#d0a760]/50 transition-colors duration-300">
                  <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-[#d0a760] text-[#d0a760]">
                    <Mail className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">Mail Ons</h3>
                  <p className="text-white/60">
                    <a 
                      href="mailto:info@caraudiolimburg.nl" 
                      className="hover:text-[#d0a760] transition-colors"
                      data-testid="link-email"
                    >
                      info@caraudiolimburg.nl
                    </a>
                  </p>
                  <p className="text-sm text-white/40 mt-2">Reactie binnen 24-48 uur</p>
                </div>
              </ScrollReveal>

              {/* Opening Hours Card */}
              <ScrollReveal direction="up" delay={400}>
                <div className="bg-zinc-950 p-8 text-center h-full border border-zinc-800 hover:border-[#d0a760]/50 transition-colors duration-300">
                  <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-[#d0a760] text-[#d0a760]">
                    <Clock className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">Wanneer Kun Je Langs?</h3>
                  <div className="text-white/60 text-sm space-y-1">
                    <p className="text-[#d0a760] font-medium">Showroom:</p>
                    <p>Ma-Vr: 9:00 - 17:00</p>
                    <p>Za: 9:00 - 13:00</p>
                    <p className="text-[#d0a760] font-medium mt-3">Inbouwstudio:</p>
                    <p>Ma-Vr: 8:30 - 17:00</p>
                    <p className="text-white/40 text-xs mt-1">Pauze: 12:30 - 13:00</p>
                    <p className="text-white/40 text-xs mt-2">Enkel op afspraak</p>
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
                  <div className="flex items-center gap-3 mb-4">
                    <Send className="h-6 w-6 text-[#d0a760]" />
                    <h2 className="text-2xl font-light text-white">Laat van je horen</h2>
                  </div>
                  <p className="text-white/50 text-sm mb-8">Vul het formulier in en we nemen zo snel mogelijk contact met je op. Geen vraag is te gek!</p>
                  
                  <form id="contact-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-white/80 flex items-center gap-2">
                          <User className="h-4 w-4 text-[#d0a760]" />
                          Je voornaam
                        </Label>
                        <div className="relative">
                          <Input
                            id="firstName"
                            {...register("firstName")}
                            placeholder="Hoe mogen we je noemen?"
                            className={`bg-zinc-900 border-zinc-700 text-white placeholder:text-white/40 rounded-none h-12 transition-all duration-200 focus:border-[#d0a760] focus:ring-2 focus:ring-[#d0a760]/20 focus:bg-zinc-900/80 ${errors.firstName ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                            data-testid="input-firstName"
                          />
                        </div>
                        {errors.firstName && (
                          <p className="text-red-400 text-sm flex items-center gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-white/80 flex items-center gap-2">
                          <User className="h-4 w-4 text-[#d0a760]" />
                          Je achternaam
                        </Label>
                        <div className="relative">
                          <Input
                            id="lastName"
                            {...register("lastName")}
                            placeholder="Je achternaam"
                            className={`bg-zinc-900 border-zinc-700 text-white placeholder:text-white/40 rounded-none h-12 transition-all duration-200 focus:border-[#d0a760] focus:ring-2 focus:ring-[#d0a760]/20 focus:bg-zinc-900/80 ${errors.lastName ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                            data-testid="input-lastName"
                          />
                        </div>
                        {errors.lastName && (
                          <p className="text-red-400 text-sm flex items-center gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white/80 flex items-center gap-2">
                        <AtSign className="h-4 w-4 text-[#d0a760]" />
                        Je e-mailadres
                      </Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          {...register("email")}
                          placeholder="Voor ons antwoord"
                          className={`bg-zinc-900 border-zinc-700 text-white placeholder:text-white/40 rounded-none h-12 transition-all duration-200 focus:border-[#d0a760] focus:ring-2 focus:ring-[#d0a760]/20 focus:bg-zinc-900/80 ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                          data-testid="input-email"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-400 text-sm flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white/80 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-[#d0a760]" />
                        Je telefoonnummer
                      </Label>
                      <div className="relative">
                        <Input
                          id="phone"
                          type="tel"
                          {...register("phone")}
                          placeholder="Mocht bellen handiger zijn"
                          className={`bg-zinc-900 border-zinc-700 text-white placeholder:text-white/40 rounded-none h-12 transition-all duration-200 focus:border-[#d0a760] focus:ring-2 focus:ring-[#d0a760]/20 focus:bg-zinc-900/80 ${errors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                          data-testid="input-phone"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-400 text-sm flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.phone.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-white/80 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#d0a760]" />
                        Waar gaat het over?
                      </Label>
                      <div className="relative">
                        <Input
                          id="subject"
                          {...register("subject")}
                          placeholder="Bijv. Vraag over CarPlay, advies speakers..."
                          className={`bg-zinc-900 border-zinc-700 text-white placeholder:text-white/40 rounded-none h-12 transition-all duration-200 focus:border-[#d0a760] focus:ring-2 focus:ring-[#d0a760]/20 focus:bg-zinc-900/80 ${errors.subject ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                          data-testid="input-subject"
                        />
                      </div>
                      {errors.subject && (
                        <p className="text-red-400 text-sm flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.subject.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-white/80 flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-[#d0a760]" />
                        Vertel ons meer
                      </Label>
                      <Textarea
                        id="message"
                        rows={5}
                        {...register("message")}
                        placeholder="Welke auto heb je? Wat zijn je wensen? We denken graag met je mee!"
                        className={`bg-zinc-900 border-zinc-700 text-white placeholder:text-white/40 rounded-none transition-all duration-200 focus:border-[#d0a760] focus:ring-2 focus:ring-[#d0a760]/20 focus:bg-zinc-900/80 resize-none ${errors.message ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                        data-testid="textarea-message"
                      />
                      {errors.message && (
                        <p className="text-red-400 text-sm flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.message.message}
                        </p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-[#d0a760] hover:bg-[#b8954e] text-black font-medium rounded-none py-6 text-base transition-all duration-300 disabled:opacity-70 group"
                      data-testid="button-submit"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Verzenden...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Send className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                          Verstuur je bericht
                        </span>
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
                    href="https://wa.me/31852733625"
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
                            Even Appen?
                            <ExternalLink className="h-4 w-4 text-white/40" />
                          </h3>
                          <p className="text-white/60 mb-3">Snel een vraagje? Stuur ons gerust een appje!</p>
                          <span className="text-[#d0a760] font-medium">+31 (0)85 - 27 33 625</span>
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
                          <h3 className="text-xl font-medium text-white mb-2">Liever Bellen?</h3>
                          <p className="text-white/60 mb-3">We praten je graag persoonlijk bij over de mogelijkheden</p>
                          <span className="text-[#d0a760] font-medium">085 - 27 33 625</span>
                        </div>
                        <ArrowRight className="h-6 w-6 text-white/40 group-hover:text-[#d0a760] group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                  </a>
                </ScrollReveal>

                {/* Appointment Card */}
                <ScrollReveal direction="right" delay={300}>
                  <a href="#contact-form" className="block group">
                    <div className="bg-zinc-950 border border-zinc-800 p-8 hover:border-[#d0a760]/50 transition-all duration-300 group-hover:bg-zinc-900">
                      <div className="flex items-start gap-6">
                        <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center border border-[#d0a760] text-[#d0a760] group-hover:bg-[#d0a760] group-hover:text-black transition-colors duration-300">
                          <Calendar className="h-7 w-7" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-medium text-white mb-2">Kom Langs in de Showroom</h3>
                          <p className="text-white/60 mb-3">Neem contact op en ervaar onze producten zelf. We nemen alle tijd voor je!</p>
                          <span className="text-[#d0a760] font-medium">Stuur ons een bericht →</span>
                        </div>
                        <ArrowRight className="h-6 w-6 text-white/40 group-hover:text-[#d0a760] group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                  </a>
                </ScrollReveal>

                {/* Quote Card */}
                <ScrollReveal direction="right" delay={400}>
                  <a 
                    href="https://caraudiolimburg.studio/offerte-aanvragen/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="bg-gradient-to-br from-[#d0a760]/20 to-transparent border border-[#d0a760]/30 p-8 hover:border-[#d0a760]/50 transition-all duration-300">
                      <div className="flex items-start gap-6">
                        <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center bg-[#d0a760] text-black">
                          <Car className="h-7 w-7" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-medium text-white mb-2">Installatie Offerte Nodig?</h3>
                          <p className="text-white/60 mb-4">
                            Wil je een complete audio-upgrade of CarPlay inbouw? Via onze inbouwstudio 
                            helpen we je graag met een offerte op maat voor jouw auto.
                          </p>
                          <div className="flex items-center gap-2 text-[#d0a760] font-medium">
                            <span>Naar caraudiolimburg.studio</span>
                            <ExternalLink className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
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
                  Je Bent Van Harte Welkom
                </h2>
                <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
                  Kom gerust langs in onze showroom in Sittard! Luister naar onze demo-systemen, 
                  stel al je vragen en ontdek wat we voor jouw auto kunnen betekenen.
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
                      Vind Ons
                    </h3>
                    <p className="text-white/60 mb-6 max-w-md mx-auto">
                      Dr. Nolenslaan 157-C (Hal 3), Sittard — makkelijk bereikbaar met voldoende parkeergelegenheid
                    </p>
                    <a 
                      href="https://maps.google.com/?q=Dr.+Nolenslaan+157-C,+6136+GM+Sittard,+Nederland"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#d0a760] hover:text-[#b8954e] transition-colors"
                    >
                      <span>Plan je route via Google Maps</span>
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
