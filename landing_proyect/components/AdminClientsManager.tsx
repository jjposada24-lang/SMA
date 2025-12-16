'use client';

import { useEffect, useState, useRef } from 'react';
import { UserPlus, Users, Trash2, Search, CheckSquare, Square, Pencil, UserCog, X, Plus, Tractor, Upload, FileText } from 'lucide-react';
import type { MachineTypeRecord } from '@/lib/data/machine-types';
import type { ClientRecord, ModuleKey } from '@/lib/data/clients';
import type { RoleId, PublicUser } from '@/lib/auth/users';
import type { MachineRecord, CreateMachineInput, MachineEngine, MachineFile } from '@/lib/data/machines';
import { createClient } from '@/lib/supabase-browser';

const MODULE_LABELS: Record<ModuleKey, string> = {
  usuarios: 'Usuarios',
  grabaciones: 'Grabaciones',
  movimientos: 'Movimientos',
};

// Tipo extendido para incluir datos de Supabase
type ExtendedClient = ClientRecord & Partial<PublicUser>;

type Props = {
  initialClients: ClientRecord[];
  sessionRoleId: RoleId;
  sessionUserId: number;
  clientModules?: Record<ModuleKey, boolean> | null;
};

type Tab = 'create' | 'list' | 'my-users' | 'machine-types' | 'machines';

