# GDL Innova Hackathon 2026 - A

Un espacio de colaboración entre el Diseño Gráfico y la Ingeniería en Computación de la Universidad UNE.

## 🚀 Stack Tecnológico

- **Framework:** Next.js 16.1.6 (App Router)
- **UI Library:** React 19.2.3
- **Lenguaje:** TypeScript 5
- **Estilos:** Tailwind CSS 4
- **Build Tool:** Turbopack

## 📁 Estructura del Proyecto

```
gdlinova/
├── app/                    # App Router de Next.js
│   ├── layout.tsx         # Layout principal con metadata
│   ├── page.tsx           # Página principal
│   └── globals.css        # Estilos globales con design tokens
├── components/            # Componentes de React
│   ├── ui/               # Componentes UI reutilizables
│   │   ├── button/       # Componente Button
│   │   ├── card/         # Componente Card
│   │   ├── badge/        # Componente Badge
│   │   ├── icon/         # Componente Icon
│   │   └── gradient-box/ # Componente GradientBox
│   ├── About.tsx         # Sección Estrategia Co-Creación
│   ├── CTA.tsx           # Call to Action
│   ├── Evaluation.tsx    # Criterios de Evaluación
│   ├── Footer.tsx        # Footer
│   ├── features/
│   │   └── hero/
│   │       └── HeroSection.tsx # Hero Section (refactorizado)
│   ├── Navigation.tsx    # Navegación
│   ├── Schedule.tsx      # Cronograma
│   ├── Tech.tsx          # Stack Tecnológico
│   └── Tracks.tsx        # Retos Estratégicos
├── config/               # Configuraciones centralizadas
│   ├── site.config.ts    # Configuración del sitio
│   ├── theme.config.ts   # Tokens de diseño
│   ├── navigation.config.ts # Links de navegación
│   └── constants.ts      # Constantes globales
├── data/                 # Datos estructurados
│   ├── schedule.data.ts  # Cronograma del evento
│   ├── tracks.data.ts    # Retos estratégicos
│   ├── tech-stack.data.ts # Stack tecnológico
│   └── evaluation.data.ts # Criterios de evaluación
├── lib/                  # Utilities y hooks
│   ├── hooks/           # Custom React Hooks
│   │   ├── useScrollProgress.ts
│   │   ├── useMagneticHover.ts
│   │   ├── useIntersectionObserver.ts
│   │   ├── useCursorTrail.ts
│   │   └── useSmoothScroll.ts
│   └── utils/           # Funciones utilitarias
│       ├── animation.utils.ts
│       └── format.utils.ts
├── types/               # TypeScript types
│   ├── common.types.ts
│   ├── challenge.types.ts
│   └── schedule.types.ts
└── styles/              # Estilos globales
    ├── theme/          # Design tokens CSS
    ├── animations/     # Animaciones
    └── utils/          # Clases helper
```

## 🏗️ Arquitectura

El proyecto sigue principios de:
- **SOLID:** Separación de responsabilidades
- **DRY:** No repetir código (datos centralizados)
- **KISS:** Simplicidad en componentes
- **Separation of Concerns:** Config, Data, Types, UI separados

### Características Clave

1. **Centralización de Datos:** Todos los datos en `/data`
2. **Sistema de Diseño:** Design tokens en CSS custom properties
3. **Componentes Reutilizables:** Biblioteca UI completa
4. **Type Safety:** TypeScript estricto en todo el proyecto
5. **Custom Hooks:** Lógica reutilizable encapsulada
6. **Zero Hardcoding:** Todo configurable desde archivos centrales

## 🛠️ Desarrollo

### Instalación

```bash
npm install
```

### Comandos Disponibles

```bash
# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm start

# Linting
npm run lint
```

### Variables de Entorno

Para persistir la paleta del `ThemeConfigurator` en Firestore, crea un archivo `.env.local`
basado en `.env.example`:

```bash
cp .env.example .env.local
```

Variables necesarias:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Firestore (tema)

- Crea un proyecto en Firebase Console.
- Habilita Firestore Database en modo nativo.
- Crea una app Web y copia sus credenciales a `.env.local`.
- El configurador guarda en la colección `themes`, documento `gdlinova`.

## 🎨 Design System

El proyecto incluye un sistema de diseño completo con:

- 50+ CSS custom properties (colores, espaciado, efectos)
- Componentes UI consistentes
- Animaciones reutilizables
- Utilidades CSS

## 🔧 Tecnologías Destacadas

- **React Compiler:** Optimizaciones automáticas
- **Turbopack:** Build ultra-rápido
- **CSS Custom Properties:** Theming flexible
- **TypeScript:** Type safety completo