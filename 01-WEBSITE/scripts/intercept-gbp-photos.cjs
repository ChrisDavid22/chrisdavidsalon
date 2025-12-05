const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');

const OUTPUT_DIR = './images/gbp-full';

async function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                https.get(response.headers.location, (res) => {
                    const file = fs.createWriteStream(filepath);
                    res.pipe(file);
                    file.on('finish', () => { file.close(); resolve(true); });
                }).on('error', reject);
            } else if (response.statusCode === 200) {
                const file = fs.createWriteStream(filepath);
                response.pipe(file);
                file.on('finish', () => { file.close(); resolve(true); });
            } else {
                reject(new Error(`HTTP ${response.statusCode}`));
            }
        }).on('error', reject);
    });
}

async function main() {
    console.log('Starting GBP photo interception...\n');

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const photoIds = new Set();

    const browser = await chromium.launch({
        headless: false,
        slowMo: 100
    });

    const context = await browser.newContext({
        viewport: { width: 1400, height: 900 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });

    const page = await context.newPage();

    // Intercept all network requests to find photo URLs
    page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('googleusercontent.com') && url.includes('AF1Qip')) {
            // Extract the photo ID
            const match = url.match(/AF1Qip[A-Za-z0-9_-]+/);
            if (match) {
                photoIds.add(match[0]);
            }
        }
    });

    // Also monitor DOM for image sources
    page.on('load', async () => {
        try {
            const imgUrls = await page.evaluate(() => {
                const imgs = document.querySelectorAll('img');
                return Array.from(imgs).map(img => img.src).filter(src => src.includes('AF1Qip'));
            });
            imgUrls.forEach(url => {
                const match = url.match(/AF1Qip[A-Za-z0-9_-]+/);
                if (match) photoIds.add(match[0]);
            });
        } catch (e) {}
    });

    console.log('Navigating to Google Maps photos page...');

    // Go directly to photos view
    await page.goto('https://www.google.com/maps/place/Chris+David+Salon/@26.4597892,-80.0723885,3a,75y/data=!3m8!1e2!3m6!1sAF1QipM!2e10!3e12!7i3000!8i4000!4m8!3m7!1s0x88d8dfddd217c5c5:0x28292bffc5f317d9!8m2!3d26.4597892!4d-80.0723885!9m1!1b1!16s%2Fg%2F11c1p8lgxk', {
        waitUntil: 'domcontentloaded',
        timeout: 60000
    });

    await page.waitForTimeout(5000);

    // Dismiss consent
    try {
        await page.click('button:has-text("Accept all")', { timeout: 3000 });
        await page.waitForTimeout(1000);
    } catch (e) {}

    console.log('Scrolling through thumbnails to load all photos...');

    // Scroll the thumbnail strip to load all images
    for (let i = 0; i < 50; i++) {
        // Collect current image sources
        const currentIds = await page.evaluate(() => {
            const imgs = document.querySelectorAll('img[src*="googleusercontent"]');
            const ids = [];
            imgs.forEach(img => {
                const match = img.src.match(/AF1Qip[A-Za-z0-9_-]+/);
                if (match) ids.push(match[0]);
            });
            return ids;
        });

        currentIds.forEach(id => photoIds.add(id));

        if (i % 5 === 0) {
            console.log(`   Scroll ${i + 1}: Found ${photoIds.size} unique photos...`);
        }

        // Scroll the thumbnail container
        await page.evaluate(() => {
            const containers = document.querySelectorAll('[role="listbox"], [role="list"], .section-scrollbox');
            containers.forEach(c => {
                c.scrollLeft += 300;
                c.scrollTop += 300;
            });

            // Try horizontal scroll on photo strip
            const strips = document.querySelectorAll('[class*="photo"], [class*="gallery"], [class*="thumbnail"]');
            strips.forEach(s => {
                s.scrollLeft += 500;
            });

            window.scrollBy(300, 0);
        });

        await page.waitForTimeout(500);

        // Try clicking on thumbnails to load more
        if (i % 10 === 0) {
            try {
                const thumbnails = await page.locator('img[src*="googleusercontent"]').all();
                if (thumbnails.length > i % thumbnails.length) {
                    await thumbnails[i % thumbnails.length].click({ timeout: 1000 });
                    await page.waitForTimeout(1000);
                }
            } catch (e) {}
        }
    }

    // Try using arrow keys to navigate through photos
    console.log('Navigating through photos with arrow keys...');
    for (let i = 0; i < 100; i++) {
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(300);

        const currentIds = await page.evaluate(() => {
            const imgs = document.querySelectorAll('img[src*="googleusercontent"]');
            const ids = [];
            imgs.forEach(img => {
                const match = img.src.match(/AF1Qip[A-Za-z0-9_-]+/);
                if (match) ids.push(match[0]);
            });
            return ids;
        });

        const prevSize = photoIds.size;
        currentIds.forEach(id => photoIds.add(id));

        if (photoIds.size > prevSize) {
            console.log(`   Arrow ${i + 1}: Found ${photoIds.size} unique photos...`);
        }

        // Stop if no new photos found for 20 iterations
        if (i > 30 && photoIds.size === prevSize) break;
    }

    await browser.close();

    console.log(`\nFound ${photoIds.size} unique photo IDs!`);

    if (photoIds.size > 0) {
        const idArray = Array.from(photoIds);
        console.log('\nDownloading photos...\n');

        let downloaded = 0;
        let failed = 0;

        for (let i = 0; i < idArray.length; i++) {
            const photoId = idArray[i];
            const url = `https://lh3.googleusercontent.com/p/${photoId}=w1200-h1200`;
            const filename = `gbp-${String(i + 1).padStart(3, '0')}.jpg`;
            const filepath = path.join(OUTPUT_DIR, filename);

            try {
                await downloadImage(url, filepath);
                downloaded++;
                console.log(`   [${downloaded}/${idArray.length}] ${filename}`);
            } catch (err) {
                failed++;
                console.log(`   Failed: ${filename} - ${err.message}`);
            }
        }

        console.log(`\nDownload complete!`);
        console.log(`   Success: ${downloaded}`);
        console.log(`   Failed: ${failed}`);

        // Save manifest with IDs
        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'photo-ids.json'),
            JSON.stringify({
                extractedAt: new Date().toISOString(),
                totalIds: idArray.length,
                ids: idArray,
                downloadUrls: idArray.map(id => `https://lh3.googleusercontent.com/p/${id}=w1200-h1200`)
            }, null, 2)
        );
    }

    console.log('\nDone!');
}

main().catch(console.error);
