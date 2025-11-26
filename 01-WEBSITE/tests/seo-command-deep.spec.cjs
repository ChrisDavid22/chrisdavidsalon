// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://www.chrisdavidsalon.com';

test.describe('SEO Command Deep Test', () => {
    test('Full analysis flow - wait for completion', async ({ page }) => {
        console.log('Starting deep test of SEO Command...');

        // Clear localStorage to simulate first visit
        await page.goto(`${BASE_URL}/admin/index.html`);
        await page.evaluate(() => localStorage.clear());

        // Now visit the page fresh
        await page.goto(`${BASE_URL}/admin/index.html`, { waitUntil: 'networkidle' });

        // Screenshot: Initial state
        await page.screenshot({ path: 'test-results/deep-1-initial.png', fullPage: true });

        // Verify shows "Never" since we cleared cache
        const lastAnalysis = await page.locator('#lastAnalysis').textContent();
        console.log('Last Analysis:', lastAnalysis);

        // Check version loaded
        const version = await page.locator('#versionBadge').textContent();
        console.log('Version:', version);

        // Find and click the Analyze button
        const analyzeButton = page.locator('button:has-text("Analyze with AI")');
        await expect(analyzeButton).toBeVisible();

        console.log('Clicking Analyze with AI button...');
        await analyzeButton.click();

        // Screenshot: Right after click
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'test-results/deep-2-after-click.png', fullPage: true });

        // Wait and take screenshots at intervals
        for (let i = 1; i <= 6; i++) {
            console.log(`Waiting ${i * 10} seconds...`);
            await page.waitForTimeout(10000);
            await page.screenshot({ path: `test-results/deep-3-${i * 10}sec.png`, fullPage: true });

            // Check if Performance score populated
            const perfScore = await page.locator('#performanceScore').textContent();
            console.log(`After ${i * 10}s - Performance Score: ${perfScore}`);

            if (perfScore !== '--') {
                console.log('Scores loaded!');
                break;
            }
        }

        // Final screenshot
        await page.screenshot({ path: 'test-results/deep-4-final.png', fullPage: true });

        // Get all scores
        const scores = {
            performance: await page.locator('#performanceScore').textContent(),
            technical: await page.locator('#technicalScore').textContent(),
            mobile: await page.locator('#mobileScore').textContent(),
            content: await page.locator('#contentScore').textContent(),
            local: await page.locator('#localScore').textContent(),
            ux: await page.locator('#uxScore').textContent(),
            authority: await page.locator('#authorityScore').textContent(),
            total: await page.locator('#totalScore').textContent(),
        };

        console.log('Final Scores:', JSON.stringify(scores, null, 2));

        // Check console for errors
        const consoleLogs = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleLogs.push(msg.text());
            }
        });

        // At least ONE score should be populated after 60 seconds
        const hasAnyScore = Object.values(scores).some(s => s !== '--' && s !== null);
        console.log('Has any score:', hasAnyScore);

        if (!hasAnyScore) {
            console.log('ERROR: No scores loaded after 60 seconds!');
        }
    });
});
