/**
 * AUTOMATED EMAIL VERIFICATION SYSTEM
 * 
 * This module handles automatic email verification for directory submissions
 * It monitors Gmail and clicks verification links automatically
 */

const { chromium } = require('playwright');
const { setTimeout } = require('timers/promises');

class EmailVerifier {
    constructor(email, password = null) {
        this.email = email;
        this.password = password;
        this.browser = null;
        this.context = null;
        this.page = null;
        this.verifiedLinks = new Set();
    }

    async initialize() {
        console.log('📧 Initializing email verification system...');
        
        this.browser = await chromium.launch({
            headless: false, // Keep visible for manual authentication if needed
            args: ['--no-sandbox', '--disable-dev-shm-usage']
        });

        this.context = await this.browser.newContext({
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            viewport: { width: 1366, height: 768 }
        });

        this.page = await this.context.newPage();
    }

    async loginToGmail() {
        console.log('🔐 Logging into Gmail...');
        
        try {
            await this.page.goto('https://accounts.google.com/signin/v2/identifier');
            
            // Enter email
            const emailInput = await this.page.waitForSelector('#identifierId', { timeout: 10000 });
            await emailInput.fill(this.email);
            await this.page.click('#identifierNext');
            
            // Wait for password field or 2FA
            await this.page.waitForTimeout(3000);
            
            if (this.password) {
                try {
                    const passwordInput = await this.page.waitForSelector('input[type="password"]', { timeout: 10000 });
                    await passwordInput.fill(this.password);
                    await this.page.click('#passwordNext');
                    await this.page.waitForTimeout(3000);
                } catch (e) {
                    console.log('⚠️  Manual password entry may be required');
                }
            } else {
                console.log('⚠️  Please complete Gmail login manually in the browser window');
                
                // Wait for successful login (check for Gmail inbox URL)
                await this.page.waitForURL(/mail\.google\.com/, { timeout: 300000 }); // 5 minutes max
            }
            
            // Navigate to Gmail inbox
            await this.page.goto('https://mail.google.com/mail/u/0/#inbox');
            await this.page.waitForTimeout(3000);
            
            console.log('✅ Gmail login successful');
            return true;
            
        } catch (error) {
            console.error('❌ Gmail login failed:', error.message);
            return false;
        }
    }

    async monitorForVerificationEmails() {
        console.log('👁️  Monitoring for verification emails...');
        
        const monitoringDuration = 30 * 60 * 1000; // 30 minutes
        const checkInterval = 30 * 1000; // Check every 30 seconds
        const startTime = Date.now();
        
        while (Date.now() - startTime < monitoringDuration) {
            try {
                await this.checkForNewVerificationEmails();
                await setTimeout(checkInterval);
            } catch (error) {
                console.error('⚠️  Error during email monitoring:', error.message);
                await setTimeout(checkInterval);
            }
        }
    }

    async checkForNewVerificationEmails() {
        // Refresh inbox
        await this.page.reload();
        await this.page.waitForTimeout(2000);
        
        // Search for verification keywords
        const verificationPatterns = [
            'verify your email',
            'verify your business',
            'confirm your listing',
            'activate your account',
            'complete your registration',
            'verify your submission',
            'confirm your business',
            'email verification',
            'account verification'
        ];
        
        // Look for unread emails containing verification keywords
        const emailRows = await this.page.$$('.zA:not(.yW) .bog'); // Unread emails
        
        for (const emailRow of emailRows) {
            try {
                const emailText = await emailRow.textContent();
                const isVerificationEmail = verificationPatterns.some(pattern => 
                    emailText.toLowerCase().includes(pattern.toLowerCase())
                );
                
                if (isVerificationEmail) {
                    console.log('📨 Found verification email, processing...');
                    await this.processVerificationEmail(emailRow);
                }
            } catch (error) {
                console.log('⚠️  Error processing email row:', error.message);
            }
        }
    }

    async processVerificationEmail(emailRow) {
        try {
            // Click on the email to open it
            await emailRow.click();
            await this.page.waitForTimeout(2000);
            
            // Look for verification links in the email content
            const verificationLinkSelectors = [
                'a[href*="verify"]',
                'a[href*="confirm"]',
                'a[href*="activate"]',
                'a[href*="validation"]',
                'a[href*="verification"]',
                'a:has-text("Verify")',
                'a:has-text("Confirm")',
                'a:has-text("Activate")',
                'a:has-text("Click here")',
                'a:has-text("Complete")'
            ];
            
            let verificationLink = null;
            let linkUrl = null;
            
            for (const selector of verificationLinkSelectors) {
                verificationLink = await this.page.$(selector);
                if (verificationLink) {
                    linkUrl = await verificationLink.getAttribute('href');
                    if (linkUrl && !this.verifiedLinks.has(linkUrl)) {
                        break;
                    }
                    verificationLink = null;
                    linkUrl = null;
                }
            }
            
            if (verificationLink && linkUrl) {
                console.log('🔗 Found verification link:', linkUrl);
                this.verifiedLinks.add(linkUrl);
                
                // Open verification link in new tab
                const newPage = await this.context.newPage();
                
                try {
                    await newPage.goto(linkUrl);
                    await newPage.waitForTimeout(3000);
                    
                    // Handle any additional verification steps
                    await this.handleVerificationPage(newPage);
                    
                    console.log('✅ Verification link processed successfully');
                    
                } catch (error) {
                    console.error('❌ Error processing verification link:', error.message);
                } finally {
                    await newPage.close();
                }
            }
            
            // Go back to inbox
            await this.page.goBack();
            await this.page.waitForTimeout(1000);
            
        } catch (error) {
            console.error('❌ Error processing verification email:', error.message);
        }
    }

