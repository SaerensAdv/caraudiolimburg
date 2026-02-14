import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { ScrollReveal } from "@/components/ScrollAnimations";
import { FileText, Truck, RotateCcw, CreditCard, Wrench, AlertCircle } from "lucide-react";

export default function VoorwaardenPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const sections = [
    {
      icon: FileText,
      title: "Algemeen",
      content: `Deze algemene voorwaarden zijn van toepassing op alle aanbiedingen, bestellingen en overeenkomsten van Car Audio Limburg.

Door een bestelling te plaatsen of een afspraak te maken, gaat u akkoord met deze voorwaarden. Wij behouden ons het recht voor deze voorwaarden te wijzigen.`
    },
    {
      icon: CreditCard,
      title: "Prijzen & Betaling",
      content: `• Alle prijzen zijn inclusief BTW
• Prijzen kunnen zonder voorafgaande kennisgeving worden gewijzigd
• Betaling geschiedt via iDEAL, Bancontact, creditcard of contant bij afhaling
• Bij installatie-afspraken wordt een aanbetaling van 50% gevraagd
• Facturatie vindt plaats na voltooiing van de bestelling of installatie`
    },
    {
      icon: Truck,
      title: "Levering & Verzending",
      content: `• Gratis verzending bij bestellingen vanaf €100
• Standaard verzendkosten: €15,00
• Levertijd is doorgaans 1-3 werkdagen
• Afhalen in onze showroom is gratis mogelijk
• Bij levering dient u de producten direct te controleren op beschadigingen
• Wij zijn niet aansprakelijk voor vertragingen door derden`
    },
    {
      icon: Wrench,
      title: "Installatie Service",
      content: `• Installatie wordt uitgevoerd door gecertificeerde monteurs
• Afspraken kunnen tot 48 uur van tevoren kosteloos worden geannuleerd
• Bij annulering binnen 48 uur wordt 50% van de installatiekosten in rekening gebracht
• De geschatte installatietijd is indicatief en kan variëren
• Wij zijn niet verantwoordelijk voor bestaande schade aan uw voertuig
• Garantie op installatiewerkzaamheden: 2 jaar`
    },
    {
      icon: RotateCcw,
      title: "Retourneren & Garantie",
      content: `• 30 dagen bedenktijd voor online aankopen (niet-geïnstalleerde producten)
• Producten moeten ongebruikt en in originele verpakking worden geretourneerd
• Retourkosten zijn voor rekening van de klant, tenzij het product defect is
• Fabrieksgarantie volgens specificaties van de fabrikant
• Garantie vervalt bij onjuiste installatie of oneigenlijk gebruik
• Defecte producten worden gerepareerd of vervangen`
    },
    {
      icon: AlertCircle,
      title: "Aansprakelijkheid",
      content: `• Car Audio Limburg is niet aansprakelijk voor indirecte schade
• Onze aansprakelijkheid is beperkt tot het aankoopbedrag van het product
• Wij zijn niet verantwoordelijk voor schade door onjuist gebruik
• Bij geschillen is Nederlands recht van toepassing
• Geschillen worden voorgelegd aan de bevoegde rechter te Maastricht`
    }
  ];

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header onCartOpen={() => setIsCartOpen(true)} />
      
      <section className="pt-24 pb-16 bg-zinc-950">
        <div className="container px-4 md:px-8 lg:px-16 mx-auto">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#d0a760]/10 mb-6">
                <FileText className="w-8 h-8 text-[#d0a760]" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                Algemene Voorwaarden
              </h1>
              <p className="text-white/60 text-lg">
                Lees onze algemene voorwaarden voor bestellingen, leveringen, installaties en retourzendingen.
              </p>
              <p className="text-white/40 text-sm mt-4">
                Laatst bijgewerkt: December 2024
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-16 bg-black flex-1">
        <div className="container px-4 md:px-8 lg:px-16 mx-auto">
          <div className="max-w-4xl mx-auto space-y-8">
            {sections.map((section, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#d0a760]/10 flex-shrink-0">
                      <section.icon className="w-6 h-6 text-[#d0a760]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-4">{section.title}</h2>
                      <div className="text-white/60 whitespace-pre-line leading-relaxed">
                        {section.content}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}

            <ScrollReveal delay={600}>
              <div className="bg-[#d0a760]/10 border border-[#d0a760]/30 p-6 text-center">
                <p className="text-[#d0a760] text-sm mb-2">
                  <strong>Car Audio Limburg</strong>
                </p>
                <p className="text-white/60 text-sm">
                  Dr. Nolenslaan 157-C (Hal 3), 6136 GM Sittard | KvK: 69446415 | BTW: NL857877355B01
                </p>
                <p className="text-white/40 text-xs mt-2">
                  Online geschillenbeslechting:{" "}
                  <a 
                    href="https://ec.europa.eu/consumers/odr/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#d0a760] hover:underline"
                  >
                    https://ec.europa.eu/consumers/odr/
                  </a>
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
