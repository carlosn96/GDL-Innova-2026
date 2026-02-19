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
  newGradient,
  stopsToCSS,
  type ColorToken,
  type ColorFamily,
  type GradientToken,
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
  { id: 'cyan-mist', label: 'Neblina primaria', overlay: 'radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--color-cyan-400) 20%, transparent) 0%, transparent 65%)' },
  { id: 'purple-glow', label: 'Brillo secundario', overlay: 'radial-gradient(circle at 80% 30%, color-mix(in srgb, var(--color-purple-400) 24%, transparent) 0%, transparent 60%)' },
  { id: 'pink-beam', label: 'Haz de acento', overlay: 'linear-gradient(135deg, color-mix(in srgb, var(--color-pink-400) 16%, transparent) 0%, transparent 60%)' },
  { id: 'aurora', label: 'Aurora', overlay: 'linear-gradient(120deg, color-mix(in srgb, var(--color-cyan-400) 14%, transparent) 0%, color-mix(in srgb, var(--color-purple-400) 14%, transparent) 55%, color-mix(in srgb, var(--color-pink-400) 12%, transparent) 100%)' },
  { id: 'vignette', label: 'Viñeta suave', overlay: 'radial-gradient(circle at center, transparent 45%, color-mix(in srgb, var(--bg-dark-primary) 62%, transparent) 100%)' },
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

const THEME_DRAFT_STORAGE_KEY = 'gdlinova-theme-draft-v1';
const GRADIENT_TOKEN_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'var(--color-cyan-400)', label: 'Color base primario' },
  { value: 'var(--color-purple-400)', label: 'Color base secundario' },
  { value: 'var(--color-pink-400)', label: 'Color base de acento' },
  { value: 'var(--bg-dark-primary)', label: 'Fondo oscuro primario' },
  { value: 'var(--bg-dark-secondary)', label: 'Fondo oscuro secundario' },
  { value: 'var(--bg-dark-tertiary)', label: 'Fondo oscuro terciario' },
];

const ALLOWED_GRADIENT_TOKEN_VALUES = new Set(GRADIENT_TOKEN_OPTIONS.map((option) => option.value));

const DEV_GRADIENT_PREFIX = 'gradient:';
const DEFAULT_GRADIENT_VARIABLES = new Set([
  '--gradient-primary',
  '--gradient-secondary',
  '--gradient-accent',
  '--gradient-hero',
]);

type DevTextRole = 'title' | 'subtitle' | 'body' | 'caption' | 'custom';

interface DevElementConfig {
  selector: string;
  textRole: DevTextRole;
  colorToken: string;
  fontToken: string;
  updatedAt: number;
}

const DEV_COLOR_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Sin cambio de color' },
  { value: '--color-cyan-400', label: 'Color base primario' },
  { value: '--color-purple-400', label: 'Color base secundario' },
  { value: '--color-pink-400', label: 'Color base de acento' },
  { value: '--bg-dark-secondary', label: 'Fondo base' },
  { value: '--text-primary', label: 'Texto principal' },
  { value: '--text-secondary', label: 'Texto secundario' },
  { value: '--text-muted', label: 'Texto auxiliar' },
];

const DEV_FONT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Sin cambio de fuente' },
  { value: '--font-heading', label: 'Fuente de título' },
  { value: '--font-subheading', label: 'Fuente de subtítulo' },
  { value: '--font-primary', label: 'Fuente de texto general' },
];

const DEV_ROLE_OPTIONS: Array<{ value: DevTextRole; label: string }> = [
  { value: 'title', label: 'Título' },
  { value: 'subtitle', label: 'Subtítulo' },
  { value: 'body', label: 'Texto general' },
  { value: 'caption', label: 'Texto auxiliar' },
  { value: 'custom', label: 'Personalizado' },
];

const DEV_ROLE_DEFAULTS: Record<Exclude<DevTextRole, 'custom'>, { colorToken: string; fontToken: string }> = {
  title: { colorToken: '--color-cyan-400', fontToken: '--font-heading' },
  subtitle: { colorToken: '--color-purple-400', fontToken: '--font-subheading' },
  body: { colorToken: '--text-secondary', fontToken: '--font-primary' },
  caption: { colorToken: '--text-muted', fontToken: '--font-primary' },
};

type ActiveTab = 'colors' | 'gradients' | 'typography' | 'dev';

interface ThemeDraftSnapshot {
  families: ColorFamily[];
  gradients: GradientToken[];
  sectionBaseColor: string;
  sectionFilters: Record<SectionId, string>;
  typography: TypographyState;
  eventName: string;
  particlesPalette: string;
  devElements: Record<string, DevElementConfig>;
}

function isDevTextRole(value: string): value is DevTextRole {
  return value === 'title' || value === 'subtitle' || value === 'body' || value === 'caption' || value === 'custom';
}

function sanitizeDevElements(input: unknown): Record<string, DevElementConfig> {
  if (!input || typeof input !== 'object') return {};

  const next: Record<string, DevElementConfig> = {};
  Object.entries(input as Record<string, unknown>).forEach(([key, value]) => {
    if (!value || typeof value !== 'object') return;
    const raw = value as Partial<DevElementConfig>;
    if (typeof raw.selector !== 'string' || raw.selector.trim().length === 0) return;

    const textRole = typeof raw.textRole === 'string' && isDevTextRole(raw.textRole) ? raw.textRole : 'custom';
    const colorToken = typeof raw.colorToken === 'string' ? raw.colorToken : '';
    const fontToken = typeof raw.fontToken === 'string' ? raw.fontToken : '';

    next[key] = {
      selector: raw.selector,
      textRole,
      colorToken,
      fontToken,
      updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : Date.now(),
    };
  });

  return next;
}

function detectRoleFromElement(element: HTMLElement): DevTextRole {
  const tag = element.tagName.toLowerCase();
  if (tag === 'h1' || tag === 'h2' || tag === 'h3') return 'title';
  if (tag === 'h4' || tag === 'h5' || tag === 'h6' || tag === 'label') return 'subtitle';
  if (tag === 'small' || tag === 'caption') return 'caption';
  return 'body';
}

function escapeSelectorId(value: string): string {
  return value.replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~\s])/g, '\\$1');
}

function buildElementSelector(element: HTMLElement): string {
  if (element.id) {
    return `#${escapeSelectorId(element.id)}`;
  }

  const segments: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current.tagName.toLowerCase() !== 'body') {
    const tag = current.tagName.toLowerCase();
    const parent = current.parentElement as HTMLElement | null;

    if (!parent) {
      segments.unshift(tag);
      break;
    }

    let sameTagCount = 0;
    let index = 1;
    for (let i = 0; i < parent.children.length; i += 1) {
      const sibling = parent.children.item(i);
      if (!sibling || sibling.tagName !== current.tagName) continue;
      sameTagCount += 1;
      if (sibling === current) {
        index = sameTagCount;
        break;
      }
    }

    segments.unshift(`${tag}:nth-of-type(${index})`);

    if (parent.id) {
      segments.unshift(`#${escapeSelectorId(parent.id)}`);
      break;
    }

    current = parent;
    if (segments.length >= 10) break;
  }

  return segments.join(' > ');
}

function normalizeEditableTarget(target: HTMLElement): HTMLElement {
  let current: HTMLElement | null = target;
  while (current) {
    if (current.closest('.tc-panel') || current.closest('.tc-trigger') || current.closest('.tc-backdrop') || current.closest('.tc-dev-widget')) {
      break;
    }

    const tag = current.tagName.toLowerCase();
    if (tag !== 'html' && tag !== 'body' && tag !== 'main') {
      return current;
    }

    current = current.parentElement;
  }

  return target;
}

function applyDevElementToDOM(config: DevElementConfig) {
  const element = document.querySelector(config.selector);
  if (!(element instanceof HTMLElement)) return;

  element.style.removeProperty('-webkit-text-fill-color');
  element.style.removeProperty('-webkit-background-clip');
  element.style.removeProperty('background-clip');

  const isGradientSelection = config.colorToken.startsWith(DEV_GRADIENT_PREFIX);
  const gradientVariable = isGradientSelection ? config.colorToken.replace(DEV_GRADIENT_PREFIX, '') : '';
  const tag = element.tagName.toLowerCase();
  const textLikeElement = /^(h[1-6]|p|span|a|li|label|small|strong|em|button)$/.test(tag);

  if (isGradientSelection && gradientVariable) {
    if (textLikeElement) {
      element.style.setProperty('background-image', `var(${gradientVariable})`);
      element.style.setProperty('-webkit-background-clip', 'text');
      element.style.setProperty('background-clip', 'text');
      element.style.setProperty('color', 'transparent');
      element.style.setProperty('-webkit-text-fill-color', 'transparent');
    } else {
      element.style.setProperty('background-image', `var(${gradientVariable})`);
      element.style.removeProperty('color');
    }
  } else if (config.colorToken) {
    element.style.setProperty('color', `var(${config.colorToken})`);
    element.style.removeProperty('background-image');
  } else {
    element.style.removeProperty('color');
    element.style.removeProperty('background-image');
  }

  if (config.fontToken) {
    element.style.setProperty('font-family', `var(${config.fontToken})`);
  } else {
    element.style.removeProperty('font-family');
  }
}

