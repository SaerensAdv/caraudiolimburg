import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  Clock, 
  Euro, 
  Wrench, 
  Shield, 
  Phone,
  MessageCircle
} from "lucide-react";

export default function FAQ() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const faqData = [
    {
      category: "Installatie & Service",
      icon: <Wrench className="h-5 w-5" />,
      questions: [
        {
          question: "Hoeveel kost een installatie?",
          answer: "Onze standaard installatiekosten zijn €89 excl. BTW. Dit geldt voor de meeste multimedia systemen en speakers. Voor complexere installaties maken we een offerte op maat."
        },
        {
          question: "Hoe lang duurt een installatie?",
          answer: "Een standaard multimedia installatie duurt ongeveer 2-3 uur. Speaker vervangingen 1-2 uur. Complete audiosystemen kunnen 1-2 dagen in beslag nemen, afhankelijk van de complexiteit."
        },
        {
          question: "Kan ik tijdens de installatie wachten?",
          answer: "Voor korte installaties (1-2 uur) kunt u wachten in onze wachtruimte. Bij langere projecten plannen we een afspraak en kunt u uw auto aan het eind van de dag ophalen."
        },
        {
          question: "Bieden jullie garantie op installaties?",
          answer: "Ja, wij geven 2 jaar garantie op al onze installaties. Op de producten zelf geldt de fabrieksgarantie van 2-5 jaar, afhankelijk van het merk."
        },
        {
          question: "Installeren jullie ook producten die ik zelf heb gekocht?",
          answer: "Ja, dat is mogelijk. We hanteren dan wel een aangepast uurtarief van €65 per uur en kunnen geen garantie geven op producten die we niet zelf geleverd hebben."
        }
      ]
    },
    {
      category: "Producten & Prijzen",
      icon: <Euro className="h-5 w-5" />,
      questions: [
        {
          question: "Welke merken verkopen jullie?",
          answer: "We zijn officiële dealer van Alpine, Audison, Focal, Hertz, JL Audio, Pioneer en Kenwood. We werken uitsluitend met A-merken voor optimale kwaliteit en garantie."
        },
        {
          question: "Maken jullie ook offerte op maat?",
          answer: "Absoluut! Elk project is uniek. We maken graag een persoonlijke offerte op basis van uw auto, wensen en budget. Een adviesgesprek is altijd gratis."
        },
        {
          question: "Zijn jullie prijzen concurrerend?",
          answer: "Door onze jarenlange ervaring en goede relaties met leveranciers kunnen we zeer scherpe prijzen bieden. We matchen ook geverifieerde prijzen van andere dealers."
        },
        {
          question: "Kan ik producten reserveren?",
          answer: "Ja, tegen betaling van een aanbetaling van 20% reserveren we producten voor u. De resterende betaling volgt bij afhaling of installatie."
        }
      ]
    },
    {
      category: "Voertuig Compatibiliteit",
      icon: <Shield className="h-5 w-5" />,
      questions: [
        {
          question: "Passen jullie producten in mijn auto?",
          answer: "We controleren altijd de compatibiliteit vooraf. Voor moderne auto's met fabriek audiosystemen adviseren we vaak OEM upgrade oplossingen die alle functies behouden."
        },
        {
          question: "Blijven mijn stuurwielknoppen werken?",
          answer: "In de meeste gevallen wel. We gebruiken speciale interfaces die alle fabrieksfuncties behouden, inclusief stuurwielknoppen en display informatie."
        },
        {
          question: "Kan mijn garantie vervallen door modificaties?",
          answer: "Onze installaties zijn vakkundig uitgevoerd en tasten de fabrieksgarantie niet aan. We werken volgens branchestandaarden en documenteren alle aanpassingen."
        },
        {
          question: "Installeren jullie ook in elektrische auto's?",
          answer: "Ja, we hebben speciale expertise voor EV's. Door het ontbreken van motorgeluid is goede audiokwaliteit extra belangrijk in elektrische voertuigen."
        }
      ]
    },
    {
      category: "Afspraken & Service",
      icon: <Clock className="h-5 w-5" />,
      questions: [
        {
          question: "Hoe maak ik een afspraak?",
          answer: "U kunt online een afspraak boeken, bellen naar 047 563 63 63, of WhatsApp sturen. We reageren meestal binnen 2 uur tijdens kantooruren."
        },
        {
          question: "Kan ik ook 's avonds of weekends terecht?",
          answer: "Op afspraak zijn avond- en weekendafspraken mogelijk tegen een kleine toeslag. Dit is handig voor werkende mensen die overdag niet kunnen."
        },
        {
          question: "Wat als ik mijn afspraak moet verzetten?",
          answer: "Geen probleem! Geef ons minimaal 24 uur van tevoren een seintje, dan kunnen we vaak een nieuw tijdstip inplannen zonder kosten."
        },
        {
          question: "Bieden jullie ook onderhoud en reparaties?",
          answer: "Ja, we onderhouden en repareren alle systemen die we geïnstalleerd hebben. Voor producten van andere installateurs kijken we eerst naar de haalbaarheid."
        }
      ]
    }
  ];

  return (
    <>
      <Header onCartClick={() => setIsCartOpen(true)} />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-50 to-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <HelpCircle className="h-16 w-16 text-[#d0a760] mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Veelgestelde Vragen
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hier vindt u antwoorden op de meest gestelde vragen over onze producten, 
              installaties en service. Staat uw vraag er niet bij? Neem gerust contact op!
            </p>
          </div>
        </section>

        {/* Quick Contact */}
        <section className="py-8 bg-[#d0a760] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <h3 className="text-xl font-semibold mb-2">Nog vragen? We helpen graag!</h3>
                <p className="opacity-90">Bel, WhatsApp of kom langs voor persoonlijk advies</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="secondary" 
                  className="bg-white text-[#d0a760] hover:bg-gray-100"
                  data-testid="button-call"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  047 563 63 63
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-[#d0a760]"
                  data-testid="button-whatsapp"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-12">
              {faqData.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-[#d0a760] text-white rounded-lg">
                      {category.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {category.category}
                    </h2>
                  </div>

                  <Card>
                    <CardContent className="p-6">
                      <Accordion type="single" collapsible className="w-full">
                        {category.questions.map((item, questionIndex) => (
                          <AccordionItem 
                            key={questionIndex} 
                            value={`${categoryIndex}-${questionIndex}`}
                            data-testid={`accordion-item-${categoryIndex}-${questionIndex}`}
                          >
                            <AccordionTrigger className="text-left hover:text-[#d0a760] transition-colors">
                              {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 leading-relaxed">
                              {item.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Staat uw vraag er niet bij?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Ons team staat klaar om al uw vragen te beantwoorden en u te helpen 
              met de perfecte car audio oplossing.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6">
                <Phone className="h-12 w-12 text-[#d0a760] mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Bellen</h3>
                <p className="text-gray-600 mb-4">Direct contact met onze experts</p>
                <Badge variant="secondary">+31(0)85 - 27 33 625</Badge>
              </Card>

              <Card className="p-6">
                <MessageCircle className="h-12 w-12 text-[#d0a760] mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">WhatsApp</h3>
                <p className="text-gray-600 mb-4">Snel en makkelijk communiceren</p>
                <a href="https://wa.me/31852733625" target="_blank" rel="noopener noreferrer">
                  <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 transition-colors">Online chat</Badge>
                </a>
              </Card>

              <Card className="p-6">
                <HelpCircle className="h-12 w-12 text-[#d0a760] mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Bezoek</h3>
                <p className="text-gray-600 mb-4">Kom langs voor persoonlijk advies</p>
                <Badge variant="secondary">Dr. Nolenslaan 157c,
                6136 GM Sittard</Badge>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}