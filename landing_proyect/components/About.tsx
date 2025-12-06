'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import type { Language } from '@/lib/ui-types';

const getHighlights = (language: Language) =>
  language === 'es'
    ? [
        'Control total de máquinas, órdenes y costos desde cualquier lugar.',
        'Acompañamiento experto en implementación, capacitación y mejores prácticas.',
        'Plataforma flexible que se ajusta a procesos y perfiles de cada operación.',
      ]
    : [
        'Full control of machines, work orders and costs from anywhere.',
        'Expert support for implementation, training and best practices.',
        'Flexible platform that adapts to each operation’s processes and roles.',
      ];

const getCards = (language: Language) =>
  language === 'es'
    ? [
        {
          label: 'Visión',
          title: 'Ser la referencia regional',
          description:
            'Ser la organización líder y más confiable de LATAM en soluciones inteligentes para administrar maquinaria y flotas, reconocida por sus estándares de calidad y servicio centrado en el cliente.',
        },
        {
          label: 'Misión',
          title: 'Software flexible + ingeniería',
          description:
            'El equipo SMA evoluciona un software de alta calidad que conecta tecnología avanzada con la realidad operativa para anticipar necesidades, maximizar disponibilidad y rentabilidad.',
        },
        {
          label: 'Qué hacemos',
          title: 'Gestión integral de activos',
          description:
            'El conocimiento acumulado en departamentos de maquinaria se convirtió en una plataforma accesible que integra inventarios, mantenimientos, costos, reportes y soporte especializado para cada equipo en campo.',
        },
      ]
    : [
        {
          label: 'Vision',
          title: 'Become the regional reference',
          description:
            'To be the leading and most trusted organization in LATAM for intelligent solutions to manage machinery and fleets, recognized for quality standards and customer‑centric service.',
        },
        {
          label: 'Mission',
          title: 'Flexible software + engineering',
          description:
            'The SMA team evolves high‑quality software that connects advanced technology with operational reality to anticipate needs and maximize availability and profitability.',
        },
        {
          label: 'What we do',
          title: 'End‑to‑end asset management',
          description:
            'Our experience in machinery departments became an accessible platform that integrates inventories, maintenance, costs, reporting and specialized support for every asset in the field.',
        },
      ];

type AboutProps = {
  language: Language;
};

export default function About({ language }: AboutProps) {
  return (
    <section id="nosotros" className="section-padding bg-[#fdfdfd]">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr,0.9fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-[#8f8f95]">
            {language === 'es' ? 'Quiénes somos' : 'About us'}
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-[#1c1c1c]">
            {language === 'es' ? 'SMA Ingeniería y Gestión Online' : 'SMA Engineering and Online Management'}
          </h2>
          <p className="mt-4 text-[#555555]">
            {language === 'es'
              ? 'SMA Ingeniería y Gestión Online nació cuando el equipo, referente en administración de maquinaria pesada, identificó la necesidad de optimizar recursos, reducir fallas y tomar decisiones basadas en datos reales. Desde entonces consolidamos una plataforma web que combina ingeniería mecánica, gestión de activos y desarrollo de software especializado.'
              : 'SMA Engineering and Online Management was created by a team with deep expertise in heavy equipment administration, who saw the need to optimize resources, reduce failures and make decisions based on real data. We built a web platform that combines mechanical engineering, asset management and specialized software development.'}
          </p>
          <p className="mt-4 text-[#555555]">
            {language === 'es'
              ? 'Hoy acompañamos a organizaciones mineras y de construcción en Colombia y LATAM, ajustando cada módulo a sus procesos para garantizar control operativo, menores costos y equipos disponibles 24/7.'
              : 'Today we support mining and construction organizations across Colombia and LATAM, adapting each module to their processes to ensure operational control, lower costs and equipment available 24/7.'}
          </p>
          <ul className="mt-6 space-y-3 text-sm text-[#1c1c1c]">
            {getHighlights(language).map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#F7931E]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-5">
          {getCards(language).map((card, idx) => (
            <motion.article
              key={card.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="rounded-3xl border border-[#ececec] bg-white/95 p-6 shadow-[0_30px_70px_-60px_rgba(16,16,16,0.8)]"
            >
              <p className="text-xs uppercase tracking-[0.45em] text-[#8f8f95]">{card.label}</p>
              <h3 className="mt-3 text-xl font-semibold text-[#1c1c1c]">{card.title}</h3>
              <p className="mt-2 text-sm text-[#555555]">{card.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}