    async handleVerificationPage(page) {
        try {
            // Look for common verification actions
            const verificationActions = [
                { selector: 'button:has-text("Verify")', action: 'click' },
                { selector: 'button:has-text("Confirm")', action: 'click' },
                { selector: 'button:has-text("Activate")', action: 'click' },
                { selector: 'button:has-text("Complete")', action: 'click' },
                { selector: 'a:has-text("Verify")', action: 'click' },
                { selector: 'a:has-text("Confirm")', action: 'click' },
                { selector: 'input[type="submit"]', action: 'click' },
                { selector: 'button[type="submit"]', action: 'click' }
            ];
            
            for (const { selector, action } of verificationActions) {
                const element = await page.$(selector);
                if (element) {
                    console.log(`🎯 Found verification action: ${selector}`);
                    
                    if (action === 'click') {
                        await element.click();
                        await page.waitForTimeout(3000);
                    }
                    
                    break;
                }
            }
            
            // Check if additional forms need to be filled
            const formFields = await page.$$('input:not([type="hidden"]):not([type="submit"]):not([type="button"])');
            
            if (formFields.length > 0) {
                console.log('📝 Found additional form fields, attempting to fill...');
                await this.fillVerificationForm(page);
            }
            
            // Look for success indicators
            const successIndicators = [
                'verified',
                'confirmed',
                'activated',
                'success',
                'thank you',
                'welcome',
                'complete'
            ];
            
            const pageContent = await page.content();
            const isSuccess = successIndicators.some(indicator => 
                pageContent.toLowerCase().includes(indicator)
            );
            
            if (isSuccess) {
                console.log('🎉 Verification appears successful!');
            } else {
                console.log('⚠️  Verification status unclear, may need manual review');
            }
            
        } catch (error) {
            console.error('⚠️  Error handling verification page:', error.message);
        }
    }

    async fillVerificationForm(page) {
        // Business data for form filling
        const businessData = {
            name: 'Chris David Salon',
            address: '223 NE 2nd Ave',
            city: 'Delray Beach',
            state: 'FL',
            zip: '33444',
            phone: '(561) 865-5215',
            website: 'https://chrisdavidsalon.com'
        };
        
        // Common form field mappings
        const fieldMappings = {
            'business name': businessData.name,
            'company name': businessData.name,
            'name': businessData.name,
            'address': `${businessData.address}, ${businessData.city}, ${businessData.state} ${businessData.zip}`,
            'street': businessData.address,
            'city': businessData.city,
            'state': businessData.state,
            'zip': businessData.zip,
            'postal': businessData.zip,
            'phone': businessData.phone,
            'telephone': businessData.phone,
            'website': businessData.website,
            'url': businessData.website
        };
        
        const formInputs = await page.$$('input:not([type="hidden"]):not([type="submit"]):not([type="button"])');
        
        for (const input of formInputs) {
            try {
                const name = await input.getAttribute('name') || '';
                const placeholder = await input.getAttribute('placeholder') || '';
                const id = await input.getAttribute('id') || '';
                
                const fieldText = `${name} ${placeholder} ${id}`.toLowerCase();
                
                for (const [keyword, value] of Object.entries(fieldMappings)) {
                    if (fieldText.includes(keyword)) {
                        await input.fill(value);
                        console.log(`✏️  Filled field "${keyword}" with "${value}"`);
                        break;
                    }
                }
            } catch (error) {
                console.log('⚠️  Error filling form field:', error.message);
            }
        }
        
        // Submit the form if there's a submit button
        const submitButton = await page.$('button[type="submit"], input[type="submit"]');
        if (submitButton) {
            await submitButton.click();
            await page.waitForTimeout(3000);
            console.log('📤 Form submitted');
        }
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async run() {
        try {
            await this.initialize();
            
            const loginSuccess = await this.loginToGmail();
            if (!loginSuccess) {
                throw new Error('Failed to login to Gmail');
            }
            
            await this.monitorForVerificationEmails();
            
        } catch (error) {
            console.error('💥 Email verifier error:', error);
        } finally {
            await this.cleanup();
        }
    }
}

module.exports = EmailVerifier;

// CLI usage
if (require.main === module) {
    const email = process.argv[2] || 'sikerr@gmail.com';
    const verifier = new EmailVerifier(email);
    verifier.run();
}