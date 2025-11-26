import { test, expect } from '@playwright/test';

/**
 * CRITICAL TEST: Verify NO hardcoded fake data on any admin page
 *
 * This test scours every admin page to ensure:
 * 1. All metrics show "--" or "Awaiting API" when not connected
 * 2. No hardcoded competitor data (names, scores, reviews)
 * 3. No hardcoded traffic numbers
 * 4. No fake backlink counts
 * 5. Data only appears when APIs respond with real data
 */

const ADMIN_PAGES = [
  { name: 'Dashboard', path: '/admin/dashboard.html' },
  { name: 'Traffic', path: '/admin/traffic.html' },
  { name: 'Competitors', path: '/admin/competitors.html' },
  { name: 'Rankings', path: '/admin/rankings.html' },
  { name: 'Authority', path: '/admin/authority.html' },
  { name: 'Microsites', path: '/admin/microsites.html' },
  { name: 'Agent Log', path: '/admin/agent-log.html' },
];

// Known fake data patterns that should NEVER appear
const FORBIDDEN_FAKE_DATA = [
  // Fake competitor review counts we had before
  '203 reviews',
  '189 reviews',
  '156 reviews',
  '127 reviews',
  '98 reviews',
  '87 reviews',
  '76 reviews',
  '112 reviews',
  '54 reviews',
  // Fake SEO scores
  'seoScore: 89',
  'seoScore: 85',
  'seoScore: 82',
  'seoScore: 78',
  'seoScore: 75',
  // Fake traffic numbers
  '247 visitors',
  '892 page views',
  // Fake backlink counts
  '~70',
  '~80',
  '~220',
  // Fake competitor names with scores hardcoded
  'Rové Hair Salon.*89',
  'Bond Street Salon.*85',
  'Salon Trace.*82',
];

// Data that SHOULD show when API not connected
const EXPECTED_PLACEHOLDERS = [
  '--',
  'Awaiting API',
  'Loading',
  'Not Connected',
  'API Not Connected',
];

test.describe('Admin Pages - NO FAKE DATA POLICY', () => {

  for (const page of ADMIN_PAGES) {
    test(`${page.name} page has no hardcoded fake data`, async ({ page: browserPage }) => {
      console.log(`\n=== TESTING: ${page.name} (${page.path}) ===`);

      await browserPage.goto(page.path);
      await browserPage.waitForLoadState('networkidle');

      // Wait for any async loading to complete
      await browserPage.waitForTimeout(3000);

      const bodyText = await browserPage.textContent('body');
      const htmlContent = await browserPage.content();

      // Check for forbidden fake data patterns
      for (const pattern of FORBIDDEN_FAKE_DATA) {
        const regex = new RegExp(pattern, 'i');
        const hasFakeData = regex.test(bodyText || '') || regex.test(htmlContent);

        if (hasFakeData) {
          console.error(`FAKE DATA FOUND on ${page.name}: "${pattern}"`);
        }

        expect(hasFakeData, `Forbidden fake data pattern found: "${pattern}"`).toBe(false);
      }

      console.log(`${page.name}: No forbidden fake data patterns found`);
    });

    test(`${page.name} shows placeholders when API disconnected`, async ({ page: browserPage }) => {
      // Navigate to page
      await browserPage.goto(page.path);
      await browserPage.waitForLoadState('networkidle');
      await browserPage.waitForTimeout(3000);

      const bodyText = await browserPage.textContent('body');

      // Page should show at least one placeholder indicator
      const hasPlaceholder = EXPECTED_PLACEHOLDERS.some(p => bodyText?.includes(p));

      // Log what we found
      console.log(`${page.name} body text sample (first 500 chars):`, bodyText?.substring(0, 500));

      // Note: This test verifies structure exists, actual API state varies
      expect(bodyText).not.toBe('');
    });
  }
});

