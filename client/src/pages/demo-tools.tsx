import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  MessageSquare, 
  Star, 
  Mail, 
  MousePointer2, 
  MessageCircle,
  CreditCard,
  Box,
  Volume2,
  Car,
  BarChart3,
  ArrowLeft,
  Check,
  Sparkles,
  ExternalLink,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiTrustpilot, SiGoogle, SiWhatsapp, SiKlarna } from "react-icons/si";

interface Tool {
  id: number;
  name: string;
  description: string;
  category: "conversie" | "content" | "analytics";
  icon: JSX.Element;
  brandIcon?: JSX.Element;
  benefits: string[];
  status: "beschikbaar" | "geïntegreerd" | "binnenkort";
  conversionImpact: "hoog" | "medium" | "laag";
}

const tools: Tool[] = [
  {
    id: 1,
    name: "AI Chatbot Assistent",
    description: "Intelligente chatbot die 24/7 vragen beantwoordt over producten, installaties en services. Gebaseerd op je productcatalogus.",
    category: "conversie",
    icon: <MessageSquare className="w-6 h-6" />,
    benefits: [
      "24/7 klantenservice",
      "Automatische productaanbevelingen",
      "Verlaagt drempel voor contact",
      "Leert van je productdata"
    ],
    status: "geïntegreerd",
    conversionImpact: "hoog"
  },
  {
    id: 2,
    name: "Trustpilot Reviews",
    description: "Toon echte klantbeoordelingen en bouw vertrouwen op met social proof. Automatische review-uitnodigingen na aankoop.",
    category: "conversie",
    icon: <Star className="w-6 h-6" />,
    brandIcon: <SiTrustpilot className="w-5 h-5 text-[#00b67a]" />,
    benefits: [
      "Verhoogt vertrouwen",
      "Automatische review-verzoeken",
      "Widget voor productpagina's",
      "SEO voordelen"
    ],
    status: "beschikbaar",
    conversionImpact: "hoog"
  },
  {
    id: 3,
    name: "E-mail Marketing Automatisering",
    description: "Geautomatiseerde e-mailcampagnes voor verlaten winkelwagens, nieuwe producten en gepersonaliseerde aanbiedingen.",
    category: "conversie",
    icon: <Mail className="w-6 h-6" />,
    benefits: [
      "Verlaten winkelwagen herstel",
      "Welkomstreeks voor nieuwe klanten",
      "Product launch campagnes",
      "Gepersonaliseerde aanbiedingen"
    ],
    status: "beschikbaar",
    conversionImpact: "hoog"
  },
  {
    id: 4,
    name: "Heatmap & Gebruikersanalyse",
    description: "Begrijp hoe bezoekers je website gebruiken met visuele heatmaps, sessie-opnames en conversie-funnels.",
    category: "analytics",
    icon: <MousePointer2 className="w-6 h-6" />,
    benefits: [
      "Visuele heatmaps",
      "Sessie-opnames",
      "Conversie-funnel analyse",
      "Identificeer knelpunten"
    ],
    status: "beschikbaar",
    conversionImpact: "medium"
  },
  {
    id: 5,
    name: "Google Reviews Widget",
    description: "Toon je Google beoordelingen direct op de website. Bouw vertrouwen met lokale reviews van tevreden klanten.",
    category: "conversie",
    icon: <Star className="w-6 h-6" />,
    brandIcon: <SiGoogle className="w-5 h-5" />,
    benefits: [
      "Lokale SEO boost",
      "Vertrouwen door echte reviews",
      "Automatische synchronisatie",
      "Sterren in zoekresultaten"
    ],
    status: "beschikbaar",
    conversionImpact: "hoog"
  },
  {
    id: 6,
    name: "WhatsApp Business Chat",
    description: "Direct contact via WhatsApp voor snelle vragen, offertes en klantenservice. De voorkeurskanaal van veel klanten.",
    category: "conversie",
    icon: <MessageCircle className="w-6 h-6" />,
    brandIcon: <SiWhatsapp className="w-5 h-5 text-[#25D366]" />,
    benefits: [
      "Directe communicatie",
      "Foto's delen voor offertes",
      "Hoge open-rate berichten",
      "Persoonlijke touch"
    ],
    status: "beschikbaar",
    conversionImpact: "hoog"
  },
  {
    id: 7,
    name: "Klarna / Achteraf Betalen",
    description: "Bied flexibele betalingsopties aan zoals betalen in termijnen of achteraf betalen. Verhoogt gemiddelde orderwaarde.",
    category: "conversie",
    icon: <CreditCard className="w-6 h-6" />,
    brandIcon: <SiKlarna className="w-5 h-5 text-[#FFB3C7]" />,
    benefits: [
      "Hogere conversie",
      "Grotere orderwaarde",
      "Geen risico voor jou",
      "Populair bij consumenten"
    ],
    status: "beschikbaar",
    conversionImpact: "hoog"
  },
  {
    id: 8,
    name: "3D Product Viewer",
    description: "Interactieve 3D weergave van speakers, versterkers en autoradio's. Klanten kunnen producten van alle kanten bekijken.",
    category: "content",
    icon: <Box className="w-6 h-6" />,
    benefits: [
      "Immersieve productervaring",
      "Minder retourzendingen",
      "Verhoogde betrokkenheid",
      "Premium uitstraling"
    ],
    status: "binnenkort",
    conversionImpact: "medium"
  },
  {
    id: 9,
    name: "Audio Demo Player",
    description: "Laat klanten horen hoe verschillende speakers en subwoofers klinken met interactieve audio samples en vergelijkingen.",
    category: "content",
    icon: <Volume2 className="w-6 h-6" />,
    benefits: [
      "Uniek voor car audio",
      "Helpt bij productkeuze",
      "Toont expertise",
      "Onderscheidend vermogen"
    ],
    status: "binnenkort",
    conversionImpact: "medium"
  },
  {
    id: 10,
    name: "Geavanceerde Voertuig Fitment",
    description: "Uitgebreide voertuig compatibiliteit checker met installatie-instructies, benodigde accessoires en tijdsinschatting.",
    category: "content",
    icon: <Car className="w-6 h-6" />,
    benefits: [
      "Voorkomt foutaankopen",
      "Cross-sell accessoires",
      "Installatie-informatie",
      "Bouwt vertrouwen"
    ],
    status: "beschikbaar",
    conversionImpact: "hoog"
  }
];

