const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Load homepage
    await page.goto('file://' + process.cwd() + '/index.html');
    console.log('1. Loaded homepage');
    
    // Take screenshot before clicking
    await page.screenshot({ path: 'test-results/join-us-before-click.png', fullPage: false });
    console.log('2. Screenshot before click saved');
    
    // Click the Join Us button
    await page.click('button:has-text("Join Us")');
    console.log('3. Clicked Join Us button');
    
    // Wait for dropdown to appear
    await page.waitForTimeout(500);
    
    // Take screenshot showing dropdown open
    await page.screenshot({ path: 'test-results/join-us-dropdown-open.png', fullPage: false });
    console.log('4. Screenshot with dropdown open saved');
    
    // Check if Chair Rental link is visible
    const chairRentalLink = await page.locator('a:has-text("Chair Rental")').first();
    const isVisible = await chairRentalLink.isVisible();
    console.log('5. Chair Rental link visible:', isVisible);
    
    // Click Chair Rental
    await chairRentalLink.click();
    console.log('6. Clicked Chair Rental link');
    
    // Wait for navigation
    await page.waitForTimeout(1000);
    
    // Take screenshot of chair rental page
    await page.screenshot({ path: 'test-results/chair-rental-arrived.png', fullPage: false });
    console.log('7. Screenshot of Chair Rental page saved');
    
    // Get the current URL
    const currentUrl = page.url();
    console.log('8. Current URL:', currentUrl);
    
    if (currentUrl.includes('chair-rental')) {
        console.log('\n✅ SUCCESS! Navigation to Chair Rental page works!');
    } else {
        console.log('\n❌ FAILED - Did not navigate to chair-rental page');
    }
    
    await browser.close();
})();
