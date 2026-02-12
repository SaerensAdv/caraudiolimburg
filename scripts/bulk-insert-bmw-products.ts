import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const CATEGORY_ID = 'cdd86b37-3d93-4e2b-9a59-1c07fce70f67';
const IMAGE_URL = 'https://caraudiolimburg.nl/wp-content/uploads/UI1-206-32.jpg';
const OLD_PRODUCT_ID = '5de2e3ed-cb4e-442b-863a-e84eeacea6f8';

function calcPrice(wholesaleUSD: number): number {
  return Math.round((wholesaleUSD * 0.925 * 1.85) / 10) * 10 - 1;
}

const BOX_CONTENT = JSON.stringify([
  "1× Android IPS touchscreen",
  "1× Voedingskabel",
  "1× GPS antenne",
  "1× 4G antenne",
  "1× Dubbele USB-kabel (met microfooningang)",
  "1× RCA kabel (DVR/TV-in)",
  "1× AUX kabel",
  "1× Installatiehandleiding"
]);

const ACCESSORIES = JSON.stringify([
  { name: "Achteruitrijcamera", type: "camera", description: "Optionele achteruitrijcamera voor extra veiligheid bij het parkeren" },
  { name: "Dashcam / DVR Camera", type: "camera", description: "Optionele dashcam die direct verbonden kan worden met het Android scherm" },
  { name: "4G SIM-kaart", type: "connectiviteit", description: "Plaats een 4G SIM-kaart voor directe internettoegang zonder telefoon" }
]);

const FEATURES = [
  'Qualcomm Snapdragon 685 Octa-core processor (6nm, 2.8 GHz)',
  'Android 14 besturingssysteem',
  'IPS HD 1920×720P Touchscreen',
  'Draadloze Apple CarPlay & Android Auto',
  'BMW ID9 / ID8 / ID7 gebruikersinterface (vrij wisselbaar)',
  'GPS Navigatie (Google Maps, Waze, iGo, Sygic, HERE)',
  'Bluetooth 5.1 handsfree & A2DP muziekstreaming',
  'WiFi & 4G LTE connectiviteit (met SIM-kaart slot)',
  'Behoudt ALLE originele autofuncties (Radio, iDrive, Camera, etc.)',
  'iDrive draaiknop & stuurwielbediening volledig compatibel',
  '4K video, PIP (Picture-in-Picture) & Split Screen',
  'Plug & Play installatie zonder functieverlies',
  '8GB RAM + 128GB/256GB opslag (Samsung UMCP)',
  'OEM microfoon ondersteuning voor CarPlay/Android Auto',
  'BMW CAN-bus integratie'
];

function makeOverview(modelsText: string): string {
  return `Plug & Play – Behoudt ALLE originele functies:

Dit Android scherm vervangt enkel het originele display, maar de originele radio head unit blijft in de auto. Hierdoor blijven ALLE originele functies behouden: Radio, CD/DVD, Bluetooth, Versterker, Stuurwielbediening, iDrive, navigatie, originele achteruitrijcamera, parkeersensoren en meer. Geen functieverlies, gewoon meer mogelijkheden.

Qualcomm Snapdragon 685 Octa-core Processor:

Het systeem is uitgerust met de nieuwste Qualcomm Snapdragon 685 (SM6225) processor, gebouwd op Samsung 6nm technologie. Met 4× A73 kernen op 2.8 GHz en 4× A53 kernen op 1.9 GHz biedt deze chip 60% meer prestaties dan de oudere Snapdragon 662 en 450 chipsets. De Adreno 610 GPU op 1260 MHz zorgt voor vloeiende 3D-graphics en 4K video.

BMW ID9 Gebruikersinterface:

Dit Android scherm wordt geleverd met de nieuwste BMW ID9 gebruikersinterface (sinds november 2024). Daarnaast zijn ook de ID8, ID7 en ID6 interfaces beschikbaar. U kunt vrij wisselen tussen de interfaces via het instellingenmenu, zonder firmware-update.

Android 14 met 8GB RAM:

Met 8GB RAM en tot 256GB opslagruimte draait het systeem uiterst soepel. Apps starten snel, de bediening reageert direct en multitasking gaat vloeiend. Geen vertragingen, zelfs niet bij intensief gebruik van navigatie, muziek en telefonie tegelijk.

Draadloze Apple CarPlay & Android Auto:

Verbind uw telefoon draadloos met het scherm voor navigatie, bellen, berichten en muziek. Bedienbaar via het touchscreen, de iDrive draaiknop of spraakbesturing. Compatibel met iPhone 6 en nieuwer (draadloos CarPlay) en Android-telefoons met draadloze Android Auto ondersteuning.

GPS Turn-by-Turn Navigatie:

Ondersteunt populaire navigatie-apps zoals Google Maps, Waze, Sygic, HERE en iGO. Zowel online als offline navigatie is mogelijk. Bij offline gebruik wordt de kaartdata gelezen vanaf de SD-kaart, dus geen internetverbinding nodig.

Bluetooth 5.1 & A2DP:

Stream muziek van Spotify, Apple Music of andere apps via Bluetooth naar uw autoluidsprekers. Maak handsfree telefoongesprekken tijdens het rijden. De originele Bluetooth-functie van de auto blijft ook behouden.

WiFi & 4G LTE Connectiviteit:

Maak verbinding met internet via uw smartphone-hotspot of een WiFi-router. Het systeem beschikt ook over een 4G SIM-kaart slot, waarmee u rechtstreeks toegang heeft tot internet zonder afhankelijk te zijn van uw telefoon.

4K Video & Split Screen:

Het scherm ondersteunt 4K videoweergave en biedt PIP (Picture-in-Picture) en split screen functionaliteit. Bekijk bijvoorbeeld navigatie en muziek naast elkaar op het scherm.

Geschikt voor deze modellen:

${modelsText}`;
}

