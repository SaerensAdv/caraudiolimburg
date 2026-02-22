# Klantenservice Procedure — Car Audio Limburg

**Versie:** 1.0  
**Laatst bijgewerkt:** 22 februari 2026  
**Project:** caraudiolimburg.nl  
**Verantwoordelijke:** [INVULLEN: naam verantwoordelijke]

---

## 1. Overzicht

Dit document beschrijft de klantenserviceprocedure voor Car Audio Limburg. Het doel is om een consistente, professionele en tijdige afhandeling van klantverzoeken te garanderen via alle communicatiekanalen.

### Contactgegevens

| Gegeven | Waarde |
|---------|--------|
| Primaire contactpersoon | [INVULLEN: naam] |
| Backup contactpersoon | [INVULLEN: naam] |
| E-mailadres klantenservice | [INVULLEN: bijv. info@caraudiolimburg.nl] |
| Telefoonnummer | [INVULLEN: bijv. +32 XX XXX XX XX] |
| Openingstijden | [INVULLEN: bijv. ma–vr 09:00–17:30, za 10:00–15:00] |
| Adres showroom/werkplaats | [INVULLEN: straat, postcode, plaats] |

---

## 2. Communicatiekanalen

### 2.1 Contactformulier (website)

| Kenmerk | Detail |
|---------|--------|
| Locatie | caraudiolimburg.nl/contact |
| Werking | Formulier verstuurt e-mail naar [INVULLEN: e-mailadres] via Resend |
| Notificatie | Automatische e-mail naar medewerker + bevestiging naar klant |
| SLA reactietijd | Binnen [INVULLEN: bijv. 4 uur] tijdens openingstijden |

**Workflow:**
1. Klant vult contactformulier in op de website
2. Systeem verstuurt notificatie-e-mail naar [INVULLEN: e-mailadres]
3. Medewerker [INVULLEN: naam/rol] ontvangt en beoordeelt het bericht
4. Medewerker reageert per e-mail aan de klant

### 2.2 E-mail

| Kenmerk | Detail |
|---------|--------|
| Adres | [INVULLEN: e-mailadres] |
| SLA reactietijd | Binnen [INVULLEN: bijv. 24 uur] tijdens werkdagen |
| Verantwoordelijke | [INVULLEN: naam/rol] |

### 2.3 Telefoon

| Kenmerk | Detail |
|---------|--------|
| Nummer | [INVULLEN: telefoonnummer] |
| Bereikbaar | [INVULLEN: openingstijden] |
| Verantwoordelijke | [INVULLEN: naam/rol] |

**Richtlijnen telefonische klantenservice:**
- Neem op met: "Goedemorgen/middag, Car Audio Limburg, u spreekt met [naam]"
- Noteer naam, telefoonnummer en vraag van de klant
- Bij complexe vragen: noteer en bel terug na uitzoeken
- Bij afwezigheid: voicemail met terugbelbelofte binnen [INVULLEN: X uur]

---

## 3. Response Time SLA's

| Type verzoek | Kanaal | Maximale reactietijd | Maximale afhandeltijd |
|-------------|--------|----------------------|----------------------|
| Contactformulier | Website | [INVULLEN: bijv. 4 uur] | [INVULLEN: bijv. 2 werkdagen] |
| Algemene vraag | E-mail | [INVULLEN: bijv. 24 uur] | [INVULLEN: bijv. 2 werkdagen] |
| Offerteaanvraag | Website/E-mail | [INVULLEN: bijv. 24 uur] | [INVULLEN: bijv. 3 werkdagen] |
| Orderstatus vraag | E-mail/Telefoon | [INVULLEN: bijv. 4 uur] | [INVULLEN: bijv. 1 werkdag] |
| Klacht | Alle kanalen | [INVULLEN: bijv. 4 uur] | [INVULLEN: bijv. 5 werkdagen] |
| Retourverzoek | E-mail | [INVULLEN: bijv. 2 werkdagen] | [INVULLEN: bijv. 14 werkdagen] |
| Spoedeisend (betaling/levering) | Telefoon | Dezelfde werkdag | Dezelfde werkdag |

> **Opmerking:** Reactietijden gelden tijdens openingstijden. Berichten ontvangen buiten kantooruren worden de eerstvolgende werkdag opgepakt.

---

## 4. Routering van verzoeken

### Overzicht: wie handelt wat af?

