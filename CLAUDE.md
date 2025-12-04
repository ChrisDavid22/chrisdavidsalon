# Chris David Salon - Developer Context & Asset Inventory

---

## ⛔ CRITICAL: DATA INTEGRITY POLICY (NEVER VIOLATE)

**ABSOLUTE RULE: NEVER, EVER, EVER USE FAKE DATA.**

This is a NON-NEGOTIABLE core tenet of this application:

1. **ALL data displayed in admin dashboards MUST come from verified, live API sources**
2. **If data is not available, show "Not Available" or "Not Configured" - NEVER invent numbers**
3. **No estimated baselines, no fabricated growth percentages, no made-up metrics**
4. **Every number shown must have a traceable source (GA4 API, OpenPageRank API, etc.)**
5. **Historical comparisons require REAL historical snapshots - not estimates**

### Verified Data Sources:
- **Traffic**: GA4 API (`/api/ga4-analytics`) - REAL
- **Authority**: OpenPageRank API (`/api/authority`) - REAL
- **Reviews**: Google Places API - NOT CONFIGURED (show as unavailable)
- **Rankings**: Search Console API - NOT INTEGRATED (show as unavailable)

### If You Don't Have Real Data:
- Display "--" or "Not Available"
- Show "API Not Configured" with setup instructions
- NEVER estimate, extrapolate, or fabricate

**This policy was established after a violation on Dec 4, 2024 where fake baseline metrics were displayed. This must NEVER happen again.**

---

## Quick Reference

**Live Site**: https://www.chrisdavidsalon.com
**Admin Dashboard**: https://www.chrisdavidsalon.com/admin/
**SEO Learning Dashboard**: https://www.chrisdavidsalon.com/admin/seo-learning.html
**Current Version**: v2.18.0
**Site Readiness Score**: 88/100
**Deployment**: Vercel (auto-deploys from main branch)

---

## SELF-LEARNING SEO SYSTEM (RuVector)

### Overview
The site now includes a **self-learning SEO optimization system** powered by RuVector, a vector database with Graph Neural Network (GNN) layers that learns from data over time.

### What It Does
1. **Monitors all 4 sites**: chrisdavidsalon.com + 3 microsites
2. **Ingests data weekly**: Traffic, rankings, competitors, conversions
3. **Learns what works**: Tracks which optimizations improve metrics
4. **Recommends actions**: AI-generated suggestions based on learned patterns
5. **Gets smarter over time**: Success/failure feedback improves future recommendations

### Managed Sites
| Site | Purpose | Focus Keywords |
|------|---------|----------------|
| chrisdavidsalon.com | Main conversion hub | All service + location terms |
| bestsalondelray.com | Authority building | General salon guides, service info |
| bestdelraysalon.com | Local SEO | Delray Beach neighborhood terms |
| bestsalonpalmbeach.com | Regional SEO | Palm Beach County, luxury terms |

### API Endpoint
- **Endpoint**: `/api/seo-learning`
- **Actions**:
  - `?action=status` - Check system status and stats
  - `?action=ingest` - Run full data ingestion
  - `?action=analyze` - Run analysis and update learning
  - `?action=recommendations` - Get prioritized recommendations
  - `?action=learning-report` - Get learning progress report
  - `?action=export-graph` - Export knowledge graph

### Automated Weekly Cycle
GitHub Actions workflow runs every Sunday at 6 AM EST:
1. Ingests fresh data from all APIs
2. Measures effectiveness of past optimizations
3. Updates learned patterns
4. Generates new recommendations
5. Auto-implements safe, high-confidence changes

### Learning Metrics Tracked
- **Traffic**: sessions, users, pageviews, bounce rate
- **Rankings**: position, impressions, clicks, CTR
- **Conversions**: booking clicks, phone clicks, form submissions
- **Authority**: PageRank, domain authority, backlinks
- **Competitors**: ratings, reviews, ranking gaps

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
| SEO Learning | `/admin/seo-learning.html` | Knowledge Graph | Working |

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

## DIRECTORY SUBMISSION AUTOMATION (v2.18.0)

Complete toolkit for automating business directory submissions in `03-AUTOMATION/directory-submit/`:

### Files
| File | Purpose |
|------|---------|
| `business-config.js` | Verified NAP (Name, Address, Phone) data |
| `auto-submit.js` | Playwright browser automation |
| `browser-agent.py` | AI-powered browser control (browser-use + Claude) |
| `interactive-submit.js` | Guided manual submission helper |
| `DIRECTORY_ACTION_PLAN.md` | Comprehensive action plan |
| `DIRECTORY_STATUS.md` | Current listing status |

### Current Directory Status
| Status | Count | Directories |
|--------|-------|-------------|
| Listed | 7 | Google, Yelp, Nextdoor, Waze, ClassPass, Facebook, Instagram |
| Priority Gaps | 5 | Bing Places, Apple Business Connect, Yellow Pages, Manta, MapQuest |

### Recommendation
**Option A (Recommended):** Pay BrightLocal $150 → they submit to 75+ directories for you
**Option B:** Manual submission using the toolkit (5-10 hours)

Apple Business Connect must always be done manually (Apple ID 2FA required).

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
│   └── directory-submit/   # Directory submission toolkit (NEW v2.18.0)
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
- GA4 connection with live data (416 users, 535 sessions in 30 days)
- Competitor monitoring (15+ salons)
- Authority tracking
- PageSpeed monitoring
- SEO scoring engine
- Autonomous agent framework
- Admin dashboard with 8 pages
- **Self-Learning SEO System** (RuVector knowledge graph)
- Automated weekly learning cycles (GitHub Actions)
- Cross-site optimization for 4 domains
- Booking click conversion tracking (GA4 events)
- **Directory Submission Automation Toolkit** (v2.18.0)

### SITE EVALUATION (November 2024)
| Metric | Score |
|--------|-------|
| Overall Readiness | 88/100 |
| Design Consistency | 9/10 |
| GA4 Tracking | Live |
| Playwright Tests | 7 passed, 5 failed (admin API timeouts) |

### NOT YET BUILT (Phase 2-4 of Implementation Plan)
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

*Last Updated: November 28, 2024 - v2.18.0 - All APIs verified working*
