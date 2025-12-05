#!/usr/bin/env node

/**
 * Find Chris David Salon's Place ID using Google Places API
 */

import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

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

async function findPlace(query) {
  console.log(`\n🔍 Searching for: "${query}"\n`);

  const encodedQuery = encodeURIComponent(query);
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodedQuery}&inputtype=textquery&fields=place_id,name,formatted_address,rating,user_ratings_total,types,photos&key=${API_KEY}`;

  try {
    const data = await fetchJSON(url);

    if (data.status !== 'OK') {
      throw new Error(`API Error: ${data.status}`);
    }

    if (data.candidates.length === 0) {
      console.log('⚠️  No results found.');
      return null;
    }

    console.log(`✓ Found ${data.candidates.length} result(s):\n`);

    data.candidates.forEach((place, i) => {
      console.log(`Result ${i + 1}:`);
      console.log(`  Name: ${place.name}`);
      console.log(`  Address: ${place.formatted_address}`);
      console.log(`  Place ID: ${place.place_id}`);
      console.log(`  Rating: ${place.rating || 'N/A'} (${place.user_ratings_total || 0} reviews)`);
      console.log(`  Photos: ${place.photos ? place.photos.length : 0} available`);
      console.log(`  Types: ${place.types ? place.types.join(', ') : 'N/A'}`);
      console.log('');
    });

    return data.candidates[0];
  } catch (error) {
    throw new Error(`Failed to find place: ${error.message}`);
  }
}

// Try multiple search queries
(async () => {
  try {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║   Chris David Salon - Place ID Finder               ║');
    console.log('╚═══════════════════════════════════════════════════════╝');

    if (!API_KEY) {
      throw new Error('GOOGLE_PLACES_API_KEY not found in .env.local');
    }

    // Try different search queries
    const queries = [
      'Chris David Salon Delray Beach FL',
      'Chris David Salon 1878C Dr Andres Way Delray Beach',
      'Chris David Salon 403 E Atlantic Ave Delray Beach',
      'Chris David Salon (561) 299-0950'
    ];

    for (const query of queries) {
      const result = await findPlace(query);
      if (result) {
        console.log('✅ Recommended Place ID:', result.place_id);
        break;
      }
      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
})();
