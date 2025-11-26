// Authority Score API - Uses OpenPageRank (FREE)
// NO HARDCODED DATA - Real API calls only

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const OPENPAGERANK_API_KEY = process.env.OPENPAGERANK_API_KEY || '';

  if (!OPENPAGERANK_API_KEY) {
    return res.status(200).json({
      success: false,
      live: false,
      error: 'OPENPAGERANK_API_KEY not configured',
      message: 'Add OPENPAGERANK_API_KEY to Vercel environment variables (free at domcop.com/openpagerank)',
      data: { authority_score: null, pagerank: null }
    });
  }

  // Get domain from query, default to chrisdavidsalon.com
  const { domain = 'chrisdavidsalon.com', competitors = 'false' } = req.query;

  try {
    // Build domains list
    let domains = [domain];

    if (competitors === 'true') {
      // All 26 competitor domains from OpenPageRank research
      domains = [
        'chrisdavidsalon.com',
        'bestsalondelray.com',
        'bestdelraysalon.com',
        'bestsalonpalmbeach.com',
        'rovesalon.com',
        'studio34delray.com',
        'bondstreetsalon.com',
        'kaanhairdesign.com',
        'onesalondelray.com',
        'tylerpresleysalon.com',
        'slshair.com',
        'imbuesalon.com',
        'amandamajor.com',
        'salonsouthflow.com',
        'contesalon.com',
        'salonhotheads.com',
        'pyuresalon.com',
        'salonsora.com',
        'studio10bocaraton.com',
        'dapperanddivinestudio.com',
        'hairmesssalon.com',
        'bocaratonsalon.com',
        'salontrace.com',
        'cloud10usa.com',
        'ariellesettel.com',
        'christopherstoosalon.com'
      ];
    }

    // OpenPageRank API - can query up to 100 domains at once
    const apiUrl = `https://openpagerank.com/api/v1.0/getPageRank?domains[]=${domains.join('&domains[]=')}`;

    const response = await fetch(apiUrl, {
      headers: {
        'API-OPR': OPENPAGERANK_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`OpenPageRank API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status_code === 200 && data.response) {
      const results = data.response.map(item => ({
        domain: item.domain,
        pagerank: item.page_rank_integer,
        pagerank_decimal: item.page_rank_decimal,
        rank: item.rank,
        status: item.status_code === 200 ? 'found' : 'not_indexed'
      }));

      // Find Chris David Salon's score
      const chrisDavidResult = results.find(r => r.domain === 'chrisdavidsalon.com');

      // Convert PageRank (0-10) to Authority Score (0-100)
      // Formula: (pagerank_decimal / 10) * 100
      const authorityScore = chrisDavidResult?.pagerank_decimal
        ? Math.round((chrisDavidResult.pagerank_decimal / 10) * 100)
        : null;

      return res.status(200).json({
        success: true,
        live: true,
        source: 'OpenPageRank API',
        timestamp: new Date().toISOString(),
        data: {
          authority_score: authorityScore,
          pagerank: chrisDavidResult?.pagerank || null,
          pagerank_decimal: chrisDavidResult?.pagerank_decimal || null,
          global_rank: chrisDavidResult?.rank || null,
          all_results: competitors === 'true' ? results : undefined,
          comparison: competitors === 'true' ? {
            chris_david_position: results
              .filter(r => r.pagerank_decimal)
              .sort((a, b) => b.pagerank_decimal - a.pagerank_decimal)
              .findIndex(r => r.domain === 'chrisdavidsalon.com') + 1,
            total_compared: results.filter(r => r.pagerank_decimal).length
          } : undefined
        }
      });
    }

    throw new Error('Invalid response from OpenPageRank');

  } catch (error) {
    console.error('Authority score error:', error);
    return res.status(200).json({
      success: false,
      live: false,
      error: error.message,
      message: 'Authority score unavailable - try again later',
      data: { authority_score: null, pagerank: null }
    });
  }
}
