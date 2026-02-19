import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import type { ColorFamily, GradientToken } from '@/components/ThemeConfigurator/tokens.data';
import type { TypographySelection } from '@/config/fonts.config';

import { getFirestoreDb, isFirebaseConfigured } from './client';

const THEMES_COLLECTION = 'themes';
const DEFAULT_THEME_DOC_ID = 'gdlinova';

function toFirestoreSafe(value: unknown): unknown {
  if (value === undefined) {
    return null;
  }

  if (Array.isArray(value)) {
    return value.map((item) => toFirestoreSafe(item));
  }

  if (value && typeof value === 'object') {
    const objectValue = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(objectValue).map(([key, nestedValue]) => [key, toFirestoreSafe(nestedValue)]),
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

export async function loadThemeFromFirestore(themeId = DEFAULT_THEME_DOC_ID): Promise<ThemeSnapshot | null> {
  if (!isFirebaseConfigured()) {
    return null;
  }

  const themeRef = doc(getFirestoreDb(), THEMES_COLLECTION, themeId);
  const snapshot = await getDoc(themeRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as Partial<ThemeSnapshot>;
  if (!Array.isArray(data.families) || !Array.isArray(data.gradients)) {
    return null;
  }

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
  themeId = DEFAULT_THEME_DOC_ID,
): Promise<void> {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase no está configurado. Define las variables NEXT_PUBLIC_FIREBASE_*');
  }

  const themeRef = doc(getFirestoreDb(), THEMES_COLLECTION, themeId);
  const safePayload = toFirestoreSafe(payload);

  await setDoc(
    themeRef,
    {
      ...((safePayload ?? {}) as Record<string, unknown>),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
