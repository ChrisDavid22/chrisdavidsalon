#!/usr/bin/env node

/**
 * Directory Submission Tool for Chris David Salon
 *
 * Opens each directory site, fills in business information, and pauses for you to review/submit.
 * This is legitimate data entry automation for a real business.
 *
 * Usage:
 *   npm run foursquare   - Submit to Foursquare
 *   npm run bing         - Submit to Bing Places
 *   npm run apple        - Submit to Apple Maps
 *   npm run facebook     - Submit to Facebook
 *   npm run all          - Submit to all directories (one at a time)
 */

import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load business data
const businessDataPath = join(__dirname, '../../01-WEBSITE/data/business-info.json');
const business = JSON.parse(readFileSync(businessDataPath, 'utf-8'));

// Formatted data for form filling
const BUSINESS = {
  name: business.business.name,
  address: business.location.address.street,
  city: business.location.address.city,
  state: business.location.address.state,
  stateCode: business.location.address.stateCode,
  zip: business.location.address.zip,
  phone: business.contact.phoneDisplay,
  phoneClean: business.contact.phone.replace(/\D/g, ''),
  email: business.contact.email,
  website: business.contact.website,
  description: business.business.description,
  category: business.categories.primary,
  categories: [business.categories.primary, ...business.categories.secondary],
  hours: business.hours
};

console.log('\n===========================================');
console.log('  CHRIS DAVID SALON - Directory Submission');
console.log('===========================================\n');
console.log('Business Info:');
console.log(`  Name:    ${BUSINESS.name}`);
console.log(`  Address: ${BUSINESS.address}`);
console.log(`  City:    ${BUSINESS.city}, ${BUSINESS.stateCode} ${BUSINESS.zip}`);
console.log(`  Phone:   ${BUSINESS.phone}`);
console.log(`  Email:   ${BUSINESS.email}`);
console.log(`  Website: ${BUSINESS.website}`);
console.log('\n-------------------------------------------\n');

// Helper to wait for user
async function waitForUser(page, message) {
  console.log(`\n>>> ${message}`);
  console.log('>>> Press Enter in terminal when ready to continue...\n');

  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });
}

// Helper to type slowly (more human-like)
async function typeSlowly(page, selector, text) {
  await page.click(selector);
  await page.type(selector, text, { delay: 50 });
}

// Helper to try multiple selectors
async function tryFill(page, selectors, value) {
  for (const selector of selectors) {
    try {
      const element = await page.$(selector);
      if (element) {
        await element.fill(value);
        console.log(`  Filled: ${selector.substring(0, 40)}...`);
        return true;
      }
    } catch (e) {
      // Try next selector
    }
  }
  return false;
}

// ============================================
// FOURSQUARE
// ============================================
async function submitFoursquare(browser) {
  console.log('\n========== FOURSQUARE ==========\n');

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://foursquare.com/venue/add');
  console.log('Opened Foursquare Add Venue page');

  await waitForUser(page, 'Please log in to Foursquare if needed. Press Enter when ready.');

  // Try to fill the form
  console.log('Attempting to fill form fields...');

  await tryFill(page, [
    'input[name="venueName"]',
    'input[placeholder*="name"]',
    '#venueName',
    'input[aria-label*="name"]'
  ], BUSINESS.name);

  await tryFill(page, [
    'input[name="address"]',
    'input[placeholder*="address"]',
    '#address',
    'input[aria-label*="address"]'
  ], BUSINESS.address);

  await tryFill(page, [
    'input[name="city"]',
    'input[placeholder*="city"]',
    '#city'
  ], BUSINESS.city);

  await tryFill(page, [
    'input[name="state"]',
    'input[placeholder*="state"]',
    '#state'
  ], BUSINESS.stateCode);

  await tryFill(page, [
    'input[name="zip"]',
    'input[placeholder*="zip"]',
    'input[placeholder*="postal"]',
    '#zip'
  ], BUSINESS.zip);

  await tryFill(page, [
    'input[name="phone"]',
    'input[placeholder*="phone"]',
    'input[type="tel"]',
    '#phone'
  ], BUSINESS.phone);

  console.log('\n>>> Form filled. Please:');
  console.log('    1. Select category: Hair Salon');
  console.log('    2. Review all fields');
  console.log('    3. Submit the form');
  console.log('    4. Press Enter here when done\n');

  await waitForUser(page, 'Waiting for you to complete submission...');

  await context.close();
  console.log('Foursquare submission complete!\n');
}

