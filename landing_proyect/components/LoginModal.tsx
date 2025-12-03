'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
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
                <p className="text-xs uppercase tracking-[0.45em] text-[#8f8f95]">Acceso</p>
                <h3 className="text-2xl font-semibold text-[#1c1c1c]">Portal de clientes</h3>
              </div>
              <button onClick={onClose} aria-label="Cerrar modal">
                <X className="h-6 w-6 text-[#111]" />
              </button>
            </div>

            <form className="mt-8 space-y-5">
              <label className="text-sm text-[#555555]">
                Correo
                <input
                  type="email"
                  className="mt-2 w-full rounded-2xl border border-[#e5e5e5] p-3"
                  placeholder="usuario@empresa.com"
                />
              </label>
              <label className="text-sm text-[#555555]">
                Contraseña
                <input type="password" className="mt-2 w-full rounded-2xl border border-[#e5e5e5] p-3" />
              </label>
              <button
                type="button"
                className="w-full rounded-full bg-[#F7931E] py-3 text-sm font-semibold text-white transition hover:bg-[#e7830e]"
              >
                Ingresar
              </button>
              <p className="text-center text-xs text-[#8f8f95]">¿Olvidaste tu contraseña? Escríbenos a soporte.</p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

