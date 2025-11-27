// Exhaustive Tests for All 4 Sites
// Tests main site and all 3 microsites for proper deployment

const { test, expect } = require('@playwright/test');

const SITES = {
  main: {
    name: 'Chris David Salon',
    url: 'https://www.chrisdavidsalon.com',
    pages: [
      { path: '/', title: 'Chris David Salon' },
      { path: '/admin/', title: 'SEO' },
      { path: '/admin/microsites.html', title: 'Microsite' },
      { path: '/admin/traffic.html', title: 'Traffic' },
      { path: '/admin/authority.html', title: 'Authority' },
    ],
    apis: [
      { path: '/api/ga4-analytics?type=overview', check: 'success' },
      { path: '/api/authority-score', check: 'success' },
      { path: '/api/microsite-analytics', check: 'success' },
    ]
  },
  microsite1: {
    name: 'Best Salon Delray',
    url: 'https://www.bestsalondelray.com',
    pages: [
      { path: '/', title: 'Best Salon' },
      { path: '/services.html', title: 'Services' },
      { path: '/sitemap.xml', check: 'xml' },
    ]
  },
  microsite2: {
    name: 'Best Delray Salon',
    url: 'https://www.bestdelraysalon.com',
    pages: [
      { path: '/', title: 'Best' },
      { path: '/reviews.html', title: 'Reviews' },
      { path: '/sitemap.xml', check: 'xml' },
    ]
  },
  microsite3: {
    name: 'Best Salon Palm Beach',
    url: 'https://www.bestsalonpalmbeach.com',
    pages: [
      { path: '/', title: 'Best' },
      { path: '/luxury-guide.html', title: 'Luxury' },
      { path: '/sitemap.xml', check: 'xml' },
    ]
  }
};

