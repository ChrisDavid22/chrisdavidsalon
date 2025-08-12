#!/bin/bash

# Directory Submission Automation Runner
# Chris David Salon - Automated Business Listing Submissions
# Created by Claude Code - 2025-08-11

echo "🚀 Chris David Salon - Directory Submission Automation"
echo "=============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "directory-submission-automation.js" ]; then
    echo "❌ Automation script not found. Please run from the tools directory."
    exit 1
fi

# Install dependencies if not present
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm run setup
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

# Create logs directory
mkdir -p logs
mkdir -p screenshots

echo "✅ Environment setup complete"
echo ""
echo "🎯 Starting directory submissions for:"
echo "   Business: Chris David Salon"
echo "   Address: 223 NE 2nd Ave, Delray Beach, FL 33444"
echo "   Phone: (561) 865-5215"
echo ""

# Run the automation
echo "🤖 Launching automation bot..."
node directory-submission-automation.js

# Check exit status
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Automation completed successfully!"
    echo "📊 Check the generated reports and screenshots"
    echo ""
    
    # List generated files
    echo "Generated files:"
    ls -la *.json *.html *.txt 2>/dev/null | head -10
    echo ""
    
    if [ -d "screenshots" ]; then
        screenshot_count=$(ls screenshots/ 2>/dev/null | wc -l)
        echo "📸 Screenshots captured: $screenshot_count"
    fi
    
else
    echo ""
    echo "❌ Automation encountered errors"
    echo "📋 Check the log files for details"
fi

echo ""
echo "🏁 Process complete!"
echo "=============================================="