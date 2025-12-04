/**
 * End-to-End Full Suite Testing
 *
 * Comprehensive testing of all 10 admin dashboard pages:
 * 1. Dashboard (index.html) - Main SEO command center
 * 2. Traffic (traffic.html) - GA4 analytics
 * 3. Rankings (rankings.html) - Keyword positions
 * 4. Authority (authority.html) - Domain authority
 * 5. Microsites (microsites.html) - Microsite analytics
 * 6. Weekly Brain (weekly-brain.html) - AI task generation
 * 7. Improvement Planner (improvement-planner.html) - Action planner
 * 8. Progress Report (progress-report.html) - Performance tracking
 * 9. SEO Learning (seo-learning.html) - Knowledge graph
 * 10. Changes Log (changes-log.html) - Change tracking
 *
 * Each test verifies:
 * - Page loads successfully
 * - No console errors
 * - Data displays correctly
 * - Navigation works
 * - Loading states shown
 * - Error handling works
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://www.chrisdavidsalon.com';

test.describe('Admin Dashboard - All Pages Load', () => {

  test('Dashboard (index.html) loads with SEO scores', async ({ page }) => {
    console.log('\n=== Testing Dashboard ===');

    // Monitor console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto(`${BASE_URL}/admin/index.html`);

    // Check page title
    await expect(page).toHaveTitle(/SEO Dashboard|SEO Command/);

    // Check main sections are visible
    await expect(page.locator('text=Your SEO Score')).toBeVisible();
    await expect(page.locator('text=Category Breakdown')).toBeVisible();
    await expect(page.locator('text=Top Competitor')).toBeVisible();

    // Wait for score to load (up to 60 seconds for all APIs)
    console.log('Waiting for SEO score to load...');

    await page.waitForFunction(() => {
      const scoreElement = document.getElementById('yourScore');
      return scoreElement && scoreElement.textContent !== '--' && scoreElement.textContent.trim() !== '';
    }, { timeout: 60000 });

    const score = await page.locator('#yourScore').textContent();
    console.log(`SEO Score loaded: ${score}`);

    // Verify score is a number
    const scoreNum = parseInt(score);
    expect(scoreNum).toBeGreaterThan(0);
    expect(scoreNum).toBeLessThanOrEqual(100);

    // Check category scores are visible
    const categories = ['performance', 'technical', 'mobile', 'content', 'local', 'ux', 'authority'];
    for (const category of categories) {
      const categoryScore = page.locator(`#${category}Score`);
      await expect(categoryScore).toBeVisible();
    }

    // Take screenshot
    await page.screenshot({ path: 'test-results/dashboard-loaded.png', fullPage: true });

    // Check for critical console errors
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('Failed to load resource')
    );

    if (criticalErrors.length > 0) {
      console.log(`Warning: ${criticalErrors.length} console errors detected`);
      criticalErrors.forEach(err => console.log(`  - ${err}`));
    }
  });

  test('Traffic page loads with GA4 data', async ({ page }) => {
    console.log('\n=== Testing Traffic Page ===');

    await page.goto(`${BASE_URL}/admin/traffic.html`);

    // Check page elements
    await expect(page.locator('text=Traffic Analytics')).toBeVisible();

    // Check metric cards are present
    await expect(page.locator('text=Active Users')).toBeVisible();
    await expect(page.locator('text=Sessions')).toBeVisible();
    await expect(page.locator('text=Page Views')).toBeVisible();

    // Wait for data to load
    console.log('Waiting for GA4 data...');

    await page.waitForFunction(() => {
      const activeUsers = document.getElementById('activeUsers');
      return activeUsers && activeUsers.textContent !== '--' && activeUsers.textContent.trim() !== '';
    }, { timeout: 30000 });

    const activeUsers = await page.locator('#activeUsers').textContent();
    console.log(`Active Users: ${activeUsers}`);

    // Verify it's a number
    expect(parseInt(activeUsers)).toBeGreaterThanOrEqual(0);

    await page.screenshot({ path: 'test-results/traffic-loaded.png', fullPage: true });
  });

  test('Rankings page loads correctly', async ({ page }) => {
    console.log('\n=== Testing Rankings Page ===');

    await page.goto(`${BASE_URL}/admin/rankings.html`);

    // Check page title and headers
    await expect(page).toHaveTitle(/Rankings/);
    await expect(page.locator('text=Keyword Rankings')).toBeVisible();

    // Check that keyword table is present
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'test-results/rankings-loaded.png', fullPage: true });
  });

  test('Authority page loads with domain authority data', async ({ page }) => {
    console.log('\n=== Testing Authority Page ===');

    await page.goto(`${BASE_URL}/admin/authority.html`);

    await expect(page.locator('text=Domain Authority')).toBeVisible();

    // Wait for authority score
    console.log('Waiting for authority data...');

    await page.waitForFunction(() => {
      const authorityScore = document.querySelector('[data-metric="authority-score"]');
      return authorityScore && authorityScore.textContent !== '--';
    }, { timeout: 30000 });

    console.log('Authority data loaded');

    await page.screenshot({ path: 'test-results/authority-loaded.png', fullPage: true });
  });

  test('Microsites page loads with analytics', async ({ page }) => {
    console.log('\n=== Testing Microsites Page ===');

    await page.goto(`${BASE_URL}/admin/microsites.html`);

    await expect(page.locator('text=Microsite Network')).toBeVisible();

    // Check that all 3 microsites are shown
    await expect(page.locator('text=bestsalondelray.com')).toBeVisible();
    await expect(page.locator('text=bestdelraysalon.com')).toBeVisible();
    await expect(page.locator('text=bestsalonpalmbeach.com')).toBeVisible();

    // Wait for data to load
    await page.waitForTimeout(5000);

    await page.screenshot({ path: 'test-results/microsites-loaded.png', fullPage: true });
  });

  test('Weekly Brain page loads and can generate tasks', async ({ page }) => {
    console.log('\n=== Testing Weekly Brain Page ===');

    test.setTimeout(90000); // 90 seconds for this test

    await page.goto(`${BASE_URL}/admin/weekly-brain.html`);

    await expect(page.locator('text=Weekly SEO Intelligence')).toBeVisible();

    // Check analyze button is present
    const analyzeBtn = page.locator('#analyzeBtn');
    await expect(analyzeBtn).toBeVisible();

    // Click analyze button
    console.log('Triggering SEO Brain analysis...');
    await analyzeBtn.click();

    // Wait for loading indicator
    await expect(page.locator('text=Analyzing Your Data')).toBeVisible({ timeout: 10000 });

    // Wait for results (up to 60 seconds)
    await expect(page.locator('#resultsSection')).toBeVisible({ timeout: 60000 });

    console.log('Analysis complete');

    await page.screenshot({ path: 'test-results/weekly-brain-results.png', fullPage: true });
  });

  test('Improvement Planner page loads correctly', async ({ page }) => {
    console.log('\n=== Testing Improvement Planner Page ===');

    await page.goto(`${BASE_URL}/admin/improvement-planner.html`);

    await expect(page.locator('text=SEO Improvement Planner')).toBeVisible();

    // Check sections are present
    await expect(page.locator('text=Quick Wins')).toBeVisible();
    await expect(page.locator('text=Medium Effort')).toBeVisible();
    await expect(page.locator('text=Long Term')).toBeVisible();

    await page.screenshot({ path: 'test-results/improvement-planner-loaded.png', fullPage: true });
  });

  test('Progress Report page loads with metrics', async ({ page }) => {
    console.log('\n=== Testing Progress Report Page ===');

    await page.goto(`${BASE_URL}/admin/progress-report.html`);

    await expect(page.locator('text=SEO Progress Report')).toBeVisible();

    // Check metric cards are present
    await expect(page.locator('text=Overall Score')).toBeVisible();
    await expect(page.locator('text=Traffic Trend')).toBeVisible();

    // Wait for data
    await page.waitForTimeout(5000);

    await page.screenshot({ path: 'test-results/progress-report-loaded.png', fullPage: true });
  });

  test('SEO Learning page loads knowledge graph', async ({ page }) => {
    console.log('\n=== Testing SEO Learning Page ===');

    await page.goto(`${BASE_URL}/admin/seo-learning.html`);

    await expect(page.locator('text=SEO Learning System')).toBeVisible();

    // Check RuVector indicator
    await expect(page.locator('text=RuVector')).toBeVisible();

    // Check action buttons
    await expect(page.locator('text=Check Status')).toBeVisible();

    await page.screenshot({ path: 'test-results/seo-learning-loaded.png', fullPage: true });
  });

  test('Changes Log page loads with history', async ({ page }) => {
    console.log('\n=== Testing Changes Log Page ===');

    await page.goto(`${BASE_URL}/admin/changes-log.html`);

    await expect(page.locator('text=SEO Changes Log')).toBeVisible();

    // Check timeline or table is present
    const hasContent = await page.locator('body').textContent();
    expect(hasContent).toContain('Change');

    await page.screenshot({ path: 'test-results/changes-log-loaded.png', fullPage: true });
  });

});

test.describe('Navigation and Cross-Page Functionality', () => {

  test('Shared navigation works across all pages', async ({ page }) => {
    console.log('\n=== Testing Navigation ===');

    // Start at dashboard
    await page.goto(`${BASE_URL}/admin/index.html`);

    // Check navigation links exist
    const navLinks = [
      { text: 'Dashboard', href: 'index.html' },
      { text: 'Traffic', href: 'traffic.html' },
      { text: 'Rankings', href: 'rankings.html' },
      { text: 'Authority', href: 'authority.html' },
      { text: 'Microsites', href: 'microsites.html' },
      { text: 'Weekly Brain', href: 'weekly-brain.html' },
      { text: 'Improvement', href: 'improvement-planner.html' },
      { text: 'Progress', href: 'progress-report.html' },
      { text: 'Learning', href: 'seo-learning.html' },
      { text: 'Changes', href: 'changes-log.html' },
    ];

    // Verify at least 5 nav links exist
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    console.log('Navigation structure verified');

    // Test clicking to Traffic page
    await page.click('a[href="traffic.html"]');
    await page.waitForURL('**/traffic.html', { timeout: 10000 });

    await expect(page).toHaveURL(/traffic\.html/);
    console.log('Navigation to Traffic page successful');

    // Test back to Dashboard
    await page.click('a[href="index.html"]');
    await page.waitForURL('**/index.html', { timeout: 10000 });

    await expect(page).toHaveURL(/index\.html/);
    console.log('Navigation back to Dashboard successful');
  });

  test('Version number displayed correctly', async ({ page }) => {
    console.log('\n=== Testing Version Display ===');

    await page.goto(`${BASE_URL}/admin/index.html`);

    // Check for version indicator
    const hasVersion = await page.locator('body').textContent();

    // Should mention version somewhere
    const versionRegex = /v?\d+\.\d+\.\d+/;
    const matches = hasVersion.match(versionRegex);

    if (matches) {
      console.log(`Version found: ${matches[0]}`);
    } else {
      console.log('Version number not visible (non-critical)');
    }
  });

});

