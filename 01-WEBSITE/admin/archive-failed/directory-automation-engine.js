/**
 * White Label Directory Automation Engine
 * Backend automation system that can be deployed for any local business
 * 
 * @author Claude Code - ISO Vision LLC
 * @date 2025-08-11
 * @version 1.0.0
 */

class WhiteLabelDirectoryEngine {
    constructor() {
        this.playwright = null;
        this.browser = null;
        this.context = null;
        this.page = null;
        this.isInitialized = false;
        this.currentBusiness = null;
        this.executionLog = [];
        this.screenshots = [];
        this.results = [];
    }

    // Initialize the automation system
    async initialize(headless = false) {
        try {
            if (typeof require === 'undefined') {
                throw new Error('This engine requires Node.js environment');
            }
            
            const { chromium } = require('playwright');
            this.playwright = { chromium };
            
            console.log('🚀 Initializing White Label Directory Engine...');
            
            this.browser = await chromium.launch({
                headless: headless,
                slowMo: 1000, // Slow down for better success rate
                timeout: 60000
            });
            
            this.context = await this.browser.newContext({
                viewport: { width: 1280, height: 1024 },
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            });
            
            this.page = await this.context.newPage();
            this.isInitialized = true;
            
            this.log('✅ Automation engine initialized successfully');
            return true;
            
        } catch (error) {
            this.log(`❌ Failed to initialize: ${error.message}`, 'error');
            return false;
        }
    }

    // Configure business for automation
    setBusiness(businessConfig) {
        this.currentBusiness = {
            ...businessConfig,
            timestamp: new Date().toISOString()
        };
        this.log(`📋 Business configured: ${businessConfig.name}`);
    }

    // Execute directory submissions
    async executeSubmissions(selectedDirectories, options = {}) {
        if (!this.isInitialized) {
            throw new Error('Engine not initialized. Call initialize() first.');
        }
        
        if (!this.currentBusiness) {
            throw new Error('No business configured. Call setBusiness() first.');
        }
        
        const results = [];
        const totalDirectories = selectedDirectories.length;
        
        this.log(`🎯 Starting automation for ${totalDirectories} directories`);
        
        for (let i = 0; i < selectedDirectories.length; i++) {
            const directory = selectedDirectories[i];
            
            this.log(`📍 Processing ${directory.name} (${i + 1}/${totalDirectories})`);
            
            try {
                const result = await this.submitToDirectory(directory);
                results.push({
                    directory: directory.name,
                    url: directory.url,
                    category: directory.category,
                    priority: directory.priority,
                    da: directory.da,
                    automated: directory.automated,
                    result: result,
                    timestamp: new Date().toISOString(),
                    screenshot: result.screenshot || null
                });
                
                // Progress callback if provided
                if (options.onProgress) {
                    options.onProgress({
                        current: i + 1,
                        total: totalDirectories,
                        percentage: Math.round(((i + 1) / totalDirectories) * 100),
                        currentDirectory: directory.name,
                        result: result.status
                    });
                }
                
                // Wait between submissions to avoid rate limiting
                await this.wait(2000 + Math.random() * 3000);
                
            } catch (error) {
                this.log(`❌ Error processing ${directory.name}: ${error.message}`, 'error');
                results.push({
                    directory: directory.name,
                    url: directory.url,
                    result: {
                        status: 'error',
                        message: error.message
                    },
                    timestamp: new Date().toISOString()
                });
            }
        }
        
        this.results = results;
        this.log(`🏁 Automation completed. ${results.length} directories processed`);
        
        return results;
    }

    // Submit to individual directory
    async submitToDirectory(directory) {
        const handlerName = this.getHandlerName(directory.name);
        
        if (this[handlerName]) {
            return await this[handlerName](directory);
        } else {
            return await this.genericSubmissionHandler(directory);
        }
    }

