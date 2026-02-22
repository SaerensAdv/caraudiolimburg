# Rollback Plan — Car Audio Limburg Webshop Go-Live

**Versie:** 1.0  
**Laatst bijgewerkt:** 22 februari 2026  
**Project:** caraudiolimburg.nl — Nieuwe webshop & installatieplatform  
**Verantwoordelijke:** [INVULLEN: naam developer]

---

## 1. Doel van dit document

Dit document beschrijft de volledige rollback-procedure voor het geval de go-live van de nieuwe Car Audio Limburg webshop niet succesvol verloopt. Het doel is om snel en gecontroleerd terug te kunnen schakelen naar de oude situatie, met minimale impact voor klanten en bedrijfsvoering.

---

## 2. Contactgegevens

| Rol | Naam | Telefoon | E-mail |
|-----|------|----------|--------|
| Klant (eigenaar) | [INVULLEN] | [INVULLEN] | [INVULLEN] |
| Developer | [INVULLEN] | [INVULLEN] | [INVULLEN] |
| Hosting provider (oud) | [INVULLEN] | [INVULLEN] | [INVULLEN] |
| Domeinregistrar | [INVULLEN] | [INVULLEN] | [INVULLEN] |

---

## 3. Pre-Go-Live Checklist

Voer onderstaande stappen uit **vóór** de DNS-cutover. Vink elk item af zodra het is afgerond.

| # | Actie | Status | Notities |
|---|-------|--------|----------|
| 3.1 | Database backup maken via Replit checkpoint | ☐ | Ga naar Replit → Database → maak een checkpoint/snapshot |
| 3.2 | Huidige DNS-instellingen noteren | ☐ | Noteer alle A-, AAAA-, CNAME-, MX- en TXT-records |
| 3.3 | Screenshot maken van huidige DNS-configuratie | ☐ | Bewaar als bewijs voor eventuele rollback |
| 3.4 | Verifiëren dat de oude site nog bereikbaar is | ☐ | Controleer via IP-adres of alternatief domein |
| 3.5 | Oude hosting niet opzeggen | ☐ | Houd de oude hosting minimaal 30 dagen actief na go-live |
| 3.6 | IP-adres van oude hosting noteren | ☐ | IP: [INVULLEN] |
| 3.7 | Replit deployment URL noteren | ☐ | URL: [INVULLEN] |
| 3.8 | Alle omgevingsvariabelen documenteren | ☐ | Stripe keys, Resend, Teamleader, etc. |
| 3.9 | Testbestelling plaatsen op nieuwe site | ☐ | Controleer volledige checkout flow |
| 3.10 | Go/No-Go beslissing nemen | ☐ | Alle bovenstaande items moeten afgevinkt zijn |

### DNS-instellingen vóór go-live (invullen)

| Record Type | Naam | Waarde (oud) | TTL |
|-------------|------|-------------|-----|
| A | @ | [INVULLEN] | [INVULLEN] |
| CNAME | www | [INVULLEN] | [INVULLEN] |
| MX | @ | [INVULLEN] | [INVULLEN] |
| TXT | @ | [INVULLEN] | [INVULLEN] |

---

## 4. Besliscriteria — Wanneer een rollback triggeren?

Een rollback wordt overwogen wanneer één of meer van de volgende situaties zich voordoen **na de go-live**:

| # | Criterium | Ernst | Actie |
|---|-----------|-------|-------|
| 4.1 | Website volledig onbereikbaar (> 30 minuten) | 🔴 Kritiek | Direct rollback starten |
| 4.2 | Betalingen via Stripe falen structureel | 🔴 Kritiek | Direct rollback starten |
| 4.3 | Klantgegevens worden niet correct opgeslagen | 🔴 Kritiek | Direct rollback starten |
| 4.4 | SSL-certificaat werkt niet na 4 uur | 🟡 Hoog | Onderzoeken, rollback na 8 uur |
| 4.5 | E-mails (orderbevestiging) worden niet verzonden | 🟡 Hoog | Onderzoeken, rollback na 24 uur |
| 4.6 | Producten tonen verkeerde prijzen | 🟡 Hoog | Direct corrigeren of rollback |
| 4.7 | Contactformulier of offerteformulier werkt niet | 🟠 Gemiddeld | Fix binnen 24 uur, anders rollback |
| 4.8 | Visuele problemen / layout issues | 🟢 Laag | Fix plannen, geen rollback nodig |
| 4.9 | SEO-redirects werken niet correct | 🟢 Laag | Fix plannen, geen rollback nodig |

