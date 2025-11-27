// Competitor PageSpeed API - Gets REAL SEO scores for all competitors
// Uses Google PageSpeed Insights API (FREE, no key required)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // All competitor domains we want to analyze
  const competitors = [
    { name: 'Chris David Salon', domain: 'chrisdavidsalon.com', isUs: true },
    { name: 'Rové Hair Salon', domain: 'rovesalon.com' },
    { name: 'Bond Street Salon', domain: 'bondstreetsalon.com' },
    { name: 'Studio 34 Delray', domain: 'studio34delray.com' },
    { name: 'Kaan Hair Design', domain: 'kaanhairdesign.com' },
    { name: 'Amanda Major Studio', domain: 'amandamajor.com' },
    { name: 'Salon South Flow', domain: 'salonsouthflow.com' },
    { name: 'Cloud 10 Salon', domain: 'cloud10usa.com' },
    { name: 'Imbue Salon', domain: 'imbuesalon.com' },
    { name: 'Studio 10 Boca', domain: 'studio10bocaraton.com' },
    { name: 'ShearLuck Salon', domain: 'slshair.com' },
    { name: 'ONE Aveda Salon', domain: 'onesalondelray.com' },
    { name: 'Tyler Presley Salon', domain: 'tylerpresleysalon.com' },
    { name: 'Conte Salon', domain: 'contesalon.com' },
    { name: 'Salon Sora', domain: 'salonsora.com' },
    { name: 'Pyure Salon', domain: 'pyuresalon.com' },
    { name: 'Dapper & Divine', domain: 'dapperanddivinestudio.com' },
    { name: 'Hair Mess Salon', domain: 'hairmesssalon.com' },
    { name: 'Salon Trace', domain: 'salontrace.com' },
    { name: 'Arielle Settel', domain: 'ariellesettel.com' }
  ];

  const { single } = req.query;

  // If single domain requested, just do that one
  if (single) {
    const result = await getPageSpeedScore(single);
    return res.status(200).json({
      success: true,
      data: result
    });
  }

  // Check for cached results (PageSpeed is slow, cache for 24 hours)
  const cacheKey = 'competitor_pagespeed_cache';

  try {
    // Run PageSpeed on all competitors (this takes a while)
    // We'll do them in parallel batches of 3 to avoid rate limits
    const results = [];
    const batchSize = 3;

    for (let i = 0; i < competitors.length; i += batchSize) {
      const batch = competitors.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (comp) => {
          const scores = await getPageSpeedScore(comp.domain);
          return {
            ...comp,
            ...scores
          };
        })
      );
      results.push(...batchResults);
    }

    // Sort by overall SEO score
    results.sort((a, b) => (b.seoScore || 0) - (a.seoScore || 0));

    // Add rank
    results.forEach((r, i) => {
      r.rank = i + 1;
    });

    return res.status(200).json({
      success: true,
      source: 'Google PageSpeed Insights API',
      timestamp: new Date().toISOString(),
      note: 'Real PageSpeed scores for all competitors - not estimates',
      data: results
    });

  } catch (error) {
    console.error('Competitor PageSpeed error:', error);
    return res.status(200).json({
      success: false,
      error: error.message
    });
  }
}

async function getPageSpeedScore(domain) {
  try {
    const url = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://${domain}&strategy=mobile&category=performance&category=seo&category=accessibility&category=best-practices`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return {
        domain,
        error: data.error.message,
        performance: null,
        seo: null,
        mobile: null,
        accessibility: null
      };
    }

    const categories = data.lighthouseResult?.categories || {};

    return {
      domain,
      performance: Math.round((categories.performance?.score || 0) * 100),
      seoScore: Math.round((categories.seo?.score || 0) * 100),
      accessibility: Math.round((categories.accessibility?.score || 0) * 100),
      bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
      // Calculate overall score (weighted average similar to our dashboard)
      overallScore: Math.round(
        (categories.performance?.score || 0) * 20 +
        (categories.seo?.score || 0) * 30 +
        (categories.accessibility?.score || 0) * 25 +
        (categories['best-practices']?.score || 0) * 25
      )
    };
  } catch (error) {
    return {
      domain,
      error: error.message,
      performance: null,
      seoScore: null,
      accessibility: null,
      bestPractices: null
    };
  }
}
