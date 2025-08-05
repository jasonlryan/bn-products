import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, User, Mail, Building, Briefcase, MessageSquare } from 'lucide-react';
import { BookingData } from '../../types/booking';

interface CustomerInfoStepProps {
  bookingData: BookingData;
  updateBookingData: (updates: Partial<BookingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function CustomerInfoStep({ bookingData, updateBookingData, onNext, onPrev }: CustomerInfoStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof BookingData['customerInfo'], value: string) => {
    updateBookingData({
      customerInfo: {
        ...bookingData.customerInfo,
        [field]: value
      }
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const { customerInfo } = bookingData;

    if (!customerInfo.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!customerInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!customerInfo.company.trim()) {
      newErrors.company = 'Company is required';
    }

    if (!customerInfo.role.trim()) {
      newErrors.role = 'Role is required';
    }

    if (!customerInfo.challenge.trim()) {
      newErrors.challenge = 'Please describe your AI challenge or goal';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Tell Us About Yourself</h3>
        <p className="text-gray-600">Help us personalize your AI Power Hour session to your specific needs and goals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="h-4 w-4 inline mr-1" />
            Full Name *
          </label>
          <input
            type="text"
            value={bookingData.customerInfo.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your full name"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="h-4 w-4 inline mr-1" />
            Email Address *
          </label>
          <input
            type="email"
            value={bookingData.customerInfo.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your email address"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building className="h-4 w-4 inline mr-1" />
            Company *
          </label>
          <input
            type="text"
            value={bookingData.customerInfo.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.company ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your company name"
          />
          {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Briefcase className="h-4 w-4 inline mr-1" />
            Role/Title *
          </label>
          <input
            type="text"
            value={bookingData.customerInfo.role}
            onChange={(e) => handleInputChange('role', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.role ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., Chief Innovation Officer, VP Marketing"
          />
          {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MessageSquare className="h-4 w-4 inline mr-1" />
          AI Challenge or Goal *
        </label>
        <textarea
          value={bookingData.customerInfo.challenge}
          onChange={(e) => handleInputChange('challenge', e.target.value)}
          rows={4}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            errors.challenge ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Describe the specific AI challenge you're facing or the goal you want to achieve. This helps us tailor the session to your needs."
        />
        {errors.challenge && <p className="text-red-500 text-sm mt-1">{errors.challenge}</p>}
        <p className="text-sm text-gray-500 mt-2">
          Examples: "Implementing AI in customer service", "Understanding AI for marketing automation", "Evaluating AI tools for operations"
        </p>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
        >
          <span>Continue to Payment</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}