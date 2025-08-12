#!/usr/bin/env node

/**
 * SIMPLIFIED DIRECTORY AUTOMATION - STANDALONE VERSION
 * 
 * This version works without npm dependencies by using system Playwright
 * It will automatically submit Chris David Salon to multiple directories
 */

console.log('🤖 CHRIS DAVID SALON - AUTOMATED DIRECTORY SUBMISSION');
console.log('====================================================');

// Try to import playwright from system
let playwright;
try {
    // Try different ways to load playwright
    try {
        playwright = require('playwright');
    } catch (e) {
        try {
            playwright = require('@playwright/test');
        } catch (e2) {
            console.error('❌ Playwright not found. Please install it with:');
            console.error('   npm install -g playwright');
            console.error('   OR');
            console.error('   npx playwright install');
            process.exit(1);
        }
    }
} catch (error) {
    console.error('❌ Failed to load Playwright:', error.message);
    process.exit(1);
}

const { chromium } = playwright;

// Business data
const BUSINESS = {
    name: 'Chris David Salon',
    address: '223 NE 2nd Ave',
    city: 'Delray Beach',
    state: 'FL',
    zip: '33444',
    phone: '(561) 865-5215',
    email: 'sikerr@gmail.com',
    website: 'https://chrisdavidsalon.com',
    description: 'Premier luxury hair salon specializing in color correction, balayage, and keratin treatments. Chris David is a master colorist with 20+ years experience.',
    category: 'Hair Salon'
};

// Directory list
const DIRECTORIES = [
    { name: 'YellowPages', url: 'https://www.yellowpages.com/add-business' },
    { name: 'Bing Places', url: 'https://www.bingplaces.com/' },
    { name: 'Hotfrog', url: 'https://www.hotfrog.com/add-business' },
    { name: 'Manta', url: 'https://www.manta.com/add-business' },
    { name: 'Brownbook', url: 'https://www.brownbook.net/add-business/' },
    { name: 'Superpages', url: 'https://www.superpages.com/add-business' },
    { name: 'CitySquares', url: 'https://citysquares.com/add-business' },
    { name: 'ShowMeLocal', url: 'https://www.showmelocal.com/add-business' },
    { name: 'Local.com', url: 'https://www.local.com/business/add' },
    { name: 'Foursquare', url: 'https://business.foursquare.com/' }
];

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function humanType(page, selector, text) {
    try {
        await page.waitForSelector(selector, { timeout: 5000 });
        await page.click(selector);
        await delay(300);
        await page.fill(selector, ''); // Clear
        
        // Type with human-like delays
        for (const char of text) {
            await page.type(selector, char);
            await delay(50 + Math.random() * 50);
        }
        return true;
    } catch (error) {
        return false;
    }
}

async function findAndFillForm(page, directory) {
    console.log(`📝 Filling form for ${directory.name}...`);
    
    // Common form selectors
    const fieldMappings = [
        { field: 'name', selectors: ['input[name*="name"]', 'input[placeholder*="business name" i]', 'input[id*="name"]'], value: BUSINESS.name },
        { field: 'address', selectors: ['input[name*="address"]', 'input[placeholder*="address" i]'], value: BUSINESS.address },
        { field: 'city', selectors: ['input[name*="city"]', 'input[placeholder*="city" i]'], value: BUSINESS.city },
        { field: 'state', selectors: ['select[name*="state"]', 'input[name*="state"]'], value: BUSINESS.state },
        { field: 'zip', selectors: ['input[name*="zip"]', 'input[name*="postal"]'], value: BUSINESS.zip },
        { field: 'phone', selectors: ['input[name*="phone"]', 'input[placeholder*="phone" i]'], value: BUSINESS.phone },
        { field: 'email', selectors: ['input[name*="email"]', 'input[placeholder*="email" i]'], value: BUSINESS.email },
        { field: 'website', selectors: ['input[name*="website"]', 'input[name*="url"]'], value: BUSINESS.website },
        { field: 'description', selectors: ['textarea[name*="description"]', 'textarea[placeholder*="description" i]'], value: BUSINESS.description },
        { field: 'category', selectors: ['input[name*="category"]', 'select[name*="category"]'], value: BUSINESS.category }
    ];
    
    let fieldsFound = 0;
    
    for (const mapping of fieldMappings) {
        for (const selector of mapping.selectors) {
            const filled = await humanType(page, selector, mapping.value);
            if (filled) {
                console.log(`  ✓ ${mapping.field}: ${mapping.value}`);
                fieldsFound++;
                break; // Move to next field
            }
        }
        
        // Special handling for category autocomplete
        if (mapping.field === 'category') {
            try {
                await delay(1000);
                const suggestion = await page.$('.autocomplete-item, .suggestion, .dropdown-item');
                if (suggestion) {
                    await suggestion.click();
                    console.log('  ✓ Selected category suggestion');
                }
            } catch (e) {}
        }
    }
    
    return fieldsFound;
}

async function submitForm(page) {
    console.log('📤 Attempting to submit form...');
    
    const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Submit")',
        'button:has-text("Add Business")',
        'button:has-text("Continue")',
        'a:has-text("Submit")'
    ];
    
    for (const selector of submitSelectors) {
        try {
            const button = await page.$(selector);
            if (button) {
                const isVisible = await button.isVisible();
                const isEnabled = await button.isEnabled();
                
                if (isVisible && isEnabled) {
                    await button.click();
                    console.log('✓ Form submitted');
                    return true;
                }
            }
        } catch (error) {
            // Continue to next selector
        }
    }
    
    return false;
}

