/**
 * SEO Data Ingestion Pipeline
 * Collects data from all APIs and feeds it into the knowledge graph
 */

const { SITES, TRACKED_METRICS, NODE_TYPES, RELATIONSHIP_TYPES } = require('./ruvector-config');

// API endpoints (relative to the site)
const API_ENDPOINTS = {
  ga4: '/api/ga4-analytics',
  competitors: '/api/competitors',
  authority: '/api/authority',
  pagespeed: '/api/pagespeed',
  searchConsole: '/api/ga4-analytics?type=search-rankings',
  seoAnalysis: '/api/seo-analysis-engine',
  adminData: '/api/admin-data'
};

/**
 * Fetch data from an API endpoint
 */
async function fetchAPI(baseUrl, endpoint, params = {}) {
  const url = new URL(endpoint, baseUrl);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SEO-Learning-Agent/1.0'
      },
      timeout: 30000
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`[Ingestion] Failed to fetch ${url}: ${error.message}`);
    return null;
  }
}

/**
 * Ingest GA4 traffic data
 */
async function ingestTrafficData(knowledgeGraph, siteConfig) {
  console.log(`[Ingestion] Fetching traffic data for ${siteConfig.domain}...`);

  const data = await fetchAPI(siteConfig.url, API_ENDPOINTS.ga4, { type: 'overview' });

  if (!data?.success || !data?.data) {
    console.log(`[Ingestion] No traffic data available for ${siteConfig.domain}`);
    return null;
  }

  const metrics = {
    activeUsers: data.data.activeUsers || 0,
    sessions: data.data.sessions || 0,
    pageViews: data.data.pageViews || 0,
    bounceRate: parseFloat(data.data.bounceRate) || 0,
    avgSessionDuration: parseFloat(data.data.avgSessionDuration) || 0
  };

  // Record metrics snapshot
  await knowledgeGraph.recordMetrics(siteConfig.id, 'traffic', metrics);

  // Add/update site node
  await knowledgeGraph.addNode(NODE_TYPES.SITE, siteConfig.id, {
    domain: siteConfig.domain,
    type: siteConfig.type,
    latestTraffic: metrics,
    updatedAt: new Date().toISOString()
  });

  return metrics;
}

/**
 * Ingest competitor data
 */
async function ingestCompetitorData(knowledgeGraph, siteConfig) {
  console.log(`[Ingestion] Fetching competitor data for ${siteConfig.domain}...`);

  const data = await fetchAPI(siteConfig.url, API_ENDPOINTS.competitors);

  if (!data?.success || !data?.data?.competitors) {
    console.log(`[Ingestion] No competitor data available`);
    return null;
  }

  const competitors = data.data.competitors;
  const competitorNodes = [];

  for (const comp of competitors) {
    const competitorId = comp.name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    await knowledgeGraph.addNode(NODE_TYPES.COMPETITOR, competitorId, {
      name: comp.name,
      rating: comp.rating,
      reviewCount: comp.reviews || comp.user_ratings_total,
      address: comp.address || comp.vicinity,
      isOurSalon: comp.isOurSalon || false,
      updatedAt: new Date().toISOString()
    });

    // Create competition relationship
    await knowledgeGraph.addRelationship(
      `${NODE_TYPES.SITE}:${siteConfig.id}`,
      `${NODE_TYPES.COMPETITOR}:${competitorId}`,
      RELATIONSHIP_TYPES.COMPETES_WITH,
      {
        ratingGap: comp.rating - (data.data.ourRating || 4.9),
        reviewGap: (comp.reviews || 0) - (data.data.ourReviews || 140)
      }
    );

    competitorNodes.push({ id: competitorId, ...comp });
  }

  // Record competitor metrics
  await knowledgeGraph.recordMetrics(siteConfig.id, 'competitors', {
    totalCompetitors: competitors.length,
    avgCompetitorRating: competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length,
    avgCompetitorReviews: competitors.reduce((sum, c) => sum + (c.reviews || 0), 0) / competitors.length,
    marketPosition: data.data.marketPosition || 0
  });

  return competitorNodes;
}

