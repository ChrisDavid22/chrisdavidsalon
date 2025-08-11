# SEO Setup Instructions for Chris - COMPLETE STEP-BY-STEP

## 📋 Overview
You have 3 new SEO sites that need to be connected to Google. This will take about 45 minutes total.

## 🌐 Your 3 Sites to Set Up:
1. **bestsalondelray.com**
2. **bestdelraysalon.com** 
3. **bestsalonpalmbeach.com**

---

# PART 1: Google Search Console (15 minutes)

## Step 1: Access Search Console
1. Go to: **https://search.google.com/search-console**
2. Sign in with your Google account (same one as your Google Business Profile)

## Step 2: Add First Domain (bestsalondelray.com)
1. Click **"Add property"** button
2. Choose **"Domain"** (not URL prefix)
3. Enter: `bestsalondelray.com` (without https:// or www)
4. Click **Continue**

## Step 3: Verify Ownership
1. Google will show you a TXT record
2. Copy the TXT record value (looks like: `google-site-verification=xyz123...`)
3. Go to **GoDaddy.com** in a new tab
4. Sign in → My Products → Domains → bestsalondelray.com → DNS
5. Click **ADD** record:
   - Type: **TXT**
   - Name: **@**
   - Value: **[paste the google verification code]**
   - TTL: **1 hour**
6. Save it
7. Go back to Google Search Console
8. Click **Verify**
9. If it fails, wait 5 minutes and try again

## Step 4: Repeat for Other Domains
Do the exact same process for:
- **bestdelraysalon.com**
- **bestsalonpalmbeach.com**

## Step 5: Request Indexing
For each domain in Search Console:
1. Go to **URL Inspection** (left menu)
2. Enter the domain name in the search bar
3. Click **Request Indexing**
4. Wait for it to process (takes 1-2 minutes)

---

# PART 2: Google Analytics Setup (15 minutes)

## Step 1: Access Google Analytics
1. Go to: **https://analytics.google.com**
2. Sign in with the same Google account

## Step 2: Create First Property
1. Click **Admin** (gear icon, bottom left)
2. Click **Create Property**
3. Property name: **Best Salon Delray**
4. Time zone: **United States → Eastern Time**
5. Currency: **US Dollar**
6. Click **Next**

## Step 3: Business Information
1. Industry: **Beauty & Fitness**
2. Business size: **Small**
3. How you intend to use: Check all that apply:
   - Examine user behavior
   - Improve the site experience
   - Measure conversions
4. Click **Create**

## Step 4: Set Up Data Stream
1. Choose **Web**
2. Website URL: **https://bestsalondelray.com**
3. Stream name: **Best Salon Delray Site**
4. Click **Create Stream**

## Step 5: Get Your Tracking Code
1. You'll see a **Measurement ID** (looks like: G-XXXXXXXXXX)
2. **COPY THIS ID** and save it in a note
3. Also click **View tag instructions** → **Install manually**
4. Copy the entire code snippet (starts with `<!-- Google tag (gtag.js) -->`)

## Step 6: Send Me the Code
Email or message me:
```
Site 1: bestsalondelray.com
Measurement ID: G-XXXXXXXXXX
[Paste the full tracking code here]
```

## Step 7: Repeat for Other Sites
Create 2 more properties:
- **Best Delray Salon** → bestdelraysalon.com
- **Best Salon Palm Beach** → bestsalonpalmbeach.com

Send me all 3 tracking codes.

---

# PART 3: Directory Submissions (15 minutes)

## Yelp
1. Go to: **https://biz.yelp.com**
2. You already have a listing - just sign in
3. Go to **Business Information**
4. In the **Website** section, you can add additional URLs
5. Add the microsites as additional web presence

## Google Business Profile
1. Go to: **https://business.google.com**
2. Sign in and select Chris David Salon
3. Go to **Edit Profile** → **Website**
4. In the description or posts, mention your specialty sites

## YellowPages
1. Go to: **https://accounts.yellowpages.com**
2. Claim your listing (if not already)
3. Add the microsite URLs in the business description

## Bing Places
1. Go to: **https://www.bingplaces.com**
2. Sign in with Microsoft account
3. Import from Google My Business (easiest)
4. Or create new listing
5. Add all website URLs

## Free Local Directories (Optional but Helpful)
Quick submissions to:
- **https://www.brownbook.net** (free listing)
- **https://www.hotfrog.com** (free listing)
- **https://www.merchantcircle.com** (free listing)
- **https://www.superpages.com** (free listing)

For each:
1. Search for Chris David Salon
2. Claim the listing
3. Add the microsite URLs
4. Verify by phone or email

---

# PART 4: Send Me This Information

## After completing the above, send me:

### Google Analytics Tracking Codes:
```
Site 1: bestsalondelray.com
Measurement ID: G-XXXXXXXXXX
Code: [paste full tracking code]

Site 2: bestdelraysalon.com
Measurement ID: G-XXXXXXXXXX
Code: [paste full tracking code]

Site 3: bestsalonpalmbeach.com
Measurement ID: G-XXXXXXXXXX
Code: [paste full tracking code]
```

### Search Console Verification:
```
☐ bestsalondelray.com - Verified
☐ bestdelraysalon.com - Verified
☐ bestsalonpalmbeach.com - Verified
```

### Directory Submissions:
```
☐ Yelp - Updated
☐ Google Business - Updated
☐ YellowPages - Submitted
☐ Bing Places - Submitted
```

---

# 📊 What Happens Next?

## Within 24-48 Hours:
- Google will start crawling your sites
- You'll see data appearing in Search Console

## Within 1 Week:
- Sites will be indexed
- You can start seeing search queries in Search Console

## Within 1 Month:
- Analytics will show traffic patterns
- You'll see initial ranking positions

## What I'll Do:
Once you send me the tracking codes, I'll:
1. Add them to all three sites
2. Push updates to GitHub
3. Sites will auto-update in Vercel

---

# ⚠️ IMPORTANT NOTES

## DO NOT:
- Skip the verification step
- Use different Google accounts for different sites
- Submit the same site multiple times

## DO:
- Use the same Google account for everything
- Be patient with verification (can take 5-10 minutes)
- Save all tracking codes in a document

## Need Help?
- **Search Console Help**: https://support.google.com/webmasters
- **Analytics Help**: https://support.google.com/analytics
- **Can't verify?** Wait 1 hour for DNS to propagate, then try again

---

**Time Required**: 45 minutes total
**Difficulty**: Easy - just follow each step
**Result**: Full tracking and indexing for all 3 SEO sites

*Send me the tracking codes when done and I'll immediately add them to your sites!*