import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { BookingCalendar } from "@/components/BookingCalendar";
import { Button } from "@/components/ui/button";
import { ScrollReveal, StaggerContainer, GoldAccentLine, SectionDivider } from "@/components/ScrollAnimations";
import { BassPulse } from "@/components/AudioPulseEffects";
import { SEO } from "@/components/SEO";
import { LocalBusinessSchema, BreadcrumbSchema } from "@/components/StructuredData";
import { 
  Clock, 
  Shield, 
  CalendarBlank,
  Trophy,
  Wrench,
  Users,
  Car,
  Coffee,
  MapPin,
  Phone,
  Star,
  User,
  Check,
  Headphones,
  SpeakerHigh
} from "@phosphor-icons/react";

export default function Booking() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black scroll-smooth">
      <SEO 
        title="Afspraak Maken - Professionele Car Audio Installatie"
        description="Boek online je installatie-afspraak bij Car Audio Limburg. Gecertificeerde monteurs, 2 jaar garantie, en OEM-look resultaat. Snel en professioneel!"
        canonical="/afspraak-maken"
        keywords="afspraak maken, car audio installatie, inbouw, montage, Sittard, carplay inbouwen, speakers inbouwen"
      />
      <LocalBusinessSchema />
      <BreadcrumbSchema items={[
        { name: "Home", url: "/" },
        { name: "Afspraak Maken", url: "/booking" }
      ]} />
      
      <Header onCartOpen={() => setIsCartOpen(true)} variant="transparent" />
      
      {/* Hero Section - Premium Dark */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-black">
        <BassPulse className="opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
        
        <div className="relative z-10 container px-4 md:px-8 lg:px-16 mx-auto text-center py-32">
          <ScrollReveal direction="up" delay={100}>
            <div className="flex items-center justify-center gap-2 mb-6">
              <Headphones className="w-5 h-5 text-[#d0a760]" />
              <span className="text-[#d0a760] text-sm font-medium tracking-wider uppercase">Premium Installatie Service</span>
            </div>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={200}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight mb-6">
              Professionele Car Audio
              <br />
              <span className="font-normal">Installatie</span>
            </h1>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={300}>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10">
              Boek je installatie-afspraak online. Onze gecertificeerde monteurs zorgen voor een perfecte installatie met OEM-look garantie.
            </p>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={400}>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-[#d0a760]/10 border border-[#d0a760]/30 px-5 py-3" data-testid="badge-warranty">
                <Trophy className="w-4 h-4 text-[#d0a760]" />
                <span className="text-white text-sm font-medium">2 jaar garantie</span>
              </div>
              <div className="flex items-center gap-2 bg-[#d0a760]/10 border border-[#d0a760]/30 px-5 py-3" data-testid="badge-fast">
                <Clock className="w-4 h-4 text-[#d0a760]" />
                <span className="text-white text-sm font-medium">Binnen 2-4 uur klaar</span>
              </div>
              <div className="flex items-center gap-2 bg-[#d0a760]/10 border border-[#d0a760]/30 px-5 py-3" data-testid="badge-certified">
                <Shield className="w-4 h-4 text-[#d0a760]" />
                <span className="text-white text-sm font-medium">Gecertificeerde monteurs</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Booking Calendar Section */}
      <section className="py-20 md:py-28 bg-zinc-950">
        <div className="container px-4 md:px-8 lg:px-16 mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <CalendarBlank className="w-5 h-5 text-[#d0a760]" />
                <span className="text-[#d0a760] text-sm font-medium tracking-wider uppercase">Online Boeken</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-light text-white mb-4">Plan je Installatie</h2>
              <p className="text-lg text-white/60 max-w-xl mx-auto">
                Selecteer een service en kies je gewenste datum en tijd
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <BookingCalendar />
          </ScrollReveal>
        </div>
      </section>

      <GoldAccentLine />

      {/* Installation Services Info */}
      <section className="py-20 md:py-28 bg-black">
        <div className="container px-4 md:px-8 lg:px-16 mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-2 mb-4">
                <SpeakerHigh className="w-5 h-5 text-[#d0a760]" />
                <span className="text-[#d0a760] text-sm font-medium tracking-wider uppercase">Onze Diensten</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-light text-white mb-4">Installatie Services</h2>
              <p className="text-lg text-white/60 max-w-xl mx-auto">
                Van eenvoudige radio installatie tot complete audio systemen
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={100}>
            <div className="bg-zinc-950 border border-zinc-800 p-8 text-center hover:border-[#d0a760]/50 transition-all duration-300 group" data-testid="service-radio">
              <div className="w-16 h-16 bg-[#d0a760]/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#d0a760]/20 transition-colors">
                <Car className="w-8 h-8 text-[#d0a760]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Autoradio Installatie</h3>
              <p className="text-sm text-white/60 mb-6">
                Vervangen van je originele radio met moderne multimedia systeem
              </p>
              <div className="space-y-2 pt-4 border-t border-zinc-800">
                <p className="text-xs text-white/40">Duur: 2-3 uur</p>
                <p className="font-semibold text-[#d0a760]">vanaf €89</p>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-8 text-center hover:border-[#d0a760]/50 transition-all duration-300 group" data-testid="service-speakers">
              <div className="w-16 h-16 bg-[#d0a760]/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#d0a760]/20 transition-colors">
                <Wrench className="w-8 h-8 text-[#d0a760]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Speaker Upgrade</h3>
              <p className="text-sm text-white/60 mb-6">
                Vervangen van originele speakers voor beter geluid
              </p>
              <div className="space-y-2 pt-4 border-t border-zinc-800">
                <p className="text-xs text-white/40">Duur: 3-4 uur</p>
                <p className="font-semibold text-[#d0a760]">vanaf €129</p>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-8 text-center hover:border-[#d0a760]/50 transition-all duration-300 group" data-testid="service-complete">
              <div className="w-16 h-16 bg-[#d0a760]/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#d0a760]/20 transition-colors">
                <Trophy className="w-8 h-8 text-[#d0a760]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Complete Audio Systeem</h3>
              <p className="text-sm text-white/60 mb-6">
                Volledige audio upgrade met radio, speakers en subwoofer
              </p>
              <div className="space-y-2 pt-4 border-t border-zinc-800">
                <p className="text-xs text-white/40">Duur: 6-8 uur</p>
                <p className="font-semibold text-[#d0a760]">vanaf €299</p>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-8 text-center hover:border-[#d0a760]/50 transition-all duration-300 group" data-testid="service-custom">
              <div className="w-16 h-16 bg-[#d0a760]/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#d0a760]/20 transition-colors">
                <Users className="w-8 h-8 text-[#d0a760]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Custom Offerte</h3>
              <p className="text-sm text-white/60 mb-6">
                Op maat gemaakt systeem voor specifieke wensen
              </p>
              <div className="space-y-2 pt-4 border-t border-zinc-800">
                <p className="text-xs text-white/40">Duur: Variabel</p>
                <p className="font-semibold text-[#d0a760]">Op aanvraag</p>
              </div>
            </div>
          </StaggerContainer>
        </div>
      </section>

      <SectionDivider variant="curve" fromColor="black" toColor="black" />

      {/* Why Choose Us */}
      <section className="py-20 md:py-28 bg-zinc-900">
        <div className="container px-4 md:px-8 lg:px-16 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div>
              <ScrollReveal>
                <div className="flex items-center gap-2 mb-4">
                  <Check className="w-5 h-5 text-[#d0a760]" />
                  <span className="text-[#d0a760] text-sm font-medium tracking-wider uppercase">Waarom Ons</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-light text-white mb-8">
                  Waarom voor onze installatie service kiezen?
                </h2>
              </ScrollReveal>
              
              <div className="space-y-8">
                <ScrollReveal delay={100}>
                  <div className="flex items-start gap-5" data-testid="benefit-fast-service">
                    <div className="w-14 h-14 bg-[#d0a760]/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-7 h-7 text-[#d0a760]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Snelle Service</h3>
                      <p className="text-white/60 leading-relaxed">
                        De meeste installaties zijn binnen dezelfde dag klaar. Gemiddeld 2-4 uur per installatie.
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
                
                <ScrollReveal delay={200}>
                  <div className="flex items-start gap-5" data-testid="benefit-warranty">
                    <div className="w-14 h-14 bg-[#d0a760]/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-7 h-7 text-[#d0a760]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">2 Jaar Garantie</h3>
                      <p className="text-white/60 leading-relaxed">
                        Volledige garantie op alle installaties. Als er iets mis gaat, maken wij het kosteloos in orde.
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
                
                <ScrollReveal delay={300}>
                  <div className="flex items-start gap-5" data-testid="benefit-certified">
                    <div className="w-14 h-14 bg-[#d0a760]/10 flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-7 h-7 text-[#d0a760]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Gecertificeerde Monteurs</h3>
                      <p className="text-white/60 leading-relaxed">
                        Onze technici zijn gespecialiseerd in car audio en hebben jarenlange ervaring.
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
                
                <ScrollReveal delay={400}>
                  <div className="flex items-start gap-5" data-testid="benefit-flexible">
                    <div className="w-14 h-14 bg-[#d0a760]/10 flex items-center justify-center flex-shrink-0">
                      <CalendarBlank className="w-7 h-7 text-[#d0a760]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Flexibele Planning</h3>
                      <p className="text-white/60 leading-relaxed">
                        Ook avond- en weekendafspraken mogelijk. Plan eenvoudig online je afspraak.
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>

            <div className="space-y-6">
              <ScrollReveal delay={200}>
                <div 
                  className="aspect-[4/3] bg-cover bg-center"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1487754180451-c456f719a1fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600')"
                  }}
                />
              </ScrollReveal>
              
              <ScrollReveal delay={300}>
                <div className="bg-zinc-950 border border-zinc-800 p-6">
                  <h4 className="font-semibold text-white mb-5">Wat kun je verwachten?</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Coffee className="w-5 h-5 text-[#d0a760]" />
                      <span className="text-sm text-white/80">Comfortabele wachtruimte met WiFi</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Car className="w-5 h-5 text-[#d0a760]" />
                      <span className="text-sm text-white/80">OEM-look resultaat</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Users className="w-5 h-5 text-[#d0a760]" />
                      <span className="text-sm text-white/80">Persoonlijke uitleg na installatie</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <MapPin className="w-5 h-5 text-[#d0a760]" />
                      <span className="text-sm text-white/80">Gratis parkeren voor de deur</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      <GoldAccentLine />

      {/* Contact & Location */}
      <section className="py-20 md:py-28 bg-zinc-950">
        <div className="container px-4 md:px-8 lg:px-16 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Info */}
            <div>
              <ScrollReveal>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-[#d0a760]" />
                  <span className="text-[#d0a760] text-sm font-medium tracking-wider uppercase">Locatie</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-light text-white mb-8">Bezoek onze Studio</h2>
              </ScrollReveal>
              
              <ScrollReveal delay={100}>
                <div className="bg-black border border-zinc-800 p-8 mb-6">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <MapPin className="w-5 h-5 text-[#d0a760] mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-white">Dr. Nolenslaan 157-C (Hal 3)</p>
                        <p className="text-sm text-white/60">6136 GM Sittard</p>
                        <p className="text-xs text-white/40 mt-1">Gratis parkeren beschikbaar</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <Clock className="w-5 h-5 text-[#d0a760] mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-white">Openingstijden</p>
                        <div className="text-sm text-white/60 space-y-1 mt-1">
                          <p>Maandag - Vrijdag: 9:00 - 17:00</p>
                          <p>Zaterdag: 9:00 - 13:00</p>
                          <p>Zondag: Gesloten</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <Phone className="w-5 h-5 text-[#d0a760] mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-white">+31(0)85 - 27 33 625</p>
                        <p className="text-sm text-white/60">Bereikbaar tijdens openingstijden</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-8 bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none py-6 font-medium"
                    size="lg" 
                    data-testid="button-contact-studio"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Bel voor meer informatie
                  </Button>
                </div>
              </ScrollReveal>
            </div>

            {/* Testimonials */}
            <div>
              <ScrollReveal>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-[#d0a760]" />
                  <span className="text-[#d0a760] text-sm font-medium tracking-wider uppercase">Reviews</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-light text-white mb-8">Wat klanten zeggen</h2>
              </ScrollReveal>
              
              <div className="space-y-6">
                <ScrollReveal delay={100}>
                  <div className="bg-black border border-zinc-800 p-6" data-testid="testimonial-installation">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-[#d0a760] fill-current" />
                        ))}
                      </div>
                      <span className="ml-3 text-sm text-white/40">5/5</span>
                    </div>
                    <p className="text-white/80 mb-5 leading-relaxed">
                      "Perfecte installatie van mijn nieuwe Alpine systeem. Het ziet eruit alsof het 
                      van de fabriek komt en de geluidskwaliteit is fantastisch!"
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-zinc-800 flex items-center justify-center">
                        <User className="w-5 h-5 text-white/60" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Jan Smits</p>
                        <p className="text-sm text-white/40">BMW 3-Serie</p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={200}>
                  <div className="bg-black border border-zinc-800 p-6" data-testid="testimonial-professional">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-[#d0a760] fill-current" />
                        ))}
                      </div>
                      <span className="ml-3 text-sm text-white/40">5/5</span>
                    </div>
                    <p className="text-white/80 mb-5 leading-relaxed">
                      "Zeer professionele service. Op tijd klaar en duidelijke uitleg over 
                      alle functies. Echt een aanrader!"
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-zinc-800 flex items-center justify-center">
                        <User className="w-5 h-5 text-white/60" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Maria Jansen</p>
                        <p className="text-sm text-white/40">VW Golf</p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
