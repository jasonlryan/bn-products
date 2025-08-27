# Redis + Supabase Migration - Detailed Implementation Specification

**Created:** 2025-08-15  
**Status:** Proposed  
**Effort:** 3-4 days
**Priority:** High - Solves CSV sync issues permanently

## Executive Summary

Migrate from file-based CSV storage to Supabase as the primary data store with Redis caching. This eliminates CSV synchronization issues, enables UI-based product creation, and provides enterprise-grade data management.

## Current Architecture Problems

1. **CSV File Limitations**
   - No concurrent editing
   - No version control
   - Manual sync between CSV → Products → Config → Redis
   - Can't add products from UI without breaking pipeline

2. **Data Flow Issues**
   ```
   CSV (manual edit) → Python Scripts → JSON Config → Redis → Dashboard
                          ↓                ↓
                     Git conflicts    Sync delays
   ```

## Proposed Architecture

```
Supabase (Source of Truth) → Redis (Cache) → Dashboard
         ↑                                        ↓
    UI Form ← Real-time sync → WebSocket Updates
```

## Detailed Database Schema

```sql
-- 1. Products table (replaces CSV file)
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) UNIQUE NOT NULL, -- "01_ai_power_hour"
  row_number INT UNIQUE NOT NULL, -- Maintains CSV ordering
  
  -- Core fields from CSV
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) CHECK (type IN ('PRODUCT', 'SERVICE')),
  price TEXT, -- Keep as text for complex pricing like "£2,000 - £10,000"
  primary_deliverables TEXT,
  description TEXT,
  perfect_for TEXT,
  what_client_buys TEXT,
  ideal_client TEXT,
  key_features JSONB DEFAULT '[]', -- Array of strings
  benefits JSONB DEFAULT '[]', -- Array of strings
  next_product TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT, -- Email or user ID
  last_modified_by TEXT,
  
  -- Status tracking
  content_generation_status VARCHAR(20) DEFAULT 'pending',
  -- pending | generating | completed | failed
  content_generation_started_at TIMESTAMPTZ,
  content_generation_completed_at TIMESTAMPTZ,
  content_generation_error TEXT,
  
  -- Soft delete
  deleted_at TIMESTAMPTZ,
  deleted_by TEXT
);

-- 2. Generated content (14 stages per product)
CREATE TABLE product_content (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(product_id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL, -- "01_executive_positioning"
  content_number INT NOT NULL, -- 1-14
  
  -- Content
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  word_count INT,
  
  -- Generation metadata
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  model_used VARCHAR(50), -- "gpt-5-mini"
  prompt_version VARCHAR(20), -- For tracking prompt evolution
  generation_time_ms INT, -- Performance tracking
  
  -- Unique constraint
  UNIQUE(product_id, content_type)
);

-- 3. Compiled content (marketing, intelligence, strategy)
CREATE TABLE compiled_content (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(product_id) ON DELETE CASCADE,
  compilation_type VARCHAR(20) NOT NULL,
  -- 'marketing' | 'market-intel' | 'product-strategy'
  
  -- Compiled data
  content JSONB NOT NULL, -- Full compiled structure
  raw_markdown TEXT, -- Markdown version
  sections JSONB, -- List of sections for quick access
  
  -- Staleness tracking
  source_fingerprint VARCHAR(64) NOT NULL,
  schema_version VARCHAR(10) DEFAULT '1.0',
  
  -- Metadata
  compiled_at TIMESTAMPTZ DEFAULT NOW(),
  compiled_by TEXT,
  compilation_time_ms INT,
  
  -- Usage tracking
  compilation_count INT DEFAULT 1,
  last_accessed_at TIMESTAMPTZ,
  access_count INT DEFAULT 0,
  
  UNIQUE(product_id, compilation_type)
);

-- 4. Audit log for compliance
CREATE TABLE product_audit_log (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50),
  table_name VARCHAR(50),
  action VARCHAR(20), -- 'create' | 'update' | 'delete'
  old_data JSONB,
  new_data JSONB,
  changed_fields JSONB, -- Array of field names
  user_email TEXT,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Queue for async operations
CREATE TABLE generation_queue (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(product_id),
  operation_type VARCHAR(50), -- 'generate_content' | 'compile_marketing' etc
  priority INT DEFAULT 5,
  status VARCHAR(20) DEFAULT 'pending',
  -- 'pending' | 'processing' | 'completed' | 'failed'
  
  -- Job data
  payload JSONB,
  result JSONB,
  error TEXT,
  
  -- Timing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Retries
  attempt_count INT DEFAULT 0,
  max_attempts INT DEFAULT 3
);

-- Indexes for performance
CREATE INDEX idx_products_status ON products(content_generation_status);
CREATE INDEX idx_products_deleted ON products(deleted_at);
CREATE INDEX idx_content_product ON product_content(product_id);
CREATE INDEX idx_compiled_product_type ON compiled_content(product_id, compilation_type);
CREATE INDEX idx_compiled_fingerprint ON compiled_content(source_fingerprint);
CREATE INDEX idx_queue_status ON generation_queue(status, priority);
CREATE INDEX idx_audit_product_time ON product_audit_log(product_id, timestamp);

-- Row Level Security Policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE compiled_content ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (adjust based on auth strategy)
CREATE POLICY "Public read access" ON products
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Admin full access" ON products
  FOR ALL USING (
    current_setting('app.user_role', true) = 'admin'
  );
```

