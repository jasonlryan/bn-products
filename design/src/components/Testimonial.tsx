import React from 'react';
import { Quote, Star } from 'lucide-react';

export default function Testimonial() {
  return (
    <section id="testimonials" className="py-20 bg-gradient-to-br from-blue-600 to-teal-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <Quote className="h-12 w-12 text-blue-200 mx-auto mb-6" />
          <div className="flex justify-center mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
            ))}
          </div>
        </div>
        
        <blockquote className="text-xl md:text-2xl text-white mb-8 leading-relaxed font-light">
          "I came into the AI Power Hour session with curiosity and left with confidence. 
          The personalized approach helped me understand how AI can drive strategic initiatives 
          in my role. I was able to apply the insights from the session immediately and saw real impact. 
          The follow-up materials are a treasure trove for continuous learning."
        </blockquote>
        
        <div className="text-white">
          <div className="font-semibold text-lg">Jack</div>
          <div className="text-blue-200">Chief Innovation Officer</div>
        </div>
      </div>
    </section>
  );
}