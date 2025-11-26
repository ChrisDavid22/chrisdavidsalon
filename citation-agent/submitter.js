// Citation Submission Engine
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { config, directories, businessDataPath } from './config.js';
import {
  createStealthBrowser,
  safeNavigate,
  humanType,
  humanScroll,
  randomDelay,
  randomMouseMove,
  fillField,
  takeScreenshot,
  checkForCaptcha
} from './browser-utils.js';

// Ensure directories exist
['screenshots', 'logs', 'results'].forEach(dir => {
  if (!existsSync(`./${dir}`)) {
    mkdirSync(`./${dir}`, { recursive: true });
  }
});

/**
 * Load business data
 */
function loadBusinessData() {
  try {
    const data = readFileSync(businessDataPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading business data:', error.message);
    throw error;
  }
}

/**
 * Log submission result
 */
function logResult(directoryId, success, message, screenshot = null) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    directoryId,
    success,
    message,
    screenshot
  };

  const logFile = `${config.paths.logs}/submissions.json`;
  let logs = [];

  if (existsSync(logFile)) {
    logs = JSON.parse(readFileSync(logFile, 'utf-8'));
  }

  logs.push(logEntry);
  writeFileSync(logFile, JSON.stringify(logs, null, 2));

  return logEntry;
}

/**
 * Update submission status
 */
function updateStatus(directoryId, status, details = {}) {
  const statusFile = `${config.paths.results}/status.json`;
  let statuses = {};

  if (existsSync(statusFile)) {
    statuses = JSON.parse(readFileSync(statusFile, 'utf-8'));
  }

  statuses[directoryId] = {
    status,
    lastAttempt: new Date().toISOString(),
    ...details
  };

  writeFileSync(statusFile, JSON.stringify(statuses, null, 2));
}

/**
 * Generic form submission handler
 */
async function submitGenericForm(page, directory, businessData) {
  const { selectors } = directory;
  const { business, contact, location } = businessData;

  let fieldsFound = 0;

  // Try to fill each field
  const fieldMappings = [
    { selectors: selectors?.businessName, value: business.name },
    { selectors: selectors?.phone, value: contact.phone },
    { selectors: selectors?.address, value: location.address.street },
    { selectors: selectors?.city, value: location.address.city },
    { selectors: selectors?.state, value: location.address.stateCode },
    { selectors: selectors?.zip, value: location.address.zip },
    { selectors: selectors?.email, value: contact.email },
    { selectors: selectors?.website, value: contact.website },
    { selectors: selectors?.description, value: business.description }
  ];

  for (const { selectors: sel, value } of fieldMappings) {
    if (sel && value) {
      const filled = await fillField(page, sel, value);
      if (filled) {
        fieldsFound++;
        await page.waitForTimeout(randomDelay(200, 500));
      }
    }
  }

  return fieldsFound;
}

/**
 * Submit to Bing Places
 */
async function submitBingPlaces(page, businessData) {
  console.log('Submitting to Bing Places...');

  await safeNavigate(page, 'https://www.bingplaces.com');
  await humanScroll(page);

  // Check if already listed
  const searchBox = await page.$('input[type="search"], input[name="q"]');
  if (searchBox) {
    await humanType(page, 'input[type="search"], input[name="q"]', businessData.business.name + ' ' + businessData.location.address.city);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
  }

  // Look for "Add your business" or "Claim" button
  const addButton = await page.$('a[href*="add"], button:has-text("Add"), a:has-text("claim")');
  if (addButton) {
    await addButton.click();
    await page.waitForTimeout(2000);
  }

  const screenshot = await takeScreenshot(page, 'bing-places');

  return {
    success: true,
    message: 'Navigation successful - manual verification may be required',
    screenshot,
    requiresManual: true
  };
}

/**
 * Submit to Foursquare Business
 */
async function submitFoursquare(page, businessData) {
  console.log('Submitting to Foursquare Business...');

  await safeNavigate(page, 'https://business.foursquare.com');
  await humanScroll(page);

  // Look for add/claim business link
  const addLink = await page.$('a[href*="add"], a[href*="claim"], button:has-text("Add")');
  if (addLink) {
    await addLink.click();
    await page.waitForTimeout(2000);
  }

  const screenshot = await takeScreenshot(page, 'foursquare');

  return {
    success: true,
    message: 'Navigation successful',
    screenshot,
    requiresManual: true
  };
}

/**
 * Submit to Hotfrog
 */
async function submitHotfrog(page, businessData) {
  console.log('Submitting to Hotfrog...');

  await safeNavigate(page, 'https://www.hotfrog.com/add-business');

  // Check for captcha
  const captcha = await checkForCaptcha(page);
  if (captcha.detected) {
    return {
      success: false,
      message: `Captcha detected (${captcha.type}) - manual intervention required`,
      requiresManual: true
    };
  }

  await humanScroll(page);

  const directory = directories.find(d => d.id === 'hotfrog');
  const fieldsFound = await submitGenericForm(page, directory, businessData);

  const screenshot = await takeScreenshot(page, 'hotfrog');

  if (fieldsFound >= 3) {
    // Try to submit
    const submitBtn = await page.$('button[type="submit"], input[type="submit"]');
    if (submitBtn) {
      await randomMouseMove(page);
      await page.waitForTimeout(randomDelay(500, 1000));
      // Don't actually click yet - take screenshot first
    }

    return {
      success: true,
      message: `Form filled (${fieldsFound} fields) - ready for submission`,
      screenshot,
      fieldsFound
    };
  }

  return {
    success: false,
    message: `Only ${fieldsFound} fields found`,
    screenshot
  };
}

