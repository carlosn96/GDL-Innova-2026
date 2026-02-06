/**
 * Tracks Data - Datos de los retos estratégicos del hackathon
 * 
 * Centraliza toda la información de los retos para evitar hardcodeo
 * y facilitar actualizaciones.
 */

import { Challenge } from '@/types';

export const tracksData: Challenge[] = [
  {
    id: 'escuelas-corresponsabilidad',
    title: 'Escuelas con Corresponsabilidad',
    subtitle: 'IA para la Educación',
    icon: 'fas fa-school',
    gradient: {
      from: 'cyan-500',
      to: 'blue-600'
    },
    description: 'Sistemas de IA para gestionar la comunicación y seguridad en planteles educativos de Guadalajara',
    problem: 'Brecha en el reporte de daños estructurales y falta de canales eficientes entre padres, maestros y gobierno.',
    synergy: [
      {
        role: 'IC',
        description: 'Implementa un motor de Visión Artificial (vía Gemini 2.0 Flash) que clasifica automáticamente el nivel de urgencia de daños estructurales a partir de una foto enviada por un usuario.'
      },
      {
        role: 'LDGM',
        description: 'Diseña la Arquitectura de Información de la plataforma, asegurando que el flujo de reporte sea inclusivo para adultos mayores y docentes con baja alfabetización digital.'
      }
    ],
    aiValue: 'Un agente de IA que redacta automáticamente el oficio formal de reporte basado en la imagen analizada.',
    tags: [
      {
        label: 'Educación',
        color: 'cyan'
      }
    ]
  },
  {
    id: 'corazon-contento',
    title: 'Corazón Contento',
    subtitle: 'IA para la Seguridad Alimentaria',
    icon: 'fas fa-utensils',
    gradient: {
      from: 'purple-500',
      to: 'pink-600'
    },
    description: 'Aplicaciones que optimicen la logística de los comedores comunitarios municipales',
    problem: 'Desperdicio de insumos por falta de predicción de asistencia y dificultades en la localización de los comedores para la población vulnerable.',
    synergy: [
      {
        role: 'IC',
        description: 'Desarrolla un algoritmo de Análisis Predictivo que estima la demanda semanal de alimentos basado en datos históricos de asistencia y clima local.'
      },
      {
        role: 'LDGM',
        description: 'Crea el Visual Storytelling del impacto del programa, diseñando un tablero (dashboard) interactivo que comunique de forma transparente cuántas personas han sido alimentadas y en qué zonas se requiere más apoyo.'
      }
    ],
    aiValue: 'Uso de modelos multimodales para generar recetas saludables de bajo costo basadas en los excedentes de insumos del día.',
    tags: [
      {
        label: 'Alimentación',
        color: 'purple'
      }
    ],
    animationDelay: '2s'
  },
  {
    id: 'guardianes-ciudad',
    title: 'Guardianes de la Ciudad',
    subtitle: 'IA para el Urbanismo',
    icon: 'fas fa-city',
    gradient: {
      from: 'pink-500',
      to: 'red-600'
    },
    description: 'Herramientas de reporte ciudadano inteligente que analicen fallas en infraestructura urbana mediante visión artificial',
    problem: 'Los ciudadanos se sienten desconectados del mantenimiento de su calle; el reporte de baches o luminarias es lento y poco gratificante.',
    synergy: [
      {
        role: 'IC',
        description: 'Construye una herramienta web que integra la API de Ruteo de INEGI para optimizar las rutas de las brigadas de reparación basadas en los reportes ciudadanos geolocalizados.'
      },
      {
        role: 'LDGM',
        description: 'Diseña una Experiencia Gamificada donde los ciudadanos ganan insignias de "Guardián Oro" al validar reportes de otros usuarios, utilizando una identidad visual que refuerce el orgullo tapatío.'
      }
    ],
    aiValue: 'Detección inteligente de objetos en espacio público (basura, grafiti no artístico, daños) para asignar tareas automáticamente.',
    tags: [
      {
        label: 'Urbanismo',
        color: 'pink'
      }
    ],
    animationDelay: '4s'
  },
  {
    id: 'renta-jovenes',
    title: 'Renta para Jóvenes / Centro Histórico',
    subtitle: 'IA para la Vivienda',
    icon: 'fas fa-home',
    gradient: {
      from: 'cyan-500',
      to: 'purple-600'
    },
    description: 'Plataformas de visualización y matching para fomentar que los estudiantes vivan en el primer cuadro de la ciudad',
    problem: 'Dificultad para encontrar edificios con vocación de renta para estudiantes y falta de confianza entre arrendadores y jóvenes.',
    synergy: [
      {
        role: 'IC',
        description: 'Implementa un sistema de Matching Inteligente entre el perfil del estudiante (habilidades, horarios, presupuesto) y las opciones disponibles en el inventario de vivienda de la API de SEDATU.'
      },
      {
        role: 'LDGM',
        description: 'Diseña una interfaz de Exploración Visual del Centro Histórico, destacando no solo la vivienda sino los servicios culturales y de transporte cercanos, utilizando diseño de experiencias interactivas para "vender" el estilo de vida del centro.'
      }
    ],
    aiValue: 'Un asistente conversacional que analiza contratos de arrendamiento en tiempo real para explicar cláusulas complejas en lenguaje sencillo para el estudiante.',
    tags: [
      {
        label: 'Vivienda',
        color: 'cyan'
      }
    ]
  }
];
