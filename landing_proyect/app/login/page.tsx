'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type Role = 'admin' | 'customer';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await res.json() : null;
      if (!res.ok) {
        setError((data as any)?.error ?? 'Error al iniciar sesión');
        return;
      }
      const role = data?.role as Role | undefined;
      const redirect = data?.redirect as string | undefined;
      const from = searchParams.get('from');
      const target =
        from ||
        (role === 'admin' ? '/admin/dashboard' : role === 'customer' ? '/cliente/home' : '/');
      router.push(redirect ?? target);
    } catch (err) {
      console.error(err);
      setError('No se pudo iniciar sesión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f10] to-[#111827] text-white flex items-center justify-center px-4 relative">
      <Link 
        href="/" 
        className="absolute top-6 left-6 p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/80 hover:text-white group"
        title="Volver al inicio"
      >
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
      </Link>

      <div className="w-full max-w-md rounded-3xl bg-white/5 p-8 shadow-2xl border border-white/10 backdrop-blur">
        <h1 className="text-2xl font-semibold text-white mb-6">Iniciar sesión</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-white/80 mb-2">UserID o correo</label>
            <input
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white focus:outline-none focus:border-[#F7931E]"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="1000 (admin) o correo"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-2">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white focus:outline-none focus:border-[#F7931E] pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="@Pojuan24@"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-red-300">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#F7931E] py-3 text-sm font-semibold text-black shadow-lg transition hover:bg-[#e7830e] disabled:opacity-70"
          >
            {loading ? 'Ingresando...' : 'Entrar'}
          </button>
        </form>
        <p className="mt-4 text-xs text-white/60">
          Usuarios de prueba: UserID 1000 / @Pojuan24@ (admin_root) — UserID 1001 / @Pojuan24@ (admin_customer).
        </p>
      </div>
    </div>
  );
}


