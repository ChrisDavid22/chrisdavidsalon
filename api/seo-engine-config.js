/**
 * SEO Engine Configuration
 * ========================
 * This is the SINGLE file you need to edit to configure the SEO system
 * for any website. All API endpoints import this configuration.
 *
 * To use this system on a new website:
 * 1. Copy all /api/*.js files to your new project
 * 2. Copy /.github/workflows/seo-flywheel.yml
 * 3. Copy /admin/*.html files
 * 4. Edit THIS FILE with your business details
 * 5. Set environment variables (see REQUIRED_ENV_VARS)
 * 6. Deploy and run initial baseline capture
 */

// ============================================
// REQUIRED ENVIRONMENT VARIABLES
// ============================================
// Set these in Vercel or your .env.local file:
//
// GA4_PROPERTY_ID - Your Google Analytics 4 property ID
// GOOGLE_SERVICE_ACCOUNT_JSON - Service account JSON for GA4 access
// GOOGLE_PLACES_API_KEY - Google Places API key for competitor data
// OPENPAGERANK_API_KEY - OpenPageRank API key for domain authority
// ANTHROPIC_API_KEY - (Optional) Claude AI for recommendations

export const REQUIRED_ENV_VARS = [
  'GA4_PROPERTY_ID',
  'GOOGLE_SERVICE_ACCOUNT_JSON',
  'GOOGLE_PLACES_API_KEY',
  'OPENPAGERANK_API_KEY'
];

export const OPTIONAL_ENV_VARS = [
  'ANTHROPIC_API_KEY'
];

// ============================================
// BUSINESS CONFIGURATION
// ============================================

export const BUSINESS = {
  // Your business name (must match Google Business Profile)
  name: 'Chris David Salon',

  // Your primary website domain (without https://)
  domain: 'chrisdavidsalon.com',

  // Full website URL
  url: 'https://www.chrisdavidsalon.com',

  // Physical address
  address: '300 E Atlantic Ave, Delray Beach, FL 33444',

  // Phone number
  phone: '(561) 299-0950',

  // Business category for Google Places search
  category: 'hair salon',

  // Primary location for local SEO
  city: 'Delray Beach',
  state: 'FL',
  region: 'Palm Beach County',

  // Google Business Profile place ID (if known)
  placeId: null
};

// ============================================
// COMPETITOR CONFIGURATION
// ============================================

export const COMPETITORS = [
  // Your business (mark isUs: true)
  { name: 'Chris David Salon', domain: 'chrisdavidsalon.com', isUs: true },

  // Competitors to track (add up to 20)
  { name: 'Rové Hair Salon', domain: 'rovesalon.com' },
  { name: 'Bond Street Salon', domain: 'bondstreetsalon.com' },
  { name: 'Studio 34 Delray', domain: 'studio34delray.com' },
  { name: 'Kaan Hair Design', domain: 'kaanhairdesign.com' },
  { name: 'Amanda Major Studio', domain: 'amandamajor.com' },
  { name: 'Salon South Flow', domain: 'salonsouthflow.com' },
  { name: 'Cloud 10 Salon', domain: 'cloud10usa.com' },
  { name: 'Imbue Salon', domain: 'imbuesalon.com' },
  { name: 'Studio 10 Boca', domain: 'studio10bocaraton.com' },
  { name: 'ShearLuck Salon', domain: 'slshair.com' },
  { name: 'ONE Aveda Salon', domain: 'onesalondelray.com' },
  { name: 'Tyler Presley Salon', domain: 'tylerpresleysalon.com' },
  { name: 'Conte Salon', domain: 'contesalon.com' },
  { name: 'Salon Sora', domain: 'salonsora.com' }
];

// Domain name mapping (for matching Google Places results to domains)
export const DOMAIN_MAP = {
  'rové hair': 'rovesalon.com',
  'rove hair': 'rovesalon.com',
  'studio 34': 'studio34delray.com',
  'kaan hair': 'kaanhairdesign.com',
  'salon south flow': 'salonsouthflow.com',
  'flow by resta': 'salonsouthflow.com',
  'one aveda': 'onesalondelray.com',
  'bond street': 'bondstreetsalon.com',
  'shearluck': 'slshair.com',
  'amanda major': 'amandamajor.com',
  'chris david': 'chrisdavidsalon.com',
  'imbue': 'imbuesalon.com',
  'lmbue': 'imbuesalon.com',
  'cloud 10': 'cloud10usa.com',
  'studio 10': 'studio10bocaraton.com',
  'tyler presley': 'tylerpresleysalon.com',
  'conte salon': 'contesalon.com',
  'salon sora': 'salonsora.com'
};

// ============================================
// MICROSITE CONFIGURATION (Optional)
// ============================================

export const MICROSITES = [
  // Add any satellite sites that link to your main site
  { name: 'Best Salon Delray', domain: 'bestsalondelray.com', focus: 'authority' },
  { name: 'Best Delray Salon', domain: 'bestdelraysalon.com', focus: 'local' },
  { name: 'Best Salon Palm Beach', domain: 'bestsalonpalmbeach.com', focus: 'regional' }
];

// ============================================
// SEO TARGETS & THRESHOLDS
// ============================================