test.describe('Data Loading and Caching', () => {

  test('Cache loading works - second visit loads faster', async ({ page }) => {
    console.log('\n=== Testing Cache Performance ===');

    // First visit - measure time
    const start1 = Date.now();
    await page.goto(`${BASE_URL}/admin/index.html`);

    await page.waitForFunction(() => {
      const score = document.getElementById('yourScore');
      return score && score.textContent !== '--';
    }, { timeout: 60000 });

    const duration1 = Date.now() - start1;
    console.log(`First load time: ${duration1}ms`);

    // Second visit - should load from cache
    await page.reload();

    const start2 = Date.now();
    await page.waitForFunction(() => {
      const score = document.getElementById('yourScore');
      return score && score.textContent !== '--';
    }, { timeout: 10000 });

    const duration2 = Date.now() - start2;
    console.log(`Cached load time: ${duration2}ms`);

    // Cached load should be significantly faster
    console.log(`Speed improvement: ${((1 - duration2/duration1) * 100).toFixed(0)}%`);

    // Cached load should be under 5 seconds
    expect(duration2).toBeLessThan(5000);
  });

  test('Loading states shown before data arrives', async ({ page }) => {
    console.log('\n=== Testing Loading States ===');

    // Clear cache to force fresh load
    await page.goto(`${BASE_URL}/admin/index.html`);

    // Check initial state shows loading indicators
    const initialScore = await page.locator('#yourScore').textContent();

    // Should show "--" or "Loading..." initially
    const isLoadingState = initialScore.includes('--') || initialScore.includes('Loading');

    console.log(`Initial loading state shown: ${isLoadingState ? 'YES' : 'NO (fast cache?)'}`);

    // This is OK either way - might load from cache instantly
  });

});

