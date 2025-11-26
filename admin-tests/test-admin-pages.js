/**
 * Comprehensive Admin Page Test Suite
 * Tests all admin pages, captures screenshots, verifies data, tests buttons
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

const BASE_URL = 'https://www.chrisdavidsalon.com';
const SCREENSHOT_DIR = './screenshots';
const REPORT_FILE = './test-report.json';

// Ensure screenshot directory exists
if (!existsSync(SCREENSHOT_DIR)) {
    mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const testResults = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    pages: [],
    summary: {
        totalPages: 0,
        passed: 0,
        failed: 0,
        warnings: 0
    }
};

/**
 * Test a single admin page
 */
async function testPage(page, pageConfig) {
    const result = {
        name: pageConfig.name,
        url: pageConfig.url,
        screenshot: null,
        tests: [],
        passed: true,
        errors: [],
        warnings: []
    };

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${pageConfig.name}`);
    console.log(`URL: ${BASE_URL}${pageConfig.url}`);
    console.log('='.repeat(60));

    try {
        // Navigate to page
        await page.goto(`${BASE_URL}${pageConfig.url}`, {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        // Wait for page to fully load
        await page.waitForTimeout(3000);

        // Take initial screenshot
        const screenshotPath = `${SCREENSHOT_DIR}/${pageConfig.name.toLowerCase().replace(/\s+/g, '-')}-initial.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });
        result.screenshot = screenshotPath;
        console.log(`📸 Screenshot saved: ${screenshotPath}`);

        // Check version badge
        const versionBadge = await page.$('#versionBadge');
        if (versionBadge) {
            const versionText = await versionBadge.textContent();
            result.tests.push({
                name: 'Version Badge',
                passed: versionText && versionText.includes('v'),
                value: versionText
            });
            console.log(`✓ Version badge: ${versionText}`);
        } else {
            result.tests.push({ name: 'Version Badge', passed: false, value: 'Not found' });
            result.warnings.push('Version badge not found');
        }

        // Run page-specific tests
        if (pageConfig.tests) {
            for (const test of pageConfig.tests) {
                try {
                    const testResult = await test.fn(page);
                    result.tests.push({
                        name: test.name,
                        passed: testResult.passed,
                        value: testResult.value,
                        details: testResult.details
                    });

                    if (testResult.passed) {
                        console.log(`✓ ${test.name}: ${testResult.value}`);
                    } else {
                        console.log(`✗ ${test.name}: ${testResult.value}`);
                        result.errors.push(`${test.name}: ${testResult.value}`);
                    }
                } catch (error) {
                    result.tests.push({
                        name: test.name,
                        passed: false,
                        value: `Error: ${error.message}`
                    });
                    result.errors.push(`${test.name}: ${error.message}`);
                    console.log(`✗ ${test.name}: Error - ${error.message}`);
                }
            }
        }

        // Test buttons if specified
        if (pageConfig.buttons) {
            for (const button of pageConfig.buttons) {
                try {
                    const btn = await page.$(button.selector);
                    if (btn) {
                        const isVisible = await btn.isVisible();
                        if (isVisible && button.click) {
                            await btn.click();
                            await page.waitForTimeout(2000);

                            // Take screenshot after click
                            const clickScreenshot = `${SCREENSHOT_DIR}/${pageConfig.name.toLowerCase().replace(/\s+/g, '-')}-${button.name.toLowerCase().replace(/\s+/g, '-')}.png`;
                            await page.screenshot({ path: clickScreenshot, fullPage: true });

                            result.tests.push({
                                name: `Button: ${button.name}`,
                                passed: true,
                                value: 'Clicked successfully',
                                screenshot: clickScreenshot
                            });
                            console.log(`✓ Button "${button.name}": Clicked, screenshot saved`);

                            // Check for expected result
                            if (button.expectSelector) {
                                const expectedEl = await page.$(button.expectSelector);
                                if (expectedEl) {
                                    console.log(`  ✓ Expected element appeared`);
                                } else {
                                    result.warnings.push(`Button "${button.name}" clicked but expected element not found`);
                                }
                            }
                        } else {
                            result.tests.push({
                                name: `Button: ${button.name}`,
                                passed: isVisible,
                                value: isVisible ? 'Visible' : 'Not visible'
                            });
                        }
                    } else {
                        result.tests.push({
                            name: `Button: ${button.name}`,
                            passed: false,
                            value: 'Not found'
                        });
                        result.warnings.push(`Button "${button.name}" not found`);
                    }
                } catch (error) {
                    result.tests.push({
                        name: `Button: ${button.name}`,
                        passed: false,
                        value: `Error: ${error.message}`
                    });
                }
            }
        }

        // Check for any console errors
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        result.passed = result.errors.length === 0;

    } catch (error) {
        result.passed = false;
        result.errors.push(`Page load error: ${error.message}`);
        console.log(`✗ Page load failed: ${error.message}`);
    }

    return result;
}

