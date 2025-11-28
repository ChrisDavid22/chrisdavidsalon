# Chris David Salon - Directory Submission Action Plan

**Business:** Chris David Salon
**Address:** 1878C Dr Andres Way, Delray Beach, FL 33445
**Phone:** (561) 299-0950
**Website:** https://www.chrisdavidsalon.com
**Primary Email:** chrisdavidhair@gmail.com

---

## THE BOTTOM LINE: TWO OPTIONS

### Option A: BrightLocal ($150 one-time) - RECOMMENDED
Pay BrightLocal ~$150 and they submit to 75+ directories FOR YOU. Done. Skip the rest of this document.

**URL:** https://www.brightlocal.com/
**What you need:** Credit card, business info
**Time:** 15 minutes to set up, then they handle everything

### Option B: Manual Submissions (Free but time-consuming)
Do each directory yourself. Takes 5-10 hours total.

---

## WHY BOTHER WITH MANUAL IF BRIGHTLOCAL EXISTS?

Good question. Here's when manual matters:

| Directory | BrightLocal Covers? | Why Manual Might Be Better |
|-----------|---------------------|---------------------------|
| Google Business Profile | NO | You already have this - it's the most important |
| Bing Places | YES | BrightLocal handles it |
| Apple Maps | PARTIAL | Apple Business Connect gives you MORE control |
| Foursquare | YES | You already did this ($20) |
| Yelp | YES (basic) | Claiming yourself = respond to reviews |
| Facebook | NO | You need to own this for social |

**The 6 directories worth doing manually** are ones where you want OWNERSHIP and CONTROL - ability to respond to reviews, post updates, run ads. BrightLocal creates listings but you don't "own" them the same way.

---

## TOP 10 DIRECTORIES BY IMPACT

Ranked by SEO value and customer reach:

| Rank | Directory | Status | Impact | BrightLocal? |
|------|-----------|--------|--------|--------------|
| 1 | Google Business Profile | DONE | Critical | No (do manually) |
| 2 | Apple Business Connect | NOT DONE | Very High | Partial |
| 3 | Bing Places | NOT DONE | High | Yes |
| 4 | Yelp | DONE | High | Yes (basic) |
| 5 | Foursquare | DONE ($20 paid) | High | Yes |
| 6 | Facebook Business | DONE | High | No |
| 7 | Nextdoor | DONE | Medium-High | No |
| 8 | Yellow Pages | NOT DONE | Medium | Yes |
| 9 | Manta | NOT DONE | Medium | Yes |
| 10 | MapQuest | NOT DONE | Medium | Yes |

---

## TO-DO LIST

### Already Completed
- [x] Google Business Profile (verified, 4.9 stars, 140+ reviews)
- [x] Yelp (22 reviews)
- [x] Foursquare (paid $20)
- [x] Nextdoor (5 stars)
- [x] Facebook Business Page
- [x] Instagram Business
- [x] Waze
- [x] ClassPass

### Priority 1: Do These Manually (Worth the control)
- [ ] **Apple Business Connect** - Powers Siri, Apple Maps, 1B+ users
- [ ] **Claim Yelp listing** - If not already claimed, claim for review responses

### Priority 2: Let BrightLocal Handle OR Do Manually
- [ ] Bing Places
- [ ] Yellow Pages
- [ ] Manta
- [ ] MapQuest
- [ ] SuperPages
- [ ] Hotfrog
- [ ] + 70 more directories

### Priority 3: Paid Memberships (Evaluate ROI)
- [ ] Better Business Bureau ($400-1000/year)
- [ ] Delray Beach Chamber of Commerce ($300-500/year)

---

## AUTOMATION REQUIREMENTS BY DIRECTORY

What I need to automate each one:

### Apple Business Connect
| Requirement | Details |
|-------------|---------|
| Auth Type | Apple ID (OAuth) |
| 2FA | YES - Device push notification or SMS |
| Email Access | Apple ID email for verification |
| Phone | Business phone for verification call |
| Credit Card | No |
| **Can Automate?** | NO - Apple 2FA requires device interaction |
| **Workaround** | You do initial login, I save session cookies |

### Bing Places
| Requirement | Details |
|-------------|---------|
| Auth Type | Microsoft Account (OAuth) |
| 2FA | YES - Authenticator app, SMS, or biometric |
| Email Access | Microsoft account email |
| Phone | Business phone for PIN verification |
| Credit Card | No |
| **Can Automate?** | PARTIAL - Can automate after initial auth |
| **Workaround** | "Import from Google" option if logged in |