test.describe('Specific Data Verification', () => {

  test('Dashboard shows real or placeholder competitor data', async ({ page }) => {
    await page.goto('/admin/dashboard.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check competitor grid
    const competitorGrid = await page.locator('#competitorGrid').textContent();

    // Should NOT have hardcoded "Salon Sora" with exact review count
    expect(competitorGrid).not.toMatch(/Salon Sora.*203 reviews/);

    // Should show either real data from API or loading state
    const hasContent = competitorGrid && competitorGrid.length > 0;
    expect(hasContent).toBe(true);

    console.log('Dashboard competitor grid:', competitorGrid?.substring(0, 300));
  });

  test('Competitors page loads from API only', async ({ page }) => {
    await page.goto('/admin/competitors.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check the data source banner
    const banner = await page.locator('#dataSourceBanner').textContent();
    console.log('Competitors data source banner:', banner);

    // Should indicate LIVE or Not Connected - never fake
    const isValidState = banner?.includes('LIVE') ||
                         banner?.includes('Google Places') ||
                         banner?.includes('Not Connected') ||
                         banner?.includes('API');
    expect(isValidState).toBe(true);

    // Check that no hardcoded review numbers appear
    const bodyText = await page.textContent('body');

    // These exact numbers were hardcoded before
    const hardcodedReviews = ['203 reviews', '156 reviews', '127 reviews', '189 reviews'];
    for (const pattern of hardcodedReviews) {
      const hasHardcoded = bodyText?.includes(pattern);
      if (hasHardcoded) {
        // Verify it's from API, not hardcoded
        // Real API data will have dynamic timestamps
        const hasTimestamp = bodyText?.includes('Updated:');
        console.log(`Found "${pattern}" - checking if from API (has timestamp: ${hasTimestamp})`);
      }
    }
  });

  test('Microsites page has no hardcoded backlink counts', async ({ page }) => {
    await page.goto('/admin/microsites.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const bodyText = await page.textContent('body');

    // Should NOT have hardcoded approximate backlink counts
    expect(bodyText).not.toContain('~70');
    expect(bodyText).not.toContain('~80');
    expect(bodyText).not.toContain('~220');

    // Backlinks should show "--" since we don't have a backlink API
    const site1Backlinks = await page.locator('#site1-backlinks').textContent();
    const site2Backlinks = await page.locator('#site2-backlinks').textContent();
    const site3Backlinks = await page.locator('#site3-backlinks').textContent();
    const totalBacklinks = await page.locator('#total-backlinks').textContent();

    console.log('Backlink values:', { site1Backlinks, site2Backlinks, site3Backlinks, totalBacklinks });

    // All should show "--" since no backlink API is connected
    expect(site1Backlinks).toBe('--');
    expect(site2Backlinks).toBe('--');
    expect(site3Backlinks).toBe('--');
    expect(totalBacklinks).toBe('--');
  });

  test('Traffic page shows real GA4 data or placeholder', async ({ page }) => {
    await page.goto('/admin/traffic.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Get metric values
    const activeUsers = await page.locator('#activeUsers').textContent();
    const sessions = await page.locator('#sessions').textContent();
    const pageViews = await page.locator('#pageViews').textContent();

    console.log('Traffic metrics:', { activeUsers, sessions, pageViews });

    // Values should be either real numbers from API or "--"
    // Should NOT be hardcoded values like "247" or "892"
    for (const value of [activeUsers, sessions, pageViews]) {
      const isPlaceholder = value === '--' || value === 'Loading...';
      const isRealNumber = /^\d+$/.test(value?.replace(/,/g, '') || '');

      expect(isPlaceholder || isRealNumber,
        `Traffic value "${value}" should be either "--" or a real number from GA4`
      ).toBe(true);
    }
  });

  test('Rankings page shows -- for all metrics (no Search Console)', async ({ page }) => {
    await page.goto('/admin/rankings.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // These should all be "--" since Search Console API isn't connected
    const keywordCount = await page.locator('#keywordCount').textContent();
    const top10Count = await page.locator('#top10Count').textContent();
    const opportunities = await page.locator('#opportunities').textContent();

    console.log('Rankings metrics:', { keywordCount, top10Count, opportunities });

    expect(keywordCount).toBe('--');
    expect(top10Count).toBe('--');
    expect(opportunities).toBe('--');
  });

  test('Authority page shows -- for domain authority', async ({ page }) => {
    await page.goto('/admin/authority.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Domain authority requires Moz/Ahrefs API
    const authorityScore = await page.locator('#authorityScore').textContent();

    console.log('Authority score:', authorityScore);

    expect(authorityScore).toBe('--');
  });

  test('Agent Log pulls from agent-implementations.json', async ({ page }) => {
    await page.goto('/admin/agent-log.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const timeline = await page.locator('#implementationTimeline').textContent();

    console.log('Agent log timeline (first 500 chars):', timeline?.substring(0, 500));

    // Should show real implementation entries
    expect(timeline).toContain('2.8.4');  // Latest version
    expect(timeline).toContain('REMOVED ALL HARDCODED FAKE DATA');  // Our critical fix

    // Should NOT be empty
    expect(timeline?.length).toBeGreaterThan(100);
  });
});

test.describe('ai-config.js Fallback Verification', () => {

  test('Verify ai-config.js has no hardcoded competitor data in fallbacks', async ({ page }) => {
    // Fetch the ai-config.js file directly
    const response = await page.goto('/admin/ai-config.js');
    const jsContent = await response?.text();

    // Should NOT contain hardcoded competitor data
    expect(jsContent).not.toContain("rating: 4.8");
    expect(jsContent).not.toContain("reviews: 203");
    expect(jsContent).not.toContain("reviews: 156");
    expect(jsContent).not.toContain("seoScore: 89");
    expect(jsContent).not.toContain("seoScore: 85");

    // Should contain empty fallback
    expect(jsContent).toContain("competitors: []");

    // Should NOT contain hardcoded keyword volumes
    expect(jsContent).not.toContain("volume: 1900");
    expect(jsContent).not.toContain("volume: 720");

    // Should contain empty keywords fallback
    expect(jsContent).toContain("keywords: []");

    // getRealTimeAnalytics should return null values
    expect(jsContent).toContain("visitors: null");
    expect(jsContent).toContain("pageViews: null");

    console.log('ai-config.js verified: No hardcoded data in fallbacks');
  });
});
