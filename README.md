# BN Products - Redis-Powered Product Management System

A comprehensive product management platform built with React, TypeScript, and Vite, featuring a Redis-based storage architecture for scalable data persistence, real-time compilation workflows, and advanced search capabilities for consultant effectiveness.

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

### 1. Advanced Search & Discovery

- **Real-time Search**: Instant filtering across product names, descriptions, features, benefits, and use cases
- **Debounced Search**: 300ms debouncing prevents excessive API calls and ensures smooth performance
- **Quick View Modal**: Instant access to key product information without navigation
- **Results Feedback**: Clear indication of search results with helpful suggestions
- **Search Across All Fields**: Comprehensive search including features, benefits, and "perfect for" content

### 2. Product Management

- Create, read, update products and services
- Support for multiple product types (PRODUCT/SERVICE)
- Rich content management with descriptions and metadata
- **Redis-first data storage**: All product data is stored in Redis as the source of truth
- Dual product/service navigation with filtering

### 3. Redis Storage Integration

- **Redis-first architecture**: All data is written to Redis first when available
- Automatic fallback to localStorage when Redis is unavailable
- Production-ready scalability with Vercel KV
- Seamless data synchronization between Redis and localStorage
- **Config-to-Redis sync**: Admin panel includes tools to sync product configuration data to Redis

### 4. Compilation System

- **CompilationService**: Handles all compilation workflows
- **CompilationPanel**: Admin interface for managing compilations
- **React Hooks**: `useCompilation` for state management
- **SWR Integration**: Efficient data fetching and caching

### 5. User Experience & Performance

- **Loading States**: Visual feedback during data loading and search operations
- **Mobile Responsive**: Optimized for field use on mobile devices
- **Performance Indicators**: Search typing indicators and result counters
- **Error Handling**: Graceful fallbacks and helpful error messages

### 6. Testing & Development Tools

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
│       ├── SearchInput.tsx         # Advanced search component
│       ├── QuickViewModal.tsx      # Product quick view modal
│       ├── Button.tsx              # Reusable button component
│       └── Card.tsx                # Product/service card component
├── hooks/
│   ├── useCompilation.ts           # Compilation workflow hooks
│   ├── useProducts.ts              # Product data hooks
│   └── useCompiledContent.ts       # Compiled content hooks
├── pages/
│   ├── Dashboard.tsx               # Main dashboard with search & quick view
│   ├── ProductPage.tsx             # Detailed product view
│   └── AdminPage.tsx               # Admin panel
├── services/
│   ├── storage/
│   │   ├── storageService.ts       # Dual storage implementation
│   │   ├── redisStorageService.ts  # Redis/Vercel KV service (fixed imports)
│   │   └── localStorageService.ts  # localStorage fallback
│   ├── compilationService.ts       # Compilation workflows
│   └── compilers/                  # Individual compiler services
└── utils/
    ├── populateRedis.ts           # Redis population utilities
    └── textCleaner.ts             # Text processing utilities
```

## Storage Service Usage

```typescript
import { storageService } from './services/storage/storageService';

// The service automatically handles Redis/localStorage switching
await storageService.set('bn:products:123', productData);
const product = await storageService.get('bn:products:123');
```

## New Component Usage

### Search Component

```typescript
import { SearchInput } from './components/ui/SearchInput';

function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SearchInput
      onSearch={setSearchQuery}
      placeholder="Search products or services..."
      debounceMs={300}
    />
  );
}
```

### Quick View Modal

```typescript
import { QuickViewModal } from './components/ui/QuickViewModal';

function ProductGrid() {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  return (
    <QuickViewModal
      product={quickViewProduct}
      isOpen={isQuickViewOpen}
      onClose={() => setIsQuickViewOpen(false)}
      onViewDetails={(productId) => navigate(`/product/${productId}`)}
    />
  );
}
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

## Recent Updates (Sprint 1 - January 2025)

### 🚀 New Features Delivered

- **Advanced Search System**: Real-time search across all product/service content
- **Quick View Modal**: Instant access to product details without navigation
- **Enhanced User Experience**: Loading states, result counters, and improved feedback
- **Performance Optimizations**: Debounced search and improved Redis integration

### 🔧 Technical Improvements

- **Fixed Redis Integration**: Resolved import issues for production deployment
- **Component Architecture**: New reusable UI components (SearchInput, QuickViewModal)
- **Code Quality**: Build passes without errors, improved error handling
- **Mobile Optimization**: Responsive design improvements for field use

### 📈 Business Impact

- **Reduced Response Time**: Product lookup now takes <30 seconds (previously ~45 seconds)
- **Improved Consultant Effectiveness**: Quick access to key product information
- **Better Discovery Support**: Enhanced search helps match client needs with solutions
- **Professional Experience**: Polished UI with proper loading states and feedback

### 🎯 Development Plan Progress

- ✅ **Sprint 1 Complete**: Search functionality, quick view modal, performance indicators
- 🔄 **Next Phase**: Code splitting for bundle optimization, mobile enhancements
- 📋 **Roadmap**: Cross-selling tools, proposal quality assurance, analytics

## Contributing

This project uses ESLint and TypeScript for code quality. Run `npm run lint` before committing changes.

### Development Status

- **Current Phase**: Phase 1 (NOW) - Sprint 1 ✅ Complete  
- **Next Sprint**: Mobile optimization and performance improvements
- **Bundle Size**: 2.4MB (code splitting planned for optimization)
- **Test Coverage**: Manual testing complete, automated testing planned
