import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Dashboard() {
  const [products, setProducts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/marketing-content.json')
      if (!response.ok) {
        throw new Error('Failed to fetch marketing content')
      }
      const data = await response.json()
      setProducts(data.products)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading products...</div>
  }

  if (error) {
    return <div className="error">Error: {error}</div>
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>AI-Powered Business Solutions</h1>
          <p className="hero-subtitle">
            Transform your business with our suite of 8 cutting-edge AI products. 
            From strategic consulting to intelligent dashboards, we've got everything you need to stay ahead.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">{Object.keys(products).length}</span>
              <span className="stat-label">AI Products</span>
            </div>
            <div className="stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Companies Served</span>
            </div>
            <div className="stat">
              <span className="stat-number">95%</span>
              <span className="stat-label">Success Rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-section">
        <h2>Our Product Suite</h2>
        <p className="section-subtitle">
          Choose the perfect AI solution for your business needs
        </p>

        <div className="grid grid-2">
          {Object.entries(products).map(([productId, product]) => (
            <Link key={productId} to={`/product/${productId}`} className="product-card">
              <div className="product-header">
                <h3>{product.name}</h3>
                <span className="product-type">{product.type}</span>
              </div>
              
              <div className="product-description">
                <p>{product.hero?.description || product.hero?.value_proposition || 'Innovative AI solution for modern businesses'}</p>
              </div>

              {/* Key Benefits */}
              {product.benefits && product.benefits.length > 0 && (
                <div className="product-benefits">
                  <h4>Key Benefits:</h4>
                  <ul>
                    {product.benefits.slice(0, 3).map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Features Preview */}
              {product.features && product.features.length > 0 && (
                <div className="product-features">
                  <div className="features-preview">
                    {product.features.slice(0, 2).map((feature, index) => (
                      <span key={index} className="feature-tag">{feature}</span>
                    ))}
                    {product.features.length > 2 && (
                      <span className="feature-tag more">+{product.features.length - 2} more</span>
                    )}
                  </div>
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