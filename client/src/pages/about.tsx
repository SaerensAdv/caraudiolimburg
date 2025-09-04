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
                Over Car Audio Limburg
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Specialist in car audio installaties en premium autosound systemen. 
                Al meer dan 15 jaar uw partner voor de perfecte rijervaring.
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
                  Ons Verhaal
                </h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Car Audio Limburg werd opgericht vanuit een passie voor perfect geluid en 
                    technische innovatie. Wat begon als een kleine werkplaats is uitgegroeid 
                    tot dé specialist in Limburg voor car audio installaties.
                  </p>
                  <p>
                    We werken uitsluitend met premium merken zoals Alpine, Audison, Focal en 
                    JL Audio. Onze technici hebben jarenlange ervaring en blijven zich 
                    continu ontwikkelen met de nieuwste technieken en producten.
                  </p>
                  <p>
                    Van een eenvoudige speaker upgrade tot complete high-end audiosystemen 
                    met DSP tuning - wij realiseren uw perfecte audio-ervaring op maat.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Award className="h-12 w-12 text-[#d0a760] mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">15+ Jaar</h3>
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
                    Industrieweg 12<br />
                    6040 Roermond<br />
                    Nederland
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Phone className="h-12 w-12 text-[#d0a760] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Telefoon</h3>
                  <p className="text-gray-600">
                    <a href="tel:0475636363" className="hover:text-[#d0a760] transition-colors">
                      047 563 63 63
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
                    <p>Ma-Vr: 09:00 - 17:30</p>
                    <p>Zaterdag: 09:00 - 16:00</p>
                    <p>Zondag: Gesloten</p>
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