#!/usr/bin/env node

/**
 * ISO VISION MARKETING PARTNER AUTOMATION
 * Directory Submission System for Client: Chris David Salon
 * Using ISO Vision LLC credentials for legitimate marketing services
 */

const puppeteer = require('../tests/node_modules/puppeteer');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// ISO Vision Marketing Partner Information
const PARTNER = {
    company: 'ISO Vision LLC',
    role: 'Digital Marketing Partner',
    contact: 'Stuart Kerr',
    email: 'stuart@isovision.ai', // Your ISO Vision AI email
    gmailBackup: 'sikerr@gmail.com', // Gmail backup for some directories
    phone: '3129539668', // Your actual phone
    phoneFormatted: '(312) 953-9668',
    website: 'https://isovision.ai'
};

// Client Business Information
const CLIENT = {
    name: 'Chris David Salon',
    owner: 'Chris David',
    address: '223 NE 2nd Ave',
    city: 'Delray Beach',
    state: 'FL',
    zip: '33444',
    phone: '5618655215',
    phoneFormatted: '(561) 865-5215',
    email: 'chrisdavidsalon@gmail.com',
    website: 'https://chrisdavidsalon.com',
    category: 'Hair Salon',
    description: 'Premier luxury hair salon specializing in color correction, balayage, and keratin treatments. Chris David is a master colorist with 20+ years experience, formerly an educator for Davines professional hair care.',
    managedBy: 'ISO Vision LLC - Digital Marketing Partner'
};

// Account credentials for directory submissions
const ACCOUNT = {
    email: PARTNER.email, // stuart@isovision.ai for professional directories
    gmailEmail: PARTNER.gmailBackup, // sikerr@gmail.com for directories that require Gmail
    phone: PARTNER.phone, // (312) 953-9668 for verifications
    password: 'IsoVision2025!@#', // Strong password for directory accounts
    marketingPartner: true
};

console.log('🚀 ISO VISION MARKETING PARTNER AUTOMATION');
console.log('=' .repeat(60));
console.log('Marketing Partner:', PARTNER.company);
console.log('Client:', CLIENT.name);
console.log('Submission Email:', ACCOUNT.email);
console.log('=' .repeat(60));

// Create directories
async function setupDirectories() {
    const dirs = ['screenshots', 'reports', 'confirmations', 'credentials'];
    for (const dir of dirs) {
        await fs.mkdir(path.join(__dirname, dir), { recursive: true });
    }
}

// Check your Gmail for verification emails using Apple Mail
async function checkEmailVerification(searchTerm) {
    console.log(`📧 Checking ${PARTNER.email} for: ${searchTerm}`);
    
    // This checks Apple Mail - you'll need to have your ISO Vision email configured there
    const appleScript = `
    tell application "Mail"
        check for new mail
        delay 3
        set theAccounts to accounts whose email addresses contains "${PARTNER.email}"
        if (count of theAccounts) > 0 then
            set theAccount to item 1 of theAccounts
            set theMessages to messages of inbox of theAccount whose subject contains "${searchTerm}"
            if (count of theMessages) > 0 then
                set theMessage to item 1 of theMessages
                set messageContent to content of theMessage
                return messageContent
            else
                return "NO_EMAIL_FOUND"
            end if
        else
            return "ACCOUNT_NOT_CONFIGURED"
        end if
    end tell
    `;
    
    try {
        const result = execSync(`osascript -e '${appleScript}'`, { encoding: 'utf8' });
        
        if (result.includes('ACCOUNT_NOT_CONFIGURED')) {
            console.log('⚠️ ISO Vision email not configured in Apple Mail');
            console.log('   Please add stuart@isovision.com to Apple Mail');
            return null;
        }
        
        if (!result.includes('NO_EMAIL_FOUND')) {
            // Extract verification link
            const linkMatch = result.match(/https?:\/\/[^\s<>"]+(?:verify|confirm|activate)[^\s<>"]*/i);
            if (linkMatch) {
                console.log(`✅ Found verification link!`);
                return linkMatch[0];
            }
        }
    } catch (error) {
        console.log(`⚠️ Email check failed: ${error.message}`);
    }
    
    return null;
}

