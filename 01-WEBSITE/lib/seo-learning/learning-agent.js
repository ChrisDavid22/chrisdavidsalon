/**
 * Self-Learning SEO Agent
 * Uses the knowledge graph to learn and recommend optimizations
 */

const { SITES, ACTION_TYPES, LEARNING_CONFIG, NODE_TYPES } = require('./ruvector-config');

/**
 * SEO Learning Agent
 * Analyzes the knowledge graph and generates intelligent recommendations
 */
class SEOLearningAgent {
  constructor(knowledgeGraph) {
    this.kg = knowledgeGraph;
    this.learningHistory = [];
  }

  /**
   * Analyze current state and generate recommendations
   */
  async analyze() {
    console.log('[Agent] Starting analysis...');

    const analysis = {
      timestamp: new Date().toISOString(),
      sites: {},
      crossSiteInsights: [],
      recommendations: [],
      learningStats: this.kg.getLearningStats()
    };

    // Analyze each site
    for (const [key, site] of Object.entries(SITES)) {
      analysis.sites[key] = await this.analyzeSite(site);
    }

    // Cross-site analysis
    analysis.crossSiteInsights = await this.analyzeCrossSite(analysis.sites);

    // Generate recommendations based on learned patterns
    analysis.recommendations = await this.generateRecommendations(analysis);

    return analysis;
  }

  /**
   * Analyze a single site
   */
  async analyzeSite(site) {
    const siteAnalysis = {
      siteId: site.id,
      domain: site.domain,
      metrics: {},
      gaps: [],
      opportunities: [],
      threats: []
    };

    // Get latest metrics from knowledge graph
    const stats = this.kg.getLearningStats();

    // Identify gaps
    siteAnalysis.gaps = await this.identifyGaps(site);

    // Identify opportunities
    siteAnalysis.opportunities = await this.identifyOpportunities(site);

    // Identify threats (competitor movements)
    if (site.type === 'main') {
      siteAnalysis.threats = await this.identifyThreats(site);
    }

    return siteAnalysis;
  }

  /**
   * Identify content and SEO gaps
   */
  async identifyGaps(site) {
    const gaps = [];

    // Query for keywords with high impressions but low position
    try {
      const results = await this.kg.query(`
        MATCH (s:site {id: '${site.id}'})-[:RANKS_FOR]->(k:keyword)
        WHERE k.impressions > 100 AND k.position > 10
        RETURN k
        ORDER BY k.impressions DESC
        LIMIT 10
      `);

      for (const result of results) {
        if (result.k) {
          gaps.push({
            type: 'ranking_gap',
            keyword: result.k.data?.keyword || result.k.keyword,
            currentPosition: result.k.data?.position || result.k.position,
            impressions: result.k.data?.impressions || result.k.impressions,
            potentialValue: this.calculateKeywordValue(result.k),
            suggestedAction: 'CREATE_OPTIMIZED_PAGE'
          });
        }
      }
    } catch (error) {
      console.log('[Agent] Gap analysis query failed, using fallback');
    }

    // Check for missing service pages
    const targetServices = [
      'blowout', 'full-color', 'root-touch-up', 'deep-conditioning',
      'hair-treatment', 'styling', 'updo', 'special-occasion'
    ];

    for (const service of targetServices) {
      gaps.push({
        type: 'content_gap',
        service,
        suggestedAction: 'CREATE_SERVICE_PAGE',
        estimatedImpact: 'medium'
      });
    }

    return gaps;
  }

  /**
   * Identify optimization opportunities
   */
  async identifyOpportunities(site) {
    const opportunities = [];

    // Microsite linking opportunities
    if (site.type === 'main') {
      opportunities.push({
        type: 'internal_linking',
        description: 'Add more contextual links from microsites to main site service pages',
        impact: 'high',
        effort: 'low',
        confidence: 0.85
      });
    }

    // FAQ expansion opportunities
    opportunities.push({
      type: 'faq_expansion',
      description: 'Add FAQ schema to service pages for rich snippets',
      impact: 'medium',
      effort: 'low',
      targetPages: ['balayage', 'color-correction', 'hair-extensions'],
      confidence: 0.8
    });

    // Local SEO opportunities
    opportunities.push({
      type: 'local_expansion',
      description: 'Create service area pages for Lake Worth, Lantana, Highland Beach',
      impact: 'high',
      effort: 'medium',
      confidence: 0.75
    });

    // Review generation opportunity
    opportunities.push({
      type: 'review_generation',
      description: 'Implement automated review request after appointments via Boulevard',
      impact: 'high',
      effort: 'medium',
      confidence: 0.9
    });

    return opportunities;
  }

  /**
   * Identify competitive threats
   */
  async identifyThreats(site) {
    const threats = [];

    // Query competitors gaining ground
    try {
      const results = await this.kg.query(`
        MATCH (s:site {id: '${site.id}'})-[:COMPETES_WITH]->(c:competitor)
        WHERE c.reviewCount > 200
        RETURN c
        ORDER BY c.rating DESC
        LIMIT 5
      `);

      for (const result of results) {
        if (result.c && result.c.data) {
          const comp = result.c.data;
          if (comp.reviewCount > 140) { // More reviews than Chris David
            threats.push({
              type: 'review_gap',
              competitor: comp.name,
              theirReviews: comp.reviewCount,
              ourReviews: 140,
              gap: comp.reviewCount - 140,
              urgency: comp.reviewCount > 200 ? 'high' : 'medium'
            });
          }
        }
      }
    } catch (error) {
      console.log('[Agent] Threat analysis query failed');
    }

    return threats;
  }

