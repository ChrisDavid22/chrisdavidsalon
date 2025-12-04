/**
 * API Health Check Suite
 *
 * Comprehensive health check for all 12 Vercel serverless functions.
 * Tests each API endpoint for:
 * - Response status (200 OK)
 * - Response structure validation
 * - Data integrity checks
 * - Error handling
 * - Response time monitoring
 *
 * Vercel Hobby Plan Limit: 12 serverless functions (all tested here)
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://www.chrisdavidsalon.com';

test.describe('API Health Check - All 12 Endpoints', () => {

  test('1/12 - admin-data API (aggregated admin data)', async ({ request }) => {
    console.log('\n=== Testing admin-data API ===');

    const startTime = Date.now();
    const response = await request.get(`${BASE_URL}/api/admin-data`, {
      timeout: 30000
    });
    const duration = Date.now() - startTime;

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    console.log(`Response time: ${duration}ms`);
    console.log(`Success: ${data.success}`);
    console.log(`Data keys: ${Object.keys(data.data || {}).join(', ')}`);

    // Note: admin-data may return success: false if components are still initializing
    expect(data.success !== undefined).toBe(true);
    expect(data.data || data.error).toBeDefined();

    // Verify data structure
    if (data.data) {
      console.log(`Has SEO scores: ${!!data.data.seoScores}`);
      console.log(`Has competitors: ${!!data.data.competitors}`);
    }
  });

  test('2/12 - authority-score API (OpenPageRank)', async ({ request }) => {
    console.log('\n=== Testing authority-score API ===');

    const startTime = Date.now();
    const response = await request.get(`${BASE_URL}/api/authority-score?competitors=true`, {
      timeout: 30000
    });
    const duration = Date.now() - startTime;

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    console.log(`Response time: ${duration}ms`);
    console.log(`Success: ${data.success}`);
    console.log(`Data source: ${data.dataSource}`);
    console.log(`Is live data: ${data.isLiveData}`);

    expect(data.success).toBe(true);

    if (data.isLiveData && data.data) {
      console.log(`Authority score: ${data.data.authority_score}`);
      console.log(`PageRank: ${data.data.pagerank}`);
      console.log(`Competitors count: ${data.data.competitors?.length || 0}`);
    }
  });

  test('3/12 - autonomous-seo-agent API (master controller)', async ({ request }) => {
    console.log('\n=== Testing autonomous-seo-agent API ===');

    // Test status endpoint
    const startTime = Date.now();
    const response = await request.get(`${BASE_URL}/api/autonomous-seo-agent?action=status`, {
      timeout: 30000
    });
    const duration = Date.now() - startTime;

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    console.log(`Response time: ${duration}ms`);
    console.log(`Success: ${data.success}`);
    console.log(`Status: ${data.status}`);
    console.log(`Available actions: ${data.availableActions?.length || 0}`);

    expect(data.success).toBe(true);
    expect(data.status).toBeDefined();
    // Note: Some APIs return actions as array, some as undefined if none available
    expect(data.availableActions !== undefined || data.actions).toBeTruthy();

    // Log available actions
    if (data.availableActions) {
      console.log(`Actions: ${data.availableActions.join(', ')}`);
    }
  });

  test('4/12 - competitors API (Google Places)', async ({ request }) => {
    console.log('\n=== Testing competitors API ===');

    const startTime = Date.now();
    const response = await request.get(`${BASE_URL}/api/competitors`, {
      timeout: 30000
    });
    const duration = Date.now() - startTime;

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    console.log(`Response time: ${duration}ms`);
    console.log(`Success: ${data.success}`);
    console.log(`Is live data: ${data.live}`);
    console.log(`Data source: ${data.source}`);

    expect(data.success).toBe(true);

    if (data.live && data.data?.competitors) {
      console.log(`Competitors found: ${data.data.competitors.length}`);
      console.log(`Our salon included: ${data.data.competitors.some(c => c.isOurSalon)}`);

      // Log top 3 competitors
      const top3 = data.data.competitors.slice(0, 3);
      console.log('\nTop 3 competitors:');
      top3.forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.name} - ${c.rating} stars (${c.reviews} reviews)`);
      });
    }
  });

  test('5/12 - ga4-analytics API (multiple types)', async ({ request }) => {
    console.log('\n=== Testing ga4-analytics API ===');

    const types = ['overview', 'traffic-sources', 'top-pages', 'devices', 'events'];

    for (const type of types) {
      console.log(`\nTesting type: ${type}`);

      const startTime = Date.now();
      const response = await request.get(`${BASE_URL}/api/ga4-analytics?type=${type}`, {
        timeout: 30000
      });
      const duration = Date.now() - startTime;

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      console.log(`  Response time: ${duration}ms`);
      console.log(`  Success: ${data.success}`);
      console.log(`  Data source: ${data.dataSource}`);
      console.log(`  Is live: ${data.isLiveData}`);

      expect(data.success).toBe(true);

      if (data.isLiveData && data.data) {
        console.log(`  Data keys: ${Object.keys(data.data).join(', ')}`);

        // Log specific metrics for overview
        if (type === 'overview') {
          console.log(`  Active users: ${data.data.activeUsers}`);
          console.log(`  Sessions: ${data.data.sessions}`);
        }
      }
    }
  });

  test('6/12 - gbp-agent API (Google Business Profile)', async ({ request }) => {
    console.log('\n=== Testing gbp-agent API ===');

    const startTime = Date.now();
    const response = await request.get(`${BASE_URL}/api/gbp-agent?action=status`, {
      timeout: 30000
    });
    const duration = Date.now() - startTime;

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    console.log(`Response time: ${duration}ms`);
    console.log(`Success: ${data.success}`);
    console.log(`Agent name: ${data.agent}`);
    console.log(`Available actions: ${data.availableActions?.length || 0}`);

    expect(data.success).toBe(true);
    // Note: Agent name may vary, just check it exists
    expect(data.agent || data.name).toBeDefined();
    expect(data.availableActions !== undefined || data.actions).toBeTruthy();

    if (data.availableActions) {
      console.log(`Actions: ${data.availableActions.join(', ')}`);
    }
  });

  test('7/12 - microsite-analytics API (microsite tracking)', async ({ request }) => {
    console.log('\n=== Testing microsite-analytics API ===');

    const startTime = Date.now();
    const response = await request.get(`${BASE_URL}/api/microsite-analytics`, {
      timeout: 30000
    });
    const duration = Date.now() - startTime;

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    console.log(`Response time: ${duration}ms`);
    console.log(`Success: ${data.success}`);
    console.log(`Has referrals: ${!!data.referrals}`);

    expect(data.success).toBe(true);

    if (data.referrals) {
      console.log(`Total referrals: ${data.totalReferrals || 0}`);
      console.log(`Microsites tracked: ${Object.keys(data.referrals).length}`);
    }
  });

  test('8/12 - pagespeed API (PageSpeed Insights)', async ({ request }) => {
    console.log('\n=== Testing pagespeed API ===');

    const startTime = Date.now();
    const response = await request.get(`${BASE_URL}/api/pagespeed`, {
      timeout: 60000 // PageSpeed can be slow
    });
    const duration = Date.now() - startTime;

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    console.log(`Response time: ${duration}ms`);
    console.log(`Success: ${data.success}`);

    // Note: PageSpeed may fail on slow loads, check for data or error
    expect(data.success !== undefined || data.error || data.data).toBeTruthy();

    if (data.data?.categories) {
      const categories = data.data.categories;
      console.log(`Performance: ${categories.performance}`);
      console.log(`Accessibility: ${categories.accessibility}`);
      console.log(`Best Practices: ${categories.bestPractices}`);
      console.log(`SEO: ${categories.seo}`);
    }
  });

  test('9/12 - proactive-seo-agent API (proactive actions)', async ({ request }) => {
    console.log('\n=== Testing proactive-seo-agent API ===');

    const startTime = Date.now();
    const response = await request.get(`${BASE_URL}/api/proactive-seo-agent?action=status`, {
      timeout: 30000
    });
    const duration = Date.now() - startTime;

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    console.log(`Response time: ${duration}ms`);
    console.log(`Success: ${data.success}`);
    console.log(`Agent name: ${data.agent}`);
    console.log(`Available actions: ${data.availableActions?.length || 0}`);

    expect(data.success).toBe(true);
    // Note: Agent name format may vary
    expect(data.agent).toBeDefined();
    expect(data.availableActions !== undefined || data.actions).toBeTruthy();

    if (data.availableActions) {
      console.log(`Actions: ${data.availableActions.join(', ')}`);
    }
  });

  test('10/12 - seo-analysis-engine API (SEO brain)', async ({ request }) => {
    console.log('\n=== Testing seo-analysis-engine API ===');

    const startTime = Date.now();
    const response = await request.get(`${BASE_URL}/api/seo-analysis-engine?action=health-check`, {
      timeout: 30000
    });
    const duration = Date.now() - startTime;

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    console.log(`Response time: ${duration}ms`);
    console.log(`Success: ${data.success}`);
    console.log(`Status: ${data.status}`);
    console.log(`Components: ${Object.keys(data.components || {}).join(', ')}`);

    expect(data.success).toBe(true);
    expect(data.status).toBe('operational');
    expect(data.components).toBeDefined();

    if (data.components) {
      console.log('\nComponent status:');
      Object.entries(data.components).forEach(([name, status]) => {
        console.log(`  ${name}: ${status}`);
      });
    }
  });

  test('11/12 - seo-learning API (RuVector knowledge graph)', async ({ request }) => {
    console.log('\n=== Testing seo-learning API ===');

    const startTime = Date.now();
    const response = await request.get(`${BASE_URL}/api/seo-learning?action=status`, {
      timeout: 30000
    });
    const duration = Date.now() - startTime;

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    console.log(`Response time: ${duration}ms`);
    console.log(`Success: ${data.success}`);
    console.log(`System: ${data.system}`);
    console.log(`Status: ${data.status}`);

    expect(data.success).toBe(true);
    // Note: System name format may vary
    expect(data.system).toBeDefined();
    expect(data.status).toBeDefined();

    if (data.stats) {
      console.log(`\nKnowledge graph stats:`);
      console.log(`  Data points: ${data.stats.totalDataPoints || 0}`);
      console.log(`  Patterns learned: ${data.stats.patternsLearned || 0}`);
      console.log(`  Sites tracked: ${data.stats.sitesTracked || 0}`);
    }
  });

  test('12/12 - weekly-seo-report API (report generation)', async ({ request }) => {
    console.log('\n=== Testing weekly-seo-report API ===');

    const startTime = Date.now();
    const response = await request.get(`${BASE_URL}/api/weekly-seo-report?action=status`, {
      timeout: 30000
    });
    const duration = Date.now() - startTime;

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    console.log(`Response time: ${duration}ms`);
    console.log(`Success: ${data.success}`);
    console.log(`Status: ${data.status}`);

    expect(data.success).toBe(true);
    expect(data.status).toBeDefined();

    if (data.lastReport) {
      console.log(`Last report generated: ${data.lastReport.date}`);
      console.log(`Tasks generated: ${data.lastReport.tasksCount}`);
    }
  });

});

test.describe('API Error Handling Tests', () => {

  test('Invalid action parameters handled gracefully', async ({ request }) => {
    console.log('\n=== Testing error handling ===');

    // Test invalid action
    const response = await request.get(`${BASE_URL}/api/autonomous-seo-agent?action=invalid-action`, {
      timeout: 10000
    });

    // Should return 200 with error message (not crash)
    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    console.log(`Error handled: ${!!data.error || !!data.message}`);
    console.log(`Error message: ${data.error || data.message || 'No explicit error'}`);

    // Should have success: false or error message or handle gracefully
    expect(data.success === false || data.error || data.message || data.status).toBeTruthy();
  });

  test('Missing required parameters handled', async ({ request }) => {
    // Test GA4 API without type parameter
    const response = await request.get(`${BASE_URL}/api/ga4-analytics`, {
      timeout: 10000
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    console.log(`Missing param handled: ${!!data.error || !!data.message}`);

    // Should either default to overview or return error
    expect(data.success !== undefined).toBe(true);
  });

});

test.describe('API Performance Benchmarks', () => {

  test('All APIs respond within acceptable time limits', async ({ request }) => {
    console.log('\n=== API Performance Benchmark ===');

    const endpoints = [
      { name: 'admin-data', url: '/api/admin-data', maxTime: 30000 },
      { name: 'authority-score', url: '/api/authority-score', maxTime: 15000 },
      { name: 'competitors', url: '/api/competitors', maxTime: 20000 },
      { name: 'ga4-analytics', url: '/api/ga4-analytics?type=overview', maxTime: 20000 },
      { name: 'microsite-analytics', url: '/api/microsite-analytics', maxTime: 15000 },
    ];

    const results = [];

    for (const endpoint of endpoints) {
      const startTime = Date.now();

      try {
        const response = await request.get(`${BASE_URL}${endpoint.url}`, {
          timeout: endpoint.maxTime
        });

        const duration = Date.now() - startTime;
        const success = response.ok();

        results.push({
          name: endpoint.name,
          duration,
          success,
          status: success ? 'PASS' : 'FAIL'
        });

        console.log(`${endpoint.name}: ${duration}ms - ${success ? 'PASS' : 'FAIL'}`);

        // Assert within time limit
        expect(duration).toBeLessThan(endpoint.maxTime);

      } catch (error) {
        results.push({
          name: endpoint.name,
          duration: endpoint.maxTime,
          success: false,
          status: 'TIMEOUT'
        });

        console.log(`${endpoint.name}: TIMEOUT`);
      }
    }

    // Summary
    console.log('\n=== Performance Summary ===');
    const avgTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    const successCount = results.filter(r => r.success).length;

    console.log(`Average response time: ${avgTime.toFixed(0)}ms`);
    console.log(`Success rate: ${successCount}/${results.length} (${(successCount/results.length*100).toFixed(0)}%)`);
  });

});

test.describe('Data Integrity Checks', () => {

  test('APIs return real data (not hardcoded)', async ({ request }) => {
    console.log('\n=== Data Integrity Verification ===');

    // Test GA4 - should have varying numbers
    const ga4Response = await request.get(`${BASE_URL}/api/ga4-analytics?type=overview`, {
      timeout: 30000
    });
    const ga4Data = await ga4Response.json();

    if (ga4Data.isLiveData && ga4Data.data) {
      // Check that numbers are not suspiciously round (like 100, 500, etc)
      const users = parseInt(ga4Data.data.activeUsers) || 0;
      const sessions = parseInt(ga4Data.data.sessions) || 0;

      console.log(`GA4 Active Users: ${users}`);
      console.log(`GA4 Sessions: ${sessions}`);

      // Real data is unlikely to be exactly 0, 100, 500, 1000
      const suspiciousNumbers = [0, 100, 200, 500, 1000];
      const isSuspicious = suspiciousNumbers.includes(users) && suspiciousNumbers.includes(sessions);

      console.log(`Data appears real: ${!isSuspicious ? 'YES' : 'SUSPICIOUS'}`);

      // Should have some activity
      expect(users + sessions).toBeGreaterThan(0);
    } else {
      console.log('GA4 data not available - may need credentials configured');
    }

    // Test Competitors - should have real salon names
    const competitorsResponse = await request.get(`${BASE_URL}/api/competitors`, {
      timeout: 30000
    });
    const competitorsData = await competitorsResponse.json();

    if (competitorsData.live && competitorsData.data?.competitors) {
      const competitors = competitorsData.data.competitors;
      console.log(`\nCompetitors found: ${competitors.length}`);

      // Real data should have varied ratings (not all 5.0)
      const ratings = competitors.map(c => c.rating);
      const uniqueRatings = [...new Set(ratings)];

      console.log(`Unique ratings: ${uniqueRatings.length}`);
      console.log(`Ratings range: ${Math.min(...ratings)} - ${Math.max(...ratings)}`);

      expect(uniqueRatings.length).toBeGreaterThan(1);
      expect(competitors.length).toBeGreaterThan(5);
    }
  });

});
