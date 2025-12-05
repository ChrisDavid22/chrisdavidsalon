/**
 * Download GBP Photos from URL List
 *
 * Usage:
 * 1. Save photo URLs to gbp-urls.txt (one per line)
 * 2. Run: node scripts/download-from-urls.cjs
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const URLS_FILE = path.join(__dirname, 'gbp-urls.txt');
const OUTPUT_DIR = path.join(__dirname, '..', 'images', 'gbp');

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : require('http');

        protocol.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                // Follow redirect
                downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
                return;
            }

            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}`));
                return;
            }

            const file = fs.createWriteStream(filepath);
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(true);
            });
            file.on('error', reject);
        }).on('error', reject);
    });
}

async function main() {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║   GBP Photo Downloader from URL List                 ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    // Check if URL file exists
    if (!fs.existsSync(URLS_FILE)) {
        console.log('❌ URL file not found: ' + URLS_FILE);
        console.log('\nTo create this file:');
        console.log('1. Go to business.google.com in Safari');
        console.log('2. Navigate to Photos section');
        console.log('3. Open Developer Console (Cmd+Option+I)');
        console.log('4. Run the extraction script from GBP_PHOTO_DOWNLOAD_INSTRUCTIONS.md');
        console.log('5. Save the URLs to: ' + URLS_FILE);
        return;
    }

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Read URLs
    const content = fs.readFileSync(URLS_FILE, 'utf-8');
    const urls = content.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && line.startsWith('http'));

    console.log(`📋 Found ${urls.length} URLs to download\n`);

    if (urls.length === 0) {
        console.log('❌ No valid URLs found in file');
        return;
    }

    // Get existing files to determine starting index
    const existingFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.jpg'));
    const startIndex = existingFiles.length + 1;

    console.log(`📁 Existing photos: ${existingFiles.length}`);
    console.log(`📥 Starting download from index ${startIndex}\n`);

    let downloaded = 0;
    let failed = 0;
    let skipped = 0;

    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const filename = `gbp-${String(startIndex + i).padStart(3, '0')}.jpg`;
        const filepath = path.join(OUTPUT_DIR, filename);

        process.stdout.write(`  [${i + 1}/${urls.length}] ${filename}... `);

        try {
            await downloadImage(url, filepath);

            // Check file size
            const stats = fs.statSync(filepath);
            if (stats.size > 1000) {
                downloaded++;
                console.log(`✓ (${Math.round(stats.size / 1024)} KB)`);
            } else {
                // Too small, probably an error
                fs.unlinkSync(filepath);
                skipped++;
                console.log('⚠ Too small, skipped');
            }
        } catch (err) {
            failed++;
            console.log(`✗ ${err.message}`);
            // Clean up partial file
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }
        }

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 200));
    }

    console.log('\n' + '═'.repeat(55));
    console.log('   DOWNLOAD COMPLETE');
    console.log('═'.repeat(55));
    console.log(`   ✓ Downloaded: ${downloaded}`);
    console.log(`   ✗ Failed: ${failed}`);
    console.log(`   ⚠ Skipped: ${skipped}`);
    console.log(`   📁 Location: ${OUTPUT_DIR}`);
    console.log('═'.repeat(55));

    // Update manifest
    const allFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.jpg'));
    const manifest = {
        downloadedAt: new Date().toISOString(),
        source: 'business.google.com manual extraction',
        totalPhotos: allFiles.length,
        files: allFiles
    };
    fs.writeFileSync(path.join(OUTPUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

    console.log(`\n✅ Manifest updated: ${allFiles.length} total photos`);
}

main().catch(console.error);
