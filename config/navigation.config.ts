/**
 * Navigation Configuration - Configuración de navegación
 * 
 * Centraliza todas las rutas, enlaces de navegación y anclas
 * utilizadas en el sitio.
 */

import { LinkConfig } from '@/types';

export const navigationLinks: LinkConfig[] = [
  {
    href: '#hero',
    label: 'Inicio',
    icon: 'fas fa-home'
  },
  {
    href: '#about',
    label: 'Acerca de',
    icon: 'fas fa-info-circle'
  },
  {
    href: '#schedule',
    label: 'Cronograma',
    icon: 'fas fa-calendar-alt'
  },
  {
    href: '#tracks',
    label: 'Reto 2026',
    icon: 'fas fa-route'
  }
];

export const sections = {
  hero: 'hero',
  about: 'about',
  schedule: 'schedule',
  tracks: 'tracks',
  tech: 'tech',
  evaluation: 'evaluation'
} as const;

export type Section = typeof sections[keyof typeof sections];
