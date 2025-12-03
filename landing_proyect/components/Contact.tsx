'use client';

import { motion } from 'framer-motion';

export default function Contact() {
  return (
    <section id="contacto" className="section-padding bg-[#111] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr,1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-white/60">Contacto</p>
          <h2 className="mt-3 text-3xl font-semibold">Conversemos sobre tu operación</h2>
          <p className="mt-4 text-white/70">
            Agenda una demo personalizada con nuestro equipo y revisa cómo SMA se adapta a tus procesos actuales y metas
            de disponibilidad.
          </p>
          <div className="mt-8 space-y-4 text-sm">
            <div>
              <p className="text-white/60">Correo</p>
              <p className="text-lg font-semibold">contacto@smaingenieria.com</p>
            </div>
            <div>
              <p className="text-white/60">Teléfono</p>
              <p className="text-lg font-semibold">+57 (1) 483 7520</p>
            </div>
            <div>
              <p className="text-white/60">Atención</p>
              <p className="text-lg font-semibold">24/7 soporte especializado</p>
            </div>
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl bg-white/90 p-6 text-[#1c1c1c] shadow-[0_35px_80px_-60px_rgba(0,0,0,0.9)]"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm">
              Nombre
              <input
                type="text"
                className="mt-2 w-full rounded-2xl border border-[#e5e5e5] p-3"
                placeholder="Ingresa tu nombre"
              />
            </label>
            <label className="text-sm">
              Empresa
              <input
                type="text"
                className="mt-2 w-full rounded-2xl border border-[#e5e5e5] p-3"
                placeholder="Nombre de la empresa"
              />
            </label>
          </div>
          <label className="mt-4 block text-sm">
            Correo corporativo
            <input
              type="email"
              className="mt-2 w-full rounded-2xl border border-[#e5e5e5] p-3"
              placeholder="correo@empresa.com"
            />
          </label>
          <label className="mt-4 block text-sm">
            Mensaje
            <textarea
              className="mt-2 h-32 w-full rounded-2xl border border-[#e5e5e5] p-3"
              placeholder="Cuéntanos sobre tu operación"
            />
          </label>
          <button
            type="button"
            className="mt-6 w-full rounded-full bg-[#F7931E] py-3 text-sm font-semibold text-white transition hover:bg-[#e7830e]"
          >
            Enviar mensaje
          </button>
        </motion.form>
      </div>
    </section>
  );
}


