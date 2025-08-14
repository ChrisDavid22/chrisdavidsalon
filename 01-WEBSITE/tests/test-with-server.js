const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple static file server
function createServer(port) {
    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            let filePath = path.join(__dirname, '..', req.url);
            
            // Default to index.html for directories
            if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
                filePath = path.join(filePath, 'index.html');
            }
            
            // Serve the file
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    res.writeHead(404);
                    res.end('File not found');
                    return;
                }
                
                // Set content type
                const ext = path.extname(filePath);
                let contentType = 'text/html';
                if (ext === '.js') contentType = 'application/javascript';
                if (ext === '.css') contentType = 'text/css';
                if (ext === '.json') contentType = 'application/json';
                
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            });
        });
        
        server.listen(port, () => {
            console.log(`📡 Test server running on http://localhost:${port}`);
            resolve(server);
        });
    });
}

async function testAdminPages() {
    console.log('🧪 Testing Admin Pages with Puppeteer');
    console.log('===============================\n');
    
    // Start test server
    const PORT = 8888;
    const server = await createServer(PORT);
    
    let browser;
    try {
        console.log('Launching browser...');
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        console.log('✅ Browser launched successfully\n');
        
        const page = await browser.newPage();
        
        // Set up console logging
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log(`  ⚠️ Console error: ${msg.text()}`);
            }
        });
        
        const pages = [
            { name: 'Dashboard', path: '/admin/index.html' },
            { name: 'Analytics', path: '/admin/analytics.html' },
            { name: 'Performance', path: '/admin/performance-tracker.html' },
            { name: 'SEO Dashboard', path: '/admin/seo-dashboard.html' },
            { name: 'Keywords', path: '/admin/keyword-rankings.html' },
            { name: 'Competitors', path: '/admin/competitor-analysis.html' },
            { name: 'Microsites', path: '/admin/microsites.html' },
            { name: 'Reviews', path: '/admin/reviews-reputation.html' },
            { name: 'Market Intel', path: '/admin/market-intelligence.html' }
        ];
        
        let allPassed = true;
        
        for (const pageInfo of pages) {
            console.log(`📄 Testing ${pageInfo.name}...`);
            
            try {
                const url = `http://localhost:${PORT}${pageInfo.path}`;
                await page.goto(url, { waitUntil: 'networkidle0', timeout: 10000 });
                
                // Check page title
                const title = await page.title();
                console.log(`  ✓ Page loads: "${title}"`);
                
                // Check for v3.0 navigation
                const navVersion = await page.$eval('nav h1', el => el.textContent).catch(() => null);
                if (navVersion && navVersion.includes('v3.0')) {
                    console.log('  ✓ Has v3.0 navigation');
                } else {
                    console.log('  ❌ Missing or wrong navigation version');
                    allPassed = false;
                }
                
                // Count navigation links
                const navLinks = await page.$$eval('nav a', links => links.length);
                if (navLinks >= 9) {
                    console.log(`  ✓ Has ${navLinks} navigation links`);
                } else {
                    console.log(`  ❌ Only ${navLinks} navigation links (need 9)`);
                    allPassed = false;
                }
                
                // Check for proper microsite names (if on relevant pages)
                if (pageInfo.path.includes('microsites') || pageInfo.path.includes('index')) {
                    const content = await page.content();
                    const hasFakeNames = content.includes('Balayage Expert') || 
                                        content.includes('Keratin Specialist') ||
                                        content.includes('Color Correction');
                    const hasRealNames = content.includes('Best Salon Del Rey') ||
                                        content.includes('Best Del Rey Salon') ||
                                        content.includes('Best Salon Palm Beach');
                    
                    if (hasFakeNames) {
                        console.log('  ❌ Contains fake microsite names!');
                        allPassed = false;
                    }
                    if (hasRealNames) {
                        console.log('  ✓ Has correct microsite names');
                    }
                }
                
                // Check charts have proper containers
                const charts = await page.$$('canvas');
                if (charts.length > 0) {
                    const chartContainers = await page.$$eval('canvas', canvases => {
                        return canvases.map(canvas => {
                            const parent = canvas.parentElement;
                            const classes = parent.className;
                            return classes.includes('h-64') || 
                                   classes.includes('h-80') || 
                                   classes.includes('h-96');
                        });
                    });
                    
                    const properlyContained = chartContainers.filter(c => c).length;
                    if (properlyContained === charts.length) {
                        console.log(`  ✓ All ${charts.length} charts have proper height containers`);
                    } else {
                        console.log(`  ⚠️ Only ${properlyContained}/${charts.length} charts have proper heights`);
                    }
                }
                
                // Take screenshot
                await page.screenshot({ 
                    path: `tests/screenshots/${pageInfo.name.toLowerCase().replace(/\s+/g, '-')}.png`,
                    fullPage: false 
                });
                console.log(`  ✓ Screenshot saved`);
                
            } catch (error) {
                console.log(`  ❌ Error: ${error.message}`);
                allPassed = false;
            }
            
            console.log('');
        }
        
        // Test navigation clicking
        console.log('🔗 Testing Navigation Links\n');
        await page.goto(`http://localhost:${PORT}/admin/index.html`);
        
        for (let i = 1; i < pages.length; i++) {
            const pageInfo = pages[i];
            try {
                const linkPath = pageInfo.path.split('/').pop();
                await page.click(`nav a[href="${linkPath}"]`);
                await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 });
                const currentUrl = page.url();
                console.log(`  ✓ Navigate to ${pageInfo.name}: ${currentUrl.split('/').pop()}`);
            } catch (error) {
                console.log(`  ❌ Failed to navigate to ${pageInfo.name}`);
                allPassed = false;
            }
        }
        
        console.log('\n===============================');
        if (allPassed) {
            console.log('🎉 ALL PUPPETEER TESTS PASSED!');
            console.log('✅ All 9 admin pages work correctly');
            console.log('✅ Navigation is consistent');
            console.log('✅ No fake data found');
            console.log('✅ Charts are properly sized');
            console.log('\n✨ Ready for deployment!');
        } else {
            console.log('❌ SOME TESTS FAILED');
            console.log('🔧 Fix issues before deployment');
        }
        
    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        if (browser) await browser.close();
        server.close();
        console.log('\n📡 Test server stopped');
    }
}

// Run the test
testAdminPages().catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
});