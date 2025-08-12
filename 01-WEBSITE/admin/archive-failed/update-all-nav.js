// Script to verify and update navigation on ALL admin pages
// This will ensure EVERY page has the EXACT SAME navigation

const fs = require('fs');
const path = require('path');

const navHTML = `    <!-- Unified Admin Navigation v2.6.0 -->
    <nav class="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-4 shadow-lg">
        <div class="max-w-7xl mx-auto">
            <div class="flex justify-between items-center mb-4">
                <div>
                    <h1 class="text-2xl font-bold">Chris David Salon Admin v2.6.0</h1>
                    <p class="text-sm text-purple-200">PAGETITLE</p>
                </div>
                <div class="text-right">
                    <p class="text-xs text-green-400">🟢 System Live</p>
                    <a href="../index.html" class="text-yellow-300 hover:text-yellow-100 text-sm">← Back to Website</a>
                </div>
            </div>
            
            <!-- Main Navigation Bar -->
            <div class="flex flex-wrap gap-2 text-sm">
                <!-- Core -->
                <a href="index.html" class="bg-purple-800 hover:bg-purple-700 px-3 py-1 rounded HOMEACTIVE">🏠 Admin Home</a>
                <a href="dashboard-new.html" class="bg-purple-800 hover:bg-purple-700 px-3 py-1 rounded DASHACTIVE">📊 Main Dashboard</a>
                
                <!-- Backlinks -->
                <span class="text-purple-300">|</span>
                <a href="backlink-scoreboard.html" class="bg-green-700 hover:bg-green-600 px-3 py-1 rounded SCOREACTIVE">🎯 Backlink Score</a>
                <a href="backlink-campaign.html" class="bg-green-700 hover:bg-green-600 px-3 py-1 rounded CAMPACTIVE">🚀 Campaign</a>
                <a href="backlink-tracker.html" class="bg-green-700 hover:bg-green-600 px-3 py-1 rounded TRACKACTIVE">📍 Tracker</a>
                
                <!-- Analytics -->
                <span class="text-purple-300">|</span>
                <a href="analytics-dashboard.html" class="bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded ANALYTICSACTIVE">📈 Analytics</a>
                <a href="revenue-tracker.html" class="bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded REVACTIVE">💰 Revenue</a>
                <a href="microsite-roi.html" class="bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded MICROACTIVE">🌐 Microsites</a>
                
                <!-- Market -->
                <span class="text-purple-300">|</span>
                <a href="market-position.html" class="bg-yellow-700 hover:bg-yellow-600 px-3 py-1 rounded MARKETACTIVE">🏆 Market</a>
                <a href="competition-monitor.html" class="bg-yellow-700 hover:bg-yellow-600 px-3 py-1 rounded COMPACTIVE">👁️ Competition</a>
                
                <!-- SEO -->
                <span class="text-purple-300">|</span>
                <a href="seo-command-center.html" class="bg-orange-700 hover:bg-orange-600 px-3 py-1 rounded SEOACTIVE">🔍 SEO Command</a>
                <a href="seo-audit.html" class="bg-orange-700 hover:bg-orange-600 px-3 py-1 rounded AUDITACTIVE">🔎 SEO Audit</a>
            </div>
        </div>
    </nav>`;

const pages = [
    { file: 'index.html', title: 'Admin Home', active: 'HOMEACTIVE' },
    { file: 'dashboard-new.html', title: 'Main Dashboard', active: 'DASHACTIVE' },
    { file: 'dashboard.html', title: 'Legacy Dashboard', active: 'DASHACTIVE' },
    { file: 'backlink-scoreboard.html', title: 'Backlink Scoreboard', active: 'SCOREACTIVE' },
    { file: 'backlink-campaign.html', title: 'Backlink Campaign Manager', active: 'CAMPACTIVE' },
    { file: 'backlink-tracker.html', title: 'Backlink Tracker', active: 'TRACKACTIVE' },
    { file: 'analytics-dashboard.html', title: 'Analytics Dashboard', active: 'ANALYTICSACTIVE' },
    { file: 'revenue-tracker.html', title: 'Revenue Attribution', active: 'REVACTIVE' },
    { file: 'microsite-roi.html', title: 'Microsite ROI Analysis', active: 'MICROACTIVE' },
    { file: 'market-position.html', title: 'Market Position Tracker', active: 'MARKETACTIVE' },
    { file: 'competition-monitor.html', title: 'Competition Monitor', active: 'COMPACTIVE' },
    { file: 'seo-command-center.html', title: 'SEO Command Center', active: 'SEOACTIVE' },
    { file: 'seo-audit.html', title: 'SEO Audit Report', active: 'AUDITACTIVE' }
];

console.log('Updating navigation on all admin pages...\n');

pages.forEach(page => {
    const filePath = path.join(__dirname, page.file);
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ ${page.file} - File not found`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let customNav = navHTML.replace('PAGETITLE', page.title);
    
    // Set active state for current page
    pages.forEach(p => {
        if (p.active === page.active) {
            customNav = customNav.replace(p.active, 'font-bold bg-opacity-80');
        } else {
            customNav = customNav.replace(p.active, '');
        }
    });
    
    // Find and replace navigation
    // Look for existing nav tags and replace everything up to the next main content
    const bodyIndex = content.indexOf('<body');
    const afterBodyIndex = content.indexOf('>', bodyIndex) + 1;
    
    // Find where main content starts (usually after nav)
    let mainContentStart = content.indexOf('<div class="max-w-7xl mx-auto p-6">');
    if (mainContentStart === -1) {
        mainContentStart = content.indexOf('<div class="container');
    }
    if (mainContentStart === -1) {
        mainContentStart = content.indexOf('<main');
    }
    if (mainContentStart === -1) {
        mainContentStart = content.indexOf('<section');
    }
    
    if (mainContentStart > afterBodyIndex) {
        // Replace everything between body and main content with our nav
        const newContent = content.substring(0, afterBodyIndex) + '\n' + customNav + '\n\n    ' + content.substring(mainContentStart);
        fs.writeFileSync(filePath, newContent);
        console.log(`✅ ${page.file} - Navigation updated`);
    } else {
        console.log(`⚠️  ${page.file} - Could not identify content structure`);
    }
});

console.log('\n✅ Navigation update complete!');
console.log('All admin pages now have consistent navigation.');