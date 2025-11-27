// Microsite Analytics API - Comprehensive tracking for all 3 microsites
// Combines: PageRank, Page Counts, GA4 Referrals, Content Library Status

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const OPENPAGERANK_API_KEY = process.env.OPENPAGERANK_API_KEY || '';
  const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;
  const GOOGLE_SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  const MICROSITES = [
    {
      domain: 'bestsalondelray.com',
      name: 'Best Salon Delray',
      target: 'best salon delray beach',
      color: '#3B82F6',
      sitemapUrl: 'https://bestsalondelray.com/sitemap.xml',
      contentLibrarySize: 10
    },
    {
      domain: 'bestdelraysalon.com',
      name: 'Best Delray Salon',
      target: 'delray beach salon',
      color: '#EC4899',
      sitemapUrl: 'https://bestdelraysalon.com/sitemap.xml',
      contentLibrarySize: 10
    },
    {
      domain: 'bestsalonpalmbeach.com',
      name: 'Best Salon Palm Beach',
      target: 'salon palm beach county',
      color: '#06B6D4',
      sitemapUrl: 'https://bestsalonpalmbeach.com/sitemap.xml',
      contentLibrarySize: 10
    }
  ];

  try {
    // Parallel fetch all data sources
    const [pageRankData, sitemapData, ga4Data] = await Promise.all([
      fetchPageRanks(OPENPAGERANK_API_KEY, MICROSITES),
      fetchSitemapCounts(MICROSITES),
      fetchGA4Referrals(GA4_PROPERTY_ID, GOOGLE_SERVICE_ACCOUNT_JSON, MICROSITES)
    ]);

    // Combine all data
    const microsites = MICROSITES.map((site) => {
      const pr = pageRankData.find(p => p.domain === site.domain) || {};
      const pages = sitemapData[site.domain] || { count: 0, pages: [] };
      const referrals = ga4Data[site.domain] || { sessions: 0, users: 0, dailyData: [] };

      return {
        ...site,
        pagerank: pr.pagerank_decimal || 0,
        pagerankInteger: pr.pagerank || 0,
        indexed: pr.status === 'found',
        globalRank: pr.rank || null,
        pageCount: pages.count,
        pages: pages.pages,
        referrals: {
          last30Days: referrals.users,
          sessions: referrals.sessions,
          dailyData: referrals.dailyData
        },
        contentLibrary: {
          total: site.contentLibrarySize,
          deployed: Math.max(0, pages.count - 5),
          remaining: Math.max(0, site.contentLibrarySize - Math.max(0, pages.count - 5))
        },
        health: calculateHealth(pr, pages, referrals)
      };
    });

    // Calculate totals
    const totals = {
      totalPages: microsites.reduce((sum, s) => sum + s.pageCount, 0),
      totalReferrals: microsites.reduce((sum, s) => sum + s.referrals.last30Days, 0),
      avgPagerank: (microsites.reduce((sum, s) => sum + s.pagerank, 0) / microsites.length).toFixed(2),
      indexedSites: microsites.filter(s => s.indexed).length,
      contentDeployed: microsites.reduce((sum, s) => sum + s.contentLibrary.deployed, 0),
      contentRemaining: microsites.reduce((sum, s) => sum + s.contentLibrary.remaining, 0)
    };

    // ROI projection
    const projection = calculateROI(totals);

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      microsites,
      totals,
      projection,
      dataQuality: {
        pagerank: OPENPAGERANK_API_KEY ? 'live' : 'unavailable',
        ga4: GA4_PROPERTY_ID && GOOGLE_SERVICE_ACCOUNT_JSON ? 'live' : 'unavailable',
        sitemaps: 'live'
      }
    });

  } catch (error) {
    console.error('Microsite analytics error:', error);
    return res.status(200).json({
      success: false,
      error: error.message,
      microsites: MICROSITES.map(s => ({
        ...s,
        pagerank: 0,
        indexed: false,
        pageCount: 0,
        referrals: { last30Days: 0, sessions: 0, dailyData: [] }
      }))
    });
  }
}

async function fetchPageRanks(apiKey, microsites) {
  if (!apiKey) return [];

  try {
    const domains = microsites.map(s => s.domain);
    const apiUrl = `https://openpagerank.com/api/v1.0/getPageRank?domains[]=${domains.join('&domains[]=')}`;

    const response = await fetch(apiUrl, {
      headers: { 'API-OPR': apiKey }
    });

    if (!response.ok) return [];

    const data = await response.json();
    if (data.status_code !== 200) return [];

    return data.response.map(item => ({
      domain: item.domain,
      pagerank: item.page_rank_integer,
      pagerank_decimal: item.page_rank_decimal,
      rank: item.rank,
      status: item.status_code === 200 ? 'found' : 'not_indexed'
    }));
  } catch (e) {
    console.error('PageRank fetch error:', e);
    return [];
  }
}

