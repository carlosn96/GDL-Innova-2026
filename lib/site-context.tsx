import { createContext, useContext, type ReactNode } from 'react';
import { siteConfig, type SiteConfig } from '@/config/site.config';

interface SiteContextType {
  siteConfig: SiteConfig;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export function SiteProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SiteContext.Provider value={{ siteConfig }}>
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