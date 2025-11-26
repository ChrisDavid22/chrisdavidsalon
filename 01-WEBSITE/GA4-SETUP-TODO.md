# GA4 Setup Instructions for Chris

## What We Need From You

Two pieces of information to unlock all the analytics data:

---

## Step 1: Get the GA4 Property ID

1. Go to https://analytics.google.com
2. Sign in with your Google account
3. Click **Admin** (gear icon at bottom left)
4. Under "Property" column, click **Property Settings**
5. Copy the **Property ID** - it's a number like `123456789`

**Send us this number.**

---

## Step 2: Create a Service Account (or have Chris do this)

### Option A: If Chris has access to Google Cloud Console

1. Go to https://console.cloud.google.com
2. Select the project connected to your GA4 (or create one)
3. Go to **IAM & Admin** → **Service Accounts**
4. Click **Create Service Account**
5. Name it: `chrisdavid-seo-agent`
6. Click **Create and Continue**
7. Skip the roles step, click **Done**
8. Click on the new service account
9. Go to **Keys** tab
10. Click **Add Key** → **Create new key** → **JSON**
11. A file downloads - **send us this entire file**

### Option B: If Chris needs help

Tell Chris:
> "I need you to create a service account in Google Cloud Console and download the JSON key file. Then add the service account email as a Viewer in GA4."

---

## Step 3: Add Service Account to GA4

1. Go to https://analytics.google.com
2. Click **Admin** (gear icon)
3. Under "Property", click **Property Access Management**
4. Click the **+** button → **Add users**
5. Paste the service account email (looks like `name@project.iam.gserviceaccount.com`)
6. Set role to **Viewer**
7. Click **Add**

---

## What Happens After

Once we have:
- [ ] GA4 Property ID (the number)
- [ ] Service Account JSON file

We add them to Vercel as environment variables:
- `GA4_PROPERTY_ID` = the number
- `GOOGLE_SERVICE_ACCOUNT_JSON` = the file contents

Then **immediately** all dashboards will show real data:
- Traffic over time charts
- Week-over-week comparisons
- Microsite referral tracking
- Device breakdown
- Top landing pages
- Automated weekly reports

---

## Quick Reference

| What | Where to Get It |
|------|-----------------|
| Property ID | analytics.google.com → Admin → Property Settings |
| Service Account | console.cloud.google.com → IAM → Service Accounts |
| JSON Key | Service Account → Keys → Add Key → JSON |

---

## Questions?

If Chris gets stuck, have him call and we can screen share.

The entire SEO analysis engine is built and waiting. We just need these credentials to unlock the data.
