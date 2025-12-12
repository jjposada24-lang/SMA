import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import {
  listMachineTypes,
  createMachineType,
  updateMachineType,
  softDeleteMachineType,
} from '@/lib/data/machine-types';

// Solo rol 2 (admin_customer) puede gestionar tipos de máquina
function ensureRole2(session: Awaited<ReturnType<typeof getSession>>) {
  if (!session || session.roleId !== 2) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  return null;
}

export async function GET() {
  const session = await getSession();
  const auth = ensureRole2(session);
  if (auth) return auth;

  const data = await listMachineTypes(session!.userId);
  return NextResponse.json({ items: data });
}

export async function POST(request: Request) {
  const session = await getSession();
  const auth = ensureRole2(session);
  if (auth) return auth;

  const body = await request.json().catch(() => null);
  const { name, machineId } = body ?? {};
  const machineIdStr = String(machineId ?? '').trim();
  const digitsOnly = /^\d+$/;
  if (!name || typeof name !== 'string' || !digitsOnly.test(machineIdStr)) {
    return NextResponse.json({ error: 'Nombre y machineId numérico son requeridos' }, { status: 400 });
  }
  const machineIdNum = Number(machineIdStr);
  if (machineIdNum < 1 || machineIdNum > 32767) {
    return NextResponse.json({ error: 'machineId debe ser entero entre 1 y 32767' }, { status: 400 });
  }
  const safeName = name.trim().toUpperCase();

  const created = await createMachineType(session!.userId, machineIdNum, safeName);
  if (!created) {
    return NextResponse.json({ error: 'No se pudo crear' }, { status: 409 });
  }
  return NextResponse.json({ ok: true, item: created });
}

export async function PUT(request: Request) {
  const session = await getSession();
  const auth = ensureRole2(session);
  if (auth) return auth;

  const body = await request.json().catch(() => null);
  const { id, name, machineId } = body ?? {};
  const machineIdStr = String(machineId ?? '').trim();
  const digitsOnly = /^\d+$/;
  if (!id || !name || !digitsOnly.test(machineIdStr)) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }
  const machineIdNum = Number(machineIdStr);
  if (machineIdNum < 1 || machineIdNum > 32767) {
    return NextResponse.json({ error: 'machineId debe ser entero entre 1 y 32767' }, { status: 400 });
  }
  const safeName = name.trim().toUpperCase();

  const updated = await updateMachineType(
    session!.userId,
    Number(id),
    machineIdNum,
    safeName,
  );
  if (!updated) {
    return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 404 });
  }
  return NextResponse.json({ ok: true, item: updated });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  const auth = ensureRole2(session);
  if (auth) return auth;

  const body = await request.json().catch(() => null);
  const { id } = body ?? {};
  if (!id) {
    return NextResponse.json({ error: 'Falta id' }, { status: 400 });
  }

  const ok = await softDeleteMachineType(session!.userId, Number(id));
  if (!ok) {
    return NextResponse.json({ error: 'No se pudo eliminar' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

