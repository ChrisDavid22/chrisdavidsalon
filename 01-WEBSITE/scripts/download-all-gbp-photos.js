/**
 * Download ALL photos from Chris David Salon Google Business Profile
 * Uses Playwright to navigate and download photos beyond API limits
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const OUTPUT_DIR = path.join(process.cwd(), 'images', 'gbp-full');
const SALON_URL = 'https://www.google.com/maps/place/Chris+David+Salon/@26.4597892,-80.0723885,17z/data=!4m8!3m7!1s0x88d8dfddd217c5c5:0x28292bffc5f317d9!8m2!3d26.4597892!4d-80.0723885!9m1!1b1!16s%2Fg%2F11c1p8lgxk';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const filePath = path.join(OUTPUT_DIR, filename);
        const file = fs.createWriteStream(filePath);

        protocol.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                // Follow redirect
                downloadImage(response.headers.location, filename).then(resolve).catch(reject);
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                const stats = fs.statSync(filePath);
                resolve({ filename, size: stats.size });
            });
        }).on('error', (err) => {
            fs.unlink(filePath, () => {});
            reject(err);
        });
    });
}

async function main() {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║   Chris David Salon - Full GBP Photo Downloader          ║');
    console.log('║   Using Playwright to bypass API limits                   ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();

    console.log('🌐 Navigating to Google Maps...');
    await page.goto(SALON_URL, { waitUntil: 'networkidle', timeout: 60000 });

    // Wait for the page to load
    await page.waitForTimeout(3000);

    // Click on the photos section to open the gallery
    console.log('📸 Looking for photos section...');

    try {
        // Try to find and click the photos tab or first photo
        const photoButton = await page.locator('button[data-tab-index="1"]').first();
        if (await photoButton.isVisible()) {
            await photoButton.click();
            await page.waitForTimeout(2000);
        }
    } catch (e) {
        console.log('   Trying alternative photo access method...');
    }

    // Try clicking on the main photo to open gallery
    try {
        const mainPhoto = await page.locator('img[decoding="async"]').first();
        if (await mainPhoto.isVisible()) {
            await mainPhoto.click();
            await page.waitForTimeout(2000);
        }
    } catch (e) {
        console.log('   Could not click main photo');
    }

    // Collect all image URLs
    console.log('🔍 Collecting image URLs...\n');

    const imageUrls = new Set();
    let scrollAttempts = 0;
    const maxScrollAttempts = 20;

    while (scrollAttempts < maxScrollAttempts) {
        // Get all images currently visible
        const images = await page.locator('img').all();

        for (const img of images) {
            try {
                const src = await img.getAttribute('src');
                if (src && src.includes('googleusercontent.com') && !src.includes('=s32')) {
                    // Get higher resolution version
                    const highResSrc = src.replace(/=w\d+-h\d+/, '=w1200-h1200').replace(/=s\d+/, '=s1200');
                    imageUrls.add(highResSrc);
                }
            } catch (e) {
                // Image may have been removed from DOM
            }
        }

        // Try to scroll to load more images
        try {
            await page.keyboard.press('ArrowRight');
            await page.waitForTimeout(500);
        } catch (e) {
            // May not be in gallery mode
        }

        // Also try scrolling the page
        await page.evaluate(() => {
            const scrollable = document.querySelector('[role="main"]');
            if (scrollable) {
                scrollable.scrollTop += 500;
            }
        });

        await page.waitForTimeout(1000);
        scrollAttempts++;

        console.log(`   Scroll ${scrollAttempts}/${maxScrollAttempts} - Found ${imageUrls.size} unique images so far`);
    }

    console.log(`\n✅ Found ${imageUrls.size} unique images to download\n`);

    // Download all images
    let downloaded = 0;
    let failed = 0;
    const manifest = [];

    for (const url of imageUrls) {
        const index = downloaded + failed + 1;
        const filename = `gbp-photo-${String(index).padStart(3, '0')}.jpg`;

        try {
            console.log(`   [${index}/${imageUrls.size}] Downloading ${filename}...`);
            const result = await downloadImage(url, filename);
            console.log(`       ✓ Downloaded (${Math.round(result.size / 1024)} KB)`);

            manifest.push({
                filename: result.filename,
                originalUrl: url,
                size: result.size,
                downloadedAt: new Date().toISOString()
            });

            downloaded++;
        } catch (err) {
            console.log(`       ✗ Failed: ${err.message}`);
            failed++;
        }
    }

    // Save manifest
    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
    );

    await browser.close();

    console.log('\n' + '═'.repeat(60));
    console.log(`📊 Download Summary:`);
    console.log(`   ✓ Successfully downloaded: ${downloaded}`);
    console.log(`   ✗ Failed: ${failed}`);
    console.log(`   📁 Location: ${OUTPUT_DIR}`);
    console.log('═'.repeat(60) + '\n');
}

main().catch(console.error);
