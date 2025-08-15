<!--
Metadata:
Last Reviewed: 2025-08-15
Reviewer: Claude Code Assistant  
Action: VERIFIED CURRENT - Comprehensive debugging guide matches current compilation system
Status: Current
Review Notes: Detailed debugging information covers current compilation workflow, storage systems, and troubleshooting procedures
-->

# Compilation Debugging Guide

## Overview

This guide outlines the complete compilation process from user action to final storage, with comprehensive debugging information to help identify and resolve issues.

## Compilation Process Flow

### 1. User Action (AdminPage.tsx)

```
User clicks "Compile Marketing" → compileMarketingPage() function
```

**Debug Points:**

- Check browser console for `🚀 [Marketing Compiler] Starting compileMarketingPage`
- Verify product ID is correct
- Check if product exists in storage

### 2. Input Extraction (marketingCompiler.ts)

```
extractMarketingInputs() → extracts 4 key content pieces
```

**Debug Points:**

- Look for `📋 [Marketing Compiler] Extracting marketing inputs...`
- Check input lengths in console log
- Verify source content exists in product data

**Expected Inputs:**

- `keyMessages` from `product.richContent.keyMessages.sections['Generated Output']`
- `demoScript` from `product.richContent.demoScript.sections['Generated Output']`
- `slideHeadlines` from `product.richContent.slideHeadlines.sections['Generated Output']`
- `qaPrep` from `product.richContent.qaPrep.sections['Generated Output']`

### 3. AI Service Call (aiService.ts)

```
generateCompiledContent() → OpenAI API request
```

**Debug Points:**

- Look for `🤖 [AI Service] Starting generateCompiledContent`
- Check API key configuration: `🔑 [AI Service] API key configured: true/false`
- Monitor request details: model, temperature, token limits
- Check response status: `📥 [AI Service] Received response`
- Verify content structure: `📊 [AI Service] Response data structure`

**Common Issues:**

- Missing API key
- Network errors
- Rate limiting
- Invalid response format

### 4. JSON Processing (marketingCompiler.ts)

```
extractJsonFromResponse() → JSON.parse() → validation
```

**Debug Points:**

- Look for `📥 [Marketing Compiler] Received AI response length`
- Check raw response preview
- Monitor JSON cleaning: `🧹 [Marketing Compiler] Cleaned response`
- Verify JSON parsing: `🔧 [Marketing Compiler] Attempting JSON parse`
- Check content structure validation

**Common Issues:**

- AI returns markdown-formatted JSON (`json ... `)
- Invalid JSON syntax
- Missing required fields
- Malformed response

### 5. Markdown Generation (marketingCompiler.ts)

```
generateSalesEnablementMarkdown() → structured content to markdown
```

**Debug Points:**

- Look for `📝 [Marketing Compiler] Generating markdown representation...`
- Verify markdown generation completes

### 6. Storage (storageService.ts)

```
saveCompiledPage() → DualStorageService.set()
```

**Debug Points:**

- Look for `💾 [Storage] Setting key: compiled-marketing-{productId}`
- Check storage type: Redis vs localStorage
- Monitor write success/failure
- Verify data size and type

**Storage Flow:**

1. **Development**: Uses localStorage only
2. **Production**: Uses Redis (Vercel KV) with localStorage fallback
3. **Dual Write**: Writes to both when Redis available

## Debugging Commands

### Check Storage Status

```javascript
// In browser console
console.log(
  'localStorage keys:',
  Object.keys(localStorage).filter((k) => k.includes('compiled'))
);
console.log('localStorage size:', JSON.stringify(localStorage).length);
```

### Check Product Data

```javascript
// In browser console
const products = JSON.parse(localStorage.getItem('products') || '[]');
console.log(
  'Products:',
  products.map((p) => ({ id: p.id, name: p.name }))
);
```

### Check Compilation Counts

```javascript
// In browser console
const counts = {};
Object.keys(localStorage).forEach((key) => {
  if (key.includes('compilation-count')) {
    counts[key] = localStorage.getItem(key);
  }
});
console.log('Compilation counts:', counts);
```

### Test AI Service

```javascript
// In browser console (if aiService is available)
const testPrompt = 'Return only this JSON: {"test": "success"}';
const testData = 'Test input';
aiService
  .generateCompiledContent(testPrompt, testData)
  .then((result) => console.log('AI test result:', result))
  .catch((error) => console.error('AI test error:', error));
```

## Common Error Patterns

### 1. JSON Parsing Errors

**Symptoms:**

