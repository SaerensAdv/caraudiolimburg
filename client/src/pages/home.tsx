import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { QuoteForm } from "@/components/QuoteForm";
import { CartSidebar } from "@/components/CartSidebar";
import { VehicleHeroSelector } from "@/components/VehicleHeroSelector";
import { AudioWaveBackground, BassPulse } from "@/components/AudioPulseEffects";
import { ScrollReveal, StaggerContainer, Parallax, SectionDivider, GoldAccentLine, ImageReveal, CountUp } from "@/components/ScrollAnimations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  Wrench, 
  ShieldCheck, 
  Clock, 
  Phone,
  MapPin,
  Volume2,
  Car,
  Star,
  User,
  Check,
  Settings,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Product, Category } from "@shared/schema";
import { ProductAudioSkeleton } from "@/components/AudioSkeletons";
import { Link } from "wouter";

import heroImage from "@assets/C5025.00_33_41_03.Still050-2048x1152_1757024504641.jpg";
import studioImage1 from "@assets/C5025.00_06_16_04.Still024-1-2048x1152_1757024538840.jpg";
import studioImage2 from "@assets/C5025.00_17_23_55.Still031-1-2048x1152_1757024658861.jpg";
import studioImage3 from "@assets/C5025.00_31_30_11.Still045-1-1-2048x1152_1757024535822.jpg";
import promoVideo from "@assets/Verkorte-Video-Car-Audio-Limburg-Studio-1_1758238662915.mp4";

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<{make: string; model: string; year: number} | null>(null);
  const recommendationsRef = useRef<HTMLDivElement>(null);

  const { data: featuredProducts, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/products", { featured: true, limit: 4 }],
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: etrustedReviews } = useQuery<{ reviews: Array<{ id: string; rating: number; title: string; comment: string; createdAt: string; customer: { firstName: string; lastName: string } }> }>({
    queryKey: ["/api/etrusted/reviews", { limit: 6 }],
  });

  const handleVehicleSelect = (make: string, model: string, year: number) => {
    setSelectedVehicle({ make, model, year });
    setTimeout(() => {
      recommendationsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // SEO meta tags for homepage
  useEffect(() => {
    document.title = "Car Audio Limburg | Premium Car Audio & Professionele Installatie";
    
    const description = "Car Audio Limburg - Specialist in premium car audio systemen, Apple CarPlay, Android Auto en professionele installatie. Bezoek onze studio in Limburg.";
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);
    
    return () => {
      document.title = "Car Audio Limburg";
    };
  }, []);

  // LocalBusiness JSON-LD Schema for local SEO
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Car Audio Limburg",
    "description": "Specialist in premium car audio systemen, Apple CarPlay, Android Auto retrofit en professionele installatie.",
    "url": typeof window !== 'undefined' ? window.location.origin : "",
    "telephone": "+32-XXX-XX-XX-XX",
    "email": "info@caraudiolimburg.be",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Limburg",
      "addressCountry": "BE"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "50.9",
      "longitude": "5.3"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "10:00",
        "closes": "16:00"
      }
    ],
    "priceRange": "€€€",
    "image": typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : "",
    "sameAs": [],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "127"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Car Audio Producten",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "Apple CarPlay Systemen"
        },
        {
          "@type": "OfferCatalog",
          "name": "Android Auto Systemen"
        },
        {
          "@type": "OfferCatalog",
          "name": "Versterkers"
        },
        {
          "@type": "OfferCatalog",
          "name": "Subwoofers"
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-black scroll-smooth">
      {/* LocalBusiness JSON-LD for Local SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      
      <Header onCartOpen={() => setIsCartOpen(true)} variant="transparent" />
      
      {/* Hero Section - Full Screen Premium with Vehicle Selector */}
      <section className="relative min-h-screen min-h-[100svh] w-full overflow-hidden">
        <Parallax speed={0.3} className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
            style={{
              backgroundImage: `url(${heroImage})`
            }}
          />
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />
        
        <BassPulse />
        
        <div className="relative z-10 h-full min-h-screen min-h-[100svh] flex flex-col justify-center pt-20 pb-8 px-8 md:px-16 lg:px-24">
          <div className="max-w-3xl">
            <ScrollReveal direction="up" delay={200}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight mb-6">
                Met passie voor
                <br />
                <span className="font-normal">auto's en muziek</span>
              </h1>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={400}>
              <p className="text-white/70 text-lg mb-10 max-w-xl">
                Wij nemen je graag mee in onze wereld van hoogwaardige car audio. 
                Ontdek wat wij voor jouw auto kunnen betekenen.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={600}>
              <VehicleHeroSelector onVehicleSelect={handleVehicleSelect} />
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={800}>
              <div className="mt-8 flex items-center gap-6">
                <Link href="/products">
                  <Button 
                    variant="ghost"
                    className="text-white/70 hover:text-white hover:bg-transparent rounded-none px-0 underline-offset-4 hover:underline"
                    data-testid="button-browse-all"
                  >
                    Ontdek onze collectie
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>

        <AudioWaveBackground />
      </section>

      {/* Vehicle Recommendations Section - Shows after selection */}
      {selectedVehicle && (
        <section 
          ref={recommendationsRef}
          id="vehicle-recommendations" 
          className="py-24 md:py-32 bg-zinc-950 relative overflow-hidden"
        >
          <BassPulse className="opacity-50" />
          <div className="container px-8 md:px-16 lg:px-24 mx-auto relative z-10">
            <ScrollReveal>
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-[#d0a760]" />
                <span className="text-[#d0a760] text-sm font-medium tracking-wider uppercase">Speciaal voor jou geselecteerd</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
                Upgrades voor jouw {selectedVehicle.make} {selectedVehicle.model}
              </h2>
              <p className="text-white/60 text-lg mb-12">
                Op basis van jouw {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model} hebben wij deze producten voor je uitgezocht
              </p>
            </ScrollReveal>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={100}>
              {isLoadingProducts ? (
                [...Array(4)].map((_, i) => (
                  <ProductAudioSkeleton key={i} />
                ))
              ) : (
                (featuredProducts as Product[])?.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              )}
            </StaggerContainer>

            <ScrollReveal delay={400}>
              <div className="mt-12 text-center">
                <Link href="/products">
                  <Button 
                    className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none px-8 py-6"
                    data-testid="button-view-all-compatible"
                  >
                    Ontdek meer voor jouw auto
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Services Section - WHITE */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container px-8 md:px-16 lg:px-24 mx-auto">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8" staggerDelay={150}>
            <div className="text-center md:text-left">
              <h3 className="text-[#d0a760] text-sm font-medium tracking-wider uppercase mb-4">Topkwaliteit Merken</h3>
              <p className="text-zinc-600 text-lg leading-relaxed">
                Wij werken uitsluitend met premium merken zoals Alpine, Audison en Hertz. Kwaliteit die je hoort én voelt.
              </p>
            </div>
            
            <div className="text-center md:text-left">
              <h3 className="text-[#d0a760] text-sm font-medium tracking-wider uppercase mb-4">Vakkundige Installatie</h3>
              <p className="text-zinc-600 text-lg leading-relaxed">
                Onze gecertificeerde monteurs zorgen met 25+ jaar ervaring voor een perfect resultaat in jouw auto.
              </p>
            </div>
            
            <div className="text-center md:text-left">
              <h3 className="text-[#d0a760] text-sm font-medium tracking-wider uppercase mb-4">Persoonlijk Advies</h3>
              <p className="text-zinc-600 text-lg leading-relaxed">
                Kom langs in onze showroom in Sittard. Wij luisteren naar jouw wensen en adviseren op maat.
              </p>
            </div>
          </StaggerContainer>
          
          <GoldAccentLine className="mt-16" />
        </div>
      </section>

      {/* Transition: White to Black */}
      <SectionDivider variant="curve" fromColor="white" toColor="black" />

      {/* About Section - BLACK with Bass Pulse */}
      <section className="py-24 md:py-32 bg-black relative overflow-hidden">
        {/* Dot Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #d0a760 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
        <BassPulse className="opacity-30" />
        <div className="container px-8 md:px-16 lg:px-24 mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="left">
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-8 leading-tight">
                  Jouw rijbeleving,
                  <br />
                  <span className="text-[#d0a760]">onze passie</span>
                </h2>
                <p className="text-white/60 text-lg leading-relaxed mb-8">
                  Bij Car Audio Limburg delen we onze liefde voor auto's en muziek graag met jou. 
                  Met vakkundige installatie zorgen we ervoor dat elke upgrade eruitziet alsof hij 
                  rechtstreeks van de fabriek komt. Jouw tevredenheid is waar wij voor gaan.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/products" className="w-full sm:w-auto">
                    <Button 
                      className="w-full bg-transparent border border-[#d0a760] text-[#d0a760] hover:bg-[#d0a760] hover:text-black rounded-none px-8 py-6"
                      data-testid="button-view-products"
                    >
                      Ontdek Onze Producten
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/contact" className="w-full sm:w-auto">
                    <Button 
                      className="w-full bg-transparent text-white/70 hover:text-white rounded-none px-8 py-6"
                      data-testid="button-contact-us"
                    >
                      Stel Je Vraag
                    </Button>
                  </Link>
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
      </section>

      {/* Transition: Black to White */}
      <SectionDivider variant="angle" fromColor="black" toColor="white" />

      {/* Featured Products - WHITE */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container px-8 md:px-16 lg:px-24 mx-auto">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
              <div>
                <h2 className="text-3xl md:text-4xl font-light text-black mb-4">
                  Onze Favorieten voor Jou
                </h2>
                <p className="text-zinc-600 text-lg">
                  Hoogwaardige car audio producten die wij met trots aanbevelen
                </p>
              </div>
              <Link href="/products">
                <Button 
                  variant="ghost" 
                  className="text-[#d0a760] hover:text-[#d0a760]/80 hover:bg-transparent mt-4 md:mt-0 rounded-none"
                  data-testid="button-all-products"
                >
                  Bekijk Alles
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </ScrollReveal>

          {isLoadingProducts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <ProductAudioSkeleton key={i} data-testid={`skeleton-product-${i}`} />
              ))}
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={100}>
              {(featuredProducts as Product[])?.map((product: Product) => (
                <ProductCard key={product.id} product={product} featured data-testid={`product-card-${product.id}`} />
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      {/* Transition: White to Black */}
      <SectionDivider variant="wave" fromColor="white" toColor="black" />

      {/* Video Section - BLACK */}
      <section className="py-24 md:py-32 bg-black relative overflow-hidden">
        {/* Electric Circuit Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Horizontal pulse lines */}
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#d0a760]/20 to-transparent animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#d0a760]/15 to-transparent animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
          
          {/* Vertical pulse lines */}
          <div className="absolute left-1/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-[#d0a760]/15 to-transparent animate-pulse" style={{ animationDuration: '6s', animationDelay: '0.5s' }} />
          <div className="absolute right-1/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-[#d0a760]/20 to-transparent animate-pulse" style={{ animationDuration: '4.5s', animationDelay: '2s' }} />
          
          {/* Corner accent nodes */}
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-[#d0a760]/30 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-[#d0a760]/25 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1.5s' }} />
        </div>
        <div className="container px-8 md:px-16 lg:px-24 mx-auto relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
                Welkom in Onze Wereld
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                Neem een kijkje in onze studio en ontdek waar onze passie voor car audio tot leven komt
              </p>
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={200}>
            <div className="max-w-5xl mx-auto">
              <div className="relative aspect-video group">
                {/* Ambilight Glow Effect - CSS-based for performance */}
                <div 
                  className="absolute -inset-4 md:-inset-6 lg:-inset-8 opacity-60 blur-2xl md:blur-3xl pointer-events-none animate-pulse"
                  style={{ 
                    background: 'radial-gradient(ellipse at center, rgba(208, 167, 96, 0.4) 0%, rgba(201, 162, 39, 0.2) 40%, transparent 70%)',
                    animationDuration: '4s'
                  }}
                  aria-hidden="true"
                />
                
                {/* Main Video */}
                <div className="relative z-10 overflow-hidden shadow-2xl shadow-[#d0a760]/20">
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    data-testid="promotional-video"
                  >
                    <source src={promoVideo} type="video/mp4" />
                    Je browser ondersteunt geen video.
                  </video>
                </div>
                
                {/* Animated Equalizer Overlay - Logo Colors */}
                <div className="absolute bottom-4 right-4 z-20 flex items-end gap-1 p-3 bg-black/60 backdrop-blur-sm pointer-events-none">
                  {[
                    { color: '#c9a227', height: 12 },
                    { color: '#d4af37', height: 16 },
                    { color: '#d0a760', height: 20 },
                    { color: '#e8c87a', height: 24 },
                    { color: '#f5dea3', height: 28 },
                  ].map((bar, i) => (
                    <div
                      key={i}
                      className="w-1.5 animate-audio-bar"
                      style={{
                        height: `${bar.height}px`,
                        background: `linear-gradient(to top, ${bar.color}, #f5dea3)`,
                        animationDelay: `${i * 0.12}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Transition: Black to White */}
      <SectionDivider variant="curve" fromColor="black" toColor="white" />

      {/* Categories Section - WHITE */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container px-8 md:px-16 lg:px-24 mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-light text-black mb-4">
                Wat Zoek Jij?
              </h2>
              <p className="text-zinc-600 text-lg">
                Ontdek ons aanbod per categorie en vind wat bij jouw wensen past
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="flex flex-wrap justify-center gap-6" staggerDelay={80}>
            {(categories as Category[])?.map((category: Category) => (
              <Link key={category.id} href={`/products?category=${category.slug}`} className="w-[calc(50%-12px)] md:w-[calc(25%-18px)]">
                <Card 
                  className="group cursor-pointer bg-zinc-100 border-zinc-200 hover:border-[#d0a760] transition-all duration-300 rounded-none hover:-translate-y-1 h-full"
                  data-testid={`category-card-${category.slug}`}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 bg-white border border-zinc-200 flex items-center justify-center group-hover:border-[#d0a760] group-hover:bg-[#d0a760]/5 transition-all duration-300">
                      {category.slug === 'multimedia-navigatie' && <Volume2 className="w-6 h-6 text-[#d0a760]" />}
                      {category.slug === 'speakers-subwoofers' && <Volume2 className="w-6 h-6 text-[#d0a760]" />}
                      {category.slug === 'versterkers-dsp' && <Settings className="w-6 h-6 text-[#d0a760]" />}
                      {category.slug === 'installatie-accessoires' && <Wrench className="w-6 h-6 text-[#d0a760]" />}
                      {category.slug === 'cameras-veiligheid' && <ShieldCheck className="w-6 h-6 text-[#d0a760]" />}
                      {category.slug === 'oem-upgrades' && <Car className="w-6 h-6 text-[#d0a760]" />}
                      {!['multimedia-navigatie', 'speakers-subwoofers', 'versterkers-dsp', 'installatie-accessoires', 'cameras-veiligheid', 'oem-upgrades'].includes(category.slug) && 
                        <Volume2 className="w-6 h-6 text-[#d0a760]" />
                      }
                    </div>
                    
                    <h3 className="font-medium text-zinc-900 text-sm group-hover:text-[#d0a760] transition-colors">
                      {category.name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* BMW CarPlay CTA - BLACK with Pulse */}
      <section className="py-24 md:py-32 bg-black relative overflow-hidden">
        <Parallax speed={0.2} className="absolute inset-0 opacity-20">
          <img 
            src={studioImage2} 
            alt="" 
            className="w-full h-full object-cover scale-110"
          />
        </Parallax>
        <BassPulse className="opacity-40" />
        <div className="container px-8 md:px-16 lg:px-24 mx-auto relative z-10">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-6 bg-[#d0a760]/20 text-[#d0a760] border-[#d0a760]/30 px-4 py-1.5 text-sm rounded-none">
                BMW & MINI
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-6">
                Apple CarPlay voor Jouw BMW
              </h2>
              <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
                Professionele OEM software activatie voor BMW en MINI. Wij zorgen ervoor dat je 
                binnen 30-60 minuten van CarPlay kunt genieten. Geen hardware nodig, wel garantie.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/apple-carplay-bmw" className="w-full sm:w-auto">
                  <Button 
                    className="w-full bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none px-8 py-6"
                    data-testid="button-bmw-carplay"
                  >
                    Ontdek de Mogelijkheden
                  </Button>
                </Link>
                <Link href="/apple-carplay-bmw#offerte" className="w-full sm:w-auto">
                  <Button 
                    className="w-full bg-transparent border border-white/30 text-white hover:bg-white/10 rounded-none px-8 py-6"
                    data-testid="button-bmw-quote"
                  >
                    Ontvang Jouw Offerte
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Transition: Black to White */}
      <SectionDivider variant="wave" fromColor="black" toColor="white" />

      {/* Stats Section - WHITE */}
      <section className="py-16 bg-white">
        <div className="container px-8 md:px-16 lg:px-24 mx-auto">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center" staggerDelay={150}>
            <div>
              <div className="text-4xl md:text-5xl font-light text-[#d0a760] mb-2">
                <CountUp end={25} suffix="+" />
              </div>
              <p className="text-zinc-600 text-sm uppercase tracking-wider">Jaar Vakmanschap</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-light text-[#d0a760] mb-2">
                <CountUp end={500} suffix="+" />
              </div>
              <p className="text-zinc-600 text-sm uppercase tracking-wider">Blije Klanten</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-light text-[#d0a760] mb-2">
                <CountUp end={15} suffix="+" />
              </div>
              <p className="text-zinc-600 text-sm uppercase tracking-wider">Topmerken</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-light text-[#d0a760] mb-2">
                <CountUp end={2} />
              </div>
              <p className="text-zinc-600 text-sm uppercase tracking-wider">Jaar Garantie</p>
            </div>
          </StaggerContainer>
        </div>
      </section>

      {/* Installation Services - WHITE continued */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container px-8 md:px-16 lg:px-24 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="left" className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <ImageReveal 
                  src={studioImage2} 
                  alt="Car Audio Limburg Installatie" 
                  className="aspect-[3/4]"
                />
                <div className="mt-8">
                  <ImageReveal 
                    src={studioImage3} 
                    alt="Car Audio Limburg Werkplaats" 
                    className="aspect-[3/4]"
                  />
                </div>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="right" delay={200} className="order-1 lg:order-2">
              <div>
                <h2 className="text-3xl md:text-4xl font-light text-black mb-8">
                  Wij zorgen voor
                  <br />
                  <span className="text-[#d0a760]">jouw perfecte geluid</span>
                </h2>
                
                <div className="space-y-6 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#d0a760]/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-[#d0a760]" />
                    </div>
                    <div>
                      <h3 className="text-zinc-900 font-medium mb-1">Snel en Vakkundig</h3>
                      <p className="text-zinc-600">Jouw auto is gemiddeld binnen 2-4 uur klaar</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#d0a760]/10 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-5 h-5 text-[#d0a760]" />
                    </div>
                    <div>
                      <h3 className="text-zinc-900 font-medium mb-1">Met Garantie</h3>
                      <p className="text-zinc-600">2 jaar garantie op al onze installaties</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#d0a760]/10 flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5 text-[#d0a760]" />
                    </div>
                    <div>
                      <h3 className="text-zinc-900 font-medium mb-1">Fabriekskwaliteit</h3>
                      <p className="text-zinc-600">Het resultaat ziet eruit alsof het van de fabriek komt</p>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-100 p-6 border border-zinc-200">
                  <h4 className="text-zinc-900 font-medium mb-4">Meest Gekozen door Onze Klanten</h4>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-600">Autoradio installatie</span>
                      <span className="text-[#d0a760] font-medium">vanaf €89</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-600">Speaker upgrade</span>
                      <span className="text-[#d0a760] font-medium">vanaf €129</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-600">Complete audio upgrade</span>
                      <span className="text-[#d0a760] font-medium">vanaf €299</span>
                    </div>
                  </div>
                  <Link href="/booking">
                    <Button className="w-full bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none" data-testid="button-book-installation">
                      Plan Jouw Afspraak
                    </Button>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Transition: White to Black */}
      <SectionDivider variant="curve" fromColor="white" toColor="black" />

      {/* Quote Section - BLACK */}
      <section className="py-24 md:py-32 bg-black relative overflow-hidden">
        {/* Electric Circuit Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Horizontal pulse lines */}
          <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#d0a760]/20 to-transparent animate-pulse" style={{ animationDuration: '5s' }} />
          <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#d0a760]/15 to-transparent animate-pulse" style={{ animationDuration: '4s', animationDelay: '1.5s' }} />
          
          {/* Vertical pulse lines */}
          <div className="absolute left-1/3 top-0 h-full w-px bg-gradient-to-b from-transparent via-[#d0a760]/15 to-transparent animate-pulse" style={{ animationDuration: '5.5s', animationDelay: '0.5s' }} />
          <div className="absolute right-1/3 top-0 h-full w-px bg-gradient-to-b from-transparent via-[#d0a760]/20 to-transparent animate-pulse" style={{ animationDuration: '4.5s', animationDelay: '2s' }} />
          
          {/* Corner accent nodes */}
          <div className="absolute top-1/3 left-1/3 w-1 h-1 bg-[#d0a760]/30 rounded-full animate-ping" style={{ animationDuration: '3.5s' }} />
          <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-[#d0a760]/25 rounded-full animate-ping" style={{ animationDuration: '4.5s', animationDelay: '1s' }} />
        </div>
        <div className="container px-8 md:px-16 lg:px-24 mx-auto relative z-10">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto">
              <div className="bg-zinc-900 p-8 md:p-12 border border-zinc-800">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
                      Wij denken graag met je mee
                    </h2>
                    <p className="text-white/60 text-lg mb-8">
                      Niet zeker welke upgrade bij jouw auto past? Geen probleem! 
                      Vraag vrijblijvend een offerte aan en wij adviseren je persoonlijk.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-[#d0a760]" />
                        <span className="text-white/80">Eerlijk en deskundig advies op maat</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-[#d0a760]" />
                        <span className="text-white/80">Vrijblijvende offerte, geen verplichtingen</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-[#d0a760]" />
                        <span className="text-white/80">Wij reageren binnen 24 uur</span>
                      </div>
                    </div>
                  </div>
                  
                  <QuoteForm />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Transition: Black to White */}
      <SectionDivider variant="wave" fromColor="black" toColor="white" />

      {/* Testimonials - WHITE */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container px-8 md:px-16 lg:px-24 mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-light text-black mb-4">
                Onze Klanten aan het Woord
              </h2>
              <p className="text-zinc-600 text-lg">
                Dit is waarom meer dan 500 klanten ons hun vertrouwen gaven
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8" staggerDelay={150}>
            {etrustedReviews?.reviews?.slice(0, 3).map((review) => (
              <Card key={review.id} className="bg-zinc-100 border-zinc-200 rounded-none hover:-translate-y-1 transition-transform duration-300" data-testid={`testimonial-${review.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(Math.round(review.rating))].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-[#d0a760] fill-current" />
                    ))}
                  </div>
                  {review.title && (
                    <p className="text-zinc-900 font-medium mb-2">{review.title}</p>
                  )}
                  <p className="text-zinc-700 mb-6 leading-relaxed line-clamp-4">
                    "{review.comment}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#d0a760]/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-[#d0a760]" />
                    </div>
                    <div>
                      <p className="text-zinc-900 font-medium text-sm">
                        {review.customer?.firstName || "Klant"} {review.customer?.lastName ? review.customer.lastName.charAt(0) + "." : ""}
                      </p>
                      <p className="text-[#d0a760] text-xs">Trusted Shops Geverifieerd</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) || (
              <div className="col-span-3 text-center text-zinc-400">
                Reviews worden geladen...
              </div>
            )}
          </StaggerContainer>
        </div>
      </section>

      {/* Transition: White to Black */}
      <SectionDivider variant="angle" fromColor="white" toColor="black" />

      {/* Showroom CTA - BLACK */}
      <section className="py-24 md:py-32 bg-black relative overflow-hidden">
        <AudioWaveBackground className="opacity-30" />
        <div className="container px-8 md:px-16 lg:px-24 mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="left">
              <div>
                <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
                  Wij ontvangen je graag
                  <br />
                  <span className="text-[#d0a760]">in onze showroom</span>
                </h2>
                <p className="text-white/60 text-lg mb-8">
                  Kom langs en ervaar zelf hoe goed jouw auto kan klinken. 
                  Wij nemen de tijd om naar jouw wensen te luisteren en je te adviseren.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4">
                    <MapPin className="w-5 h-5 text-[#d0a760]" />
                    <span className="text-white/80">Sittard, Limburg</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Phone className="w-5 h-5 text-[#d0a760]" />
                    <span className="text-white/80">085-27 33 625</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Clock className="w-5 h-5 text-[#d0a760]" />
                    <span className="text-white/80">Ma-Vr: 08:30 - 17:30 (op afspraak)</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/contact" className="w-full sm:w-auto">
                    <Button 
                      className="w-full bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none px-8 py-6"
                      data-testid="button-plan-visit"
                    >
                      Maak een Afspraak
                    </Button>
                  </Link>
                  <a href="tel:0852733625" className="w-full sm:w-auto">
                    <Button 
                      className="w-full bg-transparent border border-white/30 text-white hover:bg-white/10 rounded-none px-8 py-6"
                      data-testid="button-call-now"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Bel Ons
                    </Button>
                  </a>
                </div>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="right" delay={200}>
              <ImageReveal 
                src={studioImage1} 
                alt="Car Audio Limburg Showroom" 
                className="aspect-square"
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
