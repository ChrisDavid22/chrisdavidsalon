/**
 * Knowledge Base Loader for RuVector
 * Loads expert SEO knowledge from JSON files into the learning system
 */

const fs = require('fs');
const path = require('path');

const KNOWLEDGE_BASE_DIR = path.join(__dirname, 'knowledge-base');

/**
 * Load all knowledge base files
 */
async function loadKnowledgeBase() {
  const knowledge = {
    localSEO: null,
    hairSalonSEO: null,
    loaded: false,
    loadedAt: null
  };

  try {
    // Load master local SEO guide
    const masterGuidePath = path.join(KNOWLEDGE_BASE_DIR, 'local-seo-master-guide.json');
    if (fs.existsSync(masterGuidePath)) {
      knowledge.localSEO = JSON.parse(fs.readFileSync(masterGuidePath, 'utf8'));
    }

    // Load hair salon specific guide
    const salonGuidePath = path.join(KNOWLEDGE_BASE_DIR, 'local-seo-hair-salon-strategy.json');
    if (fs.existsSync(salonGuidePath)) {
      knowledge.hairSalonSEO = JSON.parse(fs.readFileSync(salonGuidePath, 'utf8'));
    }

    knowledge.loaded = true;
    knowledge.loadedAt = new Date().toISOString();

    console.log('[KnowledgeBase] Loaded SEO knowledge base successfully');
    return knowledge;

  } catch (error) {
    console.error('[KnowledgeBase] Error loading knowledge base:', error.message);
    return knowledge;
  }
}

/**
 * Get ranking factor weights for a specific channel
 */
function getRankingFactors(knowledge, channel = 'localPack') {
  if (!knowledge.localSEO?.rankingFactorsByChannel?.[channel]) {
    return null;
  }
  return knowledge.localSEO.rankingFactorsByChannel[channel].factors;
}

/**
 * Get GBP optimization checklist
 */
function getGBPChecklist(knowledge) {
  return knowledge.localSEO?.googleBusinessProfile?.optimizationChecklist || null;
}

/**
 * Get review acquisition tactics
 */
function getReviewTactics(knowledge) {
  return knowledge.localSEO?.reviews?.acquisitionTactics || null;
}

/**
 * Get citation building strategy
 */
function getCitationStrategy(knowledge) {
  return knowledge.localSEO?.citations || null;
}

/**
 * Get link building strategies
 */
function getLinkBuildingStrategies(knowledge) {
  return knowledge.localSEO?.linkBuilding?.strategies || null;
}

/**
 * Get on-page optimization requirements
 */
function getOnPageRequirements(knowledge) {
  return knowledge.localSEO?.onPageOptimization || null;
}

/**
 * Get competitive analysis framework
 */
function getCompetitiveFramework(knowledge) {
  return knowledge.localSEO?.competitiveAnalysis || null;
}

/**
 * Get timeline expectations
 */
function getTimeline(knowledge) {
  return knowledge.localSEO?.timeline || null;
}

/**
 * Get key metrics and targets
 */
function getKeyMetrics(knowledge) {
  return knowledge.hairSalonSEO?.keyMetrics || knowledge.localSEO?.kpis || null;
}

/**
 * Get weekly maintenance checklist
 */
function getWeeklyChecklist(knowledge) {
  return knowledge.localSEO?.weeklyMaintenanceChecklist || null;
}

/**
 * Generate recommendations based on knowledge base and current state
 */
function generateKnowledgeBasedRecommendations(knowledge, currentState) {
  const recommendations = [];

  if (!knowledge.loaded) {
    return recommendations;
  }

  const targets = knowledge.localSEO?.reviews?.targets || {};
  const currentReviews = currentState?.reviews || 0;
  const currentRating = currentState?.rating || 0;

  // Review recommendations
  if (currentReviews < (targets.minimum || 50)) {
    recommendations.push({
      type: 'LOCAL',
      priority: 'HIGH',
      action: `Increase Google reviews to ${targets.minimum || 50}+`,
      reason: `Current: ${currentReviews}, Target: ${targets.minimum || 50}`,
      confidence: 0.92,
      tactics: knowledge.localSEO?.reviews?.acquisitionTactics || []
    });
  }

  // GBP optimization
  const gbpFactors = knowledge.localSEO?.googleBusinessProfile?.topRankingFactors;
  if (gbpFactors) {
    recommendations.push({
      type: 'GBP',
      priority: 'HIGH',
      action: 'Audit Google Business Profile against top ranking factors',
      reason: 'GBP accounts for 32% of local pack rankings',
      confidence: 0.95,
      factors: gbpFactors
    });
  }

  // Content recommendations
  const contentStrategy = knowledge.localSEO?.onPageOptimization?.contentStrategy;
  if (contentStrategy) {
    recommendations.push({
      type: 'CONTENT',
      priority: 'MEDIUM',
      action: 'Create dedicated service pages for all services',
      reason: 'On-page optimization accounts for 15% of local pack rankings',
      confidence: 0.85,
      requirements: contentStrategy.servicePages
    });
  }

  // Link building
  if (currentState?.pageRank < 3.0) {
    const linkStrategies = knowledge.localSEO?.linkBuilding?.strategies;
    if (linkStrategies) {
      recommendations.push({
        type: 'AUTHORITY',
        priority: 'MEDIUM',
        action: 'Build local backlinks to improve authority',
        reason: `Current PageRank (${currentState?.pageRank || 0}) is below competitive threshold (3.0)`,
        confidence: 0.78,
        strategies: linkStrategies
      });
    }
  }

  // Citation audit
  const citationStrategy = knowledge.localSEO?.citations;
  if (citationStrategy) {
    recommendations.push({
      type: 'CITATIONS',
      priority: 'MEDIUM',
      action: 'Audit and build citations on top directories',
      reason: 'Consistent NAP makes businesses 40% more likely to appear in local pack',
      confidence: 0.82,
      directories: citationStrategy.topDirectories
    });
  }

  return recommendations;
}

/**
 * Get action plan for specific timeframe
 */
function getActionPlan(knowledge, timeframe) {
  const actionPlan = knowledge.hairSalonSEO?.actionPlan || {};

  switch (timeframe) {
    case 'week1-2':
      return actionPlan['week1-2'] || [];
    case 'week3-4':
      return actionPlan['week3-4'] || [];
    case 'month2':
      return actionPlan['month2'] || [];
    case 'month3-6':
      return actionPlan['month3-6'] || [];
    default:
      return actionPlan;
  }
}

module.exports = {
  loadKnowledgeBase,
  getRankingFactors,
  getGBPChecklist,
  getReviewTactics,
  getCitationStrategy,
  getLinkBuildingStrategies,
  getOnPageRequirements,
  getCompetitiveFramework,
  getTimeline,
  getKeyMetrics,
  getWeeklyChecklist,
  generateKnowledgeBasedRecommendations,
  getActionPlan
};
