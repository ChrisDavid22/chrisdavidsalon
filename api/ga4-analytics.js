// GA4 Analytics API + Search Console API
// Pulls REAL data from Google Analytics 4 and Google Search Console
// Requires: GA4_PROPERTY_ID and GOOGLE_SERVICE_ACCOUNT_JSON in Vercel env vars
// Search Console: Service account needs Full access in Search Console settings

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { type = 'overview', startDate = '30daysAgo', endDate = 'today' } = req.query;

  // Check for required credentials
  const propertyId = process.env.GA4_PROPERTY_ID;
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!propertyId || !serviceAccountJson) {
    return res.status(200).json({
      success: false,
      error: 'GA4 credentials not configured',
      message: 'Add GA4_PROPERTY_ID and GOOGLE_SERVICE_ACCOUNT_JSON to Vercel environment variables',
      credentialsStatus: {
        GA4_PROPERTY_ID: propertyId ? 'configured' : 'MISSING',
        GOOGLE_SERVICE_ACCOUNT_JSON: serviceAccountJson ? 'configured' : 'MISSING'
      },
      instructions: {
        step1: 'Go to analytics.google.com → Admin → Property Settings → Copy Property ID',
        step2: 'Go to console.cloud.google.com → Create service account → Download JSON key',
        step3: 'Add service account email to GA4 Property Access Management as Viewer',
        step4: 'Add both values to Vercel → Project → Settings → Environment Variables'
      }
    });
  }

  try {
    // Parse service account credentials
    let credentials;
    try {
      credentials = JSON.parse(serviceAccountJson);
    } catch (e) {
      return res.status(200).json({
        success: false,
        error: 'Invalid service account JSON',
        message: 'The GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not valid JSON'
      });
    }

    // Import Google Analytics Data API client
    const { BetaAnalyticsDataClient } = await import('@google-analytics/data');

    // Initialize client with credentials
    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: credentials
    });

    // Route to appropriate handler based on type
    switch (type) {
      case 'overview':
        return await getOverview(analyticsDataClient, propertyId, startDate, endDate, res);
      case 'traffic-over-time':
        return await getTrafficOverTime(analyticsDataClient, propertyId, startDate, endDate, res);
      case 'traffic-sources':
        return await getTrafficSources(analyticsDataClient, propertyId, startDate, endDate, res);
      case 'microsite-referrals':
        return await getMicrositeReferrals(analyticsDataClient, propertyId, startDate, endDate, res);
      case 'top-pages':
        return await getTopPages(analyticsDataClient, propertyId, startDate, endDate, res);
      case 'devices':
        return await getDeviceBreakdown(analyticsDataClient, propertyId, startDate, endDate, res);
      case 'events':
        return await getEvents(analyticsDataClient, propertyId, startDate, endDate, res);
      case 'search-rankings':
        return await getSearchRankings(credentials, startDate, endDate, res);
      default:
        return await getOverview(analyticsDataClient, propertyId, startDate, endDate, res);
    }

  } catch (error) {
    console.error('GA4 API Error:', error);
    return res.status(200).json({
      success: false,
      error: error.message,
      errorType: error.code || 'UNKNOWN',
      suggestion: error.message.includes('permission')
        ? 'Make sure the service account email is added to GA4 Property Access Management as Viewer'
        : 'Check that credentials are valid and GA4 Data API is enabled in Google Cloud Console'
    });
  }
}

// Get overview metrics
async function getOverview(client, propertyId, startDate, endDate, res) {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'sessions' },
      { name: 'screenPageViews' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' },
      { name: 'newUsers' }
    ]
  });

  const metrics = response.rows?.[0]?.metricValues || [];

  return res.status(200).json({
    success: true,
    dataSource: 'google-analytics-4-api',
    isLiveData: true,
    dateRange: { startDate, endDate },
    data: {
      activeUsers: parseInt(metrics[0]?.value || 0),
      sessions: parseInt(metrics[1]?.value || 0),
      pageViews: parseInt(metrics[2]?.value || 0),
      avgSessionDuration: parseFloat(metrics[3]?.value || 0).toFixed(1),
      bounceRate: (parseFloat(metrics[4]?.value || 0) * 100).toFixed(1),
      newUsers: parseInt(metrics[5]?.value || 0)
    },
    fetchedAt: new Date().toISOString()
  });
}

// Get traffic over time (for charts)
async function getTrafficOverTime(client, propertyId, startDate, endDate, res) {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'date' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'sessions' },
      { name: 'screenPageViews' }
    ],
    orderBys: [{ dimension: { dimensionName: 'date' } }]
  });

  const dataPoints = response.rows?.map(row => ({
    date: row.dimensionValues[0].value,
    users: parseInt(row.metricValues[0].value),
    sessions: parseInt(row.metricValues[1].value),
    pageViews: parseInt(row.metricValues[2].value)
  })) || [];

  return res.status(200).json({
    success: true,
    dataSource: 'google-analytics-4-api',
    isLiveData: true,
    dateRange: { startDate, endDate },
    data: dataPoints,
    summary: {
      totalDays: dataPoints.length,
      totalUsers: dataPoints.reduce((sum, d) => sum + d.users, 0),
      totalSessions: dataPoints.reduce((sum, d) => sum + d.sessions, 0),
      avgUsersPerDay: dataPoints.length > 0
        ? Math.round(dataPoints.reduce((sum, d) => sum + d.users, 0) / dataPoints.length)
        : 0
    },
    fetchedAt: new Date().toISOString()
  });
}

