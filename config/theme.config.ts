/**
 * Theme Configuration - Sistema de diseño centralizado
 * 
 * Define todos los tokens de diseño: colores, gradientes, sombras,
 * animaciones y espaciados del sistema.
 */

export const theme = {
  colors: {
    primary: {
      cyan: {
        100: '#e0f7ff',
        200: '#b3ecff',
        300: '#86e1ff',
        400: '#00f2fe',
        500: '#00c9db',
        600: '#00a0b8'
      },
      purple: {
        100: '#f3e8ff',
        200: '#e9d5ff',
        300: '#d8b4fe',
        400: '#8b5cf6',
        500: '#7c3aed',
        600: '#6d28d9'
      },
      pink: {
        100: '#fce7f3',
        200: '#fbcfe8',
        300: '#f9a8d4',
        400: '#ec4899',
        500: '#db2777',
        600: '#be185d'
      }
    },
    
    background: {
      dark: {
        primary: '#0f0f23',
        secondary: '#1a1a3e',
        tertiary: '#2d1b69',
        quaternary: '#4c1d95',
        quinary: '#7c2d92'
      }
    },
    
    text: {
      primary: '#ffffff',
      secondary: '#a5f3fc',
      tertiary: '#cbd5e1',
      muted: '#94a3b8'
    }
  },
  
  gradients: {
    primary: {
      cyan: 'from-cyan-500 to-blue-600',
      purple: 'from-purple-500 to-pink-600',
      pink: 'from-pink-500 to-red-600',
      mixed: 'from-cyan-500 to-purple-600',
      hero: 'from-cyan-400 via-purple-400 to-pink-400'
    },
    
    background: {
      main: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 25%, #2d1b69 50%, #4c1d95 75%, #7c2d92 100%)',
      hero: 'radial-gradient(ellipse at center, rgba(103, 126, 234, 0.15) 0%, transparent 70%)'
    }
  },
  
  effects: {
    glass: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
    },
    
    neonGlow: {
      small: '0 0 20px currentColor',
      medium: '0 0 20px currentColor, 0 0 40px currentColor',
      large: '0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor'
    },
    
    hover: {
      scale: 'scale(1.05)',
      translateY: 'translateY(-5px)',
      shadow: '0 20px 40px rgba(0, 242, 254, 0.3)'
    }
  },
  
  spacing: {
    section: {
      py: 'py-20',
      px: 'px-4'
    },
    container: {
      sm: 'max-w-4xl',
      md: 'max-w-5xl',
      lg: 'max-w-6xl',
      xl: 'max-w-7xl'
    }
  },
  
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '800ms'
    },
    
    easing: {
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.23, 1, 0.320, 1)',
      elastic: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)'
    }
  },
  
  typography: {
    fonts: {
      primary: 'var(--font-inter)',
      heading: 'var(--font-orbitron)'
    },
    
    sizes: {
      heading: {
        h1: 'text-4xl md:text-6xl',
        h2: 'text-4xl md:text-5xl',
        h3: 'text-2xl md:text-3xl',
        h4: 'text-xl md:text-2xl'
      }
    }
  }
} as const;

export type Theme = typeof theme;
