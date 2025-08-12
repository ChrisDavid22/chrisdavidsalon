/**
 * Enhanced Directory Submission Handlers
 * Specialized handlers for each directory platform
 * 
 * @author Claude Code
 * @date 2025-08-11
 */

class EnhancedDirectoryHandlers {
    constructor(page, businessData, logger) {
        this.page = page;
        this.business = businessData;
        this.log = logger;
    }

    async waitAndFill(selector, value, description = '', timeout = 10000) {
        try {
            await this.page.waitForSelector(selector, { timeout });
            await this.page.fill(selector, ''); // Clear first
            await this.page.fill(selector, value);
            await this.page.waitForTimeout(500);
            this.log(`✅ Filled ${description || selector}: ${value}`);
            return true;
        } catch (error) {
            this.log(`❌ Failed to fill ${description || selector}: ${error.message}`);
            return false;
        }
    }

    async waitAndClick(selector, description = '', timeout = 10000) {
        try {
            await this.page.waitForSelector(selector, { timeout });
            await this.page.click(selector);
            await this.page.waitForTimeout(1000);
            this.log(`✅ Clicked ${description || selector}`);
            return true;
        } catch (error) {
            this.log(`❌ Failed to click ${description || selector}: ${error.message}`);
            return false;
        }
    }

    async waitAndSelect(selector, value, description = '', timeout = 10000) {
        try {
            await this.page.waitForSelector(selector, { timeout });
            await this.page.selectOption(selector, value);
            await this.page.waitForTimeout(500);
            this.log(`✅ Selected ${description || selector}: ${value}`);
            return true;
        } catch (error) {
            this.log(`❌ Failed to select ${description || selector}: ${error.message}`);
            return false;
        }
    }

    async submitToBingPlaces() {
        try {
            this.log('🎯 Starting Bing Places submission...');
            
            // Go to Bing Places
            await this.page.goto('https://www.bingplaces.com', { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });
            
            await this.page.waitForTimeout(3000);
            
            // Check if we need to sign in
            const signInSelectors = [
                'a[href*="signin"]',
                'button:has-text("Sign in")',
                'a:has-text("Sign in")'
            ];
            
            let needsSignIn = false;
            for (const selector of signInSelectors) {
                try {
                    if (await this.page.isVisible(selector)) {
                        this.log('ℹ️ Bing Places requires Microsoft account sign-in');
                        needsSignIn = true;
                        break;
                    }
                } catch (error) {
                    continue;
                }
            }
            
            if (needsSignIn) {
                return {
                    status: 'manual_required',
                    message: 'Bing Places requires Microsoft account authentication',
                    nextSteps: 'Sign in with Microsoft account and manually add business listing'
                };
            }
            
            // Look for add business button
            const addBusinessSelectors = [
                'a[href*="add"]',
                'button:has-text("Add")',
                'a:has-text("Add Business")',
                'a:has-text("Add a business")',
                '.add-business'
            ];
            
            let addButtonClicked = false;
            for (const selector of addBusinessSelectors) {
                if (await this.waitAndClick(selector, 'add business button', 3000)) {
                    addButtonClicked = true;
                    break;
                }
            }
            
            if (!addButtonClicked) {
                return {
                    status: 'manual_required',
                    message: 'Could not locate add business button on Bing Places',
                    nextSteps: 'Manually navigate to business submission form'
                };
            }
            
            await this.page.waitForTimeout(3000);
            
            // Fill business information
            const fieldMappings = [
                { selectors: ['input[name="businessName"]', '#businessName', '.business-name'], value: this.business.name, description: 'Business Name' },
                { selectors: ['input[name="address"]', '#address', '.address'], value: this.business.address, description: 'Address' },
                { selectors: ['input[name="phone"]', '#phone', '.phone'], value: this.business.phone, description: 'Phone' },
                { selectors: ['input[name="website"]', '#website', '.website'], value: this.business.website, description: 'Website' },
                { selectors: ['textarea[name="description"]', '#description', '.description'], value: this.business.description, description: 'Description' }
            ];
            
            let filledFields = 0;
            for (const field of fieldMappings) {
                for (const selector of field.selectors) {
                    if (await this.waitAndFill(selector, field.value, field.description, 3000)) {
                        filledFields++;
                        break;
                    }
                }
            }
            
            return {
                status: filledFields > 2 ? 'success' : 'partial',
                message: `Bing Places form accessed - ${filledFields} fields filled`,
                fieldsCompleted: filledFields,
                totalFields: fieldMappings.length
            };
            
        } catch (error) {
            this.log(`❌ Bing Places error: ${error.message}`);
            return {
                status: 'error',
                message: error.message
            };
        }
    }

