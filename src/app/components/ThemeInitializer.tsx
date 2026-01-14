'use client'

import { useEffect } from 'react';

export function ThemeInitializer() {
  useEffect(() => {
    // Aplicar tema do localStorage
    const theme = localStorage.getItem('ritmo_theme') || 'light';
    const fontSize = localStorage.getItem('ritmo_font_size') || 'normal';
    const reduceAnimations = localStorage.getItem('ritmo_reduce_animations') === 'true';
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (fontSize === 'large') {
      document.documentElement.classList.add('text-lg');
    } else {
      document.documentElement.classList.remove('text-lg');
    }

    if (reduceAnimations) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, []);

  return null;
}
