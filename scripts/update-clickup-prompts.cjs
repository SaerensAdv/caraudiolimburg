const https = require('https');

const apiKey = process.env.CLICKUP_API_KEY;
const LIST_ID = '901519253080';

const prompts = {
  'Frontale': `High-resolution studio product photo of [PRODUCT]. 
Front view showing main components. 
Neutral light grey background, soft professional studio lighting, sharp focus on textures and details. 
Realistic shadows, no text, no branding overlays, ultra-clean commercial product photography style.

**Aspect ratio: 1:1 (verplicht voor webshop)**
**Resolutie: minimaal 1024x1024 pixels**`,

  'Hoekopname': `Premium angled studio shot of [PRODUCT]. 
45-degree diagonal perspective, dark charcoal background with subtle gradient. 
Dramatic rim lighting highlighting the material textures and build quality. 
High contrast, cinematic lighting, luxury audio product photography.

**Aspect ratio: 4:5 (voor social media ads)**
**Resolutie: minimaal 1024x1280 pixels**`,

  'Exploded': `Exploded view product layout of [PRODUCT]. 
All components (speakers, tweeters, crossovers, cables, accessories) displayed separately but aligned symmetrically. 
Clean white background, even studio lighting, technical product presentation style, 
ultra-sharp details, realistic proportions, no labels or text.

**Aspect ratio: 1:1**
**Resolutie: minimaal 1024x1024 pixels**`,

  'In-Car': `Realistic in-car installation photo of [PRODUCT] mounted inside a modern car interior. 
OEM-style fitment, clean interior, natural daylight, shallow depth of field. 
Focus on seamless integration and premium finish. 
Photorealistic automotive lifestyle photography.

**Aspect ratio: 16:9 (voor landingspagina's en banners)**
**Resolutie: minimaal 1920x1080 pixels**`,

  'Macro': `Extreme close-up macro photo of [PRODUCT] components. 
Focus on material quality, textures, and construction details. 
Ultra-sharp detail, soft background blur, professional macro photography lighting, 
realistic materials, premium audio engineering look.

**Aspect ratio: 1:1**
**Resolutie: minimaal 1024x1024 pixels**`
};

function request(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.clickup.com',
      path: `/api/v2${path}`,
      method,
      headers: { 
        'Authorization': apiKey, 
        'Content-Type': 'application/json' 
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getAllParentTasks() {
  const allTasks = [];
  for (let page = 0; page < 10; page++) {
    const result = await request(`/list/${LIST_ID}/task?subtasks=false&page=${page}`);
    if (!result.data.tasks || result.data.tasks.length === 0) break;
    allTasks.push(...result.data.tasks.filter(t => t.name.startsWith('🖼️')));
    console.log(`Fetched page ${page}: ${result.data.tasks.length} tasks`);
    await delay(500);
  }
  return allTasks;
}

async function updateSubtasks(parentTask) {
  const productName = parentTask.name.replace('🖼️ Afbeeldingen: ', '');
  
  const taskDetail = await request(`/task/${parentTask.id}?include_subtasks=true`);
  const subtasks = taskDetail.data.subtasks || [];
  
  // Check if already updated
  if (subtasks[0]?.description?.includes('Aspect ratio')) {
    return { updated: 0, skipped: 1 };
  }
  
  let updated = 0;
  for (const subtask of subtasks) {
    for (const [key, template] of Object.entries(prompts)) {
      if (subtask.name.includes(key)) {
        const description = template.replace(/\[PRODUCT\]/g, productName);
        await request(`/task/${subtask.id}`, 'PUT', { description });
        updated++;
        await delay(100);
        break;
      }
    }
  }
  
  return { updated, skipped: 0 };
}

async function main() {
  console.log('🚀 Starting ClickUp prompt update script...\n');
  
  const parentTasks = await getAllParentTasks();
  console.log(`\nFound ${parentTasks.length} product tasks to process\n`);
  
  let totalUpdated = 0;
  let totalSkipped = 0;
  
  for (let i = 0; i < parentTasks.length; i++) {
    const task = parentTasks[i];
    const productName = task.name.replace('🖼️ Afbeeldingen: ', '');
    
    try {
      const result = await updateSubtasks(task);
      totalUpdated += result.updated;
      totalSkipped += result.skipped;
      
      if (result.skipped) {
        process.stdout.write('⏭️');
      } else {
        process.stdout.write('✅');
      }
      
      if ((i + 1) % 50 === 0) {
        console.log(` ${i + 1}/${parentTasks.length}`);
      }
    } catch (error) {
      process.stdout.write('❌');
      console.error(`\nError updating ${productName}: ${error.message}`);
    }
    
    await delay(200);
  }
  
  console.log('\n\n📊 Summary:');
  console.log(`✅ Subtasks updated: ${totalUpdated}`);
  console.log(`⏭️ Products skipped (already done): ${totalSkipped}`);
  console.log(`📦 Total products processed: ${parentTasks.length}`);
}

main().catch(console.error);
