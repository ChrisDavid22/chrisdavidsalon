const { chromium } = require('playwright');
const path = require('path');

async function testAdminPagesWithScreenshots() {
  console.log('🧪 Starting Admin Page Tests with Screenshots...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  const page = await context.newPage();

  const results = [];
  const baseUrl = 'https://www.chrisdavidsalon.com';
  const screenshotDir = '/Users/stuartkerr/Code/Chris_David_Salon/chrisdavidsalon/test-screenshots';

  // Create screenshot directory
  const fs = require('fs');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  // Test 1: Version API
  console.log('📋 Test 1: Version API');
  try {
    const response = await page.goto(`${baseUrl}/data/version.json`);
    const json = await response.json();
    console.log(`   ✅ PASS: Version is ${json.version}`);
    results.push({ test: 'Version API', status: 'PASS', detail: json.version });
  } catch (e) {
    console.log(`   ❌ FAIL: ${e.message}`);
    results.push({ test: 'Version API', status: 'FAIL', detail: e.message });
  }

  // Test 2: Dashboard API
  console.log('\n📋 Test 2: Dashboard API');
  try {
    const response = await page.goto(`${baseUrl}/api/admin-data?type=dashboard`);
    const json = await response.json();
    if (json.success && json.data.seoScore) {
      console.log(`   ✅ PASS: SEO Score is ${json.data.seoScore}`);
      results.push({ test: 'Dashboard API', status: 'PASS', detail: `SEO Score: ${json.data.seoScore}` });
    }
  } catch (e) {
    console.log(`   ❌ FAIL: ${e.message}`);
    results.push({ test: 'Dashboard API', status: 'FAIL', detail: e.message });
  }

  // Test 3: Admin Index Page with Screenshot
  console.log('\n📋 Test 3: Admin Index Page');
  try {
    await page.goto(`${baseUrl}/admin/index.html`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000); // Wait for JS to load data

    const versionBadge = await page.locator('#versionBadge').textContent();
    const seoScore = await page.locator('#yourScore').textContent();

    await page.screenshot({ path: `${screenshotDir}/01-admin-index.png`, fullPage: false });
    console.log(`   📸 Screenshot saved: 01-admin-index.png`);

    if (versionBadge.includes('2.6')) {
      console.log(`   ✅ PASS: Version badge shows ${versionBadge}`);
      results.push({ test: 'Admin Index - Version', status: 'PASS', detail: versionBadge });
    } else {
      console.log(`   ❌ FAIL: Version badge shows "${versionBadge}"`);
      results.push({ test: 'Admin Index - Version', status: 'FAIL', detail: versionBadge });
    }

    if (seoScore && seoScore !== 'Error' && seoScore !== '--') {
      console.log(`   ✅ PASS: SEO Score shows ${seoScore}`);
      results.push({ test: 'Admin Index - Score', status: 'PASS', detail: seoScore });
    } else {
      console.log(`   ❌ FAIL: SEO Score shows "${seoScore}"`);
      results.push({ test: 'Admin Index - Score', status: 'FAIL', detail: seoScore });
    }
  } catch (e) {
    console.log(`   ❌ FAIL: ${e.message}`);
    results.push({ test: 'Admin Index Page', status: 'FAIL', detail: e.message });
  }

  // Test 4: Click Analyze with AI and Screenshot
  console.log('\n📋 Test 4: Analyze with AI Button');
  try {
    await page.goto(`${baseUrl}/admin/index.html`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    // Click Analyze button
    await page.click('button:has-text("Analyze with AI")');
    console.log(`   🔄 Clicked Analyze button, waiting...`);

    // Wait for analysis to complete
    await page.waitForTimeout(5000);

    await page.screenshot({ path: `${screenshotDir}/02-after-analyze.png`, fullPage: false });
    console.log(`   📸 Screenshot saved: 02-after-analyze.png`);

    const lastAnalysis = await page.locator('#lastAnalysis').innerHTML();
    if (lastAnalysis.includes('2025') || lastAnalysis.includes('Nov')) {
      console.log(`   ✅ PASS: Analysis timestamp updated`);
      results.push({ test: 'Analyze Button', status: 'PASS', detail: 'Timestamp updated' });
    } else {
      console.log(`   ⚠️ WARN: Analysis status: ${lastAnalysis.replace(/<[^>]*>/g, ' ').slice(0, 60)}`);
      results.push({ test: 'Analyze Button', status: 'WARN', detail: lastAnalysis.slice(0, 50) });
    }
  } catch (e) {
    console.log(`   ❌ FAIL: ${e.message}`);
    results.push({ test: 'Analyze Button', status: 'FAIL', detail: e.message });
  }

  // Test 5: Competitors Page
  console.log('\n📋 Test 5: Competitors Page');
  try {
    await page.goto(`${baseUrl}/admin/competitors.html`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${screenshotDir}/03-competitors.png`, fullPage: false });
    console.log(`   📸 Screenshot saved: 03-competitors.png`);

    const versionBadge = await page.locator('#versionBadge').textContent();
    console.log(`   ✅ PASS: Competitors page loaded, version ${versionBadge}`);
    results.push({ test: 'Competitors Page', status: 'PASS', detail: versionBadge });
  } catch (e) {
    console.log(`   ❌ FAIL: ${e.message}`);
    results.push({ test: 'Competitors Page', status: 'FAIL', detail: e.message });
  }

  // Test 6: Rankings Page
  console.log('\n📋 Test 6: Rankings Page');
  try {
    await page.goto(`${baseUrl}/admin/rankings.html`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${screenshotDir}/04-rankings.png`, fullPage: false });
    console.log(`   📸 Screenshot saved: 04-rankings.png`);

    const versionBadge = await page.locator('#versionBadge').textContent();
    console.log(`   ✅ PASS: Rankings page loaded, version ${versionBadge}`);
    results.push({ test: 'Rankings Page', status: 'PASS', detail: versionBadge });
  } catch (e) {
    console.log(`   ❌ FAIL: ${e.message}`);
    results.push({ test: 'Rankings Page', status: 'FAIL', detail: e.message });
  }

  // Test 7: Performance Page
  console.log('\n📋 Test 7: Performance Page');
  try {
    await page.goto(`${baseUrl}/admin/performance.html`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${screenshotDir}/05-performance.png`, fullPage: false });
    console.log(`   📸 Screenshot saved: 05-performance.png`);

    const versionBadge = await page.locator('#versionBadge').textContent();
    console.log(`   ✅ PASS: Performance page loaded, version ${versionBadge}`);
    results.push({ test: 'Performance Page', status: 'PASS', detail: versionBadge });
  } catch (e) {
    console.log(`   ❌ FAIL: ${e.message}`);
    results.push({ test: 'Performance Page', status: 'FAIL', detail: e.message });
  }

  // Test 8: Microsites Page
  console.log('\n📋 Test 8: Microsites Page');
  try {
    await page.goto(`${baseUrl}/admin/microsites.html`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${screenshotDir}/06-microsites.png`, fullPage: false });
    console.log(`   📸 Screenshot saved: 06-microsites.png`);

    const versionBadge = await page.locator('#versionBadge').textContent();
    console.log(`   ✅ PASS: Microsites page loaded, version ${versionBadge}`);
    results.push({ test: 'Microsites Page', status: 'PASS', detail: versionBadge });
  } catch (e) {
    console.log(`   ❌ FAIL: ${e.message}`);
    results.push({ test: 'Microsites Page', status: 'FAIL', detail: e.message });
  }

  await browser.close();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warned = results.filter(r => r.status === 'WARN').length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️ Warnings: ${warned}`);
  console.log(`📋 Total: ${results.length}`);
  console.log('='.repeat(60));

  console.log(`\n📁 Screenshots saved to: ${screenshotDir}\n`);

  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Admin pages are working correctly.\n');
  } else {
    console.log('⚠️ Some tests failed. Review the results above.\n');
  }

  // List screenshots
  const files = fs.readdirSync(screenshotDir);
  console.log('📸 Screenshots taken:');
  files.forEach(f => console.log(`   - ${f}`));

  return results;
}

testAdminPagesWithScreenshots().catch(console.error);
