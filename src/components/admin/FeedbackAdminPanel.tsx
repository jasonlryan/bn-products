import React, { useState, useEffect } from 'react';
import { feedbackService, type FeedbackData } from '../../services/feedbackService';
import { Download, Filter } from 'lucide-react';
import { Button } from '../ui';

const FeedbackAdminPanel: React.FC = () => {
  const [feedback, setFeedback] = useState<FeedbackData[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    productName: '',
    activeTab: '',
  });

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const [allFeedback, feedbackStats] = await Promise.all([
        feedbackService.getAllFeedback(),
        feedbackService.getFeedbackStats(),
      ]);
      setFeedback(allFeedback);
      setStats(feedbackStats);
    } catch (error) {
      console.error('Error loading feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportFeedback = () => {
    const csvContent = [
      ['ID', 'Product Name', 'Active Tab', 'Comment', 'Timestamp', 'URL'],
      ...feedback.map(f => [
        f.id,
        f.productName,
        f.activeTab,
        f.comment.replace(/"/g, '""'),
        f.timestamp,
        f.url,
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredFeedback = feedback.filter(f => {
    if (filter.productName && f.productName !== filter.productName) return false;
    if (filter.activeTab && f.activeTab !== filter.activeTab) return false;
    return true;
  });

  const uniqueProducts = [...new Set(feedback.map(f => f.productName))];
  const uniqueTabs = [...new Set(feedback.map(f => f.activeTab))];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-center text-gray-600 mt-2">Loading feedback...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Feedback Management</h2>
        <Button onClick={exportFeedback} className="flex items-center space-x-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-600">Total Feedback</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Object.keys(stats.byProduct).length}
            </div>
            <div className="text-sm text-purple-600">Products with Feedback</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {Object.keys(stats.byActiveTab).length}
            </div>
            <div className="text-sm text-orange-600">Active Tabs with Feedback</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-700">Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={filter.productName}
            onChange={(e) => setFilter(prev => ({ ...prev, productName: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Products</option>
            {uniqueProducts.map(productName => (
              <option key={productName} value={productName}>{productName}</option>
            ))}
          </select>
          <select
            value={filter.activeTab}
            onChange={(e) => setFilter(prev => ({ ...prev, activeTab: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Tabs</option>
            {uniqueTabs.map(activeTab => (
              <option key={activeTab} value={activeTab}>{activeTab}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No feedback found matching the current filters.
          </div>
        ) : (
          filteredFeedback.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-sm text-gray-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {item.activeTab}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Product:</span> {item.productName}
                    <span className="mx-2">•</span>
                    <span className="font-medium">Tab:</span> {item.activeTab}
                  </div>
                  {item.comment && (
                    <p className="text-gray-700 text-sm">{item.comment}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FeedbackAdminPanel; 