    async submitToBooksy() {
        try {
            this.log('🎯 Starting Booksy submission...');
            
            await this.page.goto('https://booksy.com/biz/sign-up', { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });
            
            await this.page.waitForTimeout(3000);
            
            // Booksy has a multi-step signup process
            const fieldMappings = [
                { selectors: ['input[name="firstName"]', '#firstName', '.first-name'], value: 'Chris', description: 'First Name' },
                { selectors: ['input[name="lastName"]', '#lastName', '.last-name'], value: 'David', description: 'Last Name' },
                { selectors: ['input[name="email"]', '#email', '.email'], value: this.business.email, description: 'Email' },
                { selectors: ['input[name="businessName"]', '#businessName', '.business-name'], value: this.business.name, description: 'Business Name' },
                { selectors: ['input[name="phone"]', '#phone', '.phone'], value: this.business.phone, description: 'Phone' }
            ];
            
            let filledFields = 0;
            for (const field of fieldMappings) {
                for (const selector of field.selectors) {
                    if (await this.waitAndFill(selector, field.value, field.description, 3000)) {
                        filledFields++;
                        break;
                    }
                }
            }
            
            // Try to select business category
            const categorySelectors = [
                'select[name="category"]',
                'select[name="businessType"]',
                '.category-select'
            ];
            
            for (const selector of categorySelectors) {
                try {
                    await this.page.waitForSelector(selector, { timeout: 3000 });
                    const options = await this.page.$$eval(`${selector} option`, options => 
                        options.map(option => ({ value: option.value, text: option.textContent }))
                    );
                    
                    // Look for hair salon related options
                    const hairSalonOption = options.find(opt => 
                        opt.text.toLowerCase().includes('hair') || 
                        opt.text.toLowerCase().includes('salon') ||
                        opt.text.toLowerCase().includes('beauty')
                    );
                    
                    if (hairSalonOption) {
                        await this.page.selectOption(selector, hairSalonOption.value);
                        this.log(`✅ Selected category: ${hairSalonOption.text}`);
                        filledFields++;
                        break;
                    }
                } catch (error) {
                    continue;
                }
            }
            
            return {
                status: filledFields > 3 ? 'success' : 'partial',
                message: `Booksy signup form accessed - ${filledFields} fields filled`,
                fieldsCompleted: filledFields,
                nextSteps: 'Complete signup process and verify email'
            };
            
        } catch (error) {
            this.log(`❌ Booksy error: ${error.message}`);
            return {
                status: 'error',
                message: error.message
            };
        }
    }

    async submitToStyleSeat() {
        try {
            this.log('🎯 Starting StyleSeat submission...');
            
            await this.page.goto('https://www.styleseat.com/pro/signup', { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });
            
            await this.page.waitForTimeout(3000);
            
            // StyleSeat professional signup
            const fieldMappings = [
                { selectors: ['input[name="firstName"]', '#firstName'], value: 'Chris', description: 'First Name' },
                { selectors: ['input[name="lastName"]', '#lastName'], value: 'David', description: 'Last Name' },
                { selectors: ['input[name="email"]', '#email'], value: this.business.email, description: 'Email' },
                { selectors: ['input[name="businessName"]', '#businessName'], value: this.business.name, description: 'Business Name' },
                { selectors: ['input[name="phoneNumber"]', '#phoneNumber'], value: this.business.phone, description: 'Phone' }
            ];
            
            let filledFields = 0;
            for (const field of fieldMappings) {
                for (const selector of field.selectors) {
                    if (await this.waitAndFill(selector, field.value, field.description, 3000)) {
                        filledFields++;
                        break;
                    }
                }
            }
            
            // Try to fill address if there's an address field
            const addressSelectors = ['input[name="address"]', '#address', '.address'];
            for (const selector of addressSelectors) {
                if (await this.waitAndFill(selector, this.business.address, 'Address', 3000)) {
                    filledFields++;
                    break;
                }
            }
            
            return {
                status: filledFields > 3 ? 'success' : 'partial',
                message: `StyleSeat signup form accessed - ${filledFields} fields filled`,
                fieldsCompleted: filledFields,
                nextSteps: 'Complete professional profile setup'
            };
            
        } catch (error) {
            this.log(`❌ StyleSeat error: ${error.message}`);
            return {
                status: 'error',
                message: error.message
            };
        }
    }

