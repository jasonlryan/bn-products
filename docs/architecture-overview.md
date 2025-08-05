# Architecture Overview

## System Architecture

The BN Products system is a modern React-based web application designed to showcase and manage AI consultancy products. It currently operates as a client-side application with browser-based storage.

## Technology Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons

### Storage
- **localStorage** - All data persistence
- **JSON** - Data format

### Build & Deploy
- **Node.js 18+** - Runtime
- **npm** - Package management
- **ESLint** - Code quality
- **Prettier** - Code formatting

## Application Structure

```
bn-products/
├── src/                    # React application source
│   ├── pages/             # Page components
│   │   ├── Dashboard.tsx  # Main product listing
│   │   ├── ProductPage.tsx # Individual product view
│   │   └── AdminPage.tsx  # Admin control panel
│   ├── components/        # Reusable components
│   ├── services/         # Business logic
│   │   ├── marketingCompiler.ts
│   │   ├── marketIntelligenceCompiler.ts
│   │   └── productStrategyCompiler.ts
│   ├── config/           # Configuration & adapters
│   └── types/            # TypeScript definitions
├── config/               # Product configuration files
├── data/                # Source CSV data
├── products/            # AI-generated content (120 files)
├── scripts/             # Python processing scripts
└── public/              # Static assets
```

## Core Components

### 1. Product Dashboard
- Displays all products and services
- Tabbed interface (Products vs Services)
- Card-based layout with key information
- Links to detailed product pages

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

### Storage Keys
- Product config: Loaded from JSON files
- Compiled content: `compiled-{type}-{productId}`
- Compilation counts: `{type}-compilation-count-{productId}`
- Settings: `admin-settings`, `page-edit-mode`

## Page Routes

- `/` - Main dashboard
- `/dashboard` - Alias for main dashboard
- `/admin` - Admin control panel
- `/product/:productId` - Product detail page
- `/service/:serviceId` - Service detail page

## Security Considerations

- No authentication system
- All data stored client-side
- Edit capabilities available to anyone with admin access
- No data encryption

## Performance Characteristics

- Initial load: ~500KB JavaScript bundle
- Lazy loading for product content
- Client-side routing (no page refreshes)
- localStorage read/write operations are synchronous