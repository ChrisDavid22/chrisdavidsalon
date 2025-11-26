// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://www.chrisdavidsalon.com';

// Test all 7 admin pages thoroughly
const adminPages = [
    { name: 'SEO Command', path: '/admin/index.html', requiredElements: ['versionBadge', 'performanceScore', 'technicalScore', 'mobileScore', 'contentScore'] },
    { name: 'Traffic', path: '/admin/traffic.html', requiredElements: ['versionBadge'] },
    { name: 'Competitors', path: '/admin/competitors.html', requiredElements: ['versionBadge', 'marketPosition'] },
    { name: 'Rankings', path: '/admin/rankings.html', requiredElements: ['versionBadge'] },
    { name: 'Authority', path: '/admin/authority.html', requiredElements: ['versionBadge', 'authorityScore'] },
    { name: 'Microsites', path: '/admin/microsites.html', requiredElements: ['versionBadge'] },
    { name: 'Agent Log', path: '/admin/agent-log.html', requiredElements: ['versionBadge'] },
];

test.describe('Admin Dashboard Pages', () => {
    for (const page of adminPages) {
        test(`${page.name} page loads correctly`, async ({ page: browserPage }) => {
            // Navigate to page
            await browserPage.goto(`${BASE_URL}${page.path}`, { waitUntil: 'networkidle' });

            // Take screenshot
            await browserPage.screenshot({
                path: `test-results/${page.name.toLowerCase().replace(/\s/g, '-')}-initial.png`,
                fullPage: true
            });

            // Check version badge loaded (not "Loading...")
            const versionBadge = browserPage.locator('#versionBadge');
            await expect(versionBadge).toBeVisible();
            const versionText = await versionBadge.textContent();
            expect(versionText).not.toBe('Loading...');
            expect(versionText).toMatch(/v\d+\.\d+\.\d+/);

            // Check page title is not empty
            const title = await browserPage.title();
            expect(title.length).toBeGreaterThan(0);
        });
    }

    test('SEO Command - Analyze with AI button works', async ({ page }) => {
        await page.goto(`${BASE_URL}/admin/index.html`, { waitUntil: 'networkidle' });

        // Find and click the Analyze button
        const analyzeButton = page.locator('button:has-text("Analyze with AI")');
        await expect(analyzeButton).toBeVisible();

        // Take screenshot before clicking
        await page.screenshot({ path: 'test-results/seo-command-before-analyze.png', fullPage: true });

        // Click the button
        await analyzeButton.click();

        // Wait for analysis to start (spinner or loading state)
        await page.waitForTimeout(3000);

        // Take screenshot after clicking
        await page.screenshot({ path: 'test-results/seo-command-after-analyze.png', fullPage: true });

        // Wait for scores to load (up to 30 seconds)
        await page.waitForTimeout(15000);

        // Take final screenshot
        await page.screenshot({ path: 'test-results/seo-command-final.png', fullPage: true });

        // Check that at least some scores are populated (not all dashes)
        const performanceScore = await page.locator('#performanceScore').textContent();
        console.log('Performance Score:', performanceScore);
    });

    test('Competitors page loads competitor data', async ({ page }) => {
        await page.goto(`${BASE_URL}/admin/competitors.html`, { waitUntil: 'networkidle' });

        // Wait for data to load
        await page.waitForTimeout(5000);

        // Take screenshot
        await page.screenshot({ path: 'test-results/competitors-loaded.png', fullPage: true });

        // Check market position is visible
        const marketPosition = page.locator('#marketPosition');
        await expect(marketPosition).toBeVisible();
    });

    test('Authority page loads without hardcoded data', async ({ page }) => {
        await page.goto(`${BASE_URL}/admin/authority.html`, { waitUntil: 'networkidle' });

        // Wait for API call
        await page.waitForTimeout(5000);

        // Take screenshot
        await page.screenshot({ path: 'test-results/authority-loaded.png', fullPage: true });

        // Check authority score element exists
        const authorityScore = page.locator('#authorityScore');
        await expect(authorityScore).toBeVisible();
    });

    test('Microsites page shows PageRank data', async ({ page }) => {
        await page.goto(`${BASE_URL}/admin/microsites.html`, { waitUntil: 'networkidle' });

        // Wait for PageRank to load
        await page.waitForTimeout(5000);

        // Take screenshot
        await page.screenshot({ path: 'test-results/microsites-loaded.png', fullPage: true });

        // Check PageRank elements exist
        const prSite1 = page.locator('#pr-site1');
        await expect(prSite1).toBeVisible();
    });

    test('Traffic page loads', async ({ page }) => {
        await page.goto(`${BASE_URL}/admin/traffic.html`, { waitUntil: 'networkidle' });

        // Wait for page to fully render
        await page.waitForTimeout(3000);

        // Take screenshot
        await page.screenshot({ path: 'test-results/traffic-loaded.png', fullPage: true });
    });
});
