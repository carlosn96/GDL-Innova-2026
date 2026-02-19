export type FontCategory = 'sans-serif' | 'serif' | 'display' | 'monospace';

export interface FontOption {
  id: string;
  label: string;
  family: string;
  category: FontCategory;
}

export interface TypographySelection {
  primary: string;
  subheading: string;
  heading: string;
}

export const GOOGLE_FONT_OPTIONS: FontOption[] = [
  { id: 'inter', label: 'Inter', family: 'Inter', category: 'sans-serif' },
];

export const DEFAULT_TYPOGRAPHY: TypographySelection = {
  primary: 'inter',
  subheading: 'inter',
  heading: 'inter',
};
