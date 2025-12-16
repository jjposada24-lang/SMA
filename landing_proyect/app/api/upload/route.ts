import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/lib/auth/session';

// Inicializar cliente de Supabase con Service Role Key para permisos de administración
// IMPORTANTE: Esta clave nunca debe exponerse al cliente
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: Request) {
  // 1. Verificar autenticación del usuario
  const session = await getSession();
  if (!session || (session.roleId !== 2 && session.roleId !== 1)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Verificar que tenemos la clave de servicio
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Falta SUPABASE_SERVICE_ROLE_KEY');
    return NextResponse.json({ error: 'Configuración de servidor incompleta' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string;

    if (!file || !path) {
      return NextResponse.json({ error: 'Archivo o ruta faltante' }, { status: 400 });
    }

    // 2. Convertir el archivo a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Subir archivo usando permisos de administración (bypass RLS)
    const { data, error } = await supabaseAdmin.storage
      .from('machine-files')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (error) {
      console.error('Error Supabase Storage:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 4. Obtener URL pública (asumiendo que el bucket es público para lectura)
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('machine-files')
      .getPublicUrl(path);

    return NextResponse.json({ 
      ok: true, 
      url: publicUrlData.publicUrl 
    });

  } catch (err) {
    console.error('Error en upload route:', err);
    return NextResponse.json({ error: 'Error interno del servidor: ' + (err as Error).message }, { status: 500 });
  }
}

