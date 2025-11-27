// CONSOLIDATED Competitor API - Combines all competitor-related functionality
// Usage:
//   /api/competitors?action=pagespeed     - Get PageSpeed scores for all competitors
//   /api/competitors?action=rankings      - Get combined rankings (reviews + authority)
//   /api/competitors?action=daily-update  - Daily batch update (for cron)
//   /api/competitors?action=update-scores - Manual score update

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action, single, batch, key } = req.query;

  try {
    switch (action) {
      case 'pagespeed':
        return await handlePageSpeed(req, res, single);
      case 'rankings':
        return await handleRankings(req, res);
      case 'daily-update':
        return await handleDailyUpdate(req, res, batch, key);
      case 'update-scores':
        return await handleUpdateScores(req, res, batch, key);
      default:
        return res.status(200).json({
          success: true,
          message: 'Competitor API - Use action parameter',
          availableActions: [
            'pagespeed - Get PageSpeed scores for all competitors',
            'rankings - Get combined rankings (reviews + authority)',
            'daily-update - Daily batch update (for cron)',
            'update-scores - Manual score update'
          ],
          example: '/api/competitors?action=rankings'
        });
    }
  } catch (error) {
    console.error('Competitor API error:', error);
    return res.status(200).json({
      success: false,
      error: error.message
    });
  }
}

// ============================================
// COMPETITOR LIST (shared across all actions)
// ============================================

const ALL_COMPETITORS = [
  { name: 'Chris David Salon', domain: 'chrisdavidsalon.com', isUs: true },
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
  { name: 'Salon Sora', domain: 'salonsora.com' },
  { name: 'Pyure Salon', domain: 'pyuresalon.com' },
  { name: 'Dapper & Divine', domain: 'dapperanddivinestudio.com' },
  { name: 'Hair Mess Salon', domain: 'hairmesssalon.com' },
  { name: 'Salon Trace', domain: 'salontrace.com' },
  { name: 'Arielle Settel', domain: 'ariellesettel.com' }
];

const DOMAIN_MAP = {
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
  'salon sora': 'salonsora.com',
  'pyure': 'pyuresalon.com',
  'dapper and divine': 'dapperanddivinestudio.com',
  'hair mess': 'hairmesssalon.com',
  'salon trace': 'salontrace.com',
  'arielle settel': 'ariellesettel.com',
  'odeon': 'odeonsalon.com',
  'moxie': 'moxiesalon.com'
};

// ============================================
// ACTION: pagespeed - Get PageSpeed scores
// ============================================

async function handlePageSpeed(req, res, single) {
  if (single) {
    const result = await getPageSpeedScore(single);
    return res.status(200).json({ success: true, data: result });
  }

  const results = [];
  const batchSize = 3;

  for (let i = 0; i < ALL_COMPETITORS.length; i += batchSize) {
    const batch = ALL_COMPETITORS.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (comp) => {
        const scores = await getPageSpeedScore(comp.domain);
        return { ...comp, ...scores };
      })
    );
    results.push(...batchResults);
  }

  results.sort((a, b) => (b.seoScore || 0) - (a.seoScore || 0));
  results.forEach((r, i) => { r.rank = i + 1; });

  return res.status(200).json({
    success: true,
    source: 'Google PageSpeed Insights API',
    timestamp: new Date().toISOString(),
    data: results
  });
}

// ============================================
// ACTION: rankings - Combined rankings
// ============================================

async function handleRankings(req, res) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

  const [placesData, pageRankData] = await Promise.all([
    fetchPlacesData(),
    fetchPageRankData()
  ]);

  const competitors = buildCompetitorList(placesData, pageRankData);
  competitors.sort((a, b) => b.overallScore - a.overallScore);
  competitors.forEach((c, i) => c.rank = i + 1);

  return res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    dataSources: {
      reviews: 'Google Places API (live)',
      pageRank: 'OpenPageRank API (live)',
      seoScores: 'Google PageSpeed (cached weekly)'
    },
    data: competitors
  });
}

// ============================================
// ACTION: daily-update - Cron job for daily updates
// Runs 4 competitors per day to respect rate limits
// ============================================

async function handleDailyUpdate(req, res, batch, key) {
  const SECRET = process.env.CRON_SECRET || 'daily-update-2024';
  if (key && key !== SECRET) {
    return res.status(401).json({ error: 'Invalid key' });
  }

  const dayOfWeek = new Date().getDay();
  const batchSize = 4;
  let batchIndex = batch !== undefined ? parseInt(batch) : (dayOfWeek >= 1 && dayOfWeek <= 5 ? dayOfWeek - 1 : 4);

  const startIdx = batchIndex * batchSize;
  const todaysCompetitors = ALL_COMPETITORS.slice(startIdx, startIdx + batchSize);

  if (todaysCompetitors.length === 0) {
    return res.status(200).json({
      success: true,
      message: 'No competitors to update for this batch',
      batchIndex,
      dayOfWeek
    });
  }

  const results = [];
  for (const comp of todaysCompetitors) {
    try {
      let data = await fetchPageSpeedAPI(`https://www.${comp.domain}`);
      if (data.error && data.error.includes('FAILED_DOCUMENT_REQUEST')) {
        data = await fetchPageSpeedAPI(`https://${comp.domain}`);
      }
      results.push(data.error
        ? { ...comp, error: data.error, performance: null, seoScore: null }
        : { ...comp, ...data, fetchedAt: new Date().toISOString() }
      );
      // 3 second delay between requests to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      results.push({ ...comp, error: error.message });
    }
  }

  return res.status(200).json({
    success: true,
    dayOfWeek,
    batchIndex,
    batchName: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][batchIndex] || 'Weekend',
    competitorsUpdated: results.length,
    timestamp: new Date().toISOString(),
    results,
    schedule: {
      monday: ALL_COMPETITORS.slice(0, 4).map(c => c.name),
      tuesday: ALL_COMPETITORS.slice(4, 8).map(c => c.name),
      wednesday: ALL_COMPETITORS.slice(8, 12).map(c => c.name),
      thursday: ALL_COMPETITORS.slice(12, 16).map(c => c.name),
      friday: ALL_COMPETITORS.slice(16, 20).map(c => c.name)
    }
  });
}