````
SyntaxError: Unexpected token '`', "```json
{
"... is not valid JSON
````

**Cause:** AI returning markdown-formatted JSON
**Solution:** JSON extraction utility should handle this automatically

### 2. Missing Content Errors

**Symptoms:**

```
AI response does not match expected structure
```

**Cause:** AI response missing required fields
**Solution:** Check AI prompt and response format

### 3. Storage Errors

**Symptoms:**

```
DualStorage set error for key compiled-marketing-{id}
```

**Cause:** Redis connection issues or localStorage quota exceeded
**Solution:** Check Redis configuration and localStorage space

### 4. API Key Errors

**Symptoms:**

```
OpenAI API key not configured
```

**Cause:** Missing or invalid API key
**Solution:** Configure OpenAI API key in environment

## Environment Configuration

### Development (.env.local)

```env
# Optional: Enable Redis in development
VITE_REDIS_ENABLED=true

# OpenAI API Key (required for compilation)
VITE_OPENAI_API_KEY=your_api_key_here
```

### Production (Vercel)

```env
# Automatically provided by Vercel
KV_REST_API_URL=your_vercel_kv_url
KV_REST_API_TOKEN=your_vercel_kv_token

# OpenAI API Key
OPENAI_API_KEY=your_api_key_here
```

## Debug Console Output

### Successful Compilation

```
🚀 [Marketing Compiler] Starting compileMarketingPage for product: 01_ai_power_hour
📋 [Marketing Compiler] Extracting marketing inputs...
✅ [Marketing Compiler] Inputs extracted successfully
🤖 [Marketing Compiler] Generating AI-compiled structured content...
🔍 [Marketing Compiler] Starting generateSalesEnablementContent
📦 [Marketing Compiler] Product: {id: "01_ai_power_hour", name: "AI Power Hour", type: "SERVICE"}
📝 [Marketing Compiler] Inputs: {keyMessagesLength: 245, demoScriptLength: 567, ...}
🤖 [AI Service] Starting generateCompiledContent
🔑 [AI Service] API key configured: true
📤 [AI Service] Making API request to OpenAI...
📥 [AI Service] Received response: {status: 200, ok: true}
✅ [AI Service] Successfully received content, length: 2847
🧹 [Marketing Compiler] Cleaned response length: 2847
🔧 [Marketing Compiler] Attempting JSON parse...
✅ [Marketing Compiler] JSON parse successful
✅ [Marketing Compiler] Content validation passed
✅ [Marketing Compiler] Content generation completed
📝 [Marketing Compiler] Generating markdown representation...
✅ [Marketing Compiler] Markdown generation completed
💾 [Marketing Compiler] Saving compiled page to storage...
💾 [Storage] Setting key: compiled-marketing-01_ai_power_hour
💾 [Storage] Redis available, writing to both storages...
✅ [Storage] Successfully wrote to both Redis and localStorage
✅ [Marketing Compiler] Page saved to storage
🎉 [Marketing Compiler] Compilation completed successfully
```

### Failed Compilation

```
🚀 [Marketing Compiler] Starting compileMarketingPage for product: 01_ai_power_hour
📋 [Marketing Compiler] Extracting marketing inputs...
✅ [Marketing Compiler] Inputs extracted successfully
🤖 [Marketing Compiler] Generating AI-compiled structured content...
🔍 [Marketing Compiler] Starting generateSalesEnablementContent
🤖 [AI Service] Starting generateCompiledContent
🔑 [AI Service] API key configured: false
❌ [AI Service] No API key configured
❌ [Marketing Compiler] AI compilation failed: Error: OpenAI API key not configured
❌ [Marketing Compiler] Marketing compilation failed: Error: Failed to compile marketing page for AI Power Hour: OpenAI API key not configured
```

## Troubleshooting Checklist

- [ ] Check browser console for detailed error logs
- [ ] Verify OpenAI API key is configured
- [ ] Check network connectivity for API calls
- [ ] Verify product data exists and has required content
- [ ] Check localStorage quota (5-10MB limit)
- [ ] Verify Redis configuration in production
- [ ] Check AI response format and JSON validity
- [ ] Monitor storage write operations
- [ ] Verify compilation counts are being updated

## Performance Monitoring

### Compilation Times

- **Input Extraction**: ~10-50ms
- **AI API Call**: ~2-10 seconds
- **JSON Processing**: ~10-100ms
- **Markdown Generation**: ~50-200ms
- **Storage Write**: ~10-100ms

### Storage Usage

- **Compiled Page**: ~50-200KB per page
- **Total Storage**: ~1-5MB for 8 products × 3 types
- **localStorage Limit**: 5-10MB (browser dependent)

## Next Steps

If debugging reveals issues:

1. **AI Issues**: Check API key, network, and response format
2. **Storage Issues**: Check Redis configuration and localStorage space
3. **Data Issues**: Verify product content exists and is properly formatted
4. **Performance Issues**: Monitor compilation times and optimize if needed
