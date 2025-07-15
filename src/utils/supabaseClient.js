import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const authHelpers = {
  // Sign up with email and password
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  // Sign in with email and password
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  // Get current user
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  }
};

// Database helpers
export const dbHelpers = {
  // Save user filters (onboarding data)
  async saveUserFilters(userId, filters) {
    const { data, error } = await supabase
      .from('user_filters')
      .upsert({
        user_id: userId,
        question_1: filters.question_1,
        question_2: filters.question_2,
        question_3: filters.question_3,
        question_4: filters.question_4,
      })
      .select();
    return { data, error };
  },

  // Get user filters
  async getUserFilters(userId) {
    const { data, error } = await supabase
      .from('user_filters')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  // Events helpers (keeping existing functionality)
  async createEvent(event) {
    const { data, error } = await supabase
      .from('events')
      .insert(event)
      .select()
      .single();
    return { data, error };
  },

  async getEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });
    return { data, error };
  },

  async getEventsByDate(date) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('date', date)
      .order('time', { ascending: true });
    return { data, error };
  },

  async updateEvent(id, updates) {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async deleteEvent(id) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    return { error };
  }
};