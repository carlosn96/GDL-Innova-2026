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
import { siteConfig } from '@/config';
import { Badge, Card, GradientBox, Icon } from '@/components/ui';
import { generateParticles, generateNeurons } from '@/lib/utils';

export default function HeroSection() {
  useEffect(() => {
    generateParticles('particleField');
    generateNeurons('neuralNetwork');
  }, []);

  const heroStats = [
    {
      id: 'duration',
      icon: 'fas fa-calendar',
      gradient: { from: 'cyan-500', to: 'blue-600' },
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
      gradient: { from: 'pink-500', to: 'red-600' },
      title: 'Enfoque',
      value: 'Guadalajara Local'
    }
  ];

  return (
    <section 
      id="hero" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden hero-bg py-20"
    >
      {/* Background Effects */}
      <div className="floating-orb w-96 h-96 bg-purple-500 opacity-20 top-20 left-10" />
      <div 
        className="floating-orb w-64 h-64 bg-cyan-500 opacity-20 bottom-20 right-10" 
        style={{ animationDelay: '2s' }} 
      />

      {/* Containers for dynamic elements */}
      <div id="particleField" className="particle-field" />
      <div id="neuralNetwork" className="neural-network" />

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Event Badge */}
        <div className="mb-8">
          <Badge color="cyan" size="md" icon="fas fa-calendar-alt">
            Hackathon {siteConfig.event.year} - {siteConfig.event.period} • {siteConfig.organization.name}
          </Badge>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 neon-text">
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {siteConfig.name}
          </span>
        </h1>

        {/* Subtitle */}
        <h2 className="text-3xl md:text-4xl font-bold text-cyan-200 mb-4">
          Estrategia de Co-Creación Interdisciplinaria IA
        </h2>

        {/* Description */}
        <p className="text-xl md:text-2xl text-cyan-100 mb-8 max-w-3xl mx-auto">
          Un espacio de colaboración simbiótica entre la{' '}
          <span className="text-purple-400 font-semibold">
            {siteConfig.organization.departments.engineering}
          </span>{' '}
          y el{' '}
          <span className="text-pink-400 font-semibold">
            {siteConfig.organization.departments.design}
          </span>{' '}
          de la {siteConfig.organization.name}
        </p>

        {/* Departments Collaboration */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Card variant="glass" padding="sm" className="px-6 py-3">
            <Icon name="fas fa-code" className="text-cyan-400 mr-2" />
            <span className="text-white font-semibold">
              {siteConfig.organization.departments.engineering}
            </span>
          </Card>
          
          <div className="text-cyan-400 text-2xl">+</div>
          
          <Card variant="glass" padding="sm" className="px-6 py-3">
            <Icon name="fas fa-palette" className="text-pink-400 mr-2" />
            <span className="text-white font-semibold">
              {siteConfig.organization.departments.design}
            </span>
          </Card>
        </div>

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
              <h3 className="text-cyan-300 font-bold mb-2">{stat.title}</h3>
              <p className="text-white">{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-12">
          <a 
            href="#about" 
            className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full text-white font-bold text-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105"
          >
            Conoce Más
            <Icon name="fas fa-arrow-down" className="ml-2" size="sm" />
          </a>
        </div>
      </div>
    </section>
  );
}
