'use client';

import { useEffect, useMemo, useState } from 'react';

type Glow = {
  id: number;
  top: string;
  left: string;
  size: number;
  delay: number;
};

export default function BackgroundAnimation() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const glows = useMemo<Glow[]>(
    () =>
      Array.from({ length: 4 }).map((_, idx) => ({
        id: idx,
        top: `${15 + idx * 20}%`,
        left: `${idx % 2 === 0 ? 10 : 60}%`,
        size: 420 + idx * 80,
        delay: idx * 1.5,
      })),
    [],
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {glows.map((glow) => (
        <div
          key={glow.id}
          className="absolute rounded-full blur-[120px] transition-opacity duration-700"
          style={{
            top: glow.top,
            left: glow.left,
            width: glow.size,
            height: glow.size,
            background:
              'radial-gradient(circle at 30% 30%, rgba(247,147,30,0.35), transparent 60%), radial-gradient(circle at 70% 70%, rgba(0,0,0,0.45), transparent 65%)',
            opacity: mounted ? 0.7 : 0,
            animation: `floatGlow 18s ease-in-out ${glow.delay}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

