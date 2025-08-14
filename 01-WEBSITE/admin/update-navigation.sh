#!/bin/bash

# Update all admin pages with consistent navigation including "Back to Main Site" button

PAGES=(
    "index.html"
    "analytics.html"
    "performance-tracker.html"
    "seo-dashboard.html"
    "keyword-rankings.html"
    "competitor-analysis.html"
    "microsites.html"
    "reviews-reputation.html"
    "market-intelligence.html"
)

for page in "${PAGES[@]}"; do
    echo "Updating $page..."
    
    # Create backup
    cp "$page" "$page.backup"
    
    # Replace the navigation section
    sed -i '' '/<nav class="bg-gradient-to-r from-purple-900 to-indigo-900/,/<\/nav>/c\
    <!-- Standard Admin Navigation v3.0.1 with Main Site Link -->\
    <nav class="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-4 shadow-lg">\
        <div class="max-w-7xl mx-auto">\
            <div class="flex justify-between items-center mb-4">\
                <div>\
                    <h1 class="text-2xl font-bold">Chris David Salon Admin v3.0</h1>\
                    <p class="text-sm text-purple-200">Business Intelligence Dashboard</p>\
                </div>\
                <div class="text-right">\
                    <a href="../index.html" class="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-sm font-semibold mb-2 inline-block">\
                        ← Back to Main Site\
                    </a>\
                    <p class="text-xs text-green-400">🟢 All Systems Operational</p>\
                    <p class="text-xs text-purple-200" id="currentTime"></p>\
                </div>\
            </div>\
            \
            <!-- Clean Navigation - 9 Pages Only -->\
            <div class="flex flex-wrap gap-2 text-sm">\
                <a href="index.html" class="bg-purple-800 hover:bg-purple-700 px-3 py-1 rounded">📊 Dashboard</a>\
                <span class="text-purple-400">|</span>\
                <a href="analytics.html" class="bg-purple-800 hover:bg-purple-700 px-3 py-1 rounded">📈 Analytics</a>\
                <a href="performance-tracker.html" class="bg-purple-800 hover:bg-purple-700 px-3 py-1 rounded">📉 Performance</a>\
                <span class="text-purple-400">|</span>\
                <a href="seo-dashboard.html" class="bg-purple-800 hover:bg-purple-700 px-3 py-1 rounded">🔍 SEO</a>\
                <a href="keyword-rankings.html" class="bg-purple-800 hover:bg-purple-700 px-3 py-1 rounded">🎯 Keywords</a>\
                <a href="competitor-analysis.html" class="bg-purple-800 hover:bg-purple-700 px-3 py-1 rounded">🏆 Competitors</a>\
                <span class="text-purple-400">|</span>\
                <a href="microsites.html" class="bg-purple-800 hover:bg-purple-700 px-3 py-1 rounded">🌐 Microsites</a>\
                <a href="reviews-reputation.html" class="bg-purple-800 hover:bg-purple-700 px-3 py-1 rounded">⭐ Reviews</a>\
                <a href="market-intelligence.html" class="bg-purple-800 hover:bg-purple-700 px-3 py-1 rounded">🎖️ Market Intel</a>\
            </div>\
        </div>\
    </nav>' "$page"
    
    echo "✓ Updated $page"
done

echo "✅ All pages updated with consistent navigation and 'Back to Main Site' button"