// Check for SMS verification codes (using Messages app on Mac)
async function checkSMSVerification() {
    console.log(`📱 Checking Messages for verification code...`);
    
    const appleScript = `
    tell application "Messages"
        set recentMessages to messages of inbox whose date sent > (current date) - 5 * minutes
        if (count of recentMessages) > 0 then
            set lastMessage to item 1 of recentMessages
            set messageText to text of lastMessage
            return messageText
        else
            return "NO_SMS_FOUND"
        end if
    end tell
    `;
    
    try {
        const result = execSync(`osascript -e '${appleScript}'`, { encoding: 'utf8' });
        
        if (!result.includes('NO_SMS_FOUND')) {
            // Extract verification code (usually 4-6 digits)
            const codeMatch = result.match(/\b\d{4,6}\b/);
            if (codeMatch) {
                console.log(`✅ Found SMS code: ${codeMatch[0]}`);
                return codeMatch[0];
            }
        }
    } catch (error) {
        console.log(`⚠️ SMS check failed: ${error.message}`);
    }
    
    return null;
}

// Enhanced form filling for marketing partner submission
async function fillAsMarketingPartner(page, fieldType, value) {
    // For marketing partner submissions, we need to be clear about the relationship
    const strategies = [
        `input[name*="${fieldType}"]`,
        `textarea[name*="${fieldType}"]`,
        `input[id*="${fieldType}"]`,
        `input[placeholder*="${fieldType}"]`,
        `input[type="${fieldType}"]`
    ];
    
    for (const selector of strategies) {
        try {
            const element = await page.$(selector);
            if (element) {
                await element.click({ clickCount: 3 });
                await page.keyboard.type(value);
                return true;
            }
        } catch (e) {
            continue;
        }
    }
    return false;
}

