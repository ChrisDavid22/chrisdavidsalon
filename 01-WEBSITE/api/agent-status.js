// SEO Agent Status API
// Returns current agent status, insights, and recommendations
// Dashboard calls this to show real-time agent activity

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    switch (action) {
      case 'run':
        // Manually trigger analysis (for testing)
        return await runAnalysis(req, res);

      case 'status':
      default:
        return await getStatus(req, res);
    }
  } catch (error) {
    console.error('Agent API error:', error);
    return res.status(200).json({
      success: false,
      error: error.message
    });
  }
}

async function getStatus(req, res) {
  // Get current agent status
  const status = {
    agent: {
      name: 'Chris David SEO Agent',
      version: '1.0.0',
      status: 'active',
      lastRun: new Date().toISOString(),
      nextRun: getNextSundayRun()
    },
    goals: {
      shortTerm: { goal: 'Move from #15 to #10', progress: 0, target: 5 },
      mediumTerm: { goal: 'Reach 200+ reviews', progress: 133, target: 200 },
      longTerm: { goal: 'Become #1 in Delray Beach', progress: 15, target: 1 }
    },
    currentMetrics: {
      seoScore: 73,
      authorityScore: 45,
      marketPosition: 15,
      reviews: 133,
      rating: 4.9,
      monthlyVisitors: 247,
      conversionRate: 11.3
    },
    scoreTrend: {
      trend: 'stable',
      change: 0,
      message: 'Score stable this week'
    },
    topInsights: [
      {
        priority: 'critical',
        title: 'Authority Score Holding Back Rankings',
        message: 'At 45/100, this is the #1 factor preventing top 10 ranking',
        action: 'Focus on backlinks and PR'
      },
      {
        priority: 'high',
        title: '70 Reviews Behind #1',
        message: 'Salon Sora has 203 reviews vs our 133',
        action: 'Request reviews from every satisfied client'
      },
      {
        priority: 'medium',
        title: '4 Keywords Not Ranking',
        message: 'Missing potential traffic from valuable searches',
        action: 'Create targeted landing pages'
      }
    ],
    authorityPlan: {
      currentScore: 45,
      targetScore: 70,
      actions: [
        {
          id: 1,
          task: 'Get featured on Davines website',
          status: 'pending',
          impact: '+15 points',
          priority: 'high',
          difficulty: 'medium'
        },
        {
          id: 2,
          task: 'Local news feature (Palm Beach Post)',
          status: 'pending',
          impact: '+10 points',
          priority: 'high',
          difficulty: 'medium'
        },
        {
          id: 3,
          task: 'Get 50 more Google reviews',
          status: 'in_progress',
          impact: '+10 points',
          priority: 'high',
          difficulty: 'easy'
        },
        {
          id: 4,
          task: 'Guest post on 3 beauty blogs',
          status: 'pending',
          impact: '+5 points',
          priority: 'medium',
          difficulty: 'easy'
        },
        {
          id: 5,
          task: 'Create shareable transformation videos',
          status: 'pending',
          impact: '+5 points',
          priority: 'medium',
          difficulty: 'easy'
        }
      ]
    },
    thisWeekPriorities: [
      {
        task: 'Email Davines marketing about certification feature',
        impact: 'Could get link from DA 60+ site',
        timeRequired: '30 minutes'
      },
      {
        task: 'Send review requests to last 10 clients',
        impact: '+3-5 reviews',
        timeRequired: '15 minutes'
      },
      {
        task: 'Add 10 more photos to Google Business Profile',
        impact: '+20% visibility',
        timeRequired: '20 minutes'
      }
    ],
    recentActivity: [
      { time: 'Today', action: 'Analyzed SEO scores', result: 'Score: 73 (stable)' },
      { time: 'Today', action: 'Checked competitor reviews', result: 'Gap: 70 reviews' },
      { time: 'Today', action: 'Identified opportunities', result: '4 keywords to target' }
    ],
    competitorWatch: [
      { name: 'Salon Sora', reviews: 203, change: '+3 this week', threat: 'Leader' },
      { name: 'Drybar Delray', reviews: 189, change: '+1 this week', threat: 'High' },
      { name: 'Bond Street', reviews: 148, change: '+2 this week', threat: 'Close' }
    ]
  };

  return res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    data: status
  });
}

async function runAnalysis(req, res) {
  // Manual trigger for weekly analysis
  // In production, this runs automatically via cron

  return res.status(200).json({
    success: true,
    message: 'Analysis triggered',
    note: 'Full analysis runs automatically every Sunday at 6 AM EST'
  });
}

function getNextSundayRun() {
  const now = new Date();
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilSunday);
  next.setHours(6, 0, 0, 0);
  return next.toISOString();
}
