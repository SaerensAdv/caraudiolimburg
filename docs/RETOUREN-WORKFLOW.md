# Retouren & Terugbetalingen Workflow — Car Audio Limburg

**Versie:** 1.0  
**Laatst bijgewerkt:** 22 februari 2026  
**Project:** caraudiolimburg.nl  
**Verantwoordelijke:** [INVULLEN: naam verantwoordelijke]

---

## 1. Overzicht

Dit document beschrijft de workflow voor het verwerken van retouren en terugbetalingen voor de Car Audio Limburg webshop. De procedure is opgesteld conform de Belgische en Nederlandse wetgeving inzake het **herroepingsrecht** (Wet Koop op Afstand).

### Wettelijk kader

- **Herroepingsrecht:** Consumenten hebben het recht om binnen **14 kalenderdagen** na ontvangst van het product de koop te herroepen, zonder opgave van reden (Europese Richtlijn 2011/83/EU).
- **Terugbetalingstermijn:** De verkoper is verplicht om het aankoopbedrag binnen **14 dagen** na ontvangst van de retourzending terug te betalen.
- **Uitzonderingen:** Op maat gemaakte producten en reeds geïnstalleerde producten zijn uitgesloten van het herroepingsrecht.
- **Meer informatie:** Zie [Algemene Voorwaarden](/voorwaarden) en [Privacyverklaring](/privacy-policy) op de website.

### Retourgegevens

| Gegeven | Waarde |
|---------|--------|
| Retour e-mailadres | [INVULLEN: bijv. retouren@caraudiolimburg.nl] |
| Retour verzendadres | [INVULLEN: straat, postcode, plaats] |
| Maximale reactietijd op retourverzoek | [INVULLEN: bijv. 2 werkdagen] |
| Retourperiode | 14 kalenderdagen na ontvangst |

---

## 2. Retourprocedure — Stap voor stap

### Stap 1: Klant dient retourverzoek in

**Kanaal:** E-mail naar [INVULLEN: retour e-mailadres] of via het contactformulier op de website.

**Verplichte informatie van de klant:**
- Ordernummer
- Naam en e-mailadres (zoals bij bestelling)
- Welk(e) product(en) geretourneerd worden
- Reden van retour (optioneel, maar nuttig voor kwaliteitsverbetering)

### Stap 2: Medewerker valideert het verzoek

Controleer de volgende punten:

| Controlepunt | Actie |
|-------------|-------|
| Bestelling gevonden in admin panel? | Zoek op ordernummer of klantnaam |
| Binnen retourperiode (14 dagen)? | Bereken vanaf leverdatum |
| Product uitgesloten van retour? | Zie sectie 4 (Bijzondere gevallen) |
| Product in originele staat? | Ongeopend, ongebruikt, originele verpakking |

**Bij goedkeuring:** Ga naar stap 3.  
**Bij afwijzing:** Stuur de klant een bericht met uitleg waarom het retourverzoek niet kan worden ingewilligd (zie template in sectie 5).

### Stap 3: Retourinstructies versturen naar klant

Stuur de klant een e-mail met de volgende informatie:

1. Bevestiging dat het retourverzoek is goedgekeurd
2. Retouradres: [INVULLEN: volledig adres]
3. Instructies voor het verpakken:
   - Gebruik de originele verpakking indien mogelijk
   - Voeg het ordernummer toe aan de buitenkant van het pakket
   - Zorg voor voldoende bescherming tijdens transport
4. Verzendwijze: de klant is verantwoordelijk voor de retourverzendkosten, tenzij het product defect is
5. Verwachte verwerkingstijd na ontvangst: [INVULLEN: bijv. 5 werkdagen]

### Stap 4: Product ontvangen en inspecteren

Bij ontvangst van het retourpakket:

1. **Registreer de ontvangst** — Noteer datum en staat van het pakket
2. **Inspecteer het product:**

| Inspectie | Criteria |
|-----------|----------|
| Verpakking | Origineel, onbeschadigd |
| Product | Ongebruikt, geen sporen van installatie |
| Accessoires | Alle onderdelen aanwezig (kabels, handleidingen, schroeven) |
| Serienummer | Komt overeen met het geleverde product |

3. **Documenteer de bevindingen** — Maak foto's bij eventuele schade

