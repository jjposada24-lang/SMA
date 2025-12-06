'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { Language } from '@/lib/ui-types';

const getPlans = (language: Language) =>
  language === 'es'
    ? [
        {
          name: 'Starter',
          badge: 'PYMEs',
          price: 'USD 590',
          description: 'Ideal para talleres propios y operaciones con menos de 50 activos.',
          benefits: ['Tableros en tiempo real', 'Soporte en horario laboral', 'Capacitación inicial'],
        },
        {
          name: 'Growth',
          badge: 'Más popular',
          price: 'USD 990',
          highlighted: true,
          description: 'Para compañías con múltiples frentes, seguimiento de costos y SLA exigentes.',
          benefits: [
            'Automatización de órdenes',
            'Integración con ERP/IoT',
            'Soporte 24/7 + Customer Success',
          ],
        },
        {
          name: 'Enterprise',
          badge: 'Corporativo',
          price: 'A medida',
          description: 'Incluye módulos adicionales, data lake y soporte dedicado en sitio.',
          benefits: ['Consultoría especializada', 'Reportes personalizados', 'SLA a medida'],
        },
      ]
    : [
        {
          name: 'Starter',
          badge: 'SMBs',
          price: 'USD 590',
          description: 'Ideal for in‑house workshops and operations with fewer than 50 assets.',
          benefits: ['Real‑time dashboards', 'Business hours support', 'Initial training'],
        },
        {
          name: 'Growth',
          badge: 'Most popular',
          price: 'USD 990',
          highlighted: true,
          description: 'For companies with multiple sites, cost tracking and demanding SLAs.',
          benefits: ['Automated work orders', 'ERP/IoT integrations', '24/7 support + Customer Success'],
        },
        {
          name: 'Enterprise',
          badge: 'Corporate',
          price: 'Custom',
          description: 'Includes extra modules, data lake and dedicated on‑site support.',
          benefits: ['Specialized consulting', 'Custom reports', 'Tailored SLAs'],
        },
      ];

type PricingProps = {
  language: Language;
};

export default function Pricing({ language }: PricingProps) {
  return (
    <section id="precios" className="section-padding bg-white">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs uppercase tracking-[0.5em] text-[#8f8f95]">
          {language === 'es' ? 'Planes' : 'Plans'}
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-[#1c1c1c]">
          {language === 'es' ? 'Implementa SMA según tu escala' : 'Implement SMA according to your scale'}
        </h2>
        <p className="mt-3 text-[#555555]">
          {language === 'es'
            ? 'Modelos flexibles con onboarding guiado y soporte continuo.'
            : 'Flexible models with guided onboarding and ongoing support.'}
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-6xl gap-6 lg:grid-cols-3">
        {getPlans(language).map((plan, idx) => (
          <motion.article
            key={plan.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, delay: idx * 0.08 }}
            className={`flex h-full flex-col rounded-3xl border p-6 shadow-[0_35px_90px_-60px_rgba(34,34,34,0.7)] ${
              plan.highlighted
                ? 'border-[#F7931E] bg-gradient-to-b from-[#1c1c1c] via-[#2b1908] to-[#1c1c1c] text-white'
                : 'border-[#f1f1f1] bg-white'
            }`}
          >
            <div className="flex items-center justify-between text-sm">
              <span className={`rounded-full px-3 py-1 ${plan.highlighted ? 'bg-white/10' : 'bg-[#f5f5f7]'}`}>
                {plan.badge}
              </span>
              <span className="text-[#8f8f95]">{idx === 1 ? 'Recomendado' : 'Escalable'}</span>
            </div>
            <h3 className={`mt-6 text-2xl font-semibold ${plan.highlighted ? 'text-white' : 'text-[#1c1c1c]'}`}>
              {plan.name}
            </h3>
            <p className={`mt-2 text-sm ${plan.highlighted ? 'text-white/80' : 'text-[#555555]'}`}>
              {plan.description}
            </p>
            <p className="mt-6 text-4xl font-bold">{plan.price}</p>
            <p className={`text-sm ${plan.highlighted ? 'text-white/70' : 'text-[#8f8f95]'}`}>
              {language === 'es' ? 'mensual' : 'per month'}
            </p>
            <div className="mt-6 space-y-3 text-sm">
              {plan.benefits.map((benefit) => (
                <p key={benefit} className="flex items-center gap-2">
                  <Check className={`h-4 w-4 ${plan.highlighted ? 'text-[#F7931E]' : 'text-[#F7931E]'}`} />
                  <span className={plan.highlighted ? 'text-white/90' : 'text-[#1c1c1c]'}>
                    {benefit}
                  </span>
                </p>
              ))}
            </div>
            <a
              href="#contacto"
              className={`mt-8 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold ${
                plan.highlighted
                  ? 'bg-white text-[#1c1c1c]'
                  : 'border border-[#1c1c1c] text-[#1c1c1c] hover:border-[#F7931E] hover:text-[#F7931E]'
              }`}
            >
              {language === 'es' ? 'Solicitar cotización' : 'Request quote'}
            </a>
          </motion.article>
        ))}
      </div>
    </section>
  );
}


