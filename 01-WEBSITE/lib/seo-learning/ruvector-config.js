/**
 * RuVector SEO Learning System Configuration
 * Self-learning vector database for SEO optimization across all 4 sites
 *
 * Sites managed:
 * 1. chrisdavidsalon.com (main site)
 * 2. bestsalondelray.com (microsite 1)
 * 3. bestdelraysalon.com (microsite 2)
 * 4. bestsalonpalmbeach.com (microsite 3)
 */

const SITES = {
  main: {
    id: 'chrisdavidsalon',
    domain: 'chrisdavidsalon.com',
    url: 'https://www.chrisdavidsalon.com',
    type: 'main',
    ga4PropertyId: '500528798',
    priority: 1
  },
  microsite1: {
    id: 'bestsalondelray',
    domain: 'bestsalondelray.com',
    url: 'https://bestsalondelray.com',
    type: 'microsite',
    purpose: 'general-authority',
    priority: 2
  },
  microsite2: {
    id: 'bestdelraysalon',
    domain: 'bestdelraysalon.com',
    url: 'https://bestdelraysalon.com',
    type: 'microsite',
    purpose: 'local-delray',
    priority: 2
  },
  microsite3: {
    id: 'bestsalonpalmbeach',
    domain: 'bestsalonpalmbeach.com',
    url: 'https://bestsalonpalmbeach.com',
    type: 'microsite',
    purpose: 'regional-palmbeach',
    priority: 2
  }
};

// Knowledge graph node types
const NODE_TYPES = {
  KEYWORD: 'keyword',
  PAGE: 'page',
  SITE: 'site',
  COMPETITOR: 'competitor',
  RANKING: 'ranking',
  CONVERSION: 'conversion',
  BACKLINK: 'backlink',
  CONTENT: 'content',
  USER_INTENT: 'user_intent',
  SERVICE: 'service',
  LOCATION: 'location'
};

// Relationship types for the graph
const RELATIONSHIP_TYPES = {
  TARGETS: 'TARGETS',           // Page -> Keyword
  RANKS_FOR: 'RANKS_FOR',       // Page -> Ranking
  LINKS_TO: 'LINKS_TO',         // Page -> Page (internal/external)
  COMPETES_WITH: 'COMPETES_WITH', // Page -> Competitor Page
  CONVERTS_TO: 'CONVERTS_TO',   // Keyword -> Conversion
  SERVES: 'SERVES',             // Site -> Location
  OFFERS: 'OFFERS',             // Site -> Service
  SUPPORTS: 'SUPPORTS',         // Microsite -> Main Site
  LEARNED_FROM: 'LEARNED_FROM', // Pattern -> Source Data
  IMPROVES: 'IMPROVES'          // Action -> Metric
};

// Learning configuration
const LEARNING_CONFIG = {
  // GNN layer settings
  gnn: {
    layers: 3,
    hiddenDim: 128,
    attentionHeads: 4,
    dropout: 0.1,
    learningRate: 0.001
  },

  // Memory tiers for adaptive compression
  memoryTiers: {
    hot: { maxAge: 7, compression: 'none', precision: 'f32' },      // Last 7 days
    warm: { maxAge: 30, compression: 'f16', precision: 'f16' },     // Last 30 days
    cool: { maxAge: 90, compression: 'pq8', precision: 'int8' },    // Last 90 days
    cold: { maxAge: 365, compression: 'pq4', precision: 'int4' }    // Last year
  },

  // Learning cycles
  cycles: {
    realtime: { interval: 300000 },     // 5 minutes - conversion tracking
    hourly: { interval: 3600000 },      // 1 hour - ranking changes
    daily: { interval: 86400000 },      // 24 hours - full analysis
    weekly: { interval: 604800000 }     // 7 days - deep learning update
  },

  // Confidence thresholds
  confidence: {
    actionThreshold: 0.7,      // Min confidence to suggest action
    learningBoost: 0.2,        // Confidence boost on success
    learningPenalty: -0.15,    // Confidence penalty on failure
    decayRate: 0.01            // Daily confidence decay
  }
};

// SEO metrics to track and learn from
const TRACKED_METRICS = {
  // Traffic metrics
  traffic: ['sessions', 'users', 'pageviews', 'bounceRate', 'avgSessionDuration'],

  // Ranking metrics
  rankings: ['position', 'impressions', 'clicks', 'ctr'],

  // Conversion metrics
  conversions: ['bookingClicks', 'phoneClicks', 'formSubmissions', 'directionsClicks'],

  // Authority metrics
  authority: ['pageRank', 'domainAuthority', 'backlinks', 'referringDomains'],

  // Content metrics
  content: ['wordCount', 'readabilityScore', 'keywordDensity', 'schemaTypes'],

  // Competitor metrics
  competitors: ['rating', 'reviewCount', 'rankingGap', 'contentGap']
};

// Action types the system can recommend
const ACTION_TYPES = {
  CONTENT: {
    ADD_KEYWORD: { impact: 'medium', effort: 'low' },
    EXPAND_CONTENT: { impact: 'high', effort: 'medium' },
    ADD_FAQ: { impact: 'medium', effort: 'low' },
    UPDATE_META: { impact: 'medium', effort: 'low' },
    ADD_SCHEMA: { impact: 'medium', effort: 'low' }
  },
  TECHNICAL: {
    IMPROVE_SPEED: { impact: 'high', effort: 'high' },
    FIX_MOBILE: { impact: 'high', effort: 'medium' },
    ADD_INTERNAL_LINKS: { impact: 'medium', effort: 'low' },
    FIX_BROKEN_LINKS: { impact: 'medium', effort: 'low' }
  },
  AUTHORITY: {
    BUILD_BACKLINK: { impact: 'high', effort: 'high' },
    MICROSITE_LINK: { impact: 'medium', effort: 'low' },
    CITATION_BUILD: { impact: 'medium', effort: 'medium' },
    REVIEW_REQUEST: { impact: 'high', effort: 'low' }
  },
  LOCAL: {
    UPDATE_GBP: { impact: 'high', effort: 'low' },
    ADD_LOCATION_PAGE: { impact: 'high', effort: 'medium' },
    LOCAL_KEYWORD: { impact: 'medium', effort: 'low' }
  }
};

module.exports = {
  SITES,
  NODE_TYPES,
  RELATIONSHIP_TYPES,
  LEARNING_CONFIG,
  TRACKED_METRICS,
  ACTION_TYPES
};
