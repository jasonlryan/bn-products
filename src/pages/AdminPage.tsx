import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Settings,
  Zap,
  Edit,
  Eye,
  RefreshCw,
  FileText,
  Save,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  TrendingUp,
  Target,
} from 'lucide-react';
import { getAllProductsAndServices, getProductById } from '../config';
import { marketingCompiler } from '../services/marketingCompiler';
import { marketIntelligenceCompiler } from '../services/marketIntelligenceCompiler';
import { productStrategyCompiler } from '../services/productStrategyCompiler';
// Remove unused import
import { Button, Card } from '../components/ui';
import { QueueManagementPanel } from '../components/admin/QueueManagementPanel';
import { MARKETING_COMPILATION_PROMPT } from '../prompts/marketingPrompt';
import { MARKET_INTELLIGENCE_COMPILATION_PROMPT } from '../prompts/marketIntelligencePrompt';
import { PRODUCT_STRATEGY_COMPILATION_PROMPT } from '../prompts/productStrategyPrompt';

interface AdminSettings {
  editModeEnabled: boolean;
  lastCompiled: Record<string, Date>;
  compilationStatus: Record<
    string,
    'idle' | 'compiling' | 'complete' | 'error'
  >;
  compilationCount: Record<string, number>;
  marketingPrompt?: string;
  marketIntelligencePrompt?: string;
  marketIntelligenceLastCompiled?: Record<string, Date>;
  marketIntelligenceStatus?: Record<
    string,
    'idle' | 'compiling' | 'complete' | 'error'
  >;
  marketIntelligenceCount?: Record<string, number>;
  productStrategyPrompt?: string;
  productStrategyLastCompiled?: Record<string, Date>;
  productStrategyStatus?: Record<
    string,
    'idle' | 'compiling' | 'complete' | 'error'
  >;
  productStrategyCount?: Record<string, number>;
}

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [settings, setSettings] = useState<AdminSettings>({
    editModeEnabled: true,
    lastCompiled: {},
    compilationStatus: {},
    compilationCount: {},
    marketingPrompt: MARKETING_COMPILATION_PROMPT,
    marketIntelligencePrompt: MARKET_INTELLIGENCE_COMPILATION_PROMPT,
  });
  const [loading, setLoading] = useState(true);
  const [isEditingMarketingPrompt, setIsEditingMarketingPrompt] =
    useState(false);
  const [marketingPromptEditText, setMarketingPromptEditText] = useState(
    MARKETING_COMPILATION_PROMPT
  );
  const [
    isEditingMarketIntelligencePrompt,
    setIsEditingMarketIntelligencePrompt,
  ] = useState(false);
  const [
    marketIntelligencePromptEditText,
    setMarketIntelligencePromptEditText,
  ] = useState(MARKET_INTELLIGENCE_COMPILATION_PROMPT);
  const [isEditingProductStrategyPrompt, setIsEditingProductStrategyPrompt] =
    useState(false);
  const [productStrategyPromptEditText, setProductStrategyPromptEditText] =
    useState(PRODUCT_STRATEGY_COMPILATION_PROMPT);
  const [expandedPanels, setExpandedPanels] = useState({
    globalSettings: true,
    promptManagement: false,
    productManagement: true,
  });
  const [activePromptTab, setActivePromptTab] = useState<
    'marketing' | 'marketIntelligence' | 'productStrategy'
  >('marketing');
  const [expandedCompilationSections, setExpandedCompilationSections] =
    useState({
      marketingSales: true,
      marketIntelligence: true,
      productStrategy: true,
    });

  useEffect(() => {
    loadData();
  }, []);

  const togglePanel = (panelName: keyof typeof expandedPanels) => {
    setExpandedPanels((prev) => ({
      ...prev,
      [panelName]: !prev[panelName],
    }));
  };

  const toggleCompilationSection = (
    sectionName: keyof typeof expandedCompilationSections
  ) => {
    setExpandedCompilationSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const loadData = async () => {
    try {
      const allProducts = await getAllProductsAndServices();
      setProducts(allProducts);

      // Load admin settings from localStorage
      const savedSettings = localStorage.getItem('admin-settings');

      // Get compilation counts from all compiler services
      const marketingCounts = await marketingCompiler.getAllCompilationCounts();
      const marketIntelligenceCounts =
        await marketIntelligenceCompiler.getAllCompilationCounts();
      const productStrategyCounts =
        await productStrategyCompiler.getAllCompilationCounts();

      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({
          editModeEnabled: parsed.editModeEnabled ?? true,
          lastCompiled: Object.fromEntries(
            Object.entries(parsed.lastCompiled || {}).map(([k, v]) => [
              k,
              new Date(v as string),
            ])
          ),
          compilationStatus: parsed.compilationStatus || {},
          // Use the marketing compiler counts as the source of truth
          compilationCount: marketingCounts,
          marketingPrompt:
            parsed.marketingPrompt || MARKETING_COMPILATION_PROMPT,
          marketIntelligencePrompt:
            parsed.marketIntelligencePrompt ||
            MARKET_INTELLIGENCE_COMPILATION_PROMPT,
          productStrategyPrompt:
            parsed.productStrategyPrompt || PRODUCT_STRATEGY_COMPILATION_PROMPT,
          // Load market intelligence settings
          marketIntelligenceLastCompiled: Object.fromEntries(
            Object.entries(parsed.marketIntelligenceLastCompiled || {}).map(
              ([k, v]) => [k, new Date(v as string)]
            )
          ),
          marketIntelligenceStatus: parsed.marketIntelligenceStatus || {},
          marketIntelligenceCount: marketIntelligenceCounts,
          // Load product strategy settings
          productStrategyLastCompiled: Object.fromEntries(
            Object.entries(parsed.productStrategyLastCompiled || {}).map(
              ([k, v]) => [k, new Date(v as string)]
            )
          ),
          productStrategyStatus: parsed.productStrategyStatus || {},
          productStrategyCount: productStrategyCounts,
        });
        setMarketingPromptEditText(
          parsed.marketingPrompt || MARKETING_COMPILATION_PROMPT
        );
        setMarketIntelligencePromptEditText(
          parsed.marketIntelligencePrompt ||
            MARKET_INTELLIGENCE_COMPILATION_PROMPT
        );
        setProductStrategyPromptEditText(
          parsed.productStrategyPrompt || PRODUCT_STRATEGY_COMPILATION_PROMPT
        );
      } else {
        // If no saved settings, at least load the compilation counts
        setSettings((prev) => ({
          ...prev,
          compilationCount: marketingCounts,
          marketIntelligenceCount: marketIntelligenceCounts,
          productStrategyCount: productStrategyCounts,
          marketingPrompt: MARKETING_COMPILATION_PROMPT,
          marketIntelligencePrompt: MARKET_INTELLIGENCE_COMPILATION_PROMPT,
          productStrategyPrompt: PRODUCT_STRATEGY_COMPILATION_PROMPT,
        }));
      }
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = (newSettings: AdminSettings) => {
    setSettings(newSettings);
    localStorage.setItem('admin-settings', JSON.stringify(newSettings));
  };

  const saveMarketingPrompt = () => {
    const newSettings = {
      ...settings,
      marketingPrompt: marketingPromptEditText,
    };
    saveSettings(newSettings);
    setIsEditingMarketingPrompt(false);
  };

  const resetMarketingPrompt = () => {
    setMarketingPromptEditText(MARKETING_COMPILATION_PROMPT);
    const newSettings = {
      ...settings,
      marketingPrompt: MARKETING_COMPILATION_PROMPT,
    };
    saveSettings(newSettings);
  };

  const saveMarketIntelligencePrompt = () => {
    const newSettings = {
      ...settings,
      marketIntelligencePrompt: marketIntelligencePromptEditText,
    };
    saveSettings(newSettings);
    setIsEditingMarketIntelligencePrompt(false);
  };

  const resetMarketIntelligencePrompt = () => {
    setMarketIntelligencePromptEditText(MARKET_INTELLIGENCE_COMPILATION_PROMPT);
    const newSettings = {
      ...settings,
      marketIntelligencePrompt: MARKET_INTELLIGENCE_COMPILATION_PROMPT,
    };
    saveSettings(newSettings);
  };

  const saveProductStrategyPrompt = () => {
    const newSettings = {
      ...settings,
      productStrategyPrompt: productStrategyPromptEditText,
    };
    saveSettings(newSettings);
    setIsEditingProductStrategyPrompt(false);
  };

  const resetProductStrategyPrompt = () => {
    setProductStrategyPromptEditText(PRODUCT_STRATEGY_COMPILATION_PROMPT);
    const newSettings = {
      ...settings,
      productStrategyPrompt: PRODUCT_STRATEGY_COMPILATION_PROMPT,
    };
    saveSettings(newSettings);
  };

  const toggleEditMode = () => {
    const newSettings = {
      ...settings,
      editModeEnabled: !settings.editModeEnabled,
    };
    saveSettings(newSettings);

    // Also save to a global flag that pages can check
    localStorage.setItem(
      'page-edit-mode',
      newSettings.editModeEnabled.toString()
    );
  };

  const resetCompilationCount = (productId: string) => {
    if (
      confirm(
        'Are you sure you want to reset the compilation count for this product?'
      )
    ) {
      // Reset in the marketing compiler service
      marketingCompiler.resetCompilationCount(productId);

      // Update local state
      const newSettings = {
        ...settings,
        compilationCount: {
          ...settings.compilationCount,
          [productId]: 0,
        },
      };
      saveSettings(newSettings);
    }
  };

  const compileMarketIntelligence = async (productId: string) => {
    try {
      // Set compiling status
      const newSettings = {
        ...settings,
        marketIntelligenceStatus: {
          ...(settings.marketIntelligenceStatus || {}),
          [productId]: 'compiling' as const,
        },
      };
      saveSettings(newSettings);

      // Get the product
      const product = await getProductById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Compile the market intelligence page
      const compiledPage =
        await marketIntelligenceCompiler.compileMarketIntelligencePage(product);

      // Save the compiled page (this will also increment the count)
      await marketIntelligenceCompiler.saveCompiledPage(compiledPage);

      // Get the updated count from the service
      const newCount =
        await marketIntelligenceCompiler.getCompilationCount(productId);

      // Update admin settings with success status
      const finalSettings = {
        ...newSettings,
        marketIntelligenceStatus: {
          ...(newSettings.marketIntelligenceStatus || {}),
          [productId]: 'complete' as const,
        },
        marketIntelligenceLastCompiled: {
          ...(newSettings.marketIntelligenceLastCompiled || {}),
          [productId]: new Date(),
        },
        marketIntelligenceCount: {
          ...(newSettings.marketIntelligenceCount || {}),
          [productId]: newCount,
        },
      };
      saveSettings(finalSettings);

      console.log(
        'Market intelligence compilation completed for product:',
        productId
      );
    } catch (error) {
      console.error('Error compiling market intelligence:', error);

      // Set error status
      const errorSettings = {
        ...settings,
        marketIntelligenceStatus: {
          ...(settings.marketIntelligenceStatus || {}),
          [productId]: 'error' as const,
        },
      };
      saveSettings(errorSettings);
    }
  };

  const getMarketIntelligenceStatusText = (productId: string) => {
    if (!settings || !productId) return 'Not compiled';

    const count = settings.marketIntelligenceCount?.[productId] || 0;
    const status = settings.marketIntelligenceStatus?.[productId] || 'idle';
    const lastCompiled = settings.marketIntelligenceLastCompiled?.[productId];

    // If compiling, show that status
    if (status === 'compiling') return 'Compiling...';

    // If count > 0, it's compiled (regardless of stored status)
    if (count > 0) {
      const countText = ` (${count} times)`;
      return lastCompiled
        ? `Compiled ${lastCompiled.toLocaleDateString()}${countText}`
        : `Compiled${countText}`;
    }

    // Otherwise not compiled
    return 'Not compiled';
  };

  const resetMarketIntelligenceCount = (productId: string) => {
    if (
      confirm(
        'Are you sure you want to reset the market intelligence compilation count for this product?'
      )
    ) {
      // Reset in the market intelligence compiler service
      marketIntelligenceCompiler.resetCompilationCount(productId);

      // Update admin settings
      const newSettings = {
        ...settings,
        marketIntelligenceStatus: {
          ...(settings.marketIntelligenceStatus || {}),
          [productId]: 'idle' as const,
        },
        marketIntelligenceCount: {
          ...(settings.marketIntelligenceCount || {}),
          [productId]: 0,
        },
      };
      saveSettings(newSettings);
    }
  };

  const compileAllMarketing = async () => {
    for (const product of products) {
      await compileMarketingPage(product.id);
    }
    // Force a refresh of the component state after all compilations
    await loadData();
  };

  const compileAllMarketIntelligence = async () => {
    for (const product of products) {
      await compileMarketIntelligence(product.id);
    }
    // Force a refresh of the component state after all compilations
    await loadData();
  };

  const compileAllProductStrategy = async () => {
    for (const product of products) {
      await compileProductStrategy(product.id);
    }
    // Force a refresh of the component state after all compilations
    await loadData();
  };

  const compileProductStrategy = async (productId: string) => {
    try {
      // Set compiling status
      const newSettings = {
        ...settings,
        productStrategyStatus: {
          ...(settings.productStrategyStatus || {}),
          [productId]: 'compiling' as const,
        },
      };
      saveSettings(newSettings);

      // Get the product
      const product = await getProductById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Compile the product strategy
      const compiledStrategy =
        await productStrategyCompiler.compileProductStrategy(product);

      // Save the compiled page (this will also increment the count)
      await productStrategyCompiler.saveCompiledPage(compiledStrategy);

      // Get the updated count from the service
      const newCount =
        await productStrategyCompiler.getCompilationCount(productId);

      // Update admin settings with success status
      const finalSettings = {
        ...newSettings,
        productStrategyStatus: {
          ...(newSettings.productStrategyStatus || {}),
          [productId]: 'complete' as const,
        },
        productStrategyLastCompiled: {
          ...(newSettings.productStrategyLastCompiled || {}),
          [productId]: new Date(),
        },
        productStrategyCount: {
          ...(newSettings.productStrategyCount || {}),
          [productId]: newCount,
        },
      };
      saveSettings(finalSettings);

      console.log(
        'Product strategy compilation completed for product:',
        productId
      );
    } catch (error) {
      console.error('Error compiling product strategy:', error);

      // Set error status
      const errorSettings = {
        ...settings,
        productStrategyStatus: {
          ...(settings.productStrategyStatus || {}),
          [productId]: 'error' as const,
        },
      };
      saveSettings(errorSettings);
    }
  };

  const getProductStrategyStatusText = (productId: string) => {
    if (!settings || !productId) return 'Not compiled';

    const count = settings.productStrategyCount?.[productId] || 0;
    const status = settings.productStrategyStatus?.[productId] || 'idle';
    const lastCompiled = settings.productStrategyLastCompiled?.[productId];

    // If compiling, show that status
    if (status === 'compiling') return 'Compiling...';

    // If count > 0, it's compiled (regardless of stored status)
    if (count > 0) {
      const countText = ` (${count} times)`;
      return lastCompiled
        ? `Compiled ${lastCompiled.toLocaleDateString()}${countText}`
        : `Compiled${countText}`;
    }

    // Otherwise not compiled
    return 'Not compiled';
  };

  const resetProductStrategyCount = (productId: string) => {
    if (
      confirm(
        'Are you sure you want to reset the product strategy compilation count for this product?'
      )
    ) {
      // Reset in the product strategy compiler service
      productStrategyCompiler.resetCompilationCount(productId);

      // Update admin settings
      const newSettings = {
        ...settings,
        productStrategyStatus: {
          ...(settings.productStrategyStatus || {}),
          [productId]: 'idle' as const,
        },
        productStrategyCount: {
          ...(settings.productStrategyCount || {}),
          [productId]: 0,
        },
      };
      saveSettings(newSettings);
    }
  };

  const compileMarketingPage = async (productId: string) => {
    // Update status to compiling
    const newSettings = {
      ...settings,
      compilationStatus: {
        ...(settings.compilationStatus || {}),
        [productId]: 'compiling' as const,
      },
    };
    saveSettings(newSettings);

    try {
      // Get the product data
      const product = getProductById(productId);
      if (!product) {
        throw new Error(`Product not found: ${productId}`);
      }

      // Compile the marketing page using the actual service
      const compiledPage =
        await marketingCompiler.compileMarketingPage(product);

      // Save the compiled page (this will also increment the count)
      await marketingCompiler.saveCompiledPage(compiledPage);

      // Get the updated count from the service
      const newCount = await marketingCompiler.getCompilationCount(productId);
      const finalSettings = {
        ...newSettings,
        compilationStatus: {
          ...(newSettings.compilationStatus || {}),
          [productId]: 'complete' as const,
        },
        lastCompiled: {
          ...(newSettings.lastCompiled || {}),
          [productId]: new Date(),
        },
        compilationCount: {
          ...(newSettings.compilationCount || {}),
          [productId]: newCount,
        },
      };
      saveSettings(finalSettings);

      console.log(
        `Marketing page compiled for product: ${productId}`,
        compiledPage
      );
    } catch (error) {
      console.error('Compilation failed:', error);
      const errorSettings = {
        ...newSettings,
        compilationStatus: {
          ...(newSettings.compilationStatus || {}),
          [productId]: 'error' as const,
        },
      };
      saveSettings(errorSettings);
    }
  };

  const getStatusColor = (productId: string) => {
    if (!settings || !productId) return 'text-gray-600';

    const status = settings.compilationStatus?.[productId] || 'idle';
    switch (status) {
      case 'compiling':
        return 'text-blue-600';
      case 'complete':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (productId: string) => {
    if (!settings || !productId) return 'Not compiled';

    const count = settings.compilationCount?.[productId] || 0;
    const status = settings.compilationStatus?.[productId] || 'idle';
    const lastCompiled = settings.lastCompiled?.[productId];

    // If compiling, show that status
    if (status === 'compiling') return 'Compiling...';

    // If count > 0, it's compiled (regardless of stored status)
    if (count > 0) {
      const countText = ` (${count} times)`;
      return lastCompiled
        ? `Compiled ${lastCompiled.toLocaleDateString()}${countText}`
        : `Compiled${countText}`;
    }

    // Otherwise not compiled
    return 'Not compiled';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <Settings className="w-6 h-6 text-blue-600" />
                <span>Admin Panel</span>
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Global Settings */}
        <Card className="mb-8">
          <div className="p-6">
            <button
              onClick={() => togglePanel('globalSettings')}
              className="w-full flex items-center justify-between text-xl font-semibold text-gray-900 mb-4 hover:text-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Global Settings</span>
              </div>
              {expandedPanels.globalSettings ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {expandedPanels.globalSettings && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Page Editing Mode
                    </h3>
                    <p className="text-sm text-gray-600">
                      Allow inline editing of content across all product pages
                    </p>
                  </div>
                  <button
                    onClick={toggleEditMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      settings.editModeEnabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.editModeEnabled
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  {settings.editModeEnabled ? (
                    <>
                      <Edit className="w-4 h-4 text-green-600" />
                      <span>
                        Edit mode is <strong>enabled</strong> - users can edit
                        content
                      </span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 text-gray-600" />
                      <span>
                        Edit mode is <strong>disabled</strong> - content is
                        view-only
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Prompt Management */}
        <Card className="mb-8">
          <div className="p-6">
            <button
              onClick={() => togglePanel('promptManagement')}
              className="w-full flex items-center justify-between text-xl font-semibold text-gray-900 mb-4 hover:text-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Prompt Management</span>
              </div>
              {expandedPanels.promptManagement ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {expandedPanels.promptManagement && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Current Prompts
                    </h3>
                    <p className="text-sm text-gray-600">
                      Manage the prompts used to guide content compilation.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setActivePromptTab('marketing')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activePromptTab === 'marketing'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Marketing Prompt
                    </button>
                    <button
                      onClick={() => setActivePromptTab('marketIntelligence')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activePromptTab === 'marketIntelligence'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Market Intelligence Prompt
                    </button>
                    <button
                      onClick={() => setActivePromptTab('productStrategy')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activePromptTab === 'productStrategy'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Product Strategy Prompt
                    </button>
                  </div>
                </div>

                {activePromptTab === 'marketing' && (
                  <>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Current Marketing Prompt
                        </h3>
                        <p className="text-sm text-gray-600">
                          The prompt used to guide the marketing page
                          compilation.
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setMarketingPromptEditText(
                              settings.marketingPrompt ||
                                MARKETING_COMPILATION_PROMPT
                            );
                            setIsEditingMarketingPrompt(true);
                          }}
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit Prompt</span>
                        </button>
                        <button
                          onClick={resetMarketingPrompt}
                          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Reset to Default</span>
                        </button>
                      </div>
                    </div>

                    {isEditingMarketingPrompt ? (
                      <div className="space-y-4">
                        <textarea
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={20}
                          value={marketingPromptEditText}
                          onChange={(e) =>
                            setMarketingPromptEditText(e.target.value)
                          }
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => setIsEditingMarketingPrompt(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={saveMarketingPrompt}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Prompt
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                          {settings.marketingPrompt ||
                            MARKETING_COMPILATION_PROMPT}
                        </pre>
                      </div>
                    )}
                  </>
                )}

                {activePromptTab === 'marketIntelligence' && (
                  <>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Current Market Intelligence Prompt
                        </h3>
                        <p className="text-sm text-gray-600">
                          The prompt used to guide the market intelligence page
                          compilation.
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setMarketIntelligencePromptEditText(
                              settings.marketIntelligencePrompt ||
                                MARKET_INTELLIGENCE_COMPILATION_PROMPT
                            );
                            setIsEditingMarketIntelligencePrompt(true);
                          }}
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit Prompt</span>
                        </button>
                        <button
                          onClick={resetMarketIntelligencePrompt}
                          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Reset to Default</span>
                        </button>
                      </div>
                    </div>

                    {isEditingMarketIntelligencePrompt ? (
                      <div className="space-y-4">
                        <textarea
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={20}
                          value={marketIntelligencePromptEditText}
                          onChange={(e) =>
                            setMarketIntelligencePromptEditText(e.target.value)
                          }
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() =>
                              setIsEditingMarketIntelligencePrompt(false)
                            }
                          >
                            Cancel
                          </Button>
                          <Button onClick={saveMarketIntelligencePrompt}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Prompt
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                          {settings.marketIntelligencePrompt ||
                            MARKET_INTELLIGENCE_COMPILATION_PROMPT}
                        </pre>
                      </div>
                    )}
                  </>
                )}

                {activePromptTab === 'productStrategy' && (
                  <>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Current Product Strategy Prompt
                        </h3>
                        <p className="text-sm text-gray-600">
                          The prompt used to guide the product strategy page
                          compilation.
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setProductStrategyPromptEditText(
                              settings.productStrategyPrompt ||
                                PRODUCT_STRATEGY_COMPILATION_PROMPT
                            );
                            setIsEditingProductStrategyPrompt(true);
                          }}
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit Prompt</span>
                        </button>
                        <button
                          onClick={resetProductStrategyPrompt}
                          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Reset to Default</span>
                        </button>
                      </div>
                    </div>

                    {isEditingProductStrategyPrompt ? (
                      <div className="space-y-4">
                        <textarea
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={20}
                          value={productStrategyPromptEditText}
                          onChange={(e) =>
                            setProductStrategyPromptEditText(e.target.value)
                          }
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() =>
                              setIsEditingProductStrategyPrompt(false)
                            }
                          >
                            Cancel
                          </Button>
                          <Button onClick={saveProductStrategyPrompt}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Prompt
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                          {settings.productStrategyPrompt ||
                            PRODUCT_STRATEGY_COMPILATION_PROMPT}
                        </pre>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Content Compilation Management */}
        <Card>
          <div className="p-6">
            <button
              onClick={() => togglePanel('productManagement')}
              className="w-full flex items-center justify-between text-xl font-semibold text-gray-900 mb-6 hover:text-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Content Compilation Management</span>
              </div>
              {expandedPanels.productManagement ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {expandedPanels.productManagement && (
              <div className="space-y-6">
                {/* Marketing & Sales Compilation Panel */}
                <Card className="border-2 border-blue-100 bg-blue-50/30">
                  <div className="p-6">
                    <button
                      onClick={() => toggleCompilationSection('marketingSales')}
                      className="w-full flex items-center justify-between mb-4 hover:bg-blue-100/50 rounded-lg p-2 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Zap className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg font-semibold text-blue-900">
                            Marketing & Sales Pages
                          </h3>
                          <p className="text-sm text-blue-700">
                            Compile marketing content from Key Messages, Demo
                            Script, Slide Headlines, and Q&A Prep
                          </p>
                        </div>
                      </div>
                      {expandedCompilationSections.marketingSales ? (
                        <ChevronUp className="w-5 h-5 text-blue-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-blue-600" />
                      )}
                    </button>

                    {expandedCompilationSections.marketingSales && (
                      <div className="space-y-4">
                        {/* Compile All Button */}
                        <div className="flex justify-end">
                          <Button
                            onClick={compileAllMarketing}
                            disabled={products.some(
                              (p) =>
                                settings.compilationStatus?.[p.id] ===
                                'compiling'
                            )}
                            className="flex items-center space-x-2"
                            size="sm"
                          >
                            <RefreshCw
                              className={`w-4 h-4 ${
                                products.some(
                                  (p) =>
                                    settings.compilationStatus?.[p.id] ===
                                    'compiling'
                                )
                                  ? 'animate-spin'
                                  : ''
                              }`}
                            />
                            <span>Compile All Marketing</span>
                          </Button>
                        </div>

                        <div className="space-y-3">
                          {products.map((product) => (
                            <div
                              key={product.id}
                              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">
                                  {product.name}
                                </h4>
                                <p
                                  className={`text-xs mt-1 ${getStatusColor(product.id)}`}
                                >
                                  {getStatusText(product.id)}
                                </p>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    navigate(`/product/${product.id}`)
                                  }
                                  className="flex items-center space-x-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>View</span>
                                </Button>

                                {(settings.compilationCount?.[product.id] ||
                                  0) > 0 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      resetCompilationCount(product.id)
                                    }
                                    className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
                                    title="Reset compilation count"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                  </Button>
                                )}

                                <Button
                                  onClick={() =>
                                    compileMarketingPage(product.id)
                                  }
                                  disabled={
                                    settings.compilationStatus?.[product.id] ===
                                    'compiling'
                                  }
                                  className="flex items-center space-x-1"
                                  size="sm"
                                >
                                  <RefreshCw
                                    className={`w-3 h-3 ${
                                      settings.compilationStatus?.[
                                        product.id
                                      ] === 'compiling'
                                        ? 'animate-spin'
                                        : ''
                                    }`}
                                  />
                                  <span>
                                    {settings.compilationStatus?.[
                                      product.id
                                    ] === 'compiling'
                                      ? 'Compiling...'
                                      : 'Compile'}
                                  </span>
                                </Button>
                              </div>
                            </div>
                          ))}

                          {products.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                              <p>No products found</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Market Intelligence Compilation Panel */}
                <Card className="border-2 border-blue-100 bg-blue-50/30">
                  <div className="p-6">
                    <button
                      onClick={() =>
                        toggleCompilationSection('marketIntelligence')
                      }
                      className="w-full flex items-center justify-between mb-4 hover:bg-blue-100/50 rounded-lg p-2 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg font-semibold text-blue-900">
                            Market Intelligence Compilation
                          </h3>
                          <p className="text-sm text-blue-700">
                            Compile strategic market intelligence from 4 source
                            panels
                          </p>
                        </div>
                      </div>
                      {expandedCompilationSections.marketIntelligence ? (
                        <ChevronUp className="w-5 h-5 text-blue-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-blue-600" />
                      )}
                    </button>

                    {expandedCompilationSections.marketIntelligence && (
                      <div className="space-y-4">
                        {/* Compile All Button */}
                        <div className="flex justify-end">
                          <Button
                            onClick={compileAllMarketIntelligence}
                            disabled={products.some(
                              (p) =>
                                settings.marketIntelligenceStatus?.[p.id] ===
                                'compiling'
                            )}
                            className="flex items-center space-x-2"
                            size="sm"
                          >
                            <RefreshCw
                              className={`w-4 h-4 ${
                                products.some(
                                  (p) =>
                                    settings.marketIntelligenceStatus?.[
                                      p.id
                                    ] === 'compiling'
                                )
                                  ? 'animate-spin'
                                  : ''
                              }`}
                            />
                            <span>Compile All Market Intelligence</span>
                          </Button>
                        </div>

                        <div className="space-y-3">
                          {products.map((product) => (
                            <div
                              key={`market-intelligence-${product.id}`}
                              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">
                                  {product.name}
                                </h4>
                                <p className="text-xs text-gray-600 mt-1">
                                  {getMarketIntelligenceStatusText(product.id)}
                                </p>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    navigate(
                                      `/product/${product.id}?tab=market-intelligence`
                                    )
                                  }
                                  className="flex items-center space-x-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>View</span>
                                </Button>

                                {(settings.marketIntelligenceCount?.[
                                  product.id
                                ] || 0) > 0 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      resetMarketIntelligenceCount(product.id)
                                    }
                                    className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
                                    title="Reset compilation count"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                  </Button>
                                )}

                                <Button
                                  onClick={() =>
                                    compileMarketIntelligence(product.id)
                                  }
                                  disabled={
                                    settings.marketIntelligenceStatus?.[
                                      product.id
                                    ] === 'compiling'
                                  }
                                  className="flex items-center space-x-1"
                                  size="sm"
                                >
                                  <RefreshCw
                                    className={`w-3 h-3 ${
                                      settings.marketIntelligenceStatus?.[
                                        product.id
                                      ] === 'compiling'
                                        ? 'animate-spin'
                                        : ''
                                    }`}
                                  />
                                  <span>
                                    {settings.marketIntelligenceStatus?.[
                                      product.id
                                    ] === 'compiling'
                                      ? 'Compiling...'
                                      : 'Compile'}
                                  </span>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Product Strategy Compilation Panel */}
                <Card className="border-2 border-blue-100 bg-blue-50/30">
                  <div className="p-6">
                    <button
                      onClick={() =>
                        toggleCompilationSection('productStrategy')
                      }
                      className="w-full flex items-center justify-between mb-4 hover:bg-blue-100/50 rounded-lg p-2 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Target className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg font-semibold text-blue-900">
                            Product Strategy Compilation
                          </h3>
                          <p className="text-sm text-blue-700">
                            Compile strategic product roadmap from Product
                            Manifesto, User Stories, Business Model, and
                            Functional Spec
                          </p>
                        </div>
                      </div>
                      {expandedCompilationSections.productStrategy ? (
                        <ChevronUp className="w-5 h-5 text-blue-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-blue-600" />
                      )}
                    </button>

                    {expandedCompilationSections.productStrategy && (
                      <div className="space-y-4">
                        {/* Compile All Button */}
                        <div className="flex justify-end">
                          <Button
                            onClick={compileAllProductStrategy}
                            disabled={products.some(
                              (p) =>
                                settings.productStrategyStatus?.[p.id] ===
                                'compiling'
                            )}
                            className="flex items-center space-x-2"
                            size="sm"
                          >
                            <RefreshCw
                              className={`w-4 h-4 ${
                                products.some(
                                  (p) =>
                                    settings.productStrategyStatus?.[p.id] ===
                                    'compiling'
                                )
                                  ? 'animate-spin'
                                  : ''
                              }`}
                            />
                            <span>Compile All Product Strategy</span>
                          </Button>
                        </div>

                        <div className="space-y-3">
                          {products.map((product) => (
                            <div
                              key={`product-strategy-${product.id}`}
                              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">
                                  {product.name}
                                </h4>
                                <p className="text-xs text-gray-600 mt-1">
                                  {getProductStrategyStatusText(product.id)}
                                </p>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    navigate(
                                      `/product/${product.id}?tab=product-strategy`
                                    )
                                  }
                                  className="flex items-center space-x-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>View</span>
                                </Button>

                                {(settings.productStrategyCount?.[product.id] ||
                                  0) > 0 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      resetProductStrategyCount(product.id)
                                    }
                                    className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
                                    title="Reset compilation count"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                  </Button>
                                )}

                                <Button
                                  onClick={() =>
                                    compileProductStrategy(product.id)
                                  }
                                  disabled={
                                    settings.productStrategyStatus?.[
                                      product.id
                                    ] === 'compiling'
                                  }
                                  className="flex items-center space-x-1"
                                  size="sm"
                                >
                                  <RefreshCw
                                    className={`w-3 h-3 ${
                                      settings.productStrategyStatus?.[
                                        product.id
                                      ] === 'compiling'
                                        ? 'animate-spin'
                                        : ''
                                    }`}
                                  />
                                  <span>
                                    {settings.productStrategyStatus?.[
                                      product.id
                                    ] === 'compiling'
                                      ? 'Compiling...'
                                      : 'Compile'}
                                  </span>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <Card className="border-2 border-dashed border-gray-200 bg-gray-50/50">
                    <div className="p-6 text-center">
                      <div className="p-3 bg-gray-100 rounded-lg w-fit mx-auto mb-3">
                        <FileText className="w-6 h-6 text-gray-400" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-600 mb-1">
                        Additional Compilation Types
                      </h3>
                      <p className="text-xs text-gray-500">
                        Future compilation types can be added here
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Queue Management */}
        <Card className="mt-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Queue Management
                </h2>
                <p className="text-gray-600 mt-1">
                  Advanced compilation queue with priority management and monitoring
                </p>
              </div>
            </div>
            <QueueManagementPanel />
          </div>
        </Card>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-2">
            How Content Compilation Works
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • <strong>Marketing & Sales:</strong> Merges Key Messages, Demo
              Script, Slide Headlines, and Q&A Prep into unified sales
              enablement pages
            </li>
            <li>
              • <strong>Performance:</strong> Pre-compiled content loads
              instantly for users
            </li>
            <li>
              • <strong>Manual Control:</strong> You decide when to regenerate
              content
            </li>
            <li>
              • <strong>Extensible:</strong> Framework designed to support
              additional content types
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