export default function AdminClientsManager({
  initialClients,
  sessionRoleId,
  sessionUserId,
  clientModules,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('create');
  // Usamos ExtendedClient[] en lugar de ClientRecord[]
  const [clients, setClients] = useState<ExtendedClient[]>(initialClients);
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
  const [usersMenuOpen, setUsersMenuOpen] = useState(true);
  const [modulesOpen, setModulesOpen] = useState<{ grabaciones: boolean; movimientos: boolean }>({
    grabaciones: false,
    movimientos: false,
  });
  const [machineTypes, setMachineTypes] = useState<MachineTypeRecord[]>([]);
  const [mtLoading, setMtLoading] = useState(false);
  const [mtError, setMtError] = useState<string | null>(null);
  const [mtMachineId, setMtMachineId] = useState('');
  const [mtName, setMtName] = useState('');
  const [mtEditId, setMtEditId] = useState<number | null>(null);
  const [mtEditMachineId, setMtEditMachineId] = useState('');
  const [mtEditName, setMtEditName] = useState('');
  const [customerModules, setCustomerModules] = useState<Record<ModuleKey, boolean> | null>(
    clientModules ?? null,
  );

  // MACHINES STATE
  const [machines, setMachines] = useState<MachineRecord[]>([]);
  const [machinesLoading, setMachinesLoading] = useState(false);
  const [machineError, setMachineError] = useState<string | null>(null);
  const [isEditingMachine, setIsEditingMachine] = useState(false); // Vista: Lista vs Form
  
  // Formulario Máquina
  const defaultMachineForm: Partial<CreateMachineInput> = {
    name: '',
    machine_type_id: undefined,
    brand: '',
    model: '',
    year: '',
    serial_number: '',
    fuel_type: 'DIESEL',
    control_type: 'Horometro',
    maintenance_interval: '',
    observations: '',
    create_cost_center: false,
    is_active: true,
    engines: [],
    files: []
  };
  const [machineForm, setMachineForm] = useState<Partial<CreateMachineInput>>(defaultMachineForm);
  const [machineIdToEdit, setMachineIdToEdit] = useState<number | null>(null);
  
  // Formulario Motor (dentro de Máquina)
  const defaultEngineForm: MachineEngine = {
    brand: '',
    serial_number: '',
    type: '',
    power: '',
    location: '',
    description: ''
  };
  const [engineForm, setEngineForm] = useState<MachineEngine>(defaultEngineForm);
  const [showEngineForm, setShowEngineForm] = useState(false);

  // FILES STATE
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // Si el API devolvió un cliente (para lista global), lo agregamos
      if (json.client || json.user) {
         // Re-fetch para tener la data completa (combinada)
         if (sessionRoleId === 1) await refreshClients();
      }
      
      // Si es customer y creó un usuario, refrescar su lista
      if (sessionRoleId === 2 && json.user) {
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
      setClients(json.clients as ExtendedClient[]);
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
    const confirmed = window.confirm(`¿Eliminar cliente ${username}? Esta acción es permanente y eliminará al usuario de la base de datos.`);
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

  // Machine Types logic
  const fetchMachineTypes = async () => {
    setMtLoading(true);
    setMtError(null);
    try {
      const res = await fetch('/api/machine-types');
      const json = await res.json();
      if (!res.ok) {
        setMtError(json?.error ?? 'No se pudieron cargar los tipos de máquina');
        return;
      }
      setMachineTypes(json.items as MachineTypeRecord[]);
    } catch (err) {
      console.error(err);
      setMtError('Error de red al cargar tipos de máquina');
    } finally {
      setMtLoading(false);
    }
  };

  const submitMachineType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mtName.trim() || !mtMachineId.trim()) return;
    const digitsOnly = /^\d+$/;
    if (!digitsOnly.test(mtMachineId.trim())) {
      setMtError('El ID de máquina debe ser numérico (sin signos ni separadores).');
      return;
    }
    const parsed = Number(mtMachineId);
    if (Number.isNaN(parsed) || !Number.isInteger(parsed) || parsed < 1 || parsed > 32767) {
      setMtError('El ID de máquina debe ser un entero entre 1 y 32767.');
      return;
    }
    setMtLoading(true);
    setMtError(null);
    try {
      const res = await fetch('/api/machine-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: mtName.trim().toUpperCase(), machineId: parsed }),
      });
      const json = await res.json();
      if (!res.ok) {
        setMtError(json?.error ?? 'No se pudo guardar');
        return;
      }
      setMtName('');
      setMtMachineId('');
      await fetchMachineTypes();
    } catch (err) {
      console.error(err);
      setMtError('Error de red al guardar');
    } finally {
      setMtLoading(false);
    }
  };

  const startEditMt = (item: MachineTypeRecord) => {
    setMtEditId(item.id);
    setMtEditName(item.name);
    setMtEditMachineId(item.machine_id);
  };

  const submitEditMt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mtEditId || !mtEditName.trim() || !mtEditMachineId.trim()) return;
    const digitsOnly = /^\d+$/;
    if (!digitsOnly.test(mtEditMachineId.trim())) {
      setMtError('El ID de máquina debe ser numérico (sin signos ni separadores).');
      return;
    }
    const parsed = Number(mtEditMachineId);
    if (Number.isNaN(parsed) || !Number.isInteger(parsed) || parsed < 1 || parsed > 32767) {
      setMtError('El ID de máquina debe ser un entero entre 1 y 32767.');
      return;
    }
    setMtLoading(true);
    setMtError(null);
    try {
      const res = await fetch('/api/machine-types', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: mtEditId, name: mtEditName.trim().toUpperCase(), machineId: parsed }),
      });
      const json = await res.json();
      if (!res.ok) {
        setMtError(json?.error ?? 'No se pudo actualizar');
        return;
      }
      setMtEditId(null);
      setMtEditName('');
      setMtEditMachineId('');
      await fetchMachineTypes();
    } catch (err) {
      console.error(err);
      setMtError('Error de red al actualizar');
    } finally {
      setMtLoading(false);
    }
  };

  const deleteMt = async (id: number) => {
    const confirmed = window.confirm('¿Eliminar este tipo de máquina?');
    if (!confirmed) return;
    setMtLoading(true);
    setMtError(null);
    try {
      const res = await fetch('/api/machine-types', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) {
        setMtError(json?.error ?? 'No se pudo eliminar');
        return;
      }
      await fetchMachineTypes();
    } catch (err) {
      console.error(err);
      setMtError('Error de red al eliminar');
    } finally {
      setMtLoading(false);
    }
  };

  // MACHINES FUNCTIONS
  const fetchMachines = async () => {
    setMachinesLoading(true);
    setMachineError(null);
    try {
      const res = await fetch('/api/machines');
      const json = await res.json();
      if (!res.ok) {
        setMachineError(json?.error ?? 'No se pudieron cargar las máquinas');
        return;
      }
      setMachines(json.items as MachineRecord[]);
    } catch (err) {
      console.error(err);
      setMachineError('Error de red al cargar máquinas');
    } finally {
      setMachinesLoading(false);
    }
  };

  const handleSaveMachine = async () => {
    if (!machineForm.name?.trim()) {
      setMachineError('El campo Equipo (Nombre) es obligatorio.');
      return;
    }
    setMachinesLoading(true);
    setMachineError(null);
    try {
      const isUpdate = !!machineIdToEdit;
      const url = '/api/machines';
      const method = isUpdate ? 'PUT' : 'POST';
      const body = { ...machineForm, id: machineIdToEdit };
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        setMachineError(json?.error ?? 'No se pudo guardar la máquina');
        setMachinesLoading(false);
        return;
      }
      
      await fetchMachines();
      setIsEditingMachine(false);
      setMachineForm(defaultMachineForm);
      setMachineIdToEdit(null);
    } catch (err) {
      console.error(err);
      setMachineError('Error de red al guardar máquina');
      setMachinesLoading(false);
    }
  };

  const handleDeleteMachine = async (id: number) => {
    if (!window.confirm('¿Eliminar esta máquina?')) return;
    setMachinesLoading(true);
    try {
      const res = await fetch('/api/machines', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      await fetchMachines();
    } catch (err) {
      setMachineError('No se pudo eliminar la máquina');
      setMachinesLoading(false);
    }
  };

  const openCreateMachine = () => {
    setMachineForm(defaultMachineForm);
    setMachineIdToEdit(null);
    setIsEditingMachine(true);
    setMachineError(null);
  };

  const openEditMachine = (m: MachineRecord) => {
    setMachineForm({
      name: m.name,
      machine_type_id: m.machine_type_id ?? undefined,
      brand: m.brand,
      model: m.model,
      year: m.year,
      serial_number: m.serial_number,
      fuel_type: m.fuel_type,
      control_type: m.control_type,
      maintenance_interval: m.maintenance_interval,
      observations: m.observations,
      create_cost_center: m.create_cost_center,
      is_active: m.is_active,
      engines: m.engines ?? [],
      files: m.files ?? []
    });
    setMachineIdToEdit(m.id);
    setIsEditingMachine(true);
    setMachineError(null);
  };

  const addEngine = () => {
    if (!engineForm.brand && !engineForm.type) return;
    setMachineForm(prev => ({
      ...prev,
      engines: [...(prev.engines || []), { ...engineForm, id: Date.now() }] // temp id for key
    }));
    setEngineForm(defaultEngineForm);
    setShowEngineForm(false);
  };

  const removeEngine = (idx: number) => {
    setMachineForm(prev => ({
      ...prev,
      engines: prev.engines?.filter((_, i) => i !== idx)
    }));
  };

  // Files Handlers
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploadingFile(true);
    setMachineError(null);
    
    const client = createClient();
    const newFiles: MachineFile[] = [];

    try {
      for (const file of Array.from(e.target.files)) {
        // Sanitize name
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${sessionUserId}/${fileName}`; // Estructura: userId/filename

        // Usar nuestro endpoint API proxy para subir el archivo de forma segura
        const formData = new FormData();
        formData.append('file', file);
        formData.append('path', filePath);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          console.error('Error uploading file:', data.error);
          setMachineError(`Error al subir archivo ${file.name}: ${data.error}`);
          continue;
        }

        const publicUrl = data.url;

        newFiles.push({
          name: file.name,
          url: publicUrl,
          type: file.type || 'unknown'
        });
      }

      if (newFiles.length > 0) {
        setMachineForm(prev => ({
          ...prev,
          files: [...(prev.files || []), ...newFiles]
        }));
      }
    } catch (err) {
       console.error(err);
       setMachineError('Error inesperado al subir archivos');
    } finally {
       setUploadingFile(false);
       if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeFile = (idx: number) => {
    // Nota: Solo lo quitamos de la lista visual y del objeto a guardar. 
    // No lo borramos del bucket aquí para simplificar (podría borrarse al guardar o en cronjob)
    setMachineForm(prev => ({
      ...prev,
      files: prev.files?.filter((_, i) => i !== idx)
    }));
  };

  // User Actions
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
          password: editPassword || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setFormError(json?.error ?? 'Error al actualizar');
        return;
      }
      
      setMyUsers((prev) => prev.map((u) => (u.userId === editingUser.userId ? { ...u, ...json.user } : u)));
      setEditingUser(null);
    } catch (err) {
      console.error(err);
      setFormError('Error de red al actualizar');
    } finally {
      setFormLoading(false);
    }
  };

  const canUseUsuarios =
    sessionRoleId === 1 ? true : customerModules?.usuarios !== false;
  const modulesState: Record<ModuleKey, boolean> = {
    usuarios: customerModules?.usuarios ?? false,
    grabaciones: customerModules?.grabaciones ?? false,
    movimientos: customerModules?.movimientos ?? false,
  };
  const toggleModuleAccordion = (key: 'grabaciones' | 'movimientos') =>
    setModulesOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    const loadForRole = async () => {
      if (sessionRoleId === 1) {
        await refreshClients();
      } else if (sessionRoleId === 2) {
        refreshMyUsers();
        try {
          const res = await fetch('/api/admin/clients');
          const json = await res.json();
          if (res.ok && Array.isArray(json.clients)) {
            const selfClient = (json.clients as ClientRecord[]).find(
              (c) => c.username === String(sessionUserId),
            );
            if (selfClient) {
              setCustomerModules(selfClient.modules);
              if (selfClient.modules.grabaciones) {
                fetchMachineTypes();
                // Si ya estamos en grabaciones, podríamos cargar máquinas, pero mejor esperar a click
              }
            }
          }
        } catch (err) {
          console.error('load client modules error', err);
        }
      }
    };
    void loadForRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionRoleId]);

  // Cargar lista de máquinas al entrar a la tab
  useEffect(() => {
    if (activeTab === 'machines' && sessionRoleId === 2) {
      fetchMachines();
    }
  }, [activeTab, sessionRoleId]);

  useEffect(() => {
    if (sessionRoleId === 2 && modulesState.grabaciones) {
      fetchMachineTypes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modulesState.grabaciones]);

  return (
    <div className="flex flex-col md:flex-row gap-6 relative">
      {/* Sidebar de navegación */}
      <div className="w-full md:w-64 flex flex-col gap-2">

        {/* Módulos activos (visible para rol 2) */}
        {sessionRoleId === 2 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
            <p className="text-xs uppercase tracking-wide text-white/50 mb-2">Módulos activos</p>
            <div className="space-y-2">
              {(Object.keys(modulesState) as ModuleKey[]).map((m) => (
                <div
                  key={m}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                    modulesState[m] ? 'bg-[#1f1f1f] border border-white/10' : 'bg-white/5 border border-white/5 opacity-60'
                  }`}
                >
                  <span className="capitalize">{m}</span>
                  {modulesState[m] ? (
                    <CheckSquare size={16} className="text-[#F7931E]" />
                  ) : (
                    <Square size={16} className="text-white/40" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {canUseUsuarios && (
          <div className="rounded-xl border border-white/10 bg-white/5">
            <button
              onClick={() => setUsersMenuOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-white hover:bg-white/10 rounded-t-xl transition"
            >
              <span className="flex items-center gap-3 font-semibold">
                <Users size={18} className="text-[#F7931E]" />
                Usuarios
              </span>
              <span className="text-white/50">{usersMenuOpen ? '−' : '+'}</span>
            </button>
            {usersMenuOpen && (
              <div className="flex flex-col gap-1 px-2 pb-3">
                <button
                  onClick={() => setActiveTab('create')}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    activeTab === 'create'
                      ? 'bg-[#F7931E] text-black font-semibold shadow-lg'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <UserPlus size={18} />
                  Crear usuario
                </button>
                {sessionRoleId === 2 && (
                  <button
                    onClick={() => setActiveTab('my-users')}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                      activeTab === 'my-users'
                        ? 'bg-[#F7931E] text-black font-semibold shadow-lg'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <UserCog size={18} />
                    Mis Usuarios
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Módulo: Grabaciones */}
        {sessionRoleId === 2 && modulesState.grabaciones && (
          <div className="rounded-xl border border-white/10 bg-white/5">
            <button
              onClick={() => toggleModuleAccordion('grabaciones')}
              className="w-full flex items-center justify-between px-4 py-3 text-white hover:bg-white/10 rounded-t-xl transition"
            >
              <span className="capitalize">{MODULE_LABELS.grabaciones}</span>
              <span className="text-white/50">
                {modulesOpen.grabaciones ? '−' : '+'}
              </span>
            </button>
            {modulesOpen.grabaciones && (
              <div className="flex flex-col gap-1 px-2 pb-3">
                <button
                  onClick={() => setActiveTab('machines')}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    activeTab === 'machines'
                      ? 'bg-[#F7931E] text-black font-semibold shadow-lg'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Tractor size={18} />
                  Maquinas
                </button>
                <button
                  onClick={() => setActiveTab('machine-types' as Tab)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    activeTab === 'machine-types'
                      ? 'bg-[#F7931E] text-black font-semibold shadow-lg'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Tipos de máquina
                </button>
              </div>
            )}
          </div>
        )}

        {/* Placeholder para movimientos */}
        {sessionRoleId === 2 && modulesState.movimientos && (
          <div className="rounded-xl border border-white/10 bg-white/5">
            <button
              onClick={() => toggleModuleAccordion('movimientos')}
              className="w-full flex items-center justify-between px-4 py-3 text-white hover:bg-white/10 rounded-t-xl transition"
            >
              <span className="capitalize">{MODULE_LABELS.movimientos}</span>
              <span className="text-white/50">{modulesOpen.movimientos ? '−' : '+'}</span>
            </button>
            {modulesOpen.movimientos && (
              <div className="px-4 pb-4 text-sm text-white/70">
                Próximamente podrás gestionar las funcionalidades de Movimientos.
              </div>
            )}
          </div>
        )}
        
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

      </div>

      {/* Contenido Principal */}
      <div className="flex-1">
        
        {/* TAB: CREAR USUARIO */}
        {activeTab === 'create' && canUseUsuarios && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl animate-in fade-in zoom-in duration-300">
            {/* ... Contenido igual ... */}
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
             {/* ... Contenido existente de lista de clientes ... */}
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
                  .filter((c) => (c.displayName || c.username).toLowerCase().includes(filter.toLowerCase()))
                  .map((client) => (
                <div key={client.username} className="rounded-xl border border-white/10 bg-black/20 p-5 hover:bg-black/30 transition-colors group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#F7931E] to-[#b35d00] flex items-center justify-center text-white font-bold text-lg">
                          {(client.displayName || client.username).substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{client.displayName || client.username}</p>
                          <div className="flex flex-col gap-0.5 text-xs text-white/50">
                             <span>ID: {client.username}</span>
                             {client.parentId && <span>Parent ID: {client.parentId}</span>}
                             {client.roleId && (
                                <span className="inline-flex items-center gap-1 mt-1">
                                  <span className={`inline-block w-2 h-2 rounded-full ${
                                    client.roleId === 1 ? 'bg-red-500' :
                                    client.roleId === 2 ? 'bg-blue-500' : 'bg-green-500'
                                  }`}></span>
                                  {client.roleId === 1 ? 'Admin Root' : client.roleId === 2 ? 'Admin Customer' : 'Sub Customer'}
                                </span>
                             )}
                          </div>
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
                  {(client.roleId === 2 || client.roleId === 3) && (
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
                  )}
                </div>
                  ))}
            </div>
          </div>
        )}

        {/* ... (TAB: MIS USUARIOS - se mantiene igual, ya está en el código existente) */}
        {activeTab === 'my-users' && canUseUsuarios && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl animate-in fade-in zoom-in duration-300">
             {/* ... (Contenido original de Mis Usuarios) ... */}
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

        {/* TAB: MAQUINAS (NUEVO) */}
        {activeTab === 'machines' && sessionRoleId === 2 && modulesState.grabaciones && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl animate-in fade-in zoom-in duration-300">
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-xl font-semibold text-white">Maquinas</h2>
               {!isEditingMachine && (
                 <button 
                   onClick={openCreateMachine}
                   className="flex items-center gap-2 rounded-lg bg-[#F7931E] px-4 py-2 text-sm font-bold text-[#1f1203] hover:bg-[#e7830e]"
                 >
                   <Plus size={16} />
                   Nueva Máquina
                 </button>
               )}
             </div>

             {machineError && (
              <p className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-red-300 text-sm">
                {machineError}
              </p>
             )}

             {isEditingMachine ? (
               /* FORMULARIO MAQUINA */
               <div className="bg-white text-black p-6 rounded-lg max-w-4xl mx-auto shadow-xl">
                 <h3 className="text-center text-xl font-bold mb-6 border-b pb-2">Maquinas</h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    {/* Columna Izquierda */}
                    <div className="space-y-3">
                       <div className="flex items-center gap-2">
                          <label className="w-32 font-bold">Equipo</label>
                          <input 
                            className="flex-1 border rounded px-2 py-1" 
                            value={machineForm.name}
                            onChange={e => setMachineForm(p => ({...p, name: e.target.value}))}
                          />
                       </div>
                       <div className="flex items-center gap-2">
                          <label className="w-32 font-bold">Tipo</label>
                          <select 
                            className="flex-1 border rounded px-2 py-1 uppercase"
                            value={machineForm.machine_type_id ?? ''}
                            onChange={e => setMachineForm(p => ({...p, machine_type_id: Number(e.target.value) || undefined}))}
                          >
                             <option value="">Seleccione...</option>
                             {machineTypes.map(mt => (
                               <option key={mt.id} value={mt.id}>{mt.name}</option>
                             ))}
                          </select>
                       </div>
                       <div className="flex items-center gap-2">
                          <label className="w-32 font-bold">Marca</label>
                          <input 
                            className="flex-1 border rounded px-2 py-1"
                            value={machineForm.brand}
                            onChange={e => setMachineForm(p => ({...p, brand: e.target.value}))}
                          />
                       </div>
                       <div className="flex items-center gap-2">
                          <label className="w-32 font-bold">Modelo</label>
                          <input 
                            className="flex-1 border rounded px-2 py-1"
                            value={machineForm.model}
                            onChange={e => setMachineForm(p => ({...p, model: e.target.value}))}
                          />
                       </div>
                       <div className="flex items-center gap-2">
                          <label className="w-32 font-bold">Año</label>
                          <input 
                            className="w-24 border rounded px-2 py-1"
                            value={machineForm.year}
                            onChange={e => setMachineForm(p => ({...p, year: e.target.value}))}
                          />
                       </div>
                       <div className="flex items-center gap-2">
                          <label className="w-32 font-bold">Serie</label>
                          <input 
                            className="flex-1 border rounded px-2 py-1"
                            value={machineForm.serial_number}
                            onChange={e => setMachineForm(p => ({...p, serial_number: e.target.value}))}
                          />
                       </div>
                       
                       <div className="flex items-center gap-2 mt-4">
                          <label className="w-32 font-bold">Combustible</label>
                          <select 
                             className="border rounded px-2 py-1"
                             value={machineForm.fuel_type}
                             onChange={e => setMachineForm(p => ({...p, fuel_type: e.target.value}))}
                          >
                             <option value="DIESEL">DIESEL</option>
                             <option value="GASOLINA">GASOLINA</option>
                             <option value="ELECTRICO">ELECTRICO</option>
                             <option value="GAS">GAS</option>
                          </select>
                       </div>
                       
                       <div className="flex items-center gap-2">
                          <label className="w-32 font-bold">Tipo de Control</label>
                          <div className="flex gap-4">
                             <label className="flex items-center gap-1">
                               <input 
                                 type="radio" 
                                 name="control_type" 
                                 checked={machineForm.control_type === 'Horometro'} 
                                 onChange={() => setMachineForm(p => ({...p, control_type: 'Horometro'}))}
                               />
                               Horometro
                             </label>
                             <label className="flex items-center gap-1">
                               <input 
                                 type="radio" 
                                 name="control_type" 
                                 checked={machineForm.control_type === 'Kilometraje'} 
                                 onChange={() => setMachineForm(p => ({...p, control_type: 'Kilometraje'}))}
                               />
                               Kilometraje
                             </label>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-2">
                          <label className="w-32 font-bold text-xs leading-tight">Frecuencia de Mantenimiento</label>
                          <input 
                             className="flex-1 border rounded px-2 py-1"
                             value={machineForm.maintenance_interval}
                             onChange={e => setMachineForm(p => ({...p, maintenance_interval: e.target.value}))}
                          />
                       </div>
                    </div>

                    {/* Columna Derecha */}
                    <div className="space-y-3">
                       <div className="flex flex-col gap-1">
                          <label className="font-bold">Observaciones:</label>
                          <textarea 
                             className="border rounded p-2 h-24 resize-none"
                             value={machineForm.observations}
                             onChange={e => setMachineForm(p => ({...p, observations: e.target.value}))}
                          />
                       </div>
                       
                       {/* SECCIÓN DE ADJUNTOS (REEMPLAZO) */}
                       <div className="flex flex-col gap-2 p-3 bg-gray-50 border border-gray-200 rounded">
                          <label className="font-bold text-xs flex items-center gap-2">
                            <Upload size={14} /> Documentos Adjuntos
                          </label>
                          <p className="text-[10px] text-gray-500">
                            Manuales, planos, fichas técnicas, tarjetas de propiedad, etc.
                          </p>
                          
                          {/* File Input */}
                          <div className="flex items-center gap-2">
                             <input 
                               type="file" 
                               multiple
                               className="hidden"
                               ref={fileInputRef}
                               onChange={handleFileSelect}
                             />
                             <button
                               type="button"
                               onClick={() => fileInputRef.current?.click()}
                               disabled={uploadingFile}
                               className="w-full text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-3 rounded flex items-center justify-center gap-2 disabled:opacity-50"
                             >
                               {uploadingFile ? 'Subiendo...' : 'Adjuntar Archivos'}
                             </button>
                          </div>

                          {/* File List */}
                          {(machineForm.files && machineForm.files.length > 0) && (
                            <div className="space-y-1 mt-1 max-h-32 overflow-y-auto">
                              {machineForm.files.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs bg-white border p-1 rounded">
                                  <a 
                                    href={file.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-center gap-1 text-blue-600 hover:underline truncate max-w-[150px]"
                                    title={file.name}
                                  >
                                    <FileText size={12} /> {file.name}
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => removeFile(idx)}
                                    className="text-red-400 hover:text-red-600 px-1"
                                    title="Quitar"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                       </div>
                       
                       <div className="flex items-center gap-2 mt-4">
                          <label className="w-40 font-bold text-xs">Crear centro de costo:</label>
                          <input 
                             type="checkbox" 
                             checked={machineForm.create_cost_center}
                             onChange={e => setMachineForm(p => ({...p, create_cost_center: e.target.checked}))}
                          />
                       </div>
                       
                       <div className="flex items-center gap-2">
                          <label className="w-40 font-bold text-xs">Maquina activa:</label>
                          <div className="flex gap-4">
                             <label className="flex items-center gap-1">
                               <input 
                                 type="radio" 
                                 name="is_active" 
                                 checked={machineForm.is_active === true} 
                                 onChange={() => setMachineForm(p => ({...p, is_active: true}))}
                               />
                               SI
                             </label>
                             <label className="flex items-center gap-1">
                               <input 
                                 type="radio" 
                                 name="is_active" 
                                 checked={machineForm.is_active === false} 
                                 onChange={() => setMachineForm(p => ({...p, is_active: false}))}
                               />
                               NO
                             </label>
                          </div>
                       </div>
                    </div>
                 </div>
                 
                 {/* Información del motor */}
                 <div className="mt-8 border border-gray-400">
                    <div className="bg-gray-600 text-white px-2 py-1 font-bold text-sm">
                       Informacion del motor
                    </div>
                    <div className="p-4">
                       <button 
                         type="button"
                         onClick={() => setShowEngineForm(true)}
                         className="border border-gray-400 px-2 py-1 text-xs mb-4 bg-gray-100 hover:bg-gray-200"
                       >
                         Agregar Motor
                       </button>

                       {/* Formulario de Motor (Inline) */}
                       {showEngineForm && (
                         <div className="mb-4 p-3 bg-gray-100 border rounded grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            <input placeholder="Marca" className="border p-1" value={engineForm.brand} onChange={e => setEngineForm(p => ({...p, brand: e.target.value}))} />
                            <input placeholder="Serie" className="border p-1" value={engineForm.serial_number} onChange={e => setEngineForm(p => ({...p, serial_number: e.target.value}))} />
                            <input placeholder="Tipo" className="border p-1" value={engineForm.type} onChange={e => setEngineForm(p => ({...p, type: e.target.value}))} />
                            <input placeholder="Potencia" className="border p-1" value={engineForm.power} onChange={e => setEngineForm(p => ({...p, power: e.target.value}))} />
                            <input placeholder="Ubicacion" className="border p-1" value={engineForm.location} onChange={e => setEngineForm(p => ({...p, location: e.target.value}))} />
                            <input placeholder="Descripcion" className="border p-1 col-span-2" value={engineForm.description} onChange={e => setEngineForm(p => ({...p, description: e.target.value}))} />
                            <div className="col-span-1 flex gap-2">
                               <button onClick={addEngine} className="bg-green-500 text-white px-2 py-1 rounded">OK</button>
                               <button onClick={() => setShowEngineForm(false)} className="bg-red-500 text-white px-2 py-1 rounded">X</button>
                            </div>
                         </div>
                       )}

                       {/* Tabla de Motores */}
                       <table className="w-full text-xs text-left">
                          <thead className="border-b font-bold">
                             <tr>
                                <th className="py-1">Marca</th>
                                <th className="py-1">Serie</th>
                                <th className="py-1">Tipo</th>
                                <th className="py-1">Potencia</th>
                                <th className="py-1">Ubicacion</th>
                                <th className="py-1">Descripcion</th>
                                <th className="py-1">Acciones</th>
                             </tr>
                          </thead>
                          <tbody>
                             {(!machineForm.engines || machineForm.engines.length === 0) && (
                                <tr><td colSpan={7} className="py-4 text-center text-gray-400">Sin información de motor</td></tr>
                             )}
                             {machineForm.engines?.map((eng, idx) => (
                                <tr key={idx} className="border-b last:border-0">
                                   <td className="py-1">{eng.brand}</td>
                                   <td className="py-1">{eng.serial_number}</td>
                                   <td className="py-1">{eng.type}</td>
                                   <td className="py-1">{eng.power}</td>
                                   <td className="py-1">{eng.location}</td>
                                   <td className="py-1">{eng.description}</td>
                                   <td className="py-1">
                                      <button onClick={() => removeEngine(idx)} className="text-red-500 hover:text-red-700">Eliminar</button>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>

                 {/* Botonera */}
                 <div className="flex items-center justify-center gap-2 mt-6 text-xs">
                    <button 
                      type="button" 
                      onClick={() => setMachineForm(defaultMachineForm)}
                      className="border border-gray-400 px-3 py-1 bg-gray-100 hover:bg-gray-200"
                    >
                      Nuevo
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIsEditingMachine(false)}
                      className="border border-gray-400 px-3 py-1 bg-gray-100 hover:bg-gray-200"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="button" 
                      onClick={handleSaveMachine}
                      disabled={machinesLoading || uploadingFile}
                      className="border border-gray-400 px-3 py-1 bg-gray-100 hover:bg-gray-200 font-bold"
                    >
                      {machinesLoading ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button type="button" className="border border-gray-400 px-3 py-1 bg-gray-100 hover:bg-gray-200">Buscar</button>
                    <button type="button" className="border border-gray-400 px-3 py-1 bg-gray-100 hover:bg-gray-200">Visualizar QR</button>
                 </div>
                 
                 <div className="flex justify-end gap-1 mt-4 text-xs text-gray-500">
                    <button className="border px-2">{'<<'}</button>
                    <button className="border px-2">{'<'}</button>
                    <button className="border px-2">{'>'}</button>
                    <button className="border px-2">{'>>'}</button>
                 </div>
               </div>
             ) : (
               /* LISTADO DE MAQUINAS */
               <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                 {machinesLoading && <p className="text-white/50 text-center col-span-full">Cargando máquinas...</p>}
                 {!machinesLoading && machines.length === 0 && (
                   <p className="text-white/50 text-center col-span-full py-10">No hay máquinas creadas.</p>
                 )}
                 {machines.map(m => (
                    <div key={m.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                       <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg text-white">{m.name}</h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${m.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                             {m.is_active ? 'ACTIVA' : 'INACTIVA'}
                          </span>
                       </div>
                       <div className="text-sm text-white/60 space-y-1 mb-4">
                          <p>Tipo: {m.machine_type_name ?? 'N/A'}</p>
                          <p>Marca: {m.brand}</p>
                          <p>Modelo: {m.model}</p>
                          <p>Serie: {m.serial_number}</p>
                          {m.files && m.files.length > 0 && (
                            <p className="flex items-center gap-1 text-white/40 mt-2">
                              <Upload size={12} /> {m.files.length} Documentos
                            </p>
                          )}
                       </div>
                       <div className="flex gap-2 justify-end pt-2 border-t border-white/5">
                          <button 
                             onClick={() => openEditMachine(m)}
                             className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white"
                          >
                             <Pencil size={12} /> Editar
                          </button>
                          <button 
                             onClick={() => handleDeleteMachine(m.id)}
                             className="flex items-center gap-1 text-xs bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded text-red-300"
                          >
                             <Trash2 size={12} /> Eliminar
                          </button>
                       </div>
                    </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {/* ... (TAB: Machine Types - se mantiene igual) ... */}
        {activeTab === 'machine-types' && sessionRoleId === 2 && modulesState.grabaciones && (
           <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl animate-in fade-in zoom-in duration-300">
             {/* ... contenido machine types ... */}
            <h2 className="text-xl font-semibold mb-4 text-white">Grabaciones · Tipos de máquina</h2>
            {mtError && (
              <p className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-red-300 text-sm">
                {mtError}
              </p>
            )}

            <form onSubmit={mtEditId ? submitEditMt : submitMachineType} className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs text-white/60">ID de máquina (asignado por el usuario)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={mtEditId ? mtEditMachineId : mtMachineId}
                  onChange={(e) =>
                    mtEditId ? setMtEditMachineId(e.target.value) : setMtMachineId(e.target.value)
                  }
                  placeholder="Ej. 1002"
                  className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white text-sm focus:outline-none focus:border-[#F7931E]"
                  required
                />
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs text-white/60">Tipo de máquina</label>
                <input
                  value={mtEditId ? mtEditName : mtName}
                  onChange={(e) => (mtEditId ? setMtEditName(e.target.value) : setMtName(e.target.value))}
                  placeholder="Ej. Excavadora"
                  className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white text-sm focus:outline-none focus:border-[#F7931E]"
                  required
                />
              </div>
              <div className="flex gap-2 md:col-span-2">
                {mtEditId && (
                  <button
                    type="button"
                    onClick={() => {
                      setMtEditId(null);
                      setMtEditName('');
                      setMtEditMachineId('');
                    }}
                    className="flex-1 rounded-lg border border-white/15 bg-white/5 py-2 text-sm text-white hover:bg-white/10"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  disabled={mtLoading}
                  className="flex-1 rounded-lg bg-[#F7931E] py-2 text-sm font-semibold text-[#1f1203] hover:bg-[#e7830e] disabled:opacity-70"
                >
                  {mtLoading ? 'Guardando...' : mtEditId ? 'Actualizar' : 'Grabar'}
                </button>
              </div>
            </form>

            <div className="mt-6 border-t border-white/10 pt-4">
              {mtLoading && machineTypes.length === 0 && (
                <p className="text-sm text-white/60">Cargando tipos de máquina...</p>
              )}
              {!mtLoading && machineTypes.length === 0 && (
                <p className="text-sm text-white/40">No hay tipos de máquina creados.</p>
              )}
              {!mtLoading && machineTypes.length > 0 && (
                <div className="space-y-3">
                  {machineTypes.map((mt) => (
                    <div
                      key={mt.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                    >
                      <div className="text-sm text-white">
                        <p className="font-semibold">{mt.name}</p>
                        <p className="text-[11px] text-white/50">Machine ID: {mt.machine_id}</p>
                        <p className="text-[11px] text-white/30">BD ID: {mt.id}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditMt(mt)}
                          className="p-2 rounded-md bg-white/5 hover:bg-white/10 text-white"
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => deleteMt(mt.id)}
                          className="p-2 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-300"
                          title="Eliminar"
                          disabled={mtLoading}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

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
    </div>
  );
}
