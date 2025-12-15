import { getSupabaseServerClient } from '@/lib/supabase-server';

export type MachineEngine = {
  id?: number;
  machine_id?: number;
  brand: string;
  serial_number: string;
  type: string;
  power: string;
  location: string;
  description: string;
};

export type MachineFile = {
  id?: number;
  machine_id?: number;
  name: string;
  url: string;
  type: string;
  created_at?: string;
};

export type MachineRecord = {
  id: number;
  owner_id: number;
  machine_type_id: number | null;
  name: string; // Equipo
  brand: string;
  model: string;
  year: string;
  serial_number: string;
  fuel_type: string;
  control_type: 'Horometro' | 'Kilometraje';
  maintenance_interval: string;
  observations: string;
  create_cost_center: boolean;
  is_active: boolean;
  created_at: string;
  // Join fields
  machine_type_name?: string;
  engines?: MachineEngine[];
  files?: MachineFile[];
};

export type CreateMachineInput = Omit<MachineRecord, 'id' | 'owner_id' | 'created_at' | 'machine_type_name'> & {
  engines: MachineEngine[];
  files: MachineFile[];
};

export type UpdateMachineInput = Partial<CreateMachineInput> & { id: number };

export async function listMachines(ownerId: number): Promise<MachineRecord[]> {
  const supabase = getSupabaseServerClient();
  
  // Obtenemos máquinas y sus tipos
  const { data: machines, error } = await supabase
    .from('machines')
    .select(`
      *,
      machine_types (name)
    `)
    .eq('owner_id', ownerId)
    .is('deleted', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('listMachines error', error);
    return [];
  }

  if (!machines) return [];

  const machineIds = machines.map((m) => m.id);

  // Obtenemos motores
  const { data: engines } = await supabase
    .from('machine_engines')
    .select('*')
    .in('machine_id', machineIds)
    .is('deleted', null);

  // Obtenemos archivos
  const { data: files } = await supabase
    .from('machine_files')
    .select('*')
    .in('machine_id', machineIds);

  // Mapeamos resultados
  return machines.map((m) => {
    const mEngines = engines?.filter((e) => e.machine_id === m.id) ?? [];
    const mFiles = files?.filter((f) => f.machine_id === m.id) ?? [];
    return {
      ...m,
      machine_type_name: m.machine_types?.name,
      engines: mEngines,
      files: mFiles,
    };
  });
}

export async function createMachine(ownerId: number, input: CreateMachineInput): Promise<MachineRecord | null> {
  const supabase = getSupabaseServerClient();
  
  // 1. Crear Máquina
  const { data: machine, error: machineError } = await supabase
    .from('machines')
    .insert([{
      owner_id: ownerId,
      machine_type_id: input.machine_type_id || null,
      name: input.name,
      brand: input.brand,
      model: input.model,
      year: input.year,
      serial_number: input.serial_number,
      fuel_type: input.fuel_type,
      control_type: input.control_type,
      maintenance_interval: input.maintenance_interval,
      observations: input.observations,
      create_cost_center: input.create_cost_center,
      is_active: input.is_active
    }])
    .select()
    .single();

  if (machineError || !machine) {
    console.error('createMachine error', machineError);
    return null;
  }

  // 2. Crear Motores
  if (input.engines && input.engines.length > 0) {
    const enginesToInsert = input.engines.map(e => ({
      machine_id: machine.id,
      brand: e.brand,
      serial_number: e.serial_number,
      type: e.type,
      power: e.power,
      location: e.location,
      description: e.description
    }));

    const { error: enginesError } = await supabase
      .from('machine_engines')
      .insert(enginesToInsert);
    
    if (enginesError) console.error('createMachine engines error', enginesError);
  }

  // 3. Asociar Archivos
  if (input.files && input.files.length > 0) {
    const filesToInsert = input.files.map(f => ({
      machine_id: machine.id,
      name: f.name,
      url: f.url,
      type: f.type
    }));

    const { error: filesError } = await supabase
      .from('machine_files')
      .insert(filesToInsert);
      
    if (filesError) console.error('createMachine files error', filesError);
  }

  return { ...machine, engines: input.engines, files: input.files };
}

export async function updateMachine(ownerId: number, input: UpdateMachineInput): Promise<MachineRecord | null> {
  const supabase = getSupabaseServerClient();
  
  // 1. Actualizar Máquina
  const { data: machine, error } = await supabase
    .from('machines')
    .update({
      machine_type_id: input.machine_type_id,
      name: input.name,
      brand: input.brand,
      model: input.model,
      year: input.year,
      serial_number: input.serial_number,
      fuel_type: input.fuel_type,
      control_type: input.control_type,
      maintenance_interval: input.maintenance_interval,
      observations: input.observations,
      create_cost_center: input.create_cost_center,
      is_active: input.is_active
    })
    .eq('id', input.id)
    .eq('owner_id', ownerId)
    .select()
    .single();

  if (error || !machine) {
    console.error('updateMachine error', error);
    return null;
  }

  // 2. Motores (Soft Delete + Insert)
  if (input.engines) {
     await supabase
       .from('machine_engines')
       .update({ deleted: new Date().toISOString() })
       .eq('machine_id', machine.id);

     if (input.engines.length > 0) {
        const enginesToInsert = input.engines.map(e => ({
          machine_id: machine.id,
          brand: e.brand,
          serial_number: e.serial_number,
          type: e.type,
          power: e.power,
          location: e.location,
          description: e.description
        }));
        await supabase.from('machine_engines').insert(enginesToInsert);
     }
  }

  // 3. Archivos (Delete + Insert para simplificar, o solo agregar nuevos)
  // Estrategia: Borrar todos los de esta máquina y reinsertar la lista actual.
  // Esto permite eliminar archivos si el usuario los quita de la lista en el front.
  // Ojo: Esto no borra el archivo del bucket, solo la referencia.
  if (input.files) {
    // Primero borramos referencias anteriores
    await supabase.from('machine_files').delete().eq('machine_id', machine.id);
    
    if (input.files.length > 0) {
      const filesToInsert = input.files.map(f => ({
        machine_id: machine.id,
        name: f.name,
        url: f.url,
        type: f.type
      }));
      await supabase.from('machine_files').insert(filesToInsert);
    }
  }

  return { ...machine, engines: input.engines ?? [], files: input.files ?? [] };
}

export async function deleteMachine(ownerId: number, id: number): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  
  const { error } = await supabase
    .from('machines')
    .update({ deleted: new Date().toISOString() })
    .eq('id', id)
    .eq('owner_id', ownerId);

  return !error;
}
