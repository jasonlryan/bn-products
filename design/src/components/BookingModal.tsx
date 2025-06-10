import React, { useState } from 'react';
import { X } from 'lucide-react';
import CalendarStep from './booking/CalendarStep';
import CustomerInfoStep from './booking/CustomerInfoStep';
import PaymentStep from './booking/PaymentStep';
import ConfirmationStep from './booking/ConfirmationStep';
import { BookingData } from '../types/booking';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    selectedDate: null,
    selectedTime: null,
    customerInfo: {
      name: '',
      email: '',
      company: '',
      role: '',
      challenge: ''
    },
    paymentCompleted: false
  });

  const updateBookingData = (updates: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const resetBooking = () => {
    setCurrentStep(1);
    setBookingData({
      selectedDate: null,
      selectedTime: null,
      customerInfo: {
        name: '',
        email: '',
        company: '',
        role: '',
        challenge: ''
      },
      paymentCompleted: false
    });
  };

  const handleClose = () => {
    resetBooking();
    onClose();
  };

  if (!isOpen) return null;

  const steps = [
    { number: 1, title: 'Select Date & Time' },
    { number: 2, title: 'Your Information' },
    { number: 3, title: 'Payment' },
    { number: 4, title: 'Confirmation' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <img 
              src="/bn-blue (1).png" 
              alt="BrilliantNoise" 
              className="h-6 w-auto"
            />
            <div className="border-l border-gray-300 pl-4">
              <h2 className="text-xl font-bold text-gray-900">Book Your AI Power Hour</h2>
              <div className="text-sm text-gray-500">£300</div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep >= step.number
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.number}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {currentStep === 1 && (
            <CalendarStep
              bookingData={bookingData}
              updateBookingData={updateBookingData}
              onNext={nextStep}
            />
          )}
          {currentStep === 2 && (
            <CustomerInfoStep
              bookingData={bookingData}
              updateBookingData={updateBookingData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          {currentStep === 3 && (
            <PaymentStep
              bookingData={bookingData}
              updateBookingData={updateBookingData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          {currentStep === 4 && (
            <ConfirmationStep
              bookingData={bookingData}
              onClose={handleClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}