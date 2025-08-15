<!--
Metadata:
Last Reviewed: 2025-08-15
Reviewer: Claude Code Assistant  
Action: VERIFIED CURRENT - Admin system documentation matches current AdminPage functionality
Status: Current
Review Notes: Comprehensive documentation of admin panel features, compilation management, and settings
-->

# Admin System

## Overview

The admin system provides comprehensive control over content compilation, prompt management, and global application settings. It's designed for content managers and system administrators.

## Access and Security

### URL Access
- **Admin Panel**: `http://localhost:5173/admin`
- **No Authentication**: Currently open access (suitable for internal use)

### Navigation
- **Back to Dashboard**: Returns to main product listing
- **Breadcrumb**: Clear path indication

## Admin Panel Structure

### 1. Global Settings Panel

**Purpose**: Manage application-wide settings

**Features**:
- **Page Editing Mode Toggle**
  - Enables/disables inline content editing across all pages
  - Affects all product pages and components
  - Status indicator shows current state
  - Persisted in localStorage as `page-edit-mode`

**UI Elements**:
```typescript
// Toggle switch with visual feedback
<button className={`toggle ${editModeEnabled ? 'enabled' : 'disabled'}`}>
  <span className="toggle-slider" />
</button>

// Status indicator
{editModeEnabled ? (
  <><Edit className="text-green-600" /> Edit mode enabled</>
) : (
  <><Eye className="text-gray-600" />Edit mode disabled</>
)}
```

### 2. Prompt Management Panel

**Purpose**: Customize AI compilation prompts

**Three Prompt Types**:
1. **Marketing Prompt** - For sales enablement compilation
2. **Market Intelligence Prompt** - For strategic analysis compilation  
3. **Product Strategy Prompt** - For roadmap compilation

**Prompt Editing Workflow**:
1. Select prompt type via tabs
2. Click "Edit Prompt" to enter edit mode
3. Modify prompt in large textarea (20 rows)
4. Save changes or cancel
5. Reset to default if needed

**Prompt Storage**:
```typescript
// Stored in admin-settings localStorage
{
  "marketingPrompt": "Custom marketing prompt...",
  "marketIntelligencePrompt": "Custom intelligence prompt...",
  "productStrategyPrompt": "Custom strategy prompt..."
}
```

**Default Prompts**:
- Imported from `src/prompts/` files
- Fallback if custom prompt not set
- Reset function restores defaults

### 3. Content Compilation Management

**Three Compilation Types** with dedicated panels:

#### Marketing & Sales Compilation
**Sources**: Key Messages + Demo Script + Slide Headlines + Q&A Prep
**Output**: Unified sales enablement pages

**Panel Features**:
- Individual product compilation buttons
- "Compile All" batch operation
- Compilation status per product
- View buttons to see results
- Reset compilation count buttons

#### Market Intelligence Compilation  
**Sources**: Competitor Analysis + Market Sizing + Audience ICPs + Investor Deck
**Output**: Strategic market intelligence

**Panel Features**:
- Same interface as Marketing compilation
- Separate status tracking
- Links to market intelligence view

#### Product Strategy Compilation
**Sources**: Product Manifesto + User Stories + Functional Spec + PRD Skeleton
**Output**: Strategic product roadmap

**Panel Features**:
- Same interface pattern
- Strategy-specific status tracking
- Links to product strategy view

## Compilation Status System

### Status States
1. **idle** - Ready for compilation
2. **compiling** - Currently processing (spinner animation)
3. **complete** - Successfully compiled
4. **error** - Compilation failed

### Status Display
```typescript
const getStatusText = (productId: string) => {
  const count = compiler.getCompilationCount(productId)
  const status = settings.compilationStatus?.[productId] || 'idle'
  const lastCompiled = settings.lastCompiled?.[productId]

  if (status === 'compiling') return 'Compiling...'
  
  if (count > 0) {
    const countText = ` (${count} times)`
    return lastCompiled 
      ? `Compiled ${lastCompiled.toLocaleDateString()}${countText}`
      : `Compiled${countText}`
  }
  
  return 'Not compiled'
}
```

### Visual Indicators
- **Color coding**: Green (complete), Blue (compiling), Red (error), Gray (idle)
- **Icons**: Spinning refresh for compiling, check for complete
- **Count badges**: Number of times compiled
- **Timestamps**: Last compilation date

## Compilation Operations

