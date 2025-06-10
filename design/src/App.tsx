import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Benefits from './components/Benefits';
import HowItWorks from './components/HowItWorks';
import Testimonial from './components/Testimonial';
import CTA from './components/CTA';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const handleBookingClick = () => {
    setBookingModalOpen(true);
    setMobileMenuOpen(false); // Close mobile menu if open
  };

  const handleBookingClose = () => {
    setBookingModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen}
        onBookingClick={handleBookingClick}
      />
      <Hero onBookingClick={handleBookingClick} />
      <Benefits />
      <HowItWorks />
      <Testimonial />
      <CTA onBookingClick={handleBookingClick} />
      <Footer onBookingClick={handleBookingClick} />
      
      <BookingModal 
        isOpen={bookingModalOpen}
        onClose={handleBookingClose}
      />
    </div>
  );
}

export default App;