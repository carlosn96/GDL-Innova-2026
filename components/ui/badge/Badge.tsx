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
      cyan: 'theme-badge-cyan',
      purple: 'theme-badge-purple',
      pink: 'theme-badge-pink',
      blue: 'theme-badge-cyan',
      red: 'theme-badge-pink',
      yellow: 'theme-badge-purple'
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