/**
 * Ingest authority/PageRank data
 */
async function ingestAuthorityData(knowledgeGraph, siteConfig) {
  console.log(`[Ingestion] Fetching authority data for ${siteConfig.domain}...`);

  const data = await fetchAPI(siteConfig.url, API_ENDPOINTS.authority);

  if (!data?.success || !data?.data) {
    console.log(`[Ingestion] No authority data available for ${siteConfig.domain}`);
    return null;
  }

  const metrics = {
    authorityScore: data.data.authority_score || 0,
    pageRank: data.data.pagerank || 0,
    pageRankDecimal: data.data.pagerank_decimal || 0
  };

  await knowledgeGraph.recordMetrics(siteConfig.id, 'authority', metrics);

  return metrics;
}

/**
 * Ingest search rankings data
 */
async function ingestRankingsData(knowledgeGraph, siteConfig) {
  console.log(`[Ingestion] Fetching rankings data for ${siteConfig.domain}...`);

  const data = await fetchAPI(siteConfig.url, API_ENDPOINTS.searchConsole);

  if (!data?.success || !data?.data?.keywords) {
    console.log(`[Ingestion] No rankings data available for ${siteConfig.domain}`);
    return null;
  }

  const keywords = data.data.keywords;

  for (const kw of keywords) {
    const keywordId = kw.keyword.toLowerCase().replace(/[^a-z0-9]/g, '-');

    // Add keyword node
    await knowledgeGraph.addNode(NODE_TYPES.KEYWORD, keywordId, {
      keyword: kw.keyword,
      position: kw.position,
      impressions: kw.impressions,
      clicks: kw.clicks,
      ctr: kw.ctr,
      updatedAt: new Date().toISOString()
    });

    // Create ranking relationship
    await knowledgeGraph.addRelationship(
      `${NODE_TYPES.SITE}:${siteConfig.id}`,
      `${NODE_TYPES.KEYWORD}:${keywordId}`,
      RELATIONSHIP_TYPES.RANKS_FOR,
      {
        position: kw.position,
        impressions: kw.impressions,
        clicks: kw.clicks
      }
    );
  }

  // Record aggregate ranking metrics
  await knowledgeGraph.recordMetrics(siteConfig.id, 'rankings', {
    totalKeywords: keywords.length,
    avgPosition: keywords.reduce((sum, k) => sum + k.position, 0) / keywords.length,
    totalImpressions: keywords.reduce((sum, k) => sum + k.impressions, 0),
    totalClicks: keywords.reduce((sum, k) => sum + k.clicks, 0)
  });

  return keywords;
}

/**
 * Ingest page data from sitemap
 */
