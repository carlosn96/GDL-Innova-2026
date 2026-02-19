# Auditoría de tema (paleta simplificada)

## Paleta final aplicada

- Primario: `--color-cyan-400` = `#009e9a`
- Secundario: `--color-purple-400` = `#5b2eff`
- Acento: `--color-pink-400` = `#ed1e79`
- Texto principal: `--text-primary` = `#ffffff`
- Texto secundario: `--text-secondary` = `#e4e7f8`
- Texto auxiliar: `--text-muted` = `#94a3b8`
- Fondo base: `--section-base-bg` / `--bg-dark-secondary` = `#201c1f`

## Dónde se usa cada color clave

### Primario (`--color-cyan-*`)
- Clases: `.theme-accent-cyan`, `.theme-accent-cyan-soft`, `.theme-btn-*`, `.theme-badge-cyan`, `.theme-card-gradient`, `.scroll-progress`, `.neuron`, `.particle`.
- Componentes: navegación, hero, about, schedule, tracks, tech, evaluation, CTA, footer.
- UI base: `GradientBox`, `Badge`, `Button`, `Card` (vía clases tema y gradientes).

### Secundario (`--color-purple-*`)
- Clases: `.theme-accent-purple`, `.theme-accent-purple-soft`, `.theme-badge-purple`, `.theme-card-gradient`, `.scroll-progress`.
- Componentes: hero, about, schedule, tracks, tech, evaluation, footer.
- Datos: `schedule.data.ts`, `tech-stack.data.ts`, `evaluation.data.ts`.

### Acento (`--color-pink-*`)
- Clases: `.theme-accent-pink`, `.theme-accent-pink-soft`, `.theme-badge-pink`, `.scroll-progress`.
- Componentes: hero, tracks (modal), tech, evaluation, CTA.
- Datos: `evaluation.data.ts`, `tech-stack.data.ts`, `schedule.data.ts`.

## Variables por componente (barrido completo)

- `app/page.tsx`: composición de secciones (sin tokens directos).
- `components/Navigation.tsx`: `theme-text-primary`, `theme-font-heading`, `theme-accent-cyan-soft`, `glass-card`, `theme-interactive`.
- `components/features/hero/HeroSection.tsx`: `var(--gradient-primary)`, `theme-text-*`, `theme-accent-*`, `theme-btn-primary`; gradientes de stats usando tokens `cyan/purple/pink` simplificados.
- `components/About.tsx`: `theme-title-gradient`, `theme-text-*`, `theme-accent-*`; `GradientBox` con `cyan-500→cyan-600` y `purple-500→pink-600`.
- `components/Schedule.tsx`: `theme-title-gradient`, `theme-text-*`, `theme-accent-*`, `theme-border-muted`; `GradientBox` por día/actividad con tokens simplificados.
- `components/Tracks.tsx`: `theme-title-gradient`, `theme-text-*`, `theme-accent-*`, `theme-overlay-backdrop`, `theme-border-muted`; badges por familia de color.
- `components/Tech.tsx`: `theme-title-gradient`, `theme-text-*`, `theme-accent-*`; gradientes de categorías simplificados.
- `components/Evaluation.tsx`: `theme-title-gradient`, `theme-text-*`, `theme-accent-*`; gradientes de criterios simplificados.
- `components/CTA.tsx`: `theme-title-gradient`, `theme-btn-primary`, `theme-accent-*`, `theme-text-*`.
- `components/Footer.tsx`: `theme-title-gradient`, `theme-accent-*`, `theme-text-muted`, `theme-border-muted`.

### UI base
- `components/ui/gradient-box/GradientBox.tsx`: consume `buildGradientStyle` (resuelve a variables `--color-*`).
- `components/ui/badge/Badge.tsx`: mapea a `.theme-badge-cyan|purple|pink`.
- `components/ui/button/Button.tsx`: usa `.theme-btn-primary|secondary|outline|ghost`.
- `components/ui/card/Card.tsx`: usa `.theme-card-default|theme-card-gradient|glass-card`.
- `components/ui/icon/Icon.tsx`: sin tokens de color directos (hereda contexto/clases).

### Sistema de tema
- `styles/theme/tokens.css`: fuente única de verdad (paleta, gradientes, tipografía, fondos).
- `app/globals.css`: utilidades semánticas (`theme-*`) y efectos visuales conectados a variables.
- `styles/utils/helpers.css`: helpers visuales conectados a variables.
- `lib/utils/format.utils.ts`: resolución de tokens de gradiente.
- `lib/utils/animation.utils.ts`: partículas y fallback de paleta simplificados.
- `components/ThemeConfigurator/*`: defaults y presets alineados a paleta simplificada.

## Reducción aplicada

- Se mantuvieron los mismos nombres de variables para compatibilidad, pero con **menos familias efectivas de color**.
- Se eliminaron combinaciones de gradiente `blue-*` y `red-*` en secciones y datasets.
- Se unificó tipografía en **Inter** para `primary`, `subheading` y `heading`.
- Se sustituyeron hardcodes de color en estilos globales/helpers por variables de tema.
- El configurador quedó en **modo simple fijo**: solo variables base (primario/secundario/acento, texto y fondo).
- Las variaciones (`100/200/300/500/600`) se derivan automáticamente desde los colores `400`.
- Mapa de degradados fijo y explícito:
	- `--gradient-primary`: títulos y botón principal.
	- `--gradient-secondary`: CTA secundario.
	- `--gradient-accent`: badges y acentos.
	- `--gradient-hero`: fondo de hero.
