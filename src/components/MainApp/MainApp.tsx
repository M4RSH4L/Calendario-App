import React, { useState } from 'react';
import Navigation from '../Navigation/Navigation';
import Home from '../Home/Home';
import Dashboard from '../Dashboard/Dashboard';

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'calendar'>('home');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      
      <div className="min-h-[calc(100vh-88px)]">
        {currentView === 'home' ? <Home /> : <Dashboard />}
      </div>
    </div>
  );
};

export default MainApp;