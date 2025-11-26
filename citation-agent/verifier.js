// Citation Verification System
// Checks if business is listed on various directories

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createStealthBrowser, safeNavigate, takeScreenshot } from './browser-utils.js';
import { config, directories, businessDataPath } from './config.js';

/**
 * Load business data
 */
function loadBusinessData() {
  const data = readFileSync(businessDataPath, 'utf-8');
  return JSON.parse(data);
}

/**
 * Check if text contains business name (fuzzy match)
 */
function containsBusinessName(text, businessName) {
  const normalizedText = text.toLowerCase();
  const normalizedName = businessName.toLowerCase();

  // Exact match
  if (normalizedText.includes(normalizedName)) return true;

  // Partial match (e.g., "Chris David" in "Chris David Salon")
  const nameParts = normalizedName.split(' ');
  const matchedParts = nameParts.filter(part => normalizedText.includes(part));
  return matchedParts.length >= 2;
}

/**
 * Verify listing on Google
 */
async function verifyGoogle(page, businessData) {
  const searchQuery = `${businessData.business.name} ${businessData.location.address.city}`;
  await safeNavigate(page, `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`);

  const pageContent = await page.content();

  // Check for Knowledge Panel
  const hasKnowledgePanel = pageContent.includes('kp-wholepage') ||
    pageContent.includes('knowledge-panel') ||
    pageContent.includes(businessData.contact.phone.replace(/[^0-9]/g, ''));

  const screenshot = await takeScreenshot(page, 'verify-google');

  return {
    directory: 'google',
    listed: hasKnowledgePanel,
    screenshot,
    details: hasKnowledgePanel ? 'Knowledge panel found' : 'No knowledge panel detected'
  };
}

/**
 * Verify listing on Yelp
 */
async function verifyYelp(page, businessData) {
  const searchQuery = `${businessData.business.name} ${businessData.location.address.city}`;
  await safeNavigate(page, `https://www.yelp.com/search?find_desc=${encodeURIComponent(searchQuery)}&find_loc=${encodeURIComponent(businessData.location.address.city + ', ' + businessData.location.address.state)}`);

  const pageContent = await page.content();
  const isListed = containsBusinessName(pageContent, businessData.business.name);

  // Try to find the listing link
  let listingUrl = null;
  if (isListed) {
    const links = await page.$$eval('a[href*="/biz/"]', els =>
      els.map(el => ({ href: el.href, text: el.textContent }))
    );
    const match = links.find(l => containsBusinessName(l.text, businessData.business.name));
    if (match) listingUrl = match.href;
  }

  const screenshot = await takeScreenshot(page, 'verify-yelp');

  return {
    directory: 'yelp',
    listed: isListed,
    listingUrl,
    screenshot
  };
}

/**
 * Verify listing on generic directory
 */
async function verifyGenericDirectory(page, directory, businessData) {
  const searchUrl = directory.searchUrl || directory.url;
  await safeNavigate(page, searchUrl);

  // Look for search box
  const searchSelectors = [
    'input[type="search"]',
    'input[name="q"]',
    'input[name="search"]',
    'input[placeholder*="search"]',
    'input[placeholder*="Search"]'
  ];

  let searched = false;
  for (const selector of searchSelectors) {
    try {
      const searchBox = await page.$(selector);
      if (searchBox) {
        await searchBox.fill(businessData.business.name);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(3000);
        searched = true;
        break;
      }
    } catch {
      continue;
    }
  }

  const pageContent = await page.content();
  const isListed = containsBusinessName(pageContent, businessData.business.name);

  const screenshot = await takeScreenshot(page, `verify-${directory.id}`);

  return {
    directory: directory.id,
    listed: isListed,
    searched,
    screenshot
  };
}

/**
 * Verify all citations
 */
export async function verifyAllCitations(options = {}) {
  const businessData = loadBusinessData();
  const { browser, context } = await createStealthBrowser();

  const results = [];

  try {
    const page = await context.newPage();

    // Verify Google (most important)
    console.log('Verifying Google listing...');
    results.push(await verifyGoogle(page, businessData));
    await page.waitForTimeout(2000);

    // Verify Yelp
    console.log('Verifying Yelp listing...');
    results.push(await verifyYelp(page, businessData));
    await page.waitForTimeout(2000);

    // Verify other directories
    const directoriesToCheck = options.all
      ? directories
      : directories.filter(d => d.priority <= 2);

    for (const directory of directoriesToCheck) {
      console.log(`Verifying ${directory.name}...`);
      try {
        results.push(await verifyGenericDirectory(page, directory, businessData));
        await page.waitForTimeout(2000);
      } catch (error) {
        results.push({
          directory: directory.id,
          listed: false,
          error: error.message
        });
      }
    }

  } finally {
    await browser.close();
  }

  // Save verification results
  const verificationFile = `${config.paths.results}/verification.json`;
  const verification = {
    timestamp: new Date().toISOString(),
    businessName: businessData.business.name,
    totalChecked: results.length,
    listedCount: results.filter(r => r.listed).length,
    notListedCount: results.filter(r => !r.listed).length,
    results
  };

  writeFileSync(verificationFile, JSON.stringify(verification, null, 2));

  return verification;
}

/**
 * Generate verification report
 */
export function generateReport() {
  const verificationFile = `${config.paths.results}/verification.json`;

  if (!existsSync(verificationFile)) {
    return 'No verification data found. Run verification first.';
  }

  const data = JSON.parse(readFileSync(verificationFile, 'utf-8'));

  let report = `
╔════════════════════════════════════════════════════════════════╗
║              CITATION VERIFICATION REPORT                       ║
╠════════════════════════════════════════════════════════════════╣
║ Business: ${data.businessName.padEnd(50)}║
║ Verified: ${data.timestamp.padEnd(50)}║
╠════════════════════════════════════════════════════════════════╣
║ SUMMARY                                                         ║
║   Total Checked:  ${String(data.totalChecked).padEnd(43)}║
║   Listed:         ${String(data.listedCount).padEnd(43)}║
║   Not Listed:     ${String(data.notListedCount).padEnd(43)}║
╠════════════════════════════════════════════════════════════════╣
║ DIRECTORY STATUS                                                ║
`;

  for (const result of data.results) {
    const status = result.listed ? '✅ LISTED' : '❌ NOT FOUND';
    const name = result.directory.padEnd(20);
    report += `║   ${name} ${status.padEnd(35)}║\n`;
  }

  report += `╚════════════════════════════════════════════════════════════════╝`;

  return report;
}

/**
 * Monitor citation changes
 */
export async function monitorCitations(previousResults) {
  const currentResults = await verifyAllCitations();

  const changes = [];

  for (const current of currentResults.results) {
    const previous = previousResults.results?.find(r => r.directory === current.directory);

    if (!previous) {
      changes.push({
        directory: current.directory,
        change: 'new_check',
        status: current.listed ? 'listed' : 'not_listed'
      });
    } else if (previous.listed !== current.listed) {
      changes.push({
        directory: current.directory,
        change: current.listed ? 'added' : 'removed',
        previousStatus: previous.listed,
        currentStatus: current.listed
      });
    }
  }

  return {
    timestamp: new Date().toISOString(),
    changes,
    currentResults
  };
}
