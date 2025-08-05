import { useState } from 'react';
import { Edit3, Save, X, Wand2, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from './ui';
import {
  aiService,
  type AIUpgradeRequest,
  type AIUpgradeResponse,
} from '../services/aiService';
import type { Product } from '../types/product';

interface EditableSectionProps {
  title: string;
  children: React.ReactNode;
  onSave?: (content: string) => void;
  initialContent?: string;
  isTextArea?: boolean;
  placeholder?: string;
  className?: string;
  contentType?:
    | 'heroTitle'
    | 'heroSubtitle'
    | 'description'
    | 'perfectFor'
    | 'feature'
    | 'benefit'
    | 'whatClientBuys'
    | 'idealClient';
  productContext?: Product;
}

export default function EditableSection({
  title,
  children,
  onSave,
  initialContent = '',
  isTextArea = false,
  placeholder = '',
  className = '',
  contentType,
  productContext,
}: EditableSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [isPolishing, setIsPolishing] = useState(false);
  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);
  const [upgradeResult, setUpgradeResult] = useState<AIUpgradeResponse | null>(
    null
  );
  const [apiKeyPrompt, setApiKeyPrompt] = useState(false);

  const handleSave = () => {
    if (onSave) {
      onSave(content);
    }
    setIsEditing(false);
    setUpgradeResult(null);
  };

  const handleCancel = () => {
    setContent(initialContent);
    setIsEditing(false);
    setUpgradeResult(null);
    setShowUpgradeOptions(false);
  };

  const handleAIUpgrade = async (
    upgradeType: 'polish' | 'expand' | 'persuasive' | 'technical' | 'emotional'
  ) => {
    if (!aiService.hasApiKey()) {
      setApiKeyPrompt(true);
      return;
    }

    if (!contentType || !productContext) {
      // Fallback to simple polish
      await handleSimplePolish();
      return;
    }

    setIsPolishing(true);
    setShowUpgradeOptions(false);

    try {
      const request: AIUpgradeRequest = {
        currentContent: content,
        contentType,
        productContext,
        upgradeType,
      };

      const result = await aiService.upgradeContent(request);
      setUpgradeResult(result);
      setContent(result.upgradedContent);
    } catch (error) {
      console.error('AI upgrade failed:', error);
      alert(
        `AI upgrade failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsPolishing(false);
    }
  };

  const handleSimplePolish = async () => {
    setIsPolishing(true);

    // Mock AI enhancement (fallback)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const enhancements = [
        { from: /\b(good|nice|great)\b/gi, to: 'exceptional' },
        { from: /\b(help|assist)\b/gi, to: 'empower' },
        { from: /\b(make|create)\b/gi, to: 'deliver' },
        { from: /\b(fast|quick)\b/gi, to: 'accelerated' },
      ];

      let polished = content;
      enhancements.forEach(({ from, to }) => {
        polished = polished.replace(from, to);
      });

      setContent(polished + ' ✨');
    } catch (error) {
      console.error('AI polishing failed:', error);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleSetApiKey = (apiKey: string) => {
    aiService.setApiKey(apiKey);
    setApiKeyPrompt(false);
  };

  if (!onSave) {
    // Non-editable section, just render children
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Edit button - appears on hover */}
      {!isEditing && (
        <Button
          onClick={() => setIsEditing(true)}
          size="sm"
          variant="ghost"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-md border z-10"
        >
          <Edit3 className="w-3 h-3" />
        </Button>
      )}

      {/* API Key Prompt Modal */}
      {apiKeyPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              OpenAI API Key Required
            </h3>
            <p className="text-gray-600 mb-4">
              To use AI-powered content upgrades, please enter your OpenAI API
              key:
            </p>
            <input
              type="password"
              placeholder="sk-..."
              className="w-full p-3 border rounded-lg mb-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSetApiKey(e.currentTarget.value);
                }
              }}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const input = document.querySelector(
                    'input[type="password"]'
                  ) as HTMLInputElement;
                  if (input?.value) {
                    handleSetApiKey(input.value);
                  }
                }}
                className="flex-1"
              >
                Save API Key
              </Button>
              <Button variant="outline" onClick={() => setApiKeyPrompt(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {isEditing ? (
        <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Editing: {title}</h4>
            <div className="flex gap-2">
              {/* AI Upgrade Options */}
              {contentType && productContext && (
                <div className="relative">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowUpgradeOptions(!showUpgradeOptions)}
                    disabled={isPolishing}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Upgrade
                  </Button>

                  {showUpgradeOptions && (
                    <div className="absolute top-full right-0 mt-1 bg-white border rounded-lg shadow-lg p-2 min-w-[200px] z-20">
                      <div className="space-y-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAIUpgrade('polish')}
                          className="w-full justify-start text-left"
                        >
                          ✨ Polish & Refine
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAIUpgrade('expand')}
                          className="w-full justify-start text-left"
                        >
                          📈 Expand with Details
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAIUpgrade('persuasive')}
                          className="w-full justify-start text-left"
                        >
                          🎯 Make Persuasive
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAIUpgrade('technical')}
                          className="w-full justify-start text-left"
                        >
                          🔧 Add Technical Depth
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAIUpgrade('emotional')}
                          className="w-full justify-start text-left"
                        >
                          ❤️ Enhance Emotional Appeal
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Simple Polish Button (fallback) */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleSimplePolish}
                disabled={isPolishing}
              >
                {isPolishing ? (
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Wand2 className="w-3 h-3 mr-1" />
                )}
                Polish
              </Button>

              <Button
                size="sm"
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-3 h-3 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>

          {/* Upgrade Result Display */}
          {upgradeResult && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm font-medium text-green-800 mb-1">
                AI Upgrade Applied
              </div>
              <div className="text-xs text-green-700 mb-2">
                {upgradeResult.reasoning}
              </div>
              {upgradeResult.suggestions.length > 0 && (
                <div className="text-xs text-green-600">
                  <strong>Suggestions:</strong>{' '}
                  {upgradeResult.suggestions.join(', ')}
                </div>
              )}
            </div>
          )}

          {isTextArea ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              rows={4}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            />
          ) : (
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
