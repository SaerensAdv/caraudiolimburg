# Go-Live Checklist — Car Audio Limburg Webshop

**Versie:** 1.1  
**Datum:** 15 februari 2026  
**Project:** caraudiolimburg.nl — Nieuwe webshop & installatieplatform

---

## Legenda

| Status | Betekenis |
|--------|-----------|
| ✅ Gereed | Volledig afgerond en getest |
| 🔧 Actie vereist | Klaar in de code, vereist externe actie (DNS, account, etc.) |
| ⏳ Nog te doen | Moet nog uitgevoerd worden na domeinlinking |

---

## 1. DNS & Domein koppelen

| # | Taak | Status | Toelichting |
|---|------|--------|-------------|
| 1.1 | DNS records aanpassen (A/CNAME naar Replit) | 🔧 Actie vereist | Moet bij de domeinregistrar ingesteld worden. Replit geeft de juiste records na koppeling. |
| 1.2 | SSL/TLS certificaat | ⏳ Nog te doen | Wordt automatisch aangemaakt door Replit zodra DNS correct is gekoppeld. Geen handmatige actie nodig. |
| 1.3 | www → non-www redirect (of omgekeerd) | ⏳ Nog te doen | Instellen na DNS-koppeling voor consistentie. |

---

## 2. 301 Redirects & SEO

| # | Taak | Status | Toelichting |
|---|------|--------|-------------|
| 2.1 | WordPress → nieuwe URL-structuur redirects | ✅ Gereed | Middleware gebouwd met 301 redirects voor alle oude WordPress URL-patronen: `/product-categorie/`, `/product/`, `/winkelwagen/`, `/faq/`, etc. |
| 2.2 | Dubbelcheck op basis van Google Search Console | 🔧 Actie vereist | Na domeinlinking: GSC openen, gecrawlde URL's vergelijken met redirect-regels, ontbrekende 301's toevoegen. |
| 2.3 | Sitemap.xml | ✅ Gereed | Dynamische XML sitemap met alle producten, categorieën, blogposts en vaste pagina's. Inclusief XSL-styling en sitemap-index. |
| 2.4 | Robots.txt | ✅ Gereed | Correct ingesteld met verwijzing naar sitemap. |
| 2.5 | Meta tags & Open Graph | ✅ Gereed | SEO component met unieke title, description en OG-tags per pagina. |
| 2.6 | Sitemap indienen bij Google Search Console | 🔧 Actie vereist | Na domeinlinking: `https://caraudiolimburg.nl/sitemap.xml` indienen in GSC. |
| 2.7 | Oude sitemap bij Google verwijderen | 🔧 Actie vereist | Eventuele oude WordPress sitemap-URL's verwijderen uit GSC. |

---

## 3. E-mail via Resend

| # | Taak | Status | Toelichting |
|---|------|--------|-------------|
| 3.1 | Resend integratie (code) | ✅ Gereed | Volledige email service gebouwd met Resend API via Replit connector. |
| 3.2 | Verzenddomein verifiëren | 🔧 Actie vereist | Na DNS-toegang: SPF, DKIM en DMARC records toevoegen voor `caraudiolimburg.nl` in Resend dashboard. |
| 3.3 | Orderbevestigingsmail | ✅ Gereed | HTML-template met bestelgegevens, productoverzicht en bedrijfsinfo. Wordt automatisch verstuurd na betaling. |
| 3.4 | Offerteaanvraag notificatie | ✅ Gereed | E-mail naar klant + bedrijf bij nieuwe offerteaanvraag. |
| 3.5 | Contactformulier notificatie | ✅ Gereed | E-mail naar bedrijf bij nieuw contactformulier. |
| 3.6 | E-mails testen op live domein | ⏳ Nog te doen | Na verzenddomein-verificatie: testbestelling plaatsen en e-mail ontvangst controleren. |

---

## 4. Stripe Betalingen

| # | Taak | Status | Toelichting |
|---|------|--------|-------------|
| 4.1 | Stripe integratie (code) | ✅ Gereed | PaymentIntent flow met server-side prijsvalidatie. Ondersteunt kaartbetaling, Bancontact en iDEAL. |
| 4.2 | Live API keys | ✅ Gereed | Live publishable + secret key geconfigureerd. Frontend haalt key op via backend endpoint (single source of truth). |
| 4.3 | Stripe webhook URL updaten | 🔧 Actie vereist | Na domeinlinking: webhook URL in Stripe Dashboard wijzigen van Replit-URL naar `https://caraudiolimburg.nl/api/webhooks/stripe`. |
| 4.4 | Webhook secret updaten | 🔧 Actie vereist | Nieuwe webhook secret genereren in Stripe en opslaan als `STRIPE_WEBHOOK_SECRET`. |
| 4.5 | Orderbevestigingspagina | ✅ Gereed | Toont ordernummer, totaal, verzendadres en volgende stappen. Bug (witte pagina) is opgelost. |
| 4.6 | Test-transactie op live domein | ⏳ Nog te doen | Na domeinlinking: volledige checkout flow testen met echte betaling. |

