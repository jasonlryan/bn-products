import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CreditCard, Lock, Calendar, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { BookingData } from '../../types/booking';

interface PaymentStepProps {
  bookingData: BookingData;
  updateBookingData: (updates: Partial<BookingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function PaymentStep({ bookingData, updateBookingData, onNext, onPrev }: PaymentStepProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCardInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'number') {
      // Format card number with spaces
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) formattedValue = formattedValue.slice(0, 19);
    } else if (field === 'expiry') {
      // Format expiry as MM/YY
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      if (formattedValue.length > 5) formattedValue = formattedValue.slice(0, 5);
    } else if (field === 'cvc') {
      // Only allow numbers, max 4 digits
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setCardDetails(prev => ({ ...prev, [field]: formattedValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validatePayment = () => {
    const newErrors: Record<string, string> = {};

    if (!cardDetails.name.trim()) {
      newErrors.name = 'Cardholder name is required';
    }

    if (!cardDetails.number.replace(/\s/g, '')) {
      newErrors.number = 'Card number is required';
    } else if (cardDetails.number.replace(/\s/g, '').length < 13) {
      newErrors.number = 'Please enter a valid card number';
    }

    if (!cardDetails.expiry) {
      newErrors.expiry = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
      newErrors.expiry = 'Please enter a valid expiry date (MM/YY)';
    }

    if (!cardDetails.cvc) {
      newErrors.cvc = 'CVC is required';
    } else if (cardDetails.cvc.length < 3) {
      newErrors.cvc = 'Please enter a valid CVC';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validatePayment()) return;

    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would integrate with Stripe here
      updateBookingData({ paymentCompleted: true });
      onNext();
    } catch (error) {
      console.error('Payment failed:', error);
      setErrors({ general: 'Payment failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const timeSlots = [
    { id: '09:00', time: '9:00 AM' },
    { id: '10:00', time: '10:00 AM' },
    { id: '11:00', time: '11:00 AM' },
    { id: '14:00', time: '2:00 PM' },
    { id: '15:00', time: '3:00 PM' },
    { id: '16:00', time: '4:00 PM' },
  ];

  const selectedTimeSlot = timeSlots.find(slot => slot.id === bookingData.selectedTime);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Complete Your Booking</h3>
        <p className="text-gray-600">Secure payment to confirm your AI Power Hour session.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Booking Summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-6">Booking Summary</h4>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-700">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">
                  {bookingData.selectedDate ? format(bookingData.selectedDate, 'EEEE, MMMM d, yyyy') : 'Date not selected'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-700">
              <Clock className="h-5 w-5 text-blue-600" />
              <div className="font-medium">
                {selectedTimeSlot ? selectedTimeSlot.time : 'Time not selected'}
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-700">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">{bookingData.customerInfo.name}</div>
                <div className="text-sm text-gray-500">{bookingData.customerInfo.email}</div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-6 pt-6">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total</span>
              <span>£300</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Includes 60-minute session + personalized follow-up materials
            </p>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Lock className="h-5 w-5 text-green-600" />
            <h4 className="text-lg font-medium text-gray-900">Secure Payment</h4>
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cardholder Name *
              </label>
              <input
                type="text"
                value={cardDetails.name}
                onChange={(e) => handleCardInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter cardholder name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cardDetails.number}
                  onChange={(e) => handleCardInputChange('number', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.number ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="1234 5678 9012 3456"
                />
                <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date *
                </label>
                <input
                  type="text"
                  value={cardDetails.expiry}
                  onChange={(e) => handleCardInputChange('expiry', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.expiry ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="MM/YY"
                />
                {errors.expiry && <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVC *
                </label>
                <input
                  type="text"
                  value={cardDetails.cvc}
                  onChange={(e) => handleCardInputChange('cvc', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.cvc ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="123"
                />
                {errors.cvc && <p className="text-red-500 text-sm mt-1">{errors.cvc}</p>}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Lock className="h-4 w-4" />
              <span>Your payment information is secure and encrypted</span>
            </div>
          </div>
        </div>
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
          onClick={handlePayment}
          disabled={isProcessing}
          className={`px-8 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 ${
            isProcessing
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Complete Payment - £300</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}