# Citation Automation Agent v2.0

Advanced Playwright-based system for automating business directory submissions with sophisticated anti-detection and evasion capabilities.

## Features

- **Advanced Anti-Detection**
  - Randomized browser fingerprints (Chrome, Safari, Firefox profiles)
  - Canvas fingerprint noise injection
  - WebGL parameter spoofing
  - Timezone and geolocation consistency
  - Plugin and permission emulation

- **Human-Like Behavior**
  - Bezier curve mouse movements (not linear)
  - Variable typing speed with occasional "typos"
  - Random scrolling patterns
  - Natural pauses and hesitations

- **Adaptive Form Filling**
  - Multiple detection strategies (selectors, labels, placeholders, visual position)
  - Automatic fallback between strategies
  - CAPTCHA detection and handling

- **Rate Limiting Protection**
  - Adaptive delays between requests
  - Exponential backoff on failures
  - Domain-specific cooldowns

## Installation

```bash
cd citation-agent
npm install
npx playwright install chromium firefox webkit
```

## Usage

### List Available Directories

```bash
node index.js list
```

### Test Browser Stealth

```bash
# Basic stealth test
node index.js test

# Advanced evasion engine test (tests against 3 bot detection sites)
node index.js test-evasion
```

### Submit to Directories

```bash
# Submit to a specific directory
node index.js submit hotfrog

# Submit to all easy directories
node index.js submit --safe-only

# Submit to all directories
node index.js submit --all

# Keep browser open to see results
node index.js submit hotfrog --keep-open
```

### Adaptive Submission (Recommended)

The adaptive submission mode uses advanced evasion techniques and multiple form-filling strategies:

```bash
# Adaptive submit to one directory
node index.js adaptive hotfrog

# Dry run (fill forms but don't submit)
node index.js adaptive hotfrog --dry-run

# Submit to all directories with evasion
node index.js adaptive --all
```

### Verify Citations

```bash
# Verify priority directories
node index.js verify

# Verify all directories
node index.js verify --all
```

### Check Status

```bash
# Show submission status
node index.js status

# Generate verification report
node index.js report
```

## Directory Support

| Directory | Difficulty | Automatable | Notes |
|-----------|------------|-------------|-------|
| Bing Places | Medium | Yes | Phone verification required |
| Foursquare | Easy | Yes | API available |
| Yellow Pages | Medium | Yes | Email verification |
| Hotfrog | Easy | Yes | No verification |
| Manta | Medium | Yes | Email verification |
| Brownbook | Easy | Yes | No verification |
| Cylex | Easy | Yes | No verification |
| EZLocal | Easy | Yes | No verification |

## Output Files

- `./screenshots/` - Screenshots of each submission step
- `./logs/attempts.json` - Log of all submission attempts
- `./results/status.json` - Current status of each directory
- `./results/verification.json` - Citation verification results

## Business Data

Business information is loaded from:
`../01-WEBSITE/data/business-info.json`

This file contains all business details (name, address, phone, etc.) used for submissions.

## Troubleshooting

### CAPTCHA Detected

If CAPTCHA is detected:
1. Screenshots will be saved showing the CAPTCHA
2. You can manually solve it with `--keep-open` flag
3. Try again later when the site may be less suspicious

### Rate Limited

If rate limited:
1. The system automatically backs off
2. Wait 5-10 minutes before retrying
3. Use `--dry-run` to test without submitting

### Form Not Filling

If form fields aren't being detected:
1. Check screenshots to see what the page looks like
2. The system tries multiple strategies automatically
3. You may need to add custom selectors to `config.js`

## Architecture

```
citation-agent/
├── index.js              # CLI entry point
├── config.js             # Directory configurations and settings
├── browser-utils.js      # Basic browser utilities
├── evasion-engine.js     # Advanced anti-detection system
├── submitter.js          # Standard submission logic
├── adaptive-submitter.js # Advanced adaptive submission
├── verifier.js           # Citation verification
├── package.json          # Dependencies
└── README.md             # This file
```

## Legal Notice

This tool is intended for legitimate business listing management. Ensure you have authorization to submit business information to directories. Some directories may have terms of service that prohibit automated submissions.
