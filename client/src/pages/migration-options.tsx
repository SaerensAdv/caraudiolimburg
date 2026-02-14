import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, ArrowRight, HardDrives, Cloud, Lightning, Shield, Clock, CurrencyEur, Users, Database, ImageSquare, Globe } from "@phosphor-icons/react";

interface MigrationOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  pros: string[];
  cons: string[];
  timeline: string;
  cost: "laag" | "gemiddeld" | "hoog";
  recommended?: boolean;
}

const migrationOptions: MigrationOption[] = [
  {
    id: "wp-nl-new-com",
    title: "WordPress op .nl, Nieuwe webshop op .com",
    description: "WordPress blijft actief op caraudiolimburg.nl. De nieuwe webshop gaat live op caraudiolimburg.com. 301 redirects sturen relevante pagina's door.",
    icon: <Globe className="w-8 h-8" />,
    pros: [
      "Geen downtime voor bestaande klanten",
      "Geleidelijke overgang mogelijk",
      "SEO-waarde van .nl blijft behouden tijdens transitie",
      "Tijd om nieuwe platform te testen met echte bezoekers",
      "Bestaande bookmarks en links blijven werken"
    ],
    cons: [
      "Twee domeinen actief = verwarrend voor klanten",
      "Dubbele hosting en onderhoudskosten",
      ".com minder bekend in België/Nederland",
      "301 redirects vereisen extra configuratie",
      "Split in SEO-autoriteit tussen domeinen"
    ],
    timeline: "1-2 weken",
    cost: "gemiddeld"
  },
  {
    id: "wp-com-new-nl",
    title: "WordPress naar .com, Nieuwe webshop op .nl",
    description: "WordPress wordt verplaatst naar caraudiolimburg.com (of uitgefaseerd). De nieuwe webshop gaat live op het hoofddomein caraudiolimburg.nl.",
    icon: <Lightning className="w-8 h-8" />,
    pros: [
      "Hoofddomein .nl krijgt de nieuwe, snelle webshop",
      "Beste SEO-strategie: alle autoriteit op .nl",
      "Klanten vinden direct het nieuwe platform",
      "Eén primair domein = duidelijke branding",
      "Toekomstbestendig: WordPress kan later afgesloten"
    ],
    cons: [
      "Vereist DNS-wijziging voor .nl",
      "Korte overgangperiode met mogelijke downtime",
      "Oude links/bookmarks naar WordPress breken (tenzij redirects)",
      "WordPress hosting moet mogelijk aangepast worden"
    ],
    timeline: "2-3 weken",
    cost: "gemiddeld",
    recommended: true
  },
  {
    id: "full-nl-replace",
    title: "WordPress volledig vervangen op .nl",
    description: "WordPress op caraudiolimburg.nl wordt volledig uitgeschakeld. De nieuwe webshop neemt het domein direct over. Geen .com nodig.",
    icon: <HardDrives className="w-8 h-8" />,
    pros: [
      "Schone, definitieve migratie",
      "Geen dubbele kosten of verwarring",
      "Alle SEO-waarde blijft op .nl",
      "Eenvoudigste eindsituatie",
      "Geen legacy systeem om te onderhouden"
    ],
    cons: [
      "Grotere eenmalige inspanning",
      "Alle content moet klaar zijn voor livegang",
      "Geen fallback naar oud systeem",
      "Risico bij onvoorziene problemen"
    ],
    timeline: "2-4 weken",
    cost: "laag"
  },
  {
    id: "parallel-soft-launch",
    title: "Soft launch op subdomein (shop.nl)",
    description: "Nieuwe webshop gaat live op shop.caraudiolimburg.nl of nieuw.caraudiolimburg.nl. WordPress blijft op hoofddomein totdat alles getest is.",
    icon: <Cloud className="w-8 h-8" />,
    pros: [
      "Laag risico: WordPress blijft de 'productie' site",
      "Uitgebreid testen met echte gebruikers mogelijk",
      "Geen haast om alles in één keer af te ronden",
      "Selectief verkeer doorsturen voor A/B testing"
    ],
    cons: [
      "Subdomein krijgt minder SEO-autoriteit",
      "Klanten kunnen verward raken over welke site 'echt' is",
      "Uiteindelijk nog steeds migratie naar hoofddomein nodig",
      "Langere totale doorlooptijd"
    ],
    timeline: "1-2 weken (soft launch), daarna definitieve migratie",
    cost: "laag"
  },
  {
    id: "keep-wordpress",
    title: "Blijven bij WordPress",
    description: "Geen migratie uitvoeren. De huidige WordPress webshop blijft actief op .nl. De nieuwe Replit webshop wordt niet gebruikt.",
    icon: <Clock className="w-8 h-8" />,
    pros: [
      "Geen migratie-inspanning nodig",
      "Bekende omgeving en workflows",
      "Bestaande plugins en thema's blijven werken"
    ],
    cons: [
      "Investering in nieuw platform verloren",
      "WordPress blijft trager dan moderne oplossing",
      "Beperktere mogelijkheden voor toekomstige features",
      "Hogere beveiligingsrisico's door plugins",
      "Onderhoud blijft nodig voor updates"
    ],
    timeline: "N.v.t.",
    cost: "laag"
  }
];

