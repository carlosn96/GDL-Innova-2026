import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  metadata: {
    title: string;
    description: string;
    keywords: string[];
    author: string;
  };
  organization: {
    name: string;
    location: string;
    departments: {
      design: string;
      engineering: string;
    };
  };
  event: {
    year: number;
    period: string;
    duration: {
      days: number;
      schedule: string;
    };
    dates: {
      start: string;
      end: string;
    };
  };
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
  contact: {
    email: string;
    phone: string;
  };
  external: {
    favicon: string;
    calendarUrl: string;
  };
}

const defaultSiteConfig: SiteConfig = {
  name: 'GDL Innova Hackathon 2026 - A',
  description: 'Un espacio de colaboración entre el Diseño Gráfico y la Ingeniería en Computación de la Universidad UNE',
  url: 'https://gdlinnova.une.edu.mx',
  metadata: {
    title: 'GDL Innova Hackathon 2026 - A - Estrategia de Co-Creación Interdisciplinaria IA',
    description: 'Un espacio de colaboración entre el Diseño Gráfico y la Ingeniería en Computación de la Universidad UNE',
    keywords: ['hackathon', 'IA', 'inteligencia artificial', 'Guadalajara', 'UNE', 'diseño', 'ingeniería'],
    author: 'Juan Carlos González Aldana - Abigail Corona González',
  },
  organization: {
    name: '',
    location: 'Guadalajara, Jalisco, México',
    departments: {
      design: 'Diseño Gráfico',
      engineering: 'Ingeniería en Computación'
    }
  },
  event: {
    year: 2026,
    period: 'A',
    duration: {
      days: 2,
      schedule: '09:00 - 14:30'
    },
    dates: {
      start: '2026-02-03T16:00:00Z',
      end: '2026-02-04T21:30:00Z'
    }
  },
  social: {
    facebook: '#',
    instagram: '#',
    twitter: '#'
  },
  contact: {
    email: 'info@une.edu.mx',
    phone: '+52 (33) 1234 5678'
  },
  external: {
    favicon: '/favicon-custom.svg',
    calendarUrl: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=GDL%20Innova%20Hackathon%202026%20-%20A&dates=20260203T160000Z/20260204T213000Z&details=%C2%A1Prep%C3%A1rate%20para%20una%20experiencia%20electrizante%20que%20fusi%C3%B3na%20la%20creatividad%20humana%20con%20la%20inteligencia%20artificial!%20Sum%C3%A9rgete%20en%20el%20epicentro%20de%20la%20innovaci%C3%B3n%2C%20donde%20tus%20ideas%20cobrar%C3%A1n%20vida%20en%20proyectos%20reales%20que%20transformar%C3%A1n%20Guadalajara%20y%20catapultar%C3%A1n%20tu%20carrera%20hacia%20el%20futuro%20digital.&location=Universidad%20UNE%2C%20Guadalajara%2C%20Jalisco%2C%20M%C3%A9xico'
  }
};

interface SiteContextType {
  siteConfig: SiteConfig;
  updateSiteConfig: (updates: Partial<SiteConfig>) => void;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(defaultSiteConfig);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    const stored = window.localStorage.getItem('siteConfig');
    if (!stored) {
      hasMountedRef.current = true;
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      const nextConfig = { ...defaultSiteConfig, ...parsed };
      const timer = window.setTimeout(() => {
        setSiteConfig(nextConfig);
        hasMountedRef.current = true;
      }, 0);
      return () => window.clearTimeout(timer);
    } catch (error) {
      console.warn('Failed to parse stored site config:', error);
      hasMountedRef.current = true;
    }
  }, []);

  // Save to localStorage when config changes
  useEffect(() => {
    if (!hasMountedRef.current) return;
    localStorage.setItem('siteConfig', JSON.stringify(siteConfig));
  }, [siteConfig]);

  const updateSiteConfig = (updates: Partial<SiteConfig>) => {
    setSiteConfig(prev => ({ ...prev, ...updates }));
  };

  return (
    <SiteContext.Provider value={{ siteConfig, updateSiteConfig }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSiteConfig() {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSiteConfig must be used within a SiteProvider');
  }
  return context;
}