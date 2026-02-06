/**
 * GradientBox Component - Caja con gradiente e icono
 */

import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn, buildGradientClass } from '@/lib/utils';
import { Icon } from '../icon';

export interface GradientBoxProps extends HTMLAttributes<HTMLDivElement> {
  icon?: string;
  gradientFrom: string;
  gradientTo: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'square' | 'circle' | 'rounded';
  iconSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  children?: ReactNode;
}

export const GradientBox = forwardRef<HTMLDivElement, GradientBoxProps>(
  ({ 
    className, 
    icon, 
    gradientFrom, 
    gradientTo, 
    size = 'md',
    shape = 'rounded',
    iconSize = 'xl',
    children,
    ...props 
  }, ref) => {
    const sizes = {
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-16 h-16',
      xl: 'w-20 h-20'
    };

    const shapes = {
      square: '',
      circle: 'rounded-full',
      rounded: 'rounded-xl'
    };

    const gradientClass = buildGradientClass(gradientFrom, gradientTo);

    return (
      <div
        ref={ref}
        className={cn(
          gradientClass,
          sizes[size],
          shapes[shape],
          'flex items-center justify-center',
          className
        )}
        {...props}
      >
        {icon && <Icon name={icon} size={iconSize} className="text-white" />}
        {children}
      </div>
    );
  }
);

GradientBox.displayName = 'GradientBox';
