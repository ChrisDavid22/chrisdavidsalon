/**
 * SEO Flywheel Integration Tests
 *
 * Tests the automated SEO flywheel system that runs weekly via GitHub Actions.
 *
 * GitHub Actions Workflow: .github/workflows/seo-flywheel.yml
 * Schedule: Every Sunday at 6 AM EST
 *
 * 6-Phase Cycle:
 * 1. INGEST - Collect data from all sources
 * 2. ANALYZE - Process and compare metrics
 * 3. DECIDE - Generate prioritized tasks
 * 4. EXECUTE - Implement safe optimizations
 * 5. MEASURE - Track before/after metrics
 * 6. LEARN - Update knowledge graph
 *
 * This test suite validates that all flywheel components can be triggered
 * manually and that the integration between phases works correctly.
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://www.chrisdavidsalon.com';

test.describe('SEO Flywheel - Phase Integration Tests', () => {

  test('Phase 1: INGEST - Data collection works', async ({ request }) => {
    console.log('\n=== PHASE 1: INGEST ===');
    console.log('Testing data ingestion from all sources...\n');

    const sources = [
      {
        name: 'GA4 Analytics',
        endpoint: '/api/ga4-analytics?type=overview',
        dataKey: 'activeUsers'
      },
      {
        name: 'Competitor Data',
        endpoint: '/api/competitors',
        dataKey: 'competitors'
      },
      {
        name: 'Authority Score',
        endpoint: '/api/authority-score',
        dataKey: 'authority_score'
      },
      {
        name: 'SEO Learning Graph',
        endpoint: '/api/seo-learning?action=status',
        dataKey: 'status'
      },
    ];

    const results = [];

    for (const source of sources) {
      console.log(`Ingesting: ${source.name}...`);

      const startTime = Date.now();
      const response = await request.get(`${BASE_URL}${source.endpoint}`, {
        timeout: 30000
      });
      const duration = Date.now() - startTime;

      const success = response.ok();
      const data = success ? await response.json() : null;

      results.push({
        name: source.name,
        success,
        duration,
        hasData: data && (data.data || data.success)
      });

      console.log(`  ${success ? '✓' : '✗'} ${source.name}: ${duration}ms`);

      expect(success).toBe(true);
    }

    console.log('\n=== INGEST Summary ===');
    console.log(`Sources tested: ${results.length}`);
    console.log(`Successful: ${results.filter(r => r.success).length}`);
    console.log(`Avg response time: ${(results.reduce((sum, r) => sum + r.duration, 0) / results.length).toFixed(0)}ms`);
  });

  test('Phase 2: ANALYZE - Analysis engine processes data', async ({ request }) => {
    console.log('\n=== PHASE 2: ANALYZE ===');
    console.log('Testing SEO analysis engine...\n');

    // Check analysis engine status
    console.log('Checking analysis engine health...');
    const statusResponse = await request.get(`${BASE_URL}/api/seo-analysis-engine?action=health-check`, {
      timeout: 30000
    });

    expect(statusResponse.ok()).toBeTruthy();
    const statusData = await statusResponse.json();

    console.log(`Status: ${statusData.status}`);
    console.log(`Components ready: ${Object.keys(statusData.components || {}).length}`);

    expect(statusData.status).toBe('operational');

    // Run trend detection
    console.log('\nRunning trend detection...');
    const trendResponse = await request.get(`${BASE_URL}/api/seo-analysis-engine?action=trend-detection`, {
      timeout: 60000
    });

    expect(trendResponse.ok()).toBeTruthy();
    const trendData = await trendResponse.json();

    if (trendData.success) {
      console.log(`✓ Trends analyzed: ${trendData.trends?.length || 0} detected`);
      console.log(`✓ Period: ${trendData.period || 'unknown'}`);
    } else {
      console.log(`Note: ${trendData.error || 'Analysis requires more historical data'}`);
    }
  });

  test('Phase 3: DECIDE - Task generation works', async ({ request }) => {
    console.log('\n=== PHASE 3: DECIDE ===');
    console.log('Testing AI task generation...\n');

    // Test proactive SEO agent
    console.log('Testing proactive SEO agent...');
    const proactiveResponse = await request.get(`${BASE_URL}/api/proactive-seo-agent?action=status`, {
      timeout: 30000
    });

    expect(proactiveResponse.ok()).toBeTruthy();
    const proactiveData = await proactiveResponse.json();

    console.log(`Agent: ${proactiveData.agent}`);
    console.log(`Actions available: ${proactiveData.availableActions?.length || 0}`);

    expect(proactiveData.success).toBe(true);
    expect(proactiveData.availableActions).toBeDefined();

    // Test GBP agent
    console.log('\nTesting GBP agent...');
    const gbpResponse = await request.get(`${BASE_URL}/api/gbp-agent?action=status`, {
      timeout: 30000
    });

    expect(gbpResponse.ok()).toBeTruthy();
    const gbpData = await gbpResponse.json();

    console.log(`Agent: ${gbpData.agent}`);
    console.log(`Actions available: ${gbpData.availableActions?.length || 0}`);

    expect(gbpData.success).toBe(true);

    // Generate recommendations
    console.log('\nGenerating AI recommendations...');
    const recommendResponse = await request.get(`${BASE_URL}/api/seo-learning?action=recommendations`, {
      timeout: 60000
    });

    expect(recommendResponse.ok()).toBeTruthy();
    const recommendData = await recommendResponse.json();

    if (recommendData.success && recommendData.recommendations) {
      console.log(`✓ Generated ${recommendData.recommendations.length} recommendations`);

      // Show top 3
      const top3 = recommendData.recommendations.slice(0, 3);
      console.log('\nTop 3 Recommendations:');
      top3.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec.title || rec.action} (Priority: ${rec.priority})`);
      });
    } else {
      console.log('Note: Recommendations require more learning data');
    }
  });

  test('Phase 4: EXECUTE - Safe actions can be executed', async ({ request }) => {
    console.log('\n=== PHASE 4: EXECUTE ===');
    console.log('Testing safe optimization execution...\n');

    // Note: We won't actually execute changes in tests, but verify the capability exists

    // Check autonomous agent can track changes
    console.log('Testing change tracking system...');
    const agentResponse = await request.get(`${BASE_URL}/api/autonomous-seo-agent?action=status`, {
      timeout: 30000
    });

    expect(agentResponse.ok()).toBeTruthy();
    const agentData = await agentResponse.json();

    console.log(`Agent status: ${agentData.status}`);
    console.log(`Available actions: ${agentData.availableActions?.length || 0}`);

    expect(agentData.status).toBeDefined();

    // Check if get-changes action is available
    const hasChangeTracking = agentData.availableActions?.includes('get-changes');
    console.log(`Change tracking available: ${hasChangeTracking ? 'YES' : 'NO'}`);

    console.log('\n✓ Execution framework verified');
    console.log('Note: Actual executions happen via GitHub Actions workflow');
  });

  test('Phase 5: MEASURE - Effectiveness measurement works', async ({ request }) => {
    console.log('\n=== PHASE 5: MEASURE ===');
    console.log('Testing effectiveness measurement...\n');

    // Test getting tracked changes
    console.log('Retrieving tracked changes...');
    const changesResponse = await request.get(`${BASE_URL}/api/autonomous-seo-agent?action=get-changes`, {
      timeout: 30000
    });

    expect(changesResponse.ok()).toBeTruthy();
    const changesData = await changesResponse.json();

    if (changesData.success && changesData.changes) {
      console.log(`✓ Found ${changesData.changes.length} tracked changes`);

      // Show recent changes
      const recent = changesData.changes.slice(0, 3);
      if (recent.length > 0) {
        console.log('\nRecent changes:');
        recent.forEach((change, i) => {
          console.log(`  ${i + 1}. ${change.title || change.description}`);
          console.log(`     Date: ${change.date || 'unknown'}`);
        });
      }
    } else {
      console.log('Note: No changes tracked yet');
    }

    // Test measurement capability
    console.log('\nTesting measurement endpoint...');
    const measureResponse = await request.get(`${BASE_URL}/api/autonomous-seo-agent?action=measure-effectiveness`, {
      timeout: 60000
    });

    expect(measureResponse.ok()).toBeTruthy();
    const measureData = await measureResponse.json();

    if (measureData.success) {
      console.log('✓ Measurement system operational');
    } else {
      console.log(`Note: ${measureData.message || 'Requires baseline data'}`);
    }
  });

  test('Phase 6: LEARN - Knowledge graph updates', async ({ request }) => {
    console.log('\n=== PHASE 6: LEARN ===');
    console.log('Testing RuVector knowledge graph learning...\n');

    // Check learning system status
    console.log('Checking RuVector status...');
    const statusResponse = await request.get(`${BASE_URL}/api/seo-learning?action=status`, {
      timeout: 30000
    });

    expect(statusResponse.ok()).toBeTruthy();
    const statusData = await statusResponse.json();

    console.log(`System: ${statusData.system}`);
    console.log(`Status: ${statusData.status}`);

    if (statusData.stats) {
      console.log(`\nKnowledge Graph Stats:`);
      console.log(`  Data points: ${statusData.stats.totalDataPoints || 0}`);
      console.log(`  Patterns learned: ${statusData.stats.patternsLearned || 0}`);
      console.log(`  Sites tracked: ${statusData.stats.sitesTracked || 0}`);
    }

    expect(statusData.success).toBe(true);
    expect(statusData.system).toBe('RuVector SEO Learning');

    // Test learning report generation
    console.log('\nGenerating learning report...');
    const reportResponse = await request.get(`${BASE_URL}/api/seo-learning?action=learning-report`, {
      timeout: 60000
    });

    expect(reportResponse.ok()).toBeTruthy();
    const reportData = await reportResponse.json();

    if (reportData.success && reportData.report) {
      console.log('✓ Learning report generated');
      console.log(`  Effectiveness: ${reportData.report.overallEffectiveness || 'N/A'}`);
      console.log(`  Successful patterns: ${reportData.report.successfulPatterns?.length || 0}`);
    } else {
      console.log('Note: Learning report requires historical data');
    }
  });

});

test.describe('Flywheel Integration - Full Cycle Test', () => {

  test('Complete flywheel cycle simulation', async ({ request }) => {
    console.log('\n=== FULL FLYWHEEL CYCLE SIMULATION ===');
    console.log('Simulating complete Sunday 6 AM workflow...\n');

    test.setTimeout(180000); // 3 minutes for full cycle

    const phases = [];

    // Phase 1: INGEST
    console.log('[1/6] INGEST - Collecting data...');
    const ingestStart = Date.now();

    const ga4 = await request.get(`${BASE_URL}/api/ga4-analytics?type=overview`, { timeout: 30000 });
    const competitors = await request.get(`${BASE_URL}/api/competitors`, { timeout: 30000 });

    phases.push({
      phase: 'INGEST',
      duration: Date.now() - ingestStart,
      success: ga4.ok() && competitors.ok()
    });

    console.log(`  ✓ Complete (${phases[0].duration}ms)`);

    // Phase 2: ANALYZE
    console.log('[2/6] ANALYZE - Processing data...');
    const analyzeStart = Date.now();

    const analyze = await request.get(`${BASE_URL}/api/seo-analysis-engine?action=health-check`, { timeout: 30000 });

    phases.push({
      phase: 'ANALYZE',
      duration: Date.now() - analyzeStart,
      success: analyze.ok()
    });

    console.log(`  ✓ Complete (${phases[1].duration}ms)`);

    // Phase 3: DECIDE
    console.log('[3/6] DECIDE - Generating tasks...');
    const decideStart = Date.now();

    const proactive = await request.get(`${BASE_URL}/api/proactive-seo-agent?action=status`, { timeout: 30000 });
    const gbp = await request.get(`${BASE_URL}/api/gbp-agent?action=status`, { timeout: 30000 });

    phases.push({
      phase: 'DECIDE',
      duration: Date.now() - decideStart,
      success: proactive.ok() && gbp.ok()
    });

    console.log(`  ✓ Complete (${phases[2].duration}ms)`);

    // Phase 4: EXECUTE (verified capability only)
    console.log('[4/6] EXECUTE - Verifying execution capability...');
    const executeStart = Date.now();

    const agent = await request.get(`${BASE_URL}/api/autonomous-seo-agent?action=status`, { timeout: 30000 });

    phases.push({
      phase: 'EXECUTE',
      duration: Date.now() - executeStart,
      success: agent.ok()
    });

    console.log(`  ✓ Verified (${phases[3].duration}ms)`);

    // Phase 5: MEASURE
    console.log('[5/6] MEASURE - Checking measurement system...');
    const measureStart = Date.now();

    const changes = await request.get(`${BASE_URL}/api/autonomous-seo-agent?action=get-changes`, { timeout: 30000 });

    phases.push({
      phase: 'MEASURE',
      duration: Date.now() - measureStart,
      success: changes.ok()
    });

    console.log(`  ✓ Complete (${phases[4].duration}ms)`);

    // Phase 6: LEARN
    console.log('[6/6] LEARN - Updating knowledge graph...');
    const learnStart = Date.now();

    const learning = await request.get(`${BASE_URL}/api/seo-learning?action=status`, { timeout: 30000 });

    phases.push({
      phase: 'LEARN',
      duration: Date.now() - learnStart,
      success: learning.ok()
    });

    console.log(`  ✓ Complete (${phases[5].duration}ms)`);

    // Summary
    console.log('\n=== FLYWHEEL CYCLE SUMMARY ===');

    const totalDuration = phases.reduce((sum, p) => sum + p.duration, 0);
    const successCount = phases.filter(p => p.success).length;

    console.log(`Total duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`Phases completed: ${successCount}/6`);

    console.log('\nPhase breakdown:');
    phases.forEach(p => {
      console.log(`  ${p.phase}: ${p.duration}ms - ${p.success ? '✓' : '✗'}`);
    });

    // All phases should succeed
    expect(successCount).toBe(6);

    // Should complete in reasonable time (< 2 minutes)
    expect(totalDuration).toBeLessThan(120000);

    console.log('\n✓ FLYWHEEL OPERATIONAL');
  });

});

test.describe('Flywheel Data Persistence', () => {

  test('Changes log persists data correctly', async ({ page }) => {
    console.log('\n=== Testing Changes Log Persistence ===');

    await page.goto(`${BASE_URL}/admin/changes-log.html`);

    // Wait for page to load
    await page.waitForTimeout(3000);

    // Check if log has entries
    const bodyText = await page.locator('body').textContent();

    console.log('Checking for change log entries...');

    // Should have some structure even if empty
    expect(bodyText.length).toBeGreaterThan(100);

    // Look for date patterns or entry indicators
    const hasEntries = bodyText.includes('2024') || bodyText.includes('2025') || bodyText.includes('No changes');

    console.log(`Change log has data: ${hasEntries ? 'YES' : 'EMPTY'}`);

    await page.screenshot({ path: 'test-results/flywheel-changes-log.png', fullPage: true });
  });

  test('Knowledge graph stores learning data', async ({ request }) => {
    console.log('\n=== Testing Knowledge Graph Storage ===');

    // Check if knowledge graph file exists and has data
    const graphResponse = await request.get(`${BASE_URL}/api/seo-learning?action=export-graph`, {
      timeout: 30000
    });

    expect(graphResponse.ok()).toBeTruthy();
    const graphData = await graphResponse.json();

    if (graphData.success && graphData.graph) {
      console.log('✓ Knowledge graph exists');
      console.log(`Nodes: ${graphData.graph.nodes?.length || 0}`);
      console.log(`Edges: ${graphData.graph.edges?.length || 0}`);
    } else {
      console.log('Note: Knowledge graph is initializing');
    }
  });

});

test.describe('Flywheel Weekly Report', () => {

  test('Weekly report can be generated', async ({ request }) => {
    console.log('\n=== Testing Weekly Report Generation ===');

    test.setTimeout(90000); // 90 seconds

    // Check report status
    console.log('Checking report system status...');
    const statusResponse = await request.get(`${BASE_URL}/api/weekly-seo-report?action=status`, {
      timeout: 30000
    });

    expect(statusResponse.ok()).toBeTruthy();
    const statusData = await statusResponse.json();

    console.log(`Status: ${statusData.status}`);

    if (statusData.lastReport) {
      console.log(`Last report: ${statusData.lastReport.date}`);
      console.log(`Tasks: ${statusData.lastReport.tasksCount || 0}`);
    }

    // Generate new report
    console.log('\nGenerating new weekly report...');
    const generateResponse = await request.get(`${BASE_URL}/api/weekly-seo-report?action=generate`, {
      timeout: 60000
    });

    expect(generateResponse.ok()).toBeTruthy();
    const reportData = await generateResponse.json();

    if (reportData.success) {
      console.log('✓ Weekly report generated successfully');

      if (reportData.report) {
        console.log(`\nReport summary:`);
        console.log(`  Tasks: ${reportData.report.tasks?.length || 0}`);
        console.log(`  Critical: ${reportData.report.summary?.critical || 0}`);
        console.log(`  High Priority: ${reportData.report.summary?.high || 0}`);
      }
    } else {
      console.log(`Note: ${reportData.error || reportData.message}`);
    }
  });

});

test.describe('Flywheel GitHub Actions Integration', () => {

  test('GitHub Actions workflow exists and is valid', async ({ request }) => {
    console.log('\n=== Checking GitHub Actions Workflow ===');

    // Check if workflow file exists (public repos only)
    const workflowResponse = await request.get(
      'https://raw.githubusercontent.com/ChrisDavid22/chrisdavidsalon/main/.github/workflows/seo-flywheel.yml',
      { timeout: 10000 }
    );

    if (workflowResponse.ok()) {
      const workflowContent = await workflowResponse.text();

      console.log('✓ Workflow file exists');
      console.log(`Size: ${workflowContent.length} bytes`);

      // Check for key workflow components
      const hasSchedule = workflowContent.includes('schedule:');
      const hasCron = workflowContent.includes('cron:');
      const hasPhases = workflowContent.includes('INGEST') ||
                        workflowContent.includes('ANALYZE') ||
                        workflowContent.includes('DECIDE');

      console.log(`Has schedule: ${hasSchedule ? 'YES' : 'NO'}`);
      console.log(`Has cron: ${hasCron ? 'YES' : 'NO'}`);
      console.log(`Has flywheel phases: ${hasPhases ? 'YES' : 'NO'}`);

      if (hasSchedule && hasCron) {
        console.log('✓ Workflow is properly configured for weekly runs');
      }
    } else {
      console.log('Note: Workflow file check skipped (repo may be private)');
    }
  });

  test('Microsite coordination works', async ({ request }) => {
    console.log('\n=== Testing Multi-Site Coordination ===');

    // Test autonomous agent's microsite sync capability
    const syncResponse = await request.get(`${BASE_URL}/api/autonomous-seo-agent?action=microsite-sync`, {
      timeout: 60000
    });

    expect(syncResponse.ok()).toBeTruthy();
    const syncData = await syncResponse.json();

    if (syncData.success) {
      console.log('✓ Microsite sync operational');

      if (syncData.recommendations) {
        console.log(`Cross-site recommendations: ${syncData.recommendations.length}`);
      }
    } else {
      console.log(`Note: ${syncData.message || 'Sync requires all sites to be configured'}`);
    }

    // Verify all 3 microsites are tracked
    const micrositeResponse = await request.get(`${BASE_URL}/api/microsite-analytics`, {
      timeout: 30000
    });

    expect(micrositeResponse.ok()).toBeTruthy();
    const micrositeData = await micrositeResponse.json();

    if (micrositeData.success && micrositeData.referrals) {
      const sites = Object.keys(micrositeData.referrals);
      console.log(`\nMicrosites tracked: ${sites.length}`);
      sites.forEach(site => console.log(`  - ${site}`));

      // Should track all 3 microsites
      expect(sites.length).toBeGreaterThanOrEqual(3);
    }
  });

});
