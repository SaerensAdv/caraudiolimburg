import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { VehicleSelector } from "@/components/VehicleSelector";
import { QuoteForm } from "@/components/QuoteForm";
import { CartSidebar } from "@/components/CartSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Check
} from "lucide-react";
import { useState } from "react";
import type { Product } from "@shared/schema";

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  const { data: featuredProducts, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/products", { featured: true, limit: 4 }],
  });

  const { data: brands } = useQuery({
    queryKey: ["/api/brands"],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header onCartOpen={() => setIsCartOpen(true)} />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-secondary py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/70 z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30" 
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
          }}
        ></div>
        
        <div className="relative z-20 container px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Premium Car Audio &
              <span className="text-primary"> Professionele Installatie</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Van OEM-upgrades tot complete systemen. Alpine, Audison, en meer. 
              Inclusief vakkundige montage in onze showroom.
            </p>

            <VehicleSelector />

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Button size="lg" className="text-lg px-8 py-4" data-testid="button-shop-now">
                Shop Nu
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                data-testid="button-book-installation"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Installatie Boeken
              </Button>
              <Button 
                variant="secondary" 
                size="lg" 
                className="text-lg px-8 py-4"
                onClick={() => setShowQuoteForm(true)}
                data-testid="button-request-quote"
              >
                Offerte Aanvragen
              </Button>
            </div>
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
                <div key={i} className="bg-card rounded-2xl p-6 animate-pulse" data-testid={`skeleton-product-${i}`}>
                  <div className="aspect-square bg-muted rounded-xl mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
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
                backgroundImage: "url('https://images.unsplash.com/photo-1487754180451-c456f719a1fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600')"
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
                <Card className="bg-card border-border" data-testid="testimonial-marco">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-muted-foreground">5/5</span>
                    </div>
                    <p className="text-card-foreground mb-4">
                      "Fantastische service! Alpine systeem perfect geïnstalleerd in mijn BMW. 
                      Je ziet echt niet dat het achteraf gemonteerd is."
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">Marco de Vries</p>
                        <p className="text-sm text-muted-foreground">BMW 3-Serie 2023</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border" data-testid="testimonial-linda">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-muted-foreground">5/5</span>
                    </div>
                    <p className="text-card-foreground mb-4">
                      "Top advies en vakkundige installatie. Audison speakers klinken geweldig. 
                      Zeker een aanrader voor echte audiofiele!"
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">Linda Janssen</p>
                        <p className="text-sm text-muted-foreground">Audi Q5 2022</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Showroom Info */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">Bezoek Onze Showroom</h2>
              
              <div 
                className="aspect-[16/10] bg-cover bg-center rounded-2xl" 
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500')"
                }}
              ></div>
              
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className="aspect-square bg-cover bg-center rounded-xl" 
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1487754180451-c456f719a1fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400')"
                  }}
                ></div>
                <div 
                  className="aspect-square bg-cover bg-center rounded-xl" 
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400')"
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
