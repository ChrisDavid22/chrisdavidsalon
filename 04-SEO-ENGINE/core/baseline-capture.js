/**
 * SEO BASELINE CAPTURE SYSTEM
 *
 * Purpose: Capture a complete snapshot of a website's SEO health on Day 1
 * so we can show before/after progress to non-technical clients.
 *
 * Key Principle: Make everything understandable to someone who knows
 * NOTHING about SEO. Use analogies, letter grades, and plain English.
 */

// Letter grade thresholds (like school)
const GRADE_THRESHOLDS = {
  A: 90,  // Excellent - top of class
  B: 80,  // Good - above average
  C: 70,  // Average - room for improvement
  D: 60,  // Below average - needs work
  F: 0    // Failing - urgent attention needed
};

function getLetterGrade(score) {
  if (score >= 90) return { grade: 'A', color: 'green', emoji: '🌟', message: 'Excellent' };
  if (score >= 80) return { grade: 'B', color: 'green', emoji: '✅', message: 'Good' };
  if (score >= 70) return { grade: 'C', color: 'yellow', emoji: '⚠️', message: 'Average' };
  if (score >= 60) return { grade: 'D', color: 'orange', emoji: '🔶', message: 'Needs Work' };
  return { grade: 'F', color: 'red', emoji: '🚨', message: 'Urgent' };
}

/**
 * BASELINE REPORT STRUCTURE
 *
 * This is what we capture on Day 1 and store forever.
 */
const BaselineReportTemplate = {
  // Metadata
  capturedAt: null,
  websiteUrl: null,
  businessName: null,
  industry: null,

  // The "Report Card" - Overall grades anyone can understand
  reportCard: {
    overallGrade: null,  // A, B, C, D, F
    overallScore: null,  // 0-100
    overallMessage: null, // "Your website is performing above average..."

    categories: {
      // Each category gets a grade + plain English explanation
      visibility: {
        grade: null,
        score: null,
        title: "Can People Find You?",
        explanation: null,  // "When someone searches 'salon near me', you show up X% of the time..."
        comparison: null    // "The top salon in your area shows up 90% of the time"
      },
      reputation: {
        grade: null,
        score: null,
        title: "What Do People Think?",
        explanation: null,
        comparison: null
      },
      website: {
        grade: null,
        score: null,
        title: "How Good Is Your Website?",
        explanation: null,
        comparison: null
      },
      competition: {
        grade: null,
        score: null,
        title: "How Do You Compare?",
        explanation: null,
        comparison: null
      }
    }
  },

  // Raw metrics (for tracking changes over time)
  metrics: {
    // Google Business Profile
    gbp: {
      rating: null,
      reviewCount: null,
      responseRate: null,
      photoCount: null,
      postFrequency: null
    },

    // Website Performance
    website: {
      speedScore: null,
      mobileScore: null,
      seoScore: null,
      accessibilityScore: null
    },

    // Authority & Trust
    authority: {
      domainAuthority: null,
      backlinks: null,
      citationCount: null
    },

    // Traffic (if available)
    traffic: {
      monthlyVisitors: null,
      organicTraffic: null,
      topKeywords: []
    },

    // Competition
    competition: {
      marketPosition: null,  // "9th out of 14 salons"
      topCompetitor: null,
      gapToLeader: null
    }
  },

  // Key insights in plain English
  insights: {
    strengths: [],   // "Your 4.9 star rating is excellent"
    weaknesses: [],  // "You have fewer reviews than competitors"
    opportunities: [], // "Adding photos weekly could boost visibility 20%"
    threats: []      // "Rové Hair Salon is dominating with 1,500+ reviews"
  },

  // What we'll track over time
  trackingTargets: {
    week4: {
      reviewTarget: null,
      trafficTarget: null,
      rankTarget: null
    },
    week12: {
      reviewTarget: null,
      trafficTarget: null,
      rankTarget: null
    }
  }
};

