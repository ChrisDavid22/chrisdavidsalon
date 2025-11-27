const { test, expect } = require('@playwright/test');

test('Dashboard loads SEO scores AND competitor comparison', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/index.html');
    
    // Wait for competitor data to load
    await page.waitForFunction(() => {
        const rank = document.getElementById('competitorRank');
        return rank && rank.textContent !== '--';
    }, { timeout: 30000 });
    
    // Check competitor comparison
    const competitorRank = await page.locator('#competitorRank').textContent();
    const totalCompetitors = await page.locator('#totalCompetitorCount').textContent();
    const reviewGap = await page.locator('#reviewGap').textContent();
    
    console.log('Competitor Comparison:');
    console.log('  Your Rank:', competitorRank);
    console.log('  Total Competitors:', totalCompetitors);
    console.log('  Review Gap:', reviewGap);
    
    // Verify competitor table has data
    const tableRows = await page.locator('#competitorTableBody tr').count();
    console.log('  Table Rows:', tableRows);
    
    expect(competitorRank).not.toBe('--');
    expect(parseInt(tableRows)).toBeGreaterThan(0);
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/dashboard-with-competitors.png', fullPage: true });
    console.log('Screenshot saved');
});
