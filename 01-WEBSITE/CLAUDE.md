# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chris David Salon website with **Autonomous SEO Agent** - a complete analytics and optimization system that runs on real data only.

**Live Site**: https://chrisdavidsalon.com
**GitHub**: https://github.com/ChrisDavid22/chrisdavidsalon.git
**Deployment**: Vercel (auto-deploys from main branch)
**Current Version**: 2.18.0
**Site Readiness Score**: 88/100

---

## CRITICAL: ABSOLUTE NO HARDCODED DATA POLICY

**HARDCODED DATA IS TOXIC AND ABSOLUTELY FORBIDDEN.**

1. **NEVER** put hardcoded numbers, statistics, or fake data in ANY dashboard
2. **NEVER** create JavaScript arrays/objects with sample data that looks real
3. **ALWAYS** fetch data from API endpoints
4. **ALWAYS** show "--" or "Awaiting API" when data isn't available
5. **ALWAYS** show clear data source badges (LIVE vs Not Connected)

---

## CRITICAL: MANDATORY PLAYWRIGHT TESTING BEFORE DEPLOYMENT

**NEVER SAY "DEPLOYED SUCCESSFULLY" WITHOUT RUNNING PLAYWRIGHT TESTS.**

Before claiming any deployment is successful, you MUST:

1. **Run Playwright tests** that actually load each page and verify data appears
2. **Take screenshots** and visually confirm the pages look correct
3. **Test the FULL user flow**, not just "does the page load"
4. **Wait for API data** - some scores take 30-60 seconds to populate
5. **Test cache loading** - verify second visit loads instantly from cache

### Required Test Commands
```bash
# Run from 01-WEBSITE directory
cd 01-WEBSITE

# Run all admin page tests
npx playwright test tests/admin-pages.spec.cjs --config=playwright.config.cjs --project=chromium

# Run full cache test (verifies instant loading)
npx playwright test tests/cache-full-test.spec.cjs --config=playwright.config.cjs --project=chromium
```

### What "Working" Means
- **SEO Command**: All 7 category scores visible (Performance, Technical, Mobile, Content, Local, UX, Authority)
- **Total score**: Shows a number like "70/100", NOT "--/100"
- **Second visit**: Loads cached data instantly (under 2 seconds)
- **Radar chart**: Shows actual scores, not all zeros

### Test Files Location
```
01-WEBSITE/tests/
├── admin-pages.spec.cjs      # Basic page load tests
├── cache-full-test.spec.cjs  # Full cache verification
├── api-test.spec.cjs         # Direct API endpoint tests
```

---

## Directory Submission Automation (v2.18.0)

Complete toolkit for automating business directory submissions located in `03-AUTOMATION/directory-submit/`:

### Files
- **business-config.js** - Verified NAP (Name, Address, Phone) data
- **auto-submit.js** - Playwright browser automation for directory submissions
- **browser-agent.py** - AI-powered browser control using browser-use + Claude
- **interactive-submit.js** - Guided manual submission helper

### Documentation
- **DIRECTORY_ACTION_PLAN.md** - Comprehensive action plan with:
  - BrightLocal recommendation ($150 for 75+ directories)
  - Manual submission priority list
  - Automation requirements for each directory
  - OAuth/2FA blockers explained

- **DIRECTORY_STATUS.md** - Current listing status across all directories

### Directory Status Summary
| Status | Directories |
|--------|-------------|
| Listed | Google, Yelp, Nextdoor, Waze, ClassPass, Facebook, Instagram |
| Not Listed (Priority) | Bing Places, Apple Business Connect, Yellow Pages, Manta, MapQuest |

### Recommendation
1. Do Apple Business Connect manually (requires Apple ID 2FA)
2. Pay BrightLocal $150 for 75+ other directories
3. Total time: 30 minutes + $150

---

## SEO Agent Architecture (v2.9.9)

### Autonomous SEO Agent (`/api/autonomous-seo-agent`)
Master controller that orchestrates all SEO automation across 4 sites.
```
?action=status            - Check agent health and all integrations
?action=run-weekly        - Run full weekly automation cycle
?action=analyze-all-sites - Comprehensive analysis of all 4 sites
?action=generate-tasks    - Generate prioritized SEO tasks
?action=track-change      - POST to log changes for measurement
?action=get-changes       - Retrieve tracked changes
?action=measure-effectiveness - Compare before/after metrics
?action=get-recommendations - AI-powered improvement suggestions
?action=microsite-sync    - Cross-site content recommendations
```

### Core API Endpoints

#### GA4 Analytics API (`/api/ga4-analytics`)
Pulls REAL data from Google Analytics 4. Requires credentials.
```
?type=overview          - Active users, sessions, page views, bounce rate
?type=traffic-over-time - Daily traffic for charts (30 days)
?type=traffic-sources   - Where traffic comes from (organic, direct, referral)
?type=microsite-referrals - Traffic from the 3 microsites
?type=top-pages         - Top landing pages with metrics
?type=devices           - Mobile/desktop/tablet breakdown
?type=events            - Booking clicks, phone clicks, form submissions
```

#### SEO Analysis Engine (`/api/seo-analysis-engine`)
The "brain" that compares data and generates insights.
```
?action=analyze         - Full week-over-week analysis
?action=compare-weeks   - This week vs last week comparison
?action=microsite-impact - Microsite effectiveness analysis
?action=trend-detection - Identify traffic trends
?action=generate-actions - Priority action items
?action=health-check    - System status check
```

