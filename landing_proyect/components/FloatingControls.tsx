'use client';

import type { Language, ThemeMode } from '@/lib/ui-types';

type FloatingControlsProps = {
  theme: ThemeMode;
  onToggleTheme: () => void;
  language: Language;
  onToggleLanguage: () => void;
};

export default function FloatingControls({
  theme,
  onToggleTheme,
  language,
  onToggleLanguage,
}: FloatingControlsProps) {
  const isLight = theme === 'light';
  const themeLabel =
    language === 'es'
      ? isLight
        ? 'Modo oscuro'
        : 'Modo claro'
      : isLight
        ? 'Dark mode'
        : 'Light mode';

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <div className="flex items-center gap-2 rounded-full bg-black/70 px-3 py-2 text-xs text-white shadow-lg backdrop-blur">
        <button
          type="button"
          onClick={onToggleTheme}
          className="rounded-full border border-white/30 px-3 py-1 font-medium hover:border-white hover:text-white"
        >
          {themeLabel}
        </button>
        <button
          type="button"
          onClick={onToggleLanguage}
          className="rounded-full border border-white/30 px-2 py-1 font-semibold hover:border-white hover:text-white"
        >
          {language === 'es' ? 'EN' : 'ES'}
        </button>
      </div>
    </div>
  );
}


