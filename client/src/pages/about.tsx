import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Award, 
  Users, 
  Wrench,
  Star,
  Car,
  Heart
} from "lucide-react";

export default function About() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <Header onCartClick={() => setIsCartOpen(true)} />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-50 to-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Car Audio Limburg, to enjoy a safe ride!
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Welkom bij Car Audio Limburg. Al 10 jaar dé specialist in Limburg op het gebied van mobiliteit beleving en audio in een voertuig. Wij zorgen voor gemak en plezier onderweg!
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Onze Visie
                </h2>
                <div className="space-y-4 text-gray-600">
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

              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Award className="h-12 w-12 text-[#d0a760] mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">10 Jaar</h3>
                    <p className="text-sm text-gray-600">Ervaring in car audio</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="h-12 w-12 text-[#d0a760] mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">500+</h3>
                    <p className="text-sm text-gray-600">Tevreden klanten</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Wrench className="h-12 w-12 text-[#d0a760] mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">Gecertificeerd</h3>
                    <p className="text-sm text-gray-600">Alpine & Audison dealer</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Star className="h-12 w-12 text-[#d0a760] mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">Premium</h3>
                    <p className="text-sm text-gray-600">Alleen topkwaliteit</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <Separator className="my-16" />

        {/* Services Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Onze Specialiteiten
              </h2>
              <p className="text-xl text-gray-600">
                Van advies tot installatie - wij begeleiden u door het hele proces
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6">
                  <Car className="h-12 w-12 text-[#d0a760] mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Complete Installaties
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Van multimedia systemen tot complete audiosystemen. 
                    Professioneel geïnstalleerd in onze werkplaats.
                  </p>
                  <Badge variant="outline" className="text-[#d0a760] border-[#d0a760]">
                    €89 installatiekosten
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <Award className="h-12 w-12 text-[#d0a760] mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Premium Audio
                  </h3>
                  <p className="text-gray-600 mb-4">
                    High-end audiosystemen met DSP tuning voor de perfecte 
                    geluidsbeleving op maat van uw voertuig.
                  </p>
                  <Badge variant="outline" className="text-[#d0a760] border-[#d0a760]">
                    Custom maatwerk
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <Heart className="h-12 w-12 text-[#d0a760] mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Persoonlijk Advies
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Elk project is uniek. Wij denken met u mee voor de beste 
                    oplossing binnen uw budget en wensen.
                  </p>
                  <Badge variant="outline" className="text-[#d0a760] border-[#d0a760]">
                    Gratis adviesgesprek
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Separator className="my-16" />

        {/* Contact Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Bezoek Onze Werkplaats
              </h2>
              <p className="text-xl text-gray-600">
                Kom langs voor advies of maak een afspraak voor installatie
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <MapPin className="h-12 w-12 text-[#d0a760] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Adres</h3>
                  <p className="text-gray-600">
                    Dr. Nolenslaan 157c<br />
                    6136 GM Sittard<br />
                    Nederland
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Phone className="h-12 w-12 text-[#d0a760] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Telefoon</h3>
                  <p className="text-gray-600">
                    <a href="tel:0852733625" className="hover:text-[#d0a760] transition-colors">
                      085 - 27 33 625
                    </a>
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    WhatsApp beschikbaar
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 text-[#d0a760] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Openingstijden</h3>
                  <div className="text-gray-600 space-y-1">
                    <p className="font-semibold mb-2">Showroom:</p>
                    <p>Ma-Do: 13:30 - 17:30</p>
                    <p>Vrijdag: 08:30 - 15:00</p>
                    <p className="font-semibold mt-3 mb-2">Inbouwstudio:</p>
                    <p>Ma-Do: 08:30 - 17:30</p>
                    <p>Vrijdag: 08:30 - 12:30</p>
                    <p className="text-sm mt-2 text-red-600">Enkel op afspraak</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}