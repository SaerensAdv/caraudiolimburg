import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { BookingCalendar } from "@/components/BookingCalendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Shield, 
  Calendar,
  Award,
  Wrench,
  Users,
  Car,
  Coffee,
  MapPin,
  Phone,
  Star,
  User
} from "lucide-react";

export default function Booking() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onCartOpen={() => setIsCartOpen(true)} />
      
      {/* Hero Section */}
      <section className="py-16 bg-secondary">
        <div className="container px-4 mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Professionele Car Audio Installatie
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Boek je installatie-afspraak online. Onze gecertificeerde monteurs zorgen voor een perfecte installatie.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Award className="w-4 h-4 mr-2" />
              2 jaar garantie
            </Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Clock className="w-4 h-4 mr-2" />
              Binnen 2-4 uur klaar
            </Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              Gecertificeerde monteurs
            </Badge>
          </div>
        </div>
      </section>

      {/* Booking Calendar */}
      <section className="py-20 bg-background">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Plan je Installatie</h2>
            <p className="text-lg text-muted-foreground">
              Selecteer een service en kies je gewenste datum en tijd
            </p>
          </div>

          <BookingCalendar />
        </div>
      </section>

      {/* Installation Services Info */}
      <section className="py-20 bg-secondary">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Onze Installatie Services</h2>
            <p className="text-lg text-muted-foreground">
              Van eenvoudige radio installatie tot complete audio systemen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card border-border hover:shadow-lg transition-shadow" data-testid="service-radio">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Car className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">Autoradio Installatie</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Vervangen van je originele radio met moderne multimedia systeem
                </p>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Duur: 2-3 uur</p>
                  <p className="font-semibold text-primary">vanaf €89</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:shadow-lg transition-shadow" data-testid="service-speakers">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Wrench className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">Speaker Upgrade</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Vervangen van originele speakers voor beter geluid
                </p>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Duur: 3-4 uur</p>
                  <p className="font-semibold text-primary">vanaf €129</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:shadow-lg transition-shadow" data-testid="service-complete">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">Complete Audio Systeem</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Volledige audio upgrade met radio, speakers en subwoofer
                </p>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Duur: 6-8 uur</p>
                  <p className="font-semibold text-primary">vanaf €299</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:shadow-lg transition-shadow" data-testid="service-custom">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">Custom Offerte</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Op maat gemaakt systeem voor specifieke wensen
                </p>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Duur: Variabel</p>
                  <p className="font-semibold text-primary">Op aanvraag</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-background">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Waarom voor onze installatie service kiezen?
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4" data-testid="benefit-fast-service">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Snelle Service</h3>
                    <p className="text-muted-foreground">
                      De meeste installaties zijn binnen dezelfde dag klaar. Gemiddeld 2-4 uur per installatie.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4" data-testid="benefit-warranty">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">2 Jaar Garantie</h3>
                    <p className="text-muted-foreground">
                      Volledige garantie op alle installaties. Als er iets mis gaat, maken wij het kosteloos in orde.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4" data-testid="benefit-certified">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Gecertificeerde Monteurs</h3>
                    <p className="text-muted-foreground">
                      Onze technici zijn gespecialiseerd in car audio en hebben jarenlange ervaring.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4" data-testid="benefit-flexible">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Flexibele Planning</h3>
                    <p className="text-muted-foreground">
                      Ook avond- en weekendafspraken mogelijk. Plan eenvoudig online je afspraak.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div 
                className="aspect-[4/3] bg-cover bg-center rounded-2xl"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1487754180451-c456f719a1fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600')"
                }}
              />
              
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-card-foreground mb-4">Wat kun je verwachten?</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Coffee className="w-4 h-4 text-primary" />
                      <span className="text-sm text-card-foreground">Comfortabele wachtruimte met WiFi</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Car className="w-4 h-4 text-primary" />
                      <span className="text-sm text-card-foreground">OEM-look resultaat</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-sm text-card-foreground">Persoonlijke uitleg na installatie</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-sm text-card-foreground">Gratis parkeren voor de deur</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Location */}
      <section className="py-20 bg-secondary">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Bezoek onze Studio</h2>
              
              <Card className="bg-card border-border mb-6">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <p className="font-medium text-card-foreground">Dr. Nolenslaan 157c</p>
                        <p className="text-sm text-muted-foreground">6136 GM Sittard</p>
                        <p className="text-xs text-muted-foreground">Gratis parkeren beschikbaar</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <p className="font-medium text-card-foreground">Openingstijden</p>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Maandag - Vrijdag: 9:00 - 18:00</p>
                          <p>Zaterdag: 9:00 - 17:00</p>
                          <p>Zondag: Gesloten</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Phone className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <p className="font-medium text-card-foreground">+31(0)85 - 27 33 625</p>
                        <p className="text-sm text-muted-foreground">Bereikbaar tijdens openingstijden</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-6" size="lg" data-testid="button-contact-studio">
                    Bel voor meer informatie
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Testimonial */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Wat klanten zeggen</h2>
              
              <div className="space-y-6">
                <Card className="bg-card border-border" data-testid="testimonial-installation">
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
                      "Perfecte installatie van mijn nieuwe Alpine systeem. Het ziet eruit alsof het 
                      van de fabriek komt en de geluidskwaliteit is fantastisch!"
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">Jan Smits</p>
                        <p className="text-sm text-muted-foreground">BMW 3-Serie</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
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
                      "Zeer professionele service. Op tijd klaar en duidelijke uitleg over 
                      alle functies. Echt een aanrader!"
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">Maria Jansen</p>
                        <p className="text-sm text-muted-foreground">VW Golf</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
