const { test, expect } = require('@playwright/test');

const pages = [
    { name: 'Dashboard', url: '/admin/index.html', check: '#yourScore' },
    { name: 'Traffic', url: '/admin/traffic.html', check: 'body' },
    { name: 'Rankings', url: '/admin/rankings.html', check: 'body' },
    { name: 'Authority', url: '/admin/authority.html', check: 'body' },
    { name: 'Microsites', url: '/admin/microsites.html', check: 'body' },
    { name: 'Improvement Planner', url: '/admin/improvement-planner.html', check: 'body' },
];

test('All admin pages load with content', async ({ page }) => {
    for (const p of pages) {
        console.log(`Testing: ${p.name}`);
        await page.goto(`http://localhost:3000${p.url}`);

        // Check page has content
        const bodyContent = await page.locator('body').textContent();
        expect(bodyContent.length).toBeGreaterThan(100);
        console.log(`  ✓ ${p.name} loaded (${bodyContent.length} chars)`);

        // Take screenshot
        const filename = p.name.toLowerCase().replace(/ /g, '-');
        await page.screenshot({ path: `tests/screenshots/${filename}.png`, fullPage: true });
    }
});

test('Dashboard loads SEO scores and competitor comparison', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/index.html');

    // Wait for SEO data to load
    await page.waitForFunction(() => {
        const score = document.getElementById('yourScore');
        return score && score.textContent !== '--' && score.textContent !== '';
    }, { timeout: 60000 });

    const yourScore = await page.locator('#yourScore').textContent();
    console.log('SEO Score:', yourScore);
    expect(yourScore).not.toBe('--');

    // Wait for competitor data
    await page.waitForFunction(() => {
        const rank = document.getElementById('competitorRank');
        return rank && rank.textContent !== '--';
    }, { timeout: 30000 });

    const competitorRank = await page.locator('#competitorRank').textContent();
    console.log('Competitor Rank:', competitorRank);
    expect(competitorRank).not.toBe('--');

    await page.screenshot({ path: 'tests/screenshots/dashboard-complete.png', fullPage: true });
});
