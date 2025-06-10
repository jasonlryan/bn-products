import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, ArrowRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths, isAfter, startOfDay } from 'date-fns';
import { BookingData, TimeSlot, CalendarDay } from '../../types/booking';

interface CalendarStepProps {
  bookingData: BookingData;
  updateBookingData: (updates: Partial<BookingData>) => void;
  onNext: () => void;
}

const timeSlots: TimeSlot[] = [
  { id: '09:00', time: '9:00 AM', available: true },
  { id: '10:00', time: '10:00 AM', available: true },
  { id: '11:00', time: '11:00 AM', available: false },
  { id: '14:00', time: '2:00 PM', available: true },
  { id: '15:00', time: '3:00 PM', available: true },
  { id: '16:00', time: '4:00 PM', available: true },
];

export default function CalendarStep({ bookingData, updateBookingData, onNext }: CalendarStepProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const calendarDays: CalendarDay[] = days.map(date => ({
    date,
    isCurrentMonth: isSameMonth(date, currentMonth),
    isToday: isToday(date),
    isSelected: bookingData.selectedDate ? isSameDay(date, bookingData.selectedDate) : false,
    isAvailable: isAfter(date, startOfDay(new Date())) || isToday(date)
  }));

  const handleDateSelect = (date: Date) => {
    if (!isAfter(date, startOfDay(new Date())) && !isToday(date)) return;
    
    updateBookingData({ 
      selectedDate: date,
      selectedTime: null // Reset time when date changes
    });
  };

  const handleTimeSelect = (timeId: string) => {
    updateBookingData({ selectedTime: timeId });
  };

  const canProceed = bookingData.selectedDate && bookingData.selectedTime;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Your Preferred Date & Time</h3>
        <p className="text-gray-600">Choose a date and time that works best for your AI Power Hour session.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-medium text-gray-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h4>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <button
                key={index}
                onClick={() => handleDateSelect(day.date)}
                disabled={!day.isAvailable}
                className={`
                  aspect-square flex items-center justify-center text-sm rounded-lg transition-all duration-200
                  ${day.isSelected 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : day.isAvailable
                      ? 'hover:bg-blue-100 text-gray-900'
                      : 'text-gray-300 cursor-not-allowed'
                  }
                  ${day.isToday && !day.isSelected ? 'bg-blue-50 text-blue-600 font-medium' : ''}
                `}
              >
                {format(day.date, 'd')}
              </button>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Clock className="h-5 w-5 text-gray-600" />
            <h4 className="text-lg font-medium text-gray-900">Available Times</h4>
          </div>

          {bookingData.selectedDate ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Times for {format(bookingData.selectedDate, 'EEEE, MMMM d, yyyy')}
              </p>
              {timeSlots.map(slot => (
                <button
                  key={slot.id}
                  onClick={() => handleTimeSelect(slot.id)}
                  disabled={!slot.available}
                  className={`
                    w-full p-3 rounded-lg text-left transition-all duration-200
                    ${bookingData.selectedTime === slot.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : slot.available
                        ? 'bg-white hover:bg-blue-50 text-gray-900 border border-gray-200'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{slot.time}</span>
                    {!slot.available && (
                      <span className="text-xs">Unavailable</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Please select a date to view available times</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`
            px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200
            ${canProceed
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <span>Continue</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}