/**
 * Weekly SEO Learning Cycle
 * Automated weekly process to:
 * 1. Ingest fresh data from all 4 sites
 * 2. Measure effectiveness of past optimizations
 * 3. Update learning patterns based on results
 * 4. Generate new prioritized recommendations
 * 5. Optionally auto-implement low-risk optimizations
 */

const { SITES, LEARNING_CONFIG } = require('./ruvector-config');

/**
 * Run the complete weekly learning cycle
 */
async function runWeeklyLearningCycle(knowledgeGraph, learningAgent, dataIngestion) {
  console.log('='.repeat(60));
  console.log('[Weekly Cycle] Starting automated SEO learning cycle');
  console.log(`[Weekly Cycle] Timestamp: ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  const cycleResults = {
    startTime: new Date().toISOString(),
    phases: {},
    recommendations: [],
    autoImplemented: [],
    errors: []
  };

  try {
    // Phase 1: Data Ingestion
    console.log('\n[Phase 1] Ingesting fresh data from all sites...');
    cycleResults.phases.ingestion = await dataIngestion.runFullIngestion(knowledgeGraph);
    console.log('[Phase 1] Data ingestion complete');

    // Phase 2: Measure Past Optimizations
    console.log('\n[Phase 2] Measuring effectiveness of past optimizations...');
    cycleResults.phases.measurements = await measurePastOptimizations(knowledgeGraph, learningAgent);
    console.log(`[Phase 2] Measured ${cycleResults.phases.measurements.length} optimizations`);

    // Phase 3: Run Analysis & Update Learning
    console.log('\n[Phase 3] Running analysis and updating learned patterns...');
    cycleResults.phases.analysis = await learningAgent.analyze();
    console.log('[Phase 3] Analysis complete');

    // Phase 4: Generate Recommendations
    console.log('\n[Phase 4] Generating prioritized recommendations...');
    cycleResults.recommendations = cycleResults.phases.analysis.recommendations;
    console.log(`[Phase 4] Generated ${cycleResults.recommendations.length} recommendations`);

    // Phase 5: Auto-implement safe optimizations (optional)
    console.log('\n[Phase 5] Checking for auto-implementable optimizations...');
    cycleResults.autoImplemented = await autoImplementSafeOptimizations(
      knowledgeGraph,
      learningAgent,
      cycleResults.recommendations
    );
    console.log(`[Phase 5] Auto-implemented ${cycleResults.autoImplemented.length} optimizations`);

    // Phase 6: Generate Weekly Report
    console.log('\n[Phase 6] Generating weekly learning report...');
    cycleResults.report = generateWeeklyReport(cycleResults, learningAgent);

  } catch (error) {
    console.error('[Weekly Cycle] Error:', error.message);
    cycleResults.errors.push(error.message);
  }

  cycleResults.endTime = new Date().toISOString();
  cycleResults.duration = new Date(cycleResults.endTime) - new Date(cycleResults.startTime);

  console.log('\n' + '='.repeat(60));
  console.log(`[Weekly Cycle] Complete in ${Math.round(cycleResults.duration / 1000)}s`);
  console.log('='.repeat(60));

  return cycleResults;
}

/**
 * Measure effectiveness of optimizations from 7-14 days ago
 */
async function measurePastOptimizations(knowledgeGraph, learningAgent) {
  const measurements = [];

  // Get optimizations from 7-14 days ago that haven't been measured
  const pendingOptimizations = knowledgeGraph.db?.prepare(`
    SELECT * FROM optimization_history
    WHERE measured_at IS NULL
    AND created_at < datetime('now', '-7 days')
    AND created_at > datetime('now', '-30 days')
  `).all() || [];

  for (const opt of pendingOptimizations) {
    try {
      // Get current metrics for comparison
      const currentMetrics = await getCurrentMetrics(opt.site_id);

      // Measure and update learning
      const result = await learningAgent.measureAction(opt.id, currentMetrics);

      measurements.push({
        optimizationId: opt.id,
        siteId: opt.site_id,
        actionType: opt.action_type,
        success: result.success,
        improvement: result.improvement
      });

      console.log(`  - ${opt.action_type}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    } catch (error) {
      console.error(`  - Failed to measure optimization ${opt.id}: ${error.message}`);
    }
  }

  return measurements;
}

/**
 * Get current metrics for a site
 */
async function getCurrentMetrics(siteId) {
  const site = Object.values(SITES).find(s => s.id === siteId);
  if (!site) return {};

  try {
    const response = await fetch(`${site.url}/api/ga4-analytics?type=overview`);
    const data = await response.json();

    if (data.success && data.data) {
      return {
        sessions: data.data.sessions,
        pageViews: data.data.pageViews,
        bounceRate: data.data.bounceRate
      };
    }
  } catch (error) {
    console.error(`Failed to get metrics for ${siteId}: ${error.message}`);
  }

  return {};
}

/**
 * Auto-implement safe, high-confidence optimizations
 * Only implements changes that are:
 * - Low risk (content updates, not structural changes)
 * - High confidence (>80% from learning)
 * - Previously successful (success rate >70%)
 */