// ============================================
// BING PLACES
// ============================================
async function submitBing(browser) {
  console.log('\n========== BING PLACES ==========\n');

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://www.bingplaces.com/');
  console.log('Opened Bing Places');

  await waitForUser(page, 'Please sign in with Microsoft account. Press Enter when ready.');

  // Look for "Add Business" or similar
  try {
    const addButton = await page.$('text=Add Business, text=Add new, text=Claim');
    if (addButton) await addButton.click();
  } catch (e) {
    console.log('Could not find Add Business button automatically');
  }

  await waitForUser(page, 'Navigate to the "Add Business" form. Press Enter when on the form.');

  console.log('Attempting to fill form fields...');

  await tryFill(page, [
    'input[name="businessName"]',
    'input[placeholder*="business name"]',
    '#businessName',
    'input[aria-label*="business name"]'
  ], BUSINESS.name);

  await tryFill(page, [
    'input[name="address"]',
    'input[name="streetAddress"]',
    'input[placeholder*="address"]',
    '#address'
  ], BUSINESS.address);

  await tryFill(page, [
    'input[name="city"]',
    '#city'
  ], BUSINESS.city);

  await tryFill(page, [
    'input[name="state"]',
    'select[name="state"]',
    '#state'
  ], BUSINESS.stateCode);

  await tryFill(page, [
    'input[name="zip"]',
    'input[name="postalCode"]',
    '#zip'
  ], BUSINESS.zip);

  await tryFill(page, [
    'input[name="phone"]',
    'input[type="tel"]',
    '#phone'
  ], BUSINESS.phone);

  await tryFill(page, [
    'input[name="website"]',
    'input[type="url"]',
    '#website'
  ], BUSINESS.website);

  console.log('\n>>> Form filled. Please:');
  console.log('    1. Select category: Hair Salon / Beauty Salon');
  console.log('    2. Add business hours if prompted');
  console.log('    3. Review and submit');
  console.log('    4. Complete any verification steps');
  console.log('    5. Press Enter here when done\n');

  await waitForUser(page, 'Waiting for you to complete submission...');

  await context.close();
  console.log('Bing Places submission complete!\n');
}

// ============================================
// APPLE MAPS
// ============================================
async function submitApple(browser) {
  console.log('\n========== APPLE MAPS ==========\n');

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://mapsconnect.apple.com/');
  console.log('Opened Apple Maps Connect');

  await waitForUser(page, 'Please sign in with your Apple ID. Press Enter when ready.');

  console.log('\n>>> On Apple Maps Connect:');
  console.log('    1. Click "Add New Place" or search for your business');
  console.log('    2. If not found, click "Add a Missing Place"');
  console.log('    3. Press Enter when on the add form\n');

  await waitForUser(page, 'Navigate to add business form...');

  console.log('Attempting to fill form fields...');

  await tryFill(page, [
    'input[name="name"]',
    'input[placeholder*="business name"]',
    'input[aria-label*="name"]'
  ], BUSINESS.name);

  await tryFill(page, [
    'input[name="address"]',
    'input[placeholder*="address"]',
    'input[aria-label*="address"]'
  ], `${BUSINESS.address}, ${BUSINESS.city}, ${BUSINESS.stateCode} ${BUSINESS.zip}`);

  await tryFill(page, [
    'input[name="phone"]',
    'input[type="tel"]'
  ], BUSINESS.phone);

  await tryFill(page, [
    'input[name="website"]',
    'input[type="url"]'
  ], BUSINESS.website);

  console.log('\n>>> Form filled. Please:');
  console.log('    1. Select category: Hair Salon');
  console.log('    2. Add hours of operation');
  console.log('    3. Submit for review');
  console.log('    4. Press Enter here when done\n');

  await waitForUser(page, 'Waiting for you to complete submission...');

  await context.close();
  console.log('Apple Maps submission complete!\n');
}

// ============================================
// FACEBOOK
// ============================================
async function submitFacebook(browser) {
  console.log('\n========== FACEBOOK BUSINESS ==========\n');

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://www.facebook.com/pages/create/');
  console.log('Opened Facebook Create Page');

  await waitForUser(page, 'Please log in to Facebook if needed. Press Enter when ready.');

  console.log('\n>>> On Facebook:');
  console.log('    1. Select "Business or Brand"');
  console.log('    2. Enter business details');
  console.log('    3. Press Enter when on the creation form\n');

  await waitForUser(page, 'Navigate to business page creation...');

  console.log('Attempting to fill form fields...');

  await tryFill(page, [
    'input[name="page_name"]',
    'input[placeholder*="Page name"]',
    'input[aria-label*="Page name"]'
  ], BUSINESS.name);

  await tryFill(page, [
    'input[name="category"]',
    'input[placeholder*="category"]',
    'input[aria-label*="category"]'
  ], 'Hair Salon');

  console.log('\n>>> Please complete the Facebook page setup:');
  console.log(`    - Page Name: ${BUSINESS.name}`);
  console.log('    - Category: Hair Salon');
  console.log(`    - Address: ${BUSINESS.address}, ${BUSINESS.city}, ${BUSINESS.stateCode} ${BUSINESS.zip}`);
  console.log(`    - Phone: ${BUSINESS.phone}`);
  console.log(`    - Website: ${BUSINESS.website}`);
  console.log('    4. Press Enter here when done\n');

  await waitForUser(page, 'Waiting for you to complete submission...');

  await context.close();
  console.log('Facebook page creation complete!\n');
}

