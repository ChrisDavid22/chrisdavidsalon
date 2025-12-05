#!/usr/bin/env node

/**
 * Download photos from Chris David Salon's Google Business Profile
 * Uses Google Places API to fetch photo references and download images
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const OUTPUT_DIR = path.join(__dirname, '../images/gbp');
const MANIFEST_FILE = path.join(OUTPUT_DIR, 'manifest.json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`✓ Created directory: ${OUTPUT_DIR}`);
}

// Chris David Salon Place ID (updated Dec 2024)
const PLACE_ID = 'ChIJxTZ8Id3f2IgR2XMxX_zRKSg';

async function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);

    protocol.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        return downloadFile(response.headers.location, filepath).then(resolve).catch(reject);
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
  });
}

async function getPlaceDetails() {
  console.log('\n🔍 Fetching place details from Google Places API...');

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=name,photos,rating,user_ratings_total&key=${API_KEY}`;

  try {
    const data = await fetchJSON(url);

    if (data.status !== 'OK') {
      throw new Error(`API Error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    return data.result;
  } catch (error) {
    throw new Error(`Failed to fetch place details: ${error.message}`);
  }
}

async function downloadPhotos(photos) {
  console.log(`\n📸 Found ${photos.length} photos. Starting download...\n`);

  const manifest = {
    downloadedAt: new Date().toISOString(),
    businessName: 'Chris David Salon',
    placeId: PLACE_ID,
    totalPhotos: photos.length,
    photos: []
  };

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const photoNum = String(i + 1).padStart(3, '0');

    // Determine photo category based on attributions or metadata
    let category = 'general';
    if (photo.html_attributions && photo.html_attributions[0]) {
      const attr = photo.html_attributions[0].toLowerCase();
      if (attr.includes('owner') || attr.includes('business')) {
        category = 'owner';
      } else {
        category = 'customer';
      }
    }

    const filename = `chris-david-salon-${photoNum}-${category}.jpg`;
    const filepath = path.join(OUTPUT_DIR, filename);

    // Google Photos API URL with max width (up to 4800px available)
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=2400&photo_reference=${photo.photo_reference}&key=${API_KEY}`;

    try {
      console.log(`  [${i + 1}/${photos.length}] Downloading ${filename}...`);
      await downloadFile(photoUrl, filepath);

      const stats = fs.statSync(filepath);
      const sizeKB = Math.round(stats.size / 1024);

      manifest.photos.push({
        filename,
        category,
        width: photo.width,
        height: photo.height,
        sizeKB,
        attributions: photo.html_attributions,
        downloadedAt: new Date().toISOString()
      });

      successCount++;
      console.log(`    ✓ Downloaded (${sizeKB} KB)`);

      // Rate limiting - wait 500ms between requests
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`    ✗ Failed: ${error.message}`);
      failCount++;
    }
  }

  // Save manifest
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));

  console.log(`\n✅ Download complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log(`   Manifest saved to: ${MANIFEST_FILE}\n`);

  return manifest;
}

async function generateCategorizedReport(manifest) {
  console.log('📊 Photo Summary by Category:\n');

  const categories = {
    owner: [],
    customer: [],
    general: []
  };

  manifest.photos.forEach(photo => {
    if (categories[photo.category]) {
      categories[photo.category].push(photo);
    }
  });

  console.log(`   Owner/Business Photos: ${categories.owner.length}`);
  console.log(`   Customer Photos: ${categories.customer.length}`);
  console.log(`   General Photos: ${categories.general.length}`);
  console.log(`   Total: ${manifest.photos.length}\n`);

  // Create detailed report
  const reportPath = path.join(OUTPUT_DIR, 'PHOTO_REPORT.md');
  let report = `# Chris David Salon - Google Business Profile Photos\n\n`;
  report += `**Downloaded:** ${new Date(manifest.downloadedAt).toLocaleString()}\n`;
  report += `**Total Photos:** ${manifest.totalPhotos}\n`;
  report += `**Place ID:** ${manifest.placeId}\n\n`;

  report += `## Photo Breakdown\n\n`;
  report += `| Category | Count | Description |\n`;
  report += `|----------|-------|-------------|\n`;
  report += `| Owner/Business | ${categories.owner.length} | Photos uploaded by salon owner |\n`;
  report += `| Customer | ${categories.customer.length} | Photos uploaded by customers |\n`;
  report += `| General | ${categories.general.length} | Uncategorized photos |\n\n`;

  report += `## All Photos\n\n`;

  manifest.photos.forEach((photo, i) => {
    report += `### ${i + 1}. ${photo.filename}\n`;
    report += `- **Category:** ${photo.category}\n`;
    report += `- **Dimensions:** ${photo.width} x ${photo.height}\n`;
    report += `- **Size:** ${photo.sizeKB} KB\n`;
    if (photo.attributions && photo.attributions.length > 0) {
      report += `- **Attribution:** ${photo.attributions[0].replace(/<[^>]*>/g, '')}\n`;
    }
    report += `\n`;
  });

  fs.writeFileSync(reportPath, report);
  console.log(`📄 Detailed report saved to: ${reportPath}\n`);
}

// Main execution
(async () => {
  try {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║   Chris David Salon - GBP Photo Downloader          ║');
    console.log('╚═══════════════════════════════════════════════════════╝');

    if (!API_KEY) {
      throw new Error('GOOGLE_PLACES_API_KEY not found in .env.local');
    }

    const placeDetails = await getPlaceDetails();

    console.log(`✓ Business Name: ${placeDetails.name}`);
    console.log(`✓ Rating: ${placeDetails.rating} (${placeDetails.user_ratings_total} reviews)`);

    if (!placeDetails.photos || placeDetails.photos.length === 0) {
      console.log('\n⚠️  No photos found for this place.');
      process.exit(0);
    }

    const manifest = await downloadPhotos(placeDetails.photos);
    await generateCategorizedReport(manifest);

    console.log('✨ All done! Photos are ready in:');
    console.log(`   ${OUTPUT_DIR}\n`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
})();
