import { useState, useCallback } from 'react'
import { compilationService } from '../services/compilationService'
import type { CompilationType } from '../services/compilationService'

export function useCompilation() {
  const [isCompiling, setIsCompiling] = useState<Record<string, boolean>>({})
  const [compilationErrors, setCompilationErrors] = useState<Record<string, string>>({})

  const compile = useCallback(async (productId: string, type: CompilationType) => {
    const key = `${productId}-${type}`
    
    try {
      setIsCompiling(prev => ({ ...prev, [key]: true }))
      setCompilationErrors(prev => ({ ...prev, [key]: '' }))

      let result
      switch (type) {
        case 'marketing':
          result = await compilationService.compileMarketing(productId)
          break
        case 'market-intel':
          result = await compilationService.compileMarketIntelligence(productId)
          break
        case 'product-strategy':
          result = await compilationService.compileProductStrategy(productId)
          break
        default:
          throw new Error(`Unknown compilation type: ${type}`)
      }

      if (!result.success) {
        throw new Error(result.error || 'Compilation failed')
      }

      return result.compiledPage
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      setCompilationErrors(prev => ({ ...prev, [key]: errorMsg }))
      throw error
    } finally {
      setIsCompiling(prev => ({ ...prev, [key]: false }))
    }
  }, [])

  const compileAll = useCallback(async (productId: string) => {
    const key = `${productId}-all`
    
    try {
      setIsCompiling(prev => ({ ...prev, [key]: true }))
      setCompilationErrors(prev => ({ ...prev, [key]: '' }))

      const results = await compilationService.compileAll(productId)
      
      // Check for any errors
      const errors = []
      if (!results.marketing.success) errors.push(`Marketing: ${results.marketing.error}`)
      if (!results.marketIntel.success) errors.push(`Market Intel: ${results.marketIntel.error}`)
      if (!results.productStrategy.success) errors.push(`Product Strategy: ${results.productStrategy.error}`)
      
      if (errors.length > 0) {
        throw new Error(errors.join(', '))
      }

      return results
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      setCompilationErrors(prev => ({ ...prev, [key]: errorMsg }))
      throw error
    } finally {
      setIsCompiling(prev => ({ ...prev, [key]: false }))
    }
  }, [])

  const deleteCompiledContent = useCallback(async (productId: string, type: CompilationType) => {
    return await compilationService.deleteCompiledContent(productId, type)
  }, [])

  return {
    compile,
    compileAll,
    deleteCompiledContent,
    isCompiling,
    compilationErrors
  }
}