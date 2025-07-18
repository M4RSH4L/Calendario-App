import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { supabase, authHelpers, dbHelpers } from '../utils/supabaseClient';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { session } = await authHelpers.getSession();
        if (session?.user) {
          await loadUserData(session.user);
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserData(session.user);
      } else if (event === 'SIGNED_OUT') {
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (supabaseUser: any) => {
    try {
      console.log('Loading user data for:', supabaseUser.id);
      
      // Check if user has completed segmentation by looking for filters
      const { data: filters, error: filtersError } = await dbHelpers.getUserFilters(supabaseUser.id);
      
      if (filtersError && filtersError.code !== 'PGRST116') {
        console.error('Error loading filters:', filtersError);
      }
      
      const user: User = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        hasCompletedSegmentation: !!filters,
        filters: filters || undefined,
        createdAt: supabaseUser.created_at
      };

      console.log('Setting user state:', user);

      setAuthState({
        user,
        isAuthenticated: true,
        loading: false
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false
      });
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await authHelpers.signIn(email, password);
      
      if (error) {
        setAuthState(prev => ({ ...prev, loading: false }));
        return { success: false, error: error.message };
      }

      if (data.user) {
        // loadUserData will be called by the auth state change listener
        return { success: true };
      }

      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const register = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await authHelpers.signUp(email, password);
      
      if (error) {
        setAuthState(prev => ({ ...prev, loading: false }));
        return { success: false, error: error.message };
      }

      if (data.user) {
        // For email confirmation flow, user might not be immediately available
        if (data.user.email_confirmed_at) {
          // loadUserData will be called by the auth state change listener
          return { success: true };
        } else {
          // Handle email confirmation case
          setAuthState(prev => ({ ...prev, loading: false }));
          return { success: true, error: 'Please check your email to confirm your account' };
        }
      }

      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    try {
      await authHelpers.signOut();
      // Auth state will be updated by the listener
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (user: User) => {
    setAuthState(prev => ({ ...prev, user }));
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      register,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};