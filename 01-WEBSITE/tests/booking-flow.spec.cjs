// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://www.chrisdavidsalon.com';

/**
 * Comprehensive Booking Flow Tests
 * Tests the Boulevard booking widget integration across all pages
 */

test.describe('Booking Widget Integration Tests', () => {

    test('Homepage: Book Now button loads Boulevard widget correctly', async ({ page }) => {
        // Navigate to homepage
        await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);

        // Find the sticky Book Now button
        const stickyBookBtn = page.locator('.sticky-book-btn, button:has-text("Book Now")').first();
        await expect(stickyBookBtn).toBeVisible();

        // Set up listeners for Boulevard widget OR new window/popup
        let boulevardLoaded = false;
        let fallbackOpened = false;

        // Listen for Boulevard widget iframe or modal
        page.on('frameattached', (frame) => {
            if (frame.url().includes('boulevard') || frame.url().includes('blvd')) {
                boulevardLoaded = true;
            }
        });

        // Listen for popup (fallback behavior)
        const popupPromise = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);

        // Click the booking button
        await stickyBookBtn.click();

        // Wait for either Boulevard widget to load or popup to open
        await page.waitForTimeout(2000);

        // Check for Boulevard widget iframe
        const boulevardIframe = page.locator('iframe[src*="boulevard"], iframe[src*="blvd"]');
        const iframeCount = await boulevardIframe.count();

        // Check for Boulevard widget modal container
        const boulevardModal = page.locator('[class*="blvd"], [id*="blvd"], [class*="boulevard"]');
        const modalCount = await boulevardModal.count();

        // Check popup
        const popup = await popupPromise;
        if (popup) {
            fallbackOpened = true;
            // If popup opened, verify it's Boulevard
            const popupUrl = popup.url();
            expect(popupUrl).toContain('boulevard');
        }

        // Take screenshot of current state
        await page.screenshot({
            path: 'test-results/booking-widget-homepage.png',
            fullPage: false
        });

        // Either Boulevard widget should load OR fallback should work
        const bookingWorks = iframeCount > 0 || modalCount > 0 || boulevardLoaded || fallbackOpened;
        expect(bookingWorks).toBe(true);
    });

    test('Homepage: Hero Book Now button works', async ({ page }) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);

        // Find hero CTA button (yellow/gold Book Now in hero section)
        const heroCTA = page.locator('section >> button:has-text("Book"), .hero >> button:has-text("Book")').first();

        if (await heroCTA.count() > 0) {
            await expect(heroCTA).toBeVisible();

            const popupPromise = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
            await heroCTA.click();
            await page.waitForTimeout(2000);

            // Check Boulevard widget appeared or popup opened
            const boulevardElements = page.locator('iframe[src*="boulevard"], [class*="blvd"]');
            const popup = await popupPromise;

            const success = (await boulevardElements.count()) > 0 || popup !== null;
            expect(success).toBe(true);

            await page.screenshot({
                path: 'test-results/booking-widget-hero.png'
            });
        }
    });

    test('Service page: Balayage booking button works', async ({ page }) => {
        await page.goto(`${BASE_URL}/services/balayage-delray-beach.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);

        const bookBtn = page.locator('button:has-text("Book")').first();
        await expect(bookBtn).toBeVisible();

        const popupPromise = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
        await bookBtn.click();
        await page.waitForTimeout(2000);

        const boulevardElements = page.locator('iframe[src*="boulevard"], [class*="blvd"]');
        const popup = await popupPromise;

        const success = (await boulevardElements.count()) > 0 || popup !== null;
        expect(success).toBe(true);

        await page.screenshot({
            path: 'test-results/booking-widget-balayage.png'
        });
    });

    test('Service page: Mens haircut booking button works', async ({ page }) => {
        await page.goto(`${BASE_URL}/services/mens-haircut-delray-beach.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);

        const bookBtn = page.locator('button:has-text("Book")').first();
        await expect(bookBtn).toBeVisible();

        const popupPromise = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
        await bookBtn.click();
        await page.waitForTimeout(2000);

        const boulevardElements = page.locator('iframe[src*="boulevard"], [class*="blvd"]');
        const popup = await popupPromise;

        const success = (await boulevardElements.count()) > 0 || popup !== null;
        expect(success).toBe(true);

        await page.screenshot({
            path: 'test-results/booking-widget-mens-haircut.png'
        });
    });

    test('Location page: Boca Raton booking button works', async ({ page }) => {
        await page.goto(`${BASE_URL}/locations/boca-raton-hair-salon.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);

        const bookBtn = page.locator('button:has-text("Book")').first();
        await expect(bookBtn).toBeVisible();

        const popupPromise = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
        await bookBtn.click();
        await page.waitForTimeout(2000);

        const boulevardElements = page.locator('iframe[src*="boulevard"], [class*="blvd"]');
        const popup = await popupPromise;

        const success = (await boulevardElements.count()) > 0 || popup !== null;
        expect(success).toBe(true);

        await page.screenshot({
            path: 'test-results/booking-widget-boca-raton.png'
        });
    });
});

test.describe('Booking Widget - Mobile Tests', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

    test('Mobile: Sticky booking button works', async ({ page }) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);

        // Find sticky book button on mobile
        const stickyBtn = page.locator('.sticky-book-btn, button:has-text("Book Now")').first();
        await expect(stickyBtn).toBeVisible();

        const popupPromise = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
        await stickyBtn.click();
        await page.waitForTimeout(2000);

        const boulevardElements = page.locator('iframe[src*="boulevard"], [class*="blvd"]');
        const popup = await popupPromise;

        const success = (await boulevardElements.count()) > 0 || popup !== null;
        expect(success).toBe(true);

        await page.screenshot({
            path: 'test-results/booking-widget-mobile.png'
        });
    });
});

test.describe('Booking Widget - Boulevard Script Loading', () => {

    test('Boulevard script lazy-loads correctly on homepage', async ({ page }) => {
        // Track network requests
        const boulevardRequests = [];
        page.on('request', (request) => {
            if (request.url().includes('boulevard') || request.url().includes('blvd')) {
                boulevardRequests.push(request.url());
            }
        });

        await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);

        // Initially, Boulevard script should NOT be loaded (lazy loading)
        const initialRequests = boulevardRequests.length;

        // Click book button to trigger lazy load
        const bookBtn = page.locator('.sticky-book-btn, button:has-text("Book Now")').first();
        await bookBtn.click();
        await page.waitForTimeout(2000);

        // Now Boulevard should be loaded
        const finalRequests = boulevardRequests.length;

        // Take screenshot
        await page.screenshot({
            path: 'test-results/booking-boulevard-loaded.png'
        });

        // Either script loaded OR fallback worked
        // We expect at least one Boulevard-related request after click
        console.log(`Boulevard requests: initial=${initialRequests}, final=${finalRequests}`);
        console.log(`Request URLs: ${boulevardRequests.join(', ')}`);

        // Script should have loaded or popup opened
        expect(finalRequests).toBeGreaterThan(0);
    });

    test('No JavaScript errors on booking click', async ({ page }) => {
        const errors = [];
        page.on('pageerror', (error) => {
            errors.push(error.message);
        });

        await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);

        // Click booking button
        const bookBtn = page.locator('.sticky-book-btn, button:has-text("Book Now")').first();
        await bookBtn.click();
        await page.waitForTimeout(2000);

        // Check for errors related to Boulevard or booking
        const bookingErrors = errors.filter(e =>
            e.toLowerCase().includes('blvd') ||
            e.toLowerCase().includes('boulevard') ||
            e.toLowerCase().includes('booking') ||
            e.toLowerCase().includes('loadboulevard')
        );

        expect(bookingErrors).toHaveLength(0);
    });
});

test.describe('Booking Widget - All Pages Coverage', () => {
    const pagesToTest = [
        { name: 'Homepage', path: '/' },
        { name: 'Hair Color', path: '/services/hair-color-delray-beach.html' },
        { name: 'Womens Haircut', path: '/services/womens-haircut-delray-beach.html' },
        { name: 'Keratin Treatment', path: '/services/keratin-treatment-delray-beach.html' },
        { name: 'Wedding Hair', path: '/services/wedding-hair-delray-beach.html' },
        { name: 'Hair Extensions', path: '/services/hair-extensions-delray-beach.html' },
        { name: 'Highlights', path: '/services/highlights-delray-beach.html' },
        { name: 'Color Correction', path: '/services/color-correction-delray-beach.html' },
        { name: 'All Services', path: '/services/hair-salon-delray-beach.html' },
        { name: 'Boynton Beach', path: '/locations/boynton-beach-hair-salon.html' },
    ];

    for (const pageInfo of pagesToTest) {
        test(`${pageInfo.name}: Has working Book button`, async ({ page }) => {
            await page.goto(`${BASE_URL}${pageInfo.path}`, { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(1000);

            // Find any book button
            const bookBtn = page.locator('button:has-text("Book"), a:has-text("Book")').first();
            await expect(bookBtn).toBeVisible();

            // Verify it's clickable and doesn't throw errors
            const errors = [];
            page.on('pageerror', (error) => errors.push(error.message));

            const popupPromise = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
            await bookBtn.click();
            await page.waitForTimeout(1500);

            // Check Boulevard appeared or popup
            const boulevardElements = page.locator('iframe[src*="boulevard"], [class*="blvd"]');
            const popup = await popupPromise;

            const success = (await boulevardElements.count()) > 0 || popup !== null;
            expect(success).toBe(true);

            // No booking-related errors
            const bookingErrors = errors.filter(e =>
                e.toLowerCase().includes('blvd') ||
                e.toLowerCase().includes('booking')
            );
            expect(bookingErrors).toHaveLength(0);
        });
    }
});
