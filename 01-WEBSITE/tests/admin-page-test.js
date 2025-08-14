const puppeteer = require('puppeteer');
const path = require('path');

async function testAdminPages() {
    console.log('🧪 Testing Admin Pages v3.0 with Puppeteer');
    console.log('===============================');
    console.log('Launching browser...');

    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: 'new', // Use new headless mode
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            defaultViewport: { width: 1200, height: 800 }
        });
        console.log('✓ Browser launched successfully');
    } catch (error) {
        console.error('❌ Failed to launch browser:', error.message);
        process.exit(1);
    }
    
    const page = await browser.newPage();
    
    const baseUrl = 'file://' + path.resolve(__dirname, '../admin/');
    const pages = [
        { name: 'Dashboard', file: 'index.html' },
        { name: 'Analytics', file: 'analytics.html' },
        { name: 'Performance Tracker', file: 'performance-tracker.html' },
        { name: 'SEO Dashboard', file: 'seo-dashboard.html' },
        { name: 'Keyword Rankings', file: 'keyword-rankings.html' },
        { name: 'Competitor Analysis', file: 'competitor-analysis.html' },
        { name: 'Microsites', file: 'microsites.html' },
        { name: 'Reviews & Reputation', file: 'reviews-reputation.html' },
        { name: 'Market Intelligence', file: 'market-intelligence.html' }
    ];

    let allPassed = true;

    for (const pageInfo of pages) {
        console.log(`\n📄 Testing ${pageInfo.name} (${pageInfo.file})`);
        console.log('-------------------------------------------');
        
        try {
            await page.goto(`${baseUrl}${pageInfo.file}`, { waitUntil: 'networkidle0' });
            
            // Check title
            const title = await page.title();
            console.log(`✓ Page loads: ${title}`);
            
            // Check navigation exists and is v3.0
            const navVersion = await page.$eval('nav h1', el => el.textContent);
            if (navVersion.includes('v3.0')) {
                console.log('✓ Navigation v3.0 present');
            } else {
                console.log('❌ Navigation version wrong:', navVersion);
                allPassed = false;
            }
            
            // Check all navigation links exist
            const navLinks = await page.$$('nav a');
            if (navLinks.length >= 9) {
                console.log(`✓ Navigation has ${navLinks.length} links`);
            } else {
                console.log(`❌ Navigation missing links: only ${navLinks.length} found`);
                allPassed = false;
            }
            
            // Check for charts (if any)
            const charts = await page.$$('canvas');
            if (charts.length > 0) {
                console.log(`✓ Found ${charts.length} chart(s)`);
                
                // Check chart containers have proper height
                for (let i = 0; i < charts.length; i++) {
                    const chartContainer = await page.evaluateHandle((chart) => {
                        return chart.parentElement;
                    }, charts[i]);
                    
                    const containerHeight = await page.evaluate((container) => {
                        const style = window.getComputedStyle(container);
                        return style.height;
                    }, chartContainer);
                    
                    if (containerHeight !== 'auto' && containerHeight !== '0px') {
                        console.log(`✓ Chart ${i+1} container has height: ${containerHeight}`);
                    } else {
                        console.log(`❌ Chart ${i+1} container has no height: ${containerHeight}`);
                        allPassed = false;
                    }
                }
            }
            
            // Check for JavaScript errors
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    console.log(`❌ JavaScript error: ${msg.text()}`);
                    allPassed = false;
                }
            });
            
            // Wait for any charts to render
            await page.waitForTimeout(2000);
            
            // Take screenshot for manual verification
            await page.screenshot({ 
                path: `tests/screenshots/${pageInfo.file.replace('.html', '')}.png`,
                fullPage: true 
            });
            
            console.log(`✓ Screenshot saved: ${pageInfo.file.replace('.html', '')}.png`);
            
        } catch (error) {
            console.log(`❌ Error testing ${pageInfo.name}:`, error.message);
            allPassed = false;
        }
    }
    
    // Test navigation between pages
    console.log('\n🔗 Testing Navigation Links');
    console.log('-----------------------------');
    
    await page.goto(`${baseUrl}index.html`);
    
    // Click each navigation link
    const navSelectors = [
        'a[href="analytics.html"]',
        'a[href="performance-tracker.html"]',
        'a[href="seo-dashboard.html"]',
        'a[href="keyword-rankings.html"]', 
        'a[href="competitor-analysis.html"]',
        'a[href="microsites.html"]',
        'a[href="reviews-reputation.html"]',
        'a[href="market-intelligence.html"]'
    ];
    
    for (const selector of navSelectors) {
        try {
            await page.click(selector);
            await page.waitForTimeout(1000);
            const url = page.url();
            console.log(`✓ Navigation works: ${url.split('/').pop()}`);
        } catch (error) {
            console.log(`❌ Navigation failed for ${selector}:`, error.message);
            allPassed = false;
        }
    }

    if (browser) {
        await browser.close();
        console.log('✓ Browser closed');
    }
    
    console.log('\n===============================');
    if (allPassed) {
        console.log('🎉 ALL TESTS PASSED!');
        console.log('✅ All 9 admin pages are working correctly');
        console.log('✅ Navigation is consistent across all pages');
        console.log('✅ Charts are properly sized');
        return true;
    } else {
        console.log('❌ SOME TESTS FAILED!');
        console.log('🔧 Fix issues before deployment');
        return false;
    }
}

// Run the test
testAdminPages().then((passed) => {
    process.exit(passed ? 0 : 1);
}).catch((error) => {
    console.error('Test runner error:', error);
    process.exit(1);
});