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
    console.log('   GBP Photo Scraper - Interactive Mode');
    console.log('===========================================\n');

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const collectedIds = new Set();

    // Launch browser with GUI - user will see it
    const browser = await chromium.launch({
        headless: false,
        slowMo: 50,
        args: ['--start-maximized']
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1000 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();

    // Intercept all network traffic for photos
    page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('googleusercontent.com') && url.includes('AF1Qip')) {
            const match = url.match(/(AF1Qip[A-Za-z0-9_-]+)/);
            if (match && !collectedIds.has(match[1])) {
                collectedIds.add(match[1]);
                console.log(`   [Network ${collectedIds.size}] ${match[1].substring(0, 35)}...`);
            }
        }
    });

    const extractPhotoIds = async () => {
        try {
            return await page.evaluate(() => {
                const ids = new Set();
                // Check all possible image sources
                document.querySelectorAll('img, [style*="background"]').forEach(el => {
                    const src = el.src || el.dataset?.src || el.getAttribute('style') || '';
                    const matches = src.matchAll(/(AF1Qip[A-Za-z0-9_-]+)/g);
                    for (const match of matches) {
                        ids.add(match[1]);
                    }
                });
                // Also check data attributes
                document.querySelectorAll('[data-photo-url], [data-src], [data-image]').forEach(el => {
                    for (const attr of el.attributes) {
                        const match = attr.value.match(/(AF1Qip[A-Za-z0-9_-]+)/);
                        if (match) ids.add(match[1]);
                    }
                });
                return Array.from(ids);
            });
        } catch (e) {
            return [];
        }
    };

    console.log('Opening Google Maps photo gallery...');
    console.log('>>> A browser window will open. Please wait while I navigate...\n');

    // Navigate to Google Maps - contributor photos page
    await page.goto('https://www.google.com/maps/contrib/116715476879043365028/photos', {
        waitUntil: 'domcontentloaded',
        timeout: 60000
    });

    await sleep(5000);

    // Accept cookies if needed
    try {
        const acceptBtn = page.locator('button:has-text("Accept all"), button:has-text("Accept"), button:has-text("I agree")').first();
        if (await acceptBtn.isVisible({ timeout: 3000 })) {
            await acceptBtn.click();
            await sleep(2000);
        }
    } catch (e) {}

    console.log('Scrolling through contributor photos...\n');

    // Scroll down to load all photos
    let prevCount = 0;
    let noNewCount = 0;

    for (let i = 0; i < 100; i++) {
        // Extract current photos
        const ids = await extractPhotoIds();
        ids.forEach(id => collectedIds.add(id));

        if (collectedIds.size > prevCount) {
            console.log(`   Scroll ${i+1}: Found ${collectedIds.size} photos`);
            prevCount = collectedIds.size;
            noNewCount = 0;
        } else {
            noNewCount++;
            if (noNewCount > 15) {
                console.log('   No new photos found, stopping scroll...');
                break;
            }
        }

        // Scroll down
        await page.evaluate(() => {
            window.scrollBy(0, 800);
            document.querySelectorAll('[role="main"], [class*="photo"], [class*="grid"]').forEach(el => {
                el.scrollTop += 600;
            });
        });

        await sleep(1000);
    }

    console.log('\nNow navigating to the business photos page...\n');

    // Also try the business photos page
    await page.goto('https://www.google.com/maps/place/Chris+David+Salon/@26.4597892,-80.0723885,3a,75y/data=!3m8!1e2!3m6!1sAF1QipNql6pkX6_R1vM_tNF31Ew3D7EiEOcpnDAmEomK!2e10!3e12!7i3000!8i4000!4m8!3m7!1s0x88d8dfddd217c5c5:0x28292bffc5f317d9!8m2!3d26.4597892!4d-80.0723885!9m1!1b1!16s%2Fg%2F11c1p8lgxk', {
        waitUntil: 'domcontentloaded',
        timeout: 60000
    });

    await sleep(5000);

    // Extract initial photos
    let ids = await extractPhotoIds();
    ids.forEach(id => collectedIds.add(id));
    console.log(`   Initial: ${collectedIds.size} photos\n`);

    console.log('Navigating through lightbox with arrow keys...\n');
    console.log('>>> Watch the browser - I\'m clicking through all photos...\n');

    // Navigate through the photo lightbox
    noNewCount = 0;
    for (let i = 0; i < 500; i++) {
        const prevSize = collectedIds.size;

        ids = await extractPhotoIds();
        ids.forEach(id => collectedIds.add(id));

        if (collectedIds.size > prevSize) {
            console.log(`   Photo ${i+1}: Total ${collectedIds.size}`);
            noNewCount = 0;
        } else {
            noNewCount++;
        }

        await page.keyboard.press('ArrowRight');
        await sleep(200);

        if (noNewCount > 80) {
            console.log('   Reached end of photos');
            break;
        }
    }

    // Try going backwards too
    console.log('\nGoing backwards to catch any missed photos...\n');
    noNewCount = 0;
    for (let i = 0; i < 200; i++) {
        const prevSize = collectedIds.size;

        ids = await extractPhotoIds();
        ids.forEach(id => collectedIds.add(id));

        if (collectedIds.size > prevSize) {
            console.log(`   Left ${i+1}: Total ${collectedIds.size}`);
            noNewCount = 0;
        } else {
            noNewCount++;
        }

        await page.keyboard.press('ArrowLeft');
        await sleep(200);

        if (noNewCount > 40) break;
    }

    console.log(`\n===========================================`);
    console.log(`   TOTAL PHOTOS FOUND: ${collectedIds.size}`);
    console.log(`===========================================\n`);

    await browser.close();

    // Download all photos
    if (collectedIds.size > 0) {
        console.log('Downloading all photos...\n');
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
            }
        }

        console.log(`\n===========================================`);
        console.log(`   DOWNLOAD COMPLETE`);
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
    console.error('Error:', err.message);
    process.exit(1);
});
