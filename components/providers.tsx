'use client';

import { SiteProvider } from '@/lib/site-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SiteProvider>
      {children}
    </SiteProvider>
  );
}