function sanitizeGradients(input: unknown): GradientToken[] {
  if (!Array.isArray(input)) {
    return buildDefaultGradients();
  }

  const defaults = buildDefaultGradients();
  const byVariable = new Map<string, GradientToken>();
  input.forEach((item) => {
    if (!item || typeof item !== 'object') return;
    const gradient = item as GradientToken;
    if (typeof gradient.variable !== 'string') return;
    if (!Array.isArray(gradient.stops) || gradient.stops.length === 0) return;
    byVariable.set(gradient.variable, gradient);
  });

  const normalizedDefaultGradients = defaults.map((fallback) => {
    const fromInput = byVariable.get(fallback.variable);
    if (!fromInput) return fallback;

    const stops = fromInput.stops
      .filter((stop) => typeof stop.color === 'string' && typeof stop.position === 'number')
      .map((stop, index) => ({
        color: ALLOWED_GRADIENT_TOKEN_VALUES.has(stop.color)
          ? stop.color
          : (fallback.stops[index]?.color ?? fallback.stops[0]?.color ?? 'var(--color-cyan-400)'),
        position: Math.max(0, Math.min(100, stop.position)),
      }));

    return {
      ...fallback,
      angle: typeof fromInput.angle === 'number' ? Math.max(0, Math.min(360, fromInput.angle)) : fallback.angle,
      stops: stops.length > 0 ? stops : fallback.stops,
    };
  });

  const defaultVariables = new Set(defaults.map((gradient) => gradient.variable));
  const customGradients: GradientToken[] = [];

  byVariable.forEach((gradient) => {
    if (defaultVariables.has(gradient.variable)) return;

    const sanitizedStops = gradient.stops
      .filter((stop) => typeof stop.color === 'string' && typeof stop.position === 'number')
      .map((stop) => ({ color: stop.color, position: Math.max(0, Math.min(100, stop.position)) }));

    if (sanitizedStops.length === 0) return;

    customGradients.push({
      id: typeof gradient.id === 'string' && gradient.id.length > 0 ? gradient.id : `custom-${gradient.variable}`,
      variable: gradient.variable,
      label: typeof gradient.label === 'string' && gradient.label.trim().length > 0 ? gradient.label : gradient.variable,
      hint: typeof gradient.hint === 'string' ? gradient.hint : 'Degradado personalizado',
      angle: typeof gradient.angle === 'number' ? Math.max(0, Math.min(360, gradient.angle)) : 135,
      stops: sanitizedStops,
    });
  });

  return [...normalizedDefaultGradients, ...customGradients];
}

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
  gradients: GradientToken[],
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
  const textSecondary = families.flatMap((family) => family.tokens).find((t) => t.variable === '--text-secondary')?.value ?? '#e4e7f8';

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

  gradients.forEach((gradient) => {
    root.style.setProperty(gradient.variable, stopsToCSS(gradient.angle, gradient.stops));
  });
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
  gradients: GradientToken[],
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
  gradients.forEach((gradient) => {
    L.push(`  ${gradient.variable}: ${stopsToCSS(gradient.angle, gradient.stops)};`);
  });
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

