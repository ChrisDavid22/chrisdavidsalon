# Chris David Salon - Developer Context & Asset Inventory

## Quick Reference

**Live Site**: https://www.chrisdavidsalon.com
**Admin Dashboard**: https://www.chrisdavidsalon.com/admin/
**Current Version**: v2.10.5
**Deployment**: Vercel (auto-deploys from main branch)

---

## WORKING APIs & CREDENTIALS

All APIs are **LIVE AND OPERATIONAL** as of November 2024. Do NOT ask for credentials - they are already configured.

### GA4 Analytics API
- **Status**: WORKING
- **Property ID**: 500528798 (configured in .env.local)
- **Service Account**: Configured with full JSON key
- **Endpoints**:
  - `/api/ga4-analytics?type=overview` - Active users, sessions, pageviews
  - `/api/ga4-analytics?type=traffic-sources` - Traffic source breakdown
  - `/api/ga4-analytics?type=top-pages` - Top landing pages
- **Live Data Example**:
  ```json
  {"success":true,"dataSource":"google-analytics-4-api","isLiveData":true,
   "data":{"activeUsers":323,"sessions":448,"pageViews":450,"avgSessionDuration":"59.3"}}
  ```

### Google Places API
- **Status**: WORKING
- **API Key**: Configured in .env.local
- **Endpoint**: `/api/competitors`
- **Returns**: 15+ competitors with ratings, reviews, addresses
- **Live Data Example**:
  ```json
  {"success":true,"live":true,"source":"Google Places API",
   "data":{"competitors":[{"name":"Rové Hair Salon","rating":5,"reviews":1514},
   {"name":"Chris David Salon","rating":4.9,"reviews":140,"isOurSalon":true}]}}
  ```

### OpenPageRank API
- **Status**: WORKING
- **API Key**: Configured in .env.local
- **Endpoint**: `/api/authority`
- **Live Data Example**:
  ```json
  {"success":true,"data":{"authority_score":29,"pagerank":3,"pagerank_decimal":2.88}}
  ```

### PageSpeed Insights API
- **Status**: WORKING
- **Endpoint**: `/api/pagespeed`
- **No API key required** (uses public Google API)
- **Returns**: Performance, accessibility, best practices, SEO scores

### Claude AI (Anthropic)
- **Status**: WORKING
- **API Key**: Configured in .env.local
- **Used for**: Generating SEO recommendations, action items, content suggestions
- **Endpoint**: `/api/ai-seo-analysis`

---

## WORKING SYSTEMS

### SEO Analysis Engine
- **Endpoint**: `/api/seo-analysis-engine`
- **Status**: All components ready
- **Capabilities**:
  - Analysis Engine: ready
  - GA4 API: connected
  - Trend Detection: ready
  - Action Generator: ready

### Autonomous SEO Agent
- **Endpoint**: `/api/autonomous-seo-agent`
- **Status**: Operational
- **10 Available Actions**:
  1. check_rankings
  2. analyze_competitors
  3. check_reviews
  4. monitor_pagespeed
  5. check_mobile_usability
  6. analyze_content_gaps
  7. check_local_citations
  8. monitor_backlinks
  9. check_schema_markup
  10. generate_weekly_report

### Weekly Report Generator
- **Endpoint**: `/api/weekly-report`
- **Status**: Ready
- **Generates**: Comprehensive weekly SEO performance reports

### Admin Data API
- **Endpoint**: `/api/admin-data`
- **Status**: Working
- **Returns**: Aggregated data for all admin dashboard pages

---

## ADMIN DASHBOARD PAGES

| Page | URL | Data Source | Status |
|------|-----|-------------|--------|
| SEO Command | `/admin/index.html` | admin-data API | Working |
| Traffic | `/admin/traffic.html` | GA4 API | Working |
| Competitors | `/admin/competitors.html` | Places API | Working |
| Rankings | `/admin/rankings.html` | Manual checker | Working |
| Authority | `/admin/authority.html` | OpenPageRank API | Working |
| Microsites | `/admin/microsites.html` | Static data | Working |
| Agent Log | `/admin/agent-log.html` | Agent API | Working |

---

## ENVIRONMENT VARIABLES (.env.local)

All required variables are configured:

