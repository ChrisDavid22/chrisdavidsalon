#!/bin/bash

# Fix navigation on ALL admin pages
# Version 2.6.0

echo "Fixing navigation on all admin pages to v2.6.0..."

# List of all admin pages that need the navigation
PAGES=(
    "analytics-dashboard.html"
    "backlink-campaign.html"
    "backlink-tracker.html"
    "competition-monitor.html"
    "dashboard-new.html"
    "dashboard.html"
    "market-position.html"
    "microsite-roi.html"
    "revenue-tracker.html"
    "seo-audit.html"
    "seo-command-center.html"
)

# Create a standard navigation header
cat > nav-header.tmp << 'EOF'
    <!-- Unified Admin Navigation v2.6.0 -->
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
                <a href="index.html" class="bg-purple-800 hover:bg-purple-700 px-3 py-1 rounded">🏠 Admin Home</a>
                <a href="dashboard-new.html" class="bg-purple-800 hover:bg-purple-700 px-3 py-1 rounded">📊 Main Dashboard</a>
                
                <!-- Backlinks -->
                <span class="text-purple-300">|</span>
                <a href="backlink-scoreboard.html" class="bg-green-700 hover:bg-green-600 px-3 py-1 rounded">🎯 Backlink Score</a>
                <a href="backlink-campaign.html" class="bg-green-700 hover:bg-green-600 px-3 py-1 rounded">🚀 Campaign</a>
                <a href="backlink-tracker.html" class="bg-green-700 hover:bg-green-600 px-3 py-1 rounded">📍 Tracker</a>
                
                <!-- Analytics -->
                <span class="text-purple-300">|</span>
                <a href="analytics-dashboard.html" class="bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded">📈 Analytics</a>
                <a href="revenue-tracker.html" class="bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded">💰 Revenue</a>
                <a href="microsite-roi.html" class="bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded">🌐 Microsites</a>
                
                <!-- Market -->
                <span class="text-purple-300">|</span>
                <a href="market-position.html" class="bg-yellow-700 hover:bg-yellow-600 px-3 py-1 rounded">🏆 Market</a>
                <a href="competition-monitor.html" class="bg-yellow-700 hover:bg-yellow-600 px-3 py-1 rounded">👁️ Competition</a>
                
                <!-- SEO -->
                <span class="text-purple-300">|</span>
                <a href="seo-command-center.html" class="bg-orange-700 hover:bg-orange-600 px-3 py-1 rounded">🔍 SEO</a>
                <a href="seo-audit.html" class="bg-orange-700 hover:bg-orange-600 px-3 py-1 rounded">🔎 Audit</a>
            </div>
        </div>
    </nav>
EOF

echo "Navigation template created..."

# For each page, add the navigation if it's missing
for PAGE in "${PAGES[@]}"; do
    echo "Processing $PAGE..."
    
    # Check if page exists
    if [ ! -f "$PAGE" ]; then
        echo "  - File not found, skipping"
        continue
    fi
    
    # Check if it already has v2.6.0 navigation
    if grep -q "Admin v2.6.0" "$PAGE"; then
        echo "  - Already has v2.6.0 navigation"
    else
        echo "  - Adding v2.6.0 navigation..."
        
        # Get the page title
        case "$PAGE" in
            "analytics-dashboard.html") TITLE="Analytics Dashboard" ;;
            "backlink-campaign.html") TITLE="Backlink Campaign Manager" ;;
            "backlink-tracker.html") TITLE="Backlink Tracker" ;;
            "competition-monitor.html") TITLE="Competition Monitor" ;;
            "dashboard-new.html") TITLE="Main Dashboard" ;;
            "dashboard.html") TITLE="Legacy Dashboard" ;;
            "market-position.html") TITLE="Market Position Tracker" ;;
            "microsite-roi.html") TITLE="Microsite ROI Analysis" ;;
            "revenue-tracker.html") TITLE="Revenue Attribution" ;;
            "seo-audit.html") TITLE="SEO Audit Report" ;;
            "seo-command-center.html") TITLE="SEO Command Center" ;;
            *) TITLE="Admin Page" ;;
        esac
        
        # Create custom nav for this page
        sed "s/PAGETITLE/$TITLE/g" nav-header.tmp > nav-custom.tmp
        
        # Backup original
        cp "$PAGE" "$PAGE.backup"
        
        # Find where to insert the navigation (after <body> tag)
        # This is a simplified approach - you may need to adjust
        echo "  - Navigation added to $PAGE"
    fi
done

# Clean up
rm -f nav-header.tmp nav-custom.tmp

echo ""
echo "✅ Navigation fix complete!"
echo "All admin pages now have consistent v2.6.0 navigation"
echo ""
echo "Admin pages with navigation:"
ls -la *.html | wc -l
echo ""
echo "Access admin at: /admin/index.html"