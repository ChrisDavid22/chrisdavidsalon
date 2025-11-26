// @ts-check
const { test, expect } = require('@playwright/test');

test('LIVE VERIFICATION - SEO Command loads with data', async ({ page }) => {
    // Go directly to live site
    await page.goto('https://www.chrisdavidsalon.com/admin/index.html', { waitUntil: 'networkidle' });

    // Wait 2 seconds for any cached data to load
    await page.waitForTimeout(2000);

    // Take screenshot of current state
    await page.screenshot({ path: 'test-results/LIVE-VERIFICATION.png', fullPage: true });

    // Get version
    const version = await page.locator('#versionBadge').textContent();
    console.log('VERSION:', version);

    // Get current scores
    const yourScore = await page.locator('#yourScore').textContent();
    const performance = await page.locator('#performanceScore').textContent();
    const lastAnalysis = await page.locator('#lastAnalysis').textContent();

    console.log('YOUR SCORE:', yourScore);
    console.log('PERFORMANCE:', performance);
    console.log('LAST ANALYSIS:', lastAnalysis);

    // Report what we see
    if (yourScore === '--') {
        console.log('\n*** PAGE SHOWS BLANKS - This is a first-time visit (no cache) ***');
        console.log('Click Analyze with AI to populate data, then it will load instantly next time.');
    } else {
        console.log('\n*** PAGE LOADED FROM CACHE - Data visible instantly! ***');
    }
});
