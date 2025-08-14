import { X } from 'lucide-react'
import type { Product } from '../../types/product'
import { cleanProductName, cleanDescription } from '../../utils/textCleaner'
import Button from './Button'

interface QuickViewModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onViewDetails: (productId: string) => void
}

export function QuickViewModal({ 
  product, 
  isOpen, 
  onClose,
  onViewDetails 
}: QuickViewModalProps) {
  if (!isOpen || !product) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">
                {cleanProductName(product.name)}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 space-y-6">
              {/* Type and Price */}
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wide ${
                    product.type === 'PRODUCT'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {product.type}
                </span>
                <span className="text-2xl font-bold text-primary">
                  {product.pricing?.display || 'Contact for Pricing'}
                </span>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {cleanDescription(product.content.description)}
                </p>
              </div>

              {/* Perfect For */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Perfect For</h3>
                <p className="text-gray-600 leading-relaxed">
                  {cleanDescription(product.content.perfectFor)}
                </p>
              </div>

              {/* Key Features */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Key Features</h3>
                <div className="flex flex-wrap gap-2">
                  {product.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Key Benefits</h3>
                <ul className="space-y-2">
                  {product.benefits.map((benefit, index) => (
                    <li
                      key={index}
                      className="flex items-start space-x-2 text-gray-600"
                    >
                      <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">
                        ✓
                      </span>
                      <span className="leading-relaxed">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What Client is Buying */}
              {product.content.whatClientIsBuying && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">What You're Getting</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {cleanDescription(product.content.whatClientIsBuying)}
                  </p>
                </div>
              )}

              {/* Primary Deliverables */}
              {product.content.primaryDeliverables && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Deliverables</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {cleanDescription(product.content.primaryDeliverables)}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
              <Button
                variant="ghost"
                onClick={onClose}
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  onViewDetails(product.id)
                  onClose()
                }}
              >
                View Full Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}