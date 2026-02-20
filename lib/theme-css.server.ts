/**
 * theme-css.server.ts
 *
 * Utilidades server-side para generar CSS de tema desde un ThemeSnapshot.
 * No importa nada del browser — seguro en Server Components y API routes.
 */

import { cache } from 'react';
import { GOOGLE_FONT_OPTIONS } from '@/config/fonts.config';
import type { ThemeSnapshot } from '@/lib/firebase/theme-store';

// ─── Helpers de color (misma lógica que ThemeConfigurator) ───────────────────

function normalizeHex(value: string): string | null {
  const raw = value.trim().replace(/^#/, '');
  if (!/^(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(raw)) return null;
  return `#${raw.toLowerCase()}`;
}

function toRgbHex(value: string): string | null {
  const normalized = normalizeHex(value);
  if (!normalized) return null;
  let hex = normalized.slice(1);
  if (hex.length === 3 || hex.length === 4) hex = hex.split('').map((c) => `${c}${c}`).join('');
  if (hex.length === 8) hex = hex.slice(0, 6);
  if (hex.length !== 6) return null;
  return `#${hex}`;
}

function mixHex(colorA: string, colorB: string, ratioA: number): string {
  const a = toRgbHex(colorA) ?? '#000000';
  const b = toRgbHex(colorB) ?? '#000000';
  const wA = Math.max(0, Math.min(1, ratioA));
  const wB = 1 - wA;
  const r = Math.round(parseInt(a.slice(1, 3), 16) * wA + parseInt(b.slice(1, 3), 16) * wB);
  const g = Math.round(parseInt(a.slice(3, 5), 16) * wA + parseInt(b.slice(3, 5), 16) * wB);
  const bl = Math.round(parseInt(a.slice(5, 7), 16) * wA + parseInt(b.slice(5, 7), 16) * wB);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`;
}

function deriveScale(base: string) {
  const b = toRgbHex(base) ?? '#6366f1';
  return {
    100: mixHex(b, '#ffffff', 0.22),
    200: mixHex(b, '#ffffff', 0.38),
    300: mixHex(b, '#ffffff', 0.62),
    400: b,
    500: mixHex(b, '#000000', 0.86),
    600: mixHex(b, '#000000', 0.70),
  } as const;
}

function deriveBackgroundScale(base: string) {
  const b = toRgbHex(base) ?? '#201c1f';
  return {
    primary:    mixHex(b, '#000000', 0.62),
    secondary:  b,
    tertiary:   mixHex(b, '#ffffff', 0.88),
    quaternary: mixHex(b, '#ffffff', 0.76),
    quinary:    mixHex(b, '#ffffff', 0.64),
  } as const;
}

function stopsToCSS(angle: number, stops: Array<{ color: string; position: number }>): string {
  return `linear-gradient(${angle}deg, ${stops.map((s) => `${s.color} ${s.position}%`).join(', ')})`;
}

// ─── Mapeo de presets de sección ─────────────────────────────────────────────

const SECTION_IDS = ['hero', 'about', 'schedule', 'tracks', 'tech', 'evaluation', 'cta', 'footer'] as const;

const SECTION_OVERLAYS: Record<string, string> = {
  none:         'transparent',
  'cyan-mist':  'radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--color-cyan-400) 20%, transparent) 0%, transparent 65%)',
  'purple-glow':'radial-gradient(circle at 80% 30%, color-mix(in srgb, var(--color-purple-400) 24%, transparent) 0%, transparent 60%)',
  'pink-beam':  'linear-gradient(135deg, color-mix(in srgb, var(--color-pink-400) 16%, transparent) 0%, transparent 60%)',
  aurora:       'linear-gradient(120deg, color-mix(in srgb, var(--color-cyan-400) 14%, transparent) 0%, color-mix(in srgb, var(--color-purple-400) 14%, transparent) 55%, color-mix(in srgb, var(--color-pink-400) 12%, transparent) 100%)',
  vignette:     'radial-gradient(circle at center, transparent 45%, color-mix(in srgb, var(--bg-dark-primary) 62%, transparent) 100%)',
};

const DEFAULT_SECTION_FILTERS: Record<string, string> = {
  hero: 'aurora', about: 'none', schedule: 'none', tracks: 'none',
  tech: 'none', evaluation: 'none', cta: 'none', footer: 'none',
};

// ─── Resolución de fuentes ────────────────────────────────────────────────────

function getFontStack(id: string): string {
  const font = GOOGLE_FONT_OPTIONS.find((f) => f.id === id);
  const family = font?.family ?? 'Inter';
  const category = font?.category ?? 'sans-serif';
  if (category === 'serif') return `'${family}', serif`;
  if (category === 'monospace') return `'${family}', monospace`;
  return `'${family}', sans-serif`;
}

function buildGoogleFontsImport(ids: string[]): string | null {
  const families = Array.from(
    new Set(ids.map((id) => GOOGLE_FONT_OPTIONS.find((f) => f.id === id)?.family ?? 'Inter')),
  );
  if (families.length === 0) return null;
  const query = families
    .map((f) => `family=${f.replace(/\s+/g, '+')}:wght@400;500;600;700;800`)
    .join('&');
  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}

// ─── Generación de CSS ────────────────────────────────────────────────────────

export function snapshotToCSS(snapshot: ThemeSnapshot): string {
  const allTokens = snapshot.families.flatMap((f) => f.tokens);
  const token = (variable: string, fallback: string): string =>
    allTokens.find((t) => t.variable === variable)?.value ?? fallback;

  const colorPrimary   = token('--color-cyan-400',    '#009e9a');
  const colorSecondary = token('--color-purple-400',  '#5b2eff');
  const colorAccent    = token('--color-pink-400',    '#ed1e79');
  const textPrimary    = token('--text-primary',      '#ffffff');
  const textSecondary  = token('--text-secondary',    '#e4e7f8');
  const textMuted      = token('--text-muted',        '#94a3b8');
  const sectionBase    = snapshot.sectionBaseColor ?? '#201c1f';

  const cyan    = deriveScale(colorPrimary);
  const purple  = deriveScale(colorSecondary);
  const pink    = deriveScale(colorAccent);
  const bg      = deriveBackgroundScale(sectionBase);

  const typo = snapshot.typography;
  const primaryId    = typo?.primary    ?? 'inter';
  const subheadingId = typo?.subheading ?? 'inter';
  const headingId    = typo?.heading    ?? 'inter';

  const importUrl = buildGoogleFontsImport([primaryId, subheadingId, headingId]);
  const sectionFilters = snapshot.sectionFilters ?? {};

  const L: string[] = [];

  if (importUrl) {
    L.push(`@import url('${importUrl}');`, '');
  }

  L.push(':root {');

  // Base editables
  L.push(`  --color-cyan-400: ${cyan[400]};`);
  L.push(`  --color-purple-400: ${purple[400]};`);
  L.push(`  --color-pink-400: ${pink[400]};`);
  L.push(`  --bg-dark-secondary: ${bg.secondary};`);
  L.push(`  --text-primary: ${textPrimary};`);
  L.push(`  --text-secondary: ${textSecondary};`);
  L.push(`  --text-muted: ${textMuted};`);

  // Escalas derivadas
  L.push(`  --color-cyan-100: ${cyan[100]};`);
  L.push(`  --color-cyan-200: ${cyan[200]};`);
  L.push(`  --color-cyan-300: ${cyan[300]};`);
  L.push(`  --color-cyan-500: ${cyan[500]};`);
  L.push(`  --color-cyan-600: ${cyan[600]};`);
  L.push(`  --color-purple-100: ${purple[100]};`);
  L.push(`  --color-purple-200: ${purple[200]};`);
  L.push(`  --color-purple-300: ${purple[300]};`);
  L.push(`  --color-purple-500: ${purple[500]};`);
  L.push(`  --color-purple-600: ${purple[600]};`);
  L.push(`  --color-pink-100: ${pink[100]};`);
  L.push(`  --color-pink-200: ${pink[200]};`);
  L.push(`  --color-pink-300: ${pink[300]};`);
  L.push(`  --color-pink-500: ${pink[500]};`);
  L.push(`  --color-pink-600: ${pink[600]};`);
  L.push(`  --bg-dark-primary: ${bg.primary};`);
  L.push(`  --bg-dark-tertiary: ${bg.tertiary};`);
  L.push(`  --bg-dark-quaternary: ${bg.quaternary};`);
  L.push(`  --bg-dark-quinary: ${bg.quinary};`);
  L.push(`  --text-tertiary: ${mixHex(textSecondary, '#ffffff', 0.72)};`);

  // Degradados
  for (const gradient of (snapshot.gradients ?? [])) {
    if (typeof gradient.variable !== 'string' || !Array.isArray(gradient.stops)) continue;
    L.push(`  ${gradient.variable}: ${stopsToCSS(gradient.angle ?? 135, gradient.stops)};`);
  }

  // Filtros de sección
  L.push(`  --section-base-bg: ${sectionBase};`);
  for (const id of SECTION_IDS) {
    const preset = sectionFilters[id] ?? DEFAULT_SECTION_FILTERS[id];
    L.push(`  --section-filter-${id}: ${SECTION_OVERLAYS[preset] ?? 'transparent'};`);
  }

  // Tipografía
  L.push(`  --font-primary: ${getFontStack(primaryId)};`);
  L.push(`  --font-subheading: ${getFontStack(subheadingId)};`);
  L.push(`  --font-heading: ${getFontStack(headingId)};`);

  // Partículas
  L.push(`  --particles-palette: ${cyan[400]},${purple[400]},${pink[400]};`);

  L.push('}');
  return L.join('\n');
}

// ─── Fetch desde Realtime Database (REST, sin SDK) ───────────────────────────

export const fetchThemeSnapshot = cache(async (): Promise<ThemeSnapshot | null> => {
  const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!dbUrl || !apiKey) return null;

  try {
    const url = `${dbUrl.replace(/\/$/, '')}/themes/gdlinova.json`;
    const res = await fetch(url, {
      next: { revalidate: 60 }, // revalida cada 60 s en producción
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<ThemeSnapshot> | null;
    if (!data || !Array.isArray(data.families) || !Array.isArray(data.gradients)) return null;
    return data as ThemeSnapshot;
  } catch {
    return null;
  }
});
