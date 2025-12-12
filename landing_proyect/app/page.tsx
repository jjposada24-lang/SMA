'use client';

import { useEffect, useState } from 'react';
import BackgroundAnimation from '@/components/BackgroundAnimation';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Features from '@/components/Features';
import Clients from '@/components/Clients';
import WhyChoose from '@/components/WhyChoose';
import Pricing from '@/components/Pricing';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import FloatingControls from '@/components/FloatingControls';
import type { Language, ThemeMode } from '@/lib/ui-types';

export default function HomePage() {
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [language, setLanguage] = useState<Language>('es');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedTheme = window.localStorage.getItem('theme') as ThemeMode | null;
    const storedLanguage = window.localStorage.getItem('language') as Language | null;

    if (storedTheme === 'light' || storedTheme === 'dark') {
      setTheme(storedTheme);
      document.documentElement.dataset.theme = storedTheme;
    }

    if (storedLanguage === 'es' || storedLanguage === 'en') {
      setLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('language', language);
  }, [language]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'es' ? 'en' : 'es'));
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundAnimation />
      <Header language={language} />
      <main className="relative z-10 pt-20 md:pt-28 lg:pt-32">
        <Hero language={language} />
        <About language={language} />
        <Features language={language} />
        <Clients language={language} />
        <WhyChoose language={language} />
        <Pricing language={language} />
        <Contact language={language} />
      </main>
      <Footer language={language} />
      <FloatingControls
        theme={theme}
        onToggleTheme={toggleTheme}
        language={language}
        onToggleLanguage={toggleLanguage}
      />
    </div>
  );
}
