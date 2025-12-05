# Universal SEO Skill - Complete Documentation

## Overview

The **Universal SEO Skill** is a complete, autonomous SEO optimization system that can be deployed to any website. It combines real-time data collection, AI-powered analysis, automated optimization, and self-learning capabilities to continuously improve search rankings.

---

## What It Does

### Core Capabilities

1. **Data Ingestion** - Collects real metrics from multiple sources:
   - Traffic data from Google Analytics 4
   - Authority scores from OpenPageRank
   - Competitor reviews from Google Places API
   - Performance metrics from PageSpeed Insights
   - Keyword rankings from Search Console

2. **Gap Analysis** - Identifies SEO weaknesses:
   - Compares current metrics against targets
   - Prioritizes issues by severity (CRITICAL > HIGH > MEDIUM)
   - Generates actionable recommendations

3. **Automated Execution** - Takes safe actions automatically:
   - Pings sitemaps to search engines
   - Warms cache on priority pages
   - Monitors site health
   - Tracks keyword positions

4. **Historical Tracking** - Measures progress over time:
   - Weekly snapshots stored in repository
   - Week-over-week comparisons
   - Trend detection and analysis

5. **Self-Learning** - Gets smarter with each cycle:
   - RuVector knowledge graph learns patterns
   - Success/failure feedback improves recommendations
   - AI recommendations based on learned patterns

---

## Architecture

```
                    +-------------------+
                    |  GitHub Actions   |
                    |  (Weekly Trigger) |
                    +--------+----------+
                             |
        +--------------------+--------------------+
        |                    |                    |
        v                    v                    v
+---------------+   +----------------+   +----------------+
| INGEST Phase  |   | ANALYZE Phase  |   | DECIDE Phase   |
| - GA4 Traffic |   | - Gap Analysis |   | - Prioritize   |
| - Authority   |   | - Comparisons  |   | - Plan Actions |
| - Competitors |   | - Severity     |   | - Auto/Manual  |
| - Performance |   +----------------+   +----------------+
| - Keywords    |            |                    |
+---------------+            v                    v
        |           +----------------+   +----------------+
        |           | EXECUTE Phase  |   | PERSIST Phase  |
        |           | - Safe Actions |   | - Save Snapshot|
        |           | - Ping Search  |   | - Commit to Git|
        |           | - Warm Cache   |   | - Track History|
        |           +----------------+   +----------------+
        |                    |                    |
        +--------------------+--------------------+
                             |
                    +--------v----------+
                    |  LEARN Phase      |
                    |  RuVector Updates |
                    +-------------------+
```

---

## Required API Keys

### 1. Google Analytics 4 (GA4)
**Purpose**: Traffic data, user behavior, conversions
**Cost**: FREE
**Required Variables**:
- `GA4_PROPERTY_ID` - Your GA4 property ID (numeric)
- `GOOGLE_SERVICE_ACCOUNT_JSON` - Service account credentials

### 2. Google Places API
**Purpose**: Competitor reviews, ratings, local search data
**Cost**: FREE tier (up to $200/month credit)
**Required Variables**:
- `GOOGLE_PLACES_API_KEY`

### 3. OpenPageRank API
**Purpose**: Domain authority scores
**Cost**: FREE (with rate limits)
**Required Variables**:
- `OPENPAGERANK_API_KEY`

### 4. Anthropic API (Optional)
**Purpose**: AI-powered SEO recommendations
**Cost**: Pay per use
**Required Variables**:
- `ANTHROPIC_API_KEY`

---

## Setup Wizard

### Step 1: Google Analytics 4 Setup

1. **Create GA4 Property** (if not exists)
   - Go to https://analytics.google.com
   - Admin > Create Property
   - Note your Property ID (looks like `123456789`)

2. **Create Service Account**
   - Go to https://console.cloud.google.com
   - Create new project or select existing
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Name it something like "seo-analytics-reader"
   - Grant role: "Viewer"
   - Create key (JSON format)
   - Download the JSON file

3. **Grant GA4 Access**
   - In GA4, go to Admin > Property Access Management
   - Add the service account email (from JSON file)
   - Grant "Viewer" access

4. **Set Environment Variables**
   ```bash
   GA4_PROPERTY_ID=your-property-id
   GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
   ```

### Step 2: Google Places API Setup

1. **Enable Places API**
   - Go to https://console.cloud.google.com
   - APIs & Services > Enable APIs
   - Search for "Places API" and enable it

2. **Create API Key**
   - APIs & Services > Credentials
   - Create Credentials > API Key
   - Restrict key to Places API only (recommended)

3. **Set Environment Variable**
   ```bash
   GOOGLE_PLACES_API_KEY=AIzaSy...your-key
   ```

### Step 3: OpenPageRank API Setup

1. **Get Free API Key**
   - Go to https://www.domcop.com/openpagerank/
   - Sign up for free account
   - Get your API key from dashboard

2. **Set Environment Variable**
   ```bash
   OPENPAGERANK_API_KEY=your-key-here
   ```

### Step 4: Deploy to Vercel

1. **Import Repository**
   ```bash
   git clone [your-repo]
   cd [your-repo]
   vercel
   ```

2. **Add Environment Variables in Vercel**
   - Project Settings > Environment Variables
   - Add all 4 keys from above

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Step 5: Enable GitHub Actions

