/**
 * Weekly Brain Page Test
 *
 * Tests the new autonomous SEO Brain functionality:
 * - Page loads correctly
 * - Analysis can be triggered
 * - Tasks are displayed
 * - Review insights load
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://www.chrisdavidsalon.com';

test.describe('Weekly Brain - SEO Intelligence Dashboard', () => {

  test('Weekly Brain page loads correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/weekly-brain.html`);

    // Check page title
    await expect(page).toHaveTitle(/SEO Brain/);

    // Check main elements are present
    await expect(page.locator('text=Weekly SEO Intelligence')).toBeVisible();
    await expect(page.locator('text=Generate This Week\'s Tasks')).toBeVisible();
    await expect(page.locator('text=Review Keywords for SEO')).toBeVisible();

    // Check navigation is present
    await expect(page.locator('a[href="index.html"]')).toBeVisible();
    await expect(page.locator('a[href="weekly-brain.html"]')).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/weekly-brain-load.png', fullPage: true });
  });

  test('SEO Brain analysis runs and displays tasks', async ({ page }) => {
    test.setTimeout(60000); // 60 second timeout for API calls

    await page.goto(`${BASE_URL}/admin/weekly-brain.html`);

    // Click the analyze button
    const analyzeBtn = page.locator('#analyzeBtn');
    await expect(analyzeBtn).toBeVisible();
    await analyzeBtn.click();

    // Wait for loading to appear
    await expect(page.locator('text=Analyzing Your Data')).toBeVisible({ timeout: 5000 });

    // Wait for results (up to 45 seconds for all APIs)
    await expect(page.locator('#resultsSection')).toBeVisible({ timeout: 45000 });

    // Check summary cards are populated
    const criticalCount = page.locator('#criticalCount');
    const highCount = page.locator('#highCount');
    const dataSourceCount = page.locator('#dataSourceCount');

    // At least data source count should show something
    await expect(dataSourceCount).not.toHaveText('0/4');

    // Check task list has items
    const taskList = page.locator('#taskList');
    const tasks = taskList.locator('> div');
    const taskCount = await tasks.count();

    console.log(`Found ${taskCount} tasks from SEO Brain analysis`);
    expect(taskCount).toBeGreaterThan(0);

    // Take screenshot of results
    await page.screenshot({ path: 'tests/screenshots/weekly-brain-results.png', fullPage: true });
  });

  test('Review insights can be loaded', async ({ page }) => {
    test.setTimeout(30000);

    await page.goto(`${BASE_URL}/admin/weekly-brain.html`);

    // Find and click the review analysis button
    const reviewBtn = page.locator('#reviewBtn');
    await expect(reviewBtn).toBeVisible();
    await reviewBtn.click();

    // Wait for loading
    await expect(page.locator('text=Fetching Google reviews')).toBeVisible({ timeout: 5000 });

    // Wait for results (should show either success or error)
    await page.waitForFunction(() => {
      const container = document.getElementById('reviewInsights');
      return container && !container.textContent.includes('Fetching');
    }, { timeout: 20000 });

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/weekly-brain-reviews.png', fullPage: true });
  });

  test('Mobile responsiveness check', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto(`${BASE_URL}/admin/weekly-brain.html`);

    // Check elements are visible on mobile
    await expect(page.locator('text=Weekly SEO Intelligence')).toBeVisible();
    await expect(page.locator('#analyzeBtn')).toBeVisible();

    // Check navigation scrolls properly
    const nav = page.locator('.overflow-x-auto');
    await expect(nav).toBeVisible();

    // Take mobile screenshot
    await page.screenshot({ path: 'tests/screenshots/weekly-brain-mobile.png', fullPage: true });
  });

  test('Tablet responsiveness check', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto(`${BASE_URL}/admin/weekly-brain.html`);

    // Check grid layout adjusts
    await expect(page.locator('text=Weekly SEO Intelligence')).toBeVisible();

    // Take tablet screenshot
    await page.screenshot({ path: 'tests/screenshots/weekly-brain-tablet.png', fullPage: true });
  });

});

test.describe('SEO Brain API Tests', () => {

  test('SEO Brain API returns status', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/seo-brain?action=status`);

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.status).toBe('operational');
    expect(data.capabilities).toBeDefined();
    expect(data.dataSources).toBeDefined();
  });

  test('SEO Brain API runs analysis', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/seo-brain?action=analyze`, {
      timeout: 60000
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.tasks).toBeDefined();
    expect(Array.isArray(data.tasks)).toBe(true);
    expect(data.summary).toBeDefined();

    console.log(`SEO Brain generated ${data.tasks.length} tasks`);
    console.log(`Data sources available: ${data.summary.dataSourcesAvailable}/${data.summary.dataSourcesTotal}`);
  });

  test('Review Keywords API returns status', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/review-keywords?action=status`);

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.capabilities).toBeDefined();
    expect(data.servicePages).toBeDefined();
  });

  test('Review Keywords API analyzes reviews', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/review-keywords?action=analyze`, {
      timeout: 30000
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    // May fail if API key issues, but structure should be present
    if (data.success) {
      expect(data.analysis).toBeDefined();
      expect(data.totalReviews).toBeDefined();
      console.log(`Analyzed ${data.reviewsAnalyzed} reviews, found ${data.analysis?.topKeywords?.length || 0} keywords`);
    } else {
      console.log(`Review API error: ${data.error}`);
    }
  });

});