/**
 * Submit to Brownbook
 */
async function submitBrownbook(page, businessData) {
  console.log('Submitting to Brownbook...');

  await safeNavigate(page, 'https://www.brownbook.net/business/add/');

  const captcha = await checkForCaptcha(page);
  if (captcha.detected) {
    return {
      success: false,
      message: `Captcha detected (${captcha.type})`,
      requiresManual: true
    };
  }

  await humanScroll(page);

  const directory = directories.find(d => d.id === 'brownbook');
  const fieldsFound = await submitGenericForm(page, directory, businessData);

  const screenshot = await takeScreenshot(page, 'brownbook');

  return {
    success: fieldsFound >= 3,
    message: `Form filled (${fieldsFound} fields)`,
    screenshot,
    fieldsFound
  };
}

/**
 * Submit to Yellow Pages
 */
async function submitYellowPages(page, businessData) {
  console.log('Submitting to Yellow Pages...');

  await safeNavigate(page, 'https://www.yellowpages.com/addlisting');

  const captcha = await checkForCaptcha(page);
  if (captcha.detected) {
    return {
      success: false,
      message: `Captcha detected (${captcha.type})`,
      requiresManual: true
    };
  }

  await humanScroll(page);

  const directory = directories.find(d => d.id === 'yellowpages');
  const fieldsFound = await submitGenericForm(page, directory, businessData);

  const screenshot = await takeScreenshot(page, 'yellowpages');

  return {
    success: fieldsFound >= 3,
    message: `Form filled (${fieldsFound} fields)`,
    screenshot,
    fieldsFound
  };
}

/**
 * Main submission orchestrator
 */
export async function submitToDirectory(directoryId, options = {}) {
  const directory = directories.find(d => d.id === directoryId);
  if (!directory) {
    throw new Error(`Unknown directory: ${directoryId}`);
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Submitting to: ${directory.name}`);
  console.log(`URL: ${directory.url}`);
  console.log(`Difficulty: ${directory.difficulty}`);
  console.log(`${'='.repeat(50)}\n`);

  const businessData = loadBusinessData();
  const { browser, context } = await createStealthBrowser();

  try {
    const page = await context.newPage();

    let result;

    switch (directoryId) {
      case 'bing-places':
        result = await submitBingPlaces(page, businessData);
        break;
      case 'foursquare':
        result = await submitFoursquare(page, businessData);
        break;
      case 'hotfrog':
        result = await submitHotfrog(page, businessData);
        break;
      case 'brownbook':
        result = await submitBrownbook(page, businessData);
        break;
      case 'yellowpages':
        result = await submitYellowPages(page, businessData);
        break;
      default:
        // Generic handler
        await safeNavigate(page, directory.url);
        const captcha = await checkForCaptcha(page);
        if (captcha.detected) {
          result = { success: false, message: 'Captcha detected', requiresManual: true };
        } else {
          const screenshot = await takeScreenshot(page, directoryId);
          result = { success: true, message: 'Navigation successful', screenshot, requiresManual: true };
        }
    }

    // Log and update status
    logResult(directoryId, result.success, result.message, result.screenshot);
    updateStatus(directoryId, result.success ? 'submitted' : 'failed', result);

    if (!options.keepOpen) {
      await browser.close();
    }

    return result;

  } catch (error) {
    const result = { success: false, message: error.message };
    logResult(directoryId, false, error.message);
    updateStatus(directoryId, 'error', { error: error.message });
    await browser.close();
    throw error;
  }
}

/**
 * Submit to all directories
 */
export async function submitToAll(options = {}) {
  const results = [];
  const targetDirectories = options.safeOnly
    ? directories.filter(d => d.difficulty === 'easy' && d.automatable)
    : directories.filter(d => d.automatable);

  // Sort by priority
  targetDirectories.sort((a, b) => (a.priority || 99) - (b.priority || 99));

  console.log(`\nSubmitting to ${targetDirectories.length} directories...\n`);

  for (const directory of targetDirectories) {
    try {
      const result = await submitToDirectory(directory.id, options);
      results.push({ directory: directory.id, ...result });

      // Random delay between submissions
      const delay = randomDelay(10000, 30000);
      console.log(`Waiting ${Math.round(delay/1000)}s before next submission...\n`);
      await new Promise(resolve => setTimeout(resolve, delay));

    } catch (error) {
      results.push({ directory: directory.id, success: false, error: error.message });
    }
  }

  // Save summary
  const summaryFile = `${config.paths.results}/submission-summary.json`;
  writeFileSync(summaryFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalAttempted: results.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results
  }, null, 2));

  return results;
}

/**
 * Get submission status
 */
export function getStatus() {
  const statusFile = `${config.paths.results}/status.json`;
  if (existsSync(statusFile)) {
    return JSON.parse(readFileSync(statusFile, 'utf-8'));
  }
  return {};
}