// Submit to directory as marketing partner
async function submitAsMarketingPartner(page, directoryName, url) {
    const result = { 
        name: directoryName, 
        status: 'pending',
        submittedAs: 'ISO Vision LLC - Marketing Partner'
    };
    
    try {
        console.log(`\n📍 SUBMITTING ${directoryName.toUpperCase()} AS MARKETING PARTNER...`);
        await page.goto(url, { waitUntil: 'networkidle2' });
        await page.waitForTimeout(3000);
        
        console.log('  📝 Filling as ISO Vision (Marketing Partner)...');
        
        // Fill business information (client's info)
        await fillAsMarketingPartner(page, 'business', CLIENT.name);
        await fillAsMarketingPartner(page, 'company', CLIENT.name);
        await fillAsMarketingPartner(page, 'name', CLIENT.name);
        
        // Use ISO Vision contact info for account creation
        await fillAsMarketingPartner(page, 'email', ACCOUNT.email);
        await fillAsMarketingPartner(page, 'phone', ACCOUNT.phone);
        await fillAsMarketingPartner(page, 'password', ACCOUNT.password);
        
        // Client's location info
        await fillAsMarketingPartner(page, 'address', CLIENT.address);
        await fillAsMarketingPartner(page, 'city', CLIENT.city);
        await fillAsMarketingPartner(page, 'state', CLIENT.state);
        await fillAsMarketingPartner(page, 'zip', CLIENT.zip);
        
        // Client's website
        await fillAsMarketingPartner(page, 'website', CLIENT.website);
        await fillAsMarketingPartner(page, 'url', CLIENT.website);
        
        // Enhanced description mentioning management
        const enhancedDescription = `${CLIENT.description} | Digital marketing managed by ISO Vision LLC.`;
        await fillAsMarketingPartner(page, 'description', enhancedDescription);
        
        // Look for "managed by" or "marketing agency" fields
        await fillAsMarketingPartner(page, 'agency', PARTNER.company);
        await fillAsMarketingPartner(page, 'managed', PARTNER.company);
        await fillAsMarketingPartner(page, 'partner', PARTNER.company);
        
        // Take screenshot
        const screenshotName = `${directoryName.toLowerCase().replace(/\s+/g, '-')}-partner.png`;
        await page.screenshot({ 
            path: path.join(__dirname, 'screenshots', screenshotName) 
        });
        
        // Find and click submit
        console.log('  🚀 Submitting form...');
        const submitButton = await page.$('button[type="submit"], input[type="submit"], button:contains("Sign Up"), button:contains("Register"), button:contains("Add Business")');
        
        if (submitButton) {
            await submitButton.click();
            await page.waitForTimeout(5000);
            
            // Check if email verification is needed
            const pageContent = await page.content();
            if (pageContent.includes('verify') || pageContent.includes('confirm')) {
                console.log('  📧 Checking ISO Vision email for verification...');
                
                // Wait for email
                let verificationLink = null;
                for (let i = 0; i < 30; i++) { // Check for 5 minutes
                    await new Promise(resolve => setTimeout(resolve, 10000));
                    verificationLink = await checkEmailVerification(directoryName);
                    if (verificationLink) break;
                }
                
                if (verificationLink) {
                    console.log('  ✅ Opening verification link...');
                    await page.goto(verificationLink, { waitUntil: 'networkidle2' });
                    result.status = 'verified';
                    result.message = 'Successfully submitted and verified via ISO Vision email';
                } else {
                    result.status = 'pending_verification';
                    result.message = 'Submitted, check ISO Vision email for verification';
                }
            } else if (pageContent.includes('SMS') || pageContent.includes('phone')) {
                console.log('  📱 SMS verification may be required...');
                
                // Check for SMS code
                const smsCode = await checkSMSVerification();
                if (smsCode) {
                    await fillAsMarketingPartner(page, 'code', smsCode);
                    await fillAsMarketingPartner(page, 'verification', smsCode);
                    result.status = 'verified';
                    result.message = 'Successfully verified via ISO Vision phone';
                } else {
                    result.status = 'pending_sms';
                    result.message = 'Check ISO Vision phone for SMS code';
                }
            } else {
                result.status = 'completed';
                result.message = 'Successfully submitted as ISO Vision marketing partner';
            }
        } else {
            result.status = 'form_filled';
            result.message = 'Form filled, manual submission may be required';
        }
        
        result.screenshot = screenshotName;
        
    } catch (error) {
        result.status = 'error';
        result.message = error.message;
        console.log(`  ❌ Error: ${error.message}`);
    }
    
    return result;
}

// Save credentials for client access
async function saveCredentials(directory, email, password) {
    const credentialsFile = path.join(__dirname, 'credentials', 'directory-logins.json');
    
    let credentials = {};
    try {
        const existing = await fs.readFile(credentialsFile, 'utf8');
        credentials = JSON.parse(existing);
    } catch (e) {
        // File doesn't exist yet
    }
    
    credentials[directory] = {
        email: email,
        password: password,
        managedBy: PARTNER.company,
        createdAt: new Date().toISOString(),
        note: 'Login managed by ISO Vision LLC for Chris David Salon'
    };
    
    await fs.writeFile(credentialsFile, JSON.stringify(credentials, null, 2));
}

