import React, { useState } from 'react';
import { MessageSquare, X, Check } from 'lucide-react';
import {
  feedbackService,
  type FeedbackData,
} from '../services/feedbackService';
import { Button } from './ui';

interface FeedbackWidgetProps {
  productName: string;    // e.g. "Power Hour"
  activeTab: string;      // e.g. "Functional Spec", "Marketing & Sales"
  className?: string;
}

const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  productName,
  activeTab,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === '' || comment.trim() === '') return;

    setIsSubmitting(true);
    try {
      const success = await feedbackService.submitFeedback({
        name: name.trim(),
        productName,
        activeTab,
        comment: comment.trim(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });

      if (success) {
        setIsSubmitted(true);
        setTimeout(() => {
          setIsOpen(false);
          setIsSubmitted(false);
          setName('');
          setComment('');
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


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

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Context Info */}
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Product/Service:</span> {productName}
                </p>
                <p>
                  <span className="font-medium">Active Tab:</span> {activeTab}
                </p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                  placeholder="Enter your name"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How can this be improved?
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={8}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-base"
                  placeholder="Tell us what you think..."
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
                  disabled={name.trim() === '' || comment.trim() === '' || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
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
