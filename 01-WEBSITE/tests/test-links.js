#!/usr/bin/env node

const puppeteer = require('puppeteer');
const chalk = require('chalk');
const ora = require('ora');
const path = require('path');

const SITE_URL = process.env.TEST_URL || 'https://www.chrisdavidsalon.com';
const LOCAL_URL = 'file://' + path.resolve(__dirname, '../index.html');
const USE_LOCAL = process.argv.includes('--local');
const TEST_URL = USE_LOCAL ? LOCAL_URL : SITE_URL;

async function testAllLinks() {
    console.log(chalk.blue.bold('\n🔗 Testing All Links\n'));
    console.log(chalk.gray(`Testing: ${TEST_URL}\n`));

    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const results = {
        internal: { passed: [], failed: [] },
        external: { passed: [], failed: [] },
        pages: { passed: [], failed: [] },
        anchors: { passed: [], failed: [] }
    };

    try {
        const page = await browser.newPage();
        await page.goto(TEST_URL, { waitUntil: 'networkidle2' });

        // Get all links
        const links = await page.$$eval('a', anchors => 
            anchors.map(a => ({
                href: a.href,
                text: a.textContent.trim().slice(0, 30),
                target: a.target
            }))
        );

        console.log(chalk.yellow(`Found ${links.length} links to test\n`));

        for (const link of links) {
            const spinner = ora(`Testing: ${link.text || link.href}`).start();

            try {
                if (link.href.startsWith('tel:')) {
                    // Phone links
                    if (link.href.includes('5612990950')) {
                        results.internal.passed.push(link);
                        spinner.succeed(chalk.green(`✓ Phone: ${link.href}`));
                    } else {
                        results.internal.failed.push({ ...link, error: 'Wrong phone number' });
                        spinner.fail(chalk.red(`✗ Phone: ${link.href} - Wrong number`));
                    }
                } else if (link.href.startsWith('mailto:')) {
                    // Email links
                    results.internal.passed.push(link);
                    spinner.succeed(chalk.green(`✓ Email: ${link.href}`));
                } else if (link.href.includes('#')) {
                    // Anchor links
                    const anchor = link.href.split('#')[1];
                    if (anchor) {
                        const element = await page.$(`#${anchor}`);
                        if (element) {
                            results.anchors.passed.push(link);
                            spinner.succeed(chalk.green(`✓ Anchor: #${anchor}`));
                        } else {
                            results.anchors.failed.push({ ...link, error: 'Anchor not found' });
                            spinner.fail(chalk.red(`✗ Anchor: #${anchor} - Not found`));
                        }
                    }
                } else if (link.href.includes(SITE_URL.replace('https://www.', '').replace('https://', '')) || 
                          link.href.includes('.html') && !link.href.includes('http')) {
                    // Internal pages
                    const testPage = await browser.newPage();
                    try {
                        const response = await testPage.goto(link.href, { 
                            waitUntil: 'domcontentloaded',
                            timeout: 10000 
                        });
                        
                        if (response && response.ok()) {
                            results.pages.passed.push(link);
                            spinner.succeed(chalk.green(`✓ Page: ${link.text || link.href}`));
                        } else {
                            results.pages.failed.push({ 
                                ...link, 
                                error: `Status ${response?.status()}` 
                            });
                            spinner.fail(chalk.red(`✗ Page: ${link.text} - Status ${response?.status()}`));
                        }
                    } catch (error) {
                        results.pages.failed.push({ ...link, error: error.message });
                        spinner.fail(chalk.red(`✗ Page: ${link.text} - ${error.message}`));
                    } finally {
                        await testPage.close();
                    }
                } else if (link.href.startsWith('http')) {
                    // External links - just check if they're valid URLs
                    try {
                        new URL(link.href);
                        results.external.passed.push(link);
                        spinner.succeed(chalk.green(`✓ External: ${link.text || link.href.slice(0, 50)}`));
                    } catch {
                        results.external.failed.push({ ...link, error: 'Invalid URL' });
                        spinner.fail(chalk.red(`✗ External: ${link.text} - Invalid URL`));
                    }
                }
            } catch (error) {
                spinner.fail(chalk.red(`✗ Error testing ${link.text}: ${error.message}`));
            }
        }

        // Test specific pages that should exist
        console.log(chalk.yellow('\n📄 Testing Required Pages\n'));
        
        const requiredPages = [
            { name: 'Homepage', url: TEST_URL },
            { name: 'Careers', url: `${SITE_URL}/careers.html` },
            { name: 'Premium Brands', url: `${SITE_URL}/premiumbrands.html` },
            { name: 'Blog', url: `${SITE_URL}/blog.html` },
            { name: 'Policies', url: `${SITE_URL}/policies.html` }
        ];

        for (const page of requiredPages) {
            const spinner = ora(`Testing: ${page.name}`).start();
            const testPage = await browser.newPage();
            
            try {
                const response = await testPage.goto(page.url, { 
                    waitUntil: 'networkidle2',
                    timeout: 15000 
                });
                
                if (response && response.ok()) {
                    spinner.succeed(chalk.green(`✓ ${page.name} - OK`));
                } else {
                    spinner.fail(chalk.red(`✗ ${page.name} - Status ${response?.status()}`));
                }
            } catch (error) {
                spinner.fail(chalk.red(`✗ ${page.name} - ${error.message}`));
            } finally {
                await testPage.close();
            }
        }

    } finally {
        await browser.close();
    }

    // Print summary
    console.log(chalk.blue.bold('\n📊 Link Test Summary\n'));
    
    const categories = [
        { name: 'Internal Pages', data: results.pages },
        { name: 'Anchor Links', data: results.anchors },
        { name: 'External Links', data: results.external },
        { name: 'Contact Links', data: results.internal }
    ];

    let totalFailed = 0;
    
    for (const category of categories) {
        console.log(chalk.yellow(`${category.name}:`));
        console.log(chalk.green(`  ✓ Passed: ${category.data.passed.length}`));
        if (category.data.failed.length > 0) {
            console.log(chalk.red(`  ✗ Failed: ${category.data.failed.length}`));
            category.data.failed.forEach(link => {
                console.log(chalk.red(`    - ${link.text || link.href}: ${link.error}`));
            });
            totalFailed += category.data.failed.length;
        }
        console.log();
    }

    if (totalFailed > 0) {
        console.log(chalk.red.bold(`\n❌ ${totalFailed} links failed!\n`));
        process.exit(1);
    } else {
        console.log(chalk.green.bold('\n✅ All links working correctly!\n'));
        process.exit(0);
    }
}

testAllLinks().catch(error => {
    console.error(chalk.red.bold('\n❌ Link test failed:'), error);
    process.exit(1);
});