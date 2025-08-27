# Vercel Production Cache Issue Resolution

## Problem
Vercel production shows old product names on the index page despite all configuration files being updated. Individual product pages show correct names.

## Root Cause
The Dashboard component loads product data from `productService.getAllProducts()` which:
1. First tries to load from Redis cache
2. Falls back to static configuration if Redis fails

The Redis cache in production contains old product data from before the name changes, so the Dashboard shows cached old names instead of the updated static configuration.

## Solution Options

### Option 1: Clear Redis Cache (Recommended)
Clear the Redis product cache to force fallback to updated static config:

```bash
# Use the API to clear product-related keys
curl -X POST https://YOUR-VERCEL-URL.vercel.app/api/storage \
  -H "Content-Type: application/json" \
  -d '{"action": "deletePattern", "pattern": "bn:product*"}'

curl -X POST https://YOUR-VERCEL-URL.vercel.app/api/storage \
  -H "Content-Type: application/json" \
  -d '{"action": "deletePattern", "pattern": "bn:products:list"}'

curl -X POST https://YOUR-VERCEL-URL.vercel.app/api/storage \
  -H "Content-Type: application/json" \
  -d '{"action": "deletePattern", "pattern": "bn:services:list"}'
```

### Option 2: Force Vercel Rebuild
1. Go to Vercel dashboard
2. Go to your project
3. Click on "Deployments"
4. Click "Redeploy" on the latest deployment
5. Check "Use existing Build Cache" is **unchecked**
6. Click "Redeploy"

### Option 3: Trigger Production Resync
If you have a sync mechanism, trigger it to update Redis with latest config.

## Verification
After implementing the fix:
1. Visit your Vercel production URL
2. Check that the index/dashboard page shows:
   - "AI Insight Sprint" (not "AI-Powered Research and Insight Sprint")
   - "AI Sherpa" (not "AI Consultancy Retainer") 
   - "AI Acceleration Day" (not "AI Innovation Day")
   - "AI Market Intelligence Dashboard" (not "Social Intelligence Dashboard")

## Technical Details
- **Dashboard Data Flow**: Dashboard → productService.getAllProducts() → Redis (cached) → Static Config (fallback)
- **Individual Product Pages**: Load directly from static files, so they work correctly
- **Files Updated**: All product names updated in config files, but Redis cache not cleared
- **Environment**: Production Redis contains stale data, development works because it reads fresh config

## Prevention
Consider implementing a version-based cache invalidation or automatic cache clearing when configuration changes are deployed.