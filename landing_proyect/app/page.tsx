'use client';

import { useState } from 'react';
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
import LoginModal from '@/components/LoginModal';

export default function HomePage() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8f9fa]">
      <BackgroundAnimation />
      <Header onLoginOpen={() => setLoginOpen(true)} />
      <main className="relative z-10">
        <Hero onLoginOpen={() => setLoginOpen(true)} />
        <About />
        <Features />
        <Clients />
        <WhyChoose />
        <Pricing />
        <Contact />
      </main>
      <Footer />
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
