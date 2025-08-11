#!/bin/bash

# Pre-deployment Testing Script for Chris David Salon
# This script MUST pass before any deployment to production

set -e  # Exit on any error

echo ""
echo "🚀 PRE-DEPLOYMENT TESTING SUITE"
echo "================================"
echo "Testing production website before deployment..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if node and npm are installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "tests/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing test dependencies...${NC}"
    cd tests
    npm install
    cd ..
fi

# Set test URL based on argument
if [ "$1" == "--local" ]; then
    export TEST_URL="file://$(pwd)/index.html"
    echo -e "${YELLOW}Testing local file: $TEST_URL${NC}"
else
    export TEST_URL="https://www.chrisdavidsalon.com"
    echo -e "${YELLOW}Testing live site: $TEST_URL${NC}"
fi

echo ""

# Track overall test status
ALL_PASSED=true

# Run link tests
echo "🔗 TESTING ALL LINKS"
echo "--------------------"
if node tests/test-links.js; then
    echo -e "${GREEN}✅ Link tests passed${NC}"
else
    echo -e "${RED}❌ Link tests failed${NC}"
    ALL_PASSED=false
fi

echo ""

# Run desktop tests
echo "💻 TESTING DESKTOP VIEW"
echo "-----------------------"
if node tests/run-tests.js --desktop; then
    echo -e "${GREEN}✅ Desktop tests passed${NC}"
else
    echo -e "${RED}❌ Desktop tests failed${NC}"
    ALL_PASSED=false
fi

echo ""

# Run mobile tests (70% of traffic - CRITICAL)
echo "📱 TESTING MOBILE VIEW (70% of traffic)"
echo "---------------------------------------"
if node tests/run-tests.js --mobile; then
    echo -e "${GREEN}✅ Mobile tests passed${NC}"
else
    echo -e "${RED}❌ CRITICAL: Mobile tests failed (70% of users!)${NC}"
    ALL_PASSED=false
fi

echo ""

# Run visual regression tests
echo "📸 VISUAL REGRESSION TESTING"
echo "----------------------------"
if node tests/visual-regression.js; then
    echo -e "${GREEN}✅ Visual tests passed${NC}"
else
    echo -e "${RED}❌ Visual tests failed${NC}"
    ALL_PASSED=false
fi

echo ""
echo "================================"

# Final verdict
if [ "$ALL_PASSED" = true ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
    echo -e "${GREEN}Website is ready for deployment.${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}❌ TESTS FAILED!${NC}"
    echo -e "${RED}DO NOT DEPLOY - Fix issues first!${NC}"
    echo ""
    echo "Common issues to check:"
    echo "  1. Broken links - Check that all pages exist"
    echo "  2. Mobile layout - 70% of users are on mobile!"
    echo "  3. Images not loading - Check image paths"
    echo "  4. Gallery not working - Check JavaScript errors"
    echo ""
    exit 1
fi