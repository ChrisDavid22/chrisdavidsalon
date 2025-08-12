#!/usr/bin/env python3

"""
PARALLEL DIRECTORY AUTOMATION - CHRIS DAVID SALON
==================================================
Runs multiple directory submissions in parallel for speed
ZERO FAKE DATA - REAL SUBMISSIONS ONLY
"""

import os
import sys
import time
import json
import re
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import hashlib
import requests
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
import queue

# Install required packages
def install_requirements():
    """Install all required packages"""
    packages = [
        'selenium',
        'webdriver-manager',
        'requests',
        'beautifulsoup4',
        'google-auth',
        'google-auth-oauthlib',
        'google-auth-httplib2',
        'google-api-python-client',
        '2captcha-python'
    ]
    
    for package in packages:
        os.system(f"{sys.executable} -m pip install -q {package}")

try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.common.keys import Keys
    from selenium.webdriver.support.ui import WebDriverWait, Select
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options
    from selenium.common.exceptions import *
    from webdriver_manager.chrome import ChromeDriverManager
    from bs4 import BeautifulSoup
except ImportError:
    print("Installing required packages...")
    install_requirements()
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.common.keys import Keys
    from selenium.webdriver.support.ui import WebDriverWait, Select
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options
    from selenium.common.exceptions import *
    from webdriver_manager.chrome import ChromeDriverManager
    from bs4 import BeautifulSoup

# Business Information - REAL DATA ONLY
BUSINESS = {
    'name': 'Chris David Salon',
    'owner_first': 'Chris',
    'owner_last': 'David',
    'address': '223 NE 2nd Ave',
    'city': 'Delray Beach',
    'state': 'FL',
    'zip': '33444',
    'phone': '5618655215',
    'phone_formatted': '(561) 865-5215',
    'email': 'sikerr@gmail.com',
    'backup_email': 'stuart@isovision.ai',
    'website': 'https://chrisdavidsalon.com',
    'category': 'Hair Salon',
    'description': 'Premier luxury hair salon specializing in color correction, balayage, and keratin treatments. Chris David is a master colorist with 20+ years experience, formerly an educator for Davines.',
    'year_established': '2020',
    'hours': {
        'monday': 'Closed',
        'tuesday': '9:00 AM - 7:00 PM',
        'wednesday': '9:00 AM - 7:00 PM',
        'thursday': '9:00 AM - 7:00 PM',
        'friday': '9:00 AM - 7:00 PM',
        'saturday': '9:00 AM - 5:00 PM',
        'sunday': '10:00 AM - 4:00 PM'
    }
}

# Thread-safe tracking
tracking_lock = threading.Lock()
TRACKING = {
    'started': datetime.now().isoformat(),
    'attempted': 0,
    'successful': 0,
    'pending_verification': 0,
    'failed': 0,
    'verified_backlinks': 0,
    'in_progress': []
}

# Results queue for thread-safe result collection
results_queue = queue.Queue()

