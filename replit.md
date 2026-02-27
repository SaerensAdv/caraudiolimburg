# Car Audio Limburg E-commerce & Installation Service

## Overview

This project is a full-stack e-commerce application for Car Audio Limburg, designed to integrate online sales of car audio equipment with professional installation service bookings. It functions as a product catalog, service booking platform, and customer acquisition tool. The application aims to attract customers seeking premium car audio solutions and professional installation, offering products from brands like Alpine and Audison, alongside OEM upgrades. Key capabilities include product sales, calendar-based service scheduling, custom quote requests, and comprehensive administrative features for managing orders, inventory, bookings, and leads. The overarching vision is to provide a seamless customer experience from product selection to professional installation, enhancing market presence and operational efficiency.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, utilizing Vite for fast development.
- **UI/UX**: Tailwind CSS for utility-first styling combined with shadcn/ui for consistent and accessible components.
- **State Management**: TanStack Query manages server-side data, while React Hook Form handles form states.
- **Routing**: Wouter provides a lightweight client-side routing solution.
- **Authentication**: Session-based authentication integrated with Replit's OAuth system.

### Backend Architecture
- **Runtime**: Node.js with Express.js as the server framework.
- **Database ORM**: Drizzle ORM is used for type-safe interaction with PostgreSQL.
- **API Design**: Adheres to a RESTful API standard, implemented with Express route handlers and validated using Zod schemas.
- **Session Management**: Express sessions are used, with session data stored persistently in PostgreSQL.
- **File Structure**: A monorepo organization separates client, server, and shared codebases.

### Database Design
- **Technology**: PostgreSQL, accessed via Drizzle ORM for robust and type-safe data operations.
- **Schema**: Includes comprehensive tables for users, products, categories, brands, vehicle compatibility, orders, bookings, quotes, and cart management.
- **Relationships**: Features well-defined relational integrity across entities, such as products-categories and order items.

### Authentication & Authorization
- **Provider**: Leverages Replit OAuth through a Passport.js strategy.
- **Session Storage**: Sessions are database-backed for persistence and reliability.
- **User Roles**: Implements role-based access control, supporting customer, staff, and admin roles.
- **Security**: Utilizes HTTP-only cookies and secure session management practices.

### Payment Processing
- **Provider**: Integrates with Stripe for secure payment processing.
- **Supported Methods**: Designed to accept credit cards, Bancontact, and iDEAL, targeting Belgian and Dutch markets.
- **Webhooks**: Handles Stripe webhooks for real-time payment confirmation and order status updates.

### File Storage (Product Images)
- **SDK**: `@replit/object-storage` is used to persist product images in Replit's Object Storage (bucket: `replit-objstore-4f8266cc-3e05-45e9-ab4a-5b04528ce9fb`)
- **Upload flow**: Images are resized (max 1000x1000), converted to WebP via `sharp`, saved to local filesystem (`public/products/`) AND uploaded to Object Storage via `saveProductImage()` helper in `server/routes.ts`
- **Serving**: Express serves `/products/*` from local filesystem first (fast), then falls back to downloading from Object Storage if the file is not found locally (handles production server restarts)
- **URL format**: All product images use the `/products/filename.webp` URL pattern

### Key Features
- **E-commerce**: Comprehensive product catalog with categorization, branding, vehicle compatibility filtering, and a shopping cart system.
- **Booking System**: An integrated calendar-based system for scheduling installation appointments.
- **Quote System**: Facilitates lead generation through customizable quote request forms.
- **Vehicle Compatibility**: Enables dynamic product filtering based on vehicle make, model, and year.
- **Admin Dashboard**: A CRM-like interface for managing products, orders, bookings, and customer interactions.

## Merk-Onboarding Playbook (Product Data Pipeline)

Dit is de volledige werkwijze voor het toevoegen van een nieuw merk aan de webshop. Alle stappen zijn herbruikbaar als template.

### Overzicht Stappen