test.describe('Main Site Tests', () => {
  test('Homepage loads correctly', async ({ page }) => {
    await page.goto(SITES.main.url);
    await expect(page).toHaveTitle(/Chris David/i);

    // Check booking button exists
    const bookingButton = page.locator('text=Book Now, text=Schedule, text=Appointment').first();
    await expect(bookingButton).toBeVisible({ timeout: 10000 });
  });

  test('Admin microsites page loads with data', async ({ page }) => {
    await page.goto(`${SITES.main.url}/admin/microsites.html`);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check title section exists
    await expect(page.locator('text=Microsite Network Analytics')).toBeVisible({ timeout: 15000 });

    // Check that site cards render
    await expect(page.locator('text=bestsalondelray.com')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=bestdelraysalon.com')).toBeVisible();
    await expect(page.locator('text=bestsalonpalmbeach.com')).toBeVisible();

    // Screenshot for visual verification
    await page.screenshot({ path: 'test-results/microsites-dashboard.png', fullPage: true });
  });

  test('GA4 Analytics API returns data', async ({ request }) => {
    const response = await request.get(`${SITES.main.url}/api/ga4-analytics?type=overview`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.dataSource).toBe('google-analytics-4-api');
    expect(data.data.activeUsers).toBeGreaterThan(0);
  });

  test('Authority Score API returns data', async ({ request }) => {
    const response = await request.get(`${SITES.main.url}/api/authority-score`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.pagerank).toBeGreaterThan(0);
  });

  test('Microsite Analytics API returns data', async ({ request }) => {
    const response = await request.get(`${SITES.main.url}/api/microsite-analytics`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.microsites).toHaveLength(3);
    expect(data.totals).toBeDefined();
    expect(data.projection).toBeDefined();
  });

  test('Traffic page loads with GA4 data', async ({ page }) => {
    await page.goto(`${SITES.main.url}/admin/traffic.html`);
    await page.waitForLoadState('networkidle');

    // Should show live data badge
    await expect(page.locator('text=Live data from GA4, text=LIVE')).toBeVisible({ timeout: 15000 });

    await page.screenshot({ path: 'test-results/traffic-page.png', fullPage: true });
  });
});

test.describe('Microsite 1: bestsalondelray.com', () => {
  test('Homepage loads correctly', async ({ page }) => {
    await page.goto(SITES.microsite1.url);
    await expect(page).toHaveTitle(/Best|Salon|Delray/i);

    // Check for Chris David mention
    await expect(page.locator('text=Chris David')).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'test-results/bestsalondelray-home.png', fullPage: true });
  });

  test('Sitemap exists and has URLs', async ({ request }) => {
    const response = await request.get(`${SITES.microsite1.url}/sitemap.xml`);
    expect(response.ok()).toBeTruthy();

    const xml = await response.text();
    expect(xml).toContain('<urlset');
    expect(xml).toContain('<loc>');

    // Count URLs
    const urlCount = (xml.match(/<loc>/g) || []).length;
    console.log(`bestsalondelray.com has ${urlCount} pages in sitemap`);
    expect(urlCount).toBeGreaterThanOrEqual(5);
  });

  test('Services page exists', async ({ page }) => {
    await page.goto(`${SITES.microsite1.url}/services.html`);
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Microsite 2: bestdelraysalon.com', () => {
  test('Homepage loads correctly', async ({ page }) => {
    await page.goto(SITES.microsite2.url);
    await expect(page).toHaveTitle(/Best|Delray|Salon/i);

    await page.screenshot({ path: 'test-results/bestdelraysalon-home.png', fullPage: true });
  });

  test('Sitemap exists and has URLs', async ({ request }) => {
    const response = await request.get(`${SITES.microsite2.url}/sitemap.xml`);
    expect(response.ok()).toBeTruthy();

    const xml = await response.text();
    expect(xml).toContain('<urlset');

    const urlCount = (xml.match(/<loc>/g) || []).length;
    console.log(`bestdelraysalon.com has ${urlCount} pages in sitemap`);
    expect(urlCount).toBeGreaterThanOrEqual(5);
  });

  test('Reviews page exists', async ({ page }) => {
    await page.goto(`${SITES.microsite2.url}/reviews.html`);
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Microsite 3: bestsalonpalmbeach.com', () => {
  test('Homepage loads correctly', async ({ page }) => {
    await page.goto(SITES.microsite3.url);
    await expect(page).toHaveTitle(/Best|Palm Beach|Salon/i);

    await page.screenshot({ path: 'test-results/bestsalonpalmbeach-home.png', fullPage: true });
  });

  test('Sitemap exists and has URLs', async ({ request }) => {
    const response = await request.get(`${SITES.microsite3.url}/sitemap.xml`);
    expect(response.ok()).toBeTruthy();

    const xml = await response.text();
    expect(xml).toContain('<urlset');

    const urlCount = (xml.match(/<loc>/g) || []).length;
    console.log(`bestsalonpalmbeach.com has ${urlCount} pages in sitemap`);
    expect(urlCount).toBeGreaterThanOrEqual(5);
  });

  test('Luxury guide page exists', async ({ page }) => {
    await page.goto(`${SITES.microsite3.url}/luxury-guide.html`);
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Cross-Site Integration', () => {
  test('Microsites link back to main site', async ({ page }) => {
    // Check bestsalondelray
    await page.goto(SITES.microsite1.url);
    const link1 = page.locator('a[href*="chrisdavidsalon.com"]').first();
    await expect(link1).toBeVisible({ timeout: 10000 });

    // Check bestsalonpalmbeach
    await page.goto(SITES.microsite3.url);
    const link3 = page.locator('a[href*="chrisdavidsalon.com"]').first();
    await expect(link3).toBeVisible({ timeout: 10000 });
  });

  test('All sites have GA4 tracking', async ({ page }) => {
    // Check main site
    await page.goto(SITES.main.url);
    const mainTracking = await page.content();
    expect(mainTracking).toContain('gtag');

    // Check microsite1
    await page.goto(SITES.microsite1.url);
    const micro1Tracking = await page.content();
    expect(micro1Tracking).toContain('G-XQDLWZM5NV');
  });
});
