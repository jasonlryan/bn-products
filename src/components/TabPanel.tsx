import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { panelConfigManager } from '../utils/panelConfig';

interface TabPanelProps {
  id: string;
  title: string;
  children: React.ReactNode;
  productId: string;
  tabId: string;
}

const TabPanel: React.FC<TabPanelProps> = ({
  id,
  title,
  children,
  productId,
  tabId,
}) => {
  const isCollapsed = panelConfigManager.getPanelCollapsedState(
    productId,
    tabId,
    id
  );

  const toggleCollapsed = () => {
    panelConfigManager.updatePanelCollapsed(productId, tabId, id, !isCollapsed);
    // Force re-render by triggering a state update in parent
    window.dispatchEvent(new CustomEvent('panelConfigChanged'));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition-colors">
        <div className="flex items-center flex-1">
          <h3 className="text-lg font-semibold text-gray-900 flex-1">
            {title}
          </h3>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleCollapsed}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            aria-label={isCollapsed ? 'Expand panel' : 'Collapse panel'}
          >
            {isCollapsed ? (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {!isCollapsed && <div className="p-6">{children}</div>}

      {isCollapsed && (
        <div className="p-4 text-center text-gray-500 text-sm bg-gray-25">
          Click to expand content
        </div>
      )}
    </div>
  );
};

export default TabPanel;
