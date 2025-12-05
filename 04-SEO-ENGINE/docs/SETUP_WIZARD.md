# SEO System Setup Wizard

Use this interactive guide to set up the Universal SEO System on any website.

---

## Pre-Flight Checklist

Before starting, ensure you have:

- [ ] A website deployed (preferably on Vercel)
- [ ] Google account for API access
- [ ] GitHub repository for your code
- [ ] 30 minutes for initial setup

---

## Step 1: Gather Your Business Information

Please provide the following details:

```
Business Name: ________________________
Website Domain: ________________________
Business Address: ________________________
Phone Number: ________________________
Business Category: ________________________ (e.g., "hair salon", "restaurant", "dentist")
Primary Location: ________________________ (city, state)
```

**Top 5 Competitors** (we'll track these):
1. Name: ______________ Domain: ______________
2. Name: ______________ Domain: ______________
3. Name: ______________ Domain: ______________
4. Name: ______________ Domain: ______________
5. Name: ______________ Domain: ______________

---

## Step 2: Google Analytics 4 (GA4)

### Do you already have GA4 set up?

**If YES:**
1. Go to https://analytics.google.com
2. Click Admin (gear icon)
3. Under Property column, click "Property Settings"
4. Copy your **Property ID** (numeric, like `123456789`)

**If NO:**
1. Go to https://analytics.google.com
2. Click Admin > Create Property
3. Enter your website name
4. Set reporting time zone
5. Click "Create"
6. Set up data stream for your website
7. Copy the **Property ID**

### Create Service Account (Required for API access)

1. Go to https://console.cloud.google.com
2. Select your project (or create new one)
3. Navigate to: **IAM & Admin > Service Accounts**
4. Click **"Create Service Account"**
   - Name: `seo-analytics-reader`
   - Click "Create and Continue"
   - Skip role selection for now
   - Click "Done"
5. Click on your new service account
6. Go to **"Keys" tab**
7. Click **"Add Key" > "Create new key"**
8. Select **JSON** format
9. Click "Create" - file will download
10. **Keep this file safe!** It contains your credentials.

### Grant GA4 Access to Service Account

1. Open the downloaded JSON file
2. Copy the `client_email` value (looks like `something@project.iam.gserviceaccount.com`)
3. In GA4, go to Admin > Property Access Management
4. Click "+" to add user
5. Paste the service account email
6. Select role: **Viewer**
7. Click "Add"

### Save Your Credentials

```
GA4_PROPERTY_ID = [your property ID]
GOOGLE_SERVICE_ACCOUNT_JSON = [entire contents of JSON file, on one line]
```

---

## Step 3: Google Places API

### Enable the API

1. Go to https://console.cloud.google.com
2. Make sure correct project is selected
3. Go to **APIs & Services > Library**
4. Search for "**Places API**"
5. Click on it and click **"Enable"**

### Create API Key

1. Go to **APIs & Services > Credentials**
2. Click **"Create Credentials" > "API Key"**
3. Your key is created - click "Edit API key"
4. Under "API restrictions":
   - Select "Restrict key"
   - Choose only "Places API"
5. Click "Save"

### Save Your Credential

```
GOOGLE_PLACES_API_KEY = [your API key]
```

---

## Step 4: OpenPageRank API

### Get Free API Key

1. Go to https://www.domcop.com/openpagerank/
2. Click "Get Your Free API Key"
3. Sign up with email
4. Verify email
5. Go to Dashboard
6. Copy your API key

### Save Your Credential

```
OPENPAGERANK_API_KEY = [your API key]
```

---

## Step 5: (Optional) Anthropic API for AI Recommendations

### Get API Key

1. Go to https://console.anthropic.com
2. Sign up or log in
3. Go to API Keys
4. Create new key
5. Copy the key (starts with `sk-ant-`)

### Save Your Credential

```
ANTHROPIC_API_KEY = [your API key]
```

---

## Step 6: Configure Environment Variables

### For Vercel Deployment

1. Go to your Vercel project dashboard
2. Click **Settings > Environment Variables**
3. Add each variable:

| Name | Value |
|------|-------|
| GA4_PROPERTY_ID | Your property ID |
| GOOGLE_SERVICE_ACCOUNT_JSON | Entire JSON (one line, no line breaks) |
| GOOGLE_PLACES_API_KEY | Your Places API key |
| OPENPAGERANK_API_KEY | Your OpenPageRank key |
| ANTHROPIC_API_KEY | Your Anthropic key (optional) |

4. Click "Save"
5. Redeploy your project

### For Local Development

Create `.env.local` file in your project root:

```bash
GA4_PROPERTY_ID=123456789
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
GOOGLE_PLACES_API_KEY=AIzaSy...
OPENPAGERANK_API_KEY=abc123...
ANTHROPIC_API_KEY=sk-ant-api03-...
```

---

## Step 7: Customize for Your Business

### Update Competitor List

Edit `api/competitors.js`:

```javascript
const ALL_COMPETITORS = [
  { name: 'YOUR BUSINESS', domain: 'yourdomain.com', isUs: true },
  { name: 'Competitor 1', domain: 'competitor1.com' },
  { name: 'Competitor 2', domain: 'competitor2.com' },
  { name: 'Competitor 3', domain: 'competitor3.com' },
  { name: 'Competitor 4', domain: 'competitor4.com' },
  { name: 'Competitor 5', domain: 'competitor5.com' }
];
```

### Update Search Query

Edit `api/competitors.js` in `fetchPlacesData()`:

```javascript
// Change this to your business type and location
const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${YOUR_BUSINESS_TYPE}+${YOUR_CITY}+${YOUR_STATE}&key=${GOOGLE_PLACES_API_KEY}`;
```

### Update GitHub Workflow

Edit `.github/workflows/seo-flywheel.yml`:

```yaml
env:
  SITE_URL: https://www.yourdomain.com
  # Add microsites if you have them
  MICROSITE_1: https://microsite1.com
```

---

## Step 8: Deploy and Verify

### Deploy Changes

```bash
git add -A
git commit -m "Configure SEO system for [Your Business]"
git push
```

### Verify APIs Work

Test each endpoint:

```bash
# Test GA4
curl https://yourdomain.com/api/ga4-analytics?type=overview

# Test Authority
curl https://yourdomain.com/api/authority-score

# Test Competitors
curl https://yourdomain.com/api/competitors?action=rankings

# Test Health Check
curl https://yourdomain.com/api/seo-analysis-engine?action=health-check
```

### Run First Workflow

1. Go to GitHub > Actions tab
2. Click "SEO Learning Flywheel"
3. Click "Run workflow"
4. Select main branch
5. Click "Run workflow" button
6. Watch the run complete

---

## Step 9: Access Your Dashboard

Navigate to: `https://yourdomain.com/admin/`

You should see:
- SEO Command Center with overall score
- Traffic metrics from GA4
- Competitor rankings
- Authority tracking

---

## Verification Checklist

- [ ] GA4 API returns traffic data
- [ ] Places API returns competitors
- [ ] OpenPageRank returns authority score
- [ ] GitHub Actions workflow runs successfully
- [ ] Admin dashboard loads with real data
- [ ] Historical snapshots being saved

---

## Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| "Authentication failed" | Check service account JSON is valid, one line |
| "API key invalid" | Verify key is enabled in Google Cloud Console |
| "0 competitors" | Check Places API is enabled, key unrestricted |
| "No traffic data" | Verify GA4 property ID, service account has access |
| "Workflow failed" | Check secrets are set, workflow file is valid |
| "Dashboard shows --" | APIs not configured or returning errors |

---

## Support Resources

- **GA4 Documentation**: https://developers.google.com/analytics/devguides/reporting/data/v1
- **Places API Docs**: https://developers.google.com/maps/documentation/places/web-service
- **OpenPageRank Docs**: https://www.domcop.com/openpagerank/documentation
- **Vercel Docs**: https://vercel.com/docs

---

## Next Steps After Setup

1. **Wait 1 week** for first automated report
2. **Monitor** admin dashboard daily
3. **Review** gap analysis recommendations
4. **Implement** suggested optimizations
5. **Track** week-over-week improvements

---

*Setup wizard complete! Your SEO system is now configured.*