function makeSpecs(screenSize: string, compatible: string, system: string) {
  return JSON.stringify({
    processor: "Qualcomm Snapdragon 685 (SM6225) Octa-core",
    cpuKernen: "4× A73 (2.8 GHz) + 4× A53 (1.9 GHz)",
    gpu: "Adreno 610 (1260 MHz), 3D acceleratie",
    processTechnologie: "Samsung 6nm LPP",
    besturingssysteem: "Android 14",
    schermformaat: `${screenSize} inch IPS`,
    resolutie: "1920×720P HD",
    schermType: "Anti-Reflection (standaard) / Anti-Glare (optioneel)",
    ram: "8GB LPDDR4x",
    opslag: "128GB / 256GB (Samsung UMCP eMMC 5.1)",
    bluetooth: "5.1 met A2DP",
    wifi: "Ingebouwd WiFi",
    "4g": "4G LTE met SIM-kaart slot",
    "4gBandenEuropa": "FDD-LTE: B1/B3/B5/B7/B8, TDD-LTE: B38/B39/B40/B41",
    carplay: "Draadloos Apple CarPlay & Android Auto (Zlink)",
    gps: "Ingebouwde high-sensitivity GPS ontvanger",
    usb: "2× USB poort (max 64GB), 1× microfooningang",
    sdKaart: "1× SD-kaart slot (max 32GB)",
    audioFormaten: "MP3, WMA, FLAC, APE, AAC",
    videoFormaten: "H264, MP4, AVI, RMVB, FLV, MKV, 4K",
    videoFuncties: "4K video, PIP (Picture-in-Picture), Split Screen",
    compatibel: compatible,
    systeem: system,
    stuur: "Left Hand Drive (LHD)",
    interface: "BMW ID9 / ID8 / ID7 / ID6 (vrij wisselbaar)",
    microfoon: "Ingebouwde microfoon + OEM microfoon ondersteuning",
    canbus: "BMW CAN-bus integratie",
    iDrive: "Volledig compatibel met iDrive bediening",
    parkeren: "Parkeersensoren / trajectweergave ondersteuning"
  });
}

function makeDescription(screenSizes: string, fullModel: string, systemCompat: string): string {
  return `${screenSizes} Android 14 navigatiesysteem speciaal ontwikkeld voor de ${fullModel}. ${systemCompat}.

Dit premium Android scherm vervangt het originele display, maar behoudt de originele radio head unit. Hierdoor blijven ALLE originele functies behouden: Radio, CD/DVD, Bluetooth, Versterker, Stuurwielbediening, iDrive, navigatie, achteruitrijcamera en parkeersensoren. Plug & Play installatie zonder functieverlies.

Aangedreven door de Qualcomm Snapdragon 685 octa-core processor (6nm, 2.8 GHz) met 8GB RAM en tot 256GB opslag. Het IPS HD scherm met 1920×720P resolutie biedt een scherp en helder beeld, beschikbaar als Anti-Reflection of Anti-Glare uitvoering.

Voorzien van draadloze Apple CarPlay en Android Auto, GPS navigatie (Google Maps, Waze, iGO), Bluetooth 5.1 met A2DP streaming, WiFi en 4G LTE. Het systeem draait de nieuwste BMW ID9 gebruikersinterface en is volledig compatibel met de iDrive draaiknop.

Belangrijkste kenmerken:
- Qualcomm Snapdragon 685 Octa-core (6nm, 2.8 GHz)
- Android 14 met 8GB RAM + 128GB/256GB opslag
- ${screenSizes} IPS HD 1920×720P touchscreen
- Draadloze Apple CarPlay & Android Auto
- BMW ID9 / ID8 / ID7 interface (vrij wisselbaar)
- GPS navigatie (online & offline)
- Bluetooth 5.1, WiFi & 4G LTE
- Behoudt ALLE originele autofuncties
- iDrive & stuurwielbediening volledig compatibel
- 4K video, PIP & Split Screen
- Plug & Play installatie`;
}

interface Variation {
  label: string;
  wholesaleUSD: number;
  isDefault: boolean;
  sortOrder: number;
}

interface ProductDef {
  name: string;
  slug: string;
  sku: string;
  screenSizes: string;
  shortModel: string;
  fullModel: string;
  systemCompat: string;
  modelsText: string;
  compatible: string;
  system: string;
  specScreenSize: string;
  variations: Variation[];
}