---

## 5. Teamleader Focus CRM

| # | Taak | Status | Toelichting |
|---|------|--------|-------------|
| 5.1 | Teamleader integratie (code) | ✅ Gereed | Automatische leadcreatie bij offerteaanvragen en bestellingen. |
| 5.2 | OAuth redirect URI updaten | 🔧 Actie vereist | Na domeinlinking: redirect URI in Teamleader marketplace-app wijzigen naar productiedomein. |
| 5.3 | Webhook URL updaten | 🔧 Actie vereist | Teamleader webhook URL aanpassen naar productiedomein. |
| 5.4 | Integratie testen op live domein | ⏳ Nog te doen | Na URI-update: testofferte indienen en controleren of lead correct aangemaakt wordt in Teamleader. |

---

## 6. Productcatalogus

| # | Taak | Status | Toelichting |
|---|------|--------|-------------|
| 6.1 | Audison (44 producten) | ✅ Gereed | Alle producten compleet: beschrijvingen, specs, afbeeldingen, prijzen. 22/44 met PDF tech sheets. |
| 6.2 | Pioneer (36 producten) | ✅ Gereed | Alle producten compleet inclusief aanbiedingen. |
| 6.3 | Alpine (48 producten) | ✅ Gereed | Alle producten compleet: camper, speakers, subwoofers, versterkers, navigatie. |
| 6.4 | Kenwood (26 producten) | ✅ Gereed | Alle producten compleet inclusief aanbiedingen. |
| 6.5 | Overige merken/producten aanvullen | 🔧 Actie vereist | Indien er nog merken/producten ontbreken: toevoegen via admin panel of database. |
| 6.6 | Voertuigcompatibiliteit | ✅ Gereed | 127 generatie-specifieke modellen (BMW, VW, Audi, Mercedes) met chassiscodes. 99 product-voertuig koppelingen. |
| 6.7 | Voorraadstanden controleren | 🔧 Actie vereist | Alle producten staan standaard op voorraad. Werkelijke voorraad afstemmen. |
| 6.8 | Prijzen actualiseren | 🔧 Actie vereist | Verkoopprijzen en adviesprijzen controleren op actualiteit. |

---

## 7. Juridisch & Compliance

| # | Taak | Status | Toelichting |
|---|------|--------|-------------|
| 7.1 | Algemene voorwaarden pagina | ✅ Gereed | Pagina gebouwd op `/voorwaarden`. |
| 7.2 | Inhoud voorwaarden controleren | 🔧 Actie vereist | Klant moet inhoud juridisch laten controleren op actualiteit en volledigheid. |
| 7.3 | Privacyverklaring (AVG/GDPR) | ✅ Gereed | Pagina gebouwd op `/privacy-policy`. |
| 7.4 | Inhoud privacyverklaring controleren | 🔧 Actie vereist | Controleren of alle dataverwerkingen correct beschreven zijn (Stripe, Resend, Teamleader, analytics). |
| 7.5 | Cookie-banner implementeren | ⏳ Nog te doen | Cookiebanner met opt-in/opt-out moet gebouwd of via extern script (bijv. CookieBot, Complianz) ingesteld worden. Verplicht conform AVG. |
| 7.6 | Consent-logging | ⏳ Nog te doen | Cookietoestemming moet gelogd worden als bewijs voor AVG-compliance. |
| 7.7 | Retourbeleid / herroepingsrecht | 🔧 Actie vereist | Controleren of dit duidelijk vermeld staat op de site (wettelijk verplicht voor webshops in België/Nederland). |

---

## 8. Analytics & Tracking

| # | Taak | Status | Toelichting |
|---|------|--------|-------------|
| 8.1 | DataLayer / e-commerce tracking (code) | ✅ Gereed | DataLayer events voor productweergave, add-to-cart, checkout en aankoop zijn ingebouwd. |
| 8.2 | Google Analytics 4 (GA4) koppelen | 🔧 Actie vereist | GA4 property aanmaken en Measurement ID (`G-XXXXXXXX`) instellen, of via Google Tag Manager. |
| 8.3 | Google Tag Manager instellen | 🔧 Actie vereist | GTM container aanmaken en script toevoegen aan de site. |
| 8.4 | Google Search Console koppelen | 🔧 Actie vereist | Site verifiëren via DNS TXT-record na domeinlinking. |
| 8.5 | E-commerce rapportage testen | ⏳ Nog te doen | Na GA4-koppeling: testbestelling plaatsen en controleren of omzet correct geregistreerd wordt. |

