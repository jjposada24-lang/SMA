import { createHash } from 'crypto';
import { getSupabaseServerClient } from '@/lib/supabase-server';

// Roles numéricos en BD
export type RoleId = 1 | 2 | 3; // 1=admin_root, 2=admin_customer, 3=sub_customer

export type DbUser = {
  id: number;
  user_id: number;
  nombre: string;
  cedula: string;
  mail: string;
  parent_id: number | null;
  role_id: RoleId;
  password_hash: string;
  deleted?: string | null;
};

export type PublicUser = {
  userId: number;
  roleId: RoleId;
  username: string; // para UI (usamos userId como string)
  role: 'admin' | 'customer';
  displayName?: string;
  parentId?: number | null;
  email?: string;
  cedula?: string;
};

// Helper de hash SHA-256 (misma estrategia que antes)
const hashPassword = (plain: string) => createHash('sha256').update(plain).digest('hex');

const mapRoleIdToSessionRole = (roleId: RoleId): PublicUser['role'] =>
  roleId === 1 || roleId === 2 ? 'admin' : 'customer';

export async function findUserByIdentifier(identifier: string): Promise<DbUser | null> {
  const supabase = getSupabaseServerClient();
  const parsedId = Number(identifier);
  const isNumeric = Number.isInteger(parsedId);
  const query = supabase.from('users').select('*').is('deleted', null); // Ignoramos eliminados

  const { data, error } = isNumeric
    ? await query.eq('user_id', parsedId).maybeSingle()
    : await query.eq('mail', identifier).maybeSingle();

  if (error) {
    console.error('findUserByIdentifier error', error);
    return null;
  }
  return data as DbUser | null;
}

export async function verifyCredentials(identifier: string, password: string) {
  const user = await findUserByIdentifier(identifier);
  if (!user) return null;
  const hash = hashPassword(password);
  return hash === user.password_hash ? user : null;
}

export type CreateUserInput = {
  nombre: string;
  cedula: string;
  mail: string;
  password: string;
  roleId: RoleId;
  parentId: number | null;
};

export async function createUser(input: CreateUserInput): Promise<DbUser | null> {
  const supabase = getSupabaseServerClient();
  const { nombre, cedula, mail, password, roleId, parentId } = input;
  const password_hash = hashPassword(password);

  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        nombre,
        cedula,
        mail,
        password_hash,
        role_id: roleId,
        parent_id: parentId,
      },
    ])
    .select()
    .maybeSingle();

  if (error) {
    console.error('createUser error', error);
    return null;
  }
  return data as DbUser;
}

export async function publicFromDb(user: DbUser): Promise<PublicUser> {
  return {
    userId: user.user_id,
    roleId: user.role_id,
    username: String(user.user_id),
    displayName: user.nombre,
    role: mapRoleIdToSessionRole(user.role_id),
    parentId: user.parent_id,
    email: user.mail,
    cedula: user.cedula,
  };
}

export async function findUser(username: string): Promise<PublicUser | null> {
  const dbUser = await findUserByIdentifier(username);
  if (!dbUser) return null;
  return publicFromDb(dbUser);
}

// Obtener hijos directos (usuarios creados por este padre)
export async function getChildrenUsers(parentId: number): Promise<PublicUser[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('parent_id', parentId)
    .is('deleted', null); // Solo activos

  if (error) {
    console.error('getChildrenUsers error', error);
    return [];
  }

  const users = (data as DbUser[]) || [];
  return Promise.all(users.map(publicFromDb));
}

// Obtener TODOS los usuarios (para Admin Root)
export async function getAllUsers(): Promise<PublicUser[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .is('deleted', null);

  if (error) {
    console.error('getAllUsers error', error);
    return [];
  }
  const users = (data as DbUser[]) || [];
  return Promise.all(users.map(publicFromDb));
}

export type UpdateUserInput = {
  nombre?: string;
  cedula?: string;
  email?: string;
  password?: string;
};

// Actualizar usuario
export async function updateUser(userId: number, input: UpdateUserInput): Promise<PublicUser | null> {
  const supabase = getSupabaseServerClient();
  const updates: any = {};
  if (input.nombre) updates.nombre = input.nombre;
  if (input.cedula) updates.cedula = input.cedula;
  if (input.email) updates.mail = input.email;
  if (input.password) updates.password_hash = hashPassword(input.password);

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('updateUser error', error);
    return null;
  }
  return publicFromDb(data as DbUser);
}

// Borrado lógico (soft delete)
export async function deleteUser(username: string): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  const parsedId = Number(username);
  const isNumeric = Number.isInteger(parsedId);
  
  if (!isNumeric) return false;

  const { error } = await supabase
    .from('users')
    .update({ deleted: new Date().toISOString() }) // Soft delete
    .eq('user_id', parsedId);

  if (error) {
    console.error('deleteUser error', error);
    return false;
  }
  return true;
}
