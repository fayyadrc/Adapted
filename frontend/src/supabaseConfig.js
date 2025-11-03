// Import Supabase client
import { createClient } from '@supabase/supabase-js';

// Your Supabase configuration
// For production, use environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
