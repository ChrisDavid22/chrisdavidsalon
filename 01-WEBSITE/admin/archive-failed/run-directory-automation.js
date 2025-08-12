#!/usr/bin/env node

/**
 * Automated Directory Submission System
 * Chris David Salon
 * 
 * This script automatically submits to directories that don't require email verification
 */

const puppeteer = require('../tests/node_modules/puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Business Information
const BUSINESS = {
    name: 'Chris David Salon',
    owner: 'Chris David',
    address: '223 NE 2nd Ave',
    city: 'Delray Beach',
    state: 'FL',
    zip: '33444',
    fullAddress: '223 NE 2nd Ave, Delray Beach, FL 33444',
    phone: '(561) 865-5215',
    email: 'chrisdavidsalon@gmail.com',
    website: 'https://chrisdavidsalon.com',
    category: 'Hair Salon',
    description: 'Premier luxury hair salon specializing in color correction, balayage, and keratin treatments. Chris David is a master colorist with 20+ years experience, formerly an educator for Davines professional hair care.',
    hours: {
        monday: 'Closed',
        tuesday: '9:00 AM - 7:00 PM',
        wednesday: '9:00 AM - 7:00 PM',
        thursday: '9:00 AM - 7:00 PM',
        friday: '9:00 AM - 7:00 PM',
        saturday: '9:00 AM - 5:00 PM',
        sunday: '10:00 AM - 4:00 PM'
    }
};

// Directories to submit to
const DIRECTORIES = [
    {
        name: 'Bing Places',
        url: 'https://www.bingplaces.com',
        type: 'search',
        priority: 'high'
    },
    {
        name: 'Apple Maps Connect',
        url: 'https://mapsconnect.apple.com',
        type: 'maps',
        priority: 'high'
    },
    {
        name: 'Booksy',
        url: 'https://booksy.com/biz/sign-up',
        type: 'beauty',
        priority: 'high'
    },
    {
        name: 'StyleSeat',
        url: 'https://www.styleseat.com/pro/signup',
        type: 'beauty',
        priority: 'high'
    }
];

// Create directories for screenshots and reports
async function setupDirectories() {
    const dirs = ['screenshots', 'reports'];
    for (const dir of dirs) {
        const dirPath = path.join(__dirname, dir);
        await fs.mkdir(dirPath, { recursive: true });
    }
}

// Submit to Bing Places
async function submitToBingPlaces(page) {
    try {
        console.log('📍 Submitting to Bing Places...');
        await page.goto('https://www.bingplaces.com', { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Take screenshot
        await page.screenshot({ path: path.join(__dirname, 'screenshots', 'bing-places-home.png') });
        
        // Look for sign in or add business button
        const addBusinessButton = await page.$('a[href*="add"], button:has-text("Add"), button:has-text("Get Started")');
        if (addBusinessButton) {
            await addBusinessButton.click();
            await page.waitForTimeout(2000);
            await page.screenshot({ path: path.join(__dirname, 'screenshots', 'bing-places-form.png') });
        }
        
        return {
            status: 'manual_required',
            message: 'Bing Places requires Microsoft account login. Please complete manually.',
            url: 'https://www.bingplaces.com',
            screenshot: 'bing-places-home.png'
        };
    } catch (error) {
        return {
            status: 'error',
            message: error.message,
            url: 'https://www.bingplaces.com'
        };
    }
}

// Submit to Booksy
async function submitToBooksy(page) {
    try {
        console.log('💇 Submitting to Booksy...');
        await page.goto('https://booksy.com/biz/sign-up', { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Take screenshot
        await page.screenshot({ path: path.join(__dirname, 'screenshots', 'booksy-signup.png') });
        
        // Try to fill form fields
        await page.waitForTimeout(2000);
        
        // Look for business name field
        const nameField = await page.$('input[name*="business"], input[placeholder*="Business"], input[placeholder*="Salon"]');
        if (nameField) {
            await nameField.type(BUSINESS.name);
        }
        
        // Look for email field
        const emailField = await page.$('input[type="email"], input[name*="email"]');
        if (emailField) {
            await emailField.type(BUSINESS.email);
        }
        
        // Look for phone field
        const phoneField = await page.$('input[type="tel"], input[name*="phone"]');
        if (phoneField) {
            await phoneField.type(BUSINESS.phone);
        }
        
        await page.screenshot({ path: path.join(__dirname, 'screenshots', 'booksy-filled.png') });
        
        return {
            status: 'form_filled',
            message: 'Form partially filled. Manual completion required.',
            url: 'https://booksy.com/biz/sign-up',
            screenshot: 'booksy-filled.png'
        };
    } catch (error) {
        return {
            status: 'error',
            message: error.message,
            url: 'https://booksy.com/biz/sign-up'
        };
    }
}

// Submit to StyleSeat
async function submitToStyleSeat(page) {
    try {
        console.log('✂️ Submitting to StyleSeat...');
        await page.goto('https://www.styleseat.com/pro/signup', { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Take screenshot
        await page.screenshot({ path: path.join(__dirname, 'screenshots', 'styleseat-signup.png') });
        
        // Try to fill form
        await page.waitForTimeout(2000);
        
        // Fill business name
        const nameField = await page.$('input[name*="business"], input[id*="business"]');
        if (nameField) {
            await nameField.type(BUSINESS.name);
        }
        
        // Fill email
        const emailField = await page.$('input[type="email"]');
        if (emailField) {
            await emailField.type(BUSINESS.email);
        }
        
        await page.screenshot({ path: path.join(__dirname, 'screenshots', 'styleseat-filled.png') });
        
        return {
            status: 'form_filled',
            message: 'Form partially filled. Manual completion required.',
            url: 'https://www.styleseat.com/pro/signup',
            screenshot: 'styleseat-filled.png'
        };
    } catch (error) {
        return {
            status: 'error',
            message: error.message,
            url: 'https://www.styleseat.com/pro/signup'
        };
    }
}

// Main automation function
async function runAutomation() {
    console.log('🚀 Starting Directory Submission Automation');
    console.log('📋 Business:', BUSINESS.name);
    console.log('📍 Location:', BUSINESS.city + ', ' + BUSINESS.state);
    console.log('');
    
    await setupDirectories();
    
    const browser = await puppeteer.launch({
        headless: false, // Show browser for monitoring
        defaultViewport: { width: 1280, height: 800 }
    });
    
    const results = [];
    
    try {
        const page = await browser.newPage();
        
        // Set user agent to appear more human
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Submit to each directory
        console.log('📊 Processing directories...\n');
        
        // Bing Places
        results.push(await submitToBingPlaces(page));
        await page.waitForTimeout(3000); // Wait between submissions
        
        // Booksy
        results.push(await submitToBooksy(page));
        await page.waitForTimeout(3000);
        
        // StyleSeat
        results.push(await submitToStyleSeat(page));
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await browser.close();
    }
    
    // Generate report
    console.log('\n📊 SUBMISSION REPORT\n' + '='.repeat(50));
    
    let successful = 0;
    let needsManual = 0;
    let errors = 0;
    
    for (const result of results) {
        if (result.status === 'success') successful++;
        else if (result.status === 'form_filled' || result.status === 'manual_required') needsManual++;
        else errors++;
        
        console.log(`\n${result.status === 'error' ? '❌' : result.status === 'success' ? '✅' : '⚠️'} ${result.url}`);
        console.log(`   Status: ${result.status}`);
        console.log(`   Message: ${result.message}`);
        if (result.screenshot) {
            console.log(`   Screenshot: screenshots/${result.screenshot}`);
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📈 SUMMARY:');
    console.log(`   ✅ Successful: ${successful}`);
    console.log(`   ⚠️  Needs Manual: ${needsManual}`);
    console.log(`   ❌ Errors: ${errors}`);
    
    // Save report
    const report = {
        date: new Date().toISOString(),
        business: BUSINESS.name,
        results: results,
        summary: {
            successful,
            needsManual,
            errors,
            total: results.length
        }
    };
    
    await fs.writeFile(
        path.join(__dirname, 'reports', `submission-report-${Date.now()}.json`),
        JSON.stringify(report, null, 2)
    );
    
    console.log('\n✅ Report saved to reports/submission-report-*.json');
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Check screenshots folder for visual confirmation');
    console.log('2. Complete manual submissions where required');
    console.log('3. Use email templates for local directories');
}

// Run the automation
runAutomation().catch(console.error);