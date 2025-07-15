import React, { useState } from 'react';
import { Clock, User, Edit, Trash2 } from 'lucide-react';
import { Event } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { dbHelpers } from '../../utils/supabaseClient';

interface EventListProps {
  events: Event[];
  onEventEdit: (event: Event) => void;
  onEventsUpdate: () => void;
}

const EventList: React.FC<EventListProps> = ({ events, onEventEdit, onEventsUpdate }) => {
  const { user } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (eventId: string) => {
    if (!user) return;
    
    setDeletingId(eventId);
    try {
      const { error } = await dbHelpers.deleteEvent(eventId);
      if (error) {
        console.error('Error deleting event:', error);
        return;
      }
      onEventsUpdate();
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setDeletingId(null);
    }
  };

  if (events.length === 0) {
    return (
      <div className="backdrop-blur-md bg-white/10 rounded-3xl border border-white/20 p-8 text-center">
        <p className="text-gray-400">No hay eventos programados para este día.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div
          key={event.id}
          className="backdrop-blur-md bg-white/10 rounded-3xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2">{event.title}</h3>
              <p className="text-gray-300 mb-4">{event.description}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>Evento</span>
                </div>
              </div>
            </div>

            {user && user.id === event.createdBy && (
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => onEventEdit(event)}
                  className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl transition-all duration-300"
                  title="Editar evento"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  disabled={deletingId === event.id}
                  className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl transition-all duration-300 disabled:opacity-50"
                  title="Eliminar evento"
                >
                  {deletingId === event.id ? (
                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventList;