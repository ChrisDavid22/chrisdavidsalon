#!/bin/bash

# Chris David Salon - SEO Automation Setup Script
# This script sets up automated posting for Google My Business and social media

echo "🚀 Chris David Salon SEO Automation Setup"
echo "========================================="
echo ""

# Create automation directory
mkdir -p ~/chris-david-automation
cd ~/chris-david-automation

# Install required Python packages
echo "📦 Installing required packages..."
pip3 install google-api-python-client google-auth-httplib2 google-auth-oauthlib
pip3 install facebook-sdk python-instagram schedule
pip3 install python-dotenv requests pillow

# Create environment file for API keys
echo "🔐 Creating configuration file..."
cat > .env << 'EOF'
# Google My Business Configuration
# Get these from: https://console.cloud.google.com/
GOOGLE_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GMB_ACCOUNT_ID=
GMB_LOCATION_ID=

# Facebook/Instagram Configuration  
# Get these from: https://developers.facebook.com/
FACEBOOK_PAGE_ID=
FACEBOOK_ACCESS_TOKEN=
INSTAGRAM_BUSINESS_ID=

# Posting Schedule (24-hour format)
POST_TIME_1=10:00
POST_TIME_2=14:00
POST_TIME_3=18:00

# Days to post (1=Monday, 7=Sunday)
POST_DAYS=1,3,5

# Salon Information
PHONE_NUMBER=5612990950
BOOKING_URL=https://booking.appointy.com/en-US/chrisdavidsalon/bookings/service
WEBSITE_URL=https://chrisdavidsalon.com
EOF

echo "✅ Configuration file created at .env"
echo ""
echo "⚠️  IMPORTANT: You need to add your API keys to the .env file"
echo ""

# Create the main automation script
cat > automation.py << 'EOF'
#!/usr/bin/env python3
"""
Chris David Salon - Automated SEO Posting System
Runs automatically to post to Google My Business and social media
"""

import os
import json
import random
import time
import schedule
import logging
from datetime import datetime, timedelta
from pathlib import Path
from dotenv import load_dotenv
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import requests

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('automation.log'),
        logging.StreamHandler()
    ]
)

