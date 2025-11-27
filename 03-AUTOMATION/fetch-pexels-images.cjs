#!/usr/bin/env node
/**
 * Pexels Salon Image Fetcher
 *
 * Downloads high-quality, royalty-free images from Pexels API.
 * Free API - get key at https://www.pexels.com/api/
 *
 * Usage:
 *   PEXELS_API_KEY=xxx node fetch-pexels-images.cjs
 *   node fetch-pexels-images.cjs --count=100
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
  outputDir: args.output || './pexels-images',
  apiKey: process.env.PEXELS_API_KEY || ''
};

// Search queries for salon-related images
const SEARCH_QUERIES = [
  'hair salon',
  'hair stylist',
  'hair color',
  'balayage',
  'blonde hair woman',
  'brunette portrait',
  'hair care',
  'beauty salon interior',
  'hair brush',
  'hairstyle',
  'woman mirror',
  'hair treatment',
  'wedding hair',
  'beach waves hair',
  'curly hair',
  'shiny hair',
  'woman confident',
  'professional woman',
  'woman smile',
  'beauty portrait'
];

// Fetch from Pexels API
function fetchPexels(query, page = 1, perPage = 15) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.pexels.com',
      path: `/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`,
      method: 'GET',
      headers: {
        'Authorization': CONFIG.apiKey
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Download image
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);

    const request = (urlToFetch) => {
      const protocol = urlToFetch.startsWith('https') ? https : require('http');
      protocol.get(urlToFetch, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          request(response.headers.location);
          return;
        }
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(filepath);
        });
      }).on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
    };

    request(url);
  });
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('='.repeat(60));
  console.log('PEXELS SALON IMAGE FETCHER');
  console.log('='.repeat(60));

  if (!CONFIG.apiKey) {
    console.log('\n⚠️  No PEXELS_API_KEY found.');
    console.log('\nTo use this script:');
    console.log('1. Get a free API key at: https://www.pexels.com/api/');
    console.log('2. Run: PEXELS_API_KEY=your_key node fetch-pexels-images.cjs');
    console.log('\nAlternatively, use the curated image URLs approach.\n');

    // Generate curated URLs file instead
    await generateCuratedUrls();
    return;
  }

  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  const successfulImages = [];
  let imageCount = 0;

  for (const query of SEARCH_QUERIES) {
    if (imageCount >= CONFIG.count) break;

    console.log(`\nSearching: ${query}`);

    try {
      const result = await fetchPexels(query, 1, Math.min(10, CONFIG.count - imageCount));

      if (result.photos) {
        for (const photo of result.photos) {
          if (imageCount >= CONFIG.count) break;

          const filename = `${query.replace(/\s+/g, '-')}-${photo.id}.jpg`;
          const filepath = path.join(CONFIG.outputDir, filename);
          const imageUrl = photo.src.large;

          process.stdout.write(`  Downloading ${filename}... `);

          try {
            await downloadImage(imageUrl, filepath);
            console.log('OK');
            successfulImages.push({
              filename,
              query,
              photographer: photo.photographer,
              url: photo.url,
              src: imageUrl
            });
            imageCount++;
          } catch (e) {
            console.log(`fail: ${e.message}`);
          }

          await sleep(100);
        }
      }
    } catch (e) {
      console.log(`  Error: ${e.message}`);
    }

    await sleep(500);
  }

  // Save manifest
  fs.writeFileSync(
    path.join(CONFIG.outputDir, 'manifest.json'),
    JSON.stringify({
      generated: new Date().toISOString(),
      source: 'Pexels',
      license: 'Pexels License - Free for commercial use with attribution',
      totalImages: successfulImages.length,
      images: successfulImages
    }, null, 2)
  );

  console.log('\n' + '='.repeat(60));
  console.log(`Downloaded ${successfulImages.length} images to ${CONFIG.outputDir}`);
  console.log('='.repeat(60));
}

// Generate curated URLs for use without API key
async function generateCuratedUrls() {
  console.log('Generating curated image URL list...\n');

  // High-quality salon/beauty images from various free sources
  // These are direct URLs to royalty-free images
  const curatedImages = {
    hairStyling: [
      { url: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1200', desc: 'Woman with beautiful hair' },
      { url: 'https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=1200', desc: 'Hair styling' },
      { url: 'https://images.pexels.com/photos/3993398/pexels-photo-3993398.jpeg?auto=compress&cs=tinysrgb&w=1200', desc: 'Blonde hair' },
      { url: 'https://images.pexels.com/photos/3993467/pexels-photo-3993467.jpeg?auto=compress&cs=tinysrgb&w=1200', desc: 'Hair color' },
      { url: 'https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=1200', desc: 'Hair treatment' }
    ],
    salon: [
      { url: 'https://images.pexels.com/photos/3992876/pexels-photo-3992876.jpeg?auto=compress&cs=tinysrgb&w=1200', desc: 'Salon interior' },
      { url: 'https://images.pexels.com/photos/3992870/pexels-photo-3992870.jpeg?auto=compress&cs=tinysrgb&w=1200', desc: 'Salon chair' },
      { url: 'https://images.pexels.com/photos/3993308/pexels-photo-3993308.jpeg?auto=compress&cs=tinysrgb&w=1200', desc: 'Styling station' },
      { url: 'https://images.pexels.com/photos/3065096/pexels-photo-3065096.jpeg?auto=compress&cs=tinysrgb&w=1200', desc: 'Hair wash' },
      { url: 'https://images.pexels.com/photos/3993320/pexels-photo-3993320.jpeg?auto=compress&cs=tinysrgb&w=1200', desc: 'Salon products' }
    ],
    portraits: [
      { url: 'https://images.pexels.com/photos/3993435/pexels-photo-3993435.jpeg?auto=compress&cs=tinysrgb&w=1200', desc: 'Woman portrait beautiful hair' },
      { url: 'https://images.pexels.com/photos/3993444/pexels-photo-3993444.jpeg?auto=compress&cs=tinysrgb&w=1200', desc: 'Hair shine' },
      { url: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1200', desc: 'Professional woman' },
      { url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1200', desc: 'Woman smiling' },
      { url: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=1200', desc: 'Portrait confidence' }
    ],
    lifestyle: [
      { url: 'https://images.pexels.com/photos/3764119/pexels-photo-3764119.jpeg?auto=compress&cs=tinysrgb&w=1200', desc: 'Beach lifestyle' },
      { url: 'https://images.pexels.com/photos/3771089/pexels-photo-3771089.jpeg?auto=compress&cs=tinysrgb&w=1200', desc: 'Self care' },
      { url: 'https://images.pexels.com/photos/3771045/pexels-photo-3771045.jpeg?auto=compress&cs=tinysrgb&w=1200', desc: 'Relaxation' },
      { url: 'https://images.pexels.com/photos/3771097/pexels-photo-3771097.jpeg?auto=compress&cs=tinysrgb&w=1200', desc: 'Spa day' },
      { url: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1200', desc: 'Friends' }
    ]
  };

  // Save curated URLs
  const outputPath = path.join(CONFIG.outputDir, 'curated-urls.json');
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(curatedImages, null, 2));
  console.log(`Saved curated URLs to: ${outputPath}`);

  // Also generate HTML/CSS snippet for microsites
  const cssSnippet = `/* Curated Image URLs for Microsites */