#### Weekly Report (`/api/weekly-seo-report`)
Automated weekly analysis (free tier compatible).
```
?action=generate        - Generate weekly report
?action=latest          - Get most recent report
?action=status          - Check report system status
```

### Admin Dashboard Pages
```
/admin/dashboard.html   - Main overview
/admin/traffic.html     - GA4 traffic analytics with charts
/admin/competitors.html - Google Places competitor data
/admin/rankings.html    - Keyword positions
/admin/authority.html   - Domain authority tracking
/admin/microsites.html  - Microsite referral tracking
/admin/agent-log.html   - SEO agent activity log
```

### The 3 Microsites (LIVE)
All deployed on Vercel, all have GA tracking (G-XQDLWZM5NV):
- **bestsalondelray.com** - General salon authority
- **bestdelraysalon.com** - Local Delray Beach focus
- **bestsalonpalmbeach.com** - Palm Beach County regional

---

## GA4 Integration Status

### What's Built (Ready to Go)
- Complete GA4 Data API integration
- Week-over-week comparison logic
- Trend detection algorithms
- Action generation system
- Microsite referral tracking
- Health scoring system
- Weekly report generator

### What's Needed (Credentials)
Two environment variables in Vercel:

1. **GA4_PROPERTY_ID**
   - Numeric ID like `123456789`
   - Get from: analytics.google.com → Admin → Property Settings

2. **GOOGLE_SERVICE_ACCOUNT_JSON**
   - Full JSON key contents
   - Create at: console.cloud.google.com → IAM → Service Accounts
   - Must have Analytics Viewer access in GA4 Admin

### What Becomes Available Once Connected
- Real-time traffic numbers
- Historical trend charts
- Week-over-week comparisons
- Microsite referral counts
- Device breakdown
- Top landing pages
- Conversion events
- Automated weekly reports
- AI-generated action items

---

## Data Available from GA4 API

### Metrics
- `activeUsers` - Users in date range
- `sessions` - Total sessions
- `screenPageViews` - Page views
- `bounceRate` - Bounce rate (0-1)
- `averageSessionDuration` - Avg session length
- `newUsers` - New visitors
- `eventCount` - Event occurrences

### Dimensions
- `date` - For time series
- `sessionSource` - Traffic source
- `sessionMedium` - Traffic medium
- `deviceCategory` - Mobile/desktop/tablet
- `landingPage` - Entry page
- `eventName` - Event names

### Rate Limits
- Token-based (~10 tokens per request)
- Plenty of capacity for this use case
- No cost at current usage levels

---

## Existing API Integrations (Working)

### PageSpeed API
- Endpoint: `/api/pagespeed`
- Status: LIVE (free tier, no key required)
- Returns: Performance, accessibility, SEO, best practices scores

### Google Places API
- Endpoint: `/api/admin-data?type=competitors`
- Status: LIVE (GOOGLE_PLACES_API_KEY in Vercel)
- Returns: Competitor ratings, review counts, addresses

### Claude AI
- Used for: AI recommendations in dashboards
- Status: LIVE (ANTHROPIC_API_KEY in Vercel)

---

## Chris David's Credentials (For SEO Content)

**Color Correction Expert** - Target ranking #1-2 locally
- 20+ years cutting expertise
- Former educator for 5 major brands:
  - Davines (6 years)
  - Goldwell
  - Cezanne
  - Platinum Seamless
  - Organic Color Systems
- Has trained hundreds of professionals worldwide

---

## Service Landing Pages

Five SEO landing pages targeting high-value keywords:
- `/services/wedding-hair-delray-beach.html`
- `/services/balayage-delray-beach.html`
- `/services/color-correction-delray-beach.html`
- `/services/hair-extensions-delray-beach.html`
- `/services/keratin-treatment-delray-beach.html`

All include Schema.org markup, GA tracking, Boulevard booking widget.

---

## Essential Commands

### Deploy Changes
```bash
cd 01-WEBSITE && git add -A && git commit -m "message" && git push
```

### Verify Deployment
```bash
curl -s https://www.chrisdavidsalon.com/data/version.json | grep version
```

### Test GA4 API (once credentials added)
```bash
curl https://www.chrisdavidsalon.com/api/ga4-analytics?type=overview
```

### Test Analysis Engine
```bash
curl https://www.chrisdavidsalon.com/api/seo-analysis-engine?action=health-check
```

---

## Version History

Current: **2.18.0** - Directory Submission Automation

Key versions:
- 2.18.0: Directory submission automation toolkit, site readiness 88/100, GA4 live (416 users)
- 2.17.0: Self-Learning SEO System with RuVector knowledge graph
- 2.16.0: Service area pages (Boca Raton, Boynton Beach) + men's/highlights pages
- 2.15.0: Microsite analytics dashboard with ROI projections
- 2.14.0: Autonomous SEO Brain - weekly intelligence system
- 2.13.0: Competitor-inspired SEO - mega keywords, FAQ schema
- 2.12.0: Search Console integration with live keyword rankings
- 2.11.0: Action-focused dashboard with conversion tracking
- 2.10.4: Fixed instant cache loading - page loads instantly on return visits
- 2.9.9: Autonomous SEO Agent API with 10 actions
- 2.8.0: GA4 API, Analysis Engine, Weekly Reports

Full history in `/data/version.json`
