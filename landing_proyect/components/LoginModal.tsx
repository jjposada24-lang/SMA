'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { Language } from '@/lib/ui-types';

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
};

export default function LoginModal({ isOpen, onClose, language }: LoginModalProps) {
  const texts =
    language === 'es'
      ? {
          access: 'Acceso',
          title: 'Portal de clientes',
          email: 'Correo',
          password: 'Contraseña',
          placeholderEmail: 'usuario@empresa.com',
          login: 'Ingresar',
          forgot: '¿Olvidaste tu contraseña? Escríbenos a soporte.',
        }
      : {
          access: 'Access',
          title: 'Customer portal',
          email: 'Email',
          password: 'Password',
          placeholderEmail: 'user@company.com',
          login: 'Sign in',
          forgot: 'Forgot your password? Contact our support team.',
        };
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.45em] text-[#8f8f95]">{texts.access}</p>
                <h3 className="text-2xl font-semibold text-[#1c1c1c]">{texts.title}</h3>
              </div>
              <button onClick={onClose} aria-label="Cerrar modal">
                <X className="h-6 w-6 text-[#111]" />
              </button>
            </div>

            <form className="mt-8 space-y-5">
              <label className="text-sm text-[#555555]">
                {texts.email}
                <input
                  type="email"
                  className="mt-2 w-full rounded-2xl border border-[#e5e5e5] p-3"
                  placeholder={texts.placeholderEmail}
                />
              </label>
              <label className="text-sm text-[#555555]">
                {texts.password}
                <input type="password" className="mt-2 w-full rounded-2xl border border-[#e5e5e5] p-3" />
              </label>
              <button
                type="button"
                className="w-full rounded-full bg-[#F7931E] py-3 text-sm font-semibold text-white transition hover:bg-[#e7830e]"
              >
                {texts.login}
              </button>
              <p className="text-center text-xs text-[#8f8f95]">{texts.forgot}</p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

