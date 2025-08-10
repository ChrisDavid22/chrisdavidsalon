# 📍 MASTER FILE LOCATIONS - Chris David Salon SEO System

## 🗂️ YOU HAVE FILES IN TWO MAIN LOCATIONS:

### 1️⃣ WEBSITE & DASHBOARD FILES
**Location:** `/Users/stuartkerr/Library/CloudStorage/OneDrive-Personal/ISO Vision LLC/Chris David Salon/New web site July 25/`

**What's Here:**
- `enhanced_website.html` - Main website with SEO improvements
- `seo-ranking-tracker.html` - Dashboard showing keyword rankings
- `automation-hub.html` - Manual posting templates and tools
- `balayage-delray-beach.html` - Service page for balayage
- `color-correction-delray-beach.html` - Service page for color correction
- `delray-beach-hair-salon.html` - Location page
- `atlantic-avenue-colorist.html` - Location page
- `SEO-OPTIMIZATION-REPORT.md` - Full SEO analysis report

**How to Open These:**
```bash
# Open the SEO dashboard
open "/Users/stuartkerr/Library/CloudStorage/OneDrive-Personal/ISO Vision LLC/Chris David Salon/New web site July 25/seo-ranking-tracker.html"

# Open the automation hub
open "/Users/stuartkerr/Library/CloudStorage/OneDrive-Personal/ISO Vision LLC/Chris David Salon/New web site July 25/automation-hub.html"

# Open the main website
open "/Users/stuartkerr/Library/CloudStorage/OneDrive-Personal/ISO Vision LLC/Chris David Salon/New web site July 25/enhanced_website.html"
```

---

### 2️⃣ AUTOMATION SYSTEM FILES
**Location:** `/Users/stuartkerr/chris-david-automation/`

**What's Here:**
- `automation.py` - The actual automation script that posts to Google/Facebook
- `.env` - Configuration file where API keys go (THIS IS WHERE YOU ADD KEYS!)
- `README.md` - Complete setup instructions
- `check-status.py` - Script to check if everything is configured
- `SETUP_INSTRUCTIONS.md` - Detailed API setup guide

**How to Access These:**
```bash
# Go to automation directory
cd ~/chris-david-automation

# Check system status
python3 check-status.py

# Edit API keys
nano .env

# View instructions
cat README.md

# Test the system
python3 automation.py --now

# Start automation
python3 automation.py
```

---

## 🚦 CURRENT STATUS: 🔴 RED - NOT CONFIGURED

### What's Working ✅
- All files created successfully
- Python packages installed
- Directory structure set up
- Website deployed to Vercel

### What's Needed ❌
- Google API Key
- Google My Business Account ID
- Google My Business Location ID
- Facebook Page ID
- Facebook Access Token
- Instagram Business ID

---

## 🎯 QUICK ACTION GUIDE

### To Get This Working, You Need To:

#### 1. GET THE API KEYS (15-20 minutes)

**For Google:**
1. Go to: https://console.cloud.google.com/
2. Create project "Chris David Salon"
3. Enable "Google My Business API"
4. Create API key
5. Get account/location IDs from https://business.google.com/

**For Facebook:**
1. Go to: https://developers.facebook.com/
2. Create app "Chris David Salon Automation"
3. Get Page ID from Facebook page
4. Generate access token
5. Get Instagram Business ID

#### 2. ADD THE KEYS (2 minutes)
```bash
# Open the config file
nano ~/chris-david-automation/.env

# Add your keys after the = signs
# Save with Ctrl+X, Y, Enter
```

#### 3. TEST IT (1 minute)
```bash
# Check if configured
python3 ~/chris-david-automation/check-status.py

# Test a post
python3 ~/chris-david-automation/automation.py --now
```

#### 4. START AUTOMATION (1 minute)
```bash
# Run this and leave it running
python3 ~/chris-david-automation/automation.py
```

---

## 📊 HOW TO CHECK IF IT'S WORKING

### Run Status Check:
```bash
cd ~/chris-david-automation
python3 check-status.py
```

### 🟢 GREEN (Ready) Looks Like:
```
✅ Google Cloud API Key: CONFIGURED
✅ Google My Business Account ID: CONFIGURED
✅ Google My Business Location ID: CONFIGURED
✅ Facebook Page ID: CONFIGURED
✅ Facebook Access Token: CONFIGURED
✅ Instagram Business Account ID: CONFIGURED

🟢 SYSTEM STATUS: READY TO GO!
```

### 🔴 RED (Not Ready) Looks Like:
```
❌ Google Cloud API Key: NOT SET
❌ Google My Business Account ID: NOT SET
[etc...]

🔴 SYSTEM STATUS: NOT READY (0% Complete)
```

---

## 📁 WHERE TO PUT PHOTOS

When you get real salon photos, put them here:
```
/Users/stuartkerr/Library/CloudStorage/OneDrive-Personal/ISO Vision LLC/Chris David Salon/New web site July 25/images/
```

Name them like:
- `balayage-before-after-1.jpg`
- `color-correction-1.jpg`
- `hair-extensions-1.jpg`

---

## 🆘 HELP COMMANDS

```bash
# Where am I?
pwd

# Go to automation folder
cd ~/chris-david-automation

# Check what files are here
ls -la

# Check if system is ready
python3 check-status.py

# View the instructions
cat README.md

# Edit API keys
nano .env

# Test the system
python3 automation.py --now

# View recent posts
cat automation.log

# Start automation
python3 automation.py
```

---

## 📱 WHAT HAPPENS WHEN IT'S WORKING

The automation will:
1. **Post to Google My Business** - 3x per week
2. **Post to Facebook** - Same content, same times
3. **Rotate through keywords:**
   - Monday: Color Correction content
   - Wednesday: Balayage content
   - Friday: Hair Extensions content
4. **Log everything** in `automation.log`
5. **Track keywords** targeted in each post

---

## ⏰ POSTING SCHEDULE

- **Monday**: 10am, 2pm, 6pm (Color Correction focus)
- **Wednesday**: 10am, 2pm, 6pm (Balayage focus)  
- **Friday**: 10am, 2pm, 6pm (Extensions focus)

---

## 📞 TROUBLESHOOTING

If something isn't working:

1. **Check status first:**
   ```bash
   python3 ~/chris-david-automation/check-status.py
   ```

2. **Check the logs:**
   ```bash
   cat ~/chris-david-automation/automation.log
   ```

3. **Make sure you're in the right directory:**
   ```bash
   cd ~/chris-david-automation
   pwd  # Should show: /Users/stuartkerr/chris-david-automation
   ```

4. **Common fixes:**
   - API keys not added → Edit `.env` file
   - Access token expired → Generate new one on Facebook
   - Python error → Run `pip3 install python-dotenv requests schedule`

---

**BOTTOM LINE:** Everything is installed and ready. You just need to:
1. Get the 6 API keys
2. Add them to `~/chris-david-automation/.env`
3. Run `python3 ~/chris-david-automation/automation.py`

That's it! The system will handle the rest automatically.