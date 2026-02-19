'use client';

import { useState } from 'react';
import { navigationLinks } from '@/config';
import { useSiteConfig } from '@/lib/site-context';
import { useSmoothScroll } from '@/lib/hooks';
import { Icon } from './ui';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { siteConfig } = useSiteConfig();
  useSmoothScroll();

  return (
    <>
      {/* Scroll Progress Indicator */}
      <div className="scroll-indicator">
        <div id="scrollProgress" className="scroll-progress"></div>
      </div>

      <nav className="fixed w-full top-0 z-50 glass-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img src="/logo.svg" alt={`${siteConfig.organization.name} Logo`} className="w-10 h-10" />
              <span className="theme-text-primary theme-font-heading font-bold text-xl">{siteConfig.name}</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              {navigationLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="theme-accent-cyan-soft theme-interactive transition"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <button
              id="mobile-menu-button"
              className="md:hidden theme-accent-cyan-soft theme-interactive"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Icon
                name={mobileMenuOpen ? 'fas fa-times' : 'fas fa-bars'}
                size="2xl"
              />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden ${mobileMenuOpen ? '' : 'hidden'} glass-card`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="mobile-menu-link block px-3 py-2 theme-accent-cyan-soft theme-interactive"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}