# COMPLETE SITE INVENTORY - Chris David Salon
## Last Verified: August 11, 2025
## Version: 2.5.11

## ✅ PRODUCTION FILES IN /01-WEBSITE/

### Main Pages (Public)
1. **index.html** - Main homepage (WAS enhanced_website.html - NOW DELETED)
2. **careers.html** - Careers/jobs page
3. **premiumbrands.html** - Premium brands showcase
4. **blog.html** - Blog page
5. **policies.html** - Policies page

### Admin Pages (/admin/)
1. **login.html** - Admin login (Password: CDK2025)
2. **dashboard.html** - Main admin dashboard
3. **analytics-dashboard.html** - Google Analytics dashboard
4. **seo-command-center.html** - SEO management center
5. **seo-audit.html** - SEO audit tool
6. **admin-nav.html** - Navigation component

### API Endpoints (/api/)
1. **get-keys.js** - Fetches API keys from Vercel env
2. **save-config.js** - Saves configuration

### Data Files (/data/)
1. **version.json** - Version tracking
2. **seo-tracking.json** - SEO metrics and microsites
3. **analytics.json** - Analytics data
4. **seo-metrics.json** - SEO performance metrics

### SEO Microsites (/seo-sites/)
1. **best-delray-salon/** - Microsite with 5 backlinks
2. **best-salon-palmbeach/** - Microsite with 5 backlinks  
3. **best-salon-site/** - Microsite with 5 backlinks

### Supporting Files
- **robots.txt** - Search engine directives
- **sitemap.xml** - XML sitemap
- **deploy.sh** - Deployment script (USE THIS ALWAYS!)
- **/images/** - All website images
- **/js/** - JavaScript files
- **/docs/** - Documentation

## 🔗 SITE NAVIGATION STRUCTURE

### From index.html:
- Home → `#home` (top of page)
- About → `#about` (section)
- Services → `#services` (section)
- Gallery → `#gallery` (section)
- Reviews → `#testimonials` (section)
- Contact → `#contact` (section)
- Careers → `careers.html`
- Premium Brands → `premiumbrands.html`
- Blog → `blog.html`
- Policies → `policies.html` (footer link)
- Admin → `./admin/login.html` (footer link)

### From other pages:
All link back to `index.html` and its sections (NOT enhanced_website.html)

## 🚀 DEPLOYMENT INSTRUCTIONS

### ALWAYS USE THE DEPLOY SCRIPT:
```bash
cd /01-WEBSITE
./deploy.sh "Your commit message"
```

This script:
1. Increments version in version.json
2. Commits to Git
3. Pushes to GitHub
4. Triggers Vercel deployment

### NEVER:
- Manually edit version.json
- Deploy without the script
- Create files outside /01-WEBSITE/

## 🔍 GOOGLE CRAWLABILITY

### Publicly Accessible Pages:
- ✅ index.html
- ✅ careers.html
- ✅ premiumbrands.html
- ✅ blog.html
- ✅ policies.html
- ✅ All microsites in /seo-sites/

### Blocked from Crawling:
- ❌ /admin/* (via robots.txt and noindex meta tags)
- ❌ /api/* (serverless functions)

### SEO Features:
- XML sitemap at /sitemap.xml
- Schema.org markup on all pages
- Meta descriptions and keywords
- Open Graph tags for social sharing
- 15 backlinks from microsites

## ⚠️ CRITICAL REMINDERS

1. **NO enhanced_website.html** - It's DELETED. Use index.html
2. **API Keys**: CLAUDE_API_KEY and GOOGLE_PLACES_API_KEY (in Vercel)
3. **Always use deploy.sh** for deployments
4. **Admin password**: CDK2025
5. **All production files** are in /01-WEBSITE/

## 📊 CURRENT STATUS
- Version: 2.5.11
- SEO Score: 88/100
- Microsites: 3 active
- Backlinks: 15 total
- Last Deploy: August 11, 2025