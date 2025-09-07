// @ts-check
import { db } from './server/db.ts';
import { categories, brands, vehicleMakes, vehicleModels, products } from './shared/schema.ts';
import { eq } from 'drizzle-orm';

async function seedProductionData() {
  console.log('🚀 Starting Car Audio Limburg production database seeding...');
  
  try {
    // 1. Categorieën
    console.log('📂 Adding categories...');
    await db.insert(categories).values([
      { name: 'Multimedia & Navigatie', slug: 'multimedia-navigatie', description: 'Android multimedia, CarPlay, navigatiesystemen' },
      { name: 'Speakers & Subwoofers', slug: 'speakers-subwoofers', description: 'Luidsprekers, subwoofers, speaker kits' },
      { name: 'Versterkers & DSP', slug: 'versterkers-dsp', description: 'Versterkers, DSP processors, geluidprocessors' },
      { name: 'Installatie & Accessoires', slug: 'installatie-accessoires', description: 'Installatiebenodigdheden, gereedschap, bekabeling' },
      { name: 'Cameras & Veiligheid', slug: 'cameras-veiligheid', description: 'Achteruitrijcameras, dash cams, parkeersensoren' },
      { name: 'OEM Upgrades', slug: 'oem-upgrades', description: 'Fabriekssysteem upgrades per automerk' },
      { name: 'Premium Audio', slug: 'premium-audio', description: 'High-end audiosystemen en componenten' },
      { name: 'Offerte Aanvragen', slug: 'offerte-aanvragen', description: 'Custom installaties en maatwerk' }
    ]).onConflictDoNothing();
    
    // 2. Merken
    console.log('🏷️ Adding brands...');
    await db.insert(brands).values([
      { name: 'Audison', slug: 'audison', description: 'Premium Italiaanse audio specialist' },
      { name: 'Alpine', slug: 'alpine', description: 'Toonaangevende Japanse autosound fabrikant' },
      { name: 'Pioneer', slug: 'pioneer', description: 'Wereldwijde leider in auto-entertainment' },
      { name: 'Kenwood', slug: 'kenwood', description: 'Innovatieve audiooplossingen' },
      { name: 'JL Audio', slug: 'jl-audio', description: 'Amerikaanse premium audio specialist' },
      { name: 'Focal', slug: 'focal', description: 'Franse high-end speaker specialist' },
      { name: 'Hertz', slug: 'hertz', description: 'Italiaanse audio-excellentie' },
      { name: 'STP', slug: 'stp', description: 'Trillingsdempende materialen specialist' },
      { name: 'Car Audio Limburg', slug: 'car-audio-limburg', description: 'Eigen merk kwaliteitsproducten' }
    ]).onConflictDoNothing();
    
    // 3. Voertuigmerken  
    console.log('🚗 Adding vehicle makes...');
    await db.insert(vehicleMakes).values([
      { name: 'Audi', slug: 'audi' },
      { name: 'BMW', slug: 'bmw' },
      { name: 'Mercedes-Benz', slug: 'mercedes-benz' },
      { name: 'Volkswagen', slug: 'volkswagen' },
      { name: 'Ford', slug: 'ford' },
      { name: 'Opel', slug: 'opel' },
      { name: 'Renault', slug: 'renault' },
      { name: 'Peugeot', slug: 'peugeot' },
      { name: 'Citroen', slug: 'citroen' },
      { name: 'Toyota', slug: 'toyota' },
      { name: 'Nissan', slug: 'nissan' },
      { name: 'Mazda', slug: 'mazda' },
      { name: 'Honda', slug: 'honda' },
      { name: 'Hyundai', slug: 'hyundai' },
      { name: 'Kia', slug: 'kia' },
      { name: 'Skoda', slug: 'skoda' },
      { name: 'SEAT', slug: 'seat' },
      { name: 'Volvo', slug: 'volvo' },
      { name: 'Suzuki', slug: 'suzuki' },
      { name: 'Dacia', slug: 'dacia' }
    ]).onConflictDoNothing();
    
    // Get the actual make IDs
    console.log('🔍 Getting vehicle make IDs...');
    const makes = await db.select().from(vehicleMakes);
    const makeIds = Object.fromEntries(makes.map(make => [make.slug, make.id]));
    
    // 4. Voertuigmodellen
    console.log('🚙 Adding vehicle models...');
    await db.insert(vehicleModels).values([
      // Audi modellen
      { name: 'A1', slug: 'a1', makeId: makeIds['audi'], startYear: 2010, endYear: 2025 },
      { name: 'A3', slug: 'a3', makeId: makeIds['audi'], startYear: 2012, endYear: 2025 },
      { name: 'A4', slug: 'a4', makeId: makeIds['audi'], startYear: 2015, endYear: 2025 },
      { name: 'A5', slug: 'a5', makeId: makeIds['audi'], startYear: 2016, endYear: 2025 },
      { name: 'A6', slug: 'a6', makeId: makeIds['audi'], startYear: 2018, endYear: 2025 },
      { name: 'Q3', slug: 'q3', makeId: makeIds['audi'], startYear: 2018, endYear: 2025 },
      { name: 'Q5', slug: 'q5', makeId: makeIds['audi'], startYear: 2016, endYear: 2025 },
      
      // BMW modellen
      { name: '1 Series', slug: '1-series', makeId: makeIds['bmw'], startYear: 2011, endYear: 2025 },
      { name: '2 Series', slug: '2-series', makeId: makeIds['bmw'], startYear: 2014, endYear: 2025 },
      { name: '3 Series', slug: '3-series', makeId: makeIds['bmw'], startYear: 2012, endYear: 2025 },
      { name: '4 Series', slug: '4-series', makeId: makeIds['bmw'], startYear: 2013, endYear: 2025 },
      { name: '5 Series', slug: '5-series', makeId: makeIds['bmw'], startYear: 2017, endYear: 2025 },
      { name: 'X1', slug: 'x1', makeId: makeIds['bmw'], startYear: 2015, endYear: 2025 },
      { name: 'X3', slug: 'x3', makeId: makeIds['bmw'], startYear: 2017, endYear: 2025 },
      { name: 'X5', slug: 'x5', makeId: makeIds['bmw'], startYear: 2018, endYear: 2025 },
      
      // Mercedes-Benz modellen
      { name: 'A-Class', slug: 'a-class', makeId: makeIds['mercedes-benz'], startYear: 2018, endYear: 2025 },
      { name: 'B-Class', slug: 'b-class', makeId: makeIds['mercedes-benz'], startYear: 2019, endYear: 2025 },
      { name: 'C-Class', slug: 'c-class', makeId: makeIds['mercedes-benz'], startYear: 2021, endYear: 2025 },
      { name: 'E-Class', slug: 'e-class', makeId: makeIds['mercedes-benz'], startYear: 2016, endYear: 2025 },
      { name: 'GLA', slug: 'gla', makeId: makeIds['mercedes-benz'], startYear: 2020, endYear: 2025 },
      { name: 'GLC', slug: 'glc', makeId: makeIds['mercedes-benz'], startYear: 2019, endYear: 2025 },
      { name: 'GLE', slug: 'gle', makeId: makeIds['mercedes-benz'], startYear: 2019, endYear: 2025 },
      
      // Volkswagen modellen
      { name: 'Golf', slug: 'golf', makeId: makeIds['volkswagen'], startYear: 2019, endYear: 2025 },
      { name: 'Polo', slug: 'polo', makeId: makeIds['volkswagen'], startYear: 2017, endYear: 2025 },
      { name: 'Passat', slug: 'passat', makeId: makeIds['volkswagen'], startYear: 2014, endYear: 2025 },
      { name: 'Tiguan', slug: 'tiguan', makeId: makeIds['volkswagen'], startYear: 2016, endYear: 2025 },
      { name: 'T-Cross', slug: 't-cross', makeId: makeIds['volkswagen'], startYear: 2019, endYear: 2025 },
      { name: 'T-Roc', slug: 't-roc', makeId: makeIds['volkswagen'], startYear: 2017, endYear: 2025 },
      
      // Ford modellen
      { name: 'Fiesta', slug: 'fiesta', makeId: makeIds['ford'], startYear: 2017, endYear: 2023 },
      { name: 'Focus', slug: 'focus', makeId: makeIds['ford'], startYear: 2018, endYear: 2025 },
      { name: 'Kuga', slug: 'kuga', makeId: makeIds['ford'], startYear: 2019, endYear: 2025 },
      { name: 'Puma', slug: 'puma', makeId: makeIds['ford'], startYear: 2019, endYear: 2025 },
      
      // Opel modellen  
      { name: 'Corsa', slug: 'corsa', makeId: makeIds['opel'], startYear: 2019, endYear: 2025 },
      { name: 'Astra', slug: 'astra', makeId: makeIds['opel'], startYear: 2021, endYear: 2025 },
      { name: 'Mokka', slug: 'mokka', makeId: makeIds['opel'], startYear: 2020, endYear: 2025 },
      { name: 'Grandland', slug: 'grandland', makeId: makeIds['opel'], startYear: 2017, endYear: 2025 },
      
      // Toyota modellen
      { name: 'Yaris', slug: 'yaris', makeId: makeIds['toyota'], startYear: 2020, endYear: 2025 },
      { name: 'Corolla', slug: 'corolla', makeId: makeIds['toyota'], startYear: 2019, endYear: 2025 },
      { name: 'C-HR', slug: 'c-hr', makeId: makeIds['toyota'], startYear: 2016, endYear: 2025 },
      { name: 'RAV4', slug: 'rav4', makeId: makeIds['toyota'], startYear: 2018, endYear: 2025 },
      
      // Dacia modellen
      { name: 'Sandero', slug: 'sandero', makeId: makeIds['dacia'], startYear: 2020, endYear: 2025 },
      { name: 'Duster', slug: 'duster', makeId: makeIds['dacia'], startYear: 2017, endYear: 2025 },
      { name: 'Spring', slug: 'spring', makeId: makeIds['dacia'], startYear: 2021, endYear: 2025 }
    ]).onConflictDoNothing();
    
    // 5. Core producten
    console.log('🎵 Adding core products...');
    
    // Get category and brand IDs for products
    const speakersCat = await db.select().from(categories).where(eq(categories.slug, 'speakers-subwoofers')).limit(1);
    const versterkersCat = await db.select().from(categories).where(eq(categories.slug, 'versterkers-dsp')).limit(1);
    const multimediaCat = await db.select().from(categories).where(eq(categories.slug, 'multimedia-navigatie')).limit(1);
    const premiumCat = await db.select().from(categories).where(eq(categories.slug, 'premium-audio')).limit(1);
    
    const audisonBrand = await db.select().from(brands).where(eq(brands.slug, 'audison')).limit(1);
    const alpineBrand = await db.select().from(brands).where(eq(brands.slug, 'alpine')).limit(1);
    const pioneerBrand = await db.select().from(brands).where(eq(brands.slug, 'pioneer')).limit(1);
    
    const coreProducts = [
      // Audison Premium Speakers
      {
        name: 'Audison AV 3.0 II Mid-range Speakerset',
        slug: 'audison-av-3-0-ii-mid-range-speakerset',
        description: 'Premium 3" mid-range luidspreker set van Audison. Perfecte kwaliteit voor high-end audio installaties met kristalheldere middenfrequenties.',
        shortDescription: 'Premium 3" mid-range speakers van Audison',
        price: '349.00',
        originalPrice: '399.00',
        sku: 'AUD-AV30-II',
        stock: 15,
        images: ['audison-av-3-ii.webp'],
        brandId: audisonBrand[0]?.id,
        categoryId: speakersCat[0]?.id,
        features: [
          '3" (75mm) mid-range drivers',
          'Premium Italiaanse kwaliteit',
          'Kristalheldere middenfrequenties',
          'Perfecte integratie met bestaande systemen'
        ],
        specifications: {
          diameter: '75mm',
          power_rms: '50W',
          power_max: '100W',
          frequency_range: '80Hz - 10kHz',
          impedance: '4Ω',
          sensitivity: '89dB'
        },
        isFeatured: true
      },
      
      // Alpine Multimedia
      {
        name: 'Alpine iLX-F309E CarPlay/Android Auto Display',
        slug: 'alpine-ilx-f309e-carplay-android-auto',
        description: 'Moderne 9-inch multimedia display van Alpine met draadloze CarPlay en Android Auto ondersteuning. Perfecte upgrade voor uw dashboard.',
        shortDescription: '9" CarPlay/Android Auto multimedia display',
        price: '649.00',
        originalPrice: '729.00',
        sku: 'ALP-ILX-F309E',
        stock: 8,
        images: ['alpine-ilx-f309e.webp'],
        brandId: alpineBrand[0]?.id,
        categoryId: multimediaCat[0]?.id,
        features: [
          '9-inch touchscreen display',
          'Draadloze Apple CarPlay',
          'Draadloze Android Auto',
          'Bluetooth handsfree bellen',
          'USB connectiviteit',
          'Achteruitrijcamera aansluiting'
        ],
        specifications: {
          screen_size: '9 inch',
          resolution: '800x480',
          carplay: 'Wireless',
          android_auto: 'Wireless',
          bluetooth: '5.0',
          usb: '2x USB-A'
        },
        isFeatured: true
      },
      
      // Pioneer Budget Option
      {
        name: 'Pioneer MVH-S320BT Bluetooth Autoradio',
        slug: 'pioneer-mvh-s320bt-bluetooth-autoradio',
        description: 'Betaalbare autoradio van Pioneer met Bluetooth, USB en AUX. Perfecte upgrade van uw fabrieksradio tegen een scherpe prijs.',
        shortDescription: 'Bluetooth autoradio met USB en AUX',
        price: '89.00',
        sku: 'PIO-MVH-S320BT',
        stock: 25,
        images: ['pioneer-mvh-s320bt.webp'],
        brandId: pioneerBrand[0]?.id,
        categoryId: multimediaCat[0]?.id,
        features: [
          'Bluetooth hands-free bellen',
          'Bluetooth audio streaming',
          'USB-poort voor smartphones',
          '3.5mm AUX ingang',
          'Variable color illumination',
          'Android Media Access'
        ],
        specifications: {
          power: '4x50W',
          bluetooth: '4.1',
          usb: '1x USB-A',
          aux: '3.5mm',
          display: 'LED'
        },
        isFeatured: false
      },
      
      // Audison Premium Versterker
      {
        name: 'Audison AP 4.9 bit DSP Versterker',
        slug: 'audison-ap-4-9-bit-dsp-versterker',
        description: 'High-end 4-kanaals versterker met geïntegreerde DSP van Audison. Perfecte controle over uw audio systeem met geavanceerde tuning mogelijkheden.',
        shortDescription: '4-kanaals DSP versterker van Audison',
        price: '899.00',
        originalPrice: '999.00',
        sku: 'AUD-AP-49-BIT',
        stock: 5,
        images: ['audison-ap-4-9-bit.webp'],
        brandId: audisonBrand[0]?.id,
        categoryId: versterkersCat[0]?.id,
        features: [
          '4-kanaals Class D versterker',
          'Geïntegreerde 32-bit DSP processor',
          'Bit Tune software voor fine-tuning',
          'Optical/Coaxial digitale inputs',
          'High-level inputs met AutoRemote',
          'Professionele installatie aanbevolen'
        ],
        specifications: {
          channels: '4',
          power_rms: '4x85W @ 4Ω',
          power_max: '4x170W @ 2Ω',
          dsp: '32-bit DSP',
          inputs: 'Digital + Analog',
          dimensions: '200x245x55mm'
        },
        isFeatured: true
      }
    ];
    
    await db.insert(products).values(coreProducts).onConflictDoNothing();
    
    console.log('✅ Car Audio Limburg production database successfully seeded!');
    console.log('');
    console.log('📊 Data added:');
    console.log('   - 8 Product categories');
    console.log('   - 9 Audio brands'); 
    console.log('   - 20 Vehicle makes');
    console.log('   - 40+ Vehicle models');
    console.log('   - 4 Core products');
    console.log('');
    console.log('🚀 Ready for production deployment!');
    
  } catch (error) {
    console.error('❌ Error seeding production data:', error);
    throw error;
  }
}

// Run the seeding
seedProductionData()
  .then(() => {
    console.log('🎉 Production seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Production seeding failed:', error);
    process.exit(1);
  });