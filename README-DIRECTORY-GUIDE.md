# 🗂️ Chris David Salon - Directory Organization Guide

## 📁 DIRECTORY STRUCTURE EXPLAINED

Everything is now organized into numbered folders for easy navigation:

```
Chris David Salon/New web site July 25/
│
├── 📁 01-WEBSITE/           → Main website files
├── 📁 02-SEO-TOOLS/         → SEO dashboards and tools  
├── 📁 03-AUTOMATION/        → Automation scripts
├── 📁 04-IMAGES/            → All images for website & automation
├── 📁 05-REPORTS/           → SEO reports and documentation
├── 📁 06-SERVICE-PAGES/     → Service-specific landing pages
├── 📁 07-LOCATION-PAGES/    → Location-specific landing pages
└── 📄 README-DIRECTORY-GUIDE.md (this file)
```

---

## 📂 01-WEBSITE
**Purpose:** Main website files
**What's Here:**
- `enhanced_website.html` - Main salon website with SEO improvements
- `blog.html` - Blog page
- `careers.html` - Careers page
- `premiumbrands.html` - Premium brands page

**How to Use:**
```bash
# Open main website
open "01-WEBSITE/enhanced_website.html"

# Deploy updates
cd 01-WEBSITE
npx vercel --prod
```

---

## 📂 02-SEO-TOOLS
**Purpose:** SEO tracking and management tools
**What's Here:**
- `seo-ranking-tracker.html` - Dashboard showing keyword rankings & traffic projections
- `automation-hub.html` - Manual posting templates, hashtags, and citation links

**How to Use:**
```bash
# Check SEO rankings
open "02-SEO-TOOLS/seo-ranking-tracker.html"

# Get posting templates
open "02-SEO-TOOLS/automation-hub.html"
```

**When to Use:**
- Check rankings weekly
- Copy posting templates 3x per week
- Monitor traffic growth monthly

---

## 📂 03-AUTOMATION
**Purpose:** Automated posting scripts
**What's Here:**
- `auto-post-script.py` - Python automation script
- `setup-automation.sh` - Setup script
- `README-AUTOMATION.md` - Automation instructions

**⚠️ IMPORTANT:** The main automation system is at:
```
~/chris-david-automation/
```

**How to Use:**
```bash
# Check automation status
python3 ~/chris-david-automation/check-status.py

# Start automation
python3 ~/chris-david-automation/automation.py
```

---

## 📂 04-IMAGES
**Purpose:** ALL images for website and social media
**Organization:**
```
04-IMAGES/
├── logos/              → Salon and brand logos
├── services/           → Service photos (NEED REAL PHOTOS!)
│   ├── balayage/      → Balayage before/after
│   ├── color-correction/ → Color correction before/after
│   ├── extensions/    → Extensions before/after
│   └── general/       → General salon photos
└── social/            → Photos for social media posts
```

**🚨 ACTION NEEDED:** Add real salon photos here!
**Naming Convention:**
- `balayage-before-after-1.jpg`
- `color-correction-blonde-fix-1.jpg`
- `extensions-length-transformation-1.jpg`

---

## 📂 05-REPORTS
**Purpose:** Documentation and reports
**What's Here:**
- `SEO-OPTIMIZATION-REPORT.md` - Complete SEO analysis
- `MASTER-FILE-LOCATIONS.md` - File location guide
- `MONTHLY-REPORTS/` - Monthly progress reports (to be added)

**How to Use:**
```bash
# View SEO report
open "05-REPORTS/SEO-OPTIMIZATION-REPORT.md"
```

---

## 📂 06-SERVICE-PAGES
**Purpose:** SEO-optimized service landing pages
**What's Here:**
- `balayage-delray-beach.html` - Targets "balayage delray beach"
- `color-correction-delray-beach.html` - Targets "color correction delray beach"
- (TO ADD) `hair-extensions-delray-beach.html`
- (TO ADD) `hair-color-delray-beach.html`

**How to Use:**
- Link these from main website
- Share on social media
- Use for Google Ads landing pages

---

## 📂 07-LOCATION-PAGES
**Purpose:** Location-specific SEO pages
**What's Here:**
- `delray-beach-hair-salon.html` - General Delray Beach page
- `atlantic-avenue-colorist.html` - Atlantic Avenue area page
- (TO ADD) `pineapple-grove-salon.html`
- (TO ADD) `andre-design-district.html`

---

## 🚀 QUICK ACCESS COMMANDS

### Check SEO Progress:
```bash
cd "/Users/stuartkerr/Library/CloudStorage/OneDrive-Personal/ISO Vision LLC/Chris David Salon/New web site July 25"
open 02-SEO-TOOLS/seo-ranking-tracker.html
```

### Get Posting Templates:
```bash
open 02-SEO-TOOLS/automation-hub.html
```

### Check Automation Status:
```bash
python3 ~/chris-david-automation/check-status.py
```

### Add Photos:
```bash
# Put photos in the appropriate subfolder
open 04-IMAGES/
```

### View Reports:
```bash
open 05-REPORTS/SEO-OPTIMIZATION-REPORT.md
```

---

## 📋 DAILY WORKFLOW

### Monday, Wednesday, Friday (Posting Days):

1. **Option A: Manual Posting**
   - Open `02-SEO-TOOLS/automation-hub.html`
   - Copy the day's post templates
   - Post to Google My Business and Instagram

2. **Option B: Automated Posting**
   - Automation runs automatically if configured
   - Check logs: `cat ~/chris-david-automation/automation.log`

### Weekly:
- Check rankings: `open 02-SEO-TOOLS/seo-ranking-tracker.html`
- Upload 5+ photos to Google My Business
- Request 2-3 reviews from recent clients

### Monthly:
- Review SEO report in `05-REPORTS/`
- Update service pages with new content
- Check keyword ranking progress

---

## 🔴 CURRENT STATUS

### What's Working:
✅ Directory structure organized
✅ SEO tools ready to use
✅ Service pages created
✅ Location pages created

### What's Needed:
❌ Real salon photos in `04-IMAGES/`
❌ API keys for automation
❌ Google My Business posting (manual or automated)
❌ Review campaign launch

---

## 📞 SUPPORT

**For Website Issues:**
- Main site: `01-WEBSITE/enhanced_website.html`
- Deploy: `npx vercel --prod`

**For SEO Tracking:**
- Dashboard: `02-SEO-TOOLS/seo-ranking-tracker.html`
- Templates: `02-SEO-TOOLS/automation-hub.html`

**For Automation:**
- Status: `python3 ~/chris-david-automation/check-status.py`
- Config: `nano ~/chris-david-automation/.env`
- Start: `python3 ~/chris-david-automation/automation.py`

---

**Navigation Tip:** Folders are numbered so they appear in logical order. Start with 01 for the website, 02 for SEO tools, etc.