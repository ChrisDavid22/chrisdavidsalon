// Browser utilities with anti-detection measures
import { chromium } from 'playwright';
import { config } from './config.js';

/**
 * Random delay generator for human-like behavior
 */
export function randomDelay(min = config.timing.minDelay, max = config.timing.maxDelay) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Human-like typing with variable speed
 */
export async function humanType(page, selector, text, options = {}) {
  const element = await page.$(selector);
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }

  await element.click();
  await page.waitForTimeout(randomDelay(100, 300));

  for (const char of text) {
    await element.type(char, { delay: randomDelay(config.timing.typeSpeed.min, config.timing.typeSpeed.max) });
  }

  await page.waitForTimeout(randomDelay(200, 500));
}

/**
 * Human-like scrolling
 */
export async function humanScroll(page, direction = 'down', amount = null) {
  const scrollAmount = amount || Math.floor(Math.random() * 300) + 100;
  const scrollDirection = direction === 'down' ? scrollAmount : -scrollAmount;

  await page.evaluate((scroll) => {
    window.scrollBy({
      top: scroll,
      behavior: 'smooth'
    });
  }, scrollDirection);

  await page.waitForTimeout(randomDelay(config.timing.scrollPause.min, config.timing.scrollPause.max));
}

/**
 * Random mouse movements to simulate human behavior
 */
export async function randomMouseMove(page) {
  const viewport = page.viewportSize();
  const x = Math.floor(Math.random() * viewport.width);
  const y = Math.floor(Math.random() * viewport.height);

  await page.mouse.move(x, y, { steps: Math.floor(Math.random() * 10) + 5 });
  await page.waitForTimeout(randomDelay(50, 200));
}

/**
 * Create a stealth browser instance
 */
export async function createStealthBrowser() {
  const browser = await chromium.launch({
    headless: config.browser.headless,
    slowMo: config.browser.slowMo,
    args: config.browser.args
  });

  const context = await browser.newContext({
    viewport: config.browser.viewport,
    userAgent: config.browser.userAgent,
    locale: 'en-US',
    timezoneId: 'America/New_York',
    geolocation: { latitude: 26.4614, longitude: -80.0728 }, // Delray Beach
    permissions: ['geolocation'],
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
    }
  });

  // Anti-detection scripts
  await context.addInitScript(() => {
    // Override navigator.webdriver
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });

    // Override navigator.plugins
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5],
    });

    // Override navigator.languages
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
    });

    // Override chrome property
    window.chrome = {
      runtime: {},
    };

    // Override permissions query
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) =>
      parameters.name === 'notifications'
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters);
  });

  return { browser, context };
}

/**
 * Safe page navigation with retry
 */
export async function safeNavigate(page, url, options = {}) {
  const maxRetries = options.maxRetries || config.retry.maxAttempts;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      await page.waitForTimeout(config.timing.pageLoadWait);

      // Random mouse movement after page load
      await randomMouseMove(page);

      return true;
    } catch (error) {
      lastError = error;
      console.log(`Navigation attempt ${attempt}/${maxRetries} failed: ${error.message}`);

      if (attempt < maxRetries) {
        const delay = config.retry.initialDelay * Math.pow(config.retry.backoffMultiplier, attempt - 1);
        await page.waitForTimeout(delay);
      }
    }
  }

  throw lastError;
}

/**
 * Wait for element with multiple selector fallbacks
 */
export async function waitForAnySelector(page, selectors, timeout = 10000) {
  const selectorArray = Array.isArray(selectors) ? selectors : [selectors];

  for (const selector of selectorArray) {
    try {
      await page.waitForSelector(selector, { timeout: timeout / selectorArray.length });
      return selector;
    } catch {
      continue;
    }
  }

  throw new Error(`None of the selectors found: ${selectorArray.join(', ')}`);
}

/**
 * Fill form field with fallback selectors
 */
export async function fillField(page, selectors, value) {
  const selectorArray = Array.isArray(selectors) ? selectors : selectors.split(', ');

  for (const selector of selectorArray) {
    try {
      const element = await page.$(selector);
      if (element) {
        await humanType(page, selector, value);
        return true;
      }
    } catch {
      continue;
    }
  }

  return false;
}

/**
 * Take screenshot with timestamp
 */
export async function takeScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${config.paths.screenshots}/${name}-${timestamp}.png`;
  await page.screenshot({ path: filename, fullPage: true });
  return filename;
}

/**
 * Check for captcha/bot detection
 */
export async function checkForCaptcha(page) {
  const captchaIndicators = [
    'iframe[src*="recaptcha"]',
    'iframe[src*="hcaptcha"]',
    '.g-recaptcha',
    '.h-captcha',
    '#captcha',
    '[data-sitekey]',
    'img[src*="captcha"]'
  ];

  for (const selector of captchaIndicators) {
    const element = await page.$(selector);
    if (element) {
      return {
        detected: true,
        type: selector.includes('recaptcha') ? 'recaptcha' :
              selector.includes('hcaptcha') ? 'hcaptcha' : 'unknown'
      };
    }
  }

  return { detected: false };
}
