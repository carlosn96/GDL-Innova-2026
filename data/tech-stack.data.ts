/**
 * Tech Stack Data - Datos del stack tecnológico
 */

export interface TechCategory {
  id: string;
  title: string;
  icon: string;
  gradient: {
    from: string;
    to: string;
  };
  items: TechItem[];
}

export interface TechItem {
  name: string;
  description: string;
  icon?: string;
}

export const techStackData: TechCategory[] = [
  {
    id: 'engineering',
    title: 'Para el Ingeniero (IC)',
    icon: 'fas fa-microchip',
    gradient: {
      from: 'cyan-500',
      to: 'blue-600'
    },
    items: [
      {
        name: 'Mistral Devstral 2',
        description: 'Modelo optimizado para codificación agéntica'
      },
      {
        name: 'OpenRouter Free Models',
        description: 'Acceso sin tarjeta a Llama 3.3 70B y Gemini 2.0 Flash'
      },
      {
        name: 'Groq Cloud',
        description: 'Inferencia de ultra alta velocidad para respuestas en tiempo real'
      }
    ]
  },
  {
    id: 'design',
    title: 'Para el Diseñador (LDGM)',
    icon: 'fas fa-code',
    gradient: {
      from: 'purple-500',
      to: 'pink-600'
    },
    items: [
      {
        name: 'Uizard Autodesigner',
        description: 'Generación de wireframes interactivos a partir de texto o bocetos'
      },
      {
        name: 'Adobe Firefly (Capa Free)',
        description: 'Edición generativa y creación de activos de marca coherentes'
      },
      {
        name: 'ElevenLabs',
        description: 'Generación de voces naturales para prototipos de asistentes de voz'
      }
    ]
  },
  {
    id: 'ux',
    title: 'Diseño de Experiencia',
    icon: 'fas fa-palette',
    gradient: {
      from: 'pink-500',
      to: 'red-600'
    },
    items: [
      {
        name: 'Uizard',
        description: 'Transformar bocetos en UI'
      },
      {
        name: 'Leonardo AI',
        description: 'Activos visuales coherentes'
      }
    ]
  }
];
