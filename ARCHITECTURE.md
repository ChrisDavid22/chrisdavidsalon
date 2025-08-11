# Chris David Salon Website Architecture

## Directory Structure Overview

The website follows a clean, organized architecture with `01-WEBSITE/` as the primary deployment directory.

## Primary Directories

### 01-WEBSITE/ (PRODUCTION - Deployed to Vercel)
This is the **authoritative directory** containing all production website files.

- **index.html** - Main website homepage
- **blog.html** - Blog page
- **careers.html** - Careers page  
- **policies.html** - Policies page
- **premiumbrands.html** - Premium brands showcase
- **images/** - All website images (properly referenced as ./images/ in HTML)
  - Contains logos, service images, backgrounds
  - All images referenced from index.html are in this directory
- **data/** - JSON data files
  - version.json - Website version tracking
  - analytics.json - Analytics data
  - seo-metrics.json - SEO metrics
- **admin/** - Admin dashboard and tools
  - login.html - Admin login page
  - dashboard.html - Admin dashboard
  - seo-audit.html - SEO audit tool
  - seo-command-center.html - SEO command center
- **seo-sites/** - SEO microsites
  - best-delray-salon/
  - best-salon-palmbeach/
  - best-salon-site/
- **docs/** - Documentation files
- **js/** - JavaScript files
- **deploy.sh** - Deployment script
- **robots.txt** - Search engine directives
- **sitemap.xml** - XML sitemap for search engines

### Supporting Directories

- **02-SEO-TOOLS/** - SEO tracking and automation tools
- **03-AUTOMATION/** - Automation scripts
- **04-IMAGES/** - Original image repository (not used in production)
- **05-REPORTS/** - Various reports and documentation
- **06-SERVICE-PAGES/** - Service-specific landing pages
- **07-LOCATION-PAGES/** - Location-specific landing pages

## Image Architecture

**IMPORTANT**: All images in the website are stored in and served from:
`01-WEBSITE/images/`

HTML files reference images using relative paths:
```html
<img src="./images/filename.jpg">
```

## Deployment Configuration

**vercel.json** Configuration:
```json
{
  "buildCommand": "cd 01-WEBSITE && echo 'Using 01-WEBSITE directory'",
  "outputDirectory": "01-WEBSITE",
  "public": true
}
```

This ensures Vercel deploys from the correct directory.

## Version Management

Website version is tracked in `01-WEBSITE/data/version.json` and displayed dynamically in the footer:
- Current Version: 2.5.8
- Version history maintained in JSON file
- Loaded dynamically via JavaScript

## Admin Access

Admin panel accessible at: `/admin/login.html`
- Link available in website footer
- Protected admin dashboard for site management

## Key Principles

1. **Single Source of Truth**: 01-WEBSITE/ is the only production directory
2. **No Duplicates**: All duplicate files removed from root
3. **Proper Paths**: All image references use ./images/ relative path
4. **Version Tracking**: Dynamic version display from JSON
5. **Clean Structure**: Organized, maintainable directory hierarchy

## Maintenance Notes

- Always edit files in 01-WEBSITE/ directory
- Images should be added to 01-WEBSITE/images/
- Update version.json when deploying changes
- Use deploy.sh script in 01-WEBSITE/ for deployments
- Vercel automatically deploys from 01-WEBSITE/ directory