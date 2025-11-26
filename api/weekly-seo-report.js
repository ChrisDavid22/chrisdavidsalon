// Weekly SEO Report - Generates comprehensive weekly analysis
// Can be triggered:
// 1. Manually via dashboard button
// 2. Via free external cron service (cron-job.org, easycron.com)
// 3. GitHub Actions scheduled workflow
//
// FREE TIER COMPATIBLE - No Vercel Pro required
// Just set up a free cron at cron-job.org to call:
// GET https://chrisdavidsalon.com/api/weekly-seo-report

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action = 'generate' } = req.query;

  try {
    switch (action) {
      case 'generate':
        return await generateWeeklyReport(req, res);
      case 'latest':
        return await getLatestReport(req, res);
      case 'history':
        return await getReportHistory(req, res);
      case 'status':
        return await getReportStatus(req, res);
      default:
        return await generateWeeklyReport(req, res);
    }
  } catch (error) {
    console.error('Weekly Report Error:', error);
    return res.status(200).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Generate the weekly report
async function generateWeeklyReport(req, res) {
  const baseUrl = getBaseUrl(req);
  const reportDate = new Date().toISOString().split('T')[0];
  const weekNumber = getWeekNumber(new Date());

  // Check GA4 connection first
  let ga4Data = null;
  let analysisData = null;

  try {
    // Get analysis engine data
    const analysisResponse = await fetch(`${baseUrl}/api/seo-analysis-engine?action=analyze`);
    analysisData = await analysisResponse.json();

    if (analysisData.success) {
      ga4Data = analysisData.detailed;
    }
  } catch (error) {
    console.error('Could not fetch analysis:', error);
  }

  // Build the report
  const report = {
    reportId: `week-${weekNumber}-${reportDate}`,
    generatedAt: new Date().toISOString(),
    weekNumber: weekNumber,
    dateRange: {
      start: getLastSunday().toISOString().split('T')[0],
      end: reportDate
    },
    status: analysisData?.success ? 'complete' : 'partial',
    ga4Connected: analysisData?.success || false,

    // Executive Summary
    executiveSummary: generateExecutiveSummary(analysisData),

    // Traffic Metrics
    traffic: analysisData?.success ? {
      weekOverWeek: analysisData.summary?.weekOverWeek || null,
      healthScore: analysisData.summary?.overallHealth || null,
      keyMetrics: {
        users: analysisData.summary?.weekOverWeek?.users?.current || 0,
        sessions: analysisData.summary?.weekOverWeek?.sessions?.current || 0,
        pageViews: analysisData.summary?.weekOverWeek?.pageViews?.current || 0,
        bounceRate: analysisData.summary?.weekOverWeek?.bounceRate?.current || 0
      }
    } : null,

    // Microsite Performance
    microsites: analysisData?.success ? {
      impact: analysisData.summary?.micrositeImpact || null,
      details: analysisData.detailed?.micrositeAnalysis || null
    } : null,

    // Top Traffic Sources
    trafficSources: analysisData?.detailed?.trafficSources?.slice(0, 10) || [],

    // Top Landing Pages
    topPages: analysisData?.detailed?.topPages?.slice(0, 10) || [],

    // Trends Detected
    trends: analysisData?.summary?.keyTrends || [],

    // Priority Actions
    actions: analysisData?.summary?.priorityActions || [],

    // Full Actions List
    allActions: analysisData?.detailed?.actions || [],

    // Report Metadata
    metadata: {
      version: '1.0.0',
      cronSchedule: '0 11 * * 0',
      timezone: 'UTC (11:00 = 6:00 AM EST)'
    }
  };

  // In a production environment, you would store this to Vercel KV or similar
  // For now, we return it and it can be cached client-side

  return res.status(200).json({
    success: true,
    report: report,
    message: analysisData?.success
      ? 'Weekly report generated successfully'
      : 'Partial report generated - GA4 not connected'
  });
}

// Get the latest report
async function getLatestReport(req, res) {
  // In production, this would fetch from Vercel KV
  // For now, generate a fresh report
  return generateWeeklyReport(req, res);
}

// Get report history
async function getReportHistory(req, res) {
  // In production, this would fetch historical reports from Vercel KV
  return res.status(200).json({
    success: true,
    message: 'Report history requires Vercel KV storage',
    reports: [],
    note: 'Once GA4 is connected and reports are generated, history will be available here'
  });
}

// Get report status
async function getReportStatus(req, res) {
  const baseUrl = getBaseUrl(req);

  // Check if analysis engine is ready
  let engineReady = false;
  let ga4Connected = false;

  try {
    const response = await fetch(`${baseUrl}/api/seo-analysis-engine?action=health-check`);
    const status = await response.json();
    engineReady = status.success;
    ga4Connected = status.ga4Status?.connected || false;
  } catch (error) {
    engineReady = false;
  }

  return res.status(200).json({
    success: true,
    status: {
      engineReady,
      ga4Connected,
      cronMethod: 'free-external',
      cronOptions: [
        'Manual trigger via dashboard button',
        'Free cron at cron-job.org (recommended)',
        'GitHub Actions scheduled workflow'
      ]
    },
    requirements: {
      ga4PropertyId: ga4Connected ? 'configured' : 'MISSING',
      serviceAccountJson: ga4Connected ? 'configured' : 'MISSING'
    },
    freeCronSetup: {
      service: 'cron-job.org (free)',
      url: 'https://chrisdavidsalon.com/api/weekly-seo-report',
      schedule: 'Every Sunday at 6:00 AM EST',
      instructions: [
        '1. Go to https://cron-job.org and create free account',
        '2. Create new cron job',
        '3. Set URL: https://chrisdavidsalon.com/api/weekly-seo-report',
        '4. Set schedule: 0 11 * * 0 (11 UTC = 6 AM EST)',
        '5. Save - reports will generate automatically'
      ]
    },
    capabilities: [
      'Week-over-week traffic comparison',
      'Microsite referral analysis',
      'Trend detection',
      'Priority action generation',
      'Health score calculation',
      'Traffic source breakdown',
      'Top pages analysis'
    ]
  });
}

// Helper functions
function getBaseUrl(req) {
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${protocol}://${host}`;
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getLastSunday() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const lastSunday = new Date(today);
  lastSunday.setDate(today.getDate() - dayOfWeek);
  return lastSunday;
}

function getNextSundayAt6AM() {
  const now = new Date();
  const next = new Date(now);

  // Find next Sunday
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
  next.setDate(now.getDate() + daysUntilSunday);

  // Set to 11:00 UTC (6 AM EST)
  next.setUTCHours(11, 0, 0, 0);

  // If we're past that time today (Sunday), add a week
  if (now.getDay() === 0 && now.getUTCHours() >= 11) {
    next.setDate(next.getDate() + 7);
  }

  return next;
}

function formatTimeUntil(futureDate) {
  const now = new Date();
  const diff = futureDate - now;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days} days, ${hours} hours`;
  } else if (hours > 0) {
    return `${hours} hours, ${minutes} minutes`;
  } else {
    return `${minutes} minutes`;
  }
}

function generateExecutiveSummary(analysisData) {
  if (!analysisData?.success) {
    return {
      headline: 'Awaiting GA4 Connection',
      status: 'pending',
      bullets: [
        'GA4 API credentials not yet configured',
        'Add GA4_PROPERTY_ID to Vercel environment variables',
        'Add GOOGLE_SERVICE_ACCOUNT_JSON to Vercel environment variables',
        'Once connected, weekly reports will automatically generate'
      ]
    };
  }

  const health = analysisData.summary?.overallHealth || {};
  const weekChange = analysisData.summary?.weekOverWeek?.users?.change || 0;
  const micrositeImpact = analysisData.summary?.micrositeImpact || {};

  const bullets = [];

  // Traffic trend
  if (parseFloat(weekChange) > 0) {
    bullets.push(`Traffic UP ${weekChange}% week-over-week`);
  } else if (parseFloat(weekChange) < 0) {
    bullets.push(`Traffic DOWN ${Math.abs(weekChange)}% week-over-week - needs attention`);
  } else {
    bullets.push('Traffic stable compared to last week');
  }

  // Microsite impact
  if (micrositeImpact.contributing) {
    bullets.push(`Microsites contributed ${micrositeImpact.totalSessions || 0} sessions`);
  } else {
    bullets.push('Microsites not yet generating traffic - optimization needed');
  }

  // Top trends
  const trends = analysisData.summary?.keyTrends || [];
  trends.slice(0, 2).forEach(trend => {
    if (trend.insight) {
      bullets.push(trend.insight);
    }
  });

  // Priority action
  const actions = analysisData.summary?.priorityActions || [];
  if (actions.length > 0 && actions[0].action) {
    bullets.push(`Priority: ${actions[0].action}`);
  }

  return {
    headline: health.message || 'Weekly Analysis Complete',
    status: health.status || 'analyzed',
    healthScore: health.score || 50,
    bullets
  };
}
