const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');

const OUTPUT_DIR = './images/gbp-all';

// Path to your Chrome user data - this will use your logged-in session
const CHROME_USER_DATA = path.join(require('os').homedir(), 'Library/Application Support/Google/Chrome');

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
    console.log('   GBP Photo Scraper (Using Your Browser)');
    console.log('===========================================\n');

    console.log('IMPORTANT: Please close Chrome completely before running this script!\n');
    console.log('This will use your logged-in Chrome profile to access Google Maps.\n');

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const collectedIds = new Set();

    // Launch Chrome using YOUR user profile
    const context = await chromium.launchPersistentContext(CHROME_USER_DATA, {
        headless: false,
        channel: 'chrome',  // Use installed Chrome
        args: [
            '--profile-directory=Default',
            '--no-first-run',
            '--no-default-browser-check'
        ],
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

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

    const extractPhotoIds = async () => {
        try {
            return await page.evaluate(() => {
                const ids = new Set();
                document.querySelectorAll('img').forEach(img => {
                    const src = img.src || img.dataset?.src || '';
                    const match = src.match(/(AF1Qip[A-Za-z0-9_-]+)/);
                    if (match) ids.add(match[1]);
                });
                document.querySelectorAll('[style*="background"]').forEach(el => {
                    const style = el.getAttribute('style') || '';
                    const match = style.match(/(AF1Qip[A-Za-z0-9_-]+)/);
                    if (match) ids.add(match[1]);
                });
                return Array.from(ids);
            });
        } catch (e) {
            return [];
        }
    };

    console.log('Step 1: Navigate to Google Maps Photos...\n');

    // Go directly to the photos URL you shared
    await page.goto('https://www.google.com/maps/place/Chris+David+Salon/@26.4597892,-80.0723885,3a,75y/data=!3m8!1e2!3m6!1sAF1QipNql6pkX6_R1vM_tNF31Ew3D7EiEOcpnDAmEomK!2e10!3e12!6shttps:%2F%2Flh3.googleusercontent.com%2Fp%2FAF1QipNql6pkX6_R1vM_tNF31Ew3D7EiEOcpnDAmEomK%3Dw224-h298-k-no!7i3000!8i4000!4m9!3m8!1s0x88d8dfddd217c5c5:0x28292bffc5f317d9!8m2!3d26.4597892!4d-80.0723885!10e5!14m1!1BCgwKCC9tLzBkczR4MAE!16s%2Fg%2F11c1p8lgxk', {
        waitUntil: 'networkidle',
        timeout: 60000
    });

    await sleep(5000);
    console.log('   Page loaded. Collecting photos...\n');

    // Initial extraction
    let ids = await extractPhotoIds();
    ids.forEach(id => collectedIds.add(id));
    console.log(`   Initial: Found ${collectedIds.size} photos\n`);

    console.log('Step 2: Scrolling through thumbnails...\n');

    for (let i = 0; i < 50; i++) {
        // Scroll various containers
        await page.evaluate(() => {
            document.querySelectorAll('[role="main"], [class*="section-scrollbox"], [class*="photos"]').forEach(el => {
                el.scrollTop += 300;
                el.scrollLeft += 200;
            });
        });

        await sleep(500);

        ids = await extractPhotoIds();
        const prevCount = collectedIds.size;
        ids.forEach(id => collectedIds.add(id));

        if (collectedIds.size > prevCount) {
            console.log(`   Scroll ${i+1}: Total ${collectedIds.size} photos`);
        }
    }

    console.log(`\nStep 3: Navigating through photos with arrow keys...\n`);

    // Navigate through the photo gallery
    let noNewCount = 0;
    for (let i = 0; i < 500; i++) {
        const prevSize = collectedIds.size;

        ids = await extractPhotoIds();
        ids.forEach(id => collectedIds.add(id));

        await page.keyboard.press('ArrowRight');
        await sleep(300);

        if (collectedIds.size > prevSize) {
            console.log(`   Arrow ${i+1}: Total ${collectedIds.size} photos`);
            noNewCount = 0;
        } else {
            noNewCount++;
            if (noNewCount > 50) {
                console.log('   No new photos for 50 presses. Trying reverse...');
                break;
            }
        }
    }

    // Try the other direction
    console.log('\nStep 4: Reverse navigation...\n');
    noNewCount = 0;
    for (let i = 0; i < 200; i++) {
        const prevSize = collectedIds.size;

        ids = await extractPhotoIds();
        ids.forEach(id => collectedIds.add(id));

        await page.keyboard.press('ArrowLeft');
        await sleep(300);

        if (collectedIds.size > prevSize) {
            console.log(`   Left ${i+1}: Total ${collectedIds.size} photos`);
            noNewCount = 0;
        } else {
            noNewCount++;
            if (noNewCount > 30) {
                break;
            }
        }
    }

    console.log(`\n===========================================`);
    console.log(`   Total Unique Photos Found: ${collectedIds.size}`);
    console.log(`===========================================\n`);

    await context.close();

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
    console.error('Error:', err.message);
    console.log('\nIf you see an error about Chrome being in use:');
    console.log('1. Completely quit Chrome (Cmd+Q)');
    console.log('2. Run this script again');
    process.exit(1);
});