:root {
  --img-hero: url('https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1200');
  --img-salon: url('https://images.pexels.com/photos/3992876/pexels-photo-3992876.jpeg?auto=compress&cs=tinysrgb&w=1200');
  --img-portrait: url('https://images.pexels.com/photos/3993435/pexels-photo-3993435.jpeg?auto=compress&cs=tinysrgb&w=1200');
  --img-lifestyle: url('https://images.pexels.com/photos/3764119/pexels-photo-3764119.jpeg?auto=compress&cs=tinysrgb&w=1200');
}
`;

  fs.writeFileSync(path.join(CONFIG.outputDir, 'image-vars.css'), cssSnippet);

  // Generate direct URL list for HTML use
  let allUrls = [];
  for (const [category, images] of Object.entries(curatedImages)) {
    for (const img of images) {
      allUrls.push({ category, ...img });
    }
  }

  const urlListHtml = `<!DOCTYPE html>
<html>
<head><title>Image URLs</title></head>
<body style="font-family: sans-serif; padding: 2rem;">
<h1>Curated Image URLs for Microsites</h1>
<p>Copy these URLs directly into your HTML. All images are from Pexels (free for commercial use).</p>
${Object.entries(curatedImages).map(([cat, imgs]) => `
<h2>${cat}</h2>
<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;">
${imgs.map(img => `
<div style="border: 1px solid #ddd; padding: 1rem; border-radius: 8px;">
  <img src="${img.url}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 4px;">
  <p style="font-size: 12px; color: #666;">${img.desc}</p>
  <input type="text" value="${img.url}" style="width: 100%; font-size: 10px; padding: 4px;" onclick="this.select()">
</div>
`).join('')}
</div>
`).join('')}
</body>
</html>`;

  fs.writeFileSync(path.join(CONFIG.outputDir, 'url-list.html'), urlListHtml);
  console.log(`\nGenerated files in ${CONFIG.outputDir}:`);
  console.log('  - curated-urls.json (URLs organized by category)');
  console.log('  - image-vars.css (CSS custom properties)');
  console.log('  - url-list.html (visual browser)');

  console.log('\n📌 You can use these URLs directly in your HTML:');
  console.log('\nExample for hero image:');
  console.log('  <img src="https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Beautiful hair">');
}

main().catch(console.error);