0. **Merk & categorie aanmaken** - Brand en category records in database
1. **Productdata verzamelen** - SKU's, namen, prijzen uit WordPress CSV of handmatig
2. **Afbeeldingen scrapen** - Van fabrikant-website downloaden naar `/public/products/[merk]/`
3. **Specificaties vullen** - JSONB specs per product in database
4. **PDF Tech Sheets downloaden** - Van fabrikant naar `/public/downloads/`
5. **SEO beschrijvingen schrijven** - Korte + lange beschrijvingen in het Nederlands
6. **Kwaliteitscontrole** - Alle velden checken met controle-query

### Stap 0: Merk & Categorie Aanmaken

Voordat producten worden toegevoegd, moet het merk en de categorieën bestaan in de database.

Merk aanmaken:
```sql
INSERT INTO brands (id, name, slug, logo_url, description)
VALUES (gen_random_uuid(), 'Audison', 'audison', '/brands/audison-logo.png', 'Italiaanse fabrikant van premium car audio');
```

Categorie koppelen (noteer de id's voor gebruik bij producten):
```sql
SELECT id, name FROM brands WHERE slug = '[merk-slug]';
SELECT id, name FROM categories;
```

### Stap 1: Database Productstructuur

Elk product heeft deze velden (zie `shared/schema.ts`):

| Veld | Type | Beschrijving |
|------|------|-------------|
| `name` | varchar | Productnaam zoals weergegeven |
| `slug` | varchar | URL-friendly naam (auto-generated) |
| `sku` | varchar | Artikelnummer van fabrikant |
| `price` | numeric | Verkoopprijs in EUR |
| `original_price` | numeric | Adviesprijs (voor korting) |
| `installation_price` | numeric | Installatiekosten |
| `description` | text | Lange SEO beschrijving (Nederlands) |
| `short_description` | varchar | Meta description, max 155 tekens |
| `images` | text[] | PostgreSQL array van afbeelding-URLs |
| `specifications` | jsonb | Technische specs als key-value pairs |
| `downloads` | jsonb | Array van `{name, url}` objecten |
| `features` | text[] | Lijst van product-features |
| `brand_id` | varchar | FK naar brands tabel |
| `category_id` | varchar | FK naar categories tabel |
| `stock` | integer | Voorraadaantal |
| `is_active` | boolean | Zichtbaar in webshop |

### Stap 2: Afbeeldingen Scrapen

Script template: `scripts/scrape-[merk].ts`

Werkwijze: Maak URL-mapping (SKU naar fabrikant URL), scrape pagina met cheerio, download afbeeldingen naar `/public/products/[merk]/`, update database images array.

Bestandsnaam conventie: `/public/products/[merk]/[sku-kebab-case].jpg` (meerdere: `-2.jpg`, `-3.jpg`)

SQL: `UPDATE products SET images = ARRAY['/products/audison/apk-165-1.jpg'] WHERE sku = 'APK 165';`

### Stap 3: Specificaties (JSONB)

Flat JSONB object met key-value pairs. Structuur verschilt per producttype:

Speakers: serie, productType, impedance, peakPower, continuousPower, sensitivity, frequencyResponse, wooferSize, tweeterSize, coneMaterial, coneDiameter, voiceCoilDiameter, magnetSize, crossoverType

Versterkers: serie, productType, channels, peakPower, rmsPower4Ohm, rmsPower2Ohm, rmsPowerBridged, signalToNoise, frequencyResponse, crossoverType, dimensions, weight

DSP Versterkers: serie, productType, ampChannels, dspChannels, rmsPower, sampleRate, bitDepth, inputs, outputs

SQL: `UPDATE products SET specifications = '{"serie":"Prima","peakPower":"300 W"}'::jsonb WHERE sku = 'APK 165';`

### Stap 4: PDF Tech Sheets

Script template: `scripts/download-[merk]-pdfs-v2.ts`

Bestandsnaam conventie: `/public/downloads/[merk]-[serie]-[model]-tech-sheet.pdf`

SQL downloads update: `UPDATE products SET downloads = '[{"name":"Technical Datasheet","url":"/downloads/audison-prima-apk-165-tech-sheet.pdf"}]'::jsonb WHERE sku = 'APK 165';`

Meerdere downloads: `'[{"name":"Technical Datasheet","url":"..."},{"name":"Owner Manual","url":"..."}]'::jsonb`

### Stap 5: SEO Beschrijvingen

**Short description** (max 155 tekens): `[Merk] [Model] - [Type], [Vermogen], [Kernfeature]. [USP]. Made in [Land].`

**Lange description** met gestructureerde opmaak. De `FormattedDescription` component (`client/src/pages/product.tsx`) parsed automatisch:
- Dubbele newlines = nieuwe paragraaf
- Regels met bullet prefix (bullet, -, *) = 2-koloms grid met gouden checkmarks
- Korte regels eindigend op `:` = sectie-header

Template structuur:
```
[Merk Model] - [wat het is, 1-2 zinnen]

[Kernvoordelen, 2-3 zinnen over technologie]

Belangrijkste kenmerken:
- Piekvermogen: [X]W / Continu: [Y]W
- [Afmeting] woofer/driver
- Frequentiebereik: [range]
- Impedantie: [X] Ohm
- [Unieke features]
- Made in [Land]
```

Consistentie-regels per serie:
- Prima: "OEM integratie", "Klippel-geoptimaliseerd", "Plug & Play"
- SR: "High Power in Compact Size", "Class D", "ingebouwde crossover"
- Forza: "Bit Powered Solutions", "Hi-Res 24bit/96kHz"
- Voce II: "Give Sound Its True Voice", "Hi-Res Audio gecertificeerd"

### Stap 6: Kwaliteitscontrole Query

```sql
SELECT sku, name,
  CASE WHEN LENGTH(description) > 100 THEN 'OK' ELSE 'MISSING' END as beschrijving,
  CASE WHEN LENGTH(short_description) > 50 THEN 'OK' ELSE 'MISSING' END as seo_short,
  CASE WHEN array_length(images, 1) > 0 THEN 'OK' ELSE 'MISSING' END as afbeeldingen,
  CASE WHEN specifications::text != '{}' THEN 'OK' ELSE 'MISSING' END as specs,
  CASE WHEN downloads::text != '[]' THEN 'OK' ELSE 'MISSING' END as downloads,
  CASE WHEN price::numeric > 0 THEN 'OK' ELSE 'MISSING' END as prijs
FROM products WHERE LOWER(name) LIKE '%[merk]%' ORDER BY sku;
```

### Voorbeeld: Audison Status (44 producten compleet)

| Serie | Aantal | Beschrijving | SEO | Afbeeldingen | Specs | PDFs | Prijzen |
|-------|--------|-------------|-----|-------------|-------|------|---------|
| Prima APK (composets) | 7 | OK | OK | OK | OK | 6/7 | OK |
| Prima APX (coaxialen) | 4 | OK | OK | OK | OK | 4/4 | OK |
| Prima APS (subwoofers) | 4 | OK | OK | OK | OK | 4/4 | OK |
| Prima APBX (subboxen) | 6 | OK | OK | OK | OK | 4/6 | OK |
| Prima APBMW (BMW kits) | 5 | OK | OK | OK | OK | 0/5 | OK |
| SR (versterkers) | 4 | OK | OK | OK | OK | 4/4 | OK |
| Forza (DSP versterkers) | 7 | OK | OK | OK | OK | 0/7 | OK |
| Voce II (Hi-Res) | 7 | OK | OK | OK | OK | 0/7 | OK |

22/44 hebben PDF tech sheets. Overige niet gepubliceerd door Audison.

### Pioneer Status (36 producten compleet)

| Serie | Aantal | Beschrijving | SEO | Afbeeldingen | Specs | Prijzen |
|-------|--------|-------------|-----|-------------|-------|---------|
| EVO-107 (10.1" camper) | 11 | OK | OK | OK | OK | OK |
| EVO-98 (9" multimedia) | 8 | OK | OK | OK | OK | OK |
| EVO64 (6.8" modulair) | 4 | OK | OK | OK | OK | OK |
| EVO950/EVO82/EVO93 | 3 | OK | OK | OK | OK | OK |
| SPH-DA (multimedia) | 2 | OK | OK | OK | OK | OK |
| AVH/AVIC (navigatie) | 6 | OK | OK | OK | OK | OK |
| SXT (retro radio) | 1 | OK | OK | OK | OK | OK |
| Camera (PIO8023) | 1 | OK | OK | OK | OK | OK |

Aanbiedingen: SPH-DA77DAB (€389.95 v/a €499), SPH-EVO64DAB (€574.95 v/a €759), AVH-Z9200DAB (€719.95 v/a €859)

### Alpine Status (48 producten compleet)

| Serie | Aantal | Beschrijving | SEO | Afbeeldingen | Specs | Prijzen |
|-------|--------|-------------|-----|-------------|-------|---------|
| Camper Ducato 8 (DU8/DU8S) | 7 | OK | OK | OK | OK | OK |
| Camper Ducato/Boxer (DU/DU2) | 6 | OK | OK | OK | OK | OK |
| Camper VW T6/T6.1 | 4 | OK | OK | OK | OK | OK |
| Camper Ford Transit (TRA) | 3 | OK | OK | OK | OK | OK |
| Camper Mercedes Sprinter (S907) | 3 | OK | OK | OK | OK | OK |
| Camper Mercedes Vito (V447) | 1 | OK | OK | OK | OK | OK |
| Camera's & Veiligheid | 6 | OK | OK | OK | OK | OK |
| Speakers (SPC) | 5 | OK | OK | OK | OK | OK |
| Subwoofers (SWC) | 2 | OK | OK | OK | OK | OK |
| Versterkers (SWA/SPC-200AU) | 2 | OK | OK | OK | OK | OK |
| Navigatie & Multimedia | 9 | OK | OK | OK | OK | OK |

### Kenwood Status (26 producten compleet)

| Serie | Aantal | Beschrijving | SEO | Afbeeldingen | Specs | Prijzen |
|-------|--------|-------------|-----|-------------|-------|---------|
| DMX129 (basis 6.8") | 2 | OK | OK | OK | OK | OK |
| DMX5020/5023 (multimedia) | 4 | OK | OK | OK | OK | OK |
| DMX553/6523 (mid-range) | 3 | OK | OK | OK | OK | OK |
| DMX7525/7722 (draadloos) | 4 | OK | OK | OK | OK | OK |
| DMX8021 (7" premium) | 2 | OK | OK | OK | OK | OK |
| DMX-F920DS (9" HD) | 2 | OK | OK | OK | OK | OK |
| DMX9720/9724XDS (10.1" HD) | 4 | OK | OK | OK | OK | OK |
| DNX navigatie (5190/7190/9190) | 3 | OK | OK | OK | OK | OK |
| DNR992RVS (Garmin camper) | 1 | OK | OK | OK | OK | OK |
| Camper bundels (met Sygic) | 1 | OK | OK | OK | OK | OK |

Aanbiedingen: DMX5020BTS (€299.95 v/a €349.95), DMX5023DABS (€389.95 v/a €449.99), DMX6523 serie (vanaf €429.95), DMX7525DABS (€599.95 v/a €649.99), DMX-F920DS (€675 v/a €699.99)

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL.
- **Authentication**: Replit OAuth service.
- **Payment Processing**: Stripe.

### Third-party Services
- **Email**: Resend for transactional email communications.
- **Session Storage**: `connect-pg-simple` for PostgreSQL-backed session storage.

### Key Libraries & Frameworks
- **Frontend**: React, TanStack Query, React Hook Form, Zod, shadcn/ui.
- **Backend**: Express.js, Drizzle ORM, Passport.js, Stripe SDK.
- **Styling**: Tailwind CSS.
- **Development**: Vite, TypeScript, ESLint.