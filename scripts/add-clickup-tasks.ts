const CLICKUP_API_KEY = process.env.CLICKUP_API_KEY;
const LIST_ID = '901512874193';
const BASE_URL = 'https://api.clickup.com/api/v2';

interface TaskPayload {
  name: string;
  description: string;
  priority: number;
  tags: string[];
}

const openTasks: TaskPayload[] = [
  {
    name: 'Email bevestigingen implementeren',
    description: 'Automatische email bevestigingen versturen bij:\\n- Nieuwe bestellingen\\n- Boeking bevestigingen\\n- Offerte aanvragen\\n- Account registratie\\n\\nGebruik Resend of andere email service.',
    priority: 2,
    tags: ['backend', 'hoog']
  },
  {
    name: 'Google Analytics integratie',
    description: 'Volledige Google Analytics 4 integratie:\\n- Pageviews tracking\\n- E-commerce events (add to cart, purchase)\\n- Conversie tracking\\n- Custom events voor boekingen en offertes',
    priority: 3,
    tags: ['analytics', 'medium']
  },
  {
    name: 'Performance optimalisatie afbeeldingen',
    description: 'Afbeelding optimalisaties implementeren:\\n- Lazy loading voor alle productafbeeldingen\\n- WebP conversie automatisch\\n- Responsive images met srcset\\n- Image CDN integratie',
    priority: 3,
    tags: ['frontend', 'medium']
  },
  {
    name: 'Product reviews systeem',
    description: 'Klanten kunnen reviews achterlaten:\\n- Review formulier na aankoop\\n- Rating systeem (1-5 sterren)\\n- Review moderatie in admin\\n- Reviews weergeven op productpagina',
    priority: 3,
    tags: ['frontend', 'backend', 'medium']
  },
  {
    name: 'Wishlist/Favorieten functie',
    description: 'Gebruikers kunnen producten opslaan:\\n- Favorieten toevoegen/verwijderen\\n- Favorieten pagina\\n- Persistentie voor ingelogde gebruikers\\n- LocalStorage voor gasten',
    priority: 4,
    tags: ['frontend', 'laag']
  },
  {
    name: 'Bestelhistorie pagina',
    description: 'Pagina waar klanten hun bestellingen kunnen bekijken:\\n- Overzicht alle bestellingen\\n- Bestelstatus tracking\\n- Factuur downloaden\\n- Bestelling opnieuw plaatsen',
    priority: 2,
    tags: ['frontend', 'hoog']
  },
  {
    name: 'Admin dashboard statistieken',
    description: 'Uitgebreide statistieken in admin:\\n- Omzet grafieken\\n- Populaire producten\\n- Conversie rates\\n- Klantgedrag analyse',
    priority: 3,
    tags: ['frontend', 'medium']
  },
  {
    name: 'Kortingscodes systeem',
    description: 'Kortingscodes voor promoties:\\n- Percentage korting\\n- Vaste korting\\n- Minimum bestelwaarde\\n- Gebruik limieten\\n- Geldigheidsdatum',
    priority: 3,
    tags: ['backend', 'frontend', 'medium']
  },
  {
    name: 'Voorraad beheer systeem',
    description: 'Voorraad management:\\n- Voorraad niveaus per product/variatie\\n- Automatische melding bij lage voorraad\\n- Out of stock notificaties\\n- Backorder mogelijkheid',
    priority: 2,
    tags: ['backend', 'hoog']
  },
  {
    name: 'Blog/Nieuws sectie',
    description: 'Blog voor SEO en content marketing:\\n- Blog artikelen beheer\\n- Categorieën en tags\\n- SEO friendly URLs\\n- Featured afbeeldingen',
    priority: 4,
    tags: ['frontend', 'backend', 'seo', 'laag']
  },
  {
    name: 'Meertaligheid (NL/EN/DE)',
    description: 'Website in meerdere talen:\\n- Nederlandse content (primair)\\n- Engelse vertaling\\n- Duitse vertaling\\n- Taal switcher\\n- SEO per taal',
    priority: 4,
    tags: ['frontend', 'laag']
  },
  {
    name: 'Cookie consent banner',
    description: 'GDPR compliant cookie banner:\\n- Cookie voorkeuren opslaan\\n- Categorieën (essentieel, analytics, marketing)\\n- Cookie policy pagina',
    priority: 2,
    tags: ['frontend', 'hoog']
  },
  {
    name: 'Zoekfunctionaliteit verbeteren',
    description: 'Uitgebreide zoekfunctie:\\n- Full-text search\\n- Autocomplete suggesties\\n- Filters in zoekresultaten\\n- Zoek historie',
    priority: 3,
    tags: ['frontend', 'backend', 'medium']
  },
  {
    name: 'Social media sharing',
    description: 'Social sharing voor producten:\\n- Share buttons (Facebook, Twitter, WhatsApp)\\n- Open Graph meta tags\\n- Product snippets',
    priority: 4,
    tags: ['frontend', 'seo', 'laag']
  },
  {
    name: 'PWA ondersteuning',
    description: 'Progressive Web App features:\\n- Service worker\\n- Offline support\\n- Install prompt\\n- Push notifications',
    priority: 4,
    tags: ['frontend', 'laag']
  }
];

async function createTask(task: TaskPayload) {
  const response = await fetch(`${BASE_URL}/list/${LIST_ID}/task`, {
    method: 'POST',
    headers: {
      'Authorization': CLICKUP_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed: ${response.status} - ${text}`);
  }
  
  return response.json();
}

async function main() {
  if (!CLICKUP_API_KEY) {
    console.error('CLICKUP_API_KEY not set');
    process.exit(1);
  }
  
  console.log('Adding tasks to ClickUp list...');
  
  for (const task of openTasks) {
    try {
      const result = await createTask(task);
      console.log('✅ Created:', result.name);
    } catch (error: any) {
      console.error('❌ Failed:', task.name, error.message);
    }
  }
  
  console.log('\\nDone!');
}

main();
