/**
 * Constants - Constantes globales de la aplicación
 */

export const PARTICLE_COUNT = 50;
export const NEURON_COUNT = 30;

export const ANIMATION_DELAYS = {
  PARTICLE: {
    MIN: 0,
    MAX: 20
  },
  NEURON: {
    MIN: 0,
    MAX: 2
  },
  PARTICLE_DURATION: {
    MIN: 15,
    MAX: 25
  }
} as const;

export const THROTTLE_DELAYS = {
  SCROLL: 16, // ~60fps
  MOUSE: 100,
  RESIZE: 250
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
} as const;

export const EVENT_STATS = {
  DAYS: 2,
  CAREERS: 2,
  TRACKS: 4,
  POSSIBILITIES: '∞'
} as const;

export const EVALUATION_CRITERIA = {
  VALUE_PROPOSITION: 30,
  INTERDEPENDENCE: 30,
  AI_EXECUTION: 20,
  ACCESSIBILITY_ETHICS: 20
} as const;
