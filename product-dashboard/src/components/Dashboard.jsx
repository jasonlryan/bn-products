import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { parseCSVToProducts, csvData } from '../utils/csvParser'

function Dashboard() {
  const [products, setProducts] = useState({})
  const [services, setServices] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('products')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Parse CSV data
      const { products: parsedProducts, services: parsedServices } = parseCSVToProducts(csvData)
      setProducts(parsedProducts)
      setServices(parsedServices)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading products and services...</div>
  }

  if (error) {
    return <div className="error">Error: {error}</div>
  }

  const currentItems = activeTab === 'products' ? products : services
  const totalCount = Object.keys(products).length + Object.keys(services).length

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>AI-Powered Business Solutions</h1>
          <p className="hero-subtitle">
            Transform your business with our comprehensive suite of AI products and services. 
            From strategic consulting to intelligent dashboards, we've got everything you need to stay ahead.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">{Object.keys(products).length}</span>
              <span className="stat-label">AI Products</span>
            </div>
            <div className="stat">
              <span className="stat-number">{Object.keys(services).length}</span>
              <span className="stat-label">AI Services</span>
            </div>
            <div className="stat">
              <span className="stat-number">95%</span>
              <span className="stat-label">Success Rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <div className="tab-container">
          <button 
            className={`tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Products ({Object.keys(products).length})
          </button>
          <button 
            className={`tab ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            Services ({Object.keys(services).length})
          </button>
        </div>
      </div>

      {/* Products/Services Grid */}
      <div className="products-section">
        <h2>Our {activeTab === 'products' ? 'Product' : 'Service'} Suite</h2>
        <p className="section-subtitle">
          Choose the perfect AI {activeTab === 'products' ? 'product' : 'service'} for your business needs
        </p>

        <div className="grid grid-2">
          {Object.entries(currentItems).map(([itemId, item]) => (
            <Link key={itemId} to={`/product/${itemId}`} className="product-card">
              <div className="product-header">
                <h3>{item.name}</h3>
                <div className="product-badges">
                  <span className={`product-type ${item.type.toLowerCase()}`}>{item.type}</span>
                  {item.price && (
                    <span className="product-price">{item.price.split('\n')[0]}</span>
                  )}
                </div>
              </div>
              
              <div className="product-description">
                <p>{item.description || item.hero?.description || item.hero?.value_proposition || 'Innovative AI solution for modern businesses'}</p>
              </div>

              {/* Perfect For */}
              {item.perfectFor && (
                <div className="product-perfect-for">
                  <h4>Perfect For:</h4>
                  <p>{item.perfectFor}</p>
                </div>
              )}

              {/* Key Features */}
              {item.features && item.features.length > 0 && (
                <div className="product-features">
                  <h4>Key Features:</h4>
                  <div className="features-preview">
                    {item.features.slice(0, 3).map((feature, index) => (
                      <span key={index} className="feature-tag">{feature}</span>
                    ))}
                    {item.features.length > 3 && (
                      <span className="feature-tag more">+{item.features.length - 3} more</span>
                    )}
                  </div>
                </div>
              )}

              {/* Benefits Preview */}
              {item.benefits && item.benefits.length > 0 && (
                <div className="product-benefits">
                  <h4>Key Benefits:</h4>
                  <ul>
                    {item.benefits.slice(0, 2).map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                    {item.benefits.length > 2 && (
                      <li className="more-benefits">+{item.benefits.length - 2} more benefits</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="product-cta">
                <span className="cta-text">Learn More →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="cta-section">
        <h2>Ready to Transform Your Business?</h2>
        <p>Get started with our AI solutions today and see immediate results.</p>
        <div className="cta-buttons">
          <button className="cta-primary">Schedule Demo</button>
          <button className="cta-secondary">Contact Sales</button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 