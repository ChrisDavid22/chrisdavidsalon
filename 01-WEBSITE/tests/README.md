# Chris David Salon - Automated Testing Suite

## 🎯 Purpose

This testing suite ensures that the Chris David Salon website is **ALWAYS** working correctly before deployment. It tests:
- All links work
- Mobile view (70% of traffic!)  
- Desktop view
- Gallery functionality
- Visual appearance
- No text overlapping
- All images load

## 🚀 Quick Start

### Install Test Dependencies
```bash
cd tests
npm install
```

### Run All Tests
```bash
npm test
```

### Run Specific Tests
```bash
npm run test:desktop    # Desktop view only
npm run test:mobile     # Mobile view only (70% of traffic!)
npm run test:links      # Check all links
npm run test:visual     # Visual regression tests
```

## 📋 What Gets Tested

### 1. Link Testing (`test-links.js`)
- ✅ All internal page links (careers.html, blog.html, etc.)
- ✅ All anchor links (#about, #contact, etc.)
- ✅ Phone number links are correct (561-299-0950)
- ✅ External links are valid
- ✅ All required pages exist

### 2. Desktop Testing (`run-tests.js --desktop`)
- ✅ Page loads successfully
- ✅ Navigation menu works
- ✅ Gallery carousel functions
- ✅ All images load
- ✅ Footer links work

### 3. Mobile Testing (`run-tests.js --mobile`) **CRITICAL - 70% of traffic!**
- ✅ Mobile menu opens/closes
- ✅ No text overlapping
- ✅ Gallery works with touch/swipe
- ✅ Mobile phone button visible
- ✅ Images are responsive
- ✅ No horizontal scrolling

### 4. Visual Testing (`visual-regression.js`)
- 📸 Desktop screenshots
- 📸 Mobile screenshots (iPhone 12 Pro)
- 📸 Tablet screenshots (iPad)
- 📸 Gallery interaction
- 📸 Mobile menu
- ⚠️ Detects layout issues

## 🔧 Deployment Integration

The deploy script (`../deploy.sh`) automatically runs tests before deployment:

```bash
./deploy.sh "Your commit message"  # Runs tests first
./deploy.sh "Your commit message" --skip-tests  # Skip tests (NOT RECOMMENDED!)
```

**If tests fail, deployment is BLOCKED!**

## 📊 Understanding Test Results

### ✅ Success
```
✅ ALL TESTS PASSED!
Website is ready for deployment.
```

### ❌ Failure
```
❌ TESTS FAILED!
DO NOT DEPLOY - Fix issues first!
```

Common failures:
1. **Broken Links** - A page doesn't exist or anchor is missing
2. **Mobile Issues** - Text overlapping or layout problems (70% of users!)
3. **Gallery Not Working** - JavaScript errors in carousel
4. **Images Not Loading** - Wrong paths or missing files

## 🏗️ Test Structure

```
tests/
├── package.json          # Dependencies
├── run-tests.js         # Main test runner
├── test-links.js        # Link checker
├── visual-regression.js # Visual testing
├── pre-deploy-check.sh  # Pre-deployment script
├── README.md            # This file
└── screenshots/         # Visual test results
    └── [timestamp]/     # Each test run
        ├── desktop-*.png
        ├── mobile-*.png
        └── tablet-*.png
```

## 🚨 CRITICAL NOTES

1. **70% of traffic is MOBILE** - Mobile tests are CRITICAL!
2. **Never skip tests for production** - Use `--skip-tests` only for emergencies
3. **Visual tests create screenshots** - Review them manually for quality
4. **Tests run on live site by default** - Use `--local` to test local files

## 🐛 Troubleshooting

### Tests won't run
```bash
cd tests
npm install  # Install dependencies
```

### Tests fail on CI/CD
Make sure Puppeteer dependencies are installed:
```bash
apt-get update
apt-get install -y chromium-browser
```

### Gallery tests fail
Check that JavaScript is enabled and gallery functions are defined.

### Mobile tests fail
Most common issue - check for:
- Elements wider than viewport
- Text too small (<12px)
- Horizontal scrolling

## 📝 Adding New Tests

To add new tests, edit the appropriate file:
- `run-tests.js` - Add to `runDesktopTests()` or `runMobileTests()`
- `test-links.js` - Add to `requiredPages` array
- `visual-regression.js` - Add to `sections` array

## 🆘 Support

If tests consistently fail but the site looks fine:
1. Check if you're testing the right URL
2. Clear browser cache
3. Check for JavaScript errors in console
4. Review screenshot outputs in `screenshots/` folder

**Remember: If tests fail, DO NOT DEPLOY!**