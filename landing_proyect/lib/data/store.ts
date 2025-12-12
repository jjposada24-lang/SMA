import { promises as fs } from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const clientsPath = path.join(dataDir, 'clients.json');
const usersPath = path.join(dataDir, 'users.json');

export type DataPaths = 'clients' | 'users';

const defaultClients = [
  {
    username: 'cliente_demo',
    modules: {
      usuarios: true,
      grabaciones: false,
      movimientos: true,
    },
  },
];

const defaultUsers = [
  {
    username: 'admin',
    passwordHash: '', // se setea en runtime
    role: 'admin',
  },
  {
    username: 'cliente_demo',
    passwordHash: '', // se setea en runtime
    role: 'customer',
  },
];

async function ensureDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

async function ensureFile<T>(p: string, fallback: T) {
  try {
    await fs.access(p);
  } catch {
    await fs.writeFile(p, JSON.stringify(fallback, null, 2), 'utf8');
  }
}

export async function ensureDataFiles() {
  await ensureDir();
  await ensureFile(clientsPath, defaultClients);
  await ensureFile(usersPath, defaultUsers);
}

export async function readJson<T>(which: DataPaths): Promise<T> {
  await ensureDataFiles();
  const p = which === 'clients' ? clientsPath : usersPath;
  const raw = await fs.readFile(p, 'utf8');
  return JSON.parse(raw) as T;
}

export async function writeJson<T>(which: DataPaths, data: T) {
  await ensureDataFiles();
  const p = which === 'clients' ? clientsPath : usersPath;
  await fs.writeFile(p, JSON.stringify(data, null, 2), 'utf8');
}