    async submitToVagaro() {
        try {
            this.log('🎯 Starting Vagaro submission...');
            
            await this.page.goto('https://www.vagaro.com/businesssignup', { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });
            
            await this.page.waitForTimeout(3000);
            
            // Vagaro business signup
            const fieldMappings = [
                { selectors: ['input[name="businessName"]', '#businessName'], value: this.business.name, description: 'Business Name' },
                { selectors: ['input[name="ownerFirstName"]', '#ownerFirstName'], value: 'Chris', description: 'Owner First Name' },
                { selectors: ['input[name="ownerLastName"]', '#ownerLastName'], value: 'David', description: 'Owner Last Name' },
                { selectors: ['input[name="email"]', '#email'], value: this.business.email, description: 'Email' },
                { selectors: ['input[name="phone"]', '#phone'], value: this.business.phone, description: 'Phone' },
                { selectors: ['input[name="address"]', '#address'], value: this.business.address, description: 'Address' }
            ];
            
            let filledFields = 0;
            for (const field of fieldMappings) {
                for (const selector of field.selectors) {
                    if (await this.waitAndFill(selector, field.value, field.description, 3000)) {
                        filledFields++;
                        break;
                    }
                }
            }
            
            return {
                status: filledFields > 4 ? 'success' : 'partial',
                message: `Vagaro business signup form accessed - ${filledFields} fields filled`,
                fieldsCompleted: filledFields,
                nextSteps: 'Complete business verification and setup'
            };
            
        } catch (error) {
            this.log(`❌ Vagaro error: ${error.message}`);
            return {
                status: 'error',
                message: error.message
            };
        }
    }

    async submitToGoldwell() {
        try {
            this.log('🎯 Starting Goldwell submission...');
            
            await this.page.goto('https://www.goldwell.com/salon-locator', { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });
            
            await this.page.waitForTimeout(3000);
            
            // Look for salon registration or add salon link
            const addSalonSelectors = [
                'a[href*="add"]',
                'a[href*="register"]',
                'a:has-text("Add Salon")',
                'a:has-text("Register")',
                'button:has-text("Add Salon")',
                '.add-salon',
                '.register-salon'
            ];
            
            let addButtonFound = false;
            for (const selector of addSalonSelectors) {
                if (await this.waitAndClick(selector, 'add salon button', 3000)) {
                    addButtonFound = true;
                    break;
                }
            }
            
            if (!addButtonFound) {
                // Check page content for instructions
                const pageContent = await this.page.textContent('body');
                if (pageContent.toLowerCase().includes('contact') || pageContent.toLowerCase().includes('email')) {
                    return {
                        status: 'manual_required',
                        message: 'Goldwell requires contacting them directly to add salon',
                        nextSteps: 'Contact Goldwell customer service to add salon to locator'
                    };
                }
            }
            
            await this.page.waitForTimeout(3000);
            
            // If form is available, try to fill it
            const fieldMappings = [
                { selectors: ['input[name="salonName"]', '#salonName'], value: this.business.name, description: 'Salon Name' },
                { selectors: ['input[name="address"]', '#address'], value: this.business.address, description: 'Address' },
                { selectors: ['input[name="phone"]', '#phone'], value: this.business.phone, description: 'Phone' },
                { selectors: ['input[name="email"]', '#email'], value: this.business.email, description: 'Email' },
                { selectors: ['input[name="website"]', '#website'], value: this.business.website, description: 'Website' }
            ];
            
            let filledFields = 0;
            for (const field of fieldMappings) {
                for (const selector of field.selectors) {
                    if (await this.waitAndFill(selector, field.value, field.description, 2000)) {
                        filledFields++;
                        break;
                    }
                }
            }
            
            return {
                status: filledFields > 0 ? 'success' : 'manual_required',
                message: filledFields > 0 ? 
                    `Goldwell form accessed - ${filledFields} fields filled` : 
                    'Goldwell salon locator requires manual contact',
                fieldsCompleted: filledFields,
                nextSteps: 'Contact Goldwell directly for salon listing approval'
            };
            
        } catch (error) {
            this.log(`❌ Goldwell error: ${error.message}`);
            return {
                status: 'error',
                message: error.message
            };
        }
    }

