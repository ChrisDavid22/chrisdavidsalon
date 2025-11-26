/**
 * Advanced Evasion Engine
 *
 * A sophisticated anti-detection system that dynamically adapts to
 * website security measures. Uses multiple strategies to bypass:
 * - Browser fingerprinting
 * - Behavioral analysis
 * - CAPTCHA detection
 * - Rate limiting
 * - IP blocking
 */

import { chromium, firefox, webkit } from 'playwright';
import { randomInt } from 'crypto';

// Browser fingerprint profiles (randomized)
const FINGERPRINTS = {
  mac_chrome: {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    platform: 'MacIntel',
    vendor: 'Google Inc.',
    languages: ['en-US', 'en'],
    screen: { width: 1920, height: 1080 },
    colorDepth: 24,
    hardwareConcurrency: 8,
    deviceMemory: 8,
    timezone: 'America/New_York'
  },
  mac_safari: {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    platform: 'MacIntel',
    vendor: 'Apple Computer, Inc.',
    languages: ['en-US', 'en'],
    screen: { width: 1440, height: 900 },
    colorDepth: 30,
    hardwareConcurrency: 10,
    deviceMemory: 16,
    timezone: 'America/New_York'
  },
  windows_chrome: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    platform: 'Win32',
    vendor: 'Google Inc.',
    languages: ['en-US', 'en'],
    screen: { width: 1920, height: 1080 },
    colorDepth: 24,
    hardwareConcurrency: 8,
    deviceMemory: 8,
    timezone: 'America/New_York'
  },
  windows_firefox: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    platform: 'Win32',
    vendor: '',
    languages: ['en-US', 'en'],
    screen: { width: 1920, height: 1080 },
    colorDepth: 24,
    hardwareConcurrency: 8,
    deviceMemory: 8,
    timezone: 'America/New_York'
  }
};

// Mouse movement patterns (Bezier curves for natural movement)
const MOUSE_PATTERNS = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => t * (2 - t),
  easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  bounce: (t) => {
    if (t < 0.5) return 4 * t * t * t;
    return 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
};

/**
 * Generate random fingerprint with slight variations
 */
export function generateFingerprint() {
  const profiles = Object.values(FINGERPRINTS);
  const base = profiles[randomInt(profiles.length)];

  // Add slight random variations
  return {
    ...base,
    screen: {
      width: base.screen.width + randomInt(-100, 100),
      height: base.screen.height + randomInt(-50, 50)
    },
    hardwareConcurrency: base.hardwareConcurrency + randomInt(-2, 2),
    // Add noise to canvas fingerprint
    canvasNoise: Math.random() * 0.1,
    // Randomize WebGL parameters slightly
    webglNoise: {
      renderer: randomInt(1, 100),
      vendor: randomInt(1, 50)
    }
  };
}

/**
 * Human-like mouse movement using Bezier curves
 */
export function generateMousePath(startX, startY, endX, endY, steps = 50) {
  const path = [];
  const patterns = Object.values(MOUSE_PATTERNS);
  const pattern = patterns[randomInt(patterns.length)];

  // Add random control points for natural curve
  const cp1x = startX + (endX - startX) * 0.25 + randomInt(-50, 50);
  const cp1y = startY + (endY - startY) * 0.25 + randomInt(-50, 50);
  const cp2x = startX + (endX - startX) * 0.75 + randomInt(-50, 50);
  const cp2y = startY + (endY - startY) * 0.75 + randomInt(-50, 50);

  for (let i = 0; i <= steps; i++) {
    const t = pattern(i / steps);
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;

    // Cubic Bezier curve
    const x = mt3 * startX + 3 * mt2 * t * cp1x + 3 * mt * t2 * cp2x + t3 * endX;
    const y = mt3 * startY + 3 * mt2 * t * cp1y + 3 * mt * t2 * cp2y + t3 * endY;

    // Add micro-jitter for realism
    path.push({
      x: x + (Math.random() - 0.5) * 2,
      y: y + (Math.random() - 0.5) * 2,
      delay: randomInt(5, 20)
    });
  }

  return path;
}

