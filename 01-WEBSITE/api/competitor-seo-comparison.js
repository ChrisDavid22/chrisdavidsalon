/**
 * Competitor SEO Comparison API
 *
 * Compares SEO scores across all competitors using available data:
 * - PageRank (Authority) from OpenPageRank API
 * - Local SEO (Reviews + Rating) from Google Places API
 * - Estimated overall score based on available factors
 */

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Fetch both data sources in parallel
        const [authorityResponse, placesResponse] = await Promise.all([
            fetch('https://www.chrisdavidsalon.com/api/authority-score?competitors=true'),
            fetch('https://www.chrisdavidsalon.com/api/admin-data?type=competitors')
        ]);

        const authorityData = await authorityResponse.json();
        const placesData = await placesResponse.json();

        // Build PageRank lookup by domain
        const pageRankMap = {};
        if (authorityData.success && authorityData.data?.all_results) {
            authorityData.data.all_results.forEach(item => {
                pageRankMap[item.domain.toLowerCase()] = {
                    pagerank: item.pagerank || 0,
                    pagerank_decimal: item.pagerank_decimal || 0
                };
            });
        }

        // Domain mapping for salons (salon name to likely domain)
        const domainMap = {
            'rové hair salon': 'rovesalon.com',
            'studio 34 delray hair': 'studio34delray.com',
            'kaan hair design': 'kaanhairdesign.com',
            'salon south flow': 'salonsouthflow.com',
            'one aveda salon': 'onesalondelray.com',
            'bond street salon': 'bondstreetsalon.com',
            'shearluck salon': 'slshair.com',
            'amanda major': 'amandamajor.com',
            'chris david salon': 'chrisdavidsalon.com',
            'breeze salon': 'breezesalondelray.com',
            'exquiste hair studio': 'exquisitehair.com',
            'lmbue salon': 'imbuesalon.com',
            'imbue salon': 'imbuesalon.com'
        };

        // Calculate SEO scores for each competitor
        const competitors = [];

        if (placesData.success && placesData.data?.competitors) {
            placesData.data.competitors.forEach(salon => {
                const name = salon.name || '';
                const rating = salon.rating || 0;
                const reviews = salon.reviews || 0;

                // Calculate Local SEO score (same formula as dashboard)
                // Rating: (rating * 10) = 0-50 points
                // Reviews: min(log10(reviews) * 15, 40) = 0-40 points
                // Presence: 10 points for Google Places listing
                const ratingScore = rating * 10;
                const reviewScore = reviews > 0 ? Math.min(Math.log10(reviews) * 15, 40) : 0;
                const presenceBonus = salon.placeId ? 10 : 0;
                const localSEO = Math.round(ratingScore + reviewScore + presenceBonus);

                // Find PageRank for this salon
                let authority = 0;
                let pagerank_decimal = 0;
                let domain = null;

                // Try to match domain
                const nameLower = name.toLowerCase();
                for (const [key, dom] of Object.entries(domainMap)) {
                    if (nameLower.includes(key)) {
                        domain = dom;
                        break;
                    }
                }

                if (domain && pageRankMap[domain]) {
                    pagerank_decimal = pageRankMap[domain].pagerank_decimal;
                    // Convert PageRank (0-10) to Authority score (0-100)
                    authority = Math.round(pagerank_decimal * 10);
                }

                // Calculate estimated overall SEO score
                // We can't get Performance/Technical/Mobile without running PageSpeed on each site
                // So we estimate based on what we have:
                // - Local SEO: 40% weight (we have this accurately)
                // - Authority: 20% weight (we have this)
                // - Estimated Technical/Performance: 40% weight (assume average 70 for established salons)
                const estimatedTechnical = 70; // Conservative estimate
                const overallScore = Math.round(
                    localSEO * 0.40 +
                    authority * 0.20 +
                    estimatedTechnical * 0.40
                );

                competitors.push({
                    name,
                    domain,
                    rating,
                    reviews,
                    localSEO,
                    authority,
                    pagerank_decimal,
                    estimatedOverall: overallScore,
                    isChrisDavid: salon.isOurSalon || nameLower.includes('chris david')
                });
            });
        }

        // Sort by estimated overall score
        competitors.sort((a, b) => b.estimatedOverall - a.estimatedOverall);

        // Add rank
        competitors.forEach((c, i) => {
            c.rank = i + 1;
        });

        // Find Chris David's position
        const chrisDavid = competitors.find(c => c.isChrisDavid);
        const chrisDavidRank = chrisDavid?.rank || null;

        return res.status(200).json({
            success: true,
            live: true,
            source: 'OpenPageRank + Google Places APIs',
            timestamp: new Date().toISOString(),
            data: {
                competitors,
                chrisDavidRank,
                totalCompetitors: competitors.length,
                methodology: {
                    localSEO: 'Rating (0-50) + log10(Reviews)*15 (0-40) + Presence (10)',
                    authority: 'PageRank * 10',
                    estimatedOverall: '40% Local SEO + 20% Authority + 40% Estimated Technical (70)',
                    note: 'Full PageSpeed analysis requires individual API calls per domain (rate limited)'
                }
            }
        });

    } catch (error) {
        console.error('Competitor SEO comparison error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
