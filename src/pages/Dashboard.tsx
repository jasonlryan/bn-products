import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, MessageSquare } from 'lucide-react';
import { productService } from '../services/storage/productService';
import { getAllProducts, getAllServices } from '../config';
import { Card, Button, SearchInput, QuickViewModal } from '../components/ui';
import { cleanProductName, cleanDescription } from '../utils/textCleaner';
import FeedbackWidget from '../components/FeedbackWidget';
import type { Product } from '../types/product';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'services'>(
    'products'
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const navigate = useNavigate();

  // Load data from Redis on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log(
          '🔄 [Dashboard] Loading products and services from Redis...'
        );

        const [productsData, servicesData] = await Promise.all([
          productService.getAllProducts(),
          productService.getAllServices(),
        ]);

        setProducts(productsData);
        setServices(servicesData);
        
        console.log(
          `✅ [Dashboard] Loaded ${productsData.length} products and ${servicesData.length} services`
        );
      } catch (error) {
        console.error('❌ [Dashboard] Error loading data:', error);
        // Fallback to static config if everything fails
        console.log('🔄 [Dashboard] Falling back to static config...');
        const fallbackProducts = getAllProducts();
        const fallbackServices = getAllServices();
        setProducts(fallbackProducts);
        setServices(fallbackServices);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleServiceClick = (serviceId: string) => {
    navigate(`/service/${serviceId}`);
  };

  // Filter products/services based on search query
  const filteredItems = useMemo(() => {
    const items = activeTab === 'products' ? products : services;
    
    if (!searchQuery) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter((item) => {
      const matchesName = cleanProductName(item.name).toLowerCase().includes(query);
      const matchesDescription = cleanDescription(item.content.description).toLowerCase().includes(query);
      const matchesPerfectFor = cleanDescription(item.content.perfectFor).toLowerCase().includes(query);
      const matchesFeatures = item.features.some(feature => feature.toLowerCase().includes(query));
      const matchesBenefits = item.benefits.some(benefit => benefit.toLowerCase().includes(query));
      
      return matchesName || matchesDescription || matchesPerfectFor || matchesFeatures || matchesBenefits;
    });
  }, [activeTab, products, services, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products and services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img
                src="/bn-logo.png"
                alt="BrilliantNoise"
                className="h-8 w-auto"
                onError={(e) => {
                  console.log('Logo failed to load');
                  e.currentTarget.style.display = 'none';
                }}
              />
              <h1 className="text-xl font-semibold text-gray-900">
                Product Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/admin')}
                className="text-gray-500 hover:text-gray-700"
                title="Admin Panel"
              >
                <Settings className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-primary text-white py-16 overflow-hidden">
        {/* Simple gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-dark"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Our AI Products & Services
          </h1>
          <p className="text-xl opacity-90">
            Everything the Brilliant Noise team needs to understand and sell our
            AI offerings
          </p>
        </div>
      </section>

      {/* Tab Navigation and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Input */}
        <div className="mb-6">
          <SearchInput
            onSearch={setSearchQuery}
            placeholder={`Search ${activeTab}...`}
            className="max-w-md mx-auto"
          />
        </div>

        <div className="flex space-x-1 bg-white p-1 rounded-lg mb-8 max-w-md mx-auto shadow-sm border border-gray-200">
          <Button
            variant={activeTab === 'products' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('products')}
            className="flex-1"
          >
            Products ({products.length})
          </Button>
          <Button
            variant={activeTab === 'services' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('services')}
            className="flex-1"
          >
            Services ({services.length})
          </Button>
        </div>

        {/* Product/Service Grid */}
        {filteredItems.length === 0 && searchQuery ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg mb-2">
              No {activeTab} found matching "{searchQuery}"
            </p>
            <p className="text-gray-400 text-sm mb-4">
              Try searching for features, benefits, or keywords
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-primary hover:text-primary-dark font-medium"
            >
              Clear search
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No {activeTab} available
            </p>
          </div>
        ) : (
          <>
            {/* Results Counter */}
            <div className="mb-6 text-center">
              <p className="text-sm text-gray-600">
                {searchQuery ? (
                  <>
                    Showing <span className="font-semibold">{filteredItems.length}</span> of {activeTab === 'products' ? products.length : services.length} {activeTab}
                    {searchQuery && (
                      <>
                        {' '}matching "<span className="font-semibold">{searchQuery}</span>"
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <span className="font-semibold">{filteredItems.length}</span> {activeTab} available
                  </>
                )}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredItems.map((item) => (
            <Card
              key={item.id}
              hover={true}
              className="group cursor-pointer"
            >
              {/* Product Header */}
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  {cleanProductName(item.name)}
                </h3>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wide ${
                      item.type === 'PRODUCT'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {item.type}
                  </span>
                  <span className="bg-white border border-gray-200 rounded-lg px-3 py-1 text-sm font-bold text-primary">
                    {item.pricing?.display || 'Contact for Pricing'}
                  </span>
                </div>
              </div>

              {/* Product Description */}
              <div className="mb-4">
                <p className="text-gray-600 text-sm leading-relaxed">
                  {cleanDescription(item.content.description)}
                </p>
              </div>

              {/* Perfect For Section */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  Perfect For:
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {cleanDescription(item.content.perfectFor)}
                </p>
              </div>

              {/* Key Features */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Key Features:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {item.features.map((feature: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Benefits */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Key Benefits:
                </h4>
                <ul className="space-y-1">
                  {item.benefits.map((benefit: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-start space-x-2 text-xs text-gray-600"
                    >
                      <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">
                        ✓
                      </span>
                      <span className="leading-relaxed">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuickViewProduct(item);
                    setIsQuickViewOpen(true);
                  }}
                  className="text-primary font-medium text-sm hover:text-primary-dark transition-colors"
                >
                  Quick View
                </button>
                <button
                  onClick={() =>
                    activeTab === 'products'
                      ? handleProductClick(item.id)
                      : handleServiceClick(item.id)
                  }
                  className="text-primary font-medium text-sm hover:text-primary-dark transition-colors"
                >
                  Full Details →
                </button>
              </div>
            </Card>
          ))}
            </div>
          </>
        )}
      </div>

      {/* Feedback CTA Footer */}
      <footer className="bg-primary py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-semibold text-white mb-4">
            Help Us Improve
          </h3>
          <p className="text-lg text-white opacity-90 mb-6 max-w-2xl mx-auto">
            Share your thoughts and suggestions about this page.
          </p>
          <button
            onClick={() => {
              // Trigger the feedback widget
              const feedbackButton = document.querySelector(
                '[aria-label="Give feedback"]'
              ) as HTMLButtonElement;
              if (feedbackButton) {
                feedbackButton.click();
              }
            }}
            className="inline-flex items-center px-6 py-3 bg-white text-primary font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Give Feedback
          </button>
        </div>
      </footer>

      {/* Hidden Feedback Widget */}
      <FeedbackWidget 
        productName="Dashboard"
        activeTab="Dashboard"
      />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={() => {
          setIsQuickViewOpen(false);
          setQuickViewProduct(null);
        }}
        onViewDetails={(productId) => {
          navigate(`/${activeTab === 'products' ? 'product' : 'service'}/${productId}`);
        }}
      />
    </div>
  );
}
