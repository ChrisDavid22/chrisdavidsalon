/**
 * SEO BRAIN - Autonomous Weekly Improvement Generator
 *
 * This is the "brain" of the system. Every week it:
 * 1. Pulls data from all sources (GA4, Search Console, Competitors, Authority)
 * 2. Analyzes trends and opportunities
 * 3. Generates specific, actionable improvements
 * 4. Returns concrete tasks with implementation details
 *
 * Actions:
 *   ?action=analyze     - Run full weekly analysis and generate tasks
 *   ?action=status      - Check system status and last analysis
 *   ?action=get-tasks   - Get current pending tasks
 *   ?action=history     - Get history of implemented improvements
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action = 'status' } = req.query;

  try {
    switch (action) {
      case 'analyze':
        return await runWeeklyAnalysis(req, res);
      case 'status':
        return await getStatus(req, res);
      case 'get-tasks':
        return await getTasks(req, res);
      case 'history':
        return await getHistory(req, res);
      default:
        return res.status(400).json({
          success: false,
          error: 'Unknown action',
          available: ['analyze', 'status', 'get-tasks', 'history']
        });
    }
  } catch (error) {
    console.error('SEO Brain error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// ===========================================
// MAIN ANALYSIS - The Weekly Brain Function
// ===========================================

async function runWeeklyAnalysis(req, res) {
  const analysisStart = Date.now();
  const baseUrl = getBaseUrl(req);

  console.log('SEO Brain: Starting weekly analysis...');

  // Step 1: Gather all data sources in parallel
  const [
    seoAnalysis,
    searchRankings,
    competitors,
    authority
  ] = await Promise.allSettled([
    fetchData(`${baseUrl}/api/seo-analysis-engine?action=status`),
    fetchData(`${baseUrl}/api/ga4-analytics?type=search-rankings`),
    fetchData(`${baseUrl}/api/admin-data?type=competitors`),
    fetchData(`${baseUrl}/api/authority-score?competitors=true`)
  ]);

  // Step 2: Process each data source
  const dataReport = {
    seoAnalysis: processResult(seoAnalysis, 'seo-analysis-engine'),
    searchRankings: processResult(searchRankings, 'search-rankings'),
    competitors: processResult(competitors, 'competitors'),
    authority: processResult(authority, 'authority')
  };

  // Step 3: Generate intelligent recommendations
  const tasks = generateWeeklyTasks(dataReport);

  // Step 4: Prioritize and sort tasks
  const prioritizedTasks = prioritizeTasks(tasks);

  const analysisTime = Date.now() - analysisStart;

  return res.status(200).json({
    success: true,
    analysisDate: new Date().toISOString(),
    analysisTimeMs: analysisTime,
    summary: {
      totalTasks: prioritizedTasks.length,
      highPriority: prioritizedTasks.filter(t => t.priority === 'critical' || t.priority === 'high').length,
      dataSourcesAvailable: Object.values(dataReport).filter(d => d.available).length,
      dataSourcesTotal: 4
    },
    tasks: prioritizedTasks,
    dataReport,
    recommendations: generateExecutiveSummary(dataReport, prioritizedTasks)
  });
}

// ===========================================
// TASK GENERATION - The Intelligence Layer
// ===========================================

function generateWeeklyTasks(dataReport) {
  const tasks = [];

  // ---------- SEARCH RANKINGS ANALYSIS ----------
  if (dataReport.searchRankings.available && dataReport.searchRankings.data) {
    const rankings = dataReport.searchRankings.data;
    const topKeywords = rankings.topKeywords || [];

    // Find keywords close to page 1 (position 11-20)
    const almostPage1 = topKeywords.filter(k => {
      const pos = parseFloat(k.position);
      return pos > 10 && pos <= 20;
    });

    almostPage1.forEach(keyword => {
      tasks.push({
        type: 'keyword-optimization',
        priority: 'high',
        title: `Push "${keyword.keyword}" to Page 1`,
        description: `Currently at position ${keyword.position} with ${keyword.impressions} impressions. Small optimizations could move this to page 1.`,
        impact: 'HIGH - Page 1 gets 90%+ of clicks',
        effort: 'LOW',
        implementation: {
          steps: [
            `Add "${keyword.keyword}" to a page title tag`,
            `Create or update content specifically about "${keyword.keyword}"`,
            `Add internal links to the target page using this keyword as anchor text`,
            `Ensure the keyword appears in H1, H2 headings`
          ],
          suggestedPage: guessTargetPage(keyword.keyword),
          metaTitle: generateOptimizedTitle(keyword.keyword),
          metaDescription: generateOptimizedDescription(keyword.keyword)
        },
        metrics: {
          currentPosition: keyword.position,
          impressions: keyword.impressions,
          clicks: keyword.clicks,
          potentialClicks: estimatePotentialClicks(keyword)
        }
      });
    });

    // Find high-impression keywords with poor rankings (page 3+)
    const bigOpportunities = topKeywords.filter(k => {
      const pos = parseFloat(k.position);
      const impr = parseInt(k.impressions);
      return pos > 20 && impr > 50;
    }).sort((a, b) => parseInt(b.impressions) - parseInt(a.impressions));

    bigOpportunities.slice(0, 3).forEach(keyword => {
      tasks.push({
        type: 'new-page-needed',
        priority: 'critical',
        title: `Create dedicated page for "${keyword.keyword}"`,
        description: `${keyword.impressions} impressions at position ${keyword.position}. A dedicated landing page could capture this traffic.`,
        impact: 'VERY HIGH - Currently invisible for valuable traffic',
        effort: 'MEDIUM',
        implementation: {
          steps: [
            `Create new page: /services/${slugify(keyword.keyword)}.html`,
            `Target "${keyword.keyword}" + local variations`,
            `Add schema markup (LocalBusiness, Service)`,
            `Link from homepage and related service pages`,
            `Submit to Search Console for indexing`
          ],
          suggestedUrl: `/services/${slugify(keyword.keyword)}.html`,
          contentOutline: generateContentOutline(keyword.keyword)
        },
        metrics: {
          impressions: keyword.impressions,
          currentPosition: keyword.position,
          estimatedMonthlyTraffic: Math.round(parseInt(keyword.impressions) * 0.05) // 5% CTR estimate if on page 1
        }
      });
    });

    // Analyze CTR opportunities
    const lowCTR = topKeywords.filter(k => {
      const pos = parseFloat(k.position);
      const ctr = parseFloat(k.ctr);
      // Good position but low CTR
      return pos <= 10 && ctr < 5;
    });

    lowCTR.forEach(keyword => {
      tasks.push({
        type: 'ctr-optimization',
        priority: 'medium',
        title: `Improve CTR for "${keyword.keyword}"`,
        description: `Position ${keyword.position} but only ${keyword.ctr}% CTR. Your snippet isn't compelling enough.`,
        impact: 'MEDIUM - Better titles/descriptions = more clicks without ranking changes',
        effort: 'LOW',
        implementation: {
          steps: [
            'Update meta title to be more compelling',
            'Add power words: "Best", "Expert", "Certified"',
            'Include a call-to-action in meta description',
            'Add review stars via schema markup'
          ],
          currentTitle: 'Check current page title',
          suggestedTitle: generateCompellingTitle(keyword.keyword),
          suggestedDescription: generateCompellingDescription(keyword.keyword)
        },
        metrics: {
          currentCTR: keyword.ctr,
          targetCTR: '8-15%',
          potentialExtraClicks: Math.round(parseInt(keyword.impressions) * 0.05)
        }
      });
    });
  }

  // ---------- COMPETITOR ANALYSIS ----------
  if (dataReport.competitors.available && dataReport.competitors.data) {
    const competitors = dataReport.competitors.data.competitors || [];
    const chrisDavid = competitors.find(c => c.isOurSalon || (c.name || '').toLowerCase().includes('chris david'));
    const leader = competitors[0];

    if (chrisDavid && leader && !leader.isOurSalon) {
      const reviewGap = (leader.reviews || 0) - (chrisDavid.reviews || 0);

      if (reviewGap > 50) {
        tasks.push({
          type: 'review-generation',
          priority: 'high',
          title: `Close review gap: ${reviewGap} reviews behind ${leader.name}`,
          description: `Reviews are 15-20% of local rankings. ${leader.name} has ${leader.reviews} reviews vs your ${chrisDavid.reviews}.`,
          impact: 'HIGH - Reviews directly impact Google Maps ranking',
          effort: 'ONGOING',
          implementation: {
            steps: [
              'Ask every satisfied client for a review (verbal + follow-up text)',
              'Create a simple review request card with QR code',
              'Respond to ALL reviews within 24 hours',
              'Never incentivize reviews (against Google policy)'
            ],
            reviewLink: 'https://search.google.com/local/writereview?placeid=ChIJxTZ8If_f2IgR2XMxX_zRKSg',
            weeklyTarget: 3
          },
          metrics: {
            currentReviews: chrisDavid.reviews,
            targetReviews: chrisDavid.reviews + 20,
            gap: reviewGap,
            leader: leader.name
          }
        });
      }
    }
  }

  // ---------- SEO ANALYSIS ENGINE DATA ----------
  if (dataReport.seoAnalysis.available && dataReport.seoAnalysis.data) {
    const analysis = dataReport.seoAnalysis.data;
    const weekOverWeek = analysis.summary?.weekOverWeek || analysis.detailed?.weekComparison;

    if (weekOverWeek) {
      // Check bounce rate
      if (weekOverWeek.bounceRate?.direction === 'worsened') {
        tasks.push({
          type: 'ux-improvement',
          priority: 'medium',
          title: 'Reduce bounce rate - users are leaving quickly',
          description: `Bounce rate increased ${weekOverWeek.bounceRate.change}% week-over-week. Users aren't finding what they need.`,
          impact: 'MEDIUM - Lower bounce rate = better engagement signals to Google',
          effort: 'MEDIUM',
          implementation: {
            steps: [
              'Add compelling above-the-fold content',
              'Ensure booking button is immediately visible',
              'Speed up page load (compress images, lazy load)',
              'Add testimonials and social proof early on page',
              'Check mobile responsiveness'
            ]
          },
          metrics: {
            currentBounceRate: weekOverWeek.bounceRate.current,
            previousBounceRate: weekOverWeek.bounceRate.previous,
            change: weekOverWeek.bounceRate.change
          }
        });
      }

      // Traffic momentum
      if (weekOverWeek.sessions?.direction === 'up' && parseFloat(weekOverWeek.sessions.change) > 20) {
        tasks.push({
          type: 'momentum-action',
          priority: 'medium',
          title: 'Capitalize on traffic growth momentum',
          description: `Sessions up ${weekOverWeek.sessions.change}% - now is the time to double down on what's working.`,
          impact: 'HIGH - Reinvest in winning strategies',
          effort: 'MEDIUM',
          implementation: {
            steps: [
              'Identify which pages/keywords are driving growth',
              'Create more content around winning topics',
              'Add conversion opportunities to high-traffic pages',
              'Consider Google Ads to amplify organic winners'
            ]
          },
          metrics: {
            sessionGrowth: weekOverWeek.sessions.change,
            currentSessions: weekOverWeek.sessions.current
          }
        });
      }
    }

    // Check microsite performance
    const microsites = analysis.detailed?.micrositeAnalysis?.bySite;
    if (microsites) {
      Object.entries(microsites).forEach(([site, data]) => {
        if (data.sessions === 0) {
          tasks.push({
            type: 'microsite-optimization',
            priority: 'low',
            title: `Activate ${site} - zero referral traffic`,
            description: `${site} exists but isn't sending any traffic to the main site.`,
            impact: 'LOW - Microsites are supplementary',
            effort: 'MEDIUM',
            implementation: {
              steps: [
                `Verify ${site} is live and accessible`,
                'Add unique, valuable content (not duplicate)',
                'Submit to Google Search Console',
                'Add clear CTAs linking to main site'
              ]
            }
          });
        }
      });
    }
  }

  // ---------- AUTHORITY ANALYSIS ----------
  if (dataReport.authority.available && dataReport.authority.data) {
    const auth = dataReport.authority.data;
    const score = auth.authority_score || 0;

    if (score < 30) {
      tasks.push({
        type: 'authority-building',
        priority: 'medium',
        title: 'Build domain authority through quality backlinks',
        description: `Domain authority is ${score}/100. Local salons typically need 30+ to compete for competitive terms.`,
        impact: 'HIGH - Authority is 10-15% of rankings',
        effort: 'HIGH',
        implementation: {
          steps: [
            'Get listed on local business directories (Yelp, YP, local chamber)',
            'Reach out to local bloggers/publications for features',
            'Create link-worthy content (guides, infographics)',
            'Claim and optimize all social profiles with links back',
            'Partner with local businesses for cross-promotion'
          ],
          targetAuthority: 35,
          estimatedTimeframe: '3-6 months'
        },
        metrics: {
          currentAuthority: score,
          pageRank: auth.pagerank_decimal
        }
      });
    }
  }

  // ---------- ALWAYS-INCLUDE TASKS ----------

  // Weekly GBP posting
  tasks.push({
    type: 'gbp-posting',
    priority: 'medium',
    title: 'Post to Google Business Profile this week',
    description: 'Regular GBP posts signal activity to Google and can appear in search results.',
    impact: 'MEDIUM - Signals business is active',
    effort: 'LOW',
    implementation: {
      steps: [
        'Share a recent client transformation photo',
        'Announce any specials or availability',
        'Share a tip related to hair care',
        'Include a call-to-action (Book Now)'
      ],
      link: 'https://business.google.com',
      frequency: 'Weekly'
    }
  });

  return tasks;
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

function processResult(result, name) {
  if (result.status === 'fulfilled' && result.value?.success) {
    return {
      available: true,
      data: result.value.data || result.value,
      timestamp: new Date().toISOString()
    };
  }
  return {
    available: false,
    error: result.reason?.message || 'Failed to fetch',
    timestamp: new Date().toISOString()
  };
}

function prioritizeTasks(tasks) {
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function guessTargetPage(keyword) {
  const kw = keyword.toLowerCase();
  if (kw.includes('balayage')) return '/services/balayage-delray-beach.html';
  if (kw.includes('color') || kw.includes('colour')) return '/services/hair-color-delray-beach.html';
  if (kw.includes('cut') || kw.includes('haircut')) return '/services/womens-haircut-delray-beach.html';
  if (kw.includes('extension')) return '/services/hair-extensions-delray-beach.html';
  if (kw.includes('keratin')) return '/services/keratin-treatment-delray-beach.html';
  if (kw.includes('wedding') || kw.includes('bridal')) return '/services/wedding-hair-delray-beach.html';
  return '/index.html';
}

function generateOptimizedTitle(keyword) {
  const kw = keyword.toLowerCase();
  if (kw.includes('balayage')) return `Best Balayage in Delray Beach | Master Colorist | Chris David Salon`;
  if (kw.includes('salon')) return `Chris David Salon | Premier Hair Salon in Delray Beach, FL`;
  if (kw.includes('color')) return `Expert Hair Color in Delray Beach | 5 Brand Certifications | Chris David`;
  return `${keyword} | Chris David Salon Delray Beach`;
}

function generateOptimizedDescription(keyword) {
  return `Looking for ${keyword} in Delray Beach? Chris David is a master colorist with 20+ years experience and 5 brand certifications. Book your consultation today. ★★★★★ 4.9 rated.`;
}

function generateCompellingTitle(keyword) {
  return `${keyword} | ★★★★★ Master Colorist | Delray Beach`;
}

function generateCompellingDescription(keyword) {
  return `Award-winning ${keyword} at Chris David Salon. 20+ years experience, 5 brand certifications. See why clients rate us 4.9★. Book your transformation today!`;
}

function generateContentOutline(keyword) {
  return [
    `H1: ${keyword} in Delray Beach`,
    `Introduction: Why Chris David is the expert for ${keyword}`,
    `H2: What is ${keyword}?`,
    `H2: Chris David's Approach to ${keyword}`,
    `H2: ${keyword} Before & After Gallery`,
    `H2: ${keyword} Pricing`,
    `H2: ${keyword} FAQ`,
    `CTA: Book Your ${keyword} Consultation`
  ];
}

function estimatePotentialClicks(keyword) {
  // If on page 1, estimate 5-15% CTR based on position
  const impressions = parseInt(keyword.impressions);
  return Math.round(impressions * 0.08); // 8% average CTR estimate for page 1
}

function generateExecutiveSummary(dataReport, tasks) {
  const criticalCount = tasks.filter(t => t.priority === 'critical').length;
  const highCount = tasks.filter(t => t.priority === 'high').length;

  let summary = `## This Week's SEO Focus\n\n`;

  if (criticalCount > 0) {
    summary += `**${criticalCount} CRITICAL actions** need immediate attention:\n`;
    tasks.filter(t => t.priority === 'critical').forEach(t => {
      summary += `- ${t.title}\n`;
    });
    summary += `\n`;
  }

  if (highCount > 0) {
    summary += `**${highCount} HIGH priority actions** for this week:\n`;
    tasks.filter(t => t.priority === 'high').forEach(t => {
      summary += `- ${t.title}\n`;
    });
  }

  // Add data insights
  if (dataReport.seoAnalysis.available) {
    const wow = dataReport.seoAnalysis.data?.summary?.weekOverWeek;
    if (wow?.sessions?.direction === 'up') {
      summary += `\n**Good news:** Traffic is up ${wow.sessions.change}% week-over-week!\n`;
    }
  }

  return summary;
}

async function fetchData(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    return await response.json();
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

function getBaseUrl(req) {
  const host = req.headers.host;
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}

// ===========================================
// STATUS & TASK RETRIEVAL
// ===========================================

async function getStatus(req, res) {
  return res.status(200).json({
    success: true,
    status: 'operational',
    name: 'SEO Brain - Autonomous Improvement Generator',
    version: '1.0.0',
    capabilities: [
      'Weekly analysis of all data sources',
      'Keyword opportunity detection',
      'Competitor gap analysis',
      'Prioritized task generation',
      'Implementation guidance'
    ],
    dataSources: [
      'GA4 Analytics (traffic, behavior)',
      'Search Console (rankings, clicks, impressions)',
      'Google Places (competitors, reviews)',
      'OpenPageRank (domain authority)'
    ],
    actions: {
      analyze: 'Run full weekly analysis and generate tasks',
      status: 'Check system status',
      'get-tasks': 'Retrieve current pending tasks',
      history: 'Get history of improvements'
    }
  });
}

async function getTasks(req, res) {
  // For now, run fresh analysis to get tasks
  // In future, could cache tasks and track completion
  return await runWeeklyAnalysis(req, res);
}

async function getHistory(req, res) {
  // Placeholder for tracking implemented improvements
  return res.status(200).json({
    success: true,
    message: 'History tracking coming soon',
    history: []
  });
}
