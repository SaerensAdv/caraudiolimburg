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
  Store, 
  Truck, 
  Settings, 
  Wrench, 
  Phone,
  MessageCircle,
  MapPin,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { Link } from "wouter";

export default function FAQ() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const faqData = [
    {
      category: "Webshop & Studio",
      icon: <Store className="h-5 w-5" />,
      questions: [
        {
          question: "Wat is het verschil tussen de webshop en de studio?",
          answer: "We begrijpen dat dit soms verwarrend kan zijn! Onze webshop (waar je nu bent) is bedoeld voor het bestellen van losse car audio producten die je zelf wilt installeren of door een installateur laat inbouwen. Voor professionele installaties en complete audio-upgrades kun je terecht bij onze inbouwstudio op caraudiolimburg.studio. Daar helpen onze experts je met advies op maat en vakkundige montage in ons atelier in Sittard."
        },
        {
          question: "Kan ik producten uit de webshop ook laten installeren?",
          answer: "Jazeker! Als je producten bij ons bestelt en deze graag professioneel wilt laten inbouwen, neem dan contact op met onze studio via caraudiolimburg.studio. We plannen dan een afspraak in waarbij we je nieuwe apparatuur vakkundig installeren. Zo weet je zeker dat alles optimaal is afgestemd op jouw auto."
        },
        {
          question: "Kan ik ook langskomen in de showroom?",
          answer: "Natuurlijk! We ontvangen je graag in onze showroom in Sittard. Hier kun je verschillende producten bekijken en beluisteren, zodat je precies weet wat je koopt. We adviseren wel om even een afspraak te maken, zodat we voldoende tijd voor je kunnen vrijmaken. Bel ons op +31(0)85 - 27 33 625 of stuur een WhatsApp."
        }
      ]
    },
    {
      category: "Verzending & Retourneren",
      icon: <Truck className="h-5 w-5" />,
      questions: [
        {
          question: "Hoe snel wordt mijn bestelling verzonden?",
          answer: "We begrijpen dat je je nieuwe audio-apparatuur zo snel mogelijk wilt ontvangen! Bestellingen die op werkdagen vóór 16:00 uur worden geplaatst, verzenden we dezelfde dag nog. Standaard verzending binnen Nederland duurt 1-2 werkdagen. Voor België en Duitsland kun je rekenen op 2-3 werkdagen."
        },
        {
          question: "Wat zijn de verzendkosten?",
          answer: "Voor bestellingen boven de €50 verzenden we gratis binnen Nederland. Voor kleinere bestellingen rekenen we €4,95 verzendkosten. Naar België en Duitsland hanteren we een vast tarief van €9,95. Bij grote of zware producten nemen we vooraf contact met je op over eventuele meerkosten."
        },
        {
          question: "Kan ik mijn bestelling retourneren?",
          answer: "Uiteraard! We willen dat je 100% tevreden bent met je aankoop. Ongebruikte producten kun je binnen 14 dagen na ontvangst retourneren. Neem eerst even contact met ons op, dan sturen we je de retourinstructies. Het aankoopbedrag wordt na ontvangst en controle binnen 5 werkdagen teruggestort. Let op: op maat gemaakte producten kunnen niet worden geretourneerd."
        },
        {
          question: "Mijn bestelling is beschadigd aangekomen, wat nu?",
          answer: "Dat is natuurlijk heel vervelend! Neem zo snel mogelijk contact met ons op en stuur foto's van de beschadiging mee. We zorgen dan voor een snelle oplossing, of dat nu een vervangend product is of een terugbetaling. Jouw tevredenheid staat bij ons voorop."
        }
      ]
    },
    {
      category: "Producten & Merken",
      icon: <Settings className="h-5 w-5" />,
      questions: [
        {
          question: "Welke merken verkopen jullie?",
          answer: "We werken uitsluitend met premium A-merken waar we zelf ook enthousiast over zijn. In ons assortiment vind je onder andere Audison, Alpine, Hertz, Focal en Boxmore. Dit zijn merken die bekendstaan om hun uitstekende geluidskwaliteit en betrouwbaarheid. We kiezen bewust voor kwaliteit boven kwantiteit, zodat je verzekerd bent van de beste audio-ervaring."
        },
        {
          question: "Hoe weet ik of een product in mijn auto past?",
          answer: "We begrijpen dat compatibiliteit belangrijk is! Bij veel producten vermelden we de passende automodellen. Twijfel je of een product geschikt is voor jouw auto? Stuur ons gerust een bericht via WhatsApp of e-mail met je autogegevens (merk, model, bouwjaar). Onze experts helpen je graag met eerlijk advies - we verkopen je liever niets dan het verkeerde product."
        },
        {
          question: "Verkopen jullie ook installatiemateriaal?",
          answer: "Jazeker! Naast speakers, versterkers en headunits hebben we ook het bijbehorende installatiemateriaal. Denk aan bekabeling, aansluitsets, adapterframes en demontagegereedschap. Zo heb je alles in huis voor een nette installatie. Bij twijfel over wat je nodig hebt, adviseren we je graag."
        },
        {
          question: "Kan ik advies krijgen over de beste producten voor mijn situatie?",
          answer: "Absoluut! We delen graag onze kennis en ervaring. Vertel ons iets over je auto, je huidige systeem en wat je wilt bereiken. Op basis daarvan geven we eerlijk en persoonlijk advies. Dit kan via telefoon, WhatsApp of e-mail. Voor uitgebreid advies met luistersessies nodigen we je uit in onze showroom."
        }
      ]
    },
    {
      category: "Installatie",
      icon: <Wrench className="h-5 w-5" />,
      questions: [
        {
          question: "Kan ik de producten zelf installeren?",
          answer: "Dat hangt af van het product en je technische ervaring. Eenvoudige upgrades zoals het vervangen van speakers zijn voor handige doe-het-zelvers vaak goed te doen. Bij de producten vermelden we de installatiecomplexiteit. Voor complexere installaties, zoals het aansluiten van versterkers of DSP's, raden we professionele installatie aan. Zo weet je zeker dat alles optimaal werkt én je garantie behouden blijft."
        },
        {
          question: "Wat zijn de voordelen van professionele installatie?",
          answer: "Bij professionele installatie door onze studio krijg je meer dan alleen montage. Onze experts stemmen het systeem perfect af op de akoestiek van jouw auto, gebruiken hoogwaardige aansluitmaterialen en zorgen voor een onzichtbare, fabrieksnette afwerking. Je krijgt bovendien 1 jaar garantie op de inbouw. Het resultaat? Een geluidskwaliteit die je niet zelf kunt bereiken."
        },
        {
          question: "Installeren jullie ook producten die ik elders heb gekocht?",
          answer: "In onze studio kunnen we ook producten installeren die je elders hebt aangeschaft. We hanteren dan een uurtarief en kunnen helaas geen garantie geven op de producten zelf. Producten uit onze eigen webshop installeren we natuurlijk met volle garantie. Neem voor installatie-afspraken contact op via caraudiolimburg.studio."
        },
        {
          question: "Blijven mijn stuurwielbediening en andere functies werken?",
          answer: "We begrijpen dat je alle gemakken wilt behouden! Bij de meeste moderne auto's kunnen we stuurwielbediening, parkeersensoren en andere fabrieksfuncties behouden met speciale adapters en interfaces. Geef bij je bestelling of adviesaanvraag aan welke functies belangrijk voor je zijn, dan zoeken we de juiste oplossing."
        },
        {
          question: "Vervalt mijn fabrieksgarantie door modificaties?",
          answer: "Dit is een veelgestelde vraag! Wanneer installaties vakkundig worden uitgevoerd, tasten ze de fabrieksgarantie normaal gesproken niet aan. Onze studio werkt volgens strikte branchestandaarden en documenteert alle aanpassingen. Bij twijfel adviseren we je om dit vooraf bij je dealer na te vragen."
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
                We helpen je graag op weg! Hieronder vind je antwoorden op de meest gestelde vragen 
                over onze producten, verzending en installatie. Staat jouw vraag er niet bij? 
                Neem gerust contact met ons op - we denken graag met je mee.
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
                  <h3 className="text-white font-medium mb-1">Liever persoonlijk advies?</h3>
                  <p className="text-white/50 text-sm">Onze experts staan voor je klaar via telefoon of WhatsApp</p>
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

        {/* Studio CTA Section */}
        <section className="py-12 md:py-16 bg-zinc-900 border-y border-zinc-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl md:text-2xl font-light text-white mb-2">
                    Op zoek naar <span className="text-[#d0a760]">professionele installatie</span>?
                  </h3>
                  <p className="text-white/60">
                    Bezoek onze inbouwstudio voor advies op maat en vakkundige montage.
                  </p>
                </div>
                <a href="https://caraudiolimburg.studio" target="_blank" rel="noopener noreferrer">
                  <Button 
                    className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none px-6 py-5 min-h-[48px] whitespace-nowrap"
                    data-testid="button-studio-link"
                  >
                    Naar de Studio
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Contact CTA Section */}
        <section className="py-16 md:py-24 bg-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
                  Staat jouw vraag er <span className="text-[#d0a760]">niet bij?</span>
                </h2>
                <p className="text-white/60 text-lg max-w-xl mx-auto">
                  Geen probleem! We helpen je graag persoonlijk verder. 
                  Neem contact met ons op via telefoon, WhatsApp of kom langs in onze showroom.
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
                  <p className="text-white/50 text-sm mb-4">Direct advies van onze experts</p>
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
                  <p className="text-white/50 text-sm mb-4">Snel en gemakkelijk contact</p>
                  <a 
                    href="https://wa.me/31852733625" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <span className="text-[#d0a760] text-sm font-medium hover:underline underline-offset-4">
                      Start een gesprek
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
                  <h3 className="text-white font-medium text-lg mb-2">Showroom</h3>
                  <p className="text-white/50 text-sm mb-4">Kom langs voor een demo</p>
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
                <Link href="/shop">
                  <Button 
                    variant="outline"
                    className="border-zinc-700 text-white hover:bg-zinc-800 hover:border-[#d0a760] rounded-none px-8 py-6 min-h-[52px] text-base"
                    data-testid="button-shop"
                  >
                    Bekijk Producten
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