// Get traffic sources
async function getTrafficSources(client, propertyId, startDate, endDate, res) {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [
      { name: 'sessionSource' },
      { name: 'sessionMedium' }
    ],
    metrics: [
      { name: 'sessions' },
      { name: 'activeUsers' }
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 20
  });

  const sources = response.rows?.map(row => ({
    source: row.dimensionValues[0].value,
    medium: row.dimensionValues[1].value,
    sessions: parseInt(row.metricValues[0].value),
    users: parseInt(row.metricValues[1].value)
  })) || [];

  const totalSessions = sources.reduce((sum, s) => sum + s.sessions, 0);

  return res.status(200).json({
    success: true,
    dataSource: 'google-analytics-4-api',
    isLiveData: true,
    dateRange: { startDate, endDate },
    data: sources.map(s => ({
      ...s,
      percentage: totalSessions > 0 ? ((s.sessions / totalSessions) * 100).toFixed(1) : 0
    })),
    totalSessions,
    fetchedAt: new Date().toISOString()
  });
}

// Get traffic from microsites specifically
async function getMicrositeReferrals(client, propertyId, startDate, endDate, res) {
  const microsites = [
    'bestsalondelray.com',
    'bestdelraysalon.com',
    'bestsalonpalmbeach.com'
  ];

  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [
      { name: 'sessionSource' },
      { name: 'date' }
    ],
    metrics: [
      { name: 'sessions' },
      { name: 'activeUsers' }
    ],
    dimensionFilter: {
      orGroup: {
        expressions: microsites.map(site => ({
          filter: {
            fieldName: 'sessionSource',
            stringFilter: {
              matchType: 'CONTAINS',
              value: site.replace('.com', '')
            }
          }
        }))
      }
    },
    orderBys: [{ dimension: { dimensionName: 'date' } }]
  });

  const referrals = response.rows?.map(row => ({
    source: row.dimensionValues[0].value,
    date: row.dimensionValues[1].value,
    sessions: parseInt(row.metricValues[0].value),
    users: parseInt(row.metricValues[1].value)
  })) || [];

  // Group by microsite
  const byMicrosite = {};
  microsites.forEach(site => {
    byMicrosite[site] = {
      totalSessions: 0,
      totalUsers: 0,
      dailyData: []
    };
  });

  referrals.forEach(r => {
    const matchedSite = microsites.find(site =>
      r.source.toLowerCase().includes(site.replace('.com', '').toLowerCase())
    );
    if (matchedSite) {
      byMicrosite[matchedSite].totalSessions += r.sessions;
      byMicrosite[matchedSite].totalUsers += r.users;
      byMicrosite[matchedSite].dailyData.push({
        date: r.date,
        sessions: r.sessions,
        users: r.users
      });
    }
  });

  return res.status(200).json({
    success: true,
    dataSource: 'google-analytics-4-api',
    isLiveData: true,
    dateRange: { startDate, endDate },
    microsites: byMicrosite,
    totalFromMicrosites: {
      sessions: Object.values(byMicrosite).reduce((sum, m) => sum + m.totalSessions, 0),
      users: Object.values(byMicrosite).reduce((sum, m) => sum + m.totalUsers, 0)
    },
    fetchedAt: new Date().toISOString()
  });
}

// Get top landing pages
async function getTopPages(client, propertyId, startDate, endDate, res) {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'landingPage' }],
    metrics: [
      { name: 'sessions' },
      { name: 'activeUsers' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' }
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 20
  });

  const pages = response.rows?.map(row => ({
    page: row.dimensionValues[0].value,
    sessions: parseInt(row.metricValues[0].value),
    users: parseInt(row.metricValues[1].value),
    bounceRate: (parseFloat(row.metricValues[2].value) * 100).toFixed(1),
    avgDuration: parseFloat(row.metricValues[3].value).toFixed(1)
  })) || [];

  return res.status(200).json({
    success: true,
    dataSource: 'google-analytics-4-api',
    isLiveData: true,
    dateRange: { startDate, endDate },
    data: pages,
    fetchedAt: new Date().toISOString()
  });
}

// Get device breakdown
async function getDeviceBreakdown(client, propertyId, startDate, endDate, res) {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'deviceCategory' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'sessions' }
    ]
  });

  const devices = response.rows?.map(row => ({
    device: row.dimensionValues[0].value,
    users: parseInt(row.metricValues[0].value),
    sessions: parseInt(row.metricValues[1].value)
  })) || [];

  const totalUsers = devices.reduce((sum, d) => sum + d.users, 0);

  return res.status(200).json({
    success: true,
    dataSource: 'google-analytics-4-api',
    isLiveData: true,
    dateRange: { startDate, endDate },
    data: devices.map(d => ({
      ...d,
      percentage: totalUsers > 0 ? ((d.users / totalUsers) * 100).toFixed(1) : 0
    })),
    totalUsers,
    fetchedAt: new Date().toISOString()
  });
}

