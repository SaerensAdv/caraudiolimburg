import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { ScrollReveal, StaggerContainer, GoldAccentLine } from "@/components/ScrollAnimations";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  Clock, 
  Euro, 
  Wrench, 
  Shield, 
  Phone,
  MessageCircle,
  MapPin,
  ChevronDown,
  ArrowRight
} from "lucide-react";
import { Link } from "wouter";

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
    <div className="min-h-screen bg-black scroll-smooth">
      <Header onCartOpen={() => setIsCartOpen(true)} variant="transparent" />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      <main className="flex-grow">
        {/* Hero Section - Dark Premium */}
        <section className="relative bg-black pt-32 pb-20 md:pt-40 md:pb-28">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 to-black" />
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ScrollReveal direction="up" delay={100}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-900 border border-zinc-800 mb-8">
                <HelpCircle className="h-8 w-8 text-[#d0a760]" />
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={200}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-6">
                Veelgestelde <span className="text-[#d0a760]">Vragen</span>
              </h1>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={300}>
              <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
                Hier vindt u antwoorden op de meest gestelde vragen over onze producten, 
                installaties en service. Staat uw vraag er niet bij? Neem gerust contact op.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={400}>
              <GoldAccentLine className="mt-12 max-w-xs mx-auto" />
            </ScrollReveal>
          </div>
        </section>

        {/* Quick Contact Bar */}
        <ScrollReveal>
          <section className="bg-zinc-900 border-y border-zinc-800 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <h3 className="text-white font-medium mb-1">Nog vragen? We helpen graag!</h3>
                  <p className="text-white/50 text-sm">Bel, WhatsApp of kom langs voor persoonlijk advies</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="tel:+31852733625">
                    <Button 
                      className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none min-h-[44px] px-6"
                      data-testid="button-call"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      +31(0)85 - 27 33 625
                    </Button>
                  </a>
                  <a href="https://wa.me/31852733625" target="_blank" rel="noopener noreferrer">
                    <Button 
                      variant="outline" 
                      className="border-zinc-700 text-white hover:bg-zinc-800 hover:border-[#d0a760] rounded-none min-h-[44px] px-6"
                      data-testid="button-whatsapp"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* FAQ Sections */}
        <section className="py-16 md:py-24 bg-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <StaggerContainer className="space-y-12 md:space-y-16" staggerDelay={100}>
              {faqData.map((category, categoryIndex) => (
                <ScrollReveal key={categoryIndex} delay={categoryIndex * 100}>
                  <div>
                    {/* Category Header */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex items-center justify-center w-10 h-10 bg-zinc-900 border border-zinc-800 text-[#d0a760]">
                        {category.icon}
                      </div>
                      <h2 className="text-xl md:text-2xl font-light text-white">
                        {category.category}
                      </h2>
                    </div>

                    {/* Accordion */}
                    <div className="bg-zinc-900 border border-zinc-800">
                      <Accordion type="single" collapsible className="w-full">
                        {category.questions.map((item, questionIndex) => (
                          <AccordionItem 
                            key={questionIndex} 
                            value={`${categoryIndex}-${questionIndex}`}
                            className="border-b border-zinc-800 last:border-b-0"
                            data-testid={`accordion-item-${categoryIndex}-${questionIndex}`}
                          >
                            <AccordionTrigger 
                              className="text-left text-white hover:text-[#d0a760] transition-colors px-5 py-4 min-h-[56px] text-base font-normal hover:no-underline group [&>svg]:text-[#d0a760] [&>svg]:h-5 [&>svg]:w-5"
                            >
                              {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-white/60 leading-relaxed px-5 pb-5 text-base">
                              {item.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Contact CTA Section */}
        <section className="py-16 md:py-24 bg-zinc-950 border-t border-zinc-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
                  Staat uw vraag er <span className="text-[#d0a760]">niet bij?</span>
                </h2>
                <p className="text-white/60 text-lg max-w-xl mx-auto">
                  Ons team staat klaar om al uw vragen te beantwoorden en u te helpen 
                  met de perfecte car audio oplossing.
                </p>
              </div>
            </ScrollReveal>
            
            <StaggerContainer className="grid md:grid-cols-3 gap-6" staggerDelay={100}>
              {/* Call Card */}
              <ScrollReveal delay={100}>
                <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-8 text-center group hover:border-[#d0a760]/50 transition-colors">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-zinc-800 border border-zinc-700 mb-5 group-hover:border-[#d0a760]/50 transition-colors">
                    <Phone className="h-6 w-6 text-[#d0a760]" />
                  </div>
                  <h3 className="text-white font-medium text-lg mb-2">Bellen</h3>
                  <p className="text-white/50 text-sm mb-4">Direct contact met onze experts</p>
                  <a href="tel:+31852733625" className="inline-block">
                    <span className="text-[#d0a760] text-sm font-medium hover:underline underline-offset-4">
                      +31(0)85 - 27 33 625
                    </span>
                  </a>
                </div>
              </ScrollReveal>

              {/* WhatsApp Card */}
              <ScrollReveal delay={200}>
                <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-8 text-center group hover:border-[#d0a760]/50 transition-colors">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-zinc-800 border border-zinc-700 mb-5 group-hover:border-[#d0a760]/50 transition-colors">
                    <MessageCircle className="h-6 w-6 text-[#d0a760]" />
                  </div>
                  <h3 className="text-white font-medium text-lg mb-2">WhatsApp</h3>
                  <p className="text-white/50 text-sm mb-4">Snel en makkelijk communiceren</p>
                  <a 
                    href="https://wa.me/31852733625" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <span className="text-[#d0a760] text-sm font-medium hover:underline underline-offset-4">
                      Online chat starten
                    </span>
                  </a>
                </div>
              </ScrollReveal>

              {/* Visit Card */}
              <ScrollReveal delay={300}>
                <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-8 text-center group hover:border-[#d0a760]/50 transition-colors">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-zinc-800 border border-zinc-700 mb-5 group-hover:border-[#d0a760]/50 transition-colors">
                    <MapPin className="h-6 w-6 text-[#d0a760]" />
                  </div>
                  <h3 className="text-white font-medium text-lg mb-2">Bezoek</h3>
                  <p className="text-white/50 text-sm mb-4">Kom langs voor persoonlijk advies</p>
                  <span className="text-[#d0a760] text-sm font-medium">
                    Dr. Nolenslaan 157c, Sittard
                  </span>
                </div>
              </ScrollReveal>
            </StaggerContainer>

            {/* CTA Buttons */}
            <ScrollReveal delay={400}>
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/contact">
                  <Button 
                    className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none px-8 py-6 min-h-[52px] text-base"
                    data-testid="button-contact-page"
                  >
                    Naar Contactpagina
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/booking">
                  <Button 
                    variant="outline"
                    className="border-zinc-700 text-white hover:bg-zinc-800 hover:border-[#d0a760] rounded-none px-8 py-6 min-h-[52px] text-base"
                    data-testid="button-book-appointment"
                  >
                    Afspraak Maken
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
