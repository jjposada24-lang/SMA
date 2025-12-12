import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getClients, toggleModule, deleteClient, type ModuleKey } from '@/lib/data/clients';
import { findUser, deleteUser } from '@/lib/auth/users';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Admin root: devuelve todos
  if (session.role === 'admin' && session.roleId === 1) {
    return NextResponse.json({ clients: await getClients() });
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
  if (!removed) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
  }

  const user = await findUser(username);
  if (user?.role === 'customer') {
    await deleteUser(username);
  }

  return NextResponse.json({ ok: true });
}