function LivePreview({ families, gradients }: { families: ColorFamily[]; gradients: GradientToken[] }) {
  const allTokens = families.flatMap((f) => f.tokens);
  const gv = (v: string) => allTokens.find((t) => t.variable === v)?.value;
  const cPrimary = gv('--color-cyan-400') ?? '#009e9a';
  const cSecondary = gv('--color-purple-400') ?? '#5b2eff';
  const cAccent = gv('--color-pink-400') ?? '#ed1e79';
  const bgPrimary = gv('--bg-dark-primary') ?? '#151216';
  const bgSecondary = gv('--bg-dark-secondary') ?? '#201c1f';
  const bgTertiary = gv('--bg-dark-tertiary') ?? '#2a252a';

  const gradientByVariable = new Map(gradients.map((gradient) => [gradient.variable, stopsToCSS(gradient.angle, gradient.stops)]));
  const heroGrad = gradientByVariable.get('--gradient-hero') ?? `linear-gradient(135deg, ${bgPrimary} 0%, ${bgSecondary} 55%, ${bgTertiary} 100%)`;
  const primaryGrad = gradientByVariable.get('--gradient-primary') ?? `linear-gradient(135deg, ${cPrimary} 0%, ${cSecondary} 100%)`;
  const secondaryGrad = gradientByVariable.get('--gradient-secondary') ?? `linear-gradient(135deg, ${cSecondary} 0%, ${cAccent} 100%)`;
  const accentGrad = gradientByVariable.get('--gradient-accent') ?? `linear-gradient(135deg, ${cPrimary} 0%, ${cAccent} 100%)`;

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
        <div className="tc-preview-badge" style={{ background: accentGrad, color: textPrimary }}>HACKATHON</div>
        <h3 className="tc-preview-title" style={{ color: textPrimary }}>
          GDL<span style={{ color: firstKey }}>Innova</span>
        </h3>
        <p style={{ fontSize: '0.74rem', margin: 0, color: textSecondary }}>24 horas de innovación</p>
        <div className="tc-preview-btns">
          <button className="tc-preview-btn-solid" style={{ background: primaryGrad, color: textPrimary }}>Inscríbete</button>
          <button className="tc-preview-btn-ghost" style={{ borderColor: firstKey, color: firstKey }}>Ver más</button>
        </div>
      </div>
      {/* Key swatches */}
      <div className="tc-preview-swatches">
        {families.slice(0, 5).map((fam) => {
          const c = fam.tokens.find((t) => t.isKey)?.value ?? fam.tokens[0]?.value ?? textMuted;
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
            { id: '--gradient-secondary', label: 'Secundario', value: secondaryGrad },
            { id: '--gradient-accent', label: 'Acento', value: accentGrad },
            { id: '--gradient-hero', label: 'Hero', value: heroGrad },
          ].map((g) => (
            <div key={g.id} className="tc-preview-grad-item" style={{ background: g.value }}>
              <span
                className="tc-preview-grad-name"
                style={{
                  color: textPrimary,
                  textShadow: `0 1px 2px color-mix(in srgb, ${bgPrimary} 62%, transparent)`,
                }}
              >
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
  const isThemeDevelopmentMode = process.env.NEXT_PUBLIC_ENV === 'development';

  const firestoreEnabled = isFirebaseConfigured();
  const { siteConfig, updateSiteConfig } = useSiteConfig();
  const [isOpen,   setIsOpen]   = useState(false);
  const [families, setFamilies] = useState<ColorFamily[]>(buildDefaultFamilies);
  const [gradients, setGradients] = useState<GradientToken[]>(buildDefaultGradients);
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
  const [devEditMode, setDevEditMode] = useState(false);
  const [devElements, setDevElements] = useState<Record<string, DevElementConfig>>({});
  const [selectedElementSelector, setSelectedElementSelector] = useState('');
  const [selectedElementRole, setSelectedElementRole] = useState<DevTextRole>('body');
  const [selectedElementColorToken, setSelectedElementColorToken] = useState('--text-secondary');
  const [selectedElementFontToken, setSelectedElementFontToken] = useState('--font-primary');
  const [customGradientName, setCustomGradientName] = useState('');
  const [customGradientFrom] = useState('var(--color-cyan-400)');
  const [customGradientTo] = useState('var(--color-purple-400)');
  const [customGradientAngle] = useState(135);
  const [activeTab, setActiveTab] = useState<ActiveTab>('colors');
  const applyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const folderFontInputRef = useRef<HTMLInputElement>(null);
  const hasLocalThemeDraftRef = useRef(false);

  // Update site config when eventName changes
  useEffect(() => {
    updateSiteConfig({ name: eventName });
  }, [eventName, updateSiteConfig]);

  // Initialize particles palette from existing CSS on mount
  useEffect(() => {
    try {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--particles-palette').trim();
      if (v) setParticlesPalette(v);
    } catch {
      // ignore in SSR or environments without window
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(THEME_DRAFT_STORAGE_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as Partial<ThemeDraftSnapshot>;

      if (Array.isArray(draft.families)) {
        setFamilies(sanitizeFamilies(draft.families));
      }
      setGradients(sanitizeGradients(draft.gradients));
      if (typeof draft.sectionBaseColor === 'string') {
        setSectionBaseColor(draft.sectionBaseColor);
      }
      if (draft.sectionFilters && typeof draft.sectionFilters === 'object') {
        setSectionFilters({ ...DEFAULT_SECTION_FILTERS, ...(draft.sectionFilters as Record<SectionId, string>) });
      }
      if (draft.typography && typeof draft.typography === 'object') {
        setTypography({ ...DEFAULT_TYPOGRAPHY, ...(draft.typography as TypographyState) });
      }
      if (typeof draft.eventName === 'string' && draft.eventName.trim().length > 0) {
        setEventName(draft.eventName);
      }
      if (typeof draft.particlesPalette === 'string') {
        setParticlesPalette(draft.particlesPalette);
      }
      if (draft.devElements && typeof draft.devElements === 'object') {
        setDevElements(sanitizeDevElements(draft.devElements));
      }
      hasLocalThemeDraftRef.current = true;
    } catch {
      hasLocalThemeDraftRef.current = false;
    }
  }, []);

  useEffect(() => {
    try {
      const draft: ThemeDraftSnapshot = {
        families,
        gradients,
        sectionBaseColor,
        sectionFilters,
        typography,
        eventName,
        particlesPalette,
        devElements,
      };
      localStorage.setItem(THEME_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // ignore quota or serialization issues in runtime
    }
  }, [families, gradients, sectionBaseColor, sectionFilters, typography, eventName, particlesPalette, devElements]);

  // ── Apply on every change ──────────────────────────────────────────────────
  useEffect(() => {
    applyToDOM(families, gradients, sectionBaseColor, sectionFilters, typography, localFonts, folderFonts, particlesPalette);
    setApplied(true);
    clearTimeout(applyTimer.current);
    applyTimer.current = setTimeout(() => setApplied(false), 1800);
  }, [families, gradients, sectionBaseColor, sectionFilters, typography, localFonts, folderFonts, particlesPalette]);
  

  // Re-apply when panel opens (tokens.css could have reset vars)
  useEffect(() => {
    if (!isOpen) return;
    applyToDOM(families, gradients, sectionBaseColor, sectionFilters, typography, localFonts, folderFonts, particlesPalette);
  }, [isOpen, families, gradients, sectionBaseColor, sectionFilters, typography, localFonts, folderFonts, particlesPalette]);

  useEffect(() => {
    Object.values(devElements).forEach((config) => {
      applyDevElementToDOM(config);
    });
  }, [devElements, families, gradients, sectionBaseColor, sectionFilters, typography, localFonts, folderFonts, particlesPalette]);

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
    if (!firestoreEnabled || hasLocalThemeDraftRef.current) return;

    let active = true;
    const load = async () => {
      try {
        const snapshot = await loadThemeFromFirestore();
        if (!active || !snapshot) return;
        setFamilies(sanitizeFamilies(snapshot.families));
        setGradients(sanitizeGradients(snapshot.gradients));
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
        setDevElements(sanitizeDevElements(snapshot.devElements));
      } catch (error) {
        if (active) setCloudError(toFirebaseMessage(error, 'cargar'));
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [firestoreEnabled]);

  useEffect(() => {
    if (!devEditMode) {
      document.body.classList.remove('tc-dev-editing');
      return;
    }

    document.body.classList.add('tc-dev-editing');

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest('.tc-panel') || target.closest('.tc-trigger') || target.closest('.tc-backdrop') || target.closest('.tc-dev-widget')) return;

      const editable = normalizeEditableTarget(target);
      const selector = buildElementSelector(editable);
      const existing = devElements[selector];
      const inferredRole = existing?.textRole ?? detectRoleFromElement(editable);
      const inferredColor = existing?.colorToken ?? (inferredRole === 'custom' ? '' : DEV_ROLE_DEFAULTS[inferredRole].colorToken);
      const inferredFont = existing?.fontToken ?? (inferredRole === 'custom' ? '' : DEV_ROLE_DEFAULTS[inferredRole].fontToken);

      document.querySelectorAll('.tc-dev-selected').forEach((node) => node.classList.remove('tc-dev-selected'));
      editable.classList.add('tc-dev-selected');

      setSelectedElementSelector(selector);
      setSelectedElementRole(inferredRole);
      setSelectedElementColorToken(inferredColor);
      setSelectedElementFontToken(inferredFont);

      event.preventDefault();
      event.stopPropagation();
    };

    document.addEventListener('click', onClick, true);
    return () => {
      document.body.classList.remove('tc-dev-editing');
      document.removeEventListener('click', onClick, true);
      document.querySelectorAll('.tc-dev-selected').forEach((node) => node.classList.remove('tc-dev-selected'));
    };
  }, [devEditMode, devElements]);


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
    setGradients(buildDefaultGradients());
    setSectionBaseColor(DEFAULT_SECTION_BASE_COLOR);
    setSectionFilters(DEFAULT_SECTION_FILTERS);
    setTypography(DEFAULT_TYPOGRAPHY);
    setDevElements({});
    setLocalFonts(EMPTY_LOCAL_FONTS);
    localStorage.removeItem(THEME_DRAFT_STORAGE_KEY);
    setFontError(null);
  }, []);

  const handleSave = useCallback(() => {
    const css = generateCSS(families, gradients, sectionBaseColor, sectionFilters, typography, localFonts, folderFonts, particlesPalette);
    const blob = new Blob([css], { type: 'text/css;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'tokens.css';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }, [families, gradients, sectionBaseColor, sectionFilters, typography, localFonts, folderFonts, particlesPalette]);

  const handleSaveCloud = useCallback(async () => {
    setCloudError(null);
    setSavingCloud(true);
    try {
      await saveThemeToFirestore({ families, gradients, sectionBaseColor, sectionFilters, typography, eventName });
      setSavedCloud(true);
      setTimeout(() => setSavedCloud(false), 3000);
    } catch (error) {
      setCloudError(toFirebaseMessage(error, 'guardar'));
    } finally {
      setSavingCloud(false);
    }
  }, [families, gradients, sectionBaseColor, sectionFilters, typography, eventName]);

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

  const patchGradientAngle = useCallback((variable: string, angle: number) => {
    setGradients((prev) => prev.map((gradient) => (
      gradient.variable === variable
        ? { ...gradient, angle: Math.max(0, Math.min(360, angle)) }
        : gradient
    )));
  }, []);

  const patchGradientStop = useCallback((variable: string, stopIndex: number, color: string) => {
    if (!ALLOWED_GRADIENT_TOKEN_VALUES.has(color)) return;
    setGradients((prev) => prev.map((gradient) => {
      if (gradient.variable !== variable) return gradient;
      return {
        ...gradient,
        stops: gradient.stops.map((stop, index) => (
          index === stopIndex ? { ...stop, color } : stop
        )),
      };
    }));
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

  if (!isThemeDevelopmentMode) {
    return null;
  }

  return (
    <>
      {/* ── Floating trigger ──────────────────────────────────────── */}
      <button className="tc-trigger" onClick={() => setIsOpen(true)} aria-label="Abrir configurador del tema">
        <span className="tc-trigger-icon">🎨</span>
        <span className="tc-trigger-lbl">Personalizar</span>
      </button>

      {/* ── Backdrop ─────────────────────────────────────────────── */}
      {isOpen && <div className="tc-backdrop" onClick={() => setIsOpen(false)} aria-hidden />}

      {/* ── Side panel ───────────────────────────────────────────── */}
      <aside className={`tc-panel${isOpen ? ' tc-panel--open' : ''}`} aria-label="Configurador de tema">

        {/* Header */}
        <div className="tc-header">
          <div className="tc-header-left">
            <span className="tc-header-icon">🎨</span>
            <div>
              <h2 className="tc-header-title">Configuración del tema</h2>
              <p className="tc-header-sub">Tiempo real · {eventName}</p>
            </div>
          </div>
          <div className="tc-header-right">
            {applied && <span className="tc-applied-badge">✓ Aplicado</span>}
            <button className="tc-close" onClick={() => setIsOpen(false)} aria-label="Cerrar">✕</button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="tc-tabs">
          {([            { id: 'colors'     as ActiveTab, label: 'Colores',    icon: '●' },
            { id: 'gradients'  as ActiveTab, label: 'Degradados', icon: '◐' },
            { id: 'typography' as ActiveTab, label: 'Tipografía', icon: 'T' },
            { id: 'dev'        as ActiveTab, label: 'Dev',         icon: '⌥' },
          ]).map((tab) => (
            <button
              key={tab.id}
              className={`tc-tab${activeTab === tab.id ? ' tc-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tc-tab-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab: Colores ───────────────────────────────────────── */}
        {activeTab === 'colors' && (
          <div className="tc-scroll">
            <div className="tc-tab-content">

              {/* Preview toggle + live preview */}
              <div className="tc-preview-row">
                <button
                  className={`tc-pill${preview ? ' tc-pill--on' : ''}`}
                  onClick={() => setPreview((v) => !v)}
                >
                  👁 {preview ? 'Ocultar vista previa' : 'Mostrar vista previa'}
                </button>
              </div>
              {preview && <LivePreview families={families} gradients={gradients} />}

              {/* Color pickers */}
              <div className="tc-card">
                <h3 className="tc-card-title">Colores base</h3>
                <div className="tc-color-list">
                  {([
                    { label: 'Primario',        variable: '--color-cyan-400',   value: colorPrimary    },
                    { label: 'Secundario',       variable: '--color-purple-400', value: colorSecondary  },
                    { label: 'Acento',           variable: '--color-pink-400',   value: colorAccent     },
                    { label: 'Texto principal',  variable: '--text-primary',     value: textPrimary     },
                    { label: 'Texto secundario', variable: '--text-secondary',   value: textSecondary   },
                    { label: 'Texto auxiliar',   variable: '--text-muted',       value: textMuted       },
                    { label: 'Fondo global',     variable: null,                 value: sectionBaseColor},
                  ] as Array<{ label: string; variable: string | null; value: string }>).map(({ label, variable, value }) => (
                    <div key={label} className="tc-color-row">
                      <div
                        className="tc-color-swatch"
                        style={{ background: variable ? `var(${variable})` : value }}
                      />
                      <span className="tc-color-lbl">{label}</span>
                      <div className="tc-color-inputs">
                        <input
                          type="color"
                          value={toColorPickerHex(value)}
                          onChange={(e) => variable ? setTokenValue(variable, e.target.value) : setSectionBaseColor(e.target.value)}
                          className="tc-color-native"
                          aria-label={label}
                        />
                        <HexInput
                          value={value}
                          onCommit={(v) => variable ? setTokenValue(variable, v) : setSectionBaseColor(v)}
                          className="tc-hex-input"
                          ariaLabel={`${label} hex`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section effects */}
              <div className="tc-card">
                <h3 className="tc-card-title">Efecto visual de secciones</h3>
                <label className="tc-field">
                  <span className="tc-field-label">Filtro global</span>
                  <select
                    value={sharedSectionFilter}
                    onChange={(e) => {
                      const selected = e.target.value;
                      if (selected === 'custom') return;
                      const next = Object.fromEntries(
                        SECTION_OPTIONS.map(({ id }) => [id, selected]),
                      ) as Record<SectionId, string>;
                      setSectionFilters(next);
                    }}
                    className="tc-select"
                  >
                    <option value="custom">— Personalizado por sección —</option>
                    {SECTION_FILTER_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </label>
                {sharedSectionFilter === 'custom' && (
                  <div className="tc-section-grid">
                    {SECTION_OPTIONS.map(({ id, label }) => (
                      <label key={id} className="tc-field">
                        <span className="tc-field-label">{label}</span>
                        <select
                          value={sectionFilters[id]}
                          onChange={(e) => setSectionFilters((prev) => ({ ...prev, [id]: e.target.value }))}
                          className="tc-select"
                        >
                          {SECTION_FILTER_PRESETS.map((p) => (
                            <option key={p.id} value={p.id}>{p.label}</option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ── Tab: Degradados ────────────────────────────────────── */}
        {activeTab === 'gradients' && (
          <div className="tc-scroll">
            <div className="tc-tab-content">

              {/* Gradient list */}
              <div className="tc-card">
                <h3 className="tc-card-title">Degradados del sistema</h3>
                <div className="tc-hint-box">
                  <p><strong>–gradient-primary</strong> · Títulos y botón principal</p>
                  <p><strong>–gradient-secondary</strong> · Botón secundario y alto contraste</p>
                  <p><strong>–gradient-accent</strong> · Badges y detalles</p>
                  <p><strong>–gradient-hero</strong> · Fondo de la sección hero</p>
                </div>
                <div className="tc-gradient-list">
                  {gradients.map((gradient) => (
                    <div key={gradient.variable} className="tc-gradient-card">
                      <div
                        className="tc-gradient-preview"
                        style={{ background: stopsToCSS(gradient.angle, gradient.stops) }}
                      />
                      <div className="tc-gradient-body">
                        <div className="tc-gradient-head-row">
                          <div>
                            <p className="tc-gradient-name">{gradient.label}</p>
                            <code className="tc-gradient-var">{gradient.variable}</code>
                          </div>
                        </div>
                        <label className="tc-field">
                          <span className="tc-field-label">Ángulo: {gradient.angle}°</span>
                          <input
                            type="range" min={0} max={360} value={gradient.angle}
                            onChange={(e) => patchGradientAngle(gradient.variable, Number(e.target.value))}
                            className="tc-range"
                          />
                        </label>
                        <div className="tc-stops-row">
                          {gradient.stops.map((stop, idx) => (
                            <label key={idx} className="tc-field tc-stop-field">
                              <span className="tc-field-label">Stop {idx + 1}</span>
                              <select
                                value={stop.color}
                                onChange={(e) => patchGradientStop(gradient.variable, idx, e.target.value)}
                                className="tc-select"
                              >
                                {GRADIENT_TOKEN_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── Tab: Tipografía ────────────────────────────────────── */}
        {activeTab === 'typography' && (
          <div className="tc-scroll">
            <div className="tc-tab-content">

              <div className="tc-card">
                <div className="tc-card-title-row">
                  <h3 className="tc-card-title">Tipografía</h3>
                  <div>
                    <input
                      ref={folderFontInputRef}
                      type="file"
                      accept=".woff2,.woff,.ttf,.otf"
                      className="tc-hidden"
                      onChange={(e) => {
                        void handleLocalFontUpload(e.target.files?.[0] ?? null);
                        e.target.value = '';
                      }}
                    />
                    <button className="tc-ghost-btn" onClick={() => folderFontInputRef.current?.click()}>
                      📁 Subir fuente local
                    </button>
                  </div>
                </div>
                {fontError && <p className="tc-error-text">{fontError}</p>}

                <div className="tc-font-slots">
                  {([
                    { slot: 'heading'    as TypographySlot, label: 'Títulos',    hint: 'H1, H2, H3' },
                    { slot: 'subheading' as TypographySlot, label: 'Subtítulos', hint: 'H4–H6, labels' },
                    { slot: 'primary'    as TypographySlot, label: 'Texto',      hint: 'Párrafos, general' },
                  ]).map(({ slot, label, hint }) => (
                    <div key={slot} className="tc-font-slot">
                      <div className="tc-font-slot-meta">
                        <span className="tc-font-slot-label">{label}</span>
                        <span className="tc-font-slot-hint">{hint}</span>
                      </div>
                      <p
                        className="tc-font-slot-preview"
                        style={{ fontFamily: buildFontStack(resolveFontBySlot(slot, typography, localFonts, folderFonts)) }}
                      >
                        Aa Bb Cc — {eventName}
                      </p>
                      <select
                        value={typography[slot]}
                        onChange={(e) => patchTypography(slot, e.target.value)}
                        className="tc-select"
                      >
                        {folderFonts.length > 0 && (
                          <optgroup label="Fuentes locales">
                            {folderFonts.map((f) => (
                              <option key={f.id} value={f.id}>▸ {f.label}</option>
                            ))}
                          </optgroup>
                        )}
                        <optgroup label="Google Fonts">
                          {GOOGLE_FONT_OPTIONS.map((f) => (
                            <option key={f.id} value={f.id}>{f.label}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="tc-card">
                <h3 className="tc-card-title">Nombre del evento</h3>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="tc-input"
                  placeholder="Ej: GDL Innova Hackathon 2026"
                />
              </div>

            </div>
          </div>
        )}

        {/* ── Tab: Dev ────────────────────────────────────────── */}
        {activeTab === 'dev' && (
          <div className="tc-scroll">
            <div className="tc-tab-content">
              <div className="tc-card">
                <div className="tc-card-title-row">
                  <h3 className="tc-card-title">Modo edición</h3>
                  <button
                    className={`tc-ghost-btn${devEditMode ? ' tc-ghost-btn--on' : ''}`}
                    onClick={() => {
                      setDevEditMode((v) => !v);
                      if (isOpen) setIsOpen(false);
                    }}
                  >
                    {devEditMode ? '⬛ Desactivar' : '✏️ Activar'}
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: '.72rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                  Activa el modo edición y haz clic en cualquier elemento de la página para asignarle color y fuente de tu sistema de diseño.
                </p>
              </div>

              {Object.keys(devElements).length > 0 && (
                <div className="tc-card">
                  <h3 className="tc-card-title">Elementos configurados ({Object.keys(devElements).length})</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.45rem' }}>
                    {Object.entries(devElements).map(([selector, config]) => (
                      <div key={selector} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '.5rem',
                        padding: '.45rem .55rem',
                        borderRadius: '7px',
                        border: '1px solid color-mix(in srgb, var(--text-primary) 12%, transparent)',
                        background: 'color-mix(in srgb, var(--text-primary) 4%, transparent)',
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <code style={{ fontSize: '.62rem', color: 'var(--color-cyan-400)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {selector}
                          </code>
                          <span style={{ fontSize: '.65rem', color: 'var(--text-muted)' }}>
                            {config.textRole}{config.colorToken ? ` · ${config.colorToken}` : ''}{config.fontToken ? ` · ${config.fontToken}` : ''}
                          </span>
                        </div>
                        <button
                          className="tc-ghost-btn"
                          onClick={() => {
                            const el = document.querySelector(selector);
                            if (el instanceof HTMLElement) {
                              el.style.removeProperty('color');
                              el.style.removeProperty('font-family');
                              el.style.removeProperty('background-image');
                              el.style.removeProperty('-webkit-background-clip');
                              el.style.removeProperty('background-clip');
                              el.style.removeProperty('-webkit-text-fill-color');
                            }
                            setDevElements((prev) => {
                              const next = { ...prev };
                              delete next[selector];
                              return next;
                            });
                          }}
                        >✕</button>
                      </div>
                    ))}
                  </div>
                  <button
                    className="tc-ghost-btn"
                    style={{ marginTop: '.65rem', width: '100%' }}
                    onClick={() => {
                      Object.keys(devElements).forEach((selector) => {
                        const el = document.querySelector(selector);
                        if (el instanceof HTMLElement) {
                          el.style.removeProperty('color');
                          el.style.removeProperty('font-family');
                          el.style.removeProperty('background-image');
                          el.style.removeProperty('-webkit-background-clip');
                          el.style.removeProperty('background-clip');
                          el.style.removeProperty('-webkit-text-fill-color');
                        }
                      });
                      setDevElements({});
                    }}
                  >
                    🗑 Limpiar todo
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Footer ─────────────────────────────────────────────── */}
        <div className="tc-footer">
          <button className="tc-footer-ghost" onClick={handleReset}>↺ Restaurar</button>
          <button
            className="tc-footer-ghost tc-footer-ghost--accent"
            onClick={() => applyToDOM(families, gradients, sectionBaseColor, sectionFilters, typography, localFonts, folderFonts, particlesPalette)}
          >
            ▶ Aplicar
          </button>
          {firestoreEnabled && (
            <button
              className={`tc-footer-cloud${savedCloud ? ' tc-footer-cloud--ok' : ''}`}
              onClick={handleSaveCloud}
              disabled={savingCloud}
            >
              {savingCloud ? '⏳' : savedCloud ? '✓ Nube' : '☁ Guardar nube'}
            </button>
          )}
          <button
            className={`tc-footer-save${saved ? ' tc-footer-save--ok' : ''}`}
            onClick={handleSave}
          >
            {saved ? '✓ ¡Descargado!' : '⬇ Guardar CSS'}
          </button>
        </div>
        {!firestoreEnabled && (
          <div className="tc-notice">
            Firebase no configurado — define <code>NEXT_PUBLIC_FIREBASE_*</code> para Firestore.
          </div>
        )}
        {cloudError && <div className="tc-notice tc-notice--error">{cloudError}</div>}
        {saved && (
          <div className="tc-notice">
            Reemplaza <code>styles/theme/tokens.css</code> con el archivo <strong>tokens.css</strong> descargado.
          </div>
        )}
      </aside>

      {/* ── Dev edit widget ──────────────────────────────── */}
      {devEditMode && (
        <div className="tc-dev-widget">
          <div className="tc-dev-widget-head">
            <strong>Modo edición</strong>
            <span className="tc-dev-widget-state tc-dev-widget-state--on">● Activo</span>
          </div>
          {selectedElementSelector ? (
            <>
              <p className="tc-dev-widget-text" title={selectedElementSelector}>
                {selectedElementSelector}
              </p>
              <div className="tc-dev-editor-form">
                <label className="tc-select-field">
                  <span>Rol</span>
                  <select
                    value={selectedElementRole}
                    onChange={(e) => {
                      const role = e.target.value as DevTextRole;
                      setSelectedElementRole(role);
                      if (role !== 'custom') {
                        setSelectedElementColorToken(DEV_ROLE_DEFAULTS[role].colorToken);
                        setSelectedElementFontToken(DEV_ROLE_DEFAULTS[role].fontToken);
                      }
                    }}
                    className="tc-select"
                  >
                    {DEV_ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </label>
                <label className="tc-select-field">
                  <span>Color</span>
                  <select
                    value={selectedElementColorToken}
                    onChange={(e) => setSelectedElementColorToken(e.target.value)}
                    className="tc-select"
                  >
                    {DEV_COLOR_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </label>
                <label className="tc-select-field">
                  <span>Fuente</span>
                  <select
                    value={selectedElementFontToken}
                    onChange={(e) => setSelectedElementFontToken(e.target.value)}
                    className="tc-select"
                  >
                    {DEV_FONT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="tc-dev-widget-actions" style={{ marginTop: '.5rem' }}>
                <button
                  className="tc-ghost-btn"
                  style={{ flex: 1 }}
                  onClick={() => {
                    const config: DevElementConfig = {
                      selector: selectedElementSelector,
                      textRole: selectedElementRole,
                      colorToken: selectedElementColorToken,
                      fontToken: selectedElementFontToken,
                      updatedAt: Date.now(),
                    };
                    setDevElements((prev) => ({ ...prev, [selectedElementSelector]: config }));
                    applyDevElementToDOM(config);
                  }}
                >
                  ✓ Aplicar
                </button>
                <button
                  className="tc-ghost-btn"
                  onClick={() => {
                    const el = document.querySelector(selectedElementSelector);
                    if (el instanceof HTMLElement) {
                      el.style.removeProperty('color');
                      el.style.removeProperty('font-family');
                      el.style.removeProperty('background-image');
                      el.style.removeProperty('-webkit-background-clip');
                      el.style.removeProperty('background-clip');
                      el.style.removeProperty('-webkit-text-fill-color');
                    }
                    setDevElements((prev) => {
                      const next = { ...prev };
                      delete next[selectedElementSelector];
                      return next;
                    });
                    setSelectedElementSelector('');
                  }}
                >
                  ✕ Quitar
                </button>
              </div>
            </>
          ) : (
            <p className="tc-dev-widget-text">Haz clic en un elemento de la página para seleccionarlo.</p>
          )}
          <button
            className="tc-ghost-btn"
            style={{ width: '100%', marginTop: '.5rem' }}
            onClick={() => setDevEditMode(false)}
          >
            ✕ Salir del modo edición
          </button>
        </div>
      )}

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
  color:var(--text-primary); font-size:.9rem; font-weight:700; cursor:pointer;
  box-shadow:0 4px 24px color-mix(in srgb, var(--color-purple-400) 45%, transparent),0 0 0 2px color-mix(in srgb, var(--text-primary) 18%, transparent);
  transition:transform 220ms cubic-bezier(.34,1.56,.64,1),box-shadow 200ms;
}
.tc-trigger:hover{transform:scale(1.06) translateY(-2px);box-shadow:0 8px 32px color-mix(in srgb, var(--color-purple-400) 60%, transparent);}
.tc-trigger-lbl{font-size:.85rem;}

.tc-backdrop{
  position:fixed;inset:0;z-index:9010;
  background:color-mix(in srgb, var(--bg-dark-primary) 70%, transparent);backdrop-filter:blur(4px);
  animation:tcFade 200ms ease;
}
@keyframes tcFade{from{opacity:0}to{opacity:1}}

.tc-panel{
  position:fixed;top:0;right:0;z-index:9020;
  width:min(620px,100vw);height:100dvh;
  display:flex;flex-direction:column;
  background:color-mix(in srgb, var(--bg-dark-primary) 82%, black);
  border-left:1px solid color-mix(in srgb, var(--text-primary) 16%, transparent);
  box-shadow:-8px 0 48px color-mix(in srgb, var(--bg-dark-primary) 85%, transparent);
  transform:translateX(100%);
  transition:transform 340ms cubic-bezier(.23,1,.32,1);
  overflow:hidden;
}
.tc-panel--open{transform:translateX(0);}

.tc-header{
  display:flex;align-items:center;justify-content:space-between;
  padding:1rem 1.25rem;flex-shrink:0;
  background:linear-gradient(135deg,color-mix(in srgb, var(--color-purple-400) 20%, transparent),color-mix(in srgb, var(--color-cyan-400) 12%, transparent));
  border-bottom:1px solid color-mix(in srgb, var(--text-primary) 14%, transparent);
}
.tc-header-left{display:flex;align-items:center;gap:.65rem;}
.tc-header-right{display:flex;align-items:center;gap:.5rem;}
.tc-header-title{color:var(--text-primary);font-size:1rem;font-weight:800;margin:0;}
.tc-header-sub{color:var(--text-secondary);font-size:.72rem;margin:0;}
.tc-applied-badge{
  font-size:.68rem;font-weight:700;color:var(--color-cyan-400);
  background:color-mix(in srgb, var(--color-cyan-400) 15%, transparent);border:1px solid color-mix(in srgb, var(--color-cyan-400) 40%, transparent);
  padding:.18rem .5rem;border-radius:9999px;animation:tcFade 200ms ease;
}
.tc-close{
  width:1.8rem;height:1.8rem;border:none;border-radius:50%;
  background:color-mix(in srgb, var(--text-primary) 12%, transparent);color:var(--text-muted);font-size:.9rem;
  cursor:pointer;transition:all 150ms;
}
.tc-close:hover{background:color-mix(in srgb, var(--text-primary) 20%, transparent);color:var(--text-primary);}

.tc-toolbar{
  display:flex;gap:.5rem;padding:.5rem 1.25rem;flex-shrink:0;
  flex-wrap:wrap;
  border-bottom:1px solid color-mix(in srgb, var(--text-primary) 10%, transparent);
}
.tc-mode-chip{
  display:inline-flex;
  align-items:center;
  border:1px solid color-mix(in srgb, var(--text-primary) 18%, transparent);
  border-radius:9999px;
  padding:.24rem .62rem;
  font-size:.7rem;
  color:var(--text-secondary);
  background:color-mix(in srgb, var(--text-primary) 7%, transparent);
}
.tc-mode-chip--header{margin-top:.3rem;}
.tc-tool{
  background:transparent;border:1px solid color-mix(in srgb, var(--text-primary) 16%, transparent);
  color:var(--text-muted);border-radius:6px;padding:.28rem .65rem;
  font-size:.72rem;font-weight:600;cursor:pointer;transition:all 150ms;
}
.tc-tool:hover{color:var(--text-secondary);border-color:color-mix(in srgb, var(--text-primary) 30%, transparent);}
.tc-tool--on{color:var(--color-cyan-400);border-color:color-mix(in srgb, var(--color-cyan-400) 45%, transparent);background:color-mix(in srgb, var(--color-cyan-400) 12%, transparent);}

.tc-dev-widget{
  position:fixed;
  left:1.2rem;
  bottom:1.2rem;
  z-index:9001;
  width:min(22rem,calc(100vw - 2.4rem));
  border:1px solid color-mix(in srgb, var(--text-primary) 16%, transparent);
  border-radius:10px;
  background:color-mix(in srgb, var(--bg-dark-primary) 88%, black);
  box-shadow:0 8px 28px color-mix(in srgb, var(--bg-dark-primary) 65%, transparent);
  padding:.65rem;
}
.tc-dev-widget-head{display:flex;align-items:center;justify-content:space-between;gap:.5rem;}
.tc-dev-widget-head strong{font-size:.74rem;color:var(--text-secondary);}
.tc-dev-widget-state{
  font-size:.65rem;
  font-weight:700;
  color:var(--text-muted);
  border:1px solid color-mix(in srgb, var(--text-primary) 16%, transparent);
  border-radius:9999px;
  padding:.14rem .45rem;
}
.tc-dev-widget-state--on{
  color:var(--color-cyan-400);
  border-color:color-mix(in srgb, var(--color-cyan-400) 45%, transparent);
  background:color-mix(in srgb, var(--color-cyan-400) 12%, transparent);
}
.tc-dev-widget-text{
  margin:.4rem 0 .55rem;
  font-size:.65rem;
  color:var(--text-muted);
  font-family:monospace;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.tc-dev-widget-actions{display:flex;gap:.4rem;flex-wrap:wrap;}

/* preview */
.tc-preview-root{
  margin:.55rem 1.25rem;border-radius:12px;overflow:hidden;
  border:1px solid color-mix(in srgb, var(--text-primary) 14%, transparent);flex-shrink:0;
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
  padding:.45rem 1rem;background:color-mix(in srgb, var(--text-primary) 6%, transparent);
  border-top:1px solid color-mix(in srgb, var(--text-primary) 10%, transparent);
}
.tc-preview-chip{display:flex;flex-direction:column;align-items:center;gap:.15rem;}
.tc-preview-chip-dot{width:1.25rem;height:1.25rem;border-radius:50%;border:1.5px solid color-mix(in srgb, var(--text-primary) 24%, transparent);}
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
  scrollbar-width:thin;scrollbar-color:color-mix(in srgb, var(--text-primary) 18%, transparent) transparent;
}
.tc-content::-webkit-scrollbar{width:4px;}
.tc-content::-webkit-scrollbar-thumb{background:color-mix(in srgb, var(--text-primary) 18%, transparent);border-radius:9999px;}
.tc-section{padding-top:.85rem;}
.tc-section-desc{
  font-size:.74rem;color:var(--text-muted);line-height:1.55;margin:0 0 .85rem;
  padding:.5rem .7rem;
  background:color-mix(in srgb, var(--text-primary) 7%, transparent);
  border-left:3px solid color-mix(in srgb, var(--color-cyan-400) 48%, transparent);border-radius:0 6px 6px 0;
}
.tc-section-desc strong{color:var(--color-cyan-400);}
.tc-empty{text-align:center;color:var(--text-muted);font-size:.78rem;padding:1.5rem 0;}
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
  border:1px solid color-mix(in srgb, var(--text-primary) 16%, transparent);
  border-radius:10px;
  padding:.65rem;
  background:color-mix(in srgb, var(--text-primary) 6%, transparent);
}
.tc-simple-grad-map h3{
  margin:0 0 .45rem;
  color:var(--text-secondary);
  font-size:.8rem;
  font-weight:700;
}
.tc-simple-grad-map p{
  margin:.2rem 0;
  color:var(--text-muted);
  font-size:.71rem;
  line-height:1.45;
}
.tc-simple-typography{
  margin-top:.2rem;
  border:1px solid color-mix(in srgb, var(--text-primary) 16%, transparent);
  border-radius:10px;
  padding:.65rem;
  background:color-mix(in srgb, var(--text-primary) 6%, transparent);
}
.tc-simple-typography h3{
  margin:0 0 .55rem;
  color:var(--text-secondary);
  font-size:.8rem;
  font-weight:700;
}
.tc-grid-settings{
  display:grid;
  gap:.65rem;
  grid-template-columns:1fr;
}
.tc-gradient-editor{
  border:1px solid color-mix(in srgb, var(--text-primary) 15%, transparent);
  border-radius:8px;
  padding:.55rem;
  background:color-mix(in srgb, var(--text-primary) 5%, transparent);
}
.tc-gradient-title{
  margin:0 0 .45rem;
  color:var(--text-secondary);
  font-size:.74rem;
  font-weight:700;
}
.tc-gradient-stops-grid{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:.55rem;
}
.tc-range{
  width:100%;
}
.tc-select-field{
  display:flex;
  flex-direction:column;
  gap:.3rem;
}
.tc-select-field span{
  color:var(--text-muted);
  font-size:.72rem;
  font-weight:600;
}
.tc-select{
  width:100%;
  background:color-mix(in srgb, var(--text-primary) 8%, transparent);
  border:1px solid color-mix(in srgb, var(--text-primary) 18%, transparent);
  border-radius:8px;
  color:var(--text-secondary);
  font-size:.74rem;
  padding:.45rem .55rem;
}
.tc-select option{background:var(--bg-dark-primary);color:var(--text-secondary);}
.tc-select:focus{outline:none;border-color:color-mix(in srgb, var(--color-cyan-400) 45%, transparent);}
.tc-dev-editor-head{display:flex;align-items:center;justify-content:space-between;gap:.6rem;flex-wrap:wrap;}
.tc-dev-editor-head h3{margin:0;color:var(--text-secondary);font-size:.8rem;font-weight:700;}
.tc-dev-editor-form{display:grid;gap:.55rem;margin-top:.6rem;}
.tc-dev-selector{
  width:100%;
  background:color-mix(in srgb, var(--text-primary) 8%, transparent);
  border:1px solid color-mix(in srgb, var(--text-primary) 18%, transparent);
  border-radius:8px;
  color:var(--text-muted);
  font-size:.68rem;
  font-family:monospace;
  padding:.45rem .55rem;
}
.tc-dev-actions{display:flex;gap:.45rem;flex-wrap:wrap;}
.tc-hidden-file{display:none;}
.tc-upload-row{display:flex;gap:.35rem;flex-wrap:wrap;align-items:center;}
.tc-upload-btn,
.tc-upload-remove{
  border-radius:7px;
  border:1px solid color-mix(in srgb, var(--text-primary) 20%, transparent);
  background:color-mix(in srgb, var(--text-primary) 8%, transparent);
  color:var(--text-secondary);
  font-size:.67rem;
  font-weight:700;
  padding:.26rem .52rem;
  cursor:pointer;
}
.tc-upload-btn:hover{border-color:color-mix(in srgb, var(--color-cyan-400) 45%, transparent);color:var(--color-cyan-400);}
.tc-upload-remove{border-color:color-mix(in srgb, var(--color-pink-400) 45%, transparent);color:var(--color-pink-400);}
.tc-upload-remove:hover{background:color-mix(in srgb, var(--color-pink-400) 12%, transparent);}
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
  border:1px solid color-mix(in srgb, var(--text-primary) 15%, transparent);
  border-radius:10px;
  background:color-mix(in srgb, var(--text-primary) 6%, transparent);
}
.tc-typo-preview p{margin:.2rem 0;color:var(--text-secondary);font-size:.82rem;}
.tc-typo-preview p:first-child{font-size:1rem;font-weight:700;}
.tc-font-error{margin:.55rem 0 0;color:var(--color-pink-400);font-size:.68rem;}
.tc-token-hex-input{
  width:100%; background:color-mix(in srgb, var(--text-primary) 6%, transparent); border:1px solid color-mix(in srgb, var(--text-primary) 15%, transparent);
  border-radius:5px; color:var(--text-muted); font-size:.65rem; font-family:monospace;
  padding:.18rem .38rem; box-sizing:border-box;
}
.tc-token-hex-input:focus{outline:none;border-color:color-mix(in srgb, var(--color-cyan-400) 40%, transparent);color:var(--text-secondary);}

/* footer */
.tc-footer{
  display:flex;gap:.45rem;
  flex-wrap:wrap;
  padding:.8rem 1.25rem;border-top:1px solid color-mix(in srgb, var(--text-primary) 14%, transparent);flex-shrink:0;
}
.tc-btn-reset{
  padding:.55rem .85rem;border-radius:8px;
  border:1px solid color-mix(in srgb, var(--text-primary) 16%, transparent);background:transparent;
  color:var(--text-muted);font-size:.76rem;font-weight:700;cursor:pointer;transition:all 150ms;
}
.tc-btn-reset:hover{border-color:color-mix(in srgb, var(--text-primary) 30%, transparent);color:var(--text-secondary);}
.tc-btn-apply{
  padding:.55rem .85rem;border-radius:8px;
  border:1px solid color-mix(in srgb, var(--color-cyan-400) 42%, transparent);background:color-mix(in srgb, var(--color-cyan-400) 12%, transparent);
  color:var(--color-cyan-400);font-size:.76rem;font-weight:700;cursor:pointer;transition:all 150ms;
}
.tc-btn-apply:hover{background:color-mix(in srgb, var(--color-cyan-400) 20%, transparent);border-color:color-mix(in srgb, var(--color-cyan-400) 60%, transparent);color:var(--text-primary);}
.tc-btn-save{
  flex:1;padding:.55rem .85rem;border-radius:8px;border:none;
  background:linear-gradient(135deg,var(--color-purple-400),var(--color-cyan-400));
  color:var(--text-primary);font-size:.8rem;font-weight:800;cursor:pointer;
  box-shadow:0 2px 14px color-mix(in srgb, var(--color-purple-400) 30%, transparent);transition:all 200ms;
}
.tc-btn-save:hover{transform:translateY(-1px);box-shadow:0 4px 22px color-mix(in srgb, var(--color-purple-400) 50%, transparent);}
.tc-btn-save--ok{background:linear-gradient(135deg,color-mix(in srgb, var(--color-cyan-400) 86%, black),var(--color-cyan-400));}
.tc-btn-cloud{
  padding:.55rem .9rem;border:none;border-radius:8px;
  background:linear-gradient(135deg,color-mix(in srgb, var(--color-purple-400) 86%, black),var(--color-cyan-400));
  color:var(--text-primary);font-size:.76rem;font-weight:700;cursor:pointer;
  transition:transform 150ms,box-shadow 150ms;
}
.tc-btn-cloud:hover{transform:translateY(-1px);box-shadow:0 4px 20px color-mix(in srgb, color-mix(in srgb, var(--color-purple-400) 86%, black) 45%, transparent);}
.tc-btn-cloud:disabled{opacity:.65;cursor:not-allowed;transform:none;box-shadow:none;}
.tc-btn-cloud--ok{background:linear-gradient(135deg,color-mix(in srgb, var(--color-cyan-400) 70%, black),var(--color-cyan-400));}
.tc-save-hint{
  padding:.55rem 1.25rem;font-size:.7rem;color:var(--color-cyan-400);
  background:color-mix(in srgb, var(--color-cyan-400) 12%, transparent);border-top:1px solid color-mix(in srgb, var(--color-cyan-400) 28%, transparent);
  flex-shrink:0;animation:tcFade 300ms ease;
}
.tc-save-hint--error{color:var(--color-pink-400);background:color-mix(in srgb, var(--color-pink-400) 10%, transparent);border-top-color:color-mix(in srgb, var(--color-pink-400) 32%, transparent);}
.tc-save-hint code{font-family:monospace;background:color-mix(in srgb, var(--text-primary) 14%, transparent);padding:.03rem .26rem;border-radius:4px;}

body.tc-dev-editing{cursor:crosshair;}
body.tc-dev-editing .tc-panel,
body.tc-dev-editing .tc-trigger,
body.tc-dev-editing .tc-backdrop{cursor:default;}
.tc-dev-selected{
  outline:2px dashed color-mix(in srgb, var(--color-cyan-400) 74%, white);
  outline-offset:2px;
}

.tc-preview-gradients{margin-top:.8rem;}
.tc-preview-grad-list{display:flex;flex-wrap:wrap;gap:.3rem;}
.tc-preview-grad-item{
  width:min(100%,5.8rem);min-height:1.9rem;border-radius:4px;display:flex;align-items:center;justify-content:center;
  padding:.12rem .24rem;text-align:center;line-height:1.05;border:1px solid color-mix(in srgb, var(--text-primary) 18%, transparent);
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
  .tc-dev-widget{left:.75rem;bottom:4.9rem;width:calc(100vw - 1.5rem);}
  .tc-preview-grad-list{flex-direction:column;}
  .tc-preview-grad-item{width:100%;height:1.5rem;}
  .tc-gradient-stops-grid{grid-template-columns:1fr;}
}

@media(min-width:481px) and (max-width:860px){
  .tc-panel{width:min(760px,100vw);}
  .tc-simple-grid{grid-template-columns:repeat(2,minmax(0,1fr));}
  .tc-grid-settings{grid-template-columns:repeat(2,minmax(0,1fr));}
  .tc-select-field:first-child{grid-column:1/-1;}
  .tc-footer{gap:.5rem;}
  .tc-btn-save{flex:1 0 100%;}
}

/* ── Tabs ─────────────────────────────────────────────── */
.tc-tabs{
  display:flex;gap:0;flex-shrink:0;
  border-bottom:1px solid color-mix(in srgb, var(--text-primary) 12%, transparent);
  background:color-mix(in srgb, var(--bg-dark-primary) 60%, transparent);
  overflow-x:auto;scrollbar-width:none;
}
.tc-tabs::-webkit-scrollbar{display:none;}
.tc-tab{
  display:flex;align-items:center;gap:.35rem;
  padding:.55rem .9rem;border:none;background:transparent;
  color:var(--text-muted);font-size:.72rem;font-weight:600;
  cursor:pointer;white-space:nowrap;
  border-bottom:2px solid transparent;
  transition:color 150ms,border-color 150ms,background 150ms;
}
.tc-tab:hover{color:var(--text-secondary);background:color-mix(in srgb, var(--text-primary) 6%, transparent);}
.tc-tab--active{
  color:var(--color-cyan-400);
  border-bottom-color:var(--color-cyan-400);
  background:color-mix(in srgb, var(--color-cyan-400) 8%, transparent);
}
.tc-tab-icon{font-size:.78rem;}

/* ── Scrollable tab body ──────────────────────────────── */
.tc-scroll{
  flex:1 1 0;overflow-y:auto;
  scrollbar-width:thin;scrollbar-color:color-mix(in srgb, var(--text-primary) 18%, transparent) transparent;
}
.tc-scroll::-webkit-scrollbar{width:4px;}
.tc-scroll::-webkit-scrollbar-thumb{background:color-mix(in srgb, var(--text-primary) 18%, transparent);border-radius:9999px;}
.tc-tab-content{display:flex;flex-direction:column;gap:.75rem;padding:.85rem 1.25rem 1.25rem;}

/* ── Cards ────────────────────────────────────────────── */
.tc-card{
  border:1px solid color-mix(in srgb, var(--text-primary) 14%, transparent);
  border-radius:12px;padding:.75rem;
  background:color-mix(in srgb, var(--text-primary) 4%, transparent);
}
.tc-card-title{
  margin:0 0 .6rem;
  color:var(--text-secondary);font-size:.78rem;font-weight:700;
}
.tc-card-title-row{
  display:flex;align-items:center;justify-content:space-between;
  gap:.5rem;flex-wrap:wrap;margin-bottom:.6rem;
}
.tc-card-title-row .tc-card-title{margin:0;}

/* ── Color list ───────────────────────────────────────── */
.tc-color-list{display:flex;flex-direction:column;gap:.55rem;}
.tc-color-row{display:flex;align-items:center;gap:.55rem;}
.tc-color-swatch{
  width:1.5rem;height:1.5rem;border-radius:6px;flex-shrink:0;
  border:1px solid color-mix(in srgb, var(--text-primary) 20%, transparent);
}
.tc-color-lbl{
  flex:1 1 0;min-width:0;
  font-size:.72rem;color:var(--text-secondary);font-weight:600;
}
.tc-color-inputs{display:flex;align-items:center;gap:.35rem;}
.tc-color-native{
  width:2rem;height:1.65rem;border:none;border-radius:5px;
  padding:0;background:transparent;cursor:pointer;
}
.tc-hex-input{
  width:5.2rem;
  background:color-mix(in srgb, var(--text-primary) 6%, transparent);
  border:1px solid color-mix(in srgb, var(--text-primary) 15%, transparent);
  border-radius:5px;color:var(--text-muted);font-size:.65rem;font-family:monospace;
  padding:.18rem .38rem;box-sizing:border-box;
}
.tc-hex-input:focus{outline:none;border-color:color-mix(in srgb, var(--color-cyan-400) 40%, transparent);color:var(--text-secondary);}

/* ── Field / label ────────────────────────────────────── */
.tc-field{display:flex;flex-direction:column;gap:.28rem;}
.tc-field-label{font-size:.7rem;color:var(--text-muted);font-weight:600;}
.tc-section-grid{
  display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.55rem;margin-top:.55rem;
}

/* ── Pill toggle ──────────────────────────────────────── */
.tc-preview-row{display:flex;align-items:center;justify-content:flex-end;}
.tc-pill{
  background:transparent;
  border:1px solid color-mix(in srgb, var(--text-primary) 20%, transparent);
  border-radius:9999px;color:var(--text-muted);
  font-size:.7rem;font-weight:600;padding:.25rem .65rem;
  cursor:pointer;transition:all 150ms;
}
.tc-pill:hover{border-color:color-mix(in srgb, var(--color-cyan-400) 45%, transparent);color:var(--color-cyan-400);}
.tc-pill--on{
  color:var(--color-cyan-400);
  border-color:color-mix(in srgb, var(--color-cyan-400) 45%, transparent);
  background:color-mix(in srgb, var(--color-cyan-400) 10%, transparent);
}

/* ── Gradient list ────────────────────────────────────── */
.tc-hint-box{
  border-radius:8px;padding:.5rem .65rem;margin-bottom:.65rem;
  background:color-mix(in srgb, var(--text-primary) 6%, transparent);
  border-left:3px solid color-mix(in srgb, var(--color-cyan-400) 50%, transparent);
}
.tc-hint-box p{margin:.15rem 0;font-size:.68rem;color:var(--text-muted);line-height:1.45;}
.tc-hint-box strong{color:var(--color-cyan-400);}
.tc-gradient-list{display:flex;flex-direction:column;gap:.65rem;}
.tc-gradient-card{
  border:1px solid color-mix(in srgb, var(--text-primary) 14%, transparent);
  border-radius:10px;overflow:hidden;
  background:color-mix(in srgb, var(--text-primary) 4%, transparent);
}
.tc-gradient-preview{width:100%;height:2.2rem;flex-shrink:0;}
.tc-gradient-body{padding:.6rem;}
.tc-gradient-head-row{display:flex;align-items:flex-start;justify-content:space-between;gap:.4rem;margin-bottom:.5rem;}
.tc-gradient-name{margin:0;font-size:.78rem;font-weight:700;color:var(--text-secondary);}
.tc-gradient-var{font-size:.64rem;color:var(--text-muted);font-family:monospace;display:block;margin-top:.1rem;}
.tc-stops-row{display:flex;gap:.45rem;flex-wrap:wrap;margin-top:.5rem;}
.tc-stop-field{flex:1 1 calc(50% - .225rem);min-width:0;}

/* ── Typography tab ───────────────────────────────────── */
.tc-font-slots{display:flex;flex-direction:column;gap:.8rem;}
.tc-font-slot{
  border:1px solid color-mix(in srgb, var(--text-primary) 12%, transparent);
  border-radius:9px;padding:.6rem;
  background:color-mix(in srgb, var(--text-primary) 3%, transparent);
}
.tc-font-slot-meta{display:flex;align-items:baseline;gap:.45rem;margin-bottom:.35rem;}
.tc-font-slot-label{font-size:.74rem;font-weight:700;color:var(--text-secondary);}
.tc-font-slot-hint{font-size:.64rem;color:var(--text-muted);}
.tc-font-slot-preview{
  margin:0 0 .45rem;
  font-size:.98rem;font-weight:600;
  color:var(--text-primary);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.tc-ghost-btn{
  background:transparent;
  border:1px solid color-mix(in srgb, var(--text-primary) 20%, transparent);
  border-radius:7px;color:var(--text-muted);
  font-size:.68rem;font-weight:700;padding:.28rem .6rem;cursor:pointer;
  transition:all 150ms;
}
.tc-ghost-btn:hover{border-color:color-mix(in srgb, var(--color-cyan-400) 45%, transparent);color:var(--color-cyan-400);}
.tc-ghost-btn--on{
  border-color:color-mix(in srgb, var(--color-pink-400) 50%, transparent);
  color:var(--color-pink-400);
  background:color-mix(in srgb, var(--color-pink-400) 10%, transparent);
}
.tc-ghost-btn--on:hover{
  border-color:color-mix(in srgb, var(--color-pink-400) 70%, transparent);
  background:color-mix(in srgb, var(--color-pink-400) 18%, transparent);
}
.tc-hidden{display:none;}
.tc-error-text{margin:.4rem 0 0;color:var(--color-pink-400);font-size:.68rem;}
.tc-input{
  width:100%;
  background:color-mix(in srgb, var(--text-primary) 8%, transparent);
  border:1px solid color-mix(in srgb, var(--text-primary) 18%, transparent);
  border-radius:8px;color:var(--text-secondary);
  font-size:.78rem;padding:.5rem .65rem;box-sizing:border-box;
}
.tc-input:focus{outline:none;border-color:color-mix(in srgb, var(--color-cyan-400) 45%, transparent);}

/* ── New footer buttons ───────────────────────────────── */
.tc-footer-ghost{
  padding:.5rem .8rem;border-radius:8px;
  border:1px solid color-mix(in srgb, var(--text-primary) 16%, transparent);background:transparent;
  color:var(--text-muted);font-size:.74rem;font-weight:700;cursor:pointer;transition:all 150ms;
}
.tc-footer-ghost:hover{border-color:color-mix(in srgb, var(--text-primary) 30%, transparent);color:var(--text-secondary);}
.tc-footer-ghost--accent{
  border-color:color-mix(in srgb, var(--color-cyan-400) 40%, transparent);
  color:var(--color-cyan-400);
  background:color-mix(in srgb, var(--color-cyan-400) 8%, transparent);
}
.tc-footer-ghost--accent:hover{background:color-mix(in srgb, var(--color-cyan-400) 16%, transparent);}
.tc-footer-cloud{
  padding:.5rem .85rem;border:none;border-radius:8px;
  background:linear-gradient(135deg,color-mix(in srgb, var(--color-purple-400) 86%, black),var(--color-cyan-400));
  color:var(--text-primary);font-size:.74rem;font-weight:700;cursor:pointer;
  transition:transform 150ms,box-shadow 150ms;
}
.tc-footer-cloud:hover{transform:translateY(-1px);box-shadow:0 4px 20px color-mix(in srgb, var(--color-purple-400) 40%, transparent);}
.tc-footer-cloud:disabled{opacity:.65;cursor:not-allowed;transform:none;}
.tc-footer-cloud--ok{background:linear-gradient(135deg,color-mix(in srgb, var(--color-cyan-400) 70%, black),var(--color-cyan-400));}
.tc-footer-save{
  flex:1;padding:.5rem .85rem;border-radius:8px;border:none;
  background:linear-gradient(135deg,var(--color-purple-400),var(--color-cyan-400));
  color:var(--text-primary);font-size:.78rem;font-weight:800;cursor:pointer;
  box-shadow:0 2px 14px color-mix(in srgb, var(--color-purple-400) 30%, transparent);transition:all 200ms;
}
.tc-footer-save:hover{transform:translateY(-1px);box-shadow:0 4px 22px color-mix(in srgb, var(--color-purple-400) 50%, transparent);}
.tc-footer-save--ok{background:linear-gradient(135deg,color-mix(in srgb, var(--color-cyan-400) 86%, black),var(--color-cyan-400));}

/* ── Notice ───────────────────────────────────────────── */
.tc-notice{
  padding:.55rem 1.25rem;font-size:.7rem;color:var(--color-cyan-400);
  background:color-mix(in srgb, var(--color-cyan-400) 10%, transparent);
  border-top:1px solid color-mix(in srgb, var(--color-cyan-400) 28%, transparent);
  flex-shrink:0;animation:tcFade 300ms ease;
}
.tc-notice--error{
  color:var(--color-pink-400);
  background:color-mix(in srgb, var(--color-pink-400) 10%, transparent);
  border-top-color:color-mix(in srgb, var(--color-pink-400) 32%, transparent);
}
.tc-notice code{
  font-family:monospace;
  background:color-mix(in srgb, var(--text-primary) 14%, transparent);
  padding:.03rem .26rem;border-radius:4px;
}

/* ── Icons in header/trigger ──────────────────────────── */
.tc-header-icon{font-size:1.55rem;line-height:1;}
.tc-trigger-icon{font-size:1.1rem;}
`;

