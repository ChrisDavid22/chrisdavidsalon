/**
 * SEO Knowledge Graph
 * Uses RuVector for self-learning SEO optimization
 *
 * This module builds and maintains a knowledge graph that:
 * 1. Stores relationships between keywords, pages, rankings, and conversions
 * 2. Learns which optimizations lead to better outcomes
 * 3. Recommends actions based on learned patterns
 * 4. Tracks effectiveness of implemented changes
 */

const { SITES, NODE_TYPES, RELATIONSHIP_TYPES, LEARNING_CONFIG, TRACKED_METRICS } = require('./ruvector-config');

// RuVector will be initialized when available
let ruvector = null;
let db = null;

/**
 * Initialize the SEO Knowledge Graph
 */
async function initialize() {
  try {
    // Try to load RuVector
    const RuVector = require('ruvector');
    ruvector = new RuVector({
      path: './data/seo-knowledge.rv',
      dimensions: 1024,
      metric: 'cosine',
      gnn: {
        enabled: true,
        layers: LEARNING_CONFIG.gnn.layers,
        hiddenDim: LEARNING_CONFIG.gnn.hiddenDim,
        attentionHeads: LEARNING_CONFIG.gnn.attentionHeads
      },
      compression: {
        adaptive: true,
        tiers: LEARNING_CONFIG.memoryTiers
      }
    });

    await ruvector.initialize();
    console.log('[SEO-KG] RuVector initialized successfully');

    // Create collections for each node type
    for (const nodeType of Object.values(NODE_TYPES)) {
      await ruvector.createCollection(nodeType, {
        dimensions: 1024,
        metric: 'cosine'
      });
    }

    console.log('[SEO-KG] Collections created');
    return { success: true, engine: 'ruvector' };

  } catch (error) {
    console.log('[SEO-KG] RuVector not available, using SQLite fallback');
    // Fallback to SQLite-based storage
    const Database = require('better-sqlite3');
    db = new Database('./data/seo-knowledge.db');
    await initializeSQLiteFallback();
    return { success: true, engine: 'sqlite' };
  }
}

/**
 * SQLite fallback schema for when RuVector isn't available
 */
async function initializeSQLiteFallback() {
  db.exec(`
    -- Nodes table
    CREATE TABLE IF NOT EXISTS nodes (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      data TEXT NOT NULL,
      embedding TEXT,
      confidence REAL DEFAULT 0.5,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Relationships table
    CREATE TABLE IF NOT EXISTS relationships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      type TEXT NOT NULL,
      weight REAL DEFAULT 1.0,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (source_id) REFERENCES nodes(id),
      FOREIGN KEY (target_id) REFERENCES nodes(id)
    );

    -- Learning patterns table
    CREATE TABLE IF NOT EXISTS patterns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pattern_type TEXT NOT NULL,
      description TEXT,
      conditions TEXT NOT NULL,
      action TEXT NOT NULL,
      success_count INTEGER DEFAULT 0,
      failure_count INTEGER DEFAULT 0,
      confidence REAL DEFAULT 0.5,
      last_used DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Optimization history table
    CREATE TABLE IF NOT EXISTS optimization_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id TEXT NOT NULL,
      action_type TEXT NOT NULL,
      action_details TEXT NOT NULL,
      metrics_before TEXT,
      metrics_after TEXT,
      success INTEGER,
      learned_pattern_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      measured_at DATETIME,
      FOREIGN KEY (learned_pattern_id) REFERENCES patterns(id)
    );

    -- Metrics snapshots table
    CREATE TABLE IF NOT EXISTS metrics_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id TEXT NOT NULL,
      metric_type TEXT NOT NULL,
      metric_name TEXT NOT NULL,
      value REAL,
      metadata TEXT,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_nodes_type ON nodes(type);
    CREATE INDEX IF NOT EXISTS idx_relationships_source ON relationships(source_id);
    CREATE INDEX IF NOT EXISTS idx_relationships_target ON relationships(target_id);
    CREATE INDEX IF NOT EXISTS idx_patterns_type ON patterns(pattern_type);
    CREATE INDEX IF NOT EXISTS idx_metrics_site ON metrics_snapshots(site_id, metric_type);
  `);

  console.log('[SEO-KG] SQLite fallback initialized');
}

/**
 * Add a node to the knowledge graph
 */