const comparisonPoints = [
  { feature: "Laadsnelheid", replit: "Zeer snel (< 1s)", wordpress: "Gemiddeld (2-4s)", winner: "replit" },
  { feature: "Onderhoudskosten", replit: "Laag", wordpress: "Gemiddeld tot hoog", winner: "replit" },
  { feature: "Schaalbaarheid", replit: "Uitstekend", wordpress: "Beperkt", winner: "replit" },
  { feature: "Beveiliging", replit: "Ingebouwd", wordpress: "Plugin-afhankelijk", winner: "replit" },
  { feature: "SEO Optimalisatie", replit: "Modern (React)", wordpress: "Goed (met plugins)", winner: "draw" },
  { feature: "Content beheer", replit: "Admin dashboard", wordpress: "WordPress backend", winner: "draw" },
  { feature: "Mobiele ervaring", replit: "Geoptimaliseerd", wordpress: "Theme-afhankelijk", winner: "replit" },
  { feature: "Betalingsintegratie", replit: "Stripe (native)", wordpress: "WooCommerce plugins", winner: "replit" },
];

function CostBadge({ cost }: { cost: "laag" | "gemiddeld" | "hoog" }) {
  const colors = {
    laag: "bg-green-500/20 text-green-400 border-green-500/30",
    gemiddeld: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    hoog: "bg-red-500/20 text-red-400 border-red-500/30"
  };
  
  return (
    <Badge variant="outline" className={colors[cost]}>
      <CurrencyEur className="w-3 h-3 mr-1" />
      {cost.charAt(0).toUpperCase() + cost.slice(1)}
    </Badge>
  );
}

