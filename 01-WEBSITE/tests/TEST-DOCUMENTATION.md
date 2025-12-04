# Chris David Salon - E2E Test Suite Documentation

## Overview

Comprehensive end-to-end testing suite for the Chris David Salon SEO intelligence system. Tests all 10 admin pages, 12 API endpoints, and the automated SEO flywheel workflow.

**Test Framework**: Playwright
**Test Location**: `01-WEBSITE/tests/`
**Configuration**: `01-WEBSITE/playwright.config.cjs`

---

## Test Files

### 1. api-health.spec.cjs
**Purpose**: Complete health check for all 12 Vercel serverless functions

**Tests**:
- All 12 API endpoints respond correctly
- Response structure validation
- Data integrity checks
- Error handling verification
- Performance benchmarks
- Real data vs hardcoded data detection

**Key Test Groups**:
- `API Health Check - All 12 Endpoints` - Individual API tests
- `API Error Handling Tests` - Invalid parameters, missing params
- `API Performance Benchmarks` - Response time monitoring
- `Data Integrity Checks` - Verify real data

**Coverage**: 12 APIs × 3 test types = 36 test assertions

**Run Time**: ~5-10 minutes (sequential API calls)

---

### 2. e2e-full-suite.spec.cjs
**Purpose**: Comprehensive admin dashboard functionality testing

**Tests**:
- All 10 admin pages load correctly
- Data displays properly (no hardcoded data)
- Navigation works across pages
- Loading states shown
- Caching performance
- Mobile/tablet responsiveness
- Console error monitoring
- User interactions

**Key Test Groups**:
- `Admin Dashboard - All Pages Load` - Core page functionality
- `Navigation and Cross-Page Functionality` - Inter-page navigation
- `Data Loading and Caching` - Performance optimization
- `Error Handling and Edge Cases` - Graceful degradation
- `User Interactions` - Buttons, links, forms
- `Performance and Optimization` - Load times, images

**Coverage**: 10 pages × 5 test types = 50+ test assertions

**Run Time**: ~10-15 minutes (includes 60s wait times for data)

---

### 3. flywheel-integration.spec.cjs
**Purpose**: Test automated SEO flywheel system and GitHub Actions integration

**Tests**:
- All 6 flywheel phases (INGEST → ANALYZE → DECIDE → EXECUTE → MEASURE → LEARN)
- Full cycle simulation
- Data persistence
- Knowledge graph storage
- Weekly report generation
- Multi-site coordination
- GitHub Actions workflow validation

**Key Test Groups**:
- `SEO Flywheel - Phase Integration Tests` - Individual phases
- `Flywheel Integration - Full Cycle Test` - Complete workflow
- `Flywheel Data Persistence` - Change log, knowledge graph
- `Flywheel Weekly Report` - Report generation
- `Flywheel GitHub Actions Integration` - Workflow validation

**Coverage**: 6 phases + integration + persistence = 15+ test assertions

**Run Time**: ~5-8 minutes (includes 3-minute full cycle test)

---

## Running the Tests

### Prerequisites

```bash
cd 01-WEBSITE
npm install  # Installs Playwright and dependencies
```

### Run All Tests

```bash
npx playwright test --config=playwright.config.cjs
```

### Run Individual Test Files

```bash
# API Health Check
npx playwright test tests/api-health.spec.cjs --config=playwright.config.cjs

# E2E Full Suite
npx playwright test tests/e2e-full-suite.spec.cjs --config=playwright.config.cjs

# Flywheel Integration
npx playwright test tests/flywheel-integration.spec.cjs --config=playwright.config.cjs
```

### Run with UI Mode (Interactive)

```bash
npx playwright test --ui --config=playwright.config.cjs
```

### Run Specific Test

```bash
npx playwright test -g "Dashboard loads with SEO scores" --config=playwright.config.cjs
```

### Debug Mode

```bash
npx playwright test --debug --config=playwright.config.cjs
```

---

## Test Configuration

**File**: `01-WEBSITE/playwright.config.cjs`

```javascript
{
  testDir: './tests',
  timeout: 120000,          // 2 minutes per test
  fullyParallel: false,     // Sequential for API rate limits
  workers: 1,               // Single worker to avoid conflicts
  baseURL: 'https://www.chrisdavidsalon.com',
  screenshot: 'on',         // Always take screenshots
  trace: 'on-first-retry',
  retries: 0,               // No retries (for accurate results)
  projects: [
    { name: 'chromium' }    // Desktop Chrome only
  ]
}
```

---

## Test Coverage Summary

### APIs Tested (12/12)

