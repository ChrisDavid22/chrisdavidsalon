# SEO Sites Directory - Chris David Salon

## 📁 Directory Structure

```
01-WEBSITE/
├── index.html                    # Main chrisdavidsalon.com site
├── admin/                        # Admin dashboard & SEO tools
│   ├── dashboard.html           # Main SEO dashboard
│   ├── BUSINESS-CONTEXT.md      # Business strategy docs
│   └── api-config.js            # API configuration
│
├── seo-sites/                   # SEO-FOCUSED MICROSITES
│   ├── best-salon-site/         # bestdelrayhairsalon.com
│   ├── locations/               # Location-specific pages (future)
│   ├── services/                # Service-specific landing pages (future)
│   └── campaigns/               # Campaign landing pages (future)
│
├── data/                        # Persistent data storage
│   ├── version.json
│   ├── analytics.json
│   └── seo-data.json
│
└── docs/                        # Documentation
    ├── PROJECT-DOCUMENTATION.md
    ├── SEO-TODO.md
    ├── SECURITY-SETUP.md
    └── BEST-SALON-STRATEGY.md
```

## 🌐 Current SEO Sites

### 1. bestdelrayhairsalon.com
- **Location**: `/seo-sites/best-salon-site/`
- **Purpose**: Capture "best salon" searches
- **Status**: Ready to deploy
- **Target Keywords**: 
  - best hair salon delray beach
  - best colorist delray beach
  - best balayage delray beach

## 🚀 Planned SEO Sites

### 2. Service-Specific Landing Pages
**Directory**: `/seo-sites/services/`

- **balayage-delray.html** - Target: "balayage delray beach"
- **color-correction-delray.html** - Target: "color correction delray beach"
- **hair-extensions-delray.html** - Target: "hair extensions delray beach"
- **brazilian-blowout-delray.html** - Target: "brazilian blowout delray beach"

### 3. Location-Specific Pages
**Directory**: `/seo-sites/locations/`

- **atlantic-ave-salon.html** - Target: "hair salon atlantic ave"
- **downtown-delray-salon.html** - Target: "downtown delray hair salon"
- **east-delray-salon.html** - Target: "east delray beach salon"

### 4. Campaign Landing Pages
**Directory**: `/seo-sites/campaigns/`

- **new-client-special.html** - For paid ads
- **summer-highlights.html** - Seasonal campaigns
- **wedding-hair.html** - Event-specific

## 🛠️ Deployment Strategy

### For Each SEO Site:

1. **Single Domain Setup** (bestdelrayhairsalon.com):
```bash
# Deploy to Vercel
vercel --prod --name best-salon ./seo-sites/best-salon-site

# Or GitHub Pages
git subtree push --prefix=01-WEBSITE/seo-sites/best-salon-site origin gh-pages
```

2. **Subdomain Setup** (balayage.chrisdavidsalon.com):
```bash
# In Vercel, add subdomain
# Point to specific directory
```

3. **Subdirectory Setup** (chrisdavidsalon.com/balayage):
```bash
# Already works - just create in seo-sites/services/
# Access via: chrisdavidsalon.com/seo-sites/services/balayage-delray
```

## 📊 Tracking & Analytics

Each SEO site should have:
- Separate Google Analytics property
- Separate Search Console property
- UTM tracking for conversions
- Call tracking numbers (optional)

## ✅ SEO Site Checklist

For each new SEO site/page:

- [ ] Unique, keyword-focused content
- [ ] Schema markup (LocalBusiness/Service)
- [ ] Meta tags optimized for target keyword
- [ ] Mobile responsive design
- [ ] Fast loading (<2 seconds)
- [ ] Clear CTAs to main booking
- [ ] Link to main site (not from)
- [ ] Submit to Search Console
- [ ] Create backlinks
- [ ] Track in dashboard

## 🎯 Priority Order

1. **bestdelrayhairsalon.com** - Deploy immediately (highest value)
2. **Balayage landing page** - High search volume (720/mo)
3. **Color correction page** - High value service ($350+)
4. **Atlantic Ave location page** - Local searches
5. **New client special** - For Google Ads

## 📈 Expected Results

### Per SEO Site:
- **Month 1**: Indexed, position 50-100
- **Month 2**: Position 20-50, first traffic
- **Month 3**: Top 20, 100+ visitors
- **Month 6**: Top 10, 300+ visitors

### Combined Impact:
- 5 SEO sites × 300 visitors = 1,500 extra visitors/month
- 15% conversion = 225 new bookings
- $200 average ticket = $45,000/month additional revenue

## 🔧 Management Tools

### Admin Dashboard Integration
The admin dashboard (`/admin/dashboard.html`) tracks:
- All SEO sites performance
- Individual keyword rankings
- Conversion tracking per site
- ROI per SEO site

### Automation
- Auto-generate landing pages from templates
- Bulk submit to Search Console
- Automated reporting

## 📝 Notes

- Each SEO site should be **unique content** (not duplicate)
- Focus on **user intent** not just keywords
- Track everything - data drives decisions
- Test different approaches and scale what works

---

*This structure keeps all SEO initiatives organized and trackable while maintaining clean separation from the main site.*