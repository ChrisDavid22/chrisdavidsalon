# Chris David Salon - Developer Context & Complete Asset Inventory

**Current Version**: v2.29.0
**Last Comprehensive Audit**: December 5, 2025
**Live Site**: https://www.chrisdavidsalon.com
**Admin Dashboard**: https://www.chrisdavidsalon.com/admin/

---

## ⛔ CRITICAL: DATA INTEGRITY POLICY (NEVER VIOLATE)

**ABSOLUTE RULE: NEVER, EVER, EVER USE FAKE DATA.**

This is a NON-NEGOTIABLE core tenet of this application:

1. **ALL data displayed in admin dashboards MUST come from verified, live API sources**
2. **If data is not available, show "Not Available" or "Not Configured" - NEVER invent numbers**
3. **No estimated baselines, no fabricated growth percentages, no made-up metrics**
4. **Every number shown must have a traceable source (GA4 API, OpenPageRank API, etc.)**
5. **Historical comparisons require REAL historical snapshots - not estimates**

### If You Don't Have Real Data:
- Display "--" or "Not Available"
- Show "API Not Configured" with setup instructions
- NEVER estimate, extrapolate, or fabricate

**This policy was established after a violation on Dec 4, 2024 where fake baseline metrics were displayed. This must NEVER happen again.**

---

## ⚠️ CRITICAL: VERCEL HOBBY PLAN LIMITS (ALWAYS FOLLOW)

**VERCEL HOBBY PLAN ONLY ALLOWS 12 SERVERLESS FUNCTIONS - CURRENTLY AT CAPACITY (12/12)**

Before adding ANY new API endpoint:
1. Count existing functions: `ls /api/*.js | wc -l`
2. If at 12, you MUST remove one before adding a new one
3. New APIs go in `/api/` (root), NOT in `01-WEBSITE/api/`

---

## ⚠️ CRITICAL: VERIFY BEFORE CLAIMING GAPS

**ALWAYS READ ACTUAL FILES BEFORE CLAIMING SOMETHING IS MISSING.**

On December 5, 2025, an incorrect audit claimed:
- "No automated weekly cycle" - **WRONG**: 3 GitHub Actions workflows exist
- "RuVector not learning" - **WRONG**: Complete 6-module learning system exists
- "No historical tracking" - **WRONG**: Data structures exist, need population

**RULE: Always verify by reading actual files in these locations:**
- GitHub Actions: `/.github/workflows/`
- RuVector System: `/01-WEBSITE/lib/seo-learning/`
- Data Files: `/01-WEBSITE/data/`

---

## COMPLETE ASSET INVENTORY

### 1. API ENDPOINTS (12/12 - AT CAPACITY)

Location: `/api/` (root directory)

| # | Endpoint | Status | Actions | Purpose |
|---|----------|--------|---------|---------|
| 1 | `ga4-analytics.js` | WORKING | `overview`, `traffic-sources`, `traffic-over-time`, `top-pages`, `devices`, `events` | GA4 traffic data |
| 2 | `authority-score.js` | WORKING | (base) | OpenPageRank domain authority |
| 3 | `competitors.js` | WORKING | `rankings`, `pagespeed`, `daily-update`, `update-scores` | Google Places competitor data |
| 4 | `pagespeed.js` | WORKING | (base) | Google PageSpeed Insights |
| 5 | `seo-analysis-engine.js` | WORKING | `analyze`, `compare-weeks`, `microsite-impact`, `trend-detection`, `generate-actions`, `health-check` | SEO analysis brain |
| 6 | `autonomous-seo-agent.js` | WORKING | `status`, `run-weekly`, `analyze-all-sites`, `generate-tasks`, `track-change`, `get-changes`, `measure-effectiveness`, `get-recommendations`, `microsite-sync` | Master orchestrator |
| 7 | `admin-data.js` | WORKING | `dashboard`, `seo-analysis`, `competitors`, `authority`, `traffic` | Admin dashboard aggregator |
| 8 | `weekly-seo-report.js` | WORKING | `generate`, `latest`, `status` | Weekly report generator |
| 9 | `seo-learning.js` | WORKING | `status`, `audit-all`, `get-fixes`, `verify-improvement`, `weekly-enhancement`, `category-deep-dive` | RuVector learning interface |
| 10 | `microsite-analytics.js` | WORKING | (base) | 3-microsite network health |
| 11 | `gbp-agent.js` | WORKING | `status`, `audit`, `recommendations`, `weekly-tasks`, `photo-strategy`, `post-ideas`, `qa-suggestions`, `competitor-gbp` | Google Business Profile optimization |
| 12 | `proactive-seo-agent.js` | WORKING | `status`, `run`, `boutique-strategy`, `quick-wins`, `learn` | Proactive action agent |

