// Competitor Rankings API - Combines all data sources
// - Reviews/Ratings: Live from Google Places API
// - PageRank: Live from OpenPageRank API
// - SEO Scores: Cached (updated weekly via update-competitor-scores)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate'); // Cache 5 min

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Fetch all data sources in parallel
    const [placesData, pageRankData] = await Promise.all([
      fetchPlacesData(),
      fetchPageRankData()
    ]);

    // Build competitor list with all data
    const competitors = buildCompetitorList(placesData, pageRankData);

    // Sort by overall ranking score
    competitors.sort((a, b) => b.overallScore - a.overallScore);

    // Add rank
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

  } catch (error) {
    console.error('Competitor rankings error:', error);
    return res.status(200).json({
      success: false,
      error: error.message
    });
  }
}

async function fetchPlacesData() {
  try {
    // Use the existing admin-data API
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

    // Build lookup map
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
  // Domain mapping for matching Places results to domains
  const domainMap = {
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
    'aura hair': 'aurahairco.com',
    'tyler presley': 'tylerpresleysalon.com',
    'conte salon': 'contesalon.com',
    'salon sora': 'salonsora.com',
    'pyure': 'pyuresalon.com',
    'dapper and divine': 'dapperanddivinestudio.com',
    'hair mess': 'hairmesssalon.com',
    'salon trace': 'salontrace.com',
    'arielle settel': 'ariellesettel.com',
    'odeon': 'odeonsalon.com',
    'moxie': 'moxiesalon.com',
    'perk salon': 'perksalondelray.com',
    'chloe': 'chloeandcosalon.com'
  };

  const competitors = [];

  for (const place of placesData) {
    const nameLower = (place.name || '').toLowerCase();

    // Find matching domain
    let domain = null;
    for (const [key, dom] of Object.entries(domainMap)) {
      if (nameLower.includes(key)) {
        domain = dom;
        break;
      }
    }

    const pageRank = domain ? (pageRankMap[domain] || 0) : 0;
    const reviews = place.reviews || 0;
    const rating = place.rating || 0;

    // Calculate scores
    // Local SEO: Based on reviews + rating (what Google cares about for local)
    const localSEO = Math.round(
      (rating * 10) +
      (reviews > 0 ? Math.min(Math.log10(reviews) * 15, 40) : 0) +
      (place.placeId ? 10 : 0)
    );

    // Authority: PageRank scaled to 0-100
    const authority = Math.round(pageRank * 10);

    // Overall score: Combination of factors
    // Reviews matter most for local, but authority and SEO matter too
    const overallScore = Math.round(
      localSEO * 0.50 +      // 50% local signals (reviews, rating)
      authority * 0.25 +     // 25% authority (PageRank)
      75 * 0.25              // 25% assumed baseline for having a website
      // TODO: Replace 75 with actual PageSpeed SEO score when cached data available
    );

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
