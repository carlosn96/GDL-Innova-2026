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

const COLOR_TOKEN_FALLBACKS: Record<string, string> = {
  'blue-600': 'cyan-600',
  'blue-500': 'cyan-500',
  'green-400': 'cyan-400',
  'yellow-400': 'purple-400',
  'red-600': 'pink-600',
  'red-500': 'pink-500',
};

const SHADE_TO_MIX: Record<string, string> = {
  '100': 'color-mix(in srgb, var(--base) 22%, white)',
  '200': 'color-mix(in srgb, var(--base) 38%, white)',
  '300': 'color-mix(in srgb, var(--base) 62%, white)',
  '400': 'var(--base)',
  '500': 'color-mix(in srgb, var(--base) 86%, black)',
  '600': 'color-mix(in srgb, var(--base) 70%, black)',
};

const deriveColorToken = (family: 'cyan' | 'purple' | 'pink', shade: string): string => {
  const template = SHADE_TO_MIX[shade] ?? SHADE_TO_MIX['400'];
  return template.replace('var(--base)', `var(--color-${family}-400)`);
};

export const resolveThemeColor = (token: string): string => {
  const mapped = COLOR_TOKEN_FALLBACKS[token] ?? token;
  const parsed = mapped.match(/^(cyan|purple|pink)-(100|200|300|400|500|600)$/);

  if (parsed) {
    return deriveColorToken(parsed[1] as 'cyan' | 'purple' | 'pink', parsed[2]);
  }

  return 'var(--color-cyan-400)';
};

export const buildGradientStyle = (from: string, to: string, via?: string): string => {
  const fromColor = resolveThemeColor(from);
  const toColor = resolveThemeColor(to);

  if (via) {
    return `linear-gradient(90deg, ${fromColor}, ${resolveThemeColor(via)}, ${toColor})`;
  }

  return `linear-gradient(90deg, ${fromColor}, ${toColor})`;
};

/**
 * Construye clases CSS de gradiente
 */
export const buildGradientClass = (from: string, to: string, via?: string): string => {
  return buildGradientStyle(from, to, via);
};

/**
 * Construye clases CSS condicionales
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};