**Vuistregel:** Bij elke situatie die **directe omzet of klantvertrouwen** schaadt, wordt een rollback gestart.

---

## 5. Rollback Procedure — DNS

**Doel:** Het domein `caraudiolimburg.nl` terugwijzen naar de oude hosting.

### Stappen:

1. **Log in bij de domeinregistrar**
   - URL: [INVULLEN: login URL domeinregistrar]
   - Account: [INVULLEN]

2. **Navigeer naar DNS-beheer** voor het domein `caraudiolimburg.nl`

3. **Wijzig het A-record:**
   - Naam: `@`
   - Type: `A`
   - Waarde: wijzig van Replit IP terug naar `[INVULLEN: oud IP-adres]`
   - TTL: zet op `300` (5 minuten) voor snellere propagatie

4. **Wijzig het CNAME-record (indien van toepassing):**
   - Naam: `www`
   - Type: `CNAME`
   - Waarde: wijzig terug naar `[INVULLEN: oude CNAME waarde]`

5. **Controleer MX-records:**
   - Zorg dat e-mail records niet zijn gewijzigd, of herstel naar de oorspronkelijke waarden

6. **Verwijder eventuele Replit-specifieke DNS-records**
   - Verwijder alleen records die specifiek voor de Replit-koppeling zijn toegevoegd

7. **Sla de wijzigingen op** en noteer het tijdstip

