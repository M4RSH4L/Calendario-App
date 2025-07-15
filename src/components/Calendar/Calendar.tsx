import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Event } from '../../types';
import { dbHelpers } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';

interface CalendarProps {
  onDateSelect: (date: string) => void;
  onEventCreate: () => void;
  selectedDate: string;
}

const Calendar: React.FC<CalendarProps> = ({ onDateSelect, onEventCreate, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const { data: allEvents, error } = await dbHelpers.getEvents();
      if (error) {
        console.error('Error loading events:', error);
        return;
      }
      setEvents(allEvents || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatDateString = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return new Date(year, month, day).toISOString().split('T')[0];
  };

  const getEventsForDate = (day: number) => {
    const dateString = formatDateString(day);
    return events.filter(event => event.date === dateString);
  };

  const isSelectedDate = (day: number) => {
    const dateString = formatDateString(day);
    return dateString === selectedDate;
  };

  const isToday = (day: number) => {
    const today = new Date();
    const dateString = formatDateString(day);
    const todayString = today.toISOString().split('T')[0];
    return dateString === todayString;
  };

  const days = getDaysInMonth(currentDate);
  const monthYear = currentDate.toLocaleDateString('es-ES', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="backdrop-blur-md bg-white/10 rounded-3xl border border-white/20 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white capitalize">{monthYear}</h2>
        <div className="flex items-center space-x-2">
          {user && (
            <button
              onClick={onEventCreate}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-2 rounded-xl transition-all duration-300 transform hover:scale-105"
              title="Crear nuevo evento"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => navigateMonth('prev')}
            className="bg-black/30 hover:bg-white/10 text-white p-2 rounded-xl transition-all duration-300"
            title="Mes anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="bg-black/30 hover:bg-white/10 text-white p-2 rounded-xl transition-all duration-300"
            title="Mes siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="text-center text-gray-400 font-medium py-2">
            {day}
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={index} className="h-12" />;
          }

          const dayEvents = getEventsForDate(day);
          const isSelected = isSelectedDate(day);
          const isTodayDate = isToday(day);

          return (
            <button
              key={day}
              onClick={() => onDateSelect(formatDateString(day))}
              className={`h-12 relative rounded-xl transition-all duration-300 text-sm font-medium ${
                isSelected
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : isTodayDate
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <span>{day}</span>
              {dayEvents.length > 0 && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {dayEvents.slice(0, 3).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-1 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-purple-400'
                      }`}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-purple-400">+</div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;