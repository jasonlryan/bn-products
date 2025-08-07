export interface StorageService {
  // Basic operations
  get<T = any>(key: string): Promise<T | null>
  set(key: string, value: any, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  exists(key: string): Promise<boolean>
  
  // Numeric operations
  increment(key: string): Promise<number>
  decrement(key: string): Promise<number>
  
  // Batch operations
  mget<T = any>(keys: string[]): Promise<(T | null)[]>
  mset(entries: Array<{ key: string; value: any; ttl?: number }>): Promise<void>
  
  // Pattern operations
  keys(pattern: string): Promise<string[]>
  deletePattern(pattern: string): Promise<number>
}

export interface ProductDefinition {
  id: string
  name: string
  type: 'PRODUCT' | 'SERVICE'
  pricing: {
    type: 'fixed' | 'subscription' | 'per_user' | 'usage' | 'custom'
    display: string
    value?: number
  }
  content: {
    description: string
    perfectFor: string
    keyBenefits?: string[]
    outcomes?: string[]
  }
  features: string[]
  benefits: string[]
  marketing: {
    headline?: string
    tagline?: string
    positioning?: string
  }
  metadata: {
    createdAt: string
    lastModified: string
    version: string
    createdBy?: string
  }
}

export interface RichContentFile {
  title: string
  metadata: {
    productId: string
    contentType: string
    lastGenerated: string
    promptVersion: string
  }
  sections: {
    'Original Prompt': string
    'Product Context': string
    'Generated Output': string
    'Context Used': string
  }
  fullContent: string
  lastModified: string
  version: string
}

export interface PipelineStatus {
  productId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number // 0-100
  currentStage: string
  startedAt: string
  completedAt?: string
  error?: string
}

export interface MigrationResult {
  products: number
  compiledContent: number
  settings: number
  errors: string[]
}