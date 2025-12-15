import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getClients, toggleModule, deleteClient, addClient, type ModuleKey } from '@/lib/data/clients';
import { findUser, deleteUser, getAllUsers } from '@/lib/auth/users';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Admin root: devuelve todos los usuarios de Supabase combinados con config de módulos
  if (session.role === 'admin' && session.roleId === 1) {
    try {
      const [dbUsers, jsonClients] = await Promise.all([
        getAllUsers(),
        getClients()
      ]);

      // Mapeamos usuarios de DB a estructura de cliente, inyectando módulos si existen
      const combined = dbUsers.map((u) => {
        const found = jsonClients.find((c) => c.username === String(u.userId));
        return {
          ...u, // Incluye displayName, parentId, roleId, etc.
          username: String(u.userId), // Aseguramos que username sea el ID string
          modules: found
            ? found.modules
            : { usuarios: true, grabaciones: false, movimientos: false }, // Default modules si no está en JSON
        };
      });

      return NextResponse.json({ clients: combined });
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: 'Error al obtener datos' }, { status: 500 });
    }
  }

  // Admin customer (rol 2): devuelve los clientes que coinciden con su userId o username
  if (session.roleId === 2) {
    const clients = await getClients();
    const matches = clients.filter(
      (c) => c.username === String(session.userId) || c.username === session.username,
    );
    return NextResponse.json({ clients: matches });
  }

  return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const { username, module, enabled } = body ?? {};

  if (!username || !module || typeof enabled !== 'boolean') {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  // Si el cliente no existe en el JSON (porque viene directo de Supabase), lo creamos primero
  const clients = await getClients();
  const exists = clients.some(c => c.username === username);
  
  if (!exists) {
    // Intentamos agregarlo al JSON primero
    await addClient(username);
  }

  const updated = await toggleModule(username, module as ModuleKey, enabled);
  if (!updated) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, client: updated });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const { username } = body ?? {};
  if (!username || typeof username !== 'string') {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  const removed = await deleteClient(username);
  // Nota: deleteClient devuelve null si no estaba en JSON. 
  // Pero ahora queremos borrar el usuario de DB también.
  
  const user = await findUser(username);
  if (user) {
    // Borrar de Supabase (soft delete)
    const dbRemoved = await deleteUser(username);
    if (!dbRemoved) {
       return NextResponse.json({ error: 'No se pudo eliminar el usuario de la base de datos' }, { status: 500 });
    }
  }

  // Si no estaba en JSON ni en DB, es 404
  if (!removed && !user) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
