# Voorstel: VIN Lookup voor CarPlay Compatibiliteit

## Samenvatting

Een nieuwe functie waarmee klanten hun **chassisnummer (VIN)** kunnen invoeren om direct te zien welke CarPlay oplossingen beschikbaar zijn voor hun specifieke voertuig. Dit verhoogt conversie en vermindert offerteaanvragen voor niet-compatibele voertuigen.

---

## Hoe werkt het?

### Klantervaring

1. Klant bezoekt de CarPlay pagina
2. Voert chassisnummer (17 tekens) in
3. Systeem toont binnen 2 seconden:
   - Voertuiggegevens (merk, model, bouwjaar)
   - Huidige infotainment systeem
   - **Beschikbare CarPlay oplossingen met prijzen**
   - Direct "Offerte aanvragen" knop

### Voorbeeld

```
VIN: WBAPH5C55BA123456

✓ BMW 3-serie (F30) - 2018
✓ Infotainment: iDrive 6 NBT EVO

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
| **Hogere conversie** | Klant ziet direct wat mogelijk is |
| **Minder vragen** | Filtert niet-compatibele voertuigen vooraf |
| **Professionaliteit** | Geeft vertrouwen in expertise |
| **Lead kwaliteit** | Alleen serieuze, compatibele leads |
| **Tijdsbesparing** | Geen handmatig uitzoeken per aanvraag |

---

## Technische Implementatie

### VIN Decoder API

**Aanbevolen: Vincario (vindecoder.eu)**

| Aspect | Details |
|--------|---------|
| Dekking | Europa, 1981-heden |
| Responstijd | < 1 seconde |
| Data | Merk, model, bouwjaar, motor, uitrusting |
| GDPR | Volledig compliant |

### Kosten API

| Pakket | Lookups | Prijs | Per lookup |
|--------|---------|-------|------------|
| Gratis | 20 | €0 | €0 |
| Starter | 200 | €54 | €0.27 |
| Medium | 1.000 | €220 | €0.22 |
| Large | 5.000 | €900 | €0.18 |

**Geschatte maandelijkse kosten:** €54-€220 afhankelijk van volume

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
| 1 | 1 week | Compatibiliteitsdata verzamelen (jullie) |
| 2 | 2-3 dagen | API integratie + database opzet |
| 3 | 2-3 dagen | Frontend component bouwen |
| 4 | 1 dag | Testen + finetunen |
| **Totaal** | **~2 weken** | Afhankelijk van data-aanlevering |

---

## Investering

### Eenmalige kosten
- Ontwikkeling: **Inbegrepen in huidige project**

### Doorlopende kosten
- VIN API: **€54-€220/maand** (afhankelijk van volume)
- Geen andere doorlopende kosten

---

## Volgende stappen

1. **Bevestig interesse** in deze feature
2. **Lever compatibiliteitsdata aan** (zie bovenstaande template)
3. **Kies API pakket** (start met 200 lookups voor €54)
4. **Implementatie** door ontwikkelaar

---

## Vragen?

Neem contact op voor meer informatie of een demo van vergelijkbare implementaties.

---

*Document versie 1.0 - Januari 2026*
