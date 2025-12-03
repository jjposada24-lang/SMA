'use client';

import { motion } from 'framer-motion';

type HeroProps = {
  onLoginOpen: () => void;
};

export default function Hero({ onLoginOpen }: HeroProps) {
  return (
    <section id="inicio" className="section-padding flex min-h-[90vh] flex-col justify-center pt-32">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-16 lg:grid-cols-[1fr,0.9fr]">
        <div className="space-y-8">
          <p className="text-sm uppercase tracking-[0.6em] text-[#8f8f95]">SMA Ingeniería & Software</p>
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl font-semibold leading-tight text-[#1c1c1c] md:text-5xl"
          >
            Gestión online de flotas y maquinaria pesada
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-lg text-[#555555]"
          >
            SMA Ingeniería & Software nació en el terreno y hoy su equipo digitaliza el control de maquinaria, vehículos
            y equipos críticos. Reunimos mantenimiento, costos y operaciones en una plataforma que se adapta a cada
            empresa con más de 10 años de apoyo a proyectos mineros y de construcción LATAM.
          </motion.p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#contacto"
              className="rounded-full bg-[#F7931E] px-8 py-3 font-semibold text-white shadow-[0_25px_80px_-40px_rgba(247,147,30,0.9)] transition hover:bg-[#e7830e]"
            >
              Solicitar Demo
            </a>
            <button
              onClick={onLoginOpen}
              className="rounded-full border border-[#d7d7d8] px-8 py-3 font-semibold text-[#1c1c1c] transition hover:border-[#F7931E] hover:text-[#F7931E]"
            >
              Iniciar Sesión
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm text-[#555555]">
            <div>
              <p className="text-3xl font-semibold text-[#1c1c1c]">+120</p>
              Operaciones auditadas
            </div>
            <div>
              <p className="text-3xl font-semibold text-[#1c1c1c]">99.9%</p>
              Disponibilidad cloud
            </div>
            <div>
              <p className="text-3xl font-semibold text-[#1c1c1c]">24/7</p>
              Soporte especializado
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-[0_30px_90px_-45px_rgba(34,34,34,0.55)] backdrop-blur-xl"
        >
          <div className="absolute inset-x-8 top-6 flex justify-between text-xs uppercase tracking-[0.4em] text-[#8f8f95]">
            <span>Dashboard SMA</span>
            <span>2025</span>
          </div>
          <div className="mt-10 rounded-2xl bg-gradient-to-br from-[#F7931E] via-[#c6700d] to-[#1c1c1c] p-10 text-white shadow-inner">
            <p className="text-xs uppercase tracking-[0.4em] text-white/80">Visión general</p>
            <p className="mt-3 text-3xl font-semibold">Disponibilidad flota</p>
            <p className="text-5xl font-bold">94.3%</p>
            <div className="mt-8 space-y-4 text-sm">
              <div className="flex justify-between">
                <span>Órdenes cerradas</span>
                <strong>124</strong>
              </div>
              <div className="flex justify-between">
                <span>Horas críticas evitadas</span>
                <strong>+312 h</strong>
              </div>
              <div className="flex justify-between">
                <span>Alertas activas</span>
                <strong>9</strong>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-[#111] p-6 text-sm text-white">
            <div className="flex items-center justify-between">
              <span>Disponibilidad diaria</span>
              <span className="font-semibold">96.1%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Consumo combustible</span>
              <span className="font-semibold">-12% vs meta</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Alertas HSE</span>
              <span className="font-semibold text-[#F7931E]">0</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

