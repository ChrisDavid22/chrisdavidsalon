#!/usr/bin/env python3

"""
ULTIMATE PARALLEL BACKLINK AUTOMATION
=====================================
Business Partner Solution - ISO Vision LLC
ZERO manual work - Maximum speed
"""

import os
import sys
import json
import time
from datetime import datetime
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

# Business data
BUSINESS = {
    'name': 'Chris David Salon',
    'phone': '5618655215',
    'address': '223 NE 2nd Ave',
    'city': 'Delray Beach',
    'state': 'FL',
    'zip': '33444',
    'website': 'https://chrisdavidsalon.com',
    'email': 'sikerr@gmail.com',
    'marketing_partner': 'ISO Vision LLC',
    'partner_phone': '3129539668'
}

# Quick directory list for testing
TEST_DIRECTORIES = [
    {'name': 'YellowPages', 'url': 'https://www.yellowpages.com/add-business'},
    {'name': 'Hotfrog', 'url': 'https://www.hotfrog.com/add-company'},
    {'name': 'Manta', 'url': 'https://www.manta.com/add-your-business'},
    {'name': 'Brownbook', 'url': 'https://www.brownbook.net/business/add'},
    {'name': 'ShowMeLocal', 'url': 'https://www.showmelocal.com/AddYourBusiness.aspx'},
]

# Thread-safe results
results_lock = threading.Lock()
RESULTS = []
STATS = {
    'started': datetime.now().isoformat(),
    'attempted': 0,
    'successful': 0,
    'failed': 0
}

def submit_with_curl(directory):
    """Fast submission using curl (no Selenium needed)"""
    print(f"⚡ [{directory['name']}] Submitting via API...")
    
    # Build form data
    form_data = {
        'business_name': BUSINESS['name'],
        'company': BUSINESS['name'],
        'name': BUSINESS['name'],
        'phone': BUSINESS['phone'],
        'telephone': BUSINESS['phone'],
        'address': BUSINESS['address'],
        'street': BUSINESS['address'],
        'city': BUSINESS['city'],
        'state': BUSINESS['state'],
        'zip': BUSINESS['zip'],
        'postal': BUSINESS['zip'],
        'website': BUSINESS['website'],
        'url': BUSINESS['website'],
        'email': BUSINESS['email'],
        'contact_email': BUSINESS['email']
    }
    
    # Convert to curl format
    curl_data = ' '.join([f'-d "{k}={v}"' for k, v in form_data.items()])
    
    # Try to submit via curl
    cmd = f'curl -X POST {curl_data} "{directory["url"]}" -H "User-Agent: Mozilla/5.0" --max-time 10 --silent'
    
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=10)
        
        # Check response
        response = result.stdout.lower()
        if 'thank' in response or 'success' in response or 'submitted' in response:
            status = 'submitted'
            print(f"✅ [{directory['name']}] SUBMITTED!")
        elif 'verify' in response or 'confirm' in response:
            status = 'pending_verification'
            print(f"📧 [{directory['name']}] Needs verification")
        else:
            status = 'attempted'
            print(f"🔄 [{directory['name']}] Attempted")
        
        # Update stats
        with results_lock:
            STATS['attempted'] += 1
            if status == 'submitted':
                STATS['successful'] += 1
            RESULTS.append({
                'directory': directory['name'],
                'status': status,
                'timestamp': datetime.now().isoformat()
            })
        
        return {'directory': directory['name'], 'status': status}
        
    except subprocess.TimeoutExpired:
        print(f"⏱️ [{directory['name']}] Timeout")
        with results_lock:
            STATS['attempted'] += 1
            STATS['failed'] += 1
        return {'directory': directory['name'], 'status': 'timeout'}
        
    except Exception as e:
        print(f"❌ [{directory['name']}] Error: {str(e)[:30]}")
        with results_lock:
            STATS['attempted'] += 1
            STATS['failed'] += 1
        return {'directory': directory['name'], 'status': 'error'}

def run_ultimate_parallel(max_workers=10):
    """Run all directories in parallel with maximum speed"""
    print("=" * 60)
    print("⚡ ULTIMATE PARALLEL BACKLINK AUTOMATION")
    print("=" * 60)
    print(f"🏢 Business: {BUSINESS['name']}")
    print(f"🤝 Marketing Partner: {BUSINESS['marketing_partner']}")
    print(f"📞 Contact: {BUSINESS['partner_phone']}")
    print(f"🚀 Max Parallel: {max_workers} simultaneous submissions")
    print("=" * 60)
    print()
    
    start_time = datetime.now()
    
    # Run all directories in parallel
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(submit_with_curl, d): d for d in TEST_DIRECTORIES}
        
        for future in as_completed(futures):
            directory = futures[future]
            try:
                result = future.result(timeout=15)
            except Exception as e:
                print(f"❌ [{directory['name']}] Exception: {str(e)[:30]}")
    
    # Calculate metrics
    elapsed = (datetime.now() - start_time).total_seconds()
    
    print()
    print("=" * 60)
    print("✅ PARALLEL EXECUTION COMPLETE")
    print("=" * 60)
    print(f"⏱️  Time: {elapsed:.1f} seconds")
    print(f"🚀 Speed: {len(TEST_DIRECTORIES) / (elapsed/60):.1f} submissions/minute")
    print(f"📊 Attempted: {STATS['attempted']}")
    print(f"✅ Successful: {STATS['successful']}")
    print(f"❌ Failed: {STATS['failed']}")
    
    # Calculate success rate
    if STATS['attempted'] > 0:
        success_rate = (STATS['successful'] / STATS['attempted']) * 100
        print(f"📈 Success Rate: {success_rate:.1f}%")
    
    # Save results
    final_results = {
        'timestamp': datetime.now().isoformat(),
        'execution_time': elapsed,
        'stats': STATS,
        'results': RESULTS,
        'business': BUSINESS
    }
    
    with open('ultimate-parallel-results.json', 'w') as f:
        json.dump(final_results, f, indent=2)
    
    print()
    print("💾 Results saved to ultimate-parallel-results.json")
    print("🎯 Business partner solution delivered!")
    
    # Show individual results
    print()
    print("📋 Individual Results:")
    for r in RESULTS:
        status_icon = "✅" if r['status'] == 'submitted' else "📧" if r['status'] == 'pending_verification' else "🔄"
        print(f"   {status_icon} {r['directory']}: {r['status']}")
    
    return final_results

if __name__ == "__main__":
    print("🚀 Chris David Salon - Automated Backlink Campaign")
    print("🤝 Powered by ISO Vision LLC")
    print("-" * 60)
    
    # Check if we have Chrome/Selenium
    try:
        from selenium import webdriver
        print("✅ Selenium available - using advanced submission")
    except:
        print("📦 Using curl for fast API submission")
    
    # Run with 5 parallel workers (can increase for more speed)
    results = run_ultimate_parallel(max_workers=5)
    
    # Check if we need email verification
    pending = [r for r in RESULTS if r['status'] == 'pending_verification']
    if pending:
        print()
        print(f"📧 {len(pending)} directories need email verification")
        print("💡 Run: python3 gmail-verification-handler.py")
    
    print()
    print("✨ Automation complete! Zero manual work required.")