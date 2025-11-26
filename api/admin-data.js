// Universal Admin Data API - Returns REAL data ONLY
// NO HARDCODED FAKE DATA - per project policy
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { type = 'dashboard' } = req.query || req.body || {};

  // API keys from Vercel environment variables only
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
  const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

  try {
    switch(type) {
      case 'dashboard':
        // Dashboard data must come from real APIs - return null placeholders if unavailable
        return res.status(200).json({
          success: false,
          message: 'Dashboard requires GA4 and Google Places APIs. Use /api/ga4-analytics for traffic data and /api/admin-data?type=competitors for competitor data.',
          data: {
            seoScore: null,
            marketPosition: null,
            totalSalons: null,
            monthlyVisitors: null,
            conversionRate: null,
            bookingClicks: null,
            phoneClicks: null,
            mobileTraffic: null,
            topCompetitors: [],
            actionItems: [],
            opportunities: null
          }
        });

      case 'seo-analysis':
        // Always try to get REAL PageSpeed data (free tier works without key)
        try {
          const pageSpeedUrl = GOOGLE_API_KEY
            ? `https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://www.chrisdavidsalon.com&strategy=mobile&category=performance&category=seo&category=accessibility&category=best-practices&key=${GOOGLE_API_KEY}`
            : `https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://www.chrisdavidsalon.com&strategy=mobile&category=performance&category=seo&category=accessibility&category=best-practices`;

          const pageSpeedResponse = await fetch(pageSpeedUrl);
          const pageSpeedData = await pageSpeedResponse.json();

          // Check if we got valid data
          if (pageSpeedData.lighthouseResult?.categories) {
            const cats = pageSpeedData.lighthouseResult.categories;
            const performanceScore = Math.round((cats.performance?.score || 0) * 100);
            const seoScore = Math.round((cats.seo?.score || 0) * 100);
            const accessibilityScore = Math.round((cats.accessibility?.score || 0) * 100);
            const bestPracticesScore = Math.round((cats['best-practices']?.score || 0) * 100);

            // Extract real issues from the audit
            const audits = pageSpeedData.lighthouseResult.audits || {};
            const performanceIssues = [];
            const technicalIssues = [];

            if (audits['render-blocking-resources']?.score < 1) performanceIssues.push('Eliminate render-blocking resources');
            if (audits['uses-optimized-images']?.score < 1) performanceIssues.push('Optimize images');
            if (audits['uses-text-compression']?.score < 1) performanceIssues.push('Enable text compression');
            if (audits['meta-description']?.score < 1) technicalIssues.push('Add meta description');
            if (audits['document-title']?.score < 1) technicalIssues.push('Improve page title');
            if (audits['structured-data']?.score === 0) technicalIssues.push('Add structured data markup');

            return res.status(200).json({
              success: true,
              live: true,
              source: 'Google PageSpeed Insights API',
              timestamp: new Date().toISOString(),
              data: {
                totalScore: Math.round((performanceScore + seoScore + accessibilityScore) / 3),
                categories: {
                  performance: { score: performanceScore, issues: performanceIssues.length ? performanceIssues : ['Performance audit passed'] },
                  technical: { score: seoScore, issues: technicalIssues.length ? technicalIssues : ['Technical audit passed'] },
                  mobile: { score: bestPracticesScore, issues: [] },
                  userExperience: { score: accessibilityScore, issues: [] }
                }
              }
            });
          }
        } catch (pageSpeedError) {
          console.error('PageSpeed API error:', pageSpeedError);
        }

        // If PageSpeed fails, return error - NOT fake data
        return res.status(200).json({
          success: false,
          live: false,
          error: 'PageSpeed API failed or rate limited',
          message: 'Unable to fetch SEO analysis. Try again in a few minutes.',
          data: {
            totalScore: null,
            categories: {}
          }
        });

      case 'competitors':
        // Try to get REAL competitor data from Google Places API
        if (GOOGLE_PLACES_API_KEY) {
          try {
            // Place IDs for Delray Beach salons (pre-looked up for efficiency)
            const placeIds = {
              'Chris David Salon': 'ChIJp3_dxPy15ogRQKKxjA-JYJE',
              'Salon Sora': 'ChIJoXV8CsO15ogRAPTcGcP8F0E',
              'Drybar Delray Beach': 'ChIJn6m3F8K15ogRxXl4jxLWy4Y',
              'The W Salon': 'ChIJL7ZYdP615ogRJYFZYFOWGVc',
              'Bond Street Salon': 'ChIJaUv78di15ogRIgZGJAv8ncc'
            };

            const competitors = [];

            for (const [name, placeId] of Object.entries(placeIds)) {
              try {
                const placeUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,website&key=${GOOGLE_PLACES_API_KEY}`;
                const placeResponse = await fetch(placeUrl);
                const placeData = await placeResponse.json();

                if (placeData.status === 'OK' && placeData.result) {
                  competitors.push({
                    name: placeData.result.name || name,
                    url: placeData.result.website || '',
                    reviews: placeData.result.user_ratings_total || 0,
                    rating: placeData.result.rating || 0,
                    seoScore: null, // SEO score requires separate analysis
                    live: true
                  });
                }
              } catch (e) {
                console.error(`Failed to fetch ${name}:`, e);
              }
            }

            if (competitors.length > 0) {
              // Sort by reviews (most first)
              competitors.sort((a, b) => b.reviews - a.reviews);
              return res.status(200).json({
                success: true,
                live: true,
                source: 'Google Places API',
                timestamp: new Date().toISOString(),
                data: { competitors }
              });
            }
          } catch (placesError) {
            console.error('Places API error:', placesError);
          }
        }

        // NO FALLBACK DATA - return empty if API fails
        return res.status(200).json({
          success: false,
          live: false,
          error: GOOGLE_PLACES_API_KEY ? 'Google Places API error' : 'GOOGLE_PLACES_API_KEY not configured',
          message: 'Add GOOGLE_PLACES_API_KEY to Vercel environment variables',
          data: {
            competitors: []
          }
        });

      case 'keywords':
        // Keyword data requires Google Search Console API - return empty
        return res.status(200).json({
          success: false,
          live: false,
          error: 'Google Search Console API not connected',
          message: 'Keyword ranking data requires Search Console API connection',
          data: {
            keywords: [],
            summary: {
              top10Count: null,
              easyWins: null,
              notRanking: null
            }
          }
        });

      case 'tasks':
        // Tasks should be stored in a database, not hardcoded
        return res.status(200).json({
          success: false,
          message: 'Task storage not implemented. Use agent-implementations.json for tracking.',
          tasks: []
        });

      case 'analytics':
        // Analytics requires GA4 API - return empty
        return res.status(200).json({
          success: false,
          live: false,
          error: 'Use /api/ga4-analytics for traffic data',
          message: 'Analytics data requires GA4 API. Call /api/ga4-analytics?type=overview instead.',
          data: {
            visitors: null,
            pageViews: null,
            bounceRate: null,
            avgSessionDuration: null,
            topPages: [],
            trafficSources: null
          }
        });

      case 'ai-recommendations':
        // Use Claude AI to generate SEO recommendations
        if (ANTHROPIC_API_KEY) {
          try {
            const { context = 'general' } = req.query || req.body || {};

            const prompt = `You are an SEO expert for Chris David Salon in Delray Beach, FL. The owner has 20+ years experience and is certified with Davines. Give 5 specific, actionable SEO recommendations. Be concise - max 2 sentences each. Format as numbered list.`;

            const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
              },
              body: JSON.stringify({
                model: 'claude-3-5-haiku-20241022',
                max_tokens: 500,
                messages: [{ role: 'user', content: prompt }]
              })
            });

            const claudeData = await claudeResponse.json();

            if (claudeData.content && claudeData.content[0]) {
              const recommendations = claudeData.content[0].text
                .split(/\d+[\.\)]\s*/)
                .filter(r => r.trim().length > 10)
                .slice(0, 5)
                .map((r, i) => ({
                  id: i + 1,
                  recommendation: r.trim(),
                  priority: i < 2 ? 'high' : i < 4 ? 'medium' : 'low'
                }));

              return res.status(200).json({
                success: true,
                live: true,
                source: 'Claude AI',
                model: 'claude-3-5-haiku',
                timestamp: new Date().toISOString(),
                data: { recommendations }
              });
            }
          } catch (aiError) {
            console.error('Claude API error:', aiError);
          }
        }

        // NO FALLBACK - return empty if Claude fails
        return res.status(200).json({
          success: false,
          live: false,
          error: ANTHROPIC_API_KEY ? 'Claude API error' : 'ANTHROPIC_API_KEY not configured',
          message: 'AI recommendations require Anthropic API key',
          data: {
            recommendations: []
          }
        });

      case 'add-task':
      case 'update-task':
      case 'apply-fix':
        // These require POST handling and database
        return res.status(200).json({
          success: false,
          message: `Task operation '${type}' requires database storage - not implemented`,
          timestamp: new Date().toISOString()
        });

      default:
        return res.status(200).json({
          success: true,
          message: 'Admin API is working - NO HARDCODED DATA',
          availableTypes: ['seo-analysis', 'competitors', 'keywords', 'analytics', 'ai-recommendations'],
          note: 'All data comes from real APIs. If API not connected, returns empty data.',
          timestamp: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('Admin data API error:', error);
    // NO FALLBACK DATA even on error
    return res.status(200).json({
      success: false,
      error: error.message,
      message: 'API error occurred - no fallback data available',
      data: null
    });
  }
}