## Implementation Guide

### Phase 1: Supabase Setup & Migration Scripts

#### 1.1 Install Dependencies
```bash
npm install @supabase/supabase-js
npm install --save-dev @types/node dotenv
```

#### 1.2 Environment Configuration
```env
# Add to .env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # For admin operations
```

#### 1.3 Supabase Client Setup
```typescript
// src/services/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types' // Generated types

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Admin client for server-side operations
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

#### 1.4 CSV to Supabase Migration Script
```typescript
// scripts/migrate-csv-to-supabase.ts
import { parse } from 'csv-parse'
import { createReadStream } from 'fs'
import { supabaseAdmin } from '../src/services/supabase/client'

interface CSVRow {
  NAME: string
  Type: string
  PRICE: string
  'Primary Deliverables': string
  DESCRIPTION: string
  'PERFECT FOR:': string
  'WHAT THE CLIENT IS ACTUALLY BUYING': string
  'IDEAL CLIENT': string
  'KEY FEATURES': string
  'BENEFITS': string
  'WHAT IS THE NEXT PRODUCT OR SERVICE?': string
}

async function migrateCSVToSupabase() {
  console.log('🚀 Starting CSV to Supabase migration...')
  
  const csvPath = '../data/BN Products List - 2025.csv'
  const rows: CSVRow[] = []
  
  // 1. Read CSV
  const parser = createReadStream(csvPath).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      trim: true
    })
  )
  
  for await (const row of parser) {
    rows.push(row as CSVRow)
  }
  
  console.log(`📊 Found ${rows.length} products in CSV`)
  
  // 2. Transform and insert
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNumber = i + 1
    const productId = `${String(rowNumber).padStart(2, '0')}_${cleanFilename(row.NAME)}`
    
    const productData = {
      product_id: productId,
      row_number: rowNumber,
      name: row.NAME,
      type: row.Type as 'PRODUCT' | 'SERVICE',
      price: row.PRICE,
      primary_deliverables: row['Primary Deliverables'],
      description: row.DESCRIPTION,
      perfect_for: row['PERFECT FOR:'],
      what_client_buys: row['WHAT THE CLIENT IS ACTUALLY BUYING'],
      ideal_client: row['IDEAL CLIENT'],
      key_features: parseFeatures(row['KEY FEATURES']),
      benefits: parseFeatures(row.BENEFITS),
      next_product: row['WHAT IS THE NEXT PRODUCT OR SERVICE?'],
      content_generation_status: 'pending' as const,
      created_by: 'csv_migration',
      last_modified_by: 'csv_migration'
    }
    
    const { error } = await supabaseAdmin
      .from('products')
      .upsert(productData, {
        onConflict: 'product_id'
      })
    
    if (error) {
      console.error(`❌ Failed to insert ${productId}:`, error)
    } else {
      console.log(`✅ Migrated ${productId}`)
    }
  }
  
  console.log('✅ CSV migration complete!')
}

