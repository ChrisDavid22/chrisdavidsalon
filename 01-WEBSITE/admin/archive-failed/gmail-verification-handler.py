#!/usr/bin/env python3

"""
GMAIL VERIFICATION HANDLER
Automatically processes verification emails for directory submissions
"""

import os
import re
import time
import json
import base64
from datetime import datetime, timedelta
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly', 
          'https://www.googleapis.com/auth/gmail.modify']

class GmailVerificationHandler:
    def __init__(self):
        """Initialize Gmail API connection"""
        self.service = self.authenticate()
        self.processed_emails = self.load_processed_emails()
        
    def authenticate(self):
        """Authenticate with Gmail API"""
        creds = None
        # Token file stores the user's access and refresh tokens
        if os.path.exists('token.json'):
            creds = Credentials.from_authorized_user_file('token.json', SCOPES)
        
        # If there are no (valid) credentials available, let the user log in.
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                # Look for credentials in common locations
                credential_paths = [
                    'credentials.json',
                    os.path.expanduser('~/.config/gcloud/application_default_credentials.json'),
                    os.path.expanduser('~/credentials.json')
                ]
                
                flow = None
                for path in credential_paths:
                    if os.path.exists(path):
                        flow = InstalledAppFlow.from_client_secrets_file(path, SCOPES)
                        break
                
                if flow:
                    creds = flow.run_local_server(port=0)
                else:
                    print("⚠️ No Google credentials found. Using fallback method...")
                    return None
            
            # Save the credentials for the next run
            if creds:
                with open('token.json', 'w') as token:
                    token.write(creds.to_json())
        
        if creds:
            return build('gmail', 'v1', credentials=creds)
        return None
    
    def load_processed_emails(self):
        """Load list of already processed emails"""
        try:
            with open('processed_verifications.json', 'r') as f:
                return json.load(f)
        except:
            return []
    
    def save_processed_email(self, email_id):
        """Save processed email ID to avoid reprocessing"""
        self.processed_emails.append(email_id)
        with open('processed_verifications.json', 'w') as f:
            json.dump(self.processed_emails, f)
    
    def search_verification_emails(self):
        """Search for verification emails from directories"""
        if not self.service:
            print("❌ Gmail API not available")
            return []
        
        try:
            # Search for emails from the last 24 hours with verification keywords
            query = '(subject:(verify OR confirm OR activate OR "verify your listing" OR "confirm your business") OR from:(yellowpages OR hotfrog OR manta OR yelp OR bing OR foursquare OR brownbook OR citysquares)) newer_than:1d'
            
            results = self.service.users().messages().list(
                userId='me',
                q=query,
                maxResults=20
            ).execute()
            
            messages = results.get('messages', [])
            print(f"📧 Found {len(messages)} potential verification emails")
            return messages
            
        except HttpError as error:
            print(f'❌ An error occurred: {error}')
            return []
    
    def extract_verification_link(self, message_id):
        """Extract verification link from email"""
        try:
            message = self.service.users().messages().get(
                userId='me',
                id=message_id
            ).execute()
            
            # Get email content
            payload = message['payload']
            headers = payload.get('headers', [])
            
            # Get sender and subject
            sender = ''
            subject = ''
            for header in headers:
                if header['name'] == 'From':
                    sender = header['value'].lower()
                if header['name'] == 'Subject':
                    subject = header['value']
            
            print(f"   📨 Email from: {sender[:50]}")
            print(f"   📋 Subject: {subject[:50]}")
            
            # Extract body
            body = self.extract_body(payload)
            
            # Find verification links
            verification_patterns = [
                r'https?://[^\s<>"]+(?:verify|confirm|activate)[^\s<>"]*',
                r'https?://[^\s<>"]+/listings/[^\s<>"]+',
                r'https?://[^\s<>"]+/business/[^\s<>"]+',
                r'https?://[^\s<>"]+/claim[^\s<>"]*'
            ]
            
            for pattern in verification_patterns:
                matches = re.findall(pattern, body, re.IGNORECASE)
                if matches:
                    link = matches[0]
                    # Clean up the link
                    link = link.strip('.,;:')
                    print(f"   ✅ Found verification link: {link[:60]}...")
                    return {
                        'link': link,
                        'sender': sender,
                        'subject': subject,
                        'directory': self.identify_directory(sender, subject)
                    }
            
            # If no direct link, look for verification codes
            code_patterns = [
                r'(?:code|pin|verification)[\s:]+(\d{4,6})',
                r'\b(\d{4,6})\b.*(?:code|verify|confirm)'
            ]
            
            for pattern in code_patterns:
                matches = re.findall(pattern, body, re.IGNORECASE)
                if matches:
                    code = matches[0]
                    print(f"   🔢 Found verification code: {code}")
                    return {
                        'code': code,
                        'sender': sender,
                        'subject': subject,
                        'directory': self.identify_directory(sender, subject)
                    }
            
        except Exception as e:
            print(f"   ❌ Error extracting link: {str(e)[:50]}")
        
        return None
    
    def extract_body(self, payload):
        """Extract email body from payload"""
        body = ''
        
        if 'parts' in payload:
            for part in payload['parts']:
                if part['mimeType'] == 'text/plain':
                    data = part['body']['data']
                    body += base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
                elif part['mimeType'] == 'text/html':
                    data = part['body']['data']
                    body += base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
        elif payload['body'].get('data'):
            body = base64.urlsafe_b64decode(payload['body']['data']).decode('utf-8', errors='ignore')
        
        return body
    
    def identify_directory(self, sender, subject):
        """Identify which directory sent the email"""
        directories = {
            'yellowpages': 'YellowPages',
            'hotfrog': 'Hotfrog',
            'manta': 'Manta',
            'yelp': 'Yelp',
            'bing': 'Bing Places',
            'foursquare': 'Foursquare',
            'brownbook': 'Brownbook',
            'citysquares': 'CitySquares',
            'showmelocal': 'ShowMeLocal',
            'local.com': 'Local.com'
        }
        
        combined = (sender + ' ' + subject).lower()
        for key, name in directories.items():
            if key in combined:
                return name
        
        return 'Unknown'
    
    def process_verifications(self):
        """Process all pending verification emails"""
        print("\n" + "="*60)
        print("📧 GMAIL VERIFICATION PROCESSOR")
        print("="*60)
        
        emails = self.search_verification_emails()
        processed = 0
        verified = []
        
        for email in emails:
            if email['id'] in self.processed_emails:
                continue
            
            print(f"\n🔍 Processing email {email['id']}...")
            verification = self.extract_verification_link(email['id'])
            
            if verification:
                if 'link' in verification:
                    print(f"   🔗 Verification link for {verification['directory']}")
                    print(f"   📌 Link: {verification['link'][:80]}...")
                    verified.append({
                        'directory': verification['directory'],
                        'type': 'link',
                        'value': verification['link'],
                        'timestamp': datetime.now().isoformat()
                    })
                elif 'code' in verification:
                    print(f"   🔢 Verification code for {verification['directory']}: {verification['code']}")
                    verified.append({
                        'directory': verification['directory'],
                        'type': 'code',
                        'value': verification['code'],
                        'timestamp': datetime.now().isoformat()
                    })
                
                self.save_processed_email(email['id'])
                processed += 1
        
        print(f"\n📊 Processed {processed} verification emails")
        print(f"✅ Found {len(verified)} verifications")
        
        # Save verification data
        if verified:
            with open('pending-verifications.json', 'w') as f:
                json.dump(verified, f, indent=2)
            print(f"💾 Saved to pending-verifications.json")
        
        return verified
    
    def mark_as_processed(self, message_id):
        """Mark email as processed"""
        try:
            self.service.users().messages().modify(
                userId='me',
                id=message_id,
                body={'removeLabelIds': ['UNREAD']}
            ).execute()
        except:
            pass

def main():
    """Main function to process Gmail verifications"""
    handler = GmailVerificationHandler()
    
    if not handler.service:
        print("\n⚠️ Gmail API not configured. To enable:")
        print("1. Go to https://console.cloud.google.com/apis/credentials")
        print("2. Create OAuth 2.0 credentials")
        print("3. Download as credentials.json")
        print("4. Place in this directory")
        return
    
    # Process verifications
    verifications = handler.process_verifications()
    
    # Update automation status
    if verifications:
        try:
            with open('automation-status.json', 'r') as f:
                status = json.load(f)
            
            status['verifications_found'] = len(verifications)
            status['lastVerificationCheck'] = datetime.now().isoformat()
            
            with open('automation-status.json', 'w') as f:
                json.dump(status, f, indent=2)
        except:
            pass
    
    print("\n✅ Gmail verification check complete")

if __name__ == "__main__":
    main()