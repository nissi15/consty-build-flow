import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

// For development: allow app to run without env vars, but log warning
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.warn('⚠️ Missing Supabase environment variables. Using placeholder values. Please check your .env file.');
  console.warn('Expected variables: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY');
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Use placeholder if env vars are missing (for development)
const url = SUPABASE_URL || 'https://placeholder.supabase.co';
const key = SUPABASE_PUBLISHABLE_KEY || 'placeholder_key';

export const supabase = createClient<Database>(url, key, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Log connection status in development
if (import.meta.env.DEV) {
  console.log('🔌 Supabase client initialized:', {
    hasUrl: !!SUPABASE_URL,
    hasKey: !!SUPABASE_PUBLISHABLE_KEY,
  });
}