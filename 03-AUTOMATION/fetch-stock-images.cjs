#!/usr/bin/env node
/**
 * Salon Stock Image Fetcher
 *
 * Downloads high-quality, royalty-free images from Unsplash for salon microsites.
 * These are REAL photos, not AI-generated, and are free to use commercially.
 *
 * Usage:
 *   node fetch-stock-images.js
 *   node fetch-stock-images.js --count=100
 *
 * No API key needed for basic usage (uses Unsplash Source)
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
  outputDir: args.output || './stock-images',
  width: 1200,
  height: 800
};

// Search queries organized by category for salon-related images
const SEARCH_QUERIES = {
  hairColor: [
    'hair color salon',
    'balayage highlights',
    'blonde hair woman',
    'brunette hair style',
    'hair dye',
    'auburn hair',
    'caramel highlights',
    'hair color transformation',
    'ombre hair',
    'platinum blonde'
  ],
  salon: [
    'hair salon interior',
    'salon chair',
    'salon mirror',
    'beauty salon',
    'hair stylist working',
    'hair wash station',
    'salon waiting area',
    'modern salon',
    'boutique salon',
    'luxury hair salon'
  ],
  hairstyles: [
    'beach waves hair',
    'blowout hairstyle',
    'bob haircut',
    'long layered hair',
    'bridal updo',
    'curly hair styled',
    'modern haircut',
    'ponytail',
    'healthy shiny hair',
    'textured hair'
  ],
  beauty: [
    'woman hair portrait',
    'hair model',
    'hair shine',
    'hair texture',
    'beautiful hair',
    'hair care',
    'hair treatment',
    'hair brushing',
    'hair products',
    'hair tools'
  ],
  lifestyle: [
    'woman confident smile',
    'woman professional',
    'woman beach florida',
    'women friends',
    'wedding hair',
    'self care',
    'woman morning routine',
    'woman mirror',
    'woman relaxing',
    'woman outdoor'
  ],
  florida: [
    'palm beach florida',
    'delray beach',
    'florida tropical',
    'beach lifestyle',
    'coastal living',
    'florida palm trees',
    'south florida',
    'florida sunshine',
    'beach town',
    'florida boutique'
  ]
};

// Download image from URL
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);

    const request = (urlToFetch) => {
      https.get(urlToFetch, (response) => {
        // Handle redirects
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
        fs.unlink(filepath, () => {}); // Delete partial file
        reject(err);
      });
    };

    request(url);
  });
}

// Generate unique filename
function generateFilename(category, query, index) {
  const slug = query
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 30);
  return `${category}-${slug}-${index}.jpg`;
}

// Sleep utility
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Main execution
async function main() {
  console.log('='.repeat(60));
  console.log('SALON STOCK IMAGE FETCHER');
  console.log('='.repeat(60));
  console.log(`Target: ${CONFIG.count} images`);
  console.log(`Output: ${CONFIG.outputDir}`);
  console.log(`Size: ${CONFIG.width}x${CONFIG.height}`);
  console.log('');

  // Create output directory
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    console.log(`Created: ${CONFIG.outputDir}`);
  }

  // Build list of images to fetch
  const imagesToFetch = [];
  let totalIndex = 0;

  for (const [category, queries] of Object.entries(SEARCH_QUERIES)) {
    for (const query of queries) {
      if (imagesToFetch.length >= CONFIG.count) break;

      // Fetch multiple variations per query using sig parameter for uniqueness
      for (let i = 0; i < 2; i++) {
        if (imagesToFetch.length >= CONFIG.count) break;

        totalIndex++;
        const filename = generateFilename(category, query, totalIndex);
        const sig = `${query}-${Date.now()}-${i}`;

        // Using Unsplash Source API (no key required)
        const url = `https://source.unsplash.com/${CONFIG.width}x${CONFIG.height}/?${encodeURIComponent(query)}&sig=${encodeURIComponent(sig)}`;

        imagesToFetch.push({
          category,
          query,
          filename,
          url
        });
      }
    }
    if (imagesToFetch.length >= CONFIG.count) break;
  }

  console.log(`Fetching ${imagesToFetch.length} images...\n`);

  const successfulImages = [];
  let failCount = 0;

  for (let i = 0; i < imagesToFetch.length; i++) {
    const item = imagesToFetch[i];
    const outputPath = path.join(CONFIG.outputDir, item.filename);

    process.stdout.write(`[${i + 1}/${imagesToFetch.length}] ${item.category}: ${item.query.substring(0, 30)}... `);

    try {
      await downloadImage(item.url, outputPath);

      // Check file size (skip if too small - likely an error image)
      const stats = fs.statSync(outputPath);
      if (stats.size < 10000) {
        fs.unlinkSync(outputPath);
        console.log('skip (too small)');
        failCount++;
        continue;
      }

      console.log('OK');
      successfulImages.push({
        ...item,
        path: outputPath,
        size: stats.size
      });
    } catch (error) {
      console.log(`fail: ${error.message}`);
      failCount++;
    }

    // Rate limiting - be nice to free service
    if (i < imagesToFetch.length - 1) {
      await sleep(500);
    }
  }

  // Save manifest
  const manifest = {
    generated: new Date().toISOString(),
    source: 'Unsplash (royalty-free)',
    license: 'Unsplash License - Free for commercial use',
    totalImages: successfulImages.length,
    categories: {},
    images: successfulImages
  };

  for (const img of successfulImages) {
    manifest.categories[img.category] = (manifest.categories[img.category] || 0) + 1;
  }

  fs.writeFileSync(
    path.join(CONFIG.outputDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  // Generate preview HTML
  const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stock Images Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 p-8">
  <div class="max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold mb-2">Stock Images for Salon Microsites</h1>
    <p class="text-gray-600 mb-8">
      ${successfulImages.length} royalty-free images from Unsplash.
      <span class="text-green-600">Free for commercial use.</span>
    </p>

    <div class="mb-8 flex flex-wrap gap-2">
      <button onclick="filterCategory('all')" class="px-4 py-2 bg-gray-800 text-white rounded">All</button>
      ${Object.keys(SEARCH_QUERIES).map(cat =>
        `<button onclick="filterCategory('${cat}')" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded">${cat}</button>`
      ).join('\n      ')}
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" id="imageGrid">
      ${successfulImages.map(img => `
      <div class="image-card bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition" data-category="${img.category}" onclick="copyFilename('${img.filename}')">
        <img src="${img.filename}" alt="${img.query}" class="w-full h-48 object-cover" loading="lazy">
        <div class="p-3">
          <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">${img.category}</span>
          <p class="text-xs text-gray-500 mt-2">${img.query}</p>
          <p class="text-xs text-gray-400 mt-1">${img.filename}</p>
        </div>
      </div>`).join('\n      ')}
    </div>

    <div id="toast" class="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg hidden">
      Copied!
    </div>
  </div>

  <script>
    function filterCategory(category) {
      const cards = document.querySelectorAll('.image-card');
      cards.forEach(card => {
        card.style.display = (category === 'all' || card.dataset.category === category) ? 'block' : 'none';
      });
    }

    function copyFilename(filename) {
      navigator.clipboard.writeText(filename);
      const toast = document.getElementById('toast');
      toast.textContent = 'Copied: ' + filename;
      toast.classList.remove('hidden');
      setTimeout(() => toast.classList.add('hidden'), 2000);
    }
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(CONFIG.outputDir, 'preview.html'), previewHtml);

  console.log('\n' + '='.repeat(60));
  console.log('COMPLETE');
  console.log('='.repeat(60));
  console.log(`Success: ${successfulImages.length}/${imagesToFetch.length}`);
  console.log(`Failed: ${failCount}`);
  console.log(`\nOutput: ${CONFIG.outputDir}`);
  console.log(`Preview: ${path.join(CONFIG.outputDir, 'preview.html')}`);

  console.log('\nBy category:');
  for (const [cat, count] of Object.entries(manifest.categories)) {
    console.log(`  ${cat}: ${count}`);
  }
}

// Run
main().catch(console.error);