export const TARGETS = {
  // Reviews
  reviews: {
    minimum: 50,        // Below this = HIGH priority
    competitive: 100,   // Target for competitiveness
    dominant: 200       // Goal for market dominance
  },

  // Rating
  rating: {
    minimum: 4.5,       // Below this = needs attention
    target: 4.8         // Goal
  },

  // Authority (PageRank)
  authority: {
    minimum: 2.0,       // Below this = needs work
    target: 3.5,        // Good target
    excellent: 5.0      // Excellent
  },

  // Performance (PageSpeed)
  performance: {
    minimum: 50,        // Below this = CRITICAL
    target: 90,         // Target score
    excellent: 95       // Excellent
  },

  // Core Web Vitals
  webVitals: {
    lcp: 2500,          // Largest Contentful Paint (ms)
    cls: 0.1,           // Cumulative Layout Shift
    fid: 100            // First Input Delay (ms)
  },

  // Engagement
  engagement: {
    bounceRateMax: 60,  // Above this = needs attention
    sessionDurationMin: 60  // Seconds
  },

  // Keyword Rankings
  rankings: {
    page1: 10,          // Position 1-10
    strikingDistance: 20,  // Position 11-20
    needsWork: 50       // Position 21-50
  }
};

// ============================================
// TARGET KEYWORDS
// ============================================

export const KEYWORDS = {
  // Money keywords (highest value)
  money: [
    `${BUSINESS.category} ${BUSINESS.city}`,
    `${BUSINESS.category}s ${BUSINESS.city}`,
    `best ${BUSINESS.category} ${BUSINESS.city}`
  ],

  // Service keywords
  services: [
    'balayage',
    'color correction',
    'hair extensions',
    'keratin treatment',
    'highlights'
  ],

  // Long-tail keywords (easier to rank)
  longTail: [
    `${BUSINESS.category} near me`,
    `color correction specialist ${BUSINESS.city}`,
    `bridal hair ${BUSINESS.city}`
  ]
};

// ============================================
// SCORING WEIGHTS
// ============================================

export const SCORING_WEIGHTS = {
  performance: 0.10,   // PageSpeed score
  content: 0.15,       // Content quality
  technical: 0.15,     // Technical SEO
  mobile: 0.15,        // Mobile friendliness
  ux: 0.15,            // User experience
  localSeo: 0.20,      // Local SEO (GBP, citations)
  authority: 0.10      // Domain authority
};

// ============================================
// AUTOMATION SETTINGS
// ============================================

export const AUTOMATION = {
  // Weekly cycle schedule (cron format)
  // Default: Sunday 6 AM EST (11:00 UTC)
  schedule: '0 11 * * 0',

  // Safe actions that can auto-execute
  safeActions: [
    'ping_sitemaps',
    'warm_cache',
    'check_health',
    'verify_ssl',
    'notify_google'
  ],

  // Actions requiring approval
  requiresApproval: [
    'content_changes',
    'schema_updates',
    'redirect_changes'
  ],

  // Maximum concurrent API calls
  maxConcurrency: 3,

  // Rate limiting (ms between calls)
  rateLimitDelay: 2000
};

// ============================================
// NOTIFICATION SETTINGS (Optional)
// ============================================

export const NOTIFICATIONS = {
  // Enable/disable notifications
  enabled: false,

  // Email settings (if enabled)
  email: {
    to: '',
    onCritical: true,
    onWeeklyReport: true
  },

  // Slack webhook (if enabled)
  slack: {
    webhook: '',
    channel: '#seo-alerts'
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the base URL based on environment
 */
export function getBaseUrl(req) {
  if (req?.headers?.host) {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    return `${protocol}://${req.headers.host}`;
  }
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : BUSINESS.url;
}

/**
 * Get Google Places search query
 */
export function getPlacesSearchQuery() {
  return `${BUSINESS.category} ${BUSINESS.city} ${BUSINESS.state}`;
}

/**
 * Check if all required environment variables are set
 */
export function checkEnvVars() {
  const missing = REQUIRED_ENV_VARS.filter(v => !process.env[v]);
  return {
    valid: missing.length === 0,
    missing,
    configured: REQUIRED_ENV_VARS.filter(v => process.env[v])
  };
}

/**
 * Get competitor by domain
 */
export function getCompetitorByDomain(domain) {
  return COMPETITORS.find(c => c.domain === domain);
}

/**
 * Get our business from competitors list
 */
export function getOurBusiness() {
  return COMPETITORS.find(c => c.isUs);
}

/**
 * Check if a name matches our business
 */
export function isOurBusiness(name) {
  const nameLower = (name || '').toLowerCase();
  const businessLower = BUSINESS.name.toLowerCase();
  return nameLower.includes(businessLower) ||
         nameLower.includes(businessLower.split(' ')[0]);
}

// Export everything as default for easy importing
export default {
  BUSINESS,
  COMPETITORS,
  DOMAIN_MAP,
  MICROSITES,
  TARGETS,
  KEYWORDS,
  SCORING_WEIGHTS,
  AUTOMATION,
  NOTIFICATIONS,
  REQUIRED_ENV_VARS,
  OPTIONAL_ENV_VARS,
  getBaseUrl,
  getPlacesSearchQuery,
  checkEnvVars,
  getCompetitorByDomain,
  getOurBusiness,
  isOurBusiness
};