const products: ProductDef[] = [
  {
    name: "BMW 1-Serie E87 Android Navigatie",
    slug: "bmw-1-serie-e87-android-navigatie",
    sku: "CAL-BMW-E87",
    screenSizes: "10.25\" / 12.3\"",
    shortModel: "BMW 1-Serie E87 (2006-2012)",
    fullModel: "BMW 1-Serie E87 (2006-2012)",
    systemCompat: "Geschikt voor auto's met origineel CIC systeem (LVDS 4 PIN) of zonder origineel scherm (met iDrive)",
    modelsText: "Dit navigatiesysteem is specifiek ontworpen voor de BMW 1-Serie E87 (2006-2012) met origineel CIC systeem of zonder origineel scherm (met iDrive). Beschikbaar in 10.25\" en 12.3\" schermformaat. Left Hand Drive.",
    compatible: "BMW 1-Serie E87 (2006-2012)",
    system: "CIC (LVDS 4 PIN) / zonder origineel scherm (met iDrive)",
    specScreenSize: "10.25 / 12.3",
    variations: [
      { label: '10.25" - 8GB+128GB / Anti-Reflection', wholesaleUSD: 340, isDefault: true, sortOrder: 0 },
      { label: '10.25" - 8GB+256GB / Anti-Reflection', wholesaleUSD: 370, isDefault: false, sortOrder: 1 },
      { label: '10.25" - 8GB+128GB / Anti-Glare', wholesaleUSD: 370, isDefault: false, sortOrder: 2 },
      { label: '10.25" - 8GB+256GB / Anti-Glare', wholesaleUSD: 400, isDefault: false, sortOrder: 3 },
      { label: '12.3" - 8GB+128GB / Anti-Reflection', wholesaleUSD: 370, isDefault: false, sortOrder: 4 },
      { label: '12.3" - 8GB+256GB / Anti-Reflection', wholesaleUSD: 400, isDefault: false, sortOrder: 5 },
      { label: '12.3" - 8GB+128GB / Anti-Glare', wholesaleUSD: 400, isDefault: false, sortOrder: 6 },
      { label: '12.3" - 8GB+256GB / Anti-Glare', wholesaleUSD: 430, isDefault: false, sortOrder: 7 },
    ]
  },
  {
    name: "BMW 2-Serie Android Navigatie",
    slug: "bmw-2-serie-android-navigatie",
    sku: "CAL-BMW-F22",
    screenSizes: "8.8\" / 12.3\"",
    shortModel: "BMW 2-Serie F22/F45/F46 (2013-2018)",
    fullModel: "BMW 2-Serie F22 Coupé, F45 Active Tourer en F46 Gran Tourer (2013-2016) en BMW 2-Serie (2018) met EVO systeem",
    systemCompat: "Geschikt voor auto's met origineel NBT systeem (LVDS 6 PIN) en EVO systeem (LVDS 6 PIN)",
    modelsText: "Dit navigatiesysteem is ontworpen voor de BMW 2-Serie F22 Coupé, F45 Active Tourer en F46 Gran Tourer (2013-2016) met origineel NBT systeem, en de BMW 2-Serie (2018) met EVO systeem. Beschikbaar in 8.8\" en 12.3\" schermformaat. Left Hand Drive.",
    compatible: "BMW 2-Serie F22/F45/F46 (2013-2016), BMW 2-Serie (2018, EVO)",
    system: "NBT (LVDS 6 PIN) / EVO (LVDS 6 PIN)",
    specScreenSize: "8.8 / 12.3",
    variations: [
      { label: '8.8" - 8GB+128GB / Anti-Reflection', wholesaleUSD: 340, isDefault: true, sortOrder: 0 },
      { label: '8.8" - 8GB+256GB / Anti-Reflection', wholesaleUSD: 370, isDefault: false, sortOrder: 1 },
      { label: '8.8" - 8GB+128GB / Anti-Glare', wholesaleUSD: 370, isDefault: false, sortOrder: 2 },
      { label: '8.8" - 8GB+256GB / Anti-Glare', wholesaleUSD: 400, isDefault: false, sortOrder: 3 },
      { label: '12.3" - 8GB+128GB / Anti-Reflection', wholesaleUSD: 355, isDefault: false, sortOrder: 4 },
      { label: '12.3" - 8GB+256GB / Anti-Reflection', wholesaleUSD: 385, isDefault: false, sortOrder: 5 },
      { label: '12.3" - 8GB+128GB / Anti-Glare', wholesaleUSD: 385, isDefault: false, sortOrder: 6 },
      { label: '12.3" - 8GB+256GB / Anti-Glare', wholesaleUSD: 415, isDefault: false, sortOrder: 7 },
    ]
  },
  {
    name: "BMW 3-Serie E90 Android Navigatie",
    slug: "bmw-3-serie-e90-android-navigatie",
    sku: "CAL-BMW-E90",
    screenSizes: "10.25\"",
    shortModel: "BMW 3-Serie E90/E91/E92/E93 (2006-2012)",
    fullModel: "BMW 3-Serie E90, E91, E92 en E93 (2006-2012)",
    systemCompat: "Geschikt voor auto's met origineel CCC systeem (LVDS 10 PIN), CIC systeem (LVDS 4 PIN) of zonder origineel scherm (met iDrive). Let op: voor CCC modellen is een AUX-aansluiting vereist",
    modelsText: "Dit navigatiesysteem is ontworpen voor de BMW 3-Serie E90, E91, E92 en E93 (2006-2012). Geschikt voor auto's met origineel CCC systeem (LVDS 10 PIN), CIC systeem (LVDS 4 PIN) of zonder origineel scherm (met iDrive). Left Hand Drive. Let op: voor CCC modellen is een AUX-aansluiting vereist.",
    compatible: "BMW 3-Serie E90/E91/E92/E93 (2006-2012)",
    system: "CCC (LVDS 10 PIN) / CIC (LVDS 4 PIN) / zonder origineel scherm",
    specScreenSize: "10.25",
    variations: [
      { label: '10.25" - 8GB+128GB / Anti-Reflection', wholesaleUSD: 345, isDefault: true, sortOrder: 0 },
      { label: '10.25" - 8GB+256GB / Anti-Reflection', wholesaleUSD: 375, isDefault: false, sortOrder: 1 },
      { label: '10.25" - 8GB+128GB / Anti-Glare', wholesaleUSD: 375, isDefault: false, sortOrder: 2 },
      { label: '10.25" - 8GB+256GB / Anti-Glare', wholesaleUSD: 405, isDefault: false, sortOrder: 3 },
    ]
  },
  {
    name: "BMW 3/4-Serie F30 Android Navigatie",
    slug: "bmw-3-4-serie-f30-android-navigatie",
    sku: "CAL-BMW-F30",
    screenSizes: "10.25\" / 12.3\"",
    shortModel: "BMW 3-Serie F30 & 4-Serie F32 (2013-2016)",
    fullModel: "BMW 3-Serie F30, F31 Touring, F34 GT en F35 (2013-2016) en BMW 4-Serie F32 Coupé, F33 Cabrio en F36 Gran Coupé (2013-2016)",
    systemCompat: "Geschikt voor auto's met origineel NBT systeem (LVDS 6 PIN)",
    modelsText: "Dit navigatiesysteem is ontworpen voor de BMW 3-Serie F30, F31 Touring, F34 GT en F35 (2013-2016) en de BMW 4-Serie F32 Coupé, F33 Cabrio en F36 Gran Coupé (2013-2016) met origineel NBT systeem (LVDS 6 PIN). Beschikbaar in 10.25\" en 12.3\" schermformaat. Left Hand Drive.",
    compatible: "BMW 3-Serie F30/F31/F34/F35 (2013-2016), BMW 4-Serie F32/F33/F36 (2013-2016)",
    system: "NBT (LVDS 6 PIN)",
    specScreenSize: "10.25 / 12.3",
    variations: [
      { label: '10.25" - 8GB+128GB / Anti-Reflection', wholesaleUSD: 340, isDefault: true, sortOrder: 0 },
      { label: '10.25" - 8GB+256GB / Anti-Reflection', wholesaleUSD: 370, isDefault: false, sortOrder: 1 },
      { label: '10.25" - 8GB+128GB / Anti-Glare', wholesaleUSD: 370, isDefault: false, sortOrder: 2 },
      { label: '10.25" - 8GB+256GB / Anti-Glare', wholesaleUSD: 400, isDefault: false, sortOrder: 3 },
      { label: '12.3" - 8GB+128GB / Anti-Reflection', wholesaleUSD: 350, isDefault: false, sortOrder: 4 },
      { label: '12.3" - 8GB+256GB / Anti-Reflection', wholesaleUSD: 380, isDefault: false, sortOrder: 5 },
      { label: '12.3" - 8GB+128GB / Anti-Glare', wholesaleUSD: 380, isDefault: false, sortOrder: 6 },
      { label: '12.3" - 8GB+256GB / Anti-Glare', wholesaleUSD: 410, isDefault: false, sortOrder: 7 },
    ]
  },
  {
    name: "BMW 3/4-Serie EVO Android Navigatie",
    slug: "bmw-3-4-serie-evo-android-navigatie",
    sku: "CAL-BMW-F30-EVO",
    screenSizes: "10.25\" / 12.3\"",
    shortModel: "BMW 3-Serie (2018+) & 4-Serie (2017+) EVO",
    fullModel: "BMW 3-Serie (2018+) en BMW 4-Serie (2017+) met EVO systeem",
    systemCompat: "Geschikt voor auto's met origineel EVO systeem (LVDS 6 PIN). Let op: het originele touchscreen werkt niet meer na installatie",
    modelsText: "Dit navigatiesysteem is ontworpen voor de BMW 3-Serie (2018+) en BMW 4-Serie (2017+) met origineel EVO systeem (LVDS 6 PIN). Let op: het originele touchscreen werkt niet meer na installatie. Left Hand Drive.",
    compatible: "BMW 3-Serie (2018+), BMW 4-Serie (2017+)",
    system: "EVO (LVDS 6 PIN)",
    specScreenSize: "10.25 / 12.3",
    variations: [
      { label: '10.25" - 8GB+128GB / Anti-Reflection', wholesaleUSD: 350, isDefault: true, sortOrder: 0 },
      { label: '10.25" - 8GB+256GB / Anti-Reflection', wholesaleUSD: 380, isDefault: false, sortOrder: 1 },
      { label: '10.25" - 8GB+128GB / Anti-Glare', wholesaleUSD: 380, isDefault: false, sortOrder: 2 },
      { label: '10.25" - 8GB+256GB / Anti-Glare', wholesaleUSD: 410, isDefault: false, sortOrder: 3 },
      { label: '12.3" - 8GB+128GB / Anti-Reflection', wholesaleUSD: 370, isDefault: false, sortOrder: 4 },
      { label: '12.3" - 8GB+256GB / Anti-Reflection', wholesaleUSD: 400, isDefault: false, sortOrder: 5 },
      { label: '12.3" - 8GB+128GB / Anti-Glare', wholesaleUSD: 400, isDefault: false, sortOrder: 6 },
      { label: '12.3" - 8GB+256GB / Anti-Glare', wholesaleUSD: 430, isDefault: false, sortOrder: 7 },
    ]
  },
  {
    name: "BMW 5-Serie E60 Android Navigatie",
    slug: "bmw-5-serie-e60-android-navigatie",
    sku: "CAL-BMW-E60",
    screenSizes: "10.25\"",
    shortModel: "BMW 5-Serie E60/E61 (2005-2010)",
    fullModel: "BMW 5-Serie E60 en E61 Touring (2005-2010)",
    systemCompat: "Geschikt voor auto's met origineel CCC systeem (LVDS 10 PIN, 2005-2008) en CIC systeem (LVDS 4 PIN, 2009-2010). Let op: voor CCC modellen is een AUX-aansluiting vereist",
    modelsText: "Dit navigatiesysteem is ontworpen voor de BMW 5-Serie E60 en E61 Touring (2005-2010). Geschikt voor auto's met origineel CCC systeem (LVDS 10 PIN, 2005-2008) en CIC systeem (LVDS 4 PIN, 2009-2010). Left Hand Drive. Let op: voor CCC modellen is een AUX-aansluiting vereist.",
    compatible: "BMW 5-Serie E60/E61 (2005-2010)",
    system: "CCC (LVDS 10 PIN) / CIC (LVDS 4 PIN)",
    specScreenSize: "10.25",
    variations: [
      { label: '10.25" - 8GB+128GB / Anti-Reflection', wholesaleUSD: 340, isDefault: true, sortOrder: 0 },
      { label: '10.25" - 8GB+256GB / Anti-Reflection', wholesaleUSD: 370, isDefault: false, sortOrder: 1 },
      { label: '10.25" - 8GB+128GB / Anti-Glare', wholesaleUSD: 370, isDefault: false, sortOrder: 2 },
      { label: '10.25" - 8GB+256GB / Anti-Glare', wholesaleUSD: 400, isDefault: false, sortOrder: 3 },
    ]
  },
  {
    name: "BMW 5-Serie F10 Android Navigatie",
    slug: "bmw-5-serie-f10-android-navigatie",
    sku: "CAL-BMW-F10",
    screenSizes: "10.25\" / 12.3\"",
    shortModel: "BMW 5-Serie F10/F11 (2011-2016)",
    fullModel: "BMW 5-Serie F10 Sedan en F11 Touring (2011-2016)",
    systemCompat: "Geschikt voor auto's met origineel CIC systeem (LVDS 4 PIN, 2011-2012) en NBT systeem (LVDS 6 PIN, 2013-2016)",
    modelsText: "Dit navigatiesysteem is ontworpen voor de BMW 5-Serie F10 Sedan en F11 Touring (2011-2016). Geschikt voor auto's met origineel CIC systeem (LVDS 4 PIN, 2011-2012) en NBT systeem (LVDS 6 PIN, 2013-2016). Beschikbaar in 10.25\" en 12.3\" schermformaat. Left Hand Drive.",
    compatible: "BMW 5-Serie F10/F11 (2011-2016)",
    system: "CIC (LVDS 4 PIN) / NBT (LVDS 6 PIN)",
    specScreenSize: "10.25 / 12.3",
    variations: [
      { label: '10.25" - 8GB+128GB / Anti-Reflection', wholesaleUSD: 340, isDefault: true, sortOrder: 0 },
      { label: '10.25" - 8GB+256GB / Anti-Reflection', wholesaleUSD: 370, isDefault: false, sortOrder: 1 },
      { label: '10.25" - 8GB+128GB / Anti-Glare', wholesaleUSD: 370, isDefault: false, sortOrder: 2 },
      { label: '10.25" - 8GB+256GB / Anti-Glare', wholesaleUSD: 400, isDefault: false, sortOrder: 3 },
      { label: '12.3" - 8GB+128GB / Anti-Reflection', wholesaleUSD: 355, isDefault: false, sortOrder: 4 },
      { label: '12.3" - 8GB+256GB / Anti-Reflection', wholesaleUSD: 385, isDefault: false, sortOrder: 5 },
      { label: '12.3" - 8GB+128GB / Anti-Glare', wholesaleUSD: 385, isDefault: false, sortOrder: 6 },
      { label: '12.3" - 8GB+256GB / Anti-Glare', wholesaleUSD: 415, isDefault: false, sortOrder: 7 },
    ]
  },
  {
    name: "BMW 5-Serie F07 GT Android Navigatie",
    slug: "bmw-5-serie-f07-gt-android-navigatie",
    sku: "CAL-BMW-F07",
    screenSizes: "10.25\"",
    shortModel: "BMW 5-Serie F07 GT (2011-2017)",
    fullModel: "BMW 5-Serie F07 Gran Turismo (2011-2017)",
    systemCompat: "Geschikt voor auto's met origineel CIC systeem (LVDS 4 PIN, 2011-2012) en NBT systeem (LVDS 6 PIN, 2013-2017)",
    modelsText: "Dit navigatiesysteem is ontworpen voor de BMW 5-Serie F07 Gran Turismo (2011-2017). Geschikt voor auto's met origineel CIC systeem (LVDS 4 PIN, 2011-2012) en NBT systeem (LVDS 6 PIN, 2013-2017). Schermformaat: 10.25\". Left Hand Drive.",
    compatible: "BMW 5-Serie F07 GT (2011-2017)",
    system: "CIC (LVDS 4 PIN) / NBT (LVDS 6 PIN)",
    specScreenSize: "10.25",
    variations: [
      { label: '8GB+128GB / Anti-Reflection scherm', wholesaleUSD: 340, isDefault: true, sortOrder: 0 },
      { label: '8GB+256GB / Anti-Reflection scherm', wholesaleUSD: 370, isDefault: false, sortOrder: 1 },
      { label: '8GB+128GB / Anti-Glare scherm', wholesaleUSD: 370, isDefault: false, sortOrder: 2 },
      { label: '8GB+256GB / Anti-Glare scherm', wholesaleUSD: 400, isDefault: false, sortOrder: 3 },
    ]
  },
  {
    name: "BMW 5-Serie G30 Android Navigatie",
    slug: "bmw-5-serie-g30-android-navigatie",
    sku: "CAL-BMW-G30",
    screenSizes: "10.25\"",
    shortModel: "BMW 5-Serie G30 (2017+)",
    fullModel: "BMW 5-Serie G30 (2017+)",
    systemCompat: "Geschikt voor auto's met origineel EVO systeem (LVDS 6 PIN). Let op: het originele touchscreen werkt niet meer na installatie",
    modelsText: "Dit navigatiesysteem is ontworpen voor de BMW 5-Serie G30 (2017+) met origineel EVO systeem (LVDS 6 PIN). Let op: het originele touchscreen werkt niet meer na installatie. Schermformaat: 10.25\". Left Hand Drive.",
    compatible: "BMW 5-Serie G30 (2017+)",
    system: "EVO (LVDS 6 PIN)",
    specScreenSize: "10.25",
    variations: [
      { label: '8GB+128GB / Anti-Reflection scherm', wholesaleUSD: 370, isDefault: true, sortOrder: 0 },
      { label: '8GB+256GB / Anti-Reflection scherm', wholesaleUSD: 400, isDefault: false, sortOrder: 1 },
      { label: '8GB+128GB / Anti-Glare scherm', wholesaleUSD: 400, isDefault: false, sortOrder: 2 },
      { label: '8GB+256GB / Anti-Glare scherm', wholesaleUSD: 430, isDefault: false, sortOrder: 3 },
    ]
  },
  {
    name: "BMW 6-Serie Android Navigatie",
    slug: "bmw-6-serie-android-navigatie",
    sku: "CAL-BMW-F06",
    screenSizes: "10.25\"",
    shortModel: "BMW 6-Serie F06/F12 (2010-2017)",
    fullModel: "BMW 6-Serie F06 Gran Coupé en F12 Cabrio (2010-2017)",
    systemCompat: "Geschikt voor auto's met origineel CIC systeem (LVDS 4 PIN, 2010-2012) en NBT systeem (LVDS 6 PIN, 2013-2017)",
    modelsText: "Dit navigatiesysteem is ontworpen voor de BMW 6-Serie F06 Gran Coupé en F12 Cabrio (2010-2017). Geschikt voor auto's met origineel CIC systeem (LVDS 4 PIN, 2010-2012) en NBT systeem (LVDS 6 PIN, 2013-2017). Schermformaat: 10.25\". Left Hand Drive.",
    compatible: "BMW 6-Serie F06 Gran Coupé / F12 Cabrio (2010-2017)",
    system: "CIC (LVDS 4 PIN) / NBT (LVDS 6 PIN)",
    specScreenSize: "10.25",
    variations: [
      { label: '8GB+128GB / Anti-Reflection scherm', wholesaleUSD: 510, isDefault: true, sortOrder: 0 },
      { label: '8GB+256GB / Anti-Reflection scherm', wholesaleUSD: 540, isDefault: false, sortOrder: 1 },
      { label: '8GB+128GB / Anti-Glare scherm', wholesaleUSD: 540, isDefault: false, sortOrder: 2 },
      { label: '8GB+256GB / Anti-Glare scherm', wholesaleUSD: 570, isDefault: false, sortOrder: 3 },
    ]
  },
  {
    name: "BMW 7-Serie F01 Android Navigatie",
    slug: "bmw-7-serie-f01-android-navigatie",
    sku: "CAL-BMW-F01",
    screenSizes: "10.25\"",
    shortModel: "BMW 7-Serie F01/F02 (2009-2017)",
    fullModel: "BMW 7-Serie F01 en F02 (2009-2017)",
    systemCompat: "Geschikt voor auto's met origineel CIC systeem (LVDS 4 PIN, 2009-2012) en NBT systeem (LVDS 6 PIN, 2013-2017). Uitsluitend geschikt voor Left Hand Drive",
    modelsText: "Dit navigatiesysteem is ontworpen voor de BMW 7-Serie F01 en F02 (2009-2017). Geschikt voor auto's met origineel CIC systeem (LVDS 4 PIN, 2009-2012) en NBT systeem (LVDS 6 PIN, 2013-2017). Uitsluitend geschikt voor Left Hand Drive. Schermformaat: 10.25\".",
    compatible: "BMW 7-Serie F01/F02 (2009-2017)",
    system: "CIC (LVDS 4 PIN) / NBT (LVDS 6 PIN)",
    specScreenSize: "10.25",
    variations: [
      { label: '8GB+128GB / Anti-Reflection scherm', wholesaleUSD: 340, isDefault: true, sortOrder: 0 },
      { label: '8GB+256GB / Anti-Reflection scherm', wholesaleUSD: 370, isDefault: false, sortOrder: 1 },
      { label: '8GB+128GB / Anti-Glare scherm', wholesaleUSD: 370, isDefault: false, sortOrder: 2 },
      { label: '8GB+256GB / Anti-Glare scherm', wholesaleUSD: 400, isDefault: false, sortOrder: 3 },
    ]
  },
  {
    name: "BMW 7-Serie E65 Android Navigatie",
    slug: "bmw-7-serie-e65-android-navigatie",
    sku: "CAL-BMW-E65",
    screenSizes: "8.8\" / 10.25\"",
    shortModel: "BMW 7-Serie E65/E66 (2004-2009)",
    fullModel: "BMW 7-Serie E65 en E66 (2004-2009)",
    systemCompat: "Geschikt voor auto's met origineel CCC systeem (LVDS 10 PIN). Let op: een AUX-aansluiting is vereist. Indien uw auto geen AUX heeft, is een optionele AUX-activator of FM-zender beschikbaar",
    modelsText: "Dit navigatiesysteem is ontworpen voor de BMW 7-Serie E65 en E66 (2004-2009) met origineel CCC systeem (LVDS 10 PIN). Beschikbaar in 8.8\" en 10.25\" schermformaat. Left Hand Drive. Let op: een AUX-aansluiting is vereist. Indien uw auto geen AUX heeft, is een optionele AUX-activator of FM-zender beschikbaar.",
    compatible: "BMW 7-Serie E65/E66 (2004-2009)",
    system: "CCC (LVDS 10 PIN)",
    specScreenSize: "8.8 / 10.25",
    variations: [
      { label: '8.8" - 8GB+128GB / Anti-Reflection', wholesaleUSD: 355, isDefault: true, sortOrder: 0 },
      { label: '8.8" - 8GB+256GB / Anti-Reflection', wholesaleUSD: 385, isDefault: false, sortOrder: 1 },
      { label: '8.8" - 8GB+128GB / Anti-Glare', wholesaleUSD: 385, isDefault: false, sortOrder: 2 },
      { label: '8.8" - 8GB+256GB / Anti-Glare', wholesaleUSD: 415, isDefault: false, sortOrder: 3 },
      { label: '10.25" - 8GB+128GB / Anti-Reflection', wholesaleUSD: 380, isDefault: false, sortOrder: 4 },
      { label: '10.25" - 8GB+256GB / Anti-Reflection', wholesaleUSD: 410, isDefault: false, sortOrder: 5 },
      { label: '10.25" - 8GB+128GB / Anti-Glare', wholesaleUSD: 410, isDefault: false, sortOrder: 6 },
      { label: '10.25" - 8GB+256GB / Anti-Glare', wholesaleUSD: 440, isDefault: false, sortOrder: 7 },
    ]
  },
  {
    name: "BMW 7-Serie G11 Android Navigatie",
    slug: "bmw-7-serie-g11-android-navigatie",
    sku: "CAL-BMW-G11",
    screenSizes: "10.25\"",
    shortModel: "BMW 7-Serie G11 (2016-2020)",
    fullModel: "BMW 7-Serie G11 (2016-2020)",
    systemCompat: "Geschikt voor auto's met origineel EVO systeem (LVDS 6 PIN)",
    modelsText: "Dit navigatiesysteem is ontworpen voor de BMW 7-Serie G11 (2016-2020) met origineel EVO systeem (LVDS 6 PIN). Schermformaat: 10.25\". Left Hand Drive.",
    compatible: "BMW 7-Serie G11 (2016-2020)",
    system: "EVO (LVDS 6 PIN)",
    specScreenSize: "10.25",
    variations: [
      { label: '8GB+128GB / Anti-Reflection scherm', wholesaleUSD: 380, isDefault: true, sortOrder: 0 },
      { label: '8GB+256GB / Anti-Reflection scherm', wholesaleUSD: 410, isDefault: false, sortOrder: 1 },
      { label: '8GB+128GB / Anti-Glare scherm', wholesaleUSD: 410, isDefault: false, sortOrder: 2 },
      { label: '8GB+256GB / Anti-Glare scherm', wholesaleUSD: 440, isDefault: false, sortOrder: 3 },
    ]
  },
  {
    name: "BMW X1 Android Navigatie",
    slug: "bmw-x1-android-navigatie",
    sku: "CAL-BMW-X1",
    screenSizes: "10.25\" / 12.3\"",
    shortModel: "BMW X1 E84 & F48 (2009-2018)",
    fullModel: "BMW X1 E84 (2009-2015) en BMW X1 F48 (2016-2018)",
    systemCompat: "Geschikt voor auto's met origineel CIC systeem (4 PIN), NBT systeem (6 PIN), EVO systeem (6 PIN) of zonder origineel scherm (met iDrive). Let op: bij het EVO systeem werkt het originele touchscreen niet meer na installatie",
    modelsText: "Dit navigatiesysteem is ontworpen voor de BMW X1 E84 (2009-2015) en BMW X1 F48 (2016-2018). Geschikt voor auto's met origineel CIC systeem (4 PIN), NBT systeem (6 PIN), EVO systeem (6 PIN) of zonder origineel scherm (met iDrive). Beschikbaar in 10.25\" en 12.3\" schermformaat. Left Hand Drive. Let op: bij het EVO systeem werkt het originele touchscreen niet meer na installatie.",
    compatible: "BMW X1 E84 (2009-2015), BMW X1 F48 (2016-2018)",
    system: "CIC (4 PIN) / NBT (6 PIN) / EVO (6 PIN) / zonder origineel scherm",
    specScreenSize: "10.25 / 12.3",
    variations: [
      { label: '10.25" - 8GB+128GB / Anti-Reflection', wholesaleUSD: 340, isDefault: true, sortOrder: 0 },
      { label: '10.25" - 8GB+256GB / Anti-Reflection', wholesaleUSD: 370, isDefault: false, sortOrder: 1 },
      { label: '10.25" - 8GB+128GB / Anti-Glare', wholesaleUSD: 370, isDefault: false, sortOrder: 2 },
      { label: '10.25" - 8GB+256GB / Anti-Glare', wholesaleUSD: 400, isDefault: false, sortOrder: 3 },
      { label: '12.3" - 8GB+128GB / Anti-Reflection', wholesaleUSD: 355, isDefault: false, sortOrder: 4 },
      { label: '12.3" - 8GB+256GB / Anti-Reflection', wholesaleUSD: 385, isDefault: false, sortOrder: 5 },
      { label: '12.3" - 8GB+128GB / Anti-Glare', wholesaleUSD: 385, isDefault: false, sortOrder: 6 },
      { label: '12.3" - 8GB+256GB / Anti-Glare', wholesaleUSD: 415, isDefault: false, sortOrder: 7 },
    ]
  },
  {
    name: "BMW X3/X4 Android Navigatie",
    slug: "bmw-x3-x4-android-navigatie",
    sku: "CAL-BMW-X3",
    screenSizes: "10.25\" / 12.3\"",
    shortModel: "BMW X3 E83/F25/G01 & X4 F26",
    fullModel: "BMW X3 E83 (2004-2009), BMW X3 F25 (2011-2016), BMW X4 F26 (2014-2016) en BMW X3 G01 (2018+)",
    systemCompat: "Geschikt voor diverse systemen: CIC (4 PIN), NBT (6 PIN), EVO (6 PIN) en modellen zonder origineel scherm. Let op: bij het EVO systeem werkt het originele touchscreen niet meer na installatie",
    modelsText: "Dit navigatiesysteem is ontworpen voor de BMW X3 E83 (2004-2009), BMW X3 F25 (2011-2016), BMW X4 F26 (2014-2016) en BMW X3 G01 (2018+). Geschikt voor diverse systemen: CIC (4 PIN), NBT (6 PIN), EVO (6 PIN) en modellen zonder origineel scherm. Beschikbaar in 10.25\" en 12.3\" schermformaat. Left Hand Drive. Let op: bij het EVO systeem werkt het originele touchscreen niet meer na installatie.",
    compatible: "BMW X3 E83 (2004-2009), X3 F25 (2011-2016), X4 F26 (2014-2016), X3 G01 (2018+)",
    system: "CIC (4 PIN) / NBT (6 PIN) / EVO (6 PIN) / zonder origineel scherm",
    specScreenSize: "10.25 / 12.3",
    variations: [
      { label: '10.25" - 8GB+128GB / Anti-Reflection', wholesaleUSD: 340, isDefault: true, sortOrder: 0 },
      { label: '10.25" - 8GB+256GB / Anti-Reflection', wholesaleUSD: 370, isDefault: false, sortOrder: 1 },
      { label: '10.25" - 8GB+128GB / Anti-Glare', wholesaleUSD: 370, isDefault: false, sortOrder: 2 },
      { label: '10.25" - 8GB+256GB / Anti-Glare', wholesaleUSD: 400, isDefault: false, sortOrder: 3 },
      { label: '12.3" - 8GB+128GB / Anti-Reflection', wholesaleUSD: 355, isDefault: false, sortOrder: 4 },
      { label: '12.3" - 8GB+256GB / Anti-Reflection', wholesaleUSD: 385, isDefault: false, sortOrder: 5 },
      { label: '12.3" - 8GB+128GB / Anti-Glare', wholesaleUSD: 385, isDefault: false, sortOrder: 6 },
      { label: '12.3" - 8GB+256GB / Anti-Glare', wholesaleUSD: 415, isDefault: false, sortOrder: 7 },
    ]
  },
  {
    name: "BMW X5/X6 Android Navigatie",
    slug: "bmw-x5-x6-android-navigatie",
    sku: "CAL-BMW-X5",
    screenSizes: "10.25\" / 12.3\"",
    shortModel: "BMW X5 E70/F15 & X6 E71 (2007-2017)",
    fullModel: "BMW X5 E70 (2007-2013), BMW X6 E71/E72 (2007-2014) en BMW X5 F15 (2014-2017)",
    systemCompat: "Geschikt voor auto's met origineel CCC systeem (LVDS 10 PIN), CIC systeem (LVDS 4 PIN) en NBT systeem (LVDS 6 PIN). Uitsluitend Left Hand Drive",
    modelsText: "Dit navigatiesysteem is ontworpen voor de BMW X5 E70 (2007-2013), BMW X6 E71/E72 (2007-2014) en BMW X5 F15 (2014-2017). Geschikt voor auto's met origineel CCC systeem (LVDS 10 PIN), CIC systeem (LVDS 4 PIN) en NBT systeem (LVDS 6 PIN). Beschikbaar in 10.25\" en 12.3\" schermformaat. Uitsluitend Left Hand Drive.",
    compatible: "BMW X5 E70 (2007-2013), X6 E71/E72 (2007-2014), X5 F15 (2014-2017)",
    system: "CCC (LVDS 10 PIN) / CIC (LVDS 4 PIN) / NBT (LVDS 6 PIN)",
    specScreenSize: "10.25 / 12.3",
    variations: [
      { label: '10.25" - 8GB+128GB / Anti-Reflection', wholesaleUSD: 340, isDefault: true, sortOrder: 0 },
      { label: '10.25" - 8GB+256GB / Anti-Reflection', wholesaleUSD: 370, isDefault: false, sortOrder: 1 },
      { label: '10.25" - 8GB+128GB / Anti-Glare', wholesaleUSD: 370, isDefault: false, sortOrder: 2 },
      { label: '10.25" - 8GB+256GB / Anti-Glare', wholesaleUSD: 400, isDefault: false, sortOrder: 3 },
      { label: '12.3" - 8GB+128GB / Anti-Reflection', wholesaleUSD: 355, isDefault: false, sortOrder: 4 },
      { label: '12.3" - 8GB+256GB / Anti-Reflection', wholesaleUSD: 385, isDefault: false, sortOrder: 5 },
      { label: '12.3" - 8GB+128GB / Anti-Glare', wholesaleUSD: 385, isDefault: false, sortOrder: 6 },
      { label: '12.3" - 8GB+256GB / Anti-Glare', wholesaleUSD: 415, isDefault: false, sortOrder: 7 },
    ]
  },
  {
    name: "BMW Z4 Android Navigatie",
    slug: "bmw-z4-android-navigatie",
    sku: "CAL-BMW-Z4",
    screenSizes: "10.25\"",
    shortModel: "BMW Z4 E85 & E89 (2004-2015)",
    fullModel: "BMW Z4 E85 (2004-2007) en BMW Z4 E89 (2009-2015)",
    systemCompat: "E85 zonder origineel scherm, E89 met origineel CIC systeem (LVDS 4 PIN). Let op: de E89 variant is afhankelijk van of uw auto een origineel scherm heeft",
    modelsText: "Dit navigatiesysteem is ontworpen voor de BMW Z4 E85 (2004-2007, zonder origineel scherm) en BMW Z4 E89 (2009-2015, met origineel CIC systeem, LVDS 4 PIN). Let op: de E89 variant is afhankelijk van of uw auto een origineel scherm heeft. Schermformaat: 10.25\". Left Hand Drive.",
    compatible: "BMW Z4 E85 (2004-2007), Z4 E89 (2009-2015)",
    system: "E85: zonder scherm / E89: CIC (LVDS 4 PIN)",
    specScreenSize: "10.25",
    variations: [
      { label: 'E85 (2004-2007) - 8GB+128GB / Anti-Reflection', wholesaleUSD: 355, isDefault: true, sortOrder: 0 },
      { label: 'E85 (2004-2007) - 8GB+256GB / Anti-Reflection', wholesaleUSD: 385, isDefault: false, sortOrder: 1 },
      { label: 'E89 met OEM scherm - 8GB+128GB / Anti-Reflection', wholesaleUSD: 515, isDefault: false, sortOrder: 2 },
      { label: 'E89 met OEM scherm - 8GB+256GB / Anti-Reflection', wholesaleUSD: 545, isDefault: false, sortOrder: 3 },
      { label: 'E89 zonder scherm - 8GB+128GB / Anti-Reflection', wholesaleUSD: 535, isDefault: false, sortOrder: 4 },
      { label: 'E89 zonder scherm - 8GB+256GB / Anti-Reflection', wholesaleUSD: 565, isDefault: false, sortOrder: 5 },
    ]
  },
];

