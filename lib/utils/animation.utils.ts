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

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * ANIMATION_DELAYS.PARTICLE.MAX + 's';
    particle.style.animationDuration = 
      (ANIMATION_DELAYS.PARTICLE_DURATION.MIN + Math.random() * 
        (ANIMATION_DELAYS.PARTICLE_DURATION.MAX - ANIMATION_DELAYS.PARTICLE_DURATION.MIN)) + 's';
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
