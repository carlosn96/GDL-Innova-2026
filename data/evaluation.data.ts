/**
 * Evaluation Data - Datos de criterios de evaluación
 */

import { EVALUATION_CRITERIA } from '@/config';

export interface EvaluationCriterion {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: {
    from: string;
    to: string;
  };
  weight: number;
}

export const evaluationData: EvaluationCriterion[] = [
  {
    id: 'value-proposition',
    title: 'Propuesta de Valor',
    description: '¿Resuelve un reto real de los programas sociales de GDL 2026?',
    icon: 'fas fa-lightbulb',
    gradient: {
      from: 'cyan-500',
      to: 'cyan-600'
    },
    weight: EVALUATION_CRITERIA.VALUE_PROPOSITION
  },
  {
    id: 'interdependence',
    title: 'Interdependencia',
    description: '¿El diseño visual y la lógica del código son inseparables para el funcionamiento de la app?',
    icon: 'fas fa-link',
    gradient: {
      from: 'purple-500',
      to: 'pink-600'
    },
    weight: EVALUATION_CRITERIA.INTERDEPENDENCE
  },
  {
    id: 'ai-execution',
    title: 'Ejecución con IA',
    description: 'Calidad del prompt engineering y eficiencia del uso de APIs gratuitas',
    icon: 'fas fa-robot',
    gradient: {
      from: 'pink-500',
      to: 'pink-600'
    },
    weight: EVALUATION_CRITERIA.AI_EXECUTION
  },
  {
    id: 'accessibility-ethics',
    title: 'Accesibilidad y Ética',
    description: 'Cumplimiento con estándares WCAG y mitigación de sesgos algorítmicos',
    icon: 'fas fa-shield-alt',
    gradient: {
      from: 'cyan-500',
      to: 'purple-600'
    },
    weight: EVALUATION_CRITERIA.ACCESSIBILITY_ETHICS
  }
];

export const juryInfo = {
  title: 'Jurado Docente',
  icon: 'fas fa-trophy',
  description: 'El jurado docente utilizará una Rúbrica de Integridad Simbiótica bajo estos cuatro criterios clave, asegurando que cada prototipo represente una verdadera sinergia entre la lógica computacional y la creatividad visual, con impacto real en el entorno de Guadalajara.'
};
