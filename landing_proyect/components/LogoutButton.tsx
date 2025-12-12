'use client';

import { useState } from 'react';

type Props = {
  label?: string;
};

export default function LogoutButton({ label = 'Cerrar sesión' }: Props) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.error('logout error', err);
    } finally {
      window.location.href = '/';
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white border border-white/20 hover:border-white/60 hover:bg-white/15 transition disabled:opacity-70"
    >
      {loading ? 'Saliendo...' : label}
    </button>
  );
}


