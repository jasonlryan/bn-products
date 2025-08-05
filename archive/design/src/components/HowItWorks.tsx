import React from 'react';
import { Calendar, MessageSquare, FileText, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: Calendar,
    title: 'Book Your Session',
    description: 'Schedule your one-hour AI Power Hour session at a time that works for you.',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: MessageSquare,
    title: 'Deep Dive Session',
    description: 'Work one-on-one with an AI expert to tackle your specific challenge or task.',
    color: 'from-teal-500 to-teal-600'
  },
  {
    icon: FileText,
    title: 'Receive Resources',
    description: 'Get personalized follow-up materials tailored to your learning objectives.',
    color: 'from-blue-500 to-teal-500'
  },
  {
    icon: CheckCircle,
    title: 'Implement & Excel',
    description: 'Apply your new AI knowledge immediately with confidence and strategic insight.',
    color: 'from-teal-600 to-blue-600'
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Four simple steps to transform your AI understanding and capability
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 text-center h-full">
                <div className={`bg-gradient-to-r ${step.color} p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center`}>
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-blue-300 to-teal-300"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}