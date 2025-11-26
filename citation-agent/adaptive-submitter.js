/**
 * Adaptive Citation Submitter
 *
 * Uses the evasion engine to dynamically adapt to website defenses.
 * Implements multiple strategies for each directory type.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import {
  createStealthContext,
  humanMouseMove,
  humanTypeText,
  detectAndHandleCaptcha,
  RateLimitHandler,
  smartRetry,
  generateFingerprint
} from './evasion-engine.js';
import { config, directories, businessDataPath } from './config.js';

// Ensure output directories exist
['screenshots', 'logs', 'results'].forEach(dir => {
  if (!existsSync(`./${dir}`)) {
    mkdirSync(`./${dir}`, { recursive: true });
  }
});

// Global rate limiter
const rateLimiter = new RateLimitHandler();

/**
 * Load business data with validation
 */
function loadBusinessData() {
  const data = JSON.parse(readFileSync(businessDataPath, 'utf-8'));

  // Validate required fields
  const required = ['business.name', 'contact.phone', 'location.address.street'];
  for (const field of required) {
    const value = field.split('.').reduce((obj, key) => obj?.[key], data);
    if (!value) {
      throw new Error(`Missing required business data: ${field}`);
    }
  }

  return data;
}

/**
 * Save submission attempt log
 */
function logAttempt(directoryId, result) {
  const logFile = './logs/attempts.json';
  let logs = [];

  if (existsSync(logFile)) {
    logs = JSON.parse(readFileSync(logFile, 'utf-8'));
  }

  logs.push({
    timestamp: new Date().toISOString(),
    directoryId,
    ...result
  });

  writeFileSync(logFile, JSON.stringify(logs, null, 2));
}

/**
 * Adaptive form filler - tries multiple strategies
 */
async function adaptiveFormFill(page, businessData, formConfig) {
  const strategies = [
    // Strategy 1: Direct selectors
    async () => {
      for (const [field, selectors] of Object.entries(formConfig)) {
        const selectorList = Array.isArray(selectors) ? selectors : [selectors];
        for (const selector of selectorList) {
          try {
            const element = await page.$(selector);
            if (element) {
              const value = getFieldValue(field, businessData);
              if (value) {
                await humanTypeText(page, selector, value);
                return true;
              }
            }
          } catch {
            continue;
          }
        }
      }
      return false;
    },

    // Strategy 2: Label-based detection
    async () => {
      const labels = await page.$$('label');
      for (const label of labels) {
        const text = await label.textContent();
        const forAttr = await label.getAttribute('for');

        if (forAttr) {
          const field = matchLabelToField(text);
          if (field) {
            const value = getFieldValue(field, businessData);
            if (value) {
              await humanTypeText(page, `#${forAttr}`, value);
            }
          }
        }
      }
      return true;
    },

    // Strategy 3: Placeholder-based detection
    async () => {
      const inputs = await page.$$('input, textarea');
      for (const input of inputs) {
        const placeholder = await input.getAttribute('placeholder');
        const name = await input.getAttribute('name');
        const id = await input.getAttribute('id');

        const identifier = placeholder || name || id || '';
        const field = matchIdentifierToField(identifier);

        if (field) {
          const value = getFieldValue(field, businessData);
          if (value) {
            const selector = id ? `#${id}` : (name ? `[name="${name}"]` : null);
            if (selector) {
              await humanTypeText(page, selector, value);
            }
          }
        }
      }
      return true;
    },

    // Strategy 4: Visual position-based (experimental)
    async () => {
      // Find visible text inputs and fill in order
      const inputs = await page.$$('input[type="text"]:visible, input:not([type]):visible');
      const fieldOrder = ['name', 'phone', 'address', 'city', 'state', 'zip', 'email', 'website'];

      for (let i = 0; i < Math.min(inputs.length, fieldOrder.length); i++) {
        const value = getFieldValue(fieldOrder[i], businessData);
        if (value) {
          const box = await inputs[i].boundingBox();
          if (box) {
            await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
            await page.keyboard.type(value, { delay: 50 });
          }
        }
      }
      return true;
    }
  ];

  // Try each strategy until one works
  for (const strategy of strategies) {
    try {
      const success = await strategy();
      if (success) return true;
    } catch (error) {
      console.log(`Strategy failed: ${error.message}`);
      continue;
    }
  }

  return false;
}

/**
 * Match label text to field name
 */
function matchLabelToField(labelText) {
  const text = labelText.toLowerCase();
  const mappings = {
    name: ['business name', 'company name', 'name', 'company'],
    phone: ['phone', 'telephone', 'tel', 'mobile', 'contact number'],
    address: ['address', 'street', 'location'],
    city: ['city', 'town'],
    state: ['state', 'province', 'region'],
    zip: ['zip', 'postal', 'postcode'],
    email: ['email', 'e-mail'],
    website: ['website', 'web', 'url', 'site'],
    description: ['description', 'about', 'bio', 'summary']
  };

  for (const [field, keywords] of Object.entries(mappings)) {
    if (keywords.some(kw => text.includes(kw))) {
      return field;
    }
  }

  return null;
}

