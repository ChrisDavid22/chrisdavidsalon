# AI PROMPTS DOCUMENTATION
*All intelligent prompts used across the Chris David Salon admin system*

## Overview
This document contains all AI prompts used in the admin dashboard. Each prompt is designed to provide actionable business intelligence without requiring SEO knowledge.

## 1. SEO Command Center (index.html)

### Main Analysis Prompt
```
You are analyzing ChrisDavidSalon.com, a luxury hair salon in Delray Beach, Florida specializing in balayage and color correction.

Provide a comprehensive SEO health assessment:

1. MARKET POSITION (0-100 score)
   - Where do we rank among 47 Delray Beach salons?
   - What percentile are we in for visibility?
   - How many keywords do we own vs competitors?

2. REVENUE IMPACT ANALYSIS
   - Estimate monthly searches we're capturing vs missing
   - Calculate potential new clients from better rankings
   - Project revenue impact of reaching top 3 positions

3. COMPETITIVE GAPS
   - What do top 3 competitors (Rové, Bond Street, Salon Trace) have that we don't?
   - Specific technical fixes needed (with effort estimates)
   - Content gaps that cost us rankings

4. 7-DAY ACTION PLAN
   - 3 things to fix TODAY (quick wins)
   - 3 things to complete this WEEK
   - Expected position improvement from each action

5. CLEAR BUSINESS METRICS
   - Current organic visitors per month
   - Conversion rate from organic traffic
   - Average client value from organic leads

Format as actionable intelligence a salon owner can understand without SEO knowledge.
Return as structured JSON with specific numbers, not ranges.
```

## 2. Competitor Intelligence (competitors.html)

### Competitor Discovery Prompt
```
Analyze the Delray Beach hair salon market for ChrisDavidSalon.com:

1. REAL COMPETITOR DISCOVERY
   Find the ACTUAL top 10 salons ranking for these searches:
   - "hair salon delray beach"
   - "balayage delray beach"  
   - "colorist delray beach"
   - "hair extensions delray beach"
   
   Known competitors include: Rové Hair Salon, Bond Street Salon, Salon Trace, One Aveda, Tyler Presley Salon, Studio 34, Imbue Salon, The Salon Delray, ShearLuck Salon, Christopher's Too.
   
   For each competitor provide:
   - Business name and verified website
   - Their Google reviews count and rating
   - Their SEO score (0-100) based on:
     * Content depth (pages indexed)
     * Local SEO optimization
     * Technical implementation
     * Keyword targeting
   - Their #1 competitive advantage
   - How to beat them specifically

2. MARKET SHARE ANALYSIS
   - What % of searches does each salon capture?
   - Where does Chris David rank for each keyword?
   - What would it take to reach #1 for each?

3. WINNING STRATEGY
   - 3 competitors we can overtake in 30 days
   - Exact steps to beat each one
   - Expected timeline and effort required

Provide real, verifiable data. No made-up businesses.
Return as actionable JSON with specific tactics.
```

### Competitor Comparison Prompt
```
Compare ChrisDavidSalon.com directly with {competitorName} ({competitorUrl}):

1. HEAD-TO-HEAD METRICS
   - SEO scores (0-100) for both
   - Number of ranking keywords each
   - Google reviews and ratings
   - Content depth (indexed pages)
   - Technical SEO implementation

2. COMPETITIVE ADVANTAGES
   What {competitorName} does better:
   - Specific SEO tactics they use
   - Content they have that we don't
   - Keywords they own that we want

   What Chris David does better:
   - Our unique advantages (Davines exclusive, free parking, 20+ years)
   - Keywords we own that they don't
   - Opportunities they're missing

3. BATTLE PLAN
   Step-by-step plan to overtake them:
   - Week 1 actions
   - Month 1 targets
   - Expected position changes
   - Investment required (time/money)

4. QUICK WINS
   3 things we can do THIS WEEK to close the gap

Be specific with actionable tactics, not generic advice.
```

## 3. Keyword Rankings (rankings.html)

### Top 30 Keywords Prompt
```
Analyze keyword opportunities for ChrisDavidSalon.com in Delray Beach:

1. TOP 30 KEYWORDS BY VALUE
   Sort by: (Monthly searches × Buyer intent × Our ability to rank)
   
   For each keyword provide:
   - Exact monthly search volume in Delray Beach area
   - Current ranking position for chrisdavidsalon.com
   - Who ranks #1, #2, #3 currently
   - Competition level (based on REAL analysis)
   - Effort to reach #1 (hours of work needed)
   - Revenue potential (searches × 2% conversion × $200 avg ticket)

2. QUICK WIN OPPORTUNITIES
   Keywords where we can rank #1 within 30 days:
   - Current position #4-10
   - Low competition (<30 referring domains to #1)
   - High commercial intent
   - Specific action needed to win

3. STRATEGIC TARGETS
   High-value keywords worth long-term investment:
   - "hair salon delray beach" (1900 searches/month)
   - "balayage delray beach" (650 searches/month)
   - "best colorist delray beach" (400 searches/month)
   - Why they matter for revenue
   - Current gaps preventing ranking
   - Step-by-step domination plan

4. KEYWORDS WE OWN
   Terms where Chris David already ranks #1-3:
   - "davines salon delray beach"
   - "dry cutting specialist florida"
   - How to protect these positions
   - How to maximize traffic from them

Format as sortable table with specific next steps for each keyword.
Include ONLY keywords people actually search for in Delray Beach.
```

