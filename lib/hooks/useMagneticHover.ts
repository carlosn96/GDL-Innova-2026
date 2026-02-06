/**
 * useMagneticHover Hook
 * 
 * Hook para crear efectos magnéticos en hover sobre elementos.
 * Aplica transformaciones basadas en la posición del cursor.
 */

import { useEffect } from 'react';

interface MagneticHoverOptions {
  selector?: string;
  strength?: number;
  scale?: number;
}

interface HTMLElementWithHandlers extends HTMLElement {
  _moveHandler?: (e: MouseEvent) => void;
  _leaveHandler?: () => void;
}

export const useMagneticHover = (options: MagneticHoverOptions = {}) => {
  const {
    selector = '.magnetic-hover',
    strength = 0.1,
    scale = 1.02
  } = options;

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElementWithHandlers>(selector);

    const handleMouseMove = (element: HTMLElement, e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      element.style.transform = `translate(${x * strength}px, ${y * strength}px) scale(${scale})`;
    };

    const handleMouseLeave = (element: HTMLElement) => {
      element.style.transform = 'translate(0px, 0px) scale(1)';
    };

    elements.forEach(element => {
      const moveHandler = (e: MouseEvent) => handleMouseMove(element, e);
      const leaveHandler = () => handleMouseLeave(element);

      element.addEventListener('mousemove', moveHandler);
      element.addEventListener('mouseleave', leaveHandler);

      // Store handlers for cleanup
      element._moveHandler = moveHandler;
      element._leaveHandler = leaveHandler;
      element.dataset.moveHandler = 'attached';
    });

    return () => {
      elements.forEach(element => {
        if (element.dataset.moveHandler && element._moveHandler && element._leaveHandler) {
          element.removeEventListener('mousemove', element._moveHandler);
          element.removeEventListener('mouseleave', element._leaveHandler);
          delete element.dataset.moveHandler;
          delete element._moveHandler;
          delete element._leaveHandler;
        }
      });
    };
  }, [selector, strength, scale]);
};