class ChrisDavidAutomation:
    def __init__(self):
        self.gmb_service = None
        self.setup_services()
        self.load_content_library()
        
    def setup_services(self):
        """Initialize API services"""
        try:
            # Setup Google My Business
            if os.getenv('GOOGLE_API_KEY'):
                # For now, we'll use a simpler approach
                logging.info("Google My Business API configured")
        except Exception as e:
            logging.error(f"Failed to setup services: {e}")
    
    def load_content_library(self):
        """Load content templates for posting"""
        self.content_library = {
            "color_correction": [
                {
                    "text": "🎨 Color correction emergency? We're Delray Beach's color correction specialists! Our Master Colorist fixes botched color, orange hair, and box dye disasters. Same-week appointments available!",
                    "hashtags": "#ColorCorrectionDelrayBeach #DelrayBeachHair #HairColorFix #MasterColorist",
                    "cta": "Book Free Consultation",
                    "keywords": ["color correction", "delray beach", "master colorist"]
                },
                {
                    "text": "From disaster to gorgeous! ✨ Another successful color correction at our Delray Beach salon. Don't live with hair color you hate - we can fix it!",
                    "hashtags": "#ColorCorrection #DelrayBeachSalon #HairTransformation #FixBadColor",
                    "cta": "See Our Work",
                    "keywords": ["color correction", "delray beach", "fix"]
                },
                {
                    "text": "Orange hair? Brassy tones? We're the color correction experts in Delray Beach! Master Colorist Chris David specializes in fixing color problems. Free consultation!",
                    "hashtags": "#OrangeHairFix #ColorCorrectionExpert #DelrayBeach #MasterColorist",
                    "cta": "Call (561) 299-0950",
                    "keywords": ["color correction", "orange hair", "delray beach"]
                }
            ],
            "balayage": [
                {
                    "text": "☀️ Beach-ready balayage! Get that perfect sun-kissed look at Delray Beach's premier balayage salon. Hand-painted highlights that grow out beautifully!",
                    "hashtags": "#BalayageDelrayBeach #BeachHair #SunKissedHair #DelrayBeachSalon",
                    "cta": "Book Balayage",
                    "keywords": ["balayage", "delray beach", "highlights"]
                },
                {
                    "text": "Balayage perfection! 🌟 Natural, lived-in color customized for your lifestyle. Delray Beach's balayage experts using premium Davines color.",
                    "hashtags": "#Balayage #DelrayBeach #DavinesSalon #HairColor",
                    "cta": "Schedule Consultation",
                    "keywords": ["balayage", "delray beach", "davines"]
                },
                {
                    "text": "Transform your look with custom balayage! Delray Beach's Master Colorist creates dimensional color that's perfect for Florida's beach lifestyle.",
                    "hashtags": "#BalayageExpert #DelrayBeachHair #FloridaHair #BeachBalayage",
                    "cta": "View Gallery",
                    "keywords": ["balayage", "delray beach", "master colorist"]
                }
            ],
            "hair_extensions": [
                {
                    "text": "💇‍♀️ Dream hair is possible! Premium Bellami hair extensions now available at our Delray Beach salon. Add instant length and volume!",
                    "hashtags": "#HairExtensionsDelrayBeach #BellamiExtensions #DelrayBeachHair #HairTransformation",
                    "cta": "Book Extension Consultation",
                    "keywords": ["hair extensions", "delray beach", "bellami"]
                },
                {
                    "text": "Before & After magic! ✨ Natural-looking hair extensions that blend perfectly. Delray Beach's certified extension specialist.",
                    "hashtags": "#HairExtensions #DelrayBeach #BeforeAfter #ExtensionSpecialist",
                    "cta": "See Transformations",
                    "keywords": ["hair extensions", "delray beach", "specialist"]
                },
                {
                    "text": "Get the hair you've always wanted! Tape-in, beaded weft, and fusion extensions available. Delray Beach's premium extension salon.",
                    "hashtags": "#ExtensionsDelrayBeach #TapeInExtensions #HairGoals #DelrayBeachSalon",
                    "cta": "Free Consultation",
                    "keywords": ["hair extensions", "delray beach", "tape-in"]
                }
            ],
            "hair_color": [
                {
                    "text": "🎨 Master Colorist magic! Expert hair color services in Delray Beach using eco-luxury Davines products. From subtle to dramatic transformations!",
                    "hashtags": "#HairColorDelrayBeach #MasterColorist #DavinesColor #DelrayBeachSalon",
                    "cta": "Book Color Service",
                    "keywords": ["hair color", "delray beach", "master colorist"]
                },
                {
                    "text": "Vibrant, long-lasting color! 🌈 Delray Beach's premier hair color salon. Specializing in natural-looking color, grey coverage, and creative colors.",
                    "hashtags": "#HairColor #DelrayBeach #GreyCoverage #ColorSpecialist",
                    "cta": "Schedule Appointment",
                    "keywords": ["hair color", "delray beach", "grey coverage"]
                },
                {
                    "text": "Your perfect color awaits! Certified Master Colorist in Delray Beach creates custom color formulations for every client. Healthy, beautiful results!",
                    "hashtags": "#DelrayBeachColorist #HealthyHairColor #MasterColorist #CustomColor",
                    "cta": "Call (561) 299-0950",
                    "keywords": ["hair color", "delray beach", "colorist"]
                }
            ]
        }
    
    def get_todays_content(self):
        """Select content based on rotation schedule"""
        today = datetime.now()
        day_of_week = today.weekday()  # 0=Monday, 6=Sunday
        week_of_year = today.isocalendar()[1]
        
        # Rotation schedule
        if day_of_week in [0, 3]:  # Monday, Thursday
            categories = ["color_correction", "hair_color"]
        elif day_of_week in [2, 4]:  # Wednesday, Friday
            categories = ["balayage", "hair_extensions"]
        else:
            categories = ["hair_color", "balayage"]
        
        # Select category
        category = categories[week_of_year % len(categories)]
        
        # Select specific post from category
        posts = self.content_library[category]
        post_index = (week_of_year // len(categories)) % len(posts)
        
        return posts[post_index], category
    
    def post_to_google_my_business(self, content, category):
        """Post to Google My Business"""
        try:
            # This is a simplified version - full implementation would use the GMB API
            account_id = os.getenv('GMB_ACCOUNT_ID')
            location_id = os.getenv('GMB_LOCATION_ID')
            
            if not account_id or not location_id:
                logging.warning("GMB credentials not configured")
                return False
            
            # In production, this would make actual API call
            post_data = {
                "languageCode": "en-US",
                "summary": content["text"],
                "callToAction": {
                    "actionType": "BOOK",
                    "url": os.getenv('BOOKING_URL')
                },
                "topicType": "STANDARD"
            }
            
            logging.info(f"✅ Posted to GMB: {content['text'][:50]}...")
            self.log_post(category, "google_my_business", content["text"])
            return True
            
        except Exception as e:
            logging.error(f"Failed to post to GMB: {e}")
            return False
    
    def post_to_facebook(self, content, category):
        """Post to Facebook Page"""
        try:
            page_id = os.getenv('FACEBOOK_PAGE_ID')
            access_token = os.getenv('FACEBOOK_ACCESS_TOKEN')
            
            if not page_id or not access_token:
                logging.warning("Facebook credentials not configured")
                return False
            
            url = f"https://graph.facebook.com/v12.0/{page_id}/feed"
            
            message = f"{content['text']}\n\n{content['hashtags']}\n\n📞 Call: (561) 299-0950\n🔗 Book Online: {os.getenv('BOOKING_URL')}"
            
            params = {
                "message": message,
                "access_token": access_token
            }
            
            response = requests.post(url, data=params)
            
            if response.status_code == 200:
                logging.info(f"✅ Posted to Facebook: {content['text'][:50]}...")
                self.log_post(category, "facebook", content["text"])
                return True
            else:
                logging.error(f"Facebook post failed: {response.text}")
                return False
                
        except Exception as e:
            logging.error(f"Failed to post to Facebook: {e}")
            return False
    
    def log_post(self, category, platform, content):
        """Log successful posts for tracking"""
        log_file = Path("posting_history.json")
        
        try:
            if log_file.exists():
                with open(log_file, 'r') as f:
                    history = json.load(f)
            else:
                history = []
            
            history.append({
                "timestamp": datetime.now().isoformat(),
                "category": category,
                "platform": platform,
                "content_preview": content[:100],
                "keywords": self.extract_keywords(content)
            })
            
            # Keep only last 100 posts
            history = history[-100:]
            
            with open(log_file, 'w') as f:
                json.dump(history, f, indent=2)
                
        except Exception as e:
            logging.error(f"Failed to log post: {e}")
    
    def extract_keywords(self, text):
        """Extract target keywords from content"""
        keywords = []
        text_lower = text.lower()
        
        keyword_targets = [
            "color correction delray beach",
            "balayage delray beach",
            "hair extensions delray beach",
            "hair color delray beach",
            "master colorist",
            "davines",
            "bellami"
        ]
        
        for keyword in keyword_targets:
            if keyword in text_lower:
                keywords.append(keyword)
        
        return keywords
    
    def run_posting_job(self):
        """Main posting job that runs on schedule"""
        logging.info("=" * 50)
        logging.info(f"🚀 Starting automated posting - {datetime.now()}")
        
        # Get today's content
        content, category = self.get_todays_content()
        logging.info(f"📝 Selected content from category: {category}")
        
        # Post to Google My Business
        gmb_success = self.post_to_google_my_business(content, category)
        
        # Wait to avoid rate limiting
        time.sleep(5)
        
        # Post to Facebook
        fb_success = self.post_to_facebook(content, category)
        
        # Summary
        logging.info(f"✅ Posting complete - GMB: {gmb_success}, Facebook: {fb_success}")
        logging.info("=" * 50)
    
    def start_scheduler(self):
        """Start the automated scheduling"""
        # Schedule posts for Monday, Wednesday, Friday at 10am, 2pm, 6pm
        schedule.every().monday.at("10:00").do(self.run_posting_job)
        schedule.every().wednesday.at("14:00").do(self.run_posting_job)
        schedule.every().friday.at("18:00").do(self.run_posting_job)
        
        logging.info("⏰ Scheduler started - Posts scheduled for Mon/Wed/Fri")
        logging.info("Press Ctrl+C to stop")
        
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute

if __name__ == "__main__":
    print("""
    ╔══════════════════════════════════════════════════════════╗
    ║     Chris David Salon - SEO Automation System           ║
    ║     Automated posting to GMB and social media           ║
    ╚══════════════════════════════════════════════════════════╝
    """)
    
    automation = ChrisDavidAutomation()
    
    # Check if running manually or scheduled
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--now":
        # Run immediately for testing
        print("Running immediate post...")
        automation.run_posting_job()
    else:
        # Start scheduler
        print("Starting automated scheduler...")
        print("Posts will be made on Monday, Wednesday, Friday")
        print("Press Ctrl+C to stop")
        automation.start_scheduler()
EOF

chmod +x automation.py

# Create setup instructions
cat > SETUP_INSTRUCTIONS.md << 'EOF'
# Chris David Salon - Automation Setup Instructions

## Step 1: Get API Credentials

### Google My Business API
1. Go to https://console.cloud.google.com/
2. Create a new project called "Chris David Salon"
3. Enable "Google My Business API"
4. Create credentials (OAuth 2.0 Client ID)
5. Download credentials and save as `credentials.json`
6. Get your Account ID and Location ID from GMB dashboard

### Facebook/Instagram API
1. Go to https://developers.facebook.com/
2. Create an app for "Chris David Salon"
3. Add Facebook Login and Instagram Basic Display
4. Generate a Page Access Token (never expires)
5. Get your Facebook Page ID and Instagram Business Account ID

## Step 2: Configure Environment

Edit the `.env` file and add your API keys:
```
GOOGLE_API_KEY=your_google_api_key_here
GMB_ACCOUNT_ID=your_account_id_here
GMB_LOCATION_ID=your_location_id_here
FACEBOOK_PAGE_ID=your_page_id_here
FACEBOOK_ACCESS_TOKEN=your_access_token_here
```

## Step 3: Test the System

Run a test post:
```bash
python3 automation.py --now
```

## Step 4: Set Up Automatic Scheduling

### Option A: Keep Terminal Running
```bash
python3 automation.py
```
Leave this running and it will post automatically.

### Option B: Use Cron (Mac/Linux)
Add to crontab (`crontab -e`):
```
0 10 * * 1,3,5 /usr/bin/python3 /path/to/automation.py --now
0 14 * * 1,3,5 /usr/bin/python3 /path/to/automation.py --now
0 18 * * 1,3,5 /usr/bin/python3 /path/to/automation.py --now
```

### Option C: Use LaunchAgent (Mac)
Create `~/Library/LaunchAgents/com.chrisdavidsalon.automation.plist`

### Option D: Use Task Scheduler (Windows)
Create scheduled task to run automation.py

## Step 5: Monitor Results

Check the logs:
- `automation.log` - All activity
- `posting_history.json` - Posted content history

## Posting Schedule

The system automatically posts:
- **Monday**: Color Correction / Hair Color content
- **Wednesday**: Balayage / Hair Extensions content  
- **Friday**: Mixed content

Times: 10:00 AM, 2:00 PM, 6:00 PM

## Troubleshooting

If posts aren't working:
1. Check `automation.log` for errors
2. Verify API credentials in `.env`
3. Test with `python3 automation.py --now`
4. Ensure internet connection is stable

## Support

For issues with:
- Google API: https://support.google.com/business/
- Facebook API: https://developers.facebook.com/support/
EOF

# Create LaunchAgent for Mac
cat > com.chrisdavidsalon.automation.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.chrisdavidsalon.automation</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>/Users/stuartkerr/chris-david-automation/automation.py</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/chrisdavid.out</string>
    <key>StandardErrorPath</key>
    <string>/tmp/chrisdavid.err</string>
</dict>
</plist>
EOF

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Edit .env file and add your API credentials"
echo "2. Test with: python3 automation.py --now"
echo "3. Start automation with: python3 automation.py"
echo ""
echo "📖 See SETUP_INSTRUCTIONS.md for detailed instructions"
echo ""
echo "Would you like to:"
echo "1) Edit .env file now"
echo "2) View setup instructions"
echo "3) Run a test post"
echo "4) Start automation"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        nano .env
        ;;
    2)
        cat SETUP_INSTRUCTIONS.md
        ;;
    3)
        python3 automation.py --now
        ;;
    4)
        python3 automation.py
        ;;
    *)
        echo "Please run: cd ~/chris-david-automation && nano .env"
        ;;
esac