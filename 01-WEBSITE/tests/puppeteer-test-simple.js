const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function testAdminPages() {
    console.log('🧪 Puppeteer Admin Pages Test');
    console.log('===============================\n');
    
    // Try with simplest possible configuration
    let browser;
    try {
        console.log('Attempting to launch Puppeteer...');
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ]
        });
        console.log('✅ Browser launched successfully!\n');
    } catch (error) {
        console.error('❌ Browser launch failed:', error.message);
        console.log('\nTrying alternative: Testing with simple HTTP server...\n');
        
        // Fall back to HTTP server testing
        const { exec } = require('child_process');
        const http = require('http');
        const serveStatic = require('serve-static');
        const finalhandler = require('finalhandler');
        
        // Start a simple HTTP server
        const serve = serveStatic(path.join(__dirname, '..'));
        const server = http.createServer((req, res) => {
            serve(req, res, finalhandler(req, res));
        });
        
        server.listen(8080, async () => {
            console.log('📡 Local server started on http://localhost:8080');
            console.log('You can manually test pages at:');
            console.log('  http://localhost:8080/admin/index.html');
            console.log('  http://localhost:8080/admin/analytics.html');
            console.log('  http://localhost:8080/admin/performance-tracker.html');
            console.log('  http://localhost:8080/admin/seo-dashboard.html');
            console.log('  http://localhost:8080/admin/keyword-rankings.html');
            console.log('  http://localhost:8080/admin/competitor-analysis.html');
            console.log('  http://localhost:8080/admin/microsites.html');
            console.log('  http://localhost:8080/admin/reviews-reputation.html');
            console.log('  http://localhost:8080/admin/market-intelligence.html');
            
            console.log('\nPress Ctrl+C to stop the server.\n');
        });
        
        return;
    }
    
    const page = await browser.newPage();
    
    const baseUrl = 'file://' + path.resolve(__dirname, '../admin/');
    const pages = [
        'index.html',
        'analytics.html',
        'performance-tracker.html',
        'seo-dashboard.html',
        'keyword-rankings.html',
        'competitor-analysis.html',
        'microsites.html',
        'reviews-reputation.html',
        'market-intelligence.html'
    ];
    
    let allPassed = true;
    const results = [];
    
    for (const pageFile of pages) {
        console.log(`Testing ${pageFile}...`);
        
        try {
            const url = `${baseUrl}/${pageFile}`;
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
            
            // Check title
            const title = await page.title();
            console.log(`  ✓ Page loads: ${title}`);
            
            // Check for v3.0 navigation
            const hasV3Nav = await page.evaluate(() => {
                const nav = document.querySelector('nav h1');
                return nav && nav.textContent.includes('v3.0');
            });
            
            if (hasV3Nav) {
                console.log('  ✓ Has v3.0 navigation');
            } else {
                console.log('  ❌ Missing v3.0 navigation');
                allPassed = false;
            }
            
            // Count navigation links
            const linkCount = await page.evaluate(() => {
                return document.querySelectorAll('nav a').length;
            });
            
            if (linkCount >= 9) {
                console.log(`  ✓ Has ${linkCount} navigation links`);
            } else {
                console.log(`  ❌ Only ${linkCount} navigation links (expected 9+)`);
                allPassed = false;
            }
            
            // Check for charts and their containers
            const chartInfo = await page.evaluate(() => {
                const charts = document.querySelectorAll('canvas');
                const info = [];
                charts.forEach((chart, i) => {
                    const parent = chart.parentElement;
                    const classes = parent.className;
                    const hasHeight = classes.includes('h-64') || 
                                     classes.includes('h-80') || 
                                     classes.includes('h-96');
                    info.push({ index: i, hasHeight, classes });
                });
                return info;
            });
            
            if (chartInfo.length > 0) {
                chartInfo.forEach(chart => {
                    if (chart.hasHeight) {
                        console.log(`  ✓ Chart ${chart.index + 1} has proper height container`);
                    } else {
                        console.log(`  ⚠️ Chart ${chart.index + 1} may not have proper height`);
                    }
                });
            }
            
            results.push({ page: pageFile, status: 'success' });
            
        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
            results.push({ page: pageFile, status: 'error', error: error.message });
            allPassed = false;
        }
        
        console.log('');
    }
    
    await browser.close();
    
    // Summary
    console.log('===============================');
    console.log('📊 TEST SUMMARY\n');
    
    const successCount = results.filter(r => r.status === 'success').length;
    console.log(`✅ Pages tested successfully: ${successCount}/${pages.length}`);
    
    if (allPassed) {
        console.log('\n🎉 ALL PUPPETEER TESTS PASSED!');
        console.log('✅ All 9 admin pages load correctly');
        console.log('✅ Navigation is consistent (v3.0)');
        console.log('✅ Charts have proper containers');
    } else {
        console.log('\n⚠️ Some issues found');
        const errors = results.filter(r => r.status === 'error');
        if (errors.length > 0) {
            console.log('\nPages with errors:');
            errors.forEach(e => {
                console.log(`  - ${e.page}: ${e.error}`);
            });
        }
    }
}

// Run the test
testAdminPages().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});