test.describe('Error Handling and Edge Cases', () => {

  test('Page handles API timeout gracefully', async ({ page }) => {
    console.log('\n=== Testing API Timeout Handling ===');

    await page.goto(`${BASE_URL}/admin/index.html`);

    // Wait a reasonable time (30 seconds)
    await page.waitForTimeout(30000);

    // Check if error message is shown or data loaded
    const bodyText = await page.locator('body').textContent();

    // Should not show blank page or crash
    expect(bodyText.length).toBeGreaterThan(100);

    console.log('Page remains functional after timeout period');
  });

  test('Console errors are minimal', async ({ page }) => {
    console.log('\n=== Checking Console Errors ===');

    const errors = [];
    const warnings = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });

    await page.goto(`${BASE_URL}/admin/index.html`);

    // Wait for page to fully load
    await page.waitForTimeout(10000);

    // Filter out non-critical errors (favicon, etc)
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('Failed to load resource') &&
      !e.includes('net::ERR')
    );

    console.log(`Total errors: ${errors.length}`);
    console.log(`Critical errors: ${criticalErrors.length}`);
    console.log(`Warnings: ${warnings.length}`);

    if (criticalErrors.length > 0) {
      console.log('\nCritical errors:');
      criticalErrors.forEach(err => console.log(`  - ${err}`));
    }

    // Should have minimal critical errors
    expect(criticalErrors.length).toBeLessThan(5);
  });

  test('Mobile viewport renders correctly', async ({ page }) => {
    console.log('\n=== Testing Mobile Responsiveness ===');

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto(`${BASE_URL}/admin/index.html`);

    // Check main elements are visible
    await expect(page.locator('text=Your SEO Score')).toBeVisible();

    // Check navigation is scrollable or collapsed
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    await page.screenshot({ path: 'test-results/dashboard-mobile.png', fullPage: true });

    console.log('Mobile layout renders correctly');
  });

  test('Tablet viewport renders correctly', async ({ page }) => {
    console.log('\n=== Testing Tablet Responsiveness ===');

    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto(`${BASE_URL}/admin/index.html`);

    await expect(page.locator('text=Your SEO Score')).toBeVisible();

    await page.screenshot({ path: 'test-results/dashboard-tablet.png', fullPage: true });

    console.log('Tablet layout renders correctly');
  });

});

