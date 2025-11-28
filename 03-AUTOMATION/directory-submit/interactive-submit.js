/**
 * Interactive Directory Submission Helper
 * Opens browser windows pre-filled with business info for quick manual submission
 *
 * Usage: node interactive-submit.js [directory]
 */

import { chromium } from 'playwright';
import { BUSINESS, getFullAddress } from './business-config.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

// Directory URLs and submission paths
const DIRECTORIES = {
  bing: {
    name: "Bing Places for Business",
    url: "https://www.bingplaces.com",
    instructions: `
    1. Click "Get started" or "Sign in"
    2. Sign in with Microsoft account (or create one with chrisdavidhair@gmail.com)
    3. Look for "Import from Google" option - this is easiest
    4. If no import, add business manually
    5. Verify NAP: ${BUSINESS.name}, ${getFullAddress()}, ${BUSINESS.phone}
    `
  },
  apple: {
    name: "Apple Business Connect",
    url: "https://businessconnect.apple.com",
    instructions: `
    1. Sign in with Apple ID
    2. Search for "${BUSINESS.name}" in ${BUSINESS.city}, ${BUSINESS.stateCode}
    3. If found, click "Claim this business"
    4. If not found, add new business
    5. Verify info: ${BUSINESS.name}, ${getFullAddress()}, ${BUSINESS.phone}
    `
  },
  foursquare: {
    name: "Foursquare",
    url: "https://foursquare.com/venue/add",
    instructions: `
    1. Create account or sign in
    2. Add venue: ${BUSINESS.name}
    3. Address: ${getFullAddress()}
    4. Phone: ${BUSINESS.phone}
    5. Category: ${BUSINESS.primaryCategory}
    `
  },
  yellowpages: {
    name: "Yellow Pages",
    url: "https://www.yp.com/listings/add",
    instructions: `
    1. Click "Add a listing" or similar
    2. Business name: ${BUSINESS.name}
    3. Address: ${getFullAddress()}
    4. Phone: ${BUSINESS.phone}
    5. Category: ${BUSINESS.primaryCategory}
    `
  },
  manta: {
    name: "Manta",
    url: "https://www.manta.com/claim",
    instructions: `
    1. Search for "${BUSINESS.name}" in ${BUSINESS.city}, ${BUSINESS.stateCode}
    2. If found, claim the listing
    3. If not found, add new business
    4. Complete all profile fields
    `
  },
  mapquest: {
    name: "MapQuest",
    url: "https://www.mapquest.com/my-business",
    instructions: `
    1. Click "Add your business"
    2. Business: ${BUSINESS.name}
    3. Address: ${getFullAddress()}
    4. Phone: ${BUSINESS.phone}
    `
  }
};

// Pre-filled data to copy
const COPY_DATA = `
═══════════════════════════════════════════════════════════
BUSINESS INFORMATION - COPY & PASTE
═══════════════════════════════════════════════════════════

Business Name: ${BUSINESS.name}
Street Address: ${BUSINESS.streetAddress}
City: ${BUSINESS.city}
State: ${BUSINESS.state}
ZIP: ${BUSINESS.zip}
Phone: ${BUSINESS.phone}
Website: ${BUSINESS.website}
Email: ${BUSINESS.email}

Primary Category: ${BUSINESS.primaryCategory}
Other Categories: ${BUSINESS.categories.join(', ')}

Hours:
- Sunday: ${BUSINESS.hours.sunday.hours}
- Monday: ${BUSINESS.hours.monday.hours}
- Tuesday: ${BUSINESS.hours.tuesday.hours}
- Wednesday: ${BUSINESS.hours.wednesday.hours}
- Thursday: ${BUSINESS.hours.thursday.hours}
- Friday: ${BUSINESS.hours.friday.hours}
- Saturday: ${BUSINESS.hours.saturday.hours}

Short Description (for forms):
${BUSINESS.descriptions.short}

═══════════════════════════════════════════════════════════
`;

async function openDirectory(dirKey) {
  const dir = DIRECTORIES[dirKey];
  if (!dir) {
    console.log(`Unknown directory: ${dirKey}`);
    console.log(`Available: ${Object.keys(DIRECTORIES).join(', ')}`);
    return;
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`📍 Opening: ${dir.name}`);
  console.log('═'.repeat(60));
  console.log(COPY_DATA);
  console.log('\n📋 INSTRUCTIONS:');
  console.log(dir.instructions);
  console.log('\n' + '═'.repeat(60));

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(dir.url);

  console.log('\n✅ Browser opened. Complete the submission manually.');
  console.log('   Press Enter when done or type "skip" to move to next...\n');

  const response = await ask('> ');

  await browser.close();
  return response.toLowerCase() !== 'skip';
}

async function runAll() {
  console.log('\n🚀 Chris David Salon - Directory Submission Helper');
  console.log('═'.repeat(60));
  console.log('This will open each directory in a browser window.');
  console.log('Complete each submission manually with the provided info.');
  console.log('═'.repeat(60));

  for (const dirKey of Object.keys(DIRECTORIES)) {
    const continueSubmission = await openDirectory(dirKey);
    if (!continueSubmission) {
      console.log(`\n⏭️  Skipped ${DIRECTORIES[dirKey].name}`);
    } else {
      console.log(`\n✅ Completed ${DIRECTORIES[dirKey].name}`);
    }
  }

  console.log('\n🎉 All directories processed!');
  console.log('Remember to verify email confirmations at chrisdavidhair@gmail.com');
  rl.close();
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'all') {
    await runAll();
  } else if (command === 'list') {
    console.log('\nAvailable directories:');
    for (const [key, dir] of Object.entries(DIRECTORIES)) {
      console.log(`  ${key}: ${dir.name}`);
    }
  } else if (command === 'info') {
    console.log(COPY_DATA);
  } else if (DIRECTORIES[command]) {
    await openDirectory(command);
    rl.close();
  } else {
    console.log(`Unknown command: ${command}`);
    console.log('Usage: node interactive-submit.js [directory|all|list|info]');
    rl.close();
  }
}

main().catch(console.error);
