import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// These are public browser credentials, not server secrets. Keep the deployed app
// connected even when a hosting provider has not injected its build-time env vars.
// Vercel environment variables still take precedence, so the project can be moved
// without another code change.
const DEFAULT_SUPABASE_URL = 'https://jkzxdvyjhljzvuydnbap.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprenhkdnlqaGxqenZ1eWRuYmFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NzQ1OTQsImV4cCI6MjA3NjQ1MDU5NH0.p0Z2wjP7t8_NiMfa5tATVyfVSf_VuLfQNMY0LSo-G-4';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_PUBLISHABLE_KEY;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Log connection status in development
if (import.meta.env.DEV) {
  console.log('🔌 Supabase client initialized:', {
    projectUrl: SUPABASE_URL,
    usingEnvironmentConfig: Boolean(
      import.meta.env.VITE_SUPABASE_URL &&
      (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY),
    ),
  });
}
