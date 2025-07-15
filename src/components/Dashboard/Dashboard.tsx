import React, { useState, useEffect } from 'react';
import { LogOut, Settings, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Event } from '../../types';
import { dbHelpers } from '../../utils/supabaseClient';
import Calendar from '../Calendar/Calendar';
import EventList from '../Events/EventList';
import EventModal from '../Events/EventModal';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [todayEvents, setTodayEvents] = useState<Event[]>([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState<Event[]>([]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();

  useEffect(() => {
    loadTodayEvents();
  }, []);

  useEffect(() => {
    loadSelectedDateEvents();
  }, [selectedDate]);

  const loadTodayEvents = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: events, error } = await dbHelpers.getEventsByDate(today);
      if (error) {
        console.error('Error loading today events:', error);
        return;
      }
      setTodayEvents(events || []);
    } catch (error) {
      console.error('Error loading today events:', error);
    }
  };

  const loadSelectedDateEvents = async () => {
    try {
      const { data: events, error } = await dbHelpers.getEventsByDate(selectedDate);
      if (error) {
        console.error('Error loading selected date events:', error);
        return;
      }
      setSelectedDateEvents(events || []);
    } catch (error) {
      console.error('Error loading selected date events:', error);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleEventCreate = () => {
    setEditingEvent(undefined);
    setIsEventModalOpen(true);
  };

  const handleEventEdit = (event: Event) => {
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  const handleEventSaved = () => {
    loadTodayEvents();
    loadSelectedDateEvents();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="backdrop-blur-md bg-white/10 border-b border-white/20 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-white">
              Future<span className="text-purple-400">Cal</span>
            </h1>
            <div className="text-sm text-gray-300">
              Welcome back, {user?.email}
              {user?.hasCompletedSegmentation && (
                <div className="flex items-center mt-1 space-x-2">
                  <Filter className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">Segmentation completed</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 bg-black/30 hover:bg-white/10 text-white rounded-xl transition-all duration-300">
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={logout}
              className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl transition-all duration-300"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Today's Events Header */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="backdrop-blur-md bg-white/10 rounded-3xl border border-white/20 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Today's Events</h2>
              <p className="text-gray-300">
                {formatDate(new Date().toISOString().split('T')[0])}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-8 h-8 text-purple-400" />
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {todayEvents.length}
                </div>
                <div className="text-sm text-gray-400">
                  {todayEvents.length === 1 ? 'Event' : 'Events'}
                </div>
              </div>
            </div>
          </div>
          
          {todayEvents.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex flex-wrap gap-2">
                {todayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white px-4 py-2 rounded-2xl border border-purple-500/30"
                  >
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-gray-300">{event.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <div>
            <Calendar
              onDateSelect={handleDateSelect}
              onEventCreate={handleEventCreate}
              selectedDate={selectedDate}
            />
          </div>

          {/* Events for Selected Date */}
          <div>
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-white mb-2">
                Events for {formatDate(selectedDate)}
              </h3>
            </div>
            <EventList
              events={selectedDateEvents}
              onEventEdit={handleEventEdit}
              onEventsUpdate={handleEventSaved}
            />
          </div>
        </div>
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onEventSaved={handleEventSaved}
        selectedDate={selectedDate}
        event={editingEvent}
      />
    </div>
  );
};

export default Dashboard;