#!/usr/bin/env python3
"""
Chris David Salon - Automated SEO Posting System
This script automatically posts to Google My Business and social media
Run this 3x per week (Monday, Wednesday, Friday)
"""

import os
import random
import json
from datetime import datetime, timedelta
import requests
import time

# Configuration
GOOGLE_MY_BUSINESS_API_KEY = "YOUR_API_KEY_HERE"  # Get from Google Cloud Console
FACEBOOK_ACCESS_TOKEN = "YOUR_FB_TOKEN_HERE"  # Get from Facebook Developer
INSTAGRAM_ACCESS_TOKEN = "YOUR_IG_TOKEN_HERE"  # Get from Facebook Developer (same system)

# Google My Business Account Info
GMB_ACCOUNT_ID = "YOUR_ACCOUNT_ID"
GMB_LOCATION_ID = "YOUR_LOCATION_ID"

# Content Libraries
COLOR_CORRECTION_POSTS = [
    {
        "text": "🎨 Color correction specialist in Delray Beach! Fixed another botched box dye disaster today. Master Colorist Chris David specializes in fixing color mistakes. Book your free consultation: (561) 299-0950",
        "cta_url": "https://booking.appointy.com/en-US/chrisdavidsalon/bookings/service",
        "cta_type": "BOOK",
        "photo": "color_correction_1.jpg"
    },
    {
        "text": "From orange to gorgeous! ✨ Another successful color correction at Chris David Salon. As Delray Beach's only Master Colorist, we fix what others can't. Call (561) 299-0950",
        "cta_url": "https://booking.appointy.com/en-US/chrisdavidsalon/bookings/service",
        "cta_type": "BOOK",
        "photo": "color_correction_2.jpg"
    },
    {
        "text": "Weekend Special: 20% off color correction services! Don't live with hair color you hate. Expert color correction in Delray Beach. Book now: (561) 299-0950",
        "cta_url": "https://chrisdavidsalon.com/color-correction-delray-beach",
        "cta_type": "LEARN_MORE",
        "photo": "color_correction_3.jpg"
    }
]

BALAYAGE_POSTS = [
    {
        "text": "Beach-ready balayage! ☀️ Get that sun-kissed look without the damage. Chris David Salon specializes in custom balayage for Delray Beach beauties. Book: (561) 299-0950",
        "cta_url": "https://booking.appointy.com/en-US/chrisdavidsalon/bookings/service",
        "cta_type": "BOOK",
        "photo": "balayage_1.jpg"
    },
    {
        "text": "Balayage transformation! Natural, lived-in color that grows out beautifully. Delray Beach's balayage expert using exclusive Davines color. Call: (561) 299-0950",
        "cta_url": "https://chrisdavidsalon.com/balayage-delray-beach",
        "cta_type": "LEARN_MORE",
        "photo": "balayage_2.jpg"
    },
    {
        "text": "Friday balayage special! Mention this post for a complimentary Davines treatment with your balayage. Perfect for Delray Beach's beach lifestyle! 📍 Near Atlantic Ave",
        "cta_url": "https://booking.appointy.com/en-US/chrisdavidsalon/bookings/service",
        "cta_type": "BOOK",
        "photo": "balayage_3.jpg"
    }
]

HAIR_EXTENSIONS_POSTS = [
    {
        "text": "Transform your hair instantly! 💇‍♀️ Premium Bellami hair extensions at Chris David Salon. Add length, volume, or both! Hair extensions specialist in Delray Beach. Book: (561) 299-0950",
        "cta_url": "https://booking.appointy.com/en-US/chrisdavidsalon/bookings/service",
        "cta_type": "BOOK",
        "photo": "extensions_1.jpg"
    },
    {
        "text": "Before & After: Stunning hair extension transformation! Certified Bellami extensions expert in Delray Beach. Natural-looking, damage-free. Free consultation: (561) 299-0950",
        "cta_url": "https://chrisdavidsalon.com",
        "cta_type": "LEARN_MORE",
        "photo": "extensions_2.jpg"
    }
]

