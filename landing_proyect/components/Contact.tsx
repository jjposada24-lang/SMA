'use client';

import { motion } from 'framer-motion';
import type { Language } from '@/lib/ui-types';

type ContactProps = {
  language: Language;
};

export default function Contact({ language }: ContactProps) {
  return (
    <section id="contacto" className="section-padding bg-[#111] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr,1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-white/60">
            {language === 'es' ? 'Contacto' : 'Contact'}
          </p>
          <h2 className="mt-3 text-3xl font-semibold">
            {language === 'es' ? 'Conversemos sobre tu operación' : "Let's talk about your operation"}
          </h2>
          <p className="mt-4 text-white/70">
            {language === 'es'
              ? 'Agenda una demo personalizada con nuestro equipo y revisa cómo SMA se adapta a tus procesos actuales y metas de disponibilidad.'
              : 'Schedule a personalized demo with our team and see how SMA adapts to your current processes and availability goals.'}
          </p>
          <div className="mt-8 space-y-4 text-sm">
            <div>
              <p className="text-white/60">{language === 'es' ? 'Correo' : 'Email'}</p>
              <p className="text-lg font-semibold">contacto@smaingenieria.com</p>
            </div>
            <div>
              <p className="text-white/60">{language === 'es' ? 'Teléfono' : 'Phone'}</p>
              <p className="text-lg font-semibold">+57 (1) 483 7520</p>
            </div>
            <div>
              <p className="text-white/60">{language === 'es' ? 'Atención' : 'Support'}</p>
              <p className="text-lg font-semibold">
                {language === 'es' ? '24/7 soporte especializado' : '24/7 specialized support'}
              </p>
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
              {language === 'es' ? 'Nombre' : 'Name'}
              <input
                type="text"
                className="mt-2 w-full rounded-2xl border border-[#e5e5e5] p-3"
                placeholder={language === 'es' ? 'Ingresa tu nombre' : 'Enter your name'}
              />
            </label>
            <label className="text-sm">
              {language === 'es' ? 'Empresa' : 'Company'}
              <input
                type="text"
                className="mt-2 w-full rounded-2xl border border-[#e5e5e5] p-3"
                placeholder={language === 'es' ? 'Nombre de la empresa' : 'Company name'}
              />
            </label>
          </div>
          <label className="mt-4 block text-sm">
            {language === 'es' ? 'Correo corporativo' : 'Business email'}
            <input
              type="email"
              className="mt-2 w-full rounded-2xl border border-[#e5e5e5] p-3"
              placeholder={language === 'es' ? 'correo@empresa.com' : 'email@company.com'}
            />
          </label>
          <label className="mt-4 block text-sm">
            {language === 'es' ? 'Mensaje' : 'Message'}
            <textarea
              className="mt-2 h-32 w-full rounded-2xl border border-[#e5e5e5] p-3"
              placeholder={language === 'es' ? 'Cuéntanos sobre tu operación' : 'Tell us about your operation'}
            />
          </label>
          <button
            type="button"
            className="mt-6 w-full rounded-full bg-[#F7931E] py-3 text-sm font-semibold text-white transition hover:bg-[#e7830e]"
          >
            {language === 'es' ? 'Enviar mensaje' : 'Send message'}
          </button>
        </motion.form>
      </div>
    </section>
  );
}


