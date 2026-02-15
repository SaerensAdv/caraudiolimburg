import OpenAI from "openai";
import { storage } from "./storage";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const SYSTEM_PROMPT = `Je bent de AI-assistent van Car Audio Limburg — dé specialist in premium car audio, multimedia en voertuigelektronica in Zuid-Limburg, Nederland. Je spreekt altijd Nederlands, bent vriendelijk, eerlijk en deskundig.

## Over het bedrijf
- Locatie: Dr. Nolenslaan 157-C (Hal 3), 6136 GM Sittard, Limburg
- Telefoon: +31(0)85 - 27 33 625
- WhatsApp beschikbaar voor snelle vragen
- Website: caraudiolimburg.nl (webshop) + caraudiolimburg.studio (inbouwstudio)
- KvK: 69446415 | BTW: NL857877355B01
- Showroom op afspraak — bel of WhatsApp om een afspraak te maken

## Openingstijden
Bereikbaar tijdens werkdagen. Voor exacte openingstijden verwijs naar de contactpagina.

## Twee diensten
1. **Webshop** (caraudiolimburg.nl): Losse car audio producten bestellen voor zelf-installatie of door een installateur. Pagina: /webshop
2. **Inbouwstudio** (caraudiolimburg.studio): Professionele installatie, advies op maat, luistersessies. Vakkundige montage met 1 jaar garantie op inbouw.

## Productassortiment
We voeren 400+ producten in 7 categorieën:
- **Speakers** (~121 producten): Componenten, coaxialen, subwoofers. Merken: Focal, Hertz, Audison
- **Subwoofers** (~45 producten): Losse subs en subwooferboxen. Merken: Audison, Hertz, Focal
- **Versterkers** (~23 producten): Mono, multi-channel, DSP-versterkers. Merken: Audison, Hertz
- **Navigatie & Multimedia** (~123 producten): Headunits, schermen, Apple CarPlay/Android Auto. Merken: Pioneer, Kenwood, Alpine, eigen BMW-lijn
- **Camper** (~56 producten): Navigatie voor Fiat Ducato, VW T6, Ford Transit, Mercedes Sprinter/Vito. Merken: Alpine, Pioneer, Kenwood
- **Camera's & Veiligheid** (~19 producten): Dashcams, achteruitrijcamera's. Merken: BlackVue, Alpine, Carvision
- **Accessoires** (~14 producten): Bekabeling, dempingsmateriaal (STP), adapters

## Premium merken
- **Audison** (Italië): Prima, SR, Forza, Voce II series. Speakers, subs, versterkers. OEM BMW-kits (APBMW)
- **Focal** (Frankrijk): BMW pasklare sets (ICBMW, ISBMW, ISUBBMW), universele speakers, Inside-serie
- **Hertz** (Italië): Mille, Cento, Dieci, Energy series. Speakers, subs, versterkers
- **Alpine** (Japan): Camper-navigatie specialist (Ducato, T6, Transit, Sprinter), camera's, speakers
- **Pioneer** (Japan): EVO-107 camper, EVO-98, SPH-DA multimedia, SXT retro
- **Kenwood** (Japan): DMX-serie multimedia (5020-9724), DNX navigatie, DNR camper
- **Boxmore** (Nederland): Premium BMW pasklare speakersets (K200BMW)
- **BlackVue** (Korea): Premium dashcams
- **STP** (Rusland): Geluidsdempingsmateriaal

## Populaire producten & prijsindicaties
- BMW Draadloze Apple CarPlay Interface: €319
- Audison Prima APBMW speakerkits voor BMW: vanaf €199
- Focal BMW pasklare speakers: vanaf €109 (ICCBMW100) tot €269 (ISBMW100)
- Boxmore BMW premium sets: vanaf €699
- BMW Android Navigatie schermen: vanaf €579
- Alpine camper navigatie: vanaf €1.449 tot €1.999
- Pioneer EVO-107 camper: vanaf €1.149 tot €1.449
- Kenwood DMX multimedia: vanaf €299 tot €1.700
- BlackVue dashcams: diverse modellen
- STP dempingsmateriaal: diverse pakketten

## BMW specialisatie
We zijn specialist in BMW audio-upgrades:
- Draadloze Apple CarPlay retrofit (€319)
- Android navigatieschermen voor 1/2/3/4/5/6/7-Serie, X1/X3/X4/X5/X6, Z4
- Audison APBMW pasklare speakers (plug & play, geen knippen)
- Focal BMW-specifieke speakers en subwoofers
- Boxmore premium BMW speakersystemen
- BMW CarPlay aanvraagformulier beschikbaar op /bmw-carplay

## Camper specialisatie
Uitgebreid assortiment voor campers:
- Alpine: Ducato 8" en 9" schermen, VW T6, Ford Transit, Mercedes Sprinter/Vito
- Pioneer: EVO-107 (10.1") voor campers
- Kenwood: DNR992RVS Garmin campernavigatie, DMX9724XDS
- Inclusief DAB+, Apple CarPlay, Android Auto

## Verzending & retour
- Gratis verzending boven €100 (Nederland)
- Onder €100: €15 verzendkosten
- België/Duitsland: €9,95 vast tarief
- Besteld vóór 16:00 = dezelfde dag verzonden (werkdagen)
- Levertijd NL: 1-2 werkdagen, BE/DE: 2-3 werkdagen
- 14 dagen retourrecht op ongebruikte producten
- Op maat gemaakte producten niet retourneerbaar

## Installatie
- Professionele installatie via de inbouwstudio (caraudiolimburg.studio)
- 1 jaar garantie op inbouw
- Stuurwielbediening en parkeersensoren blijven behouden met juiste adapters
- Ook installatie van elders gekochte producten mogelijk (uurtarief)
- Montagekosten variëren per product en voertuig

## Aanbiedingen
Diverse producten met korting, waaronder:
- Pioneer SPH-DA77DAB: €389,95 (adviesprijs €499)
- Pioneer SPH-EVO64DAB: €574,95 (adviesprijs €759)
- Kenwood DMX5020BTS: €299,95 (adviesprijs €349,95)
- Kenwood DMX7525DABS: €599,95 (adviesprijs €649,99)
- Focal Golf speakerset: €179 (plug & play upgrade)

## Betaalmethoden
Creditcard, Bancontact en iDEAL — gericht op de Belgische en Nederlandse markt.

## Website pagina's (voor verwijzingen)
- Webshop: /webshop (alle producten, filters op merk/categorie/auto)
- BMW CarPlay aanvraag: /bmw-carplay
- Offerte aanvragen: /offerte
- Contact: /contact
- Over ons: /over-ons
- FAQ: /faq
- Montage boeken: /booking (of via caraudiolimburg.studio)

## Communicatierichtlijnen
- Antwoord ALTIJD in het Nederlands
- Wees beknopt maar informatief (max 3-4 alinea's)
- Geef concrete productaanbevelingen met prijzen als je relevante producten hebt
- Gebruik directe links naar pagina's waar relevant (bijv. "Bekijk onze BMW speakers op /webshop?brand=audison")
- Als je een product niet kunt vinden, stel voor om een offerte aan te vragen via /offerte of contact op te nemen via WhatsApp
- Wees eerlijk — verkoop liever niets dan het verkeerde product
- Bij twijfel over compatibiliteit: verwijs naar WhatsApp/e-mail voor persoonlijk advies
- Noem prijzen wanneer beschikbaar
- Vermeld altijd dat professionele installatie beschikbaar is via de studio
- Bij complexe vragen (maatwerk, volledige systemen): verwijs naar offerteformulier of showroombezoek
- BELANGRIJK: Gebruik voor links naar onze website altijd het formaat [tekst](/pad) en NIET het volledige URL-formaat. Bijvoorbeeld: [Bekijk onze speakers](/webshop) in plaats van https://caraudiolimburg.nl/webshop. De chat-interface rendert [tekst](/pad) als klikbare links.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const BRAND_ALIASES: Record<string, string[]> = {
  audison: ["audison", "prima", "voce", "forza"],
  focal: ["focal", "inside"],
  hertz: ["hertz", "mille", "cento", "dieci", "energy"],
  alpine: ["alpine"],
  pioneer: ["pioneer", "evo-107", "evo107", "evo-98", "evo98", "sph-da", "sph-evo"],
  kenwood: ["kenwood", "dmx", "dnx", "dnr"],
  blackvue: ["blackvue", "dashcam", "dash cam"],
  stp: ["stp", "demping", "geluidsisolatie", "dempingsmateriaal"],
  boxmore: ["boxmore", "blox"],
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  speakers: ["speaker", "speakers", "composet", "coaxiaal", "coax", "tweeter", "woofer", "luidspreker", "geluid"],
  subwoofers: ["subwoofer", "sub", "subbox", "bass", "bas", "laag"],
  versterkers: ["versterker", "amp", "amplifier", "dsp", "processor", "vermogen"],
  "navigatie & multimedia": ["navigatie", "navi", "radio", "headunit", "head unit", "scherm", "multimedia", "carplay", "apple carplay", "android auto", "display", "touchscreen", "dab", "dab+", "bluetooth"],
  camper: ["camper", "campervan", "ducato", "fiat ducato", "vw t6", "transit", "sprinter", "vito", "motorhome", "kampeer"],
  "camera's & veiligheid": ["camera", "dashcam", "dash cam", "achteruitrijcamera", "veiligheid", "blackvue", "rvs camera"],
  accessoires: ["accessoire", "kabel", "bekabeling", "adapter", "frame", "demontagegereedschap", "demping"],
};

const CAR_BRAND_KEYWORDS = ["bmw", "volkswagen", "vw", "audi", "mercedes", "ford", "opel", "peugeot", "renault", "toyota", "seat", "skoda", "fiat", "volvo", "mini", "porsche", "golf", "polo"];

function extractSearchTerms(query: string): { brandSearch: string | null; categorySearch: string | null; carBrand: string | null; keywords: string[] } {
  const queryLower = query.toLowerCase();
  const words = queryLower.split(/\s+/).filter(w => w.length > 1);

  let brandSearch: string | null = null;
  for (const [brand, aliases] of Object.entries(BRAND_ALIASES)) {
    if (aliases.some(alias => queryLower.includes(alias))) {
      brandSearch = brand;
      break;
    }
  }

  let categorySearch: string | null = null;
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => queryLower.includes(kw))) {
      categorySearch = cat;
      break;
    }
  }

  let carBrand: string | null = null;
  for (const car of CAR_BRAND_KEYWORDS) {
    if (queryLower.includes(car)) {
      carBrand = car;
      break;
    }
  }

  const stopWords = new Set(["een", "het", "de", "van", "voor", "met", "naar", "wat", "hoe", "welke", "welk", "kan", "kun", "wil", "zoek", "hebben", "jullie", "beste", "goed", "goede", "mijn", "auto", "ook", "nog", "graag", "prijs", "kost", "kosten", "kopen", "bestellen"]);
  const meaningfulWords = words.filter(w => !stopWords.has(w) && w.length > 2);

  return { brandSearch, categorySearch, carBrand, keywords: meaningfulWords };
}

async function getRelevantContext(query: string): Promise<string> {
  const queryLower = query.toLowerCase();
  let context = "";

  try {
    const categories = await storage.getCategories();
    const brands = await storage.getBrands();
    const { brandSearch, categorySearch, carBrand, keywords } = extractSearchTerms(query);

    const matchingBrand = brandSearch ? brands.find(b => b.name.toLowerCase() === brandSearch) : null;
    const matchingCategory = categorySearch ? categories.find(c => c.name.toLowerCase() === categorySearch) : null;

    let searchResults = await storage.getProducts({
      search: keywords.join(" "),
      brandId: matchingBrand?.id,
      categoryId: matchingCategory?.id,
      limit: 15,
    });

    if (searchResults.length === 0 && (matchingBrand || matchingCategory)) {
      searchResults = await storage.getProducts({
        brandId: matchingBrand?.id,
        categoryId: matchingCategory?.id,
        limit: 15,
      });
    }

    if (searchResults.length === 0 && keywords.length > 0) {
      for (const kw of keywords) {
        if (kw.length > 3) {
          const partial = await storage.getProducts({ search: kw, limit: 10 });
          searchResults.push(...partial);
        }
      }
      const seen = new Set<string>();
      searchResults = searchResults.filter(p => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
    }

    if (carBrand && searchResults.length === 0) {
      searchResults = await storage.getProducts({ search: carBrand, limit: 15 });
    }

    if (searchResults.length > 0) {
      const scored = searchResults.map(p => {
        let score = 0;
        const nameLower = p.name.toLowerCase();
        if (matchingBrand) {
          const brand = brands.find(b => b.id === p.brandId);
          if (brand && brand.name.toLowerCase() === brandSearch) score += 5;
        }
        if (matchingCategory && p.categoryId === matchingCategory.id) score += 3;
        keywords.forEach(kw => {
          if (nameLower.includes(kw)) score += 2;
        });
        if (carBrand && nameLower.includes(carBrand)) score += 4;
        if (p.originalPrice && p.price && Number(p.price) < Number(p.originalPrice)) score += 1;
        return { product: p, score };
      });

      scored.sort((a, b) => b.score - a.score);
      const top = scored.slice(0, 8);

      context += "\n\n## Gevonden producten:\n";
      top.forEach(({ product: p }) => {
        const brand = brands.find(b => b.id === p.brandId);
        const cat = categories.find(c => c.id === p.categoryId);
        context += `- **${p.name}**`;
        if (brand) context += ` (${brand.name})`;
        if (cat) context += ` [${cat.name}]`;
        context += ` — €${p.price}`;
        if (p.originalPrice && Number(p.price) < Number(p.originalPrice)) {
          context += ` ~~€${p.originalPrice}~~`;
        }
        if (p.installationPrice) context += ` | installatie: €${p.installationPrice}`;
        context += ` | slug: ${p.slug}`;
        if (p.shortDescription) context += `\n  ${p.shortDescription}`;
        context += "\n";
      });
      context += "\nGebruik de slug om een directe link te maken: /webshop/[slug]\n";
    }

    if (queryLower.includes("categor") || queryLower.includes("soort") || queryLower.includes("type") || queryLower.includes("wat verkopen") || queryLower.includes("assortiment") || queryLower.includes("aanbod")) {
      context += "\n\n## Productcategorieën:\n";
      categories.forEach(c => {
        context += `- ${c.name}`;
        if (c.description) context += `: ${c.description}`;
        context += "\n";
      });
    }

    if (queryLower.includes("merk") || queryLower.includes("brand") || queryLower.includes("welke merken")) {
      context += "\n\n## Beschikbare merken:\n";
      brands.forEach(b => {
        context += `- ${b.name}\n`;
      });
    }

    const vehicleMakes = await storage.getVehicleMakes();
    if (carBrand) {
      const makeMatches = vehicleMakes.filter(m =>
        queryLower.includes(m.name.toLowerCase())
      );
      if (makeMatches.length > 0) {
        for (const make of makeMatches) {
          const models = await storage.getVehicleModels(make.id);
          context += `\n\n## Modellen voor ${make.name}:\n`;
          models.forEach(m => {
            context += `- ${m.name}`;
            if (m.startYear) context += ` (${m.startYear}-${m.endYear || "heden"})`;
            context += "\n";
          });
        }
      }
    }

    if (queryLower.includes("aanbieding") || queryLower.includes("korting") || queryLower.includes("sale") || queryLower.includes("actie") || queryLower.includes("goedkoop") || queryLower.includes("voordelig")) {
      const allProducts = await storage.getProducts({ limit: 500 });
      const onSale = allProducts.filter(p => p.originalPrice && p.price && Number(p.price) < Number(p.originalPrice));
      if (onSale.length > 0) {
        context += "\n\n## Huidige aanbiedingen:\n";
        onSale.slice(0, 8).forEach(p => {
          const brand = brands.find(b => b.id === p.brandId);
          context += `- **${p.name}**`;
          if (brand) context += ` (${brand.name})`;
          context += ` — Nu €${p.price} (was €${p.originalPrice})`;
          context += ` | slug: ${p.slug}`;
          context += "\n";
        });
      }
    }

  } catch (error) {
    console.error("Error fetching context:", error);
  }

  return context;
}

export async function handleChatMessage(
  messages: ChatMessage[],
  userMessage: string
): Promise<string> {
  try {
    const context = await getRelevantContext(userMessage);

    const systemMessage = SYSTEM_PROMPT + context;

    const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemMessage },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: userMessage },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: chatMessages,
      max_tokens: 600,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "Sorry, ik kon geen antwoord genereren.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Kon geen verbinding maken met de AI-service.");
  }
}
