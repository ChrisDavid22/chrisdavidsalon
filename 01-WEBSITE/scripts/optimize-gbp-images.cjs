/**
 * GBP Image Optimizer
 *
 * Creates optimized versions of all GBP images for web and mobile use.
 * Generates WebP format in multiple sizes: hero, desktop, tablet, mobile, thumbnail
 *
 * Usage: node scripts/optimize-gbp-images.cjs
 *
 * Requirements: npm install sharp
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
    sharp = require('sharp');
} catch (e) {
    console.log('Sharp not installed. Run: npm install sharp');
    console.log('\nAlternatively, you can use an online tool like:');
    console.log('- squoosh.app (free, browser-based)');
    console.log('- tinypng.com (free for <500 images/month)');
    process.exit(1);
}

const SOURCE_DIR = path.join(__dirname, '..', 'images', 'gbp');
const OUTPUT_DIR = path.join(__dirname, '..', 'images', 'gbp', 'optimized');

const SIZES = {
    hero: { width: 1920, height: 1080, quality: 85 },
    desktop: { width: 1200, height: 800, quality: 80 },
    tablet: { width: 768, height: 512, quality: 80 },
    mobile: { width: 480, height: 320, quality: 75 },
    thumbnail: { width: 150, height: 150, quality: 70 }
};

// Priority images to optimize first (best quality originals)
const PRIORITY_IMAGES = [
    'gbp-001.jpg',
    'gbp-002.jpg',
    'gbp-003.jpg',
    'gbp-004.jpg',
    'gbp-005.jpg',
    'gbp-006.jpg',
    'gbp-007.jpg',
    'gbp-008.jpg',
    'gbp-009.jpg',
    'gbp-010.jpg',
    'gbp-011.jpg',
    'gbp-012.jpg',
    'gbp-013.jpg',
    'gbp-014.jpg',
    'gbp-015.jpg',
    'gbp-016.jpg',
    'gbp-017.jpg',
    'gbp-018.jpg',
    'gbp-019.jpg',
    'gbp-020.jpg',
    'gbp-021.jpg',
    'gbp-022.jpg',
    'gbp-023.jpg'
];

async function optimizeImage(inputPath, filename) {
    const baseName = path.parse(filename).name;
    const results = [];

    for (const [sizeName, config] of Object.entries(SIZES)) {
        const outputFilename = `${baseName}-${sizeName}.webp`;
        const outputPath = path.join(OUTPUT_DIR, sizeName, outputFilename);

        // Ensure output directory exists
        const outputSubDir = path.join(OUTPUT_DIR, sizeName);
        if (!fs.existsSync(outputSubDir)) {
            fs.mkdirSync(outputSubDir, { recursive: true });
        }

        try {
            await sharp(inputPath)
                .resize(config.width, config.height, {
                    fit: 'cover',
                    position: 'center'
                })
                .webp({ quality: config.quality })
                .toFile(outputPath);

            const stats = fs.statSync(outputPath);
            results.push({
                size: sizeName,
                filename: outputFilename,
                fileSize: Math.round(stats.size / 1024) + 'KB'
            });
        } catch (err) {
            console.error(`  Error creating ${sizeName}: ${err.message}`);
        }
    }

    return results;
}

async function main() {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║   GBP Image Optimizer                                 ║');
    console.log('║   Creating WebP versions for web & mobile            ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    // Create output directories
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    for (const sizeName of Object.keys(SIZES)) {
        const dir = path.join(OUTPUT_DIR, sizeName);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    // Get all image files
    const allFiles = fs.readdirSync(SOURCE_DIR).filter(f =>
        /\.(jpg|jpeg|png|webp)$/i.test(f) && !f.startsWith('.')
    );

    // Sort: priority images first, then rest
    const sortedFiles = [
        ...PRIORITY_IMAGES.filter(f => allFiles.includes(f)),
        ...allFiles.filter(f => !PRIORITY_IMAGES.includes(f))
    ];

    console.log(`Found ${sortedFiles.length} images to optimize\n`);
    console.log('Sizes being generated:');
    for (const [name, config] of Object.entries(SIZES)) {
        console.log(`  - ${name}: ${config.width}x${config.height} @ ${config.quality}% quality`);
    }
    console.log('\n');

    let processed = 0;
    let failed = 0;

    for (const filename of sortedFiles) {
        const inputPath = path.join(SOURCE_DIR, filename);

        // Skip directories and non-files
        if (!fs.statSync(inputPath).isFile()) continue;

        process.stdout.write(`[${processed + 1}/${sortedFiles.length}] ${filename}... `);

        try {
            const results = await optimizeImage(inputPath, filename);
            processed++;
            console.log('✓');

            // Show file sizes for first few
            if (processed <= 3) {
                results.forEach(r => {
                    console.log(`    └─ ${r.size}: ${r.fileSize}`);
                });
            }
        } catch (err) {
            failed++;
            console.log(`✗ ${err.message}`);
        }
    }

    console.log('\n' + '═'.repeat(55));
    console.log('   OPTIMIZATION COMPLETE');
    console.log('═'.repeat(55));
    console.log(`   ✓ Processed: ${processed}`);
    console.log(`   ✗ Failed: ${failed}`);
    console.log(`   📁 Output: ${OUTPUT_DIR}`);
    console.log('═'.repeat(55));

    // Generate manifest of optimized images
    const manifest = {
        generatedAt: new Date().toISOString(),
        totalImages: processed,
        sizes: SIZES,
        images: {}
    };

    for (const sizeName of Object.keys(SIZES)) {
        const sizeDir = path.join(OUTPUT_DIR, sizeName);
        if (fs.existsSync(sizeDir)) {
            manifest.images[sizeName] = fs.readdirSync(sizeDir).filter(f => f.endsWith('.webp'));
        }
    }

    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
    );

    console.log('\n✅ Manifest saved to optimized/manifest.json');
}

main().catch(console.error);