### Individual Compilation
```typescript
const compileMarketingPage = async (productId: string) => {
  // 1. Set status to 'compiling'
  updateStatus(productId, 'compiling')
  
  try {
    // 2. Get product data
    const product = getProductById(productId)
    
    // 3. Compile using service
    const compiled = await marketingCompiler.compileMarketingPage(product)
    
    // 4. Save and update status
    marketingCompiler.saveCompiledPage(compiled)
    updateStatus(productId, 'complete')
    updateLastCompiled(productId, new Date())
    
  } catch (error) {
    updateStatus(productId, 'error')
    console.error('Compilation failed:', error)
  }
}
```

### Batch Compilation
```typescript
const compileAllMarketing = async () => {
  for (const product of products) {
    await compileMarketingPage(product.id)
  }
  await loadData() // Refresh UI state
}
```

### Reset Operations
```typescript
const resetCompilationCount = (productId: string) => {
  if (confirm('Reset compilation count?')) {
    // Remove from compiler service
    marketingCompiler.resetCompilationCount(productId)
    
    // Update admin settings
    updateSettings({
      ...settings,
      compilationCount: { 
        ...settings.compilationCount, 
        [productId]: 0 
      }
    })
  }
}
```

## Data Persistence

### Admin Settings Schema
```typescript
interface AdminSettings {
  editModeEnabled: boolean
  lastCompiled: Record<string, Date>
  compilationStatus: Record<string, 'idle' | 'compiling' | 'complete' | 'error'>
  compilationCount: Record<string, number>
  
  // Marketing settings
  marketingPrompt?: string
  
  // Market Intelligence settings  
  marketIntelligencePrompt?: string
  marketIntelligenceLastCompiled?: Record<string, Date>
  marketIntelligenceStatus?: Record<string, string>
  marketIntelligenceCount?: Record<string, number>
  
  // Product Strategy settings
  productStrategyPrompt?: string
  productStrategyLastCompiled?: Record<string, Date>
  productStrategyStatus?: Record<string, string>  
  productStrategyCount?: Record<string, number>
}
```

### Storage Operations
```typescript
// Save settings
const saveSettings = (newSettings: AdminSettings) => {
  setSettings(newSettings)
  localStorage.setItem('admin-settings', JSON.stringify(newSettings))
}

// Load settings
const loadSettings = () => {
  const saved = localStorage.getItem('admin-settings')
  return saved ? JSON.parse(saved) : defaultSettings
}
```

## UI Patterns

### Expandable Panels
```typescript
const [expandedPanels, setExpandedPanels] = useState({
  globalSettings: true,
  promptManagement: false,
  productManagement: true
})

const togglePanel = (panelName: string) => {
  setExpandedPanels(prev => ({
    ...prev,
    [panelName]: !prev[panelName]
  }))
}
```

### Action Buttons
- **Primary actions**: Blue background, white text
- **Secondary actions**: White background, gray border
- **Destructive actions**: Red text, gray background
- **Disabled state**: Gray background, reduced opacity

### Progress Indicators
- **Compilation spinner**: Rotating refresh icon
- **Status badges**: Colored pills with status text
- **Count displays**: Small numeric badges

## Error Handling

### Compilation Errors
```typescript
try {
  await compileContent(productId)
} catch (error) {
  console.error('Compilation failed:', error)
  setStatus(productId, 'error')
  // Error is logged but doesn't break UI
}
```

### Storage Errors
```typescript
try {
  localStorage.setItem(key, value)
} catch (error) {
  console.error('Storage failed:', error)
  // Graceful degradation - continue without saving
}
```

### Network Errors (Future)
```typescript
try {
  await api.compile(data)
} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    // Retry logic
  } else {
    // Show user-friendly error
  }
}
```

## Performance Considerations

### Batch Operations
- Sequential processing to avoid overwhelming system
- Progress indicators for long-running operations
- Ability to cancel batch operations (future)

### Memory Management
- Settings loaded once on page load
- Compilation results cached in memory during session
- Large content strings handled efficiently

### UI Responsiveness
- Async operations don't block UI
- Loading states for all operations
- Optimistic updates where appropriate

## Future Enhancements

### Authentication & Authorization
- User login system
- Role-based access control
- Admin vs editor permissions

### Advanced Settings
- Compilation timeout settings
- Retry configuration
- Batch size controls

### Monitoring & Analytics
- Compilation success rates
- Performance metrics
- Usage statistics

### Backup & Recovery
- Export/import admin settings
- Compilation history
- Data recovery tools