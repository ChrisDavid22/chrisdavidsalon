# Directory Submission Tool

Playwright-based tool to submit Chris David Salon to business directories.

## Setup

```bash
cd 03-AUTOMATION/directory-submit
npm install
```

## Usage

Submit to individual directories:
```bash
npm run foursquare   # Foursquare (feeds 100+ apps)
npm run bing         # Bing Places
npm run apple        # Apple Maps Connect
npm run facebook     # Facebook Business Page
```

Submit to all directories in sequence:
```bash
npm run all
```

Or run directly:
```bash
node submit.js foursquare
node submit.js bing
node submit.js all
```

## How It Works

1. Opens the directory website in a browser window
2. Auto-fills form fields with Chris David Salon info
3. Waits for you to review, complete any CAPTCHAs, and submit
4. Press Enter in terminal to proceed to the next directory

## Business Info Used

The tool reads from `01-WEBSITE/data/business-info.json`:
- Name: Chris David Salon
- Address: 1878C Dr. Andres Way, Delray Beach, FL 33445
- Phone: (561) 299-0950
- Email: info@chrisdavidsalon.com
- Website: https://chrisdavidsalon.com
