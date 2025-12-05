const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const OUTPUT_DIR = './images/gbp-full';

async function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const file = fs.createWriteStream(filepath);

        protocol.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                const redirectUrl = response.headers.location;
                const redirectProtocol = redirectUrl.startsWith('https') ? https : http;
                redirectProtocol.get(redirectUrl, (res) => {
                    res.pipe(file);
                    file.on('finish', () => { file.close(); resolve(true); });
                }).on('error', (e) => { fs.unlink(filepath, () => {}); reject(e); });
            } else if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => { file.close(); resolve(true); });
            } else {
                fs.unlink(filepath, () => {});
                reject(new Error(`HTTP ${response.statusCode}`));
            }
        }).on('error', (e) => { fs.unlink(filepath, () => {}); reject(e); });
    });
}

async function main() {
    console.log('🚀 Starting GBP photo extraction...\n');

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const browser = await chromium.launch({
        headless: false,  // Use visible browser to avoid detection
        slowMo: 100
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();

    console.log('📍 Navigating to Google Maps photos...');

    // Navigate to the photos page
    await page.goto('https://www.google.com/maps/place/Chris+David+Salon/@26.4569025,-80.0919268,3a,75y/data=!3m8!1e2!3m6!1sAF1QipNql6pkX6_R1vM_tNF31Ew3D7EiEOcpnDAmEomK!2e10!3e12!6shttps:%2F%2Flh3.googleusercontent.com%2Fp%2FAF1QipNql6pkX6_R1vM_tNF31Ew3D7EiEOcpnDAmEomK%3Dw224-h298-k-no!7i3000!8i4000!4m9!3m8!1s0x88d8dfdd217c36c5:0x2829d1fc5f3173d9!8m2!3d26.4569025!4d-80.0919268!10e5!14m1!1BCgwKCC9tLzBkczR4MAE!16s%2Fg%2F11f00qrssg', {
        waitUntil: 'domcontentloaded',
        timeout: 60000
    });

    console.log('⏳ Waiting for page to load...');
    await page.waitForTimeout(5000);

    // Try to dismiss any consent dialogs
    try {
        const acceptButton = page.locator('button:has-text("Accept all")');
        if (await acceptButton.isVisible({ timeout: 3000 })) {
            await acceptButton.click();
            await page.waitForTimeout(2000);
        }
    } catch (e) {}

    // Scroll the photo panel to load more
    console.log('📜 Scrolling to load all photos...');

    const allUrls = new Set();
    let scrollCount = 0;
    let lastCount = 0;

    while (scrollCount < 100) {
        // Find all image elements and extract URLs
        const urls = await page.evaluate(() => {
            const images = document.querySelectorAll('img');
            const photoUrls = [];
            images.forEach(img => {
                const src = img.src || '';
                // Look for Google user content photos
                if (src.includes('googleusercontent.com') &&
                    (src.includes('AF1Qip') || src.includes('/p/'))) {
                    // Convert to high resolution
                    let highRes = src;
                    // Remove size constraints to get full resolution
                    highRes = highRes.replace(/=w\d+(-h\d+)?(-k)?(-no)?/, '=w1200-h1200');
                    highRes = highRes.replace(/=s\d+(-c)?(-k)?(-no)?/, '=s1200');
                    if (!highRes.includes('=w') && !highRes.includes('=s')) {
                        highRes = highRes.split('=')[0] + '=w1200-h1200';
                    }
                    photoUrls.push(highRes);
                }
            });
            return photoUrls;
        });

        urls.forEach(url => allUrls.add(url));

        console.log(`   Scroll ${scrollCount + 1}: Found ${allUrls.size} unique photos...`);

        // Try to scroll the photo container
        await page.evaluate(() => {
            // Try different scroll containers
            const containers = [
                document.querySelector('[role="main"]'),
                document.querySelector('.section-scrollbox'),
                document.querySelector('[class*="photos"]'),
                document.querySelector('[class*="gallery"]'),
                ...document.querySelectorAll('[style*="overflow"]')
            ].filter(Boolean);

            containers.forEach(container => {
                if (container.scrollHeight > container.clientHeight) {
                    container.scrollTop += 500;
                }
            });

            // Also try scrolling the whole page
            window.scrollBy(0, 500);
        });

        await page.waitForTimeout(1000);

        // Check if we found new images
        if (allUrls.size === lastCount) {
            scrollCount++;
            if (scrollCount > 10 && allUrls.size === lastCount) {
                console.log('   No new images found, trying to click "See more"...');

                // Try clicking any "See more" or expand buttons
                try {
                    const seeMore = page.locator('button:has-text("See more"), button:has-text("View all")').first();
                    if (await seeMore.isVisible({ timeout: 1000 })) {
                        await seeMore.click();
                        await page.waitForTimeout(3000);
                        scrollCount = 0; // Reset scroll count
                    }
                } catch (e) {}

                if (scrollCount > 20) break;
            }
        } else {
            scrollCount = 0;
        }
        lastCount = allUrls.size;
    }

    console.log(`\n✅ Found ${allUrls.size} unique photo URLs!`);

    // Download all images
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
            process.stdout.write(`\r   Downloaded: ${downloaded}/${urlArray.length} (${failed} failed)`);
        } catch (err) {
            failed++;
        }
    }

    console.log(`\n\n✅ Download complete!`);
    console.log(`   Success: ${downloaded}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Location: ${OUTPUT_DIR}`);

    // Save manifest
    const manifest = {
        downloadedAt: new Date().toISOString(),
        totalImages: downloaded,
        sourceUrl: 'Google Maps - Chris David Salon',
        images: urlArray.map((url, i) => ({
            filename: `gbp-photo-${String(i + 1).padStart(3, '0')}.jpg`,
            originalUrl: url
        }))
    };

    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
    );

    await browser.close();
    console.log('\n🎉 Done!');
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