/**
 * Human-like typing with errors and corrections
 */
export function generateTypingSequence(text, errorRate = 0.02) {
  const sequence = [];
  const chars = text.split('');

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];

    // Randomly introduce typos and corrections
    if (Math.random() < errorRate) {
      // Type wrong character
      const wrongChar = String.fromCharCode(char.charCodeAt(0) + randomInt(-1, 1));
      sequence.push({
        action: 'type',
        char: wrongChar,
        delay: randomInt(50, 150)
      });

      // Pause (realizing mistake)
      sequence.push({
        action: 'wait',
        delay: randomInt(100, 300)
      });

      // Delete wrong character
      sequence.push({
        action: 'backspace',
        delay: randomInt(30, 80)
      });
    }

    // Type correct character with variable speed
    const baseDelay = randomInt(50, 120);
    // Slow down for capital letters and special chars
    const modifier = /[A-Z!@#$%^&*()]/.test(char) ? 1.5 : 1;

    sequence.push({
      action: 'type',
      char: char,
      delay: Math.floor(baseDelay * modifier)
    });

    // Occasional pauses (thinking)
    if (Math.random() < 0.05) {
      sequence.push({
        action: 'wait',
        delay: randomInt(200, 500)
      });
    }
  }

  return sequence;
}

/**
 * Advanced stealth injection scripts
 */
export const STEALTH_SCRIPTS = {
  // Override webdriver detection
  webdriver: `
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
      configurable: true
    });
    delete navigator.__proto__.webdriver;
  `,

  // Spoof plugins
  plugins: `
    Object.defineProperty(navigator, 'plugins', {
      get: () => {
        const plugins = [
          { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
          { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
          { name: 'Native Client', filename: 'internal-nacl-plugin' },
          { name: 'Chromium PDF Plugin', filename: 'internal-pdf-viewer' },
          { name: 'Microsoft Edge PDF Plugin', filename: 'internal-pdf-viewer' }
        ];
        const pluginArray = Object.create(PluginArray.prototype);
        plugins.forEach((p, i) => {
          pluginArray[i] = { ...p, length: 1 };
        });
        pluginArray.length = plugins.length;
        pluginArray.refresh = () => {};
        return pluginArray;
      }
    });
  `,

  // Spoof permissions
  permissions: `
    const originalQuery = navigator.permissions.query;
    navigator.permissions.query = (parameters) => (
      parameters.name === 'notifications' ?
        Promise.resolve({ state: Notification.permission }) :
        originalQuery(parameters)
    );
  `,

  // Add fake chrome runtime
  chrome: `
    window.chrome = {
      runtime: {
        connect: () => {},
        sendMessage: () => {},
        onMessage: { addListener: () => {} }
      },
      loadTimes: () => {},
      csi: () => {},
      app: {}
    };
  `,

  // Canvas fingerprint noise
  canvas: (noise) => `
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function(type) {
      if (type === 'image/png' || type === 'image/jpeg') {
        const context = this.getContext('2d');
        if (context) {
          const imageData = context.getImageData(0, 0, this.width, this.height);
          for (let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i] = imageData.data[i] + Math.floor(Math.random() * ${noise} * 255);
          }
          context.putImageData(imageData, 0, 0);
        }
      }
      return originalToDataURL.apply(this, arguments);
    };
  `,

  // WebGL fingerprint spoof
  webgl: (renderer, vendor) => `
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
      if (parameter === 37445) {
        return 'Intel Inc.' + ${vendor};
      }
      if (parameter === 37446) {
        return 'Intel Iris OpenGL Engine' + ${renderer};
      }
      return getParameter.call(this, parameter);
    };
  `,

  // Timezone consistency
  timezone: (tz) => `
    const DateTimeFormat = Intl.DateTimeFormat;
    Intl.DateTimeFormat = function(locales, options) {
      options = options || {};
      options.timeZone = options.timeZone || '${tz}';
      return new DateTimeFormat(locales, options);
    };
    Object.setPrototypeOf(Intl.DateTimeFormat, DateTimeFormat);
  `,

  // Screen resolution consistency
  screen: (width, height, colorDepth) => `
    Object.defineProperty(screen, 'width', { get: () => ${width} });
    Object.defineProperty(screen, 'height', { get: () => ${height} });
    Object.defineProperty(screen, 'availWidth', { get: () => ${width} });
    Object.defineProperty(screen, 'availHeight', { get: () => ${height - 40} });
    Object.defineProperty(screen, 'colorDepth', { get: () => ${colorDepth} });
    Object.defineProperty(screen, 'pixelDepth', { get: () => ${colorDepth} });
  `,

  // Hardware concurrency spoof
  hardware: (cores, memory) => `
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => ${cores} });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => ${memory} });
  `
};