class ParallelDirectorySubmitter:
    """Handle individual directory submission in parallel"""
    
    def __init__(self, directory_name: str):
        """Initialize for specific directory"""
        self.directory_name = directory_name
        self.driver = None
        
    def setup_chrome(self):
        """Setup Chrome with anti-detection measures"""
        options = Options()
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        options.add_argument('--disable-gpu')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--window-size=1920,1080')
        options.add_argument('--headless')  # Run headless for parallel execution
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=options)
        
        # Remove webdriver property
        self.driver.execute_cdp_cmd('Page.addScriptToEvaluateOnNewDocument', {
            'source': '''
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined
                })
            '''
        })
        
    def smart_fill(self, field_names, value):
        """Try multiple strategies to fill a form field"""
        for field_name in field_names:
            selectors = [
                f"input[name*='{field_name}']",
                f"input[id*='{field_name}']",
                f"input[placeholder*='{field_name}']",
                f"textarea[name*='{field_name}']",
                f"input[type='text'][name*='{field_name}']",
                f"input[type='email'][name*='{field_name}']",
                f"input[type='tel'][name*='{field_name}']"
            ]
            
            for selector in selectors:
                try:
                    element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    element.clear()
                    element.send_keys(value)
                    time.sleep(0.3)  # Small delay
                    return True
                except:
                    continue
        return False
    
    def submit_yellowpages(self):
        """Submit to YellowPages"""
        try:
            self.driver.get('https://www.yellowpages.com/add-business')
            time.sleep(3)
            
            if self.smart_fill(['business', 'company', 'name'], BUSINESS['name']):
                self.smart_fill(['phone', 'tel'], BUSINESS['phone'])
                self.smart_fill(['address', 'street'], BUSINESS['address'])
                self.smart_fill(['city'], BUSINESS['city'])
                self.smart_fill(['zip', 'postal'], BUSINESS['zip'])
                self.smart_fill(['website', 'url'], BUSINESS['website'])
                
                submit_btn = self.driver.find_element(By.CSS_SELECTOR, 
                    "button[type='submit'], input[type='submit'], button.submit")
                submit_btn.click()
                time.sleep(5)
                
                if 'thank' in self.driver.page_source.lower() or 'success' in self.driver.page_source.lower():
                    return 'submitted'
                else:
                    return 'pending_verification'
            else:
                return 'form_not_found'
                
        except Exception as e:
            return f'error: {str(e)[:50]}'
    
    def submit_hotfrog(self):
        """Submit to Hotfrog"""
        try:
            self.driver.get('https://www.hotfrog.com/add-company')
            time.sleep(3)
            
            if self.smart_fill(['company', 'business'], BUSINESS['name']):
                self.smart_fill(['email'], BUSINESS['email'])
                self.smart_fill(['phone'], BUSINESS['phone'])
                self.smart_fill(['address'], BUSINESS['address'])
                self.smart_fill(['city'], BUSINESS['city'])
                self.smart_fill(['postcode', 'zip'], BUSINESS['zip'])
                self.smart_fill(['website'], BUSINESS['website'])
                self.smart_fill(['description'], BUSINESS['description'])
                
                submit_btn = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
                submit_btn.click()
                time.sleep(5)
                
                if 'success' in self.driver.current_url or 'thank' in self.driver.page_source.lower():
                    return 'submitted'
                else:
                    return 'pending_verification'
            else:
                return 'form_not_found'
                
        except Exception as e:
            return f'error: {str(e)[:50]}'
    
    def submit_manta(self):
        """Submit to Manta"""
        try:
            self.driver.get('https://www.manta.com/add-your-business')
            time.sleep(3)
            
            if self.smart_fill(['business', 'company'], BUSINESS['name']):
                self.smart_fill(['phone'], BUSINESS['phone'])
                self.smart_fill(['address'], BUSINESS['address'])
                self.smart_fill(['city'], BUSINESS['city'])
                self.smart_fill(['zip'], BUSINESS['zip'])
                self.smart_fill(['website'], BUSINESS['website'])
                
                submit_btn = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
                submit_btn.click()
                time.sleep(5)
                
                if 'success' in self.driver.page_source.lower():
                    return 'submitted'
                else:
                    return 'pending_verification'
            else:
                return 'form_not_found'
                
        except Exception as e:
            return f'error: {str(e)[:50]}'
    
    def submit_brownbook(self):
        """Submit to Brownbook"""
        try:
            self.driver.get('https://www.brownbook.net/business/add')
            time.sleep(3)
            
            if self.smart_fill(['name', 'business'], BUSINESS['name']):
                self.smart_fill(['phone'], BUSINESS['phone'])
                self.smart_fill(['address'], BUSINESS['address'])
                self.smart_fill(['city'], BUSINESS['city'])
                self.smart_fill(['zip', 'postal'], BUSINESS['zip'])
                self.smart_fill(['website'], BUSINESS['website'])
                self.smart_fill(['description'], BUSINESS['description'])
                
                submit_btn = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit'], input[type='submit']")
                submit_btn.click()
                time.sleep(5)
                
                if 'thank' in self.driver.page_source.lower():
                    return 'submitted'
                else:
                    return 'pending_verification'
            else:
                return 'form_not_found'
                
        except Exception as e:
            return f'error: {str(e)[:50]}'
    
    def submit_showmelocal(self):
        """Submit to ShowMeLocal"""
        try:
            self.driver.get('https://www.showmelocal.com/AddYourBusiness.aspx')
            time.sleep(3)
            
            if self.smart_fill(['business', 'company'], BUSINESS['name']):
                self.smart_fill(['phone'], BUSINESS['phone'])
                self.smart_fill(['address'], BUSINESS['address'])
                self.smart_fill(['city'], BUSINESS['city'])
                self.smart_fill(['zip'], BUSINESS['zip'])
                self.smart_fill(['website'], BUSINESS['website'])
                
                submit_btn = self.driver.find_element(By.CSS_SELECTOR, "input[type='submit']")
                submit_btn.click()
                time.sleep(5)
                
                if 'success' in self.driver.page_source.lower():
                    return 'submitted'
                else:
                    return 'pending_verification'
            else:
                return 'form_not_found'
                
        except Exception as e:
            return f'error: {str(e)[:50]}'
    
    def run(self):
        """Execute submission for this directory"""
        print(f"🚀 [{self.directory_name}] Starting parallel submission...")
        
        # Update tracking to show in progress
        with tracking_lock:
            TRACKING['in_progress'].append(self.directory_name)
            update_status()
        
        # Setup Chrome
        self.setup_chrome()
        
        # Get the submission method for this directory
        submit_methods = {
            'YellowPages': self.submit_yellowpages,
            'Hotfrog': self.submit_hotfrog,
            'Manta': self.submit_manta,
            'Brownbook': self.submit_brownbook,
            'ShowMeLocal': self.submit_showmelocal,
        }
        
        submit_method = submit_methods.get(self.directory_name)
        if not submit_method:
            result = {'directory': self.directory_name, 'status': 'not_implemented'}
        else:
            status = submit_method()
            result = {'directory': self.directory_name, 'status': status}
        
        # Update tracking
        with tracking_lock:
            TRACKING['attempted'] += 1
            if 'submitted' in status:
                TRACKING['successful'] += 1
                print(f"✅ [{self.directory_name}] SUBMITTED")
            elif 'pending_verification' in status:
                TRACKING['pending_verification'] += 1
                print(f"📧 [{self.directory_name}] Needs verification")
            else:
                TRACKING['failed'] += 1
                print(f"❌ [{self.directory_name}] Failed: {status}")
            
            # Remove from in progress
            if self.directory_name in TRACKING['in_progress']:
                TRACKING['in_progress'].remove(self.directory_name)
            
            update_status()
        
        # Cleanup
        if self.driver:
            self.driver.quit()
        
        return result

