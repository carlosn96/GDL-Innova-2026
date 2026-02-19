/**
 * HeroSection Component - Componente refactorizado del Hero
 * 
 * Ejemplo de cómo refactorizar un componente usando la nueva arquitectura:
 * - Uso de datos centralizados
 * - Custom hooks para lógica reutilizable
 * - Componentes UI base
 * - Sin manipulación directa del DOM
 * - Separación de responsabilidades
 */

'use client';

import { useEffect } from 'react';
import { useSiteConfig } from '@/lib/site-context';
import { Card, GradientBox, Icon } from '@/components/ui';
import { generateParticles, generateNeurons } from '@/lib/utils';

export default function HeroSection() {
  const { siteConfig } = useSiteConfig();
  useEffect(() => {
    generateParticles('particleField');
    generateNeurons('neuralNetwork');
  }, []);

  const heroStats = [
    {
      id: 'duration',
      icon: 'fas fa-calendar',
      gradient: { from: 'cyan-500', to: 'cyan-600' },
      title: 'Duración',
      value: '2 Días Intensivos'
    },
    {
      id: 'teams',
      icon: 'fas fa-users',
      gradient: { from: 'purple-500', to: 'pink-600' },
      title: 'Equipos',
      value: 'Multidisciplinarios'
    },
    {
      id: 'focus',
      icon: 'fas fa-map-marker-alt',
      gradient: { from: 'pink-500', to: 'pink-600' },
      title: 'Enfoque',
      value: 'Guadalajara Local'
    }
  ];

  return (
    <section
      id="hero"
      data-section="hero"
      className="site-section relative min-h-screen flex items-center justify-center overflow-hidden hero-bg py-20"
    >
      

      {/* Containers for dynamic elements */}
      <div id="particleField" className="particle-field" />
      <div id="neuralNetwork" className="neural-network" />

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        

        {/* Logo 
        <img src="/logo.svg" alt="GDL Innova Logo" className="w-20 h-20 mx-auto mb-6" />
        */}
        
        {/* Title */}
        <h1 className="text-8xl md:text-8xl theme-text-primary theme-font-heading tracking- mb-6 neon-text">
          <span className="bg-clip-text text-transparent theme-font-heading" style={{ backgroundImage: 'var(--gradient-primary)' }}>
            {siteConfig.name}
          </span>
        </h1>

        {/* Subtitle */}
        <h2 className="text-3xl md:text-4xl theme-text-secondary mb-4">
          Co-Creación Interdisciplinaria IA
        </h2>

        {/* Description */}
        <p className="text-xl md:text-2xl theme-text-secondary mb-8 max-w-3xl mx-auto">
          Colaboración entre {' '}
          <span className="theme-accent-pink font-semibold">
            {siteConfig.organization.departments.design}
          </span>{' '}
          e{' '}
          <span className="theme-accent-purple font-semibold">
            {siteConfig.organization.departments.engineering}
          </span>
        </p>

        

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {heroStats.map(stat => (
            <Card
              key={stat.id}
              variant="glass"
              padding="md"
              hover
              className="magnetic-hover"
            >
              <GradientBox
                icon={stat.icon}
                gradientFrom={stat.gradient.from}
                gradientTo={stat.gradient.to}
                size="md"
                shape="rounded"
                className="mx-auto mb-4"
              />
              <h3 className="theme-accent-cyan-soft font-bold mb-2">{stat.title}</h3>
              <p className="theme-text-primary">{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-12">
          <a
            href="#about"
            className="inline-block px-8 py-4 rounded-full theme-btn-primary font-bold text-lg transition-all duration-300 transform hover:scale-105"
          >
            Conoce Más
            <Icon name="fas fa-arrow-down" className="ml-2" size="sm" />
          </a>
        </div>
      </div>
    </section>
  );
}
