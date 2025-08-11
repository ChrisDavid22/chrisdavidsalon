#!/bin/bash

# Auto-increment version and deploy script for Chris David Salon

echo "🚀 Starting deployment process..."

# Navigate to project directory
cd "/Users/stuartkerr/Library/CloudStorage/OneDrive-Personal/ISO Vision LLC/Chris David Salon/New web site July 25/01-WEBSITE"

# Run pre-deployment tests (skip with --skip-tests flag)
if [ "$2" != "--skip-tests" ]; then
    echo ""
    echo "🧪 Running pre-deployment tests..."
    echo "=================================="
    
    if [ -f "tests/pre-deploy-check.sh" ]; then
        if bash tests/pre-deploy-check.sh --local; then
            echo "✅ All tests passed - proceeding with deployment"
            echo ""
        else
            echo "❌ Tests failed - deployment cancelled!"
            echo "Fix the issues above and try again."
            echo "To skip tests (NOT RECOMMENDED), use: ./deploy.sh 'message' --skip-tests"
            exit 1
        fi
    else
        echo "⚠️  Test suite not found - proceeding without tests"
        echo "Run 'npm install' in the tests directory to enable testing"
        echo ""
    fi
fi

# Read current version
if [ -f "data/version.json" ]; then
    CURRENT_VERSION=$(grep -o '"version": "[^"]*' data/version.json | grep -o '[^"]*$')
else
    CURRENT_VERSION="2.5.0"
fi

# Parse version numbers
IFS='.' read -r -a version_parts <<< "$CURRENT_VERSION"
MAJOR="${version_parts[0]}"
MINOR="${version_parts[1]}"
PATCH="${version_parts[2]}"

# Increment patch version
PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$PATCH"

# Get current date/time
CURRENT_DATETIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "📊 Current version: $CURRENT_VERSION"
echo "✨ New version: $NEW_VERSION"
echo "🕐 Timestamp: $CURRENT_DATETIME"

# Update version.json
cat > data/version.json << EOF
{
  "version": "$NEW_VERSION",
  "lastUpdated": "$CURRENT_DATETIME",
  "deployHistory": [
    {
      "version": "$NEW_VERSION",
      "date": "$CURRENT_DATETIME",
      "changes": "$1"
    },
EOF

# Append previous history (keeping last 10 entries)
if [ -f "data/version.json.backup" ]; then
    tail -n +5 data/version.json.backup | head -n 40 >> data/version.json
fi

# Close the JSON
echo "  ]" >> data/version.json
echo "}" >> data/version.json

# Backup current version file
cp data/version.json data/version.json.backup

# Git operations
echo "📝 Committing changes..."
git add -A

if [ -z "$1" ]; then
    COMMIT_MSG="Version $NEW_VERSION: Auto-deployment update"
else
    COMMIT_MSG="Version $NEW_VERSION: $1"
fi

git commit -m "$COMMIT_MSG"

echo "📤 Pushing to GitHub..."
git push origin main

echo "✅ Deployment complete!"
echo "🌐 Version $NEW_VERSION will be live at chrisdavidsalon.com in ~60 seconds"
echo "📅 Updated at: $CURRENT_DATETIME"