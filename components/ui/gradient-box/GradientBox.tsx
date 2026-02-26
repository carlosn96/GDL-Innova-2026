/**
 * GradientBox Component - Caja con gradiente e icono
 */

import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn, buildGradientStyle } from '@/lib/utils';
import { Icon } from '../icon';

export interface GradientBoxProps extends HTMLAttributes<HTMLDivElement> {
  icon?: string;
  gradientFrom: string;
  gradientTo: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'square' | 'circle' | 'rounded';
  iconSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  iconColor?: string;
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
    iconColor = 'theme-text-primary',
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

    const gradientStyle = gradientFrom.startsWith('#') && gradientTo.startsWith('#') 
      ? `linear-gradient(360deg, ${gradientFrom}, ${gradientTo})`
      : buildGradientStyle(gradientFrom, gradientTo);

    return (
      <div
        ref={ref}
        className={cn(
          sizes[size],
          shapes[shape],
          'flex items-center justify-center',
          className
        )}
        style={{ backgroundImage: gradientStyle }}
        {...props}
      >
        {icon && <Icon name={icon} size={iconSize} className={iconColor} />}
        {children}
      </div>
    );
  }
);

GradientBox.displayName = 'GradientBox';
