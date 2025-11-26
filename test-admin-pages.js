const { chromium } = require('playwright');
const fs = require('fs');

async function testAllAdminPages() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const pages = [
    { name: 'dashboard', url: 'https://www.chrisdavidsalon.com/admin/dashboard.html' },
    { name: 'traffic', url: 'https://www.chrisdavidsalon.com/admin/traffic.html' },
    { name: 'competitors', url: 'https://www.chrisdavidsalon.com/admin/competitors.html' },
    { name: 'rankings', url: 'https://www.chrisdavidsalon.com/admin/rankings.html' },
    { name: 'authority', url: 'https://www.chrisdavidsalon.com/admin/authority.html' },
    { name: 'microsites', url: 'https://www.chrisdavidsalon.com/admin/microsites.html' },
    { name: 'agent-log', url: 'https://www.chrisdavidsalon.com/admin/agent-log.html' }
  ];

  const results = [];

  for (const p of pages) {
    console.log(`\n=== Testing ${p.name} ===`);
    try {
      await page.goto(p.url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(3000); // Wait for JS to execute
      
      // Check for console errors
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      
      // Take screenshot
      await page.screenshot({ path: `test-screenshots/${p.name}.png`, fullPage: true });
      console.log(`Screenshot saved: test-screenshots/${p.name}.png`);
      
      // Check page content
      const content = await page.content();
      const hasError = content.includes('Error') || content.includes('error') || content.includes('undefined');
      const hasLoading = content.includes('Loading...');
      
      results.push({
        page: p.name,
        url: p.url,
        status: 'loaded',
        hasError,
        hasLoading,
        screenshotPath: `test-screenshots/${p.name}.png`
      });
      
      console.log(`Status: Loaded, HasError: ${hasError}, StillLoading: ${hasLoading}`);
      
    } catch (e) {
      console.log(`FAILED: ${e.message}`);
      results.push({
        page: p.name,
        url: p.url,
        status: 'failed',
        error: e.message
      });
    }
  }

  await browser.close();
  
  console.log('\n\n=== SUMMARY ===');
  console.log(JSON.stringify(results, null, 2));
}

testAllAdminPages();
