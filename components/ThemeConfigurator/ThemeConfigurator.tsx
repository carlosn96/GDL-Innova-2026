'use client';

/**
 * ThemeConfigurator — v2
 *
 * Panel completamente dinámico de personalización cromática para diseñadores.
 * Sin familias fijas: el diseñador puede crear, renombrar y eliminar
 * cualquier familia y cualquier tono. Los cambios se aplican al DOM
 * en tiempo real. El botón "Guardar CSS" descarga tokens.css listo para
 * reemplazar styles/theme/tokens.css en el proyecto.
 */

import { useState, useEffect, useCallback, useRef, type KeyboardEvent } from 'react';
import type { FirebaseError } from 'firebase/app';
import { useSiteConfig } from '@/lib/site-context';
import {
  GOOGLE_FONT_OPTIONS,
  DEFAULT_TYPOGRAPHY,
  type FontCategory,
  type FontOption,
} from '@/config/fonts.config';
import {
  buildDefaultFamilies,
  buildDefaultGradients,
  type ColorToken,
  type ColorFamily,
} from './tokens.data';
import { isFirebaseConfigured, loadThemeFromFirestore, saveThemeToFirestore } from '@/lib/firebase';

type SectionId = 'hero' | 'about' | 'schedule' | 'tracks' | 'tech' | 'evaluation' | 'cta' | 'footer';

interface TypographyState {
  primary: string;
  subheading: string;
  heading: string;
}

type TypographySlot = keyof TypographyState;

interface LocalFontAsset {
  id: string;
  label: string;
  family: string;
  category: FontCategory;
  format: 'woff2' | 'woff' | 'truetype' | 'opentype';
  dataUrl: string;
}

type LocalFontsState = Record<TypographySlot, LocalFontAsset | null>;

interface SectionFilterPreset {
  id: string;
  label: string;
  overlay: string;
}

interface LocalFontsResponse {
  fonts: LocalFontAsset[];
}

interface LocalFontUploadResponse {
  font?: LocalFontAsset;
  error?: string;
}

const SECTION_OPTIONS: Array<{ id: SectionId; label: string }> = [
  { id: 'hero', label: 'Hero' },
  { id: 'about', label: 'About' },
  { id: 'schedule', label: 'Cronograma' },
  { id: 'tracks', label: 'Reto' },
  { id: 'tech', label: 'Stack' },
  { id: 'evaluation', label: 'Evaluación' },
  { id: 'cta', label: 'CTA' },
  { id: 'footer', label: 'Footer' },
];

const SECTION_FILTER_PRESETS: SectionFilterPreset[] = [
  { id: 'none', label: 'Sin filtro', overlay: 'transparent' },
  { id: 'cyan-mist', label: 'Neblina cian', overlay: 'radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--color-cyan-400) 20%, transparent) 0%, transparent 65%)' },
  { id: 'purple-glow', label: 'Brillo púrpura', overlay: 'radial-gradient(circle at 80% 30%, color-mix(in srgb, var(--color-purple-400) 24%, transparent) 0%, transparent 60%)' },
  { id: 'pink-beam', label: 'Haz rosa', overlay: 'linear-gradient(135deg, color-mix(in srgb, var(--color-pink-400) 16%, transparent) 0%, transparent 60%)' },
  { id: 'aurora', label: 'Aurora', overlay: 'linear-gradient(120deg, color-mix(in srgb, var(--color-cyan-400) 14%, transparent) 0%, color-mix(in srgb, var(--color-purple-400) 14%, transparent) 55%, color-mix(in srgb, var(--color-pink-400) 12%, transparent) 100%)' },
  { id: 'vignette', label: 'Viñeta suave', overlay: 'radial-gradient(circle at center, transparent 45%, rgba(0,0,0,0.22) 100%)' },
];

const DEFAULT_SECTION_FILTERS: Record<SectionId, string> = {
  hero: 'aurora',
  about: 'none',
  schedule: 'none',
  tracks: 'none',
  tech: 'none',
  evaluation: 'none',
  cta: 'none',
  footer: 'none',
};

const LOCAL_FONT_IDS: Record<TypographySlot, string> = {
  primary: 'local-primary',
  subheading: 'local-subheading',
  heading: 'local-heading',
};

const EMPTY_LOCAL_FONTS: LocalFontsState = {
  primary: null,
  subheading: null,
  heading: null,
};

const DEFAULT_SECTION_BASE_COLOR = '#201c1f';

const CORE_THEME_VARIABLES = new Set([
  '--color-cyan-400',
  '--color-purple-400',
  '--color-pink-400',
  '--text-primary',
  '--text-secondary',
  '--text-muted',
  '--bg-dark-secondary',
]);