/**
 * Create fully stealthed browser context
 */
export async function createStealthContext(browserType = 'chromium') {
  const fingerprint = generateFingerprint();

  const browsers = { chromium, firefox, webkit };
  const browser = await browsers[browserType].launch({
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-site-isolation-trials',
      '--disable-web-security',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      `--window-size=${fingerprint.screen.width},${fingerprint.screen.height}`
    ]
  });

  const context = await browser.newContext({
    viewport: { width: fingerprint.screen.width, height: fingerprint.screen.height },
    userAgent: fingerprint.userAgent,
    locale: 'en-US',
    timezoneId: fingerprint.timezone,
    geolocation: { latitude: 26.4614, longitude: -80.0728 },
    permissions: ['geolocation'],
    colorScheme: 'light',
    extraHTTPHeaders: {
      'Accept-Language': fingerprint.languages.join(','),
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'DNT': '1',
      'Upgrade-Insecure-Requests': '1'
    }
  });

  // Inject all stealth scripts
  await context.addInitScript(STEALTH_SCRIPTS.webdriver);
  await context.addInitScript(STEALTH_SCRIPTS.plugins);
  await context.addInitScript(STEALTH_SCRIPTS.permissions);
  await context.addInitScript(STEALTH_SCRIPTS.chrome);
  await context.addInitScript(STEALTH_SCRIPTS.canvas(fingerprint.canvasNoise));
  await context.addInitScript(STEALTH_SCRIPTS.webgl(fingerprint.webglNoise.renderer, fingerprint.webglNoise.vendor));
  await context.addInitScript(STEALTH_SCRIPTS.timezone(fingerprint.timezone));
  await context.addInitScript(STEALTH_SCRIPTS.screen(fingerprint.screen.width, fingerprint.screen.height, fingerprint.colorDepth));
  await context.addInitScript(STEALTH_SCRIPTS.hardware(fingerprint.hardwareConcurrency, fingerprint.deviceMemory));

  return { browser, context, fingerprint };
}

/**
 * Execute human-like mouse movement
 */
export async function humanMouseMove(page, startX, startY, endX, endY) {
  const path = generateMousePath(startX, startY, endX, endY);

  for (const point of path) {
    await page.mouse.move(point.x, point.y);
    await page.waitForTimeout(point.delay);
  }
}

/**
 * Execute human-like typing with natural errors
 */
export async function humanTypeText(page, selector, text) {
  const element = await page.$(selector);
  if (!element) throw new Error(`Element not found: ${selector}`);

  // Click with human-like movement
  const box = await element.boundingBox();
  const centerX = box.x + box.width / 2 + randomInt(-10, 10);
  const centerY = box.y + box.height / 2 + randomInt(-5, 5);

  const currentPos = await page.evaluate(() => ({
    x: window.mouseX || window.innerWidth / 2,
    y: window.mouseY || window.innerHeight / 2
  }));

  await humanMouseMove(page, currentPos.x, currentPos.y, centerX, centerY);
  await page.waitForTimeout(randomInt(50, 150));
  await page.mouse.click(centerX, centerY);
  await page.waitForTimeout(randomInt(100, 300));

  // Type with human patterns
  const sequence = generateTypingSequence(text);

  for (const step of sequence) {
    if (step.action === 'type') {
      await page.keyboard.type(step.char);
    } else if (step.action === 'backspace') {
      await page.keyboard.press('Backspace');
    }
    await page.waitForTimeout(step.delay);
  }
}