---

## 9. Functionaliteit testen op live domein

| # | Taak | Status | Toelichting |
|---|------|--------|-------------|
| 9.1 | Volledige checkout flow (kaart, Bancontact, iDEAL) | ⏳ Nog te doen | Na domeinlinking met echte betaling testen. |
| 9.2 | Orderbevestigingspagina | ✅ Gereed | Bug opgelost (React Hooks violation veroorzaakte witte pagina). |
| 9.3 | Offerteformulier | ⏳ Nog te doen | Testen of offerte correct aankomt in Teamleader + e-mail. |
| 9.4 | Contactformulier | ⏳ Nog te doen | Testen of bericht correct aankomt via e-mail. |
| 9.5 | AI Chatbot | ✅ Gereed | Chatbot met productzoekopdrachten, 600-token systeemprompt en markdown-weergave. |
| 9.6 | Boekingssysteem | ✅ Gereed | Kalender-gebaseerd installatieafspraken systeem. |
| 9.7 | Mobiele weergave | ⏳ Nog te doen | Alle pagina's controleren op mobiel (responsive design is ingebouwd). |
| 9.8 | Voertuigselector op homepage | ✅ Gereed | Merk → Model → Generatie → Jaar filtering met 127 modellen. |
| 9.9 | Klantportaal (mijn bestellingen) | ✅ Gereed | Ingelogde klanten kunnen bestellingen bekijken. |

---

## 10. Trusted Shops / eTrusted

| # | Taak | Status | Toelichting |
|---|------|--------|-------------|
| 10.1 | eTrusted reviews integratie (code) | ✅ Gereed | Aggregate rating en service reviews worden opgehaald en getoond. |
| 10.2 | Review-uitnodiging na bestelling | 🔧 Actie vereist | Foutmelding bij verzending: `"Invalid request: instance requires property \"system\""`. API-configuratie controleren. |

---

## 11. Admin Panel

| # | Taak | Status | Toelichting |
|---|------|--------|-------------|
| 11.1 | Productbeheer | ✅ Gereed | Producten toevoegen, bewerken, verwijderen via admin interface. |
| 11.2 | Bestelbeheer | ✅ Gereed | Bestellingen bekijken en status bijwerken. |
| 11.3 | Boekingenbeheer | ✅ Gereed | Installatieafspraken beheren. |
| 11.4 | Offertebeheer | ✅ Gereed | Offerteaanvragen bekijken en opvolgen. |
| 11.5 | Gebruikersbeheer | ✅ Gereed | Gebruikers en rollen beheren. |
| 11.6 | Blog / kenniscentrum | ✅ Gereed | Blogposts aanmaken en publiceren met scheduler. |
| 11.7 | Portfolio beheer | ✅ Gereed | Installatie-showcase met foto's. |
| 11.8 | Admin-account voor klant aanmaken | 🔧 Actie vereist | Klant moet een account krijgen met admin-rol. |

---

## 12. Database & Backup

| # | Taak | Status | Toelichting |
|---|------|--------|-------------|
| 12.1 | Database migratiescript | ✅ Gereed | Idempotent SQL-script klaar voor productie: 127 voertuigmodellen met generaties, 99 product-voertuig koppelingen. |
| 12.2 | Database backup vóór go-live | 🔧 Actie vereist | Volledige backup maken van de huidige database vóór DNS-cutover. Replit biedt automatische checkpoints. |
| 12.3 | Rollback plan | 🔧 Actie vereist | Procedure documenteren voor het terugdraaien naar de oude site indien nodig (DNS terugzetten + backup terugzetten). |

---

## 13. Omgevingsvariabelen & Beveiliging

| # | Taak | Status | Toelichting |
|---|------|--------|-------------|
| 13.1 | Stripe keys (live modus) | ✅ Gereed | `STRIPE_PUBLISHABLE_KEY` en `STRIPE_SECRET_KEY` zijn geconfigureerd in live modus. |
| 13.2 | Stripe webhook secret | 🔧 Actie vereist | Nieuw webhook secret genereren na domeinlinking en opslaan als `STRIPE_WEBHOOK_SECRET`. |
| 13.3 | Teamleader OAuth credentials | ✅ Gereed | `TEAMLEADER_CLIENT_ID` en `TEAMLEADER_CLIENT_SECRET` zijn geconfigureerd. |
| 13.4 | Resend API key | ✅ Gereed | Geconfigureerd via Replit connector. |
| 13.5 | GA4 / GTM ID instellen | ⏳ Nog te doen | Measurement ID of GTM container ID toevoegen als omgevingsvariabele. |
| 13.6 | Secrets audit | 🔧 Actie vereist | Controleren dat alle API keys correct zijn en geen testkeys bevatten. Geen secrets in code of logs. |

