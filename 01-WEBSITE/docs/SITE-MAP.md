# Chris David Salon - Complete Site Map & Structure

## 🏗️ Project Organization

```
01-WEBSITE/
│
├── 🌐 MAIN WEBSITE FILES
│   ├── index.html                 # Main website (chrisdavidsalon.com)
│   ├── policies.html              # Salon policies page
│   ├── careers.html               # Career opportunities
│   ├── styles.css                 # Main styles
│   └── images/                    # Image assets
│
├── 🔧 ADMIN DASHBOARD (/admin)
│   ├── dashboard.html             # SEO & analytics dashboard
│   ├── login.html                 # Admin login
│   ├── api-config.js              # API configuration
│   ├── seo-audit.html             # SEO audit tool
│   └── BUSINESS-CONTEXT.md        # Business strategy
│
├── 🚀 SEO SITES (/seo-sites)
│   ├── best-salon-site/           # bestdelrayhairsalon.com
│   │   └── index.html             # "Best salon" targeted page
│   ├── services/                  # Service landing pages (planned)
│   ├── locations/                 # Location pages (planned)
│   └── campaigns/                 # Campaign pages (planned)
│
├── 💾 DATA STORAGE (/data)
│   ├── version.json               # Version tracking
│   ├── analytics.json             # Analytics data
│   ├── seo-data.json              # SEO metrics
│   └── competitors.json           # Competitor tracking
│
├── 📚 DOCUMENTATION (/docs)
│   ├── PROJECT-DOCUMENTATION.md   # Complete project overview
│   ├── SEO-TODO.md                # SEO action items
│   ├── SECURITY-SETUP.md          # Security guidelines
│   └── BEST-SALON-STRATEGY.md     # bestdelrayhairsalon strategy
│
├── 🔨 DEPLOYMENT SCRIPTS
│   ├── deploy.sh                  # Auto-deployment script
│   ├── .gitignore                 # Git ignore rules
│   ├── .env                       # Local environment variables
│   └── README.md                  # Repository info
│
└── 📋 PROJECT MANAGEMENT
    ├── SITE-MAP.md                # This file
    └── .claude/CLAUDE.md          # AI assistant context
```

## 🌍 Domain Structure

### Primary Domain
- **chrisdavidsalon.com** - Main website
  - `/admin` - Dashboard (password protected)
  - `/seo-sites/services/[page]` - Service pages
  - `/policies` - Salon policies

### SEO Domains
- **bestdelrayhairsalon.com** - "Best salon" microsite
- **bestsalondelray.com** - Redirect or additional microsite

### Planned Subdomains
- **book.chrisdavidsalon.com** - Booking system
- **reviews.chrisdavidsalon.com** - Review showcase
- **blog.chrisdavidsalon.com** - Blog content

## 🎯 Quick Access Links

### Live Sites
- [Main Website](https://chrisdavidsalon.com)
- [Admin Dashboard](https://chrisdavidsalon.com/admin)
- [Policies](https://chrisdavidsalon.com/policies.html)

### Development
- [GitHub Repo](https://github.com/ChrisDavid22/chrisdavidsalon)
- [Vercel Dashboard](https://vercel.com/chris-david-kerners-projects/chrisdavidsalon)

### SEO Tools
- [Google Search Console](https://search.google.com/search-console)
- [Google Business Profile](https://business.google.com)
- [Google Analytics](https://analytics.google.com)

## 📊 Current Status

### ✅ Completed
- Main website live
- Admin dashboard functional
- SEO tracking system
- Review management
- Version tracking
- bestdelrayhairsalon.com site ready

### 🔄 In Progress
- API security migration
- GitHub repo privatization
- bestdelrayhairsalon.com deployment

### 📅 Planned
- Service landing pages
- Location-specific pages
- Blog system
- Email automation
- Staff portal

## 🚀 Deployment Instructions

### To Deploy Main Site
```bash
cd 01-WEBSITE
./deploy.sh "Description of changes"
```

### To Deploy SEO Sites
```bash
# For bestdelrayhairsalon.com
vercel --prod ./seo-sites/best-salon-site

# For service pages (subdirectory)
# Just push to GitHub - auto-deploys
```

### To Access Admin
1. Go to https://chrisdavidsalon.com/admin
2. Password: ChrisD2024!
3. Dashboard shows all SEO metrics

## 📈 Key Metrics

- **Main Site**: 247 visitors/month
- **SEO Score**: 78/100
- **Reviews**: 133 (4.9★)
- **Keywords Tracking**: 20
- **Competitor Rank**: #1 of 13

## 🔐 Security Notes

- API keys in Vercel environment variables
- Admin dashboard password protected
- .env file for local development only
- GitHub repository should be private

## 📝 Important Files

### Must Read
- `/docs/SEO-TODO.md` - Daily SEO tasks
- `/admin/BUSINESS-CONTEXT.md` - Business strategy
- `/docs/SECURITY-SETUP.md` - Security setup

### Configuration
- `/admin/api-config.js` - API settings
- `/data/version.json` - Version info
- `/.env` - Local environment

---

*Use this site map to navigate the project structure and understand where everything is located.*