**Bij goede staat:** Ga naar stap 5 (volledige terugbetaling).  
**Bij schade of incompleet:** Zie sectie 4 (Bijzondere gevallen).

### Stap 5: Terugbetaling verwerken via Stripe

#### Optie A: Via Stripe Dashboard (aanbevolen)

1. Log in op [Stripe Dashboard](https://dashboard.stripe.com/)
2. Ga naar **Payments** (Betalingen)
3. Zoek de betaling op basis van ordernummer of klantnaam
4. Klik op de betreffende betaling
5. Klik op **Refund** (Terugbetalen)
6. Kies het bedrag:
   - **Volledig:** Bij retour in goede staat
   - **Gedeeltelijk:** Bij schade of ontbrekende onderdelen (voer het aangepaste bedrag in)
7. Voeg een reden toe (bijv. "Retour binnen herroepingsrecht")
8. Klik op **Refund** om te bevestigen

#### Optie B: Via Stripe API (voor developers)

```
POST /v1/refunds
{
  "payment_intent": "pi_XXXXXXXXXXXXXXXX",
  "amount": 4999,  // bedrag in centen (€49,99)
  "reason": "requested_by_customer"
}
```

**Geldige redenen:** `requested_by_customer`, `duplicate`, `fraudulent`

#### Verwerkingstijd terugbetaling

| Betaalmethode | Verwachte verwerkingstijd |
|---------------|--------------------------|
| Creditcard / debitcard | 5–10 werkdagen |
| Bancontact | 5–10 werkdagen |
| iDEAL | 5–10 werkdagen |

> **Let op:** Stripe brengt geen extra kosten in rekening voor refunds, maar de oorspronkelijke transactiekosten worden niet teruggestort.

### Stap 6: Orderstatus bijwerken in admin panel

1. Open het **admin panel** van de webshop
2. Ga naar **Bestellingen**
3. Zoek de betreffende bestelling op
4. Werk de status bij naar:
   - `geretourneerd` — bij volledige retour
   - `gedeeltelijk geretourneerd` — bij gedeeltelijke retour/refund
5. Voeg een interne notitie toe met:
   - Datum retourontvangst
   - Staat van het product
   - Refundbedrag
   - Stripe refund ID

### Stap 7: Bevestigingsmail naar klant

Stuur de klant een e-mail met:

1. Bevestiging dat het product is ontvangen en goedgekeurd
2. Het terugbetaalde bedrag
3. Verwachte verwerkingstijd van de terugbetaling
4. Stripe transactie-ID (optioneel)
5. Contactgegevens voor verdere vragen

---

## 3. Procesoverzicht

```
Klant dient retourverzoek in
         │
         ▼
Medewerker valideert verzoek
    │              │
    ▼              ▼
Goedgekeurd     Afgewezen → Klant informeren (met reden)
    │
    ▼
Retourinstructies verzonden
    │
    ▼
Product ontvangen & geïnspecteerd
    │              │
    ▼              ▼
Goede staat     Beschadigd/incompleet → Gedeeltelijke refund of afwijzing
    │
    ▼
Refund via Stripe (volledig/gedeeltelijk)
    │
    ▼
Orderstatus bijwerken in admin
    │
    ▼
Bevestigingsmail naar klant
```

---

## 4. Bijzondere gevallen

### 4.1 Geïnstalleerde producten

Producten die reeds in een voertuig zijn ingebouwd, komen **niet in aanmerking** voor retour. Dit geldt voor:

- Android navigatiesystemen die zijn aangesloten
- Speakers die zijn gemonteerd
- Versterkers die zijn bekabeld
- Camera's die zijn geïnstalleerd
- Alle producten die duidelijk sporen van installatie vertonen

**Uitzondering:** Als het product defect is of niet overeenkomt met de beschrijving, geldt de wettelijke garantie (ongeacht installatie).

**Communicatie naar klant:**
> Helaas kunnen wij dit product niet als retour accepteren omdat het reeds is geïnstalleerd. Geïnstalleerde producten zijn uitgesloten van het herroepingsrecht conform onze [Algemene Voorwaarden](/voorwaarden). Bij een defect product kunt u een beroep doen op de fabrieksgarantie.

### 4.2 Beschadigde producten

Bij producten die beschadigd zijn ontvangen door de klant:

1. Vraag de klant om foto's van de schade
2. Controleer de verzendverpakking op transportschade
3. Dien indien nodig een claim in bij de vervoerder
4. Bied de klant een volledige terugbetaling of vervanging aan

Bij producten die beschadigd worden geretourneerd door de klant:

1. Documenteer de schade met foto's
2. Informeer de klant over de schade
3. Bied een gedeeltelijke terugbetaling aan (met aftrek van waardevermindering)
4. De klant heeft het recht om het product terug te ontvangen als deze de aftrek niet accepteert

### 4.3 Ontbrekende onderdelen

Als bij een retour onderdelen ontbreken:

1. Informeer de klant welke onderdelen missen
2. Geef de klant de gelegenheid om de ontbrekende onderdelen alsnog op te sturen (termijn: 7 werkdagen)
3. Bij het uitblijven van de onderdelen: gedeeltelijke refund met aftrek van de kosten van de ontbrekende onderdelen

### 4.4 Defecte producten (garantie)

Defecte producten vallen onder de **wettelijke garantie** (minimaal 2 jaar in België/Nederland):

1. Klant neemt contact op met beschrijving van het defect
2. Controleer of het product nog onder garantie valt
3. Beoordeel of het defect kwalificeert (geen gebruikersfout)
4. Bied reparatie, vervanging of terugbetaling aan
5. Retourverzendkosten zijn voor rekening van Car Audio Limburg bij garantieclaims

---

## 5. E-mail templates

### Template: Retourverzoek goedgekeurd

> **Onderwerp:** Uw retourverzoek voor bestelling #[ORDERNUMMER] is goedgekeurd
>
> Beste [KLANTNAAM],
>
> Wij hebben uw retourverzoek ontvangen en goedgekeurd. Hieronder vindt u de instructies voor het retourneren van uw product.
>
> **Retouradres:**  
> [INVULLEN: bedrijfsnaam]  
> [INVULLEN: straat + huisnummer]  
> [INVULLEN: postcode + plaats]
>
> **Instructies:**
> - Verpak het product in de originele verpakking
> - Vermeld uw ordernummer (#[ORDERNUMMER]) op de buitenkant van het pakket
> - Verzend het pakket binnen 14 dagen na deze bevestiging
>
> Na ontvangst en inspectie verwerken wij uw terugbetaling binnen [INVULLEN: X] werkdagen.
>
> Met vriendelijke groet,  
> Car Audio Limburg

### Template: Retourverzoek afgewezen

> **Onderwerp:** Uw retourverzoek voor bestelling #[ORDERNUMMER]
>
> Beste [KLANTNAAM],
>
> Wij hebben uw retourverzoek beoordeeld. Helaas kunnen wij dit verzoek niet inwilligen vanwege de volgende reden:
>
> [INVULLEN: reden, bijv. "De retourperiode van 14 dagen is verstreken" / "Het product vertoont sporen van installatie"]
>
> Meer informatie over ons retourbeleid vindt u in onze [Algemene Voorwaarden](/voorwaarden).
>
> Heeft u vragen? Neem dan gerust contact met ons op.
>
> Met vriendelijke groet,  
> Car Audio Limburg

---

## 6. Administratie & registratie

Houd bij elke retour de volgende gegevens bij:

| Veld | Voorbeeld |
|------|-----------|
| Ordernummer | #CAL-2026-0042 |
| Klantnaam | Jan Jansen |
| Product(en) | Audison APK 165 |
| Retourdatum aangevraagd | 2026-02-15 |
| Retourdatum ontvangen | 2026-02-20 |
| Staat product | Goed / Beschadigd / Incompleet |
| Type refund | Volledig / Gedeeltelijk |
| Refundbedrag | €149,00 |
| Stripe refund ID | re_XXXXXXXXXXXXXX |
| Status | Afgehandeld |

---

## 7. Gerelateerde pagina's

- [Algemene Voorwaarden](/voorwaarden) — Bevat het volledige retourbeleid en herroepingsrecht
- [Privacyverklaring](/privacy-policy) — Informatie over de verwerking van persoonsgegevens
- [Stripe Dashboard](https://dashboard.stripe.com/) — Betalingen en refunds beheren
- Admin Panel — Bestellingen en orderstatus beheren

---

*Dit document wordt bijgewerkt wanneer er wijzigingen zijn in het retourbeleid of de werkwijze.*
