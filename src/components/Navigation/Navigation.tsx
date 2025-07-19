import React from 'react';
import { Home, Calendar, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavigationProps {
  currentView: 'home' | 'calendar';
  onViewChange: (view: 'home' | 'calendar') => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const { logout } = useAuth();

  return (
    <nav className="backdrop-blur-md bg-white/10 border-b border-white/20 p-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <h1 className="text-3xl font-bold text-white">
            Future<span className="text-purple-400">Cal</span>
          </h1>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onViewChange('home')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-2xl transition-all duration-300 ${
                currentView === 'home'
                  ? 'bg-purple-600/30 text-white border border-purple-500/50'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            
            <button
              onClick={() => onViewChange('calendar')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-2xl transition-all duration-300 ${
                currentView === 'calendar'
                  ? 'bg-purple-600/30 text-white border border-purple-500/50'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Calendario</span>
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            className="p-2 bg-black/30 hover:bg-white/10 text-white rounded-xl transition-all duration-300"
            title="Configuración"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={logout}
            className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl transition-all duration-300"
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;