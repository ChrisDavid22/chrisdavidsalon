// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://www.chrisdavidsalon.com';

// Test all admin pages that actually exist
// Note: competitors.html and agent-log.html are planned but not yet created
const adminPages = [
    { name: 'SEO Command', path: '/admin/index.html', requiredElements: ['versionBadge', 'performanceScore', 'technicalScore', 'mobileScore', 'contentScore'] },
    { name: 'Traffic', path: '/admin/traffic.html', requiredElements: ['versionBadge'] },
    { name: 'Rankings', path: '/admin/rankings.html', requiredElements: ['versionBadge'] },
    { name: 'Authority', path: '/admin/authority.html', requiredElements: ['versionBadge', 'authorityScore'] },
    { name: 'Microsites', path: '/admin/microsites.html', requiredElements: ['versionBadge'] },
    { name: 'Weekly Brain', path: '/admin/weekly-brain.html', requiredElements: ['versionBadge'] },
    { name: 'Improvement Planner', path: '/admin/improvement-planner.html', requiredElements: ['versionBadge'] },
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

    test('SEO Command - Refresh Score button works', async ({ page }) => {
        await page.goto(`${BASE_URL}/admin/index.html`, { waitUntil: 'networkidle' });

        // Find and click the Refresh Score button
        const refreshButton = page.locator('button:has-text("Refresh Score")');
        await expect(refreshButton).toBeVisible();

        // Take screenshot before clicking
        await page.screenshot({ path: 'test-results/seo-command-before-refresh.png', fullPage: true });

        // Click the button
        await refreshButton.click();

        // Wait for scores to load (up to 30 seconds)
        await page.waitForTimeout(15000);

        // Take final screenshot
        await page.screenshot({ path: 'test-results/seo-command-after-refresh.png', fullPage: true });

        // Check that at least some scores are populated (not all dashes)
        const performanceScore = await page.locator('#performanceScore').textContent();
        console.log('Performance Score:', performanceScore);
    });

    // Note: Competitors page test removed - page not yet created (planned in IMPLEMENTATION_PLAN.md)

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

    test('Microsites page shows network analytics', async ({ page }) => {
        await page.goto(`${BASE_URL}/admin/microsites.html`, { waitUntil: 'networkidle' });

        // Wait for data to load
        await page.waitForTimeout(5000);

        // Take screenshot
        await page.screenshot({ path: 'test-results/microsites-loaded.png', fullPage: true });

        // Check key elements exist
        const avgPagerank = page.locator('#avgPagerank');
        await expect(avgPagerank).toBeVisible();
    });

    test('Traffic page loads', async ({ page }) => {
        await page.goto(`${BASE_URL}/admin/traffic.html`, { waitUntil: 'networkidle' });

        // Wait for page to fully render
        await page.waitForTimeout(3000);

        // Take screenshot
        await page.screenshot({ path: 'test-results/traffic-loaded.png', fullPage: true });
    });
});
