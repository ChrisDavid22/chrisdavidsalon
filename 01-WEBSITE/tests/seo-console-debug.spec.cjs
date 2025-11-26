// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://www.chrisdavidsalon.com';

test('Debug SEO Command with console logging', async ({ page }) => {
    const consoleLogs = [];

    // Capture ALL console messages
    page.on('console', msg => {
        consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Also capture page errors
    page.on('pageerror', err => {
        consoleLogs.push(`[PAGE_ERROR] ${err.message}`);
    });

    // Clear localStorage
    await page.goto(`${BASE_URL}/admin/index.html`);
    await page.evaluate(() => localStorage.clear());

    // Navigate fresh
    await page.goto(`${BASE_URL}/admin/index.html`, { waitUntil: 'networkidle' });

    console.log('Initial page load - checking console...');

    // Click analyze
    const analyzeButton = page.locator('button:has-text("Analyze with AI")');
    await analyzeButton.click();

    console.log('Clicked Analyze - waiting 60 seconds for completion...');

    // Wait for full analysis
    await page.waitForTimeout(60000);

    // Screenshot
    await page.screenshot({ path: 'test-results/debug-final.png', fullPage: true });

    // Get scores
    const perfScore = await page.locator('#performanceScore').textContent();
    const contentScore = await page.locator('#contentScore').textContent();
    const localScore = await page.locator('#localScore').textContent();
    const authScore = await page.locator('#authorityScore').textContent();
    const totalScore = await page.locator('#totalScore').textContent();

    console.log('\n=== FINAL SCORES ===');
    console.log('Performance:', perfScore);
    console.log('Content:', contentScore);
    console.log('Local:', localScore);
    console.log('Authority:', authScore);
    console.log('Total:', totalScore);

    console.log('\n=== CONSOLE LOGS FROM PAGE ===');
    consoleLogs.forEach(log => {
        if (log.includes('fetchContentScore') || log.includes('fetchLocalSEOScore') ||
            log.includes('fetchAuthorityScore') || log.includes('error') ||
            log.includes('Error') || log.includes('score')) {
            console.log(log);
        }
    });

    // At least check that the PageSpeed scores loaded
    expect(perfScore).not.toBe('--');
});