/**
 * Match input identifier to field
 */
function matchIdentifierToField(identifier) {
  return matchLabelToField(identifier);
}

/**
 * Get field value from business data
 */
function getFieldValue(field, businessData) {
  const mappings = {
    name: businessData.business?.name,
    phone: businessData.contact?.phone,
    address: businessData.location?.address?.street,
    city: businessData.location?.address?.city,
    state: businessData.location?.address?.stateCode || businessData.location?.address?.state,
    zip: businessData.location?.address?.zip,
    email: businessData.contact?.email,
    website: businessData.contact?.website,
    description: businessData.business?.description
  };

  return mappings[field];
}

/**
 * Wait for page to be interactive
 */
async function waitForInteractive(page, timeout = 10000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      // Check if page is interactive
      const isReady = await page.evaluate(() => {
        return document.readyState === 'complete' &&
               !document.querySelector('.loading, .spinner, [class*="loading"]');
      });

      if (isReady) return true;
    } catch {
      // Page might be navigating
    }

    await page.waitForTimeout(500);
  }

  return false;
}

/**
 * Adaptive submission with multiple fallback strategies
 */
export async function adaptiveSubmit(directoryId, options = {}) {
  const directory = directories.find(d => d.id === directoryId);
  if (!directory) {
    throw new Error(`Unknown directory: ${directoryId}`);
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📍 Submitting to: ${directory.name}`);
  console.log(`🔗 URL: ${directory.url}`);
  console.log(`${'═'.repeat(60)}\n`);

  const businessData = loadBusinessData();

  // Determine browser type based on directory
  const browserType = directory.preferredBrowser || 'chromium';

  // Create stealth browser
  const { browser, context, fingerprint } = await createStealthContext(browserType);
  console.log(`🎭 Using fingerprint: ${fingerprint.userAgent.substring(0, 50)}...`);

  const page = await context.newPage();

  try {
    // Rate limit check
    const domain = new URL(directory.url).hostname;
    await rateLimiter.beforeRequest(domain);

    // Navigate with retry
    console.log('📡 Navigating to site...');
    await smartRetry(async () => {
      await page.goto(directory.url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
    });

    await waitForInteractive(page);

    // Random initial movements
    const viewport = page.viewportSize();
    await humanMouseMove(page, viewport.width / 2, viewport.height / 2,
                         viewport.width * Math.random(), viewport.height * Math.random());

    // Scroll down naturally
    await page.evaluate(() => {
      window.scrollBy({ top: 200, behavior: 'smooth' });
    });
    await page.waitForTimeout(1000);

    // Check for CAPTCHA
    console.log('🔍 Checking for bot detection...');
    const captchaResult = await detectAndHandleCaptcha(page);

    if (captchaResult.needsManual) {
      const screenshot = `./screenshots/${directoryId}-captcha-${Date.now()}.png`;
      await page.screenshot({ path: screenshot, fullPage: true });

      return {
        success: false,
        blocked: true,
        reason: `${captchaResult.type} CAPTCHA detected`,
        screenshot,
        requiresManual: true
      };
    }

    // Look for "Add Business" or similar buttons
    console.log('🔎 Looking for submission form...');
    const addBusinessSelectors = [
      'a[href*="add"]', 'a[href*="claim"]', 'a[href*="submit"]',
      'button:has-text("Add")', 'button:has-text("Claim")',
      'a:has-text("Add your business")', 'a:has-text("Claim")',
      '[class*="add-business"]', '[class*="submit"]'
    ];

    for (const selector of addBusinessSelectors) {
      try {
        const button = await page.$(selector);
        if (button) {
          const box = await button.boundingBox();
          if (box) {
            await humanMouseMove(page, viewport.width / 2, viewport.height / 2,
                                 box.x + box.width / 2, box.y + box.height / 2);
            await page.waitForTimeout(500);
            await button.click();
            await page.waitForTimeout(2000);
            break;
          }
        }
      } catch {
        continue;
      }
    }

    // Check for CAPTCHA again after interaction
    const postClickCaptcha = await detectAndHandleCaptcha(page);
    if (postClickCaptcha.needsManual) {
      const screenshot = `./screenshots/${directoryId}-captcha-${Date.now()}.png`;
      await page.screenshot({ path: screenshot, fullPage: true });

      return {
        success: false,
        blocked: true,
        reason: `${postClickCaptcha.type} CAPTCHA appeared after interaction`,
        screenshot,
        requiresManual: true
      };
    }

    // Fill the form
    console.log('📝 Filling form fields...');
    const formConfig = directory.selectors || {};
    await adaptiveFormFill(page, businessData, formConfig);

    // Take screenshot before submit
    const preSubmitScreenshot = `./screenshots/${directoryId}-pre-submit-${Date.now()}.png`;
    await page.screenshot({ path: preSubmitScreenshot, fullPage: true });

    // If not in dry-run mode, attempt submit
    if (!options.dryRun) {
      console.log('🚀 Attempting submission...');

      // Find submit button
      const submitSelectors = [
        'button[type="submit"]', 'input[type="submit"]',
        'button:has-text("Submit")', 'button:has-text("Add")',
        'button:has-text("Continue")', 'button:has-text("Save")',
        '[class*="submit"]', '[class*="btn-primary"]'
      ];

      for (const selector of submitSelectors) {
        try {
          const submitBtn = await page.$(selector);
          if (submitBtn) {
            const isVisible = await submitBtn.isVisible();
            if (isVisible) {
              await submitBtn.click();
              await page.waitForTimeout(3000);
              break;
            }
          }
        } catch {
          continue;
        }
      }
    }

    // Post-submit screenshot
    const postSubmitScreenshot = `./screenshots/${directoryId}-post-submit-${Date.now()}.png`;
    await page.screenshot({ path: postSubmitScreenshot, fullPage: true });

    // Check for success indicators
    const pageContent = await page.content();
    const successIndicators = ['thank you', 'success', 'submitted', 'confirmation', 'verify'];
    const isSuccess = successIndicators.some(ind => pageContent.toLowerCase().includes(ind));

    const result = {
      success: isSuccess || options.dryRun,
      screenshotBefore: preSubmitScreenshot,
      screenshotAfter: postSubmitScreenshot,
      message: isSuccess ? 'Submission appears successful' :
               options.dryRun ? 'Dry run - form filled but not submitted' :
               'Submission attempted - verify manually',
      timestamp: new Date().toISOString()
    };

    logAttempt(directoryId, result);

    if (!options.keepOpen) {
      await browser.close();
    }

    return result;

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);

    const errorScreenshot = `./screenshots/${directoryId}-error-${Date.now()}.png`;
    try {
      await page.screenshot({ path: errorScreenshot, fullPage: true });
    } catch {}

    const result = {
      success: false,
      error: error.message,
      screenshot: errorScreenshot,
      timestamp: new Date().toISOString()
    };

    logAttempt(directoryId, result);

    if (!options.keepOpen) {
      await browser.close();
    }

    return result;
  }
}

/**
 * Batch submit with adaptive delays
 */
export async function adaptiveBatchSubmit(directoryIds = null, options = {}) {
  const targetDirectories = directoryIds
    ? directories.filter(d => directoryIds.includes(d.id))
    : directories.filter(d => d.automatable);

  // Sort by difficulty (easy first)
  const sortedDirs = targetDirectories.sort((a, b) => {
    const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
    return (difficultyOrder[a.difficulty] || 99) - (difficultyOrder[b.difficulty] || 99);
  });

  console.log(`\n🚀 Starting batch submission to ${sortedDirs.length} directories\n`);

  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < sortedDirs.length; i++) {
    const directory = sortedDirs[i];

    console.log(`\n[${i + 1}/${sortedDirs.length}] Processing ${directory.name}...`);

    try {
      const result = await adaptiveSubmit(directory.id, options);
      results.push({ directory: directory.id, ...result });

      if (result.success) {
        successCount++;
        console.log(`✅ ${directory.name}: Success`);
      } else {
        failCount++;
        console.log(`⚠️  ${directory.name}: ${result.reason || result.error || 'Failed'}`);
      }

    } catch (error) {
      failCount++;
      results.push({
        directory: directory.id,
        success: false,
        error: error.message
      });
      console.log(`❌ ${directory.name}: ${error.message}`);
    }

    // Adaptive delay between submissions
    if (i < sortedDirs.length - 1) {
      const baseDelay = 15000; // 15 seconds minimum
      const randomDelay = Math.random() * 15000; // up to 15 more seconds
      const failurePenalty = failCount * 5000; // 5 extra seconds per failure
      const totalDelay = baseDelay + randomDelay + failurePenalty;

      console.log(`⏳ Waiting ${Math.round(totalDelay / 1000)}s before next submission...`);
      await new Promise(resolve => setTimeout(resolve, totalDelay));
    }
  }

  // Summary
  console.log(`\n${'═'.repeat(60)}`);
  console.log('📊 BATCH SUBMISSION SUMMARY');
  console.log(`${'═'.repeat(60)}`);
  console.log(`Total: ${results.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`${'═'.repeat(60)}\n`);

  // Save summary
  const summaryFile = `./results/batch-${Date.now()}.json`;
  writeFileSync(summaryFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: { total: results.length, success: successCount, failed: failCount },
    results
  }, null, 2));

  return results;
}

// Export for CLI
export { loadBusinessData, rateLimiter };
