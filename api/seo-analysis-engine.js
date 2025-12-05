// SEO Analysis Engine - The "Brain" of the Autonomous SEO Agent
// Compares week-over-week data, identifies trends, and generates actionable insights
// Requires: GA4 credentials configured + historical data in Vercel KV

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action = 'analyze' } = req.query;

  try {
    switch (action) {
      case 'analyze':
        return await runFullAnalysis(req, res);
      case 'compare-weeks':
        return await compareWeeks(req, res);
      case 'microsite-impact':
        return await analyzeMicrositeImpact(req, res);
      case 'trend-detection':
        return await detectTrends(req, res);
      case 'generate-actions':
        return await generateActions(req, res);
      case 'health-check':
        return await healthCheck(req, res);
      case 'capture-snapshot':
        return await captureSnapshot(req, res);
      case 'capture-baseline':
        return await captureBaseline(req, res);
      case 'compare-to-baseline':
        return await compareToBaseline(req, res);
      default:
        return await runFullAnalysis(req, res);
    }
  } catch (error) {
    console.error('Analysis Engine Error:', error);
    return res.status(200).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Run complete analysis - orchestrates all analysis functions
async function runFullAnalysis(req, res) {
  const baseUrl = getBaseUrl(req);

  // Check if GA4 is connected first
  const ga4Status = await checkGA4Connection(baseUrl);

  if (!ga4Status.connected) {
    return res.status(200).json({
      success: false,
      status: 'awaiting-credentials',
      message: 'GA4 API not connected - waiting for credentials',
      ga4Status: ga4Status,
      engineReady: true,
      analysisCapabilities: [
        'Week-over-week comparison',
        'Microsite referral tracking',
        'Traffic source analysis',
        'Trend detection',
        'Action generation',
        'Automated reporting'
      ],
      instructions: {
        required: ['GA4_PROPERTY_ID', 'GOOGLE_SERVICE_ACCOUNT_JSON'],
        location: 'Vercel → Project Settings → Environment Variables'
      },
      timestamp: new Date().toISOString()
    });
  }

  // GA4 is connected - run full analysis
  const [
    thisWeekData,
    lastWeekData,
    trafficSources,
    micrositeReferrals,
    topPages
  ] = await Promise.all([
    fetchGA4Data(baseUrl, 'overview', '7daysAgo', 'today'),
    fetchGA4Data(baseUrl, 'overview', '14daysAgo', '8daysAgo'),
    fetchGA4Data(baseUrl, 'traffic-sources', '7daysAgo', 'today'),
    fetchGA4Data(baseUrl, 'microsite-referrals', '30daysAgo', 'today'),
    fetchGA4Data(baseUrl, 'top-pages', '7daysAgo', 'today')
  ]);

  // Calculate week-over-week changes
  const weekComparison = calculateWeekComparison(thisWeekData, lastWeekData);

  // Analyze microsite effectiveness
  const micrositeAnalysis = analyzeMicrosites(micrositeReferrals);

  // Detect trends
  const trends = identifyTrends(weekComparison, micrositeAnalysis);

  // Generate action items
  const actions = generateActionItems(trends, weekComparison, micrositeAnalysis);

  return res.status(200).json({
    success: true,
    status: 'analysis-complete',
    analysisDate: new Date().toISOString(),
    summary: {
      overallHealth: calculateHealthScore(weekComparison),
      weekOverWeek: weekComparison,
      micrositeImpact: micrositeAnalysis.summary,
      keyTrends: trends.slice(0, 5),
      priorityActions: actions.slice(0, 3)
    },
    detailed: {
      weekComparison,
      micrositeAnalysis,
      trends,
      actions,
      trafficSources: trafficSources?.data || [],
      topPages: topPages?.data || []
    },
    dataSource: 'google-analytics-4-api',
    isLiveData: true,
    timestamp: new Date().toISOString()
  });
}

// Compare this week vs last week
async function compareWeeks(req, res) {
  const baseUrl = getBaseUrl(req);

  const [thisWeek, lastWeek] = await Promise.all([
    fetchGA4Data(baseUrl, 'overview', '7daysAgo', 'today'),
    fetchGA4Data(baseUrl, 'overview', '14daysAgo', '8daysAgo')
  ]);

  if (!thisWeek?.success || !lastWeek?.success) {
    return res.status(200).json({
      success: false,
      error: 'Could not fetch week data',
      thisWeekStatus: thisWeek?.success ? 'ok' : 'failed',
      lastWeekStatus: lastWeek?.success ? 'ok' : 'failed'
    });
  }

  const comparison = calculateWeekComparison(thisWeek, lastWeek);

  return res.status(200).json({
    success: true,
    comparison,
    interpretation: interpretComparison(comparison),
    timestamp: new Date().toISOString()
  });
}

// Analyze microsite referral impact
async function analyzeMicrositeImpact(req, res) {
  const baseUrl = getBaseUrl(req);

  const [referrals30d, referrals7d] = await Promise.all([
    fetchGA4Data(baseUrl, 'microsite-referrals', '30daysAgo', 'today'),
    fetchGA4Data(baseUrl, 'microsite-referrals', '7daysAgo', 'today')
  ]);

  if (!referrals30d?.success) {
    return res.status(200).json({
      success: false,
      error: 'Could not fetch microsite referral data',
      ga4Connected: false
    });
  }

  const analysis = analyzeMicrosites(referrals30d);
  const recentTrend = analyzeMicrosites(referrals7d);

  return res.status(200).json({
    success: true,
    microsites: {
      'bestsalondelray.com': analysis.bySite['bestsalondelray.com'] || { sessions: 0, users: 0 },
      'bestdelraysalon.com': analysis.bySite['bestdelraysalon.com'] || { sessions: 0, users: 0 },
      'bestsalonpalmbeach.com': analysis.bySite['bestsalonpalmbeach.com'] || { sessions: 0, users: 0 }
    },
    summary: analysis.summary,
    last7Days: recentTrend.summary,
    recommendations: generateMicrositeRecommendations(analysis),
    timestamp: new Date().toISOString()
  });
}

// Detect traffic trends
async function detectTrends(req, res) {
  const baseUrl = getBaseUrl(req);
  const { period = '30' } = req.query;

  const trafficData = await fetchGA4Data(baseUrl, 'traffic-over-time', `${period}daysAgo`, 'today');

  if (!trafficData?.success) {
    return res.status(200).json({
      success: false,
      error: 'Could not fetch traffic data for trend analysis'
    });
  }

  const trends = analyzeTimeSeries(trafficData.data);

  return res.status(200).json({
    success: true,
    period: `${period} days`,
    trends,
    dataPoints: trafficData.data.length,
    timestamp: new Date().toISOString()
  });
}

// Generate action items based on analysis
async function generateActions(req, res) {
  const baseUrl = getBaseUrl(req);

  // Run mini analysis to generate actions
  const [overview, sources, microsites] = await Promise.all([
    fetchGA4Data(baseUrl, 'overview', '7daysAgo', 'today'),
    fetchGA4Data(baseUrl, 'traffic-sources', '7daysAgo', 'today'),
    fetchGA4Data(baseUrl, 'microsite-referrals', '30daysAgo', 'today')
  ]);

  const weekComparison = overview?.success ?
    { current: overview.data, previous: null } : null;
  const micrositeAnalysis = microsites?.success ?
    analyzeMicrosites(microsites) : null;

  const actions = generateActionItems(
    [], // trends
    weekComparison,
    micrositeAnalysis
  );

  return res.status(200).json({
    success: true,
    actions,
    totalActions: actions.length,
    highPriority: actions.filter(a => a.priority === 'high').length,
    mediumPriority: actions.filter(a => a.priority === 'medium').length,
    lowPriority: actions.filter(a => a.priority === 'low').length,
    timestamp: new Date().toISOString()
  });
}

// Health check - verify all systems
async function healthCheck(req, res) {
  const baseUrl = getBaseUrl(req);
  const ga4Status = await checkGA4Connection(baseUrl);

  return res.status(200).json({
    success: true,
    status: 'operational',
    components: {
      analysisEngine: 'ready',
      ga4Api: ga4Status.connected ? 'connected' : 'awaiting-credentials',
      trendDetection: 'ready',
      actionGenerator: 'ready',
      weeklyComparison: 'ready',
      micrositeTracking: 'ready'
    },
    ga4Status,
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
}

// ============ HELPER FUNCTIONS ============

function getBaseUrl(req) {
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${protocol}://${host}`;
}

async function checkGA4Connection(baseUrl) {
  try {
    const response = await fetch(`${baseUrl}/api/ga4-analytics?type=overview&startDate=1daysAgo&endDate=today`);
    const data = await response.json();

    return {
      connected: data.success === true,
      error: data.error || null,
      credentialsStatus: data.credentialsStatus || null
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
}

async function fetchGA4Data(baseUrl, type, startDate, endDate) {
  try {
    const url = `${baseUrl}/api/ga4-analytics?type=${type}&startDate=${startDate}&endDate=${endDate}`;
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    return { success: false, error: error.message };
  }
}

function calculateWeekComparison(thisWeek, lastWeek) {
  if (!thisWeek?.success || !lastWeek?.success) {
    return null;
  }

  const current = thisWeek.data;
  const previous = lastWeek.data;

  const calculateChange = (curr, prev) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev * 100).toFixed(1);
  };

  return {
    users: {
      current: current.activeUsers,
      previous: previous.activeUsers,
      change: calculateChange(current.activeUsers, previous.activeUsers),
      direction: current.activeUsers >= previous.activeUsers ? 'up' : 'down'
    },
    sessions: {
      current: current.sessions,
      previous: previous.sessions,
      change: calculateChange(current.sessions, previous.sessions),
      direction: current.sessions >= previous.sessions ? 'up' : 'down'
    },
    pageViews: {
      current: current.pageViews,
      previous: previous.pageViews,
      change: calculateChange(current.pageViews, previous.pageViews),
      direction: current.pageViews >= previous.pageViews ? 'up' : 'down'
    },
    bounceRate: {
      current: parseFloat(current.bounceRate),
      previous: parseFloat(previous.bounceRate),
      change: calculateChange(parseFloat(current.bounceRate), parseFloat(previous.bounceRate)),
      direction: parseFloat(current.bounceRate) <= parseFloat(previous.bounceRate) ? 'improved' : 'worsened'
    },
    avgSessionDuration: {
      current: parseFloat(current.avgSessionDuration),
      previous: parseFloat(previous.avgSessionDuration),
      change: calculateChange(parseFloat(current.avgSessionDuration), parseFloat(previous.avgSessionDuration)),
      direction: parseFloat(current.avgSessionDuration) >= parseFloat(previous.avgSessionDuration) ? 'up' : 'down'
    }
  };
}

function interpretComparison(comparison) {
  if (!comparison) return ['Unable to compare - missing data'];

  const insights = [];

  // Users trend
  if (parseFloat(comparison.users.change) > 10) {
    insights.push(`🚀 Users UP ${comparison.users.change}% - great momentum!`);
  } else if (parseFloat(comparison.users.change) < -10) {
    insights.push(`⚠️ Users DOWN ${Math.abs(comparison.users.change)}% - needs attention`);
  } else {
    insights.push(`📊 Users stable (${comparison.users.change}% change)`);
  }

  // Bounce rate trend
  if (comparison.bounceRate.direction === 'improved' && Math.abs(parseFloat(comparison.bounceRate.change)) > 5) {
    insights.push(`✅ Bounce rate improved - visitors are more engaged`);
  } else if (comparison.bounceRate.direction === 'worsened' && Math.abs(parseFloat(comparison.bounceRate.change)) > 5) {
    insights.push(`⚠️ Bounce rate increased - check page quality`);
  }

  // Session duration
  if (parseFloat(comparison.avgSessionDuration.change) > 15) {
    insights.push(`👍 Session duration up ${comparison.avgSessionDuration.change}% - content is resonating`);
  } else if (parseFloat(comparison.avgSessionDuration.change) < -15) {
    insights.push(`📉 Session duration down - visitors leaving faster`);
  }

  return insights;
}

function analyzeMicrosites(referralData) {
  if (!referralData?.success) {
    return {
      bySite: {},
      summary: { totalSessions: 0, totalUsers: 0, contributing: false }
    };
  }

  const microsites = referralData.microsites || {};
  let totalSessions = 0;
  let totalUsers = 0;
  const bySite = {};

  Object.entries(microsites).forEach(([site, data]) => {
    bySite[site] = {
      sessions: data.totalSessions || 0,
      users: data.totalUsers || 0,
      dailyData: data.dailyData || []
    };
    totalSessions += data.totalSessions || 0;
    totalUsers += data.totalUsers || 0;
  });

  return {
    bySite,
    summary: {
      totalSessions,
      totalUsers,
      contributing: totalSessions > 0,
      avgPerDay: totalSessions > 0 ? (totalSessions / 30).toFixed(1) : 0
    }
  };
}

function generateMicrositeRecommendations(analysis) {
  const recommendations = [];
  const { bySite, summary } = analysis;

  if (summary.totalSessions === 0) {
    recommendations.push({
      priority: 'high',
      action: 'Investigate zero microsite traffic',
      details: 'No sessions from microsites - check if links are working and sites are indexed'
    });
  }

  // Check each microsite
  Object.entries(bySite).forEach(([site, data]) => {
    if (data.sessions === 0) {
      recommendations.push({
        priority: 'medium',
        action: `Optimize ${site}`,
        details: 'Zero referrals - needs SEO work or link checking'
      });
    } else if (data.sessions < 5) {
      recommendations.push({
        priority: 'low',
        action: `Improve ${site} visibility`,
        details: `Only ${data.sessions} sessions - consider content updates`
      });
    }
  });

  // Find best performer
  const best = Object.entries(bySite)
    .sort((a, b) => b[1].sessions - a[1].sessions)[0];

  if (best && best[1].sessions > 10) {
    recommendations.push({
      priority: 'low',
      action: 'Replicate success pattern',
      details: `${best[0]} is performing best - analyze and apply to other microsites`
    });
  }

  return recommendations;
}

function identifyTrends(weekComparison, micrositeAnalysis) {
  const trends = [];

  if (weekComparison) {
    // Traffic trend
    const usersChange = parseFloat(weekComparison.users.change);
    if (Math.abs(usersChange) > 10) {
      trends.push({
        type: 'traffic',
        direction: usersChange > 0 ? 'increasing' : 'decreasing',
        magnitude: Math.abs(usersChange),
        insight: usersChange > 0
          ? 'Traffic is growing - SEO efforts are working'
          : 'Traffic is declining - needs investigation'
      });
    }

    // Engagement trend
    const bounceChange = parseFloat(weekComparison.bounceRate.change);
    if (Math.abs(bounceChange) > 5) {
      trends.push({
        type: 'engagement',
        direction: bounceChange < 0 ? 'improving' : 'declining',
        magnitude: Math.abs(bounceChange),
        insight: bounceChange < 0
          ? 'User engagement is improving'
          : 'Users are bouncing more - check content quality'
      });
    }
  }

  // Microsite trend
  if (micrositeAnalysis?.summary?.contributing) {
    trends.push({
      type: 'microsites',
      direction: 'active',
      magnitude: micrositeAnalysis.summary.totalSessions,
      insight: `Microsites contributed ${micrositeAnalysis.summary.totalSessions} sessions`
    });
  } else {
    trends.push({
      type: 'microsites',
      direction: 'inactive',
      magnitude: 0,
      insight: 'Microsites are not generating traffic - need optimization'
    });
  }

  return trends;
}

function analyzeTimeSeries(dataPoints) {
  if (!dataPoints || dataPoints.length < 7) {
    return { trend: 'insufficient-data', confidence: 0 };
  }

  // Simple moving average comparison
  const recentAvg = dataPoints.slice(-7).reduce((sum, d) => sum + d.users, 0) / 7;
  const olderAvg = dataPoints.slice(0, 7).reduce((sum, d) => sum + d.users, 0) / 7;

  const changePercent = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg * 100) : 0;

  let trend = 'stable';
  if (changePercent > 15) trend = 'strong-growth';
  else if (changePercent > 5) trend = 'growth';
  else if (changePercent < -15) trend = 'strong-decline';
  else if (changePercent < -5) trend = 'decline';

  return {
    trend,
    changePercent: changePercent.toFixed(1),
    recentAverage: Math.round(recentAvg),
    olderAverage: Math.round(olderAvg),
    confidence: dataPoints.length > 14 ? 'high' : 'medium',
    dataPoints: dataPoints.length
  };
}

function generateActionItems(trends, weekComparison, micrositeAnalysis) {
  const actions = [];

  // Based on trends
  trends.forEach(trend => {
    if (trend.type === 'traffic' && trend.direction === 'decreasing') {
      actions.push({
        priority: 'high',
        category: 'traffic',
        action: 'Investigate traffic decline',
        details: `Traffic down ${trend.magnitude}% - check for technical issues, ranking drops, or seasonal factors`,
        suggestedSteps: [
          'Check Google Search Console for errors',
          'Review recent changes to the site',
          'Check competitor activity',
          'Verify all pages are indexed'
        ]
      });
    }

    if (trend.type === 'microsites' && trend.direction === 'inactive') {
      actions.push({
        priority: 'medium',
        category: 'microsites',
        action: 'Activate microsite traffic',
        details: 'Microsites not sending traffic - need SEO optimization',
        suggestedSteps: [
          'Verify microsites have proper links to main site',
          'Check microsite indexing status',
          'Add more content to microsites',
          'Build backlinks to microsites'
        ]
      });
    }
  });

  // Based on week comparison
  if (weekComparison?.bounceRate?.direction === 'worsened' &&
      Math.abs(parseFloat(weekComparison.bounceRate.change)) > 10) {
    actions.push({
      priority: 'high',
      category: 'engagement',
      action: 'Reduce bounce rate',
      details: `Bounce rate increased ${weekComparison.bounceRate.change}%`,
      suggestedSteps: [
        'Improve page load speed',
        'Check mobile responsiveness',
        'Review landing page content',
        'Add clearer calls-to-action'
      ]
    });
  }

  // Based on microsite analysis
  if (micrositeAnalysis) {
    Object.entries(micrositeAnalysis.bySite).forEach(([site, data]) => {
      if (data.sessions === 0) {
        actions.push({
          priority: 'medium',
          category: 'microsites',
          action: `Optimize ${site}`,
          details: 'Zero traffic from this microsite',
          suggestedSteps: [
            `Verify ${site} is live and accessible`,
            'Check for proper canonical and redirect setup',
            'Add unique, valuable content',
            'Submit to Google Search Console'
          ]
        });
      }
    });
  }

  // Always include baseline actions
  if (actions.length === 0) {
    actions.push({
      priority: 'low',
      category: 'maintenance',
      action: 'Continue monitoring',
      details: 'No urgent issues detected - maintain current trajectory',
      suggestedSteps: [
        'Review weekly reports',
        'Continue content updates',
        'Monitor competitor rankings'
      ]
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

function calculateHealthScore(weekComparison) {
  if (!weekComparison) return { score: 0, status: 'unknown', message: 'Insufficient data' };

  let score = 50; // Start at neutral

  // Users trend (most important)
  const usersChange = parseFloat(weekComparison.users.change);
  if (usersChange > 20) score += 25;
  else if (usersChange > 10) score += 15;
  else if (usersChange > 0) score += 5;
  else if (usersChange > -10) score -= 5;
  else if (usersChange > -20) score -= 15;
  else score -= 25;

  // Bounce rate
  if (weekComparison.bounceRate.direction === 'improved') score += 10;
  else if (weekComparison.bounceRate.direction === 'worsened') score -= 10;

  // Session duration
  const durationChange = parseFloat(weekComparison.avgSessionDuration.change);
  if (durationChange > 10) score += 10;
  else if (durationChange < -10) score -= 10;

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  let status, message;
  if (score >= 80) {
    status = 'excellent';
    message = 'Strong growth and engagement';
  } else if (score >= 60) {
    status = 'good';
    message = 'Positive momentum';
  } else if (score >= 40) {
    status = 'fair';
    message = 'Stable but room for improvement';
  } else if (score >= 20) {
    status = 'poor';
    message = 'Declining metrics - needs attention';
  } else {
    status = 'critical';
    message = 'Significant issues detected';
  }

  return { score, status, message };
}

// Capture weekly snapshot for historical tracking
async function captureSnapshot(req, res) {
  const baseUrl = getBaseUrl(req);
  const timestamp = new Date().toISOString();
  const weekNumber = getWeekNumber(new Date());

  try {
    // Fetch all current metrics in parallel
    const [ga4Data, authorityData, competitorData, performanceData] = await Promise.all([
      fetchGA4Data(baseUrl, 'overview', '7daysAgo', 'today'),
      fetchAuthorityData(baseUrl),
      fetchCompetitorData(baseUrl),
      fetchPerformanceData(baseUrl)
    ]);

    const snapshot = {
      id: `snapshot-${weekNumber}-${Date.now()}`,
      week: weekNumber,
      date: timestamp.split('T')[0],
      timestamp: timestamp,
      metrics: {
        traffic: {
          users: ga4Data?.data?.activeUsers || null,
          sessions: ga4Data?.data?.sessions || null,
          pageviews: ga4Data?.data?.pageViews || null,
          bounceRate: ga4Data?.data?.bounceRate || null,
          avgSessionDuration: ga4Data?.data?.avgSessionDuration || null,
          source: ga4Data?.success ? 'GA4 API - LIVE' : 'GA4 API - UNAVAILABLE'
        },
        authority: {
          score: authorityData?.authority_score || null,
          pagerank: authorityData?.pagerank || null,
          pagerankDecimal: authorityData?.pagerank_decimal || null,
          source: authorityData ? 'OpenPageRank API - LIVE' : 'OpenPageRank API - UNAVAILABLE'
        },
        competitors: {
          ourRating: competitorData?.ourSalon?.rating || null,
          ourReviews: competitorData?.ourSalon?.reviews || null,
          topCompetitorReviews: competitorData?.topCompetitor?.reviews || null,
          competitorCount: competitorData?.count || null,
          source: competitorData ? 'Google Places API - LIVE' : 'Google Places API - UNAVAILABLE'
        },
        performance: {
          score: performanceData?.performance || null,
          seo: performanceData?.seo || null,
          accessibility: performanceData?.accessibility || null,
          source: performanceData ? 'PageSpeed API - LIVE' : 'PageSpeed API - UNAVAILABLE'
        }
      },
      seoScore: calculateOverallSEOScore(ga4Data, authorityData, performanceData),
      status: 'captured'
    };

    return res.status(200).json({
      success: true,
      action: 'capture-snapshot',
      snapshot: snapshot,
      instructions: {
        usage: 'This snapshot should be appended to historical-metrics.json snapshots array',
        automation: 'GitHub Actions workflow will commit this data weekly'
      },
      timestamp: timestamp
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      action: 'capture-snapshot',
      error: error.message,
      timestamp: timestamp
    });
  }
}

// Helper functions for snapshot capture
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return `${d.getUTCFullYear()}-W${Math.ceil((((d - yearStart) / 86400000) + 1) / 7).toString().padStart(2, '0')}`;
}

async function fetchAuthorityData(baseUrl) {
  try {
    const response = await fetch(`${baseUrl}/api/authority-score`);
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    return null;
  }
}

async function fetchCompetitorData(baseUrl) {
  try {
    const response = await fetch(`${baseUrl}/api/competitors`);
    const data = await response.json();
    if (!data.success || !data.data?.competitors) return null;

    const ourSalon = data.data.competitors.find(c => c.isOurSalon);
    const topCompetitor = data.data.competitors
      .filter(c => !c.isOurSalon)
      .sort((a, b) => b.reviews - a.reviews)[0];

    return {
      ourSalon: ourSalon || null,
      topCompetitor: topCompetitor || null,
      count: data.data.competitors.length
    };
  } catch (error) {
    return null;
  }
}

async function fetchPerformanceData(baseUrl) {
  try {
    const response = await fetch(`${baseUrl}/api/pagespeed`);
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    return null;
  }
}

function calculateOverallSEOScore(ga4Data, authorityData, performanceData) {
  let score = 0;
  let factors = 0;

  // Performance (10% weight)
  if (performanceData?.performance) {
    score += performanceData.performance * 0.10;
    factors += 0.10;
  }

  // Authority (10% weight)
  if (authorityData?.authority_score) {
    score += authorityData.authority_score * 0.10;
    factors += 0.10;
  }

  // Traffic health estimate (20% weight based on bounce rate)
  if (ga4Data?.data?.bounceRate) {
    const bounceScore = Math.max(0, 100 - parseFloat(ga4Data.data.bounceRate));
    score += bounceScore * 0.20;
    factors += 0.20;
  }

  // Normalize if we don't have all factors
  if (factors > 0) {
    return Math.round(score / factors);
  }

  return null;
}

// ============================================
// BASELINE CAPTURE - Initial state for new URLs
// ============================================

// Capture initial baseline metrics for a new website
// This establishes the starting point for measuring progress
async function captureBaseline(req, res) {
  const baseUrl = getBaseUrl(req);
  const { url: targetUrl } = req.query;

  // If a custom URL is provided, use it; otherwise use the site URL
  const siteUrl = targetUrl || baseUrl;
  const timestamp = new Date().toISOString();
  const date = timestamp.split('T')[0];

  try {
    // Fetch all current metrics in parallel
    const [ga4Data, authorityData, competitorData, performanceData] = await Promise.all([
      fetchGA4Data(baseUrl, 'overview', '30daysAgo', 'today'),  // Get 30 days for baseline
      fetchAuthorityData(baseUrl),
      fetchCompetitorData(baseUrl),
      fetchPerformanceData(baseUrl)
    ]);

    // Build comprehensive baseline
    const baseline = {
      id: `baseline-${Date.now()}`,
      type: 'baseline',
      capturedAt: timestamp,
      date: date,
      siteUrl: siteUrl,

      // Traffic metrics (30-day baseline)
      traffic: {
        users: ga4Data?.data?.activeUsers || null,
        sessions: ga4Data?.data?.sessions || null,
        pageviews: ga4Data?.data?.pageViews || null,
        bounceRate: ga4Data?.data?.bounceRate || null,
        avgSessionDuration: ga4Data?.data?.avgSessionDuration || null,
        newUsers: ga4Data?.data?.newUsers || null,
        period: '30 days',
        source: ga4Data ? 'GA4 API - LIVE' : 'GA4 API - UNAVAILABLE'
      },

      // Authority metrics
      authority: {
        score: authorityData?.authority_score || null,
        pagerank: authorityData?.pagerank || null,
        pagerankDecimal: authorityData?.pagerank_decimal || null,
        source: authorityData ? 'OpenPageRank API - LIVE' : 'OpenPageRank API - UNAVAILABLE'
      },

      // Review metrics
      reviews: {
        count: competitorData?.ourSalon?.reviews || null,
        rating: competitorData?.ourSalon?.rating || null,
        topCompetitorReviews: competitorData?.topCompetitor?.reviews || null,
        competitorCount: competitorData?.count || null,
        source: competitorData ? 'Google Places API - LIVE' : 'Google Places API - UNAVAILABLE'
      },

      // Performance metrics
      performance: {
        score: performanceData?.performance || null,
        seo: performanceData?.seo || null,
        accessibility: performanceData?.accessibility || null,
        bestPractices: performanceData?.bestPractices || null,
        source: performanceData ? 'PageSpeed API - LIVE' : 'PageSpeed API - UNAVAILABLE'
      },

      // Calculated scores
      seoScore: calculateOverallSEOScore(ga4Data, authorityData, performanceData),

      // Metadata
      status: 'baseline-captured',
      dataQuality: assessDataQuality(ga4Data, authorityData, competitorData, performanceData)
    };

    return res.status(200).json({
      success: true,
      action: 'capture-baseline',
      message: 'Initial baseline captured successfully',
      baseline: baseline,
      nextSteps: {
        1: 'Save this baseline to historical-metrics.json as the "baseline" object',
        2: 'Run weekly snapshots to track progress',
        3: 'Use compare-to-baseline action to measure improvement',
        4: 'Target: 10-20% improvement per month'
      },
      comparison: {
        endpoint: '/api/seo-analysis-engine?action=compare-to-baseline',
        description: 'Compare current metrics against this baseline'
      },
      timestamp: timestamp
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      action: 'capture-baseline',
      error: error.message,
      timestamp: timestamp
    });
  }
}

// Compare current metrics to stored baseline
async function compareToBaseline(req, res) {
  const baseUrl = getBaseUrl(req);
  const timestamp = new Date().toISOString();

  try {
    // Fetch current metrics
    const [ga4Data, authorityData, competitorData, performanceData] = await Promise.all([
      fetchGA4Data(baseUrl, 'overview', '7daysAgo', 'today'),
      fetchAuthorityData(baseUrl),
      fetchCompetitorData(baseUrl),
      fetchPerformanceData(baseUrl)
    ]);

    // Try to fetch stored baseline from historical-metrics.json
    let baseline = null;
    try {
      const response = await fetch(`${baseUrl}/data/historical-metrics.json`);
      const data = await response.json();
      baseline = data.baseline || null;
    } catch (e) {
      console.error('Could not fetch baseline:', e);
    }

    if (!baseline) {
      return res.status(200).json({
        success: false,
        action: 'compare-to-baseline',
        error: 'No baseline found. Run capture-baseline first.',
        instructions: {
          captureBaseline: '/api/seo-analysis-engine?action=capture-baseline',
          description: 'Capture initial baseline, then save to historical-metrics.json'
        },
        timestamp: timestamp
      });
    }

    // Build current metrics
    const current = {
      traffic: {
        users: ga4Data?.data?.activeUsers || 0,
        sessions: ga4Data?.data?.sessions || 0,
        pageviews: ga4Data?.data?.pageViews || 0,
        bounceRate: parseFloat(ga4Data?.data?.bounceRate || 0)
      },
      authority: {
        score: authorityData?.authority_score || 0,
        pagerank: authorityData?.pagerank_decimal || 0
      },
      reviews: {
        count: competitorData?.ourSalon?.reviews || 0,
        rating: competitorData?.ourSalon?.rating || 0
      },
      performance: {
        score: performanceData?.performance || 0
      }
    };

    // Calculate changes from baseline
    const changes = {
      traffic: {
        users: calculateChange(baseline.traffic?.users, current.traffic.users),
        sessions: calculateChange(baseline.traffic?.sessions, current.traffic.sessions),
        pageviews: calculateChange(baseline.traffic?.pageviews, current.traffic.pageviews),
        bounceRate: calculateChange(baseline.traffic?.bounceRate, current.traffic.bounceRate, true) // Inverted (lower is better)
      },
      authority: {
        score: calculateChange(baseline.authority?.score, current.authority.score),
        pagerank: calculateChange(baseline.authority?.pagerankDecimal, current.authority.pagerank)
      },
      reviews: {
        count: calculateChange(baseline.reviews?.count, current.reviews.count),
        rating: calculateChange(baseline.reviews?.rating, current.reviews.rating)
      },
      performance: {
        score: calculateChange(baseline.performance?.score, current.performance.score)
      }
    };

    // Calculate days since baseline
    const baselineDate = new Date(baseline.capturedAt);
    const daysSinceBaseline = Math.floor((new Date() - baselineDate) / (1000 * 60 * 60 * 24));

    // Generate summary
    const improvements = [];
    const declines = [];

    if (changes.traffic.users.percentChange > 0) improvements.push(`+${changes.traffic.users.percentChange.toFixed(1)}% traffic`);
    else if (changes.traffic.users.percentChange < 0) declines.push(`${changes.traffic.users.percentChange.toFixed(1)}% traffic`);

    if (changes.authority.score.percentChange > 0) improvements.push(`+${changes.authority.score.percentChange.toFixed(1)}% authority`);
    else if (changes.authority.score.percentChange < 0) declines.push(`${changes.authority.score.percentChange.toFixed(1)}% authority`);

    if (changes.reviews.count.percentChange > 0) improvements.push(`+${changes.reviews.count.percentChange.toFixed(1)}% reviews`);

    if (changes.performance.score.percentChange > 0) improvements.push(`+${changes.performance.score.percentChange.toFixed(1)}% performance`);
    else if (changes.performance.score.percentChange < 0) declines.push(`${changes.performance.score.percentChange.toFixed(1)}% performance`);

    return res.status(200).json({
      success: true,
      action: 'compare-to-baseline',
      baseline: {
        capturedAt: baseline.capturedAt,
        daysSince: daysSinceBaseline,
        metrics: baseline
      },
      current: current,
      changes: changes,
      summary: {
        improvements: improvements.length > 0 ? improvements : ['No improvements yet'],
        declines: declines.length > 0 ? declines : ['No declines'],
        overallTrend: improvements.length > declines.length ? 'IMPROVING' :
                     improvements.length < declines.length ? 'DECLINING' : 'STABLE'
      },
      timestamp: timestamp
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      action: 'compare-to-baseline',
      error: error.message,
      timestamp: timestamp
    });
  }
}

// Helper function to assess data quality
function assessDataQuality(ga4Data, authorityData, competitorData, performanceData) {
  let available = 0;
  let total = 4;

  if (ga4Data?.data) available++;
  if (authorityData) available++;
  if (competitorData) available++;
  if (performanceData) available++;

  const percentage = (available / total) * 100;

  return {
    percentage: percentage,
    available: available,
    total: total,
    rating: percentage >= 75 ? 'EXCELLENT' :
            percentage >= 50 ? 'GOOD' :
            percentage >= 25 ? 'PARTIAL' : 'MINIMAL',
    sources: {
      ga4: ga4Data?.data ? 'connected' : 'not-configured',
      authority: authorityData ? 'connected' : 'not-configured',
      competitors: competitorData ? 'connected' : 'not-configured',
      performance: performanceData ? 'connected' : 'not-configured'
    }
  };
}

// Helper function to calculate change between baseline and current
function calculateChange(baseline, current, inverted = false) {
  if (baseline === null || baseline === undefined || current === null || current === undefined) {
    return { baseline, current, absolute: null, percentChange: null };
  }

  const baselineNum = parseFloat(baseline) || 0;
  const currentNum = parseFloat(current) || 0;
  const absolute = currentNum - baselineNum;
  const percentChange = baselineNum > 0 ? ((currentNum - baselineNum) / baselineNum) * 100 : 0;

  return {
    baseline: baselineNum,
    current: currentNum,
    absolute: absolute,
    percentChange: inverted ? -percentChange : percentChange,
    direction: percentChange > 0 ? (inverted ? 'worse' : 'better') :
               percentChange < 0 ? (inverted ? 'better' : 'worse') : 'unchanged'
  };
}
