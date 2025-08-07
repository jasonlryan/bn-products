# BN Products - Redis-Powered Product Management System

A comprehensive product management platform built with React, TypeScript, and Vite, featuring a Redis-based storage architecture for scalable data persistence and real-time compilation workflows. **Updated for auto-deployment test.**

## Architecture Overview

This application uses a dual-storage architecture that seamlessly migrates from localStorage to Redis (Vercel KV), providing both local development capabilities and production-scale persistence.

### Storage System

- **DualStorageService**: **Redis is the source of truth** - always tries Redis first, falls back to localStorage only when Redis is unavailable
- **RedisStorageService**: Production storage using Vercel KV
- **LocalStorageService**: Development/fallback storage
- **Key Namespace**: All Redis keys use `bn:` prefix for organization

### Compilation Workflow

The system includes a sophisticated compilation service that processes product data and stores compiled content in Redis:

- **Marketing Compilation**: `bn:compiled:marketing:{productId}`
- **Market Intelligence**: `bn:compiled:market-intel:{productId}`
- **Product Strategy**: `bn:compiled:product-strategy:{productId}`

## Environment Setup

### Quick Start (localStorage only)

For immediate development without Redis setup:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will automatically use localStorage for all data storage.

### Production Setup (Redis)

For production or when you need persistent data, see the [Redis Setup Guide](docs/redis-setup.md) for detailed configuration instructions.

**Key Points:**

- Redis is the **source of truth** for all data
- localStorage is used as fallback when Redis is unavailable
- In production (Vercel), Redis is automatically configured
- For local development with Redis, you need to set up environment variables

## Installation & Development

```bash
# Install dependencies
npm install

# Start development server (localStorage only)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Key Features

### 1. Product Management

- Create, read, update products
- Support for multiple product types
- Rich content management with descriptions and metadata
- **Redis-first data storage**: All product data is stored in Redis as the source of truth

### 2. Redis Storage Integration

- **Redis-first architecture**: All data is written to Redis first when available
- Automatic fallback to localStorage when Redis is unavailable
- Production-ready scalability with Vercel KV
- Seamless data synchronization between Redis and localStorage
- **Config-to-Redis sync**: Admin panel includes tools to sync product configuration data to Redis

### 3. Compilation System

- **CompilationService**: Handles all compilation workflows
- **CompilationPanel**: Admin interface for managing compilations
- **React Hooks**: `useCompilation` for state management
- **SWR Integration**: Efficient data fetching and caching

### 4. Testing & Development Tools

- **populate-storage.html**: Populate Redis with sample data
- **test-redis-compilation.html**: Test compilation workflows
- Redis population utilities and migration tools
- **Admin sync tools**: Sync configuration data to Redis via admin panel

## Project Structure

```
src/
├── components/
│   ├── admin/
│   │   └── CompilationPanel.tsx    # Admin compilation interface
│   └── ui/                         # Reusable UI components
├── hooks/
│   ├── useCompilation.ts           # Compilation workflow hooks
│   ├── useProducts.ts              # Product data hooks
│   └── useCompiledContent.ts       # Compiled content hooks
├── services/
│   ├── storage/
│   │   ├── storageService.ts       # Dual storage implementation
│   │   ├── redisStorageService.ts  # Redis/Vercel KV service
│   │   └── localStorageService.ts  # localStorage fallback
│   ├── compilationService.ts       # Compilation workflows
│   └── compilers/                  # Individual compiler services
└── utils/
    └── populateRedis.ts           # Redis population utilities
```

## Storage Service Usage

```typescript
import { storageService } from './services/storage/storageService';

// The service automatically handles Redis/localStorage switching
await storageService.set('bn:products:123', productData);
const product = await storageService.get('bn:products:123');
```

## Compilation Workflow

```typescript
import { useCompilation } from './hooks/useCompilation';

function AdminPanel() {
  const { compile, compileAll, isCompiling } = useCompilation();

  // Compile individual content type
  await compile('product-123', 'marketing');

  // Compile all content types
  await compileAll('product-123');
}
```

## Deployment

The application is configured for deployment on Vercel with:

- **vercel.json**: Deployment configuration
- **API Routes**: Serverless functions for Redis operations
- **Environment Variables**: Automatic KV\_\* variable injection
- **Build Optimization**: Vite-based bundling

## Development vs Production

### Development

- Uses localStorage by default
- Can enable Redis with `VITE_REDIS_ENABLED=true`
- Includes test pages and debugging tools

### Production (Vercel)

- Automatically uses Vercel KV (Redis)
- Serverless API routes for backend operations
- Optimized builds with caching

## Migration from localStorage

The system automatically migrates existing localStorage data to Redis when deployed. The dual storage pattern ensures no data loss during the transition.

## API Endpoints

When deployed, the following API routes are available:

- `GET /api/products` - List all products
- `POST /api/compilation/marketing` - Compile marketing content
- `POST /api/compilation/market-intel` - Compile market intelligence
- `POST /api/compilation/product-strategy` - Compile product strategy
- `GET /api/compilation/status` - Check compilation status
- `POST /api/setup/populate` - Populate Redis with sample data

## Testing

Use the included test pages to verify Redis functionality:

1. Navigate to `/populate-storage.html` to populate Redis
2. Use `/test-redis-compilation.html` to test compilation workflows
3. Check browser console for detailed logging

## Contributing

This project uses ESLint and TypeScript for code quality. Run `npm run lint` before committing changes.
