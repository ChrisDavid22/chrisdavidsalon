// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://www.chrisdavidsalon.com';

test.describe('Full Cache Loading Test', () => {
    test('Run analysis fully, then verify instant second load', async ({ page }) => {
        // Capture console logs
        const logs = [];
        page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));

        // STEP 1: Clear cache and run full analysis
        console.log('=== STEP 1: Fresh analysis ===');
        await page.goto(`${BASE_URL}/admin/index.html`);
        await page.evaluate(() => localStorage.clear());
        await page.goto(`${BASE_URL}/admin/index.html`, { waitUntil: 'networkidle' });

        // Click analyze
        await page.locator('button:has-text("Analyze with AI")').click();

        // Wait for ALL scores to load (watch for total score to have a value)
        console.log('Waiting for full analysis...');
        let attempts = 0;
        while (attempts < 24) { // 2 minutes max
            await page.waitForTimeout(5000);
            attempts++;

            const total = await page.locator('#totalScore').textContent();
            const content = await page.locator('#contentScore').textContent();
            const local = await page.locator('#localScore').textContent();
            const auth = await page.locator('#authorityScore').textContent();

            console.log(`After ${attempts * 5}s: Total=${total}, Content=${content}, Local=${local}, Auth=${auth}`);

            // Check if total is populated (not -- or --/100)
            if (total && !total.includes('--')) {
                console.log('All scores loaded!');
                break;
            }
        }

        // Screenshot after analysis
        await page.screenshot({ path: 'test-results/full-cache-1-analyzed.png', fullPage: true });

        // Get all final scores
        const scores1 = {
            performance: await page.locator('#performanceScore').textContent(),
            technical: await page.locator('#technicalScore').textContent(),
            mobile: await page.locator('#mobileScore').textContent(),
            content: await page.locator('#contentScore').textContent(),
            local: await page.locator('#localScore').textContent(),
            ux: await page.locator('#uxScore').textContent(),
            authority: await page.locator('#authorityScore').textContent(),
            total: await page.locator('#totalScore').textContent(),
            yourScore: await page.locator('#yourScore').textContent(),
        };
        console.log('First run scores:', JSON.stringify(scores1, null, 2));

        // Check cache was saved
        const cache = await page.evaluate(() => localStorage.getItem('seoCommandCenterData'));
        console.log('Cache saved:', cache ? 'YES' : 'NO');
        if (cache) {
            const parsed = JSON.parse(cache);
            console.log('Cached scoreData:', JSON.stringify(parsed.scoreData));
        }

        // STEP 2: Navigate away and back
        console.log('\n=== STEP 2: Navigate away and back ===');
        await page.goto('https://www.google.com');
        await page.waitForTimeout(2000);

        // Return to page
        const startTime = Date.now();
        await page.goto(`${BASE_URL}/admin/index.html`, { waitUntil: 'domcontentloaded' });

        // Wait just 1 second for cache to load (should be instant)
        await page.waitForTimeout(1000);
        const loadTime = Date.now() - startTime;

        // Screenshot immediately
        await page.screenshot({ path: 'test-results/full-cache-2-instant-load.png', fullPage: true });

        // Get scores on second load
        const scores2 = {
            performance: await page.locator('#performanceScore').textContent(),
            technical: await page.locator('#technicalScore').textContent(),
            mobile: await page.locator('#mobileScore').textContent(),
            content: await page.locator('#contentScore').textContent(),
            local: await page.locator('#localScore').textContent(),
            ux: await page.locator('#uxScore').textContent(),
            authority: await page.locator('#authorityScore').textContent(),
            total: await page.locator('#totalScore').textContent(),
            yourScore: await page.locator('#yourScore').textContent(),
        };

        console.log(`Page loaded in ${loadTime}ms`);
        console.log('Second load scores:', JSON.stringify(scores2, null, 2));

        // Print any relevant console logs
        console.log('\n=== Page Console Logs ===');
        logs.filter(l => l.includes('cache') || l.includes('Cache') || l.includes('score')).forEach(l => console.log(l));

        // VERIFY: Scores should match or be very similar
        // At minimum, performance score should be populated from cache
        expect(scores2.performance).not.toBe('--');
        expect(scores2.yourScore).not.toBe('--');
    });
});
