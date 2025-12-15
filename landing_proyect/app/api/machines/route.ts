import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import {
  listMachines,
  createMachine,
  updateMachine,
  deleteMachine,
  type CreateMachineInput
} from '@/lib/data/machines';

// Solo rol 2 (Admin Customer) puede gestionar máquinas por ahora
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

  const data = await listMachines(session!.userId);
  return NextResponse.json({ items: data });
}

export async function POST(request: Request) {
  const session = await getSession();
  const auth = ensureRole2(session);
  if (auth) return auth;

  const body = await request.json().catch(() => null);
  if (!body || !body.name) {
    return NextResponse.json({ error: 'Datos inválidos. "Equipo" (name) es requerido.' }, { status: 400 });
  }

  const input: CreateMachineInput = {
    name: body.name,
    machine_type_id: body.machine_type_id ? Number(body.machine_type_id) : null,
    brand: body.brand ?? '',
    model: body.model ?? '',
    year: body.year ?? '',
    serial_number: body.serial_number ?? '',
    fuel_type: body.fuel_type ?? 'DIESEL',
    control_type: body.control_type === 'Kilometraje' ? 'Kilometraje' : 'Horometro',
    maintenance_interval: body.maintenance_interval ?? '',
    observations: body.observations ?? '',
    create_cost_center: Boolean(body.create_cost_center),
    is_active: body.is_active !== false, // default true
    engines: Array.isArray(body.engines) ? body.engines : [],
    files: Array.isArray(body.files) ? body.files : [],
  };

  const created = await createMachine(session!.userId, input);
  if (!created) {
    return NextResponse.json({ error: 'No se pudo crear la máquina' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, item: created });
}

export async function PUT(request: Request) {
  const session = await getSession();
  const auth = ensureRole2(session);
  if (auth) return auth;

  const body = await request.json().catch(() => null);
  if (!body || !body.id) {
    return NextResponse.json({ error: 'Falta ID' }, { status: 400 });
  }

  const updated = await updateMachine(session!.userId, body);
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
  if (!body || !body.id) {
    return NextResponse.json({ error: 'Falta ID' }, { status: 400 });
  }

  const success = await deleteMachine(session!.userId, Number(body.id));
  if (!success) {
    return NextResponse.json({ error: 'No se pudo eliminar' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
