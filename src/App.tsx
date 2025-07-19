import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthForm from './components/Auth/AuthForm';
import MainApp from './components/MainApp/MainApp';
import InterestForm from './components/UserSegmentation/InterestForm';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="backdrop-blur-md bg-white/10 rounded-3xl border border-white/20 p-8 text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  if (user && !user.hasCompletedSegmentation) {
    return <InterestForm />;
  }

  return <MainApp />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;