// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '@/config';

// Client for public / client-side authenticated interactions (subject to RLS policies)
export const supabase = CONFIG.SUPABASE.URL 
  ? createClient(CONFIG.SUPABASE.URL, CONFIG.SUPABASE.ANON_KEY) 
  : null as any;

// Client with Service Role bypassing RLS - strictly for server-side processing like callback / webhook verification
export const supabaseAdmin = CONFIG.SUPABASE.URL && CONFIG.SUPABASE.SERVICE_ROLE_KEY 
  ? createClient(CONFIG.SUPABASE.URL, CONFIG.SUPABASE.SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null as any;
