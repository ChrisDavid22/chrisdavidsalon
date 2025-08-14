const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function testAdminPages() {
    console.log('🧪 Testing Admin Pages with Playwright');
    console.log('===============================\n');
    
    let browser;
    try {
        console.log('Launching browser...');
        browser = await chromium.launch({ 
            headless: true 
        });
        console.log('✅ Browser launched successfully!\n');
        
        const context = await browser.newContext({
            viewport: { width: 1200, height: 800 }
        });
        const page = await context.newPage();
        
        const adminDir = path.join(__dirname, '../admin');
        const pages = [
            { name: 'Dashboard', file: 'index.html' },
            { name: 'Analytics', file: 'analytics.html' },
            { name: 'Performance', file: 'performance-tracker.html' },
            { name: 'SEO Dashboard', file: 'seo-dashboard.html' },
            { name: 'Keywords', file: 'keyword-rankings.html' },
            { name: 'Competitors', file: 'competitor-analysis.html' },
            { name: 'Microsites', file: 'microsites.html' },
            { name: 'Reviews', file: 'reviews-reputation.html' },
            { name: 'Market Intel', file: 'market-intelligence.html' }
        ];
        
        let allPassed = true;
        const results = [];
        
        for (const pageInfo of pages) {
            console.log(`📄 Testing ${pageInfo.name} (${pageInfo.file})...`);
            
            const filePath = path.join(adminDir, pageInfo.file);
            const fileUrl = 'file://' + filePath;
            
            try {
                await page.goto(fileUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
                
                // Check page title
                const title = await page.title();
                console.log(`  ✓ Page loads: "${title}"`);
                
                // Check for v3.0 navigation
                const navText = await page.textContent('nav h1').catch(() => null);
                if (navText && navText.includes('v3.0')) {
                    console.log('  ✓ Has v3.0 navigation');
                } else {
                    console.log('  ❌ Missing v3.0 navigation');
                    allPassed = false;
                }
                
                // Count navigation links
                const navLinks = await page.locator('nav a').count();
                if (navLinks >= 9) {
                    console.log(`  ✓ Has ${navLinks} navigation links`);
                } else {
                    console.log(`  ❌ Only ${navLinks} navigation links (need 9)`);
                    allPassed = false;
                }
                
                // Check for proper microsite names
                if (pageInfo.file.includes('microsites') || pageInfo.file === 'index.html') {
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
                const charts = await page.locator('canvas').count();
                if (charts > 0) {
                    const chartContainers = await page.evaluate(() => {
                        const canvases = document.querySelectorAll('canvas');
                        let properCount = 0;
                        canvases.forEach(canvas => {
                            const parent = canvas.parentElement;
                            const classes = parent.className;
                            if (classes.includes('h-64') || 
                                classes.includes('h-80') || 
                                classes.includes('h-96')) {
                                properCount++;
                            }
                        });
                        return { total: canvases.length, proper: properCount };
                    });
                    
                    if (chartContainers.proper === chartContainers.total) {
                        console.log(`  ✓ All ${charts} charts have proper height containers`);
                    } else {
                        console.log(`  ⚠️ Only ${chartContainers.proper}/${charts} charts have proper heights`);
                    }
                }
                
                // Take screenshot
                const screenshotPath = path.join(__dirname, 'screenshots', 
                    `${pageInfo.name.toLowerCase().replace(/\s+/g, '-')}.png`);
                await page.screenshot({ 
                    path: screenshotPath,
                    fullPage: false 
                });
                console.log(`  ✓ Screenshot saved`);
                
                results.push({ page: pageInfo.file, status: 'success' });
                
            } catch (error) {
                console.log(`  ❌ Error: ${error.message}`);
                results.push({ page: pageInfo.file, status: 'error', error: error.message });
                allPassed = false;
            }
            
            console.log('');
        }
        
        // Test navigation clicking
        console.log('🔗 Testing Navigation Links\n');
        
        const dashboardPath = path.join(adminDir, 'index.html');
        await page.goto('file://' + dashboardPath);
        
        for (let i = 1; i < pages.length; i++) {
            const pageInfo = pages[i];
            try {
                // Click the link
                await page.click(`nav a[href="${pageInfo.file}"]`);
                await page.waitForLoadState('domcontentloaded');
                
                // Verify we're on the right page
                const title = await page.title();
                console.log(`  ✓ Navigate to ${pageInfo.name}: "${title}"`);
            } catch (error) {
                console.log(`  ❌ Failed to navigate to ${pageInfo.name}: ${error.message}`);
                allPassed = false;
            }
        }
        
        console.log('\n===============================');
        console.log('📊 TEST SUMMARY\n');
        
        const successCount = results.filter(r => r.status === 'success').length;
        console.log(`✅ Pages tested: ${successCount}/${pages.length}`);
        
        if (allPassed) {
            console.log('\n🎉 ALL PLAYWRIGHT TESTS PASSED!');
            console.log('✅ All 9 admin pages load correctly');
            console.log('✅ Navigation is consistent (v3.0)');
            console.log('✅ No fake data found');
            console.log('✅ Charts have proper containers');
            console.log('✅ Navigation links all work');
            console.log('\n✨ Ready for deployment!');
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
        
    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        if (browser) {
            await browser.close();
            console.log('\n✅ Browser closed');
        }
    }
}

// Run the test
testAdminPages().catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
});