// ============================================
// ACTION: update-scores - Manual batch update
// ============================================

async function handleUpdateScores(req, res, batch, key) {
  const SECRET_KEY = process.env.UPDATE_SECRET_KEY || 'update-seo-scores-2024';
  if (key !== SECRET_KEY) {
    return res.status(401).json({
      error: 'Unauthorized. Pass ?key=YOUR_SECRET_KEY'
    });
  }

  const batchNum = parseInt(batch) || 0;
  const batchSize = 5;
  const startIdx = batchNum * batchSize;
  const competitors = ALL_COMPETITORS.slice(startIdx, startIdx + batchSize);

  const results = [];
  for (const comp of competitors) {
    try {
      const data = await fetchPageSpeedAPI(`https://www.${comp.domain}`);
      results.push(data.error
        ? { ...comp, error: data.error }
        : { ...comp, ...data, fetchedAt: new Date().toISOString() }
      );
      // 2 second delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      results.push({ ...comp, error: error.message });
    }
  }

  return res.status(200).json({
    success: true,
    batch: batchNum,
    totalBatches: Math.ceil(ALL_COMPETITORS.length / batchSize),
    processed: results.length,
    nextBatch: batchNum < Math.ceil(ALL_COMPETITORS.length / batchSize) - 1
      ? `?action=update-scores&key=${key}&batch=${batchNum + 1}`
      : null,
    timestamp: new Date().toISOString(),
    results
  });
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getPageSpeedScore(domain) {
  try {
    const url = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://${domain}&strategy=mobile&category=performance&category=seo&category=accessibility&category=best-practices`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return { domain, error: data.error.message };
    }

    const categories = data.lighthouseResult?.categories || {};
    return {
      domain,
      performance: Math.round((categories.performance?.score || 0) * 100),
      seoScore: Math.round((categories.seo?.score || 0) * 100),
      accessibility: Math.round((categories.accessibility?.score || 0) * 100),
      bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
      overallScore: Math.round(
        (categories.performance?.score || 0) * 20 +
        (categories.seo?.score || 0) * 30 +
        (categories.accessibility?.score || 0) * 25 +
        (categories['best-practices']?.score || 0) * 25
      )
    };
  } catch (error) {
    return { domain, error: error.message };
  }
}

async function fetchPageSpeedAPI(url) {
  try {
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&category=seo&category=accessibility&category=best-practices`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.error) {
      return { error: data.error.message };
    }

    const categories = data.lighthouseResult?.categories || {};
    return {
      performance: Math.round((categories.performance?.score || 0) * 100),
      seoScore: Math.round((categories.seo?.score || 0) * 100),
      accessibility: Math.round((categories.accessibility?.score || 0) * 100),
      bestPractices: Math.round((categories['best-practices']?.score || 0) * 100)
    };
  } catch (error) {
    return { error: error.message };
  }
}

async function fetchPlacesData() {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://www.chrisdavidsalon.com';
    const response = await fetch(`${baseUrl}/api/admin-data?type=competitors`);
    const data = await response.json();
    return data.success ? data.data.competitors : [];
  } catch (e) {
    console.error('Places fetch error:', e);
    return [];
  }
}

async function fetchPageRankData() {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://www.chrisdavidsalon.com';
    const response = await fetch(`${baseUrl}/api/authority-score?competitors=true`);
    const data = await response.json();
    const map = {};
    if (data.success && data.data?.all_results) {
      data.data.all_results.forEach(r => {
        map[r.domain] = r.pagerank_decimal || 0;
      });
    }
    return map;
  } catch (e) {
    console.error('PageRank fetch error:', e);
    return {};
  }
}

function buildCompetitorList(placesData, pageRankMap) {
  const competitors = [];

  for (const place of placesData) {
    const nameLower = (place.name || '').toLowerCase();
    let domain = null;
    for (const [key, dom] of Object.entries(DOMAIN_MAP)) {
      if (nameLower.includes(key)) {
        domain = dom;
        break;
      }
    }

    const pageRank = domain ? (pageRankMap[domain] || 0) : 0;
    const reviews = place.reviews || 0;
    const rating = place.rating || 0;

    const localSEO = Math.round(
      (rating * 10) +
      (reviews > 0 ? Math.min(Math.log10(reviews) * 15, 40) : 0) +
      (place.placeId ? 10 : 0)
    );
    const authority = Math.round(pageRank * 10);
    const overallScore = Math.round(localSEO * 0.50 + authority * 0.25 + 75 * 0.25);

    competitors.push({
      name: place.name,
      domain: domain || 'unknown',
      reviews,
      rating,
      pageRank: pageRank || null,
      localSEO,
      authority,
      overallScore,
      isUs: place.isOurSalon || nameLower.includes('chris david')
    });
  }

  return competitors;
}
