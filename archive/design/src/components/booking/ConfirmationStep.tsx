import React from 'react';
import { CheckCircle, Calendar, Clock, Mail, Download, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { BookingData } from '../../types/booking';

interface ConfirmationStepProps {
  bookingData: BookingData;
  onClose: () => void;
}

export default function ConfirmationStep({ bookingData, onClose }: ConfirmationStepProps) {
  const timeSlots = [
    { id: '09:00', time: '9:00 AM' },
    { id: '10:00', time: '10:00 AM' },
    { id: '11:00', time: '11:00 AM' },
    { id: '14:00', time: '2:00 PM' },
    { id: '15:00', time: '3:00 PM' },
    { id: '16:00', time: '4:00 PM' },
  ];

  const selectedTimeSlot = timeSlots.find(slot => slot.id === bookingData.selectedTime);

  const handleDownloadCalendar = () => {
    // Generate calendar event
    const startDate = new Date(bookingData.selectedDate!);
    const [hours, minutes] = bookingData.selectedTime!.split(':');
    startDate.setHours(parseInt(hours), parseInt(minutes));
    
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 1);

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//BrilliantNoise AI Power Hour//EN',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      'SUMMARY:BrilliantNoise AI Power Hour Session',
      `DESCRIPTION:Your personalized AI coaching session with BrilliantNoise.\\n\\nChallenge: ${bookingData.customerInfo.challenge}`,
      `ORGANIZER:mailto:hello@brilliantnoise.com`,
      `ATTENDEE:mailto:${bookingData.customerInfo.email}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'brilliantnoise-ai-power-hour.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="text-center space-y-8">
      <div className="flex justify-center">
        <div className="bg-green-100 rounded-full p-4">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
        <p className="text-gray-600">
          Your AI Power Hour session has been successfully booked. We're excited to help you unlock AI's potential!
        </p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg p-6 max-w-md mx-auto">
        <h4 className="font-semibold text-gray-900 mb-4">Session Details</h4>
        
        <div className="space-y-3 text-left">
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">
                {bookingData.selectedDate ? format(bookingData.selectedDate, 'EEEE, MMMM d, yyyy') : 'Date not available'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <div className="font-medium text-gray-900">
              {selectedTimeSlot ? selectedTimeSlot.time : 'Time not available'}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-blue-600" />
            <div className="font-medium text-gray-900">
              {bookingData.customerInfo.email}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h5 className="font-medium text-yellow-800 mb-2">What happens next?</h5>
          <ul className="text-sm text-yellow-700 space-y-1 text-left">
            <li>• You'll receive a confirmation email with session details</li>
            <li>• A calendar invite will be sent to your email</li>
            <li>• We'll send you a pre-session questionnaire</li>
            <li>• Join the session using the link provided in your email</li>
          </ul>
        </div>

        <button
          onClick={handleDownloadCalendar}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Add to Calendar</span>
        </button>
      </div>

      <div className="pt-6">
        <button
          onClick={onClose}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
        >
          <span>Done</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="text-sm text-gray-500">
        <p>Questions? Contact us at <a href="mailto:hello@brilliantnoise.com" className="text-blue-600 hover:underline">hello@brilliantnoise.com</a></p>
      </div>
    </div>
  );
}