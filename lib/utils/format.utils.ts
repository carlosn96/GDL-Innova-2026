/**
 * Format Utilities
 * 
 * Funciones utilitarias para formateo de datos.
 */

/**
 * Formatea un rango de tiempo
 */
export const formatTimeRange = (start: string, end: string): string => {
  return `${start} - ${end}`;
};

/**
 * Construye clases CSS de gradiente
 */
export const buildGradientClass = (from: string, to: string, via?: string): string => {
  if (via) {
    return `bg-gradient-to-r from-${from} via-${via} to-${to}`;
  }
  return `bg-gradient-to-r from-${from} to-${to}`;
};

/**
 * Construye clases CSS condicionales
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};
