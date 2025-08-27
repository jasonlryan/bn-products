#!/bin/bash

# Clear Vercel Redis Cache Script
# This script clears the Redis product cache in production to force fresh data loading

# Update this to your actual Vercel URL
VERCEL_URL="https://bn-products.vercel.app"

echo "🗑️  Clearing Vercel Redis product cache..."
echo "Using URL: $VERCEL_URL"
echo

# Function to make API call and check response
clear_cache_pattern() {
    local pattern=$1
    local description=$2
    
    echo "🔄 Clearing $description..."
    response=$(curl -s -X POST "$VERCEL_URL/api/storage" \
        -H "Content-Type: application/json" \
        -d "{\"action\": \"deletePattern\", \"pattern\": \"$pattern\"}")
    
    if echo "$response" | grep -q '"ok":true'; then
        count=$(echo "$response" | grep -o '"count":[0-9]*' | cut -d: -f2)
        echo "✅ Cleared $description - deleted $count keys"
    else
        echo "❌ Failed to clear $description"
        echo "Response: $response"
    fi
    echo
}

# Clear different product cache patterns
clear_cache_pattern "bn:product*" "individual product data"
clear_cache_pattern "bn:products:list" "products list cache"  
clear_cache_pattern "bn:services:list" "services list cache"

echo "🎉 Redis cache clearing complete!"
echo
echo "Next steps:"
echo "1. Visit $VERCEL_URL to verify updated product names"
echo "2. Check that the dashboard shows the new product names:"
echo "   - AI Insight Sprint (not AI-Powered Research...)"
echo "   - AI Sherpa (not AI Consultancy Retainer)"
echo "   - AI Acceleration Day (not AI Innovation Day)"
echo "   - AI Market Intelligence Dashboard (not Social Intelligence Dashboard)"
echo
echo "If the issue persists, try Option 2 from VERCEL_CACHE_FIX.md (force rebuild)"