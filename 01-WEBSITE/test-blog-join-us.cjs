const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Load blog page
    await page.goto('file://' + process.cwd() + '/blog.html');
    console.log('1. Loaded blog page');
    
    // Click the Join Us button
    await page.click('button:has-text("Join Us")');
    console.log('2. Clicked Join Us button');
    
    // Wait for dropdown to appear
    await page.waitForTimeout(500);
    
    // Take screenshot showing dropdown open
    await page.screenshot({ path: 'test-results/blog-join-us-dropdown.png', fullPage: false });
    console.log('3. Screenshot saved');
    
    // Check if Chair Rental link is visible
    const chairRentalLink = await page.locator('a:has-text("Chair Rental")').first();
    const isVisible = await chairRentalLink.isVisible();
    console.log('4. Chair Rental link visible:', isVisible);
    
    // Click Chair Rental
    await chairRentalLink.click();
    console.log('5. Clicked Chair Rental link');
    
    // Wait for navigation
    await page.waitForTimeout(1000);
    
    // Get the current URL
    const currentUrl = page.url();
    console.log('6. Current URL:', currentUrl);
    
    if (currentUrl.includes('chair-rental')) {
        console.log('\n✅ SUCCESS! Blog page dropdown works!');
    } else {
        console.log('\n❌ FAILED');
    }
    
    await browser.close();
})();
