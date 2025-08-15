const puppeteer = require('puppeteer');

async function testLiveGallery() {
    console.log('🔍 Testing LIVE portfolio gallery...');
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        // Navigate to the live site
        await page.goto('https://www.chrisdavidsalon.com');
        
        // Wait for gallery to load
        await page.waitForSelector('#galleryGrid', { timeout: 15000 });
        
        // Get all gallery images
        const images = await page.evaluate(() => {
            const galleryItems = document.querySelectorAll('.gallery-item img');
            return Array.from(galleryItems).map(img => ({
                src: img.src,
                alt: img.alt,
                loaded: img.complete && img.naturalHeight !== 0
            }));
        });
        
        console.log(`\n📊 LIVE Gallery Test Results:`);
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
            console.log(`   URL: ${img.src.substring(0, 80)}...`);
        });
        
        console.log(`\n📈 LIVE Site Summary:`);
        console.log(`✅ Unique images: ${uniqueSrcs.size}`);
        console.log(`✅ Successfully loaded: ${loadedCount}`);
        console.log(`❌ Duplicates found: ${duplicateCount}`);
        console.log(`❌ Failed to load: ${images.length - loadedCount}`);
        
        if (duplicateCount === 0 && loadedCount === images.length) {
            console.log(`\n🎉 SUCCESS: LIVE Gallery is working perfectly!`);
            console.log(`   - All ${images.length} images are unique`);
            console.log(`   - All images loaded successfully on production`);
            console.log(`   - Gallery problem has been completely resolved`);
        } else {
            console.log(`\n⚠️  ISSUES FOUND ON LIVE SITE:`);
            if (duplicateCount > 0) {
                console.log(`   - ${duplicateCount} duplicate images still present`);
            }
            if (loadedCount < images.length) {
                console.log(`   - ${images.length - loadedCount} images failed to load on production`);
            }
        }
        
    } catch (error) {
        console.error('❌ Live test failed:', error.message);
    } finally {
        await browser.close();
    }
}

testLiveGallery().catch(console.error);