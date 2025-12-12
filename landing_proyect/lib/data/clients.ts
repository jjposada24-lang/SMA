import { readJson, writeJson } from './store';

export type ModuleKey = 'usuarios' | 'grabaciones' | 'movimientos';

export type ClientRecord = {
  username: string;
  modules: Record<ModuleKey, boolean>;
};

async function loadClients(): Promise<ClientRecord[]> {
  return readJson<ClientRecord[]>('clients');
}

async function saveClients(clients: ClientRecord[]) {
  await writeJson('clients', clients);
}

export async function getClients(): Promise<ClientRecord[]> {
  return loadClients();
}

export async function getClient(username: string): Promise<ClientRecord | null> {
  const clients = await loadClients();
  return clients.find((c) => c.username === username) ?? null;
}

export async function toggleModule(username: string, module: ModuleKey, enabled: boolean) {
  const clients = await loadClients();
  const client = clients.find((c) => c.username === username);
  if (!client) return null;
  client.modules[module] = enabled;
  await saveClients(clients);
  return client;
}

export async function addClient(username: string) {
  const clients = await loadClients();
  if (clients.some((c) => c.username === username)) return null;
  const client: ClientRecord = {
    username,
    modules: {
      usuarios: true, // disponible por defecto
      grabaciones: false,
      movimientos: false,
    },
  };
  clients.push(client);
  await saveClients(clients);
  return client;
}

export async function deleteClient(username: string) {
  const clients = await loadClients();
  const next = clients.filter((c) => c.username !== username);
  if (next.length === clients.length) return null;
  await saveClients(next);
  return true;
}