async function main() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let insertedCount = 0;
    let skippedCount = 0;

    for (const p of products) {
      const existing = await client.query('SELECT id FROM products WHERE slug = $1', [p.slug]);
      if (existing.rows.length > 0) {
        console.log(`⏭️  Skipping "${p.name}" — slug already exists`);
        skippedCount++;
        continue;
      }

      const basePrice = calcPrice(p.variations[0].wholesaleUSD);
      const description = makeDescription(p.screenSizes, p.fullModel, p.systemCompat);
      const shortDescription = `Premium ${p.screenSizes} Android 14 navigatie voor ${p.shortModel}. Snapdragon 685, draadloze Apple CarPlay & Android Auto, 1920×720P IPS touchscreen.`;
      const overview = makeOverview(p.modelsText);
      const specs = makeSpecs(p.specScreenSize, p.compatible, p.system);

      const productResult = await client.query(
        `INSERT INTO products (
          name, slug, description, short_description, price, original_price,
          installation_price, sku, stock, images, primary_image_index,
          brand_id, category_id, features, specifications, is_active,
          is_featured, can_have_installation, has_variations, overview_content,
          box_content, accessories, video_url, downloads
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11,
          $12, $13, $14, $15, $16,
          $17, $18, $19, $20,
          $21, $22, $23, $24
        ) RETURNING id`,
        [
          p.name,
          p.slug,
          description,
          shortDescription,
          basePrice.toFixed(2),
          null,
          149.00,
          p.sku,
          10,
          `{${IMAGE_URL}}`,
          0,
          null,
          CATEGORY_ID,
          `{${FEATURES.map(f => `"${f.replace(/"/g, '\\"')}"`).join(',')}}`,
          specs,
          true,
          false,
          true,
          true,
          overview,
          BOX_CONTENT,
          ACCESSORIES,
          null,
          null,
        ]
      );

      const productId = productResult.rows[0].id;
      console.log(`✅ Inserted product: "${p.name}" (id: ${productId}, base price: €${basePrice})`);

      for (const v of p.variations) {
        const retailPrice = calcPrice(v.wholesaleUSD);
        await client.query(
          `INSERT INTO product_variations (
            product_id, label, sku, price, original_price,
            stock, sort_order, is_default, is_active, images, specifications
          ) VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10, $11
          )`,
          [
            productId,
            v.label,
            null,
            retailPrice.toFixed(2),
            null,
            10,
            v.sortOrder,
            v.isDefault,
            true,
            null,
            null,
          ]
        );
      }

      console.log(`   ↳ Inserted ${p.variations.length} variations`);
      insertedCount++;
    }

    const deactivateResult = await client.query(
      `UPDATE product_variations SET is_active = false WHERE product_id = $1`,
      [OLD_PRODUCT_ID]
    );
    console.log(`\n🔄 Deactivated ${deactivateResult.rowCount} variations on old "BMW Android Navigatie" product (${OLD_PRODUCT_ID})`);

    await client.query('COMMIT');
    console.log(`\n🎉 Done! Inserted ${insertedCount} products, skipped ${skippedCount}.`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error during bulk insert, rolled back:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
