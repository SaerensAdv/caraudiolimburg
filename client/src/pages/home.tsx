import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { VehicleSelector } from "@/components/VehicleSelector";
import { QuoteForm } from "@/components/QuoteForm";
import { CartSidebar } from "@/components/CartSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  Wrench, 
  Truck, 
  ShieldCheck, 
  Clock, 
  Calendar,
  Phone,
  MapPin,
  Mail,
  Volume2,
  Users,
  Car,
  Coffee,
  Star,
  User,
  Check,
  CheckCircle,
  Settings,
  ChevronRight,
  ArrowRight,
  Play
} from "lucide-react";
import { useState } from "react";
import type { Product, Category, Review } from "@shared/schema";
import { ProductAudioSkeleton } from "@/components/AudioSkeletons";
import { Link } from "wouter";

import heroImage from "@assets/C5025.00_33_41_03.Still050-2048x1152_1757024504641.jpg";
import studioImage1 from "@assets/C5025.00_06_16_04.Still024-1-2048x1152_1757024538840.jpg";
import studioImage2 from "@assets/C5025.00_17_23_55.Still031-1-2048x1152_1757024658861.jpg";
import studioImage3 from "@assets/C5025.00_31_30_11.Still045-1-1-2048x1152_1757024535822.jpg";
import promoVideo from "@assets/Verkorte-Video-Car-Audio-Limburg-Studio-1_1758238662915.mp4";

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  const { data: featuredProducts, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/products", { featured: true, limit: 4 }],
  });

  const { data: brands } = useQuery({
    queryKey: ["/api/brands"],
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: reviews } = useQuery({
    queryKey: ["/api/reviews", { isPublished: true, isFeatured: true, limit: 6 }],
  });

  return (
    <div className="min-h-screen bg-black">
      <Header onCartOpen={() => setIsCartOpen(true)} variant="transparent" />
      
      {/* Hero Section - Full Screen Premium */}
      <section className="relative h-screen w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${heroImage})`
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight mb-8">
              Til je car audio naar
              <br />
              <span className="font-normal">het volgende niveau</span>
            </h1>
            
            <Link href="/products">
              <Button 
                size="lg"
                className="bg-white text-black hover:bg-white/90 rounded-full px-8 py-6 text-base font-medium transition-all duration-300"
                data-testid="button-begin-journey"
              >
                Begin je journey
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section - Minimal */}
      <section className="py-24 md:py-32 bg-black">
        <div className="container px-8 md:px-16 lg:px-24 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-[#d0a760] text-sm font-medium tracking-wider uppercase mb-4">Premium Merken</h3>
              <p className="text-white/70 text-lg leading-relaxed">
                Alpine, Audison, Hertz en meer. Alleen de beste merken in car audio.
              </p>
            </div>
            
            <div className="text-center md:text-left">
              <h3 className="text-[#d0a760] text-sm font-medium tracking-wider uppercase mb-4">Expert Installatie</h3>
              <p className="text-white/70 text-lg leading-relaxed">
                Gecertificeerde monteurs met 25+ jaar ervaring. OEM-look gegarandeerd.
              </p>
            </div>
            
            <div className="text-center md:text-left">
              <h3 className="text-[#d0a760] text-sm font-medium tracking-wider uppercase mb-4">Showroom Sittard</h3>
              <p className="text-white/70 text-lg leading-relaxed">
                Bezoek onze studio voor persoonlijk advies en live demo's.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section with Image */}
      <section className="py-24 md:py-32 bg-zinc-950">
        <div className="container px-8 md:px-16 lg:px-24 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-8 leading-tight">
                Vakmanschap dat je
                <br />
                <span className="text-[#d0a760]">hoort én ziet</span>
              </h2>
              <p className="text-white/60 text-lg leading-relaxed mb-8">
                Bij Car Audio Limburg combineren we Belgische en Nederlandse vakkennis met een passie voor 
                perfecte audio. Elke installatie wordt uitgevoerd met oog voor detail, zodat het resultaat 
                eruitziet alsof het rechtstreeks van de fabriek komt.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button 
                    variant="outline" 
                    className="border-[#d0a760] text-[#d0a760] hover:bg-[#d0a760] hover:text-black rounded-full px-8 py-6"
                    data-testid="button-view-products"
                  >
                    Bekijk Producten
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button 
                    variant="ghost" 
                    className="text-white/70 hover:text-white hover:bg-transparent rounded-full px-8 py-6"
                    data-testid="button-contact-us"
                  >
                    Neem Contact Op
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <img 
                src={studioImage1} 
                alt="Car Audio Limburg Studio" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products - Clean Grid */}
      <section className="py-24 md:py-32 bg-black">
        <div className="container px-8 md:px-16 lg:px-24 mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
            <div>
              <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
                Uitgelichte Producten
              </h2>
              <p className="text-white/60 text-lg">
                Ontdek onze selectie van premium car audio systemen
              </p>
            </div>
            <Link href="/products">
              <Button 
                variant="ghost" 
                className="text-[#d0a760] hover:text-[#d0a760]/80 hover:bg-transparent mt-4 md:mt-0"
                data-testid="button-all-products"
              >
                Alle Producten
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {isLoadingProducts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <ProductAudioSkeleton key={i} data-testid={`skeleton-product-${i}`} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {(featuredProducts as Product[])?.map((product: Product) => (
                <ProductCard key={product.id} product={product} data-testid={`product-card-${product.id}`} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Video Section */}
      <section className="py-24 md:py-32 bg-zinc-950">
        <div className="container px-8 md:px-16 lg:px-24 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
              Ontdek Onze Studio
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Een kijkje achter de schermen van Car Audio Limburg
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="relative aspect-video rounded-2xl overflow-hidden">
              <video
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                controls
                preload="metadata"
                data-testid="promotional-video"
              >
                <source src={promoVideo} type="video/mp4" />
                Je browser ondersteunt geen video.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 md:py-32 bg-black">
        <div className="container px-8 md:px-16 lg:px-24 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
              Shop per Categorie
            </h2>
            <p className="text-white/60 text-lg">
              Vind precies wat je zoekt
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(categories as Category[])?.map((category: Category) => (
              <Link key={category.id} href={`/products?category=${category.slug}`}>
                <Card 
                  className="group cursor-pointer bg-zinc-900 border-zinc-800 hover:border-[#d0a760]/50 transition-all duration-300"
                  data-testid={`category-card-${category.slug}`}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 bg-zinc-800 rounded-full flex items-center justify-center group-hover:bg-[#d0a760]/20 transition-colors">
                      {category.slug === 'multimedia-navigatie' && <Volume2 className="w-6 h-6 text-[#d0a760]" />}
                      {category.slug === 'speakers-subwoofers' && <Volume2 className="w-6 h-6 text-[#d0a760]" />}
                      {category.slug === 'versterkers-dsp' && <Settings className="w-6 h-6 text-[#d0a760]" />}
                      {category.slug === 'installatie-accessoires' && <Wrench className="w-6 h-6 text-[#d0a760]" />}
                      {category.slug === 'cameras-veiligheid' && <ShieldCheck className="w-6 h-6 text-[#d0a760]" />}
                      {category.slug === 'oem-upgrades' && <Car className="w-6 h-6 text-[#d0a760]" />}
                      {category.slug === 'premium-audio' && <Star className="w-6 h-6 text-[#d0a760]" />}
                      {!['multimedia-navigatie', 'speakers-subwoofers', 'versterkers-dsp', 'installatie-accessoires', 'cameras-veiligheid', 'oem-upgrades', 'premium-audio'].includes(category.slug) && 
                        <Volume2 className="w-6 h-6 text-[#d0a760]" />
                      }
                    </div>
                    
                    <h3 className="font-medium text-white text-sm group-hover:text-[#d0a760] transition-colors">
                      {category.name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BMW CarPlay CTA */}
      <section className="py-24 md:py-32 bg-gradient-to-br from-zinc-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src={studioImage2} 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container px-8 md:px-16 lg:px-24 mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-[#d0a760]/20 text-[#d0a760] border-[#d0a760]/30 px-4 py-1.5 text-sm">
              BMW & MINI
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-6">
              Apple CarPlay Activatie
            </h2>
            <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
              OEM software activatie voor BMW en MINI. Geen hardware nodig, 
              binnen 30-60 minuten klaar. Vanaf €199.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/apple-carplay-bmw">
                <Button 
                  className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-full px-8 py-6"
                  data-testid="button-bmw-carplay"
                >
                  Meer Informatie
                </Button>
              </Link>
              <Link href="/apple-carplay-bmw#offerte">
                <Button 
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white/10 rounded-full px-8 py-6"
                  data-testid="button-bmw-quote"
                >
                  Vraag Offerte Aan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Installation Services */}
      <section className="py-24 md:py-32 bg-zinc-950">
        <div className="container px-8 md:px-16 lg:px-24 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                  <img 
                    src={studioImage2} 
                    alt="Car Audio Limburg Installatie" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-[3/4] rounded-2xl overflow-hidden mt-8">
                  <img 
                    src={studioImage3} 
                    alt="Car Audio Limburg Werkplaats" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-light text-white mb-8">
                Professionele
                <br />
                <span className="text-[#d0a760]">Installatie Service</span>
              </h2>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#d0a760]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#d0a760]" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Snelle Montage</h3>
                    <p className="text-white/60">Gemiddeld binnen 2-4 uur klaar</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#d0a760]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5 text-[#d0a760]" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">2 Jaar Garantie</h3>
                    <p className="text-white/60">Op alle installaties</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#d0a760]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-[#d0a760]" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">OEM-Look</h3>
                    <p className="text-white/60">Perfecte integratie met originele styling</p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                <h4 className="text-white font-medium mb-4">Populaire Installaties</h4>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Autoradio installatie</span>
                    <span className="text-[#d0a760]">vanaf €89</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Speaker upgrade</span>
                    <span className="text-[#d0a760]">vanaf €129</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Complete audio upgrade</span>
                    <span className="text-[#d0a760]">vanaf €299</span>
                  </div>
                </div>
                <Link href="/booking">
                  <Button className="w-full bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-full" data-testid="button-book-installation">
                    Installatie Boeken
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-24 md:py-32 bg-black">
        <div className="container px-8 md:px-16 lg:px-24 mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-3xl p-8 md:p-12 border border-zinc-800">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
                    Niet zeker wat je nodig hebt?
                  </h2>
                  <p className="text-white/60 text-lg mb-8">
                    Onze experts adviseren je graag. Vraag een gratis offerte aan 
                    en ontvang persoonlijk advies voor jouw auto.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-[#d0a760]" />
                      <span className="text-white/80">Persoonlijk advies van experts</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-[#d0a760]" />
                      <span className="text-white/80">Gratis offerte zonder verplichtingen</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-[#d0a760]" />
                      <span className="text-white/80">Reactie binnen 24 uur</span>
                    </div>
                  </div>
                </div>
                
                <QuoteForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 md:py-32 bg-zinc-950">
        <div className="container px-8 md:px-16 lg:px-24 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
              Wat Klanten Zeggen
            </h2>
            <p className="text-white/60 text-lg">
              Meer dan 500 tevreden klanten
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(reviews as Review[])?.slice(0, 3).map((review: Review) => (
              <Card key={review.id} className="bg-zinc-900 border-zinc-800" data-testid={`testimonial-${review.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-[#d0a760] fill-current" />
                    ))}
                  </div>
                  <p className="text-white/80 mb-6 leading-relaxed">
                    "{review.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#d0a760]/20 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-[#d0a760]" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{review.customerName}</p>
                      {review.isVerified && (
                        <p className="text-[#d0a760] text-xs">Geverifieerd</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) || (
              <div className="col-span-3 text-center text-white/40">
                Reviews worden geladen...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Showroom CTA */}
      <section className="py-24 md:py-32 bg-black">
        <div className="container px-8 md:px-16 lg:px-24 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
                Bezoek Onze
                <br />
                <span className="text-[#d0a760]">Showroom in Sittard</span>
              </h2>
              <p className="text-white/60 text-lg mb-8">
                Ervaar onze producten live. Luister naar demo's, 
                krijg persoonlijk advies en plan direct je installatie.
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
                <Link href="/contact">
                  <Button 
                    className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-full px-8 py-6"
                    data-testid="button-plan-visit"
                  >
                    Plan Je Bezoek
                  </Button>
                </Link>
                <a href="tel:0852733625">
                  <Button 
                    variant="outline" 
                    className="border-white/30 text-white hover:bg-white/10 rounded-full px-8 py-6"
                    data-testid="button-call-now"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Bel Nu
                  </Button>
                </a>
              </div>
            </div>
            
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              <img 
                src={studioImage1} 
                alt="Car Audio Limburg Showroom" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
