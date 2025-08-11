#!/usr/bin/env node

const puppeteer = require('puppeteer');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs');
const path = require('path');

// Configuration
const SITE_URL = process.env.TEST_URL || 'https://www.chrisdavidsalon.com';
const LOCAL_URL = 'file://' + path.resolve(__dirname, '../index.html');
const USE_LOCAL = process.argv.includes('--local');
const TEST_URL = USE_LOCAL ? LOCAL_URL : SITE_URL;

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = [];

// Test utilities
async function runTest(name, testFn) {
    totalTests++;
    const spinner = ora(name).start();
    try {
        await testFn();
        passedTests++;
        spinner.succeed(chalk.green(`✓ ${name}`));
        return true;
    } catch (error) {
        failedTests.push({ name, error: error.message });
        spinner.fail(chalk.red(`✗ ${name}: ${error.message}`));
        return false;
    }
}

// Main test suite
async function runTests() {
    console.log(chalk.blue.bold('\n🧪 Chris David Salon - Automated Test Suite\n'));
    console.log(chalk.gray(`Testing: ${TEST_URL}\n`));

    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        // Desktop Tests
        if (!process.argv.includes('--mobile')) {
            console.log(chalk.yellow.bold('\n📱 Desktop View Tests\n'));
            await runDesktopTests(browser);
        }

        // Mobile Tests (70% of traffic - CRITICAL)
        if (!process.argv.includes('--desktop')) {
            console.log(chalk.yellow.bold('\n📱 Mobile View Tests (70% of traffic)\n'));
            await runMobileTests(browser);
        }

    } finally {
        await browser.close();
    }

    // Print results
    printResults();
}

async function runDesktopTests(browser) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Load the page
    await runTest('Page loads successfully', async () => {
        const response = await page.goto(TEST_URL, { waitUntil: 'networkidle2', timeout: 30000 });
        if (!response || !response.ok()) {
            throw new Error(`Page returned status ${response?.status()}`);
        }
    });

    // Check navigation structure
    await runTest('Header navigation exists', async () => {
        const nav = await page.$('nav');
        if (!nav) throw new Error('Navigation not found');
    });

    await runTest('All navigation links present', async () => {
        const navLinks = await page.$$eval('nav a', links => links.map(a => a.textContent.trim()));
        const requiredLinks = ['Home', 'About', 'Gallery', 'Premium Brands', 'Reviews', 'Blog', 'Careers', 'Contact'];
        
        for (const link of requiredLinks) {
            if (!navLinks.some(l => l.includes(link))) {
                throw new Error(`Missing navigation link: ${link}`);
            }
        }
    });

    // Check Gallery Section
    await runTest('Gallery section exists and is visible', async () => {
        await page.goto(`${TEST_URL}#gallery`, { waitUntil: 'networkidle2' });
        const gallery = await page.$('#gallery');
        if (!gallery) throw new Error('Gallery section not found');
        
        const isVisible = await page.evaluate(() => {
            const el = document.querySelector('#gallery');
            const rect = el.getBoundingClientRect();
            return rect.top >= 0 && rect.bottom <= window.innerHeight;
        });
        
        if (!isVisible) {
            await page.evaluate(() => {
                document.querySelector('#gallery').scrollIntoView();
            });
        }
    });

    await runTest('Gallery carousel is functional', async () => {
        const carousel = await page.$('#galleryCarousel');
        if (!carousel) throw new Error('Gallery carousel not found');
        
        const slider = await page.$('#gallerySlider');
        if (!slider) throw new Error('Gallery slider not found');
        
        const images = await page.$$('.gallery-item');
        if (images.length < 3) throw new Error(`Only ${images.length} images found in gallery`);
    });

    await runTest('Gallery navigation buttons work', async () => {
        // Test next button
        const nextBtn = await page.$('button[onclick*="moveGallery(1)"]');
        if (!nextBtn) throw new Error('Next button not found');
        
        await nextBtn.click();
        await page.waitForTimeout(600); // Wait for animation
        
        // Test previous button
        const prevBtn = await page.$('button[onclick*="moveGallery(-1)"]');
        if (!prevBtn) throw new Error('Previous button not found');
        
        await prevBtn.click();
        await page.waitForTimeout(600);
    });

    await runTest('Category filters exist', async () => {
        const filters = await page.$$('.gallery-tab');
        if (filters.length < 5) throw new Error(`Only ${filters.length} filter tabs found`);
    });

    // Check all images load
    await runTest('All images load correctly', async () => {
        const images = await page.$$eval('img', imgs => 
            imgs.map(img => ({
                src: img.src,
                loaded: img.complete && img.naturalHeight !== 0
            }))
        );
        
        const failedImages = images.filter(img => !img.loaded);
        if (failedImages.length > 0) {
            throw new Error(`${failedImages.length} images failed to load: ${failedImages.map(i => i.src).join(', ')}`);
        }
    });

    // Check internal links
    await runTest('All internal page links work', async () => {
        const internalLinks = await page.$$eval('a[href^="#"]', links => 
            links.map(a => a.getAttribute('href'))
        );
        
        for (const link of internalLinks) {
            const selector = link === '#' ? 'body' : link;
            const element = await page.$(selector);
            if (!element && link !== '#') {
                throw new Error(`Internal link target not found: ${link}`);
            }
        }
    });

    // Check phone number links
    await runTest('Phone number links are correct', async () => {
        const phoneLinks = await page.$$eval('a[href^="tel:"]', links => 
            links.map(a => a.getAttribute('href'))
        );
        
        for (const link of phoneLinks) {
            if (!link.includes('5612990950')) {
                throw new Error(`Incorrect phone number: ${link}`);
            }
        }
    });

    // Check footer
    await runTest('Footer contains all required links', async () => {
        const footerLinks = await page.$$eval('footer a', links => 
            links.map(a => a.textContent.trim())
        );
        
        const requiredFooterLinks = ['Blog', 'Policies'];
        for (const link of requiredFooterLinks) {
            if (!footerLinks.some(l => l.includes(link))) {
                throw new Error(`Missing footer link: ${link}`);
            }
        }
    });

    await page.close();
}

