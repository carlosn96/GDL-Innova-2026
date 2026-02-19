/**
 * Schedule Data - Datos del cronograma del hackathon
 * 
 * Centraliza toda la información del cronograma para evitar hardcodeo
 * y facilitar actualizaciones.
 */

import { ScheduleDay } from '@/types';

export const scheduleData: ScheduleDay[] = [
  {
    dayNumber: 1,
    title: 'Día 1: Definición y Empatía',
    subtitle: 'Framing & Concept',
    objective: 'Entender los retos de Guadalajara y definir la identidad del proyecto',
    color: 'cyan',
    activities: [
      {
        id: 'day1-kickoff',
        icon: 'fas fa-flag-checkered',
        gradient: {
          from: 'cyan-500',
          to: 'cyan-600'
        },
        title: 'Kick-off: Retos GDL 2026',
        timeRange: {
          start: '09:00',
          end: '09:30'
        },
        description: 'Presentación de los programas sociales aprobados por el Ayuntamiento de Guadalajara'
      },
      {
        id: 'day1-ponencia',
        icon: 'fas fa-comments',
        gradient: {
          from: 'purple-500',
          to: 'pink-600'
        },
        title: 'Ponencia: Arquitectura Simbiótica',
        timeRange: {
          start: '09:30',
          end: '10:15'
        },
        description: 'Docentes de IC y LDGM explican cómo la IA une la Programación para Internet con el Diseño Web'
      },
      {
        id: 'day1-bootcamp',
        icon: 'fas fa-laptop-code',
        gradient: {
          from: 'cyan-500',
          to: 'purple-600'
        },
        title: 'Bootcamp: Prompting Pro',
        timeRange: {
          start: '10:15',
          end: '11:15'
        },
        description: 'Taller práctico de co-creación con Mistral Devstral 2 (Código) y Leonardo AI (Imagen)'
      },
      {
        id: 'day1-sprint',
        icon: 'fas fa-lightbulb',
        gradient: {
          from: 'pink-500',
          to: 'pink-600'
        },
        title: 'Sprint de Ideación',
        timeRange: {
          start: '11:15',
          end: '13:30'
        },
        description: 'Metodología Design Thinking para seleccionar un reto local y validar la propuesta de valor'
      },
      {
        id: 'day1-validation',
        icon: 'fas fa-check-double',
        gradient: {
          from: 'cyan-500',
          to: 'cyan-600'
        },
        title: 'Validación Docente',
        timeRange: {
          start: '13:30',
          end: '14:30'
        },
        description: 'Mentoría directa por mesa para definir el alcance del prototipo final'
      }
    ]
  },
  {
    dayNumber: 2,
    title: 'Día 2: Construcción y Demo Day',
    subtitle: 'Prototyping & Pitch',
    objective: 'Integración técnica y presentación de la solución',
    color: 'purple',
    activities: [
      {
        id: 'day2-ponencia',
        icon: 'fas fa-brain',
        gradient: {
          from: 'purple-500',
          to: 'pink-600'
        },
        title: 'Ponencia: Mindset MVP',
        timeRange: {
          start: '09:00',
          end: '09:45'
        },
        description: 'Cómo priorizar la funcionalidad básica para un entregable exitoso en 48 horas'
      },
      {
        id: 'day2-sprint',
        icon: 'fas fa-code',
        gradient: {
          from: 'cyan-500',
          to: 'purple-600'
        },
        title: 'Sprint de Desarrollo',
        timeRange: {
          start: '09:45',
          end: '12:30'
        },
        description: 'Codificación en Cursor y prototipado UI en Uizard. Docentes resuelven cuellos de botella'
      },
      {
        id: 'day2-testing',
        icon: 'fas fa-cogs',
        gradient: {
          from: 'pink-500',
          to: 'pink-600'
        },
        title: 'Pulido y Testeo IA',
        timeRange: {
          start: '12:30',
          end: '13:30'
        },
        description: 'Revisión de accesibilidad y optimización de llamados a APIs de Groq Cloud'
      },
      {
        id: 'day2-demo',
        icon: 'fas fa-trophy',
        gradient: {
          from: 'cyan-500',
          to: 'cyan-600'
        },
        title: 'Demo Day: Pitch GDL',
        timeRange: {
          start: '13:30',
          end: '14:30'
        },
        description: 'Presentación final de 3 minutos ante el comité docente evaluador',
        isSpecial: true
      }
    ]
  }
];