// ============================================
// YELLOW PAGES
// ============================================
async function submitYellowPages(browser) {
  console.log('\n========== YELLOW PAGES ==========\n');

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://www.yellowpages.com/addlisting');
  console.log('Opened Yellow Pages Add Listing');

  await page.waitForTimeout(2000);

  console.log('Attempting to fill form fields...');

  await tryFill(page, [
    'input[name="businessName"]',
    'input[id="businessName"]',
    'input[placeholder*="business name"]'
  ], BUSINESS.name);

  await tryFill(page, [
    'input[name="phone"]',
    'input[id="phone"]',
    'input[type="tel"]'
  ], BUSINESS.phoneClean);

  await tryFill(page, [
    'input[name="street"]',
    'input[name="address"]',
    'input[id="street"]'
  ], BUSINESS.address);

  await tryFill(page, [
    'input[name="city"]',
    'input[id="city"]'
  ], BUSINESS.city);

  await tryFill(page, [
    'select[name="state"]',
    'input[name="state"]',
    'input[id="state"]'
  ], BUSINESS.stateCode);

  await tryFill(page, [
    'input[name="zip"]',
    'input[id="zip"]'
  ], BUSINESS.zip);

  await tryFill(page, [
    'input[name="email"]',
    'input[id="email"]',
    'input[type="email"]'
  ], BUSINESS.email);

  console.log('\n>>> Form filled. Please:');
  console.log('    1. Review all fields');
  console.log('    2. Select category: Hair Salon');
  console.log('    3. Submit and verify via email');
  console.log('    4. Press Enter here when done\n');

  await waitForUser(page, 'Waiting for you to complete submission...');

  await context.close();
  console.log('Yellow Pages submission complete!\n');
}

// ============================================
// HOTFROG
// ============================================
async function submitHotfrog(browser) {
  console.log('\n========== HOTFROG ==========\n');

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://www.hotfrog.com/add-business');
  console.log('Opened Hotfrog Add Business');

  await page.waitForTimeout(2000);

  console.log('Attempting to fill form fields...');

  await tryFill(page, [
    'input[name="business_name"]',
    'input[name="name"]',
    'input[placeholder*="business name"]'
  ], BUSINESS.name);

  await tryFill(page, [
    'input[name="phone"]',
    'input[type="tel"]'
  ], BUSINESS.phone);

  await tryFill(page, [
    'input[name="address"]',
    'input[name="street"]'
  ], BUSINESS.address);

  await tryFill(page, [
    'input[name="city"]'
  ], BUSINESS.city);

  await tryFill(page, [
    'input[name="state"]',
    'select[name="state"]'
  ], BUSINESS.stateCode);

  await tryFill(page, [
    'input[name="zip"]',
    'input[name="postcode"]'
  ], BUSINESS.zip);

  await tryFill(page, [
    'input[name="website"]',
    'input[type="url"]'
  ], BUSINESS.website);

  await tryFill(page, [
    'input[name="email"]',
    'input[type="email"]'
  ], BUSINESS.email);

  await tryFill(page, [
    'textarea[name="description"]',
    'textarea[name="about"]'
  ], BUSINESS.description);

  console.log('\n>>> Form filled. Please:');
  console.log('    1. Review all fields');
  console.log('    2. Complete any CAPTCHA');
  console.log('    3. Submit');
  console.log('    4. Press Enter here when done\n');

  await waitForUser(page, 'Waiting for you to complete submission...');

  await context.close();
  console.log('Hotfrog submission complete!\n');
}

// ============================================
// MAIN
// ============================================
async function main() {
  const target = process.argv[2] || 'all';

  console.log(`Target: ${target}\n`);

  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });

  try {
    switch (target) {
      case 'foursquare':
        await submitFoursquare(browser);
        break;
      case 'bing':
        await submitBing(browser);
        break;
      case 'apple':
        await submitApple(browser);
        break;
      case 'facebook':
        await submitFacebook(browser);
        break;
      case 'yellowpages':
        await submitYellowPages(browser);
        break;
      case 'hotfrog':
        await submitHotfrog(browser);
        break;
      case 'all':
        console.log('Running all submissions in sequence...\n');
        console.log('Priority order:');
        console.log('  1. Foursquare (feeds 100+ apps)');
        console.log('  2. Bing Places');
        console.log('  3. Apple Maps');
        console.log('  4. Facebook');
        console.log('  5. Yellow Pages');
        console.log('  6. Hotfrog\n');

        await submitFoursquare(browser);
        await submitBing(browser);
        await submitApple(browser);
        await submitFacebook(browser);
        await submitYellowPages(browser);
        await submitHotfrog(browser);
        break;
      default:
        console.log(`Unknown target: ${target}`);
        console.log('Valid options: foursquare, bing, apple, facebook, yellowpages, hotfrog, all');
    }
  } finally {
    await browser.close();
  }

  console.log('\n===========================================');
  console.log('  All submissions complete!');
  console.log('===========================================\n');

  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
