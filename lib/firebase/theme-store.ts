import { get, ref, set } from 'firebase/database';

import type { ColorFamily, GradientToken } from '@/components/ThemeConfigurator/tokens.data';
import type { TypographySelection } from '@/config/fonts.config';

import { getRTDB, isFirebaseConfigured } from './client';

const DEFAULT_THEME_PATH = 'themes/gdlinova';

/** Elimina valores `undefined` que RTDB no acepta */
function clean(value: unknown): unknown {
  if (value === undefined) return null;
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, clean(v)]),
    );
  }
  return value;
}

export interface ThemeSnapshot {
  families: ColorFamily[];
  gradients: GradientToken[];
  sectionBaseColor?: string;
  sectionFilters?: Record<string, string>;
  typography?: TypographySelection;
  eventName?: string;
  devElements?: Record<string, unknown>;
  updatedAt?: unknown;
}

export async function loadThemeFromFirestore(themePath = DEFAULT_THEME_PATH): Promise<ThemeSnapshot | null> {
  if (!isFirebaseConfigured()) return null;

  const snapshot = await get(ref(getRTDB(), themePath));
  if (!snapshot.exists()) return null;

  const data = snapshot.val() as Partial<ThemeSnapshot>;
  if (!Array.isArray(data.families) || !Array.isArray(data.gradients)) return null;

  return {
    families: data.families as ColorFamily[],
    gradients: data.gradients as GradientToken[],
    sectionBaseColor: data.sectionBaseColor,
    sectionFilters: data.sectionFilters,
    typography: data.typography,
    eventName: data.eventName,
    devElements: data.devElements,
    updatedAt: data.updatedAt,
  };
}

export async function saveThemeToFirestore(
  payload: Pick<ThemeSnapshot, 'families' | 'gradients'> & Partial<Pick<ThemeSnapshot, 'sectionBaseColor' | 'sectionFilters' | 'typography' | 'eventName' | 'devElements'>>,
  themePath = DEFAULT_THEME_PATH,
): Promise<void> {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase no está configurado. Define NEXT_PUBLIC_FIREBASE_API_KEY y NEXT_PUBLIC_FIREBASE_DATABASE_URL');
  }

  // RTDB hace merge manual: leer primero, luego escribir
  const existing = await loadThemeFromFirestore(themePath);
  const merged = { ...(existing ?? {}), ...payload, updatedAt: Date.now() };

  await set(ref(getRTDB(), themePath), clean(merged));
}
