import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let serverClient: SupabaseClient | null = null;

export function getSupabaseServerClient() {
  if (serverClient) return serverClient;

  const url = 'https://eosfqhfagcoamvloatgi.supabase.co';
  
  // Forzamos el uso de la clave correcta hardcodeada para eliminar cualquier ambigüedad de env vars
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvc2ZxaGZhZ2NvYW12bG9hdGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MDIyMTcsImV4cCI6MjA4MDk3ODIxN30.K7BB-0VejxqbIVtKQaO58LKvSMSAaxQC4Ta_T48HkWA';

  // Debug logs para entender qué está pasando en el servidor
  console.log('--- Supabase Server Init (HARDCODED) ---');
  console.log('URL defined:', !!url, url?.substring(0, 10) + '...');
  console.log('Key defined:', !!serviceRoleKey, serviceRoleKey ? 'Exists (len: ' + serviceRoleKey.length + ')' : 'Missing');
  
  if (!url || !serviceRoleKey) {
    console.error('Supabase env check', { url: !!url, serviceRoleKey: !!serviceRoleKey });
    throw new Error('Supabase: faltan NEXT_PUBLIC_SUPABASE_URL o una clave (service role o anon).');
  }

  serverClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return serverClient;
}