function cleanFilename(text: string): string {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .trim()
}

function parseFeatures(text: string): string[] {
  if (!text) return []
  return text.split('\n')
    .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
    .filter(Boolean)
}

// Run migration
migrateCSVToSupabase().catch(console.error)
```

### Phase 2: Storage Service Updates

#### 2.1 Product Service with Supabase
```typescript
// src/services/storage/supabaseProductService.ts
import { supabase } from '../supabase/client'
import type { Product, ProductDefinition } from '../../types/product'

export class SupabaseProductService {
  async getAllProducts(): Promise<ProductDefinition[]> {
    // Try cache first
    const cached = await redis.get('bn:products:all')
    if (cached) return JSON.parse(cached)
    
    // Fetch from Supabase
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .is('deleted_at', null)
      .order('row_number')
    
    if (error) throw error
    
    // Transform to ProductDefinition format
    const products = data.map(transformToProductDefinition)
    
    // Cache for 5 minutes
    await redis.set('bn:products:all', JSON.stringify(products), { ex: 300 })
    
    return products
  }
  
  async getProductById(productId: string): Promise<ProductDefinition | null> {
    // Check cache
    const cached = await redis.get(`bn:product:${productId}`)
    if (cached) return JSON.parse(cached)
    
    // Fetch from Supabase with content
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        product_content (*)
      `)
      .eq('product_id', productId)
      .single()
    
    if (error || !product) return null
    
    const definition = transformToProductDefinition(product)
    
    // Cache for 1 hour
    await redis.set(`bn:product:${productId}`, JSON.stringify(definition), { ex: 3600 })
    
    return definition
  }
  
  async createProduct(data: Partial<Product>): Promise<ProductDefinition> {
    // Get next row number
    const { data: maxRow } = await supabase
      .from('products')
      .select('row_number')
      .order('row_number', { ascending: false })
      .limit(1)
      .single()
    
    const nextRow = (maxRow?.row_number || 0) + 1
    const productId = `${String(nextRow).padStart(2, '0')}_${cleanFilename(data.name!)}`
    
    // Insert product
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        product_id: productId,
        row_number: nextRow,
        ...data,
        content_generation_status: 'pending',
        created_by: getCurrentUser(),
      })
      .select()
      .single()
    
    if (error) throw error
    
    // Queue content generation
    await this.queueContentGeneration(productId)
    
    // Invalidate cache
    await redis.del('bn:products:all')
    
    return transformToProductDefinition(product)
  }
  
  async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
        last_modified_by: getCurrentUser()
      })
      .eq('product_id', productId)
    
    if (error) throw error
    
    // Invalidate caches
    await redis.del(`bn:product:${productId}`)
    await redis.del('bn:products:all')
    
    // Trigger recompilation if needed
    if (updates.name || updates.description || updates.key_features || updates.benefits) {
      await this.markCompilationsStale(productId)
    }
  }
  
  private async queueContentGeneration(productId: string) {
    await supabase
      .from('generation_queue')
      .insert({
        product_id: productId,
        operation_type: 'generate_content',
        priority: 5,
        payload: { all_prompts: true }
      })
  }
  
  private async markCompilationsStale(productId: string) {
    // Update fingerprints to force recompilation
    await supabase
      .from('compiled_content')
      .update({ source_fingerprint: 'stale' })
      .eq('product_id', productId)
  }
}

function transformToProductDefinition(row: any): ProductDefinition {
  return {
    id: row.product_id,
    name: row.name,
    type: row.type,
    pricing: {
      model: 'fixed',
      value: row.price
    },
    content: {
      tagline: row.description?.split('\n')[0] || '',
      description: row.description,
      primaryDeliverables: row.primary_deliverables
    },
    features: row.key_features || [],
    benefits: row.benefits || [],
    metadata: {
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      status: row.content_generation_status
    },
    richContent: row.product_content?.reduce((acc: any, content: any) => {
      acc[content.content_type] = {
        title: content.title,
        content: content.content,
        generatedAt: content.generated_at
      }
      return acc
    }, {})
  }
}
```

#### 2.2 Compilation Service with Supabase
```typescript
// src/services/supabaseCompilationService.ts
import { supabase } from './supabase/client'
import { fingerprintObject } from '../utils/fingerprint'

export class SupabaseCompilationService {
  async compileMarketing(productId: string): Promise<CompiledContent> {
    // Get product
    const product = await productService.getProductById(productId)
    if (!product) throw new Error('Product not found')
    
    // Compile
    const compiled = await marketingCompiler.compile(product)
    const fingerprint = fingerprintObject({
      features: product.features,
      benefits: product.benefits,
      marketing: product.marketing
    })
    
    // Store in Supabase
    const { data, error } = await supabase
      .from('compiled_content')
      .upsert({
        product_id: productId,
        compilation_type: 'marketing',
        content: compiled,
        raw_markdown: compiled.rawMarkdown,
        sections: Object.keys(compiled.content),
        source_fingerprint: fingerprint,
        compiled_by: getCurrentUser(),
        compilation_time_ms: compiled.compilationTime
      })
      .select()
      .single()
    
    if (error) throw error
    
    // Cache in Redis
    await redis.set(
      `bn:compiled:marketing:${productId}`,
      JSON.stringify(data),
      { ex: 3600 }
    )
    
    return data
  }
  
  async getCompiledContent(productId: string, type: CompilationType): Promise<CompiledContent | null> {
    // Check Redis cache
    const cached = await redis.get(`bn:compiled:${type}:${productId}`)
    if (cached) return JSON.parse(cached)
    
    // Fetch from Supabase
    const { data, error } = await supabase
      .from('compiled_content')
      .select('*')
      .eq('product_id', productId)
      .eq('compilation_type', type)
      .single()
    
    if (error || !data) return null
    
    // Update access tracking
    await supabase
      .from('compiled_content')
      .update({
        last_accessed_at: new Date().toISOString(),
        access_count: data.access_count + 1
      })
      .eq('id', data.id)
    
    // Cache for next time
    await redis.set(
      `bn:compiled:${type}:${productId}`,
      JSON.stringify(data),
      { ex: 3600 }
    )
    
    return data
  }
  
  async isCompiledStale(productId: string, type: CompilationType): Promise<boolean> {
    const compiled = await this.getCompiledContent(productId, type)
    if (!compiled) return true
    
    const product = await productService.getProductById(productId)
    if (!product) return true
    
    const currentFingerprint = this.computeFingerprint(product, type)
    return compiled.source_fingerprint !== currentFingerprint
  }
}
```

### Phase 3: UI Components

#### 3.1 Product Creation Form
```tsx
// src/components/admin/ProductCreationForm.tsx
import { useState } from 'react'
import { supabase } from '../../services/supabase/client'
import { Button, Input, Textarea, Select } from '../ui'

export function ProductCreationForm() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'PRODUCT' as const,
    price: '',
    primaryDeliverables: '',
    description: '',
    perfectFor: '',
    whatClientBuys: '',
    idealClient: '',
    keyFeatures: [''],
    benefits: [''],
    nextProduct: ''
  })
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Create product
      const { data: product, error } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          type: formData.type,
          price: formData.price,
          primary_deliverables: formData.primaryDeliverables,
          description: formData.description,
          perfect_for: formData.perfectFor,
          what_client_buys: formData.whatClientBuys,
          ideal_client: formData.idealClient,
          key_features: formData.keyFeatures.filter(Boolean),
          benefits: formData.benefits.filter(Boolean),
          next_product: formData.nextProduct,
          created_by: getCurrentUser()
        })
        .select()
        .single()
      
      if (error) throw error
      
      // Queue content generation
      await supabase
        .from('generation_queue')
        .insert({
          product_id: product.product_id,
          operation_type: 'generate_content',
          priority: 5
        })
      
      // Redirect to product page
      navigate(`/products/${product.product_id}`)
      
    } catch (error) {
      console.error('Failed to create product:', error)
      alert('Failed to create product')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-sm font-medium mb-2">
          Product Name *
        </label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="AI Strategy Workshop"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Type *
        </label>
        <Select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
        >
          <option value="PRODUCT">Product</option>
          <option value="SERVICE">Service</option>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Price
        </label>
        <Input
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          placeholder="£5,000 or From £10,000"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Description *
        </label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Key Features
        </label>
        {formData.keyFeatures.map((feature, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <Input
              value={feature}
              onChange={(e) => {
                const updated = [...formData.keyFeatures]
                updated[i] = e.target.value
                setFormData({ ...formData, keyFeatures: updated })
              }}
              placeholder="Feature"
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setFormData({
                  ...formData,
                  keyFeatures: formData.keyFeatures.filter((_, idx) => idx !== i)
                })
              }}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setFormData({
              ...formData,
              keyFeatures: [...formData.keyFeatures, '']
            })
          }}
        >
          Add Feature
        </Button>
      </div>
      
      <Button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Product & Generate Content'}
      </Button>
    </form>
  )
}
```

#### 3.2 Real-time Status Updates
```tsx
// src/hooks/useProductGeneration.ts
import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase/client'

export function useProductGeneration(productId: string) {
  const [status, setStatus] = useState<GenerationStatus>()
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    // Get initial status
    supabase
      .from('products')
      .select('content_generation_status')
      .eq('product_id', productId)
      .single()
      .then(({ data }) => {
        if (data) setStatus(data.content_generation_status)
      })
    
    // Subscribe to updates
    const channel = supabase
      .channel(`product-${productId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `product_id=eq.${productId}`
        },
        (payload) => {
          setStatus(payload.new.content_generation_status)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_content',
          filter: `product_id=eq.${productId}`
        },
        async () => {
          // Count completed content
          const { count } = await supabase
            .from('product_content')
            .select('*', { count: 'exact', head: true })
            .eq('product_id', productId)
          
          setProgress(count || 0)
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [productId])
  
  return { status, progress, total: 14 }
}
```

### Phase 4: Background Workers

#### 4.1 Content Generation Worker
```typescript
// src/workers/contentGenerationWorker.ts
import { supabase } from '../services/supabase/client'
import { generateContent } from '../services/aiService'

export async function processContentGenerationQueue() {
  while (true) {
    // Get next job
    const { data: job } = await supabase
      .from('generation_queue')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at')
      .limit(1)
      .single()
    
    if (!job) {
      // No jobs, wait
      await new Promise(resolve => setTimeout(resolve, 5000))
      continue
    }
    
    // Mark as processing
    await supabase
      .from('generation_queue')
      .update({
        status: 'processing',
        started_at: new Date().toISOString(),
        attempt_count: job.attempt_count + 1
      })
      .eq('id', job.id)
    
    try {
      // Get product
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('product_id', job.product_id)
        .single()
      
      if (!product) throw new Error('Product not found')
      
      // Update product status
      await supabase
        .from('products')
        .update({
          content_generation_status: 'generating',
          content_generation_started_at: new Date().toISOString()
        })
        .eq('product_id', job.product_id)
      
      // Generate content for each prompt
      const prompts = await loadPrompts()
      
      for (let i = 0; i < prompts.length; i++) {
        const prompt = prompts[i]
        const startTime = Date.now()
        
        // Generate content
        const content = await generateContent(product, prompt)
        
        // Save to database
        await supabase
          .from('product_content')
          .upsert({
            product_id: job.product_id,
            content_type: prompt.filename.replace('.md', ''),
            content_number: i + 1,
            title: prompt.name,
            content: content,
            word_count: content.split(/\s+/).length,
            generated_at: new Date().toISOString(),
            model_used: 'gpt-5-mini',
            prompt_version: '1.0',
            generation_time_ms: Date.now() - startTime
          })
        
        // Small delay between API calls
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      // Mark as completed
      await supabase
        .from('products')
        .update({
          content_generation_status: 'completed',
          content_generation_completed_at: new Date().toISOString()
        })
        .eq('product_id', job.product_id)
      
      await supabase
        .from('generation_queue')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', job.id)
      
    } catch (error) {
      console.error('Generation failed:', error)
      
      // Update job status
      const shouldRetry = job.attempt_count < job.max_attempts
      
      await supabase
        .from('generation_queue')
        .update({
          status: shouldRetry ? 'pending' : 'failed',
          error: error.message
        })
        .eq('id', job.id)
      
      if (!shouldRetry) {
        await supabase
          .from('products')
          .update({
            content_generation_status: 'failed',
            content_generation_error: error.message
          })
          .eq('product_id', job.product_id)
      }
    }
  }
}
```

### Phase 5: Migration Checklist

#### 5.1 Pre-Migration
- [ ] Backup current CSV file
- [ ] Export all Redis data
- [ ] Document current product IDs
- [ ] Create Supabase project
- [ ] Run database migrations
- [ ] Set up environment variables

#### 5.2 Migration Steps
1. Run CSV → Supabase migration script
2. Verify all products migrated correctly
3. Run content migration script (existing markdown files)
4. Run compilation migration script (existing compiled data)
5. Update storage service to use Supabase
6. Test read operations
7. Deploy UI changes
8. Test write operations
9. Set up background workers
10. Monitor for 24 hours

#### 5.3 Rollback Plan
- Keep Redis as fallback for 1 week
- Daily CSV exports from Supabase
- Feature flag to switch between storage backends
- Database backups before each deployment

## Testing Strategy

### Unit Tests
```typescript
// src/services/__tests__/supabaseProductService.test.ts
describe('SupabaseProductService', () => {
  it('should create a product with correct ID format', async () => {
    const product = await service.createProduct({
      name: 'Test Product',
      type: 'PRODUCT',
      price: '£1000'
    })
    
    expect(product.id).toMatch(/^\d{2}_test_product$/)
  })
  
  it('should invalidate cache after update', async () => {
    await service.updateProduct('01_test', { name: 'Updated' })
    
    expect(redis.del).toHaveBeenCalledWith('bn:product:01_test')
    expect(redis.del).toHaveBeenCalledWith('bn:products:all')
  })
})
```

### Integration Tests
```typescript
// src/services/__tests__/integration.test.ts
describe('Full Pipeline', () => {
  it('should handle product creation through compilation', async () => {
    // Create product
    const product = await createProduct({ name: 'Integration Test' })
    
    // Wait for content generation
    await waitForStatus(product.id, 'completed')
    
    // Compile marketing
    const compiled = await compileMarketing(product.id)
    
    expect(compiled.content).toBeDefined()
    expect(compiled.sections).toContain('hero')
  })
})
```

## Performance Considerations

### Caching Strategy
```typescript
// Cache hierarchy
1. Browser Memory (instant)
2. Redis (1-5ms)
3. Supabase (10-50ms)

// Cache TTLs
- Product list: 5 minutes
- Individual product: 1 hour  
- Compiled content: 1 hour
- Static content: 24 hours
```

### Query Optimization
```sql
-- Materialized view for product list
CREATE MATERIALIZED VIEW product_summary AS
SELECT 
  p.product_id,
  p.name,
  p.type,
  p.price,
  p.content_generation_status,
  COUNT(pc.id) as content_count,
  COUNT(cc.id) as compilation_count
FROM products p
LEFT JOIN product_content pc ON pc.product_id = p.product_id
LEFT JOIN compiled_content cc ON cc.product_id = p.product_id
WHERE p.deleted_at IS NULL
GROUP BY p.product_id;

-- Refresh every hour
CREATE INDEX idx_summary_status ON product_summary(content_generation_status);
```

## Security Considerations

1. **Row Level Security**: Implement proper RLS policies
2. **API Keys**: Never expose service keys to frontend
3. **Input Validation**: Validate all user inputs
4. **Audit Trail**: Log all data modifications
5. **Backup Strategy**: Daily automated backups

## Cost Analysis

### Supabase Costs (Pro Plan $25/month)
- Database: 8GB included
- Storage: 100GB included  
- Bandwidth: 250GB included
- Realtime messages: 5 million included

### Redis Costs (Current)
- Upstash: $0.2 per 100K commands
- Estimate: ~$10-20/month at current usage

### Total: ~$35-45/month (acceptable for enterprise features)

## Success Metrics

1. **Performance**: Page load <100ms (with cache)
2. **Reliability**: 99.9% uptime
3. **Data Integrity**: Zero data loss incidents
4. **Developer Experience**: Add product in <2 minutes
5. **User Experience**: Real-time updates working

## Next Steps

1. Review and approve specification
2. Set up Supabase project
3. Begin Phase 1 implementation
4. Weekly progress reviews
5. Go-live in 2 weeks