async function ingestPageData(knowledgeGraph, siteConfig) {
  console.log(`[Ingestion] Fetching page data for ${siteConfig.domain}...`);

  // Fetch sitemap
  try {
    const response = await fetch(`${siteConfig.url}/sitemap.xml`);
    const sitemapXml = await response.text();

    // Parse URLs from sitemap (simple regex extraction)
    const urlMatches = sitemapXml.match(/<loc>([^<]+)<\/loc>/g) || [];
    const urls = urlMatches.map(m => m.replace(/<\/?loc>/g, ''));

    for (const url of urls) {
      const pageId = url.replace(siteConfig.url, '').replace(/^\//, '').replace(/\//g, '-') || 'homepage';

      await knowledgeGraph.addNode(NODE_TYPES.PAGE, `${siteConfig.id}:${pageId}`, {
        url,
        siteId: siteConfig.id,
        path: url.replace(siteConfig.url, ''),
        updatedAt: new Date().toISOString()
      });

      // Link page to site
      await knowledgeGraph.addRelationship(
        `${NODE_TYPES.SITE}:${siteConfig.id}`,
        `${NODE_TYPES.PAGE}:${siteConfig.id}:${pageId}`,
        'HAS_PAGE'
      );
    }

    return urls;
  } catch (error) {
    console.log(`[Ingestion] Failed to fetch sitemap for ${siteConfig.domain}: ${error.message}`);
    return null;
  }
}

/**
 * Ingest conversion data
 */
async function ingestConversionData(knowledgeGraph, siteConfig) {
  console.log(`[Ingestion] Fetching conversion data for ${siteConfig.domain}...`);

  const data = await fetchAPI(siteConfig.url, API_ENDPOINTS.ga4, { type: 'events' });

  if (!data?.success || !data?.data) {
    console.log(`[Ingestion] No conversion data available for ${siteConfig.domain}`);
    return null;
  }

  const events = data.data;
  const conversions = {
    bookingClicks: 0,
    phoneClicks: 0,
    emailClicks: 0,
    directionsClicks: 0,
    socialClicks: 0
  };

  for (const event of events) {
    if (event.eventName === 'booking_click') conversions.bookingClicks = event.count;
    if (event.eventName === 'phone_click') conversions.phoneClicks = event.count;
    if (event.eventName === 'email_click') conversions.emailClicks = event.count;
    if (event.eventName === 'directions_click') conversions.directionsClicks = event.count;
    if (event.eventName === 'social_click') conversions.socialClicks = event.count;
  }

  await knowledgeGraph.recordMetrics(siteConfig.id, 'conversions', conversions);

  return conversions;
}

/**
 * Run full data ingestion for all sites
 */
async function runFullIngestion(knowledgeGraph) {
  console.log('[Ingestion] Starting full data ingestion for all sites...');
  const results = {};

  for (const [key, site] of Object.entries(SITES)) {
    console.log(`\n[Ingestion] Processing ${site.domain}...`);
    results[key] = {
      site: site.domain,
      traffic: null,
      competitors: null,
      authority: null,
      rankings: null,
      pages: null,
      conversions: null,
      errors: []
    };

    try {
      // Main site has all APIs
      if (site.type === 'main') {
        results[key].traffic = await ingestTrafficData(knowledgeGraph, site);
        results[key].competitors = await ingestCompetitorData(knowledgeGraph, site);
        results[key].authority = await ingestAuthorityData(knowledgeGraph, site);
        results[key].rankings = await ingestRankingsData(knowledgeGraph, site);
        results[key].conversions = await ingestConversionData(knowledgeGraph, site);
      }

      // All sites have pages
      results[key].pages = await ingestPageData(knowledgeGraph, site);

      // Create microsite -> main site relationship
      if (site.type === 'microsite') {
        await knowledgeGraph.addRelationship(
          `${NODE_TYPES.SITE}:${site.id}`,
          `${NODE_TYPES.SITE}:${SITES.main.id}`,
          RELATIONSHIP_TYPES.SUPPORTS,
          { purpose: site.purpose }
        );
      }

    } catch (error) {
      console.error(`[Ingestion] Error processing ${site.domain}: ${error.message}`);
      results[key].errors.push(error.message);
    }
  }

  console.log('\n[Ingestion] Full ingestion complete');
  return results;
}

/**
 * Run incremental ingestion (only changed data)
 */
async function runIncrementalIngestion(knowledgeGraph, siteId = null) {
  const sites = siteId ? { [siteId]: SITES[siteId] } : SITES;
  const results = {};

  for (const [key, site] of Object.entries(sites)) {
    if (!site) continue;

    results[key] = {};

    // Always update traffic and conversions (real-time metrics)
    if (site.type === 'main') {
      results[key].traffic = await ingestTrafficData(knowledgeGraph, site);
      results[key].conversions = await ingestConversionData(knowledgeGraph, site);
    }
  }

  return results;
}

module.exports = {
  runFullIngestion,
  runIncrementalIngestion,
  ingestTrafficData,
  ingestCompetitorData,
  ingestAuthorityData,
  ingestRankingsData,
  ingestPageData,
  ingestConversionData
};
