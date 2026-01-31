import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client for browser (safe keys only)
// Handle missing keys during build time gracefully
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

// Admin client for server (has full permissions)
// NOTE: This should ONLY be imported in server-side code (API routes, server components)
// Client components should use the regular 'supabase' client or make API calls instead
// Handle missing keys during build time - API routes will check at runtime
export const supabaseAdmin = (supabaseUrl && supabaseServiceRoleKey)
  ? createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,  // Server doesn't need auto-refresh
          persistSession: false      // Server doesn't persist sessions
        }
      }
    )
  : createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });