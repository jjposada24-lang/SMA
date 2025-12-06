'use client';

import { motion } from 'framer-motion';
import { ClipboardCheck, Gauge, LineChart, Workflow } from 'lucide-react';
import type { Language } from '@/lib/ui-types';

const getFeatures = (language: Language) =>
  language === 'es'
    ? [
        {
          title: 'Inventario vivo de activos',
          description:
            'Registra máquinas, horas, responsables y checklists para saber qué equipo está disponible y qué requiere intervención.',
          icon: Gauge,
        },
        {
          title: 'Planificación y alertas inteligentes',
          description:
            'Programa mantenimientos preventivos y correctivos, planes de lubricación y órdenes digitales con recordatorios automáticos.',
          icon: ClipboardCheck,
        },
        {
          title: 'Costos y suministros bajo control',
          description:
            'Lleva el detalle de gastos, combustible, repuestos y contratos para anticipar compras y sostener la rentabilidad.',
          icon: Workflow,
        },
        {
          title: 'Reportes operativos diarios',
          description:
            'Genera informes para gerencia, contratantes y auditorías con pendientes, consumos y productividad por operador.',
          icon: LineChart,
        },
      ]
    : [
        {
          title: 'Live asset inventory',
          description:
            'Track machines, hours, owners and checklists to know what is available and what needs intervention.',
          icon: Gauge,
        },
        {
          title: 'Smart planning & alerts',
          description:
            'Schedule preventive and corrective maintenance, lubrication plans and digital work orders with reminders.',
          icon: ClipboardCheck,
        },
        {
          title: 'Costs and supplies under control',
          description:
            'Detail of expenses, fuel, parts and contracts to anticipate purchases and protect profitability.',
          icon: Workflow,
        },
        {
          title: 'Daily operational reports',
          description:
            'Generate reports for management, clients and audits with open items, consumption and productivity per operator.',
          icon: LineChart,
        },
      ];

type FeaturesProps = {
  language: Language;
};

export default function Features({ language }: FeaturesProps) {
  return (
    <section id="caracteristicas" className="section-padding bg-white">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-xs uppercase tracking-[0.5em] text-[#8f8f95]">
          {language === 'es' ? 'Capacidades' : 'Capabilities'}
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-[#1c1c1c]">
          {language === 'es' ? 'Todo lo que necesita tu operación' : 'Everything your operation needs'}
        </h2>
        <p className="mt-3 text-[#555555]">
          {language === 'es'
            ? 'Información accionable, workflows inteligentes y trazabilidad de extremo a extremo.'
            : 'Actionable information, smart workflows and end‑to‑end traceability.'}
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-2">
        {getFeatures(language).map((feature, idx) => (
          <motion.article
            key={feature.title}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="group rounded-3xl border border-white bg-[#fdfdfd] p-8 shadow-[0_35px_80px_-60px_rgba(34,34,34,0.7)] transition hover:-translate-y-1 hover:border-[#F7931E]/40"
          >
            <feature.icon className="h-10 w-10 text-[#F7931E]" />
            <h3 className="mt-6 text-xl font-semibold text-[#1c1c1c]">{feature.title}</h3>
            <p className="mt-2 text-sm text-[#555555]">{feature.description}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}


