export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface BookingData {
  selectedDate: Date | null;
  selectedTime: string | null;
  customerInfo: {
    name: string;
    email: string;
    company: string;
    role: string;
    challenge: string;
  };
  paymentCompleted: boolean;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isAvailable: boolean;
}