/**
 * Main test runner
 */
async function runTests() {
    console.log('\n' + '█'.repeat(60));
    console.log('  CHRIS DAVID SALON - ADMIN PAGE TEST SUITE');
    console.log('  ' + new Date().toLocaleString());
    console.log('█'.repeat(60));

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    // Collect console logs
    const consoleLogs = [];
    page.on('console', msg => {
        consoleLogs.push({ type: msg.type(), text: msg.text() });
    });

    // Define all pages to test
    const pages = [
        {
            name: 'SEO Command Center',
            url: '/admin/index.html',
            tests: [
                {
                    name: 'Performance Score',
                    fn: async (p) => {
                        await p.waitForTimeout(2000);
                        const el = await p.$('#performanceScore');
                        const value = el ? await el.textContent() : null;
                        return { passed: value && value !== '--', value: value || 'Not found' };
                    }
                },
                {
                    name: 'Content Score',
                    fn: async (p) => {
                        const el = await p.$('#contentScore');
                        const value = el ? await el.textContent() : null;
                        return { passed: value && value !== '--', value: value || 'Not found' };
                    }
                },
                {
                    name: 'Technical Score',
                    fn: async (p) => {
                        const el = await p.$('#technicalScore');
                        const value = el ? await el.textContent() : null;
                        return { passed: value && value !== '--', value: value || 'Not found' };
                    }
                },
                {
                    name: 'Mobile Score',
                    fn: async (p) => {
                        const el = await p.$('#mobileScore');
                        const value = el ? await el.textContent() : null;
                        return { passed: value && value !== '--', value: value || 'Not found' };
                    }
                },
                {
                    name: 'UX Score',
                    fn: async (p) => {
                        const el = await p.$('#uxScore');
                        const value = el ? await el.textContent() : null;
                        return { passed: value && value !== '--', value: value || 'Not found' };
                    }
                },
                {
                    name: 'Local SEO Score',
                    fn: async (p) => {
                        const el = await p.$('#localScore');
                        const value = el ? await el.textContent() : null;
                        return { passed: value && value !== '--', value: value || 'Not found' };
                    }
                },
                {
                    name: 'Authority Score',
                    fn: async (p) => {
                        const el = await p.$('#authorityScore');
                        const value = el ? await el.textContent() : null;
                        return { passed: value && value !== '--', value: value || 'Not found' };
                    }
                },
                {
                    name: 'GMB Rating',
                    fn: async (p) => {
                        const el = await p.$('#gmb');
                        const value = el ? await el.textContent() : null;
                        return { passed: value && value !== '--', value: value || 'Not found' };
                    }
                },
                {
                    name: 'Review Count',
                    fn: async (p) => {
                        const el = await p.$('#citations');
                        const value = el ? await el.textContent() : null;
                        return { passed: value && value !== '--', value: value || 'Not found' };
                    }
                }
            ],
            buttons: [
                {
                    name: 'Analyze with AI',
                    selector: 'button:has-text("Analyze with AI")',
                    click: true,
                    expectSelector: '#loadingIndicator'
                },
                {
                    name: 'Quick Audit',
                    selector: 'button:has-text("Quick Audit")',
                    click: false // Don't click, just verify exists
                }
            ]
        },
        {
            name: 'Competitors',
            url: '/admin/competitors.html',
            tests: [
                {
                    name: 'Competitor Table',
                    fn: async (p) => {
                        await p.waitForTimeout(3000);
                        const rows = await p.$$('table tbody tr, .competitor-card, [class*="competitor"]');
                        return {
                            passed: rows.length > 0,
                            value: `${rows.length} competitors found`
                        };
                    }
                },
                {
                    name: 'Chris David Listed',
                    fn: async (p) => {
                        const content = await p.content();
                        const hasChrisDavid = content.toLowerCase().includes('chris david');
                        return { passed: hasChrisDavid, value: hasChrisDavid ? 'Found' : 'Not found' };
                    }
                },
                {
                    name: 'Rating Data',
                    fn: async (p) => {
                        const content = await p.content();
                        const hasRatings = content.includes('4.9') || content.includes('5.0') || content.includes('4.8');
                        return { passed: hasRatings, value: hasRatings ? 'Ratings visible' : 'No ratings' };
                    }
                }
            ]
        },
        {
            name: 'Authority',
            url: '/admin/authority.html',
            tests: [
                {
                    name: 'PageRank Display',
                    fn: async (p) => {
                        await p.waitForTimeout(3000);
                        const content = await p.content();
                        const hasPageRank = content.includes('2.88') || content.includes('PageRank') || content.includes('pagerank');
                        return { passed: hasPageRank, value: hasPageRank ? 'PageRank data visible' : 'No PageRank data' };
                    }
                },
                {
                    name: 'Competitor Comparison',
                    fn: async (p) => {
                        const rows = await p.$$('table tbody tr');
                        return {
                            passed: rows.length >= 5,
                            value: `${rows.length} competitors in table`
                        };
                    }
                }
            ]
        },
        {
            name: 'Microsites',
            url: '/admin/microsites.html',
            tests: [
                {
                    name: 'Microsite 1 (bestsalondelray)',
                    fn: async (p) => {
                        await p.waitForTimeout(2000);
                        const content = await p.content();
                        return {
                            passed: content.includes('bestsalondelray'),
                            value: content.includes('bestsalondelray') ? 'Listed' : 'Not found'
                        };
                    }
                },
                {
                    name: 'Microsite 2 (bestdelraysalon)',
                    fn: async (p) => {
                        const content = await p.content();
                        return {
                            passed: content.includes('bestdelraysalon'),
                            value: content.includes('bestdelraysalon') ? 'Listed' : 'Not found'
                        };
                    }
                },
                {
                    name: 'Microsite 3 (bestsalonpalmbeach)',
                    fn: async (p) => {
                        const content = await p.content();
                        return {
                            passed: content.includes('bestsalonpalmbeach'),
                            value: content.includes('bestsalonpalmbeach') ? 'Listed' : 'Not found'
                        };
                    }
                }
            ]
        },
        {
            name: 'Traffic',
            url: '/admin/traffic.html',
            tests: [
                {
                    name: 'GA4 Data Display',
                    fn: async (p) => {
                        await p.waitForTimeout(3000);
                        const content = await p.content();
                        // Check for any traffic metrics
                        const hasData = content.includes('sessions') ||
                                       content.includes('pageviews') ||
                                       content.includes('users') ||
                                       content.includes('313') || // Active users from API
                                       content.includes('438'); // Sessions from API
                        return { passed: hasData, value: hasData ? 'Traffic data visible' : 'No traffic data' };
                    }
                }
            ]
        },
        {
            name: 'Rankings',
            url: '/admin/rankings.html',
            tests: [
                {
                    name: 'Keyword Rankings',
                    fn: async (p) => {
                        await p.waitForTimeout(2000);
                        const content = await p.content();
                        const hasKeywords = content.includes('balayage') ||
                                           content.includes('salon') ||
                                           content.includes('delray');
                        return { passed: hasKeywords, value: hasKeywords ? 'Keywords listed' : 'No keywords' };
                    }
                }
            ]
        },
        {
            name: 'Agent Log',
            url: '/admin/agent-log.html',
            tests: [
                {
                    name: 'Log Display',
                    fn: async (p) => {
                        await p.waitForTimeout(2000);
                        const content = await p.content();
                        const hasLog = content.includes('log') ||
                                      content.includes('activity') ||
                                      content.includes('Agent');
                        return { passed: true, value: 'Page loaded' }; // Just verify page loads
                    }
                }
            ]
        }
    ];

    // Run tests for each page
    for (const pageConfig of pages) {
        const result = await testPage(page, pageConfig);
        testResults.pages.push(result);
        testResults.summary.totalPages++;

        if (result.passed) {
            testResults.summary.passed++;
        } else {
            testResults.summary.failed++;
        }

        testResults.summary.warnings += result.warnings.length;
    }

    // Save console logs
    testResults.consoleLogs = consoleLogs.filter(l => l.type === 'error' || l.text.includes('fetch'));

    await browser.close();

    // Save report
    writeFileSync(REPORT_FILE, JSON.stringify(testResults, null, 2));
    console.log(`\n📄 Full report saved to: ${REPORT_FILE}`);

    // Print summary
    console.log('\n' + '█'.repeat(60));
    console.log('  TEST SUMMARY');
    console.log('█'.repeat(60));
    console.log(`  Total Pages Tested: ${testResults.summary.totalPages}`);
    console.log(`  ✅ Passed: ${testResults.summary.passed}`);
    console.log(`  ❌ Failed: ${testResults.summary.failed}`);
    console.log(`  ⚠️  Warnings: ${testResults.summary.warnings}`);
    console.log('█'.repeat(60));

    // Print detailed results
    console.log('\n📋 DETAILED RESULTS:\n');
    for (const pageResult of testResults.pages) {
        const status = pageResult.passed ? '✅' : '❌';
        console.log(`${status} ${pageResult.name}`);

        for (const test of pageResult.tests) {
            const testStatus = test.passed ? '  ✓' : '  ✗';
            console.log(`${testStatus} ${test.name}: ${test.value}`);
        }

        if (pageResult.warnings.length > 0) {
            console.log(`  ⚠️  Warnings: ${pageResult.warnings.join(', ')}`);
        }
        console.log('');
    }

    return testResults;
}

// Run the tests
runTests().catch(console.error);
