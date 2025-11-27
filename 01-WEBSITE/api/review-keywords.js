/**
 * REVIEW KEYWORDS API
 *
 * Fetches Google reviews and extracts valuable keywords for SEO.
 * Matches reviews to service pages for strategic testimonial placement.
 *
 * Actions:
 *   ?action=analyze    - Analyze all reviews and extract keywords
 *   ?action=match      - Match reviews to service pages
 *   ?action=status     - Check API status
 */

export default async function handler(req, res) {
  // CORS headers
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
        return await analyzeReviews(req, res);
      case 'match':
        return await matchReviewsToPages(req, res);
      case 'status':
        return await getStatus(req, res);
      default:
        return res.status(400).json({
          success: false,
          error: 'Unknown action',
          available: ['analyze', 'match', 'status']
        });
    }
  } catch (error) {
    console.error('Review Keywords API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Service pages and their target keywords
const SERVICE_PAGES = {
  '/services/hair-color-delray-beach.html': {
    name: 'Hair Color',
    keywords: ['color', 'colour', 'balayage', 'highlights', 'blonde', 'brunette', 'gray', 'grey', 'root', 'toner', 'lightening', 'dye', 'colorist', 'foils', 'ombre', 'babylights', 'foilayage', 'gloss', 'tint']
  },
  '/services/balayage-delray-beach.html': {
    name: 'Balayage',
    keywords: ['balayage', 'hand-painted', 'sun-kissed', 'natural', 'dimensional', 'blend', 'seamless', 'highlights']
  },
  '/services/womens-haircut-delray-beach.html': {
    name: 'Women\'s Haircut',
    keywords: ['cut', 'haircut', 'trim', 'layers', 'bob', 'style', 'blowout', 'shape', 'texturize', 'bangs', 'fringe']
  },
  '/services/color-correction-delray-beach.html': {
    name: 'Color Correction',
    keywords: ['fix', 'correction', 'corrective', 'brassy', 'orange', 'damaged', 'box dye', 'disaster', 'save', 'repair', 'rescue']
  },
  '/services/hair-extensions-delray-beach.html': {
    name: 'Hair Extensions',
    keywords: ['extension', 'extensions', 'length', 'volume', 'fuller', 'longer', 'tape-in', 'fusion', 'beaded', 'seamless']
  },
  '/services/keratin-treatment-delray-beach.html': {
    name: 'Keratin Treatment',
    keywords: ['keratin', 'smoothing', 'frizz', 'frizzy', 'straight', 'smooth', 'sleek', 'brazilian', 'treatment']
  },
  '/services/wedding-hair-delray-beach.html': {
    name: 'Wedding Hair',
    keywords: ['wedding', 'bridal', 'bride', 'bridesmaid', 'updo', 'special occasion', 'event', 'prom', 'formal']
  },
  '/services/hair-salon-delray-beach.html': {
    name: 'Hair Salon (General)',
    keywords: ['salon', 'stylist', 'hair', 'professional', 'experience', 'service', 'atmosphere', 'recommend', 'love']
  }
};

// High-value SEO keywords to look for
const SEO_KEYWORDS = {
  services: ['balayage', 'highlights', 'color', 'cut', 'haircut', 'extensions', 'keratin', 'wedding', 'bridal', 'correction', 'ombre', 'blonde', 'blowout'],
  quality: ['best', 'amazing', 'excellent', 'perfect', 'beautiful', 'gorgeous', 'incredible', 'fantastic', 'wonderful', 'exceptional'],
  expertise: ['expert', 'master', 'professional', 'talented', 'skilled', 'knows', 'listens', 'understands'],
  location: ['delray', 'beach', 'boca', 'palm', 'florida', 'south florida', 'local'],
  recommendation: ['recommend', 'highly', 'definitely', 'absolutely', 'everyone', 'anyone', 'go to', 'trust'],
  loyalty: ['always', 'years', 'never', 'only', 'loyal', 'returning', 'regular', 'forever']
};

async function analyzeReviews(req, res) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: 'Google Places API key not configured'
    });
  }

  try {
    // Fetch reviews from Google Places API
    const placeId = 'ChIJxTZ8If_f2IgR2XMxX_zRKSg'; // Chris David Salon Place ID
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews,user_ratings_total&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.result?.reviews) {
      return res.status(200).json({
        success: false,
        error: 'Could not fetch reviews',
        status: data.status
      });
    }

    const reviews = data.result.reviews;
    const analysis = analyzeReviewKeywords(reviews);

    return res.status(200).json({
      success: true,
      salonName: data.result.name,
      totalReviews: data.result.user_ratings_total,
      averageRating: data.result.rating,
      reviewsAnalyzed: reviews.length,
      analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

function analyzeReviewKeywords(reviews) {
  const keywordCounts = {};
  const reviewsByKeyword = {};
  const serviceMatches = {};

  // Initialize service matches
  Object.keys(SERVICE_PAGES).forEach(page => {
    serviceMatches[page] = {
      name: SERVICE_PAGES[page].name,
      matchingReviews: [],
      keywordHits: []
    };
  });

  reviews.forEach(review => {
    const text = (review.text || '').toLowerCase();
    const author = review.author_name;
    const rating = review.rating;
    const time = review.relative_time_description;

    // Count SEO keyword occurrences
    Object.entries(SEO_KEYWORDS).forEach(([category, keywords]) => {
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          const key = `${category}:${keyword}`;
          keywordCounts[key] = (keywordCounts[key] || 0) + 1;

          if (!reviewsByKeyword[keyword]) {
            reviewsByKeyword[keyword] = [];
          }
          // Only add if not already present
          if (!reviewsByKeyword[keyword].find(r => r.author === author)) {
            reviewsByKeyword[keyword].push({
              author,
              rating,
              time,
              snippet: extractSnippet(review.text, keyword)
            });
          }
        }
      });
    });

    // Match to service pages
    Object.entries(SERVICE_PAGES).forEach(([page, config]) => {
      const matchedKeywords = config.keywords.filter(kw => text.includes(kw));
      if (matchedKeywords.length > 0) {
        serviceMatches[page].matchingReviews.push({
          author,
          rating,
          time,
          text: review.text,
          matchedKeywords
        });
        matchedKeywords.forEach(kw => {
          if (!serviceMatches[page].keywordHits.includes(kw)) {
            serviceMatches[page].keywordHits.push(kw);
          }
        });
      }
    });
  });

  // Sort keywords by count
  const sortedKeywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([key, count]) => {
      const [category, keyword] = key.split(':');
      return { category, keyword, count, reviews: reviewsByKeyword[keyword] };
    });

  // Get top reviews per service page
  const serviceRecommendations = {};
  Object.entries(serviceMatches).forEach(([page, data]) => {
    if (data.matchingReviews.length > 0) {
      // Sort by rating and number of keyword matches
      const sorted = data.matchingReviews.sort((a, b) => {
        const scoreA = a.rating + (a.matchedKeywords.length * 0.5);
        const scoreB = b.rating + (b.matchedKeywords.length * 0.5);
        return scoreB - scoreA;
      });

      serviceRecommendations[page] = {
        name: data.name,
        totalMatches: data.matchingReviews.length,
        keywordsFound: data.keywordHits,
        topReviews: sorted.slice(0, 3).map(r => ({
          author: r.author,
          rating: r.rating,
          text: r.text,
          relevantKeywords: r.matchedKeywords
        }))
      };
    }
  });

  return {
    topKeywords: sortedKeywords,
    servicePageMatches: serviceRecommendations,
    summary: {
      totalKeywordsFound: sortedKeywords.length,
      pagesWithMatchingReviews: Object.keys(serviceRecommendations).length,
      recommendationNote: 'Add these reviews to your service pages to boost SEO with keyword-rich testimonials'
    }
  };
}

function extractSnippet(fullText, keyword) {
  if (!fullText) return '';

  const lowerText = fullText.toLowerCase();
  const index = lowerText.indexOf(keyword);

  if (index === -1) return fullText.substring(0, 150) + '...';

  const start = Math.max(0, index - 50);
  const end = Math.min(fullText.length, index + keyword.length + 100);

  let snippet = fullText.substring(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < fullText.length) snippet = snippet + '...';

  return snippet;
}

async function matchReviewsToPages(req, res) {
  // Same as analyze but with more detailed page matching
  return await analyzeReviews(req, res);
}

async function getStatus(req, res) {
  return res.status(200).json({
    success: true,
    status: 'operational',
    name: 'Review Keywords Analyzer',
    version: '1.0.0',
    capabilities: [
      'Fetch Google reviews via Places API',
      'Extract SEO-valuable keywords',
      'Match reviews to service pages',
      'Recommend testimonial placement'
    ],
    servicePages: Object.entries(SERVICE_PAGES).map(([page, config]) => ({
      page,
      name: config.name,
      targetKeywords: config.keywords.length
    })),
    seoKeywordCategories: Object.keys(SEO_KEYWORDS)
  });
}
