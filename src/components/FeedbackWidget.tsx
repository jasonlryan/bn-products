import React, { useState } from 'react';
import { MessageSquare, X, Check } from 'lucide-react';
import {
  feedbackService,
  type FeedbackData,
} from '../services/feedbackService';
import { Button } from './ui';

interface FeedbackWidgetProps {
  page: string;
  productId?: string;
  className?: string;
}

const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  page,
  productId,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'page' | 'product'>('page');
  const [comment, setComment] = useState('');
  const [productComment, setProductComment] = useState('');
  const [category, setCategory] = useState<FeedbackData['category']>('general');
  const [productCategory, setProductCategory] = useState<FeedbackData['category']>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentComment = activeTab === 'page' ? comment : productComment;
    const currentCategory = activeTab === 'page' ? category : productCategory;
    
    if (currentComment.trim() === '') return;

    setIsSubmitting(true);
    try {
      const success = await feedbackService.submitFeedback({
        page: activeTab === 'page' ? page : 'product',
        productId: activeTab === 'product' ? productId : undefined,
        comment: currentComment,
        category: currentCategory,
        userAgent: navigator.userAgent,
        url: window.location.href,
      });

      if (success) {
        setIsSubmitted(true);
        setTimeout(() => {
          setIsOpen(false);
          setIsSubmitted(false);
          setComment('');
          setProductComment('');
          setCategory('general');
          setProductCategory('general');
          setActiveTab('page');
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'content', label: 'Content' },
    { value: 'ui', label: 'UI/UX' },
  ] as const;

  if (isSubmitted) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <div className="bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-center space-x-2">
          <Check className="w-5 h-5" />
          <span>Thank you for your feedback!</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hidden Feedback Button - triggered by footer CTA */}
      <button
        onClick={() => setIsOpen(true)}
        className={`hidden ${className}`}
        aria-label="Give feedback"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Feedback Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Give Feedback
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b">
              <button
                type="button"
                onClick={() => setActiveTab('page')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'page'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Page Feedback
              </button>
              {productId && (
                <button
                  type="button"
                  onClick={() => setActiveTab('product')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'product'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Product Feedback
                </button>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Context Info */}
              <div className="text-sm text-gray-600">
                {activeTab === 'page' ? (
                  <p>
                    Page: <span className="font-medium">{page}</span>
                  </p>
                ) : (
                  <p>
                    Product: <span className="font-medium">{productId}</span>
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={activeTab === 'page' ? category : productCategory}
                  onChange={(e) => {
                    const value = e.target.value as FeedbackData['category'];
                    if (activeTab === 'page') {
                      setCategory(value);
                    } else {
                      setProductCategory(value);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {activeTab === 'page' ? 'How can this page be improved?' : 'How can this product be improved?'}
                </label>
                <textarea
                  value={activeTab === 'page' ? comment : productComment}
                  onChange={(e) => {
                    if (activeTab === 'page') {
                      setComment(e.target.value);
                    } else {
                      setProductComment(e.target.value);
                    }
                  }}
                  rows={8}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-base"
                  placeholder={activeTab === 'page' ? 'Tell us what you think about this page...' : 'Tell us what you think about this product...'}
                />
              </div>

              {/* Submit Button */}
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={(activeTab === 'page' ? comment.trim() === '' : productComment.trim() === '') || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Submitting...' : `Submit ${activeTab === 'page' ? 'Page' : 'Product'} Feedback`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackWidget;
