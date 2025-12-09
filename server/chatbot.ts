import OpenAI from "openai";
import { storage } from "./storage";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const SYSTEM_PROMPT = `Je bent de vriendelijke AI-assistent van Car Audio Limburg, een specialist in car audio en multimedia systemen. Je helpt klanten met:

- Productadvies en aanbevelingen
- Informatie over installatiemogelijkheden en prijzen
- Compatibiliteit van producten met specifieke voertuigen
- Algemene vragen over car audio

Richtlijnen:
- Wees behulpzaam, professioneel maar vriendelijk
- Geef concrete productaanbevelingen als je relevante producten hebt gevonden
- Als je geen specifiek product kunt vinden, stel dan voor om contact op te nemen via de offerte-pagina
- Antwoord altijd in het Nederlands
- Houd antwoorden beknopt maar informatief
- Als een klant wil bestellen of boeken, verwijs naar de relevante pagina's op de website

Je hebt toegang tot de actuele productcatalogus en kunt specifieke producten aanbevelen.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

async function getRelevantContext(query: string): Promise<string> {
  const queryLower = query.toLowerCase();
  let context = "";

  try {
    const products = await storage.getProducts({ limit: 50 });
    const categories = await storage.getCategories();
    const brands = await storage.getBrands();
    const vehicleMakes = await storage.getVehicleMakes();

    const relevantProducts = products.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(queryLower);
      const descMatch = p.description?.toLowerCase().includes(queryLower);
      const keywords = queryLower.split(" ");
      const keywordMatch = keywords.some(
        (kw) =>
          kw.length > 2 &&
          (p.name.toLowerCase().includes(kw) ||
            p.description?.toLowerCase().includes(kw))
      );
      return nameMatch || descMatch || keywordMatch;
    });

    if (relevantProducts.length > 0) {
      context += "\n\nRelevante producten:\n";
      relevantProducts.slice(0, 5).forEach((p) => {
        const category = categories.find((c) => c.id === p.categoryId);
        const brand = brands.find((b) => b.id === p.brandId);
        context += `- ${p.name}`;
        if (brand) context += ` (${brand.name})`;
        context += ` - €${p.price}`;
        if (p.installationPrice) context += ` (installatie: €${p.installationPrice})`;
        if (p.shortDescription) context += ` - ${p.shortDescription}`;
        context += `\n`;
      });
    }

    if (
      queryLower.includes("categor") ||
      queryLower.includes("soort") ||
      queryLower.includes("type")
    ) {
      context += "\n\nProductcategorieën:\n";
      categories.forEach((c) => {
        context += `- ${c.name}`;
        if (c.description) context += `: ${c.description}`;
        context += "\n";
      });
    }

    if (queryLower.includes("merk") || queryLower.includes("brand")) {
      context += "\n\nBeschikbare merken:\n";
      brands.forEach((b) => {
        context += `- ${b.name}\n`;
      });
    }

    if (
      queryLower.includes("auto") ||
      queryLower.includes("voertuig") ||
      queryLower.includes("wagen")
    ) {
      const makeMatches = vehicleMakes.filter((m) =>
        queryLower.includes(m.name.toLowerCase())
      );
      if (makeMatches.length > 0) {
        for (const make of makeMatches) {
          const models = await storage.getVehicleModels(make.id);
          context += `\n\nModellen voor ${make.name}:\n`;
          models.forEach((m) => {
            context += `- ${m.name}`;
            if (m.startYear) context += ` (${m.startYear}-${m.endYear || "heden"})`;
            context += "\n";
          });
        }
      }
    }

    if (
      queryLower.includes("installatie") ||
      queryLower.includes("inbouw") ||
      queryLower.includes("montage")
    ) {
      context += `\n\nInstallatiediensten:
- Professionele inbouw door ervaren monteurs
- Boek een afspraak via de Studio/Booking pagina
- Installatiekosten variëren per product en voertuig
- Vraag een offerte aan voor maatwerk installaties`;
    }

    if (
      queryLower.includes("contact") ||
      queryLower.includes("bereik") ||
      queryLower.includes("openingstijd")
    ) {
      context += `\n\nContact informatie:
- Bezoek de Contact pagina voor contactgegevens
- Vraag een offerte aan via de website
- Boek een afspraak in de Studio`;
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
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "Sorry, ik kon geen antwoord genereren.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Kon geen verbinding maken met de AI-service.");
  }
}
