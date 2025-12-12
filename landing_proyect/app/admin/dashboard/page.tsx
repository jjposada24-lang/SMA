import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import LogoutButton from '@/components/LogoutButton';
import AdminClientsManager from '@/components/AdminClientsManager';
import { getClients } from '@/lib/data/clients';

export default async function AdminDashboard() {
  const session = await getSession();
  const clients = await getClients();

  if (!session || session.role !== 'admin') {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-[#0b0c10] text-white px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold">Panel de administración</h1>
        <div className="mt-2 flex items-center gap-4 text-white/70">
          <span>
            Usuario: {session.username} {session.displayName ? `(${session.displayName})` : ''}
          </span>
          <span className="text-xs text-white/50">UserID: {session.userId}</span>
          <span className="text-xs text-white/50">RoleID: {session.roleId}</span>
          <LogoutButton />
        </div>
        <AdminClientsManager
          initialClients={clients}
          sessionRoleId={session.roleId}
          sessionUserId={session.userId}
        />
      </div>
    </main>
  );
}


