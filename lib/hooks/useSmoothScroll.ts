/**
 * useSmoothScroll Hook
 * 
 * Hook para manejar smooth scrolling a anclas de la página.
 */

import { useEffect } from 'react';

export const useSmoothScroll = (selector: string = 'a[href^="#"]') => {
  useEffect(() => {
    const handleClick = (e: Event) => {
      e.preventDefault();
      const link = e.currentTarget as HTMLAnchorElement;
      const targetId = link.getAttribute('href');
      
      if (!targetId || targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    };

    const navLinks = document.querySelectorAll(selector);
    navLinks.forEach(link => {
      link.addEventListener('click', handleClick);
    });

    return () => {
      navLinks.forEach(link => {
        link.removeEventListener('click', handleClick);
      });
    };
  }, [selector]);
};