    // Get handler method name for directory
    getHandlerName(directoryName) {
        const handlers = {
            'Google My Business': 'submitToGoogleBusiness',
            'Yelp Business': 'submitToYelpBusiness',
            'Facebook Business': 'submitToFacebookBusiness',
            'Booksy': 'submitToBooksy',
            'StyleSeat': 'submitToStyleSeat',
            'Vagaro': 'submitToVagaro',
            'Apple Maps': 'submitToAppleMaps',
            'Bing Places': 'submitToBingPlaces',
            'Yellow Pages': 'submitToYellowPages'
        };
        
        return handlers[directoryName] || 'genericSubmissionHandler';
    }

    // Google My Business submission
    async submitToGoogleBusiness(directory) {
        try {
            this.log('🎯 Accessing Google My Business...');
            
            await this.page.goto('https://business.google.com', { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });
            
            const screenshot = await this.takeScreenshot('google-business-start');
            
            // Check for existing business or add new
            const addBusinessSelectors = [
                'button:has-text("Add business")',
                'a:has-text("Add business")',
                '[data-testid="add-business"]'
            ];
            
            let buttonFound = false;
            for (const selector of addBusinessSelectors) {
                if (await this.clickIfExists(selector, 'Add business button')) {
                    buttonFound = true;
                    break;
                }
            }
            
            if (!buttonFound) {
                return {
                    status: 'manual_required',
                    message: 'Google My Business requires manual sign-in and verification',
                    nextSteps: 'Sign in to Google account and manually add business',
                    screenshot: screenshot
                };
            }
            
            await this.wait(3000);
            
            // Fill business information
            const fieldsCompleted = await this.fillBusinessForm([
                { selector: 'input[name="businessName"]', value: this.currentBusiness.name, description: 'Business Name' },
                { selector: 'input[name="address"]', value: this.currentBusiness.address, description: 'Address' },
                { selector: 'input[name="phone"]', value: this.currentBusiness.phone, description: 'Phone' },
                { selector: 'input[name="website"]', value: this.currentBusiness.website, description: 'Website' }
            ]);
            
            const finalScreenshot = await this.takeScreenshot('google-business-completed');
            
            return {
                status: fieldsCompleted > 2 ? 'success' : 'partial',
                message: `Google My Business form accessed - ${fieldsCompleted} fields completed`,
                fieldsCompleted: fieldsCompleted,
                screenshot: finalScreenshot,
                nextSteps: 'Verify business ownership via phone or postcard'
            };
            
        } catch (error) {
            const errorScreenshot = await this.takeScreenshot('google-business-error');
            return {
                status: 'error',
                message: error.message,
                screenshot: errorScreenshot
            };
        }
    }

    // Yelp Business submission
    async submitToYelpBusiness(directory) {
        try {
            this.log('🎯 Accessing Yelp for Business...');
            
            await this.page.goto('https://biz.yelp.com', { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });
            
            const screenshot = await this.takeScreenshot('yelp-business-start');
            
            // Look for claim or add business
            const businessActions = [
                'a:has-text("Add Business")',
                'button:has-text("Add Business")',
                'a:has-text("Claim")'
            ];
            
            let actionFound = false;
            for (const selector of businessActions) {
                if (await this.clickIfExists(selector, 'Yelp business action')) {
                    actionFound = true;
                    break;
                }
            }
            
            if (!actionFound) {
                return {
                    status: 'manual_required',
                    message: 'Yelp requires manual account creation and verification',
                    nextSteps: 'Create Yelp for Business account and manually add listing',
                    screenshot: screenshot
                };
            }
            
            await this.wait(3000);
            
            const fieldsCompleted = await this.fillBusinessForm([
                { selector: 'input[name="business_name"]', value: this.currentBusiness.name, description: 'Business Name' },
                { selector: 'input[name="address"]', value: this.currentBusiness.address, description: 'Address' },
                { selector: 'input[name="phone"]', value: this.currentBusiness.phone, description: 'Phone' },
                { selector: 'input[name="website"]', value: this.currentBusiness.website, description: 'Website' }
            ]);
            
            const finalScreenshot = await this.takeScreenshot('yelp-business-completed');
            
            return {
                status: fieldsCompleted > 2 ? 'success' : 'partial',
                message: `Yelp for Business form accessed - ${fieldsCompleted} fields completed`,
                fieldsCompleted: fieldsCompleted,
                screenshot: finalScreenshot
            };
            
        } catch (error) {
            const errorScreenshot = await this.takeScreenshot('yelp-business-error');
            return {
                status: 'error',
                message: error.message,
                screenshot: errorScreenshot
            };
        }
    }

