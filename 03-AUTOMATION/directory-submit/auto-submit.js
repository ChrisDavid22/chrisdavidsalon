/**
 * Directory Auto-Submission Script
 * Automates business listing submissions using Playwright
 *
 * Usage:
 *   node auto-submit.js              # Run all pending submissions
 *   node auto-submit.js bing         # Submit to Bing only
 *   node auto-submit.js check        # Check which directories need submission
 */

import { chromium } from 'playwright';
import { BUSINESS, getFullAddress } from './business-config.js';
import fs from 'fs';
import path from 'path';

// Configuration
const CONFIG = {
  headless: false,  // Set to true for background execution
  slowMo: 100,      // Slow down actions for reliability
  timeout: 90000,   // 90 second timeout
  screenshotDir: './screenshots',
  logFile: './submission-log.json'
};

// Submission status tracking
let submissionLog = [];

// Helper: Take screenshot
async function screenshot(page, name) {
  if (!fs.existsSync(CONFIG.screenshotDir)) {
    fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `${CONFIG.screenshotDir}/${name}-${timestamp}.png`,
    fullPage: true
  });
}

// Helper: Log submission attempt
function logSubmission(directory, status, details = {}) {
  const entry = {
    directory,
    status,
    timestamp: new Date().toISOString(),
    ...details
  };
  submissionLog.push(entry);
  console.log(`[${status}] ${directory}: ${details.message || ''}`);
}

// Helper: Save session/cookies
async function saveSession(context, name) {
  const state = await context.storageState();
  fs.writeFileSync(`./sessions/${name}-session.json`, JSON.stringify(state, null, 2));
}

// Helper: Load session/cookies
async function loadSession(browser, name) {
  const sessionPath = `./sessions/${name}-session.json`;
  if (fs.existsSync(sessionPath)) {
    const state = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
    return await browser.newContext({ storageState: state });
  }
  return await browser.newContext();
}

// ============================================
// DIRECTORY SUBMISSION FUNCTIONS
// ============================================

/**
 * Bing Places - Import from Google
 * This is the easiest - just needs Microsoft login and Google import
 */
async function submitToBing(browser) {
  console.log('\n📍 Starting Bing Places submission...');

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Go to Bing Places
    await page.goto('https://www.bingplaces.com/', { waitUntil: 'networkidle' });
    await screenshot(page, 'bing-01-homepage');

    // Look for "Import from Google" or sign in
    const importButton = await page.$('text=Import from Google');
    const signInButton = await page.$('text=Sign in');

    if (importButton) {
      await importButton.click();
      logSubmission('Bing Places', 'IN_PROGRESS', {
        message: 'Found Import from Google button - requires Microsoft login'
      });
    } else if (signInButton) {
      logSubmission('Bing Places', 'NEEDS_AUTH', {
        message: 'Requires Microsoft account login first',
        action: 'Login manually, then run script again'
      });
    }

    await screenshot(page, 'bing-02-after-click');

    // Save session for reuse
    if (!fs.existsSync('./sessions')) fs.mkdirSync('./sessions');
    await saveSession(context, 'bing');

    return { success: false, needsAuth: true, directory: 'Bing Places' };

  } catch (error) {
    logSubmission('Bing Places', 'ERROR', { message: error.message });
    await screenshot(page, 'bing-error');
    return { success: false, error: error.message };
  } finally {
    await context.close();
  }
}

/**
 * Apple Business Connect
 * Requires Apple ID authentication
 */
async function submitToApple(browser) {
  console.log('\n🍎 Starting Apple Business Connect submission...');

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('https://businessconnect.apple.com/', { waitUntil: 'networkidle' });
    await screenshot(page, 'apple-01-homepage');

    // Apple requires sign-in
    const signInButton = await page.$('text=Sign in');
    if (signInButton) {
      logSubmission('Apple Business Connect', 'NEEDS_AUTH', {
        message: 'Requires Apple ID login',
        action: 'Login with Apple ID, search for "Chris David Salon", claim business'
      });
    }

    await screenshot(page, 'apple-02-state');
    await saveSession(context, 'apple');

    return { success: false, needsAuth: true, directory: 'Apple Business Connect' };

  } catch (error) {
    logSubmission('Apple Business Connect', 'ERROR', { message: error.message });
    return { success: false, error: error.message };
  } finally {
    await context.close();
  }
}

