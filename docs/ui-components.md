# UI Components and Pages

## Component Architecture

The application follows a component-based architecture with clear separation between pages, reusable components, and utility functions.

## Page Components

### 1. Dashboard (`src/pages/Dashboard.tsx`)
**Purpose**: Main landing page displaying all products and services

**Key Features**:
- Hero section with company branding
- Tabbed interface (Products vs Services)
- Product/service cards with key information
- Call-to-action sections
- Responsive grid layout

**State Management**:
```typescript
const [activeTab, setActiveTab] = useState<'products' | 'services'>('products')
const [showAIConfig, setShowAIConfig] = useState(false)

const products = getAllProducts()
const services = getAllServices()
```

**Key Interactions**:
- Tab switching between products and services
- Product card click → navigate to product page
- Admin button → navigate to admin panel
- Settings button → open AI config modal

### 2. ProductPage (`src/pages/ProductPage.tsx`)
**Purpose**: Detailed view of individual products/services

**Key Features**:
- Multi-tab interface for different content types
- Rich content display with markdown rendering
- Compilation status indicators
- Editable sections (when edit mode enabled)

**Tab Structure**:
- **Overview**: Basic product information
- **Marketing**: Compiled marketing content
- **Market Intelligence**: Market analysis content
- **Product Strategy**: Strategic planning content

**URL Parameters**:
```typescript
const { productId } = useParams<{ productId: string }>()
const searchParams = new URLSearchParams(location.search)
const initialTab = searchParams.get('tab') || 'overview'
```

### 3. AdminPage (`src/pages/AdminPage.tsx`)
**Purpose**: Administrative control panel

**Key Features**:
- Global settings management
- Content compilation controls
- Custom prompt editing
- Compilation status tracking
- Edit mode toggle

**Panel Structure**:
- **Global Settings**: Edit mode toggle
- **Prompt Management**: Custom prompt editing
- **Content Compilation**: Three compilation types
  - Marketing & Sales
  - Market Intelligence
  - Product Strategy

### 4. NotFound (`src/pages/NotFound.tsx`)
**Purpose**: 404 error page for invalid routes

## Reusable Components

### Core UI Components (`src/components/ui/`)

