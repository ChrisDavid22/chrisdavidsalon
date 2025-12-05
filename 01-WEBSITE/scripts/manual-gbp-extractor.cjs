/**
 * MANUAL GBP PHOTO EXTRACTOR
 *
 * This script helps you extract ALL photos from Google Maps.
 *
 * INSTRUCTIONS:
 * 1. Open Chrome manually
 * 2. Go to: chrome://flags/#enable-remote-debugging
 * 3. Or launch Chrome with: /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
 * 4. Navigate to the Google Maps photos page for Chris David Salon
 * 5. Run this script
 *
 * The script will connect to your browser and extract photo URLs as you scroll.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');
const readline = require('readline');

const OUTPUT_DIR = './images/gbp';

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
    console.log('='.repeat(60));
    console.log('   MANUAL GBP PHOTO EXTRACTOR');
    console.log('='.repeat(60));
    console.log('\nThis script will help you download ALL photos from Google Maps.\n');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('STEP 1: Please do the following:');
    console.log('  1. Quit Chrome completely (Cmd+Q)');
    console.log('  2. Open Terminal and run:');
    console.log('     /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222\n');
    console.log('  3. In Chrome, go to: https://www.google.com/maps/place/Chris+David+Salon');
    console.log('  4. Click on "Photos" and start scrolling through ALL photos');
    console.log('  5. Keep scrolling until you see all photos loaded\n');

    await new Promise(resolve => {
        rl.question('Press ENTER when you have scrolled through all photos...', resolve);
    });

    console.log('\nConnecting to your Chrome browser...');

    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        console.log('Connected!\n');

        const contexts = browser.contexts();
        if (contexts.length === 0) {
            throw new Error('No browser contexts found');
        }

        const context = contexts[0];
        const pages = context.pages();

        console.log(`Found ${pages.length} tabs open.`);

        const collectedIds = new Set();

        // Check all pages for Google Maps photos
        for (const page of pages) {
            const url = page.url();
            if (url.includes('google.com/maps')) {
                console.log(`\nScanning: ${url.substring(0, 80)}...`);

                // Extract photo IDs from the page
                const ids = await page.evaluate(() => {
                    const foundIds = new Set();

                    // Check all images
                    document.querySelectorAll('img').forEach(img => {
                        const src = img.src || img.dataset?.src || '';
                        const match = src.match(/(AF1Qip[A-Za-z0-9_-]+)/);
                        if (match) foundIds.add(match[1]);
                    });

                    // Check background images
                    document.querySelectorAll('[style*="background"]').forEach(el => {
                        const style = el.getAttribute('style') || '';
                        const match = style.match(/(AF1Qip[A-Za-z0-9_-]+)/);
                        if (match) foundIds.add(match[1]);
                    });

                    // Check data attributes
                    document.querySelectorAll('*').forEach(el => {
                        for (const attr of el.attributes) {
                            const match = attr.value.match(/(AF1Qip[A-Za-z0-9_-]+)/g);
                            if (match) match.forEach(id => foundIds.add(id));
                        }
                    });

                    return Array.from(foundIds);
                });

                ids.forEach(id => collectedIds.add(id));
                console.log(`   Found ${ids.length} photo IDs on this page`);
            }
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log(`   TOTAL UNIQUE PHOTOS FOUND: ${collectedIds.size}`);
        console.log(`${'='.repeat(60)}\n`);

        if (collectedIds.size === 0) {
            console.log('No photos found. Make sure you have the Google Maps photos page open.');
            rl.close();
            return;
        }

        await new Promise(resolve => {
            rl.question(`Download ${collectedIds.size} photos? (y/n): `, (answer) => {
                if (answer.toLowerCase() !== 'y') {
                    console.log('Cancelled.');
                    process.exit(0);
                }
                resolve();
            });
        });

        // Download all photos
        console.log('\nDownloading photos...\n');
        const idArray = Array.from(collectedIds);
        let downloaded = 0;
        let failed = 0;

        // Get existing photos to avoid re-downloading
        const existingFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.jpg'));
        const startIndex = existingFiles.length + 1;

        for (let i = 0; i < idArray.length; i++) {
            const id = idArray[i];
            const url = `https://lh3.googleusercontent.com/p/${id}=w2000-h2000`;
            const filename = `gbp-${String(startIndex + i).padStart(3, '0')}.jpg`;
            const filepath = path.join(OUTPUT_DIR, filename);

            // Skip if we already have this ID
            const existingWithId = existingFiles.find(f => {
                // Check manifest for existing ID
                return false; // Simplified - download all
            });

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

        console.log(`\n${'='.repeat(60)}`);
        console.log(`   DOWNLOAD COMPLETE`);
        console.log(`   Success: ${downloaded}`);
        console.log(`   Failed: ${failed}`);
        console.log(`   Location: ${OUTPUT_DIR}`);
        console.log(`${'='.repeat(60)}`);

        // Update manifest
        const manifest = {
            extractedAt: new Date().toISOString(),
            totalPhotos: downloaded + existingFiles.length,
            photoIds: idArray
        };
        fs.writeFileSync(path.join(OUTPUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

        rl.close();

    } catch (err) {
        console.error('\nError:', err.message);
        console.log('\nMake sure Chrome is running with --remote-debugging-port=9222');
        rl.close();
    }
}

main();
