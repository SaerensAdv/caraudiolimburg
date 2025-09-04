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
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import type { Product, Category, Review } from "@shared/schema";
import { ProductAudioSkeleton } from "@/components/AudioSkeletons";
import heroImage from "@assets/Mercedes-Benz-GT-AMG-Carplay-4_1757022121886.jpg";

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
    <div className="min-h-screen bg-background">
      <Header onCartOpen={() => setIsCartOpen(true)} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-secondary/10 to-primary/5 py-16 md:py-20 lg:h-screen lg:py-0 lg:flex lg:items-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-r from-background/98 via-background/95 to-background/98 z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20" 
          style={{
            backgroundImage: `url(${heroImage})`
          }}
        ></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-primary/60 rounded-full animate-bounce"></div>
        <div className="absolute top-32 right-16 w-3 h-3 bg-primary/70 rounded-full animate-bounce delay-500"></div>
        <div className="absolute bottom-40 left-20 w-5 h-5 bg-primary/50 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute top-40 right-32 w-2 h-2 bg-primary/80 rounded-full animate-ping"></div>
        
        <div className="relative z-20 container px-4 mx-auto">
          <div className="max-w-5xl mx-auto text-center">
            {/* Trust Badges */}
            <div className="flex justify-center items-center gap-4 mb-6 opacity-90 animate-fade-in">
              <Badge variant="secondary" className="text-xs px-3 py-1 bg-primary/15 text-primary border-primary/30 animate-slide-up">
                <Star className="w-3 h-3 mr-1 fill-current" />
                #1 Car Audio Expert
              </Badge>
              <Badge variant="secondary" className="text-xs px-3 py-1 bg-primary/15 text-primary border-primary/30 animate-slide-up delay-100">
                <ShieldCheck className="w-3 h-3 mr-1" />
                25+ Jaar Ervaring
              </Badge>
              <Badge variant="secondary" className="text-xs px-3 py-1 bg-primary/15 text-primary border-primary/30 hidden sm:inline-flex animate-slide-up delay-200">
                <Award className="w-3 h-3 mr-1" />
                Officiële Dealer
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 md:mb-6 leading-tight animate-slide-up delay-300">
              Premium Car Audio &
              <span className="text-primary font-bold"> 
                Professionele Installatie
              </span>
            </h1>
            
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 md:mb-10 max-w-3xl mx-auto leading-relaxed">
              Van OEM-upgrades tot complete systemen. Alpine, Audison, en meer. 
              Inclusief vakkundige montage in onze showroom in <span className="text-primary font-semibold">Sittard</span>.
            </p>

            {/* Key Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 md:mb-10 max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-border/50">
                <Volume2 className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">Premium Merken</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-border/50">
                <Wrench className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">Expert Installatie</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-border/50">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">Garantie & Service</span>
              </div>
            </div>

            <div className="mb-8 md:mb-10">
              <VehicleSelector />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="text-base md:text-lg px-8 md:px-10 py-4 md:py-5 w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" 
                data-testid="button-shop-now"
              >
                <Volume2 className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Shop Nu
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-base md:text-lg px-8 md:px-10 py-4 md:py-5 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                data-testid="button-book-installation"
              >
                <Calendar className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Installatie Boeken
                <Badge className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5">€89</Badge>
              </Button>
              <Button 
                variant="secondary" 
                size="lg" 
                className="text-base md:text-lg px-8 md:px-10 py-4 md:py-5 w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-secondary/80 hover:bg-secondary"
                onClick={() => setShowQuoteForm(true)}
                data-testid="button-request-quote"
              >
                <Mail className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Gratis Offerte
              </Button>
            </div>

            {/* Social Proof */}
            <div className="mt-10 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">5★</div>
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">5★</div>
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">5★</div>
                </div>
                <span>500+ Tevreden klanten</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Gratis advies & offerte</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                <span>Snelle levering</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-20 bg-secondary/30">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Shop per Categorie
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ontdek ons uitgebreide assortiment car audio producten, zorgvuldig geselecteerd voor elke behoefte en elk budget.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categories?.map((category: Category) => (
              <Card 
                key={category.id} 
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-background/80 backdrop-blur-sm border-border/50"
                data-testid={`category-card-${category.slug}`}
              >
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    {/* Category Icons */}
                    {category.slug === 'multimedia-navigatie' && <Volume2 className="w-6 h-6 md:w-8 md:h-8 text-primary" />}
                    {category.slug === 'speakers-subwoofers' && <Volume2 className="w-6 h-6 md:w-8 md:h-8 text-primary" />}
                    {category.slug === 'versterkers-dsp' && <Settings className="w-6 h-6 md:w-8 md:h-8 text-primary" />}
                    {category.slug === 'installatie-accessoires' && <Wrench className="w-6 h-6 md:w-8 md:h-8 text-primary" />}
                    {category.slug === 'cameras-veiligheid' && <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-primary" />}
                    {category.slug === 'oem-upgrades' && <Car className="w-6 h-6 md:w-8 md:h-8 text-primary" />}
                    {category.slug === 'premium-audio' && <Star className="w-6 h-6 md:w-8 md:h-8 text-primary" />}
                    {category.slug === 'offerte-aanvragen' && <Mail className="w-6 h-6 md:w-8 md:h-8 text-primary" />}
                    {/* Default icon for unknown categories */}
                    {!['multimedia-navigatie', 'speakers-subwoofers', 'versterkers-dsp', 'installatie-accessoires', 'cameras-veiligheid', 'oem-upgrades', 'premium-audio', 'offerte-aanvragen'].includes(category.slug) && 
                      <Volume2 className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                    }
                  </div>
                  
                  <h3 className="font-semibold text-sm md:text-base text-foreground mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  
                  {category.description && (
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {category.description}
                    </p>
                  )}

                  <div className="mt-3 md:mt-4">
                    <Badge 
                      variant="secondary" 
                      className="text-xs px-2 py-1 bg-primary/10 text-primary border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                    >
                      Bekijk Producten
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA to shop */}
          <div className="text-center mt-10 md:mt-12">
            <Button 
              size="lg" 
              className="text-base md:text-lg px-8 md:px-10 py-4 md:py-5 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
              data-testid="button-browse-all-products"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Bekijk Alle Producten
            </Button>
          </div>
        </div>
      </section>

      {/* Promotional Video Section */}
      <section className="py-20 bg-background">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ontdek Car Audio Limburg</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Bekijk onze showroom, werkplaats en het vakmanschap waarmee wij uw car audio systeem installeren.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black">
              <video
                className="w-full h-full object-cover"
                controls
                autoPlay
                muted
                loop
                playsInline
                poster="https://caraudiolimburg.shop/wp-content/uploads/2025/05/Android-Audi-A3.png"
                data-testid="promotional-video"
              >
                <source 
                  src="https://caraudiolimburg.studio/wp-content/uploads/2024/11/Verkorte-Video-Car-Audio-Limburg-Studio-1.mp4" 
                  type="video/mp4" 
                />
                Je browser ondersteunt geen video.
              </video>
              
              {/* Video Overlay Info */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">Car Audio Limburg Studio</h3>
                    <p className="text-sm text-gray-300">Een kijkje in onze showroom en werkplaats</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm">LIVE</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Video Description */}
            <div className="mt-8 text-center">
              <p className="text-muted-foreground max-w-2xl mx-auto">
                In deze video krijg je een unieke blik achter de schermen van Car Audio Limburg. 
                Ontdek onze moderne showroom vol premium car audio systemen en zie hoe onze ervaren monteurs 
                met precisie en vakmanschap elke installatie uitvoeren.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6">
                <Button size="lg" className="text-lg px-8 py-4" data-testid="button-visit-showroom">
                  <MapPin className="w-5 h-5 mr-2" />
                  Bezoek Onze Showroom
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  data-testid="button-contact-video"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Contact Opnemen
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* USPs */}
      <section className="py-16 bg-secondary">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center" data-testid="usp-oem-guarantee">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">OEM-Look Garantie</h3>
              <p className="text-muted-foreground">Perfecte integratie met originele styling van uw voertuig</p>
            </div>
            <div className="text-center" data-testid="usp-professional-installation">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Wrench className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Professionele Installatie</h3>
              <p className="text-muted-foreground">Gecertificeerde monteurs met jarenlange ervaring</p>
            </div>
            <div className="text-center" data-testid="usp-fast-delivery">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Snelle Levering</h3>
              <p className="text-muted-foreground">Snel uit voorraad leverbaar of vandaag nog afhalen</p>
            </div>
            <div className="text-center" data-testid="usp-warranty">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Garantie</h3>
              <p className="text-muted-foreground">Uitgebreide garantie op alle producten en installaties</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-background">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Uitgelichte Producten</h2>
            <p className="text-lg text-muted-foreground">Onze meest populaire car audio producten</p>
          </div>

          {isLoadingProducts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <ProductAudioSkeleton key={i} data-testid={`skeleton-product-${i}`} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(featuredProducts as Product[])?.map((product: Product) => (
                <ProductCard key={product.id} product={product} data-testid={`product-card-${product.id}`} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button variant="secondary" size="lg" data-testid="button-view-all-products">
              Bekijk Alle Producten
            </Button>
          </div>
        </div>
      </section>

      {/* Installation Services */}
      <section className="py-20 bg-secondary">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Professionele Installatie</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Onze gecertificeerde monteurs zorgen voor een perfecte installatie die eruitziet alsof het van de fabriek komt.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div 
              className="aspect-[4/3] bg-cover bg-center rounded-2xl" 
              style={{
                backgroundImage: "url('/installation-demo.jpg')"
              }}
            ></div>
            
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4" data-testid="feature-fast-installation">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Snelle Montage</h3>
                    <p className="text-muted-foreground">Gemiddeld binnen 2-4 uur klaar. Wacht comfortabel in onze lounge of laat je auto achter.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4" data-testid="feature-work-warranty">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Garantie op Werk</h3>
                    <p className="text-muted-foreground">2 jaar garantie op alle installaties. Vakwerk waar je op kunt vertrouwen.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4" data-testid="feature-flexible-planning">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Flexibele Planning</h3>
                    <p className="text-muted-foreground">Boek online je afspraak. Avond- en weekenduren mogelijk.</p>
                  </div>
                </div>
              </div>

              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold text-card-foreground mb-4">Populaire Installaties</h4>
                  <div className="space-y-3" data-testid="installation-prices">
                    <div className="flex items-center justify-between">
                      <span className="text-card-foreground">Autoradio installatie</span>
                      <span className="text-muted-foreground">vanaf €89</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-card-foreground">Speaker upgrade</span>
                      <span className="text-muted-foreground">vanaf €129</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-card-foreground">Subwoofer systeem</span>
                      <span className="text-muted-foreground">vanaf €179</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-card-foreground">Complete audio upgrade</span>
                      <span className="text-muted-foreground">vanaf €299</span>
                    </div>
                  </div>
                  <Button className="w-full mt-6" size="lg" data-testid="button-book-installation-main">
                    Installatie Boeken
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Apple CarPlay for BMW/MINI CTA */}
      <section className="py-20 bg-gradient-to-r from-gray-900 via-black to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5"></div>
        <div className="container px-4 mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 px-6 py-2 text-sm font-semibold">
                🚗 BMW & MINI EIGENAREN
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Apple CarPlay activatie voor jouw{" "}
                <span className="text-primary">BMW</span> of{" "}
                <span className="text-primary">MINI</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Snel, voordelig en zonder hardware. OEM software activatie binnen 30-60 minuten. 
                Voor alle BMW en MINI modellen van 2015 tot heden.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-white font-semibold mb-2">Geen Hardware</h3>
                <p className="text-gray-400 text-sm">Alleen OEM software activatie</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-white font-semibold mb-2">30-60 Minuten</h3>
                <p className="text-gray-400 text-sm">Snelle activatie service</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-white font-semibold mb-2">Op Locatie</h3>
                <p className="text-gray-400 text-sm">Bij ons of bij jou thuis</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-8 py-4"
                onClick={() => window.location.href = '/apple-carplay-bmw'}
                data-testid="button-bmw-carplay-main"
              >
                <Car className="w-5 h-5 mr-2" />
                BMW/MINI CarPlay Info
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold text-lg px-8 py-4"
                onClick={() => window.location.href = '/apple-carplay-bmw#offerte'}
                data-testid="button-bmw-carplay-quote"
              >
                <Phone className="w-5 h-5 mr-2" />
                Directe Offerte
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Showcase */}
      <section className="py-20 bg-background">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Premium Merken</h2>
            <p className="text-lg text-muted-foreground">Wij werken alleen met de beste merken in car audio</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {(brands as any[])?.map((brand: any) => (
              <Card key={brand.id} className="bg-card border-border hover:shadow-lg transition-all duration-300 group cursor-pointer" data-testid={`brand-card-${brand.id}`}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/10 transition-colors">
                    <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {brand.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-card-foreground text-sm">{brand.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Request */}
      <section className="py-20 bg-background">
        <div className="container px-4 mx-auto">
          <div className="bg-gradient-to-r from-primary/10 to-accent/5 border border-border rounded-3xl p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Weet je niet wat je nodig hebt?
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Onze experts adviseren je graag over de beste audio-upgrade voor jouw voertuig. 
                  Gratis advies en offerte op maat.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3" data-testid="benefit-personal-advice">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="text-foreground">Persoonlijk advies van experts</span>
                  </div>
                  <div className="flex items-center space-x-3" data-testid="benefit-free-quote">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="text-foreground">Gratis offerte zonder verplichtingen</span>
                  </div>
                  <div className="flex items-center space-x-3" data-testid="benefit-showroom-visit">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="text-foreground">Bezoek onze showroom voor demo's</span>
                  </div>
                </div>
              </div>
              
              <QuoteForm />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials & Showroom */}
      <section className="py-20 bg-secondary">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Testimonials */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-8">Wat Klanten Zeggen</h2>
              
              <div className="space-y-6">
                {reviews?.slice(0, 3).map((review: Review) => (
                  <Card key={review.id} className="bg-card border-border" data-testid={`testimonial-${review.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="flex items-center">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-muted-foreground">{review.rating}/5</span>
                        {review.isVerified && (
                          <Badge variant="secondary" className="ml-2 text-xs px-2 py-1 bg-green-100 text-green-700 border-green-200">
                            Geverifieerd
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-card-foreground mb-2">{review.title}</h3>
                      <p className="text-card-foreground mb-4 leading-relaxed">
                        "{review.content}"
                      </p>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-card-foreground">{review.customerName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString('nl-NL', { 
                              year: 'numeric', 
                              month: 'long'
                            })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) || (
                  // Fallback voor als reviews nog laden
                  <div className="space-y-6">
                    {[1, 2].map((i) => (
                      <Card key={i} className="bg-card border-border animate-pulse">
                        <CardContent className="p-6">
                          <div className="h-4 bg-muted rounded mb-4"></div>
                          <div className="h-16 bg-muted rounded mb-4"></div>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-muted rounded-full"></div>
                            <div>
                              <div className="h-4 bg-muted rounded mb-2 w-24"></div>
                              <div className="h-3 bg-muted rounded w-16"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Showroom Info */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">Bezoek Onze Showroom</h2>
              
              <div 
                className="aspect-[16/10] bg-cover bg-center rounded-2xl" 
                style={{
                  backgroundImage: "url('/showroom-1.jpg')"
                }}
              ></div>
              
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className="aspect-square bg-cover bg-center rounded-xl" 
                  style={{
                    backgroundImage: "url('/showroom-2.jpg')"
                  }}
                ></div>
                <div 
                  className="aspect-square bg-cover bg-center rounded-xl" 
                  style={{
                    backgroundImage: "url('/showroom-3.jpg')"
                  }}
                ></div>
              </div>
              
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-card-foreground mb-4">Waarom naar onze showroom?</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3" data-testid="showroom-benefit-demo">
                      <Volume2 className="w-4 h-4 text-primary" />
                      <span className="text-sm text-card-foreground">Live demo van alle audiosystemen</span>
                    </div>
                    <div className="flex items-center space-x-3" data-testid="showroom-benefit-advice">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-sm text-card-foreground">Persoonlijk advies van experts</span>
                    </div>
                    <div className="flex items-center space-x-3" data-testid="showroom-benefit-installation">
                      <Car className="w-4 h-4 text-primary" />
                      <span className="text-sm text-card-foreground">Direct installatie mogelijk</span>
                    </div>
                    <div className="flex items-center space-x-3" data-testid="showroom-benefit-comfort">
                      <Coffee className="w-4 h-4 text-primary" />
                      <span className="text-sm text-card-foreground">Comfortabele wachtruimte</span>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-6" size="lg" data-testid="button-plan-showroom-visit">
                    Plan Showroom Bezoek
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