---

### 2. GITHUB ACTIONS WORKFLOWS (3 Automated Workflows)

Location: `/.github/workflows/`

| Workflow | File | Schedule | Status | Purpose |
|----------|------|----------|--------|---------|
| **SEO Flywheel** | `seo-flywheel.yml` | Sunday 6 AM EST | CONFIGURED | 6-phase cycle: INGEST → ANALYZE → DECIDE → EXECUTE → MEASURE → LEARN |
| **Weekly SEO Learning** | `weekly-seo-learning.yml` | Sunday 6 AM EST | CONFIGURED | RuVector updates, status checks, sitemap pings |
| **Weekly SEO Optimization** | `seo-weekly-optimization.yml` | Sunday 6 AM EST | CONFIGURED | PageSpeed analysis, report generation |

**All workflows have:**
- Cron schedule: `0 11 * * 0` (Sunday 11:00 UTC = 6:00 AM EST)
- Manual trigger: `workflow_dispatch` enabled
- Error handling with timeouts

---

### 3. RUVECTOR LEARNING SYSTEM (Complete)

Location: `/01-WEBSITE/lib/seo-learning/`

| File | Purpose | Status |
|------|---------|--------|
| `ruvector-config.js` | 4-site configuration, learning rates | PRODUCTION |
| `seo-knowledge-graph.js` | Vector database with GNN layers | PRODUCTION |
| `learning-agent.js` | AI recommendation engine | PRODUCTION |
| `data-ingestion.js` | Weekly data pipeline | PRODUCTION |
| `weekly-learning-cycle.js` | 6-phase orchestrator | PRODUCTION |
| `knowledge-base-loader.js` | Knowledge base initialization | PRODUCTION |
| `RUVECTOR_STRATEGY.md` | Strategy documentation | REFERENCE |

**Knowledge Base Files** (in `knowledge-base/`):
- `local-seo-master-guide.json` - Comprehensive local SEO tactics
- `local-seo-advanced-tactics.json` - Advanced strategies
- `local-seo-hair-salon-strategy.json` - Industry-specific tactics

---

### 4. ADMIN DASHBOARD PAGES (14 Pages)

Location: `/01-WEBSITE/admin/`

| Page | File | Data Source | Status |
|------|------|-------------|--------|
| SEO Command Center | `index.html` | All APIs | WORKING |
| Traffic Analytics | `traffic.html` | GA4 API | WORKING |
| Competitors | `competitors.html` | Google Places API | WORKING |
| Rankings | `rankings.html` | Manual + Search Console | WORKING |
| Authority Tracker | `authority-tracker.html` | localStorage + API | WORKING |
| Authority Scores | `authority.html` | OpenPageRank API | WORKING |
| Microsites | `microsites.html` | GA4 + PageRank | WORKING |
| Changes Log | `changes-log.html` | version.json | WORKING |
| Agent Log | `agent-log.html` | Memory store | WORKING |
| SEO Learning | `seo-learning.html` | RuVector | WORKING |
| Improvement Planner | `improvement-planner.html` | AI generated | WORKING |
| Weekly Brain | `weekly-brain.html` | Claude AI | WORKING |
| Progress Report | `progress-report.html` | version.json + APIs | WORKING |
| Login | `login.html` | localStorage | BASIC |

---

### 5. DATA FILES (9 Files)

Location: `/01-WEBSITE/data/`

| File | Purpose | Updated |
|------|---------|---------|
| `version.json` | Deployment history (45+ versions) | Per deploy |
| `business-info.json` | NAP, services, directories | Manual |
| `seo-metrics.json` | Current 7-category scores | Weekly |
| `seo-tracking.json` | Historical trends | Weekly |
| `historical-metrics.json` | Monthly snapshots | Weekly |
| `seo-changes-log.json` | Change tracking with before/after | Per change |
| `agent-implementations.json` | AI agent tracking | Weekly |
| `competitor-seo-scores.json` | Competitor benchmarking | Daily |

---

### 6. SERVICE & LOCATION PAGES

**Service Pages** (`/01-WEBSITE/services/`) - 11 pages:
- `balayage-delray-beach.html`
- `color-correction-delray-beach.html`
- `hair-color-delray-beach.html`
- `hair-extensions-delray-beach.html`
- `highlights-delray-beach.html`
- `keratin-treatment-delray-beach.html`
- `hair-salon-delray-beach.html`
- `wedding-hair-delray-beach.html`
- `womens-haircut-delray-beach.html`
- `mens-haircut-delray-beach.html`
- `color-correction.html`

**Location Pages** (`/01-WEBSITE/locations/`) - 4 pages:
- `delray-beach-hair-salon.html`
- `boca-raton-hair-salon.html`
- `boynton-beach-hair-salon.html`
- `atlantic-avenue-colorist.html`

---

### 7. DIRECTORY SUBMISSION TOOLKIT

Location: `/03-AUTOMATION/directory-submit/`

| File | Purpose | Status |
|------|---------|--------|
| `business-config.js` | Verified NAP data | CURRENT |
| `auto-submit.js` | Playwright automation | READY |
| `browser-agent.py` | AI browser control | READY |
| `interactive-submit.js` | Guided manual helper | READY |
| `DIRECTORY_ACTION_PLAN.md` | Strategy guide | REFERENCE |
| `DIRECTORY_STATUS.md` | Current progress | TRACKING |
| `EXECUTE_NOW.md` | Quick action guide | ACTION |

**Current Status**: 7 listed, 5 priority gaps (Bing, Apple, Foursquare, Yellow Pages, Manta)

---

### 8. TEST SUITES (17 Playwright Tests)

Location: `/01-WEBSITE/tests/`

Key test files:
- `admin-pages.spec.cjs` - Basic admin page loads
- `all-admin-pages.spec.cjs` - Comprehensive admin coverage
- `api-test.spec.cjs` - API endpoint health
- `cache-test.spec.cjs` - localStorage caching
- `e2e-full-suite.spec.cjs` - End-to-end workflow

---

### 9. MEMORY & STATE

| Location | Purpose |
|----------|---------|
| `/.swarm/memory.db` | Claude Flow agent memory (86KB) |
| `/01-WEBSITE/memory/memory-store.json` | Session state |
| `/.claude-flow/metrics/` | Performance tracking |

---

## ENVIRONMENT VARIABLES (Vercel Configured)

```
GA4_PROPERTY_ID=500528798
GOOGLE_PLACES_API_KEY=AIzaSy...
ANTHROPIC_API_KEY=sk-ant-...
OPENPAGERANK_API_KEY=k8s8ocg...
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

---

## ACTUAL GAPS (Verified Dec 5, 2025)

### True Gaps:
1. **Historical snapshots array empty** - `historical-metrics.json` has `snapshots: []` - workflows output to console but don't persist to JSON
2. **Competitors API-to-API call issue** - `competitors.js` calling `admin-data.js` returns 0 on Vercel
3. **GitHub Actions run verification needed** - Need to confirm workflows are actually triggering on schedule

### NOT Gaps (Previously Incorrectly Claimed):
- Weekly automation - EXISTS (3 workflows)
- RuVector learning - EXISTS (6 modules + 3 KB files)
- Historical tracking structure - EXISTS

---

## DIRECTORY STRUCTURE

```
chrisdavidsalon/
├── api/                           # 12 Vercel serverless functions
├── .github/workflows/             # 3 GitHub Actions workflows
├── 01-WEBSITE/
│   ├── admin/                     # 14 dashboard pages
│   ├── services/                  # 11 service landing pages
│   ├── locations/                 # 4 location pages
│   ├── data/                      # 9 data files
│   ├── lib/seo-learning/          # RuVector system (6 modules + 3 KB)
│   ├── memory/                    # Session state
│   └── tests/                     # 17 Playwright tests
├── 03-AUTOMATION/directory-submit/ # Directory submission toolkit
├── 04-SEO-ENGINE/                 # SEO utilities & docs
├── 05-REPORTS/weekly/             # Auto-generated reports
├── .swarm/                        # Agent memory (86KB)
└── .claude-flow/metrics/          # Performance tracking
```

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

---

## CONTACT & BUSINESS INFO

**Chris David Salon**
- Phone: (561) 299-0950
- Address: 1878C Dr Andres Way, Delray Beach, FL 33445
- Website: chrisdavidsalon.com
- Google Business Profile: Active, 4.9 stars, 140+ reviews

---

## DEPLOYMENT

```bash
# Auto-deploy: Push to main branch
git add -A && git commit -m "message" && git push

# Verify deployment
curl -s https://www.chrisdavidsalon.com/data/version.json | grep version
```

---

## API VERIFICATION

```bash
# GA4
curl "https://www.chrisdavidsalon.com/api/ga4-analytics?type=overview"

# Competitors
curl "https://www.chrisdavidsalon.com/api/competitors"

# Authority
curl "https://www.chrisdavidsalon.com/api/authority-score"

# SEO Analysis Engine
curl "https://www.chrisdavidsalon.com/api/seo-analysis-engine?action=health-check"

# GBP Agent
curl "https://www.chrisdavidsalon.com/api/gbp-agent?action=status"

# Proactive Agent
curl "https://www.chrisdavidsalon.com/api/proactive-seo-agent?action=status"
```

---

*Last Comprehensive Audit: December 5, 2025 - v2.29.0*
*All assets verified by file system inspection*