/**
 * CAPTURE BASELINE
 *
 * Main function to run on Day 1 for any new client.
 * Gathers all data and creates an understandable report.
 */
async function captureBaseline(websiteUrl, config = {}) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  SEO BASELINE CAPTURE`);
  console.log(`  ${websiteUrl}`);
  console.log(`  ${new Date().toISOString()}`);
  console.log(`${'='.repeat(60)}\n`);

  const baseline = JSON.parse(JSON.stringify(BaselineReportTemplate));
  baseline.capturedAt = new Date().toISOString();
  baseline.websiteUrl = websiteUrl;

  // Step 1: Discover business info
  console.log('Step 1/5: Discovering business info...');
  const businessInfo = await discoverBusinessInfo(websiteUrl, config);
  baseline.businessName = businessInfo.name;
  baseline.industry = businessInfo.industry;

  // Step 2: Get Google Business Profile data
  console.log('Step 2/5: Checking Google Business Profile...');
  const gbpData = await getGBPData(businessInfo);
  baseline.metrics.gbp = gbpData;

  // Step 3: Analyze website
  console.log('Step 3/5: Analyzing website performance...');
  const websiteData = await analyzeWebsite(websiteUrl);
  baseline.metrics.website = websiteData;

  // Step 4: Check authority
  console.log('Step 4/5: Checking domain authority...');
  const authorityData = await checkAuthority(websiteUrl);
  baseline.metrics.authority = authorityData;

  // Step 5: Analyze competition
  console.log('Step 5/5: Analyzing competition...');
  const competitionData = await analyzeCompetition(businessInfo);
  baseline.metrics.competition = competitionData;

  // Generate the report card (plain English grades)
  baseline.reportCard = generateReportCard(baseline.metrics, competitionData);

  // Generate insights
  baseline.insights = generateInsights(baseline.metrics, competitionData);

  // Set tracking targets
  baseline.trackingTargets = setTrackingTargets(baseline.metrics);

  console.log('\n✅ Baseline capture complete!\n');

  return baseline;
}

/**
 * GENERATE REPORT CARD
 *
 * Convert raw metrics into grades and explanations anyone can understand.
 */
function generateReportCard(metrics, competition) {
  const reportCard = {
    overallGrade: null,
    overallScore: null,
    overallMessage: null,
    categories: {}
  };

  // VISIBILITY: Can people find you?
  const visibilityScore = calculateVisibilityScore(metrics, competition);
  const visibilityGrade = getLetterGrade(visibilityScore);
  reportCard.categories.visibility = {
    grade: visibilityGrade.grade,
    score: visibilityScore,
    title: "Can People Find You?",
    emoji: visibilityGrade.emoji,
    color: visibilityGrade.color,
    explanation: generateVisibilityExplanation(metrics, competition, visibilityScore),
    comparison: generateVisibilityComparison(metrics, competition)
  };

  // REPUTATION: What do people think?
  const reputationScore = calculateReputationScore(metrics);
  const reputationGrade = getLetterGrade(reputationScore);
  reportCard.categories.reputation = {
    grade: reputationGrade.grade,
    score: reputationScore,
    title: "What Do People Think?",
    emoji: reputationGrade.emoji,
    color: reputationGrade.color,
    explanation: generateReputationExplanation(metrics, reputationScore),
    comparison: generateReputationComparison(metrics, competition)
  };

  // WEBSITE: How good is your website?
  const websiteScore = calculateWebsiteScore(metrics);
  const websiteGrade = getLetterGrade(websiteScore);
  reportCard.categories.website = {
    grade: websiteGrade.grade,
    score: websiteScore,
    title: "How Good Is Your Website?",
    emoji: websiteGrade.emoji,
    color: websiteGrade.color,
    explanation: generateWebsiteExplanation(metrics, websiteScore),
    comparison: null  // Website comparison requires competitor data
  };

  // COMPETITION: How do you compare?
  const competitionScore = calculateCompetitionScore(metrics, competition);
  const competitionGrade = getLetterGrade(competitionScore);
  reportCard.categories.competition = {
    grade: competitionGrade.grade,
    score: competitionScore,
    title: "How Do You Compare to Others?",
    emoji: competitionGrade.emoji,
    color: competitionGrade.color,
    explanation: generateCompetitionExplanation(metrics, competition, competitionScore),
    comparison: null
  };

  // OVERALL
  const overallScore = Math.round(
    visibilityScore * 0.30 +
    reputationScore * 0.30 +
    websiteScore * 0.20 +
    competitionScore * 0.20
  );
  const overallGrade = getLetterGrade(overallScore);

  reportCard.overallGrade = overallGrade.grade;
  reportCard.overallScore = overallScore;
  reportCard.overallMessage = generateOverallMessage(overallScore, reportCard.categories);

  return reportCard;
}

/**
 * PLAIN ENGLISH EXPLANATIONS
 *
 * These functions turn numbers into sentences anyone can understand.
 */

function generateVisibilityExplanation(metrics, competition, score) {
  const position = competition?.marketPosition || 'unknown';
  const total = competition?.totalCompetitors || 'several';

  if (score >= 90) {
    return `Great news! When people search for businesses like yours, you're one of the first they see. You're ranking #${position} out of ${total} similar businesses in your area.`;
  } else if (score >= 70) {
    return `You're showing up in searches, but not always at the top. You're currently #${position} out of ${total} similar businesses. There's room to climb higher.`;
  } else if (score >= 50) {
    return `People are having trouble finding you online. You're ranking #${position} out of ${total} businesses, which means potential customers often see your competitors first.`;
  } else {
    return `This is a problem area. When people search for businesses like yours, you're barely showing up. You're #${position} out of ${total} - most customers never scroll that far.`;
  }
}

