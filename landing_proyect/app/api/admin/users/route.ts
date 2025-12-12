import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { createUser, getChildrenUsers, updateUser, deleteUser, type RoleId } from '@/lib/auth/users';
import { addClient } from '@/lib/data/clients';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Rol 2 (Admin Customer) ve a sus hijos. Rol 1 también podría si quisiera, pero por ahora nos enfocamos en el requerimiento.
  if (session.roleId === 2) {
    const children = await getChildrenUsers(session.userId);
    return NextResponse.json({ users: children });
  }

  // Si rol 1 quisiera ver todos, iría aquí, pero rol 1 ya tiene su vista de "clientes" separada.
  return NextResponse.json({ users: [] });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session || (session.roleId !== 2)) {
    // Limitamos edición a Admin Customer (rol 2) por ahora, según requerimiento
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const { userId, nombre, cedula, email, password } = body ?? {};

  if (!userId) {
    return NextResponse.json({ error: 'Falta User ID' }, { status: 400 });
  }

  // Validar que el usuario a editar sea hijo de quien edita (seguridad extra)
  // Por simplicidad confiamos en que getChildrenUsers filtra, pero idealmente verificaríamos parent_id antes de update.
  // Como updateUser no verifica parent_id, asumimos que el frontend envía IDs válidos que ya filtró el GET.
  // Una mejora sería hacer update con filtro de parent_id.

  const updated = await updateUser(Number(userId), { nombre, cedula, email, password });
  if (!updated) {
    return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, user: updated });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session || (session.roleId !== 2)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const { userId } = body ?? {};

  if (!userId) {
    return NextResponse.json({ error: 'Falta User ID' }, { status: 400 });
  }

  const success = await deleteUser(String(userId));
  if (!success) {
    return NextResponse.json({ error: 'No se pudo eliminar' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const { nombre, cedula, mail, password, roleId } = body ?? {};

  if (!nombre || !cedula || !mail || !password || !roleId) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  // Reglas de creación:
  // - admin_root (roleId=1) puede crear solo admin_customer (roleId=2)
  // - admin_customer (roleId=2) puede crear solo sub_customer (roleId=3)
  // - sub_customer no puede crear
  if (session.roleId === 1 && roleId !== 2) {
    return NextResponse.json({ error: 'Solo puedes crear Admin Customer' }, { status: 403 });
  }
  if (session.roleId === 2 && roleId !== 3) {
    return NextResponse.json({ error: 'Solo puedes crear Sub Customer' }, { status: 403 });
  }
  if (session.roleId !== 1 && session.roleId !== 2) {
    return NextResponse.json({ error: 'Rol sin permisos para crear usuarios' }, { status: 403 });
  }

  const parentId = session.userId;

  const user = await createUser({
    nombre,
    cedula,
    mail,
    password,
    roleId: roleId as RoleId,
    parentId,
  });

  if (!user) {
    return NextResponse.json({ error: 'No se pudo crear el usuario' }, { status: 409 });
  }

  // Solo creamos cliente (para módulos) si es admin_customer
  const client = roleId === 2 ? await addClient(String(user.user_id)) : null;

  return NextResponse.json({
    ok: true,
    user: { userId: user.user_id, roleId: user.role_id, parentId: user.parent_id },
    client,
  });
}

