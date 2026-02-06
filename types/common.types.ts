/**
 * Common Types - Sistema de tipos compartidos
 * 
 * Centraliza todos los tipos comunes utilizados en la aplicación
 * para garantizar consistencia y reutilización.
 */

export interface IconProps {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface GradientConfig {
  from: string;
  to: string;
  via?: string;
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface BaseComponent {
  id: string;
  className?: string;
  children?: React.ReactNode;
}

export interface LinkConfig {
  href: string;
  label: string;
  external?: boolean;
  icon?: string;
}

export type ColorVariant = 'cyan' | 'purple' | 'pink' | 'blue' | 'red' | 'yellow';
export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
