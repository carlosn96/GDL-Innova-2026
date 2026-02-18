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
      description: 'Color tecnológico protagonista. Aparece en íconos, brillos neon, bordes activos y acentos de alto impacto.',
      tokens: [
        tok('--color-cyan-100', 'Tinte muy claro',   'Fondos con toque tecnológico, áreas de baja densidad', '#e0f7ff'),
        tok('--color-cyan-200', 'Tinte claro',        'Superficies iluminadas, estados hover suaves', '#b3ecff'),
        tok('--color-cyan-300', 'Tinte medio',        'Bordes y separadores decorativos', '#86e1ff'),
        tok('--color-cyan-400', 'Color estrella',     'Acento principal: íconos, links, brillo neon', '#00f2fe', true),
        tok('--color-cyan-500', 'Tono puro',          'Botones y elementos interactivos principales', '#00c9db'),
        tok('--color-cyan-600', 'Sombra profunda',    'Bordes activos, hover oscuro, estados presionados', '#00a0b8'),
      ],
    },
    {
      id: uid(),
      name: 'Secundario — Púrpura',
      emoji: '🟣',
      description: 'Da profundidad y misterio al sistema. Se usa en botones secundarios, badges y elementos de apoyo.',
      tokens: [
        tok('--color-purple-100', 'Tinte muy claro',  'Fondos cálidos con carácter', '#f3e8ff'),
        tok('--color-purple-200', 'Tinte claro',       'Superficies iluminadas y paneles', '#e9d5ff'),
        tok('--color-purple-300', 'Tinte medio',       'Bordes y contrastes sutiles', '#d8b4fe'),
        tok('--color-purple-400', 'Color estrella',    'Acento secundario: badges, tags, highlights', '#8b5cf6', true),
        tok('--color-purple-500', 'Tono puro',         'Botones secundarios y elementos destacados', '#7c3aed'),
        tok('--color-purple-600', 'Sombra profunda',   'Estados hover, active, sombras coloreadas', '#6d28d9'),
      ],
    },
    {
      id: uid(),
      name: 'Acento — Rosa',
      emoji: '🩷',
      description: 'Aporta energía y urgencia. Útil en llamadas a la acción, notificaciones y elementos de alto contraste emocional.',
      tokens: [
        tok('--color-pink-100', 'Tinte muy claro',   'Fondos con energía vibrante', '#fce7f3'),
        tok('--color-pink-200', 'Tinte claro',        'Superficies y tarjetas pastel', '#fbcfe8'),
        tok('--color-pink-300', 'Tinte medio',        'Bordes decorativos y divisores', '#f9a8d4'),
        tok('--color-pink-400', 'Color estrella',     'Acento terciario: foco, alertas, llamadas urgentes', '#ec4899', true),
        tok('--color-pink-500', 'Tono puro',          'Gradientes de energía y estados activos', '#db2777'),
        tok('--color-pink-600', 'Sombra profunda',    'Sombras coloreadas, bordes de alerta', '#be185d'),
      ],
    },
    {
      id: uid(),
      name: 'Fondos del escenario',
      emoji: '🌑',
      description: 'Las capas del escenario visual — del más oscuro (base profunda) al más luminoso (elementos elevados).',
      tokens: [
        tok('--bg-dark-primary',    'Fondo base — El más profundo', 'Capa más baja, debajo de todo el contenido', '#0f0f23', true),
        tok('--bg-dark-secondary',  'Fondo 2 — Capa intermedia',    'Secciones y paneles principales', '#1a1a3e'),
        tok('--bg-dark-tertiary',   'Fondo 3 — Capa media',         'Tarjetas y contenedores', '#2d1b69'),
        tok('--bg-dark-quaternary', 'Fondo 4 — Capa elevada',       'Elementos flotantes sobre tarjetas', '#4c1d95'),
        tok('--bg-dark-quinary',    'Fondo 5 — El más luminoso',    'Highlights y detalles de mayor elevación', '#7c2d92'),
      ],
    },
    {
      id: uid(),
      name: 'Jerarquía tipográfica',
      emoji: '✏️',
      description: 'Define la jerarquía visual del texto — desde el titular máximo hasta las notas más silenciadas.',
      tokens: [
        tok('--text-primary',   'Texto principal',   'Titulares y cuerpo de texto general', '#ffffff', true),
        tok('--text-secondary', 'Texto de acento',   'Subtítulos, datos importantes, énfasis', '#a5f3fc'),
        tok('--text-tertiary',  'Texto de apoyo',    'Descripciones, metadatos, etiquetas', '#cbd5e1'),
        tok('--text-muted',     'Texto silenciado',  'Notas al pie, timestamps, disclaimers', '#94a3b8'),
      ],
    },
  ];
}

export function buildDefaultGradients(): GradientToken[] {
  return [
    grad('--gradient-primary',   'Degradado Primario',      'Fondo de secciones hero y banners principales',     135, [{ color: '#667eea', position: 0 }, { color: '#764ba2', position: 100 }]),
    grad('--gradient-secondary', 'Degradado Secundario',    'Botones call-to-action y elementos muy destacados',  135, [{ color: '#f093fb', position: 0 }, { color: '#f5576c', position: 100 }]),
    grad('--gradient-accent',    'Degradado de Acento',     'Pills, badges y pequeños detalles de energía',       135, [{ color: '#4facfe', position: 0 }, { color: '#00f2fe', position: 100 }]),
    grad('--gradient-hero',      'Degradado del Escenario', 'Fondo panorámico de la sección principal del sitio', 135, [
      { color: '#0f0f23', position: 0 },
      { color: '#1a1a3e', position: 25 },
      { color: '#2d1b69', position: 50 },
      { color: '#4c1d95', position: 75 },
      { color: '#7c2d92', position: 100 },
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
    stops: [{ color: '#6366f1', position: 0 }, { color: '#ec4899', position: 100 }],
  };
}
