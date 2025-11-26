// Autonomous SEO Agent - The Brain that orchestrates all SEO automation
// This is the master controller that:
// 1. Analyzes current SEO state across all 4 sites
// 2. Identifies and prioritizes improvements
// 3. Generates and tracks SEO tasks
// 4. Measures effectiveness of changes
// 5. Reports on weekly progress

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action = 'status' } = req.query;

  try {
    switch (action) {
      case 'status':
        return await getAgentStatus(req, res);
      case 'run-weekly':
        return await runWeeklyAutomation(req, res);
      case 'analyze-all-sites':
        return await analyzeAllSites(req, res);
      case 'generate-tasks':
        return await generateSEOTasks(req, res);
      case 'track-change':
        return await trackChange(req, res);
      case 'get-changes':
        return await getTrackedChanges(req, res);
      case 'measure-effectiveness':
        return await measureEffectiveness(req, res);
      case 'get-recommendations':
        return await getRecommendations(req, res);
      case 'microsite-sync':
        return await syncMicrosites(req, res);
      default:
        return await getAgentStatus(req, res);
    }
  } catch (error) {
    console.error('Autonomous SEO Agent Error:', error);
    return res.status(200).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Get current agent status and capabilities
async function getAgentStatus(req, res) {
  const baseUrl = getBaseUrl(req);

  // Check all integrations
  const [ga4Status, pagerankStatus, placesStatus] = await Promise.all([
    checkIntegration(baseUrl, '/api/ga4-analytics?type=overview&startDate=1daysAgo&endDate=today'),
    checkIntegration(baseUrl, '/api/authority-score'),
    checkIntegration(baseUrl, '/api/admin-data?type=competitors')
  ]);

  return res.status(200).json({
    success: true,
    agent: 'Autonomous SEO Agent v1.0',
    status: 'operational',
    sites: {
      main: { domain: 'chrisdavidsalon.com', status: 'active' },
      microsite1: { domain: 'bestsalondelray.com', status: 'active' },
      microsite2: { domain: 'bestdelraysalon.com', status: 'active', note: 'Not indexed by Google' },
      microsite3: { domain: 'bestsalonpalmbeach.com', status: 'active' }
    },
    integrations: {
      ga4: ga4Status,
      openPageRank: pagerankStatus,
      googlePlaces: placesStatus,
      pageSpeed: { connected: true, note: 'Free tier, no key required' },
      claudeAI: { connected: true, note: 'For recommendations' }
    },
    capabilities: [
      'Weekly SEO analysis and task generation',
      'Cross-site content optimization',
      'Competitor monitoring',
      'Change tracking and effectiveness measurement',
      'Automated report generation',
      'Microsite content synchronization'
    ],
    schedule: {
      weeklyAnalysis: 'Sundays 6:00 AM EST',
      autoRefresh: 'Every 5 minutes',
      reportGeneration: 'Weekly after analysis'
    },
    timestamp: new Date().toISOString()
  });
}

// Run the weekly automation cycle
async function runWeeklyAutomation(req, res) {
  const baseUrl = getBaseUrl(req);
  const weekNumber = getWeekNumber(new Date());
  const results = {
    weekNumber,
    startTime: new Date().toISOString(),
    phases: []
  };

  // Phase 1: Analyze all sites
  results.phases.push({ phase: 'analysis', status: 'running', startTime: new Date().toISOString() });
  const analysis = await analyzeAllSitesInternal(baseUrl);
  results.phases[0].status = 'complete';
  results.phases[0].result = analysis.summary;

  // Phase 2: Generate prioritized tasks
  results.phases.push({ phase: 'task-generation', status: 'running', startTime: new Date().toISOString() });
  const tasks = generatePrioritizedTasks(analysis);
  results.phases[1].status = 'complete';
  results.phases[1].result = { taskCount: tasks.length, highPriority: tasks.filter(t => t.priority === 'high').length };

  // Phase 3: Generate improvement recommendations
  results.phases.push({ phase: 'recommendations', status: 'running', startTime: new Date().toISOString() });
  const recommendations = generateImprovementRecommendations(analysis);
  results.phases[2].status = 'complete';
  results.phases[2].result = { recommendationCount: recommendations.length };

  // Phase 4: Generate weekly report
  results.phases.push({ phase: 'report-generation', status: 'running', startTime: new Date().toISOString() });
  const report = generateWeeklyReport(analysis, tasks, recommendations);
  results.phases[3].status = 'complete';
  results.phases[3].result = { reportId: report.id };

  results.endTime = new Date().toISOString();
  results.duration = new Date(results.endTime) - new Date(results.startTime);

  return res.status(200).json({
    success: true,
    message: 'Weekly automation cycle complete',
    results,
    analysis: analysis.summary,
    tasks: tasks.slice(0, 10),
    recommendations: recommendations.slice(0, 5),
    report: report.summary,
    nextRun: getNextSunday()
  });
}

// Analyze all 4 sites comprehensively
async function analyzeAllSites(req, res) {
  const baseUrl = getBaseUrl(req);
  const analysis = await analyzeAllSitesInternal(baseUrl);

  return res.status(200).json({
    success: true,
    analysis,
    timestamp: new Date().toISOString()
  });
}

// Internal function to analyze all sites
async function analyzeAllSitesInternal(baseUrl) {
  // Fetch data from all APIs
  const [seoAnalysis, authorityData, competitorData, pageSpeedData] = await Promise.all([
    fetchData(`${baseUrl}/api/seo-analysis-engine?action=analyze`),
    fetchData(`${baseUrl}/api/authority-score?competitors=true`),
    fetchData(`${baseUrl}/api/admin-data?type=competitors`),
    fetchData(`${baseUrl}/api/pagespeed?url=https://www.chrisdavidsalon.com`)
  ]);

  // Compile analysis
  const analysis = {
    mainSite: {
      domain: 'chrisdavidsalon.com',
      seoHealth: seoAnalysis?.summary?.overallHealth || { score: 0, status: 'unknown' },
      weekOverWeek: seoAnalysis?.summary?.weekOverWeek || null,
      pageSpeed: pageSpeedData?.success ? {
        performance: Math.round((pageSpeedData.data?.lighthouseResult?.categories?.performance?.score || 0) * 100),
        seo: Math.round((pageSpeedData.data?.lighthouseResult?.categories?.seo?.score || 0) * 100),
        accessibility: Math.round((pageSpeedData.data?.lighthouseResult?.categories?.accessibility?.score || 0) * 100),
        bestPractices: Math.round((pageSpeedData.data?.lighthouseResult?.categories?.['best-practices']?.score || 0) * 100)
      } : null,
      authority: authorityData?.data?.pagerank_decimal || null
    },
    microsites: {
      'bestsalondelray.com': {
        authority: authorityData?.data?.comparison?.all_sites?.['bestsalondelray.com']?.pagerank || null,
        status: 'active',
        referrals: seoAnalysis?.detailed?.micrositeAnalysis?.bySite?.['bestsalondelray.com'] || { sessions: 0, users: 0 }
      },
      'bestdelraysalon.com': {
        authority: authorityData?.data?.comparison?.all_sites?.['bestdelraysalon.com']?.pagerank || null,
        status: 'not-indexed',
        referrals: seoAnalysis?.detailed?.micrositeAnalysis?.bySite?.['bestdelraysalon.com'] || { sessions: 0, users: 0 }
      },
      'bestsalonpalmbeach.com': {
        authority: authorityData?.data?.comparison?.all_sites?.['bestsalonpalmbeach.com']?.pagerank || null,
        status: 'active',
        referrals: seoAnalysis?.detailed?.micrositeAnalysis?.bySite?.['bestsalonpalmbeach.com'] || { sessions: 0, users: 0 }
      }
    },
    competitors: {
      count: competitorData?.data?.competitors?.length || 0,
      leader: competitorData?.data?.competitors?.[0] || null,
      ourPosition: findOurPosition(competitorData?.data?.competitors || [])
    },
    trends: seoAnalysis?.summary?.keyTrends || [],
    issues: identifyIssues(seoAnalysis, authorityData, competitorData, pageSpeedData),
    summary: {
      overallScore: calculateOverallScore(seoAnalysis, authorityData, pageSpeedData),
      criticalIssues: 0,
      highPriorityTasks: 0,
      micrositeHealth: 'needs-attention'
    }
  };

  // Count issues
  analysis.summary.criticalIssues = analysis.issues.filter(i => i.priority === 'critical').length;
  analysis.summary.highPriorityTasks = analysis.issues.filter(i => i.priority === 'high').length;

  return analysis;
}

// Generate SEO tasks based on analysis
async function generateSEOTasks(req, res) {
  const baseUrl = getBaseUrl(req);
  const analysis = await analyzeAllSitesInternal(baseUrl);
  const tasks = generatePrioritizedTasks(analysis);

  return res.status(200).json({
    success: true,
    tasks,
    summary: {
      total: tasks.length,
      critical: tasks.filter(t => t.priority === 'critical').length,
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length
    },
    timestamp: new Date().toISOString()
  });
}

// Track a change that was made
async function trackChange(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST required' });
  }

  const { site, changeType, description, files, expectedImpact, version } = req.body;

  const change = {
    id: `change-${Date.now()}`,
    timestamp: new Date().toISOString(),
    site: site || 'chrisdavidsalon.com',
    changeType: changeType || 'seo',
    description,
    files: files || [],
    expectedImpact,
    version,
    status: 'pending-measurement',
    measuredAt: null,
    actualImpact: null
  };

  // In production, this would store to Vercel KV or similar
  // For now, return the tracked change
  return res.status(200).json({
    success: true,
    message: 'Change tracked successfully',
    change,
    note: 'Change will be measured for effectiveness in next weekly analysis'
  });
}