export default function MigrationOptions() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black">
      <SEO title="Migratie" noindex={true} />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-amber-500/30 text-amber-400">
            Intern Document
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Migratie Opties
          </h1>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
            Overzicht van de verschillende mogelijkheden voor de migratie van WordPress naar het nieuwe platform.
          </p>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Database className="w-6 h-6 text-amber-400" />
            Huidige Situatie
          </h2>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-amber-500/10">
                    <Globe className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Nieuwe Webshop</h3>
                    <p className="text-zinc-400 text-sm">Replit-platform actief met alle producten en functionaliteit</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <ImageSquare className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Afbeeldingen</h3>
                    <p className="text-zinc-400 text-sm">342 producten met WordPress URLs hersteld</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Status</h3>
                    <p className="text-zinc-400 text-sm">Klaar voor productie, keuze migratiestrategie nodig</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <ArrowRight className="w-6 h-6 text-amber-400" />
            Migratie Opties
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {migrationOptions.map((option) => (
              <Card 
                key={option.id} 
                className={`bg-zinc-900/50 border-zinc-800 relative overflow-hidden ${
                  option.recommended ? 'ring-2 ring-amber-500/50' : ''
                }`}
              >
                {option.recommended && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                    Aanbevolen
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400 mb-4">
                      {option.icon}
                    </div>
                    <div className="flex gap-2">
                      <CostBadge cost={option.cost} />
                      <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {option.timeline}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-white text-xl">{option.title}</CardTitle>
                  <CardDescription className="text-zinc-400">
                    {option.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                        <Check className="w-4 h-4" /> Voordelen
                      </h4>
                      <ul className="space-y-1">
                        {option.pros.map((pro, i) => (
                          <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                        <X className="w-4 h-4" /> Nadelen
                      </h4>
                      <ul className="space-y-1">
                        {option.cons.map((con, i) => (
                          <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                            <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-400" />
            Platform Vergelijking
          </h2>
          <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left p-4 text-zinc-400 font-medium">Feature</th>
                    <th className="text-left p-4 text-amber-400 font-medium">Nieuw Platform (Replit)</th>
                    <th className="text-left p-4 text-blue-400 font-medium">WordPress</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonPoints.map((point, i) => (
                    <tr key={i} className="border-b border-zinc-800/50">
                      <td className="p-4 text-white font-medium">{point.feature}</td>
                      <td className={`p-4 ${point.winner === 'replit' ? 'text-green-400' : 'text-zinc-300'}`}>
                        {point.winner === 'replit' && <Check className="w-4 h-4 inline mr-2" />}
                        {point.replit}
                      </td>
                      <td className={`p-4 ${point.winner === 'wordpress' ? 'text-green-400' : 'text-zinc-300'}`}>
                        {point.winner === 'wordpress' && <Check className="w-4 h-4 inline mr-2" />}
                        {point.wordpress}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Lightning className="w-6 h-6 text-amber-400" />
            Aanbeveling
          </h2>
          <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-amber-500/20">
                  <Lightning className="w-8 h-8 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">WordPress naar .com, Nieuwe webshop op .nl</h3>
                  <p className="text-zinc-300 mb-4">
                    Voor de beste SEO-resultaten en klantervaring adviseren wij de nieuwe webshop live te zetten op 
                    caraudiolimburg.nl (het hoofddomein). WordPress kan tijdelijk naar .com verplaatst worden als backup, 
                    of direct uitgefaseerd worden. Dit zorgt voor:
                  </p>
                  <ul className="text-zinc-300 mb-4 space-y-1">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Alle SEO-autoriteit blijft op het hoofddomein</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Klanten vinden direct de nieuwe, snelle webshop</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Duidelijke branding met één primair domein</li>
                  </ul>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Clock className="w-4 h-4" />
                      Doorlooptijd: 2-3 weken
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <CurrencyEur className="w-4 h-4" />
                      Investering: Gemiddeld
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Shield className="w-4 h-4" />
                      Risico: Laag tot gemiddeld
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <ArrowRight className="w-6 h-6 text-amber-400" />
            Volgende Stappen (bij gekozen optie)
          </h2>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-6">
              <ol className="space-y-4">
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">1</span>
                  <div>
                    <h4 className="font-semibold text-white">Keuze domein-strategie</h4>
                    <p className="text-zinc-400 text-sm">Bepalen welk domein (.nl / .com / subdomein) voor welk platform</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">2</span>
                  <div>
                    <h4 className="font-semibold text-white">Afbeeldingen migreren</h4>
                    <p className="text-zinc-400 text-sm">WordPress afbeeldingen downloaden en uploaden naar het nieuwe platform</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">3</span>
                  <div>
                    <h4 className="font-semibold text-white">301 Redirects instellen</h4>
                    <p className="text-zinc-400 text-sm">Oude URLs doorverwijzen naar nieuwe locaties (SEO behoud)</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">4</span>
                  <div>
                    <h4 className="font-semibold text-white">DNS-wijzigingen doorvoeren</h4>
                    <p className="text-zinc-400 text-sm">Domein(en) koppelen aan de juiste platforms</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">5</span>
                  <div>
                    <h4 className="font-semibold text-white">Testen en monitoren</h4>
                    <p className="text-zinc-400 text-sm">Controleren of alles werkt, verkeer monitoren, SEO-rankings checken</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">6</span>
                  <div>
                    <h4 className="font-semibold text-white">WordPress uitfaseren (optioneel)</h4>
                    <p className="text-zinc-400 text-sm">Na succesvolle overgang: oude hosting opzeggen of als archief behouden</p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center text-zinc-500 text-sm">
          <p>Dit document is bedoeld voor intern gebruik en klantbespreking.</p>
          <p>Laatste update: {new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
    </div>
  );
}
