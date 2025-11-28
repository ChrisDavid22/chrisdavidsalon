// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://www.chrisdavidsalon.com';

// All public pages to test
const publicPages = [
    // Main pages
    { name: 'Homepage', path: '/', requiredText: ['Chris David Salon', 'Book'] },
    { name: 'Premium Brands', path: '/premiumbrands.html', requiredText: ['Premium', 'Brands'] },
    { name: 'Blog', path: '/blog.html', requiredText: ['Blog'] },
    { name: 'Careers', path: '/careers.html', requiredText: ['Career', 'Join'] },
    { name: 'Policies', path: '/policies.html', requiredText: ['Polic'] },

    // Service pages
    { name: 'All Services', path: '/services/hair-salon-delray-beach.html', requiredText: ['Hair Salon', 'Delray Beach', 'Book'] },
    { name: 'Hair Color', path: '/services/hair-color-delray-beach.html', requiredText: ['Hair Color', 'Delray Beach'] },
    { name: 'Womens Haircuts', path: '/services/womens-haircut-delray-beach.html', requiredText: ['Haircut', 'Women'] },
    { name: 'Mens Haircuts', path: '/services/mens-haircut-delray-beach.html', requiredText: ['Men', 'Haircut', 'Book'] },
    { name: 'Balayage', path: '/services/balayage-delray-beach.html', requiredText: ['Balayage', 'Delray Beach'] },
    { name: 'Highlights', path: '/services/highlights-delray-beach.html', requiredText: ['Highlights', 'Delray Beach', 'Book'] },
    { name: 'Color Correction', path: '/services/color-correction-delray-beach.html', requiredText: ['Color Correction'] },
    { name: 'Hair Extensions', path: '/services/hair-extensions-delray-beach.html', requiredText: ['Extensions'] },
    { name: 'Keratin Treatment', path: '/services/keratin-treatment-delray-beach.html', requiredText: ['Keratin'] },
    { name: 'Wedding Hair', path: '/services/wedding-hair-delray-beach.html', requiredText: ['Wedding', 'Bridal'] },

    // Location/Service Area pages
    { name: 'Delray Beach Location', path: '/locations/delray-beach-hair-salon.html', requiredText: ['Delray Beach', 'Hair Salon'] },
    { name: 'Atlantic Avenue Colorist', path: '/locations/atlantic-avenue-colorist.html', requiredText: ['Atlantic', 'Colorist'] },
    { name: 'Boca Raton Service Area', path: '/locations/boca-raton-hair-salon.html', requiredText: ['Boca Raton', 'Hair Salon', 'Delray Beach'] },
    { name: 'Boynton Beach Service Area', path: '/locations/boynton-beach-hair-salon.html', requiredText: ['Boynton Beach', 'Hair Salon', 'Delray Beach'] },
];

test.describe('Public Pages - Basic Load Tests', () => {
    for (const page of publicPages) {
        test(`${page.name} page loads correctly`, async ({ page: browserPage }) => {
            // Navigate to page
            const response = await browserPage.goto(`${BASE_URL}${page.path}`, {
                waitUntil: 'domcontentloaded',
                timeout: 30000
            });

            // Check HTTP status
            expect(response?.status()).toBeLessThan(400);

            // Wait for content to load
            await browserPage.waitForTimeout(2000);

            // Take screenshot
            await browserPage.screenshot({
                path: `test-results/public-${page.name.toLowerCase().replace(/\s/g, '-')}.png`,
                fullPage: true
            });

            // Check page title is not empty
            const title = await browserPage.title();
            expect(title.length).toBeGreaterThan(0);

            // Check for required text on page
            const bodyText = await browserPage.locator('body').textContent();
            for (const text of page.requiredText) {
                expect(bodyText?.toLowerCase()).toContain(text.toLowerCase());
            }
        });
    }
});

