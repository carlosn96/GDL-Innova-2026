/**
 * Site Configuration - Configuración central del sitio
 * 
 * Centraliza toda la configuración del sitio incluyendo metadata,
 * SEO, URLs y información de contacto.
 */

export const siteConfig = {
    name: 'HACKATHON',
    description: 'Un espacio de colaboración entre el Diseño Gráfico y la Ingeniería en Computación de la Universidad UNE',
    url: 'https://gdlinnova.une.edu.mx',

    metadata: {
        title: 'HACKATHON - Estrategia de Co-Creación Interdisciplinaria IA',
        description: 'Un espacio de colaboración entre el Diseño Gráfico y la Ingeniería en Computación de la Universidad UNE',
        keywords: ['HACKATHON', 'IA', 'inteligencia artificial', 'Guadalajara', 'UNE', 'diseño', 'ingeniería'],
        author: 'Juan Carlos González Aldana - Abigail Corona González',
    },

    organization: {
        name: '',
        location: 'Guadalajara, Jalisco, México',
        departments: {
            design: 'Diseño Gráfico',
            engineering: 'Ingeniería en Computación'
        }
    },

    event: {
        year: 2026,
        period: 'A',
        duration: {
            days: 2,
            schedule: '07:30 - 13:00'
        },
        dates: {
            start: '2026-02-11T16:00:00Z',
            end: '2026-02-04T21:30:00Z'
        }
    },

    social: {
        facebook: '#',
        instagram: '#',
        twitter: '#'
    },

    contact: {
        email: 'info@une.edu.mx',
        phone: '+52 (33) 1234 5678'
    },

    external: {
        favicon: '/favicon-custom.svg',
        calendarUrl: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=GDL%20Innova%20HACKATHON%202026%20-%20A&dates=20260203T160000Z/20260204T213000Z&details=%C2%A1Prep%C3%A1rate%20para%20una%20experiencia%20electrizante%20que%20fusi%C3%B3na%20la%20creatividad%20humana%20con%20la%20inteligencia%20artificial!%20Sum%C3%A9rgete%20en%20el%20epicentro%20de%20la%20innovaci%C3%B3n%2C%20donde%20tus%20ideas%20cobrar%C3%A1n%20vida%20en%20proyectos%20reales%20que%20transformar%C3%A1n%20Guadalajara%20y%20catapultar%C3%A1n%20tu%20carrera%20hacia%20el%20futuro%20digital.&location=Universidad%20UNE%2C%20Guadalajara%2C%20Jalisco%2C%20M%C3%A9xico'
    }
} as const;

export type SiteConfig = typeof siteConfig;
