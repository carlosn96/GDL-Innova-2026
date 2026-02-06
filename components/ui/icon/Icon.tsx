/**
 * Icon Component - Componente de icono con FontAwesome
 */

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface IconProps extends HTMLAttributes<HTMLElement> {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: string;
}

export const Icon = forwardRef<HTMLElement, IconProps>(
  ({ className, name, size = 'md', color, ...props }, ref) => {
    const sizes = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl'
    };

    return (
      <i
        ref={ref}
        className={cn(
          name,
          sizes[size],
          color,
          className
        )}
        {...props}
      />
    );
  }
);

Icon.displayName = 'Icon';
