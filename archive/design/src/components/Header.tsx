import React from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onBookingClick?: () => void;
}

export default function Header({ mobileMenuOpen, setMobileMenuOpen, onBookingClick }: HeaderProps) {
  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <img 
              src="/bn-blue (1).png" 
              alt="BrilliantNoise" 
              className="h-8 w-auto"
            />
            <div className="border-l border-gray-300 pl-3">
              <span className="text-xl font-bold text-gray-900">AI Power Hour</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors">
              How It Works
            </a>
            <a href="#benefits" className="text-gray-700 hover:text-blue-600 transition-colors">
              Benefits
            </a>
            <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition-colors">
              Testimonials
            </a>
            <button 
              onClick={onBookingClick}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Book Session
            </button>
          </nav>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-900" />
            ) : (
              <Menu className="h-6 w-6 text-gray-900" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-4">
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors">
                How It Works
              </a>
              <a href="#benefits" className="text-gray-700 hover:text-blue-600 transition-colors">
                Benefits
              </a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition-colors">
                Testimonials
              </a>
              <button 
                onClick={onBookingClick}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-left"
              >
                Book Session
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}