/**
 * Detect and handle different types of CAPTCHAs
 */
export async function detectAndHandleCaptcha(page) {
  const captchaTypes = {
    recaptcha: {
      selectors: ['iframe[src*="recaptcha"]', '.g-recaptcha', '#g-recaptcha'],
      handler: async () => {
        console.log('⚠️  reCAPTCHA detected - requires manual solving or 2captcha service');
        return { type: 'recaptcha', solvable: false, needsManual: true };
      }
    },
    hcaptcha: {
      selectors: ['iframe[src*="hcaptcha"]', '.h-captcha'],
      handler: async () => {
        console.log('⚠️  hCaptcha detected - requires manual solving');
        return { type: 'hcaptcha', solvable: false, needsManual: true };
      }
    },
    cloudflare: {
      selectors: ['#challenge-running', '#cf-challenge-running', '.cf-browser-verification'],
      handler: async () => {
        console.log('⏳ Cloudflare challenge - waiting for auto-solve...');
        await page.waitForTimeout(5000);
        // Cloudflare usually auto-solves with good fingerprint
        const stillBlocked = await page.$('#challenge-running');
        return { type: 'cloudflare', solvable: !stillBlocked, needsManual: !!stillBlocked };
      }
    },
    textCaptcha: {
      selectors: ['input[name*="captcha"]', 'img[src*="captcha"]', '#captcha'],
      handler: async () => {
        console.log('📝 Text CAPTCHA detected - may need OCR or manual input');
        return { type: 'text', solvable: false, needsManual: true };
      }
    }
  };

  for (const [name, config] of Object.entries(captchaTypes)) {
    for (const selector of config.selectors) {
      const element = await page.$(selector);
      if (element) {
        return await config.handler();
      }
    }
  }

  return { type: null, solvable: true, needsManual: false };
}

/**
 * Adaptive rate limiting handler
 */
export class RateLimitHandler {
  constructor() {
    this.requests = new Map(); // domain -> timestamp[]
    this.blocked = new Set();
    this.backoffMultiplier = 1;
  }

  async beforeRequest(domain) {
    // Check if domain is blocked
    if (this.blocked.has(domain)) {
      throw new Error(`Domain ${domain} is temporarily blocked due to rate limiting`);
    }

    // Get recent requests
    const recentRequests = this.requests.get(domain) || [];
    const now = Date.now();

    // Remove old requests (older than 1 minute)
    const filtered = recentRequests.filter(t => now - t < 60000);
    this.requests.set(domain, filtered);

    // If too many recent requests, add delay
    if (filtered.length >= 10) {
      const delay = Math.min(30000, 1000 * this.backoffMultiplier * filtered.length);
      console.log(`⏳ Rate limiting: waiting ${delay/1000}s before request to ${domain}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      this.backoffMultiplier *= 1.5;
    }

    // Record this request
    filtered.push(now);
    this.requests.set(domain, filtered);
  }

  onRateLimited(domain) {
    console.log(`🚫 Rate limited by ${domain} - adding to cooldown`);
    this.blocked.add(domain);
    this.backoffMultiplier *= 2;

    // Remove from blocked after cooldown
    setTimeout(() => {
      this.blocked.delete(domain);
      this.backoffMultiplier = Math.max(1, this.backoffMultiplier / 2);
    }, 300000); // 5 minute cooldown
  }

  reset() {
    this.requests.clear();
    this.blocked.clear();
    this.backoffMultiplier = 1;
  }
}

/**
 * Smart retry with exponential backoff and jitter
 */
export async function smartRetry(fn, options = {}) {
  const maxAttempts = options.maxAttempts || 3;
  const baseDelay = options.baseDelay || 1000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;

      // Calculate delay with exponential backoff + jitter
      const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
      const jitter = exponentialDelay * (0.5 + Math.random() * 0.5);
      const delay = Math.min(30000, exponentialDelay + jitter);

      console.log(`Attempt ${attempt} failed: ${error.message}. Retrying in ${Math.round(delay/1000)}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
