# 🎯 SIMPLE DOMAIN SETUP - From Squarespace to Vercel

## Your Current Situation
- **Domain**: chrisdavidsalon.com (owned at GoDaddy) ✅
- **Previous**: Was using Squarespace
- **Now**: Want to use new Vercel site
- **Goal**: Make chrisdavidsalon.com show your new website

## ✨ THE SIMPLE WAY (15 minutes)

### What We're Doing:
Instead of GoDaddy → Squarespace, we're making it GoDaddy → Vercel
Same domain, new website!

---

## 📋 STEP-BY-STEP INSTRUCTIONS

### Step 1: Add Domain to Vercel (5 minutes)

1. **Open Vercel Dashboard**
   - Go to: https://vercel.com/dashboard
   - Sign in with your account

2. **Find Your Project**
   - Look for "chris-david-salon" project
   - Click on it

3. **Add Your Domain**
   - Click "Settings" tab at top
   - Click "Domains" in left sidebar
   - Click "Add Domain" button
   - Type: `chrisdavidsalon.com`
   - Click "Add"

4. **Vercel Shows You 2 Things** (IMPORTANT - WRITE THESE DOWN!)
   - An IP address (looks like: 76.76.21.21)
   - A CNAME value (looks like: cname.vercel-dns.com)

---

### Step 2: Remove Squarespace Connection (2 minutes)

1. **Log into GoDaddy**
   - Go to: https://godaddy.com
   - Sign in to your account

2. **Find Your Domain**
   - Click "My Products"
   - Find "chrisdavidsalon.com"
   - Click "DNS" button

3. **Remove Squarespace Records**
   - Look for any records pointing to Squarespace
   - These usually say "squarespace.com" or have Squarespace IPs
   - Click the trash icon to delete them
   - **Don't worry** - this just disconnects from Squarespace

---

### Step 3: Connect to Vercel (8 minutes)

**Still in GoDaddy DNS page:**

1. **Add the "A" Record** (this connects your domain)
   - Click "Add"
   - Type: A
   - Host: @ 
   - Points to: [The IP address Vercel showed you]
   - TTL: 1 hour
   - Click "Save"

2. **Add the "CNAME" Record** (this handles www)
   - Click "Add"
   - Type: CNAME
   - Host: www
   - Points to: [The CNAME Vercel showed you]
   - TTL: 1 hour
   - Click "Save"

3. **Remove Any Forwarding**
   - Look for "Forwarding" section
   - If anything is there, remove it
   - We want direct connection, not forwarding

---

## ✅ YOU'RE DONE!

### What Happens Next:
- **5 minutes - 2 hours**: DNS updates (usually 30 minutes)
- **Check if it works**: Go to chrisdavidsalon.com
- **Should see**: Your new website!

### How to Check Progress:
```
1. Try: chrisdavidsalon.com
2. If old site shows: Wait 30 more minutes
3. If new site shows: SUCCESS! 🎉
```

---

## 🆘 TROUBLESHOOTING

### "I still see my old Squarespace site"
- DNS changes take time (up to 2 hours)
- Clear your browser cache
- Try incognito/private browser window

### "I see an error page"
- Double-check the IP address you entered
- Make sure you removed ALL Squarespace records
- Wait 30 more minutes

### "I'm confused about DNS page"
- GoDaddy support: 1-480-505-8877
- Tell them: "I need to point my domain to Vercel using an A record"
- They can walk you through it!

---

## 🎯 WHAT THIS ACCOMPLISHES

**Before (Bad for SEO):**
- Google sees: chris-david-salon.vercel.app
- Your domain just forwards there
- SEO credit goes to Vercel

**After (Great for SEO):**
- Google sees: chrisdavidsalon.com
- Your domain IS the website
- SEO credit goes to YOU!

---

## 📱 QUICK REFERENCE

### GoDaddy DNS Should Look Like:
```
Type    Host    Points to                 TTL
A       @       76.76.21.21               1 Hour
CNAME   www     cname.vercel-dns.com      1 Hour
```
(Use actual values from Vercel, not these examples)

### What to DELETE in GoDaddy:
- ❌ Any Squarespace records
- ❌ Any forwarding rules
- ❌ Any masking/frame forwarding

### What to KEEP:
- ✅ Your MX records (email)
- ✅ Any TXT records (verification)

---

## 💡 PRO TIPS

1. **Take Screenshots**
   - Screenshot Vercel's DNS instructions
   - Screenshot GoDaddy before changes
   - Helps if you need support

2. **Don't Panic**
   - Can't break anything permanently
   - Can always change back
   - GoDaddy support can help

3. **Check Tomorrow**
   - Sometimes takes overnight
   - If not working after 24 hours, something's wrong

---

## 🚀 AFTER IT'S WORKING

1. **Update Google Business Profile**
   - Change website to: chrisdavidsalon.com

2. **Update Social Media**
   - Instagram bio
   - Facebook page

3. **Tell Google**
   - Submit to Google Search Console
   - Helps speed up indexing

---

## 📞 NEED HELP?

### Option 1: GoDaddy Support (Easiest)
- Call: 1-480-505-8877
- Say: "I need to update my DNS to point to Vercel"
- They'll walk you through it!

### Option 2: Vercel Docs
- https://vercel.com/docs/custom-domains

### Option 3: Check Status
- https://dnschecker.org
- Enter: chrisdavidsalon.com
- Shows if DNS has updated worldwide

---

**Bottom Line**: This takes 15 minutes and makes chrisdavidsalon.com your actual website. No more forwarding, no more Squarespace - just your domain showing your new site directly. This is CRITICAL for SEO success!