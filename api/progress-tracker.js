/**
 * Progress Tracker API
 * ONLY returns VERIFIED data from live APIs
 *
 * Data Sources:
 * - Traffic: GA4 API (LIVE)
 * - Authority: OpenPageRank API (LIVE)
 * - Reviews: NOT AVAILABLE (Google Places API not configured)
 * - Rankings: NOT AVAILABLE (Search Console not integrated)
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;
  // Always use production URL for internal API calls to avoid preview URL issues
  const baseUrl = 'https://www.chrisdavidsalon.com';

  try {
    // Fetch REAL data from live APIs
    let trafficData = null;
    let authorityData = null;

    try {
      const trafficRes = await fetch(`${baseUrl}/api/ga4-analytics?type=overview`);
      const trafficJson = await trafficRes.json();
      if (trafficJson.success && trafficJson.isLiveData) {
        trafficData = {
          users: trafficJson.data.activeUsers,
          sessions: trafficJson.data.sessions,
          source: 'GA4 API',
          verified: true
        };
      }
    } catch (e) {
      console.error('Could not fetch traffic:', e.message);
    }

    try {
      const authorityRes = await fetch(`${baseUrl}/api/authority`);
      const authorityJson = await authorityRes.json();
      if (authorityJson.success && authorityJson.live) {
        authorityData = {
          score: authorityJson.data.authority_score,
          pagerank: authorityJson.data.pagerank_decimal,
          source: 'OpenPageRank API',
          verified: true
        };
      }
    } catch (e) {
      console.error('Could not fetch authority:', e.message);
    }

    switch (action) {
      case 'summary':
        return res.json({
          success: true,
          action: 'summary',
          disclaimer: 'ONLY showing verified live data. No historical baseline exists yet.',
          trackingStartDate: '2024-11-26',
          current: {
            traffic: trafficData || { users: null, verified: false, source: 'GA4 API unavailable' },
            authority: authorityData || { score: null, verified: false, source: 'OpenPageRank unavailable' },
            reviews: { count: null, verified: false, source: 'Google Places API not configured' },
            rankings: { position: null, verified: false, source: 'Search Console not integrated' }
          },
          historical: {
            available: false,
            reason: 'Tracking started Nov 26, 2024. Need more time to build comparison data.',
            weeksOfData: Math.floor((Date.now() - new Date('2024-11-26').getTime()) / (7 * 24 * 60 * 60 * 1000))
          },
          message: 'Growth comparison will be available after collecting several weeks of snapshots.',
          timestamp: new Date().toISOString()
        });

      case 'current':
        return res.json({
          success: true,
          action: 'current',
          data: {
            traffic: trafficData,
            authority: authorityData,
            reviews: null,
            rankings: null
          },
          sources: {
            traffic: 'GA4 API - https://www.chrisdavidsalon.com/api/ga4-analytics?type=overview',
            authority: 'OpenPageRank API - https://www.chrisdavidsalon.com/api/authority',
            reviews: 'NOT CONFIGURED',
            rankings: 'NOT INTEGRATED'
          },
          timestamp: new Date().toISOString()
        });

      case 'snapshot':
        // Record current state for future comparison
        const snapshot = {
          date: new Date().toISOString().split('T')[0],
          traffic: trafficData,
          authority: authorityData,
          reviews: null,
          rankings: null
        };
        return res.json({
          success: true,
          action: 'snapshot',
          snapshot: snapshot,
          note: 'To persist snapshots, they need to be stored in a database or file system with write access.',
          timestamp: new Date().toISOString()
        });

      default:
        return res.json({
          success: true,
          message: 'Progress Tracker API - VERIFIED DATA ONLY',
          disclaimer: 'This API only returns data from verified live sources. No fabricated or estimated data.',
          availableActions: [
            'summary - Current metrics with data source verification',
            'current - Raw current data from live APIs',
            'snapshot - Generate a point-in-time snapshot'
          ],
          dataSources: {
            traffic: { source: 'GA4 API', status: trafficData ? 'LIVE' : 'UNAVAILABLE' },
            authority: { source: 'OpenPageRank API', status: authorityData ? 'LIVE' : 'UNAVAILABLE' },
            reviews: { source: 'Google Places API', status: 'NOT CONFIGURED' },
            rankings: { source: 'Search Console', status: 'NOT INTEGRATED' }
          },
          timestamp: new Date().toISOString()
        });
    }

  } catch (error) {
    console.error('[Progress Tracker API] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
