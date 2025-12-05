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
            } else {
                response.pipe(file);
                file.on('finish', () => { file.close(); resolve(true); });
            }
        }).on('error', reject);
    });
}

async function main() {
    console.log('Starting full GBP photo scraper...\n');

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });
    const page = await context.newPage();

    console.log('Navigating to Google Maps photos page...');

    // Go directly to the photos tab URL
    await page.goto('https://www.google.com/maps/place/Chris+David+Salon/@26.4597892,-80.0723885,3a,75y/data=!3m8!1e2!3m6!1sAF1QipMExample!2e10!3e12!6shttps:%2F%2Flh5.googleusercontent.com%2Fp%2FAF1QipM!7i1080!8i1080!4m8!3m7!1s0x88d8dfddd217c5c5:0x28292bffc5f317d9!8m2!3d26.4597892!4d-80.0723885!9m1!1b1!16s%2Fg%2F11c1p8lgxk?entry=ttu', {
        waitUntil: 'domcontentloaded',
        timeout: 45000
    });

    await page.waitForTimeout(5000);

    // Try to click "See all" or Photos tab
    console.log('Looking for all photos...');

    try {
        const allPhotos = await page.locator('button:has-text("See all")').first();
        if (await allPhotos.isVisible({ timeout: 3000 })) {
            await allPhotos.click();
            await page.waitForTimeout(3000);
        }
    } catch (e) {
        console.log('No "See all" button found, trying Photos tab...');
    }

    try {
        const photosTab = await page.locator('[data-tab-index="1"]').first();
        if (await photosTab.isVisible({ timeout: 3000 })) {
            await photosTab.click();
            await page.waitForTimeout(3000);
        }
    } catch (e) {
        console.log('Continuing with current view...');
    }

    // Scroll to load more photos
    console.log('Scrolling to load all photos...');

    let previousCount = 0;
    let noNewImageCount = 0;

    for (let i = 0; i < 100; i++) {
        // Scroll the main area
        await page.evaluate(() => {
            const scrollables = document.querySelectorAll('[role="main"], .section-scrollbox, [class*="section-layout"]');
            scrollables.forEach(el => {
                el.scrollTop = el.scrollHeight;
            });
            document.querySelector('[role="main"]')?.scrollTo(0, 99999);
            window.scrollTo(0, document.body.scrollHeight);
        });

        await page.waitForTimeout(800);

        // Count images
        const images = await page.locator('img').all();
        const googleImages = [];
        for (const img of images) {
            const src = await img.getAttribute('src').catch(() => '');
            if (src && (src.includes('googleusercontent') || src.includes('ggpht'))) {
                googleImages.push(src);
            }
        }

        if (i % 5 === 0) {
            console.log(`   Scroll ${i}: Found ${googleImages.length} images...`);
        }

        if (googleImages.length === previousCount) {
            noNewImageCount++;
            if (noNewImageCount > 10) {
                console.log('   No new images found, stopping scroll.');
                break;
            }
        } else {
            noNewImageCount = 0;
        }
        previousCount = googleImages.length;
    }

    // Collect all unique image URLs
    console.log('\nCollecting all image URLs...');
    const imageUrls = await page.evaluate(() => {
        const imgs = document.querySelectorAll('img');
        const urls = new Set();
        imgs.forEach(img => {
            let src = img.src || '';
            if (src.includes('googleusercontent') || src.includes('ggpht')) {
                // Upgrade to higher resolution
                src = src.replace(/=w\d+/, '=w1200').replace(/=h\d+/, '-h1200');
                src = src.replace(/=s\d+/, '=s1200');
                if (!src.includes('=w') && !src.includes('=s')) {
                    src = src + '=s1200';
                }
                urls.add(src);
            }
        });
        return Array.from(urls);
    });

    console.log(`\nFound ${imageUrls.length} unique images!`);

    // Download all images
    console.log('\nDownloading images...\n');
    let downloaded = 0;
    let failed = 0;

    for (let i = 0; i < imageUrls.length; i++) {
        const url = imageUrls[i];
        const filename = `gbp-photo-${String(i + 1).padStart(3, '0')}.jpg`;
        const filepath = path.join(OUTPUT_DIR, filename);

        try {
            await downloadImage(url, filepath);
            downloaded++;
            if (downloaded % 10 === 0) {
                console.log(`   Downloaded: ${downloaded}/${imageUrls.length}`);
            }
        } catch (err) {
            failed++;
        }
    }

    console.log(`\nDownload complete!`);
    console.log(`   Success: ${downloaded}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Location: ${OUTPUT_DIR}`);

    // Save manifest
    fs.writeFileSync(path.join(OUTPUT_DIR, 'manifest.json'), JSON.stringify({
        downloadedAt: new Date().toISOString(),
        totalImages: downloaded,
        images: imageUrls.map((url, i) => ({
            filename: `gbp-photo-${String(i + 1).padStart(3, '0')}.jpg`,
            originalUrl: url
        }))
    }, null, 2));

    await browser.close();
}

main().catch(console.error);
