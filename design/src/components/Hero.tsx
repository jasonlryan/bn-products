import React from 'react';
import { ArrowRight, Zap } from 'lucide-react';

interface HeroProps {
  onBookingClick?: () => void;
}

export default function Hero({ onBookingClick }: HeroProps) {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-teal-50 py-20 overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23e0f2fe%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-pulse">
            <Zap className="h-4 w-4" />
            <span>Transform Your AI Understanding in 60 Minutes</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Unlock AI's Potential with{' '}
            <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Personalized Coaching
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Dive into a tailored one-hour session with AI Power Hour and transform your understanding of 
            Artificial Intelligence. Designed for high-level executives, our platform helps you leverage 
            AI for strategic advantage, enhanced customer experience, and innovation.
          </p>
          
          <div className="flex flex-col items-center gap-4 mb-16">
            <button 
              onClick={onBookingClick}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span>Book Your AI Power Hour Now</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <div className="text-gray-500 text-lg">
              <span className="font-semibold text-gray-700">£300</span> • One-hour session + follow-up materials
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">60 min</div>
              <div className="text-gray-600">Focused Session</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 mb-2">1:1</div>
              <div className="text-gray-600">Personal Coaching</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">Expert</div>
              <div className="text-gray-600">Tailored Resources</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}