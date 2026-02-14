import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { ScrollReveal, StaggerContainer, StaggerItem, SectionDivider, GoldAccentLine, ImageReveal, CountUp } from "@/components/ScrollAnimations";
import { BassPulse } from "@/components/AudioPulseEffects";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { BreadcrumbSchema } from "@/components/StructuredData";
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
      <SEO 
        title="Over Ons"
        description="Leer meer over Car Audio Limburg - Met passie voor auto's en muziek. Al meer dan 10 jaar specialist in premium car audio systemen en professionele installatie in Limburg."
        canonical="/over-ons"
        keywords="over ons, car audio limburg, installatie studio, Sittard"
      />
      <BreadcrumbSchema items={[
        { name: "Home", url: "/" },
        { name: "Over Ons", url: "/over-ons" }
      ]} />
      
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
                Met passie voor auto's en muziek
              </p>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={800}>
              <p className="text-white/70 text-lg md:text-xl max-w-2xl leading-relaxed">
                Al meer dan 10 jaar helpen wij autoliefhebbers in Limburg aan de perfecte audio-ervaring. Met vakkundige montage, premium merken en persoonlijke aandacht maken wij van elke rit een beleving.
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
                    Ons Verhaal
                  </span>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-black mb-8 leading-tight">
                    Passie voor
                    <br />
                    <span className="text-[#d0a760]">auto's en muziek</span>
                  </h2>
                  <div className="space-y-6 text-zinc-600 text-lg leading-relaxed">
                    <p>
                      Welkom bij Car Audio Limburg! Wij zijn Dennis en Romy, en al meer dan 10 jaar delen wij onze passie voor auto's en muziek met klanten uit heel Limburg en daarbuiten. Wat begon als een liefde voor perfecte geluidsbeleving, is uitgegroeid tot een professionele inbouwstudio én webshop.
                    </p>
                    <p>
                      In onze <a href="https://caraudiolimburg.studio" target="_blank" rel="noopener noreferrer" className="text-[#d0a760] hover:underline font-medium">inbouwstudio in Sittard</a> verzorgen wij vakkundige montage van premium audiosystemen. Met jarenlange ervaring en oog voor detail zorgen wij ervoor dat elke installatie perfect is afgestemd op uw voertuig en wensen.
                    </p>
                    <p>
                      Via deze webshop bieden wij u de mogelijkheid om zelf hoogwaardige producten te bestellen van topmerken zoals <span className="font-medium text-black">Audison, Alpine, Hertz en Focal</span>. Of u nu zelf aan de slag wilt of de producten bij ons wilt laten inbouwen - wij staan voor u klaar.
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
                    <CountUp end={25} suffix="+" />
                  </div>
                  <p className="text-white/60 text-sm uppercase tracking-wider">Jaar Vakmanschap</p>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="bg-zinc-900 border border-zinc-800 p-8 text-center group hover:border-[#d0a760]/50 transition-colors duration-300" data-testid="stat-customers">
                  <Users className="h-12 w-12 text-[#d0a760] mx-auto mb-6" />
                  <div className="text-4xl md:text-5xl font-light text-white mb-2">
                    <CountUp end={500} suffix="+" />
                  </div>
                  <p className="text-white/60 text-sm uppercase tracking-wider">Blije Klanten</p>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="bg-zinc-900 border border-zinc-800 p-8 text-center group hover:border-[#d0a760]/50 transition-colors duration-300" data-testid="stat-certified">
                  <Shield className="h-12 w-12 text-[#d0a760] mx-auto mb-6" />
                  <div className="text-4xl md:text-5xl font-light text-white mb-2">
                    <CountUp end={15} suffix="+" />
                  </div>
                  <p className="text-white/60 text-sm uppercase tracking-wider">Premium Merken</p>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="bg-zinc-900 border border-zinc-800 p-8 text-center group hover:border-[#d0a760]/50 transition-colors duration-300" data-testid="stat-premium">
                  <Star className="h-12 w-12 text-[#d0a760] mx-auto mb-6" />
                  <div className="text-4xl md:text-5xl font-light text-white mb-2">
                    <CountUp end={2} />
                  </div>
                  <p className="text-white/60 text-sm uppercase tracking-wider">Jaar Garantie</p>
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
                  Wat Wij Bieden
                </span>
                <h2 className="text-3xl md:text-4xl font-light text-black mb-4">
                  Expertise & Kwaliteit
                </h2>
                <p className="text-zinc-600 text-lg max-w-2xl mx-auto">
                  Met jarenlange ervaring en een passie voor perfectie helpen wij u aan de beste audio-oplossing
                </p>
              </div>
            </ScrollReveal>

            <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" staggerDelay={150}>
              <StaggerItem>
                <div className="bg-zinc-50 border border-zinc-200 p-8 h-full group hover:border-[#d0a760] transition-colors duration-300" data-testid="service-installation">
                  <Car className="h-12 w-12 text-[#d0a760] mb-6" />
                  <h3 className="text-xl font-medium text-black mb-4">
                    Webshop Producten
                  </h3>
                  <p className="text-zinc-600 mb-6 leading-relaxed">
                    Ontdek ons uitgebreide assortiment van Audison, Alpine, Hertz 
                    en Focal. Premium producten direct bij u thuisbezorgd.
                  </p>
                  <span className="inline-block text-[#d0a760] text-sm font-medium border border-[#d0a760] px-4 py-2">
                    Snelle levering
                  </span>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="bg-zinc-50 border border-zinc-200 p-8 h-full group hover:border-[#d0a760] transition-colors duration-300" data-testid="service-premium">
                  <Headphones className="h-12 w-12 text-[#d0a760] mb-6" />
                  <h3 className="text-xl font-medium text-black mb-4">
                    Vakkundige Montage
                  </h3>
                  <p className="text-zinc-600 mb-6 leading-relaxed">
                    Laat uw producten professioneel inbouwen in onze studio. 
                    Met jarenlange ervaring garanderen wij perfectie.
                  </p>
                  <a href="https://caraudiolimburg.studio" target="_blank" rel="noopener noreferrer" className="inline-block text-[#d0a760] text-sm font-medium border border-[#d0a760] px-4 py-2 hover:bg-[#d0a760] hover:text-black transition-colors">
                    Naar de Studio
                  </a>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="bg-zinc-50 border border-zinc-200 p-8 h-full group hover:border-[#d0a760] transition-colors duration-300" data-testid="service-advice">
                  <Heart className="h-12 w-12 text-[#d0a760] mb-6" />
                  <h3 className="text-xl font-medium text-black mb-4">
                    Persoonlijke Aandacht
                  </h3>
                  <p className="text-zinc-600 mb-6 leading-relaxed">
                    Wij nemen de tijd om uw wensen te begrijpen. Geen standaard 
                    oplossingen, maar advies op maat voor uw situatie.
                  </p>
                  <span className="inline-block text-[#d0a760] text-sm font-medium border border-[#d0a760] px-4 py-2">
                    Gratis advies
                  </span>
                </div>
              </StaggerItem>
            </StaggerContainer>

            <ScrollReveal delay={400}>
              <div className="mt-16 text-center">
                <Link href="/webshop">
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
                  Onze Inbouwstudio
                </span>
                <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
                  Waar vakmanschap samenkomt
                </h2>
                <p className="text-white/60 text-lg max-w-2xl mx-auto">
                  In onze professionele studio in Sittard werken wij met precisie aan uw droomaudio
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ScrollReveal direction="up" delay={100}>
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={studioImage1} 
                    alt="Car Audio Limburg Studio" 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={200}>
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={studioImage2} 
                    alt="Car Audio Limburg Werkplaats" 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={300}>
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={studioImage3} 
                    alt="Car Audio Limburg Showroom" 
                    loading="lazy"
                    decoding="async"
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
                  Welkom in Sittard
                </span>
                <h2 className="text-3xl md:text-4xl font-light text-black mb-4">
                  Kom Gezellig Langs
                </h2>
                <p className="text-zinc-600 text-lg max-w-2xl mx-auto">
                  Wij ontvangen u graag in onze showroom in het hart van Limburg. Kom vrijblijvend luisteren en ervaar zelf het verschil van premium audio.
                </p>
              </div>
            </ScrollReveal>

            <StaggerContainer className="grid md:grid-cols-3 gap-8" staggerDelay={150}>
              <StaggerItem>
                <div className="bg-zinc-50 border border-zinc-200 p-8 text-center h-full" data-testid="contact-address">
                  <MapPin className="h-12 w-12 text-[#d0a760] mx-auto mb-6" />
                  <h3 className="text-xl font-medium text-black mb-4">Adres</h3>
                  <p className="text-zinc-600 leading-relaxed">
                    Dr. Nolenslaan 157-C (Hal 3)<br />
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
                    <p>Ma-Vr: 9:00 - 17:00</p>
                    <p className="font-medium text-black mt-4 mb-2">Inbouwstudio (op afspraak):</p>
                    <p>Ma-Vr: 8:30 - 17:00</p>
                    <p className="text-zinc-500 text-xs">Pauze: 12:30 - 13:00</p>
                    <p className="font-medium text-black mt-4 mb-2">Zaterdag showroom:</p>
                    <p>9:00 - 13:00</p>
                    <p className="text-zinc-500 mt-3">Zon- en feestdagen: Gesloten</p>
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
