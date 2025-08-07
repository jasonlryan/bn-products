import { useState, useEffect } from 'react'
import { RefreshCw, FileText, TrendingUp, Target, Zap } from 'lucide-react'
import { Button, Card } from '../ui'
import { useProducts, useCompilation } from '../../hooks'

export function CompilationPanel() {
  const { products, isLoading: productsLoading } = useProducts()
  const { 
    compile, 
    compileAll, 
    getCompilationCounts, 
    hasCompiledContent, 
    isCompiling, 
    compilationErrors 
  } = useCompilation()
  
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [compilationCounts, setCompilationCounts] = useState<Record<string, {
    marketing: number
    marketIntel: number
    productStrategy: number
  }>>({})
  const [hasCompiled, setHasCompiled] = useState<Record<string, {
    marketing: boolean
    marketIntel: boolean
    productStrategy: boolean
  }>>({})

  // Load compilation data when products change
  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id)
    }
  }, [products, selectedProductId])

  useEffect(() => {
    const loadCompilationData = async () => {
      for (const product of products) {
        try {
          const counts = await getCompilationCounts(product.id)
          setCompilationCounts(prev => ({
            ...prev,
            [product.id]: counts
          }))

          const [hasMarketing, hasMarketIntel, hasProductStrategy] = await Promise.all([
            hasCompiledContent(product.id, 'marketing'),
            hasCompiledContent(product.id, 'market-intel'),
            hasCompiledContent(product.id, 'product-strategy')
          ])

          setHasCompiled(prev => ({
            ...prev,
            [product.id]: {
              marketing: hasMarketing,
              marketIntel: hasMarketIntel,
              productStrategy: hasProductStrategy
            }
          }))
        } catch (error) {
          console.error(`Failed to load compilation data for ${product.id}:`, error)
        }
      }
    }

    if (products.length > 0) {
      loadCompilationData()
    }
  }, [products, getCompilationCounts, hasCompiledContent])

  const handleCompile = async (type: 'marketing' | 'market-intel' | 'product-strategy') => {
    if (!selectedProductId) return

    try {
      await compile(selectedProductId, type)
      
      // Refresh compilation data
      const counts = await getCompilationCounts(selectedProductId)
      setCompilationCounts(prev => ({
        ...prev,
        [selectedProductId]: counts
      }))

      const hasContent = await hasCompiledContent(selectedProductId, type)
      setHasCompiled(prev => ({
        ...prev,
        [selectedProductId]: {
          ...prev[selectedProductId],
          [type]: hasContent
        }
      }))
      
      console.log(`✅ ${type} compilation completed for ${selectedProductId}`)
    } catch (error) {
      console.error(`❌ ${type} compilation failed:`, error)
    }
  }

  const handleCompileAll = async () => {
    if (!selectedProductId) return

    try {
      await compileAll(selectedProductId)
      
      // Refresh all compilation data
      const counts = await getCompilationCounts(selectedProductId)
      setCompilationCounts(prev => ({
        ...prev,
        [selectedProductId]: counts
      }))

      const [hasMarketing, hasMarketIntel, hasProductStrategy] = await Promise.all([
        hasCompiledContent(selectedProductId, 'marketing'),
        hasCompiledContent(selectedProductId, 'market-intel'),
        hasCompiledContent(selectedProductId, 'product-strategy')
      ])

      setHasCompiled(prev => ({
        ...prev,
        [selectedProductId]: {
          marketing: hasMarketing,
          marketIntel: hasMarketIntel,
          productStrategy: hasProductStrategy
        }
      }))
      
      console.log(`✅ All compilations completed for ${selectedProductId}`)
    } catch (error) {
      console.error(`❌ Compilation failed:`, error)
    }
  }

  if (productsLoading) {
    return <div>Loading products...</div>
  }

  if (products.length === 0) {
    return (
      <Card className="p-6">
        <p>No products found. Please populate the database first.</p>
      </Card>
    )
  }

  const selectedProduct = products.find(p => p.id === selectedProductId)
  const productCounts = compilationCounts[selectedProductId] || { marketing: 0, marketIntel: 0, productStrategy: 0 }
  const productHasCompiled = hasCompiled[selectedProductId] || { marketing: false, marketIntel: false, productStrategy: false }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Redis Compilation Control Panel
        </h2>

        {/* Product Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Product:</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.type})
              </option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <div className="mb-6 p-4 bg-gray-50 rounded">
            <h3 className="font-medium">{selectedProduct.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{selectedProduct.content.description}</p>
          </div>
        )}

        {/* Compilation Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Button
            onClick={() => handleCompile('marketing')}
            disabled={!selectedProductId || isCompiling[`${selectedProductId}-marketing`]}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            {isCompiling[`${selectedProductId}-marketing`] ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Compiling...
              </>
            ) : (
              'Compile Marketing'
            )}
          </Button>

          <Button
            onClick={() => handleCompile('market-intel')}
            disabled={!selectedProductId || isCompiling[`${selectedProductId}-market-intel`]}
            className="flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            {isCompiling[`${selectedProductId}-market-intel`] ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Compiling...
              </>
            ) : (
              'Compile Market Intel'
            )}
          </Button>

          <Button
            onClick={() => handleCompile('product-strategy')}
            disabled={!selectedProductId || isCompiling[`${selectedProductId}-product-strategy`]}
            className="flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            {isCompiling[`${selectedProductId}-product-strategy`] ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Compiling...
              </>
            ) : (
              'Compile Strategy'
            )}
          </Button>

          <Button
            onClick={handleCompileAll}
            disabled={!selectedProductId || isCompiling[`${selectedProductId}-all`]}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            {isCompiling[`${selectedProductId}-all`] ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Compiling All...
              </>
            ) : (
              'Compile All'
            )}
          </Button>
        </div>

        {/* Compilation Status */}
        {selectedProductId && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <h4 className="font-medium text-sm mb-2">Marketing</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Status:</span>
                  <span className={`text-xs font-medium ${
                    productHasCompiled.marketing ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {productHasCompiled.marketing ? 'Compiled' : 'Not compiled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Count:</span>
                  <span className="text-xs font-medium">{productCounts.marketing}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="font-medium text-sm mb-2">Market Intelligence</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Status:</span>
                  <span className={`text-xs font-medium ${
                    productHasCompiled.marketIntel ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {productHasCompiled.marketIntel ? 'Compiled' : 'Not compiled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Count:</span>
                  <span className="text-xs font-medium">{productCounts.marketIntel}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="font-medium text-sm mb-2">Product Strategy</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Status:</span>
                  <span className={`text-xs font-medium ${
                    productHasCompiled.productStrategy ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {productHasCompiled.productStrategy ? 'Compiled' : 'Not compiled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Count:</span>
                  <span className="text-xs font-medium">{productCounts.productStrategy}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Error Display */}
        {Object.entries(compilationErrors).map(([key, error]) => 
          error && (
            <div key={key} className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700 text-sm">
                <strong>Error ({key}):</strong> {error}
              </p>
            </div>
          )
        )}
      </Card>
    </div>
  )
}