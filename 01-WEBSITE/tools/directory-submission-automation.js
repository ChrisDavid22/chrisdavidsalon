#!/usr/bin/env node

/**
 * Directory Submission Automation for Chris David Salon
 * Automated submission to business directories using Playwright
 * 
 * @author Claude Code
 * @date 2025-08-11
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const EnhancedDirectoryHandlers = require('./directory-handlers-enhanced');

// Business Information Configuration
const BUSINESS_DATA = {
    name: 'Chris David Salon',
    owner: 'Chris David',
    address: '223 NE 2nd Ave, Delray Beach, FL 33444',
    phone: '(561) 865-5215',
    email: 'chrisdavidsalon@gmail.com',
    website: 'https://chrisdavidsalon.com',
    category: 'Hair Salon, Beauty Salon',
    hours: 'Tue-Fri 9-7, Sat 9-5, Sun 10-4, Mon Closed',
    description: 'Premier luxury hair salon specializing in color correction, balayage, and keratin treatments. Chris David is a master colorist with 20+ years experience, formerly an educator for Davines professional hair care.',
    zipCode: '33444',
    city: 'Delray Beach',
    state: 'FL',
    country: 'United States'
};

// Directory Configuration
const DIRECTORIES = [
    {
        name: 'Bing Places',
        url: 'https://www.bingplaces.com',
        priority: 1,
        requiresEmail: false,
        handler: 'submitToBingPlaces'
    },
    {
        name: 'Apple Maps',
        url: 'https://mapsconnect.apple.com',
        priority: 2,
        requiresEmail: true,
        handler: 'submitToAppleMaps'
    },
    {
        name: 'Booksy',
        url: 'https://booksy.com/biz/sign-up',
        priority: 3,
        requiresEmail: false,
        handler: 'submitToBooksy'
    },
    {
        name: 'StyleSeat',
        url: 'https://www.styleseat.com/pro/signup',
        priority: 4,
        requiresEmail: false,
        handler: 'submitToStyleSeat'
    },
    {
        name: 'Vagaro',
        url: 'https://www.vagaro.com/businesssignup',
        priority: 5,
        requiresEmail: false,
        handler: 'submitToVagaro'
    },
    {
        name: 'Goldwell Salon Locator',
        url: 'https://www.goldwell.com/salon-locator',
        priority: 6,
        requiresEmail: false,
        handler: 'submitToGoldwell'
    },
    {
        name: 'Davines Salon Finder',
        url: 'https://www.davines.com/salon-locator',
        priority: 7,
        requiresEmail: false,
        handler: 'submitToDavines'
    }
];

class DirectorySubmissionBot {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
        this.results = [];
        this.screenshotDir = path.join(__dirname, 'screenshots', `submission-${Date.now()}`);
        this.logFile = path.join(__dirname, `submission-log-${new Date().toISOString().split('T')[0]}.txt`);
        
        // Create directories
        if (!fs.existsSync(this.screenshotDir)) {
            fs.mkdirSync(this.screenshotDir, { recursive: true });
        }
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        fs.appendFileSync(this.logFile, logMessage + '\n');
    }

    async initialize() {
        this.log('Initializing browser...');
        this.browser = await chromium.launch({ 
            headless: false, // Set to true for production
            slowMo: 1000 // Slow down for better success rate
        });
        
        this.context = await this.browser.newContext({
            viewport: { width: 1280, height: 1024 },
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        
        this.page = await this.context.newPage();
        this.log('Browser initialized successfully');
    }

    async takeScreenshot(filename) {
        const screenshotPath = path.join(this.screenshotDir, `${filename}.png`);
        await this.page.screenshot({ path: screenshotPath, fullPage: true });
        return screenshotPath;
    }

    async waitForSelector(selector, timeout = 10000) {
        try {
            await this.page.waitForSelector(selector, { timeout });
            return true;
        } catch (error) {
            this.log(`Selector not found: ${selector}`);
            return false;
        }
    }

    async fillFormField(selector, value, description = '') {
        try {
            await this.page.waitForSelector(selector, { timeout: 5000 });
            await this.page.fill(selector, value);
            this.log(`✅ Filled ${description || selector}: ${value}`);
            return true;
        } catch (error) {
            this.log(`❌ Failed to fill ${description || selector}: ${error.message}`);
            return false;
        }
    }

    async clickButton(selector, description = '') {
        try {
            await this.page.waitForSelector(selector, { timeout: 5000 });
            await this.page.click(selector);
            this.log(`✅ Clicked ${description || selector}`);
            await this.page.waitForTimeout(2000);
            return true;
        } catch (error) {
            this.log(`❌ Failed to click ${description || selector}: ${error.message}`);
            return false;
        }
    }

    async submitToBingPlaces() {
        try {
            this.log('🎯 Starting Bing Places submission...');
            await this.page.goto('https://www.bingplaces.com', { waitUntil: 'networkidle' });
            
            // Take initial screenshot
            await this.takeScreenshot('bing-places-start');
            
            // Look for existing listing first
            const searchSelectors = [
                'input[name="search"]',
                'input[placeholder*="search"]',
                '#search-input',
                '.search-input'
            ];
            
            let searchFound = false;
            for (const selector of searchSelectors) {
                if (await this.waitForSelector(selector, 3000)) {
                    await this.fillFormField(selector, `${BUSINESS_DATA.name} ${BUSINESS_DATA.city}`, 'search field');
                    searchFound = true;
                    break;
                }
            }
            
            if (!searchFound) {
                // Look for "Add Business" or similar button
                const addBusinessSelectors = [
                    'a[href*="add"]',
                    'button:has-text("Add Business")',
                    'a:has-text("Add Business")',
                    'button:has-text("Add a business")'
                ];
                
                for (const selector of addBusinessSelectors) {
                    try {
                        await this.page.click(selector);
                        this.log('✅ Clicked add business button');
                        break;
                    } catch (error) {
                        continue;
                    }
                }
            }
            
            // Wait for form and fill details
            await this.page.waitForTimeout(3000);
            
            const formFields = {
                'input[name="businessName"]': BUSINESS_DATA.name,
                'input[name="address"]': BUSINESS_DATA.address,
                'input[name="phone"]': BUSINESS_DATA.phone,
                'input[name="website"]': BUSINESS_DATA.website,
                'textarea[name="description"]': BUSINESS_DATA.description
            };
            
            for (const [selector, value] of Object.entries(formFields)) {
                await this.fillFormField(selector, value);
            }
            
            await this.takeScreenshot('bing-places-filled');
            
            return {
                status: 'success',
                message: 'Bing Places form filled successfully',
                screenshot: 'bing-places-filled.png'
            };
            
        } catch (error) {
            this.log(`❌ Bing Places submission failed: ${error.message}`);
            await this.takeScreenshot('bing-places-error');
            return {
                status: 'error',
                message: error.message,
                screenshot: 'bing-places-error.png'
            };
        }
    }

    async submitToBooksy() {
        try {
            this.log('🎯 Starting Booksy submission...');
            await this.page.goto('https://booksy.com/biz/sign-up', { waitUntil: 'networkidle' });
            await this.takeScreenshot('booksy-start');
            
            // Booksy form fields
            const formFields = {
                'input[name="businessName"]': BUSINESS_DATA.name,
                'input[name="firstName"]': 'Chris',
                'input[name="lastName"]': 'David',
                'input[name="email"]': BUSINESS_DATA.email,
                'input[name="phone"]': BUSINESS_DATA.phone,
                'input[name="address"]': BUSINESS_DATA.address
            };
            
            for (const [selector, value] of Object.entries(formFields)) {
                await this.fillFormField(selector, value);
            }
            
            // Select business type
            const businessTypeSelectors = [
                'select[name="businessType"]',
                'select[name="category"]',
                '.business-type-selector'
            ];
            
            for (const selector of businessTypeSelectors) {
                try {
                    await this.page.selectOption(selector, { label: 'Hair Salon' });
                    this.log('✅ Selected business type: Hair Salon');
                    break;
                } catch (error) {
                    continue;
                }
            }
            
            await this.takeScreenshot('booksy-filled');
            
            return {
                status: 'success',
                message: 'Booksy form filled successfully',
                screenshot: 'booksy-filled.png'
            };
            
        } catch (error) {
            this.log(`❌ Booksy submission failed: ${error.message}`);
            await this.takeScreenshot('booksy-error');
            return {
                status: 'error',
                message: error.message,
                screenshot: 'booksy-error.png'
            };
        }
    }

    async submitToStyleSeat() {
        try {
            this.log('🎯 Starting StyleSeat submission...');
            await this.page.goto('https://www.styleseat.com/pro/signup', { waitUntil: 'networkidle' });
            await this.takeScreenshot('styleseat-start');
            
            // StyleSeat typically has a multi-step form
            const formFields = {
                'input[name="firstName"]': 'Chris',
                'input[name="lastName"]': 'David',
                'input[name="email"]': BUSINESS_DATA.email,
                'input[name="businessName"]': BUSINESS_DATA.name,
                'input[name="phone"]': BUSINESS_DATA.phone
            };
            
            for (const [selector, value] of Object.entries(formFields)) {
                await this.fillFormField(selector, value);
            }
            
            await this.takeScreenshot('styleseat-filled');
            
            return {
                status: 'success',
                message: 'StyleSeat form filled successfully',
                screenshot: 'styleseat-filled.png'
            };
            
        } catch (error) {
            this.log(`❌ StyleSeat submission failed: ${error.message}`);
            await this.takeScreenshot('styleseat-error');
            return {
                status: 'error',
                message: error.message,
                screenshot: 'styleseat-error.png'
            };
        }
    }

    async submitToVagaro() {
        try {
            this.log('🎯 Starting Vagaro submission...');
            await this.page.goto('https://www.vagaro.com/businesssignup', { waitUntil: 'networkidle' });
            await this.takeScreenshot('vagaro-start');
            
            // Vagaro business signup form
            const formFields = {
                'input[name="businessName"]': BUSINESS_DATA.name,
                'input[name="ownerFirstName"]': 'Chris',
                'input[name="ownerLastName"]': 'David',
                'input[name="email"]': BUSINESS_DATA.email,
                'input[name="phone"]': BUSINESS_DATA.phone,
                'input[name="address"]': BUSINESS_DATA.address
            };
            
            for (const [selector, value] of Object.entries(formFields)) {
                await this.fillFormField(selector, value);
            }
            
            await this.takeScreenshot('vagaro-filled');
            
            return {
                status: 'success',
                message: 'Vagaro form filled successfully',
                screenshot: 'vagaro-filled.png'
            };
            
        } catch (error) {
            this.log(`❌ Vagaro submission failed: ${error.message}`);
            await this.takeScreenshot('vagaro-error');
            return {
                status: 'error',
                message: error.message,
                screenshot: 'vagaro-error.png'
            };
        }
    }

    async submitToGoldwell() {
        try {
            this.log('🎯 Starting Goldwell submission...');
            await this.page.goto('https://www.goldwell.com/salon-locator', { waitUntil: 'networkidle' });
            await this.takeScreenshot('goldwell-start');
            
            // Look for "Add Salon" or similar link
            const addSalonSelectors = [
                'a[href*="add"]',
                'a:has-text("Add Salon")',
                'button:has-text("Add Salon")',
                'a:has-text("Join")'
            ];
            
            let addButtonFound = false;
            for (const selector of addSalonSelectors) {
                try {
                    await this.page.click(selector);
                    this.log('✅ Clicked add salon button');
                    addButtonFound = true;
                    break;
                } catch (error) {
                    continue;
                }
            }
            
            if (addButtonFound) {
                await this.page.waitForTimeout(3000);
                
                const formFields = {
                    'input[name="salonName"]': BUSINESS_DATA.name,
                    'input[name="address"]': BUSINESS_DATA.address,
                    'input[name="phone"]': BUSINESS_DATA.phone,
                    'input[name="email"]': BUSINESS_DATA.email,
                    'input[name="website"]': BUSINESS_DATA.website
                };
                
                for (const [selector, value] of Object.entries(formFields)) {
                    await this.fillFormField(selector, value);
                }
            }
            
            await this.takeScreenshot('goldwell-filled');
            
            return {
                status: 'success',
                message: 'Goldwell salon locator accessed successfully',
                screenshot: 'goldwell-filled.png'
            };
            
        } catch (error) {
            this.log(`❌ Goldwell submission failed: ${error.message}`);
            await this.takeScreenshot('goldwell-error');
            return {
                status: 'error',
                message: error.message,
                screenshot: 'goldwell-error.png'
            };
        }
    }

    async submitToDavines() {
        try {
            this.log('🎯 Starting Davines submission...');
            await this.page.goto('https://www.davines.com/salon-locator', { waitUntil: 'networkidle' });
            await this.takeScreenshot('davines-start');
            
            // Look for "Add Salon" or similar link
            const addSalonSelectors = [
                'a[href*="add"]',
                'a:has-text("Add Salon")',
                'button:has-text("Add Salon")',
                'a:has-text("Join")',
                'a:has-text("Register")'
            ];
            
            let addButtonFound = false;
            for (const selector of addSalonSelectors) {
                try {
                    await this.page.click(selector);
                    this.log('✅ Clicked add salon button');
                    addButtonFound = true;
                    break;
                } catch (error) {
                    continue;
                }
            }
            
            if (addButtonFound) {
                await this.page.waitForTimeout(3000);
                
                const formFields = {
                    'input[name="salonName"]': BUSINESS_DATA.name,
                    'input[name="address"]': BUSINESS_DATA.address,
                    'input[name="phone"]': BUSINESS_DATA.phone,
                    'input[name="email"]': BUSINESS_DATA.email,
                    'input[name="website"]': BUSINESS_DATA.website
                };
                
                for (const [selector, value] of Object.entries(formFields)) {
                    await this.fillFormField(selector, value);
                }
            }
            
            await this.takeScreenshot('davines-filled');
            
            return {
                status: 'success',
                message: 'Davines salon finder accessed successfully',
                screenshot: 'davines-filled.png'
            };
            
        } catch (error) {
            this.log(`❌ Davines submission failed: ${error.message}`);
            await this.takeScreenshot('davines-error');
            return {
                status: 'error',
                message: error.message,
                screenshot: 'davines-error.png'
            };
        }
    }

    async submitToAppleMaps() {
        try {
            this.log('🎯 Starting Apple Maps submission...');
            await this.page.goto('https://mapsconnect.apple.com', { waitUntil: 'networkidle' });
            await this.takeScreenshot('apple-maps-start');
            
            // Apple Maps typically requires authentication
            this.log('ℹ️ Apple Maps requires Apple ID authentication - this will need manual completion');
            
            return {
                status: 'manual_required',
                message: 'Apple Maps requires Apple ID authentication - manual completion needed',
                screenshot: 'apple-maps-start.png'
            };
            
        } catch (error) {
            this.log(`❌ Apple Maps submission failed: ${error.message}`);
            await this.takeScreenshot('apple-maps-error');
            return {
                status: 'error',
                message: error.message,
                screenshot: 'apple-maps-error.png'
            };
        }
    }

    async runSubmissions() {
        try {
            await this.initialize();
            
            // Sort directories by priority (non-email requiring first)
            const sortedDirectories = DIRECTORIES.sort((a, b) => {
                if (a.requiresEmail !== b.requiresEmail) {
                    return a.requiresEmail ? 1 : -1;
                }
                return a.priority - b.priority;
            });
            
            for (const directory of sortedDirectories) {
                this.log(`\n🚀 Processing ${directory.name}...`);
                
                try {
                    const result = await this[directory.handler]();
                    result.directory = directory.name;
                    result.url = directory.url;
                    result.timestamp = new Date().toISOString();
                    
                    this.results.push(result);
                    this.log(`✅ ${directory.name}: ${result.status}`);
                    
                } catch (error) {
                    const errorResult = {
                        directory: directory.name,
                        url: directory.url,
                        status: 'error',
                        message: error.message,
                        timestamp: new Date().toISOString()
                    };
                    this.results.push(errorResult);
                    this.log(`❌ ${directory.name}: ${error.message}`);
                }
                
                // Wait between submissions to avoid rate limiting
                await this.page.waitForTimeout(5000);
            }
            
        } catch (error) {
            this.log(`💥 Fatal error: ${error.message}`);
        } finally {
            await this.generateReport();
            await this.cleanup();
        }
    }

    async generateReport() {
        const reportData = {
            timestamp: new Date().toISOString(),
            businessData: BUSINESS_DATA,
            totalDirectories: DIRECTORIES.length,
            results: this.results,
            summary: {
                successful: this.results.filter(r => r.status === 'success').length,
                errors: this.results.filter(r => r.status === 'error').length,
                manualRequired: this.results.filter(r => r.status === 'manual_required').length
            }
        };
        
        const reportPath = path.join(__dirname, `directory-submission-report-${new Date().toISOString().split('T')[0]}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
        
        // Generate human-readable report
        let htmlReport = `
<!DOCTYPE html>
<html>
<head>
    <title>Directory Submission Report - Chris David Salon</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .manual { color: #ffc107; }
        .result { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .screenshot { max-width: 300px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Directory Submission Report</h1>
        <p><strong>Business:</strong> ${BUSINESS_DATA.name}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Summary:</strong> ${reportData.summary.successful} successful, ${reportData.summary.errors} errors, ${reportData.summary.manualRequired} manual required</p>
    </div>
`;
        
        this.results.forEach(result => {
            const statusClass = result.status === 'success' ? 'success' : 
                              result.status === 'error' ? 'error' : 'manual';
            
            htmlReport += `
    <div class="result">
        <h3 class="${statusClass}">${result.directory}</h3>
        <p><strong>Status:</strong> <span class="${statusClass}">${result.status.toUpperCase()}</span></p>
        <p><strong>Message:</strong> ${result.message}</p>
        <p><strong>URL:</strong> <a href="${result.url}" target="_blank">${result.url}</a></p>
        ${result.screenshot ? `<p><strong>Screenshot:</strong> ${result.screenshot}</p>` : ''}
    </div>`;
        });
        
        htmlReport += `
</body>
</html>`;
        
        const htmlReportPath = path.join(__dirname, `directory-submission-report-${new Date().toISOString().split('T')[0]}.html`);
        fs.writeFileSync(htmlReportPath, htmlReport);
        
        this.log(`📊 Report generated: ${reportPath}`);
        this.log(`📊 HTML Report generated: ${htmlReportPath}`);
        
        return reportPath;
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            this.log('🧹 Browser closed');
        }
    }
}

// Export for module use
module.exports = DirectorySubmissionBot;

// Run if called directly
if (require.main === module) {
    const bot = new DirectorySubmissionBot();
    bot.runSubmissions().catch(console.error);
}