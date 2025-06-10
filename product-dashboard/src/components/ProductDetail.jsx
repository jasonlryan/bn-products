import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

function ProductDetail() {
  const { productId } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    try {
      const response = await fetch('/marketing-content.json')
      if (!response.ok) {
        throw new Error('Failed to fetch marketing content')
      }
      const data = await response.json()
      const productData = data.products[productId]
      if (!productData) {
        throw new Error('Product not found')
      }
      setProduct(productData)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const renderContent = (content) => {
    if (!content) return null

    if (typeof content === 'string') {
      return (
        <div className="content-text">
          <pre style={{ 
            whiteSpace: 'pre-wrap', 
            fontFamily: 'inherit',
            fontSize: '0.95rem',
            lineHeight: '1.6',
            margin: 0
          }}>
            {content}
          </pre>
        </div>
      )
    }

    if (typeof content === 'object') {
      return (
        <div className="content-structured">
          {Object.entries(content).map(([key, value]) => (
            <div key={key} className="content-section">
              <h4 className="content-section-title">
                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h4>
              
              {Array.isArray(value) ? (
                value.length > 0 ? (
                  <ul className="content-list">
                    {value.map((item, index) => (
                      <li key={index}>
                        {typeof item === 'object' ? (
                          <div className="content-item">
                            {Object.entries(item).map(([subKey, subValue]) => (
                              <div key={subKey} className="content-subitem">
                                <strong>{subKey.replace(/_/g, ' ')}:</strong> {subValue}
                              </div>
                            ))}
                          </div>
                        ) : (
                          item
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">No items available</p>
                )
              ) : typeof value === 'object' ? (
                <div className="content-object">
                  {Object.entries(value).map(([subKey, subValue]) => (
                    <div key={subKey} className="content-subitem">
                      <strong>{subKey.replace(/_/g, ' ')}:</strong> {subValue}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="content-value">{value}</p>
              )}
            </div>
          ))}
        </div>
      )
    }

    return <p>{content}</p>
  }

  if (loading) {
    return <div className="loading">Loading product...</div>
  }

  if (error) {
    return <div className="error">Error: {error}</div>
  }

  return (
    <div className="product-detail">
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span className="breadcrumb-separator">›</span>
        <span>{product.name}</span>
      </div>

      {/* Product Hero Section */}
      <div className="product-hero">
        <div className="product-hero-content">
          <h1>{product.hero?.headline || product.name}</h1>
          {product.hero?.tagline && (
            <p className="product-tagline">{product.hero.tagline}</p>
          )}
          <p className="product-hero-description">
            {product.hero?.description || product.hero?.value_proposition || 'Innovative AI solution for modern businesses'}
          </p>
          
          <div className="product-hero-actions">
            <button className="cta-primary">Get Started</button>
            <button className="cta-secondary">Schedule Demo</button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="product-nav">
        <div className="product-nav-container">
          <button 
            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`nav-tab ${activeTab === 'features' ? 'active' : ''}`}
            onClick={() => setActiveTab('features')}
          >
            Features
          </button>
          <button 
            className={`nav-tab ${activeTab === 'use-cases' ? 'active' : ''}`}
            onClick={() => setActiveTab('use-cases')}
          >
            Use Cases
          </button>
          <button 
            className={`nav-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Full Details
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="product-content">
        {activeTab === 'overview' && (
          <div className="tab-content">
            <div className="overview-grid">
              {/* Benefits */}
              {product.benefits && product.benefits.length > 0 && (
                <div className="overview-section">
                  <h3>Key Benefits</h3>
                  <ul className="benefits-list">
                    {product.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Target Audience */}
              {product.target_audience && product.target_audience.length > 0 && (
                <div className="overview-section">
                  <h3>Perfect For</h3>
                  <div className="audience-cards">
                    {product.target_audience.map((audience, index) => (
                      <div key={index} className="audience-card">
                        <h4>{audience.name}</h4>
                        <p>{audience.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Competitive Advantages */}
              {product.competitive_advantages && product.competitive_advantages.length > 0 && (
                <div className="overview-section">
                  <h3>Why Choose Us</h3>
                  <ul className="advantages-list">
                    {product.competitive_advantages.map((advantage, index) => (
                      <li key={index}>{advantage}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="tab-content">
            <h3>Features & Capabilities</h3>
            {product.features && product.features.length > 0 ? (
              <div className="features-grid">
                {product.features.map((feature, index) => (
                  <div key={index} className="feature-card">
                    <h4>{feature}</h4>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">Feature details coming soon...</p>
            )}

            {/* Technical Specs */}
            {product.technical_specs && Object.keys(product.technical_specs).length > 0 && (
              <div className="specs-section">
                <h3>Technical Specifications</h3>
                {renderContent(product.technical_specs)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'use-cases' && (
          <div className="tab-content">
            <h3>Use Cases & Applications</h3>
            {product.use_cases && product.use_cases.length > 0 ? (
              <div className="use-cases-grid">
                {product.use_cases.map((useCase, index) => (
                  <div key={index} className="use-case-card">
                    <h4>{useCase.title}</h4>
                    <p className="use-case-user">{useCase.user_type}</p>
                    <p>{useCase.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">Use case examples coming soon...</p>
            )}

            {/* Demo Info */}
            {product.demo_info && Object.keys(product.demo_info).length > 0 && (
              <div className="demo-section">
                <h3>See It In Action</h3>
                {renderContent(product.demo_info)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="tab-content">
            <h3>Complete Product Information</h3>
            
            {product.all_details && Object.entries(product.all_details).map(([key, content]) => (
              content && (
                <div key={key} className="detail-section">
                  <h4 className="detail-title">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </h4>
                  <div className="detail-content">
                    {renderContent(content)}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="product-bottom-cta">
        <h3>Ready to get started with {product.name}?</h3>
        <p>Contact our team to learn more and schedule a personalized demo.</p>
        <div className="cta-buttons">
          <button className="cta-primary">Contact Sales</button>
          <button className="cta-secondary">Download Brochure</button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail 