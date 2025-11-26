// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://www.chrisdavidsalon.com';

test.describe('Cache Loading Test', () => {
    test('Second visit should load from cache instantly', async ({ page }) => {
        // STEP 1: First visit - clear cache and run analysis
        console.log('STEP 1: First visit - clear and analyze');
        await page.goto(`${BASE_URL}/admin/index.html`);
        await page.evaluate(() => localStorage.clear());
        await page.goto(`${BASE_URL}/admin/index.html`, { waitUntil: 'networkidle' });

        // Click analyze
        const analyzeButton = page.locator('button:has-text("Analyze with AI")');
        await analyzeButton.click();

        // Wait for scores to populate (watch Performance score specifically)
        console.log('Waiting for analysis to complete...');
        for (let i = 0; i < 12; i++) {
            await page.waitForTimeout(5000);
            const perf = await page.locator('#performanceScore').textContent();
            console.log(`After ${(i + 1) * 5}s: Performance = ${perf}`);
            if (perf !== '--') break;
        }

        // Screenshot after first analysis
        await page.screenshot({ path: 'test-results/cache-1-after-analysis.png', fullPage: true });

        // Check what's in cache
        const cache = await page.evaluate(() => localStorage.getItem('seoCommandCenterData'));
        console.log('Cache exists:', cache ? 'YES' : 'NO');
        if (cache) {
            const parsed = JSON.parse(cache);
            console.log('Cached scores:', JSON.stringify(parsed.scoreData));
        }

        // STEP 2: Navigate away
        console.log('\nSTEP 2: Navigate away...');
        await page.goto('https://www.google.com');
        await page.waitForTimeout(2000);

        // STEP 3: Come back - should load from cache INSTANTLY
        console.log('\nSTEP 3: Return to page - should be instant');
        const startTime = Date.now();
        await page.goto(`${BASE_URL}/admin/index.html`, { waitUntil: 'domcontentloaded' });

        // Check scores immediately (within 500ms of DOM ready)
        await page.waitForTimeout(500);
        const loadTime = Date.now() - startTime;

        const perfScore = await page.locator('#performanceScore').textContent();
        const totalScore = await page.locator('#totalScore').textContent();

        console.log(`Page loaded in ${loadTime}ms`);
        console.log(`Performance Score: ${perfScore}`);
        console.log(`Total Score: ${totalScore}`);

        // Screenshot
        await page.screenshot({ path: 'test-results/cache-2-second-visit.png', fullPage: true });

        // The scores should NOT be '--' if cache is working
        expect(perfScore).not.toBe('--');
    });
});
