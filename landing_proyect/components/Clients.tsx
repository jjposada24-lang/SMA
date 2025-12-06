'use client';

import { motion } from 'framer-motion';
import type { Language } from '@/lib/ui-types';

const getClients = (language: Language) =>
  language === 'es'
    ? [
        {
          name: 'Cantera Norte',
          caption: 'Producción agregados',
          result: '+18% disponibilidad',
        },
        {
          name: 'Operación Andes',
          caption: 'Minería subterránea',
          result: '-12% costos mantenimiento',
        },
        {
          name: 'Acerías Caribe',
          caption: 'Siderurgia e infraestructura',
          result: 'KPIs en tiempo real',
        },
      ]
    : [
        {
          name: 'Cantera Norte',
          caption: 'Aggregates production',
          result: '+18% availability',
        },
        {
          name: 'Operación Andes',
          caption: 'Underground mining',
          result: '-12% maintenance costs',
        },
        {
          name: 'Acerías Caribe',
          caption: 'Steel and infrastructure',
          result: 'Real‑time KPIs',
        },
      ];

type ClientsProps = {
  language: Language;
};

export default function Clients({ language }: ClientsProps) {
  return (
    <section id="clientes" className="section-padding bg-[#f7f7f9]">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.5em] text-[#8f8f95]">
            {language === 'es' ? 'Clientes' : 'Customers'}
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-[#1c1c1c]">
            {language === 'es' ? 'Operaciones que confían en SMA' : 'Operations that trust SMA'}
          </h2>
          <p className="mt-3 text-[#555555]">
            {language === 'es'
              ? 'Implementaciones reales en minería, construcción e industria pesada.'
              : 'Real implementations in mining, construction and heavy industry.'}
          </p>
        </div>

        <div className="mx-auto mt-12 grid gap-6 md:grid-cols-3">
          {getClients(language).map((client, idx) => (
            <motion.article
              key={client.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: idx * 0.05 }}
              className="rounded-3xl border border-white bg-white/90 p-6 shadow-[0_30px_90px_-60px_rgba(16,16,16,0.8)]"
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#F7931E] to-[#2e2e2e] text-white" />
              <h3 className="mt-6 text-xl font-semibold text-[#1c1c1c]">{client.name}</h3>
              <p className="text-sm uppercase tracking-[0.2em] text-[#8f8f95]">{client.caption}</p>
              <p className="mt-4 text-sm text-[#555555]">
                Automatizamos mantenimientos, costeo y reportes diarios conectados con campo.
              </p>
              <p className="mt-6 text-sm font-semibold text-[#F7931E]">{client.result}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}


