#!/usr/bin/env node
/**
 * Salon Image Generator Script
 *
 * Generates AI images for salon microsites using various image generation APIs.
 * Creates diverse, realistic salon-themed images for use across all microsites.
 *
 * Usage:
 *   node generate-salon-images.js
 *   node generate-salon-images.js --count=50 --output=./images
 *   node generate-salon-images.js --api=together
 *
 * Environment variables needed:
 *   TOGETHER_API_KEY - For Together AI (Flux models)
 *   OPENAI_API_KEY - For DALL-E
 *   FAL_API_KEY - For Fal.ai
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.replace('--', '').split('=');
  acc[key] = value || true;
  return acc;
}, {});

const CONFIG = {
  count: parseInt(args.count) || 100,
  outputDir: args.output || './generated-images',
  api: args.api || 'together', // together, openai, fal
  batchSize: 5,
  delayBetweenBatches: 2000
};

// Image prompts organized by category
const IMAGE_PROMPTS = {
  hairColor: [
    "Professional hair colorist applying balayage highlights to client's long brown hair in upscale salon, natural lighting, candid shot",
    "Beautiful sun-kissed blonde balayage hair result, woman looking in salon mirror, warm lighting, editorial quality",
    "Hair stylist mixing custom hair color formula, close-up of bowls and brushes, artisanal salon setting",
    "Gorgeous caramel highlights on dark hair, professional salon result, natural daylight",
    "Client consultation for hair color, stylist examining hair texture, boutique salon interior",
    "Rich auburn hair color transformation, before and after vibes, salon chair setting",
    "Platinum blonde hair perfection, modern salon backdrop, magazine quality photo",
    "Natural-looking root shadow on blonde hair, professional technique demonstration",
    "Hand-painted balayage in progress, artistic hair coloring, South Florida salon aesthetic",
    "Dimensional brunette hair color with subtle highlights, luxury salon environment"
  ],

  salonInterior: [
    "Modern boutique hair salon interior, warm wood accents, natural light streaming through windows, South Florida vibes",
    "Elegant salon styling station with large mirror, fresh flowers, minimalist design",
    "Cozy salon waiting area with tropical plants, magazine rack, coastal Florida aesthetic",
    "Professional hair washing station, spa-like atmosphere, calming neutral tones",
    "Salon product display shelf with premium hair care, organized and aesthetic",
    "Private styling suite in upscale salon, personal and intimate space",
    "Salon entrance with welcoming tropical landscaping, Delray Beach style",
    "Professional lighting setup at salon station, perfect for color work",
    "Clean and organized color bar with premium products, professional setup",
    "Salon interior with exposed brick and modern fixtures, boutique feel"
  ],

  hairStyles: [
    "Elegant beach waves hairstyle, Florida lifestyle hair, outdoor natural light",
    "Sleek blowout on medium-length hair, professional finish, salon result",
    "Textured bob haircut, modern and chic, editorial photography style",
    "Long layered haircut with movement, healthy shiny hair, professional quality",
    "Bridal updo hairstyle, elegant and romantic, wedding day ready",
    "Natural curly hair styled and defined, embrace your texture, salon care",
    "Modern shag haircut with curtain bangs, trendy and flattering",
    "Polished ponytail for special occasion, sleek and sophisticated",
    "Lived-in color and style, effortless beauty, South Florida aesthetic",
    "Professional blowout with volume, healthy bouncy hair, salon fresh"
  ],

  treatments: [
    "Keratin treatment application in progress, smooth and shiny hair transformation",
    "Deep conditioning hair mask, spa treatment, luxury hair care",
    "Hair extensions consultation, showing different options and colors",
    "Scalp treatment for hair health, professional care, wellness focus",
    "Color correction process, fixing damaged hair, expert technique",
    "Olaplex treatment application, bond repair, healthy hair restoration",
    "Hair glossing treatment for shine, finishing touch, salon service",
    "Toner application on highlighted hair, perfecting the shade",
    "Professional hair trim, maintaining healthy ends, precision cutting",
    "Smoothing treatment for frizz-free hair, Florida humidity solution"
  ],

  lifestyle: [
    "Happy client leaving salon with gorgeous hair, confident smile, Delray Beach street",
    "Woman with beautiful hair enjoying South Florida sunshine, lifestyle shot",
    "Friends getting ready together at salon, girls day out vibes",
    "Beach-ready hair, effortless waves, coastal Florida lifestyle",
    "Professional woman with polished hair, confident business look",
    "Wedding party getting hair done, bridal suite atmosphere",
    "Client relaxing during salon service, self-care moment",
    "Beautiful hair at outdoor Florida event, evening light",
    "Morning coffee with perfect salon hair, lifestyle aesthetic",
    "Active lifestyle with maintained hair color, gym to brunch ready"
  ],

  details: [
    "Close-up of healthy highlighted hair strands, texture detail",
    "Hair color swatches and samples, professional color selection",
    "Salon tools laid out aesthetically, scissors and combs",
    "Premium hair products on marble counter, luxury styling",
    "Hair brush through silky smooth hair, satisfying moment",
    "Color formulation notes and swatches, artistic process",
    "Fresh haircut details at the nape, precision work",
    "Sectioned hair ready for highlights, foil technique prep",
    "Glossy hair reflecting light, healthy shine goal",
    "Natural hair texture close-up, celebrating individuality"
  ],

  people: [
    "Professional hair colorist at work, focused and skilled, candid portrait",
    "Smiling client during salon consultation, welcoming atmosphere",
    "Diverse group of women with beautiful hair, inclusive beauty",
    "Mother and daughter salon day, bonding experience",
    "Bride getting hair done on wedding day, emotional moment",
    "Confident woman with silver gray hair, embracing natural beauty",
    "Young professional with fresh highlights, career ready look",
    "Mature woman with elegant hair color, ageless beauty",
    "Best friends with complementary hair colors, friendship goals",
    "Woman admiring her new hair color in mirror, transformation joy"
  ],

  seasonal: [
    "Summer-ready blonde highlights, beach season hair goals",
    "Rich fall hair color, warm tones for autumn, cozy vibes",
    "Holiday party-ready hairstyle, festive and glamorous",
    "Spring hair refresh, lighter brighter color, new season energy",
    "Winter maintenance appointment, keeping color fresh",
    "Back to school haircut, fresh start energy",
    "Valentine's Day romantic hairstyle, date night ready",
    "New Year new hair transformation, fresh start",
    "Summer wedding guest hair, outdoor ceremony ready",
    "End of summer color correction, repairing sun damage"
  ],

  process: [
    "Hair consultation with color swatches, finding the perfect shade",
    "Foil placement for dimensional highlights, technique in action",
    "Color processing time, client relaxing with magazine",
    "Rinsing out hair color, revealing the transformation",
    "Blow dry technique for volume and movement",
    "Final styling touches, finishing the look",
    "Before and after transformation moment, dramatic change",
    "Color correction journey, multiple session progress",
    "Touch up appointment, maintaining beautiful color",
    "New client welcome, first salon visit experience"
  ],

  ambiance: [
    "Warm afternoon light in salon, golden hour beauty",
    "Rainy day at cozy salon, self-care retreat",
    "Early morning salon prep, fresh start energy",
    "Evening appointment atmosphere, after work relaxation",
    "Tropical plants in salon setting, Florida oasis vibes",
    "Minimalist salon design, clean and calming",
    "Music and coffee at salon station, good vibes",
    "Natural elements in salon decor, organic aesthetic",
    "Sunset light through salon windows, magical hour",
    "Peaceful salon environment, stress-free experience"
  ]
};

// Flatten all prompts into a single array
function getAllPrompts() {
  const allPrompts = [];
  for (const category of Object.keys(IMAGE_PROMPTS)) {
    for (const prompt of IMAGE_PROMPTS[category]) {
      allPrompts.push({
        category,
        prompt,
        filename: generateFilename(category, prompt)
      });
    }
  }
  return allPrompts;
}

function generateFilename(category, prompt) {
  const slug = prompt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 50)
    .replace(/-+$/, '');
  const hash = Buffer.from(prompt).toString('base64').substring(0, 6);
  return `${category}-${slug}-${hash}.jpg`;
}

// Together AI API (Flux model - excellent quality, affordable)
async function generateWithTogether(prompt, filename) {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) {
    console.log('TOGETHER_API_KEY not set. Skipping Together AI generation.');
    return null;
  }

  const payload = JSON.stringify({
    model: 'black-forest-labs/FLUX.1-schnell-Free',
    prompt: prompt + ', professional photography, high quality, realistic, no text, no watermark',
    width: 1024,
    height: 768,
    steps: 4,
    n: 1,
    response_format: 'b64_json'
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.together.xyz',
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.data && result.data[0] && result.data[0].b64_json) {
            resolve(result.data[0].b64_json);
          } else {
            console.error('Unexpected response:', result);
            resolve(null);
          }
        } catch (e) {
          console.error('Parse error:', e.message);
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.error('Request error:', e.message);
      resolve(null);
    });

    req.write(payload);
    req.end();
  });
}

// OpenAI DALL-E API
async function generateWithOpenAI(prompt, filename) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log('OPENAI_API_KEY not set. Skipping OpenAI generation.');
    return null;
  }

  const payload = JSON.stringify({
    model: 'dall-e-3',
    prompt: prompt + ', professional salon photography, realistic, high quality',
    n: 1,
    size: '1024x1024',
    response_format: 'b64_json'
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.data && result.data[0] && result.data[0].b64_json) {
            resolve(result.data[0].b64_json);
          } else {
            console.error('Unexpected response:', result);
            resolve(null);
          }
        } catch (e) {
          console.error('Parse error:', e.message);
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.error('Request error:', e.message);
      resolve(null);
    });

    req.write(payload);
    req.end();
  });
}

// Save base64 image to file
function saveImage(base64Data, outputPath) {
  const buffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(outputPath, buffer);
  console.log(`  Saved: ${path.basename(outputPath)}`);
}

// Generate a manifest file for easy reference
function saveManifest(images, outputDir) {
  const manifest = {
    generated: new Date().toISOString(),
    totalImages: images.length,
    categories: {},
    images: images.map(img => ({
      filename: img.filename,
      category: img.category,
      prompt: img.prompt,
      path: path.join(outputDir, img.filename)
    }))
  };

  // Count by category
  for (const img of images) {
    manifest.categories[img.category] = (manifest.categories[img.category] || 0) + 1;
  }

  fs.writeFileSync(
    path.join(outputDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  console.log(`\nManifest saved to: ${path.join(outputDir, 'manifest.json')}`);
}

// Generate HTML preview page
function generatePreviewPage(images, outputDir) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Salon Images</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 p-8">
  <div class="max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">Generated Salon Images (${images.length})</h1>

    <div class="mb-8 flex flex-wrap gap-2">
      <button onclick="filterCategory('all')" class="px-4 py-2 bg-gray-800 text-white rounded">All</button>
      ${Object.keys(IMAGE_PROMPTS).map(cat =>
        `<button onclick="filterCategory('${cat}')" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded">${cat}</button>`
      ).join('\n      ')}
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" id="imageGrid">
      ${images.map(img => `
      <div class="image-card bg-white rounded-lg shadow overflow-hidden" data-category="${img.category}">
        <img src="${img.filename}" alt="${img.category}" class="w-full h-48 object-cover" loading="lazy">
        <div class="p-3">
          <span class="text-xs bg-gray-100 px-2 py-1 rounded">${img.category}</span>
          <p class="text-xs text-gray-500 mt-2 line-clamp-2">${img.prompt}</p>
        </div>
      </div>`).join('\n      ')}
    </div>
  </div>

  <script>
    function filterCategory(category) {
      const cards = document.querySelectorAll('.image-card');
      cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(outputDir, 'preview.html'), html);
  console.log(`Preview page saved to: ${path.join(outputDir, 'preview.html')}`);
}

// Sleep utility
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Main execution
async function main() {
  console.log('='.repeat(60));
  console.log('SALON IMAGE GENERATOR');
  console.log('='.repeat(60));
  console.log(`Config: ${JSON.stringify(CONFIG, null, 2)}`);
  console.log('');

  // Create output directory
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    console.log(`Created output directory: ${CONFIG.outputDir}`);
  }

  // Get prompts (limit to count)
  const allPrompts = getAllPrompts();
  const prompts = allPrompts.slice(0, CONFIG.count);

  console.log(`\nTotal prompts available: ${allPrompts.length}`);
  console.log(`Generating ${prompts.length} images...\n`);

  const successfulImages = [];

  // Check which API to use
  const generateFunction = CONFIG.api === 'openai'
    ? generateWithOpenAI
    : generateWithTogether;

  // Process in batches
  for (let i = 0; i < prompts.length; i += CONFIG.batchSize) {
    const batch = prompts.slice(i, i + CONFIG.batchSize);
    console.log(`\nBatch ${Math.floor(i/CONFIG.batchSize) + 1}/${Math.ceil(prompts.length/CONFIG.batchSize)}`);

    for (const item of batch) {
      console.log(`  Generating: ${item.category} - ${item.filename.substring(0, 40)}...`);

      try {
        const base64Image = await generateFunction(item.prompt, item.filename);

        if (base64Image) {
          const outputPath = path.join(CONFIG.outputDir, item.filename);
          saveImage(base64Image, outputPath);
          successfulImages.push(item);
        } else {
          console.log(`    Skipped (no API key or error)`);
        }
      } catch (error) {
        console.error(`    Error: ${error.message}`);
      }
    }

    // Delay between batches to respect rate limits
    if (i + CONFIG.batchSize < prompts.length) {
      console.log(`  Waiting ${CONFIG.delayBetweenBatches/1000}s before next batch...`);
      await sleep(CONFIG.delayBetweenBatches);
    }
  }

  // Save manifest and preview
  if (successfulImages.length > 0) {
    saveManifest(successfulImages, CONFIG.outputDir);
    generatePreviewPage(successfulImages, CONFIG.outputDir);
  }

  console.log('\n' + '='.repeat(60));
  console.log(`COMPLETE: ${successfulImages.length}/${prompts.length} images generated`);
  console.log('='.repeat(60));

  // Print category breakdown
  const categoryCounts = {};
  for (const img of successfulImages) {
    categoryCounts[img.category] = (categoryCounts[img.category] || 0) + 1;
  }
  console.log('\nBy category:');
  for (const [cat, count] of Object.entries(categoryCounts)) {
    console.log(`  ${cat}: ${count}`);
  }

  if (successfulImages.length === 0) {
    console.log('\n⚠️  No images generated. Please set one of these API keys:');
    console.log('   - TOGETHER_API_KEY (recommended - free tier available)');
    console.log('   - OPENAI_API_KEY (DALL-E 3)');
    console.log('\nGet a free Together AI key at: https://api.together.xyz/');
  }
}

// Run
main().catch(console.error);
