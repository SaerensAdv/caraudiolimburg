# Voorstel: VIN Lookup voor CarPlay Compatibiliteit

## Samenvatting

Een nieuwe functie waarmee klanten hun **chassisnummer (VIN)** kunnen invoeren om direct te zien welke CarPlay oplossingen beschikbaar zijn voor hun specifieke voertuig. Dit verhoogt conversie en vermindert offerteaanvragen voor niet-compatibele voertuigen.

---

## Hoe werkt het?

### Klantervaring

1. Klant bezoekt de CarPlay pagina
2. Voert chassisnummer (17 tekens) in
3. Systeem toont binnen 2 seconden:
   - Voertuiggegevens (merk, model, bouwjaar, motortype, uitrusting)
   - Huidige infotainment systeem (via OEM data)
   - **Beschikbare CarPlay oplossingen met prijzen**
   - Direct "Offerte aanvragen" knop

### Voorbeeld

```
VIN: WBAPH5C55BA123456

✓ BMW 3-serie (F30) - 2018
✓ Motor: 2.0L 4-cilinder Benzine (184 pk)
✓ Transmissie: Automaat 8-traps
✓ Infotainment: iDrive 6 NBT EVO
✓ Stuurzijde: Links (LHD)

Beschikbare oplossingen:
┌─────────────────────────────────────┐
│ Draadloos CarPlay Retrofit          │
│ Vanaf €599 incl. installatie        │
│ [Meer info] [Offerte aanvragen]     │
└─────────────────────────────────────┘
```

---

## Voordelen

| Voordeel | Toelichting |
|----------|-------------|
| **Hogere conversie** | Klant ziet direct wat mogelijk is voor zijn specifieke auto |
| **Minder vragen** | Filtert niet-compatibele voertuigen vooraf |
| **Professionaliteit** | Toont diepgaande voertuigkennis, geeft vertrouwen |
| **Lead kwaliteit** | Alleen serieuze, compatibele leads |
| **Tijdsbesparing** | Geen handmatig uitzoeken per aanvraag |
| **Upselling** | Extra diensten aanbieden op basis van voertuigdata (bijv. dashcam, alarm) |
| **Diefstalpreventie** | Optionele stolen check als extra service |

---

## Vincario API v3.2 — Overzicht

### Wat is Vincario?

Vincario (voorheen vindecoder.eu) is een wereldleider in VIN decoding met **2.400+ ondersteunde automerken** en klanten als TomTom, Toyota, Siemens, Hertz en SIXT. De API maakt gebruik van machine learning getraind op nationale voertuigdatabases.

### Beschikbare API Endpoints

Vincario biedt meerdere endpoints die elk een ander type data opleveren:

| Endpoint | Beschrijving | Relevantie voor CarPlay |
|----------|-------------|------------------------|
| **VIN Decode** | Volledige voertuigidentificatie (50+ velden) | **Kern** — Merk, model, bouwjaar, serie, uitrusting |
| **VIN Decode Info** | Beknopte voertuiginfo | Snelle check/validatie |
| **OEM VIN Lookup** | Originele fabrieksuitrusting en -opties | **Zeer waardevol** — Identificeert exact welk infotainmentsysteem af-fabriek is geleverd |
| **Vehicle Market Value** | Actuele marktwaarde (Europa & Noord-Amerika) | Optioneel — Kan klant helpen met waardebepaling |
| **Stolen Check** | Controle Europese politiedatabases | Extra service — Diefstalcontrole bij inname |
| **Get Balance** | Huidig API-tegoed controleren | Intern — Monitoring verbruik |

### Data die terugkomt bij een VIN Decode (50+ velden)

De API levert een schat aan informatie terug. Hieronder de meest relevante velden voor de CarPlay-dienst:

**Voertuig-identificatie:**
- Make, Model, Model Year, Series, Trim, Variant, Version
- Body (SUV, Sedan, etc.), Number of Doors, Number of Seats
- Product Type (Personenauto, Bestelwagen, etc.)

**Motor & Aandrijving:**
- Engine Type, Engine Displacement (ccm), Engine Power (kW/HP)
- Fuel Type (Primary/Secondary), Transmission, Drive (4x4, FWD, etc.)
- Number of Gears, Engine Turbine

**Afmetingen & Gewicht:**
- Length, Width, Height (mm), Wheelbase, Weight Empty/Max