function generateReputationExplanation(metrics, score) {
  const rating = metrics.gbp?.rating || 0;
  const reviews = metrics.gbp?.reviewCount || 0;

  if (score >= 90) {
    return `Your reputation is excellent! With a ${rating}-star rating and ${reviews} reviews, customers trust you. This is one of your biggest strengths.`;
  } else if (score >= 70) {
    return `Your ${rating}-star rating is good, but with only ${reviews} reviews, you could use more social proof. Each new positive review helps build trust.`;
  } else if (score >= 50) {
    return `Your online reputation needs attention. With ${reviews} reviews and a ${rating}-star rating, potential customers might choose competitors with more reviews.`;
  } else {
    return `This needs immediate attention. With only ${reviews} reviews, customers can't tell if you're trustworthy. Getting more reviews should be priority #1.`;
  }
}

function generateWebsiteExplanation(metrics, score) {
  const speed = metrics.website?.speedScore || 0;
  const mobile = metrics.website?.mobileScore || 0;

  if (score >= 90) {
    return `Your website is fast and works great on phones. It loads quickly (${speed}/100 speed score) and looks good on mobile devices (${mobile}/100). This keeps visitors happy.`;
  } else if (score >= 70) {
    return `Your website is decent but could be better. Speed score is ${speed}/100 and mobile score is ${mobile}/100. Some visitors might leave if pages load slowly.`;
  } else if (score >= 50) {
    return `Your website is hurting you. With a ${speed}/100 speed score, many visitors leave before the page even loads. On phones, it scores ${mobile}/100 - and most people browse on phones.`;
  } else {
    return `Your website needs serious work. It's slow (${speed}/100) and doesn't work well on phones (${mobile}/100). You're probably losing customers because of this.`;
  }
}

