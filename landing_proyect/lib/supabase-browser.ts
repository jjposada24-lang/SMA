import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://eosfqhfagcoamvloatgi.supabase.co';
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvc2ZxaGZhZ2NvYW12bG9hdGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MDIyMTcsImV4cCI6MjA4MDk3ODIxN30.K7BB-0VejxqbIVtKQaO58LKvSMSAaxQC4Ta_T48HkWA';

  if (!url || !anonKey) {
    throw new Error('Supabase: faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  browserClient = createClient(url, anonKey);
  return browserClient;
}

