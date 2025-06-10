import React from 'react';
import { Mail, Phone } from 'lucide-react';

interface FooterProps {
  onBookingClick?: () => void;
}

export default function Footer({ onBookingClick }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/bn-blue (1).png" 
                alt="BrilliantNoise" 
                className="h-8 w-auto brightness-0 invert"
              />
              <div className="border-l border-gray-600 pl-3">
                <span className="text-xl font-bold">AI Power Hour</span>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Personalized AI coaching for senior leaders and executives. 
              Transform your understanding of AI in just one hour.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Perfect For</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Senior Leaders</li>
              <li>Functional Heads</li>
              <li>Innovation Directors</li>
              <li>Transformation Leaders</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Get Started</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-400">
                <Mail className="h-4 w-4" />
                <span>hello@brilliantnoise.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Phone className="h-4 w-4" />
                <span>+44 (0) 20 1234 5678</span>
              </div>
              <button 
                onClick={onBookingClick}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Book Session
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 BrilliantNoise. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}