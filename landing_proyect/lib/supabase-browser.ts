import { createBrowserClient } from '@supabase/ssr';

// Creamos un singleton del cliente para usar en componentes cliente
// Necesita NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
// Se agregan fallbacks basados en env.example para evitar errores si .env.local no carga
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eosfqhfagcoamvloatgi.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvc2ZxaGZhZ2NvYW12bG9hdGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MDIyMTcsImV4cCI6MjA4MDk3ODIxN30.K7BB-0VejxqbIVtKQaO58LKvSMSAaxQC4Ta_T48HkWA'
  );