    async submitToDavines() {
        try {
            this.log('🎯 Starting Davines submission...');
            
            await this.page.goto('https://www.davines.com/salon-locator', { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });
            
            await this.page.waitForTimeout(3000);
            
            // Davines salon finder - look for add salon option
            const addSalonSelectors = [
                'a[href*="add"]',
                'a[href*="register"]',
                'a:has-text("Add Salon")',
                'a:has-text("Register")',
                'button:has-text("Add Salon")',
                '.add-salon'
            ];
            
            let addButtonFound = false;
            for (const selector of addSalonSelectors) {
                if (await this.waitAndClick(selector, 'add salon button', 3000)) {
                    addButtonFound = true;
                    break;
                }
            }
            
            if (!addButtonFound) {
                // Davines may require direct contact or have a different process
                return {
                    status: 'manual_required',
                    message: 'Davines salon locator may require direct contact',
                    nextSteps: 'Contact Davines customer service to add salon to locator',
                    note: 'As a former Davines educator, Chris David may have existing contacts'
                };
            }
            
            await this.page.waitForTimeout(3000);
            
            // Fill form if available
            const fieldMappings = [
                { selectors: ['input[name="salonName"]', '#salonName'], value: this.business.name, description: 'Salon Name' },
                { selectors: ['input[name="address"]', '#address'], value: this.business.address, description: 'Address' },
                { selectors: ['input[name="phone"]', '#phone'], value: this.business.phone, description: 'Phone' },
                { selectors: ['input[name="email"]', '#email'], value: this.business.email, description: 'Email' },
                { selectors: ['input[name="website"]', '#website'], value: this.business.website, description: 'Website' }
            ];
            
            let filledFields = 0;
            for (const field of fieldMappings) {
                for (const selector of field.selectors) {
                    if (await this.waitAndFill(selector, field.value, field.description, 2000)) {
                        filledFields++;
                        break;
                    }
                }
            }
            
            return {
                status: filledFields > 0 ? 'success' : 'manual_required',
                message: filledFields > 0 ? 
                    `Davines form accessed - ${filledFields} fields filled` : 
                    'Davines salon locator requires manual contact',
                fieldsCompleted: filledFields,
                nextSteps: 'Leverage existing Davines educator relationship for salon listing'
            };
            
        } catch (error) {
            this.log(`❌ Davines error: ${error.message}`);
            return {
                status: 'error',
                message: error.message
            };
        }
    }

    async submitToAppleMaps() {
        try {
            this.log('🎯 Starting Apple Maps submission...');
            
            await this.page.goto('https://mapsconnect.apple.com', { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });
            
            await this.page.waitForTimeout(3000);
            
            // Apple Maps requires Apple ID authentication
            return {
                status: 'manual_required',
                message: 'Apple Maps Connect requires Apple ID authentication',
                nextSteps: [
                    '1. Sign in with Apple ID at https://mapsconnect.apple.com',
                    '2. Search for existing business listing',
                    '3. Claim or add new business listing',
                    '4. Verify business ownership',
                    '5. Complete business information'
                ],
                importance: 'High - Apple Maps is crucial for iPhone users'
            };
            
        } catch (error) {
            this.log(`❌ Apple Maps error: ${error.message}`);
            return {
                status: 'error',
                message: error.message
            };
        }
    }
}

module.exports = EnhancedDirectoryHandlers;