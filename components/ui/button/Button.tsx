/**
 * Button Component - Componente de botón reutilizable
 */

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-full font-bold transition-all duration-300 transform hover:scale-105';
    
    const variants = {
      primary: 'px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:shadow-2xl hover:shadow-cyan-500/50',
      secondary: 'px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-xl hover:shadow-purple-500/50',
      outline: 'px-6 py-3 border-2 border-cyan-500 text-cyan-300 hover:bg-cyan-500/10',
      ghost: 'px-4 py-2 text-cyan-300 hover:bg-cyan-500/10'
    };

    const sizes = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
