import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { ScrollReveal, StaggerContainer, StaggerItem, SectionDivider, GoldAccentLine, ImageReveal, CountUp } from "@/components/ScrollAnimations";
import { BassPulse } from "@/components/AudioPulseEffects";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Phone, 
  Clock, 
  Award, 
  Users, 
  Star,
  Car,
  Heart,
  ArrowRight,
  Shield,
  Headphones
} from "lucide-react";
import { Link } from "wouter";

import studioImage1 from "@assets/C5025.00_06_16_04.Still024-1-2048x1152_1757024538840.jpg";
import studioImage2 from "@assets/C5025.00_17_23_55.Still031-1-2048x1152_1757024658861.jpg";
import studioImage3 from "@assets/C5025.00_31_30_11.Still045-1-1-2048x1152_1757024535822.jpg";
import heroImage from "@assets/C5025.00_33_41_03.Still050-2048x1152_1757024504641.jpg";

export default function About() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black">
      <Header onCartOpen={() => setIsCartOpen(true)} variant="transparent" />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <main className="flex-grow">
        {/* Hero Section - Full Viewport */}
        <section className="relative min-h-screen min-h-[100svh] w-full overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/80" />
          
          <BassPulse className="opacity-40" />
          
          <div className="relative z-10 h-full min-h-screen min-h-[100svh] flex flex-col justify-center items-center text-center px-6 md:px-12">
            <ScrollReveal direction="up" delay={200}>
              <div className="w-16 h-px bg-[#d0a760] mb-8" />
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={400}>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-light text-white leading-tight mb-6">
                Car Audio Limburg
              </h1>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={600}>
              <p className="text-[#d0a760] text-xl md:text-2xl font-light tracking-wider mb-8">
                To enjoy a safe ride
              </p>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={800}>
              <p className="text-white/70 text-lg md:text-xl max-w-2xl leading-relaxed">
                Al 10 jaar dé specialist in Limburg op het gebied van mobiliteit beleving en audio in een voertuig. Wij zorgen voor gemak en plezier onderweg.
              </p>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={1000}>
              <div className="w-16 h-px bg-[#d0a760] mt-12" />
            </ScrollReveal>
          </div>
        </section>

        {/* Transition: Black to White */}
        <SectionDivider variant="curve" fromColor="black" toColor="white" />

        {/* Story Section - WHITE */}
        <section className="py-24 md:py-32 bg-white">
          <div className="container px-6 md:px-12 lg:px-24 mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <ScrollReveal direction="left">
                <div>
                  <span className="text-[#d0a760] text-sm font-medium tracking-wider uppercase mb-4 block">
                    Onze Visie
                  </span>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-black mb-8 leading-tight">
                    Passie voor
                    <br />
                    <span className="text-[#d0a760]">perfecte audio</span>
                  </h2>
                  <div className="space-y-6 text-zinc-600 text-lg leading-relaxed">
                    <p>
                      De afgelopen 30 jaar heeft de automobielindustrie enorme stappen gemaakt en ontwikkelen fabrikanten continu nieuwe innovaties. En dus is de kans groot dat uw voertuig niet is uitgerust met deze nieuwste snufjes.
                    </p>
                    <p>
                      Innovatie speelt een grote rol in ieders leven en voedt onze passie en drang naar verbetering. Met deze combinatie in gedachten zoeken wij continu naar antwoorden op deze uitdagingen.
                    </p>
                    <p>
                      Wij zijn Dennis en Romy, de enthousiaste eigenaren van Car Audio Limburg. Car Audio Limburg zet zich in om producten en diensten aan te bieden die uw mobiliteit ervaringen slimmer, veiliger en comfortabeler maken.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
              
              <ScrollReveal direction="right" delay={200}>
                <ImageReveal 
                  src={studioImage1} 
                  alt="Car Audio Limburg Studio" 
                  className="aspect-[4/3]"
                />
              </ScrollReveal>
            </div>
          </div>
          
          <GoldAccentLine className="mt-24 max-w-4xl mx-auto" />
        </section>

        {/* Transition: White to Black */}
        <SectionDivider variant="angle" fromColor="white" toColor="black" />

        {/* Statistics Section - BLACK */}
        <section className="py-24 md:py-32 bg-black relative overflow-hidden">
          <BassPulse className="opacity-30" />
          <div className="container px-6 md:px-12 lg:px-24 mx-auto relative z-10">
            <ScrollReveal>
              <div className="text-center mb-16">
                <span className="text-[#d0a760] text-sm font-medium tracking-wider uppercase mb-4 block">
                  Onze Cijfers
                </span>
                <h2 className="text-3xl md:text-4xl font-light text-white">
                  Waarom kiezen voor ons
                </h2>
              </div>
            </ScrollReveal>

            <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8" staggerDelay={100}>
              <StaggerItem>
                <div className="bg-zinc-900 border border-zinc-800 p-8 text-center group hover:border-[#d0a760]/50 transition-colors duration-300" data-testid="stat-experience">
                  <Award className="h-12 w-12 text-[#d0a760] mx-auto mb-6" />
                  <div className="text-4xl md:text-5xl font-light text-white mb-2">
                    <CountUp end={10} suffix="+" />
                  </div>
                  <p className="text-white/60 text-sm uppercase tracking-wider">Jaar Ervaring</p>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="bg-zinc-900 border border-zinc-800 p-8 text-center group hover:border-[#d0a760]/50 transition-colors duration-300" data-testid="stat-customers">
                  <Users className="h-12 w-12 text-[#d0a760] mx-auto mb-6" />
                  <div className="text-4xl md:text-5xl font-light text-white mb-2">
                    <CountUp end={500} suffix="+" />
                  </div>
                  <p className="text-white/60 text-sm uppercase tracking-wider">Tevreden Klanten</p>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="bg-zinc-900 border border-zinc-800 p-8 text-center group hover:border-[#d0a760]/50 transition-colors duration-300" data-testid="stat-certified">
                  <Shield className="h-12 w-12 text-[#d0a760] mx-auto mb-6" />
                  <div className="text-4xl md:text-5xl font-light text-white mb-2">
                    100%
                  </div>
                  <p className="text-white/60 text-sm uppercase tracking-wider">Gecertificeerd</p>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="bg-zinc-900 border border-zinc-800 p-8 text-center group hover:border-[#d0a760]/50 transition-colors duration-300" data-testid="stat-premium">
                  <Star className="h-12 w-12 text-[#d0a760] mx-auto mb-6" />
                  <div className="text-4xl md:text-5xl font-light text-white mb-2">
                    A+
                  </div>
                  <p className="text-white/60 text-sm uppercase tracking-wider">Premium Kwaliteit</p>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        {/* Transition: Black to White */}
        <SectionDivider variant="wave" fromColor="black" toColor="white" />

        {/* Services Section - WHITE */}
        <section className="py-24 md:py-32 bg-white">
          <div className="container px-6 md:px-12 lg:px-24 mx-auto">
            <ScrollReveal>
              <div className="text-center mb-16">
                <span className="text-[#d0a760] text-sm font-medium tracking-wider uppercase mb-4 block">
                  Onze Diensten
                </span>
                <h2 className="text-3xl md:text-4xl font-light text-black mb-4">
                  Onze Specialiteiten
                </h2>
                <p className="text-zinc-600 text-lg max-w-2xl mx-auto">
                  Van advies tot installatie - wij begeleiden u door het hele proces
                </p>
              </div>
            </ScrollReveal>

            <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" staggerDelay={150}>
              <StaggerItem>
                <div className="bg-zinc-50 border border-zinc-200 p-8 h-full group hover:border-[#d0a760] transition-colors duration-300" data-testid="service-installation">
                  <Car className="h-12 w-12 text-[#d0a760] mb-6" />
                  <h3 className="text-xl font-medium text-black mb-4">
                    Complete Installaties
                  </h3>
                  <p className="text-zinc-600 mb-6 leading-relaxed">
                    Van multimedia systemen tot complete audiosystemen. 
                    Professioneel geïnstalleerd in onze werkplaats.
                  </p>
                  <span className="inline-block text-[#d0a760] text-sm font-medium border border-[#d0a760] px-4 py-2">
                    €89 installatiekosten
                  </span>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="bg-zinc-50 border border-zinc-200 p-8 h-full group hover:border-[#d0a760] transition-colors duration-300" data-testid="service-premium">
                  <Headphones className="h-12 w-12 text-[#d0a760] mb-6" />
                  <h3 className="text-xl font-medium text-black mb-4">
                    Premium Audio
                  </h3>
                  <p className="text-zinc-600 mb-6 leading-relaxed">
                    High-end audiosystemen met DSP tuning voor de perfecte 
                    geluidsbeleving op maat van uw voertuig.
                  </p>
                  <span className="inline-block text-[#d0a760] text-sm font-medium border border-[#d0a760] px-4 py-2">
                    Custom maatwerk
                  </span>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="bg-zinc-50 border border-zinc-200 p-8 h-full group hover:border-[#d0a760] transition-colors duration-300" data-testid="service-advice">
                  <Heart className="h-12 w-12 text-[#d0a760] mb-6" />
                  <h3 className="text-xl font-medium text-black mb-4">
                    Persoonlijk Advies
                  </h3>
                  <p className="text-zinc-600 mb-6 leading-relaxed">
                    Elk project is uniek. Wij denken met u mee voor de beste 
                    oplossing binnen uw budget en wensen.
                  </p>
                  <span className="inline-block text-[#d0a760] text-sm font-medium border border-[#d0a760] px-4 py-2">
                    Gratis adviesgesprek
                  </span>
                </div>
              </StaggerItem>
            </StaggerContainer>

            <ScrollReveal delay={400}>
              <div className="mt-16 text-center">
                <Link href="/products">
                  <Button 
                    className="bg-black text-white hover:bg-zinc-900 px-8 py-6 rounded-none"
                    data-testid="button-view-products"
                  >
                    Bekijk Producten
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Transition: White to Black */}
        <SectionDivider variant="curve" fromColor="white" toColor="black" />

        {/* Image Gallery Section - BLACK */}
        <section className="py-24 md:py-32 bg-black relative overflow-hidden">
          <BassPulse className="opacity-20" />
          <div className="container px-6 md:px-12 lg:px-24 mx-auto relative z-10">
            <ScrollReveal>
              <div className="text-center mb-16">
                <span className="text-[#d0a760] text-sm font-medium tracking-wider uppercase mb-4 block">
                  Onze Studio
                </span>
                <h2 className="text-3xl md:text-4xl font-light text-white">
                  Achter de schermen
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ScrollReveal direction="up" delay={100}>
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={studioImage1} 
                    alt="Car Audio Limburg Studio" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={200}>
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={studioImage2} 
                    alt="Car Audio Limburg Werkplaats" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={300}>
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={studioImage3} 
                    alt="Car Audio Limburg Showroom" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Transition: Black to White */}
        <SectionDivider variant="angle" fromColor="black" toColor="white" />

        {/* Contact Section - WHITE */}
        <section className="py-24 md:py-32 bg-white">
          <div className="container px-6 md:px-12 lg:px-24 mx-auto">
            <ScrollReveal>
              <div className="text-center mb-16">
                <span className="text-[#d0a760] text-sm font-medium tracking-wider uppercase mb-4 block">
                  Contact
                </span>
                <h2 className="text-3xl md:text-4xl font-light text-black mb-4">
                  Bezoek Onze Werkplaats
                </h2>
                <p className="text-zinc-600 text-lg max-w-2xl mx-auto">
                  Kom langs voor advies of maak een afspraak voor installatie
                </p>
              </div>
            </ScrollReveal>

            <StaggerContainer className="grid md:grid-cols-3 gap-8" staggerDelay={150}>
              <StaggerItem>
                <div className="bg-zinc-50 border border-zinc-200 p-8 text-center h-full" data-testid="contact-address">
                  <MapPin className="h-12 w-12 text-[#d0a760] mx-auto mb-6" />
                  <h3 className="text-xl font-medium text-black mb-4">Adres</h3>
                  <p className="text-zinc-600 leading-relaxed">
                    Dr. Nolenslaan 157c<br />
                    6136 GM Sittard<br />
                    Nederland
                  </p>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="bg-zinc-50 border border-zinc-200 p-8 text-center h-full" data-testid="contact-phone">
                  <Phone className="h-12 w-12 text-[#d0a760] mx-auto mb-6" />
                  <h3 className="text-xl font-medium text-black mb-4">Telefoon</h3>
                  <p className="text-zinc-600">
                    <a href="tel:0852733625" className="hover:text-[#d0a760] transition-colors text-lg">
                      085 - 27 33 625
                    </a>
                  </p>
                  <p className="text-zinc-500 text-sm mt-3">
                    WhatsApp beschikbaar
                  </p>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="bg-zinc-50 border border-zinc-200 p-8 text-center h-full" data-testid="contact-hours">
                  <Clock className="h-12 w-12 text-[#d0a760] mx-auto mb-6" />
                  <h3 className="text-xl font-medium text-black mb-4">Openingstijden</h3>
                  <div className="text-zinc-600 space-y-2 text-sm">
                    <p className="font-medium text-black mb-2">Showroom:</p>
                    <p>Ma-Do: 13:30 - 17:30</p>
                    <p>Vrijdag: 08:30 - 15:00</p>
                    <p className="font-medium text-black mt-4 mb-2">Inbouwstudio:</p>
                    <p>Ma-Do: 08:30 - 17:30</p>
                    <p>Vrijdag: 08:30 - 12:30</p>
                    <p className="text-[#d0a760] font-medium mt-3">Enkel op afspraak</p>
                  </div>
                </div>
              </StaggerItem>
            </StaggerContainer>

            <ScrollReveal delay={400}>
              <div className="mt-16 text-center">
                <Link href="/contact">
                  <Button 
                    className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 px-8 py-6 rounded-none"
                    data-testid="button-contact"
                  >
                    Neem Contact Op
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
          
          <GoldAccentLine className="mt-24 max-w-4xl mx-auto" />
        </section>

        {/* Transition: White to Black for Footer */}
        <SectionDivider variant="wave" fromColor="white" toColor="black" />
      </main>

      <Footer />
    </div>
  );
}
