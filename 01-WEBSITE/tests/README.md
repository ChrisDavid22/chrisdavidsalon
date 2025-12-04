# E2E Test Suite - Quick Start Guide

## Overview

Comprehensive Playwright testing suite for Chris David Salon SEO system.

**Total Tests**: 100+ assertions across 3 test files
**Test Duration**: 20-30 minutes (all tests)
**Framework**: Playwright v1.57.0

---

## Quick Run Commands

### Run All Tests
```bash
cd 01-WEBSITE
npx playwright test --config=playwright.config.cjs
```

### Run Individual Test Suites

**API Health Check** (5-10 min):
```bash
npx playwright test tests/api-health.spec.cjs --config=playwright.config.cjs
```

**E2E Full Suite** (10-15 min):
```bash
npx playwright test tests/e2e-full-suite.spec.cjs --config=playwright.config.cjs
```

**Flywheel Integration** (5-8 min):
```bash
npx playwright test tests/flywheel-integration.spec.cjs --config=playwright.config.cjs
```

### Run Specific Test

```bash
npx playwright test -g "Dashboard loads" --config=playwright.config.cjs
```

### UI Mode (Interactive)

```bash
npx playwright test --ui --config=playwright.config.cjs
```

---

## Test Files

### 1. api-health.spec.cjs
Tests all 12 Vercel serverless APIs:
- admin-data
- authority-score
- autonomous-seo-agent
- competitors
- ga4-analytics (5 types)
- gbp-agent
- microsite-analytics
- pagespeed
- proactive-seo-agent
- seo-analysis-engine
- seo-learning
- weekly-seo-report

### 2. e2e-full-suite.spec.cjs
Tests all 10 admin pages:
- Dashboard (index.html)
- Traffic (traffic.html)
- Rankings (rankings.html)
- Authority (authority.html)
- Microsites (microsites.html)
- Weekly Brain (weekly-brain.html)
- Improvement Planner (improvement-planner.html)
- Progress Report (progress-report.html)
- SEO Learning (seo-learning.html)
- Changes Log (changes-log.html)

Plus:
- Navigation testing
- Data loading & caching
- Error handling
- Mobile/tablet responsiveness
- Performance benchmarks

### 3. flywheel-integration.spec.cjs
Tests automated SEO flywheel:
- Phase 1: INGEST (data collection)
- Phase 2: ANALYZE (processing)
- Phase 3: DECIDE (task generation)
- Phase 4: EXECUTE (implementation)
- Phase 5: MEASURE (tracking)
- Phase 6: LEARN (knowledge graph)

Plus:
- Full cycle simulation
- Data persistence
- Weekly reports
- Multi-site coordination

---

## Expected Results

**All Tests Passing**: 100+ assertions
**Screenshots**: Saved to `test-results/`
**Logs**: Detailed console output

**Pass Rate**:
- API Health: 100%
- E2E Suite: 95%+ (some data waits)
- Flywheel: 100% (status checks)

---

## Troubleshooting

### Tests Timeout
Increase timeout for specific test:
```javascript
test.setTimeout(180000); // 3 minutes
```

### API Returns Errors
1. Check Vercel environment variables
2. Verify `.env.local` has all keys
3. Test API directly:
```bash
curl https://chrisdavidsalon.com/api/admin-data
```

### Screenshots Missing
```bash
mkdir -p test-results
```

### Data Shows "--"
Wait longer or check API credentials in Vercel.

---

## Documentation

- **Full Documentation**: `TEST-DOCUMENTATION.md`
- **Project Context**: `/CLAUDE.md`
- **API Docs**: `/01-WEBSITE/CLAUDE.md`

---

## CI/CD Integration

Add to `.github/workflows/test.yml`:

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd 01-WEBSITE && npm install
      - run: npx playwright install --with-deps chromium
      - run: cd 01-WEBSITE && npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: 01-WEBSITE/test-results/
```

---

**Last Updated**: November 28, 2024
**Version**: 1.0.0
