const puppeteer = require('puppeteer');

async function testGallery() {
    console.log('🔍 Testing portfolio gallery images...');
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        // Navigate to the local file
        await page.goto('file:///Users/stuartkerr/Library/CloudStorage/OneDrive-Personal/ISO Vision LLC/Chris David Salon/New web site July 25/01-WEBSITE/index.html');
        
        // Wait for gallery to load
        await page.waitForSelector('#galleryGrid', { timeout: 10000 });
        
        // Get all gallery images
        const images = await page.evaluate(() => {
            const galleryItems = document.querySelectorAll('.gallery-item img');
            return Array.from(galleryItems).map(img => ({
                src: img.src,
                alt: img.alt,
                loaded: img.complete && img.naturalHeight !== 0
            }));
        });
        
        console.log(`\n📊 Gallery Test Results:`);
        console.log(`Found ${images.length} images in gallery`);
        
        const uniqueSrcs = new Set();
        let loadedCount = 0;
        let duplicateCount = 0;
        
        images.forEach((img, index) => {
            const isDuplicate = uniqueSrcs.has(img.src);
            if (isDuplicate) {
                duplicateCount++;
                console.log(`❌ Image ${index + 1}: DUPLICATE - ${img.alt}`);
            } else {
                uniqueSrcs.add(img.src);
                console.log(`${img.loaded ? '✅' : '❌'} Image ${index + 1}: ${img.loaded ? 'LOADED' : 'FAILED'} - ${img.alt}`);
                if (img.loaded) loadedCount++;
            }
            console.log(`   URL: ${img.src}`);
        });
        
        console.log(`\n📈 Summary:`);
        console.log(`✅ Unique images: ${uniqueSrcs.size}`);
        console.log(`✅ Successfully loaded: ${loadedCount}`);
        console.log(`❌ Duplicates found: ${duplicateCount}`);
        console.log(`❌ Failed to load: ${images.length - loadedCount}`);
        
        if (duplicateCount === 0 && loadedCount === images.length) {
            console.log(`\n🎉 SUCCESS: Gallery is working perfectly!`);
            console.log(`   - All ${images.length} images are unique`);
            console.log(`   - All images loaded successfully`);
            console.log(`   - No more duplicate image problem`);
        } else {
            console.log(`\n⚠️  ISSUES FOUND:`);
            if (duplicateCount > 0) {
                console.log(`   - ${duplicateCount} duplicate images need to be fixed`);
            }
            if (loadedCount < images.length) {
                console.log(`   - ${images.length - loadedCount} images failed to load`);
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

testGallery().catch(console.error);