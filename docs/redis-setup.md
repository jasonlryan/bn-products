# Redis Setup Guide

## Overview

This application uses Redis (via Vercel KV) as the primary source of truth for all data storage. In production, Redis is automatically configured by Vercel. For local development, you have several options:

## Production (Vercel)

In production on Vercel, Redis is automatically configured and the following environment variables are provided:
- `KV_REST_API_URL` - Automatically set by Vercel
- `KV_REST_API_TOKEN` - Automatically set by Vercel

## Local Development Options

### Option 1: Use localStorage only (Default)

If you don't configure Redis locally, the application will automatically fall back to using localStorage only. This is the simplest setup for development.

**Pros:**
- No additional setup required
- Works immediately
- Good for basic development and testing

**Cons:**
- Data is not persistent between browser sessions
- No cross-device synchronization
- Limited storage capacity

### Option 2: Use Vercel KV locally

To use the same Redis instance as production locally, you need to set up environment variables.

1. Create a `.env.local` file in the root directory:
```bash
# OpenAI API Key (required for AI compilation)
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Vercel KV (Redis) Configuration
KV_REST_API_URL=your_vercel_kv_rest_api_url_here
KV_REST_API_TOKEN=your_vercel_kv_rest_api_token_here

# Feature Flags
VITE_REDIS_ENABLED=true
```

2. Get your Vercel KV credentials:
   - Go to your Vercel dashboard
   - Navigate to your project
   - Go to Storage > KV
   - Copy the REST API URL and REST API Token

3. Restart your development server:
```bash
npm run dev
```

**Pros:**
- Same data as production
- Persistent storage
- Cross-device synchronization
- Full feature parity with production

**Cons:**
- Requires additional setup
- Uses production Redis instance (be careful with data)

### Option 3: Use local Redis instance

For advanced development, you can run a local Redis instance.

1. Install Redis locally (using Homebrew on macOS):
```bash
brew install redis
```

2. Start Redis:
```bash
redis-server
```

3. Update the Redis storage service to use local Redis instead of Vercel KV (requires code changes).

## Storage Strategy

The application uses a dual-storage strategy:

1. **Redis First**: All data is written to Redis first (when available)
2. **localStorage Sync**: Data is also synced to localStorage for offline access
3. **Fallback**: If Redis is unavailable, localStorage is used as fallback

## Key Storage Patterns

- **Compiled Content**: `bn:compiled:{productId}:{contentType}`
- **Functional Specs**: `bn:content:{productId}:functional-spec`
- **Compilation Queue**: `bn:compilation:queue`
- **Compilation History**: `bn:compilation:history`
- **Feedback**: `bn:feedback:{feedbackId}`
- **Counters**: `bn:count:{contentType}:{productId}`

## Troubleshooting

### "Missing required environment variables KV_REST_API_URL and KV_REST_API_TOKEN"

This error occurs when the application tries to use Redis but the environment variables are not set. The application will automatically fall back to localStorage, but you'll see these errors in the console.

**Solution**: Either set up the environment variables (Option 2 above) or ignore the errors (they won't affect functionality).

### Redis connection errors

If you see Redis connection errors, the application will automatically fall back to localStorage. This is expected behavior when Redis is not available.

### Data not persisting

If data is not persisting between sessions, make sure:
1. Redis is properly configured (if using Option 2)
2. localStorage is not being cleared by the browser
3. The storage service is working correctly

## Development Workflow

1. **Start with localStorage**: Begin development with localStorage only for simplicity
2. **Add Redis when needed**: Set up Redis when you need persistent data or want to test production-like behavior
3. **Test both scenarios**: Ensure your code works with both Redis and localStorage-only configurations 