import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client for browser (safe keys only)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server (has full permissions)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,  // Server doesn't need auto-refresh
      persistSession: false      // Server doesn't persist sessions
    }
  }
);