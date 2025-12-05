# Universal SEO Engine - Architecture Document

## Overview

A plug-and-play SEO system that can be deployed to any local business website in under 30 minutes. Auto-discovers business details, configures industry-specific monitoring, and provides a self-learning optimization dashboard.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    UNIVERSAL SEO ENGINE                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Discovery   │───▶│Configuration │───▶│  Dashboard   │  │
│  │   Engine     │    │   Generator  │    │   Builder    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                     │                    │         │
│         ▼                     ▼                    ▼         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Core Data Collection Layer              │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  GA4  │ Places │ PageRank │ PageSpeed │ Schema │ ... │  │
│  └──────────────────────────────────────────────────────┘  │
│         │                     │                    │         │
│         ▼                     ▼                    ▼         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Analysis & Learning Engine (RuVector)      │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Pattern Recognition │ Trend Analysis │ Predictions │  │
│  └──────────────────────────────────────────────────────┘  │
│         │                     │                    │         │
│         ▼                     ▼                    ▼         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Action & Automation Layer               │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Weekly Reports │ Auto-optimization │ Notifications │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

---

## Key Design Principles

1. **Zero-Config Discovery**: Point at URL → get complete setup
2. **Industry Agnostic**: Works for salons, restaurants, dentists, lawyers, etc.
3. **API-First**: All logic in serverless functions (Vercel/Netlify compatible)
4. **Self-Learning**: RuVector knowledge graph improves over time
5. **White-Label Ready**: Rebrandable for agencies

---

## Directory Structure

```
universal-seo-engine/
├── core/
│   ├── discovery/           # Auto-detect business info from URL
│   ├── config/              # Configuration generation & validation
│   └── templates/           # Admin page templates
│
├── data-collectors/         # Modular API integrations
│   ├── analytics/           # GA4, Matomo, Plausible
│   ├── local-seo/           # Google Places, Yelp, Citations
│   ├── technical/           # PageSpeed, Schema, Mobile
│   └── authority/           # OpenPageRank, Moz, Ahrefs
│
├── analysis-engine/         # Intelligence layer
│   ├── ruvector/            # Knowledge graph
│   ├── scoring/             # 7-category SEO scoring
│   └── insights/            # Gap detection, recommendations
│
├── automation/              # Scheduled workflows
│   ├── schedulers/          # Weekly, daily, monthly jobs
│   ├── agents/              # Autonomous SEO agents
│   └── workflows/           # GitHub Actions, Vercel Cron
│
├── admin-dashboard/         # Pre-built UI
│   ├── components/          # Reusable widgets
│   ├── pages/               # Dashboard pages
│   └── themes/              # White-label themes
│
├── cli/                     # Command-line interface
│   └── commands/            # init, discover, configure, deploy
│
└── skills/                  # Claude Code skill definitions
    └── seo-engine.md        # Main skill file
```

---

## Discovery Process

### Input: Any website URL

### Phase 1: URL Analysis (30 sec)
- Fetch HTML, extract metadata
- Find Schema.org markup
- Detect analytics tracking
- Run Lighthouse audit

### Phase 2: Google Business Profile (15 sec)
- Search Places API
- Match by name/address/phone
- Extract rating, reviews, categories

### Phase 3: Competitor Discovery (30 sec)
- Nearby search in same category
- Filter by reviews, activity
- Rank by prominence

### Phase 4: Industry Classification (10 sec)
- Analyze category + services
- Load industry preset
- Set scoring weights

### Phase 5: Config Generation (5 sec)
- Merge all discovered data
- Generate seo-config.json
- Validate completeness

---

## Configuration Schema

```json
{
  "business": {
    "name": "string",
    "industry": "string",
    "website": "string",
    "nap": { "name", "address", "phone" },
    "hours": {},
    "serviceAreas": [],
    "services": []
  },
  "seo": {
    "primaryKeywords": [],
    "targetLocations": [],
    "competitors": { "autoDetected": true, "list": [] },
    "scoring": { "weights": {} }
  },
  "integrations": {
    "analytics": { "provider", "propertyId" },
    "googlePlaces": { "apiKey", "placeId" },
    "pagespeed": {},
    "authority": {},
    "ai": {}
  },
  "automation": {
    "weeklyAudit": { "enabled", "schedule" },
    "dailyCheck": {},
    "monthlyReport": {}
  }
}
```

---

## Weekly Automation Workflow

```
Sunday 6:00 AM - INGESTION
├── Fetch GA4 data
├── Fetch competitor reviews
├── Run PageSpeed audit
├── Check authority score
└── Store in RuVector

Sunday 6:15 AM - ANALYSIS
├── Compare to last week
├── Detect trends
├── Measure optimization effectiveness
└── Update learned patterns

Sunday 6:30 AM - RECOMMENDATIONS
├── Run AI analysis
├── Generate prioritized actions
├── Flag auto-safe actions
└── Create action queue

Sunday 6:45 AM - EXECUTION (auto-safe only)
├── Fix schema markup
├── Optimize meta tags
├── Update sitemap
└── Log changes

Sunday 7:00 AM - REPORTING
├── Generate weekly report
├── Email to owner
├── Update dashboard
└── Archive report
```

---

## 7-Category Scoring System

| Category | Weight | What it Measures |
|----------|--------|------------------|
| Performance | 10-20% | PageSpeed, Core Web Vitals |
| Content | 15% | Keywords, freshness, depth |
| Technical | 15% | Schema, sitemap, robots.txt |
| Mobile | 15% | Mobile-friendliness, speed |
| UX | 15% | Bounce rate, engagement |
| Local SEO | 20-30% | GBP, citations, reviews |
| Authority | 10-15% | Backlinks, domain authority |

Weights adjust by industry (salons prioritize Local, lawyers prioritize Authority).

---

## Reusable Components

### 100% Reusable
- Discovery engine
- Data collectors
- Analysis engine
- Admin templates
- Automation workflows
- CLI tool

### Industry Presets (JSON config)
- Scoring weights
- Keyword templates
- Competitor categories
- Recommended tools

### Client-Specific
- Business NAP
- Branding colors
- API credentials
- Domain config

---

## Deployment Models

### A: Self-Hosted
```bash
npm install -g universal-seo-engine
seo-engine init https://mybusiness.com
seo-engine deploy --platform=vercel
```

### B: Agency White-Label
```bash
seo-engine init https://client1.com --name=client1
seo-engine init https://client2.com --name=client2
seo-engine agency-dashboard
```

### C: SaaS Platform
- Multi-tenant database
- Stripe billing
- Role-based access

---

*Generated: 2025-12-05*
*Version: 1.0.0*
