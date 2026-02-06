/**
 * Badge Component - Componente de insignia/etiqueta
 */

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ColorVariant } from '@/types';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: ColorVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, color = 'cyan', size = 'md', icon, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center rounded-full font-medium';
    
    const colors = {
      cyan: 'bg-cyan-500/20 text-cyan-300',
      purple: 'bg-purple-500/20 text-purple-300',
      pink: 'bg-pink-500/20 text-pink-300',
      blue: 'bg-blue-500/20 text-blue-300',
      red: 'bg-red-500/20 text-red-300',
      yellow: 'bg-yellow-500/20 text-yellow-300'
    };

    const sizes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };

    return (
      <span
        ref={ref}
        className={cn(
          baseStyles,
          colors[color],
          sizes[size],
          className
        )}
        {...props}
      >
        {icon && <i className={`${icon} mr-2`}></i>}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