```
GA4_PROPERTY_ID=500528798
GOOGLE_PLACES_API_KEY=AIzaSyB0ZQmSPQ234rYmAa4jSAq7VDMC_khikD8
ANTHROPIC_API_KEY=sk-ant-api03-VkmQGCnK9OYVF3-...
OPENPAGERANK_API_KEY=k8s8ocg0ow88gw00c0kwoowo4gocc8kko04owowg
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"stellar-operand-433622-n3"...}
```

These are also configured in Vercel production environment.

---

## SCORING SYSTEM

### 7 SEO Categories (weighted)
| Category | Weight | What it measures |
|----------|--------|------------------|
| Performance | 10% | PageSpeed score |
| Content | 15% | Content quality, keywords |
| Technical | 15% | Schema, sitemap, robots.txt |
| Mobile | 15% | Mobile-friendliness |
| UX | 15% | User experience signals |
| Local SEO | 20% | GBP, citations, NAP consistency |
| Authority | 10% | Domain authority, backlinks |

### Score Calculation
- **Overall Score** = Weighted average of all 7 categories
- **Individual Scores** = Category-specific metrics
- Example: Overall 73 vs Local SEO 91 (they're different metrics)

---

## DIRECTORY STRUCTURE

```
chrisdavidsalon/
├── 01-WEBSITE/              # Main website + admin dashboard
│   ├── admin/               # Admin dashboard pages
│   ├── api/                 # Vercel serverless functions
│   ├── data/                # Static data files
│   └── services/            # Service pages
├── 02-SEO-TOOLS/           # Legacy SEO tools
├── 03-AUTOMATION/          # Automation scripts
├── 04-IMAGES/              # All images
├── 05-REPORTS/             # Generated reports
├── 06-SERVICE-PAGES/       # Service landing pages
├── 07-LOCATION-PAGES/      # Location pages
├── .env.local              # Local environment variables
├── IMPLEMENTATION_PLAN.md  # Current implementation roadmap
└── CLAUDE.md               # This file
```

---

## DEPLOYMENT

### Automatic
- Push to `main` branch → Vercel auto-deploys
- Changes live within 1-2 minutes

### Manual
```bash
cd 01-WEBSITE
npx vercel --prod
```

---

## TESTING

### Playwright Tests
```bash
npm test
```

### API Verification
```bash
# GA4
curl "https://www.chrisdavidsalon.com/api/ga4-analytics?type=overview"

# Competitors
curl "https://www.chrisdavidsalon.com/api/competitors"

# Authority
curl "https://www.chrisdavidsalon.com/api/authority"

# SEO Analysis Engine
curl "https://www.chrisdavidsalon.com/api/seo-analysis-engine?action=status"

# Autonomous Agent
curl "https://www.chrisdavidsalon.com/api/autonomous-seo-agent?action=status"
```

---

## KNOWN ISSUES & SOLUTIONS

### Browser Cache
- Problem: Old version showing after deploy
- Solution: Hard refresh (Cmd+Shift+R) or clear localStorage

### Score Inconsistency
- Problem: "Why is my score 73 on one page and 91 on another?"
- Explanation: 73 = Overall weighted average, 91 = Local SEO category score
- These are DIFFERENT metrics, not an error

### API Timeouts
- Vercel serverless functions timeout at 10s
- If slow, check third-party API status

---

## WHAT'S ALREADY BUILT vs WHAT'S NEEDED

### BUILT AND WORKING
- GA4 connection with live data
- Competitor monitoring (15+ salons)
- Authority tracking
- PageSpeed monitoring
- SEO scoring engine
- Autonomous agent framework
- Admin dashboard with 7 pages

### NOT YET BUILT (Phase 2-4 of Implementation Plan)
- Booking click conversion tracking (GA4 events)
- Action queue system (AI + approval workflow)
- Email notifications
- ROI measurement (before/after tracking)
- Google Business Profile API integration

---

## CONTACT & BUSINESS INFO

**Chris David Salon**
- Phone: (561) 299-0950
- Address: 403 E Atlantic Ave, Delray Beach, FL 33483
- Website: chrisdavidsalon.com
- Google Business Profile: Active, 4.9 stars, 140+ reviews

---

*Last Updated: November 2024 - All APIs verified working*
