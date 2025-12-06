const { test, expect } = require('@playwright/test');

// Test configuration for 2K resolution
const DESKTOP_VIEWPORT = { width: 2560, height: 1440 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };

const BASE_URL = 'https://www.chrisdavidsalon.com';

// Helper to check if image loaded correctly
async function checkImageLoaded(page, imgSelector) {
  const images = await page.locator(imgSelector).all();
  const results = [];
  
  for (const img of images) {
    const src = await img.getAttribute('src');
    const naturalWidth = await img.evaluate(el => el.naturalWidth);
    const isVisible = await img.isVisible();
    const isBroken = naturalWidth === 0;
    
    results.push({
      src: src?.substring(0, 80),
      loaded: !isBroken,
      visible: isVisible,
      naturalWidth
    });
  }
  return results;
}

test.describe('Premium Brands Page Verification', () => {
  test('Desktop 2K - All images and navigation', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto(`${BASE_URL}/premiumbrands.html`, { waitUntil: 'networkidle' });
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/premiumbrands-desktop-2k.png', fullPage: true });
    
    // Check all images
    const imageResults = await checkImageLoaded(page, 'img');
    console.log('Premium Brands Images:', JSON.stringify(imageResults, null, 2));
    
    // Check navigation links
    const navLinks = await page.locator('nav a, header a').all();
    console.log(`Found ${navLinks.length} navigation links`);
    
    // Verify specific elements
    const goldwellLogo = page.locator('img[alt*="Goldwell"]');
    const goldwellVisible = await goldwellLogo.isVisible();
    console.log('Goldwell logo visible:', goldwellVisible);
    
    const davinesLogo = page.locator('img[alt*="Davines"]');
    const davinesVisible = await davinesLogo.isVisible();
    console.log('Davines logo visible:', davinesVisible);
    
    // Check for broken images
    const brokenImages = imageResults.filter(r => !r.loaded);
    if (brokenImages.length > 0) {
      console.log('BROKEN IMAGES:', brokenImages);
    }
    
    expect(brokenImages.length).toBe(0);
  });

  test('Mobile - All images and navigation', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto(`${BASE_URL}/premiumbrands.html`, { waitUntil: 'networkidle' });
    
    await page.screenshot({ path: 'tests/screenshots/premiumbrands-mobile.png', fullPage: true });
    
    const imageResults = await checkImageLoaded(page, 'img');
    const brokenImages = imageResults.filter(r => !r.loaded);
    
    if (brokenImages.length > 0) {
      console.log('BROKEN IMAGES (Mobile):', brokenImages);
    }
    
    expect(brokenImages.length).toBe(0);
  });
});

test.describe('Homepage Verification', () => {
  test('Desktop 2K - Gallery and all functionality', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    await page.screenshot({ path: 'tests/screenshots/homepage-desktop-2k.png', fullPage: true });
    
    // Check gallery section
    const gallerySection = page.locator('#gallery');
    await gallerySection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    // Check gallery images
    const galleryImages = await checkImageLoaded(page, '.gallery-carousel img');
    console.log('Gallery Images:', galleryImages.length);
    
    // Test gallery navigation arrows
    const leftArrow = page.locator('button:has-text("←")');
    const rightArrow = page.locator('button:has-text("→")');
    
    const leftVisible = await leftArrow.isVisible().catch(() => false);
    const rightVisible = await rightArrow.isVisible().catch(() => false);
    console.log('Gallery arrows visible - Left:', leftVisible, 'Right:', rightVisible);
    
    // Test lightbox functionality
    const firstGalleryImg = page.locator('.gallery-carousel img').first();
    if (await firstGalleryImg.isVisible()) {
      await firstGalleryImg.click();
      await page.waitForTimeout(300);
      
      const lightbox = page.locator('#lightbox');
      const lightboxVisible = await lightbox.isVisible();
      console.log('Lightbox opens on click:', lightboxVisible);
      
      if (lightboxVisible) {
        // Check lightbox image loaded
        const lightboxImg = page.locator('#lightboxImage');
        const lightboxSrc = await lightboxImg.getAttribute('src');
        console.log('Lightbox image src:', lightboxSrc);
        
        // Close lightbox
        await page.keyboard.press('Escape');
      }
    }
    
    // Check all page images
    const allImages = await checkImageLoaded(page, 'img');
    const brokenImages = allImages.filter(r => !r.loaded);
    
    if (brokenImages.length > 0) {
      console.log('BROKEN IMAGES:', brokenImages);
    }
    
    expect(brokenImages.length).toBe(0);
  });
});

test.describe('Service Pages Navigation Verification', () => {
  const servicePages = [
    '/services/balayage-delray-beach.html',
    '/services/hair-color-delray-beach.html',
    '/services/highlights-delray-beach.html',
    '/services/keratin-treatment-delray-beach.html',
    '/services/hair-extensions-delray-beach.html',
    '/services/color-correction-delray-beach.html',
    '/services/wedding-hair-delray-beach.html',
    '/services/womens-haircut-delray-beach.html',
    '/services/mens-haircut-delray-beach.html',
    '/services/hair-salon-delray-beach.html',
    '/services/color-correction.html'
  ];

  for (const pagePath of servicePages) {
    test(`Desktop - ${pagePath}`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await page.goto(`${BASE_URL}${pagePath}`, { waitUntil: 'networkidle' });
      
      const pageName = pagePath.split('/').pop().replace('.html', '');
      await page.screenshot({ path: `tests/screenshots/service-${pageName}-desktop.png`, fullPage: true });
      
      // Check navigation has all required links
      const navLinks = await page.locator('nav a').allTextContents();
      console.log(`${pagePath} nav links:`, navLinks);
      
      const requiredLinks = ['Home', 'About', 'Services', 'Gallery', 'Premium Brands', 'Reviews', 'Contact'];
      const missingLinks = requiredLinks.filter(link => !navLinks.some(n => n.includes(link)));
      
      if (missingLinks.length > 0) {
        console.log('MISSING NAV LINKS:', missingLinks);
      }
      
      // Check all images load
      const images = await checkImageLoaded(page, 'img');
      const brokenImages = images.filter(r => !r.loaded);
      
      if (brokenImages.length > 0) {
        console.log('BROKEN IMAGES:', brokenImages);
      }
      
      // Verify Premium Brands link works
      const premiumBrandsLink = page.locator('nav a:has-text("Premium Brands")');
      if (await premiumBrandsLink.isVisible()) {
        const href = await premiumBrandsLink.getAttribute('href');
        console.log('Premium Brands href:', href);
        expect(href).toContain('premiumbrands.html');
      }
      
      expect(missingLinks.length).toBe(0);
      expect(brokenImages.length).toBe(0);
    });
  }
});