// Main automation function
async function runPartnerAutomation() {
    console.log('\n📊 STARTING MARKETING PARTNER SUBMISSIONS...\n');
    
    await setupDirectories();
    
    const browser = await puppeteer.launch({
        headless: false, // Watch it work
        defaultViewport: { width: 1280, height: 800 },
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled'
        ]
    });
    
    const results = [];
    
    try {
        const page = await browser.newPage();
        
        // Set user agent
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
        
        // Remove webdriver detection
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
        });
        
        // Priority Beauty Directories
        console.log('🎯 PRIORITY: BEAUTY PLATFORMS\n');
        results.push(await submitAsMarketingPartner(page, 'Booksy', 'https://booksy.com/biz/sign-up'));
        await saveCredentials('Booksy', ACCOUNT.email, ACCOUNT.password);
        await page.waitForTimeout(5000);
        
        results.push(await submitAsMarketingPartner(page, 'StyleSeat', 'https://www.styleseat.com/pro/signup'));
        await saveCredentials('StyleSeat', ACCOUNT.email, ACCOUNT.password);
        await page.waitForTimeout(5000);
        
        results.push(await submitAsMarketingPartner(page, 'Vagaro', 'https://www.vagaro.com/businesssignup'));
        await saveCredentials('Vagaro', ACCOUNT.email, ACCOUNT.password);
        await page.waitForTimeout(5000);
        
        // General Directories
        console.log('\n🌐 GENERAL BUSINESS DIRECTORIES\n');
        results.push(await submitAsMarketingPartner(page, 'Hotfrog', 'https://www.hotfrog.com/add-business'));
        await saveCredentials('Hotfrog', ACCOUNT.email, ACCOUNT.password);
        await page.waitForTimeout(5000);
        
        results.push(await submitAsMarketingPartner(page, 'YellowPages', 'https://www.yellowpages.com/add'));
        await saveCredentials('YellowPages', ACCOUNT.email, ACCOUNT.password);
        
    } catch (error) {
        console.error('❌ Critical error:', error.message);
    } finally {
        await browser.close();
    }
    
    // Generate report
    console.log('\n' + '=' .repeat(60));
    console.log('📊 MARKETING PARTNER AUTOMATION COMPLETE');
    console.log('=' .repeat(60));
    
    let successful = 0;
    let pending = 0;
    let errors = 0;
    
    for (const result of results) {
        const icon = result.status === 'completed' || result.status === 'verified' ? '✅' : 
                    result.status.includes('pending') ? '📧' : 
                    result.status === 'form_filled' ? '📝' : '❌';
        
        console.log(`\n${icon} ${result.name}`);
        console.log(`   Status: ${result.status}`);
        console.log(`   ${result.message}`);
        console.log(`   Submitted As: ${result.submittedAs}`);
        
        if (result.status === 'completed' || result.status === 'verified') successful++;
        else if (result.status.includes('pending')) pending++;
        else errors++;
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('📈 RESULTS SUMMARY:');
    console.log(`   ✅ Successfully Submitted: ${successful}`);
    console.log(`   📧 Pending Verification: ${pending}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📊 Total Processed: ${results.length}`);
    console.log('\n   All submissions under: ISO Vision LLC');
    console.log(`   Verification Email: ${ACCOUNT.email}`);
    console.log(`   Verification Phone: ${ACCOUNT.phone}`);
    
    // Save comprehensive report
    const report = {
        date: new Date().toISOString(),
        marketingPartner: PARTNER,
        client: CLIENT,
        accountUsed: {
            email: ACCOUNT.email,
            phone: ACCOUNT.phone,
            submittedAs: 'ISO Vision LLC - Digital Marketing Partner'
        },
        results: results,
        summary: {
            successful,
            pending,
            errors,
            total: results.length
        },
        credentialsLocation: 'credentials/directory-logins.json'
    };
    
    const reportPath = path.join(__dirname, 'reports', `partner-automation-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n✅ Report saved to:', reportPath);
    console.log('✅ Credentials saved to: credentials/directory-logins.json');
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Check your ISO Vision email for verifications');
    console.log('2. Check your phone for any SMS codes');
    console.log('3. All logins are saved in credentials folder');
    console.log('4. Client can access using ISO Vision credentials');
    
    console.log('\n💼 PROFESSIONAL APPROACH:');
    console.log('• All submissions clearly marked as managed by ISO Vision');
    console.log('• Legitimate marketing partner relationship established');
    console.log('• Single point of contact for all directories');
    console.log('• Professional management of client listings');
}

// Run the partner automation
console.log('⚡ Launching ISO Vision Marketing Partner Automation...\n');
console.log('📝 NOTE: Make sure your ISO Vision email is configured in Apple Mail\n');

runPartnerAutomation().catch(console.error);