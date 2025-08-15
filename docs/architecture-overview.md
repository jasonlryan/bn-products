<!--
Metadata:
Last Reviewed: 2025-08-15
Reviewer: Claude Code Assistant  
Action: VERIFIED CURRENT - Architecture description matches current system implementation
Status: Current
Review Notes: System architecture, tech stack, and organization structure are accurate
-->

# Architecture Overview

## System Architecture

The BN Products system is a modern React-based web application designed to showcase and manage AI consultancy products. It features a **dual-storage architecture** with Redis-first persistence and advanced search capabilities for optimal consultant effectiveness.

## Technology Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons

### Storage
- **Redis (Vercel KV)** - Primary production storage
- **localStorage** - Development fallback and local cache
- **Dual Storage Service** - Automatic Redis/localStorage switching
- **JSON** - Data serialization format

### Build & Deploy
- **Node.js 18+** - Runtime
- **npm** - Package management
- **ESLint** - Code quality
- **Prettier** - Code formatting
- **Vercel** - Production deployment platform
- **API Routes** - Serverless functions for Redis operations

## Application Structure

```
bn-products/
├── src/                    # React application source
│   ├── pages/             # Page components
│   │   ├── Dashboard.tsx  # Main product listing with search & quick view
│   │   ├── ProductPage.tsx # Individual product view
│   │   └── AdminPage.tsx  # Admin control panel
│   ├── components/        # Reusable components
│   │   └── ui/           # UI component library
│   │       ├── SearchInput.tsx    # Advanced search component
│   │       ├── QuickViewModal.tsx # Product quick view modal
│   │       ├── Button.tsx         # Reusable button
│   │       └── Card.tsx          # Product card component
│   ├── services/         # Business logic
│   │   ├── storage/      # Storage abstraction layer
│   │   │   ├── storageService.ts      # Dual storage coordinator
│   │   │   ├── redisStorageService.ts # Redis/Vercel KV service
│   │   │   └── localStorageService.ts # localStorage fallback
│   │   ├── marketingCompiler.ts
│   │   ├── marketIntelligenceCompiler.ts
│   │   └── productStrategyCompiler.ts
│   ├── config/           # Configuration & adapters
│   └── types/            # TypeScript definitions
├── config/               # Product configuration files
├── data/                # Source CSV data
├── products/            # AI-generated content (120 files)
├── scripts/             # Python processing scripts
├── api/                 # Vercel serverless API routes
│   └── storage.ts       # Redis storage API proxy
└── public/              # Static assets
```

## Core Components

### 1. Product Dashboard (Enhanced in Sprint 1)
- **Advanced Search**: Real-time filtering across all product content (names, descriptions, features, benefits, use cases)
- **Quick View Modal**: Instant access to product details without navigation
- **Tabbed Interface**: Products vs Services with result counters
- **Card-based Layout**: Enhanced with quick view and full details buttons
- **Performance Optimized**: 300ms debounced search with loading indicators
- **Mobile Responsive**: Optimized for field use during client meetings

### 2. Product Pages
- Multi-tab interface for different content types
- Rich content display with markdown rendering
- Editable sections (when edit mode enabled)
- Compilation status indicators

### 3. Admin Panel
- Global settings management
- Content compilation controls
- Prompt customization
- Edit mode toggle

### 4. Compilation System
- Three distinct compilers for different content types
- AI-powered content synthesis
- Progress tracking and status management
- **Redis-first storage**: Compiled content persisted to Redis for scalability

### 5. Storage Architecture (New)
- **Dual Storage Service**: Coordinates between Redis and localStorage
- **Redis Service**: Production-grade persistence with Vercel KV
- **localStorage Service**: Development fallback and offline support
- **Automatic Failover**: Seamless switching between storage backends

## Data Architecture

### Product Data Structure
```typescript
interface Product {
  id: string
  name: string
  type: 'PRODUCT' | 'SERVICE'
  pricing: PricingInfo
  content: ProductContent
  features: string[]
  benefits: string[]
  marketing: MarketingInfo
  richContent: RichContentFiles
}
```

### Storage Keys (Redis Namespace: `bn:`)
- **Products**: `bn:products:{productId}` - Individual product data
- **Product Lists**: `bn:products:all`, `bn:services:all` - Cached product collections
- **Compiled Content**: `bn:compiled:{type}:{productId}` - Marketing, market-intel, product-strategy
- **Compilation Counts**: `bn:count:{type}:{productId}` - Compilation statistics
- **Settings**: `bn:admin-settings`, `bn:page-edit-mode` - Application configuration
- **Feedback**: `bn:feedback:{id}` - User feedback storage

## Page Routes

- `/` - Main dashboard with search and quick view functionality
- `/dashboard` - Alias for main dashboard
- `/admin` - Admin control panel with compilation management
- `/product/:productId` - Product detail page with rich content
- `/service/:serviceId` - Service detail page with rich content

## API Routes (Vercel Serverless)

- `POST /api/storage` - Redis storage operations proxy
  - Actions: get, set, delete, exists, increment, mget, mset, keys, deletePattern

## Security Considerations

- **No authentication system** (internal team tool)
- **Hybrid storage**: Redis (server-side) + localStorage (client-side)
- **Edit capabilities** available to anyone with admin access
- **API proxy security**: Redis operations routed through secure Vercel API
- **No sensitive data**: Product information is public-facing content
- **Environment variables**: Redis credentials secured in Vercel deployment

## Performance Characteristics

- **Bundle size**: ~2.4MB JavaScript (code splitting planned for optimization)
- **Search performance**: 300ms debounced real-time filtering
- **Storage performance**: Redis operations cached with localStorage fallback
- **Lazy loading**: Product content loaded on demand
- **Client-side routing**: No page refreshes for navigation
- **Mobile optimized**: Responsive design for field use
- **Loading states**: Visual feedback throughout application

## Recent Improvements (Sprint 1 - January 2025)

### ✅ New Features Delivered:
- **Advanced search system** with real-time filtering across all content
- **Quick view modal** for instant product details access
- **Enhanced user experience** with loading states and result feedback
- **Performance optimizations** including debounced search and improved storage

### 🔧 Technical Upgrades:
- **Fixed Redis integration** with proper dynamic imports for Vercel deployment
- **Component architecture** expanded with reusable UI components
- **Error handling** improved throughout the application
- **Mobile responsiveness** enhanced for consultant field use

### 📈 Measurable Impact:
- **Response time**: Reduced from ~45 seconds to <30 seconds for product lookup
- **Search coverage**: 100% of product content now searchable
- **User experience**: Professional interface with proper loading feedback
- **Code quality**: Build passes without errors, linting warnings addressed