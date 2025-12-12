import { getSupabaseServerClient } from '@/lib/supabase-server';

export type MachineTypeRecord = {
  id: number;
  owner_id: number;
  machine_id: number;
  name: string;
  deleted: string | null;
  created_at?: string;
};

export async function listMachineTypes(ownerId: number): Promise<MachineTypeRecord[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('machine_types')
    .select('*')
    .eq('owner_id', ownerId)
    .is('deleted', null)
    .order('id', { ascending: true });

  if (error) {
    console.error('listMachineTypes error', error);
    return [];
  }
  return (data as MachineTypeRecord[]) ?? [];
}

export async function createMachineType(
  ownerId: number,
  machineId: number,
  name: string,
): Promise<MachineTypeRecord | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('machine_types')
    .insert([{ owner_id: ownerId, machine_id: machineId, name }])
    .select()
    .maybeSingle();

  if (error) {
    console.error('createMachineType error', error);
    return null;
  }
  return data as MachineTypeRecord;
}

export async function updateMachineType(
  ownerId: number,
  id: number,
  machineId: number,
  name: string,
): Promise<MachineTypeRecord | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('machine_types')
    .update({ name, machine_id: machineId })
    .eq('id', id)
    .eq('owner_id', ownerId)
    .is('deleted', null)
    .select()
    .maybeSingle();

  if (error) {
    console.error('updateMachineType error', error);
    return null;
  }
  return data as MachineTypeRecord;
}

export async function softDeleteMachineType(ownerId: number, id: number): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from('machine_types')
    .update({ deleted: new Date().toISOString() })
    .eq('id', id)
    .eq('owner_id', ownerId)
    .is('deleted', null);

  if (error) {
    console.error('softDeleteMachineType error', error);
    return false;
  }
  return true;
}