**Elektrisch/Hybride (steeds relevanter):**
- Battery Capacity (kWh), Electric Range (km), Plug-in Hybrid indicator
- Electric Motor Power, Battery Charging Time, Charging Plug Type

**Productie & Herkomst:**
- Manufacturer, Plant Country/City, Made (productiedatum)
- Steering (LHD/RHD), Market

**Visueel:**
- Make Logo (SVG URL van het automerk)
- Color, Color (interior)

### Waarom de OEM VIN Lookup extra waardevol is voor CarPlay

De standaard VIN Decode geeft al veel info, maar de **OEM VIN Lookup** gaat een stap verder: het toont de **exacte fabrieksuitrusting** van het specifieke voertuig. Dit is cruciaal voor CarPlay retrofit omdat:

1. **Infotainment-identificatie** — Welk exact systeem zit er in (iDrive NBT vs NBT EVO, MMI 3G vs MIB2, COMAND NTG 4.5 vs 5.0)
2. **Trim-specifieke verschillen** — Een basismodel kan een ander headunit hebben dan een luxe uitvoering
3. **Fabriekopties** — Was er al navigatie, bluetooth, of een groot scherm aanwezig?
4. **Equipment-lijst** — Volledige optielijst van het voertuig

---

## Prijzen (Vincario API v3.2 — Actueel 2026)

### Pricing Model

Vincario werkt met **maandelijkse abonnementen** (geen jaarcontract vereist). Ongebruikte lookups vervallen aan het einde van de maand. Ongeldige VIN-nummers worden **niet** in rekening gebracht.

### VIN Decode Prijzen

| Volume (per maand) | Prijs per lookup | Maandelijks totaal |
|---------------------|-----------------|-------------------|
| Gratis tier* | €0 | 3 gratis VIN reports/maand (web) |
| Free Trial* | €0 | 20 gratis lookups bij API trial aanvraag |
| 100 lookups | €0,49 | €49/maand |
| 500 lookups | €0,298 | €149/maand |
| 1.000 lookups | €0,249 | €249/maand |
| 5.000 lookups | €0,22 | €1.100/maand |
| 10.000+ lookups | Op aanvraag | Custom pricing |

*\* De gratis tier (3 VIN reports/maand) is mogelijk beperkt tot web-reports en niet beschikbaar via de API. De free trial (20 lookups) is beschikbaar na het aanmaken van een API-account. Exacte voorwaarden bevestigen bij Vincario.*

### OEM VIN Lookup Prijzen

Custom pricing op aanvraag — contacteer Vincario sales team.

### Vehicle Market Value Prijzen (optioneel)

| Volume (per maand) | Prijs per lookup |
|---------------------|-----------------|
| 100 lookups | €1,99 |
| 500 lookups | €1,198 |
| 1.000 lookups | €0,999 |
| 5.000 lookups | €0,90 |

### Stolen Check Prijzen (optioneel)

| Volume (per maand) | Prijs per lookup |
|---------------------|-----------------|
| 100 lookups | €1,99 |
| 500 lookups | €1,198 |
| 1.000 lookups | €0,999 |
| 5.000 lookups | €0,90 |

### Aanbeveling voor Car Audio Limburg

**Start:** 100 lookups/maand voor €49 — voldoende voor de eerste maanden om het concept te testen.

**Bij groei:** 500 lookups/maand voor €149 — significant lagere prijs per lookup.

### Overage opties

Als het maandlimiet bereikt wordt, zijn er drie opties:
1. **Pauzeren** — API stopt tot volgende factuurperiode (geschikt voor niet-urgente processen)
2. **Always Active** — Automatisch doorberekenen aan dezelfde prijs per lookup (aanbevolen voor klantgerichte flows)
3. **Upgraden** — Direct overstappen naar een hoger pakket

---

## Technische Specificaties

| Aspect | Details |
|--------|---------|
| **Uptime** | 99,9% (vermeld op vincario.com) |
| **Responstijd** | Snelle responses (typisch < 1 seconde) |
| **Rate limit** | 60 lookups per minuut |
| **Data validatie** | Statistisch model verifieert resultaten |
| **GDPR** | Volledig compliant |
| **CPRA** | Volledig compliant |
| **Ongeldige VINs** | Worden niet in rekening gebracht |
| **API versie** | v3.2 (REST JSON) |
| **Formaten** | JSON en XML |
| **Documentatie** | https://vincario.com/api-docs/3.2/ |

