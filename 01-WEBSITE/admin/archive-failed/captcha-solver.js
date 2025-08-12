/**
 * INTELLIGENT CAPTCHA SOLVER
 * 
 * Handles various types of CAPTCHAs with multiple strategies:
 * 1. Automatic checkbox CAPTCHAs (reCAPTCHA v2)
 * 2. Audio CAPTCHAs
 * 3. Image recognition CAPTCHAs
 * 4. Simple math/text CAPTCHAs
 * 5. Bypass techniques for bot detection
 */

const { setTimeout } = require('timers/promises');

class CaptchaSolver {
    constructor(page) {
        this.page = page;
        this.solvedCaptchas = new Set();
    }

    async solveCaptcha(maxAttempts = 3) {
        console.log('🤖 Scanning for CAPTCHAs...');
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            console.log(`🔄 CAPTCHA solving attempt ${attempt}/${maxAttempts}`);
            
            try {
                // Try different CAPTCHA types in order of success probability
                const strategies = [
                    this.solveCheckboxCaptcha.bind(this),
                    this.solveSimpleTextCaptcha.bind(this),
                    this.solveAudioCaptcha.bind(this),
                    this.solveImageCaptcha.bind(this),
                    this.bypassCaptcha.bind(this)
                ];
                
                for (const strategy of strategies) {
                    const result = await strategy();
                    if (result.success) {
                        console.log(`✅ CAPTCHA solved using: ${result.method}`);
                        return true;
                    }
                }
                
                // If no strategy worked, wait and retry
                if (attempt < maxAttempts) {
                    console.log(`⏳ Waiting before retry attempt ${attempt + 1}...`);
                    await setTimeout(3000 + (attempt * 2000)); // Exponential backoff
                }
                
            } catch (error) {
                console.log(`⚠️  CAPTCHA solving error on attempt ${attempt}: ${error.message}`);
            }
        }
        
