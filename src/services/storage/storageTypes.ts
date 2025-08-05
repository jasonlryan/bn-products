/**
 * Storage Service Types and Interfaces
 * 
 * Defines the contract for storage implementations (Redis, localStorage, etc.)
 */

export interface StorageService {
  // Basic operations
  get<T = any>(key: string): Promise<T | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  
  // Numeric operations
  increment(key: string): Promise<number>;
  decrement(key: string): Promise<number>;
  
  // Batch operations
  mget<T = any>(keys: string[]): Promise<(T | null)[]>;
  mset(entries: Array<{ key: string; value: any; ttl?: number }>): Promise<void>;
  
  // Pattern operations
  keys(pattern: string): Promise<string[]>;
  deletePattern(pattern: string): Promise<number>;
}

export interface CompiledContent {
  id: string;
  productId: string;
  compiledAt: Date;
  content: any;
  rawMarkdown?: string;
}

export interface CompilationCount {
  productId: string;
  type: 'marketing' | 'market-intel' | 'product-strategy';
  count: number;
}

export interface AdminSettings {
  editModeEnabled: boolean;
  lastCompiled: Record<string, string>;
  compilationStatus: Record<string, 'idle' | 'compiling' | 'complete' | 'error'>;
  marketingPrompt?: string;
  marketIntelligencePrompt?: string;
  productStrategyPrompt?: string;
}

// Redis key prefixes
export const REDIS_PREFIXES = {
  COMPILED_MARKETING: 'bn:compiled:marketing:',
  COMPILED_MARKET_INTEL: 'bn:compiled:market-intel:',
  COMPILED_PRODUCT_STRATEGY: 'bn:compiled:product-strategy:',
  COUNT_MARKETING: 'bn:count:marketing:',
  COUNT_MARKET_INTEL: 'bn:count:market-intel:',
  COUNT_PRODUCT_STRATEGY: 'bn:count:product-strategy:',
  SETTINGS: 'bn:settings:',
} as const;

// Storage configuration
export interface StorageConfig {
  type: 'redis' | 'localStorage' | 'memory';
  redis?: {
    url: string;
    token: string;
    readOnlyToken?: string;
  };
}