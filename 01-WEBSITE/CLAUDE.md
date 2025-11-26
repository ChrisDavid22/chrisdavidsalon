# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chris David Salon website with comprehensive admin dashboard for business intelligence and marketing automation. Located in Delray Beach, competing with 47 other salons.

**Live Site**: https://chrisdavidsalon.com
**GitHub**: https://github.com/ChrisDavid22/chrisdavidsalon.git
**Deployment**: Vercel (auto-deploys from main branch)
**Current Version**: 2.6.14

---

## CRITICAL: ABSOLUTE NO HARDCODED DATA POLICY

**HARDCODED DATA IS TOXIC AND ABSOLUTELY FORBIDDEN.**

This is the most important rule in this codebase:

1. **NEVER** put hardcoded numbers, statistics, or fake data in ANY admin dashboard
2. **NEVER** create JavaScript arrays/objects with sample data that looks real
3. **NEVER** show misleading statistics that aren't from a real data source
4. **ALWAYS** fetch data from API endpoints (`/api/analytics`, `/api/admin-data`, etc.)
5. **ALWAYS** show clear data source badges (LIVE, Manual Observation, Error)
6. **ALWAYS** show "Loading...", "--", or "Awaiting API" when data isn't available

### Why This Matters
- Fake data leads to bad business decisions
- It's impossible to trust dashboards with any fake data
- The business owner needs to know exactly what's real
- Every metric must be traceable to its source

### How Data Should Work
```javascript
// WRONG - NEVER DO THIS
const visitors = 312;  // Hardcoded fake number
const monthlyData = [185, 198, 247, 268];  // Fake historical data

// CORRECT - ALWAYS DO THIS
const response = await fetch('/api/analytics?type=visitors');
const data = await response.json();
if (data.success) {
    document.getElementById('visitors').textContent = data.currentData.visitors;
} else {
    document.getElementById('visitors').textContent = '--';
}
```

### Data Source Badges Required
Every dashboard page MUST show:
- What data source it's using
- Whether data is LIVE or from manual observation
- When data was last updated
- Clear error states if API fails

---

## Admin Dashboard Architecture

### Core Admin Pages (Priority Order - Left to Right)
1. **SEO Score** (`/admin/index.html`) - Live PageSpeed scores
2. **Traffic** (`/admin/visitor-metrics.html`) - Visitor metrics from API
3. **Conversions** (`/admin/engagement-tracker.html`) - Booking/phone clicks
4. **Competitors** (`/admin/competitors.html`) - Google Places API data
5. **Rankings** (`/admin/rankings.html`) - Keyword positions
6. **Action Plan** (`/admin/seo-action-plan.html`) - Virtuous cycle hub

### API Endpoints
```
/api/analytics?type=visitors      - Traffic data
/api/analytics?type=seo-score     - Live PageSpeed scores
/api/analytics?type=engagement    - Booking/phone click data
/api/analytics?type=traffic-sources - Traffic breakdown
/api/analytics?type=keywords      - Keyword rankings
/api/analytics?type=overview      - Combined business metrics
/api/admin-data?type=competitors  - Google Places competitor data
/api/admin-data?type=dashboard    - Dashboard overview
/api/pagespeed                    - Direct PageSpeed analysis
```

### Data Source Types
- **LIVE (PageSpeed)**: Real-time from Google PageSpeed API
- **LIVE (Places)**: Real-time from Google Places API
- **Manual Observation**: Data observed from GA dashboard (not API-connected)
- **Not Connected**: API not yet configured

---

## Service Landing Pages (SEO)

Five dedicated landing pages targeting high-value keywords:
- `/services/wedding-hair-delray-beach.html`
- `/services/balayage-delray-beach.html`
- `/services/color-correction-delray-beach.html`
- `/services/hair-extensions-delray-beach.html`
- `/services/keratin-treatment-delray-beach.html`

All include:
- Schema.org LocalBusiness + Service markup
- Google Analytics tracking (G-XQDLWZM5NV)
- Boulevard booking widget
- Internal linking back to main site

---

## Essential Commands

### Deploy Changes
```bash
cd 01-WEBSITE && git add -A && git commit -m "message" && git push
# Vercel auto-deploys from main branch
```

### Verify Deployment
```bash
curl -s https://www.chrisdavidsalon.com/data/version.json | grep version
```

---

## API Integration Status

### Connected (Working)
- **PageSpeed API**: Live SEO scores (free tier, no key required)
- **Google Places API**: Competitor data (GOOGLE_PLACES_API_KEY in Vercel)
- **Claude AI**: AI recommendations (ANTHROPIC_API_KEY in Vercel)

### Manual Observation Only
- **Google Analytics**: GA4 tracking code installed, API not connected
- Data source: `manual-ga-observation`
- Last known: 247 visitors, 68% mobile, August 2025

### Not Connected (Setup Required)
- **Google Analytics Data API**: Needs GA4 service account
- **Google Search Console API**: Needs Search Console credentials
- **Boulevard API**: Needs API access from Boulevard

---

## Chris David's Credentials (For SEO Content)

**Color Correction Expert** - Should be #1-2 in local rankings
- 20+ years cutting expertise
- Former educator for 5 major brands:
  - Davines (6 years)
  - Goldwell
  - Cezanne
  - Platinum Seamless
  - Organic Color Systems
- Has trained hundreds of professionals worldwide

---

## Development Guidelines

1. **ZERO HARDCODED DATA** - See policy above
2. **Mobile First**: 68% of traffic is mobile
3. **Show Data Sources**: Always indicate where data comes from
4. **Error States**: Show clear errors, not fake fallback data
5. **API-First**: All metrics must come from API endpoints

---

## The Virtuous Cycle Engine

The admin system is designed as a living SEO engine that:
1. **Researches** - Gathers live data from APIs
2. **Analyzes** - Uses AI to identify opportunities
3. **Plans** - Creates prioritized action items
4. **Implements** - Auto-generates new pages/content
5. **Tracks** - Measures impact
6. **Repeats** - Feeds results back into research

Access via: `/admin/seo-action-plan.html`

---

## Version History

Current: **2.6.14** - ZERO hardcoded data, all dashboards use live API

Key versions:
- 2.6.14: Removed ALL hardcoded data, analytics API
- 2.6.13: Service landing pages, dashboard pages created
- 2.6.6: Google Places + Claude AI integration
- 2.6.5: PageSpeed API (free tier)

Full history in `/data/version.json`