    // Booksy submission
    async submitToBooksy(directory) {
        try {
            this.log('🎯 Accessing Booksy business signup...');
            
            await this.page.goto('https://booksy.com/biz/sign-up', { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });
            
            const screenshot = await this.takeScreenshot('booksy-start');
            
            const fieldsCompleted = await this.fillBusinessForm([
                { selector: 'input[name="firstName"]', value: this.currentBusiness.owner?.split(' ')[0] || 'Owner', description: 'First Name' },
                { selector: 'input[name="lastName"]', value: this.currentBusiness.owner?.split(' ')[1] || 'Name', description: 'Last Name' },
                { selector: 'input[name="email"]', value: this.currentBusiness.email, description: 'Email' },
                { selector: 'input[name="businessName"]', value: this.currentBusiness.name, description: 'Business Name' },
                { selector: 'input[name="phone"]', value: this.currentBusiness.phone, description: 'Phone' }
            ]);
            
            // Try to select business category
            await this.selectBusinessCategory('hair-salon', [
                'select[name="category"]',
                'select[name="businessType"]'
            ]);
            
            const finalScreenshot = await this.takeScreenshot('booksy-completed');
            
            return {
                status: fieldsCompleted > 3 ? 'success' : 'partial',
                message: `Booksy signup form accessed - ${fieldsCompleted} fields completed`,
                fieldsCompleted: fieldsCompleted,
                screenshot: finalScreenshot,
                nextSteps: 'Complete signup process and verify email'
            };
            
        } catch (error) {
            const errorScreenshot = await this.takeScreenshot('booksy-error');
            return {
                status: 'error',
                message: error.message,
                screenshot: errorScreenshot
            };
        }
    }

    // Generic submission handler for unlisted directories
    async genericSubmissionHandler(directory) {
        try {
            this.log(`🎯 Accessing ${directory.name} using generic handler...`);
            
            await this.page.goto(directory.url, { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });
            
            const screenshot = await this.takeScreenshot(`${directory.name.toLowerCase().replace(/\s+/g, '-')}-generic`);
            
            // Look for common signup/add business patterns
            const commonSelectors = [
                'a:has-text("Sign Up")',
                'a:has-text("Add Business")',
                'a:has-text("Join")',
                'a:has-text("Register")',
                'button:has-text("Get Started")',
                '.signup-button',
                '.add-business'
            ];
            
            let actionFound = false;
            for (const selector of commonSelectors) {
                if (await this.clickIfExists(selector, `${directory.name} signup action`)) {
                    actionFound = true;
                    break;
                }
            }
            
            if (actionFound) {
                await this.wait(3000);
                
                // Try to fill common form fields
                const fieldsCompleted = await this.fillBusinessForm([
                    { selector: 'input[name="businessName"], input[name="name"], #businessName', value: this.currentBusiness.name, description: 'Business Name' },
                    { selector: 'input[name="email"], #email', value: this.currentBusiness.email, description: 'Email' },
                    { selector: 'input[name="phone"], #phone', value: this.currentBusiness.phone, description: 'Phone' },
                    { selector: 'input[name="address"], #address', value: this.currentBusiness.address, description: 'Address' },
                    { selector: 'input[name="website"], #website', value: this.currentBusiness.website, description: 'Website' }
                ]);
                
                const finalScreenshot = await this.takeScreenshot(`${directory.name.toLowerCase().replace(/\s+/g, '-')}-completed`);
                
                return {
                    status: fieldsCompleted > 2 ? 'success' : 'partial',
                    message: `${directory.name} form accessed - ${fieldsCompleted} fields completed`,
                    fieldsCompleted: fieldsCompleted,
                    screenshot: finalScreenshot
                };
            } else {
                return {
                    status: 'manual_required',
                    message: `${directory.name} requires manual setup - no automation pattern found`,
                    screenshot: screenshot,
                    nextSteps: `Manually visit ${directory.url} and add business listing`
                };
            }
            
        } catch (error) {
            const errorScreenshot = await this.takeScreenshot(`${directory.name.toLowerCase().replace(/\s+/g, '-')}-error`);
            return {
                status: 'error',
                message: error.message,
                screenshot: errorScreenshot
            };
        }
    }