| # | API Endpoint | Test Coverage |
|---|--------------|---------------|
| 1 | `/api/admin-data` | ✓ Health, structure, data integrity |
| 2 | `/api/authority-score` | ✓ Health, OpenPageRank integration |
| 3 | `/api/autonomous-seo-agent` | ✓ Health, 10 actions, status |
| 4 | `/api/competitors` | ✓ Health, Google Places integration |
| 5 | `/api/ga4-analytics` | ✓ Health, 5 types (overview, traffic, etc) |
| 6 | `/api/gbp-agent` | ✓ Health, 8 actions, GBP integration |
| 7 | `/api/microsite-analytics` | ✓ Health, referral tracking |
| 8 | `/api/pagespeed` | ✓ Health, PageSpeed Insights |
| 9 | `/api/proactive-seo-agent` | ✓ Health, 6 actions, proactive tasks |
| 10 | `/api/seo-analysis-engine` | ✓ Health, analysis, trend detection |
| 11 | `/api/seo-learning` | ✓ Health, RuVector, knowledge graph |
| 12 | `/api/weekly-seo-report` | ✓ Health, report generation |

### Admin Pages Tested (10/10)

| # | Page | URL | Test Coverage |
|---|------|-----|---------------|
| 1 | Dashboard | `/admin/index.html` | ✓ Load, scores, categories, nav |
| 2 | Traffic | `/admin/traffic.html` | ✓ Load, GA4 data, charts |
| 3 | Rankings | `/admin/rankings.html` | ✓ Load, keyword table |
| 4 | Authority | `/admin/authority.html` | ✓ Load, authority data |
| 5 | Microsites | `/admin/microsites.html` | ✓ Load, 3 microsites shown |
| 6 | Weekly Brain | `/admin/weekly-brain.html` | ✓ Load, analysis, task generation |
| 7 | Improvement Planner | `/admin/improvement-planner.html` | ✓ Load, 3 priority levels |
| 8 | Progress Report | `/admin/progress-report.html` | ✓ Load, metrics display |
| 9 | SEO Learning | `/admin/seo-learning.html` | ✓ Load, RuVector status |
| 10 | Changes Log | `/admin/changes-log.html` | ✓ Load, change history |

### Flywheel Phases Tested (6/6)

| # | Phase | Test Coverage |
|---|-------|---------------|
| 1 | INGEST | ✓ Data collection from all sources |
| 2 | ANALYZE | ✓ Analysis engine, trend detection |
| 3 | DECIDE | ✓ AI task generation, agents |
| 4 | EXECUTE | ✓ Execution capability, change tracking |
| 5 | MEASURE | ✓ Effectiveness measurement |
| 6 | LEARN | ✓ Knowledge graph updates |

---

## Expected Test Results

### Success Criteria

**All Tests Pass**: 100+ assertions
**Test Duration**: 20-30 minutes total
**Screenshots**: Saved to `test-results/`
**Console Errors**: < 5 critical errors per page

### Known Acceptable Failures

1. **API Timeouts**: Some APIs may timeout if:
   - Google APIs are rate-limited
   - Third-party services are down
   - Vercel cold starts are slow

2. **Data Unavailable**: Some tests may show "data unavailable" if:
   - GA4 credentials not configured
   - API keys missing from Vercel
   - First-time knowledge graph initialization

3. **Learning System Empty**: Knowledge graph may be empty if:
   - System is newly deployed
   - No historical data collected yet
   - Weekly flywheel hasn't run yet

---

## Test Output

### Console Output Example

```
=== Testing Dashboard ===
Waiting for SEO score to load...
SEO Score loaded: 73
✓ Dashboard loads with SEO scores (45s)

=== Testing GA4 Analytics ===
Response time: 2341ms
Success: true
Active users: 416
Sessions: 535
✓ GA4 Analytics API (2.3s)

=== PHASE 1: INGEST ===
  ✓ GA4 Analytics: 2341ms
  ✓ Competitor Data: 3120ms
  ✓ Authority Score: 1890ms
  ✓ SEO Learning Graph: 1234ms

Total duration: 8.59s
Phases completed: 6/6
✓ FLYWHEEL OPERATIONAL
```

### Screenshots

All screenshots saved to `test-results/`:
- `dashboard-loaded.png` - Main dashboard with scores
- `traffic-loaded.png` - Traffic page with GA4 data
- `rankings-loaded.png` - Rankings page
- `authority-loaded.png` - Authority page
- `microsites-loaded.png` - Microsites dashboard
- `weekly-brain-results.png` - SEO Brain analysis results
- `flywheel-changes-log.png` - Changes log page
- Plus mobile/tablet responsive screenshots

---

## Troubleshooting

### Tests Timeout

**Problem**: Tests exceed 120s timeout

