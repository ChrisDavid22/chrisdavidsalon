# Standard API Setup Procedure for New Websites

**Purpose**: Standardized process to ensure all APIs are properly configured when launching a new website with admin dashboard.

## Quick Status Check

**Currently Configured APIs**:
- ✅ **Google API Key**: `AIzaSyDCQAaVgiaUdYMXF32V4BflzsAA2mbVokg`
- ✅ **Google Analytics**: Tracking ID `G-XQDLWZM5NV`
- ✅ **PageSpeed API**: Working (no key needed for basic use)

## Step 1: Initial API Configuration

### Google API Key (Powers Multiple Services)

**What it provides**:
- Google Gemini AI (SEO analysis, competitor research)
- Google Custom Search (competitor discovery, ranking checks)
- Enhanced PageSpeed quotas
- Future: Maps, Places, My Business APIs

**Setup Process**:
1. Already configured in `.env` file
2. Key is automatically loaded in `ai-config.js`
3. Test at: `/admin/api-setup-wizard.html`

### Google Analytics

**Already Configured**:
- Tracking ID: `G-XQDLWZM5NV`
- Events tracked: Page views, Book Now clicks, Phone clicks

**To verify**:
1. Go to https://analytics.google.com
2. Select the Chris David Salon property
3. Check Real-time report for live data

## Step 2: Admin Dashboard Access

### Quick Test URLs

1. **API Setup Wizard**: `/admin/api-setup-wizard.html`
   - Tests all API connections
   - Shows configuration status
   - Provides quick fixes

2. **Main Dashboard**: `/admin/index.html`
   - SEO Command Center
   - 7-category analysis
   - Uses Gemini AI for insights

3. **Competitor Analysis**: `/admin/competitors.html`
   - Real competitor data
   - SEO score comparisons
   - Market position tracking

## Step 3: Testing API Functionality

### Run Full Test Suite

1. Navigate to `/admin/api-setup-wizard.html`
2. Click "Run Full API Test Suite"
3. Verify all show green checkmarks

### Manual API Tests

**Test Gemini AI**:
```javascript
// In browser console on admin page
const key = 'AIzaSyDCQAaVgiaUdYMXF32V4BflzsAA2mbVokg';
fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        contents: [{parts: [{text: "Test"}]}]
    })
}).then(r => r.json()).then(console.log);
```

**Test PageSpeed**:
```javascript
// No key needed
fetch('https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://www.chrisdavidsalon.com')
    .then(r => r.json())
    .then(data => console.log('Score:', data.lighthouseResult.categories.performance.score * 100));
```

## Step 4: Using the APIs in Admin

### SEO Analysis with Gemini

The admin dashboard now uses Google Gemini AI to:
1. Analyze your website's SEO (0-100 score)
2. Compare with competitors
3. Generate improvement recommendations
4. Create action items

**How to trigger analysis**:
1. Go to `/admin/index.html`
2. Click "Analyze with AI"
3. Wait 15-30 seconds for comprehensive analysis

### Competitor Discovery

**Automatic process**:
1. Go to `/admin/competitors.html`
2. Click "Analyze Top 10 Competitors Now"
3. Gemini AI will:
   - Find real Delray Beach salons
   - Calculate SEO scores
   - Show gaps to close

## Step 5: Fallback Systems

If APIs fail, the system automatically falls back to:

1. **Pre-researched competitor data** (5 verified salons)
2. **PageSpeed-based SEO scoring** (basic but accurate)
3. **Manual keyword lists** (top 30 keywords)
4. **Static recommendations** (general best practices)

## Step 6: Environment Variables

### For Local Development

Create `.env` file:
```env
GOOGLE_API_KEY=AIzaSyDCQAaVgiaUdYMXF32V4BflzsAA2mbVokg
```

### For Production (Vercel)

1. Go to Vercel Dashboard
2. Project Settings → Environment Variables
3. Add:
   - `GOOGLE_API_KEY`: Your Google API key
   - `NODE_ENV`: production

## Step 7: Security Considerations

⚠️ **IMPORTANT**: The API keys in `.env` were exposed in the repository. For production:

1. **Rotate keys**: Generate new API keys
2. **Use environment variables**: Never commit keys
3. **Restrict key usage**: 
   - Limit to specific APIs
   - Add domain restrictions
   - Set quotas

## Standard Checklist for New Sites

When launching a new website with admin dashboard:

- [ ] Create Google Cloud Project
- [ ] Enable required APIs (Gemini, Custom Search, PageSpeed)
- [ ] Generate API key with restrictions
- [ ] Add key to `.env` (local) and Vercel (production)
- [ ] Set up Google Analytics property
- [ ] Install GA tracking code on all pages
- [ ] Configure event tracking for conversions
- [ ] Test all APIs using setup wizard
- [ ] Verify fallback systems work
- [ ] Document API keys securely

## Quick Troubleshooting

### API Not Working?

1. Check `/admin/api-setup-wizard.html`
2. Verify key in browser localStorage:
   ```javascript
   localStorage.getItem('apiKey_GOOGLE_API_KEY')
   ```
3. Check browser console for CORS errors
4. Verify API is enabled in Google Cloud Console

### No Data Showing?

1. APIs might need 24-48 hours for initial data
2. Check if tracking code is installed
3. Verify domain is correct in API restrictions
4. Use fallback data temporarily

## Support Resources

- **Google Cloud Console**: https://console.cloud.google.com
- **Google Analytics**: https://analytics.google.com
- **API Documentation**: https://developers.google.com/gemini
- **Admin Dashboard**: `/admin/api-setup-wizard.html`

---

**Last Updated**: December 2024
**Next Review**: When launching next client website