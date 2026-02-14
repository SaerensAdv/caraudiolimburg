import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { ScrollReveal } from "@/components/ScrollAnimations";
import { BreadcrumbSchema } from "@/components/StructuredData";
import { Shield, Lock, Eye, Database, Envelope, Phone } from "@phosphor-icons/react";

export default function PrivacyPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const sections = [
    {
      icon: Database,
      title: "Welke gegevens verzamelen wij?",
      content: `Wij verzamelen de volgende persoonsgegevens wanneer u onze diensten gebruikt:
      
• Naam en contactgegevens (e-mail, telefoonnummer, adres)
• Voertuiginformatie voor compatibiliteitscontroles
• Bestelgeschiedenis en betalingsgegevens
• Account informatie indien u zich registreert
• Technische gegevens zoals IP-adres en browsertype`
    },
    {
      icon: Eye,
      title: "Waarvoor gebruiken wij uw gegevens?",
      content: `Uw persoonsgegevens worden gebruikt voor:
      
• Het verwerken en leveren van uw bestellingen
• Het plannen van installatie-afspraken
• Klantenservice en ondersteuning
• Het versturen van orderbevestigingen en updates
• Het verbeteren van onze website en diensten
• Marketingcommunicatie (alleen met uw toestemming)`
    },
    {
      icon: Lock,
      title: "Hoe beveiligen wij uw gegevens?",
      content: `Wij nemen de bescherming van uw gegevens serieus:
      
• SSL-encryptie voor alle datatransmissies
• Beveiligde betalingsverwerking via Stripe
• Beperkte toegang tot persoonsgegevens
• Regelmatige beveiligingsaudits
• Gegevens worden opgeslagen binnen de EU`
    },
    {
      icon: Shield,
      title: "Uw rechten",
      content: `U heeft de volgende rechten met betrekking tot uw persoonsgegevens:
      
• Recht op inzage in uw gegevens
• Recht op correctie van onjuiste gegevens
• Recht op verwijdering van uw gegevens
• Recht om bezwaar te maken tegen verwerking
• Recht op gegevensoverdraagbaarheid
• Recht om uw toestemming in te trekken`
    }
  ];

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <BreadcrumbSchema items={[
        { name: "Home", url: "/" },
        { name: "Privacybeleid", url: "/privacy-policy" }
      ]} />
      <Header onCartOpen={() => setIsCartOpen(true)} />
      
      <section className="pt-24 pb-16 bg-zinc-950">
        <div className="container px-4 md:px-8 lg:px-16 mx-auto">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#d0a760]/10 mb-6">
                <Shield className="w-8 h-8 text-[#d0a760]" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                Privacybeleid
              </h1>
              <p className="text-white/60 text-lg">
                Car Audio Limburg respecteert uw privacy en zorgt ervoor dat uw persoonlijke 
                gegevens met de grootst mogelijke zorg worden behandeld.
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

            <ScrollReveal delay={400}>
              <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#d0a760]/10 flex-shrink-0">
                    <Envelope className="w-6 h-6 text-[#d0a760]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">Contact</h2>
                    <p className="text-white/60 mb-4">
                      Heeft u vragen over ons privacybeleid of wilt u uw rechten uitoefenen? 
                      Neem dan contact met ons op:
                    </p>
                    <div className="space-y-2 text-white/60">
                      <p className="flex items-center gap-2">
                        <Envelope className="w-4 h-4 text-[#d0a760]" />
                        <a href="mailto:privacy@caraudiolimburg.nl" className="hover:text-[#d0a760] transition-colors">
                          privacy@caraudiolimburg.nl
                        </a>
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#d0a760]" />
                        <a href="tel:0852733625" className="hover:text-[#d0a760] transition-colors">
                          085-27 33 625
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={500}>
              <div className="bg-[#d0a760]/10 border border-[#d0a760]/30 p-6 text-center">
                <p className="text-[#d0a760] text-sm">
                  Car Audio Limburg is gevestigd te Dr. Nolenslaan 157c, 6136 GM Sittard en 
                  is verantwoordelijk voor de verwerking van uw persoonsgegevens.
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
