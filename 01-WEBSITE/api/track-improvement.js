/**
 * Track Improvement API
 *
 * Records SEO improvement actions and measures their effectiveness
 *
 * Actions:
 * - log: Record an action taken
 * - status: Get current metrics + compare to baseline
 * - history: Get all tracked actions
 * - measure: Re-measure metrics to calculate impact
 */

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const action = req.query.action || 'status';

    try {
        switch (action) {
            case 'status':
                return await getStatus(req, res);
            case 'log':
                return await logAction(req, res);
            case 'history':
                return await getHistory(req, res);
            case 'measure':
                return await measureProgress(req, res);
            default:
                return res.status(400).json({ error: 'Unknown action' });
        }
    } catch (error) {
        console.error('Track improvement error:', error);
        return res.status(500).json({ error: error.message });
    }
}

// Get current status with all metrics
async function getStatus(req, res) {
    const metrics = await fetchCurrentMetrics();

    return res.status(200).json({
        success: true,
        timestamp: new Date().toISOString(),
        metrics: metrics,
        recommendations: generateRecommendations(metrics)
    });
}

// Log an improvement action
async function logAction(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'POST required' });
    }

    const { taskId, category, action, notes } = req.body;

    // Get current metrics as "before" snapshot
    const beforeMetrics = await fetchCurrentMetrics();

    const logEntry = {
        id: `action-${Date.now()}`,
        timestamp: new Date().toISOString(),
        taskId,
        category,
        action,
        notes,
        beforeMetrics,
        afterMetrics: null, // Will be filled in by measure action
        impact: null
    };

    // In production, this would save to a database
    // For now, we return it for client-side storage
    return res.status(200).json({
        success: true,
        logged: logEntry,
        message: `Action logged. Check back in 7 days to measure impact.`
    });
}

// Get action history
async function getHistory(req, res) {
    // In production, this would fetch from database
    // For now, return instruction for client-side storage
    return res.status(200).json({
        success: true,
        message: 'History is stored locally. Check localStorage.',
        storageKey: 'seoImprovementTracker'
    });
}

// Measure progress since baseline
async function measureProgress(req, res) {
    const baseline = req.body?.baseline || req.query.baseline;
    const currentMetrics = await fetchCurrentMetrics();

    if (!baseline) {
        return res.status(200).json({
            success: true,
            current: currentMetrics,
            baseline: null,
            message: 'No baseline provided. Current metrics returned.'
        });
    }

    const baselineData = typeof baseline === 'string' ? JSON.parse(baseline) : baseline;

    // Calculate changes
    const changes = {
        reviews: {
            before: baselineData.reviews || 0,
            after: currentMetrics.reviews || 0,
            change: (currentMetrics.reviews || 0) - (baselineData.reviews || 0)
        },
        rating: {
            before: baselineData.rating || 0,
            after: currentMetrics.rating || 0,
            change: ((currentMetrics.rating || 0) - (baselineData.rating || 0)).toFixed(1)
        },
        rank: {
            before: baselineData.rank || 0,
            after: currentMetrics.rank || 0,
            change: (baselineData.rank || 0) - (currentMetrics.rank || 0) // Positive = improved
        },
        sessions: {
            before: baselineData.sessions || 0,
            after: currentMetrics.sessions || 0,
            change: (currentMetrics.sessions || 0) - (baselineData.sessions || 0),
            percentChange: baselineData.sessions
                ? (((currentMetrics.sessions - baselineData.sessions) / baselineData.sessions) * 100).toFixed(1)
                : 0
        }
    };

    return res.status(200).json({
        success: true,
        baseline: baselineData,
        current: currentMetrics,
        changes: changes,
        summary: generateSummary(changes)
    });
}

// Fetch current metrics from various APIs
async function fetchCurrentMetrics() {
    try {
        const [compResponse, trafficResponse] = await Promise.all([
            fetch('https://www.chrisdavidsalon.com/api/admin-data?type=competitors'),
            fetch('https://www.chrisdavidsalon.com/api/ga4-analytics?type=overview')
        ]);

        const compResult = await compResponse.json();
        const trafficResult = await trafficResponse.json();

        // Find Chris David and calculate rank
        const competitors = compResult.data?.competitors || [];
        competitors.sort((a, b) => b.reviews - a.reviews);
        const chrisDavidIndex = competitors.findIndex(c =>
            c.isOurSalon || c.name.toLowerCase().includes('chris david')
        );
        const chrisDavid = competitors[chrisDavidIndex];

        return {
            reviews: chrisDavid?.reviews || 0,
            rating: chrisDavid?.rating || 0,
            rank: chrisDavidIndex + 1,
            totalCompetitors: competitors.length,
            sessions: trafficResult.data?.sessions || 0,
            activeUsers: trafficResult.data?.activeUsers || 0,
            bounceRate: trafficResult.data?.bounceRate || 0,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Failed to fetch metrics:', error);
        return {
            error: 'Failed to fetch metrics',
            timestamp: new Date().toISOString()
        };
    }
}

// Generate recommendations based on metrics
function generateRecommendations(metrics) {
    const recs = [];

    if (metrics.reviews < 200) {
        recs.push({
            priority: 'high',
            category: 'reviews',
            title: 'Focus on getting more Google reviews',
            reason: `You have ${metrics.reviews} reviews. Top competitors have 500+.`,
            action: 'Ask every happy client for a review this week'
        });
    }

    if (metrics.rank > 5) {
        recs.push({
            priority: 'high',
            category: 'ranking',
            title: `Move up from position #${metrics.rank}`,
            reason: `You're ranked #${metrics.rank} out of ${metrics.totalCompetitors} salons`,
            action: 'Reviews are the #1 factor in local ranking'
        });
    }

    if (metrics.bounceRate > 70) {
        recs.push({
            priority: 'medium',
            category: 'website',
            title: 'Reduce bounce rate',
            reason: `${metrics.bounceRate}% of visitors leave without engaging`,
            action: 'Improve page load speed and add compelling CTAs'
        });
    }

    return recs;
}

// Generate summary of changes
function generateSummary(changes) {
    const parts = [];

    if (changes.reviews.change > 0) {
        parts.push(`Gained ${changes.reviews.change} reviews`);
    }

    if (changes.rank.change > 0) {
        parts.push(`Moved up ${changes.rank.change} positions`);
    } else if (changes.rank.change < 0) {
        parts.push(`Dropped ${Math.abs(changes.rank.change)} positions`);
    }

    if (changes.sessions.percentChange > 0) {
        parts.push(`Traffic up ${changes.sessions.percentChange}%`);
    }

    return parts.length > 0 ? parts.join('. ') + '.' : 'No significant changes yet.';
}