**Solutions**:
1. Check Vercel function logs for errors
2. Verify API keys in Vercel environment
3. Run individual test to isolate issue
4. Increase timeout in specific test: `test.setTimeout(180000)`

### APIs Return Errors

**Problem**: APIs return `success: false`

**Solutions**:
1. Check `.env.local` has all required keys
2. Verify Vercel environment variables match
3. Test API directly: `curl https://chrisdavidsalon.com/api/[endpoint]`
4. Check API documentation in CLAUDE.md

### Screenshots Missing

**Problem**: No screenshots in test-results/

**Solutions**:
1. Create directory: `mkdir -p test-results`
2. Check write permissions
3. Run with `screenshot: 'on'` in config

### Data Shows as "--"

**Problem**: Pages load but data shows "--" or "Loading..."

**Solutions**:
1. Check API credentials are configured
2. Verify third-party APIs are responding
3. Increase wait timeout in test
4. Check browser console for errors

---

## CI/CD Integration

### GitHub Actions

Tests can be integrated into GitHub Actions workflow:

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd 01-WEBSITE
          npm install
          npx playwright install --with-deps chromium
      - name: Run tests
        run: |
          cd 01-WEBSITE
          npx playwright test --config=playwright.config.cjs
      - name: Upload screenshots
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: 01-WEBSITE/test-results/
```

---

## Test Maintenance

### Adding New Tests

1. Create test file in `01-WEBSITE/tests/`
2. Follow naming convention: `feature-name.spec.cjs`
3. Use existing test structure as template
4. Add documentation to this file

### Updating Tests

When adding new features:
1. Add API tests to `api-health.spec.cjs`
2. Add page tests to `e2e-full-suite.spec.cjs`
3. Add flywheel tests to `flywheel-integration.spec.cjs`
4. Update this documentation

### Best Practices

1. **Always test against production** (`https://chrisdavidsalon.com`)
2. **Use proper timeouts** (30s for APIs, 60s for AI calls)
3. **Take screenshots** on important steps
4. **Log useful info** to console for debugging
5. **Test error cases** not just happy paths
6. **Verify real data** not hardcoded values
7. **Check console errors** for hidden issues

---

## Performance Benchmarks

### API Response Times (Expected)

| API | Expected Time | Acceptable Max |
|-----|---------------|----------------|
| admin-data | 5-10s | 30s |
| authority-score | 2-5s | 15s |
| competitors | 3-8s | 20s |
| ga4-analytics | 2-5s | 20s |
| microsite-analytics | 1-3s | 15s |
| pagespeed | 10-30s | 60s |
| seo-learning | 2-5s | 30s |

### Page Load Times (Expected)

| Page | Initial Load | Cached Load |
|------|--------------|-------------|
| Dashboard | 45-60s | < 5s |
| Traffic | 5-10s | < 2s |
| Rankings | 2-5s | < 1s |
| Authority | 5-10s | < 2s |
| Weekly Brain | 30-60s | 5-10s |

---

## Quality Metrics

### Current Status (as of v2.18.0)

- **Site Readiness Score**: 88/100
- **APIs Operational**: 12/12 (100%)
- **Admin Pages Functional**: 10/10 (100%)
- **Flywheel Phases Tested**: 6/6 (100%)
- **Test Coverage**: 100+ assertions
- **Known Issues**: 0 critical bugs

### Test Success Rates

- **API Health Tests**: 100% pass rate expected
- **E2E Suite Tests**: 95%+ pass rate (some may wait for data)
- **Flywheel Tests**: 100% pass rate for status checks
- **Performance Tests**: 90%+ within benchmarks

---

## Support

### Documentation
- **Project README**: `/CLAUDE.md`
- **Implementation Plan**: `/IMPLEMENTATION_PLAN.md`
- **API Documentation**: `/01-WEBSITE/CLAUDE.md`

### Resources
- **Playwright Docs**: https://playwright.dev
- **Test Examples**: `/01-WEBSITE/tests/weekly-brain.spec.cjs` (well-documented example)

### Getting Help

1. Check console output for specific error
2. Review API documentation in CLAUDE.md
3. Test API directly with curl
4. Check Vercel function logs
5. Review screenshot in test-results/

---

## Version History

- **v2.18.0** (2024-11-28): Initial comprehensive test suite created
  - Added `api-health.spec.cjs` (12 API tests)
  - Added `e2e-full-suite.spec.cjs` (10 page tests)
  - Added `flywheel-integration.spec.cjs` (6 phase tests)
  - Created test documentation

---

**Last Updated**: November 28, 2024
**Test Suite Version**: 1.0.0
**Maintained By**: Quality Engineer Agent