function generateCompetitionExplanation(metrics, competition, score) {
  const leader = competition?.topCompetitor || 'your top competitor';
  const leaderReviews = competition?.topCompetitorReviews || 'many';
  const yourReviews = metrics.gbp?.reviewCount || 0;
  const gap = leaderReviews - yourReviews;

  if (score >= 90) {
    return `You're a market leader! You're competing effectively with ${leader} and others in your area. Keep up the great work.`;
  } else if (score >= 70) {
    return `You're competitive but not leading. ${leader} has ${leaderReviews} reviews compared to your ${yourReviews}. Closing this gap would help you win more customers.`;
  } else if (score >= 50) {
    return `You're falling behind. ${leader} dominates with ${leaderReviews} reviews - that's ${gap} more than you. Customers often choose them simply because they seem more popular.`;
  } else {
    return `The competition is beating you significantly. ${leader} has ${leaderReviews} reviews. To compete, you'll need a focused strategy to catch up.`;
  }
}

function generateOverallMessage(score, categories) {
  const grade = getLetterGrade(score);
  const strengths = Object.entries(categories)
    .filter(([_, cat]) => cat.score >= 80)
    .map(([_, cat]) => cat.title.toLowerCase());
  const weaknesses = Object.entries(categories)
    .filter(([_, cat]) => cat.score < 60)
    .map(([_, cat]) => cat.title.toLowerCase());

  let message = `Your overall SEO grade is ${grade.grade} (${score}/100). `;

  if (strengths.length > 0) {
    message += `You're doing well in ${strengths.join(' and ')}. `;
  }
  if (weaknesses.length > 0) {
    message += `We need to focus on improving ${weaknesses.join(' and ')}. `;
  }

  if (score >= 90) {
    message += `You're in excellent shape - let's maintain this lead and look for growth opportunities.`;
  } else if (score >= 70) {
    message += `You have a good foundation. With some targeted improvements, we can get you to the top.`;
  } else if (score >= 50) {
    message += `There's significant room for improvement. The good news: fixing these issues will make a real difference.`;
  } else {
    message += `We have work to do, but don't worry - every successful business started somewhere. Let's build your online presence step by step.`;
  }

  return message;
}

/**
 * GENERATE INSIGHTS
 *
 * Create SWOT analysis in plain English
 */
function generateInsights(metrics, competition) {
  const insights = {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: []
  };

  // Strengths
  if (metrics.gbp?.rating >= 4.8) {
    insights.strengths.push(`Your ${metrics.gbp.rating}-star rating is excellent - customers love you`);
  }
  if (metrics.website?.speedScore >= 80) {
    insights.strengths.push(`Your website loads quickly, keeping visitors engaged`);
  }
  if (metrics.authority?.domainAuthority >= 30) {
    insights.strengths.push(`Your website has established credibility with search engines`);
  }

  // Weaknesses
  if (metrics.gbp?.reviewCount < 100) {
    insights.weaknesses.push(`With ${metrics.gbp?.reviewCount || 0} reviews, you have fewer than many competitors`);
  }
  if (metrics.website?.speedScore < 70) {
    insights.weaknesses.push(`Your website is slow, which frustrates visitors and hurts rankings`);
  }
  if (metrics.authority?.domainAuthority < 20) {
    insights.weaknesses.push(`Your website lacks authority - search engines don't fully trust it yet`);
  }

  // Opportunities
  insights.opportunities.push(`Each new 5-star review increases your visibility by ~2%`);
  if (metrics.gbp?.photoCount < 50) {
    insights.opportunities.push(`Adding more photos to Google could increase engagement 35%`);
  }
  if (!metrics.gbp?.postFrequency) {
    insights.opportunities.push(`Regular Google posts can boost visibility and show you're active`);
  }

  // Threats
  if (competition?.topCompetitorReviews > metrics.gbp?.reviewCount * 3) {
    insights.threats.push(`${competition.topCompetitor} has ${competition.topCompetitorReviews} reviews - they dominate search results`);
  }

  return insights;
}

/**
 * SCORING FUNCTIONS
 */

