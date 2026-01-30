import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required');
}

// Client for browser (safe keys only)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server (has full permissions)
// NOTE: This should ONLY be imported in server-side code (API routes, server components)
// Client components should use the regular 'supabase' client or make API calls instead
if (!supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable. This is required for server-side operations.');
}

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,  // Server doesn't need auto-refresh
      persistSession: false      // Server doesn't persist sessions
    }
  }
);