const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');
const https = require('https');

puppeteer.use(StealthPlugin());

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
    console.log('   Stealth GBP Photo Scraper');
    console.log('===========================================\n');

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const collectedIds = new Set();

    const browser = await puppeteer.launch({
        headless: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--window-size=1920,1080'
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Intercept responses to catch photo URLs
    page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('googleusercontent.com') && url.includes('AF1Qip')) {
            const match = url.match(/(AF1Qip[A-Za-z0-9_-]+)/);
            if (match && !collectedIds.has(match[1])) {
                collectedIds.add(match[1]);
                console.log(`   [Network] Photo #${collectedIds.size}: ${match[1].substring(0, 25)}...`);
            }
        }
    });

    console.log('Step 1: Navigate to Google Maps...\n');
    await page.goto('https://www.google.com/maps/place/Chris+David+Salon/@26.4597892,-80.0723885,17z/data=!4m8!3m7!1s0x88d8dfddd217c5c5:0x28292bffc5f317d9!8m2!3d26.4597892!4d-80.0723885!9m1!1b1!16s%2Fg%2F11c1p8lgxk', {
        waitUntil: 'networkidle2',
        timeout: 60000
    });

    await sleep(5000);

    // Handle consent
    console.log('Step 2: Handle consent...\n');
    try {
        const frames = page.frames();
        for (const frame of frames) {
            try {
                const btn = await frame.$('button[aria-label*="Accept"], button:contains("Accept all")');
                if (btn) {
                    await btn.click();
                    await sleep(2000);
                    break;
                }
            } catch (e) {}
        }
        // Also try main page
        await page.click('button[aria-label*="Accept"]', { timeout: 3000 }).catch(() => {});
    } catch (e) {}

    // Extract photo IDs from the page
    const extractPhotoIds = async () => {
        return await page.evaluate(() => {
            const ids = new Set();
            // Check all images
            document.querySelectorAll('img').forEach(img => {
                const src = img.src || img.dataset.src || '';
                const match = src.match(/(AF1Qip[A-Za-z0-9_-]+)/);
                if (match) ids.add(match[1]);
            });
            // Check style backgrounds
            document.querySelectorAll('[style*="background"]').forEach(el => {
                const style = el.getAttribute('style') || '';
                const match = style.match(/(AF1Qip[A-Za-z0-9_-]+)/);
                if (match) ids.add(match[1]);
            });
            // Check divs with data attributes
            document.querySelectorAll('[data-photo-url], [data-src]').forEach(el => {
                const url = el.dataset.photoUrl || el.dataset.src || '';
                const match = url.match(/(AF1Qip[A-Za-z0-9_-]+)/);
                if (match) ids.add(match[1]);
            });
            return Array.from(ids);
        });
    };

    // Click on photos tab/section
    console.log('Step 3: Navigate to photos section...\n');

    try {
        // Look for photo elements
        const photoButton = await page.$('button[data-tab-index="1"], button[aria-label*="Photos"], [data-value="Photos"]');
        if (photoButton) {
            await photoButton.click();
            await sleep(3000);
            console.log('   Clicked Photos tab');
        }
    } catch (e) {}

    // Try clicking on any visible photo
    try {
        const photos = await page.$$('img[src*="googleusercontent"]');
        if (photos.length > 0) {
            await photos[0].click();
            await sleep(2000);
            console.log('   Clicked on photo thumbnail');
        }
    } catch (e) {}

    // Look for "See all" button
    try {
        const seeAllBtn = await page.$('button[jsaction*="photos"], [aria-label*="all photos"], [data-value*="See"]');
        if (seeAllBtn) {
            await seeAllBtn.click();
            await sleep(3000);
            console.log('   Clicked See All');
        }
    } catch (e) {}

    console.log('\nStep 4: Scrolling and collecting...\n');

    // Scroll through gallery
    for (let scroll = 0; scroll < 50; scroll++) {
        // Extract IDs
        try {
            const ids = await extractPhotoIds();
            ids.forEach(id => {
                if (!collectedIds.has(id)) {
                    collectedIds.add(id);
                    console.log(`   [Scroll ${scroll}] Photo #${collectedIds.size}: ${id.substring(0, 25)}...`);
                }
            });
        } catch (e) {}

        // Scroll
        await page.evaluate(() => {
            const scrollContainers = document.querySelectorAll('[role="main"], [class*="photos"], [class*="gallery"], [class*="scroll"]');
            scrollContainers.forEach(c => {
                c.scrollTop += 400;
                c.scrollLeft += 200;
            });
            window.scrollBy(0, 400);
        });

        await sleep(600);
    }

    console.log('\nStep 5: Arrow key navigation...\n');

    // Click on a photo to open lightbox
    try {
        const firstImg = await page.$('img[src*="AF1Qip"]');
        if (firstImg) {
            await firstImg.click();
            await sleep(2000);
        }
    } catch (e) {}

    // Navigate with arrow keys
    let noNewCount = 0;
    for (let arrow = 0; arrow < 300; arrow++) {
        const prevSize = collectedIds.size;

        try {
            const ids = await extractPhotoIds();
            ids.forEach(id => {
                if (!collectedIds.has(id)) {
                    collectedIds.add(id);
                    console.log(`   [Arrow ${arrow}] Photo #${collectedIds.size}: ${id.substring(0, 25)}...`);
                }
            });
        } catch (e) {}

        await page.keyboard.press('ArrowRight');
        await sleep(350);

        if (collectedIds.size === prevSize) {
            noNewCount++;
            if (noNewCount > 50) {
                console.log('   No new photos for 50 presses, stopping.');
                break;
            }
        } else {
            noNewCount = 0;
        }
    }

    // Also try ArrowLeft
    console.log('\nStep 6: Reverse navigation...\n');
    for (let arrow = 0; arrow < 100; arrow++) {
        try {
            const ids = await extractPhotoIds();
            ids.forEach(id => {
                if (!collectedIds.has(id)) {
                    collectedIds.add(id);
                    console.log(`   [Left ${arrow}] Photo #${collectedIds.size}: ${id.substring(0, 25)}...`);
                }
            });
        } catch (e) {}

        await page.keyboard.press('ArrowLeft');
        await sleep(300);
    }

    console.log(`\n===========================================`);
    console.log(`   Total Unique Photos Found: ${collectedIds.size}`);
    console.log(`===========================================\n`);

    await browser.close();

    // Download all photos
    if (collectedIds.size > 0) {
        console.log('Downloading photos...\n');
        const idArray = Array.from(collectedIds);
        let downloaded = 0;
        let failed = 0;

        for (let i = 0; i < idArray.length; i++) {
            const id = idArray[i];
            const url = `https://lh3.googleusercontent.com/p/${id}=w2000-h2000`;
            const filename = `gbp-${String(i + 1).padStart(3, '0')}.jpg`;
            const filepath = path.join(OUTPUT_DIR, filename);

            try {
                await downloadImage(url, filepath);
                const stats = fs.statSync(filepath);
                if (stats.size > 1000) {
                    downloaded++;
                    console.log(`   [${downloaded}/${idArray.length}] ${filename} (${Math.round(stats.size/1024)}KB)`);
                } else {
                    failed++;
                    fs.unlinkSync(filepath);
                }
            } catch (err) {
                failed++;
                console.log(`   FAILED: ${filename}`);
            }
        }

        console.log(`\n===========================================`);
        console.log(`   Download Complete!`);
        console.log(`   Success: ${downloaded}`);
        console.log(`   Failed: ${failed}`);
        console.log(`   Location: ${OUTPUT_DIR}`);
        console.log(`===========================================`);

        // Save manifest
        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'manifest.json'),
            JSON.stringify({
                extractedAt: new Date().toISOString(),
                totalPhotos: downloaded,
                photoIds: idArray,
                urls: idArray.map(id => `https://lh3.googleusercontent.com/p/${id}=w2000-h2000`)
            }, null, 2)
        );
    }
}

main().catch(err => {
    console.error('Fatal Error:', err.message);
    process.exit(1);
});