async function addNode(type, id, data) {
  const nodeId = `${type}:${id}`;

  if (ruvector) {
    await ruvector.upsert(type, {
      id: nodeId,
      data: data,
      metadata: {
        type,
        createdAt: new Date().toISOString()
      }
    });
  } else {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO nodes (id, type, data, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(nodeId, type, JSON.stringify(data));
  }

  return nodeId;
}

/**
 * Add a relationship between nodes
 */
async function addRelationship(sourceId, targetId, type, metadata = {}) {
  if (ruvector) {
    await ruvector.addEdge(sourceId, targetId, {
      type,
      weight: metadata.weight || 1.0,
      ...metadata
    });
  } else {
    const stmt = db.prepare(`
      INSERT INTO relationships (source_id, target_id, type, weight, metadata)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(sourceId, targetId, type, metadata.weight || 1.0, JSON.stringify(metadata));
  }
}

/**
 * Record a metrics snapshot
 */
async function recordMetrics(siteId, metricType, metrics) {
  const timestamp = new Date().toISOString();

  for (const [name, value] of Object.entries(metrics)) {
    if (ruvector) {
      await addNode('metric', `${siteId}:${metricType}:${name}:${timestamp}`, {
        siteId,
        metricType,
        name,
        value,
        timestamp
      });
    } else {
      const stmt = db.prepare(`
        INSERT INTO metrics_snapshots (site_id, metric_type, metric_name, value)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run(siteId, metricType, name, value);
    }
  }
}

/**
 * Record an optimization action for learning
 */
async function recordOptimization(siteId, actionType, actionDetails, metricsBefore) {
  const stmt = db.prepare(`
    INSERT INTO optimization_history (site_id, action_type, action_details, metrics_before)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(siteId, actionType, JSON.stringify(actionDetails), JSON.stringify(metricsBefore));
  return result.lastInsertRowid;
}

/**
 * Measure optimization effectiveness and update learning
 */
async function measureOptimizationEffect(optimizationId, metricsAfter) {
  const optimization = db.prepare(`
    SELECT * FROM optimization_history WHERE id = ?
  `).get(optimizationId);

  if (!optimization) return null;

  const metricsBefore = JSON.parse(optimization.metrics_before);
  const success = calculateSuccess(metricsBefore, metricsAfter);

  // Update optimization record
  db.prepare(`
    UPDATE optimization_history
    SET metrics_after = ?, success = ?, measured_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(JSON.stringify(metricsAfter), success ? 1 : 0, optimizationId);

  // Update or create learning pattern
  await updateLearningPattern(optimization.action_type, optimization.action_details, success);

  return { success, improvement: calculateImprovement(metricsBefore, metricsAfter) };
}

/**
 * Calculate if an optimization was successful
 */
function calculateSuccess(before, after) {
  let improvements = 0;
  let total = 0;

  // Check traffic improvements
  if (before.sessions && after.sessions) {
    total++;
    if (after.sessions > before.sessions) improvements++;
  }

  // Check ranking improvements
  if (before.position && after.position) {
    total++;
    if (after.position < before.position) improvements++; // Lower position is better
  }

  // Check conversion improvements
  if (before.bookingClicks !== undefined && after.bookingClicks !== undefined) {
    total++;
    if (after.bookingClicks > before.bookingClicks) improvements++;
  }

  return total > 0 && (improvements / total) >= 0.5;
}

/**
 * Calculate percentage improvement
 */
function calculateImprovement(before, after) {
  const improvements = {};

  for (const key of Object.keys(after)) {
    if (before[key] !== undefined && before[key] !== 0) {
      const change = ((after[key] - before[key]) / Math.abs(before[key])) * 100;
      improvements[key] = Math.round(change * 10) / 10;
    }
  }

  return improvements;
}

/**
 * Update learning patterns based on optimization results
 */
async function updateLearningPattern(actionType, actionDetails, success) {
  const conditionsKey = JSON.stringify({ actionType, ...actionDetails });

  // Check if pattern exists
  let pattern = db.prepare(`
    SELECT * FROM patterns WHERE conditions = ?
  `).get(conditionsKey);

  if (pattern) {
    // Update existing pattern
    const newSuccessCount = pattern.success_count + (success ? 1 : 0);
    const newFailureCount = pattern.failure_count + (success ? 0 : 1);
    const totalAttempts = newSuccessCount + newFailureCount;
    const newConfidence = newSuccessCount / totalAttempts;

    db.prepare(`
      UPDATE patterns
      SET success_count = ?, failure_count = ?, confidence = ?, last_used = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newSuccessCount, newFailureCount, newConfidence, pattern.id);
  } else {
    // Create new pattern
    db.prepare(`
      INSERT INTO patterns (pattern_type, conditions, action, success_count, failure_count, confidence)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      actionType,
      conditionsKey,
      JSON.stringify(actionDetails),
      success ? 1 : 0,
      success ? 0 : 1,
      success ? LEARNING_CONFIG.confidence.learningBoost + 0.5 : 0.5 + LEARNING_CONFIG.confidence.learningPenalty
    );
  }
}

/**
 * Get recommended actions based on learned patterns
 */
async function getRecommendations(siteId, currentMetrics) {
  // Get high-confidence patterns
  const patterns = db.prepare(`
    SELECT * FROM patterns
    WHERE confidence >= ?
    ORDER BY confidence DESC, success_count DESC
    LIMIT 10
  `).all(LEARNING_CONFIG.confidence.actionThreshold);

  // Get recent optimization history to avoid repeating
  const recentActions = db.prepare(`
    SELECT action_type, action_details FROM optimization_history
    WHERE site_id = ? AND created_at > datetime('now', '-7 days')
  `).all(siteId);

  const recentActionKeys = new Set(recentActions.map(a => `${a.action_type}:${a.action_details}`));

  // Filter and rank recommendations
  const recommendations = patterns
    .filter(p => !recentActionKeys.has(`${p.pattern_type}:${p.action}`))
    .map(p => ({
      actionType: p.pattern_type,
      action: JSON.parse(p.action),
      confidence: p.confidence,
      successRate: p.success_count / (p.success_count + p.failure_count),
      reasoning: `Based on ${p.success_count} successful implementations with ${Math.round(p.confidence * 100)}% confidence`
    }));

  return recommendations;
}

/**
 * Query the knowledge graph using Cypher-like syntax
 */
async function query(cypherQuery) {
  if (ruvector) {
    return await ruvector.query(cypherQuery);
  }

  // SQLite fallback - parse simple patterns
  // This is a simplified implementation
  const results = [];

  if (cypherQuery.includes('MATCH')) {
    // Extract node type from query
    const nodeMatch = cypherQuery.match(/\((\w+):(\w+)\)/);
    if (nodeMatch) {
      const [, alias, type] = nodeMatch;
      const nodes = db.prepare(`SELECT * FROM nodes WHERE type = ?`).all(type);
      results.push(...nodes.map(n => ({ [alias]: { ...n, data: JSON.parse(n.data) } })));
    }
  }

  return results;
}

/**
 * Get learning statistics
 */
function getLearningStats() {
  const stats = {
    totalNodes: db.prepare('SELECT COUNT(*) as count FROM nodes').get().count,
    totalRelationships: db.prepare('SELECT COUNT(*) as count FROM relationships').get().count,
    totalPatterns: db.prepare('SELECT COUNT(*) as count FROM patterns').get().count,
    totalOptimizations: db.prepare('SELECT COUNT(*) as count FROM optimization_history').get().count,
    successfulOptimizations: db.prepare('SELECT COUNT(*) as count FROM optimization_history WHERE success = 1').get().count,
    avgConfidence: db.prepare('SELECT AVG(confidence) as avg FROM patterns').get().avg || 0,
    topPatterns: db.prepare(`
      SELECT pattern_type, confidence, success_count, failure_count
      FROM patterns
      ORDER BY confidence DESC
      LIMIT 5
    `).all()
  };

  stats.successRate = stats.totalOptimizations > 0
    ? (stats.successfulOptimizations / stats.totalOptimizations * 100).toFixed(1)
    : 0;

  return stats;
}

/**
 * Export knowledge graph for analysis
 */
function exportGraph() {
  return {
    nodes: db.prepare('SELECT * FROM nodes').all().map(n => ({
      ...n,
      data: JSON.parse(n.data)
    })),
    relationships: db.prepare('SELECT * FROM relationships').all().map(r => ({
      ...r,
      metadata: r.metadata ? JSON.parse(r.metadata) : {}
    })),
    patterns: db.prepare('SELECT * FROM patterns').all().map(p => ({
      ...p,
      conditions: JSON.parse(p.conditions),
      action: JSON.parse(p.action)
    }))
  };
}

module.exports = {
  initialize,
  addNode,
  addRelationship,
  recordMetrics,
  recordOptimization,
  measureOptimizationEffect,
  getRecommendations,
  query,
  getLearningStats,
  exportGraph,
  NODE_TYPES,
  RELATIONSHIP_TYPES
};