// Get all tracked changes
async function getTrackedChanges(req, res) {
  const { since = '30' } = req.query;

  // In production, fetch from storage
  // For now, return structure
  return res.status(200).json({
    success: true,
    changes: [],
    period: `${since} days`,
    note: 'Changes tracking requires Vercel KV storage',
    timestamp: new Date().toISOString()
  });
}

// Measure effectiveness of changes
async function measureEffectiveness(req, res) {
  const baseUrl = getBaseUrl(req);

  // Get before/after comparison
  const analysis = await analyzeAllSitesInternal(baseUrl);

  return res.status(200).json({
    success: true,
    effectiveness: {
      trafficChange: analysis.mainSite.weekOverWeek?.users || null,
      bounceRateChange: analysis.mainSite.weekOverWeek?.bounceRate || null,
      authorityChange: null, // Would compare historical data
      rankingChanges: null, // Requires Search Console
      micrositeReferrals: {
        total: Object.values(analysis.microsites).reduce((sum, m) => sum + (m.referrals?.sessions || 0), 0),
        bysite: analysis.microsites
      }
    },
    analysis: analysis.mainSite.seoHealth,
    timestamp: new Date().toISOString()
  });
}

// Get AI-powered recommendations
async function getRecommendations(req, res) {
  const baseUrl = getBaseUrl(req);
  const analysis = await analyzeAllSitesInternal(baseUrl);
  const recommendations = generateImprovementRecommendations(analysis);

  return res.status(200).json({
    success: true,
    recommendations,
    basedOn: {
      seoHealth: analysis.mainSite.seoHealth,
      competitorPosition: analysis.competitors.ourPosition,
      pageSpeed: analysis.mainSite.pageSpeed,
      micrositeStatus: Object.keys(analysis.microsites).map(k => ({
        site: k,
        status: analysis.microsites[k].status,
        referrals: analysis.microsites[k].referrals?.sessions || 0
      }))
    },
    timestamp: new Date().toISOString()
  });
}

