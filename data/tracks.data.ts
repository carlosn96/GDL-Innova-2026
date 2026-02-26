/**
 * Tracks Data - Datos de los retos estratégicos del HACKATHON
 * 
 * Centraliza toda la información de los retos para evitar hardcodeo
 * y facilitar actualizaciones.
 */

import { Challenge } from '@/types';

export const tracksData: Challenge[] = [
  {
    id: 'escuelas-seguras',
    title: 'Escuelas seguras',
    subtitle: 'RETO 2026',
    icon: 'fas fa-shield-alt',
    gradient: {
      from: 'cyan-500',
      to: 'cyan-600'
    },
    description: 'El desafío consiste en diseñar y desarrollar una plataforma digital (aplicación móvil o sitio web) orientada a fortalecer la comunicación y la gestión de la seguridad en los planteles educativos de Guadalajara, facilitando la articulación entre las distintas instancias responsables.',
    problem: '• Control de acceso y reportes de incidencias alrededor del plantel.\n• Falta de canales de comunicación inmediata entre escuelas y autoridades.\n• Retrasos en la atención de incidentes en las inmediaciones del plantel.\n• Necesidad de alertas tempranas y notificaciones en tiempo real.\n• Identificación de zonas de riesgo en el entorno escolar.',
    objective: 'El objetivo final es contribuir a la construcción de entornos escolares más seguros mediante el uso estratégico de la tecnología, fortaleciendo la prevención, la respuesta oportuna y la confianza entre la comunidad educativa y las autoridades.',
    tags: [
      {
        label: 'Seguridad',
        color: 'cyan'
      },
      {
        label: 'Educación',
        color: 'purple'
      },
      {
        label: 'Tecnología Cívica',
        color: 'pink'
      }
    ]
  }
];