test.describe('Public Pages - SEO & Schema Tests', () => {
    test('Homepage has correct meta tags', async ({ page }) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

        // Check meta description
        const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
        expect(metaDescription).toBeTruthy();
        expect(metaDescription?.length).toBeGreaterThan(50);

        // Check Open Graph tags
        const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
        expect(ogTitle).toBeTruthy();

        const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
        expect(ogDescription).toBeTruthy();

        // Check canonical URL
        const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
        expect(canonical).toBeTruthy();
    });

    test('Homepage has HairSalon schema markup', async ({ page }) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

        // Find schema script
        const schemaScripts = await page.locator('script[type="application/ld+json"]').all();
        expect(schemaScripts.length).toBeGreaterThan(0);

        // Parse and verify schema
        const schemaContent = await schemaScripts[0].textContent();
        const schema = JSON.parse(schemaContent || '{}');

        expect(schema['@type']).toBe('HairSalon');
        expect(schema.name).toBe('Chris David Salon');
        expect(schema.telephone).toBe('(561) 299-0950');
    });

    test('Homepage has FAQ schema markup', async ({ page }) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

        // Find all schema scripts
        const schemaScripts = await page.locator('script[type="application/ld+json"]').all();

        // Look for FAQPage schema
        let hasFAQSchema = false;
        for (const script of schemaScripts) {
            const content = await script.textContent();
            const schema = JSON.parse(content || '{}');
            if (schema['@type'] === 'FAQPage') {
                hasFAQSchema = true;
                expect(schema.mainEntity.length).toBeGreaterThan(0);
            }
        }
        expect(hasFAQSchema).toBe(true);
    });

    test('Service pages have Service schema', async ({ page }) => {
        await page.goto(`${BASE_URL}/services/balayage-delray-beach.html`, { waitUntil: 'domcontentloaded' });

        const schemaScripts = await page.locator('script[type="application/ld+json"]').all();
        expect(schemaScripts.length).toBeGreaterThan(0);

        const schemaContent = await schemaScripts[0].textContent();
        const schema = JSON.parse(schemaContent || '{}');

        expect(['Service', 'HairSalon']).toContain(schema['@type']);
    });
});

test.describe('Public Pages - Mobile Responsiveness', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

    test('Homepage is mobile responsive', async ({ page }) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);

        // Take mobile screenshot
        await page.screenshot({
            path: 'test-results/mobile-homepage.png',
            fullPage: true
        });

        // Check mobile menu button is visible
        const mobileMenuBtn = page.locator('#mobile-menu-btn');
        await expect(mobileMenuBtn).toBeVisible();

        // Check sticky booking button is visible on mobile
        const stickyBooking = page.locator('.sticky-booking');
        await expect(stickyBooking).toBeVisible();
    });

    test('Service page is mobile responsive', async ({ page }) => {
        await page.goto(`${BASE_URL}/services/mens-haircut-delray-beach.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);

        // Take mobile screenshot
        await page.screenshot({
            path: 'test-results/mobile-mens-haircut.png',
            fullPage: true
        });

        // Check content is readable
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
    });

    test('Location page is mobile responsive', async ({ page }) => {
        await page.goto(`${BASE_URL}/locations/boca-raton-hair-salon.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);

        // Take mobile screenshot
        await page.screenshot({
            path: 'test-results/mobile-boca-raton.png',
            fullPage: true
        });

        // Check content is readable
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
    });
});

test.describe('Public Pages - Navigation Tests', () => {
    test('Navigation dropdown contains all service links', async ({ page }) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

        // Hover over Services to reveal dropdown
        await page.hover('a:has-text("Services")');
        await page.waitForTimeout(500);

        // Check dropdown links exist
        const dropdown = page.locator('.group-hover\\:visible');

        // Check for new service pages in dropdown
        const mensHaircutLink = page.locator('a[href="services/mens-haircut-delray-beach.html"]');
        await expect(mensHaircutLink).toBeVisible();

        const highlightsLink = page.locator('a[href="services/highlights-delray-beach.html"]');
        await expect(highlightsLink).toBeVisible();
    });

    test('Footer contains all service and location links', async ({ page }) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

        // Scroll to footer
        await page.locator('footer').scrollIntoViewIfNeeded();

        // Check for service links in footer
        const mensHaircutFooterLink = page.locator('footer a[href="services/mens-haircut-delray-beach.html"]');
        await expect(mensHaircutFooterLink).toBeVisible();

        const highlightsFooterLink = page.locator('footer a[href="services/highlights-delray-beach.html"]');
        await expect(highlightsFooterLink).toBeVisible();

        // Check for location links in footer
        const bocaRatonLink = page.locator('footer a[href="locations/boca-raton-hair-salon.html"]');
        await expect(bocaRatonLink).toBeVisible();

        const boyntonBeachLink = page.locator('footer a[href="locations/boynton-beach-hair-salon.html"]');
        await expect(boyntonBeachLink).toBeVisible();
    });
});

