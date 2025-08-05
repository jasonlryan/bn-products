import React, { useState } from 'react';
import { X, RotateCcw, Download, Upload, Trash2 } from 'lucide-react';
import { panelConfigManager } from '../utils/panelConfig';

interface PanelConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  currentTab?: string;
}

const PanelConfigModal: React.FC<PanelConfigModalProps> = ({
  isOpen,
  onClose,
  productId,
  currentTab,
}) => {
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    const config = panelConfigManager.exportConfig();
    setExportData(config);
    setShowExport(true);
  };

  const handleImport = () => {
    if (importData.trim()) {
      const success = panelConfigManager.importConfig(importData);
      if (success) {
        alert('Configuration imported successfully!');
        setImportData('');
        setShowImport(false);
        window.dispatchEvent(new CustomEvent('panelConfigChanged'));
      } else {
        alert('Failed to import configuration. Please check the format.');
      }
    }
  };

  const handleResetProduct = () => {
    if (
      productId &&
      confirm('Reset all panel configurations for this product?')
    ) {
      panelConfigManager.resetProductConfig(productId);
      window.dispatchEvent(new CustomEvent('panelConfigChanged'));
      alert('Product configuration reset successfully!');
    }
  };

  const handleResetTab = () => {
    if (
      productId &&
      currentTab &&
      confirm('Reset panel configuration for this tab?')
    ) {
      panelConfigManager.resetTabConfig(productId, currentTab);
      window.dispatchEvent(new CustomEvent('panelConfigChanged'));
      alert('Tab configuration reset successfully!');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportData);
    alert('Configuration copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Panel Configuration
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Reset Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Reset Options</h3>

            {productId && currentTab && (
              <button
                onClick={handleResetTab}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Current Tab ({currentTab})</span>
              </button>
            )}

            {productId && (
              <button
                onClick={handleResetProduct}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset All Tabs for This Product</span>
              </button>
            )}
          </div>

          {/* Export/Import */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Backup & Restore
            </h3>

            <div className="flex space-x-3">
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export Configuration</span>
              </button>

              <button
                onClick={() => setShowImport(!showImport)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Import Configuration</span>
              </button>
            </div>

            {showExport && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Configuration Data (copy this to backup):
                </label>
                <textarea
                  value={exportData}
                  readOnly
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  Copy to Clipboard
                </button>
              </div>
            )}

            {showImport && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Paste Configuration Data:
                </label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Paste your configuration JSON here..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg text-sm font-mono"
                />
                <button
                  onClick={handleImport}
                  disabled={!importData.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Import Configuration
                </button>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              About Panel Configuration
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • Panel order and collapsed states are saved automatically
              </li>
              <li>• Configuration is stored locally in your browser</li>
              <li>• Each product and tab has its own configuration</li>
              <li>• Export/import to backup or share configurations</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PanelConfigModal;