8. **Controleer de propagatie:**
   - Gebruik [whatsmydns.net](https://www.whatsmydns.net/) om te controleren of de DNS-wijzigingen wereldwijd doorkomen
   - Gebruik `nslookup caraudiolimburg.nl` of `dig caraudiolimburg.nl` om lokaal te controleren

### Tijdsinschatting DNS-propagatie

| Situatie | Verwachte tijd |
|----------|---------------|
| TTL was laag ingesteld (300s) | 5–30 minuten |
| TTL was standaard (3600s) | 1–4 uur |
| Worst case (cached bij ISP's) | Tot 48 uur |

> **Let op:** Tijdens de DNS-propagatie kan het voorkomen dat sommige bezoekers de nieuwe site zien en anderen de oude. Dit is normaal gedrag.

---

## 6. Rollback Procedure — Database

**Doel:** De database terugzetten naar de staat van vóór de go-live.

### Stappen:

1. **Open het Replit project** waarin de webshop draait

2. **Ga naar de Database-tool** in het Replit-dashboard (linker zijbalk → Database)

3. **Zoek het checkpoint** dat is gemaakt vóór de go-live (zie stap 3.1 van de pre-go-live checklist)

4. **Selecteer het checkpoint** en kies "Rollback" of "Restore"

5. **Bevestig de rollback** — let op: dit overschrijft alle data die na het checkpoint is toegevoegd

6. **Verifieer de data:**
   - Controleer of producten correct worden weergegeven
   - Controleer of bestaande bestellingen intact zijn
   - Controleer of gebruikersaccounts correct werken

7. **Herstart de applicatie** na de database rollback:
   - Ga naar het Replit project
   - Stop de huidige workflow
   - Start de workflow opnieuw via "Run"

### Belangrijke waarschuwingen

> ⚠️ **Dataverlies:** Alle bestellingen, registraties en wijzigingen die na het checkpoint zijn gedaan, gaan verloren bij een rollback. Noteer eventuele bestellingen die handmatig verwerkt moeten worden.

> ⚠️ **Stripe-betalingen:** Betalingen die via Stripe zijn verwerkt na het checkpoint staan nog steeds in het Stripe Dashboard. Deze moeten eventueel handmatig worden gerefund.

---

## 7. Rollback Procedure — Applicatiecode

**Doel:** De applicatiecode terugzetten naar de versie van vóór de go-live.

### Stappen:

1. **Open het Replit project**

2. **Gebruik Replit's versiegeschiedenis:**
   - Klik op het klok-icoon (History/Checkpoints) in de linker zijbalk
   - Zoek het checkpoint dat is gemaakt vóór de go-live wijzigingen

3. **Herstel het checkpoint:**
   - Selecteer het gewenste checkpoint
   - Kies "Restore" om de code terug te zetten

4. **Controleer of de applicatie opstart:**
   - Verifieer dat de workflow correct draait
   - Controleer de logs op fouten

5. **Test de basisfunctionaliteit:**
   - Homepage laadt correct
   - Producten worden weergegeven
   - Winkelwagen werkt
   - Contactformulier werkt

---

## 8. Communicatieplan

Bij een rollback moeten de volgende partijen worden geïnformeerd:

### 8.1 Directe communicatie (binnen 30 minuten na beslissing)

| # | Wie | Hoe | Bericht |
|---|-----|-----|---------|
| 1 | Klant (eigenaar) | Telefoon + e-mail | Situatie uitleggen, verwachte hersteltijd, impact op bedrijf |
| 2 | Developer | Intern | Rollback coördineren, oorzaak analyseren |

### 8.2 Vervolgcommunicatie (binnen 4 uur)

| # | Wie | Hoe | Bericht |
|---|-----|-----|---------|
| 3 | Hosting provider (oud) | E-mail/telefoon | Informeren dat verkeer tijdelijk terugkomt naar oude hosting |
| 4 | Klanten die besteld hebben | E-mail | Excuusbericht + statusupdate van hun bestelling |

### 8.3 Template communicatie naar klant (eigenaar)

> **Onderwerp:** Update go-live caraudiolimburg.nl
>
> Beste [INVULLEN: naam klant],
>
> We hebben besloten om de lancering van de nieuwe webshop tijdelijk terug te draaien vanwege [INVULLEN: reden]. De oude website is weer bereikbaar via caraudiolimburg.nl.
>
> **Wat betekent dit?**
> - De oude website is weer actief (dit kan tot 48 uur duren voor alle bezoekers)
> - Eventuele bestellingen op de nieuwe site zijn veilig en worden handmatig afgehandeld
> - We werken aan een oplossing en plannen een nieuwe go-live datum
>
> **Verwachte nieuwe go-live:** [INVULLEN: datum]
>
> Met vriendelijke groet,
> [INVULLEN: naam developer]

---

## 9. Na de rollback

| # | Actie | Verantwoordelijke | Deadline |
|---|-------|-------------------|----------|
| 9.1 | Root cause analyse uitvoeren | Developer | Binnen 24 uur |
| 9.2 | Handmatige verwerking van eventuele bestellingen | Klant + Developer | Binnen 48 uur |
| 9.3 | Stripe-betalingen controleren en eventueel refunden | Klant | Binnen 48 uur |
| 9.4 | Probleem oplossen in test/staging omgeving | Developer | [INVULLEN: termijn] |
| 9.5 | Nieuwe go-live datum plannen | Klant + Developer | Na succesvolle fix |
| 9.6 | Verbeterd rollback plan opstellen (indien nodig) | Developer | Vóór nieuwe go-live |

---

## 10. Samenvatting rollback-volgorde

Bij een kritiek probleem, voer deze stappen in volgorde uit:

1. ✅ **Beslissing nemen** — Bevestig dat rollback noodzakelijk is (zie sectie 4)
2. 📞 **Klant informeren** — Bel de klant en leg de situatie uit
3. 🌐 **DNS terugzetten** — Wijzig DNS-records terug naar oude hosting (sectie 5)
4. 💾 **Database rollback** — Herstel database checkpoint indien nodig (sectie 6)
5. 🔧 **Code rollback** — Herstel code checkpoint indien nodig (sectie 7)
6. ✅ **Verificatie** — Controleer of de oude site correct werkt
7. 📧 **Communicatie** — Informeer alle betrokken partijen (sectie 8)
8. 📋 **Documentatie** — Leg de oorzaak en genomen acties vast (sectie 9)

---

*Dit document wordt bijgewerkt wanneer er wijzigingen zijn in de infrastructuur of het go-live proces.*
