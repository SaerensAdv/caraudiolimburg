# Product-specifieke Pagina Structuur

## 1. Behandelingspagina (TreatmentDetail)

### URL Structuur
- `/behandelingen/:categorySlug/:treatmentSlug`
- `/behandelingen/:categorySlug/:subcategorySlug/:treatmentSlug` (voor Injectables)

### Pagina Secties

#### Header
- Navigatie
- Taalwisselaar

#### Hero / Intro Sectie
- Behandelingsnaam (meertalig: NL, EN, AR, ES)
- Breadcrumbs (categorie > subcategorie > behandeling)
- Featured afbeelding
- Intro tekst (meertalig)
- CTA knop (afspraak maken)

#### Belangrijkste Punten (Key Takeaways)
- Lijst met belangrijkste voordelen
- Meertalig ondersteund

#### Wat is het?
- Gedetailleerde beschrijving van de behandeling
- Bijbehorende afbeelding
- Markdown ondersteuning

#### Hoe werkt het?
- Uitleg over de werking
- Bijbehorende afbeelding
- Markdown ondersteuning

#### Voordelen
- Lijst met behandelingsvoordelen
- Bijbehorende afbeelding

#### Verwachtingen
- **Voor de behandeling**
- **Tijdens de behandeling**
- **Na de behandeling**
- Bijbehorende afbeelding

#### Geschiktheid
- **Geschikt voor** (lijst)
- **Niet geschikt voor** (lijst)
- Bijbehorende afbeelding

#### Video Sectie (optioneel)
- Video URL (YouTube/Vimeo embed)
- Video titel (meertalig)
- Video beschrijving (meertalig)

#### Praktische Informatie
- Duur van de behandeling
- Prijs (met eventuele decemberkorting)
- Certificering badge (indien van toepassing)

#### FAQ Sectie
- Accordion met veelgestelde vragen
- Vraag-antwoord paren in JSON formaat
- Meertalig ondersteund

#### Gerelateerde Behandelingen
- Compacte behandelingskaarten
- Gebaseerd op dezelfde categorie

#### Gerelateerde Blogposts
- Relevante artikelen op basis van categorie

#### Footer
- Standaard website footer

### Data Model (TreatmentContentApi)

```typescript
{
  id: string;
  treatmentId: string;
  
  // Intro (per taal)
  introNl, introEn, introAr, introEs: string;
  
  // Wat is het? (per taal)
  whatIsNl, whatIsEn, whatIsAr, whatIsEs: string;
  
  // Hoe werkt het? (per taal)
  howWorksNl, howWorksEn, howWorksAr, howWorksEs: string;
  
  // Key Takeaways (per taal)
  keyTakeawaysNl, keyTakeawaysEn, keyTakeawaysAr, keyTakeawaysEs: string[];
  
  // Voordelen (per taal)
  benefitsNl, benefitsEn, benefitsAr, benefitsEs: string[];
  
  // Verwachtingen (per taal)
  expectationsBeforeNl, expectationsBeforeEn, expectationsBeforeAr, expectationsBeforeEs: string;
  expectationsDuringNl, expectationsDuringEn, expectationsDuringAr, expectationsDuringEs: string;
  expectationsAfterNl, expectationsAfterEn, expectationsAfterAr, expectationsAfterEs: string;
  
  // Geschiktheid (per taal)
  suitableForNl, suitableForEn, suitableForAr, suitableForEs: string[];
  notSuitableForNl, notSuitableForEn, notSuitableForAr, notSuitableForEs: string[];
  
  // FAQs (JSON string, per taal)
  faqsNl, faqsEn, faqsAr, faqsEs: string;
  
  // SEO
  metaDescriptionNl, metaDescriptionEn, metaDescriptionAr, metaDescriptionEs: string;
  focusKeyword: string;
  
  // Afbeeldingen per sectie
  featuredImage: string;
  introImage: string;
  whatIsImage: string;
  howWorksImage: string;
  benefitsImage: string;
  expectationsImage: string;
  suitabilityImage: string;
  
  // Video
  videoUrl: string;
  videoTitleNl, videoTitleEn, videoTitleAr, videoTitleEs: string;
  videoDescriptionNl, videoDescriptionEn, videoDescriptionAr, videoDescriptionEs: string;
  
  // Sectie zichtbaarheid toggles
  showIntroSection: boolean;
  showWhatIsSection: boolean;
  showHowWorksSection: boolean;
  showBenefitsSection: boolean;
  showExpectationsSection: boolean;
  showSuitabilitySection: boolean;
  showFaqsSection: boolean;
  showVideoSection: boolean;
}
```

---

## 2. Shop Productpagina (ShopProductDetail)

### URL Structuur
- `/shop/product/:slug`

### Pagina Secties

#### Header
- Navigatie
- Winkelwagen indicator

#### Product Hero
- Product afbeelding(en) met gallery
- Video ondersteuning
- Lightbox voor media

#### Product Informatie
- Productnaam (meertalig)
- Prijs
- Beschikbaarheid/voorraad status
- Merk badge

#### Product Beschrijving
Gestructureerde secties met iconen:
- **Ingrediënten** (Bevat)
- **Effecten** (Product effects)
- **Aanbevolen voor** (Recommended for)
- **Gebruiksaanwijzing** (How to use)

#### Winkelwagen Functionaliteit
- Hoeveelheid selector (+/-)
- Toevoegen aan winkelwagen knop
- Sticky cart op mobiel

#### Product Details (Accordion)
- Uitgebreide productinformatie
- Markdown ondersteuning

#### Trust Badges
- Gratis verzending info
- Veiligheidsgaranties
- Levertijd informatie

#### Gerelateerde Producten
- Productkaarten uit dezelfde categorie
- Maximaal 4 items

#### Footer
- Standaard website footer

### Data Model (Product)

```typescript
{
  id: number;
  slug: string;
  
  // Naam (per taal)
  nameNl, nameEn, nameAr, nameEs: string;
  
  // Beschrijving (per taal, markdown)
  descriptionNl, descriptionEn, descriptionAr, descriptionEs: string;
  
  // Prijs
  price: number;
  salePrice?: number;
  
  // Media
  imageUrl: string;
  galleryImages: string[];
  videoUrl?: string;
  
  // Categorisatie
  category: string;
  brand?: string;
  
  // Voorraad
  inStock: boolean;
  stockQuantity?: number;
  
  // SEO
  metaDescription?: string;
}
```

---

## 3. Gedeelde Componenten

| Component | Behandelingen | Shop |
|-----------|--------------|------|
| Header | ✓ | ✓ |
| Footer | ✓ | ✓ |
| Breadcrumbs | ✓ | ✓ |
| Accordion | ✓ (FAQ) | ✓ (Details) |
| Card | ✓ | ✓ |
| Badge | ✓ | ✓ |
| Button | ✓ | ✓ |
| ReactMarkdown | ✓ | ✓ |
| SEO hooks | ✓ | ✓ |

---

## 4. Meertaligheid

Beide pagina's ondersteunen 4 talen:
- **NL** - Nederlands (standaard)
- **EN** - Engels
- **AR** - Arabisch
- **ES** - Spaans

Velden worden dynamisch opgehaald met de `getLocalizedField()` helper functie.

---

## 5. SEO Implementatie

### Behandelingen
- Medical Procedure Schema (structured data)
- Breadcrumb Schema
- FAQ Schema
- Meta description per taal
- Focus keyword

### Shop
- Product Schema (structured data)
- Meta description
- Open Graph tags
