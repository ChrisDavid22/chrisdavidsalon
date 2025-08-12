#!/bin/bash

# AUTOMATED DIRECTORY SUBMISSION EXECUTOR
# This script runs the complete directory submission automation

echo "🤖 CHRIS DAVID SALON - AUTOMATED DIRECTORY SUBMISSION"
echo "===================================================="
echo ""
echo "🏢 Business: Chris David Salon"
echo "📍 Location: 223 NE 2nd Ave, Delray Beach, FL 33444"
echo "📞 Phone: (561) 865-5215"
echo "🌐 Website: https://chrisdavidsalon.com"
echo ""

# Check if playwright is installed
if ! command -v npx &> /dev/null; then
    echo "❌ Node.js/NPX not found. Please install Node.js first."
    exit 1
fi

# Install playwright if not available
echo "🔧 Checking Playwright installation..."
if ! npx playwright --version &> /dev/null; then
    echo "📦 Installing Playwright..."
    npx playwright@latest install chromium
fi

# Make sure we're in the right directory
cd "$(dirname "$0")"

echo "🚀 Starting automated directory submissions..."
echo "📋 Target: 12 directories"
echo "⏱️  Estimated time: 30-45 minutes"
echo ""
echo "⚠️  IMPORTANT: Please keep your browser window visible"
echo "   The automation may need manual assistance for:"
echo "   • Gmail login (if not already logged in)"
echo "   • Complex CAPTCHAs"
echo "   • Two-factor authentication"
echo ""

read -p "Press Enter to begin automation..."

# Try to run with node directly
if command -v node &> /dev/null; then
    echo "▶️  Starting automation engine..."
    node run-full-automation.js
else
    echo "❌ Node.js not found. Installing via npx..."
    npx node run-full-automation.js
fi

echo ""
echo "🎉 Automation completed!"
echo "📊 Check the reports/ directory for detailed results"
echo "📧 Remember to check sikerr@gmail.com for verification emails"