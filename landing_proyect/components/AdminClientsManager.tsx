'use client';

import { useEffect, useState } from 'react';
import { UserPlus, Users, Trash2, Search, CheckSquare, Square, Pencil, UserCog, X } from 'lucide-react';
import type { ClientRecord, ModuleKey } from '@/lib/data/clients';
import type { RoleId, PublicUser } from '@/lib/auth/users';

const MODULE_LABELS: Record<ModuleKey, string> = {
  usuarios: 'Usuarios',
  grabaciones: 'Grabaciones',
  movimientos: 'Movimientos',
};

type Props = {
  initialClients: ClientRecord[];
  sessionRoleId: RoleId;
  sessionUserId: number;
};

type Tab = 'create' | 'list' | 'my-users';

export default function AdminClientsManager({ initialClients, sessionRoleId, sessionUserId }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('create');
  const [clients, setClients] = useState<ClientRecord[]>(initialClients);
  const [myUsers, setMyUsers] = useState<PublicUser[]>([]);
  
  // States generales
  const [filter, setFilter] = useState('');
  const [listLoading, setListLoading] = useState(false);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Create User Form state
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<RoleId>(sessionRoleId === 1 ? 2 : 3);

  // Edit User Form state
  const [editingUser, setEditingUser] = useState<PublicUser | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editCedula, setEditCedula] = useState('');
  const [editMail, setEditMail] = useState('');
  const [editPassword, setEditPassword] = useState('');

  // ... (Funciones handleToggle, handleCreate, etc.)
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
      setClients((prev) =>
        prev.map((c) => (c.username === username ? { ...c, modules: { ...c.modules, [module]: enabled } } : c)),
      );
    } catch (err) {
      console.error(err);
      setError('Error de red al actualizar');
    } finally {
      setLoadingKey(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, cedula, mail, password, roleId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setFormError(json?.error ?? 'No se pudo crear el usuario');
        return;
      }
      if (json.client) {
        setClients((prev) => [...prev, json.client as ClientRecord]);
      }
      // Si es customer y creó un usuario, refrescar su lista
      if (sessionRoleId === 2 && json.user) {
        // Podríamos agregar a myUsers manualmente o refrescar
        refreshMyUsers();
      }

      setNombre('');
      setCedula('');
      setMail('');
      setPassword('');
      setRoleId(sessionRoleId === 1 ? 2 : 3);
      alert('Usuario creado correctamente');
    } catch (err) {
      console.error(err);
      setFormError('Error de red al crear usuario');
    } finally {
      setFormLoading(false);
    }
  };

  const refreshClients = async () => {
    setListLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/clients');
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? 'No se pudo obtener clientes');
        return;
      }
      setClients(json.clients as ClientRecord[]);
    } catch (err) {
      console.error(err);
      setError('Error de red al obtener clientes');
    } finally {
      setListLoading(false);
    }
  };

  const refreshMyUsers = async () => {
    setListLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users'); // GET llama a hijos por defecto para rol 2
      const json = await res.json();
      if (!res.ok) {
        // Si es admin (rol 1) podría dar 401/403 si el endpoint no soporta, pero lo manejamos
        if (sessionRoleId === 2) setError(json?.error ?? 'No se pudieron cargar usuarios');
        return;
      }
      setMyUsers(json.users as PublicUser[]);
    } catch (err) {
      console.error(err);
      setError('Error de red al cargar usuarios');
    } finally {
      setListLoading(false);
    }
  };

  const handleDeleteClient = async (username: string) => {
    const confirmed = window.confirm(`¿Eliminar cliente ${username}? Esta acción es permanente.`);
    if (!confirmed) return;
    setDeleteLoading(username);
    setError(null);
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? 'No se pudo eliminar');
        return;
      }
      setClients((prev) => prev.filter((c) => c.username !== username));
    } catch (err) {
      console.error(err);
      setError('Error de red al eliminar');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const confirmed = window.confirm('¿Estás seguro de eliminar este usuario?');
    if (!confirmed) return;
    setDeleteLoading(String(userId));
    setError(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? 'No se pudo eliminar usuario');
        return;
      }
      setMyUsers((prev) => prev.filter((u) => u.userId !== userId));
    } catch (err) {
      console.error(err);
      setError('Error al eliminar usuario');
    } finally {
      setDeleteLoading(null);
    }
  };

  const openEditModal = (user: PublicUser) => {
    setEditingUser(user);
    setEditNombre(user.displayName ?? '');
    setEditCedula(user.cedula ?? '');
    setEditMail(user.email ?? '');
    setEditPassword('');
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    setFormLoading(true);
    setFormError(null);
    
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.userId,
          nombre: editNombre,
          cedula: editCedula,
          email: editMail,
          password: editPassword || undefined, // Solo enviar si cambió
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setFormError(json?.error ?? 'Error al actualizar');
        return;
      }
      
      // Actualizar lista local
      setMyUsers((prev) => prev.map((u) => (u.userId === editingUser.userId ? { ...u, ...json.user } : u)));
      setEditingUser(null);
    } catch (err) {
      console.error(err);
      setFormError('Error de red al actualizar');
    } finally {
      setFormLoading(false);
    }
  };

  useEffect(() => {
    if (sessionRoleId === 1) refreshClients();
    if (sessionRoleId === 2) refreshMyUsers();
  }, [sessionRoleId]);

  return (
    <div className="flex flex-col md:flex-row gap-6 relative">
      {/* Sidebar de navegación */}
      <div className="w-full md:w-64 flex flex-col gap-2">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeTab === 'create'
              ? 'bg-[#F7931E] text-black font-semibold shadow-lg'
              : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
          }`}
        >
          <UserPlus size={20} />
          Crear usuario
        </button>
        
        {sessionRoleId === 1 && (
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'list'
                ? 'bg-[#F7931E] text-black font-semibold shadow-lg'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Users size={20} />
            Ver clientes
          </button>
        )}

        {sessionRoleId === 2 && (
          <button
            onClick={() => setActiveTab('my-users')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'my-users'
                ? 'bg-[#F7931E] text-black font-semibold shadow-lg'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <UserCog size={20} />
            Mis Usuarios
          </button>
        )}
      </div>

      {/* Contenido Principal */}
      <div className="flex-1">
        
        {/* TAB: CREAR USUARIO */}
        {activeTab === 'create' && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-xl font-semibold mb-1 text-white">Crear usuario / cliente</h2>
            <p className="text-xs text-white/50 mb-6">
              Registra un nuevo usuario en el sistema. (Tu ID: {sessionUserId})
            </p>
            {formError && <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300 border border-red-500/20">{formError}</p>}
            
            <form className="grid gap-5 md:grid-cols-2" onSubmit={handleCreate} autoComplete="off">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-white/80 font-medium">Nombre</label>
                <input
                  className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:outline-none focus:border-[#F7931E] transition-colors"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  autoComplete="off"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-white/80 font-medium">Cédula</label>
                <input
                  className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:outline-none focus:border-[#F7931E] transition-colors"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  placeholder="Ej. 12345678"
                  autoComplete="off"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-white/80 font-medium">Email</label>
                <input
                  type="email"
                  className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:outline-none focus:border-[#F7931E] transition-colors"
                  value={mail}
                  onChange={(e) => setMail(e.target.value)}
                  placeholder="Ej. usuario@empresa.com"
                  autoComplete="new-password"
                  name="user_email_new"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-white/80 font-medium">Contraseña</label>
                <input
                  type="password"
                  className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:outline-none focus:border-[#F7931E] transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  name="user_password_new"
                  required
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm text-white/80 font-medium">Rol</label>
                <select
                  className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:outline-none focus:border-[#F7931E] transition-colors appearance-none"
                  value={roleId}
                  onChange={(e) => setRoleId(Number(e.target.value) as RoleId)}
                  disabled={sessionRoleId === 1 ? false : sessionRoleId === 2 ? false : true}
                >
                  {sessionRoleId === 1 && <option value={2} className="text-black">Admin Customer</option>}
                  {sessionRoleId === 2 && <option value={3} className="text-black">Sub Customer</option>}
                </select>
              </div>
              
              <div className="md:col-span-2 mt-2">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full md:w-auto rounded-full bg-[#F7931E] px-8 py-3 text-sm font-bold text-[#1f1203] shadow-lg transition hover:bg-[#e7830e] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
                >
                  {formLoading ? 'Creando...' : 'Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB: LISTA CLIENTES (ADMIN ROOT) */}
        {activeTab === 'list' && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
              <Users size={24} className="text-[#F7931E]" />
              Gestión de Clientes
            </h2>
            
            {error && <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300 border border-red-500/20">{error}</p>}

            <div className="mb-6 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 h-5 w-5" />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Buscar por nombre, ID..."
                className="w-full rounded-xl border border-white/20 bg-white/5 pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#F7931E] transition-colors"
              />
            </div>

            <div className="space-y-4">
              {listLoading && <p className="text-center text-white/60 py-8">Cargando clientes...</p>}
              {!listLoading && clients.length === 0 && (
                <p className="text-center text-white/40 py-8">No se encontraron clientes.</p>
              )}
              {!listLoading &&
                clients
                  .filter((c) => c.username.toLowerCase().includes(filter.toLowerCase()))
                  .map((client) => (
                <div key={client.username} className="rounded-xl border border-white/10 bg-black/20 p-5 hover:bg-black/30 transition-colors group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#F7931E] to-[#b35d00] flex items-center justify-center text-white font-bold text-lg">
                          {client.username.substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{client.username}</p>
                          <p className="text-xs text-white/50">Cliente ID: {client.username}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteClient(client.username)}
                      disabled={deleteLoading === client.username}
                      className="self-end sm:self-auto flex items-center gap-2 text-xs rounded-full border border-red-500/30 px-4 py-2 text-red-300 hover:bg-red-500/10 hover:border-red-500/60 transition-all disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      {deleteLoading === client.username ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-white/40 mb-3 uppercase tracking-wider font-medium">Módulos Activos</p>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {(Object.keys(client.modules) as ModuleKey[]).map((module) => (
                        <label
                          key={module}
                          className={`cursor-pointer select-none flex items-center gap-3 rounded-md border px-3 py-2 text-sm transition-all ${
                            client.modules[module]
                              ? 'border-[#F7931E]/50 bg-[#F7931E]/10 text-white'
                              : 'border-white/5 bg-transparent text-white/40 hover:bg-white/5'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={client.modules[module]}
                            disabled={loadingKey === `${client.username}-${module}`}
                            onChange={(e) => handleToggle(client.username, module, e.target.checked)}
                          />
                          {client.modules[module] ? (
                            <CheckSquare size={18} className="text-[#F7931E]" />
                          ) : (
                            <Square size={18} />
                          )}
                          <span className={client.modules[module] ? 'font-medium' : ''}>
                            {MODULE_LABELS[module]}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                  ))}
            </div>
          </div>
        )}

        {/* TAB: MIS USUARIOS (ADMIN CUSTOMER) */}
        {activeTab === 'my-users' && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
              <UserCog size={24} className="text-[#F7931E]" />
              Mis Usuarios (Sub Customers)
            </h2>
            
            {error && <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300 border border-red-500/20">{error}</p>}

            <div className="space-y-4">
              {listLoading && <p className="text-center text-white/60 py-8">Cargando usuarios...</p>}
              {!listLoading && myUsers.length === 0 && (
                <p className="text-center text-white/40 py-8">No has creado usuarios aún.</p>
              )}
              
              <div className="grid gap-4 sm:grid-cols-2">
                {!listLoading && myUsers.map((user) => (
                  <div key={user.userId} className="rounded-xl border border-white/10 bg-black/20 p-5 hover:bg-black/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">
                          {user.displayName?.substring(0, 1).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold">{user.displayName}</p>
                          <p className="text-xs text-white/50">{user.email}</p>
                          <p className="text-xs text-white/30 mt-1">Cédula: {user.cedula || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.userId)}
                          disabled={deleteLoading === String(user.userId)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#1a1a1a] border border-white/10 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Editar Usuario</h3>
              <button onClick={() => setEditingUser(null)} className="text-white/50 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="text-xs text-white/60 mb-1 block">Nombre</label>
                <input
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white focus:outline-none focus:border-[#F7931E]"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Cédula</label>
                <input
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white focus:outline-none focus:border-[#F7931E]"
                  value={editCedula}
                  onChange={(e) => setEditCedula(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Email</label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white focus:outline-none focus:border-[#F7931E]"
                  value={editMail}
                  onChange={(e) => setEditMail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Nueva Contraseña (opcional)</label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white focus:outline-none focus:border-[#F7931E]"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Dejar vacío para no cambiar"
                  autoComplete="new-password"
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2 text-sm font-medium text-white hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 rounded-lg bg-[#F7931E] py-2 text-sm font-bold text-[#1f1203] hover:bg-[#e7830e] disabled:opacity-70"
                >
                  {formLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


