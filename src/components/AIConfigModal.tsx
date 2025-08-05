import { useState, useEffect } from 'react';
import { Settings, Key, Save, X, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui';
import { aiService } from '../services/aiService';

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIConfigModal({ isOpen, onClose }: AIConfigModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Load existing API key if available
      const existingKey = localStorage.getItem('openai_api_key');
      if (existingKey) {
        setApiKey(existingKey);
        setIsValid(true);
      }
    }
  }, [isOpen]);

  const validateApiKey = (key: string) => {
    // Basic validation - OpenAI keys start with 'sk-' and are typically 51 characters
    const isValidFormat = key.startsWith('sk-') && key.length >= 20;
    setIsValid(isValidFormat);
    return isValidFormat;
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    validateApiKey(value);
  };

  const handleSave = async () => {
    if (!isValid) return;

    setIsSaving(true);
    try {
      // Test the API key with a simple request
      aiService.setApiKey(apiKey);

      // You could add a test call here to verify the key works
      // For now, we'll just save it

      alert('API key saved successfully!');
      onClose();
    } catch (error) {
      alert("Failed to save API key. Please check if it's valid.");
      console.error('API key validation failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = () => {
    localStorage.removeItem('openai_api_key');
    setApiKey('');
    setIsValid(false);
    alert('API key removed successfully!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              AI Configuration
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Key className="w-4 h-4 inline mr-1" />
              OpenAI API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                placeholder="sk-..."
                className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  apiKey && !isValid
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
              >
                {showApiKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
            {apiKey && !isValid && (
              <p className="text-sm text-red-600 mt-1">
                Please enter a valid OpenAI API key (starts with 'sk-')
              </p>
            )}
            {isValid && (
              <p className="text-sm text-green-600 mt-1">
                ✓ Valid API key format
              </p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              How to get your API key:
            </h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>
                1. Go to{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  platform.openai.com/api-keys
                </a>
              </li>
              <li>2. Click "Create new secret key"</li>
              <li>3. Copy the key and paste it here</li>
            </ol>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-900 mb-1">
              Privacy Notice:
            </h3>
            <p className="text-sm text-yellow-800">
              Your API key is stored locally in your browser and never sent to
              our servers.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200">
          <div>
            {aiService.hasApiKey() && (
              <Button
                variant="outline"
                onClick={handleRemove}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Remove Key
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isValid || isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