async function runMobileTests(browser) {
    const page = await browser.newPage();
    
    // iPhone 12 Pro viewport
    await page.setViewport({ 
        width: 390, 
        height: 844,
        isMobile: true,
        hasTouch: true
    });
    
    await page.goto(TEST_URL, { waitUntil: 'networkidle2' });

    // Mobile menu tests
    await runTest('Mobile menu button exists', async () => {
        const menuBtn = await page.$('#mobile-menu-btn');
        if (!menuBtn) throw new Error('Mobile menu button not found');
    });

    await runTest('Mobile menu opens and closes', async () => {
        await page.click('#mobile-menu-btn');
        await page.waitForTimeout(300);
        
        const menuVisible = await page.evaluate(() => {
            const menu = document.querySelector('#mobile-menu');
            return menu && !menu.classList.contains('hidden');
        });
        
        if (!menuVisible) throw new Error('Mobile menu did not open');
        
        await page.click('#mobile-menu-btn');
        await page.waitForTimeout(300);
        
        const menuHidden = await page.evaluate(() => {
            const menu = document.querySelector('#mobile-menu');
            return menu && menu.classList.contains('hidden');
        });
        
        if (!menuHidden) throw new Error('Mobile menu did not close');
    });

    // Check for text overlapping
    await runTest('No text overlapping on mobile', async () => {
        const overlapping = await page.evaluate(() => {
            const elements = document.querySelectorAll('h1, h2, h3, p, span, a');
            const issues = [];
            
            for (let i = 0; i < elements.length; i++) {
                const rect1 = elements[i].getBoundingClientRect();
                if (rect1.width === 0 || rect1.height === 0) continue;
                
                for (let j = i + 1; j < elements.length; j++) {
                    const rect2 = elements[j].getBoundingClientRect();
                    if (rect2.width === 0 || rect2.height === 0) continue;
                    
                    // Check if elements overlap
                    if (!(rect1.right < rect2.left || 
                          rect1.left > rect2.right || 
                          rect1.bottom < rect2.top || 
                          rect1.top > rect2.bottom)) {
                        
                        // Check if they're not parent-child
                        if (!elements[i].contains(elements[j]) && !elements[j].contains(elements[i])) {
                            issues.push({
                                el1: elements[i].tagName + ': ' + elements[i].textContent.slice(0, 20),
                                el2: elements[j].tagName + ': ' + elements[j].textContent.slice(0, 20)
                            });
                        }
                    }
                }
            }
            
            return issues;
        });
        
        if (overlapping.length > 0) {
            throw new Error(`Found ${overlapping.length} overlapping elements`);
        }
    });

    // Check gallery on mobile
    await runTest('Gallery works on mobile with touch', async () => {
        await page.goto(`${TEST_URL}#gallery`, { waitUntil: 'networkidle2' });
        
        const carousel = await page.$('#galleryCarousel');
        if (!carousel) throw new Error('Gallery carousel not found on mobile');
        
        // Simulate swipe
        const box = await carousel.boundingBox();
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
        await page.touchscreen.swipe({
            start: { x: box.x + box.width - 50, y: box.y + box.height / 2 },
            end: { x: box.x + 50, y: box.y + box.height / 2 }
        });
        
        await page.waitForTimeout(600);
    });

    // Check mobile-specific elements
    await runTest('Mobile phone CTA button visible', async () => {
        const phoneCTA = await page.$('.mobile-phone-cta');
        if (!phoneCTA) throw new Error('Mobile phone CTA not found');
        
        const isVisible = await page.evaluate(() => {
            const el = document.querySelector('.mobile-phone-cta');
            return el && window.getComputedStyle(el).display !== 'none';
        });
        
        if (!isVisible) throw new Error('Mobile phone CTA not visible');
    });

    // Check responsive images
    await runTest('Images are responsive on mobile', async () => {
        const images = await page.$$eval('img', imgs => 
            imgs.map(img => ({
                src: img.src,
                width: img.getBoundingClientRect().width,
                viewportWidth: window.innerWidth
            }))
        );
        
        const oversizedImages = images.filter(img => img.width > img.viewportWidth);
        if (oversizedImages.length > 0) {
            throw new Error(`${oversizedImages.length} images exceed viewport width`);
        }
    });

    await page.close();
}

function printResults() {
    console.log(chalk.blue.bold('\n📊 Test Results\n'));
    console.log(chalk.green(`✓ Passed: ${passedTests}/${totalTests}`));
    
    if (failedTests.length > 0) {
        console.log(chalk.red(`✗ Failed: ${failedTests.length}/${totalTests}\n`));
        console.log(chalk.red.bold('Failed Tests:'));
        failedTests.forEach(test => {
            console.log(chalk.red(`  - ${test.name}`));
            console.log(chalk.gray(`    ${test.error}`));
        });
        process.exit(1);
    } else {
        console.log(chalk.green.bold('\n✅ All tests passed! Website is ready for deployment.\n'));
        process.exit(0);
    }
}

// Run tests
runTests().catch(error => {
    console.error(chalk.red.bold('\n❌ Test suite failed to run:'), error);
    process.exit(1);
});