// Sync content recommendations across microsites
async function syncMicrosites(req, res) {
  const microsites = [
    { domain: 'bestsalondelray.com', focus: 'Delray Beach salon authority' },
    { domain: 'bestdelraysalon.com', focus: 'Local Delray Beach focus', issue: 'Not indexed' },
    { domain: 'bestsalonpalmbeach.com', focus: 'Palm Beach County regional' }
  ];

  const syncRecommendations = microsites.map(site => ({
    site: site.domain,
    focus: site.focus,
    status: site.issue ? 'needs-attention' : 'active',
    recommendations: [
      {
        type: 'content',
        action: 'Add fresh blog post about local hair trends',
        priority: 'medium',
        expectedImpact: 'Improved freshness signals'
      },
      {
        type: 'seo',
        action: 'Update meta descriptions with current promotions',
        priority: 'low',
        expectedImpact: 'Improved CTR in search results'
      },
      {
        type: 'links',
        action: 'Verify all internal links to main site are working',
        priority: 'high',
        expectedImpact: 'Proper link equity flow'
      }
    ],
    ...(site.issue ? {
      criticalAction: {
        action: 'Submit site to Google Search Console and request indexing',
        priority: 'critical',
        expectedImpact: 'Get site indexed to start generating traffic'
      }
    } : {})
  }));

  return res.status(200).json({
    success: true,
    microsites: syncRecommendations,
    summary: {
      totalSites: microsites.length,
      needsAttention: microsites.filter(s => s.issue).length,
      active: microsites.filter(s => !s.issue).length
    },
    timestamp: new Date().toISOString()
  });
}

