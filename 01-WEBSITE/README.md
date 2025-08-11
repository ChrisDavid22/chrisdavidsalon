# Chris David Salon Website

## ⚠️ CRITICAL: CHECK PROJECT-TODO.md FIRST!
**Before doing ANY work, read [PROJECT-TODO.md](./PROJECT-TODO.md) for active tasks and context**

## Repository Information
- **GitHub Repository**: https://github.com/ChrisDavid22/chrisdavidsalon.git
- **Live Site**: https://chrisdavidsalon.com
- **Deployment**: Vercel (auto-deploys from main branch)

## Current Version
- Version: 2.5.1
- Last Updated: 2025-08-10

## Project Structure
```
01-WEBSITE/
├── index.html          # Main website
├── policies.html       # Salon policies page
├── admin/             # Admin dashboard
│   ├── dashboard.html
│   ├── api-config.js
│   └── ...
├── data/              # Persistent data storage
│   ├── version.json
│   ├── analytics.json
│   └── seo-data.json
├── deploy.sh          # Auto-increment deployment script
└── README.md          # This file
```

## Deployment Instructions
1. Make changes to files
2. Run deployment script: `./deploy.sh "Description of changes"`
3. Script will:
   - Auto-increment version number
   - Commit changes
   - Push to GitHub
   - Vercel will auto-deploy within 60 seconds

## Important Notes
- **Always push to main branch** - Vercel is configured to deploy from main
- **Version tracking** - Version number in data/version.json is dynamically loaded
- **Repository URL must remain**: https://github.com/ChrisDavid22/chrisdavidsalon.git

## Vercel Configuration
- Project should be connected to: ChrisDavid22/chrisdavidsalon repository
- Auto-deploy from: main branch
- Root directory: 01-WEBSITE/

## Troubleshooting
If site is not updating:
1. Check Vercel dashboard for deployment status
2. Verify repository connection in Vercel settings
3. Check for build errors in Vercel logs
4. Ensure pushing to correct repository (ChrisDavid22/chrisdavidsalon)