    // Helper method to fill business form fields
    async fillBusinessForm(fields) {
        let completed = 0;
        
        for (const field of fields) {
            if (await this.fillField(field.selector, field.value, field.description)) {
                completed++;
            }
        }
        
        return completed;
    }

    // Helper method to fill a single field
    async fillField(selector, value, description = '') {
        try {
            await this.page.waitForSelector(selector, { timeout: 5000 });
            await this.page.fill(selector, ''); // Clear first
            await this.page.fill(selector, value);
            await this.wait(500);
            this.log(`✅ Filled ${description || selector}: ${value}`);
            return true;
        } catch (error) {
            this.log(`⚠️ Could not fill ${description || selector}: ${error.message}`, 'warning');
            return false;
        }
    }

    // Helper method to click if element exists
    async clickIfExists(selector, description = '') {
        try {
            await this.page.waitForSelector(selector, { timeout: 3000 });
            await this.page.click(selector);
            this.log(`✅ Clicked ${description || selector}`);
            await this.wait(1000);
            return true;
        } catch (error) {
            return false;
        }
    }

    // Helper method to select business category
    async selectBusinessCategory(category, selectors) {
        for (const selector of selectors) {
            try {
                await this.page.waitForSelector(selector, { timeout: 3000 });
                
                // Get options and find best match
                const options = await this.page.$$eval(`${selector} option`, options => 
                    options.map(option => ({ value: option.value, text: option.textContent.toLowerCase() }))
                );
                
                const categoryMap = {
                    'hair-salon': ['hair', 'salon', 'beauty'],
                    'restaurant': ['restaurant', 'food', 'dining'],
                    'retail': ['retail', 'store', 'shop']
                };
                
                const keywords = categoryMap[category] || [category];
                const matchingOption = options.find(option => 
                    keywords.some(keyword => option.text.includes(keyword))
                );
                
                if (matchingOption) {
                    await this.page.selectOption(selector, matchingOption.value);
                    this.log(`✅ Selected category: ${matchingOption.text}`);
                    return true;
                }
            } catch (error) {
                continue;
            }
        }
        return false;
    }

    // Take screenshot
    async takeScreenshot(name) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `${name}-${timestamp}.png`;
            const screenshotPath = `screenshots/${filename}`;
            
            await this.page.screenshot({ 
                path: screenshotPath, 
                fullPage: true 
            });
            
            this.screenshots.push(screenshotPath);
            return filename;
        } catch (error) {
            this.log(`⚠️ Failed to take screenshot: ${error.message}`, 'warning');
            return null;
        }
    }

    // Wait helper
    async wait(ms) {
        await this.page.waitForTimeout(ms);
    }

    // Logging helper
    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            type,
            message
        };
        
        this.executionLog.push(logEntry);
        console.log(`[${timestamp}] ${message}`);
    }

    // Generate comprehensive report
    generateReport() {
        const successCount = this.results.filter(r => r.result.status === 'success').length;
        const manualCount = this.results.filter(r => r.result.status === 'manual_required').length;
        const errorCount = this.results.filter(r => r.result.status === 'error').length;
        
        return {
            executionId: Date.now(),
            timestamp: new Date().toISOString(),
            business: this.currentBusiness,
            summary: {
                totalDirectories: this.results.length,
                successful: successCount,
                manualRequired: manualCount,
                errors: errorCount,
                successRate: Math.round((successCount / this.results.length) * 100)
            },
            results: this.results,
            screenshots: this.screenshots,
            executionLog: this.executionLog
        };
    }

    // Cleanup resources
    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            this.log('🧹 Browser resources cleaned up');
        }
    }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WhiteLabelDirectoryEngine;
} else if (typeof window !== 'undefined') {
    window.WhiteLabelDirectoryEngine = WhiteLabelDirectoryEngine;
}