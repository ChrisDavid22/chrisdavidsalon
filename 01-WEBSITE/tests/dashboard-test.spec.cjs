const { test, expect } = require('@playwright/test');

test('Dashboard auto-loads and displays SEO scores', async ({ page }) => {
    // Clear localStorage to force fresh load
    await page.goto('http://localhost:3000/admin/index.html');
    await page.evaluate(() => localStorage.clear());
    
    // Reload to trigger fresh data fetch
    await page.reload();
    
    // Wait for loading to complete (max 30 seconds for API calls)
    console.log('Waiting for data to load...');
    
    // Wait for the loading indicator to disappear or for scores to appear
    await page.waitForFunction(() => {
        const score = document.getElementById('yourScore');
        return score && score.textContent !== '--' && score.textContent !== '';
    }, { timeout: 45000 });
    
    // Check that scores are populated
    const yourScore = await page.locator('#yourScore').textContent();
    const totalScore = await page.locator('#totalScore').textContent();
    const performanceScore = await page.locator('#performanceScore').textContent();
    const localScore = await page.locator('#localScore').textContent();
    const authorityScore = await page.locator('#authorityScore').textContent();
    
    console.log('Scores found:');
    console.log('  Your Score:', yourScore);
    console.log('  Total Score:', totalScore);
    console.log('  Performance:', performanceScore);
    console.log('  Local SEO:', localScore);
    console.log('  Authority:', authorityScore);
    
    // Verify scores are numbers, not dashes
    expect(yourScore).not.toBe('--');
    expect(totalScore).toContain('/100');
    expect(performanceScore).not.toBe('--');
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/dashboard-loaded.png', fullPage: true });
    console.log('Screenshot saved to tests/screenshots/dashboard-loaded.png');
});
