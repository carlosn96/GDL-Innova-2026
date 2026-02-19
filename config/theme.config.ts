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
        100: '#d9f5f3',
        200: '#aee8e5',
        300: '#73d2cd',
        400: '#009e9a',
        500: '#007f7c',
        600: '#006866'
      },
      purple: {
        100: '#ece6ff',
        200: '#d8ccff',
        300: '#b49dff',
        400: '#5b2eff',
        500: '#4a25d6',
        600: '#3d1fae'
      },
      pink: {
        100: '#fde5f0',
        200: '#fac5de',
        300: '#f58fbc',
        400: '#ed1e79',
        500: '#cf1668',
        600: '#aa1155'
      }
    },
    
    background: {
      dark: {
        primary: '#151216',
        secondary: '#201c1f',
        tertiary: '#2a252a',
        quaternary: '#332d33',
        quinary: '#3d353e'
      }
    },
    
    text: {
      primary: '#ffffff',
      secondary: '#e4e7f8',
      tertiary: '#cfd6ea',
      muted: '#94a3b8'
    }
  },
  
  gradients: {
    primary: {
      cyan: 'from-cyan-500 to-cyan-600',
      purple: 'from-purple-500 to-pink-600',
      pink: 'from-pink-500 to-pink-600',
      mixed: 'from-cyan-500 to-purple-600',
      hero: 'from-cyan-400 via-purple-400 to-pink-400'
    },
    
    background: {
      main: 'linear-gradient(135deg, #151216 0%, #201c1f 55%, #2a252a 100%)',
      hero: 'radial-gradient(ellipse at center, rgba(0, 158, 154, 0.16) 0%, transparent 70%)'
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
      heading: 'var(--font-inter)'
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