/**
 * Foursquare Business
 * Can claim without login initially
 */
async function submitToFoursquare(browser) {
  console.log('\n📍 Starting Foursquare submission...');

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // First check if business exists
    await page.goto('https://foursquare.com/explore?mode=url&near=Delray%20Beach%2C%20FL&q=Chris%20David%20Salon', {
      waitUntil: 'networkidle'
    });
    await screenshot(page, 'foursquare-01-search');

    // Check for existing listing
    const existingListing = await page.$('text=Chris David Salon');

    if (existingListing) {
      logSubmission('Foursquare', 'EXISTS', {
        message: 'Business may already exist - needs verification',
        action: 'Click listing to claim'
      });
    } else {
      // Go to add business page
      await page.goto('https://foursquare.com/venue/add', { waitUntil: 'networkidle' });
      await screenshot(page, 'foursquare-02-add');

      logSubmission('Foursquare', 'NEEDS_AUTH', {
        message: 'Ready to add business - requires account',
        action: 'Create Foursquare account or login to add business'
      });
    }

    await saveSession(context, 'foursquare');
    return { success: false, needsAuth: true, directory: 'Foursquare' };

  } catch (error) {
    logSubmission('Foursquare', 'ERROR', { message: error.message });
    return { success: false, error: error.message };
  } finally {
    await context.close();
  }
}

/**
 * Yellow Pages
 * Free listing creation
 */
async function submitToYellowPages(browser) {
  console.log('\n📒 Starting Yellow Pages submission...');

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Check if listing exists first
    await page.goto(`https://www.yellowpages.com/search?search_terms=Chris+David+Salon&geo_location_terms=Delray+Beach%2C+FL`, {
      waitUntil: 'domcontentloaded',
      timeout: CONFIG.timeout
    });
    await screenshot(page, 'yp-01-search');

    // Look for existing listing
    const results = await page.$$('.result');
    let found = false;

    for (const result of results) {
      const text = await result.textContent();
      if (text.includes('Chris David') && text.includes('1878')) {
        found = true;
        break;
      }
    }

    if (found) {
      logSubmission('Yellow Pages', 'EXISTS', {
        message: 'Business listing found - may need to claim',
        action: 'Claim existing listing'
      });
    } else {
      logSubmission('Yellow Pages', 'NOT_FOUND', {
        message: 'No existing listing found - ready to create',
        action: 'Go to https://www.yp.com and click "Add Business"'
      });
    }

    await screenshot(page, 'yp-02-results');
    return { success: false, needsAction: true, directory: 'Yellow Pages' };

  } catch (error) {
    logSubmission('Yellow Pages', 'ERROR', { message: error.message });
    return { success: false, error: error.message };
  } finally {
    await context.close();
  }
}

/**
 * Manta Business Profile
 */
async function submitToManta(browser) {
  console.log('\n🐙 Starting Manta submission...');

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Search for existing
    await page.goto(`https://www.manta.com/search?search=Chris+David+Salon&search_location=Delray+Beach%2C+FL`, {
      waitUntil: 'domcontentloaded',
      timeout: CONFIG.timeout
    });
    await screenshot(page, 'manta-01-search');

    const existingListing = await page.$('text=Chris David');

    if (existingListing) {
      logSubmission('Manta', 'EXISTS', {
        message: 'Business may exist - needs verification',
        action: 'Click to claim profile'
      });
    } else {
      logSubmission('Manta', 'NOT_FOUND', {
        message: 'No listing found - ready to create',
        action: 'Go to https://www.manta.com/claim to add business'
      });
    }

    return { success: false, needsAction: true, directory: 'Manta' };

  } catch (error) {
    logSubmission('Manta', 'ERROR', { message: error.message });
    return { success: false, error: error.message };
  } finally {
    await context.close();
  }
}

