import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Settings,
  Users,
  TrendingUp,
  Megaphone,
  Sliders,
  Home,
  FileText,
} from 'lucide-react';
import { getProductById, getAllProductsAndServices } from '../config';
import { Button } from '../components/ui';
import EditableSection from '../components/EditableSection';
import AIConfigModal from '../components/AIConfigModal';
import PanelConfigModal from '../components/PanelConfigModal';
import MarkdownRenderer from '../components/MarkdownRenderer';
import DraggableTabPanel from '../components/DraggableTabPanel';
import { LandingPageView } from '../components/landing/LandingPageView';
import CompiledMarketingView from '../components/marketing/CompiledMarketingView';
import CompiledMarketIntelligenceView from '../components/market-intelligence/CompiledMarketIntelligenceView';
import CompiledProductStrategyView from '../components/product-strategy/CompiledProductStrategyView';
import { marketingCompiler } from '../services/marketingCompiler';
import { marketIntelligenceCompiler } from '../services/marketIntelligenceCompiler';
import { productStrategyCompiler } from '../services/productStrategyCompiler';
import { functionalSpecService } from '../services/functionalSpecService';
import { productToCSVProduct } from '../utils/productToCsvAdapter';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { panelConfigManager } from '../utils/panelConfig';

type ViewType =
  | 'home'
  | 'functional-spec'
  | 'marketing-sales'
  | 'market-intelligence'
  | 'product-strategy'
  | 'investment-growth';

interface ContentPanel {
  id: string;
  title: string;
  content: React.ReactNode;
}

