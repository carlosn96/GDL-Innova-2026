/**
 * Animation Utilities
 * 
 * Funciones utilitarias para gestionar animaciones y efectos visuales.
 */

import { PARTICLE_COUNT, NEURON_COUNT, ANIMATION_DELAYS } from '@/config';

/**
 * Genera partículas flotantes en un contenedor
 */
export const generateParticles = (containerId: string, count: number = PARTICLE_COUNT): void => {
  const container = document.getElementById(containerId);
  if (!container) return;

    // build palette from CSS theme variables (not hardcoded)
    const rootStyles = getComputedStyle(document.documentElement);
    const getVar = (name: string, fallback: string) => (rootStyles.getPropertyValue(name) || fallback).trim();

    // 1) Prefer an explicit particles palette defined in theme: --particles-palette="#a,#b,#c"
    const explicit = getVar('--particles-palette', '');
    let BLUE_PALETTE: string[] = [];
    if (explicit) {
      BLUE_PALETTE = explicit.split(',').map(s => s.trim()).filter(Boolean);
    } else {
      // 2) Fallback: try to extract colors from existing gradient vars (e.g. --gradient-primary, --gradient-hero)
      const gradients = [getVar('--gradient-primary', ''), getVar('--gradient-hero', '')];
      const colorRegex = /#(?:[0-9a-fA-F]{3}){1,2}|rgba?\([^)]*\)|hsl\([^)]*\)/g;
      for (const g of gradients) {
        if (!g) continue;
        const matches = g.match(colorRegex);
        if (matches) BLUE_PALETTE.push(...matches.map(m => m.trim()));
      }

      // dedupe
      BLUE_PALETTE = Array.from(new Set(BLUE_PALETTE));

      // 3) Still empty: probe theme color variables that commonly exist in tokens.css
      if (BLUE_PALETTE.length === 0) {
        const probe = ['--color-cyan-400', '--color-purple-400', '--color-pink-400'];
        for (const v of probe) {
          const val = getVar(v, '');
          if (val) BLUE_PALETTE.push(val);
        }
      }

      // 4) Final fallback to theme variables
      if (BLUE_PALETTE.length === 0) BLUE_PALETTE = ['var(--color-cyan-400)', 'var(--color-purple-400)', 'var(--color-pink-400)'];
    }
    const SIZE_OPTIONS = [2, 3, 4, 6, 10];
  
    for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
      // assign base class and descriptive shape/size classes
      particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * ANIMATION_DELAYS.PARTICLE.MAX + 's';
    particle.style.animationDuration = 
      (ANIMATION_DELAYS.PARTICLE_DURATION.MIN + Math.random() * 
        (ANIMATION_DELAYS.PARTICLE_DURATION.MAX - ANIMATION_DELAYS.PARTICLE_DURATION.MIN)) + 's';
    
      // randomize visual properties: size, color, opacity and shape
      const size = SIZE_OPTIONS[Math.floor(Math.random() * SIZE_OPTIONS.length)];
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
    
      const color = BLUE_PALETTE[Math.floor(Math.random() * BLUE_PALETTE.length)];
      particle.style.background = color;
      particle.style.opacity = `${0.35 + Math.random() * 0.7}`;
      particle.style.boxShadow = `0 0 ${Math.max(6, size * 2)}px ${color}`;
    
      const shapeRand = Math.random();
      if (shapeRand < 0.75) {
        particle.classList.add('shape-circle');
        particle.style.borderRadius = '50%';
      } else if (shapeRand < 0.95) {
        particle.classList.add('shape-square');
        particle.style.borderRadius = '8%';
      } else {
        particle.classList.add('shape-diamond');
        particle.style.borderRadius = '10%';
        particle.style.transform = 'rotate(45deg)';
      }
    
      // slight vertical offset to make distribution less uniform
      particle.style.top = Math.random() * 100 + '%';
    
      container.appendChild(particle);
  }
};

/**
 * Genera neuronas para el efecto de red neural
 */
export const generateNeurons = (containerId: string, count: number = NEURON_COUNT): void => {
  const container = document.getElementById(containerId);
  if (!container) return;

  for (let i = 0; i < count; i++) {
    const neuron = document.createElement('div');
    neuron.className = 'neuron';
    neuron.style.left = Math.random() * 100 + '%';
    neuron.style.top = Math.random() * 100 + '%';
    neuron.style.animationDelay = Math.random() * ANIMATION_DELAYS.NEURON.MAX + 's';
    container.appendChild(neuron);
  }
};

/**
 * Limpia elementos generados dinámicamente
 */
export const clearDynamicElements = (selector: string): void => {
  const elements = document.querySelectorAll(selector);
  elements.forEach(el => el.remove());
};
