'use client';

import { useState } from 'react';
import type { ClientRecord, ModuleKey } from '@/lib/data/clients';

type Props = {
  clients: ClientRecord[];
};

const MODULE_LABELS: Record<ModuleKey, string> = {
  usuarios: 'Usuarios',
  grabaciones: 'Grabaciones',
  movimientos: 'Movimientos',
};

export default function AdminClientsPanel({ clients }: Props) {
  const [data, setData] = useState<ClientRecord[]>(clients);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async (username: string, module: ModuleKey, enabled: boolean) => {
    setLoadingKey(`${username}-${module}`);
    setError(null);
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, module, enabled }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? 'No se pudo actualizar');
        return;
      }
      setData((prev) =>
        prev.map((c) => (c.username === username ? { ...c, modules: { ...c.modules, [module]: enabled } } : c)),
      );
    } catch (err) {
      console.error(err);
      setError('Error de red al actualizar');
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
      <h2 className="text-xl font-semibold mb-4 text-white">Clientes</h2>
      {error && <p className="mb-3 text-sm text-red-300">{error}</p>}
      <div className="space-y-4">
        {data.map((client) => (
          <div key={client.username} className="rounded-xl border border-white/10 bg-black/30 p-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="font-semibold">{client.username}</p>
                <p className="text-xs text-white/60">Módulos disponibles</p>
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {(Object.keys(client.modules) as ModuleKey[]).map((module) => (
                <label
                  key={module}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                >
                  <input
                    type="checkbox"
                    checked={client.modules[module]}
                    disabled={loadingKey === `${client.username}-${module}`}
                    onChange={(e) => handleToggle(client.username, module, e.target.checked)}
                  />
                  {MODULE_LABELS[module]}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


