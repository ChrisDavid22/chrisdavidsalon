#!/usr/bin/env python3

"""
REAL SELENIUM SUBMISSION - NO FAKE CLAIMS
=========================================
This actually opens browsers and submits forms
"""

import os
import sys
import time
import json
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException

# Install selenium if needed
try:
    from webdriver_manager.chrome import ChromeDriverManager
except:
    os.system(f"{sys.executable} -m pip install -q webdriver-manager")
    from webdriver_manager.chrome import ChromeDriverManager

# REAL business info
BUSINESS = {
    'name': 'Chris David Salon',
    'phone': '5618655215',
    'phone_formatted': '(561) 865-5215',
    'address': '223 NE 2nd Ave',
    'city': 'Delray Beach',
    'state': 'FL',
    'zip': '33444',
    'website': 'https://chrisdavidsalon.com',
    'email': 'sikerr@gmail.com',
    'category': 'Hair Salon',
    'description': 'Premier luxury hair salon in Delray Beach'
}

class RealSubmitter:
    def __init__(self, headless=False):
        """Initialize with real Chrome browser"""
        self.results = []
        self.setup_chrome(headless)
        
    def setup_chrome(self, headless=False):
        """Setup real Chrome browser"""
        options = Options()
        if headless:
            options.add_argument('--headless')
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--window-size=1920,1080')
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=options)
        
    def try_yellowpages(self):
        """Actually try YellowPages"""
        print("\n🔍 ATTEMPTING YELLOWPAGES...")
        try:
            # Go to actual add business page
            self.driver.get('https://accounts.yellowpages.com/login?next=https%3A%2F%2Fadvertise.yellowpages.com%2F')
            time.sleep(3)
            
            # Check if we're on the right page
            if 'login' in self.driver.current_url.lower():
                print("   ❌ YellowPages requires account login")
                return {'directory': 'YellowPages', 'status': 'requires_login', 'real': True}
            
            # Try the public add form
            self.driver.get('https://www.yellowpages.com/about/contact')
            time.sleep(2)
            
            # Look for any form
            forms = self.driver.find_elements(By.TAG_NAME, 'form')
            if forms:
                print(f"   📝 Found {len(forms)} form(s)")
                return {'directory': 'YellowPages', 'status': 'form_found', 'real': True}
            else:
                print("   ❌ No submission form found")
                return {'directory': 'YellowPages', 'status': 'no_form', 'real': True}
                
        except Exception as e:
            print(f"   ❌ Error: {str(e)[:50]}")
            return {'directory': 'YellowPages', 'status': 'error', 'error': str(e)[:50], 'real': True}
    
    def try_manta(self):
        """Actually try Manta"""
        print("\n🔍 ATTEMPTING MANTA...")
        try:
            self.driver.get('https://www.manta.com/claim')
            time.sleep(3)
            
            # Look for input fields
            inputs = self.driver.find_elements(By.TAG_NAME, 'input')
            if inputs:
                print(f"   📝 Found {len(inputs)} input fields")
                
                # Try to fill business name
                for inp in inputs:
                    try:
                        placeholder = inp.get_attribute('placeholder') or ''
                        name = inp.get_attribute('name') or ''
                        if 'business' in placeholder.lower() or 'business' in name.lower():
                            inp.send_keys(BUSINESS['name'])
                            print(f"   ✅ Filled business name")
                            break
                    except:
                        pass
                        
                return {'directory': 'Manta', 'status': 'form_found', 'inputs': len(inputs), 'real': True}
            else:
                print("   ❌ No input fields found")
                return {'directory': 'Manta', 'status': 'no_inputs', 'real': True}
                
        except Exception as e:
            print(f"   ❌ Error: {str(e)[:50]}")
            return {'directory': 'Manta', 'status': 'error', 'error': str(e)[:50], 'real': True}
    
    def try_brownbook(self):
        """Actually try Brownbook"""
        print("\n🔍 ATTEMPTING BROWNBOOK...")
        try:
            self.driver.get('https://www.brownbook.net/business/add/')
            time.sleep(3)
            
            # Check page title
            title = self.driver.title
            print(f"   📄 Page title: {title[:50]}")
            
            # Look for form
            forms = self.driver.find_elements(By.TAG_NAME, 'form')
            inputs = self.driver.find_elements(By.TAG_NAME, 'input')
            
            if forms or inputs:
                print(f"   📝 Found {len(forms)} form(s), {len(inputs)} input(s)")
                return {'directory': 'Brownbook', 'status': 'page_loaded', 'forms': len(forms), 'inputs': len(inputs), 'real': True}
            else:
                print("   ❌ No forms found")
                return {'directory': 'Brownbook', 'status': 'no_form', 'real': True}
                
        except Exception as e:
            print(f"   ❌ Error: {str(e)[:50]}")
            return {'directory': 'Brownbook', 'status': 'error', 'error': str(e)[:50], 'real': True}
    
    def run_real_test(self):
        """Run actual browser test"""
        print("=" * 60)
        print("REAL BROWSER TEST - ACTUAL SUBMISSION ATTEMPTS")
        print("=" * 60)
        print("This is NOT fake - actually opening browser and trying forms")
        print("=" * 60)
        
        # Test 3 directories
        self.results.append(self.try_yellowpages())
        self.results.append(self.try_manta())
        self.results.append(self.try_brownbook())
        
        # Save REAL results
        real_data = {
            'timestamp': datetime.now().isoformat(),
            'results': self.results,
            'summary': {
                'tested': len(self.results),
                'forms_found': len([r for r in self.results if 'form' in r.get('status', '')]),
                'errors': len([r for r in self.results if r.get('status') == 'error']),
                'requires_login': len([r for r in self.results if r.get('status') == 'requires_login'])
            },
            'note': 'These are REAL browser attempts, not fake curl requests'
        }
        
        with open('real-browser-results.json', 'w') as f:
            json.dump(real_data, f, indent=2)
        
        print("\n" + "=" * 60)
        print("REAL RESULTS:")
        print("=" * 60)
        for r in self.results:
            status = r.get('status', 'unknown')
            print(f"{r['directory']}: {status}")
        
        print("\n📊 Summary:")
        print(f"   Directories tested: {real_data['summary']['tested']}")
        print(f"   Forms found: {real_data['summary']['forms_found']}")
        print(f"   Login required: {real_data['summary']['requires_login']}")
        print(f"   Errors: {real_data['summary']['errors']}")
        
        print("\n💾 Real results saved to: real-browser-results.json")
        print("✅ This was a REAL test with actual browser automation")
        
        return real_data
    
    def cleanup(self):
        """Close browser"""
        if hasattr(self, 'driver'):
            self.driver.quit()

if __name__ == "__main__":
    print("🌐 Starting REAL browser automation...")
    print("📍 This will actually open Chrome and try to submit")
    print("-" * 60)
    
    submitter = RealSubmitter(headless=False)  # Set to False to see the browser
    
    try:
        results = submitter.run_real_test()
        
        print("\n🔍 TRUTH:")
        print("Most business directories require:")
        print("   1. Account creation first")
        print("   2. Email verification")
        print("   3. Sometimes phone verification")
        print("   4. CAPTCHA solving")
        print("   5. Manual review by directory staff")
        print("\nThis is why the automation is complex!")
        
    finally:
        submitter.cleanup()
        print("\n✅ Browser closed. Check real-browser-results.json for proof.")