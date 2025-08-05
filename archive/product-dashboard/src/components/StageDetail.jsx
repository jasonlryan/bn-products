import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

function StageDetail() {
  const { productId, stageCategory, stageName } = useParams()
  const [stage, setStage] = useState(null)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStage()
  }, [productId, stageCategory, stageName])

  const fetchStage = async () => {
    try {
      const response = await fetch('/product-config.json')
      if (!response.ok) {
        throw new Error('Failed to fetch product configuration')
      }
      const data = await response.json()
      const productData = data.products[productId]
      if (!productData) {
        throw new Error('Product not found')
      }
      const stageData = productData.stages[stageCategory]?.[stageName]
      if (!stageData) {
        throw new Error('Stage not found')
      }
      setProduct(productData)
      setStage(stageData)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const getStageTitle = (stageName) => {
    const titles = {
      manifesto: 'Product Manifesto',
      functional_spec: 'Functional Specification',
      audience_icps: 'Audience ICPs',
      user_stories: 'User Stories',
      competitor_sweep: 'Competitor Analysis',
      tam_sizing: 'TAM Sizing',
      prd_skeleton: 'PRD Skeleton',
      ui_prompt: 'UI Prompt',
      generate_screens: 'Generate Screens',
      landing_page_copy: 'Landing Page Copy',
      key_messages: 'Key Messages',
      investor_deck: 'Investor Deck',
      demo_script: 'Demo Script',
      slide_headlines: 'Slide Headlines',
      qa_prep: 'Q&A Preparation'
    }
    return titles[stageName] || stageName
  }

  const renderContent = (content) => {
    if (!content) return null

    // Handle raw content
    if (content.raw_content) {
      return (
        <div className="card">
          <h4>Content</h4>
          <pre style={{ 
            whiteSpace: 'pre-wrap', 
            fontFamily: 'inherit',
            fontSize: '0.9rem',
            lineHeight: '1.6',
            margin: 0
          }}>
            {content.raw_content}
          </pre>
        </div>
      )
    }

    // Handle structured content
    return (
      <div className="card">
        <h4>Content</h4>
        {Object.entries(content).map(([key, value]) => (
          <div key={key} style={{ marginBottom: '1.5rem' }}>
            <h5 style={{ 
              textTransform: 'capitalize', 
              color: '#0700FF',
              marginBottom: '0.5rem',
              fontSize: '1rem'
            }}>
              {key.replace(/_/g, ' ')}
            </h5>
            
            {Array.isArray(value) ? (
              value.length > 0 ? (
                <ul style={{ paddingLeft: '1.5rem' }}>
                  {value.map((item, index) => (
                    <li key={index} style={{ marginBottom: '0.5rem' }}>
                      {typeof item === 'object' ? (
                        <div>
                          {Object.entries(item).map(([subKey, subValue]) => (
                            <div key={subKey} style={{ marginBottom: '0.25rem' }}>
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
                <p className="muted">No items</p>
              )
            ) : typeof value === 'object' ? (
              <div style={{ paddingLeft: '1rem' }}>
                {Object.entries(value).map(([subKey, subValue]) => (
                  <div key={subKey} style={{ marginBottom: '0.5rem' }}>
                    <strong>{subKey.replace(/_/g, ' ')}:</strong> {subValue}
                  </div>
                ))}
              </div>
            ) : (
              <p>{value}</p>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return <div className="loading">Loading stage...</div>
  }

  if (error) {
    return <div className="error">Error: {error}</div>
  }

  return (
    <div>
      <div className="breadcrumb">
        <Link to="/">Dashboard</Link>
        <span className="breadcrumb-separator">›</span>
        <Link to={`/product/${productId}`}>{product.name}</Link>
        <span className="breadcrumb-separator">›</span>
        <span>{getStageTitle(stageName)}</span>
      </div>

      <div className="mb-2">
        <h2>{getStageTitle(stageName)}</h2>
        <p className="muted">{product.name}</p>
      </div>

      {/* Metadata */}
      {stage.file_metadata && (
        <div className="card mb-2">
          <h4>Metadata</h4>
          <div className="grid grid-2" style={{ gap: '1rem' }}>
            <div>
              <strong>Status:</strong>
              <span className={`status ${stage.file_metadata.status || 'draft'}`} style={{ marginLeft: '0.5rem' }}>
                {stage.file_metadata.status || 'draft'}
              </span>
            </div>
            
            {stage.file_metadata.generated_date && (
              <div>
                <strong>Generated:</strong> {new Date(stage.file_metadata.generated_date).toLocaleString()}
              </div>
            )}
            
            {stage.file_metadata.model && (
              <div>
                <strong>Model:</strong> {stage.file_metadata.model}
              </div>
            )}
            
            {stage.file_metadata.file_path && (
              <div>
                <strong>File:</strong> {stage.file_metadata.file_path}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generation Metadata */}
      {stage.generation_metadata && (
        <div className="card mb-2">
          <h4>Generation Details</h4>
          
          {stage.generation_metadata.prompt_used && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>Prompt:</strong>
              <p style={{ 
                marginTop: '0.5rem',
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                fontStyle: 'italic'
              }}>
                {stage.generation_metadata.prompt_used}
              </p>
            </div>
          )}
          
          {stage.generation_metadata.context_used && stage.generation_metadata.context_used.length > 0 && (
            <div>
              <strong>Context Used:</strong>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                {stage.generation_metadata.context_used.map((context, index) => (
                  <li key={index} style={{ marginBottom: '0.25rem' }}>
                    {context}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {stage.content && renderContent(stage.content)}

      {!stage.content && (
        <div className="card text-center">
          <p className="muted">No content available for this stage.</p>
        </div>
      )}
    </div>
  )
}

export default StageDetail 