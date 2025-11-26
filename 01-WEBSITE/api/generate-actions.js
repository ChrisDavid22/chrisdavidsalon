/**
 * Generate Actions API
 *
 * Analyzes current data and generates 3 prioritized weekly action items
 * Each action includes: title, why, how, time estimate, expected impact
 *
 * This is the "brain" that turns data into actionable tasks
 */

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Gather data from multiple sources in parallel
        const [competitorData, authorityData, trafficData] = await Promise.allSettled([
            fetchCompetitorData(),
            fetchAuthorityData(),
            fetchTrafficData()
        ]);

        // Extract data from settled promises
        const competitors = competitorData.status === 'fulfilled' ? competitorData.value : null;
        const authority = authorityData.status === 'fulfilled' ? authorityData.value : null;
        const traffic = trafficData.status === 'fulfilled' ? trafficData.value : null;

        // Generate actions based on data analysis
        const actions = generateActions(competitors, authority, traffic);

        return res.status(200).json({
            success: true,
            generated: new Date().toISOString(),
            dataSourcesUsed: {
                competitors: competitorData.status === 'fulfilled',
                authority: authorityData.status === 'fulfilled',
                traffic: trafficData.status === 'fulfilled'
            },
            actions: actions
        });

    } catch (error) {
        console.error('Generate actions error:', error);

        // Return default actions on error
        return res.status(200).json({
            success: true,
            generated: new Date().toISOString(),
            fallback: true,
            actions: getDefaultActions()
        });
    }
}

// Fetch competitor data
async function fetchCompetitorData() {
    const response = await fetch('https://www.chrisdavidsalon.com/api/competitors');
    if (!response.ok) throw new Error('Competitors API failed');
    return await response.json();
}

// Fetch authority data
async function fetchAuthorityData() {
    const response = await fetch('https://www.chrisdavidsalon.com/api/authority');
    if (!response.ok) throw new Error('Authority API failed');
    return await response.json();
}

// Fetch traffic data
async function fetchTrafficData() {
    const response = await fetch('https://www.chrisdavidsalon.com/api/ga4-analytics?type=overview');
    if (!response.ok) throw new Error('Traffic API failed');
    return await response.json();
}

// Generate actions based on data analysis
function generateActions(competitors, authority, traffic) {
    const actions = [];

    // PRIORITY 1: Reviews (always important for local SEO)
    if (competitors?.data?.competitors) {
        const chrisDavid = competitors.data.competitors.find(c =>
            c.isOurSalon || (c.name || '').toLowerCase().includes('chris david')
        );
        const topCompetitor = competitors.data.competitors.find(c =>
            !c.isOurSalon && c.reviews > (chrisDavid?.reviews || 0)
        );

        if (chrisDavid && topCompetitor) {
            const reviewGap = topCompetitor.reviews - chrisDavid.reviews;
            if (reviewGap > 0) {
                actions.push({
                    title: `Ask ${Math.min(3, Math.ceil(reviewGap / 100))} clients for Google reviews`,
                    why: `You're ${reviewGap} reviews behind ${topCompetitor.name}. Reviews are the #1 factor in local Google ranking.`,
                    how: `Text your happiest clients from this week: "Hi! If you loved your visit, would you mind leaving us a Google review? Here's the link: [your link]"`,
                    time: '5 minutes',
                    impact: `+${Math.min(10, Math.ceil(reviewGap / 50))}% local visibility`,
                    link: 'https://search.google.com/local/writereview?placeid=ChIJxTZ8If_f2IgR2XMxX_zRKSg',
                    linkText: 'Get your review link',
                    priority: 'high',
                    category: 'reviews'
                });
            }
        }
    }

    // PRIORITY 2: Google Business Profile activity
    actions.push({
        title: 'Post a before/after photo to Google Business',
        why: 'Google Business posts increase your visibility by 15-20%. Fresh content shows Google you\'re active.',
        how: 'Open Google Business Profile → Click "Add Update" → Upload a great before/after transformation photo with a caption about the service.',
        time: '10 minutes',
        impact: '+15% profile views',
        link: 'https://business.google.com',
        linkText: 'Open Google Business',
        priority: 'medium',
        category: 'gbp'
    });

    // PRIORITY 3: Review responses
    actions.push({
        title: 'Respond to your recent Google reviews',
        why: 'Response rate is a ranking factor. Responding shows you care and builds trust with potential clients.',
        how: 'Check your Google reviews. Reply to new ones with a genuine thank you. For negative reviews, respond professionally and offer to make it right.',
        time: '5 minutes',
        impact: '+10% trust score',
        link: 'https://business.google.com',
        linkText: 'View your reviews',
        priority: 'medium',
        category: 'reviews'
    });

    // PRIORITY 4: Authority building (if authority is low)
    if (authority?.data?.authority_score && authority.data.authority_score < 40) {
        actions.push({
            title: 'Get listed on a local business directory',
            why: `Your domain authority is ${authority.data.authority_score}/100. Local directory listings build authority and backlinks.`,
            how: 'Claim or update your listing on Yelp, Yellow Pages, or the Delray Beach Chamber of Commerce. Make sure NAP (Name, Address, Phone) matches your website exactly.',
            time: '15 minutes',
            impact: '+5 authority points',
            link: 'https://biz.yelp.com',
            linkText: 'Claim on Yelp',
            priority: 'low',
            category: 'authority'
        });
    }

    // Return top 3 actions
    return actions.slice(0, 3);
}

// Default actions when data isn't available
function getDefaultActions() {
    return [
        {
            title: 'Ask 3 clients for Google reviews',
            why: 'Reviews directly impact your Google ranking and build trust with potential clients.',
            how: 'Text your 3 happiest clients from this week with your Google review link.',
            time: '5 minutes',
            impact: '+8% local visibility',
            link: 'https://search.google.com/local/writereview?placeid=ChIJxTZ8If_f2IgR2XMxX_zRKSg',
            linkText: 'Copy review link',
            priority: 'high',
            category: 'reviews'
        },
        {
            title: 'Post a before/after photo to Google Business',
            why: 'GBP posts increase visibility 15-20% and showcase your work to potential clients.',
            how: 'Open Google Business Profile → Posts → Add a new post with your best recent transformation.',
            time: '10 minutes',
            impact: '+15% profile views',
            link: 'https://business.google.com',
            linkText: 'Open Google Business',
            priority: 'medium',
            category: 'gbp'
        },
        {
            title: 'Respond to your recent Google reviews',
            why: 'Response rate affects ranking and shows potential clients you care.',
            how: 'Check Google reviews and respond to any new ones with a personal thank you.',
            time: '5 minutes',
            impact: '+10% trust score',
            link: 'https://business.google.com',
            linkText: 'View reviews',
            priority: 'medium',
            category: 'reviews'
        }
    ];
}