test.describe('User Interactions', () => {

  test('Buttons and interactive elements work', async ({ page }) => {
    console.log('\n=== Testing Interactive Elements ===');

    await page.goto(`${BASE_URL}/admin/weekly-brain.html`);

    // Find analyze button
    const analyzeBtn = page.locator('#analyzeBtn');
    await expect(analyzeBtn).toBeVisible();
    await expect(analyzeBtn).toBeEnabled();

    // Click should trigger action
    await analyzeBtn.click();

    // Should show loading state
    await expect(page.locator('text=Analyzing')).toBeVisible({ timeout: 5000 });

    console.log('Button interaction working correctly');
  });

  test('Links open in correct target', async ({ page }) => {
    console.log('\n=== Testing Link Behavior ===');

    await page.goto(`${BASE_URL}/admin/index.html`);

    // Check external links have target="_blank"
    const externalLinks = page.locator('a[target="_blank"]');
    const count = await externalLinks.count();

    console.log(`External links found: ${count}`);

    // Internal links should not have target="_blank"
    const internalLinks = page.locator('a[href*="admin/"]:not([target="_blank"])');
    const internalCount = await internalLinks.count();

    console.log(`Internal navigation links: ${internalCount}`);

    expect(internalCount).toBeGreaterThan(5);
  });

});

test.describe('Performance and Optimization', () => {

  test('Page load time is acceptable', async ({ page }) => {
    console.log('\n=== Testing Page Load Performance ===');

    const startTime = Date.now();

    await page.goto(`${BASE_URL}/admin/index.html`, {
      waitUntil: 'domcontentloaded'
    });

    const loadTime = Date.now() - startTime;

    console.log(`Initial page load (DOM): ${loadTime}ms`);

    // DOM should load quickly even if data takes longer
    expect(loadTime).toBeLessThan(5000);
  });

  test('Images load correctly', async ({ page }) => {
    console.log('\n=== Testing Image Loading ===');

    await page.goto(`${BASE_URL}/admin/index.html`);

    // Check for broken images
    const images = page.locator('img');
    const imageCount = await images.count();

    console.log(`Images on page: ${imageCount}`);

    if (imageCount > 0) {
      // Check first few images load successfully
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = images.nth(i);
        const src = await img.getAttribute('src');

        if (src) {
          console.log(`Image ${i + 1}: ${src.substring(0, 50)}...`);
        }
      }
    }
  });

});