// Get events (booking clicks, phone clicks, etc.)
async function getEvents(client, propertyId, startDate, endDate, res) {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'eventName' }],
    metrics: [
      { name: 'eventCount' },
      { name: 'totalUsers' }
    ],
    dimensionFilter: {
      orGroup: {
        expressions: [
          { filter: { fieldName: 'eventName', stringFilter: { matchType: 'CONTAINS', value: 'click' } } },
          { filter: { fieldName: 'eventName', stringFilter: { matchType: 'CONTAINS', value: 'book' } } },
          { filter: { fieldName: 'eventName', stringFilter: { matchType: 'CONTAINS', value: 'phone' } } },
          { filter: { fieldName: 'eventName', stringFilter: { matchType: 'CONTAINS', value: 'call' } } },
          { filter: { fieldName: 'eventName', stringFilter: { matchType: 'CONTAINS', value: 'direction' } } },
          { filter: { fieldName: 'eventName', stringFilter: { matchType: 'CONTAINS', value: 'submit' } } }
        ]
      }
    },
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }]
  });

  const events = response.rows?.map(row => ({
    eventName: row.dimensionValues[0].value,
    count: parseInt(row.metricValues[0].value),
    uniqueUsers: parseInt(row.metricValues[1].value)
  })) || [];

  return res.status(200).json({
    success: true,
    dataSource: 'google-analytics-4-api',
    isLiveData: true,
    dateRange: { startDate, endDate },
    data: events,
    summary: {
      totalConversionEvents: events.reduce((sum, e) => sum + e.count, 0),
      uniqueConverters: events.reduce((sum, e) => sum + e.uniqueUsers, 0)
    },
    fetchedAt: new Date().toISOString()
  });
}

// Get Search Console keyword rankings
async function getSearchRankings(credentials, startDate, endDate, res) {
  try {
    const { google } = await import('googleapis');

    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
    });

    const searchconsole = google.searchconsole({ version: 'v1', auth });

    // Convert date format if needed (30daysAgo -> actual date)
    const now = new Date();
    let start, end;

    if (startDate === '30daysAgo') {
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (startDate === '7daysAgo') {
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      start = new Date(startDate);
    }

    if (endDate === 'today') {
      end = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // Search Console data is delayed 3 days
    } else {
      end = new Date(endDate);
    }

    const startDateStr = start.toISOString().split('T')[0];
    const endDateStr = end.toISOString().split('T')[0];

    // Query Search Console API
    const response = await searchconsole.searchanalytics.query({
      siteUrl: 'sc-domain:chrisdavidsalon.com',
      requestBody: {
        startDate: startDateStr,
        endDate: endDateStr,
        dimensions: ['query'],
        rowLimit: 50,
        dataState: 'final'
      }
    });

    const rows = response.data.rows || [];

    // Process and categorize keywords
    const keywords = rows.map(row => ({
      keyword: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: (row.ctr * 100).toFixed(1),
      position: row.position.toFixed(1)
    }));

    // Categorize by intent
    const branded = keywords.filter(k =>
      k.keyword.toLowerCase().includes('chris david')
    );
    const service = keywords.filter(k =>
      k.keyword.toLowerCase().match(/balayage|color|highlight|keratin|extension|wedding|bridal/)
    );
    const local = keywords.filter(k =>
      k.keyword.toLowerCase().match(/delray|palm beach|boca|near me|salon/)
    );

    // Calculate average position
    const avgPosition = keywords.length > 0
      ? (keywords.reduce((sum, k) => sum + parseFloat(k.position), 0) / keywords.length).toFixed(1)
      : 0;

    // Find best opportunities (high impressions, low position)
    const opportunities = keywords
      .filter(k => k.impressions > 50 && parseFloat(k.position) > 10)
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      dataSource: 'google-search-console-api',
      isLiveData: true,
      dateRange: { startDate: startDateStr, endDate: endDateStr },
      summary: {
        totalKeywords: keywords.length,
        totalClicks: keywords.reduce((sum, k) => sum + k.clicks, 0),
        totalImpressions: keywords.reduce((sum, k) => sum + k.impressions, 0),
        averagePosition: avgPosition,
        averageCTR: keywords.length > 0
          ? (keywords.reduce((sum, k) => sum + parseFloat(k.ctr), 0) / keywords.length).toFixed(1)
          : 0
      },
      categories: {
        branded: branded.slice(0, 10),
        service: service.slice(0, 10),
        local: local.slice(0, 10)
      },
      opportunities,
      topKeywords: keywords.slice(0, 20),
      fetchedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Search Console Error:', error);
    return res.status(200).json({
      success: false,
      error: error.message,
      suggestion: 'Make sure the service account has Full access in Search Console settings'
    });
  }
}