HAIR_COLOR_POSTS = [
    {
        "text": "Master Colorist Monday! 🎨 Expert hair color services in Delray Beach using eco-luxury Davines color. From subtle to dramatic transformations. Book: (561) 299-0950",
        "cta_url": "https://booking.appointy.com/en-US/chrisdavidsalon/bookings/service",
        "cta_type": "BOOK",
        "photo": "hair_color_1.jpg"
    },
    {
        "text": "Vibrant color that lasts! 🌈 Delray Beach's premier hair color salon. Specializing in natural-looking color and grey coverage. Call (561) 299-0950",
        "cta_url": "https://chrisdavidsalon.com",
        "cta_type": "LEARN_MORE",
        "photo": "hair_color_2.jpg"
    }
]

# Instagram hashtag sets (rotate to avoid spam detection)
HASHTAG_SETS = [
    "#DelrayBeachHair #BalayageDelrayBeach #HairColorDelrayBeach #DelrayBeachSalon #AtlanticAveHair #ColorCorrectionDelrayBeach #DelrayBeachHairstylist #PineappleGrove #DelrayBeachFL #SouthFloridaHair",
    "#HairExtensionsDelrayBeach #MasterColoristDelray #DelrayBeachBeauty #BellamiExtensions #DavinesSalon #DelrayHairSalon #BocaRatonHair #PalmBeachHair #FloridaHairStylist #DelrayDowntown",
    "#ChrisDavidSalon #DelrayBeachColorist #HairTransformation #BeachHairDelray #DelrayBeachStyle #LuxuryHairDelray #FloridaBalayage #DelrayBeachLife #AndreDesignDistrict #561Hair"
]