#### Button (`Button.tsx`)
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
}
```

#### Card (`Card.tsx`)
```typescript
interface CardProps {
  hover?: boolean
  className?: string
  onClick?: () => void
  children: React.ReactNode
}
```

#### Input (`Input.tsx`)
```typescript
interface InputProps {
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
}
```

### Specialized Components

#### DraggableTabPanel (`src/components/DraggableTabPanel.tsx`)
**Purpose**: Draggable and collapsible content panels

**Features**:
- Drag and drop reordering
- Collapse/expand functionality
- Persistent state in localStorage
- Smooth animations

#### MarkdownRenderer (`src/components/MarkdownRenderer.tsx`)
**Purpose**: Renders markdown content with custom styling

**Features**:
- Syntax highlighting
- Custom styles for headers, lists, code blocks
- Link handling
- Image support

#### EditableSection (`src/components/EditableSection.tsx`)
**Purpose**: Inline content editing capability

**Features**:
- Toggle between view and edit modes
- Auto-save functionality
- Markdown editing support
- Validation and error handling

#### AIConfigModal (`src/components/AIConfigModal.tsx`)
**Purpose**: AI service configuration dialog

**Features**:
- API key management
- Service endpoint configuration
- Model selection
- Testing connectivity

#### PanelConfigModal (`src/components/PanelConfigModal.tsx`)
**Purpose**: Panel layout configuration

**Features**:
- Panel visibility settings
- Order customization
- Import/export configurations
- Reset to defaults

### Compilation Views

#### CompiledMarketingView (`src/components/marketing/CompiledMarketingView.tsx`)
**Purpose**: Displays compiled marketing content

**Sections**:
- Executive Summary
- Messaging Framework
- Sales Process Guide
- Objection Handling
- Marketing Assets
- Target Audience Intel
- Implementation Guide

#### CompiledMarketIntelligenceView (`src/components/market-intelligence/CompiledMarketIntelligenceView.tsx`)
**Purpose**: Displays market intelligence compilation

**Sections**:
- Market Overview
- Competitive Analysis
- Customer Insights
- Strategic Recommendations

#### CompiledProductStrategyView (`src/components/product-strategy/CompiledProductStrategyView.tsx`)
**Purpose**: Displays product strategy compilation

**Sections**:
- Product Vision
- Strategic Roadmap
- Feature Prioritization
- Success Metrics

### Landing Page Components

#### LandingPageView (`src/components/landing/LandingPageView.tsx`)
**Purpose**: Product-specific landing page generator

#### EditableLandingSection (`src/components/landing/EditableLandingSection.tsx`)
**Purpose**: Editable landing page sections

## Styling System

### Design System
- **Colors**: Primary blue (#0700FF), white backgrounds, gray text
- **Typography**: System fonts (SF Pro, Segoe UI, Roboto)
- **Spacing**: Tailwind CSS spacing scale
- **Breakpoints**: Mobile-first responsive design

### CSS Classes
```css
/* Primary brand color */
.text-primary { color: #0700FF; }
.bg-primary { background-color: #0700FF; }
.border-primary { border-color: #0700FF; }

/* Card styling */
.card { @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6; }

/* Button variants */
.btn-primary { @apply bg-primary text-white hover:bg-primary-dark; }
.btn-outline { @apply border-2 border-primary text-primary hover:bg-primary hover:text-white; }
```

### Responsive Design
```typescript
// Mobile-first breakpoints
const breakpoints = {
  sm: '640px',   // Small devices
  md: '768px',   // Medium devices
  lg: '1024px',  // Large devices
  xl: '1280px',  // Extra large devices
}
```

## State Management Patterns

### Local Component State
```typescript
// Simple state
const [isEditing, setIsEditing] = useState(false)

// Complex state with reducer
const [state, dispatch] = useReducer(reducer, initialState)
```

### Global State (localStorage)
```typescript
// Admin settings
const loadAdminSettings = () => {
  const saved = localStorage.getItem('admin-settings')
  return saved ? JSON.parse(saved) : defaultSettings
}

// Edit mode
const editModeEnabled = localStorage.getItem('page-edit-mode') === 'true'
```

### URL State
```typescript
// Product page tabs
const searchParams = new URLSearchParams(location.search)
const activeTab = searchParams.get('tab') || 'overview'
```

## Event Handling Patterns

### Click Handlers
```typescript
const handleProductClick = useCallback((productId: string) => {
  navigate(`/product/${productId}`)
}, [navigate])
```

### Form Submission
```typescript
const handleSave = useCallback(async (data: FormData) => {
  try {
    await saveData(data)
    setStatus('success')
  } catch (error) {
    setStatus('error')
    setError(error.message)
  }
}, [])
```

### Async Operations
```typescript
const compileContent = useCallback(async (productId: string) => {
  setLoading(true)
  try {
    const result = await compiler.compile(productId)
    setCompiled(result)
  } catch (error) {
    setError(error)
  } finally {
    setLoading(false)
  }
}, [])
```

## Performance Optimizations

### Memoization
```typescript
// Expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])

// Callback stability
const stableCallback = useCallback(() => {
  // callback implementation
}, [dependencies])

// Component memoization
const MemoizedComponent = memo(ExpensiveComponent)
```

### Lazy Loading
```typescript
// Code splitting
const LazyComponent = lazy(() => import('./LazyComponent'))

// Image lazy loading
<img loading="lazy" src={imageSrc} alt={altText} />
```

### Virtual Scrolling
```typescript
// For large lists (future enhancement)
import { FixedSizeList as List } from 'react-window'
```

## Accessibility Features

### Keyboard Navigation
- Tab order management
- Focus management
- Keyboard shortcuts

### Screen Reader Support
- Semantic HTML elements
- ARIA labels and descriptions
- Skip links

### Color Contrast
- WCAG AA compliance
- High contrast mode support
- Color-blind friendly palette

## Testing Considerations

### Component Testing
- Unit tests for individual components
- Integration tests for component interactions
- Snapshot tests for UI consistency

### Accessibility Testing
- Automated accessibility scanning
- Manual keyboard testing
- Screen reader testing

### Performance Testing
- Bundle size monitoring
- Render performance profiling
- Memory leak detection