| Type verzoek | Eerste ontvanger | Afgehandeld door | Tool |
|-------------|-----------------|-----------------|------|
| Contactformulier | E-mail notificatie | [INVULLEN: naam/rol] | Resend (e-mail logs) |
| Offerteaanvraag | E-mail notificatie + Teamleader | [INVULLEN: naam/rol] | Teamleader CRM |
| Bestelling/betaling vraag | E-mail | [INVULLEN: naam/rol] | Admin panel + Stripe |
| Retourverzoek | E-mail | [INVULLEN: naam/rol] | Admin panel + Stripe |
| Technische vraag (product) | E-mail/Telefoon | [INVULLEN: naam/rol] | — |
| Installatieafspraak | Website boekingssysteem | [INVULLEN: naam/rol] | Admin panel |
| Klacht | E-mail/Telefoon | [INVULLEN: naam/rol] | — |

---

## 5. Procedures per type verzoek

### 5.1 Offerteaanvragen

**Workflow:**

1. **Ontvangst:** Klant dient offerteaanvraag in via het offerteformulier op de website
2. **Notificatie:** Automatische e-mail naar [INVULLEN: e-mailadres] + bevestigingsmail naar klant
3. **Lead aangemaakt:** Automatisch aangemaakt als lead in Teamleader CRM
4. **Beoordeling:** Medewerker bekijkt de aanvraag en bepaalt:
   - Is alle informatie compleet?
   - Welke producten en/of installatie is gewenst?
   - Is een voertuiginspectie nodig?
5. **Offerte opstellen:** Maak een offerte aan in Teamleader Focus:
   - Producten en prijzen toevoegen
   - Installatiekosten berekenen
   - Levertijd vermelden
6. **Offerte versturen:** Verstuur de offerte naar de klant via Teamleader of e-mail
7. **Opvolging:**
   - Na [INVULLEN: bijv. 5 werkdagen] zonder reactie: opvolg-e-mail of telefoontje
   - Na [INVULLEN: bijv. 14 dagen] zonder reactie: lead sluiten in Teamleader
8. **Registratie:** Werk de status bij in Teamleader (offerte verstuurd → gewonnen/verloren)

### 5.2 Bestellingen & orderstatus

**Statusvragen van klanten:**

1. Zoek de bestelling op in het **admin panel** (op ordernummer of klantnaam)
2. Controleer de huidige orderstatus
3. Controleer eventueel de betaalstatus in het **Stripe Dashboard**
4. Informeer de klant per e-mail of telefoon

**Veelvoorkomende statusvragen en antwoorden:**

| Vraag | Waar te vinden | Antwoord |
|-------|---------------|----------|
| "Waar is mijn bestelling?" | Admin panel → Bestellingen | Status + verwachte leverdatum |
| "Is mijn betaling ontvangen?" | Stripe Dashboard → Payments | Bevestig betaalstatus |
| "Kan ik mijn bestelling wijzigen?" | Admin panel | Alleen mogelijk vóór verzending |
| "Kan ik mijn bestelling annuleren?" | Admin panel + Stripe | Refund verwerken als nog niet verzonden |

### 5.3 Verzending

1. Klant vraagt naar verzendstatus
2. Controleer of het pakket is verzonden (admin panel)
3. Verstrek track & trace informatie indien beschikbaar
4. Bij vertraging: contacteer de vervoerder en informeer de klant proactief

### 5.4 Klachten

1. **Registreer de klacht:** Noteer klantgegevens, ordernummer en omschrijving van de klacht
2. **Erken de klacht:** Stuur de klant binnen [INVULLEN: X uur] een ontvangstbevestiging
3. **Beoordeel de klacht:** Bepaal of het gaat om:
   - Productdefect → Garantieprocedure (zie Retouren Workflow)
   - Verkeerd product geleverd → Omruiling regelen
   - Schade tijdens transport → Claim bij vervoerder
   - Ontevredenheid over service → Interne evaluatie
4. **Oplossing bieden:** Bied een passende oplossing aan (vervanging, refund, korting)
5. **Opvolging:** Neem na afhandeling contact op om te controleren of de klant tevreden is
6. **Registratie:** Documenteer de klacht en oplossing voor interne verbetering

---

## 6. Escalatieprocedure

### Wanneer escaleren?

| Situatie | Escaleer naar |
|----------|--------------|
| Klant dreigt met juridische stappen | [INVULLEN: eigenaar/management] |
| Klacht over herhaaldelijk probleem | [INVULLEN: eigenaar/management] |
| Meerdere klachten over zelfde product | [INVULLEN: eigenaar + leverancier] |
| Betaalprobleem dat niet via Stripe op te lossen is | [INVULLEN: developer + eigenaar] |
| Technisch probleem met de website | [INVULLEN: developer] |
| Klant eist refund boven [INVULLEN: bijv. €500] | [INVULLEN: eigenaar] |
| Negatieve review op sociale media / Google | [INVULLEN: eigenaar] |

