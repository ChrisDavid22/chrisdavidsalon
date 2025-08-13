# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chris David Salon website with comprehensive admin dashboard for business intelligence and marketing automation. Located in Delray Beach, competing with 47 other salons.

**Live Site**: https://chrisdavidsalon.com  
**GitHub**: https://github.com/ChrisDavid22/chrisdavidsalon.git  
**Deployment**: Vercel (auto-deploys from main branch)

## Essential Commands

### Deploy Changes
```bash
# FROM ROOT DIRECTORY (UPDATED 2025-08-12):
./deploy.sh "Description of changes"

# OR FROM 01-WEBSITE DIRECTORY:
cd 01-WEBSITE && ./deploy.sh "Description of changes"

# Skip tests if needed (not recommended)
./deploy.sh "Description" --skip-tests

# The script now VERIFIES deployment - wait for confirmation!
# It will show either:
#   ✅ VERIFIED: Version X.X.X is LIVE
#   ⚠️  WARNING: Version mismatch!
```

### CRITICAL: Verify Deployment Before Claiming Success
```bash
# NEVER say "deployed" until you verify:
curl -s https://www.chrisdavidsalon.com/data/version.json | grep version

# If version.json has errors, the site shows "Loading..." or falls back to "2.6.0"
# Always check the actual JSON is valid and matches expected version
```

### Run Tests
```bash
# Pre-deployment checks
bash tests/pre-deploy-check.sh --local

# Audit fake data
cd admin && node audit-fake-data.js
```

### Check Status
```bash
# Current version
cat data/version.json

# Git status
git status

# View real analytics data
cat data/analytics.json
```

## High-Level Architecture

### Directory Structure
```
01-WEBSITE/                    # Root deployed to Vercel
├── admin/                     # 16 admin dashboard pages
│   ├── index.html            # Admin hub with navigation to all pages
│   ├── backlink-*.html       # Backlink campaign tools (3 pages)
│   ├── revenue-tracker.html  # Revenue analytics (needs Boulevard API)
│   └── [13 more pages]       # Analytics, SEO, competition monitoring
├── data/                      # Persistent JSON data storage
│   ├── version.json          # Auto-incremented by deploy.sh
│   ├── analytics.json        # Real visitor data (247 visitors, 68% mobile)
│   └── seo-tracking.json     # SEO metrics and backlink data
├── tools/                     # Automation scripts and utilities
├── reports/                   # Analysis documents
└── deploy.sh                  # CRITICAL: Always use for deployment
```

### Admin System Architecture

**16 Interconnected Pages** accessible from `/admin/index.html`:
- **Core Hub**: Unified navigation bar on ALL pages
- **Backlink System**: 90 directories ready, 87 pending submission
- **Analytics**: Real data from analytics.json (247 visitors)
- **Revenue**: Awaiting Boulevard API integration
- **Competition**: Tracking 47 local competitors

**Navigation Pattern**: Every admin page has identical nav bar with color-coded sections:
- Purple: Core pages
- Green: Backlink tools  
- Blue: Analytics
- Yellow: Market position
- Orange: SEO tools

### Data Flow

1. **Real Data Sources**:
   - `data/analytics.json`: Actual visitor metrics (247 visitors, 68% mobile)
   - Google My Business: 133 reviews, 4.9★ rating
   - Manual competitor research

2. **Pending Integrations**:
   - Boulevard API: Revenue and booking data
   - Google Search Console: Keyword rankings
   - Form tracking: Contact form submissions

3. **Fake Data Policy**: 
   - ALL fake numbers removed
   - Greyed-out "Awaiting API" placeholders used
   - Never show misleading statistics

## Critical Business Context

### Competition Landscape
- **#1**: Salon Sora (203 reviews, 8 years)
- **#2**: Drybar (189 reviews, national chain)
- **#3**: The W Salon (156 reviews, 5 years)
- **#15**: Chris David Salon (127 reviews, rising fast)

### Key Metrics (Real Data)
- **Visitors**: 247/month (August)
- **Mobile Traffic**: 68% (168 visitors)
- **Booking Clicks**: 28
- **Phone Clicks**: 45
- **Conversion Rate**: 11.3%
- **SEO Score**: 83/100

### Chris David's Credentials
- 20+ years cutting expertise
- Former educator for 5 major brands:
  - Davines (6 years)
  - Goldwell
  - Cezanne
  - Platinum Seamless
  - Organic Color Systems

## Immediate Priorities

1. **Execute Backlink Campaign**
   - Navigate to `/admin/backlink-campaign.html`
   - 87 directories ready for submission
   - Click "START AUTOMATED CAMPAIGN"

2. **Boulevard API Request**
   - Email ready at `/tools/boulevard-api-request.txt`
   - Send to: support@blvd.co
   - Unlocks revenue tracking

3. **Monitor Production**
   - Check https://chrisdavidsalon.com/admin/
   - Verify mobile responsiveness (68% of traffic)
   - Ensure data updates properly

## Version Management

**Current**: 2.5.14 (auto-increments with deploy.sh)

**Version History**: Tracked in `data/version.json` with:
- Version number
- Timestamp
- Change description
- Last 10 deployments

**NEVER** manually push to git. **ALWAYS** use `./deploy.sh`

## Important URLs & Credentials

- **Admin Login**: `/admin/login.html`
- **Password**: CDK2025
- **Vercel Dashboard**: Check deployment status
- **GitHub Repo**: ChrisDavid22/chrisdavidsalon

## Project Status Documentation (Added 2025-08-12)

- **PROJECT-STATUS-ASSESSMENT.md**: Comprehensive reality check and findings
- **CRITICAL-ACTION-ITEMS.md**: Immediate tasks with step-by-step instructions
- Both files in root directory - READ THESE FIRST in next session

## Development Guidelines

1. **No Fake Data**: Use real numbers or "Pending API" placeholders
2. **Mobile First**: 68% of traffic is mobile
3. **Use Deploy Script**: Auto-increments version, maintains history
4. **File Organization**:
   - Reports → `/reports/`
   - Tools → `/tools/`
   - Admin features → `/admin/`
5. **Test Before Deploy**: Run `tests/pre-deploy-check.sh`

## API Integration Status

✅ **Working**:
- Static site deployment
- Admin dashboard navigation
- Real analytics data display

⏳ **Pending**:
- Boulevard API (revenue/bookings)
- Google Search Console (rankings)
- Google My Business API (reviews)
- Weather API (demand correlation)

## Next Session Checklist

1. Check PROJECT-TODO.md for latest priorities
2. Verify version in data/version.json
3. Run `git status` to check for uncommitted changes
4. Execute pending backlink campaign if not done
5. Check Boulevard API response status