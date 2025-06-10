import React from 'react';
import { Target, Lightbulb, TrendingUp } from 'lucide-react';

const benefits = [
  {
    icon: Target,
    title: 'Personalized Guidance',
    description: 'Our one-on-one coaching session provides you with a deep dive into an AI-related task or challenge of your choice, offering you real-world solutions and practical problem-solving strategies.'
  },
  {
    icon: TrendingUp,
    title: 'Immediate Strategic Value',
    description: 'With AI Power Hour, you won\'t just learn about AI—you\'ll understand how to apply it strategically in your role. Our sessions equip you with actionable insights that you can implement immediately.'
  },
  {
    icon: Lightbulb,
    title: 'Lasting Impact',
    description: 'Our tailored follow-up materials ensure that your AI learning journey doesn\'t end with the session. Continue building your AI literacy and confidence with resources designed for lasting impact.'
  }
];

export default function Benefits() {
  return (
    <section id="benefits" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose AI Power Hour?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Accelerate your AI literacy with personalized guidance that delivers immediate strategic value
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="bg-gradient-to-br from-blue-50 to-teal-50 p-8 rounded-xl border border-blue-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-2"
            >
              <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-3 rounded-lg w-fit mb-6">
                <benefit.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {benefit.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}