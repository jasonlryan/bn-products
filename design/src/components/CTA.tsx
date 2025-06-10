import React from 'react';
import { ArrowRight, Clock, Users, Award } from 'lucide-react';

interface CTAProps {
  onBookingClick?: () => void;
}

export default function CTA({ onBookingClick }: CTAProps) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Ready to Transform Your AI Understanding?
        </h2>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Join senior leaders who are leveraging AI for competitive advantage. 
          Book your personalized AI Power Hour session today.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="flex items-center justify-center space-x-3 text-gray-700">
            <Clock className="h-5 w-5 text-blue-600" />
            <span>60-minute focused session</span>
          </div>
          <div className="flex items-center justify-center space-x-3 text-gray-700">
            <Users className="h-5 w-5 text-teal-600" />
            <span>One-on-one coaching</span>
          </div>
          <div className="flex items-center justify-center space-x-3 text-gray-700">
            <Award className="h-5 w-5 text-blue-600" />
            <span>Expert follow-up materials</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={onBookingClick}
            className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-10 py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-teal-700 transition-all duration-200 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <span>Book Your AI Power Hour Now</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          <p className="text-gray-500 text-sm">
            Investment: <span className="font-semibold text-gray-700">£300</span> • Immediate booking confirmation
          </p>
        </div>
      </div>
    </section>
  );
}