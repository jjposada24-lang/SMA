'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const navItems = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Características', href: '#caracteristicas' },
  { label: 'Clientes', href: '#clientes' },
  { label: 'Precios', href: '#precios' },
  { label: 'Contacto', href: '#contacto' },
];

type HeaderProps = {
  onLoginOpen: () => void;
};

export default function Header({ onLoginOpen }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <motion.header
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed inset-x-0 top-0 z-40 px-3 py-3 sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <div
          className={`relative overflow-hidden rounded-[32px] border border-white/10 bg-[#020202] backdrop-blur-lg transition-all duration-500 ${
            scrolled ? 'shadow-[0_12px_45px_rgba(0,0,0,0.55)]' : 'shadow-[0_25px_70px_rgba(0,0,0,0.45)]'
          }`}
        >
          <div className="pointer-events-none absolute inset-0 opacity-60">
            <div className="star-field star-field--dense" />
            <div className="star-field star-field--sparse" />
          </div>

          <nav className="relative z-10 flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <Link href="#inicio" className="flex items-center gap-3">
              <Image src="/logo-sma-color-transparente.png" alt="Logo SMA Ingeniería" width={194} height={48} priority />
            </Link>

            <div className="hidden items-center gap-6 md:flex">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-white/80 transition hover:text-white"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="#nosotros"
                className="rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                Quién somos
              </a>
              <button
                onClick={() => (window.location.href = '#contacto')}
                className="rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                Solicitar Demo
              </button>
              <button
                onClick={onLoginOpen}
                className="rounded-full bg-[#F7931E] px-5 py-2 text-sm font-semibold text-[#1f1203] shadow-[0_8px_25px_rgba(247,147,30,0.45)] transition hover:bg-[#e7830e]"
              >
                Iniciar Sesión
              </button>
            </div>

            <button
              className="rounded-full border border-white/30 p-2 text-white transition hover:border-white md:hidden"
              onClick={() => setOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="h-6 w-6" />
            </button>
          </nav>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 240, damping: 22 }}
              className="absolute inset-y-0 right-0 w-80 bg-white p-6"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.4em] text-[#8f8f95]">Menú</p>
                <button onClick={() => setOpen(false)} aria-label="Cerrar menú">
                  <X className="h-6 w-6 text-[#111]" />
                </button>
              </div>
              <div className="mt-8 flex flex-col gap-4">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="text-lg font-semibold text-[#111]"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
                <a
                  href="#nosotros"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-[#e5e5e5] px-4 py-3 text-center text-[#111]"
                >
                  Quién somos
                </a>
                <button
                  onClick={() => {
                    setOpen(false);
                    window.location.href = '#contacto';
                  }}
                  className="rounded-full border border-[#111] px-4 py-3 text-[#111]"
                >
                  Solicitar Demo
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    onLoginOpen();
                  }}
                  className="rounded-full bg-[#F7931E] px-4 py-3 text-[#1f1203]"
                >
                  Iniciar Sesión
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

