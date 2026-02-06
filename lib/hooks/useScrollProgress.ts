/**
 * useScrollProgress Hook
 * 
 * Hook personalizado para gestionar el indicador de progreso de scroll
 * de forma declarativa y reutilizable.
 */

import { useEffect } from 'react';

export const useScrollProgress = (elementId: string = 'scrollProgress') => {
  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollProgress = document.getElementById(elementId);
      if (!scrollProgress) return;

      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = window.pageYOffset / totalHeight;
      scrollProgress.style.transform = `scaleX(${progress})`;
    };

    window.addEventListener('scroll', updateScrollProgress);
    
    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
    };
  }, [elementId]);
};
