import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import LogoutButton from '@/components/LogoutButton';
import { getClient } from '@/lib/data/clients';

export default async function ClienteHome() {
  const session = await getSession();

  if (!session || session.role !== 'customer') {
    redirect('/login');
  }

  const client = await getClient(session.username);
  const activeModules = client
    ? (Object.entries(client.modules) as [string, boolean][])
        .filter(([, enabled]) => enabled)
        .map(([key]) => key)
    : [];

  return (
    <main className="min-h-screen bg-[#0b0c10] text-white px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="w-full lg:w-72 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl">
            <h2 className="text-lg font-semibold mb-3">Módulos activos</h2>
            {!client && <p className="text-sm text-white/60">No se encontró tu cliente.</p>}
            {client && activeModules.length === 0 && (
              <p className="text-sm text-white/60">Aún no tienes módulos habilitados.</p>
            )}
            {client && activeModules.length > 0 && (
              <ul className="space-y-2 text-sm">
                {activeModules.map((m) => (
                  <li
                    key={m}
                    className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white/90"
                  >
                    {m}
                  </li>
                ))}
              </ul>
            )}
          </aside>

          <div className="flex-1">
            <h1 className="text-3xl font-semibold">Área de cliente</h1>
            <div className="mt-2 flex items-center gap-4 text-white/70">
              <span>Usuario: {session.username}</span>
              <LogoutButton />
            </div>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
              <h2 className="text-xl font-semibold mb-2">Módulos disponibles</h2>
              <p className="text-sm text-white/70">
                Aquí verás los módulos y accesos que tienes disponibles (pendiente de implementar).
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


