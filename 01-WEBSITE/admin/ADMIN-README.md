# Chris David Salon Admin System Documentation

## CRITICAL: READ THIS FIRST

**Last Updated**: August 11, 2025
**Version**: 2.5.10

## Website Structure - THE TRUTH

### Production Website
- **Location**: `/01-WEBSITE/`
- **Main Site**: `index.html` (NOT enhanced_website.html - that's DELETED)
- **Admin URL**: `https://chrisdavidsalon.com/admin/login.html`
- **Password**: `CDK2025`

### Admin Pages (ALL IN `/01-WEBSITE/admin/`)
1. **login.html** - Login page
2. **dashboard.html** - Main admin dashboard
3. **analytics-dashboard.html** - Google Analytics page
4. **seo-command-center.html** - SEO management center
5. **seo-audit.html** - SEO audit tool

### API Keys (Vercel Environment Variables)
- **CLAUDE_API_KEY** - For Claude/Anthropic API
- **GOOGLE_PLACES_API_KEY** - For Google APIs (NOT GOOGLE_API_KEY!)

## Common Issues & Fixes

### Issue: [object Promise]/100 appears instead of SEO score
**Cause**: The `calculateSEOScore()` function is async but not being awaited
**Fix**: 
```javascript
// WRONG:
const seoScore = calculateSEOScore();

// RIGHT:
const seoScore = await calculateSEOScore();
```

### Issue: API Status shows "Not Configured"
**Cause**: Using wrong environment variable names
**Fix**: Use exactly:
- `CLAUDE_API_KEY`
- `GOOGLE_PLACES_API_KEY`

### Issue: Images not loading
**Cause**: Wrong image paths
**Fix**: All images are in `/01-WEBSITE/images/` and should be referenced as `./images/filename.jpg`

## Navigation Structure

### Main Website Navigation
- Home (index.html)
- Services (#services)
- About (#about)
- Gallery (#gallery)
- Testimonials (#testimonials)
- Contact (#contact)
- Careers (careers.html)
- Premium Brands (premiumbrands.html)
- Blog (blog.html)
- Policies (policies.html)

### Admin Navigation
- Main Dashboard (dashboard.html)
- Google Analytics (analytics-dashboard.html)
- SEO Center (seo-command-center.html)
- SEO Audit (seo-audit.html)

## Microsites
Located in `/01-WEBSITE/seo-sites/`:
1. **best-delray-salon/** - 5 backlinks to main site
2. **best-salon-palmbeach/** - 5 backlinks to main site
3. **best-salon-site/** - 5 backlinks to main site

## SEO Score Calculation
- **Base Technical SEO**: 28 points
- **Content Quality**: 28 points
- **Backlinks**: 12 points (includes microsites)
- **Local SEO**: 15 points
- **User Experience**: 10 points
- **Total**: 93/106 = 88/100

## Files That Should NOT Exist
The following have been DELETED - do not recreate:
- `/enhanced_website.html` (content moved to `/01-WEBSITE/index.html`)
- `/index.html` in root (use `/01-WEBSITE/index.html`)
- Any duplicate files in root directory

## Deployment
```bash
cd /01-WEBSITE
./deploy.sh "Your commit message"
```

Vercel deploys from `/01-WEBSITE/` directory ONLY.

## NEVER FORGET
1. **01-WEBSITE/** is the ONLY production directory
2. **index.html** is the main file (NOT enhanced_website.html)
3. API keys are `CLAUDE_API_KEY` and `GOOGLE_PLACES_API_KEY`
4. Always await async functions like `calculateSEOScore()`
5. Images are in `./images/` relative to index.html
6. Admin password is `CDK2025`

## Testing Checklist
- [ ] Main website loads at chrisdavidsalon.com
- [ ] All images display properly
- [ ] Admin link in footer works
- [ ] Version displays in footer
- [ ] Admin login works with CDK2025
- [ ] SEO score shows a number (not [object Promise])
- [ ] API status shows green when keys are configured
- [ ] All navigation links work
- [ ] Microsites are tracked in dashboard

## Support
If issues persist after following this guide, check:
1. Browser console for JavaScript errors
2. Network tab for failed API calls
3. Vercel dashboard for environment variables
4. GitHub for latest deployment status