test.describe('Public Pages - Booking & Conversion Tests', () => {
    test('Homepage has working Book Now button', async ({ page }) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

        // Find Book Now button
        const bookButton = page.locator('button:has-text("Book Now")').first();
        await expect(bookButton).toBeVisible();

        // Click should open booking modal or trigger action
        await bookButton.click();
        await page.waitForTimeout(1000);

        // Take screenshot of modal state
        await page.screenshot({
            path: 'test-results/booking-modal.png',
            fullPage: true
        });
    });

    test('Phone number links are correct', async ({ page }) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

        // Check phone link href
        const phoneLink = page.locator('a[href="tel:5612990950"]').first();
        await expect(phoneLink).toBeVisible();

        // Verify phone number text
        const phoneText = await phoneLink.textContent();
        expect(phoneText).toContain('561');
        expect(phoneText).toContain('299');
        expect(phoneText).toContain('0950');
    });

    test('Service pages have booking CTAs', async ({ page }) => {
        const servicePages = [
            '/services/mens-haircut-delray-beach.html',
            '/services/highlights-delray-beach.html',
            '/services/balayage-delray-beach.html'
        ];

        for (const servicePath of servicePages) {
            await page.goto(`${BASE_URL}${servicePath}`, { waitUntil: 'domcontentloaded' });

            // Check for booking button
            const bookButton = page.locator('button:has-text("Book"), a:has-text("Book")').first();
            await expect(bookButton).toBeVisible();
        }
    });
});

test.describe('Public Pages - Review Count Consistency', () => {
    test('Homepage shows 140 reviews', async ({ page }) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

        const bodyText = await page.locator('body').textContent();
        expect(bodyText).toContain('140');
    });

    test('Service pages show consistent review count', async ({ page }) => {
        const pagesToCheck = [
            '/services/balayage-delray-beach.html',
            '/services/mens-haircut-delray-beach.html',
            '/services/highlights-delray-beach.html'
        ];

        for (const pagePath of pagesToCheck) {
            await page.goto(`${BASE_URL}${pagePath}`, { waitUntil: 'domcontentloaded' });

            const bodyText = await page.locator('body').textContent();
            // Check for 140 reviews or 4.9 rating
            const has140Reviews = bodyText?.includes('140');
            const has49Rating = bodyText?.includes('4.9');

            expect(has140Reviews || has49Rating).toBe(true);
        }
    });
});

test.describe('Public Pages - Image Tests', () => {
    test('Homepage images load correctly', async ({ page }) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

        // Check for visible images
        const images = page.locator('img');
        const imageCount = await images.count();
        expect(imageCount).toBeGreaterThan(0);

        // Check first few images are loaded
        for (let i = 0; i < Math.min(5, imageCount); i++) {
            const img = images.nth(i);
            const isVisible = await img.isVisible();
            if (isVisible) {
                const naturalWidth = await img.evaluate((el) => (el).naturalWidth);
                // Image should have loaded (naturalWidth > 0 means loaded)
                expect(naturalWidth).toBeGreaterThan(0);
            }
        }
    });

    test('Service page images load correctly', async ({ page }) => {
        await page.goto(`${BASE_URL}/services/mens-haircut-delray-beach.html`, { waitUntil: 'networkidle' });

        const images = page.locator('img');
        const imageCount = await images.count();
        expect(imageCount).toBeGreaterThan(0);

        // Take screenshot to verify images
        await page.screenshot({
            path: 'test-results/mens-haircut-images.png',
            fullPage: true
        });
    });
});

test.describe('Sitemap Verification', () => {
    test('Sitemap includes all new pages', async ({ page }) => {
        const response = await page.goto(`${BASE_URL}/sitemap.xml`);
        expect(response?.status()).toBe(200);

        const sitemapContent = await page.content();

        // Check for new service pages
        expect(sitemapContent).toContain('mens-haircut-delray-beach.html');
        expect(sitemapContent).toContain('highlights-delray-beach.html');

        // Check for new location pages
        expect(sitemapContent).toContain('boca-raton-hair-salon.html');
        expect(sitemapContent).toContain('boynton-beach-hair-salon.html');
    });
});