### Ranking Check Prompt
```
For the keyword "{keyword}" in Delray Beach, Florida:

1. CURRENT RANKINGS
   - Who ranks #1, #2, #3 (with their actual URLs)
   - Where does ChrisDavidSalon.com currently rank?
   - Has our position changed in the last 30 days?

2. RANKING FACTORS
   What makes the #1 site rank there:
   - Content depth on this topic
   - Keywords in title/headings
   - Number of internal links
   - Page load speed
   - Mobile optimization
   - Local SEO signals

3. GAP ANALYSIS
   What Chris David needs to rank #1:
   - Content improvements needed
   - Technical fixes required
   - Links/citations needed
   - Estimated time to implement

4. BUSINESS IMPACT
   - Monthly searches for this keyword
   - Potential new clients from ranking #1
   - Revenue impact (searches × conversion × avg ticket)
   - Is this keyword worth pursuing?

5. ACTION PLAN
   Prioritized steps to take #1 position:
   - Today: [specific action]
   - This week: [specific actions]
   - This month: [specific actions]

Be specific and actionable. No generic SEO advice.
```

## 4. Performance Dashboard (performance.html)

### Performance Analysis Prompt
```
Analyze website performance impact on business for ChrisDavidSalon.com:

1. SPEED VS COMPETITORS
   Compare against Rové, Bond Street, Salon Trace:
   - Desktop load time comparison
   - Mobile load time (68% of our traffic)
   - Core Web Vitals scores
   - How speed affects our rankings vs theirs
   - Revenue lost from being slower

2. USER EXPERIENCE METRICS
   Real visitor behavior:
   - Bounce rate vs industry average (45%)
   - Average session duration
   - Pages per session
   - Mobile vs desktop engagement
   - Booking button click rate

3. TECHNICAL HEALTH
   Issues blocking growth:
   - Critical errors affecting rankings
   - Mobile usability problems
   - Images not optimized (specifics)
   - JavaScript blocking renders
   - Missing meta descriptions (which pages)

4. BUSINESS IMPACT CALCULATOR
   - Visitors lost due to slow loading: X per month
   - Rankings lost due to poor Core Web Vitals: Y positions
   - Revenue impact: $Z per month
   - ROI of fixing each issue

5. PRIORITY FIX LIST
   Ranked by revenue impact:
   - Issue: [specific problem]
   - Current cost: $X/month in lost revenue
   - Time to fix: Y hours
   - Expected improvement: Z% more conversions

Translate all technical metrics into business outcomes.
Show clear cause-and-effect between performance and revenue.
```

## 5. Microsite Strategy (microsites.html)

### Microsite Analysis Prompt
```
Analyze microsite strategy for ChrisDavidSalon.com:

Current microsites:
- delraybeachbalayage.com (targets: "balayage delray beach")
- delraycolorspecialist.com (targets: "colorist delray beach")
- atlanticavesalon.com (targets: "atlantic avenue hair salon")

1. CURRENT PERFORMANCE
   For each microsite:
   - Target keyword and monthly search volume
   - Current ranking position (where it actually ranks)
   - Monthly visitors generated
   - Leads/bookings attributed (estimated)
   - ROI: (monthly cost $30) vs (revenue generated)

2. OPTIMIZATION OPPORTUNITIES
   What each site needs to rank #1:
   - Content gaps (specific pages/word count needed)
   - Technical fixes (speed, mobile, schema)
   - Link building (how many, what type)
   - Local SEO optimization needed
   - Estimated hours to implement

3. NEW MICROSITE OPPORTUNITIES
   Top 5 keywords worth new microsites:
   - Keyword + monthly searches
   - Competition analysis (easy/medium/hard)
   - Suggested domain name
   - Content strategy (5 pages needed)
   - Expected time to rank #1
   - Revenue potential per month

4. STRATEGIC RECOMMENDATIONS
   - Which microsites to double-down on
   - Which might not be worth maintaining
   - Optimal budget allocation
   - Expected returns from $500 investment

Focus on ROI and revenue, not vanity metrics.
Provide specific action items, not theory.
```

## 6. Quick Analysis Prompts

### Quick SEO Audit
```
Quick 60-second SEO audit for ChrisDavidSalon.com:
- Overall health score (0-100)
- Top 3 urgent issues to fix
- Top 3 opportunities to capture
- Biggest competitive threat
- One thing to do TODAY for immediate impact
```

### Competitor Quick Check
```
Quick competitor check for {competitorUrl}:
- Their SEO score (0-100)
- Keywords they rank #1 for
- Their biggest weakness we can exploit
- One tactic to beat them this week
```

### Keyword Quick Check
```
Quick analysis for keyword "{keyword}":
- Monthly searches in Delray Beach
- Our current ranking
- Who ranks #1
- What it takes to beat them
- Worth pursuing? (Yes/No and why)
```

## Usage Notes

1. **All prompts should return JSON** for easy parsing and display
2. **Focus on business metrics**, not technical jargon
3. **Provide specific actions**, not generic advice
4. **Include real competitor names**: Rové, Bond Street, Salon Trace, etc.
5. **Reference actual search volumes** for Delray Beach market
6. **Calculate revenue impact** using: Searches × 2% conversion × $200 average ticket
7. **Time estimates** should be in hours/days, not vague terms
8. **Rankings** should show actual position numbers, not "high" or "low"

## Integration Points

- All prompts integrated in `ai-config.js`
- Results displayed in respective HTML pages
- Data cached for 24 hours to minimize API calls
- Fallback data provided if API fails
- Cross-referenced with `SEO-TODO-LIST.md` for action items