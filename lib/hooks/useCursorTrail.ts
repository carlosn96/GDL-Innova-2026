/**
 * useCursorTrail Hook
 * 
 * Hook para crear un efecto de estela del cursor con throttling
 * para optimizar el rendimiento.
 */

import { useEffect } from 'react';
import { THROTTLE_DELAYS } from '@/config';

export const useCursorTrail = (throttleDelay: number = THROTTLE_DELAYS.MOUSE) => {
  useEffect(() => {
    let lastTime = 0;

    const createTrailParticle = (x: number, y: number) => {
      const trail = document.createElement('div');
      trail.className = 'fixed w-2 h-2 bg-cyan-400 rounded-full pointer-events-none z-50';
      trail.style.left = x + 'px';
      trail.style.top = y + 'px';
      trail.style.animation = 'fadeOut 1s ease-out forwards';
      document.body.appendChild(trail);

      setTimeout(() => trail.remove(), 1000);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const currentTime = Date.now();
      if (currentTime - lastTime < throttleDelay) return;
      lastTime = currentTime;

      createTrailParticle(e.clientX, e.clientY);
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [throttleDelay]);
};