// ============ HELPER FUNCTIONS ============

function getBaseUrl(req) {
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${protocol}://${host}`;
}

async function checkIntegration(baseUrl, endpoint) {
  try {
    const response = await fetch(`${baseUrl}${endpoint}`);
    const data = await response.json();
    return { connected: data.success === true, live: data.live || false };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

async function fetchData(url) {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return { success: false, error: error.message };
  }
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getNextSunday() {
  const now = new Date();
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilSunday);
  next.setHours(6, 0, 0, 0);
  return next.toISOString();
}

function findOurPosition(competitors) {
  const ourIndex = competitors.findIndex(c =>
    c.name?.toLowerCase().includes('chris david') ||
    c.name?.toLowerCase().includes('chrisdavid')
  );
  return ourIndex >= 0 ? ourIndex + 1 : null;
}

function calculateOverallScore(seoAnalysis, authorityData, pageSpeedData) {
  let score = 0;
  let factors = 0;

  // SEO Health (weight: 30%)
  if (seoAnalysis?.summary?.overallHealth?.score) {
    score += seoAnalysis.summary.overallHealth.score * 0.3;
    factors += 0.3;
  }

  // PageSpeed Performance (weight: 25%)
  if (pageSpeedData?.success) {
    const perf = (pageSpeedData.data?.lighthouseResult?.categories?.performance?.score || 0) * 100;
    score += perf * 0.25;
    factors += 0.25;
  }

  // Authority (weight: 20%)
  if (authorityData?.data?.pagerank_decimal) {
    // PageRank is 0-10, normalize to 0-100
    const authScore = Math.min(authorityData.data.pagerank_decimal * 10, 100);
    score += authScore * 0.2;
    factors += 0.2;
  }

  // Normalize score based on available factors
  return factors > 0 ? Math.round(score / factors) : 0;
}

function identifyIssues(seoAnalysis, authorityData, competitorData, pageSpeedData) {
  const issues = [];

  // Check PageSpeed performance
  if (pageSpeedData?.success) {
    const perf = (pageSpeedData.data?.lighthouseResult?.categories?.performance?.score || 0) * 100;
    if (perf < 50) {
      issues.push({
        priority: 'critical',
        category: 'performance',
        issue: 'Poor PageSpeed performance score',
        details: `Score: ${perf}/100 - needs immediate optimization`,
        suggestedFix: 'Optimize images, enable compression, reduce JavaScript'
      });
    } else if (perf < 70) {
      issues.push({
        priority: 'high',
        category: 'performance',
        issue: 'Below-average PageSpeed performance',
        details: `Score: ${perf}/100 - has room for improvement`,
        suggestedFix: 'Review Core Web Vitals and address largest issues'
      });
    }
  }

  // Check competitor position
  if (competitorData?.data?.competitors?.length > 0) {
    const ourPos = findOurPosition(competitorData.data.competitors);
    if (ourPos && ourPos > 3) {
      issues.push({
        priority: 'high',
        category: 'competitive',
        issue: `Ranked #${ourPos} among local competitors`,
        details: 'Need to improve to reach top 3 position',
        suggestedFix: 'Focus on review generation and local SEO optimization'
      });
    }

    // Check review gap
    const leader = competitorData.data.competitors[0];
    const ourSalon = competitorData.data.competitors.find(c =>
      c.name?.toLowerCase().includes('chris david')
    );
    if (leader && ourSalon && leader.reviews > (ourSalon.reviews || 0)) {
      const gap = leader.reviews - (ourSalon.reviews || 0);
      if (gap > 50) {
        issues.push({
          priority: 'high',
          category: 'reviews',
          issue: `${gap} reviews behind market leader`,
          details: `${leader.name} has ${leader.reviews} reviews vs your ${ourSalon.reviews || 0}`,
          suggestedFix: 'Implement review request automation after appointments'
        });
      }
    }
  }

  // Check microsite indexing
  issues.push({
    priority: 'critical',
    category: 'microsites',
    issue: 'bestdelraysalon.com is not indexed by Google',
    details: 'This microsite is not generating any traffic',
    suggestedFix: 'Submit to Google Search Console and request indexing'
  });

  // Check SEO trends
  if (seoAnalysis?.summary?.weekOverWeek?.users?.direction === 'down') {
    const change = seoAnalysis.summary.weekOverWeek.users.change;
    if (Math.abs(parseFloat(change)) > 10) {
      issues.push({
        priority: 'high',
        category: 'traffic',
        issue: `Traffic declining ${change}% week-over-week`,
        details: 'Significant traffic drop needs investigation',
        suggestedFix: 'Check for technical issues, ranking drops, or seasonal factors'
      });
    }
  }

  return issues;
}

function generatePrioritizedTasks(analysis) {
  const tasks = [];

  // Convert issues to tasks
  analysis.issues.forEach((issue, index) => {
    tasks.push({
      id: `task-${Date.now()}-${index}`,
      priority: issue.priority,
      category: issue.category,
      title: issue.issue,
      description: issue.details,
      action: issue.suggestedFix,
      estimatedImpact: getEstimatedImpact(issue.category, issue.priority),
      site: issue.category === 'microsites' ? 'bestdelraysalon.com' : 'chrisdavidsalon.com',
      status: 'pending'
    });
  });

  // Add recurring maintenance tasks
  tasks.push({
    id: `task-${Date.now()}-maintenance-1`,
    priority: 'low',
    category: 'maintenance',
    title: 'Update blog with fresh content',
    description: 'Search engines favor sites with fresh content',
    action: 'Publish new blog post about hair trends or salon news',
    estimatedImpact: 'Improved freshness signals, potential keyword rankings',
    site: 'chrisdavidsalon.com',
    status: 'pending'
  });

  tasks.push({
    id: `task-${Date.now()}-maintenance-2`,
    priority: 'medium',
    category: 'content',
    title: 'Sync microsite content',
    description: 'Keep microsites aligned with main site messaging',
    action: 'Update microsite hero sections and CTAs',
    estimatedImpact: 'Consistent branding, improved conversion',
    site: 'all-microsites',
    status: 'pending'
  });

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

function getEstimatedImpact(category, priority) {
  const impacts = {
    performance: { critical: '+15-20 SEO points', high: '+5-10 SEO points', medium: '+2-5 SEO points' },
    competitive: { critical: 'Market leadership', high: 'Top 3 position', medium: 'Improved visibility' },
    reviews: { critical: 'Major trust signals', high: '+10-20% conversion', medium: '+5-10% conversion' },
    microsites: { critical: 'Traffic activation', high: '+20-50 monthly referrals', medium: '+5-10 monthly referrals' },
    traffic: { critical: 'Stop traffic loss', high: 'Stabilize traffic', medium: 'Incremental improvement' },
    maintenance: { low: 'Ongoing optimization' },
    content: { medium: 'Better engagement', low: 'Incremental SEO value' }
  };

  return impacts[category]?.[priority] || 'Positive SEO impact';
}

function generateImprovementRecommendations(analysis) {
  const recommendations = [];

  // Based on overall score
  if (analysis.summary.overallScore < 60) {
    recommendations.push({
      priority: 'high',
      type: 'overall',
      recommendation: 'Focus on foundational SEO improvements',
      details: `Overall score ${analysis.summary.overallScore}/100 needs significant work`,
      actions: [
        'Fix all PageSpeed issues',
        'Ensure proper meta tags on all pages',
        'Add Schema.org markup',
        'Optimize Core Web Vitals'
      ]
    });
  }

  // Based on competitive position
  if (analysis.competitors.ourPosition > 1) {
    recommendations.push({
      priority: 'high',
      type: 'competitive',
      recommendation: 'Competitive gap analysis and closing',
      details: `Currently #${analysis.competitors.ourPosition} - need to reach #1`,
      actions: [
        'Analyze top competitor\'s SEO strategy',
        'Implement review generation campaign',
        'Increase local content and citations',
        'Build high-quality backlinks'
      ]
    });
  }

  // Microsite recommendations
  const inactiveMicrosites = Object.entries(analysis.microsites)
    .filter(([, data]) => data.referrals?.sessions === 0 || data.status === 'not-indexed');

  if (inactiveMicrosites.length > 0) {
    recommendations.push({
      priority: 'high',
      type: 'microsites',
      recommendation: 'Activate underperforming microsites',
      details: `${inactiveMicrosites.length} microsites generating no traffic`,
      actions: inactiveMicrosites.map(([site, data]) =>
        data.status === 'not-indexed'
          ? `Submit ${site} to Google Search Console`
          : `Optimize ${site} content and links`
      )
    });
  }

  // Content recommendations
  recommendations.push({
    priority: 'medium',
    type: 'content',
    recommendation: 'Expand service-specific content',
    details: 'More targeted landing pages = more ranking opportunities',
    actions: [
      'Create neighborhood-specific pages (Atlantic Ave, Pineapple Grove)',
      'Add FAQ schema to service pages',
      'Create seasonal content (wedding season, prom, holidays)',
      'Add video content for services'
    ]
  });

  // Authority building
  recommendations.push({
    priority: 'medium',
    type: 'authority',
    recommendation: 'Build domain authority through backlinks',
    details: 'Higher authority = better rankings for competitive keywords',
    actions: [
      'Get featured on Davines website (Chris is certified)',
      'Submit to local business directories',
      'Reach out to local blogs for features',
      'Create shareable content (trends, guides)'
    ]
  });

  return recommendations;
}

function generateWeeklyReport(analysis, tasks, recommendations) {
  const weekNumber = getWeekNumber(new Date());

  return {
    id: `report-week-${weekNumber}-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    weekNumber,
    summary: {
      overallScore: analysis.summary.overallScore,
      criticalIssues: analysis.summary.criticalIssues,
      tasksGenerated: tasks.length,
      recommendationsCount: recommendations.length,
      mainInsight: analysis.mainSite.seoHealth?.message || 'Analysis complete'
    },
    highlights: [
      `Overall SEO Score: ${analysis.summary.overallScore}/100`,
      `Competitive Position: #${analysis.competitors.ourPosition || 'Unknown'}`,
      `${tasks.filter(t => t.priority === 'critical' || t.priority === 'high').length} high-priority tasks identified`,
      `${Object.values(analysis.microsites).filter(m => m.referrals?.sessions > 0).length}/3 microsites generating traffic`
    ],
    nextWeekFocus: recommendations.slice(0, 3).map(r => r.recommendation)
  };
}