1. **Add Repository Secrets**
   - Go to Settings > Secrets > Actions
   - Add `GITHUB_TOKEN` (auto-provided)

2. **Verify Workflow Exists**
   - Check `.github/workflows/seo-flywheel.yml` exists
   - Schedule runs Sunday 6 AM EST

3. **Trigger First Run**
   - Actions tab > SEO Learning Flywheel
   - "Run workflow" button

---

## File Structure

```
project/
├── api/
│   ├── ga4-analytics.js        # Traffic data
│   ├── authority-score.js      # Domain authority
│   ├── competitors.js          # Competitor analysis
│   ├── seo-analysis-engine.js  # Analysis + snapshots
│   ├── gbp-agent.js           # Google Business Profile
│   └── proactive-seo-agent.js # Automated recommendations
│
├── admin/
│   ├── index.html             # SEO Command Center
│   ├── traffic.html           # Traffic dashboard
│   ├── competitors.html       # Competitor tracking
│   ├── authority.html         # Authority tracking
│   └── seo-learning.html      # Learning dashboard
│
├── data/
│   ├── historical-metrics.json # Weekly snapshots
│   └── seo-changes-log.json   # Change history
│
└── .github/workflows/
    └── seo-flywheel.yml       # Automation workflow
```

---

## API Endpoints

### Traffic Data
```
GET /api/ga4-analytics?type=overview
GET /api/ga4-analytics?type=traffic-sources
GET /api/ga4-analytics?type=top-pages
```

### Authority Score
```
GET /api/authority-score
GET /api/authority-score?competitors=true
```

### Competitor Analysis
```
GET /api/competitors?action=rankings
GET /api/competitors?action=pagespeed
```

### SEO Analysis Engine
```
GET /api/seo-analysis-engine?action=analyze
GET /api/seo-analysis-engine?action=health-check
GET /api/seo-analysis-engine?action=capture-snapshot
GET /api/seo-analysis-engine?action=compare-weeks
```

### GBP Optimization
```
GET /api/gbp-agent?action=audit
GET /api/gbp-agent?action=weekly-tasks
```

---

## Customization

### Adding Your Business Info

Edit the business configuration in your API files:

```javascript
const BUSINESS = {
  name: 'Your Business Name',
  domain: 'yourdomain.com',
  address: '123 Main St, City, State ZIP',
  phone: '(555) 123-4567',
  category: 'Your Business Category'
};
```

### Adding Competitors

Edit `api/competitors.js`:

```javascript
const ALL_COMPETITORS = [
  { name: 'Your Business', domain: 'yourdomain.com', isUs: true },
  { name: 'Competitor 1', domain: 'competitor1.com' },
  { name: 'Competitor 2', domain: 'competitor2.com' },
  // Add more competitors...
];
```

### Customizing Targets

Edit targets in the GitHub workflow or API files:

```javascript
const TARGETS = {
  reviews: { min: 50, competitive: 100, dominant: 200 },
  pagerank: { target: 3.5 },
  performance: { target: 90 },
  bounceRate: { max: 60 }
};
```

### Customizing Schedule

Edit `.github/workflows/seo-flywheel.yml`:

```yaml
on:
  schedule:
    # Run every Sunday at 6 AM EST (11:00 UTC)
    - cron: '0 11 * * 0'
```

---

## Monitoring & Verification

### Check System Health
```bash
curl https://yourdomain.com/api/seo-analysis-engine?action=health-check
```

### View Latest Metrics
```bash
curl https://yourdomain.com/api/ga4-analytics?type=overview
```

### Check GitHub Actions
- Go to your repo > Actions tab
- Look for "SEO Learning Flywheel" workflow
- Check run history and logs

### View Admin Dashboard
- Navigate to `https://yourdomain.com/admin/`
- SEO Command Center shows overall score
- Individual pages show detailed metrics

---

## Troubleshooting

### "API key not configured"
- Check environment variables in Vercel dashboard
- Verify key names match exactly
- Redeploy after adding variables

### "0 competitors returned"
- Verify GOOGLE_PLACES_API_KEY is set
- Check Places API is enabled in Google Cloud Console
- Check API key has no IP restrictions blocking Vercel

### "Historical snapshots empty"
- Run the workflow manually to trigger first snapshot
- Check workflow has write permissions
- Verify `historical-metrics.json` exists

### "Workflow not running"
- Check `.github/workflows/` folder exists
- Verify workflow file syntax
- Enable Actions in repo Settings

---

## Extending the System

### Adding New Data Sources

1. Create new API endpoint in `/api/`
2. Add fetch function to workflow
3. Include in snapshot capture
4. Update dashboard to display

### Adding New Metrics

1. Define new metric in analysis engine
2. Add to targets configuration
3. Include in gap analysis logic
4. Update historical tracking

### Adding Alerts

1. Add email/SMS notification step to workflow
2. Configure webhook for critical issues
3. Set up Slack integration if desired

---

## Support

### Documentation
- Main CLAUDE.md for project overview
- Individual API files have inline comments
- Admin dashboard has help tooltips

### Common Issues
- See Troubleshooting section above
- Check GitHub Issues for known problems
- Review workflow logs for errors

### Updates
- System auto-updates knowledge weekly
- Manual workflow runs trigger immediate updates
- API endpoints always return latest data

---

*Last Updated: December 2025*
*Version: 2.24.0*