*Let op: Exacte SLA-voorwaarden en uptime-garanties dienen bevestigd te worden bij het afsluiten van een API-contract met Vincario.*

---

## Technische Implementatie in dit Project

### API Integratie (Node.js / Express)

Vincario biedt officiële Node.js code samples via [GitHub](https://github.com/Vincario/api-code-sample/tree/master/NodeJS). Implementatie duurt minder dan 5 minuten volgens Vincario.

**Authenticatie werkt als volgt:**

1. API Key + Secret Key worden opgeslagen als environment secrets
2. Per request wordt een **control sum** berekend: eerste 10 tekens van SHA1 hash van `VIN|ID|API_KEY|SECRET_KEY` (VIN in hoofdletters)
3. De request URL wordt opgebouwd als: `https://api.vincario.com/3.2/{API_KEY}/{CONTROL_SUM}/{ENDPOINT}/{VIN}.json`

> **Let op API URL:** De officiële API documentatie vermeldt `api.vincario.com` als endpoint. Sommige oudere code samples gebruiken nog `api.vindecoder.eu`. Bij implementatie de URL bevestigen met de API credentials die je ontvangt.

**Voorbeeld implementatie (backend route):**

```javascript
// server/routes.ts — VIN lookup endpoint
import crypto from 'crypto';

const API_BASE = process.env.VINCARIO_API_URL || 'https://api.vincario.com/3.2';

app.get('/api/vin/:vin', async (req, res) => {
  const vin = req.params.vin.toUpperCase();
  const apiKey = process.env.VINCARIO_API_KEY;
  const secretKey = process.env.VINCARIO_SECRET_KEY;
  const id = 'decode';

  const controlSum = crypto
    .createHash('sha1')
    .update(`${vin}|${id}|${apiKey}|${secretKey}`)
    .digest('hex')
    .substring(0, 10);

  const url = `${API_BASE}/${apiKey}/${controlSum}/decode/${vin}.json`;

  const response = await fetch(url);
  const data = await response.json();

  // Match met interne compatibiliteitsmatrix
  const carplayOptions = matchCarPlaySolutions(data);

  res.json({ vehicle: data, solutions: carplayOptions });
});
```

### Caching Strategie

Om API-kosten te beperken:
- **Database cache** — VIN resultaten opslaan in PostgreSQL (zelfde VIN hoeft maar 1x opgezocht te worden)
- **Cache duur** — Voertuigdata verandert niet, dus cache kan onbeperkt bewaard worden
- **Geschatte besparing** — Bij 30% herhaalde lookups scheelt dit ~30% op API kosten

### Frontend Component

Een VIN-invoerveld op de CarPlay pagina met:
- Invoervalidatie (17 tekens, alfanumeriek, geen I/O/Q)
- Live feedback tijdens typen
- Laadanimatie tijdens API call
- Resultaat met voertuigdetails + beschikbare oplossingen
- Direct "Offerte aanvragen" knop met voertuigdata pre-filled

### Uitbreidingsmogelijkheden

| Feature | Endpoint / Service | Status | Beschrijving |
|---------|-------------------|--------|-------------|
| **Marktwaarde tonen** | Vehicle Market Value API | Beschikbaar | "Uw auto is ca. €X.XXX waard" — extra vertrouwen |
| **Diefstalcheck** | Stolen Check API | Beschikbaar | Check tegen EU politiedatabases als extra service |
| **VIN Scanner** | VIN OCR Scanner | Beschikbaar | Foto van VIN-plaatje = automatisch invullen |
| **Kenteken lookup** | License Plate Lookup | Beschikbaar | Alternatief voor VIN invoer via kenteken |

*VIN OCR Scanner en License Plate Lookup zijn nieuwere Vincario-diensten. Exacte API-integratie en pricing op aanvraag.*

---

## Wat is nodig van Car Audio Limburg?

Om deze functie te bouwen hebben wij de volgende informatie nodig:

### 1. Compatibiliteitsmatrix

Een overzicht van welke CarPlay oplossing past bij welk voertuig:

| Merk | Model | Bouwjaren | OEM Systeem | Jullie Oplossing | Prijs vanaf |
|------|-------|-----------|-------------|------------------|-------------|
| BMW | 3-serie (F30) | 2012-2019 | iDrive NBT | Draadloos CarPlay | €599 |
| BMW | 3-serie (G20) | 2019+ | iDrive 7 | Factory CarPlay | €399 |
| Audi | A4 (B9) | 2016+ | MMI Plus | Retrofit Kit | €699 |
| ... | ... | ... | ... | ... | ... |

### 2. Ondersteunde merken

Welke automerken ondersteunen jullie? Bijvoorbeeld:
- [ ] BMW
- [ ] Audi
- [ ] Mercedes
- [ ] Volkswagen
- [ ] Porsche
- [ ] Mini
- [ ] Land Rover / Range Rover
- [ ] Volvo
- [ ] Andere: ___

### 3. Infotainment systemen

Welke OEM systemen kunnen jullie upgraden?

**BMW:**
- [ ] iDrive CIC
- [ ] iDrive NBT
- [ ] iDrive NBT EVO (ID5/ID6)
- [ ] iDrive 7 (ID7)

**Audi:**
- [ ] MMI 3G
- [ ] MMI 3G Plus
- [ ] MIB1 / MIB2
- [ ] MIB3

**Mercedes:**
- [ ] COMAND NTG 4.5
- [ ] COMAND NTG 5.0
- [ ] MBUX

**Volkswagen / Seat / Škoda:**
- [ ] RNS 315 / RNS 510
- [ ] MIB1 / MIB2
- [ ] MIB3

**Etc.**

### 4. Producten/Pakketten

Per compatibele combinatie:
- Productnaam
- Korte beschrijving
- Prijs (vanaf)
- Installatietijd
- Eventuele beperkingen

---

## Tijdlijn

| Fase | Duur | Activiteit |
|------|------|------------|
| 1 | 1 week | Compatibiliteitsdata verzamelen (Car Audio Limburg) |
| 2 | 1 dag | Vincario API account aanmaken + free trial activeren |
| 3 | 2-3 dagen | Backend API integratie + database cache opzet |
| 4 | 2-3 dagen | Frontend VIN-checker component bouwen |
| 5 | 1 dag | Matching-logica compatibiliteitsmatrix |
| 6 | 1 dag | Testen + finetunen |
| **Totaal** | **~2 weken** | Afhankelijk van data-aanlevering |

---

## Investering

### Eenmalige kosten
- Ontwikkeling: **Inbegrepen in huidige project**
- Vincario account setup: **Gratis** (free trial met 20 lookups)

### Doorlopende kosten
- VIN API (start): **€49/maand** (100 lookups)
- VIN API (groei): **€149/maand** (500 lookups)
- Geen andere doorlopende kosten

### Return on Investment

Bij een gemiddelde CarPlay-installatie van €500-€700:
- Al bij **1 extra conversie per maand** is de API-kost terugverdiend
- De functie bespaart daarnaast ~15 min per aanvraag aan handmatig uitzoekwerk
- Betere lead-kwaliteit = hogere conversieratio op offertes

---

## Volgende stappen

1. **Bevestig interesse** in deze feature
2. **Lever compatibiliteitsdata aan** (zie bovenstaande template)
3. **Account aanmaken** op [vincario.com](https://vincario.com/vin-decoder/#request-free-trial-api-key) (gratis trial)
4. **API keys delen** (worden veilig opgeslagen als secrets)
5. **Implementatie** door ontwikkelaar

---

## Bijlage: Vergelijking met alternatieven

| Aspect | Vincario | NHTSA vPIC (gratis) | Andere aanbieders |
|--------|----------|---------------------|-------------------|
| **Dekking** | 2.400+ merken, wereldwijd | Alleen VS-markt | Varieert |
| **Datakwaliteit** | ML-geverifieerd, 50+ velden | Basisdata, beperkte velden | Varieert |
| **OEM data** | Ja (apart endpoint) | Nee | Zelden |
| **Marktwaarde** | Ja (apart endpoint) | Nee | Soms |
| **Stolen check** | Ja (EU politiedatabases) | Nee | Soms |
| **GDPR** | Volledig compliant | N.v.t. (US) | Varieert |
| **Europese focus** | Uitgebreid (NL/BE markt) | Nee | Varieert |
| **Support** | Dedicated, SLA mogelijk | Community/overheid | Varieert |
| **Node.js SDK** | Officiële code samples | Community packages | Varieert |

**Conclusie:** Vincario is de beste keuze voor de Europese automotive aftermarket markt vanwege de brede merkendekking, Europese focus, OEM data-toegang en GDPR-compliance.

---

*Document versie 2.0 — Februari 2026*
*Gebaseerd op Vincario API v3.2 — vincario.com*
