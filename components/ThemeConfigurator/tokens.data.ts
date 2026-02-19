/**
 * tokens.data.ts — Modelo dinámico de paleta de colores
 *
 * Los datos iniciales replican el tokens.css del proyecto.
 * El diseñador puede crear nuevas familias, renombrarlas,
 * eliminarlas y modificar cada tono individualmente.
 * NO hay familias fijas: cian/púrpura/rosa son solo valores por defecto.
 */

// ─── ID helper (sin dependencias externas) ───────────────────────────────────

let _idCounter = 0;
export function uid(): string {
  return `tc-${Date.now()}-${++_idCounter}`;
}

// ─── tipos ────────────────────────────────────────────────────────────────────

export interface ColorToken {
  id: string;
  variable: string;   // nombre de la variable CSS (editable)
  label: string;      // nombre comprensible para el diseñador
  hint: string;       // dónde / cómo se usa
  value: string;
  isKey?: boolean;    // ¿tono protagonista de la familia?
}

export interface ColorFamily {
  id: string;
  name: string;       // editable por el diseñador
  emoji: string;      // editable
  description: string;
  tokens: ColorToken[];
}

export interface GradientStop {
  color: string;
  position: number;   // 0–100
}

export interface GradientToken {
  id: string;
  variable: string;
  label: string;
  hint: string;
  angle: number;      // 0–360
  stops: GradientStop[];
}

// ─── utilidades ───────────────────────────────────────────────────────────────

export function stopsToCSS(angle: number, stops: GradientStop[]): string {
  return `linear-gradient(${angle}deg, ${stops.map((s) => `${s.color} ${s.position}%`).join(', ')})`;
}

/** Genera un slug CSS-safe a partir del nombre de una familia */
export function familySlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function tok(variable: string, label: string, hint: string, value: string, isKey?: boolean): ColorToken {
  return { id: uid(), variable, label, hint, value, isKey };
}

function grad(variable: string, label: string, hint: string, angle: number, stops: GradientStop[]): GradientToken {
  return { id: uid(), variable, label, hint, angle, stops: stops.map((s) => ({ ...s })) };
}

// ─── paleta por defecto (espeja el tokens.css del proyecto) ──────────────────

export function buildDefaultFamilies(): ColorFamily[] {
  return [
    {
      id: uid(),
      name: 'Primario — Cian',
      emoji: '🔵',
      description: 'Color principal del sistema. El resto de tonos cian se derivan automáticamente.',
      tokens: [
        tok('--color-cyan-400', 'Color base', 'Acento principal: íconos, links y estados activos', '#009e9a', true),
      ],
    },
    {
      id: uid(),
      name: 'Secundario — Púrpura',
      emoji: '🟣',
      description: 'Color secundario del sistema. Sus variaciones se calculan automáticamente.',
      tokens: [
        tok('--color-purple-400', 'Color base', 'Apoyo visual en acciones secundarias y títulos destacados', '#5b2eff', true),
      ],
    },
    {
      id: uid(),
      name: 'Acento — Rosa',
      emoji: '🩷',
      description: 'Color acento del sistema. Sus variaciones se calculan automáticamente.',
      tokens: [
        tok('--color-pink-400', 'Color base', 'Acentos de alto contraste: highlights y alertas visuales', '#ed1e79', true),
      ],
    },
    {
      id: uid(),
      name: 'Fondo base',
      emoji: '🌑',
      description: 'Fondo principal del sitio. Las capas dark adicionales se derivan automáticamente.',
      tokens: [
        tok('--bg-dark-secondary', 'Fondo global base', 'Base visual general de todas las secciones', '#201c1f', true),
      ],
    },
    {
      id: uid(),
      name: 'Texto',
      emoji: '✏️',
      description: 'Jerarquía textual básica. El nivel terciario se deriva automáticamente del secundario.',
      tokens: [
        tok('--text-primary', 'Texto principal', 'Titulares y contenido principal', '#ffffff', true),
        tok('--text-secondary', 'Texto secundario', 'Subtítulos y párrafos de apoyo', '#e4e7f8'),
        tok('--text-muted', 'Texto auxiliar', 'Notas, metadatos y contenido de baja prioridad', '#94a3b8'),
      ],
    },
  ];
}

export function buildDefaultGradients(): GradientToken[] {
  return [
    grad('--gradient-primary',   'Degradado Primario',      'Fondo de secciones hero y banners principales',     135, [{ color: '#009e9a', position: 0 }, { color: '#5b2eff', position: 100 }]),
    grad('--gradient-secondary', 'Degradado Secundario',    'Botones call-to-action y elementos muy destacados',  135, [{ color: '#5b2eff', position: 0 }, { color: '#ed1e79', position: 100 }]),
    grad('--gradient-accent',    'Degradado de Acento',     'Pills, badges y pequeños detalles de energía',       135, [{ color: '#009e9a', position: 0 }, { color: '#ed1e79', position: 100 }]),
    grad('--gradient-hero',      'Degradado del Escenario', 'Fondo panorámico de la sección principal del sitio', 135, [
      { color: '#151216', position: 0 },
      { color: '#201c1f', position: 55 },
      { color: '#2a252a', position: 100 },
    ]),
  ];
}

/** Devuelve un token nuevo listo para editar */
export function newToken(familyName: string, index: number): ColorToken {
  const n = index + 1;
  const slug = familySlug(familyName);
  return {
    id: uid(),
    variable: `--color-${slug}-${n}`,
    label: `Tono ${n}`,
    hint: 'Describe dónde se usará este color',
    value: '#6366f1',
  };
}

/** Devuelve una familia nueva lista para editar */
export function newFamily(): ColorFamily {
  return {
    id: uid(),
    name: 'Nueva familia',
    emoji: '🎨',
    description: 'Describe el propósito de esta familia de colores',
    tokens: [],
  };
}

/** Devuelve una parada de degradado nueva */
export function newGradientStop(color = '#6366f1'): GradientStop {
  return { color, position: 50 };
}

/** Devuelve un degradado nuevo listo para editar */
export function newGradient(): GradientToken {
  return {
    id: uid(),
    variable: `--gradient-custom-${uid()}`,
    label: 'Nuevo degradado',
    hint: 'Describe dónde se usará este degradado',
    angle: 135,
    stops: [{ color: '#5b2eff', position: 0 }, { color: '#ed1e79', position: 100 }],
  };
}