  /**
   * Analyze cross-site relationships and synergies
   */
  async analyzeCrossSite(siteAnalyses) {
    const insights = [];

    // Check microsite effectiveness
    insights.push({
      type: 'microsite_synergy',
      insight: 'Microsites should target different keyword clusters to maximize coverage',
      recommendations: [
        { site: 'bestsalondelray', focus: 'General salon authority, service guides' },
        { site: 'bestdelraysalon', focus: 'Local Delray Beach keywords, neighborhood targeting' },
        { site: 'bestsalonpalmbeach', focus: 'Regional Palm Beach County, luxury positioning' }
      ]
    });

    // Link building strategy
    insights.push({
      type: 'link_strategy',
      insight: 'Each microsite should link to different service pages on main site',
      linkMap: {
        bestsalondelray: ['balayage', 'highlights', 'color-correction'],
        bestdelraysalon: ['hair-salon-delray-beach', 'womens-haircut', 'mens-haircut'],
        bestsalonpalmbeach: ['wedding-hair', 'hair-extensions', 'keratin-treatment']
      }
    });

    return insights;
  }

  /**
   * Generate prioritized recommendations based on learned patterns
   */
  async generateRecommendations(analysis) {
    const recommendations = [];

    // Get learned patterns from knowledge graph
    const learnedPatterns = await this.kg.getRecommendations(
      SITES.main.id,
      analysis.sites.main?.metrics || {}
    );

    // Add learned pattern recommendations
    for (const pattern of learnedPatterns) {
      recommendations.push({
        source: 'learned_pattern',
        ...pattern,
        priority: this.calculatePriority(pattern)
      });
    }

    // Add gap-based recommendations
    for (const site of Object.values(analysis.sites)) {
      for (const gap of site.gaps || []) {
        recommendations.push({
          source: 'gap_analysis',
          siteId: site.siteId,
          actionType: gap.suggestedAction,
          details: gap,
          confidence: 0.7,
          priority: gap.type === 'ranking_gap' ? 'high' : 'medium'
        });
      }
    }

    // Add opportunity-based recommendations
    for (const site of Object.values(analysis.sites)) {
      for (const opp of site.opportunities || []) {
        recommendations.push({
          source: 'opportunity_analysis',
          siteId: site.siteId,
          actionType: opp.type,
          details: opp,
          confidence: opp.confidence,
          priority: opp.impact === 'high' ? 'high' : 'medium'
        });
      }
    }

    // Sort by priority and confidence
    recommendations.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
      if (priorityDiff !== 0) return priorityDiff;
      return (b.confidence || 0) - (a.confidence || 0);
    });

    return recommendations.slice(0, 20); // Top 20 recommendations
  }

  /**
   * Calculate keyword value based on position and volume
   */
  calculateKeywordValue(keyword) {
    const impressions = keyword.data?.impressions || keyword.impressions || 0;
    const position = keyword.data?.position || keyword.position || 100;

    // Estimated clicks if ranked #1-3
    const potentialCTR = 0.3; // 30% CTR for top 3
    const potentialClicks = impressions * potentialCTR;

    // Estimated booking rate
    const bookingRate = 0.1; // 10% of visitors book

    // Average ticket value
    const avgTicket = 200;

    return Math.round(potentialClicks * bookingRate * avgTicket);
  }

  /**
   * Calculate recommendation priority
   */
  calculatePriority(recommendation) {
    const confidence = recommendation.confidence || 0.5;
    const successRate = recommendation.successRate || 0.5;

    const score = (confidence * 0.6) + (successRate * 0.4);

    if (score > 0.8) return 'critical';
    if (score > 0.6) return 'high';
    if (score > 0.4) return 'medium';
    return 'low';
  }

  /**
   * Record an action taken for learning
   */
  async recordAction(siteId, actionType, actionDetails, currentMetrics) {
    const optimizationId = await this.kg.recordOptimization(
      siteId,
      actionType,
      actionDetails,
      currentMetrics
    );

    this.learningHistory.push({
      id: optimizationId,
      siteId,
      actionType,
      recordedAt: new Date().toISOString(),
      status: 'pending_measurement'
    });

    return optimizationId;
  }

  /**
   * Measure effectiveness of a recorded action
   */
  async measureAction(optimizationId, newMetrics) {
    const result = await this.kg.measureOptimizationEffect(optimizationId, newMetrics);

    // Update learning history
    const historyItem = this.learningHistory.find(h => h.id === optimizationId);
    if (historyItem) {
      historyItem.status = result.success ? 'successful' : 'unsuccessful';
      historyItem.measuredAt = new Date().toISOString();
      historyItem.improvement = result.improvement;
    }

    return result;
  }

  /**
   * Get learning progress report
   */
  getLearningReport() {
    const stats = this.kg.getLearningStats();

    return {
      timestamp: new Date().toISOString(),
      overallStats: stats,
      learningProgress: {
        totalLearned: stats.totalPatterns,
        avgConfidence: Math.round(stats.avgConfidence * 100) + '%',
        successRate: stats.successRate + '%',
        recentActions: this.learningHistory.slice(-10)
      },
      topPatterns: stats.topPatterns.map(p => ({
        type: p.pattern_type,
        confidence: Math.round(p.confidence * 100) + '%',
        successes: p.success_count,
        failures: p.failure_count
      }))
    };
  }
}

module.exports = SEOLearningAgent;
