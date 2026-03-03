import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HACKATHON - Estrategia de Co-Creación Interdisciplinaria IA',
    short_name: 'HACKATHON',
    description: 'Un espacio de colaboración entre el Diseño Gráfico y la Ingeniería en Computación de la Universidad UNE',
    start_url: '/',
    display: 'standalone',
    background_color: '#151216',
    theme_color: '#4a25d6',
    lang: 'es-MX',
    icons: [
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/logo-completo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}