const categoryColors = {
  conversie: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30",
  content: "from-blue-500/20 to-blue-600/5 border-blue-500/30",
  analytics: "from-purple-500/20 to-purple-600/5 border-purple-500/30"
};

const categoryLabels = {
  conversie: "Conversie",
  content: "Content",
  analytics: "Analytics"
};

const statusColors = {
  beschikbaar: "bg-[#d0a760] text-[#0a0a0a]",
  geïntegreerd: "bg-emerald-500 text-white",
  binnenkort: "bg-zinc-700 text-zinc-300"
};

const impactColors = {
  hoog: "text-emerald-400",
  medium: "text-[#d0a760]",
  laag: "text-zinc-500"
};

export default function DemoTools() {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "conversie" | "content" | "analytics">("all");
  
  const filteredTools = selectedCategory === "all" 
    ? tools 
    : tools.filter(t => t.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#d0a760]/10 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#d0a760]/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 py-12 relative">
          <Link href="/">
            <Button variant="ghost" className="mb-8 text-zinc-400 hover:text-white" data-testid="back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar home
            </Button>
          </Link>

          <div className="max-w-3xl mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#d0a760] to-[#a88540] rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-[#0a0a0a]" />
              </div>
              <Badge className="bg-[#d0a760]/20 text-[#d0a760] border-[#d0a760]/30">
                10 Integraties
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Demo Tools & Integraties
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed">
              Ontdek krachtige tools om je conversie te verhogen, je content te verrijken en diepere inzichten te krijgen in je klanten.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { key: "all", label: "Alles", count: tools.length },
              { key: "conversie", label: "Conversie", count: tools.filter(t => t.category === "conversie").length },
              { key: "content", label: "Content", count: tools.filter(t => t.category === "content").length },
              { key: "analytics", label: "Analytics", count: tools.filter(t => t.category === "analytics").length },
            ].map((cat) => (
              <Button
                key={cat.key}
                variant={selectedCategory === cat.key ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat.key as typeof selectedCategory)}
                className={selectedCategory === cat.key 
                  ? "bg-[#d0a760] hover:bg-[#b8934d] text-[#0a0a0a]" 
                  : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600"
                }
                data-testid={`filter-${cat.key}`}
              >
                {cat.label}
                <span className="ml-2 text-xs opacity-70">({cat.count})</span>
              </Button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {filteredTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`group relative bg-gradient-to-br ${categoryColors[tool.category]} border rounded-2xl p-6 hover:border-[#d0a760]/50 transition-all duration-300`}
                data-testid={`tool-card-${tool.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-zinc-800/80 rounded-xl flex items-center justify-center text-[#d0a760] group-hover:bg-[#d0a760]/20 transition-colors">
                      {tool.icon}
                    </div>
                    {tool.brandIcon && (
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                        {tool.brandIcon}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[tool.status]}>
                      {tool.status === "geïntegreerd" && <Check className="w-3 h-3 mr-1" />}
                      {tool.status === "binnenkort" && <Sparkles className="w-3 h-3 mr-1" />}
                      {tool.status.charAt(0).toUpperCase() + tool.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-[#d0a760] transition-colors">
                  {tool.name}
                </h3>
                <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
                  {tool.description}
                </p>

                <div className="space-y-2 mb-4">
                  {tool.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-[#d0a760] flex-shrink-0" />
                      {benefit}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                  <div className="flex items-center gap-2">
                    <BarChart3 className={`w-4 h-4 ${impactColors[tool.conversionImpact]}`} />
                    <span className={`text-sm ${impactColors[tool.conversionImpact]}`}>
                      {tool.conversionImpact === "hoog" ? "Hoge" : tool.conversionImpact === "medium" ? "Gemiddelde" : "Lage"} impact
                    </span>
                  </div>
                  <Badge variant="outline" className="border-zinc-700 text-zinc-500">
                    {categoryLabels[tool.category]}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 bg-gradient-to-r from-[#d0a760]/20 via-[#d0a760]/10 to-transparent border border-[#d0a760]/30 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#d0a760] to-[#a88540] rounded-2xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-8 h-8 text-[#0a0a0a]" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Interesse in een integratie?
                </h2>
                <p className="text-zinc-400">
                  Neem contact met ons op om te bespreken welke tools het beste passen bij jouw bedrijf en doelen.
                </p>
              </div>
              <Link href="/contact">
                <Button className="bg-[#d0a760] hover:bg-[#b8934d] text-[#0a0a0a] px-8" data-testid="contact-cta">
                  Neem contact op
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