function calculateVisibilityScore(metrics, competition) {
  let score = 50; // Base score

  // Position in market
  const position = competition?.marketPosition || 10;
  const total = competition?.totalCompetitors || 15;
  const percentile = 1 - (position / total);
  score += percentile * 30;

  // Authority contributes to visibility
  const authority = metrics.authority?.domainAuthority || 0;
  score += (authority / 100) * 20;

  return Math.min(100, Math.max(0, Math.round(score)));
}

function calculateReputationScore(metrics) {
  let score = 0;

  // Rating (40 points max)
  const rating = metrics.gbp?.rating || 0;
  score += (rating / 5) * 40;

  // Review count (40 points max, logarithmic)
  const reviews = metrics.gbp?.reviewCount || 0;
  const reviewScore = Math.min(40, Math.log10(reviews + 1) * 15);
  score += reviewScore;

  // Response rate (20 points max)
  const responseRate = metrics.gbp?.responseRate || 0;
  score += (responseRate / 100) * 20;

  return Math.min(100, Math.max(0, Math.round(score)));
}

function calculateWebsiteScore(metrics) {
  const speed = metrics.website?.speedScore || 50;
  const mobile = metrics.website?.mobileScore || 50;
  const seo = metrics.website?.seoScore || 50;
  const accessibility = metrics.website?.accessibilityScore || 50;

  // Weighted average
  return Math.round(
    speed * 0.30 +
    mobile * 0.30 +
    seo * 0.25 +
    accessibility * 0.15
  );
}

function calculateCompetitionScore(metrics, competition) {
  if (!competition) return 50;

  let score = 50;

  // Position bonus/penalty
  const position = competition.marketPosition || 10;
  if (position <= 3) score += 30;
  else if (position <= 5) score += 15;
  else if (position <= 10) score += 0;
  else score -= 15;

  // Gap to leader
  const leaderReviews = competition.topCompetitorReviews || 1000;
  const ourReviews = metrics.gbp?.reviewCount || 0;
  const gap = leaderReviews / Math.max(ourReviews, 1);

  if (gap < 2) score += 20;
  else if (gap < 5) score += 0;
  else score -= 20;

  return Math.min(100, Math.max(0, Math.round(score)));
}

function setTrackingTargets(metrics) {
  const currentReviews = metrics.gbp?.reviewCount || 0;
  const currentTraffic = metrics.traffic?.monthlyVisitors || 0;

  return {
    week4: {
      reviewTarget: currentReviews + 10,
      trafficTarget: Math.round(currentTraffic * 1.1),
      rankTarget: "Move up 2-3 positions"
    },
    week12: {
      reviewTarget: currentReviews + 30,
      trafficTarget: Math.round(currentTraffic * 1.3),
      rankTarget: "Top 5 in local search"
    }
  };
}

/**
 * HELPER FUNCTIONS - These would call actual APIs
 */

async function discoverBusinessInfo(url, config) {
  // In production, this would crawl the website
  return {
    name: config.businessName || "Unknown Business",
    industry: config.industry || "local-business"
  };
}

async function getGBPData(businessInfo) {
  // In production, this would call Google Places API
  return {
    rating: null,
    reviewCount: null,
    responseRate: null,
    photoCount: null,
    postFrequency: null
  };
}

async function analyzeWebsite(url) {
  // In production, this would call PageSpeed API
  return {
    speedScore: null,
    mobileScore: null,
    seoScore: null,
    accessibilityScore: null
  };
}

async function checkAuthority(url) {
  // In production, this would call OpenPageRank API
  return {
    domainAuthority: null,
    backlinks: null,
    citationCount: null
  };
}

async function analyzeCompetition(businessInfo) {
  // In production, this would analyze competitors
  return {
    marketPosition: null,
    totalCompetitors: null,
    topCompetitor: null,
    topCompetitorReviews: null,
    gapToLeader: null
  };
}

// Export for use in API
module.exports = {
  captureBaseline,
  generateReportCard,
  getLetterGrade,
  BaselineReportTemplate
};