async function autoImplementSafeOptimizations(knowledgeGraph, learningAgent, recommendations) {
  const implemented = [];

  const safeActionTypes = [
    'UPDATE_META',
    'ADD_FAQ',
    'ADD_SCHEMA',
    'ADD_INTERNAL_LINKS'
  ];

  for (const rec of recommendations) {
    // Only auto-implement safe, high-confidence actions
    if (
      safeActionTypes.includes(rec.actionType) &&
      rec.confidence >= 0.8 &&
      rec.successRate >= 0.7
    ) {
      // Record that we're implementing this
      const optimizationId = await learningAgent.recordAction(
        rec.siteId || SITES.main.id,
        rec.actionType,
        rec.details,
        {} // Current metrics will be captured
      );

      implemented.push({
        optimizationId,
        actionType: rec.actionType,
        details: rec.details,
        confidence: rec.confidence
      });

      console.log(`  - Auto-queued: ${rec.actionType} (${Math.round(rec.confidence * 100)}% confidence)`);
    }
  }

  return implemented;
}

/**
 * Generate weekly learning report
 */
function generateWeeklyReport(cycleResults, learningAgent) {
  const stats = learningAgent.getLearningReport();

  return {
    title: 'Weekly SEO Learning Report',
    generatedAt: new Date().toISOString(),
    summary: {
      sitesAnalyzed: Object.keys(SITES).length,
      dataPointsIngested: countDataPoints(cycleResults.phases.ingestion),
      optimizationsMeasured: cycleResults.phases.measurements?.length || 0,
      recommendationsGenerated: cycleResults.recommendations?.length || 0,
      autoImplemented: cycleResults.autoImplemented?.length || 0
    },
    learningProgress: {
      totalPatterns: stats.overallStats.totalPatterns,
      avgConfidence: stats.learningProgress.avgConfidence,
      successRate: stats.learningProgress.successRate,
      improvement: calculateOverallImprovement(cycleResults.phases.measurements)
    },
    topRecommendations: cycleResults.recommendations?.slice(0, 5).map(r => ({
      action: r.actionType,
      priority: r.priority,
      confidence: Math.round((r.confidence || 0) * 100) + '%',
      description: r.details?.description || r.reasoning
    })),
    crossSiteInsights: cycleResults.phases.analysis?.crossSiteInsights || [],
    nextActions: generateNextActions(cycleResults)
  };
}

/**
 * Count total data points ingested
 */
function countDataPoints(ingestionResults) {
  let count = 0;
  if (!ingestionResults) return count;

  for (const site of Object.values(ingestionResults)) {
    if (site.traffic) count += 5;
    if (site.competitors) count += site.competitors.length;
    if (site.rankings) count += site.rankings.length;
    if (site.pages) count += site.pages.length;
    if (site.conversions) count += 5;
  }

  return count;
}

/**
 * Calculate overall improvement from measurements
 */
function calculateOverallImprovement(measurements) {
  if (!measurements || measurements.length === 0) return 'No data yet';

  const successful = measurements.filter(m => m.success).length;
  const rate = (successful / measurements.length * 100).toFixed(1);

  return `${rate}% success rate (${successful}/${measurements.length})`;
}

/**
 * Generate prioritized next actions
 */
function generateNextActions(cycleResults) {
  const actions = [];

  // High priority recommendations
  const highPriority = cycleResults.recommendations?.filter(r => r.priority === 'high' || r.priority === 'critical');
  if (highPriority?.length > 0) {
    actions.push({
      priority: 'high',
      action: `Implement ${highPriority.length} high-priority recommendations`,
      details: highPriority.slice(0, 3).map(r => r.actionType)
    });
  }

  // Auto-implemented follow-ups
  if (cycleResults.autoImplemented?.length > 0) {
    actions.push({
      priority: 'medium',
      action: `Monitor ${cycleResults.autoImplemented.length} auto-implemented changes`,
      details: 'Check in 7-14 days to measure effectiveness'
    });
  }

  // Cross-site coordination
  actions.push({
    priority: 'medium',
    action: 'Ensure microsite content is unique and non-competing',
    details: 'Review keyword targeting across all 4 sites'
  });

  return actions;
}

/**
 * Schedule the weekly cycle (for use with cron or similar)
 */
function scheduleWeeklyCycle(knowledgeGraph, learningAgent, dataIngestion) {
  const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

  // Run immediately on first call
  runWeeklyLearningCycle(knowledgeGraph, learningAgent, dataIngestion);

  // Then schedule weekly
  setInterval(() => {
    runWeeklyLearningCycle(knowledgeGraph, learningAgent, dataIngestion);
  }, WEEK_IN_MS);

  console.log('[Scheduler] Weekly learning cycle scheduled');
}

module.exports = {
  runWeeklyLearningCycle,
  scheduleWeeklyCycle,
  measurePastOptimizations,
  generateWeeklyReport
};
