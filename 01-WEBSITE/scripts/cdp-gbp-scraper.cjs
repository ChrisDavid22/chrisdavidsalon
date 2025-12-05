const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync, spawn } = require('child_process');

const OUTPUT_DIR = './images/gbp-all';
const TEMP_PROFILE = '/tmp/chrome-gbp-scraper';

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
    console.log('   GBP Photo Scraper with Fresh Chrome');
    console.log('===========================================\n');

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Clean up temp profile
    if (fs.existsSync(TEMP_PROFILE)) {
        fs.rmSync(TEMP_PROFILE, { recursive: true, force: true });
    }
    fs.mkdirSync(TEMP_PROFILE, { recursive: true });

    const collectedIds = new Set();

    console.log('Launching Chrome with remote debugging...\n');

    // Launch Chrome with remote debugging enabled
    const chromeProcess = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
        '--remote-debugging-port=9222',
        `--user-data-dir=${TEMP_PROFILE}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--window-size=1920,1080',
        'about:blank'
    ], {
        detached: true,
        stdio: 'ignore'
    });

    chromeProcess.unref();

    // Wait for Chrome to start
    await sleep(3000);

    // Connect to Chrome via CDP
    console.log('Connecting to Chrome...\n');
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const context = browser.contexts()[0];
    const page = context.pages()[0] || await context.newPage();

    // Intercept network responses
    page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('googleusercontent.com') && url.includes('AF1Qip')) {
            const match = url.match(/(AF1Qip[A-Za-z0-9_-]+)/);
            if (match && !collectedIds.has(match[1])) {
                collectedIds.add(match[1]);
                console.log(`   [Net] #${collectedIds.size}: ${match[1].substring(0, 30)}...`);
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

    console.log('Step 1: Navigate to Google Maps...\n');

    await page.goto('https://www.google.com/maps/place/Chris+David+Salon/@26.4597892,-80.0723885,3a,75y/data=!3m8!1e2!3m6!1sAF1QipNql6pkX6_R1vM_tNF31Ew3D7EiEOcpnDAmEomK!2e10!3e12!7i3000!8i4000!4m8!3m7!1s0x88d8dfddd217c5c5:0x28292bffc5f317d9!8m2!3d26.4597892!4d-80.0723885!9m1!1b1!16s%2Fg%2F11c1p8lgxk', {
        waitUntil: 'networkidle',
        timeout: 60000
    });

    await sleep(5000);

    // Handle any dialogs
    try {
        await page.click('button:has-text("Accept"), button:has-text("I agree")', { timeout: 3000 });
        await sleep(1000);
    } catch (e) {}

    console.log('Step 2: Collect initial photos...\n');

    let ids = await extractPhotoIds();
    ids.forEach(id => collectedIds.add(id));
    console.log(`   Found ${collectedIds.size} photos initially\n`);

    console.log('Step 3: Scroll and navigate...\n');

    // Scroll through thumbnails
    for (let i = 0; i < 30; i++) {
        await page.evaluate(() => {
            document.querySelectorAll('[role="main"], [class*="photos"], [class*="scroll"]').forEach(el => {
                el.scrollTop += 400;
                el.scrollLeft += 300;
            });
        });
        await sleep(500);

        ids = await extractPhotoIds();
        const prevCount = collectedIds.size;
        ids.forEach(id => collectedIds.add(id));
        if (collectedIds.size > prevCount) {
            console.log(`   Scroll ${i+1}: ${collectedIds.size} photos`);
        }
    }

    console.log('\nStep 4: Arrow key navigation...\n');

    // Navigate through photos
    let noNewCount = 0;
    for (let i = 0; i < 400; i++) {
        const prevSize = collectedIds.size;

        ids = await extractPhotoIds();
        ids.forEach(id => collectedIds.add(id));

        await page.keyboard.press('ArrowRight');
        await sleep(250);

        if (collectedIds.size > prevSize) {
            console.log(`   Arrow ${i+1}: ${collectedIds.size} photos`);
            noNewCount = 0;
        } else {
            noNewCount++;
            if (noNewCount > 60) {
                console.log('   Reached end, trying reverse...');
                break;
            }
        }
    }

    // Go back the other way
    noNewCount = 0;
    for (let i = 0; i < 200; i++) {
        const prevSize = collectedIds.size;

        ids = await extractPhotoIds();
        ids.forEach(id => collectedIds.add(id));

        await page.keyboard.press('ArrowLeft');
        await sleep(250);

        if (collectedIds.size > prevSize) {
            console.log(`   Left ${i+1}: ${collectedIds.size} photos`);
            noNewCount = 0;
        } else {
            noNewCount++;
            if (noNewCount > 40) break;
        }
    }

    console.log(`\n===========================================`);
    console.log(`   Total Photos Found: ${collectedIds.size}`);
    console.log(`===========================================\n`);

    // Close browser
    try {
        await browser.close();
        execSync('pkill -f "remote-debugging-port=9222"', { stdio: 'ignore' });
    } catch (e) {}

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
            }
        }

        console.log(`\n===========================================`);
        console.log(`   Download Complete: ${downloaded} photos`);
        console.log(`   Location: ${OUTPUT_DIR}`);
        console.log(`===========================================`);

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
    try {
        execSync('pkill -f "remote-debugging-port=9222"', { stdio: 'ignore' });
    } catch (e) {}
    process.exit(1);
});