class SocialMediaAutomation:
    def __init__(self):
        self.today = datetime.now()
        self.day_of_week = self.today.strftime('%A')
        
    def post_to_google_my_business(self, post_content):
        """Post to Google My Business using the API"""
        url = f"https://mybusiness.googleapis.com/v4/accounts/{GMB_ACCOUNT_ID}/locations/{GMB_LOCATION_ID}/localPosts"
        
        headers = {
            "Authorization": f"Bearer {GOOGLE_MY_BUSINESS_API_KEY}",
            "Content-Type": "application/json"
        }
        
        data = {
            "languageCode": "en-US",
            "summary": post_content["text"],
            "callToAction": {
                "actionType": post_content["cta_type"],
                "url": post_content["cta_url"]
            },
            "media": [{
                "mediaFormat": "PHOTO",
                "sourceUrl": f"https://chrisdavidsalon.com/images/{post_content['photo']}"
            }]
        }
        
        try:
            response = requests.post(url, headers=headers, json=data)
            if response.status_code == 200:
                print(f"✅ Successfully posted to Google My Business: {post_content['text'][:50]}...")
                return True
            else:
                print(f"❌ Failed to post to GMB: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error posting to GMB: {str(e)}")
            return False
    
    def post_to_instagram(self, post_content, hashtags):
        """Post to Instagram using Facebook Graph API"""
        # First, upload the image
        upload_url = f"https://graph.facebook.com/v12.0/{INSTAGRAM_BUSINESS_ID}/media"
        
        caption = f"{post_content['text']}\n\n{hashtags}"
        
        upload_params = {
            "image_url": f"https://chrisdavidsalon.com/images/{post_content['photo']}",
            "caption": caption,
            "access_token": INSTAGRAM_ACCESS_TOKEN
        }
        
        try:
            # Create media object
            upload_response = requests.post(upload_url, params=upload_params)
            if upload_response.status_code == 200:
                media_id = upload_response.json()["id"]
                
                # Publish the media
                publish_url = f"https://graph.facebook.com/v12.0/{INSTAGRAM_BUSINESS_ID}/media_publish"
                publish_params = {
                    "creation_id": media_id,
                    "access_token": INSTAGRAM_ACCESS_TOKEN
                }
                
                publish_response = requests.post(publish_url, params=publish_params)
                if publish_response.status_code == 200:
                    print(f"✅ Successfully posted to Instagram: {post_content['text'][:50]}...")
                    return True
        except Exception as e:
            print(f"❌ Error posting to Instagram: {str(e)}")
            return False
    
    def select_content_for_today(self):
        """Select appropriate content based on the day and rotation"""
        # Rotate through different content types
        week_number = self.today.isocalendar()[1]
        
        if self.day_of_week in ['Monday', 'Thursday']:
            content_pools = [COLOR_CORRECTION_POSTS, HAIR_COLOR_POSTS]
        elif self.day_of_week in ['Tuesday', 'Friday']:
            content_pools = [BALAYAGE_POSTS, HAIR_EXTENSIONS_POSTS]
        elif self.day_of_week in ['Wednesday', 'Saturday']:
            content_pools = [HAIR_COLOR_POSTS, BALAYAGE_POSTS]
        else:
            return None  # Don't post on Sunday
        
        # Select from appropriate pool
        pool = content_pools[week_number % len(content_pools)]
        post = pool[week_number % len(pool)]
        
        # Select hashtag set
        hashtags = HASHTAG_SETS[week_number % len(HASHTAG_SETS)]
        
        return post, hashtags
    
    def run_daily_posting(self):
        """Main function to run the daily posting routine"""
        print(f"🚀 Starting automated posting for {self.day_of_week}, {self.today.strftime('%B %d, %Y')}")
        
        # Check if we should post today
        if self.day_of_week == 'Sunday':
            print("📅 No posting on Sundays")
            return
        
        # Select content
        content_data = self.select_content_for_today()
        if not content_data:
            print("❌ No content selected for today")
            return
        
        post_content, hashtags = content_data
        
        # Post to Google My Business
        print("\n📍 Posting to Google My Business...")
        gmb_success = self.post_to_google_my_business(post_content)
        
        # Wait a bit to avoid rate limiting
        time.sleep(5)
        
        # Post to Instagram
        print("\n📸 Posting to Instagram...")
        ig_success = self.post_to_instagram(post_content, hashtags)
        
        # Log results
        self.log_posting_results(gmb_success, ig_success, post_content)
        
        print("\n✅ Daily posting complete!")
    
    def log_posting_results(self, gmb_success, ig_success, content):
        """Log posting results for tracking"""
        log_entry = {
            "date": self.today.isoformat(),
            "gmb_posted": gmb_success,
            "instagram_posted": ig_success,
            "content_snippet": content["text"][:100],
            "keyword_focus": self.identify_keyword_focus(content["text"])
        }
        
        # Append to log file
        log_file = "posting_log.json"
        try:
            with open(log_file, 'r') as f:
                logs = json.load(f)
        except:
            logs = []
        
        logs.append(log_entry)
        
        with open(log_file, 'w') as f:
            json.dump(logs, f, indent=2)
        
        print(f"\n📝 Results logged to {log_file}")
    
    def identify_keyword_focus(self, text):
        """Identify which keyword the post is targeting"""
        text_lower = text.lower()
        if "color correction" in text_lower:
            return "color correction delray beach"
        elif "balayage" in text_lower:
            return "balayage delray beach"
        elif "extension" in text_lower:
            return "hair extensions delray beach"
        elif "color" in text_lower:
            return "hair color delray beach"
        else:
            return "general"

def setup_cron_job():
    """Setup instructions for automated scheduling"""
    print("""
    ⏰ TO SCHEDULE AUTOMATIC POSTING:
    
    On Mac/Linux, add to crontab (crontab -e):
    0 10 * * 1,3,5 /usr/bin/python3 /path/to/auto-post-script.py
    
    On Windows, use Task Scheduler:
    - Create new task
    - Trigger: Monday, Wednesday, Friday at 10:00 AM
    - Action: Start this Python script
    
    Or use a service like:
    - Zapier (connect to Google Sheets + GMB)
    - IFTTT (Instagram + scheduling)
    - Buffer/Hootsuite (social media scheduling)
    """)

if __name__ == "__main__":
    # Initialize automation
    automation = SocialMediaAutomation()
    
    # Run daily posting
    automation.run_daily_posting()
    
    # Show setup instructions if first run
    if not os.path.exists("posting_log.json"):
        setup_cron_job()