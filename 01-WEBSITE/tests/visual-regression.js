#!/usr/bin/env node

const puppeteer = require('puppeteer');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs');
const path = require('path');

const SITE_URL = process.env.TEST_URL || 'https://www.chrisdavidsalon.com';
const LOCAL_URL = 'file://' + path.resolve(__dirname, '../index.html');
const USE_LOCAL = process.argv.includes('--local');
const TEST_URL = USE_LOCAL ? LOCAL_URL : SITE_URL;

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function captureScreenshots() {
    console.log(chalk.blue.bold('\n📸 Visual Regression Testing\n'));
    console.log(chalk.gray(`Testing: ${TEST_URL}\n`));

    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sessionDir = path.join(SCREENSHOTS_DIR, timestamp);
    fs.mkdirSync(sessionDir, { recursive: true });

    const issues = [];

    try {
        // Desktop Screenshots
        console.log(chalk.yellow.bold('📱 Desktop Screenshots\n'));
        
        const desktopPage = await browser.newPage();
        await desktopPage.setViewport({ width: 1920, height: 1080 });
        await desktopPage.goto(TEST_URL, { waitUntil: 'networkidle2' });

        // Full page screenshot
        let spinner = ora('Capturing desktop full page').start();
        await desktopPage.screenshot({ 
            path: path.join(sessionDir, 'desktop-full.png'),
            fullPage: true 
        });
        spinner.succeed(chalk.green('✓ Desktop full page captured'));

        // Key sections
        const sections = [
            { name: 'header', selector: 'header' },
            { name: 'hero', selector: '#home' },
            { name: 'about', selector: '#about' },
            { name: 'services', selector: '#services' },
            { name: 'gallery', selector: '#gallery' },
            { name: 'testimonials', selector: '#testimonials' },
            { name: 'contact', selector: '#contact' },
            { name: 'footer', selector: 'footer' }
        ];

        for (const section of sections) {
            spinner = ora(`Capturing desktop ${section.name}`).start();
            try {
                const element = await desktopPage.$(section.selector);
                if (element) {
                    await element.screenshot({ 
                        path: path.join(sessionDir, `desktop-${section.name}.png`) 
                    });
                    spinner.succeed(chalk.green(`✓ Desktop ${section.name} captured`));
                } else {
                    spinner.warn(chalk.yellow(`⚠ Desktop ${section.name} not found`));
                    issues.push(`Desktop section not found: ${section.name}`);
                }
            } catch (error) {
                spinner.fail(chalk.red(`✗ Desktop ${section.name}: ${error.message}`));
                issues.push(`Desktop ${section.name}: ${error.message}`);
            }
        }

        // Test Gallery Interaction
        spinner = ora('Testing gallery carousel').start();
        const gallerySection = await desktopPage.$('#gallery');
        if (gallerySection) {
            await desktopPage.evaluate(() => {
                document.querySelector('#gallery').scrollIntoView({ behavior: 'instant' });
            });
            await desktopPage.waitForTimeout(1000);
            
            // Click next button
            const nextBtn = await desktopPage.$('button[onclick*="moveGallery(1)"]');
            if (nextBtn) {
                await nextBtn.click();
                await desktopPage.waitForTimeout(600);
                await desktopPage.screenshot({ 
                    path: path.join(sessionDir, 'desktop-gallery-next.png'),
                    clip: await gallerySection.boundingBox()
                });
                spinner.succeed(chalk.green('✓ Gallery carousel tested'));
            } else {
                spinner.warn(chalk.yellow('⚠ Gallery next button not found'));
                issues.push('Gallery next button not found');
            }
        } else {
            spinner.fail(chalk.red('✗ Gallery section not found'));
            issues.push('Gallery section not found');
        }

        await desktopPage.close();

        // Mobile Screenshots (70% of traffic - CRITICAL)
        console.log(chalk.yellow.bold('\n📱 Mobile Screenshots (70% of traffic)\n'));
        
        const mobilePage = await browser.newPage();
        await mobilePage.setViewport({ 
            width: 390, 
            height: 844,
            isMobile: true,
            hasTouch: true
        });
        await mobilePage.goto(TEST_URL, { waitUntil: 'networkidle2' });

        // Mobile full page
        spinner = ora('Capturing mobile full page').start();
        await mobilePage.screenshot({ 
            path: path.join(sessionDir, 'mobile-full.png'),
            fullPage: true 
        });
        spinner.succeed(chalk.green('✓ Mobile full page captured'));

        // Mobile menu test
        spinner = ora('Testing mobile menu').start();
        const menuBtn = await mobilePage.$('#mobile-menu-btn');
        if (menuBtn) {
            await menuBtn.click();
            await mobilePage.waitForTimeout(500);
            await mobilePage.screenshot({ 
                path: path.join(sessionDir, 'mobile-menu-open.png') 
            });
            spinner.succeed(chalk.green('✓ Mobile menu tested'));
        } else {
            spinner.fail(chalk.red('✗ Mobile menu button not found'));
            issues.push('Mobile menu button not found');
        }

        // Check for mobile-specific issues
        spinner = ora('Checking for mobile layout issues').start();
        
        const mobileIssues = await mobilePage.evaluate(() => {
            const issues = [];
            
            // Check for horizontal scroll
            if (document.documentElement.scrollWidth > window.innerWidth) {
                issues.push('Horizontal scroll detected on mobile');
            }
            
            // Check for text that's too small
            const texts = document.querySelectorAll('p, span, a, li');
            texts.forEach(el => {
                const styles = window.getComputedStyle(el);
                const fontSize = parseInt(styles.fontSize);
                if (fontSize < 12 && el.textContent.trim()) {
                    issues.push(`Text too small (${fontSize}px): ${el.textContent.slice(0, 30)}`);
                }
            });
            
            // Check for elements wider than viewport
            const allElements = document.querySelectorAll('*');
            allElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.width > window.innerWidth) {
                    issues.push(`Element wider than viewport: ${el.tagName}.${el.className}`);
                }
            });
            
            return issues;
        });

        if (mobileIssues.length > 0) {
            spinner.warn(chalk.yellow(`⚠ Found ${mobileIssues.length} mobile issues`));
            issues.push(...mobileIssues);
        } else {
            spinner.succeed(chalk.green('✓ No mobile layout issues detected'));
        }

        // Mobile gallery test
        spinner = ora('Testing mobile gallery swipe').start();
        await mobilePage.goto(`${TEST_URL}#gallery`, { waitUntil: 'networkidle2' });
        
        const mobileGallery = await mobilePage.$('#galleryCarousel');
        if (mobileGallery) {
            const box = await mobileGallery.boundingBox();
            
            // Simulate swipe
            await mobilePage.touchscreen.drag({
                x: box.x + box.width - 50,
                y: box.y + box.height / 2
            }, {
                x: box.x + 50,
                y: box.y + box.height / 2
            });
            
            await mobilePage.waitForTimeout(600);
            await mobilePage.screenshot({ 
                path: path.join(sessionDir, 'mobile-gallery-swipe.png'),
                clip: box
            });
            spinner.succeed(chalk.green('✓ Mobile gallery swipe tested'));
        } else {
            spinner.fail(chalk.red('✗ Mobile gallery not found'));
            issues.push('Mobile gallery not found');
        }

        // Tablet view
        console.log(chalk.yellow.bold('\n📱 Tablet Screenshots\n'));
        
        const tabletPage = await browser.newPage();
        await tabletPage.setViewport({ width: 768, height: 1024 });
        await tabletPage.goto(TEST_URL, { waitUntil: 'networkidle2' });
        
        spinner = ora('Capturing tablet view').start();
        await tabletPage.screenshot({ 
            path: path.join(sessionDir, 'tablet-full.png'),
            fullPage: true 
        });
        spinner.succeed(chalk.green('✓ Tablet view captured'));
        
        await tabletPage.close();
        await mobilePage.close();

    } finally {
        await browser.close();
    }

    // Print results
    console.log(chalk.blue.bold('\n📊 Visual Test Results\n'));
    console.log(chalk.green(`✓ Screenshots saved to: ${sessionDir}`));
    
    if (issues.length > 0) {
        console.log(chalk.red.bold(`\n⚠ Issues Found (${issues.length}):\n`));
        issues.forEach(issue => {
            console.log(chalk.yellow(`  - ${issue}`));
        });
        
        if (issues.some(i => i.includes('mobile'))) {
            console.log(chalk.red.bold('\n❌ CRITICAL: Mobile issues detected (70% of traffic)!\n'));
        }
        
        process.exit(1);
    } else {
        console.log(chalk.green.bold('\n✅ All visual tests passed!\n'));
        console.log(chalk.gray('Review screenshots manually for visual quality.\n'));
        process.exit(0);
    }
}

captureScreenshots().catch(error => {
    console.error(chalk.red.bold('\n❌ Visual test failed:'), error);
    process.exit(1);
});