/**
 * SEO Learning API
 * Exposes the self-learning SEO system via REST endpoints
 */

const path = require('path');

// Initialize on first request
let knowledgeGraph = null;
let learningAgent = null;
let dataIngestion = null;
let initialized = false;

async function initializeSystem() {
  if (initialized) return;

  try {
    const KnowledgeGraph = require('../lib/seo-learning/seo-knowledge-graph');
    const SEOLearningAgent = require('../lib/seo-learning/learning-agent');
    const DataIngestion = require('../lib/seo-learning/data-ingestion');

    knowledgeGraph = KnowledgeGraph;
    await knowledgeGraph.initialize();

    learningAgent = new SEOLearningAgent(knowledgeGraph);
    dataIngestion = DataIngestion;

    initialized = true;
    console.log('[SEO-Learning API] System initialized');
  } catch (error) {
    console.error('[SEO-Learning API] Initialization failed:', error.message);
    throw error;
  }
}

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    // Initialize on first request
    await initializeSystem();

    switch (action) {
      case 'status':
        return res.json({
          success: true,
          status: 'operational',
          initialized,
          stats: knowledgeGraph.getLearningStats(),
          timestamp: new Date().toISOString()
        });

      case 'ingest':
        // Run full data ingestion
        const ingestionResults = await dataIngestion.runFullIngestion(knowledgeGraph);
        return res.json({
          success: true,
          action: 'ingest',
          results: ingestionResults,
          timestamp: new Date().toISOString()
        });

      case 'ingest-incremental':
        // Run incremental ingestion
        const siteId = req.query.site || null;
        const incrementalResults = await dataIngestion.runIncrementalIngestion(knowledgeGraph, siteId);
        return res.json({
          success: true,
          action: 'ingest-incremental',
          results: incrementalResults,
          timestamp: new Date().toISOString()
        });

      case 'analyze':
        // Run full analysis
        const analysis = await learningAgent.analyze();
        return res.json({
          success: true,
          action: 'analyze',
          analysis,
          timestamp: new Date().toISOString()
        });

      case 'recommendations':
        // Get current recommendations
        const fullAnalysis = await learningAgent.analyze();
        return res.json({
          success: true,
          action: 'recommendations',
          recommendations: fullAnalysis.recommendations,
          crossSiteInsights: fullAnalysis.crossSiteInsights,
          learningStats: fullAnalysis.learningStats,
          timestamp: new Date().toISOString()
        });

      case 'record-action':
        // Record an optimization action for learning
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'POST required for record-action' });
        }
        const { siteId: actionSiteId, actionType, actionDetails, currentMetrics } = req.body;
        const optimizationId = await learningAgent.recordAction(
          actionSiteId,
          actionType,
          actionDetails,
          currentMetrics
        );
        return res.json({
          success: true,
          action: 'record-action',
          optimizationId,
          message: 'Action recorded. Measure effectiveness after 7-14 days.',
          timestamp: new Date().toISOString()
        });

      case 'measure-action':
        // Measure effectiveness of a recorded action
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'POST required for measure-action' });
        }
        const { optimizationId: measuredId, newMetrics } = req.body;
        const measureResult = await learningAgent.measureAction(measuredId, newMetrics);
        return res.json({
          success: true,
          action: 'measure-action',
          result: measureResult,
          timestamp: new Date().toISOString()
        });

      case 'learning-report':
        // Get learning progress report
        const report = learningAgent.getLearningReport();
        return res.json({
          success: true,
          action: 'learning-report',
          report,
          timestamp: new Date().toISOString()
        });

      case 'export-graph':
        // Export the entire knowledge graph
        const graph = knowledgeGraph.exportGraph();
        return res.json({
          success: true,
          action: 'export-graph',
          graph,
          timestamp: new Date().toISOString()
        });

      case 'query':
        // Run a custom Cypher-like query
        const { q } = req.query;
        if (!q) {
          return res.status(400).json({ error: 'Query parameter "q" required' });
        }
        const queryResults = await knowledgeGraph.query(decodeURIComponent(q));
        return res.json({
          success: true,
          action: 'query',
          results: queryResults,
          timestamp: new Date().toISOString()
        });

      default:
        return res.json({
          success: true,
          message: 'SEO Learning API',
          availableActions: [
            'status - Check system status and stats',
            'ingest - Run full data ingestion from all APIs',
            'ingest-incremental - Run incremental data update',
            'analyze - Run full SEO analysis',
            'recommendations - Get prioritized recommendations',
            'record-action - Record an optimization for learning (POST)',
            'measure-action - Measure action effectiveness (POST)',
            'learning-report - Get learning progress report',
            'export-graph - Export the knowledge graph',
            'query - Run a Cypher-like query (?q=...)'
          ],
          sites: ['chrisdavidsalon', 'bestsalondelray', 'bestdelraysalon', 'bestsalonpalmbeach'],
          timestamp: new Date().toISOString()
        });
    }

  } catch (error) {
    console.error('[SEO-Learning API] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
