const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');

const OUTPUT_DIR = './images/gbp-all';

async function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout')), 30000);
        https.get(url, (response) => {
            clearTimeout(timeout);
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

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('===========================================');
    console.log('   Smart GBP Photo Scraper');
    console.log('===========================================\n');

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const collectedUrls = new Set();
    const collectedIds = new Set();

    const browser = await chromium.launch({
        headless: false,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        locale: 'en-US',
        timezoneId: 'America/New_York',
        geolocation: { latitude: 26.4597892, longitude: -80.0723885 },
        permissions: ['geolocation']
    });

    // Remove webdriver flag
    await context.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    const page = await context.newPage();

    // Collect URLs from network requests
    page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('googleusercontent.com/p/AF1Qip')) {
            const match = url.match(/(AF1Qip[A-Za-z0-9_-]+)/);
            if (match && !collectedIds.has(match[1])) {
                collectedIds.add(match[1]);
                const highResUrl = `https://lh3.googleusercontent.com/p/${match[1]}=w2000-h2000`;
                collectedUrls.add(highResUrl);
                console.log(`   [Network] Found photo #${collectedIds.size}: ${match[1].substring(0, 20)}...`);
            }
        }
    });

    console.log('Step 1: Navigate to Google Maps...');
    await page.goto('https://www.google.com/maps/search/Chris+David+Salon+Delray+Beach', {
        waitUntil: 'domcontentloaded',
        timeout: 60000
    });
    await sleep(4000);

    // Handle consent
    console.log('Step 2: Handling consent dialogs...');
    try {
        const consentBtn = page.locator('button:has-text("Accept all"), button:has-text("Reject all")').first();
        if (await consentBtn.isVisible({ timeout: 3000 })) {
            await consentBtn.click();
            await sleep(2000);
        }
    } catch (e) {}

    // Click on the business
    console.log('Step 3: Clicking on business listing...');
    try {
        await page.locator('text=Chris David Salon').first().click({ timeout: 5000 });
        await sleep(3000);
    } catch (e) {
        console.log('   Trying alternative selector...');
        try {
            await page.locator('[role="article"]').first().click({ timeout: 5000 });
            await sleep(3000);
        } catch (e2) {}
    }

    // Find and click on photos section
    console.log('Step 4: Looking for photos...');

    // Try clicking on photo thumbnail or photos tab
    const photoSelectors = [
        'button[aria-label*="photo"]',
        'button:has-text("Photos")',
        '[data-photo-index]',
        'img[src*="googleusercontent"][decoding="async"]',
        '[class*="gallery"]',
        '[aria-label*="Photo"]'
    ];

    for (const selector of photoSelectors) {
        try {
            const el = page.locator(selector).first();
            if (await el.isVisible({ timeout: 2000 })) {
                await el.click();
                console.log(`   Clicked: ${selector}`);
                await sleep(3000);
                break;
            }
        } catch (e) {}
    }

    // Look for "See all photos" or similar
    console.log('Step 5: Looking for "See all photos"...');
    try {
        const seeAll = page.locator('button:has-text("See all"), a:has-text("See all"), button:has-text("All")').first();
        if (await seeAll.isVisible({ timeout: 3000 })) {
            await seeAll.click();
            await sleep(3000);
        }
    } catch (e) {}

    // Extract URLs from current DOM
    const extractUrls = async () => {
        const urls = await page.evaluate(() => {
            const imgs = document.querySelectorAll('img');
            const found = [];
            imgs.forEach(img => {
                const src = img.src || img.getAttribute('data-src') || '';
                const match = src.match(/(AF1Qip[A-Za-z0-9_-]+)/);
                if (match) {
                    found.push(match[1]);
                }
            });
            // Also check background images
            document.querySelectorAll('*').forEach(el => {
                const style = window.getComputedStyle(el);
                const bg = style.backgroundImage;
                if (bg && bg.includes('AF1Qip')) {
                    const match = bg.match(/(AF1Qip[A-Za-z0-9_-]+)/);
                    if (match) found.push(match[1]);
                }
            });
            return [...new Set(found)];
        });
        return urls;
    };

    console.log('Step 6: Scrolling through photo gallery...');

    // Scroll through the gallery
    for (let i = 0; i < 30; i++) {
        const ids = await extractUrls();
        ids.forEach(id => {
            if (!collectedIds.has(id)) {
                collectedIds.add(id);
                collectedUrls.add(`https://lh3.googleusercontent.com/p/${id}=w2000-h2000`);
                console.log(`   [DOM] Found photo #${collectedIds.size}: ${id.substring(0, 20)}...`);
            }
        });

        // Scroll in various containers
        await page.evaluate(() => {
            document.querySelectorAll('[role="main"], [class*="scroll"], [class*="photo"], [class*="gallery"]').forEach(el => {
                el.scrollTop += 500;
                el.scrollLeft += 300;
            });
            window.scrollBy(0, 300);
        });

        await sleep(800);
    }

    // Navigate through photos with arrow keys
    console.log('Step 7: Navigating with arrow keys...');

    // Click on first photo to enter lightbox
    try {
        const firstPhoto = page.locator('img[src*="googleusercontent"]').first();
        if (await firstPhoto.isVisible({ timeout: 3000 })) {
            await firstPhoto.click();
            await sleep(2000);
        }
    } catch (e) {}

    // Press arrow keys to navigate
    let noNewCount = 0;
    for (let i = 0; i < 200; i++) {
        const prevCount = collectedIds.size;

        // Extract from DOM
        const ids = await extractUrls();
        ids.forEach(id => {
            if (!collectedIds.has(id)) {
                collectedIds.add(id);
                collectedUrls.add(`https://lh3.googleusercontent.com/p/${id}=w2000-h2000`);
                console.log(`   [Arrow ${i}] Found photo #${collectedIds.size}`);
            }
        });

        await page.keyboard.press('ArrowRight');
        await sleep(400);

        if (collectedIds.size === prevCount) {
            noNewCount++;
            if (noNewCount > 30) {
                console.log('   No new photos for 30 iterations, trying left...');
                // Try going back the other way
                for (let j = 0; j < 50; j++) {
                    await page.keyboard.press('ArrowLeft');
                    await sleep(300);
                    const ids2 = await extractUrls();
                    ids2.forEach(id => {
                        if (!collectedIds.has(id)) {
                            collectedIds.add(id);
                            collectedUrls.add(`https://lh3.googleusercontent.com/p/${id}=w2000-h2000`);
                            console.log(`   [Left ${j}] Found photo #${collectedIds.size}`);
                        }
                    });
                }
                break;
            }
        } else {
            noNewCount = 0;
        }
    }

    console.log(`\n===========================================`);
    console.log(`   Found ${collectedIds.size} unique photos!`);
    console.log(`===========================================\n`);

    await browser.close();

    // Download all photos
    if (collectedUrls.size > 0) {
        console.log('Downloading photos...\n');
        const urlArray = Array.from(collectedUrls);
        let downloaded = 0;
        let failed = 0;

        for (let i = 0; i < urlArray.length; i++) {
            const url = urlArray[i];
            const match = url.match(/(AF1Qip[A-Za-z0-9_-]+)/);
            const filename = `photo-${String(i + 1).padStart(3, '0')}.jpg`;
            const filepath = path.join(OUTPUT_DIR, filename);

            try {
                await downloadImage(url, filepath);
                const stats = fs.statSync(filepath);
                downloaded++;
                console.log(`   [${downloaded}/${urlArray.length}] ${filename} (${Math.round(stats.size/1024)}KB)`);
            } catch (err) {
                failed++;
                console.log(`   FAILED: ${filename} - ${err.message}`);
            }
        }

        console.log(`\n===========================================`);
        console.log(`   Download Complete!`);
        console.log(`   Success: ${downloaded}`);
        console.log(`   Failed: ${failed}`);
        console.log(`   Location: ${OUTPUT_DIR}`);
        console.log(`===========================================`);

        // Save manifest
        const idArray = Array.from(collectedIds);
        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'manifest.json'),
            JSON.stringify({
                extractedAt: new Date().toISOString(),
                totalPhotos: downloaded,
                photoIds: idArray,
                urls: urlArray
            }, null, 2)
        );
    }
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
