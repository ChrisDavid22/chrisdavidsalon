# Security Setup Guide - Chris David Salon

## 🔐 CRITICAL: API Key Security

### ⚠️ Current Security Issue
API keys stored in localStorage are **NOT SECURE** - they're visible to anyone who views your site's code!

### ✅ Proper Security Setup

## Step 1: Make GitHub Repository Private

1. Go to https://github.com/ChrisDavid22/chrisdavidsalon/settings
2. Scroll to "Danger Zone"
3. Click "Change repository visibility"
4. Select "Make private"
5. Confirm the change

**This is FREE for personal accounts and WILL work with Vercel!**

## Step 2: Reconnect Vercel to Private Repo

1. Go to your Vercel dashboard
2. Project Settings → Git
3. If it shows an error, click "Disconnect"
4. Click "Connect Git Repository"
5. Select your (now private) repository
6. Vercel will request permission - approve it
7. Deploy will work perfectly!

## Step 3: Move API Keys to Vercel Environment Variables

### In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add these variables:

```
CLAUDE_API_KEY = sk-ant-api03-xxxxx
OPENAI_API_KEY = sk-proj-xxxxx  
GOOGLE_API_KEY = AIzaSyxxxxx
GMB_API_KEY = [your Google My Business key]
GMB_ACCOUNT_ID = [your account ID]
GMB_LOCATION_ID = [your location ID]
```

### Create API Endpoint (Secure Method):

Create `/api/config.js` in your project:

```javascript
// This runs on the server, not visible to users
export default function handler(req, res) {
  // Only return non-sensitive config
  res.status(200).json({
    hasClaudeKey: !!process.env.CLAUDE_API_KEY,
    hasGoogleKey: !!process.env.GOOGLE_API_KEY,
    // Never send actual keys to frontend!
  });
}
```

### For API Calls (Server-Side):

Create `/api/seo-analysis.js`:

```javascript
export default async function handler(req, res) {
  const apiKey = process.env.CLAUDE_API_KEY; // Secure!
  
  // Make API call server-side
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    headers: {
      'x-api-key': apiKey, // Key never exposed to client
      'content-type': 'application/json'
    },
    body: JSON.stringify(req.body)
  });
  
  const data = await response.json();
  res.status(200).json(data);
}
```

## Step 4: Update Admin Dashboard

Replace direct API calls with server endpoints:

```javascript
// OLD (INSECURE):
fetch('https://api.anthropic.com/v1/messages', {
  headers: { 'x-api-key': localStorage.getItem('claudeAPIKey') }
});

// NEW (SECURE):
fetch('/api/seo-analysis', {
  method: 'POST',
  body: JSON.stringify({ prompt: 'Analyze SEO...' })
});
```

## 🛡️ Security Best Practices

### DO:
✅ Use Vercel Environment Variables for all secrets
✅ Keep GitHub repo private
✅ Make API calls from server-side endpoints
✅ Use `.env.local` for local development (gitignored)
✅ Rotate API keys regularly

### DON'T:
❌ Store API keys in client-side code
❌ Commit `.env` files to Git
❌ Use localStorage for sensitive data
❌ Make direct API calls from frontend
❌ Share API keys in documentation

## 📋 Security Checklist

- [ ] GitHub repository is PRIVATE
- [ ] All API keys removed from code
- [ ] API keys added to Vercel Environment Variables
- [ ] Server-side API endpoints created
- [ ] Frontend updated to use endpoints
- [ ] `.env` file is in `.gitignore`
- [ ] Old API keys revoked and regenerated

## 🚨 If Keys Were Exposed

1. **Immediately revoke all exposed keys:**
   - Claude: https://console.anthropic.com
   - OpenAI: https://platform.openai.com
   - Google: https://console.cloud.google.com

2. **Generate new keys**

3. **Add new keys to Vercel Environment Variables only**

4. **Never commit them to code again**

## 💡 Why This Matters

- **Client-side storage** = Anyone can steal your keys
- **Server-side storage** = Only your server can access keys
- **Private repo** = Code is hidden from public
- **Environment variables** = Secrets separate from code

---

*Remember: API keys are like passwords - treat them with the same security!*