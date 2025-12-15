-- Tabla de Máquinas
create table if not exists public.machines (
  id bigserial primary key,
  owner_id bigint not null references public.users(user_id),
  machine_type_id bigint references public.machine_types(id),
  name text not null, -- Campo "Equipo"
  brand text,
  model text,
  year text,
  serial_number text,
  fuel_type text,
  control_type text check (control_type in ('Horometro', 'Kilometraje')),
  maintenance_interval text,
  observations text,
  create_cost_center boolean default false,
  is_active boolean default true,
  deleted timestamptz,
  created_at timestamptz default now()
);

-- Índices para búsqueda rápida
create index if not exists idx_machines_owner on public.machines(owner_id);
create index if not exists idx_machines_deleted on public.machines(deleted);

-- Tabla de Motores (Relación 1:N con Máquinas)
create table if not exists public.machine_engines (
  id bigserial primary key,
  machine_id bigint not null references public.machines(id),
  brand text,
  serial_number text,
  type text,
  power text,
  location text,
  description text,
  deleted timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_engines_machine on public.machine_engines(machine_id);

