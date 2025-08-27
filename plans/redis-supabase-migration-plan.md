# Redis + Supabase Migration Plan

**Created:** 2025-08-15  
**Status:** Proposed  
**Effort:** 2-3 days

## Overview

Migrate from CSV file to Supabase as source of truth, with Redis caching for performance.

## Database Schema

```sql
-- Core products table (replaces CSV)
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20),
  price TEXT,
  primary_deliverables TEXT,
  description TEXT,
  perfect_for TEXT,
  what_client_buys TEXT,
  ideal_client TEXT,
  key_features JSONB,
  benefits JSONB,
  next_product TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated content
CREATE TABLE product_content (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(product_id),
  content_type VARCHAR(50),
  content TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compiled content
CREATE TABLE compiled_content (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(product_id),
  compilation_type VARCHAR(20),
  content JSONB,
  raw_markdown TEXT,
  source_fingerprint VARCHAR(64),
  compiled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, compilation_type)
);
```

## Implementation Steps

### Phase 1: Setup (Day 1)
1. Create Supabase project
2. Run schema migrations
3. Install Supabase client: `npm install @supabase/supabase-js`
4. Add Supabase credentials to `.env`

### Phase 2: Data Migration (Day 1)
1. Script to migrate CSV → Supabase
2. Script to migrate existing compilations → Supabase
3. Update storage service to read from Supabase

### Phase 3: UI Integration (Day 2)
1. Add product creation form to admin panel
2. Update compilation services to use Supabase
3. Implement Redis caching layer
4. Add real-time subscriptions

### Phase 4: Testing & Rollout (Day 3)
1. Test all CRUD operations
2. Verify compilation flow
3. Performance testing
4. Deploy to production

## Key Benefits
- No more CSV sync issues
- Automatic backups
- Real-time updates
- Rich querying capabilities
- Audit trail built-in

## Risk Mitigation
- Keep Redis for hot data (performance)
- Daily Supabase backups
- Gradual rollout with feature flags