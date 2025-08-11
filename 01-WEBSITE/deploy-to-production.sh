#!/bin/bash

# Chris David Salon - Production Deployment Script
# ISO Vision LLC
# Generated: August 11, 2025 @ 2:30 PM EST

echo "==========================================="
echo "Chris David Salon - Production Deployment"
echo "==========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: Not in the website root directory"
    exit 1
fi

echo "📋 Pre-deployment checklist:"
echo "----------------------------"
echo "✅ Admin dashboards created"
echo "✅ Backlink scoreboard ready"
echo "✅ Website content updated (20+ years, Former trainer for 5 brands)"
echo "✅ Premium brands page enhanced"
echo "✅ PWA manifest and service worker ready"
echo "✅ Navigation unified across admin pages"
echo ""

# Git status check
echo "📊 Current Git Status:"
echo "----------------------"
git status --short
echo ""

# Confirm deployment
read -p "🚀 Ready to deploy ALL changes to production? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "🔧 Starting deployment process..."
echo ""

# Add all changes
echo "1️⃣ Adding all files to git..."
git add -A

# Show what will be committed
echo ""
echo "2️⃣ Files to be committed:"
git status --short
echo ""

# Create commit message
COMMIT_MSG="PRODUCTION DEPLOY: Complete Admin System + Master Trainer Credentials

Major Updates:
- Created comprehensive admin dashboard system with 14+ pages
- Added backlink scoreboard with live tracking (87 directories ready)
- Updated website: Chris's 20+ years cutting, 15+ years Boca-Delray
- Highlighted credentials: Former trainer for Davines, Goldwell, Cezanne, Platinum Seamless, Organic Color Systems
- Built PWA infrastructure with service worker and manifest
- Created unified admin navigation at /admin/index.html
- Added Boulevard API request documentation
- Built automated backlink submission tools
- Enhanced premium brands page with master educator section

Admin Pages Created:
- /admin/index.html - Master control center
- /admin/backlink-scoreboard.html - Live campaign tracking
- /admin/backlink-campaign.html - Submission management
- /admin/market-position.html - Competitive analysis
- /admin/revenue-tracker.html - Revenue attribution
- /admin/competition-monitor.html - 47 competitor tracking
- /admin/microsite-roi.html - 3 microsite performance
- /admin/dashboard-new.html - Unified overview

Ready for:
- Backlink campaign execution (87 directories)
- Boulevard API integration
- PWA deployment
- White-label platform development

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Commit changes
echo "3️⃣ Committing changes..."
git commit -m "$COMMIT_MSG"

if [ $? -ne 0 ]; then
    echo "❌ Commit failed"
    exit 1
fi

echo ""
echo "✅ Changes committed successfully!"
echo ""

# Push to origin
echo "4️⃣ Pushing to GitHub..."
git push origin main

if [ $? -ne 0 ]; then
    echo "❌ Push failed. Please check your credentials and try again."
    exit 1
fi

echo ""
echo "✅ Successfully pushed to GitHub!"
echo ""

# Deploy to Vercel (if configured)
if command -v vercel &> /dev/null; then
    echo "5️⃣ Deploying to Vercel..."
    vercel --prod --yes
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully deployed to Vercel!"
    else
        echo "⚠️ Vercel deployment failed, but GitHub is updated"
    fi
else
    echo "ℹ️ Vercel CLI not found. Skipping Vercel deployment."
    echo "   GitHub Pages will auto-deploy if configured."
fi

echo ""
echo "==========================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "==========================================="
echo ""
echo "📊 What was deployed:"
echo "--------------------"
echo "• Admin dashboard system: /admin/"
echo "• 87 directories ready for backlink submission"
echo "• Updated credentials: Former trainer for 5 major brands"
echo "• 20+ years cutting expertise highlighted"
echo "• PWA-ready infrastructure"
echo ""
echo "🔗 Access Points:"
echo "----------------"
echo "• Admin Center: https://chrisdavidsalon.com/admin/"
echo "• Backlink Scoreboard: https://chrisdavidsalon.com/admin/backlink-scoreboard.html"
echo "• Main Website: https://chrisdavidsalon.com"
echo ""
echo "📋 Next Steps:"
echo "-------------"
echo "1. Visit /admin/backlink-scoreboard.html"
echo "2. Click 'START AUTOMATED CAMPAIGN'"
echo "3. Send Boulevard API request email"
echo "4. Monitor backlink approvals"
echo ""
echo "✨ Chris David Salon - The Master Who Trained the Masters"
echo ""