---

## 14. Monitoring & Operationeel

| # | Taak | Status | Toelichting |
|---|------|--------|-------------|
| 14.1 | Health check endpoint | ✅ Gereed | Replit monitort automatisch de applicatie-status. |
| 14.2 | Foutmonitoring / logging | 🔧 Actie vereist | Overweeg een externe foutmonitoring service (bijv. Sentry) voor productie-errors. |
| 14.3 | Retouren & terugbetalingen workflow | 🔧 Actie vereist | Operationele procedure afspreken: hoe worden retouren verwerkt in Stripe + orderstatus bijgewerkt? |
| 14.4 | Klantenservice procedure | 🔧 Actie vereist | Afspreken wie contactformulier-berichten en offerteaanvragen opvolgt en binnen welke termijn. |
| 14.5 | Uptime monitoring | ⏳ Nog te doen | Optioneel: externe uptime monitoring instellen (bijv. UptimeRobot) voor meldingen bij downtime. |

---

## Volgorde van uitvoering na DNS-koppeling

Na het koppelen van het domein moeten de volgende stappen in deze volgorde uitgevoerd worden:

### Fase 1 — Voorbereiding (vóór DNS-cutover)
1. **Database backup maken** → checkpoint/snapshot van huidige data
2. **Rollback plan documenteren** → DNS terugzetten + backup restore procedure
3. **Secrets audit** → alle API keys controleren (live modus, geen testkeys)
4. **Admin-account klant aanmaken** → inloggen en rechten verifiëren

### Fase 2 — DNS & Certificaat
5. **DNS records instellen** → domein wijst naar Replit
6. **SSL verificatie** → automatisch door Replit na DNS-propagatie
7. **www redirect instellen** → consistente URL-structuur

### Fase 3 — Externe services koppelen
8. **Resend verzenddomein verifiëren** → SPF/DKIM/DMARC records toevoegen
9. **Stripe webhook URL updaten** → naar `https://caraudiolimburg.nl/api/webhooks/stripe`
10. **Stripe webhook secret vernieuwen** → nieuw secret opslaan
11. **Teamleader redirect URI + webhook updaten** → naar productiedomein

### Fase 4 — Analytics & SEO
12. **Google Search Console koppelen** → DNS TXT-record
13. **GA4 / GTM instellen** → Measurement ID of container toevoegen
14. **Sitemap indienen** → in Google Search Console
15. **301 redirects dubbelchecken** → via GSC gecrawlde URL's vergelijken

### Fase 5 — Go-Live test
16. **Volledige checkout test** → bestelling met echte betaling (kaart, Bancontact, iDEAL)
17. **E-mail test** → orderbevestiging, offerte, contactformulier
18. **Teamleader test** → offerte indienen, controleren of lead aangemaakt wordt
19. **Mobiel testen** → alle pagina's controleren op smartphone
20. **Monitoring activeren** → foutlogs en uptime controleren

---

## Samenvatting

| Categorie | Gereed | Actie vereist | Nog te doen |
|-----------|--------|---------------|-------------|
| DNS & Domein | 0 | 1 | 2 |
| SEO & Redirects | 4 | 3 | 0 |
| E-mail (Resend) | 4 | 1 | 1 |
| Stripe Betalingen | 3 | 2 | 1 |
| Teamleader CRM | 1 | 2 | 1 |
| Productcatalogus | 5 | 3 | 0 |
| Juridisch & Compliance | 2 | 3 | 2 |
| Analytics & Tracking | 1 | 3 | 1 |
| Functionaliteit testen | 5 | 0 | 4 |
| Trusted Shops | 1 | 1 | 0 |
| Admin Panel | 7 | 1 | 0 |
| Database & Backup | 1 | 2 | 0 |
| Omgevingsvariabelen | 3 | 2 | 1 |
| Monitoring & Operationeel | 1 | 3 | 1 |
| **Totaal** | **38** | **27** | **14** |

> **38 van de 79 taken zijn volledig afgerond.** De overige 27 taken vereisen externe acties (DNS, accounts, dashboards) en 14 taken worden uitgevoerd na domeinlinking als onderdeel van de go-live test.
>
> **Het overgrote deel van het ontwikkelwerk is klaar.** De resterende taken zijn voornamelijk configuratie- en verificatiestappen die pas uitgevoerd kunnen worden zodra het domein gekoppeld is.

---

*Dit document wordt bijgewerkt naarmate taken worden afgerond.*
