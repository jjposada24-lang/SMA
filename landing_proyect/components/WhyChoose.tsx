'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const bullets = [
  'Implementaciones ágiles con especialistas en maquinaria y HSE.',
  'Integración nativa con ERP, IoT y tableros BI líderes.',
  'Cumplimiento normativo ISO 55000, HSE y auditorías regulatorias.',
  'Soporte premium 24/7 en español con presencia en campo.',
];

export default function WhyChoose() {
  return (
    <section id="porque-sma" className="section-padding bg-[#f4f5f7]">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-[#8f8f95]">Por qué SMA</p>
          <h2 className="mt-3 text-3xl font-semibold text-[#1c1c1c]">Expertos en operaciones críticas</h2>
          <p className="mt-4 text-[#555555]">
            Diseñamos la plataforma junto a jefes de mantenimiento y operación de las canteras más exigentes de Colombia.
            Eso significa procesos reales, alertas accionables y KPIs que impactan el EBITDA.
          </p>
        </div>
        <div className="space-y-5">
          {bullets.map((item, idx) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="flex items-start gap-4 rounded-2xl bg-white/90 p-5 shadow-[0_20px_60px_-40px_rgba(34,34,34,0.9)]"
            >
              <CheckCircle2 className="mt-1 h-6 w-6 text-[#F7931E]" />
              <p className="text-sm text-[#1c1c1c]">{item}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


