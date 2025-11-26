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