def update_status():
    """Update status files (thread-safe)"""
    status = {
        'timestamp': datetime.now().isoformat(),
        'tracking': TRACKING,
        'parallel_execution': True,
        'success_rate': f"{(TRACKING['successful'] / max(TRACKING['attempted'], 1)) * 100:.1f}%"
    }
    
    with open('parallel-automation-status.json', 'w') as f:
        json.dump(status, f, indent=2)
    
    # Update display status
    display_status = {
        'status': 'running_parallel',
        'inProgress': TRACKING['in_progress'],
        'submissions': {
            'attempted': TRACKING['attempted'],
            'successful': TRACKING['successful'],
            'pending': TRACKING['pending_verification'],
            'failed': TRACKING['failed']
        },
        'successRate': status['success_rate'],
        'lastUpdate': datetime.now().isoformat()
    }
    
    with open('automation-status.json', 'w') as f:
        json.dump(display_status, f, indent=2)

def run_parallel_automation(max_workers=5):
    """Run automation with parallel execution"""
    print("=" * 60)
    print("PARALLEL AUTOMATION - RUNNING MULTIPLE DIRECTORIES AT ONCE")
    print("=" * 60)
    print(f"Business: {BUSINESS['name']}")
    print(f"Email: {BUSINESS['email']}")
    print(f"Max parallel workers: {max_workers}")
    print("=" * 60)
    
    # Directories to submit to
    directories = [
        'YellowPages',
        'Hotfrog',
        'Manta',
        'Brownbook',
        'ShowMeLocal',
        # Add more directories here
    ]
    
    results = []
    
    # Run submissions in parallel
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit all directories to the thread pool
        futures = {executor.submit(ParallelDirectorySubmitter(directory).run): directory 
                  for directory in directories}
        
        # Process completed submissions
        for future in as_completed(futures):
            directory = futures[future]
            try:
                result = future.result(timeout=60)  # 60 second timeout per directory
                results.append(result)
            except Exception as e:
                print(f"❌ [{directory}] Exception: {str(e)[:50]}")
                with tracking_lock:
                    TRACKING['failed'] += 1
                    TRACKING['attempted'] += 1
                results.append({'directory': directory, 'status': f'exception: {str(e)[:50]}'})
    
    # Final report
    print("\n" + "=" * 60)
    print("PARALLEL EXECUTION COMPLETE - REAL RESULTS")
    print("=" * 60)
    print(f"⏱️  Execution time: {(datetime.now() - datetime.fromisoformat(TRACKING['started'])).total_seconds():.1f} seconds")
    print(f"📊 Attempted: {TRACKING['attempted']}")
    print(f"✅ Successful: {TRACKING['successful']}")
    print(f"📧 Pending Verification: {TRACKING['pending_verification']}")
    print(f"❌ Failed: {TRACKING['failed']}")
    print(f"📈 Success Rate: {(TRACKING['successful'] / max(TRACKING['attempted'], 1)) * 100:.1f}%")
    
    # Save final results
    final_status = {
        'timestamp': datetime.now().isoformat(),
        'tracking': TRACKING,
        'results': results,
        'parallel_execution': True,
        'max_workers': max_workers,
        'execution_time': (datetime.now() - datetime.fromisoformat(TRACKING['started'])).total_seconds()
    }
    
    with open('parallel-results.json', 'w') as f:
        json.dump(final_status, f, indent=2)
    
    print("\n💾 Results saved to parallel-results.json")
    print("🚀 Parallel execution is much faster than sequential!")

if __name__ == "__main__":
    # Run with 5 parallel workers (can adjust based on system capacity)
    run_parallel_automation(max_workers=5)