### Yelp (Claim)
| Requirement | Details |
|-------------|---------|
| Auth Type | Email/Password or Social |
| 2FA | Optional |
| Email Access | YES - For verification |
| Phone | Business phone for verification call |
| Credit Card | No (free claim) |
| **Can Automate?** | PARTIAL - Email verification needed |
| **Workaround** | Gmail API access for auto-verification |

### Yellow Pages
| Requirement | Details |
|-------------|---------|
| Auth Type | Email/Password |
| 2FA | No |
| Email Access | YES - For verification |
| Phone | No |
| Credit Card | No (free listing) |
| **Can Automate?** | YES - Simple email verification |
| **What I Need** | Gmail API access or email forwarding |

### Manta
| Requirement | Details |
|-------------|---------|
| Auth Type | Email/Password |
| 2FA | No |
| Email Access | YES - For verification |
| Phone | Business phone for verification |
| Credit Card | No |
| **Can Automate?** | PARTIAL |
| **What I Need** | Gmail API access |

### MapQuest
| Requirement | Details |
|-------------|---------|
| Auth Type | Email/Password |
| 2FA | No |
| Email Access | YES - For verification |
| Phone | No |
| Credit Card | No |
| **Can Automate?** | YES |
| **What I Need** | Gmail API access |

### BrightLocal (Aggregator)
| Requirement | Details |
|-------------|---------|
| Auth Type | Email/Password |
| 2FA | No |
| Email Access | For account only |
| Phone | No |
| Credit Card | YES - $150 payment |
| **Can Automate?** | N/A - They do the work for you |
| **What I Need** | Just pay them |

---

## AUTOMATION SUMMARY

### What's Blocking Full Automation:

| Blocker | Directories Affected | Solution |
|---------|---------------------|----------|
| OAuth 2FA (device push) | Apple, Microsoft/Bing | Manual first login, save session |
| Email verification | YP, Manta, MapQuest, most others | Gmail API access |
| Phone verification | Apple, Bing, Yelp, Manta | Manual or Twilio forwarding |
| CAPTCHA | Various | Anti-captcha services ($) |
| Biometric prompts | Microsoft | Cannot bypass |

### To Build True Automation, I Would Need:

1. **Gmail API Access** - Read verification emails automatically
   - Grant OAuth access to chrisdavidhair@gmail.com
   - Or: Set up email forwarding to a webhook

2. **Phone Number Access** - Receive verification calls/SMS
   - Option A: Twilio number that forwards to business
   - Option B: You answer verification calls when prompted

3. **Session Persistence** - Stay logged in
   - Browser profile with saved cookies
   - Re-authenticate monthly

4. **Credit Card** (for paid services only)
   - BrightLocal, BBB, Chamber

---

## THE HONEST ANSWER

**Why isn't BrightLocal enough?**

It IS enough for 90% of directories. The only reasons to do manual:

1. **Apple Business Connect** - BrightLocal can't give you full Apple Maps control. Apple requires Apple ID ownership.

2. **Review platforms (Yelp, Google)** - You want to RESPOND to reviews. BrightLocal creates listings but doesn't give you login credentials.

3. **Social platforms (Facebook, Instagram)** - These aren't "directories" - they're your owned channels.

**My recommendation:**

1. Do Apple Business Connect manually (15 min)
2. Verify you've claimed Yelp (5 min)
3. Pay BrightLocal $150 for everything else
4. Done. Total time: 30 minutes + $150

---

## QUICK REFERENCE: WHAT TO COPY/PASTE

```
Business Name: Chris David Salon
Address: 1878C Dr Andres Way
City: Delray Beach
State: FL
ZIP: 33445
Phone: (561) 299-0950
Website: https://www.chrisdavidsalon.com
Email: chrisdavidsalon@gmail.com

Category: Hair Salon
Other: Beauty Salon, Hair Colorist, Balayage Specialist

Hours:
Sunday: Closed
Monday: Closed
Tuesday: 11:00 AM - 6:00 PM
Wednesday: 11:00 AM - 6:00 PM
Thursday: 11:00 AM - 6:00 PM
Friday: 11:00 AM - 6:00 PM
Saturday: 11:00 AM - 6:00 PM

Short Description:
Chris David Salon is a premier hair color studio in Delray Beach's Andre Design District. Specializing in balayage, color correction, and hair extensions with 20+ years expertise. Certified Davines salon. Rated 4.9 stars. Veteran-owned.
```

---

## NEXT STEPS

1. [ ] **Decision:** BrightLocal ($150) or manual?
2. [ ] **If BrightLocal:** Go to brightlocal.com, sign up, submit business
3. [ ] **Either way:** Do Apple Business Connect manually (https://businessconnect.apple.com)
4. [ ] **Verify:** Yelp listing is claimed (can respond to reviews)
5. [ ] **Optional:** BBB and Chamber if budget allows

---

*Document created: 2025-11-28*