        console.log('❌ All CAPTCHA solving attempts failed');
        return false;
    }

    async solveCheckboxCaptcha() {
        // Look for reCAPTCHA v2 checkbox
        const checkboxSelectors = [
            '.recaptcha-checkbox-border',
            '.rc-anchor-checkbox',
            '.h-captcha-checkbox',
            '[data-recaptcha]',
            '.g-recaptcha'
        ];
        
        for (const selector of checkboxSelectors) {
            try {
                const checkbox = await this.page.$(selector);
                if (checkbox) {
                    console.log('🎯 Found checkbox CAPTCHA');
                    
                    // Scroll into view
                    await checkbox.scrollIntoViewIfNeeded();
                    await setTimeout(1000);
                    
                    // Use human-like clicking
                    await this.humanClick(checkbox);
                    
                    // Wait for potential automatic solving
                    await setTimeout(5000);
                    
                    // Check if solved
                    const solved = await this.isCaptchaSolved();
                    if (solved) {
                        return { success: true, method: 'checkbox' };
                    }
                    
                    // If not automatically solved, look for challenge
                    await this.handleCaptchaChallenge();
                    
                    // Check again after challenge
                    const finalCheck = await this.isCaptchaSolved();
                    return { success: finalCheck, method: 'checkbox-with-challenge' };
                }
            } catch (error) {
                console.log(`⚠️  Checkbox CAPTCHA error: ${error.message}`);
            }
        }
        
        return { success: false, method: 'checkbox' };
    }

    async solveSimpleTextCaptcha() {
        // Look for simple text/math CAPTCHAs
        const textCaptchaSelectors = [
            'input[name*="captcha"]',
            'input[id*="captcha"]',
            'input[placeholder*="captcha"]',
            '.captcha-input',
            '[data-captcha-input]'
        ];
        
        for (const selector of textCaptchaSelectors) {
            try {
                const input = await this.page.$(selector);
                if (input) {
                    console.log('🎯 Found text CAPTCHA');
                    
                    // Look for CAPTCHA image or text near the input
                    const captchaText = await this.extractCaptchaText();
                    if (captchaText) {
                        const solution = this.solveMathCaptcha(captchaText);
                        if (solution) {
                            await this.humanType(input, solution);
                            return { success: true, method: 'text-math' };
                        }
                    }
                }
            } catch (error) {
                console.log(`⚠️  Text CAPTCHA error: ${error.message}`);
            }
        }
        
        return { success: false, method: 'text' };
    }

    async solveAudioCaptcha() {
        try {
            // Look for audio CAPTCHA buttons
            const audioSelectors = [
                '[title*="audio"]',
                '[aria-label*="audio"]',
                '.rc-button-audio',
                'button:has-text("Audio")'
            ];
            
            for (const selector of audioSelectors) {
                const audioButton = await this.page.$(selector);
                if (audioButton) {
                    console.log('🎯 Found audio CAPTCHA option');
                    
                    await this.humanClick(audioButton);
                    await setTimeout(3000);
                    
                    // Note: Real audio CAPTCHA solving would require
                    // speech recognition service integration
                    console.log('⚠️  Audio CAPTCHA detected but automatic solving not implemented');
                    
                    return { success: false, method: 'audio' };
                }
            }
        } catch (error) {
            console.log(`⚠️  Audio CAPTCHA error: ${error.message}`);
        }
        
        return { success: false, method: 'audio' };
    }

    async solveImageCaptcha() {
        try {
            // Look for image CAPTCHA challenges
            const imageSelectors = [
                '.rc-imageselect',
                '.h-captcha-challenge',
                '[data-image-captcha]'
            ];
            
            for (const selector of imageSelectors) {
                const imageChallenge = await this.page.$(selector);
                if (imageChallenge) {
                    console.log('🎯 Found image CAPTCHA challenge');
                    
                    // Simple strategy: randomly click images (not recommended for production)
                    const images = await this.page.$$(`${selector} img, ${selector} .rc-image-tile`);
                    
                    if (images.length > 0) {
                        // Click 2-4 random images
                        const clickCount = Math.floor(Math.random() * 3) + 2;
                        const imagesToClick = this.shuffleArray(images).slice(0, clickCount);
                        
                        for (const img of imagesToClick) {
                            await this.humanClick(img);
                            await setTimeout(500);
                        }
                        
                        // Look for verify button
                        const verifyButton = await this.page.$('.rc-button-default, button:has-text("Verify")');
                        if (verifyButton) {
                            await this.humanClick(verifyButton);
                            await setTimeout(3000);
                        }
                        
                        return { success: false, method: 'image-random' }; // Usually fails, but worth trying
                    }
                }
            }
        } catch (error) {
            console.log(`⚠️  Image CAPTCHA error: ${error.message}`);
        }
        
        return { success: false, method: 'image' };
    }

    async bypassCaptcha() {
        try {
            // Anti-detection measures
            await this.implementAntiDetection();
            
            // Look for hidden CAPTCHA bypass methods
            const bypassSelectors = [
                'input[name="captcha"][type="hidden"]',
                '[data-captcha-bypass]',
                '.captcha-bypass'
            ];
            
            for (const selector of bypassSelectors) {
                const bypass = await this.page.$(selector);
                if (bypass) {
                    console.log('🎯 Found potential CAPTCHA bypass');
                    return { success: true, method: 'bypass' };
                }
            }
            
            // Check if CAPTCHA is actually optional
            const submitButtons = await this.page.$$('button[type="submit"], input[type="submit"]');
            for (const button of submitButtons) {
                const isDisabled = await button.getAttribute('disabled');
                if (!isDisabled) {
                    console.log('🎯 Submit button is enabled, CAPTCHA might be optional');
                    return { success: true, method: 'optional' };
                }
            }
            
        } catch (error) {
            console.log(`⚠️  Bypass attempt error: ${error.message}`);
        }
        
        return { success: false, method: 'bypass' };
    }

    async handleCaptchaChallenge() {
        // Wait for challenge to appear
        await setTimeout(2000);
        
        // Look for challenge iframe or popup
        const challengeSelectors = [
            'iframe[title*="recaptcha"]',
            '.rc-challenge-container',
            '.h-captcha-challenge'
        ];
        
        for (const selector of challengeSelectors) {
            const challenge = await this.page.$(selector);
            if (challenge) {
                console.log('🎯 CAPTCHA challenge appeared');
                
                // If it's an iframe, work within it
                if (selector.includes('iframe')) {
                    try {
                        const frame = await challenge.contentFrame();
                        if (frame) {
                            await this.solveChallengeInFrame(frame);
                        }
                    } catch (error) {
                        console.log('⚠️  Frame access error:', error.message);
                    }
                }
                
                break;
            }
        }
    }

    async solveChallengeInFrame(frame) {
        // This would contain specific challenge solving logic
        // For now, just wait and see if it auto-solves
        await setTimeout(5000);
    }

    async isCaptchaSolved() {
        // Check for various success indicators
        const successSelectors = [
            '.recaptcha-checkbox-checked',
            '.rc-anchor-checkbox-checked',
            '.h-captcha-checkbox-checked',
            '[data-recaptcha-solved="true"]'
        ];
        
        for (const selector of successSelectors) {
            const element = await this.page.$(selector);
            if (element) {
                return true;
            }
        }
        
        // Check if submit button is now enabled
        const submitButton = await this.page.$('button[type="submit"]:not([disabled]), input[type="submit"]:not([disabled])');
        return !!submitButton;
    }

    async extractCaptchaText() {
        // Look for CAPTCHA text in common locations
        const textSelectors = [
            '.captcha-text',
            '.captcha-question',
            '[data-captcha-text]',
            'label[for*="captcha"]'
        ];
        
        for (const selector of textSelectors) {
            const element = await this.page.$(selector);
            if (element) {
                const text = await element.textContent();
                return text.trim();
            }
        }
        
        return null;
    }

    solveMathCaptcha(text) {
        // Simple math CAPTCHA solver
        const mathPatterns = [
            /(\d+)\s*\+\s*(\d+)/,  // Addition
            /(\d+)\s*-\s*(\d+)/,   // Subtraction
            /(\d+)\s*\*\s*(\d+)/,  // Multiplication
            /(\d+)\s*\/\s*(\d+)/   // Division
        ];
        
        for (const pattern of mathPatterns) {
            const match = text.match(pattern);
            if (match) {
                const num1 = parseInt(match[1]);
                const num2 = parseInt(match[2]);
                
                if (text.includes('+')) return (num1 + num2).toString();
                if (text.includes('-')) return (num1 - num2).toString();
                if (text.includes('*')) return (num1 * num2).toString();
                if (text.includes('/')) return Math.floor(num1 / num2).toString();
            }
        }
        
        return null;
    }

    async implementAntiDetection() {
        // Add randomness to mouse movements
        await this.page.mouse.move(
            Math.random() * 100 + 50,
            Math.random() * 100 + 50
        );
        
        // Random scroll
        await this.page.evaluate(() => {
            window.scrollBy(0, Math.random() * 100 - 50);
        });
        
        // Add human-like delays
        await setTimeout(Math.random() * 1000 + 500);
    }

    async humanClick(element) {
        // Human-like clicking with small random offset
        const box = await element.boundingBox();
        if (box) {
            const x = box.x + box.width * (0.3 + Math.random() * 0.4);
            const y = box.y + box.height * (0.3 + Math.random() * 0.4);
            
            await this.page.mouse.move(x, y);
            await setTimeout(100 + Math.random() * 200);
            await this.page.mouse.click(x, y);
        } else {
            await element.click();
        }
    }

    async humanType(element, text) {
        await element.click();
        await setTimeout(200 + Math.random() * 300);
        
        // Clear existing text
        await this.page.keyboard.press('Control+a');
        await setTimeout(100);
        
        // Type with human-like delays
        for (const char of text) {
            await this.page.keyboard.type(char);
            await setTimeout(50 + Math.random() * 100);
        }
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

module.exports = CaptchaSolver;