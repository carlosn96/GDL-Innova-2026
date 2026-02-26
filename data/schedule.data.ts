/**
 * Schedule Data - Datos del cronograma del HACKATHON
 * 
 * Centraliza toda la información del cronograma para evitar hardcodeo
 * y facilitar actualizaciones.
 */

import { ScheduleDay } from '@/types';

export const scheduleData: ScheduleDay[] = [
  {
    dayNumber: 1,
    title: '',
    subtitle: '11 de marzo · Plantel Centro',
    dayOfMonth: 11,
    month: 'marzo',
    location: 'Plantel Centro',
    objective: 'Entender el reto y definir la identidad del proyecto',
    color: 'cyan',
    activities: [
      {
        id: 'day1-asistencia',
        icon: 'fas fa-clipboard-check',
        gradient: {
          from: 'cyan-500',
          to: 'cyan-600'
        },
        title: 'Pase de asistencia',
        timeRange: {
          start: '07:30',
          end: '08:00'
        },
        description: 'Pase de asistencia y bienvenida a los participantes'
      },
      {
        id: 'day1-inicio',
        icon: 'fas fa-flag-checkered',
        gradient: {
          from: 'cyan-500',
          to: 'cyan-600'
        },
        title: 'Inicio / Presentación de equipos',
        timeRange: {
          start: '08:00',
          end: '08:30'
        },
        description: 'Apertura oficial del HACKATHON y distribución de todos los equipos'
      },
      {
        id: 'day1-taller1',
        icon: 'fas fa-users',
        gradient: {
          from: 'cyan-500',
          to: 'cyan-600'
        },
        title: 'Taller 1',
        timeRange: {
          start: '08:30',
          end: '09:00'
        },
        description: 'Taller de convergencia — IC y Diseño Gráfico trabajan juntos para alinear visión y enfoque del reto'
      },
      {
        id: 'day1-taller2',
        icon: 'fas fa-robot',
        gradient: {
          from: 'cyan-500',
          to: 'cyan-600'
        },
        title: 'Taller 2',
        timeRange: {
          start: '09:00',
          end: '10:00'
        },
        description: 'IC (Auditorio): Uso ético de la IA en el desarrollo de MVPs · DG (Sala de Juicios Orales): IA como herramienta auxiliar en diseño gráfico y conceptualización creativa',
      },
      {
        id: 'day1-receso',
        icon: 'fas fa-coffee',
        gradient: {
          from: 'cyan-500',
          to: 'cyan-600'
        },
        title: 'Receso',
        timeRange: {
          start: '10:00',
          end: '10:30'
        },
        description: 'Pausa y espacio de networking entre participantes'
      },
      {
        id: 'day1-desarrollo',
        icon: 'fas fa-lightbulb',
        gradient: {
          from: 'cyan-500',
          to: 'cyan-600'
        },
        title: 'Desarrollo de reto',
        timeRange: {
          start: '10:30',
          end: '13:00'
        },
        description: 'Trabajo colaborativo por equipos para definir la propuesta de valor y comenzar el prototipo'
      },
      {
        id: 'day1-cierre',
        icon: 'fas fa-clipboard-check',
        gradient: {
          from: 'cyan-500',
          to: 'cyan-600'
        },
        title: 'Pase de asistencia / Cierre',
        timeRange: {
          start: '13:00',
          end: '13:30'
        },
        description: 'Registro de salida y cierre de actividades del día 1'
      }
    ]
  },
  {
    dayNumber: 2,
    title: '',
    subtitle: '12 de marzo · Plantel Zapopan',
    dayOfMonth: 12,
    month: 'marzo',
    location: 'Plantel Zapopan',
    objective: 'Integración técnica, presentación y premiación de la solución',
    color: 'purple',
    activities: [
      {
        id: 'day2-asistencia',
        icon: 'fas fa-clipboard-check',
        gradient: {
          from: 'cyan-500',
          to: 'cyan-600'
        },
        title: 'Pase de asistencia',
        timeRange: {
          start: '07:30',
          end: '07:50'
        },
        description: 'Pase de asistencia y bienvenida a los participantes'
      },
      {
        id: 'day2-inicio',
        icon: 'fas fa-rocket',
        gradient: {
          from: 'cyan-500',
          to: 'cyan-600'
        },
        title: 'Inicio',
        timeRange: {
          start: '07:50',
          end: '10:00'
        },
        description: 'Continuación del desarrollo del reto'
      },
      {
        id: 'day2-receso',
        icon: 'fas fa-coffee',
        gradient: {
          from: 'cyan-500',
          to: 'cyan-600'
        },
        title: 'Receso',
        timeRange: {
          start: '10:00',
          end: '10:30'
        },
        description: 'Pausa antes del sprint final'
      },
      {
        id: 'day2-sprint',
        icon: 'fas fa-code',
        gradient: {
          from: 'cyan-500',
          to: 'cyan-600'
        },
        title: 'Desarrollo de reto',
        timeRange: {
          start: '10:30',
          end: '11:30'
        },
        description: 'Sprint final — últimos ajustes al prototipo y preparación de la presentación'
      },
      {
        id: 'day2-entrega',
        icon: 'fas fa-upload',
        gradient: {
          from: 'cyan-500',
          to: 'cyan-600'
        },
        title: 'Finalización y entrega',
        timeRange: {
          start: '11:30',
          end: '12:00'
        },
        description: 'Entrega oficial del prototipo y materiales del proyecto'
      },
      {
        id: 'day2-demo',
        icon: 'fas fa-trophy',
        gradient: {
          from: 'cyan-500',
          to: 'cyan-600'
        },
        title: 'Exposición / Premiación',
        timeRange: {
          start: '12:00',
          end: '13:00'
        },
        description: 'Presentación final de proyectos ante el comité evaluador y ceremonia de premiación',
        isSpecial: true
      },
      {
        id: 'day2-cierre',
        icon: 'fas fa-clipboard-check',
        gradient: {
          from: 'cyan-500',
          to: 'cyan-600'
        },
        title: 'Pase de asistencia / Cierre',
        timeRange: {
          start: '13:30',
          end: '13:40'
        },
        description: 'Registro de salida y cierre oficial del HACKATHON'
      }
    ]
  }
];
