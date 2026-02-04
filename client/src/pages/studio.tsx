import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { Button } from "@/components/ui/button";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ScrollAnimations";
import { SEO } from "@/components/SEO";
import { BreadcrumbSchema } from "@/components/StructuredData";
import { 
  ExternalLink, 
  Users, 
  Settings, 
  Wrench, 
  CheckCircle, 
  Sparkles,
  MapPin,
  Phone,
  ArrowRight,
  Play
} from "lucide-react";
import { SiBmw, SiMercedes, SiPorsche, SiAudi, SiVolvo } from "react-icons/si";

export default function StudioPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const steps = [
    {
      number: "1",
      title: "Kennismaking & Klantwens",
      description: "We nodigen je uit voor een demonstratie in onze showroom, waar je diverse componenten kunt beluisteren. Daarna bespreken we jouw wensen uitgebreid."
    },
    {
      number: "2",
      title: "Advies op maat",
      description: "We gebruiken onze expertise om de perfecte setting te vinden, afgestemd op jouw auto. Hierna stellen we een offerte op maat op."
    },
    {
      number: "3",
      title: "Onze inbouwstudio",
      description: "Na akkoord plannen we een montageafspraak. Bij aankomst voeren we een grondige controle uit en wordt de auto voorzien van bescherming."
    },
    {
      number: "4",
      title: "Kwaliteit en afstellen",
      description: "We gebruiken hoogwaardige aansluitmaterialen en de nieuwste software voor het optimale resultaat. Je ontvangt 1 jaar garantie op onze inbouwservice."
    },
    {
      number: "5",
      title: "Tot slot",
      description: "We testen de nieuwe setting uitgebreid, poetsen het interieur en leggen uit wat er is gedaan. Een upgrade die al jouw verwachtingen overtreft."
    }
  ];

  const brands = [
    { icon: SiBmw, name: "BMW", href: "https://caraudiolimburg.studio/merk/bmw/" },
    { icon: SiMercedes, name: "Mercedes", href: "https://caraudiolimburg.studio/merk/mercedes-benz/" },
    { icon: SiPorsche, name: "Porsche", href: "https://caraudiolimburg.studio/merk/porsche/" },
    { icon: SiAudi, name: "Audi", href: "https://caraudiolimburg.studio/merk/audi/" },
    { icon: SiVolvo, name: "Volvo", href: "https://caraudiolimburg.studio/merk/volvo/" },
  ];

  const packages = [
    {
      name: "Hifi",
      price: "vanaf €800",
      description: "Verbeter je autoluidsprekers met hoogwaardige componenten voor een merkbaar beter geluid."
    },
    {
      name: "Premium",
      price: "vanaf €2.000",
      description: "Complete audio-upgrade met versterker, speakers en professionele afstelling voor een indrukwekkende geluidservaring."
    },
    {
      name: "Signature",
      price: "vanaf €3.000",
      description: "Het ultieme audiosysteem met high-end componenten, custom installatie en perfecte akoestische afstemming."
    }
  ];

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <SEO 
        title="Installatie Studio | Professionele Montage"
        description="Ontdek onze professionele inbouwstudio voor car audio installatie. Vakkundige montage, advies op maat en 1 jaar garantie op de inbouwservice."
        canonical="/studio"
        keywords="installatie studio, car audio montage, inbouw, BMW, Mercedes, Porsche, Audi"
      />
      <BreadcrumbSchema items={[
        { name: "Home", url: "/" },
        { name: "Installatie Studio", url: "/studio" }
      ]} />
      
      <Header onCartOpen={() => setIsCartOpen(true)} />
      
      {/* Hero Section */}
      <section className="relative min-h-screen min-h-[100svh] flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070')",
            filter: "brightness(0.3)"
          }}
        />
        
        <div className="container px-4 md:px-8 lg:px-16 mx-auto relative z-20 text-center">
          <ScrollReveal>
            <p className="text-[#d0a760] text-sm md:text-base tracking-[0.3em] uppercase mb-6">
              Car Audio Limburg Inbouwstudio
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              For a complete<br />
              <span className="text-[#d0a760]">driving experience</span>
            </h1>
            <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              Met passie voor auto's en muziek, nemen wij je graag mee in onze wereld
              van audio upgrades en video in motion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://caraudiolimburg.studio/offerte-aanvragen/" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-[#d0a760] text-black hover:bg-[#b8954e] px-8 py-6 text-lg font-semibold w-full sm:w-auto">
                  Vraag een offerte aan
                  <ExternalLink className="w-5 h-5 ml-2" />
                </Button>
              </a>
              <a href="https://caraudiolimburg.studio/" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 hover:text-white px-8 py-6 text-lg w-full sm:w-auto">
                  Bezoek caraudiolimburg.studio
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </a>
            </div>
          </ScrollReveal>
        </div>

        {/* Brand logos */}
        <div className="absolute bottom-12 left-0 right-0 z-20">
          <div className="container px-4 mx-auto">
            <div className="flex justify-center items-center gap-8 md:gap-16 opacity-50">
              {brands.map((brand) => (
                <a 
                  key={brand.name}
                  href={brand.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-[#d0a760] transition-colors"
                >
                  <brand.icon className="w-8 h-8 md:w-10 md:h-10" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-20 bg-zinc-950">
        <div className="container px-4 md:px-8 lg:px-16 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <div>
                <p className="text-[#d0a760] text-sm tracking-wider uppercase mb-4">Over onze studio</p>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Maak kennis met Car Audio Limburg Inbouwstudio
                </h2>
                <div className="space-y-4 text-white/60">
                  <p>
                    Welkom bij Car Audio Limburg. Wij bieden zowel een inbouwstudio als een webshop voor 
                    auto-audio onderdelen. In onze inbouwstudio hebben we direct toegang tot een breed 
                    assortiment aan onderdelen en producten.
                  </p>
                  <p>
                    In de afgelopen jaren hebben we veel klanten geholpen met oplossingen zoals prachtige 
                    geluidssystemen, RSE-schermen en CarPlay-installaties. Door de groeiende vraag hebben 
                    we besloten dit op te splitsen in twee websites.
                  </p>
                  <p className="text-white font-medium">
                    Deze website is gericht op onze webshop voor losse producten en onderdelen. 
                    Voor installaties en inbouwdiensten bezoek je onze studio website.
                  </p>
                </div>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <a href="https://caraudiolimburg.studio/" target="_blank" rel="noopener noreferrer">
                    <Button className="bg-[#d0a760] text-black hover:bg-[#b8954e]">
                      Naar de Studio
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                  <a href="/webshop">
                    <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800 hover:text-white">
                      Bekijk onze producten
                    </Button>
                  </a>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="relative">
                <div className="aspect-video bg-zinc-900 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2032"
                    alt="Car Audio Studio"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <a 
                      href="https://caraudiolimburg.studio/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-20 h-20 bg-[#d0a760] flex items-center justify-center hover:bg-[#b8954e] transition-colors"
                    >
                      <Play className="w-8 h-8 text-black ml-1" />
                    </a>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-20 bg-black">
        <div className="container px-4 md:px-8 lg:px-16 mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-[#d0a760] text-sm tracking-wider uppercase mb-4">Onze pakketten</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Audio upgrades voor elke wens
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Van subtiele verbeteringen tot complete high-end systemen - wij hebben een pakket dat bij jou past.
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <StaggerItem key={pkg.name}>
                <div className={`bg-zinc-900 border ${index === 2 ? 'border-[#d0a760]' : 'border-zinc-800'} p-8 h-full flex flex-col`}>
                  {index === 2 && (
                    <div className="bg-[#d0a760] text-black text-xs font-semibold px-3 py-1 inline-block mb-4 self-start">
                      POPULAIR
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                  <p className="text-[#d0a760] text-lg font-semibold mb-4">{pkg.price}</p>
                  <p className="text-white/60 flex-1">{pkg.description}</p>
                  <a 
                    href="https://caraudiolimburg.studio/offerte-aanvragen/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-6"
                  >
                    <Button 
                      variant={index === 2 ? "default" : "outline"}
                      className={index === 2 
                        ? "w-full bg-[#d0a760] text-black hover:bg-[#b8954e]" 
                        : "w-full border-zinc-700 text-white hover:bg-zinc-800 hover:text-white"
                      }
                    >
                      Offerte aanvragen
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-20 bg-zinc-950">
        <div className="container px-4 md:px-8 lg:px-16 mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-[#d0a760] text-sm tracking-wider uppercase mb-4">Onze werkwijze</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ontdek onze authentieke aanpak
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Van kennismaking tot oplevering - wij zorgen voor een naadloze ervaring.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {steps.map((step, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <div className="bg-black border border-zinc-800 p-6 h-full relative">
                  <div className="text-5xl font-bold text-[#d0a760]/20 absolute top-4 right-4">
                    {step.number}
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-lg font-semibold text-white mb-3 pr-8">{step.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Location & Contact */}
      <section className="py-20 bg-black">
        <div className="container px-4 md:px-8 lg:px-16 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <ScrollReveal>
              <div className="bg-zinc-900 border border-zinc-800 p-8 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-[#d0a760]/10">
                    <MapPin className="w-6 h-6 text-[#d0a760]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Onze locatie</h3>
                </div>
                <p className="text-white/60 mb-6">
                  Onze inbouwstudio ligt in Sittard, Limburg. Hier ontvangen we klanten in onze showroom 
                  om een indruk te geven van wie wij zijn en wat we precies doen.
                </p>
                <p className="text-white/60 mb-6">
                  In de showroom kun je zelf de geluidskwaliteit ervaren en ons aanbod bekijken, 
                  zodat je precies weet wat er in je auto wordt ingebouwd.
                </p>
                <div className="space-y-3 text-white/70">
                  <p className="font-medium text-white">Dr. Nolenslaan 157c</p>
                  <p>6136 GM Sittard</p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#d0a760]" />
                    <a href="tel:0852733625" className="hover:text-[#d0a760]">085-27 33 625</a>
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="bg-zinc-900 border border-zinc-800 p-8 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-[#d0a760]/10">
                    <Sparkles className="w-6 h-6 text-[#d0a760]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Klaar om te starten?</h3>
                </div>
                <p className="text-white/60 mb-6">
                  Je bent slechts een stap verwijderd van jouw persoonlijke offerte. 
                  Vraag gratis en vrijblijvend een offerte aan via onze studio website.
                </p>
                <div className="space-y-4">
                  <a 
                    href="https://caraudiolimburg.studio/offerte-aanvragen/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button size="lg" className="w-full bg-[#d0a760] text-black hover:bg-[#b8954e] py-6">
                      Vraag een offerte aan
                      <ExternalLink className="w-5 h-5 ml-2" />
                    </Button>
                  </a>
                  <a 
                    href="https://caraudiolimburg.studio/contact/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="outline" size="lg" className="w-full border-zinc-700 text-white hover:bg-zinc-800 hover:text-white py-6">
                      Neem contact op
                      <ExternalLink className="w-5 h-5 ml-2" />
                    </Button>
                  </a>
                  <a 
                    href="https://caraudiolimburg.studio/portfolio/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="ghost" size="lg" className="w-full text-white/60 hover:text-white hover:bg-white/5 py-6">
                      Bekijk ons portfolio
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </a>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-[#d0a760]">
        <div className="container px-4 md:px-8 lg:px-16 mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-2xl md:text-3xl font-bold text-black mb-4">
              Benieuwd wat we voor jou kunnen betekenen?
            </h2>
            <p className="text-black/70 mb-8 max-w-xl mx-auto">
              Bezoek onze studio website voor meer informatie over installaties, portfolio en om een vrijblijvende offerte aan te vragen.
            </p>
            <a href="https://caraudiolimburg.studio/" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-black text-white hover:bg-zinc-900 px-8 py-6 text-lg">
                Bezoek caraudiolimburg.studio
                <ExternalLink className="w-5 h-5 ml-2" />
              </Button>
            </a>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
