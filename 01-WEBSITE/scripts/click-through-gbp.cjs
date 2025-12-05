const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');

const OUTPUT_DIR = './images/gbp-full';

async function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                https.get(response.headers.location, (res) => {
                    res.pipe(file);
                    file.on('finish', () => { file.close(); resolve(true); });
                }).on('error', reject);
            } else if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => { file.close(); resolve(true); });
            } else {
                reject(new Error(`HTTP ${response.statusCode}`));
            }
        }).on('error', reject);
    });
}

async function main() {
    console.log('🚀 Starting GBP photo click-through extraction...\n');

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const browser = await chromium.launch({
        headless: false,
        slowMo: 50
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();

    console.log('📍 Navigating to Chris David Salon on Google Maps...');

    // Go to the main business page first
    await page.goto('https://www.google.com/maps/place/Chris+David+Salon/@26.4597892,-80.0723885,17z', {
        waitUntil: 'networkidle',
        timeout: 60000
    });

    console.log('⏳ Waiting for page to load...');
    await page.waitForTimeout(3000);

    // Accept cookies if needed
    try {
        const acceptBtn = page.locator('button:has-text("Accept")').first();
        if (await acceptBtn.isVisible({ timeout: 2000 })) {
            await acceptBtn.click();
            await page.waitForTimeout(1000);
        }
    } catch (e) {}

    // Click on Photos tab
    console.log('📸 Looking for Photos tab...');
    try {
        // Try different selectors for the photos tab
        const photosTab = page.locator('button[aria-label*="Photos"], button:has-text("Photos"), [data-tab-index="1"]').first();
        await photosTab.click({ timeout: 5000 });
        await page.waitForTimeout(3000);
        console.log('   Clicked Photos tab');
    } catch (e) {
        console.log('   Could not find Photos tab, looking for photo thumbnails...');
    }

    // Now find and click on photo thumbnails
    const allUrls = new Set();
    let photoIndex = 0;

    console.log('🖼️  Clicking through photos to extract URLs...');

    // Find all clickable photo elements
    while (photoIndex < 300) {
        try {
            // Get current large image URL if visible
            const largeImg = await page.evaluate(() => {
                const imgs = document.querySelectorAll('img');
                for (const img of imgs) {
                    const src = img.src || '';
                    // Look for large photos (AF1Qip indicates Google user photos)
                    if (src.includes('googleusercontent.com') &&
                        src.includes('AF1Qip') &&
                        (src.includes('w1') || src.includes('=s') || img.naturalWidth > 500)) {
                        // Get high resolution version
                        let highRes = src.split('=')[0] + '=w1200-h1200';
                        return highRes;
                    }
                }
                return null;
            });

            if (largeImg && !allUrls.has(largeImg)) {
                allUrls.add(largeImg);
                console.log(`   Found photo ${allUrls.size}: ${largeImg.substring(0, 60)}...`);
            }

            // Try to click "Next" or right arrow to go to next photo
            const nextClicked = await page.evaluate(() => {
                // Look for next button
                const nextBtns = document.querySelectorAll('button[aria-label*="Next"], button[aria-label*="next"], [class*="next"], [class*="arrow-right"]');
                for (const btn of nextBtns) {
                    if (btn.offsetParent !== null) { // is visible
                        btn.click();
                        return true;
                    }
                }

                // Try clicking right side of the image (common navigation pattern)
                const mainImg = document.querySelector('img[src*="AF1Qip"]');
                if (mainImg) {
                    const rect = mainImg.getBoundingClientRect();
                    const event = new MouseEvent('click', {
                        bubbles: true,
                        clientX: rect.right - 50,
                        clientY: rect.top + rect.height / 2
                    });
                    mainImg.dispatchEvent(event);
                    return true;
                }

                return false;
            });

            if (!nextClicked) {
                // Try pressing right arrow key
                await page.keyboard.press('ArrowRight');
            }

            await page.waitForTimeout(800);
            photoIndex++;

            // Check if we've looped back (same image appears twice)
            if (photoIndex > 10 && allUrls.size < photoIndex / 3) {
                console.log('   Appears to be looping, stopping...');
                break;
            }

        } catch (e) {
            console.log(`   Error at photo ${photoIndex}: ${e.message}`);
            photoIndex++;
            if (photoIndex > 20 && allUrls.size === 0) {
                console.log('   No photos found, stopping...');
                break;
            }
        }
    }

    console.log(`\n✅ Found ${allUrls.size} unique photo URLs!`);

    // Download all images
    if (allUrls.size > 0) {
        const urlArray = Array.from(allUrls);
        console.log('\n⬇️  Downloading images...\n');

        let downloaded = 0;
        let failed = 0;

        for (let i = 0; i < urlArray.length; i++) {
            const url = urlArray[i];
            const filename = `gbp-photo-${String(i + 1).padStart(3, '0')}.jpg`;
            const filepath = path.join(OUTPUT_DIR, filename);

            try {
                await downloadImage(url, filepath);
                downloaded++;
                console.log(`   ✓ Downloaded ${filename}`);
            } catch (err) {
                failed++;
                console.log(`   ✗ Failed ${filename}: ${err.message}`);
            }
        }

        console.log(`\n✅ Download complete!`);
        console.log(`   Success: ${downloaded}`);
        console.log(`   Failed: ${failed}`);
        console.log(`   Location: ${OUTPUT_DIR}`);

        // Save manifest
        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'manifest.json'),
            JSON.stringify({
                downloadedAt: new Date().toISOString(),
                totalImages: downloaded,
                images: urlArray.map((url, i) => ({
                    filename: `gbp-photo-${String(i + 1).padStart(3, '0')}.jpg`,
                    originalUrl: url
                }))
            }, null, 2)
        );
    }

    await browser.close();
    console.log('\n🎉 Done!');
}

main().catch(console.error);