async function fetchSitemapCounts(microsites) {
  const results = {};

  await Promise.all(microsites.map(async (site) => {
    try {
      const response = await fetch(site.sitemapUrl, {
        headers: { 'User-Agent': 'Chris David SEO Bot' },
        redirect: 'follow'
      });

      if (!response.ok) {
        results[site.domain] = { count: 0, pages: [] };
        return;
      }

      const xml = await response.text();
      const locMatches = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
      const pages = locMatches.map(match => {
        const url = match.replace(/<\/?loc>/g, '');
        return url.split('/').pop() || 'index.html';
      });

      results[site.domain] = {
        count: pages.length,
        pages: pages
      };
    } catch (e) {
      console.error(`Sitemap fetch error for ${site.domain}:`, e);
      results[site.domain] = { count: 0, pages: [] };
    }
  }));

  return results;
}

async function fetchGA4Referrals(propertyId, serviceAccountJson, microsites) {
  const defaultResult = microsites.reduce((acc, s) => {
    acc[s.domain] = { sessions: 0, users: 0, dailyData: [] };
    return acc;
  }, {});

  if (!propertyId || !serviceAccountJson) {
    return defaultResult;
  }

  try {
    // Parse service account credentials
    const credentials = JSON.parse(serviceAccountJson);

    // Import Google Analytics Data API client
    const { BetaAnalyticsDataClient } = await import('@google-analytics/data');

    // Initialize client with credentials
    const analyticsDataClient = new BetaAnalyticsDataClient({ credentials });

    // Query GA4 for referrals from microsites
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [
        { name: 'sessionSource' },
        { name: 'date' }
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' }
      ],
      dimensionFilter: {
        orGroup: {
          expressions: microsites.map(s => ({
            filter: {
              fieldName: 'sessionSource',
              stringFilter: {
                matchType: 'CONTAINS',
                value: s.domain.replace('.com', '').replace('best', '')
              }
            }
          }))
        }
      }
    });

    const results = { ...defaultResult };

    if (response.rows) {
      response.rows.forEach(row => {
        const source = row.dimensionValues[0].value;
        const date = row.dimensionValues[1].value;
        const sessions = parseInt(row.metricValues[0].value) || 0;
        const users = parseInt(row.metricValues[1].value) || 0;

        // Match to microsite
        microsites.forEach(site => {
          const searchTerm = site.domain.replace('.com', '').replace('best', '');
          if (source.toLowerCase().includes(searchTerm.toLowerCase())) {
            results[site.domain].sessions += sessions;
            results[site.domain].users += users;
            results[site.domain].dailyData.push({ date, sessions, users });
          }
        });
      });
    }

    return results;
  } catch (e) {
    console.error('GA4 referrals fetch error:', e);
    return defaultResult;
  }
}

function calculateHealth(pr, pages, referrals) {
  let score = 0;
  let factors = [];

  // Indexed? (30 points)
  if (pr.status === 'found') {
    score += 30;
    factors.push({ name: 'Indexed', score: 30, max: 30 });
  } else {
    factors.push({ name: 'Indexed', score: 0, max: 30, issue: 'Not indexed by Google' });
  }

  // PageRank (20 points max)
  const prScore = Math.min(20, (pr.pagerank_decimal || 0) * 10);
  score += prScore;
  factors.push({ name: 'PageRank', score: Math.round(prScore), max: 20 });

  // Page count (20 points max, 2 per page up to 10)
  const pageScore = Math.min(20, (pages.count || 0) * 2);
  score += pageScore;
  factors.push({ name: 'Content', score: pageScore, max: 20 });

  // Referrals (30 points max)
  const refScore = Math.min(30, (referrals.users || 0) * 3);
  score += refScore;
  factors.push({ name: 'Referrals', score: refScore, max: 30 });

  return {
    score: Math.round(score),
    grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : score >= 20 ? 'D' : 'F',
    factors
  };
}

function calculateROI(totals) {
  // Average client value: $150/visit, 4 visits/year = $600/year
  const clientValue = 600;
  // Conversion rate from referral to booking: ~5%
  const conversionRate = 0.05;

  const currentMonthlyReferrals = totals.totalReferrals;
  const projectedMonthlyClients = currentMonthlyReferrals * conversionRate;
  const projectedAnnualRevenue = projectedMonthlyClients * 12 * clientValue;

  // Growth projection: As pages increase and age, expect 10% monthly growth
  const monthlyGrowthRate = 0.10;
  const projectedYearEndReferrals = currentMonthlyReferrals * Math.pow(1 + monthlyGrowthRate, 12);

  return {
    currentMonthly: {
      referrals: currentMonthlyReferrals,
      estimatedClients: Math.round(projectedMonthlyClients * 10) / 10,
      estimatedRevenue: Math.round(projectedMonthlyClients * clientValue)
    },
    projectedYearEnd: {
      monthlyReferrals: Math.round(projectedYearEndReferrals),
      annualClients: Math.round(projectedYearEndReferrals * conversionRate * 12),
      annualRevenue: Math.round(projectedYearEndReferrals * conversionRate * 12 * clientValue)
    },
    assumptions: {
      clientValue: `$${clientValue}/year (avg)`,
      conversionRate: `${conversionRate * 100}%`,
      monthlyGrowth: `${monthlyGrowthRate * 100}%`
    }
  };
}
