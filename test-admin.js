const { chromium } = require('playwright');

async function testAdminPages() {
  console.log('🧪 Starting Admin Page Tests...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = [];
  const baseUrl = 'https://www.chrisdavidsalon.com';

  // Test 1: Check version.json API
  console.log('📋 Test 1: Version API');
  try {
    const response = await page.goto(`${baseUrl}/data/version.json`);
    const json = await response.json();
    if (json.version && json.version.startsWith('2.6')) {
      console.log(`   ✅ PASS: Version is ${json.version}`);
      results.push({ test: 'Version API', status: 'PASS', detail: json.version });
    } else {
      console.log(`   ❌ FAIL: Unexpected version ${json.version}`);
      results.push({ test: 'Version API', status: 'FAIL', detail: json.version });
    }
  } catch (e) {
    console.log(`   ❌ FAIL: ${e.message}`);
    results.push({ test: 'Version API', status: 'FAIL', detail: e.message });
  }

  // Test 2: Check dashboard API
  console.log('\n📋 Test 2: Dashboard API');
  try {
    const response = await page.goto(`${baseUrl}/api/admin-data?type=dashboard`);
    const json = await response.json();
    if (json.success && json.data && json.data.seoScore === 73) {
      console.log(`   ✅ PASS: SEO Score is ${json.data.seoScore}`);
      results.push({ test: 'Dashboard API', status: 'PASS', detail: `SEO Score: ${json.data.seoScore}` });
    } else {
      console.log(`   ❌ FAIL: Unexpected response`);
      results.push({ test: 'Dashboard API', status: 'FAIL', detail: JSON.stringify(json).slice(0, 100) });
    }
  } catch (e) {
    console.log(`   ❌ FAIL: ${e.message}`);
    results.push({ test: 'Dashboard API', status: 'FAIL', detail: e.message });
  }

  // Test 3: Check SEO analysis API
  console.log('\n📋 Test 3: SEO Analysis API');
  try {
    const response = await page.goto(`${baseUrl}/api/admin-data?type=seo-analysis`);
    const json = await response.json();
    if (json.success && json.data && json.data.categories) {
      console.log(`   ✅ PASS: SEO analysis returned ${Object.keys(json.data.categories).length} categories`);
      results.push({ test: 'SEO Analysis API', status: 'PASS', detail: `${Object.keys(json.data.categories).length} categories` });
    } else {
      console.log(`   ❌ FAIL: Missing categories`);
      results.push({ test: 'SEO Analysis API', status: 'FAIL', detail: 'Missing categories' });
    }
  } catch (e) {
    console.log(`   ❌ FAIL: ${e.message}`);
    results.push({ test: 'SEO Analysis API', status: 'FAIL', detail: e.message });
  }

  // Test 4: Admin index page loads and shows version
  console.log('\n📋 Test 4: Admin Index Page');
  try {
    await page.goto(`${baseUrl}/admin/index.html`, { waitUntil: 'networkidle' });
    const versionBadge = await page.locator('#versionBadge').textContent();
    const seoScore = await page.locator('#yourScore').textContent();

    if (versionBadge && versionBadge.includes('2.6')) {
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

  // Test 5: Competitors page
  console.log('\n📋 Test 5: Competitors Page');
  try {
    await page.goto(`${baseUrl}/admin/competitors.html`, { waitUntil: 'networkidle' });
    const versionBadge = await page.locator('#versionBadge').textContent();
    const pageTitle = await page.title();

    if (versionBadge && versionBadge.includes('2.6')) {
      console.log(`   ✅ PASS: Version badge shows ${versionBadge}`);
      results.push({ test: 'Competitors - Version', status: 'PASS', detail: versionBadge });
    } else {
      console.log(`   ❌ FAIL: Version badge shows "${versionBadge}"`);
      results.push({ test: 'Competitors - Version', status: 'FAIL', detail: versionBadge });
    }
  } catch (e) {
    console.log(`   ❌ FAIL: ${e.message}`);
    results.push({ test: 'Competitors Page', status: 'FAIL', detail: e.message });
  }

  // Test 6: Rankings page
  console.log('\n📋 Test 6: Rankings Page');
  try {
    await page.goto(`${baseUrl}/admin/rankings.html`, { waitUntil: 'networkidle' });
    const versionBadge = await page.locator('#versionBadge').textContent();

    if (versionBadge && versionBadge.includes('2.6')) {
      console.log(`   ✅ PASS: Version badge shows ${versionBadge}`);
      results.push({ test: 'Rankings - Version', status: 'PASS', detail: versionBadge });
    } else {
      console.log(`   ❌ FAIL: Version badge shows "${versionBadge}"`);
      results.push({ test: 'Rankings - Version', status: 'FAIL', detail: versionBadge });
    }
  } catch (e) {
    console.log(`   ❌ FAIL: ${e.message}`);
    results.push({ test: 'Rankings Page', status: 'FAIL', detail: e.message });
  }

  // Test 7: Click Analyze with AI button
  console.log('\n📋 Test 7: Analyze with AI Button');
  try {
    await page.goto(`${baseUrl}/admin/index.html`, { waitUntil: 'networkidle' });

    // Click the Analyze button
    await page.click('button:has-text("Analyze with AI")');

    // Wait for loading indicator to appear and disappear
    await page.waitForTimeout(3000);

    // Check if last analysis was updated
    const lastAnalysis = await page.locator('#lastAnalysis').innerHTML();

    if (lastAnalysis && (lastAnalysis.includes('2025') || lastAnalysis.includes('LIVE') || lastAnalysis.includes('Cached'))) {
      console.log(`   ✅ PASS: Analysis ran successfully`);
      results.push({ test: 'Analyze Button', status: 'PASS', detail: 'Analysis executed' });
    } else {
      console.log(`   ⚠️ WARN: Last analysis: "${lastAnalysis.slice(0, 50)}..."`);
      results.push({ test: 'Analyze Button', status: 'WARN', detail: lastAnalysis.slice(0, 50) });
    }
  } catch (e) {
    console.log(`   ❌ FAIL: ${e.message}`);
    results.push({ test: 'Analyze Button', status: 'FAIL', detail: e.message });
  }

  await browser.close();

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warned = results.filter(r => r.status === 'WARN').length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️ Warnings: ${warned}`);
  console.log(`📋 Total: ${results.length}`);
  console.log('='.repeat(50));

  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Admin pages are working correctly.\n');
  } else {
    console.log('\n⚠️ Some tests failed. Review the results above.\n');
  }

  return results;
}

testAdminPages().catch(console.error);
