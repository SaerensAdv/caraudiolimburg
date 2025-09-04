import { db } from './server/db.js';
import { categories, brands, vehicleMakes } from './shared/schema.js';

async function seedData() {
  console.log('Adding categories...');
  
  try {
    // Hoofdcategorieën
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
    
    console.log('Adding brands...');
    
    // Merken
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
    
    console.log('Adding vehicle makes...');
    
    // Voertuigmerken  
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
      { name: 'Suzuki', slug: 'suzuki' }
    ]).onConflictDoNothing();
    
    console.log('Data seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

seedData();