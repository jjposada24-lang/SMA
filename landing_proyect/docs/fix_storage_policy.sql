-- Script para corregir el error de permisos en Supabase Storage
-- Ejecuta este script en el Editor SQL de tu proyecto en Supabase

-- 1. Crear el bucket 'machine-files' si no existe y hacerlo público
insert into storage.buckets (id, name, public)
values ('machine-files', 'machine-files', true)
on conflict (id) do update set public = true;

-- 2. Eliminar políticas antiguas si existen para evitar conflictos
drop policy if exists "Usuarios autenticados pueden subir archivos machine-files" on storage.objects;
drop policy if exists "Publico puede ver machine-files" on storage.objects;
drop policy if exists "Usuarios pueden borrar sus archivos machine-files" on storage.objects;

-- 3. Crear política para permitir SUBIR archivos (INSERT) a usuarios autenticados
-- Esto soluciona el error "new row violates row-level security policy"
create policy "Usuarios autenticados pueden subir archivos machine-files"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'machine-files' );

-- 4. Crear política para permitir VER archivos (SELECT) a todo el mundo (necesario para getPublicUrl funcione correctamente sin tokens firmados)
create policy "Publico puede ver machine-files"
on storage.objects for select
to public
using ( bucket_id = 'machine-files' );

-- 5. Crear política para permitir BORRAR/ACTUALIZAR archivos a usuarios autenticados
create policy "Usuarios pueden borrar sus archivos machine-files"
on storage.objects for delete
to authenticated
using ( bucket_id = 'machine-files' );

create policy "Usuarios pueden actualizar sus archivos machine-files"
on storage.objects for update
to authenticated
using ( bucket_id = 'machine-files' );

