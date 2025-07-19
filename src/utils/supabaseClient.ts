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
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
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
  async saveUserFilters(userId: string, filters: any) {
    console.log('Saving filters to database:', { userId, filters });
    
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
      
    console.log('Database response:', { data, error });
    return { data, error };
  },

  // Get user filters
  async getUserFilters(userId: string) {
    console.log('Getting user filters for:', userId);
    const { data, error } = await supabase
      .from('user_filters')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    console.log('getUserFilters response:', { data, error });
    return { data, error };
  },

  // Events helpers
  async createEvent(event: any) {
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

  async getEventsByDate(date: string) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('date', date)
      .order('time', { ascending: true });
    return { data, error };
  },

  async updateEvent(id: string, updates: any) {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async deleteEvent(id: string) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    return { error };
  },

  // Products helpers
  async createProduct(product: any) {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.imageUrl,
        platform: product.platform,
        platform_id: product.platformId,
        user_id: product.userId
      })
      .select()
      .single();
    return { data, error };
  },

  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Sales helpers
  async createSale(sale: any) {
    const { data, error } = await supabase
      .from('sales')
      .insert({
        product_id: sale.productId,
        quantity: sale.quantity,
        total_amount: sale.totalAmount,
        sale_date: sale.saleDate,
        platform: sale.platform,
        user_id: sale.userId
      })
      .select()
      .single();
    return { data, error };
  },

  async getSales() {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('sale_date', { ascending: false });
    return { data, error };
  },

  async getTopProductsThisMonth() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('sales')
      .select(`
        product_id,
        quantity,
        total_amount,
        products (
          id,
          name,
          description,
          price,
          image_url,
          platform,
          platform_id
        )
      `)
      .gte('sale_date', startOfMonthStr)
      .order('total_amount', { ascending: false });

    return { data, error };
  }
};