# DEPLOYMENT VERIFICATION GUIDE

## CRITICAL: Production Deployment Rules

### 1. NEVER claim deployment is complete until VERIFIED

### 2. The deploy.sh script now includes automatic verification
   - Waits 60 seconds
   - Checks live version
   - Reports success or failure

### 3. Manual Verification Steps (if needed)

```bash
# Step 1: Check version.json is valid and accessible
curl -s https://www.chrisdavidsalon.com/data/version.json | python3 -m json.tool | head -5

# Step 2: Verify version number matches
curl -s https://www.chrisdavidsalon.com/data/version.json | grep '"version"'

# Step 3: Check site is not showing "Loading..." in footer
# Visit https://www.chrisdavidsalon.com and check footer

# Step 4: Verify admin pages show correct version
curl -s https://www.chrisdavidsalon.com/admin/index.html | grep "Admin v"
```

## Common Issues and Solutions

### Issue: GitHub Actions shows "failed" but deployment works
**Cause**: Old webhook or misconfigured GitHub Action
**Solution**: Ignore GitHub notifications, trust actual verification

### Issue: version.json has JSON syntax error
**Symptom**: Site shows "Loading..." or "2.6.0" instead of real version
**Solution**: Fix JSON syntax (usually trailing comma), redeploy

### Issue: Deploy script says complete but version is wrong
**Cause**: Vercel deployment delayed or failed
**Solution**: Wait additional 30 seconds, check Vercel dashboard

## Domain Configuration (CORRECT SETUP)

✅ **Current Setup is CORRECT**:
- chrisdavidsalon.com → redirects to → www.chrisdavidsalon.com
- This is industry standard and recommended
- DO NOT CHANGE THIS

## Deployment Checklist

Before saying "deployed":
- [ ] deploy.sh shows "✅ VERIFIED: Version X.X.X is LIVE"
- [ ] curl confirms correct version number
- [ ] No JSON syntax errors
- [ ] Site footer shows correct version (not "Loading...")
- [ ] Admin pages accessible

## False Alarm Prevention

1. **ALWAYS wait for verification** - deploy.sh now does this automatically
2. **Check actual live site** - not just GitHub push status
3. **Verify JSON is valid** - syntax errors break version display
4. **Trust verification over notifications** - GitHub Actions can give false failures

## Production Safety Rules

1. **No assumptions** - Always verify with actual checks
2. **No premature success claims** - Wait for verification
3. **Clear communication** - Report actual status, not expected status
4. **Document issues** - Update this guide when new issues found

---

**Last Updated**: August 11, 2025
**Current Live Version**: 2.5.16
**Deployment Method**: ./deploy.sh with automatic verification