/**
 * MapQuest Business Listing
 */
async function submitToMapQuest(browser) {
  console.log('\n🗺️ Starting MapQuest submission...');

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('https://www.mapquest.com/search/results?query=Chris%20David%20Salon&boundingBox=26.5,-80.15,26.4,-80.0', {
      waitUntil: 'domcontentloaded',
      timeout: CONFIG.timeout
    });
    await screenshot(page, 'mapquest-01-search');

    logSubmission('MapQuest', 'CHECKED', {
      message: 'Searched for existing listing',
      action: 'If not found, go to mapquest.com/my-business to add'
    });

    return { success: false, needsAction: true, directory: 'MapQuest' };

  } catch (error) {
    logSubmission('MapQuest', 'ERROR', { message: error.message });
    return { success: false, error: error.message };
  } finally {
    await context.close();
  }
}

// ============================================
// MAIN EXECUTION
// ============================================

async function checkAllDirectories(browser) {
  console.log('\n🔍 Checking all directory statuses...\n');
  console.log('Business:', BUSINESS.name);
  console.log('Address:', getFullAddress());
  console.log('Phone:', BUSINESS.phone);
  console.log('Website:', BUSINESS.website);
  console.log('\n' + '='.repeat(50) + '\n');

  // Run checks in sequence
  await submitToBing(browser);
  await submitToApple(browser);
  await submitToFoursquare(browser);
  await submitToYellowPages(browser);
  await submitToManta(browser);
  await submitToMapQuest(browser);

  return submissionLog;
}

async function runSpecificSubmission(browser, directory) {
  const dirLower = directory.toLowerCase();

  switch (dirLower) {
    case 'bing':
      return await submitToBing(browser);
    case 'apple':
      return await submitToApple(browser);
    case 'foursquare':
      return await submitToFoursquare(browser);
    case 'yellowpages':
    case 'yp':
      return await submitToYellowPages(browser);
    case 'manta':
      return await submitToManta(browser);
    case 'mapquest':
      return await submitToMapQuest(browser);
    default:
      console.log(`Unknown directory: ${directory}`);
      console.log('Available: bing, apple, foursquare, yellowpages, manta, mapquest');
      return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'check';

  console.log('🚀 Directory Auto-Submission Tool');
  console.log('================================\n');

  const browser = await chromium.launch({
    headless: CONFIG.headless,
    slowMo: CONFIG.slowMo
  });

  try {
    if (command === 'check' || command === 'all') {
      await checkAllDirectories(browser);
    } else {
      await runSpecificSubmission(browser, command);
    }

    // Save log
    fs.writeFileSync(CONFIG.logFile, JSON.stringify(submissionLog, null, 2));
    console.log(`\n📋 Log saved to ${CONFIG.logFile}`);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('SUMMARY');
    console.log('='.repeat(50));

    const needsAuth = submissionLog.filter(s => s.status === 'NEEDS_AUTH');
    const exists = submissionLog.filter(s => s.status === 'EXISTS');
    const errors = submissionLog.filter(s => s.status === 'ERROR');

    console.log(`\n⚠️  Needs Authentication: ${needsAuth.length}`);
    needsAuth.forEach(s => console.log(`   - ${s.directory}: ${s.action || s.message}`));

    console.log(`\n✅ Already Exists: ${exists.length}`);
    exists.forEach(s => console.log(`   - ${s.directory}`));

    if (errors.length > 0) {
      console.log(`\n❌ Errors: ${errors.length}`);
      errors.forEach(s => console.log(`   - ${s.directory}: ${s.message}`));
    }

    console.log('\n📌 NEXT STEPS:');
    console.log('1. Run this script with browser visible (headless: false)');
    console.log('2. When prompted for login, authenticate manually');
    console.log('3. Sessions will be saved for future runs');
    console.log('4. Alternatively, provide Gmail access for email verifications');

  } finally {
    await browser.close();
  }
}

// Run
main().catch(console.error);