export default function ProductPage() {
  const { productId, serviceId } = useParams();
  const navigate = useNavigate();
  const id = productId || serviceId;

  const product = getProductById(id!);
  const allProducts = getAllProductsAndServices();
  const currentIndex = allProducts.findIndex((p) => p.id === id);
  const totalProducts = allProducts.length;

  const [productData, setProductData] = useState(product);
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [showPanelConfig, setShowPanelConfig] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [contentPanels, setContentPanels] = useState<ContentPanel[]>([]);
  const [configVersion, setConfigVersion] = useState(0); // Force re-renders when config changes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoadingPanels, setIsLoadingPanels] = useState(false);
  const [functionalSpecData, setFunctionalSpecData] = useState<{
    content: string;
    title: string;
    lastModified: string;
  } | null>(null);
  const [isLoadingFunctionalSpec, setIsLoadingFunctionalSpec] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Listen for panel config changes
  useEffect(() => {
    const handleConfigChange = () => {
      setConfigVersion((prev) => prev + 1);
    };

    window.addEventListener('panelConfigChanged', handleConfigChange);
    return () =>
      window.removeEventListener('panelConfigChanged', handleConfigChange);
  }, []);

  const loadFunctionalSpec = async () => {
    if (!productData) return;

    setIsLoadingFunctionalSpec(true);
    try {
      const specData = await functionalSpecService.getFunctionalSpec(
        productData.id
      );
      if (specData) {
        setFunctionalSpecData({
          content: specData.content,
          title: specData.title,
          lastModified: specData.lastModified,
        });
      } else {
        // Fallback to config data
        const configContent =
          productData.richContent?.functionalSpec?.sections?.[
            'Generated Output'
          ] || '';
        setFunctionalSpecData({
          content: configContent,
          title:
            productData.richContent?.functionalSpec?.title ||
            'Functional Specification',
          lastModified: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error loading functional spec:', error);
      // Fallback to config data
      const configContent =
        productData.richContent?.functionalSpec?.sections?.[
          'Generated Output'
        ] || '';
      setFunctionalSpecData({
        content: configContent,
        title:
          productData.richContent?.functionalSpec?.title ||
          'Functional Specification',
        lastModified: new Date().toISOString(),
      });
    } finally {
      setIsLoadingFunctionalSpec(false);
    }
  };

  // Load Functional Spec when functional-spec view is active
  useEffect(() => {
    if (activeView === 'functional-spec' && productData) {
      loadFunctionalSpec();
    }
  }, [activeView, productData]);

  // Generate panels when view or product changes
  useEffect(() => {
    const loadPanels = async () => {
      if (!productData) return;

      setIsLoadingPanels(true);
      try {
        console.log(
          `🔄 [ProductPage] Loading panels for view: ${activeView}, product: ${productData.id}`
        );
        const panels = await generateContentPanels(activeView, productData);
        const orderedPanels = applyPanelOrder(panels);
        setContentPanels(orderedPanels);
        console.log(
          `✅ [ProductPage] Loaded ${panels.length} panels for ${activeView}`
        );
      } catch (error) {
        console.error(`❌ [ProductPage] Error loading panels:`, error);
        setContentPanels([]);
      } finally {
        setIsLoadingPanels(false);
      }
    };

    loadPanels();
  }, [activeView, productData, configVersion]);

  // Generate content panels based on the active view
  const generateContentPanels = async (
    view: ViewType,
    productParam: any
  ): Promise<ContentPanel[]> => {
    if (!productParam) return [];

    switch (view) {
      case 'home':
        return generateHomePanels();
      case 'functional-spec':
        return generateFunctionalSpecPanels();
      case 'marketing-sales':
        return await generateMarketingSalesPanels(productParam);
      case 'market-intelligence':
        return await generateMarketIntelligencePanels(productParam);
      case 'product-strategy':
        return await generateProductStrategyPanels(productParam);
      case 'investment-growth':
        return generateInvestmentGrowthPanels(productParam);
      default:
        return [];
    }
  };

  // Apply saved panel order from config
  const applyPanelOrder = (panels: ContentPanel[]): ContentPanel[] => {
    if (!productData?.id) return panels;

    const defaultPanelIds = panels.map((p) => p.id);
    const orderedIds = panelConfigManager.getOrderedPanelIds(
      productData.id,
      activeView,
      defaultPanelIds
    );

    // Reorder panels according to saved configuration
    const orderedPanels = orderedIds
      .map((id) => panels.find((p) => p.id === id))
      .filter(Boolean) as ContentPanel[];

    // Add any new panels that weren't in the saved order
    const newPanels = panels.filter((p) => !orderedIds.includes(p.id));

    return [...orderedPanels, ...newPanels];
  };

  const generateHomePanels = (): ContentPanel[] => {
    // Home tab doesn't use panels - it renders the landing page directly
    return [];
  };

  const generateFunctionalSpecPanels = (): ContentPanel[] => {
    // Functional spec tab doesn't use panels - it renders directly
    return [];
  };

  const generateMarketingSalesPanels = async (
    product: any
  ): Promise<ContentPanel[]> => {
    try {
      // Check if marketing page has been compiled and count > 0
      const compilationCount = await marketingCompiler.getCompilationCount(
        product.id
      );
      const hasCompiledPage = await marketingCompiler.hasCompiledPage(
        product.id
      );

      console.log(
        `🔍 [ProductPage] Marketing compilation check for ${product.id}:`,
        {
          compilationCount,
          hasCompiledPage,
          productId: product.id,
        }
      );

      // If compiled content exists, ALWAYS show it instead of raw panels
      if (compilationCount > 0 && hasCompiledPage) {
        // Show compiled marketing view as a single panel
        const compiledPage = await marketingCompiler.loadCompiledPage(
          product.id
        );
        if (compiledPage) {
          console.log(
            `✅ [ProductPage] Loading compiled marketing page for ${product.id}`,
            {
              compiledPageId: compiledPage.id,
              compiledAt: compiledPage.compiledAt,
              contentSections: Object.keys(compiledPage.content),
            }
          );
          return [
            {
              id: 'compiled-marketing',
              title: 'Compiled Marketing Page',
              content: <CompiledMarketingView compiledPage={compiledPage} />,
            },
          ];
        } else {
          console.warn(
            `⚠️ [ProductPage] Compilation exists but failed to load for ${product.id}`
          );
        }
      } else {
        console.log(
          `ℹ️ [ProductPage] No compiled marketing content found for ${product.id}, showing raw panels`
        );
      }
    } catch (error) {
      console.error(
        `❌ [ProductPage] Error checking marketing compilation for ${product.id}:`,
        error
      );
    }

    // If not compiled, show raw input panels
    const panels: ContentPanel[] = [];

    // Key Messages
    if (product.richContent?.keyMessages) {
      panels.push({
        id: 'key-messages',
        title: 'Key Messages',
        content: (
          <EditableSection
            title="Key Messages"
            onSave={(content) => console.log('Updated key messages:', content)}
            initialContent={
              product.richContent.keyMessages.sections?.['Generated Output'] ||
              ''
            }
            placeholder="Enter key messages..."
            isTextArea
            contentType="description"
            productContext={product}
          >
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
              <MarkdownRenderer
                content={
                  product.richContent.keyMessages.sections?.[
                    'Generated Output'
                  ] || ''
                }
              />
            </div>
          </EditableSection>
        ),
      });
    }

    // Demo Script
    if (product.richContent?.demoScript) {
      panels.push({
        id: 'demo-script',
        title: 'Demo Script',
        content: (
          <EditableSection
            title="Demo Script"
            onSave={(content) => console.log('Updated demo script:', content)}
            initialContent={
              product.richContent.demoScript.sections?.['Generated Output'] ||
              ''
            }
            placeholder="Enter demo script..."
            isTextArea
            contentType="description"
            productContext={product}
          >
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
              <MarkdownRenderer
                content={
                  product.richContent.demoScript.sections?.[
                    'Generated Output'
                  ] || ''
                }
              />
            </div>
          </EditableSection>
        ),
      });
    }

    // Slide Headlines
    if (product.richContent?.slideHeadlines) {
      panels.push({
        id: 'slide-headlines',
        title: 'Slide Headlines',
        content: (
          <EditableSection
            title="Slide Headlines"
            onSave={(content) =>
              console.log('Updated slide headlines:', content)
            }
            initialContent={
              product.richContent.slideHeadlines.sections?.[
                'Generated Output'
              ] || ''
            }
            placeholder="Enter slide headlines..."
            isTextArea
            contentType="description"
            productContext={product}
          >
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6">
              <MarkdownRenderer
                content={
                  product.richContent.slideHeadlines.sections?.[
                    'Generated Output'
                  ] || ''
                }
              />
            </div>
          </EditableSection>
        ),
      });
    }

    // Q&A Prep
    if (product.richContent?.qaPrep) {
      panels.push({
        id: 'qa-prep',
        title: 'Q&A Preparation',
        content: (
          <EditableSection
            title="Q&A Preparation"
            onSave={(content) => console.log('Updated Q&A prep:', content)}
            initialContent={
              product.richContent.qaPrep.sections?.['Generated Output'] || ''
            }
            placeholder="Enter Q&A preparation content..."
            isTextArea
            contentType="description"
            productContext={product}
          >
            <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-lg p-6">
              <MarkdownRenderer
                content={
                  product.richContent.qaPrep.sections?.['Generated Output'] ||
                  ''
                }
                className="max-h-96 overflow-y-auto"
              />
            </div>
          </EditableSection>
        ),
      });
    }

    return panels;
  };

  const generateMarketIntelligencePanels = async (
    product: any
  ): Promise<ContentPanel[]> => {
    try {
      // Check if market intelligence page has been compiled and count > 0
      const compilationCount =
        await marketIntelligenceCompiler.getCompilationCount(product.id);
      const hasCompiledPage = await marketIntelligenceCompiler.hasCompiledPage(
        product.id
      );

      console.log(
        `🔍 [ProductPage] Market Intelligence compilation check for ${product.id}:`,
        {
          compilationCount,
          hasCompiledPage,
          productId: product.id,
        }
      );

      // If compiled content exists, ALWAYS show it instead of raw panels
      if (compilationCount > 0 && hasCompiledPage) {
        // Show compiled market intelligence view as a single panel
        const compiledPage = await marketIntelligenceCompiler.loadCompiledPage(
          product.id
        );
        if (compiledPage) {
          console.log(
            `✅ [ProductPage] Loading compiled market intelligence page for ${product.id}`,
            {
              compiledPageId: compiledPage.id,
              compiledAt: compiledPage.compiledAt,
              contentSections: Object.keys(compiledPage.content),
            }
          );
          return [
            {
              id: 'compiled-market-intelligence',
              title: 'Compiled Market Intelligence',
              content: (
                <CompiledMarketIntelligenceView compiledPage={compiledPage} />
              ),
            },
          ];
        } else {
          console.warn(
            `⚠️ [ProductPage] Market Intelligence compilation exists but failed to load for ${product.id}`
          );
        }
      } else {
        console.log(
          `ℹ️ [ProductPage] No compiled market intelligence content found for ${product.id}, showing raw panels`
        );
      }
    } catch (error) {
      console.error(
        `❌ [ProductPage] Error checking market intelligence compilation for ${product.id}:`,
        error
      );
    }

    // If not compiled, show raw input panels
    const panels: ContentPanel[] = [];

    // Customer Profiles
    const audienceICPs = product.richContent?.audienceICPs
      ? parseAudienceICPs(product.richContent.audienceICPs)
      : [];

    if (audienceICPs.length > 0) {
      panels.push({
        id: 'customer-profiles',
        title: 'Customer Profiles',
        content: (
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
            {audienceICPs.map((profile: any, index: number) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200"
              >
                <EditableSection
                  title={`Customer Profile ${index + 1}`}
                  onSave={(content) =>
                    console.log(`Updated customer profile ${index}:`, content)
                  }
                  initialContent={profile.profile}
                  placeholder="Enter customer profile..."
                  isTextArea
                  contentType="idealClient"
                  productContext={product}
                >
                  <div className="mb-4">
                    <h3 className="font-bold text-lg text-blue-900 mb-2">
                      Profile
                    </h3>
                    <MarkdownRenderer content={profile.profile} />
                  </div>
                </EditableSection>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">
                      Motivations
                    </h4>
                    <MarkdownRenderer content={profile.motivations} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">
                      Pain Points
                    </h4>
                    <MarkdownRenderer content={profile.painPoints} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">
                      Success Looks Like
                    </h4>
                    <MarkdownRenderer content={profile.successLooksLike} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ),
      });
    }

    // Competitive Analysis
    const competitorAnalysis = product.richContent?.competitorAnalysis
      ? parseCompetitorAnalysis(product.richContent.competitorAnalysis)
      : [];

    if (competitorAnalysis.length > 0) {
      panels.push({
        id: 'competitive-analysis',
        title: 'Competitive Analysis',
        content: (
          <div className="space-y-6">
            {competitorAnalysis.map((competitor: any, index: number) => (
              <div
                key={index}
                className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-6 border border-gray-200"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 mb-3">
                      {competitor.name}
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">
                          Value Proposition
                        </h4>
                        <MarkdownRenderer
                          content={competitor.valueProposition}
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-700 mb-1">
                          Strengths
                        </h4>
                        <ul className="text-gray-600 text-sm space-y-1">
                          {competitor.strengths.map(
                            (strength: string, i: number) => (
                              <li key={i} className="flex items-start">
                                <span className="text-green-500 mr-2">+</span>
                                <MarkdownRenderer content={strength} />
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-red-700 mb-1">
                        Weaknesses
                      </h4>
                      <ul className="text-gray-600 text-sm space-y-1">
                        {competitor.weaknesses.map(
                          (weakness: string, i: number) => (
                            <li key={i} className="flex items-start">
                              <span className="text-red-500 mr-2">-</span>
                              <MarkdownRenderer content={weakness} />
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-700 mb-1">
                        Gap We Exploit
                      </h4>
                      <div className="text-gray-600 text-sm bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                        <MarkdownRenderer content={competitor.gapWeExploit} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ),
      });
    }

    // Market Opportunity - keeping this as the primary location
    if (product.richContent?.marketSizing) {
      panels.push({
        id: 'market-opportunity',
        title: 'Market Opportunity',
        content: (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
            <EditableSection
              title="Market Sizing Analysis"
              onSave={(content) =>
                console.log('Updated market sizing:', content)
              }
              initialContent={
                product.richContent.marketSizing.sections?.[
                  'Generated Output'
                ] || ''
              }
              placeholder="Enter market sizing analysis..."
              isTextArea
              contentType="description"
              productContext={product}
            >
              <div className="prose prose-gray max-w-none">
                <MarkdownRenderer
                  content={
                    product.richContent.marketSizing.sections?.[
                      'Generated Output'
                    ] || ''
                  }
                />
              </div>
            </EditableSection>
          </div>
        ),
      });
    }

    return panels;
  };

  const generateProductStrategyPanels = async (
    product: any
  ): Promise<ContentPanel[]> => {
    try {
      // Check if product strategy has been compiled and count > 0
      const compilationCount =
        await productStrategyCompiler.getCompilationCount(product.id);
      const hasCompiledPage = await productStrategyCompiler.hasCompiledPage(
        product.id
      );

      console.log(
        `🔍 [ProductPage] Product Strategy compilation check for ${product.id}:`,
        {
          compilationCount,
          hasCompiledPage,
          productId: product.id,
        }
      );

      // If compiled content exists, ALWAYS show it instead of raw panels
      if (compilationCount > 0 && hasCompiledPage) {
        // Show compiled product strategy view as a single panel
        const compiledStrategy = await productStrategyCompiler.loadCompiledPage(
          product.id
        );
        if (compiledStrategy) {
          console.log(
            `✅ [ProductPage] Loading compiled product strategy page for ${product.id}`,
            {
              compiledPageId: compiledStrategy.id,
              compiledAt: compiledStrategy.compiledAt,
              contentSections: Object.keys(compiledStrategy.content),
            }
          );
          return [
            {
              id: 'compiled-product-strategy',
              title: 'Compiled Product Strategy',
              content: (
                <CompiledProductStrategyView
                  compiledStrategy={compiledStrategy}
                />
              ),
            },
          ];
        } else {
          console.warn(
            `⚠️ [ProductPage] Product Strategy compilation exists but failed to load for ${product.id}`
          );
        }
      } else {
        console.log(
          `ℹ️ [ProductPage] No compiled product strategy content found for ${product.id}, showing raw panels`
        );
      }
    } catch (error) {
      console.error(
        `❌ [ProductPage] Error checking product strategy compilation for ${product.id}:`,
        error
      );
    }

    // If not compiled, show raw input panels
    const panels: ContentPanel[] = [];

    // Product Manifesto
    const manifesto = product.richContent?.manifesto
      ? parseManifesto(product.richContent.manifesto)
      : null;

    if (manifesto) {
      panels.push({
        id: 'product-manifesto',
        title: 'Product Manifesto',
        content: (
          <div className="grid gap-6">
            <EditableSection
              title="Problem Statement"
              onSave={(content) =>
                console.log('Updated problem statement:', content)
              }
              initialContent={manifesto.problem}
              placeholder="Enter problem statement..."
              isTextArea
              contentType="description"
              productContext={product}
            >
              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-6 border border-red-200">
                <h3 className="font-bold text-lg text-red-900 mb-3">
                  🎯 Problem
                </h3>
                <MarkdownRenderer content={manifesto.problem} />
              </div>
            </EditableSection>

            <EditableSection
              title="Solution"
              onSave={(content) => console.log('Updated solution:', content)}
              initialContent={manifesto.solution}
              placeholder="Enter solution..."
              isTextArea
              contentType="description"
              productContext={product}
            >
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                <h3 className="font-bold text-lg text-green-900 mb-3">
                  💡 Solution
                </h3>
                <MarkdownRenderer content={manifesto.solution} />
              </div>
            </EditableSection>

            <EditableSection
              title="Magic Moment"
              onSave={(content) =>
                console.log('Updated magic moment:', content)
              }
              initialContent={manifesto.magicMoment}
              placeholder="Enter magic moment..."
              isTextArea
              contentType="description"
              productContext={product}
            >
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
                <h3 className="font-bold text-lg text-purple-900 mb-3">
                  ✨ Magic Moment
                </h3>
                <MarkdownRenderer content={manifesto.magicMoment} />
              </div>
            </EditableSection>
          </div>
        ),
      });
    }

    // User Stories
    if (product.richContent?.userStories) {
      panels.push({
        id: 'user-stories',
        title: 'User Stories',
        content: (
          <EditableSection
            title="User Stories"
            onSave={(content) => console.log('Updated user stories:', content)}
            initialContent={
              product.richContent.userStories.sections?.['Generated Output'] ||
              ''
            }
            placeholder="Enter user stories..."
            isTextArea
            contentType="description"
            productContext={product}
          >
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6 border border-green-200">
              <MarkdownRenderer
                content={
                  product.richContent.userStories.sections?.[
                    'Generated Output'
                  ] || ''
                }
              />
            </div>
          </EditableSection>
        ),
      });
    }

    // Business Model (moved from Investment & Growth)
    panels.push({
      id: 'business-model',
      title: 'Business Model',
      content: (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
          <div className="space-y-6">
            <EditableSection
              title="Product Type"
              onSave={handleSectionSave('type')}
              initialContent={product.type}
              placeholder="Enter product type..."
              contentType="description"
              productContext={product}
            >
              <div>
                <h4 className="font-semibold text-purple-900 mb-2">
                  Product Type
                </h4>
                <p className="text-gray-700">{product.type}</p>
              </div>
            </EditableSection>

            <EditableSection
              title="Pricing"
              onSave={handleSectionSave('pricing.display')}
              initialContent={product.pricing?.display || 'Contact for Pricing'}
              placeholder="Enter pricing..."
              contentType="description"
              productContext={product}
            >
              <div>
                <h4 className="font-semibold text-purple-900 mb-2">Pricing</h4>
                <p className="text-gray-700">
                  {product.pricing?.display || 'Contact for Pricing'}
                </p>
              </div>
            </EditableSection>

            <div>
              <h4 className="font-semibold text-purple-900 mb-2">
                Revenue Model
              </h4>
              <p className="text-gray-700">
                {product.pricing?.type || 'Custom'}
              </p>
            </div>

            {product.content?.description && (
              <EditableSection
                title="Value Proposition"
                onSave={handleSectionSave('content.description')}
                initialContent={product.content.description}
                placeholder="Enter value proposition..."
                isTextArea
                contentType="description"
                productContext={product}
              >
                <div>
                  <h4 className="font-semibold text-purple-900 mb-2">
                    Value Proposition
                  </h4>
                  <MarkdownRenderer content={product.content.description} />
                </div>
              </EditableSection>
            )}
          </div>
        </div>
      ),
    });

    return panels;
  };

  const generateInvestmentGrowthPanels = (product: any): ContentPanel[] => {
    const panels: ContentPanel[] = [];

    // Investor Deck
    if (product.richContent?.investorDeck) {
      panels.push({
        id: 'investor-deck',
        title: 'Investor Deck',
        content: (
          <EditableSection
            title="Investor Deck Content"
            onSave={(content) => console.log('Updated investor deck:', content)}
            initialContent={
              product.richContent.investorDeck.sections?.['Generated Output'] ||
              ''
            }
            placeholder="Enter investor deck content..."
            isTextArea
            contentType="description"
            productContext={product}
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <MarkdownRenderer
                content={
                  product.richContent.investorDeck.sections?.[
                    'Generated Output'
                  ] || ''
                }
              />
            </div>
          </EditableSection>
        ),
      });
    }

    // Market Opportunity (separate panel)
    if (product.richContent?.marketSizing) {
      panels.push({
        id: 'market-opportunity',
        title: 'Market Opportunity',
        content: (
          <EditableSection
            title="Market Sizing Analysis"
            onSave={(content) => console.log('Updated market sizing:', content)}
            initialContent={
              product.richContent.marketSizing.sections?.['Generated Output'] ||
              ''
            }
            placeholder="Enter market sizing analysis..."
            isTextArea
            contentType="description"
            productContext={product}
          >
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
              <MarkdownRenderer
                content={
                  product.richContent.marketSizing.sections?.[
                    'Generated Output'
                  ] || ''
                }
              />
            </div>
          </EditableSection>
        ),
      });
    }

    // Business Model (separate panel)
    panels.push({
      id: 'business-model',
      title: 'Business Model',
      content: (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
          <div className="space-y-6">
            <EditableSection
              title="Product Type"
              onSave={handleSectionSave('type')}
              initialContent={product.type}
              placeholder="Enter product type..."
              contentType="description"
              productContext={product}
            >
              <div>
                <h4 className="font-semibold text-purple-900 mb-2">
                  Product Type
                </h4>
                <p className="text-gray-700">{product.type}</p>
              </div>
            </EditableSection>

            <EditableSection
              title="Pricing"
              onSave={handleSectionSave('pricing.display')}
              initialContent={product.pricing?.display || 'Contact for Pricing'}
              placeholder="Enter pricing..."
              contentType="description"
              productContext={product}
            >
              <div>
                <h4 className="font-semibold text-purple-900 mb-2">Pricing</h4>
                <p className="text-gray-700">
                  {product.pricing?.display || 'Contact for Pricing'}
                </p>
              </div>
            </EditableSection>

            <div>
              <h4 className="font-semibold text-purple-900 mb-2">
                Revenue Model
              </h4>
              <p className="text-gray-700">
                {product.pricing?.type || 'Custom'}
              </p>
            </div>

            {product.content?.description && (
              <EditableSection
                title="Value Proposition"
                onSave={handleSectionSave('content.description')}
                initialContent={product.content.description}
                placeholder="Enter value proposition..."
                isTextArea
                contentType="description"
                productContext={product}
              >
                <div>
                  <h4 className="font-semibold text-purple-900 mb-2">
                    Value Proposition
                  </h4>
                  <MarkdownRenderer content={product.content.description} />
                </div>
              </EditableSection>
            )}
          </div>
        </div>
      ),
    });

    return panels;
  };

  // Parse audience ICPs from the rich content
  const parseAudienceICPs = (richContent: any) => {
    if (!richContent?.sections?.['Generated Output']) return [];

    const content = richContent.sections['Generated Output'];
    const profiles = content
      .split(/\*\*Ideal Customer Profile \d+:\*\*/)
      .filter((section: string) => section.trim().length > 0)
      .map((section: string) => {
        const lines = section.split('\n').filter((line: string) => line.trim());
        const profile: any = {
          profile: '',
          motivations: '',
          painPoints: '',
          typicalDay: '',
          successLooksLike: '',
        };

        let currentField = '';
        let currentContent = '';

        lines.forEach((line: string) => {
          if (line.includes('**Profile:**')) {
            if (currentField) profile[currentField] = currentContent.trim();
            currentField = 'profile';
            currentContent = line.replace('**Profile:**', '').trim();
          } else if (line.includes('**Motivations:**')) {
            if (currentField) profile[currentField] = currentContent.trim();
            currentField = 'motivations';
            currentContent = line.replace('**Motivations:**', '').trim();
          } else if (line.includes('**Pain Points:**')) {
            if (currentField) profile[currentField] = currentContent.trim();
            currentField = 'painPoints';
            currentContent = line.replace('**Pain Points:**', '').trim();
          } else if (line.includes('**Typical Day:**')) {
            if (currentField) profile[currentField] = currentContent.trim();
            currentField = 'typicalDay';
            currentContent = line.replace('**Typical Day:**', '').trim();
          } else if (line.includes('**What Success Looks Like:**')) {
            if (currentField) profile[currentField] = currentContent.trim();
            currentField = 'successLooksLike';
            currentContent = line
              .replace('**What Success Looks Like:**', '')
              .trim();
          } else if (currentField && line.trim()) {
            currentContent += ' ' + line.trim();
          }
        });

        if (currentField) profile[currentField] = currentContent.trim();
        return profile;
      });

    return profiles;
  };

  // Parse competitor analysis from rich content
  const parseCompetitorAnalysis = (richContent: any) => {
    if (!richContent?.sections?.['Generated Output']) return [];

    const content = richContent.sections['Generated Output'];
    const competitors = content
      .split(/\*\*Competing Product \d+:/)
      .filter((section: string) => section.trim().length > 0)
      .map((section: string) => {
        const lines = section.split('\n').filter((line: string) => line.trim());
        const competitor: any = {
          name: '',
          valueProposition: '',
          pricing: '',
          strengths: [],
          weaknesses: [],
          gapWeExploit: '',
        };

        // Extract name from first line
        if (lines[0]) {
          competitor.name = lines[0].replace(/\*\*/g, '').trim();
        }

        // Parse each field
        lines.forEach((line: string) => {
          if (line.includes('- **Value Proposition:**')) {
            competitor.valueProposition = line
              .replace('- **Value Proposition:**', '')
              .trim();
          } else if (line.includes('- **Pricing:**')) {
            competitor.pricing = line.replace('- **Pricing:**', '').trim();
          } else if (line.includes('- **Strength:**')) {
            competitor.strengths = [line.replace('- **Strength:**', '').trim()];
          } else if (line.includes('- **Weakness:**')) {
            competitor.weaknesses = [
              line.replace('- **Weakness:**', '').trim(),
            ];
          } else if (line.includes('- **Gap we exploit:**')) {
            competitor.gapWeExploit = line
              .replace('- **Gap we exploit:**', '')
              .trim();
          }
        });

        return competitor;
      });

    return competitors;
  };

  // Parse manifesto content
  const parseManifesto = (richContent: any) => {
    if (!richContent?.sections?.['Generated Output']) return null;

    const content = richContent.sections['Generated Output'];
    const manifesto: any = {
      problem: '',
      audience: '',
      solution: '',
      magicMoment: '',
      whyExcited: '',
    };

    // Extract sections from the manifesto content
    const sections = content.split(
      /\*\*(Problem|Audience|Solution|Magic Moment|Why Excited):\*\*/
    );

    for (let i = 1; i < sections.length; i += 2) {
      const sectionName = sections[i].toLowerCase().replace(' ', '');
      const sectionContent = sections[i + 1]?.trim().split('\n')[0] || '';

      if (sectionName === 'problem') manifesto.problem = sectionContent;
      else if (sectionName === 'audience') manifesto.audience = sectionContent;
      else if (sectionName === 'solution') manifesto.solution = sectionContent;
      else if (sectionName === 'magicmoment')
        manifesto.magicMoment = sectionContent;
      else if (sectionName === 'whyexcited')
        manifesto.whyExcited = sectionContent;
    }

    return manifesto;
  };

  // Use CSV data as the primary CMS source (removed unused variables)

  // Update productData when the product ID changes
  useEffect(() => {
    const newProduct = getProductById(id!);
    setProductData(newProduct);
  }, [id]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && productData?.id) {
      const oldIndex = contentPanels.findIndex(
        (panel) => panel.id === active.id
      );
      const newIndex = contentPanels.findIndex((panel) => panel.id === over.id);

      const newPanels = arrayMove(contentPanels, oldIndex, newIndex);
      setContentPanels(newPanels);

      // Save the new order to config
      const newPanelIds = newPanels.map((panel) => panel.id);
      panelConfigManager.updatePanelOrder(
        productData.id,
        activeView,
        newPanelIds
      );
    }
  };

  if (!productData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h1>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const prevProduct = allProducts[currentIndex - 1];
      const path =
        prevProduct.type === 'SERVICE'
          ? `/service/${prevProduct.id}`
          : `/product/${prevProduct.id}`;
      navigate(path);
    }
  };

  const goToNext = () => {
    if (currentIndex < totalProducts - 1) {
      const nextProduct = allProducts[currentIndex + 1];
      const path =
        nextProduct.type === 'SERVICE'
          ? `/service/${nextProduct.id}`
          : `/product/${nextProduct.id}`;
      navigate(path);
    }
  };

  const handleSectionSave = (field: string) => (content: string) => {
    setProductData((prev) => {
      if (!prev) return prev;

      // Handle nested content fields
      if (field.startsWith('content.')) {
        const contentField = field.replace('content.', '');
        return {
          ...prev,
          content: {
            ...prev.content,
            [contentField]: content,
          },
        };
      }

      // Handle pricing display
      if (field === 'pricing.display') {
        return {
          ...prev,
          pricing: {
            ...prev.pricing,
            type: prev.pricing?.type || 'fixed',
            display: content,
          },
        };
      }

      // Handle CTA button text
      if (field === 'cta.primary.buttonText') {
        return {
          ...prev,
          cta: {
            ...prev.cta,
            primary: {
              ...prev.cta?.primary,
              title: prev.cta?.primary?.title || '',
              description: prev.cta?.primary?.description || '',
              buttonText: content,
            },
          },
        };
      }

      // Handle CTA description
      if (field === 'cta.primary.description') {
        return {
          ...prev,
          cta: {
            ...prev.cta,
            primary: {
              ...prev.cta?.primary,
              title: prev.cta?.primary?.title || '',
              buttonText: prev.cta?.primary?.buttonText || 'Get Started Today',
              description: content,
            },
          },
        };
      }

      // Handle landing page fields
      if (field.startsWith('landingPage.')) {
        const landingPageField = field.replace('landingPage.', '');
        return {
          ...prev,
          landingPage: {
            ...(prev as any).landingPage,
            [landingPageField]: content,
          },
        };
      }

      // Handle top-level fields
      return {
        ...prev,
        [field]: content,
      };
    });
    console.log(`Updated ${field}:`, content);
  };

  // Utility function to check compilation status for debugging
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const checkCompilationStatus = async (productId: string) => {
    console.log(
      `🔍 [ProductPage] Checking compilation status for ${productId}`
    );

    try {
      // Check marketing compilation
      const marketingCount =
        await marketingCompiler.getCompilationCount(productId);
      const marketingExists =
        await marketingCompiler.hasCompiledPage(productId);
      const marketingPage = marketingExists
        ? await marketingCompiler.loadCompiledPage(productId)
        : null;

      // Check market intelligence compilation
      const marketIntelCount =
        await marketIntelligenceCompiler.getCompilationCount(productId);
      const marketIntelExists =
        await marketIntelligenceCompiler.hasCompiledPage(productId);
      const marketIntelPage = marketIntelExists
        ? await marketIntelligenceCompiler.loadCompiledPage(productId)
        : null;

      // Check product strategy compilation
      const productStrategyCount =
        await productStrategyCompiler.getCompilationCount(productId);
      const productStrategyExists =
        await productStrategyCompiler.hasCompiledPage(productId);
      const productStrategyPage = productStrategyExists
        ? await productStrategyCompiler.loadCompiledPage(productId)
        : null;

      console.log(`📊 [ProductPage] Compilation Status for ${productId}:`, {
        marketing: {
          count: marketingCount,
          exists: marketingExists,
          pageId: marketingPage?.id,
          compiledAt: marketingPage?.compiledAt,
        },
        marketIntelligence: {
          count: marketIntelCount,
          exists: marketIntelExists,
          pageId: marketIntelPage?.id,
          compiledAt: marketIntelPage?.compiledAt,
        },
        productStrategy: {
          count: productStrategyCount,
          exists: productStrategyExists,
          pageId: productStrategyPage?.id,
          compiledAt: productStrategyPage?.compiledAt,
        },
      });

      return {
        marketing: {
          count: marketingCount,
          exists: marketingExists,
          page: marketingPage,
        },
        marketIntelligence: {
          count: marketIntelCount,
          exists: marketIntelExists,
          page: marketIntelPage,
        },
        productStrategy: {
          count: productStrategyCount,
          exists: productStrategyExists,
          page: productStrategyPage,
        },
      };
    } catch (error) {
      console.error(
        `❌ [ProductPage] Error checking compilation status for ${productId}:`,
        error
      );
      return null;
    }
  };

  // Force refresh panels (for debugging)


  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'functional-spec', label: 'Functional Spec', icon: FileText },
    { id: 'marketing-sales', label: 'Marketing & Sales', icon: Megaphone },
    {
      id: 'market-intelligence',
      label: 'Market Intelligence',
      icon: TrendingUp,
    },
    { id: 'product-strategy', label: 'Product Strategy', icon: Users },
    // { id: 'investment-growth', label: 'Investment & Growth', icon: DollarSign }, // Hidden for now
  ];

  // Download functions for Functional Spec
  const downloadFunctionalSpecAsMarkdown = () => {
    const content =
      functionalSpecData?.content ||
      productData.richContent?.functionalSpec?.sections?.['Generated Output'] ||
      '';
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `functional_spec_${productData.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveFunctionalSpec = async (content: string) => {
    if (!productData) return;

    try {
      await functionalSpecService.saveFunctionalSpec(productData.id, content);
      // Update local state
      setFunctionalSpecData((prev) =>
        prev
          ? {
              ...prev,
              content,
              lastModified: new Date().toISOString(),
            }
          : null
      );
      console.log('✅ Functional spec saved to Redis');
    } catch (error) {
      console.error('❌ Error saving functional spec:', error);
      alert('Failed to save functional spec. Please try again.');
    }
  };

  const downloadFunctionalSpecAsJSON = () => {
    const currentContent =
      functionalSpecData?.content ||
      productData.richContent?.functionalSpec?.sections?.['Generated Output'] ||
      '';
    const currentTitle =
      functionalSpecData?.title ||
      productData.richContent?.functionalSpec?.title ||
      'Functional Specification';

    const downloadData = {
      productId: productData.id,
      productName: productData.name,
      title: currentTitle,
      content: currentContent,
      metadata: productData.richContent?.functionalSpec?.metadata || {},
      downloadedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(downloadData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `functional_spec_${productData.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with navigation actions */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Navigation buttons for home tab */}
              {activeView === 'home' && (
                <>
                  <Button
                    onClick={goToPrevious}
                    disabled={currentIndex === 0}
                    variant="ghost"
                    className="flex items-center space-x-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>

                  <span className="text-sm text-gray-500">
                    {currentIndex + 1} of {totalProducts}
                  </span>

                  <Button
                    onClick={goToNext}
                    disabled={currentIndex === totalProducts - 1}
                    variant="ghost"
                    className="flex items-center space-x-2"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}

              {/* Configuration buttons for non-home tabs */}
              {activeView !== 'home' && (
                <>
                  {/* Panel Configuration Button */}
                  <button
                    onClick={() => setShowPanelConfig(true)}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Panel Configuration"
                  >
                    <Sliders className="w-4 h-4" />
                    <span className="hidden sm:inline">Panels</span>
                  </button>

                  {/* AI Configuration Button */}
                  <button
                    onClick={() => setShowAIConfig(true)}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="AI Configuration"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">AI Configuration</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Show for all tabs consistently */}
      <section className="relative bg-primary text-white py-8 overflow-hidden">
        {/* Simple gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-dark"></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                productData.type === 'PRODUCT'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {productData.type}
            </span>
          </div>

          <EditableSection
            title="Hero Title"
            onSave={handleSectionSave('content.heroTitle')}
            initialContent={
              productData.content?.heroTitle?.replace(
                /^Transform your business\s*(with\s*)?/i,
                ''
              ) ||
              productData.name?.replace(
                /^Transform your business\s*(with\s*)?/i,
                ''
              ) ||
              productData.name
            }
            placeholder="Enter hero title..."
            contentType="heroTitle"
            productContext={productData}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
              {productData.content?.heroTitle?.replace(
                /^Transform your business\s*(with\s*)?/i,
                ''
              ) ||
                productData.name?.replace(
                  /^Transform your business\s*(with\s*)?/i,
                  ''
                ) ||
                productData.name}
            </h1>
          </EditableSection>

          <EditableSection
            title="Hero Subtitle"
            onSave={handleSectionSave('content.heroSubtitle')}
            initialContent={
              productData.content?.heroSubtitle ||
              productData.content?.description
            }
            placeholder="Enter hero subtitle..."
            isTextArea
            contentType="heroSubtitle"
            productContext={productData}
          >
            <p className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl mx-auto leading-relaxed">
              {productData.content?.heroSubtitle ||
                productData.content?.description}
            </p>
          </EditableSection>
        </div>
      </section>

      {/* Tab Navigation - Moved beneath hero banner */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-center space-x-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as ViewType)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-base transition-colors whitespace-nowrap ${
                    activeView === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`mx-auto px-4 sm:px-6 lg:px-8 py-8 ${activeView === 'functional-spec' ? 'max-w-6xl' : 'max-w-4xl'}`}
      >
        {activeView === 'home' ? (
          // New CMS-driven Landing Page
          <div className="space-y-8">
            {/* CMS-Driven Landing Page */}
            <LandingPageView
              csvProduct={productToCSVProduct(productData)}
              productId={productData.id}
            />
          </div>
        ) : activeView === 'functional-spec' ? (
          // Custom styled Functional Specification (no collapsible panel)
          <div className="space-y-8">
            {isLoadingFunctionalSpec ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">
                  Loading functional specification...
                </p>
              </div>
            ) : functionalSpecData ||
              productData.richContent?.functionalSpec ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 rounded-lg p-2">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white">
                        Functional Specification
                      </h1>
                      <p className="text-blue-100 text-sm mt-1">
                        Detailed technical requirements and implementation guide
                      </p>
                      {functionalSpecData?.lastModified && (
                        <p className="text-blue-200 text-xs mt-1">
                          Last modified:{' '}
                          {new Date(
                            functionalSpecData.lastModified
                          ).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <EditableSection
                    title="Edit Content"
                    onSave={saveFunctionalSpec}
                    initialContent={
                      functionalSpecData?.content ||
                      productData.richContent?.functionalSpec?.sections?.[
                        'Generated Output'
                      ] ||
                      ''
                    }
                    placeholder="Enter functional specification..."
                    isTextArea
                    contentType="description"
                    productContext={productData}
                  >
                    <div className="prose prose-lg prose-gray max-w-none">
                      <MarkdownRenderer
                        content={
                          functionalSpecData?.content ||
                          productData.richContent?.functionalSpec?.sections?.[
                            'Generated Output'
                          ] ||
                          ''
                        }
                        skipFirstHeading={true}
                      />
                    </div>
                  </EditableSection>

                  {/* Download Options */}
                  <div className="mt-8 bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-4">
                      📥 Download Functional Specification
                    </h3>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => downloadFunctionalSpecAsMarkdown()}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        📄 Download as Markdown
                      </button>
                      <button
                        onClick={() => downloadFunctionalSpecAsJSON()}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        📊 Download as JSON
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-gray-50 rounded-xl p-12 border-2 border-dashed border-gray-300">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Functional Specification Available
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    The functional specification for this product hasn't been
                    created yet. Check back later or contact the product team
                    for more information.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : // Panel-based content for other tabs
        isLoadingPanels ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading compiled content...</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={contentPanels.map((panel) => panel.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-6">
                {contentPanels.map((panel) => (
                  <DraggableTabPanel
                    key={panel.id}
                    id={panel.id}
                    title={panel.title}
                    productId={productData?.id || ''}
                    tabId={activeView}
                  >
                    {panel.content}
                  </DraggableTabPanel>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {activeView !== 'home' &&
          activeView !== 'functional-spec' &&
          contentPanels.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                No content available for this view.
              </div>
              <div className="text-gray-400 text-sm mt-2">
                Try switching to a different tab or check if the product has
                rich content.
              </div>
            </div>
          )}
      </div>

      {/* AI Configuration Modal */}
      {showAIConfig && (
        <AIConfigModal
          isOpen={showAIConfig}
          onClose={() => setShowAIConfig(false)}
        />
      )}

      {/* Panel Configuration Modal */}
      <PanelConfigModal
        isOpen={showPanelConfig}
        onClose={() => setShowPanelConfig(false)}
        productId={productData?.id}
        currentTab={activeView}
      />
    </div>
  );
}
