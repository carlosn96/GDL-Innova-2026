'use client';

import { SiteProvider, type SiteConfig } from '@/lib/site-context';

export function Providers({
  children,
  initialConfig,
}: {
  children: React.ReactNode;
  initialConfig?: Partial<SiteConfig>;
}) {
  return (
    <SiteProvider initialConfig={initialConfig}>
      {children}
    </SiteProvider>
  );
}