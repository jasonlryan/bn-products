import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, MessageSquare } from 'lucide-react';
import { getAllProducts, getAllServices } from '../config';
import { Card, Button } from '../components/ui';
import { cleanProductName, cleanDescription } from '../utils/textCleaner';
import FeedbackWidget from '../components/FeedbackWidget';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'services'>(
    'products'
  );
  const navigate = useNavigate();

  // Get data from new configuration
  const products = getAllProducts();
  const services = getAllServices();

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleServiceClick = (serviceId: string) => {
    navigate(`/service/${serviceId}`);
  };

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

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(activeTab === 'products' ? products : services).map((item) => (
            <Card
              key={item.id}
              hover={true}
              className="group cursor-pointer"
              onClick={() =>
                activeTab === 'products'
                  ? handleProductClick(item.id)
                  : handleServiceClick(item.id)
              }
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
                  {item.features
                    .slice(0, 3)
                    .map((feature: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200"
                      >
                        {feature}
                      </span>
                    ))}
                  {item.features.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-200">
                      +{item.features.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Key Benefits */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Key Benefits:
                </h4>
                <ul className="space-y-1">
                  {item.benefits
                    .slice(0, 2)
                    .map((benefit: string, index: number) => (
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
                  {item.benefits.length > 2 && (
                    <li className="flex items-start space-x-2 text-xs text-gray-500 italic">
                      <span className="text-gray-400 font-bold mt-0.5 flex-shrink-0">
                        +
                      </span>
                      <span className="leading-relaxed">
                        +{item.benefits.length - 2} more benefits
                      </span>
                    </li>
                  )}
                </ul>
              </div>

              {/* CTA */}
              <div className="pt-4 border-t border-gray-100">
                <span className="text-primary font-medium text-sm group-hover:text-primary-dark transition-colors">
                  Learn More →
                </span>
              </div>
            </Card>
          ))}
        </div>
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
      <FeedbackWidget page="dashboard" />
    </div>
  );
}