function sanitizeFamilies(inputFamilies: ColorFamily[]): ColorFamily[] {
  const defaults = buildDefaultFamilies();
  const sourceByVar = new Map<string, ColorToken>();

  inputFamilies.forEach((family) => {
    family.tokens.forEach((token) => {
      if (CORE_THEME_VARIABLES.has(token.variable)) {
        sourceByVar.set(token.variable, token);
      }
    });
  });

  return defaults.map((family) => ({
    ...family,
    tokens: family.tokens.map((token) => {
      const fromInput = sourceByVar.get(token.variable);
      return fromInput ? { ...token, value: fromInput.value } : token;
    }),
  }));
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function normalizeHex(value: string): string | null {
  const raw = value.trim().replace(/^#/, '');
  if (!/^(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(raw)) {
    return null;
  }
  return `#${raw.toLowerCase()}`;
}

function toRgbHex(value: string): string | null {
  const normalized = normalizeHex(value);
  if (!normalized) return null;

  let hex = normalized.slice(1);
  if (hex.length === 3 || hex.length === 4) {
    hex = hex.split('').map((char) => `${char}${char}`).join('');
  }
  if (hex.length === 8) {
    hex = hex.slice(0, 6);
  }
  if (hex.length !== 6) return null;
  return `#${hex}`;
}

function toColorPickerHex(value: string): string {
  return toRgbHex(value) ?? '#6366f1';
}

function luminance(hex: string) {
  const rgbHex = toRgbHex(hex) ?? '#000000';
  const r = parseInt(rgbHex.slice(1, 3), 16);
  const g = parseInt(rgbHex.slice(3, 5), 16);
  const b = parseInt(rgbHex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
function fg(hex: string) { return luminance(hex) > 0.55 ? '#111' : '#fff'; }

function mixHex(colorA: string, colorB: string, ratioA: number): string {
  const a = toRgbHex(colorA) ?? '#000000';
  const b = toRgbHex(colorB) ?? '#000000';
  const weightA = Math.max(0, Math.min(1, ratioA));
  const weightB = 1 - weightA;

  const r = Math.round(parseInt(a.slice(1, 3), 16) * weightA + parseInt(b.slice(1, 3), 16) * weightB);
  const g = Math.round(parseInt(a.slice(3, 5), 16) * weightA + parseInt(b.slice(3, 5), 16) * weightB);
  const bValue = Math.round(parseInt(a.slice(5, 7), 16) * weightA + parseInt(b.slice(5, 7), 16) * weightB);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bValue.toString(16).padStart(2, '0')}`;
}

function deriveScale(baseColor: string) {
  const base = toRgbHex(baseColor) ?? '#6366f1';
  return {
    100: mixHex(base, '#ffffff', 0.22),
    200: mixHex(base, '#ffffff', 0.38),
    300: mixHex(base, '#ffffff', 0.62),
    400: base,
    500: mixHex(base, '#000000', 0.86),
    600: mixHex(base, '#000000', 0.70),
  } as const;
}

function deriveBackgroundScale(baseColor: string) {
  const base = toRgbHex(baseColor) ?? '#201c1f';
  return {
    primary: mixHex(base, '#000000', 0.62),
    secondary: base,
    tertiary: mixHex(base, '#ffffff', 0.88),
    quaternary: mixHex(base, '#ffffff', 0.76),
    quinary: mixHex(base, '#ffffff', 0.64),
  } as const;
}

function getFontById(id: string): FontOption {
  return GOOGLE_FONT_OPTIONS.find((font) => font.id === id) ?? GOOGLE_FONT_OPTIONS[0];
}

function isGoogleFontId(id: string): boolean {
  return GOOGLE_FONT_OPTIONS.some((font) => font.id === id);
}

function getLocalFontById(id: string, localFonts: LocalFontsState, folderFonts: LocalFontAsset[]): LocalFontAsset | null {
  const uploaded = Object.values(localFonts).find((font) => font?.id === id);
  if (uploaded) return uploaded;
  return folderFonts.find((font) => font.id === id) ?? null;
}

function resolveFontBySlot(
  slot: TypographySlot,
  typography: TypographyState,
  localFonts: LocalFontsState,
  folderFonts: LocalFontAsset[],
): FontOption | LocalFontAsset {
  const local = getLocalFontById(typography[slot], localFonts, folderFonts);
  if (local) {
    return local;
  }
  return getFontById(typography[slot]);
}

function toFamilyQuery(family: string): string {
  return family.trim().replace(/\s+/g, '+');
}

function buildGoogleFontsUrl(typography: TypographyState, localFonts: LocalFontsState, folderFonts: LocalFontAsset[]): string | null {
  const selected = [
    resolveFontBySlot('primary', typography, localFonts, folderFonts),
    resolveFontBySlot('subheading', typography, localFonts, folderFonts),
    resolveFontBySlot('heading', typography, localFonts, folderFonts),
  ];

  const families = Array.from(new Set([
    ...selected.filter((font): font is FontOption => !('dataUrl' in font)).map((font) => font.family),
  ]));

  if (families.length === 0) {
    return null;
  }

  const query = families
    .map((family) => `family=${toFamilyQuery(family)}:wght@400;500;600;700;800`)
    .join('&');

  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}

function buildFontStack(font: FontOption | LocalFontAsset): string {
  if (font.category === 'serif') {
    return `'${font.family}', serif`;
  }
  if (font.category === 'monospace') {
    return `'${font.family}', monospace`;
  }
  return `'${font.family}', sans-serif`;
}

function buildLocalFontsFaceCSS(localFonts: LocalFontsState, folderFonts: LocalFontAsset[], typography: TypographyState): string {
  const selected = new Set([typography.primary, typography.subheading, typography.heading]);
  const merged = [
    ...Object.values(localFonts).filter((font): font is LocalFontAsset => Boolean(font)),
    ...folderFonts,
  ];
  const unique = Array.from(new Map(merged.map((font) => [font.id, font])).values());
  const fonts = unique.filter((font) => selected.has(font.id));
  if (fonts.length === 0) {
    return '';
  }

  return fonts
    .map((font) => [
      '@font-face {',
      `  font-family: '${font.family}';`,
      `  src: url('${font.dataUrl}') format('${font.format}');`,
      '  font-weight: 100 900;',
      '  font-style: normal;',
      '  font-display: swap;',
      '}',
    ].join('\n'))
    .join('\n\n');
}

function resolveOverlay(presetId: string): string {
  return SECTION_FILTER_PRESETS.find((preset) => preset.id === presetId)?.overlay ?? 'transparent';
}

function toFirebaseMessage(error: unknown, action: 'cargar' | 'guardar'): string {
  const firebaseError = error as FirebaseError | undefined;
  const code = firebaseError?.code ?? '';

  if (code.includes('permission-denied')) {
    return `Firestore rechazó permisos al ${action} (permission-denied). Revisa las reglas de seguridad.`;
  }
  if (code.includes('failed-precondition')) {
    return `Firestore no está listo para ${action} (failed-precondition). Verifica que la base esté creada en modo nativo.`;
  }
  if (code.includes('unauthenticated')) {
    return `Firestore requiere autenticación para ${action} (unauthenticated). Ajusta reglas o inicia sesión.`;
  }
  if (code.includes('not-found')) {
    return `Proyecto o recurso no encontrado al ${action} (not-found). Confirma NEXT_PUBLIC_FIREBASE_PROJECT_ID.`;
  }

  const detail = firebaseError?.message ? ` Detalle: ${firebaseError.message}` : '';
  return `No se pudo ${action} en Firestore.${detail}`;
}

function applyToDOM(
  families: ColorFamily[],
  sectionBaseColor: string,
  sectionFilters: Record<SectionId, string>,
  typography: TypographyState,
  localFonts: LocalFontsState,
  folderFonts: LocalFontAsset[],
  particlesPalette?: string,
) {
  const root = document.documentElement;
  const primaryFont = resolveFontBySlot('primary', typography, localFonts, folderFonts);
  const subheadingFont = resolveFontBySlot('subheading', typography, localFonts, folderFonts);
  const headingFont = resolveFontBySlot('heading', typography, localFonts, folderFonts);

  families.forEach((fam) => fam.tokens.forEach((t) => root.style.setProperty(t.variable, t.value)));
  const colorPrimary = families.flatMap((family) => family.tokens).find((t) => t.variable === '--color-cyan-400')?.value ?? '#009e9a';
  const colorSecondary = families.flatMap((family) => family.tokens).find((t) => t.variable === '--color-purple-400')?.value ?? '#5b2eff';
  const colorAccent = families.flatMap((family) => family.tokens).find((t) => t.variable === '--color-pink-400')?.value ?? '#ed1e79';
  const textPrimary = families.flatMap((family) => family.tokens).find((t) => t.variable === '--text-primary')?.value ?? '#ffffff';
  const textSecondary = families.flatMap((family) => family.tokens).find((t) => t.variable === '--text-secondary')?.value ?? '#e4e7f8';
  const textMuted = families.flatMap((family) => family.tokens).find((t) => t.variable === '--text-muted')?.value ?? '#94a3b8';

  const cyan = deriveScale(colorPrimary);
  const purple = deriveScale(colorSecondary);
  const pink = deriveScale(colorAccent);

  root.style.setProperty('--color-cyan-100', cyan[100]);
  root.style.setProperty('--color-cyan-200', cyan[200]);
  root.style.setProperty('--color-cyan-300', cyan[300]);
  root.style.setProperty('--color-cyan-400', cyan[400]);
  root.style.setProperty('--color-cyan-500', cyan[500]);
  root.style.setProperty('--color-cyan-600', cyan[600]);

  root.style.setProperty('--color-purple-100', purple[100]);
  root.style.setProperty('--color-purple-200', purple[200]);
  root.style.setProperty('--color-purple-300', purple[300]);
  root.style.setProperty('--color-purple-400', purple[400]);
  root.style.setProperty('--color-purple-500', purple[500]);
  root.style.setProperty('--color-purple-600', purple[600]);

  root.style.setProperty('--color-pink-100', pink[100]);
  root.style.setProperty('--color-pink-200', pink[200]);
  root.style.setProperty('--color-pink-300', pink[300]);
  root.style.setProperty('--color-pink-400', pink[400]);
  root.style.setProperty('--color-pink-500', pink[500]);
  root.style.setProperty('--color-pink-600', pink[600]);

  const backgroundScale = deriveBackgroundScale(sectionBaseColor);
  root.style.setProperty('--bg-dark-primary', backgroundScale.primary);
  root.style.setProperty('--bg-dark-secondary', backgroundScale.secondary);
  root.style.setProperty('--bg-dark-tertiary', backgroundScale.tertiary);
  root.style.setProperty('--bg-dark-quaternary', backgroundScale.quaternary);
  root.style.setProperty('--bg-dark-quinary', backgroundScale.quinary);

  root.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${cyan[400]} 0%, ${purple[400]} 100%)`);
  root.style.setProperty('--gradient-secondary', `linear-gradient(135deg, ${purple[400]} 0%, ${pink[400]} 100%)`);
  root.style.setProperty('--gradient-accent', `linear-gradient(135deg, ${cyan[400]} 0%, ${pink[400]} 100%)`);
  root.style.setProperty('--gradient-hero', `linear-gradient(135deg, ${backgroundScale.primary} 0%, ${backgroundScale.secondary} 55%, ${backgroundScale.tertiary} 100%)`);
  root.style.setProperty('--text-tertiary', mixHex(textSecondary, '#ffffff', 0.72));

  root.style.setProperty('--section-base-bg', sectionBaseColor);
  SECTION_OPTIONS.forEach(({ id }) => {
    root.style.setProperty(`--section-filter-${id}`, resolveOverlay(sectionFilters[id]));
  });
  root.style.setProperty('--font-primary', buildFontStack(primaryFont));
  root.style.setProperty('--font-subheading', buildFontStack(subheadingFont));
  root.style.setProperty('--font-heading', buildFontStack(headingFont));
  if (particlesPalette !== undefined && particlesPalette.trim().length > 0) {
    root.style.setProperty('--particles-palette', particlesPalette);
  } else {
    root.style.setProperty('--particles-palette', `${cyan[400]},${purple[400]},${pink[400]}`);
  }

  const localFaceCss = buildLocalFontsFaceCSS(localFonts, folderFonts, typography);
  let localFontsStyle = document.getElementById('tc-local-fonts') as HTMLStyleElement | null;
  if (localFaceCss) {
    if (!localFontsStyle) {
      localFontsStyle = document.createElement('style');
      localFontsStyle.id = 'tc-local-fonts';
      document.head.appendChild(localFontsStyle);
    }
    if (localFontsStyle.textContent !== localFaceCss) {
      localFontsStyle.textContent = localFaceCss;
    }
  } else if (localFontsStyle) {
    localFontsStyle.remove();
  }

  const href = buildGoogleFontsUrl(typography, localFonts, folderFonts);
  let link = document.getElementById('tc-google-fonts') as HTMLLinkElement | null;
  if (!href && link) {
    link.remove();
    return;
  }
  if (href && !link) {
    link = document.createElement('link');
    link.id = 'tc-google-fonts';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  if (href && link !== null) {
    if (link.href !== href) {
      link.href = href;
    }
  }
}

function generateCSS(
  families: ColorFamily[],
  sectionBaseColor: string,
  sectionFilters: Record<SectionId, string>,
  typography: TypographyState,
  localFonts: LocalFontsState,
  folderFonts: LocalFontAsset[],
  particlesPalette?: string,
): string {
  const date = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  const importUrl = buildGoogleFontsUrl(typography, localFonts, folderFonts);
  const primaryFont = resolveFontBySlot('primary', typography, localFonts, folderFonts);
  const subheadingFont = resolveFontBySlot('subheading', typography, localFonts, folderFonts);
  const headingFont = resolveFontBySlot('heading', typography, localFonts, folderFonts);
  const localFaces = buildLocalFontsFaceCSS(localFonts, folderFonts, typography);
  const colorPrimary = families.flatMap((family) => family.tokens).find((t) => t.variable === '--color-cyan-400')?.value ?? '#009e9a';
  const colorSecondary = families.flatMap((family) => family.tokens).find((t) => t.variable === '--color-purple-400')?.value ?? '#5b2eff';
  const colorAccent = families.flatMap((family) => family.tokens).find((t) => t.variable === '--color-pink-400')?.value ?? '#ed1e79';
  const textPrimary = families.flatMap((family) => family.tokens).find((t) => t.variable === '--text-primary')?.value ?? '#ffffff';
  const textSecondary = families.flatMap((family) => family.tokens).find((t) => t.variable === '--text-secondary')?.value ?? '#e4e7f8';
  const textMuted = families.flatMap((family) => family.tokens).find((t) => t.variable === '--text-muted')?.value ?? '#94a3b8';

  const cyan = deriveScale(colorPrimary);
  const purple = deriveScale(colorSecondary);
  const pink = deriveScale(colorAccent);
  const backgroundScale = deriveBackgroundScale(sectionBaseColor);

  const L: string[] = [
    '/**',
    ' * Design Tokens — Paleta exportada desde el Configurador de Tema',
    ` * Generado el ${date}`,
    ' * Para instalar: reemplaza styles/theme/tokens.css con este archivo.',
    ' */',
    '', ':root {',
  ];

  if (importUrl) {
    L.unshift('', `@import url('${importUrl}');`);
  }
  if (localFaces) {
    L.unshift('', localFaces);
  }

  L.push('  /* === COLORES BASE EDITABLES === */');
  L.push(`  --color-cyan-400: ${cyan[400]};`);
  L.push(`  --color-purple-400: ${purple[400]};`);
  L.push(`  --color-pink-400: ${pink[400]};`);
  L.push(`  --bg-dark-secondary: ${backgroundScale.secondary};`);
  L.push(`  --text-primary: ${textPrimary};`);
  L.push(`  --text-secondary: ${textSecondary};`);
  L.push(`  --text-muted: ${textMuted};`);
  L.push('');

  L.push('  /* === ESCALAS DERIVADAS AUTOMÁTICAMENTE === */');
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
  L.push(`  --bg-dark-primary: ${backgroundScale.primary};`);
  L.push(`  --bg-dark-tertiary: ${backgroundScale.tertiary};`);
  L.push(`  --bg-dark-quaternary: ${backgroundScale.quaternary};`);
  L.push(`  --bg-dark-quinary: ${backgroundScale.quinary};`);
  L.push(`  --text-primary: ${textPrimary};`);
  L.push(`  --text-secondary: ${textSecondary};`);
  L.push(`  --text-tertiary: ${mixHex(textSecondary, '#ffffff', 0.72)};`);
  L.push(`  --text-muted: ${textMuted};`);
  L.push('');
  L.push('  /* === DEGRADADOS (MAPA DE USO) === */');
  L.push('  /* --gradient-primary: títulos y botón principal */');
  L.push('  --gradient-primary: linear-gradient(135deg, var(--color-cyan-400) 0%, var(--color-purple-400) 100%);');
  L.push('  /* --gradient-secondary: botón secundario y CTA alterno */');
  L.push('  --gradient-secondary: linear-gradient(135deg, var(--color-purple-400) 0%, var(--color-pink-400) 100%);');
  L.push('  /* --gradient-accent: badges, pills y acentos visuales */');
  L.push('  --gradient-accent: linear-gradient(135deg, var(--color-cyan-400) 0%, var(--color-pink-400) 100%);');
  L.push('  /* --gradient-hero: fondo principal de la sección hero */');
  L.push('  --gradient-hero: linear-gradient(135deg, var(--bg-dark-primary) 0%, var(--bg-dark-secondary) 55%, var(--bg-dark-tertiary) 100%);');
  L.push('');
  L.push('  /* === FILTROS POR SECCIÓN === */');
  L.push(`  --section-base-bg: ${sectionBaseColor};`);
  SECTION_OPTIONS.forEach(({ id }) => {
    L.push(`  --section-filter-${id}: ${resolveOverlay(sectionFilters[id])};`);
  });
  L.push('');
  L.push('  /* === EFECTOS (sin cambios) === */');
  [
    `--font-primary: ${buildFontStack(primaryFont)};`,
    `--font-subheading: ${buildFontStack(subheadingFont)};`,
    `--font-heading: ${buildFontStack(headingFont)};`,
    '--glass-bg: rgba(255,255,255,0.05);','--glass-border: rgba(255,255,255,0.1);','--glass-blur: 20px;',
    '--shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.05);','--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);',
    '--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);','--shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1);',
    '--shadow-2xl: 0 25px 50px -12px rgba(0,0,0,0.25);',
    '--glow-small: 0 0 20px currentColor;','--glow-medium: 0 0 20px currentColor,0 0 40px currentColor;',
    '--glow-large: 0 0 20px currentColor,0 0 40px currentColor,0 0 60px currentColor;',
    '--transition-fast: 150ms cubic-bezier(0.4,0,0.2,1);','--transition-normal: 300ms cubic-bezier(0.4,0,0.2,1);',
    '--transition-slow: 500ms cubic-bezier(0.4,0,0.2,1);','--transition-bounce: 600ms cubic-bezier(0.23,1,0.32,1);',
    '--z-fixed: 1030;',
  ].forEach((l) => L.push(`  ${l}`));
  if (particlesPalette) {
    L.push(`  --particles-palette: ${particlesPalette};`);
  } else {
    L.push(`  --particles-palette: ${cyan[400]},${purple[400]},${pink[400]};`);
  }
  L.push('}');
  return L.join('\n');
}

interface HexInputProps {
  value: string;
  onCommit: (value: string) => void;
  className: string;
  ariaLabel: string;
}

function HexInput({ value, onCommit, className, ariaLabel }: HexInputProps) {
  const [draft, setDraft] = useState(value.toUpperCase());

  useEffect(() => {
    setDraft(value.toUpperCase());
  }, [value]);

  const commit = useCallback(() => {
    const normalized = normalizeHex(draft);
    if (normalized) {
      onCommit(normalized);
      setDraft(normalized.toUpperCase());
      return;
    }
    setDraft(value.toUpperCase());
  }, [draft, onCommit, value]);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit();
    }
  };

  return (
    <input
      type="text"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={onKeyDown}
      className={className}
      placeholder="#RRGGBB"
      aria-label={ariaLabel}
      spellCheck={false}
    />
  );
}

// ─── LivePreview ──────────────────────────────────────────────────────────────

function LivePreview({ families }: { families: ColorFamily[] }) {
  const allTokens = families.flatMap((f) => f.tokens);
  const gv = (v: string) => allTokens.find((t) => t.variable === v)?.value;
  const cPrimary = gv('--color-cyan-400') ?? '#009e9a';
  const cSecondary = gv('--color-purple-400') ?? '#5b2eff';
  const cAccent = gv('--color-pink-400') ?? '#ed1e79';
  const bgPrimary = gv('--bg-dark-primary') ?? '#151216';
  const bgSecondary = gv('--bg-dark-secondary') ?? '#201c1f';
  const bgTertiary = gv('--bg-dark-tertiary') ?? '#2a252a';

  const heroGrad = `linear-gradient(135deg, ${bgPrimary} 0%, ${bgSecondary} 55%, ${bgTertiary} 100%)`;
  const primaryGrad = `linear-gradient(135deg, ${cPrimary} 0%, ${cSecondary} 100%)`;
  const accentGrad = `linear-gradient(135deg, ${cPrimary} 0%, ${cAccent} 100%)`;

  const textPrimary   = gv('--text-primary')        ?? '#ffffff';
  const textSecondary = gv('--text-secondary')       ?? '#e4e7f8';
  const textMuted     = gv('--text-muted')           ?? '#94a3b8';
  const bgSecondarySurface = gv('--bg-dark-secondary')    ?? '#201c1f';
  const firstKey  = families[0]?.tokens.find((t) => t.isKey)?.value ?? families[0]?.tokens[0]?.value ?? '#009e9a';
  const secondKey = families[1]?.tokens.find((t) => t.isKey)?.value ?? families[1]?.tokens[0]?.value ?? '#5b2eff';
  const thirdKey  = families[2]?.tokens.find((t) => t.isKey)?.value ?? families[2]?.tokens[0]?.value ?? '#ed1e79';

  return (
    <div className="tc-preview-root">
      {/* Mini hero */}
      <div className="tc-preview-hero" style={{ background: heroGrad }}>
        <div className="tc-preview-badge" style={{ background: accentGrad, color: '#fff' }}>HACKATHON</div>
        <h3 className="tc-preview-title" style={{ color: textPrimary }}>
          GDL<span style={{ color: firstKey }}>Innova</span>
        </h3>
        <p style={{ fontSize: '0.74rem', margin: 0, color: textSecondary }}>24 horas de innovación</p>
        <div className="tc-preview-btns">
          <button className="tc-preview-btn-solid" style={{ background: primaryGrad, color: '#fff' }}>Inscríbete</button>
          <button className="tc-preview-btn-ghost" style={{ borderColor: firstKey, color: firstKey }}>Ver más</button>
        </div>
      </div>
      {/* Key swatches */}
      <div className="tc-preview-swatches">
        {families.slice(0, 5).map((fam) => {
          const c = fam.tokens.find((t) => t.isKey)?.value ?? fam.tokens[0]?.value ?? '#888';
          return (
            <div key={fam.id} className="tc-preview-chip">
              <div className="tc-preview-chip-dot" style={{ background: c }} />
              <span style={{ color: textMuted }}>{fam.name.split('—')[0].trim().slice(0, 7)}</span>
            </div>
          );
        })}
      </div>
      {/* Mini card */}
      <div className="tc-preview-card" style={{ background: bgSecondarySurface, borderColor: `${firstKey}33` }}>
        <div className="tc-preview-card-icon" style={{ background: `${firstKey}22`, color: firstKey }}>⚡</div>
        <div>
          <p className="tc-preview-card-title" style={{ color: textPrimary }}>Track de IA</p>
          <p className="tc-preview-card-desc" style={{ color: textMuted }}>Crea soluciones con inteligencia artificial</p>
        </div>
        <span className="tc-preview-card-badge" style={{ background: `${secondKey}22`, color: thirdKey }}>Popular</span>
      </div>
      {/* Gradients */}
      <div className="tc-preview-gradients">
        <p style={{ fontSize: '0.7rem', margin: '0 0 0.5rem 0', color: textMuted }}>Degradados disponibles:</p>
        <div className="tc-preview-grad-list">
          {[
            { id: '--gradient-primary', label: 'Primario', value: primaryGrad },
            { id: '--gradient-secondary', label: 'Secundario', value: `linear-gradient(135deg, ${cSecondary} 0%, ${cAccent} 100%)` },
            { id: '--gradient-accent', label: 'Acento', value: accentGrad },
            { id: '--gradient-hero', label: 'Hero', value: heroGrad },
          ].map((g) => (
            <div key={g.id} className="tc-preview-grad-item" style={{ background: g.value }}>
              <span className="tc-preview-grad-name" style={{ color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                {g.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ThemeConfigurator() {
  const firestoreEnabled = isFirebaseConfigured();
  const { siteConfig, updateSiteConfig } = useSiteConfig();
  const [isOpen,   setIsOpen]   = useState(false);
  const [families, setFamilies] = useState<ColorFamily[]>(buildDefaultFamilies);
  const [sectionBaseColor, setSectionBaseColor] = useState(DEFAULT_SECTION_BASE_COLOR);
  const [sectionFilters, setSectionFilters] = useState<Record<SectionId, string>>(DEFAULT_SECTION_FILTERS);
  const [typography, setTypography] = useState<TypographyState>(DEFAULT_TYPOGRAPHY);
  const [localFonts, setLocalFonts] = useState<LocalFontsState>(EMPTY_LOCAL_FONTS);
  const [folderFonts, setFolderFonts] = useState<LocalFontAsset[]>([]);
  const [folderFontsLoaded, setFolderFontsLoaded] = useState(false);
  const [eventName, setEventName] = useState(siteConfig.name);
  const [particlesPalette, setParticlesPalette] = useState('');
  const [preview,   setPreview]   = useState(true);
  const [applied,   setApplied]   = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [savedCloud, setSavedCloud] = useState(false);
  const [savingCloud, setSavingCloud] = useState(false);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [fontError, setFontError] = useState<string | null>(null);
  const applyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const folderFontInputRef = useRef<HTMLInputElement>(null);

  // Update site config when eventName changes
  useEffect(() => {
    updateSiteConfig({ name: eventName });
  }, [eventName, updateSiteConfig]);

  // Initialize particles palette from existing CSS on mount
  useEffect(() => {
    try {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--particles-palette').trim();
      if (v) setParticlesPalette(v);
    } catch (e) {
      // ignore in SSR or environments without window
    }
  }, []);

  // ── Apply on every change ──────────────────────────────────────────────────
  useEffect(() => {
    applyToDOM(families, sectionBaseColor, sectionFilters, typography, localFonts, folderFonts, particlesPalette);
    setApplied(true);
    clearTimeout(applyTimer.current);
    applyTimer.current = setTimeout(() => setApplied(false), 1800);
  }, [families, sectionBaseColor, sectionFilters, typography, localFonts, folderFonts, particlesPalette]);
  

  // Re-apply when panel opens (tokens.css could have reset vars)
  useEffect(() => { if (isOpen) applyToDOM(families, sectionBaseColor, sectionFilters, typography, localFonts, folderFonts, particlesPalette); }, [isOpen, families, sectionBaseColor, sectionFilters, typography, localFonts, folderFonts, particlesPalette]);

  const loadFolderFonts = useCallback(async () => {
    try {
      const response = await fetch('/api/fonts/local', { cache: 'no-store' });
      if (!response.ok) {
        setFolderFonts([]);
        return [] as LocalFontAsset[];
      }
      const data = await response.json() as LocalFontsResponse;
      const fonts = Array.isArray(data.fonts) ? data.fonts : [];
      setFolderFonts(fonts);
      return fonts;
    } catch {
      setFolderFonts([]);
      return [] as LocalFontAsset[];
    } finally {
      setFolderFontsLoaded(true);
    }
  }, []);

  useEffect(() => {
    void loadFolderFonts();
  }, [loadFolderFonts]);

  useEffect(() => {
    if (!folderFontsLoaded) return;

    setTypography((prev) => {
      const resolveValidId = (slot: TypographySlot): string => {
        const selected = prev[slot];

        if (isGoogleFontId(selected)) {
          return selected;
        }

        if (selected === LOCAL_FONT_IDS[slot]) {
          return localFonts[slot] ? selected : DEFAULT_TYPOGRAPHY[slot];
        }

        if (folderFonts.some((font) => font.id === selected)) {
          return selected;
        }

        return DEFAULT_TYPOGRAPHY[slot];
      };

      const next = {
        primary: resolveValidId('primary'),
        subheading: resolveValidId('subheading'),
        heading: resolveValidId('heading'),
      };

      if (
        next.primary === prev.primary
        && next.subheading === prev.subheading
        && next.heading === prev.heading
      ) {
        return prev;
      }

      return next;
    });
  }, [folderFontsLoaded, folderFonts, localFonts]);

  // Load from Firestore once (if available)
  useEffect(() => {
    if (!firestoreEnabled) return;

    let active = true;
    const load = async () => {
      try {
        const snapshot = await loadThemeFromFirestore();
        if (!active || !snapshot) return;
        setFamilies(sanitizeFamilies(snapshot.families));
        setSectionBaseColor(snapshot.sectionBaseColor ?? DEFAULT_SECTION_BASE_COLOR);
        setSectionFilters({ ...DEFAULT_SECTION_FILTERS, ...(snapshot.sectionFilters ?? {}) });
        const loadedTypography = { ...DEFAULT_TYPOGRAPHY, ...(snapshot.typography ?? {}) };
        setTypography({
          primary: typeof loadedTypography.primary === 'string' && loadedTypography.primary.length > 0
            ? loadedTypography.primary
            : DEFAULT_TYPOGRAPHY.primary,
          subheading: typeof loadedTypography.subheading === 'string' && loadedTypography.subheading.length > 0
            ? loadedTypography.subheading
            : DEFAULT_TYPOGRAPHY.subheading,
          heading: typeof loadedTypography.heading === 'string' && loadedTypography.heading.length > 0
            ? loadedTypography.heading
            : DEFAULT_TYPOGRAPHY.heading,
        });
        setEventName(snapshot.eventName ?? 'GDL Innova Hackathon 2026 - A');
      } catch (error) {
        if (active) setCloudError(toFirebaseMessage(error, 'cargar'));
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [firestoreEnabled]);

  const patchTypography = useCallback((slot: keyof TypographyState, value: string) => {
    setFontError(null);
    setTypography((prev) => ({ ...prev, [slot]: value }));
  }, []);

  const handleLocalFontUpload = useCallback(async (file: File | null) => {
    if (!file) return;
    setFontError(null);

    const isAllowed = /\.(woff2|woff|ttf|otf)$/i.test(file.name);
    if (!isAllowed) {
      setFontError('Formato no soportado. Usa archivos .woff2, .woff, .ttf o .otf.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('font', file);

      const response = await fetch('/api/fonts/local', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json() as LocalFontUploadResponse;

      if (!response.ok || !data.font) {
        throw new Error(data.error ?? 'No se pudo guardar la fuente local en app/fonts/local.');
      }

      const refreshed = await loadFolderFonts();
      void refreshed;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo guardar la fuente local en app/fonts/local.';
      setFontError(message);
    }
  }, [loadFolderFonts]);

  // ── Reset / Save ───────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setFamilies(buildDefaultFamilies());
    setSectionBaseColor(DEFAULT_SECTION_BASE_COLOR);
    setSectionFilters(DEFAULT_SECTION_FILTERS);
    setTypography(DEFAULT_TYPOGRAPHY);
    setLocalFonts(EMPTY_LOCAL_FONTS);
    setFontError(null);
  }, []);

  const handleSave = useCallback(() => {
    const css = generateCSS(families, sectionBaseColor, sectionFilters, typography, localFonts, folderFonts, particlesPalette);
    const blob = new Blob([css], { type: 'text/css;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'tokens.css';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }, [families, sectionBaseColor, sectionFilters, typography, localFonts, folderFonts, particlesPalette]);

  const handleSaveCloud = useCallback(async () => {
    setCloudError(null);
    setSavingCloud(true);
    try {
      await saveThemeToFirestore({ families, gradients: buildDefaultGradients(), sectionBaseColor, sectionFilters, typography, eventName });
      setSavedCloud(true);
      setTimeout(() => setSavedCloud(false), 3000);
    } catch (error) {
      setCloudError(toFirebaseMessage(error, 'guardar'));
    } finally {
      setSavingCloud(false);
    }
  }, [families, sectionBaseColor, sectionFilters, typography, eventName]);

  const findTokenValue = useCallback((variable: string, fallback: string) => {
    for (const family of families) {
      const found = family.tokens.find((token) => token.variable === variable);
      if (found) return found.value;
    }
    return fallback;
  }, [families]);

  const setTokenValue = useCallback((variable: string, value: string) => {
    const nextValue = toRgbHex(value) ?? value;

    const scaleMap: Record<string, string[] | undefined> = {
      '--color-cyan-400': ['--color-cyan-100', '--color-cyan-200', '--color-cyan-300', '--color-cyan-400', '--color-cyan-500', '--color-cyan-600'],
      '--color-purple-400': ['--color-purple-100', '--color-purple-200', '--color-purple-300', '--color-purple-400', '--color-purple-500', '--color-purple-600'],
      '--color-pink-400': ['--color-pink-100', '--color-pink-200', '--color-pink-300', '--color-pink-400', '--color-pink-500', '--color-pink-600'],
    };

    const affected = scaleMap[variable];
    if (!affected) {
      setFamilies((prev) => prev.map((family) => ({
        ...family,
        tokens: family.tokens.map((token) => token.variable === variable ? { ...token, value: nextValue } : token),
      })));
      return;
    }

    const scale = deriveScale(nextValue);
    const scaleValueByVar: Record<string, string> = {
      [affected[0]]: scale[100],
      [affected[1]]: scale[200],
      [affected[2]]: scale[300],
      [affected[3]]: scale[400],
      [affected[4]]: scale[500],
      [affected[5]]: scale[600],
    };

    setFamilies((prev) => prev.map((family) => ({
      ...family,
      tokens: family.tokens.map((token) => scaleValueByVar[token.variable] ? { ...token, value: scaleValueByVar[token.variable] } : token),
    })));
  }, []);

  const colorPrimary = findTokenValue('--color-cyan-400', '#009e9a');
  const colorSecondary = findTokenValue('--color-purple-400', '#5b2eff');
  const colorAccent = findTokenValue('--color-pink-400', '#ed1e79');
  const textPrimary = findTokenValue('--text-primary', '#ffffff');
  const textSecondary = findTokenValue('--text-secondary', '#e4e7f8');
  const textMuted = findTokenValue('--text-muted', '#94a3b8');

  const sharedSectionFilter = (() => {
    const current = SECTION_OPTIONS.map(({ id }) => sectionFilters[id]);
    return current.every((value) => value === current[0]) ? current[0] : 'custom';
  })();

  return (
    <>
      {/* Trigger */}
      <button className="tc-trigger" onClick={() => setIsOpen(true)} aria-label="Abrir configurador del sitio">
        <span style={{ fontSize: '1.2rem' }}>🎨</span>
        <span className="tc-trigger-lbl">Personalizar</span>
      </button>

      {/* Backdrop */}
      {isOpen && <div className="tc-backdrop" onClick={() => setIsOpen(false)} aria-hidden />}

      {/* Panel */}
      <aside className={`tc-panel${isOpen ? ' tc-panel--open' : ''}`} aria-label="Configurador de paleta">

        {/* Header */}
        <div className="tc-header">
          <div className="tc-header-left">
            <span style={{ fontSize: '1.65rem' }}>🎨</span>
            <div>
              <h2 className="tc-header-title">Personalización del Sitio</h2>
              <p className="tc-header-sub">Diseña tu sistema cromático y configura el evento</p>
              <span className="tc-mode-chip tc-mode-chip--header">🧭 Modo simple (variaciones básicas)</span>
            </div>
          </div>
          <div className="tc-header-right">
            {applied && <span className="tc-applied-badge">✓ Aplicado</span>}
            <button className="tc-close" onClick={() => setIsOpen(false)} aria-label="Cerrar">✕</button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="tc-toolbar">
          <button className={`tc-tool${preview  ? ' tc-tool--on' : ''}`} onClick={() => setPreview((v) => !v)}>
            👁 Vista previa
          </button>
          <span className="tc-tool tc-tool--on" title="El configurador está simplificado para variables base">
            ✅ Solo variables base
          </span>
        </div>

        {/* Preview */}
        {preview && <LivePreview families={families} />}

        <div className="tc-content">
          <section className="tc-section tc-simple-shell">
              <p className="tc-section-desc">
                Configuración simplificada y conectada al tema global: <strong>colores clave, texto, fondo y tipografía</strong>.
              </p>

              <div className="tc-simple-grad-map">
                <h3>Mapa claro de degradados</h3>
                <p><strong>--gradient-primary</strong>: títulos destacados y botón principal.</p>
                <p><strong>--gradient-secondary</strong>: botón secundario y llamadas de alto contraste.</p>
                <p><strong>--gradient-accent</strong>: badges/píldoras y detalles pequeños.</p>
                <p><strong>--gradient-hero</strong>: fondo de la sección principal (hero).</p>
              </div>

              <div className="tc-simple-grid">
                <label className="tc-select-field">
                  <span>Color primario</span>
                  <div className="tc-color-inline">
                    <input type="color" value={toColorPickerHex(colorPrimary)} onChange={(event) => setTokenValue('--color-cyan-400', event.target.value)} className="tc-color-input" aria-label="Color primario" />
                    <HexInput value={colorPrimary} onCommit={(value) => setTokenValue('--color-cyan-400', value)} className="tc-token-hex-input" ariaLabel="Color primario hexadecimal" />
                  </div>
                </label>
                <label className="tc-select-field">
                  <span>Color secundario</span>
                  <div className="tc-color-inline">
                    <input type="color" value={toColorPickerHex(colorSecondary)} onChange={(event) => setTokenValue('--color-purple-400', event.target.value)} className="tc-color-input" aria-label="Color secundario" />
                    <HexInput value={colorSecondary} onCommit={(value) => setTokenValue('--color-purple-400', value)} className="tc-token-hex-input" ariaLabel="Color secundario hexadecimal" />
                  </div>
                </label>
                <label className="tc-select-field">
                  <span>Color acento</span>
                  <div className="tc-color-inline">
                    <input type="color" value={toColorPickerHex(colorAccent)} onChange={(event) => setTokenValue('--color-pink-400', event.target.value)} className="tc-color-input" aria-label="Color acento" />
                    <HexInput value={colorAccent} onCommit={(value) => setTokenValue('--color-pink-400', value)} className="tc-token-hex-input" ariaLabel="Color acento hexadecimal" />
                  </div>
                </label>

                <label className="tc-select-field">
                  <span>Texto principal</span>
                  <div className="tc-color-inline">
                    <input type="color" value={toColorPickerHex(textPrimary)} onChange={(event) => setTokenValue('--text-primary', event.target.value)} className="tc-color-input" aria-label="Texto principal" />
                    <HexInput value={textPrimary} onCommit={(value) => setTokenValue('--text-primary', value)} className="tc-token-hex-input" ariaLabel="Texto principal hexadecimal" />
                  </div>
                </label>
                <label className="tc-select-field">
                  <span>Texto secundario</span>
                  <div className="tc-color-inline">
                    <input type="color" value={toColorPickerHex(textSecondary)} onChange={(event) => setTokenValue('--text-secondary', event.target.value)} className="tc-color-input" aria-label="Texto secundario" />
                    <HexInput value={textSecondary} onCommit={(value) => setTokenValue('--text-secondary', value)} className="tc-token-hex-input" ariaLabel="Texto secundario hexadecimal" />
                  </div>
                </label>
                <label className="tc-select-field">
                  <span>Texto auxiliar</span>
                  <div className="tc-color-inline">
                    <input type="color" value={toColorPickerHex(textMuted)} onChange={(event) => setTokenValue('--text-muted', event.target.value)} className="tc-color-input" aria-label="Texto auxiliar" />
                    <HexInput value={textMuted} onCommit={(value) => setTokenValue('--text-muted', value)} className="tc-token-hex-input" ariaLabel="Texto auxiliar hexadecimal" />
                  </div>
                </label>

                <label className="tc-select-field">
                  <span>Fondo global</span>
                  <div className="tc-color-inline">
                    <input type="color" value={toColorPickerHex(sectionBaseColor)} onChange={(event) => setSectionBaseColor(event.target.value)} className="tc-color-input" aria-label="Fondo global" />
                    <HexInput value={sectionBaseColor} onCommit={(value) => setSectionBaseColor(value)} className="tc-token-hex-input" ariaLabel="Fondo global hexadecimal" />
                  </div>
                </label>

                <label className="tc-select-field">
                  <span>Efecto visual global</span>
                  <select
                    value={sharedSectionFilter}
                    onChange={(event) => {
                      const selected = event.target.value;
                      if (selected === 'custom') return;
                      const next = Object.fromEntries(SECTION_OPTIONS.map(({ id }) => [id, selected])) as Record<SectionId, string>;
                      setSectionFilters(next);
                    }}
                    className="tc-select"
                  >
                    <option value="custom">Personalizado por sección</option>
                    {SECTION_FILTER_PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.id}>{preset.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="tc-simple-typography">
                <h3>Tipografía</h3>
                <div className="tc-upload-row">
                  <input
                    ref={folderFontInputRef}
                    type="file"
                    accept=".woff2,.woff,.ttf,.otf"
                    className="tc-hidden-file"
                    onChange={(event) => {
                      void handleLocalFontUpload(event.target.files?.[0] ?? null);
                      event.target.value = '';
                    }}
                  />
                  <button className="tc-upload-btn" onClick={() => folderFontInputRef.current?.click()}>
                    📁 Subir local
                  </button>
                </div>
                <div className="tc-grid-settings">
                  <label className="tc-select-field">
                    <span>Texto general</span>
                    <select value={typography.primary} onChange={(event) => patchTypography('primary', event.target.value)} className="tc-select">
                      {folderFonts.length > 0 && (
                        <optgroup label="Fonts/local">
                          {folderFonts.map((font) => <option key={font.id} value={font.id}>Local: {font.label}</option>)}
                        </optgroup>
                      )}
                      {GOOGLE_FONT_OPTIONS.map((font) => <option key={font.id} value={font.id}>{font.label}</option>)}
                    </select>
                  </label>
                  <label className="tc-select-field">
                    <span>Subtítulos</span>
                    <select value={typography.subheading} onChange={(event) => patchTypography('subheading', event.target.value)} className="tc-select">
                      {folderFonts.length > 0 && (
                        <optgroup label="Fonts/local">
                          {folderFonts.map((font) => <option key={font.id} value={font.id}>Local: {font.label}</option>)}
                        </optgroup>
                      )}
                      {GOOGLE_FONT_OPTIONS.map((font) => <option key={font.id} value={font.id}>{font.label}</option>)}
                    </select>
                  </label>
                  <label className="tc-select-field">
                    <span>Fuente de títulos</span>
                    <select value={typography.heading} onChange={(event) => patchTypography('heading', event.target.value)} className="tc-select">
                      {folderFonts.length > 0 && (
                        <optgroup label="Fonts/local">
                          {folderFonts.map((font) => <option key={font.id} value={font.id}>Local: {font.label}</option>)}
                        </optgroup>
                      )}
                      {GOOGLE_FONT_OPTIONS.map((font) => <option key={font.id} value={font.id}>{font.label}</option>)}
                    </select>
                  </label>
                </div>
              </div>

              <div className="tc-typo-preview">
                <p style={{ fontFamily: buildFontStack(resolveFontBySlot('heading', typography, localFonts, folderFonts)) }}>Título de ejemplo: {eventName}</p>
                <p style={{ fontFamily: buildFontStack(resolveFontBySlot('subheading', typography, localFonts, folderFonts)) }}>Subtítulo de ejemplo: Configuración tipográfica</p>
                <p style={{ fontFamily: buildFontStack(resolveFontBySlot('primary', typography, localFonts, folderFonts)) }}>
                  Texto base de ejemplo para verificar lectura y personalidad visual.
                </p>
              </div>
              {fontError && <p className="tc-font-error">{fontError}</p>}
            </section>
        </div>

        {/* Footer */}
        <div className="tc-footer">
          <button className="tc-btn-reset" onClick={handleReset} title="Restaurar paleta original">↺ Restaurar</button>
          <button
            className="tc-btn-apply"
            onClick={() => applyToDOM(families, sectionBaseColor, sectionFilters, typography, localFonts, folderFonts, particlesPalette)}
            title="Aplicar colores al sitio ahora"
          >
            ▶ Aplicar
          </button>
          {firestoreEnabled && (
            <button
              className={`tc-btn-cloud${savedCloud ? ' tc-btn-cloud--ok' : ''}`}
              onClick={handleSaveCloud}
              disabled={savingCloud}
              title="Guardar tema en Firestore"
            >
              {savingCloud ? '⏳ Guardando...' : savedCloud ? '✓ Guardado nube' : '☁ Guardar nube'}
            </button>
          )}
          <button className={`tc-btn-save${saved ? ' tc-btn-save--ok' : ''}`} onClick={handleSave}>
            {saved ? '✓ ¡Descargado!' : '⬇ Guardar CSS'}
          </button>
        </div>
        {!firestoreEnabled && (
          <div className="tc-save-hint">
            Firebase no configurado — define variables <code>NEXT_PUBLIC_FIREBASE_*</code> para habilitar Firestore.
          </div>
        )}
        {cloudError && (
          <div className="tc-save-hint tc-save-hint--error">{cloudError}</div>
        )}
        {saved && (
          <div className="tc-save-hint">
            <strong>tokens.css</strong> descargado — reemplaza&nbsp;
            <code>styles/theme/tokens.css</code> para aplicar definitivamente.
          </div>
        )}
      </aside>

      <style>{CSS}</style>
    </>
  );
}

// ─── Inline styles ────────────────────────────────────────────────────────────

const CSS = `
.tc-trigger {
  position:fixed; bottom:2rem; right:2rem; z-index:9000;
  display:flex; align-items:center; gap:.5rem;
  padding:.7rem 1.2rem; border:none; border-radius:9999px;
  background:linear-gradient(135deg,var(--color-purple-400),var(--color-cyan-400));
  color:#fff; font-size:.9rem; font-weight:700; cursor:pointer;
  box-shadow:0 4px 24px color-mix(in srgb, var(--color-purple-400) 45%, transparent),0 0 0 2px rgba(255,255,255,.08);
  transition:transform 220ms cubic-bezier(.34,1.56,.64,1),box-shadow 200ms;
}
.tc-trigger:hover{transform:scale(1.06) translateY(-2px);box-shadow:0 8px 32px color-mix(in srgb, var(--color-purple-400) 60%, transparent);}
.tc-trigger-lbl{font-size:.85rem;}

.tc-backdrop{
  position:fixed;inset:0;z-index:9010;
  background:rgba(0,0,0,.55);backdrop-filter:blur(4px);
  animation:tcFade 200ms ease;
}
@keyframes tcFade{from{opacity:0}to{opacity:1}}

.tc-panel{
  position:fixed;top:0;right:0;z-index:9020;
  width:min(620px,100vw);height:100dvh;
  display:flex;flex-direction:column;
  background:#0d0d1f;
  border-left:1px solid rgba(255,255,255,.08);
  box-shadow:-8px 0 48px rgba(0,0,0,.7);
  transform:translateX(100%);
  transition:transform 340ms cubic-bezier(.23,1,.32,1);
  overflow:hidden;
}
.tc-panel--open{transform:translateX(0);}

.tc-header{
  display:flex;align-items:center;justify-content:space-between;
  padding:1rem 1.25rem;flex-shrink:0;
  background:linear-gradient(135deg,color-mix(in srgb, var(--color-purple-400) 20%, transparent),color-mix(in srgb, var(--color-cyan-400) 12%, transparent));
  border-bottom:1px solid rgba(255,255,255,.07);
}
.tc-header-left{display:flex;align-items:center;gap:.65rem;}
.tc-header-right{display:flex;align-items:center;gap:.5rem;}
.tc-header-title{color:#fff;font-size:1rem;font-weight:800;margin:0;}
.tc-header-sub{color:#a5f3fc;font-size:.72rem;margin:0;}
.tc-applied-badge{
  font-size:.68rem;font-weight:700;color:#10b981;
  background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.3);
  padding:.18rem .5rem;border-radius:9999px;animation:tcFade 200ms ease;
}
.tc-close{
  width:1.8rem;height:1.8rem;border:none;border-radius:50%;
  background:rgba(255,255,255,.07);color:#94a3b8;font-size:.9rem;
  cursor:pointer;transition:all 150ms;
}
.tc-close:hover{background:rgba(255,255,255,.15);color:#fff;}

.tc-toolbar{
  display:flex;gap:.5rem;padding:.5rem 1.25rem;flex-shrink:0;
  flex-wrap:wrap;
  border-bottom:1px solid rgba(255,255,255,.05);
}
.tc-mode-chip{
  display:inline-flex;
  align-items:center;
  border:1px solid rgba(255,255,255,.12);
  border-radius:9999px;
  padding:.24rem .62rem;
  font-size:.7rem;
  color:#cbd5e1;
  background:rgba(255,255,255,.03);
}
.tc-mode-chip--header{margin-top:.3rem;}
.tc-tool{
  background:transparent;border:1px solid rgba(255,255,255,.1);
  color:#64748b;border-radius:6px;padding:.28rem .65rem;
  font-size:.72rem;font-weight:600;cursor:pointer;transition:all 150ms;
}
.tc-tool:hover{color:#cbd5e1;border-color:rgba(255,255,255,.2);}
.tc-tool--on{color:#a5f3fc;border-color:rgba(0,242,254,.35);background:rgba(0,242,254,.06);}

/* preview */
.tc-preview-root{
  margin:.55rem 1.25rem;border-radius:12px;overflow:hidden;
  border:1px solid rgba(255,255,255,.07);flex-shrink:0;
}
.tc-preview-hero{
  padding:.8rem 1rem .55rem;
  display:flex;flex-direction:column;gap:.3rem;
}
.tc-preview-badge{
  display:inline-block;align-self:flex-start;
  padding:.17rem .5rem;border-radius:9999px;
  font-size:.6rem;font-weight:800;letter-spacing:.1em;
}
.tc-preview-title{font-size:1.25rem;font-weight:900;margin:0;font-family:var(--font-heading,monospace);}
.tc-preview-btns{display:flex;gap:.45rem;margin-top:.2rem;}
.tc-preview-btn-solid{padding:.3rem .75rem;border:none;border-radius:9999px;font-size:.68rem;font-weight:700;cursor:default;}
.tc-preview-btn-ghost{padding:.26rem .7rem;border:1.5px solid;border-radius:9999px;background:transparent;font-size:.68rem;font-weight:700;cursor:default;}
.tc-preview-swatches{
  display:flex;gap:.3rem;flex-wrap:wrap;
  padding:.45rem 1rem;background:rgba(255,255,255,.02);
  border-top:1px solid rgba(255,255,255,.04);
}
.tc-preview-chip{display:flex;flex-direction:column;align-items:center;gap:.15rem;}
.tc-preview-chip-dot{width:1.25rem;height:1.25rem;border-radius:50%;border:1.5px solid rgba(255,255,255,.15);}
.tc-preview-chip span{font-size:.52rem;}
.tc-preview-card{
  display:flex;align-items:center;gap:.55rem;
  margin:0 1rem .7rem;padding:.5rem .65rem;border-radius:10px;border:1px solid;
}
.tc-preview-card-icon{width:1.9rem;height:1.9rem;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:.95rem;flex-shrink:0;}
.tc-preview-card-title{font-size:.76rem;font-weight:700;margin:0;}
.tc-preview-card-desc{font-size:.64rem;margin:.06rem 0 0;}
.tc-preview-card-badge{margin-left:auto;flex-shrink:0;padding:.15rem .42rem;border-radius:9999px;font-size:.58rem;font-weight:700;}

/* content */
.tc-content{
  flex:1 1 0;overflow-y:auto;padding:0 1.25rem .5rem;
  scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.1) transparent;
}
.tc-content::-webkit-scrollbar{width:4px;}
.tc-content::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:9999px;}
.tc-section{padding-top:.85rem;}
.tc-section-desc{
  font-size:.74rem;color:#64748b;line-height:1.55;margin:0 0 .85rem;
  padding:.5rem .7rem;
  background:rgba(255,255,255,.03);
  border-left:3px solid rgba(0,242,254,.35);border-radius:0 6px 6px 0;
}
.tc-section-desc strong{color:#a5f3fc;}
.tc-empty{text-align:center;color:#475569;font-size:.78rem;padding:1.5rem 0;}
.tc-simple-shell{
  display:flex;
  flex-direction:column;
  gap:.9rem;
}
.tc-simple-grid{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:.65rem;
}
.tc-simple-grad-map{
  border:1px solid rgba(255,255,255,.09);
  border-radius:10px;
  padding:.65rem;
  background:rgba(255,255,255,.02);
}
.tc-simple-grad-map h3{
  margin:0 0 .45rem;
  color:#cbd5e1;
  font-size:.8rem;
  font-weight:700;
}
.tc-simple-grad-map p{
  margin:.2rem 0;
  color:#94a3b8;
  font-size:.71rem;
  line-height:1.45;
}
.tc-simple-typography{
  margin-top:.2rem;
  border:1px solid rgba(255,255,255,.09);
  border-radius:10px;
  padding:.65rem;
  background:rgba(255,255,255,.02);
}
.tc-simple-typography h3{
  margin:0 0 .55rem;
  color:#cbd5e1;
  font-size:.8rem;
  font-weight:700;
}
.tc-grid-settings{
  display:grid;
  gap:.65rem;
  grid-template-columns:1fr;
}
.tc-select-field{
  display:flex;
  flex-direction:column;
  gap:.3rem;
}
.tc-select-field span{
  color:#94a3b8;
  font-size:.72rem;
  font-weight:600;
}
.tc-select{
  width:100%;
  background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.12);
  border-radius:8px;
  color:#e2e8f0;
  font-size:.74rem;
  padding:.45rem .55rem;
}
.tc-select option{background:#0d0d1f;color:#e2e8f0;}
.tc-select:focus{outline:none;border-color:rgba(0,242,254,.35);}
.tc-hidden-file{display:none;}
.tc-upload-row{display:flex;gap:.35rem;flex-wrap:wrap;align-items:center;}
.tc-upload-btn,
.tc-upload-remove{
  border-radius:7px;
  border:1px solid rgba(255,255,255,.14);
  background:rgba(255,255,255,.04);
  color:#cbd5e1;
  font-size:.67rem;
  font-weight:700;
  padding:.26rem .52rem;
  cursor:pointer;
}
.tc-upload-btn:hover{border-color:rgba(0,242,254,.35);color:#a5f3fc;}
.tc-upload-remove{border-color:rgba(239,68,68,.28);color:#fca5a5;}
.tc-upload-remove:hover{background:rgba(239,68,68,.12);}
.tc-color-inline{display:flex;gap:.45rem;align-items:center;}
.tc-color-input{
  width:2.4rem;
  height:2rem;
  border:none;
  border-radius:6px;
  padding:0;
  background:transparent;
  cursor:pointer;
}
.tc-typo-preview{
  margin-top:.8rem;
  padding:.7rem;
  border:1px solid rgba(255,255,255,.08);
  border-radius:10px;
  background:rgba(255,255,255,.02);
}
.tc-typo-preview p{margin:.2rem 0;color:#cbd5e1;font-size:.82rem;}
.tc-typo-preview p:first-child{font-size:1rem;font-weight:700;}
.tc-font-error{margin:.55rem 0 0;color:#fca5a5;font-size:.68rem;}
.tc-token-hex-input{
  width:100%; background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.08);
  border-radius:5px; color:#94a3b8; font-size:.65rem; font-family:monospace;
  padding:.18rem .38rem; box-sizing:border-box;
}
.tc-token-hex-input:focus{outline:none;border-color:rgba(0,242,254,.3);color:#e2e8f0;}

/* footer */
.tc-footer{
  display:flex;gap:.45rem;
  flex-wrap:wrap;
  padding:.8rem 1.25rem;border-top:1px solid rgba(255,255,255,.07);flex-shrink:0;
}
.tc-btn-reset{
  padding:.55rem .85rem;border-radius:8px;
  border:1px solid rgba(255,255,255,.1);background:transparent;
  color:#64748b;font-size:.76rem;font-weight:700;cursor:pointer;transition:all 150ms;
}
.tc-btn-reset:hover{border-color:rgba(255,255,255,.22);color:#cbd5e1;}
.tc-btn-apply{
  padding:.55rem .85rem;border-radius:8px;
  border:1px solid rgba(0,242,254,.3);background:rgba(0,242,254,.07);
  color:#a5f3fc;font-size:.76rem;font-weight:700;cursor:pointer;transition:all 150ms;
}
.tc-btn-apply:hover{background:rgba(0,242,254,.15);border-color:rgba(0,242,254,.5);color:#fff;}
.tc-btn-save{
  flex:1;padding:.55rem .85rem;border-radius:8px;border:none;
  background:linear-gradient(135deg,var(--color-purple-400),var(--color-cyan-400));
  color:#fff;font-size:.8rem;font-weight:800;cursor:pointer;
  box-shadow:0 2px 14px color-mix(in srgb, var(--color-purple-400) 30%, transparent);transition:all 200ms;
}
.tc-btn-save:hover{transform:translateY(-1px);box-shadow:0 4px 22px color-mix(in srgb, var(--color-purple-400) 50%, transparent);}
.tc-btn-save--ok{background:linear-gradient(135deg,#059669,#10b981);}
.tc-btn-cloud{
  padding:.55rem .9rem;border:none;border-radius:8px;
  background:linear-gradient(135deg,color-mix(in srgb, var(--color-purple-400) 86%, black),var(--color-cyan-400));
  color:#fff;font-size:.76rem;font-weight:700;cursor:pointer;
  transition:transform 150ms,box-shadow 150ms;
}
.tc-btn-cloud:hover{transform:translateY(-1px);box-shadow:0 4px 20px color-mix(in srgb, color-mix(in srgb, var(--color-purple-400) 86%, black) 45%, transparent);}
.tc-btn-cloud:disabled{opacity:.65;cursor:not-allowed;transform:none;box-shadow:none;}
.tc-btn-cloud--ok{background:linear-gradient(135deg,#047857,#10b981);}
.tc-save-hint{
  padding:.55rem 1.25rem;font-size:.7rem;color:#a5f3fc;
  background:rgba(5,150,105,.1);border-top:1px solid rgba(5,150,105,.18);
  flex-shrink:0;animation:tcFade 300ms ease;
}
.tc-save-hint--error{color:#fca5a5;background:rgba(239,68,68,.08);border-top-color:rgba(239,68,68,.24);}
.tc-save-hint code{font-family:monospace;background:rgba(255,255,255,.08);padding:.03rem .26rem;border-radius:4px;}

.tc-preview-gradients{margin-top:.8rem;}
.tc-preview-grad-list{display:flex;flex-wrap:wrap;gap:.3rem;}
.tc-preview-grad-item{
  width:min(100%,5.8rem);min-height:1.9rem;border-radius:4px;display:flex;align-items:center;justify-content:center;
  padding:.12rem .24rem;text-align:center;line-height:1.05;border:1px solid rgba(255,255,255,.1);
}
.tc-preview-grad-name{
  font-size:.54rem;display:block;max-width:100%;overflow-wrap:anywhere;word-break:break-word;
}

@media(max-width:480px){
  .tc-panel{width:100vw;}
  .tc-header{padding:.8rem .9rem;}
  .tc-toolbar{padding:.45rem .9rem;}
  .tc-content{padding:0 .9rem .5rem;}
  .tc-preview-root{margin:.5rem .9rem;}
  .tc-simple-grid{grid-template-columns:1fr;}
  .tc-footer{padding:.7rem .9rem;gap:.4rem;}
  .tc-btn-reset,.tc-btn-apply,.tc-btn-cloud,.tc-btn-save{flex:1 1 calc(50% - .2rem);min-width:0;}
  .tc-btn-save{width:100%;}
  .tc-save-hint{padding:.5rem .9rem;}
  .tc-typo-preview p:first-child{font-size:.92rem;}
  .tc-trigger-lbl{display:none;}
  .tc-trigger{padding:.75rem;border-radius:50%;}
  .tc-preview-grad-list{flex-direction:column;}
  .tc-preview-grad-item{width:100%;height:1.5rem;}
}

@media(min-width:481px) and (max-width:860px){
  .tc-panel{width:min(760px,100vw);}
  .tc-simple-grid{grid-template-columns:repeat(2,minmax(0,1fr));}
  .tc-grid-settings{grid-template-columns:repeat(2,minmax(0,1fr));}
  .tc-select-field:first-child{grid-column:1/-1;}
  .tc-footer{gap:.5rem;}
  .tc-btn-save{flex:1 0 100%;}
}
`;