async function handleCaptcha(page) {
    console.log('🤖 Checking for CAPTCHAs...');
    
    // Look for reCAPTCHA checkbox
    const captchaSelectors = [
        '.recaptcha-checkbox-border',
        '.g-recaptcha',
        '.h-captcha'
    ];
    
    for (const selector of captchaSelectors) {
        try {
            const captcha = await page.$(selector);
            if (captcha) {
                console.log('  Found CAPTCHA, attempting to solve...');
                await captcha.click();
                await delay(3000);
                
                // Check if solved
                const solved = await page.$('.recaptcha-checkbox-checked');
                if (solved) {
                    console.log('  ✓ CAPTCHA solved');
                    return true;
                } else {
                    console.log('  ⚠ CAPTCHA may need manual intervention');
                    await delay(5000); // Give time for manual solving
                }
            }
        } catch (error) {
            // Continue checking
        }
    }
    
    return true; // No CAPTCHA found or solved
}

async function submitToDirectory(browser, directory) {
    const page = await browser.newPage();
    
    try {
        console.log(`\n🎯 Processing: ${directory.name}`);
        console.log(`🔗 URL: ${directory.url}`);
        
        // Navigate to directory
        await page.goto(directory.url, { waitUntil: 'networkidle', timeout: 30000 });
        console.log('✓ Page loaded');
        
        // Random human behavior
        await page.mouse.move(100 + Math.random() * 200, 100 + Math.random() * 200);
        await delay(1000);
        
        // Look for "Add Business" buttons
        const addButtons = [
            'a:has-text("Add Business")',
            'button:has-text("Add Business")',
            'a:has-text("Get Started")',
            'button:has-text("Sign Up")',
            '.add-business'
        ];
        
        for (const selector of addButtons) {
            try {
                const button = await page.$(selector);
                if (button) {
                    await button.click();
                    console.log('✓ Clicked "Add Business" button');
                    await delay(2000);
                    break;
                }
            } catch (e) {}
        }
        
        // Fill the form
        const fieldsFound = await findAndFillForm(page, directory);
        
        if (fieldsFound === 0) {
            console.log('❌ No form fields found');
            return { success: false, message: 'No form found' };
        }
        
        console.log(`✓ Filled ${fieldsFound} form fields`);
        
        // Handle CAPTCHA
        await handleCaptcha(page);
        
        // Submit form
        const submitted = await submitForm(page);
        
        if (!submitted) {
            console.log('❌ Could not submit form');
            return { success: false, message: 'Form submission failed' };
        }
        
        // Wait and check result
        await delay(5000);
        const currentUrl = page.url();
        
        // Check for success indicators
        const content = await page.content();
        const success = (
            currentUrl !== directory.url ||
            content.toLowerCase().includes('success') ||
            content.toLowerCase().includes('thank') ||
            content.toLowerCase().includes('confirmation') ||
            content.toLowerCase().includes('verify your email')
        );
        
        const result = {
            success,
            message: success ? 'Submission appears successful' : 'Submission status unclear',
            url: currentUrl
        };
        
        console.log(success ? '✅ SUCCESS' : '⚠️  UNCERTAIN');
        
        return result;
        
    } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
        return { success: false, message: error.message };
    } finally {
        await page.close();
    }
}

async function main() {
    console.log('🚀 Initializing automation...');
    console.log(`📊 Target: ${DIRECTORIES.length} directories`);
    console.log(`🏢 Business: ${BUSINESS.name}`);
    console.log('');
    
    const browser = await chromium.launch({
        headless: false, // Keep visible for manual assistance
        args: ['--no-sandbox']
    });
    
    const results = [];
    let successful = 0;
    
    try {
        for (const [index, directory] of DIRECTORIES.entries()) {
            console.log(`\n[${index + 1}/${DIRECTORIES.length}] ${directory.name}`);
            
            const result = await submitToDirectory(browser, directory);
            results.push({
                directory: directory.name,
                url: directory.url,
                success: result.success,
                message: result.message,
                timestamp: new Date().toISOString()
            });
            
            if (result.success) successful++;
            
            // Delay between submissions
            const delay_time = 3000 + Math.random() * 3000;
            console.log(`⏳ Waiting ${Math.round(delay_time/1000)}s...`);
            await delay(delay_time);
        }
        
        // Generate report
        console.log('\n📊 FINAL RESULTS');
        console.log('=================');
        console.log(`✅ Successful: ${successful}`);
        console.log(`❌ Failed: ${DIRECTORIES.length - successful}`);
        console.log(`📈 Success Rate: ${Math.round((successful/DIRECTORIES.length)*100)}%`);
        console.log('');
        
        console.log('DETAILED RESULTS:');
        results.forEach(r => {
            console.log(`${r.success ? '✅' : '❌'} ${r.directory} - ${r.message}`);
        });
        
        console.log('\n📧 IMPORTANT: Check sikerr@gmail.com for verification emails');
        console.log('Some directories may require email verification to complete listing');
        
        // Save results
        const fs = require('fs');
        const path = require('path');
        
        const reportDir = path.join(__dirname, 'reports');
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir);
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportPath = path.join(reportDir, `simple-automation-${timestamp}.json`);
        
        fs.writeFileSync(reportPath, JSON.stringify({
            summary: { successful, total: DIRECTORIES.length, successRate: `${Math.round((successful/DIRECTORIES.length)*100)}%` },
            business: BUSINESS,
            results: results,
            timestamp: new Date().toISOString()
        }, null, 2));
        
        console.log(`\n📄 Report saved: ${reportPath}`);
        
    } catch (error) {
        console.error('💥 Fatal error:', error);
    } finally {
        await browser.close();
        console.log('\n🎉 Automation completed!');
    }
}

// Run the automation
main().catch(console.error);