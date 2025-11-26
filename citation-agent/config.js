// Citation Agent Configuration
// Anti-detection and submission settings

export const config = {
  // Browser settings for stealth
  browser: {
    headless: false, // Set to true for production
    slowMo: 100, // Milliseconds between actions (human-like)
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  },

  // Timing settings (randomized for human-like behavior)
  timing: {
    minDelay: 500,
    maxDelay: 2000,
    typeSpeed: { min: 50, max: 150 }, // ms per character
    scrollPause: { min: 500, max: 1500 },
    pageLoadWait: 3000,
    submitWait: 5000
  },

  // Retry settings
  retry: {
    maxAttempts: 3,
    backoffMultiplier: 2,
    initialDelay: 5000
  },

  // Proxy settings (optional)
  proxy: {
    enabled: false,
    host: process.env.PROXY_HOST || '',
    port: process.env.PROXY_PORT || '',
    username: process.env.PROXY_USER || '',
    password: process.env.PROXY_PASS || ''
  },

  // Output paths
  paths: {
    screenshots: './screenshots',
    logs: './logs',
    results: './results'
  }
};

// Citation directories with submission info
export const directories = [
  {
    id: 'bing-places',
    name: 'Bing Places',
    url: 'https://www.bingplaces.com',
    difficulty: 'medium',
    automatable: true,
    requiresVerification: true,
    verificationType: 'phone',
    priority: 1,
    estimatedTime: '5 min',
    selectors: {
      claimButton: 'a[href*="claim"], button:has-text("Claim")',
      searchInput: 'input[name="q"], input[type="search"]',
      businessName: 'input[name="businessName"], input[id*="name"]',
      phone: 'input[name="phone"], input[type="tel"]',
      address: 'input[name="address"], input[id*="address"]',
      submit: 'button[type="submit"], input[type="submit"]'
    }
  },
  {
    id: 'foursquare',
    name: 'Foursquare Business',
    url: 'https://business.foursquare.com',
    difficulty: 'easy',
    automatable: true,
    requiresVerification: false,
    priority: 1,
    estimatedTime: '3 min',
    selectors: {
      addBusiness: 'a[href*="add"], button:has-text("Add")',
      businessName: 'input[name="name"], input[placeholder*="name"]',
      category: 'input[name="category"], select[name="category"]',
      phone: 'input[name="phone"]',
      address: 'input[name="address"]',
      submit: 'button[type="submit"]'
    }
  },
  {
    id: 'yellowpages',
    name: 'Yellow Pages',
    url: 'https://www.yellowpages.com/addlisting',
    difficulty: 'medium',
    automatable: true,
    requiresVerification: true,
    verificationType: 'email',
    priority: 2,
    estimatedTime: '5 min',
    selectors: {
      businessName: 'input[name="businessName"], #businessName',
      phone: 'input[name="phone"], #phone',
      address: 'input[name="address"], #address',
      city: 'input[name="city"], #city',
      state: 'select[name="state"], #state',
      zip: 'input[name="zip"], #zip',
      email: 'input[name="email"], #email',
      submit: 'button[type="submit"], .submit-btn'
    }
  },
  {
    id: 'hotfrog',
    name: 'Hotfrog',
    url: 'https://www.hotfrog.com/add-business',
    difficulty: 'easy',
    automatable: true,
    requiresVerification: false,
    priority: 2,
    estimatedTime: '3 min',
    selectors: {
      businessName: 'input[name="business_name"]',
      phone: 'input[name="phone"]',
      address: 'input[name="address"]',
      website: 'input[name="website"]',
      description: 'textarea[name="description"]',
      submit: 'button[type="submit"]'
    }
  },
  {
    id: 'manta',
    name: 'Manta',
    url: 'https://www.manta.com/add-company',
    difficulty: 'medium',
    automatable: true,
    requiresVerification: true,
    verificationType: 'email',
    priority: 2,
    estimatedTime: '5 min',
    selectors: {
      businessName: 'input[name="companyName"]',
      phone: 'input[name="phone"]',
      address: 'input[name="streetAddress"]',
      city: 'input[name="city"]',
      state: 'select[name="state"]',
      zip: 'input[name="zip"]',
      submit: 'button[type="submit"]'
    }
  },
  {
    id: 'superpages',
    name: 'Superpages',
    url: 'https://advertising.superpages.com',
    difficulty: 'medium',
    automatable: true,
    requiresVerification: true,
    verificationType: 'phone',
    priority: 3,
    estimatedTime: '5 min'
  },
  {
    id: 'citysearch',
    name: 'CitySearch',
    url: 'https://www.citysearch.com',
    difficulty: 'easy',
    automatable: true,
    requiresVerification: false,
    priority: 3,
    estimatedTime: '3 min'
  },
  {
    id: 'brownbook',
    name: 'Brownbook',
    url: 'https://www.brownbook.net/business/add/',
    difficulty: 'easy',
    automatable: true,
    requiresVerification: false,
    priority: 3,
    estimatedTime: '2 min',
    selectors: {
      businessName: 'input[name="title"]',
      phone: 'input[name="phone"]',
      address: 'input[name="address"]',
      website: 'input[name="website"]',
      email: 'input[name="email"]',
      description: 'textarea[name="description"]',
      submit: 'button[type="submit"], input[type="submit"]'
    }
  },
  {
    id: 'cylex',
    name: 'Cylex',
    url: 'https://www.cylex.us.com/add-company.html',
    difficulty: 'easy',
    automatable: true,
    requiresVerification: false,
    priority: 3,
    estimatedTime: '2 min'
  },
  {
    id: 'ezlocal',
    name: 'EZLocal',
    url: 'https://www.ezlocal.com/add-listing',
    difficulty: 'easy',
    automatable: true,
    requiresVerification: false,
    priority: 3,
    estimatedTime: '2 min'
  }
];

// Business data (loaded from business-info.json)
export const businessDataPath = '../01-WEBSITE/data/business-info.json';