### Escalatiestappen

1. **Niveau 1 — Medewerker:** Standaard klantenservice (contactformulier, e-mail, telefoon)
2. **Niveau 2 — [INVULLEN: naam/rol]:** Complexe vragen, klachten, hoge refunds
3. **Niveau 3 — [INVULLEN: eigenaar]:** Juridische zaken, leveranciersproblemen, reputatiezaken

**Bij escalatie:**
- Documenteer de situatie volledig (klantgegevens, chronologie, wat er tot nu toe is ondernomen)
- Informeer de klant dat het verzoek is geëscaleerd en noem de verwachte reactietijd
- Draag het dossier over aan de volgende persoon via e-mail met alle relevante informatie

---

## 7. Gebruikte tools

### Overzicht

| Tool | Gebruik | Toegang |
|------|---------|---------|
| **Admin panel** | Bestellingen bekijken, orderstatus bijwerken, producten beheren, offertes bekijken, boekingen beheren | caraudiolimburg.nl/admin |
| **Teamleader Focus CRM** | Leads beheren, offertes aanmaken, klantopvolging | [INVULLEN: Teamleader login URL] |
| **Stripe Dashboard** | Betalingen controleren, refunds verwerken, transactiegeschiedenis | dashboard.stripe.com |
| **Resend** | E-mail verzendlogs bekijken, delivery status controleren | resend.com/overview |

### Wanneer welke tool gebruiken?

| Situatie | Tool |
|----------|------|
| Klant vraagt naar orderstatus | Admin panel → Bestellingen |
| Klant vraagt naar betaalstatus | Stripe Dashboard → Payments |
| Nieuwe offerteaanvraag binnengekomen | Teamleader CRM → Leads |
| Offerte opstellen en versturen | Teamleader CRM → Deals |
| Retour/refund verwerken | Stripe Dashboard → Refunds |
| Controleren of e-mail is verstuurd | Resend → Logs |
| Installatieafspraak beheren | Admin panel → Boekingen |
| Productinformatie bijwerken | Admin panel → Producten |

---

## 8. Dagelijkse routine

### Ochtend check-in (bij opening)

| # | Actie | Tool |
|---|-------|------|
| 1 | Controleer nieuwe e-mails en contactformulier-berichten | E-mail inbox |
| 2 | Bekijk nieuwe bestellingen en betalingen | Admin panel + Stripe |
| 3 | Controleer nieuwe offerteaanvragen | Teamleader CRM |
| 4 | Bekijk aankomende installatieafspraken | Admin panel → Boekingen |
| 5 | Controleer of er openstaande klachten/retourverzoeken zijn | E-mail inbox |

### Einde van de dag

| # | Actie |
|---|-------|
| 1 | Controleer of alle berichten van vandaag zijn beantwoord |
| 2 | Werk openstaande orderstatus bij in het admin panel |
| 3 | Plan opvolging voor morgen (offertes, klachten) |

---

## 9. Veelgestelde vragen (intern)

| Vraag | Antwoord |
|-------|----------|
| Waar vind ik het ordernummer? | Admin panel → Bestellingen → zoek op klantnaam of e-mail |
| Hoe verwerk ik een refund? | Stripe Dashboard → Payments → selecteer betaling → Refund. Zie ook [Retouren Workflow](./RETOUREN-WORKFLOW.md) |
| Hoe maak ik een offerte? | Teamleader → Deals → Nieuwe deal aanmaken → producten en prijzen toevoegen |
| Is een e-mail wel verstuurd? | Resend → Logs → zoek op e-mailadres of onderwerp |
| Hoe wijzig ik een productprijs? | Admin panel → Producten → zoek product → bewerken → prijs aanpassen |
| Waar staat het retourbeleid? | [Algemene Voorwaarden](/voorwaarden) op de website |
| Hoe boek ik een installatieafspraak? | Klant kan dit zelf via de website, of medewerker kan dit doen via Admin panel → Boekingen |

---

## 10. Gerelateerde documenten

- [Retouren & Terugbetalingen Workflow](./RETOUREN-WORKFLOW.md) — Volledige retourprocedure
- [Rollback Plan](./ROLLBACK-PLAN.md) — Technisch rollback plan voor go-live
- [Go-Live Checklist](/GO-LIVE-CHECKLIST.md) — Overzicht van alle go-live taken
- [Algemene Voorwaarden](/voorwaarden) — Retourbeleid, herroepingsrecht, garantie
- [Privacyverklaring](/privacy-policy) — AVG/GDPR-compliance

---

*Dit document wordt bijgewerkt wanneer er wijzigingen zijn in de klantenserviceprocedure, tools of contactgegevens.*
