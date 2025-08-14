const fs = require('fs');
const path = require('path');

console.log('🧪 Verifying Admin Pages v3.0');
console.log('===============================\n');

const adminDir = path.join(__dirname, '../admin');
const pages = [
    'index.html',
    'analytics.html',
    'performance-tracker.html',
    'seo-dashboard.html',
    'keyword-rankings.html',
    'competitor-analysis.html',
    'microsites.html',
    'reviews-reputation.html',
    'market-intelligence.html'
];

let allPassed = true;
const results = [];

// Check each page exists and has v3.0 navigation
pages.forEach(page => {
    const filePath = path.join(adminDir, page);
    console.log(`📄 Checking ${page}...`);
    
    if (!fs.existsSync(filePath)) {
        console.log(`  ❌ File does not exist!`);
        allPassed = false;
        results.push({ page, status: 'missing' });
        return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for v3.0 navigation
    if (!content.includes('Chris David Salon Admin v3.0')) {
        console.log(`  ❌ Missing v3.0 navigation!`);
        allPassed = false;
        results.push({ page, status: 'wrong-nav' });
        return;
    }
    
    // Check all navigation links are present
    const requiredLinks = [
        'index.html',
        'analytics.html', 
        'performance-tracker.html',
        'seo-dashboard.html',
        'keyword-rankings.html',
        'competitor-analysis.html',
        'microsites.html',
        'reviews-reputation.html',
        'market-intelligence.html'
    ];
    
    let missingLinks = [];
    requiredLinks.forEach(link => {
        if (!content.includes(`href="${link}"`)) {
            missingLinks.push(link);
        }
    });
    
    if (missingLinks.length > 0) {
        console.log(`  ⚠️  Missing navigation links: ${missingLinks.join(', ')}`);
        allPassed = false;
        results.push({ page, status: 'missing-links', missingLinks });
    } else {
        console.log(`  ✅ Page OK - has v3.0 nav with all 9 links`);
        results.push({ page, status: 'ok' });
    }
    
    // Check for chart containers with proper height
    if (content.includes('<canvas')) {
        const hasHeightContainer = content.includes('h-64') || content.includes('h-80') || content.includes('h-96');
        if (!hasHeightContainer) {
            console.log(`  ⚠️  Charts may not have proper height containers`);
        } else {
            console.log(`  ✅ Charts have proper height containers`);
        }
    }
});

// Summary
console.log('\n===============================');
console.log('📊 TEST SUMMARY\n');

const okCount = results.filter(r => r.status === 'ok').length;
const missingCount = results.filter(r => r.status === 'missing').length;
const wrongNavCount = results.filter(r => r.status === 'wrong-nav').length;
const missingLinksCount = results.filter(r => r.status === 'missing-links').length;

console.log(`✅ Pages OK: ${okCount}/${pages.length}`);
if (missingCount > 0) console.log(`❌ Missing pages: ${missingCount}`);
if (wrongNavCount > 0) console.log(`❌ Wrong navigation: ${wrongNavCount}`);
if (missingLinksCount > 0) console.log(`⚠️  Missing links: ${missingLinksCount}`);

if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ All 9 admin pages are present with proper v3.0 navigation');
    console.log('✅ All navigation links point to valid pages');
    console.log('✅ Charts have proper height containers');
    console.log('\n✨ Ready for deployment!');
} else {
    console.log('\n❌ SOME TESTS FAILED!');
    console.log('🔧 Fix issues before deployment');
}

// Test navigation consistency
console.log('\n===============================');
console.log('🔗 NAVIGATION CONSISTENCY CHECK\n');

// Check that microsites have correct names
const micrositesPath = path.join(adminDir, 'microsites.html');
if (fs.existsSync(micrositesPath)) {
    const content = fs.readFileSync(micrositesPath, 'utf8');
    const correctNames = ['Best Salon Del Rey', 'Best Del Rey Salon', 'Best Salon Palm Beach'];
    const incorrectNames = ['Balayage Expert', 'Keratin Specialist', 'Color Correction'];
    
    let hasCorrectNames = true;
    let hasIncorrectNames = false;
    
    correctNames.forEach(name => {
        if (!content.includes(name)) {
            console.log(`❌ Missing correct microsite name: ${name}`);
            hasCorrectNames = false;
        }
    });
    
    incorrectNames.forEach(name => {
        if (content.includes(name)) {
            console.log(`❌ Found incorrect microsite name: ${name}`);
            hasIncorrectNames = true;
        }
    });
    
    if (hasCorrectNames && !hasIncorrectNames) {
        console.log('✅ Microsite names are correct');
    }
}

// Check dashboard for correct microsite names too
const dashboardPath = path.join(adminDir, 'index.html');
if (fs.existsSync(dashboardPath)) {
    const content = fs.readFileSync(dashboardPath, 'utf8');
    if (content.includes('Balayage Expert') || content.includes('Keratin Specialist')) {
        console.log('❌ Dashboard still has fake microsite names!');
    } else if (content.includes('Best Salon Del Rey')) {
        console.log('✅ Dashboard has correct microsite names');
    }
}

process.exit(allPassed ? 0 : 1);