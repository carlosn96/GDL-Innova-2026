'use client';

/**
 * ThemeConfigurator — v2
 *
 * Panel completamente dinámico de personalización cromática para diseñadores.
 * Sin familias fijas: el diseñador puede crear, renombrar y eliminar
 * cualquier familia y cualquier tono. Los cambios se aplican al DOM
 * en tiempo real. El botón "Guardar CSS" descarga tokens.css listo para
 * reemplazar styles/theme/tokens.css en el proyecto.
 */

import { useState, useEffect, useCallback, useRef, type ChangeEvent } from 'react';
import {
  buildDefaultFamilies,
  buildDefaultGradients,
  stopsToCSS,
  newToken,
  newFamily,
  newGradient,
  newGradientStop,
  type ColorToken,
  type ColorFamily,
  type GradientToken,
  type GradientStop,
} from './tokens.data';

// ─── helpers ─────────────────────────────────────────────────────────────────

function luminance(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
function fg(hex: string) { return luminance(hex) > 0.55 ? '#111' : '#fff'; }

function applyToDOM(families: ColorFamily[], gradients: GradientToken[]) {
  const root = document.documentElement;
  families.forEach((fam) => fam.tokens.forEach((t) => root.style.setProperty(t.variable, t.value)));
  gradients.forEach((g) => root.style.setProperty(g.variable, stopsToCSS(g.angle, g.stops)));
}

function generateCSS(families: ColorFamily[], gradients: GradientToken[]): string {
  const date = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  const L: string[] = [
    '/**',
    ' * Design Tokens — Paleta exportada desde el Configurador de Tema',
    ` * Generado el ${date}`,
    ' * Para instalar: reemplaza styles/theme/tokens.css con este archivo.',
    ' */',
    '', ':root {',
  ];
  families.forEach((fam) => {
    L.push(`  /* === ${fam.name.toUpperCase()} === */`);
    fam.tokens.forEach((t) => L.push(`  ${t.variable}: ${t.value};`));
    L.push('');
  });
  L.push('  /* === DEGRADADOS === */');
  gradients.forEach((g) => L.push(`  ${g.variable}: ${stopsToCSS(g.angle, g.stops)};`));
  L.push('');
  L.push('  /* === ESPACIADO (sin cambios) === */');
  [['xs','0.25rem'],['sm','0.5rem'],['md','1rem'],['lg','1.5rem'],['xl','2rem'],['2xl','3rem'],['3xl','4rem']]
    .forEach(([k,v]) => L.push(`  --spacing-${k}: ${v};`));
  L.push('');
  L.push('  /* === TAMAÑOS TIPOGRÁFICOS (sin cambios) === */');
  [['xs','0.75rem'],['sm','0.875rem'],['base','1rem'],['lg','1.125rem'],['xl','1.25rem'],['2xl','1.5rem'],
   ['3xl','1.875rem'],['4xl','2.25rem'],['5xl','3rem'],['6xl','3.75rem']]
    .forEach(([k,v]) => L.push(`  --font-size-${k}: ${v};`));
  L.push('');
  L.push('  /* === EFECTOS (sin cambios) === */');
  [
    '--font-primary: var(--font-inter), sans-serif;',
    '--font-heading: var(--font-orbitron), sans-serif;',
    '--glass-bg: rgba(255,255,255,0.05);','--glass-border: rgba(255,255,255,0.1);','--glass-blur: 20px;',
    '--shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.05);','--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);',
    '--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);','--shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1);',
    '--shadow-2xl: 0 25px 50px -12px rgba(0,0,0,0.25);',
    '--glow-small: 0 0 20px currentColor;','--glow-medium: 0 0 20px currentColor,0 0 40px currentColor;',
    '--glow-large: 0 0 20px currentColor,0 0 40px currentColor,0 0 60px currentColor;',
    '--transition-fast: 150ms cubic-bezier(0.4,0,0.2,1);','--transition-normal: 300ms cubic-bezier(0.4,0,0.2,1);',
    '--transition-slow: 500ms cubic-bezier(0.4,0,0.2,1);','--transition-bounce: 600ms cubic-bezier(0.23,1,0.32,1);',
    '--radius-sm: 0.375rem;','--radius-md: 0.5rem;','--radius-lg: 0.75rem;','--radius-xl: 1rem;',
    '--radius-2xl: 1.5rem;','--radius-full: 9999px;',
    '--z-base: 0;','--z-dropdown: 1000;','--z-sticky: 1020;','--z-fixed: 1030;',
    '--z-modal-backdrop: 1040;','--z-modal: 1050;','--z-popover: 1060;','--z-tooltip: 1070;',
  ].forEach((l) => L.push(`  ${l}`));
  L.push('}');
  return L.join('\n');
}

// ─── ColorTokenRow ────────────────────────────────────────────────────────────

interface ColorTokenRowProps {
  familyId: string;
  token: ColorToken;
  advanced: boolean;
  onValue:    (fid: string, tid: string, v: string) => void;
  onLabel:    (fid: string, tid: string, v: string) => void;
  onHint:     (fid: string, tid: string, v: string) => void;
  onVariable: (fid: string, tid: string, v: string) => void;
  onKey:      (fid: string, tid: string) => void;
  onDelete:   (fid: string, tid: string) => void;
}

function ColorTokenRow({ familyId, token, advanced, onValue, onLabel, onHint, onVariable, onKey, onDelete }: ColorTokenRowProps) {
  const pickerRef = useRef<HTMLInputElement>(null);
  return (
    <div className="tc-token-row">
      {/* Color swatch */}
      <button
        className="tc-swatch"
        style={{ background: token.value, color: fg(token.value), '--glow': token.value } as React.CSSProperties}
        onClick={() => pickerRef.current?.click()}
        title="Clic para elegir color"
      >
        <span className="tc-swatch-hex">{token.value.toUpperCase()}</span>
        {token.isKey && <span className="tc-swatch-star">★</span>}
      </button>
      <input ref={pickerRef} type="color" value={token.value}
        onChange={(e) => onValue(familyId, token.id, e.target.value)}
        className="tc-hidden-picker" aria-label={token.label} />

      {/* Editable info */}
      <div className="tc-token-info">
        <input className="tc-token-label-input" value={token.label}
          onChange={(e) => onLabel(familyId, token.id, e.target.value)}
          placeholder="Nombre del tono" aria-label="Nombre del tono" />
        <input className="tc-token-hint-input" value={token.hint}
          onChange={(e) => onHint(familyId, token.id, e.target.value)}
          placeholder="¿Dónde se usa?" aria-label="Descripción de uso" />
        {advanced && (
          <input className="tc-token-var-input" value={token.variable}
            onChange={(e) => onVariable(familyId, token.id, e.target.value)}
            placeholder="--nombre-variable-css" spellCheck={false}
            aria-label="Variable CSS" />
        )}
      </div>

      {/* Actions */}
      <div className="tc-token-actions">
        <button
          className={`tc-action-btn ${token.isKey ? 'tc-action-btn--star' : ''}`}
          onClick={() => onKey(familyId, token.id)}
          title={token.isKey ? 'Quitar como tono clave' : 'Marcar como tono clave'}
        >★</button>
        <button className="tc-action-btn tc-action-btn--del"
          onClick={() => onDelete(familyId, token.id)} title="Eliminar tono">✕</button>
      </div>
    </div>
  );
}

// ─── GradientEditor ───────────────────────────────────────────────────────────

interface GradientEditorProps {
  gradient: GradientToken;
  advanced: boolean;
  onChange: (g: GradientToken) => void;
  onDelete: (id: string) => void;
}

function GradientEditor({ gradient, advanced, onChange, onDelete }: GradientEditorProps) {
  const css = stopsToCSS(gradient.angle, gradient.stops);
  const pickerRefs = useRef<(HTMLInputElement | null)[]>([]);

  const updStop = (idx: number, patch: Partial<GradientStop>) =>
    onChange({ ...gradient, stops: gradient.stops.map((s, i) => i === idx ? { ...s, ...patch } : s) });
  const addStop = () => onChange({ ...gradient, stops: [...gradient.stops, newGradientStop('#6366f1')] });
  const delStop = (idx: number) => {
    if (gradient.stops.length <= 2) return;
    onChange({ ...gradient, stops: gradient.stops.filter((_, i) => i !== idx) });
  };

  return (
    <div className="tc-grad-card">
      <div className="tc-grad-strip" style={{ background: css }} />
      <div className="tc-grad-body">
        <div className="tc-grad-meta">
          <input className="tc-grad-label-input" value={gradient.label}
            onChange={(e) => onChange({ ...gradient, label: e.target.value })}
            placeholder="Nombre del degradado" />
          <input className="tc-grad-hint-input" value={gradient.hint}
            onChange={(e) => onChange({ ...gradient, hint: e.target.value })}
            placeholder="¿Dónde se usa?" />
          {advanced && (
            <input className="tc-token-var-input" value={gradient.variable}
              onChange={(e) => onChange({ ...gradient, variable: e.target.value })}
              placeholder="--gradient-..." spellCheck={false} />
          )}
        </div>

        {/* Stops */}
        {gradient.stops.map((stop, idx) => (
          <div key={idx} className="tc-grad-stop-row">
            <button className="tc-stop-swatch" style={{ background: stop.color }}
              onClick={() => pickerRefs.current[idx]?.click()} title="Elegir color" />
            <input ref={(el) => { pickerRefs.current[idx] = el; }} type="color" value={stop.color}
              onChange={(e) => updStop(idx, { color: e.target.value })}
              className="tc-hidden-picker" aria-label={`Color parada ${idx + 1}`} />
            <span className="tc-stop-hex">{stop.color.toUpperCase()}</span>
            <input type="range" min={0} max={100} value={stop.position}
              onChange={(e) => updStop(idx, { position: Number(e.target.value) })}
              className="tc-stop-slider" aria-label={`Posición parada ${idx + 1}`} />
            <span className="tc-stop-pos">{stop.position}%</span>
            <button className="tc-action-btn tc-action-btn--del"
              onClick={() => delStop(idx)} title="Eliminar parada"
              style={{ opacity: gradient.stops.length <= 2 ? 0.25 : 1 }}>✕</button>
          </div>
        ))}

        <button className="tc-grad-add-stop" onClick={addStop}>＋ Agregar parada de color</button>

        <label className="tc-angle-row">
          <span className="tc-angle-lbl">Dirección: {gradient.angle}°</span>
          <input type="range" min={0} max={360} value={gradient.angle}
            onChange={(e) => onChange({ ...gradient, angle: Number(e.target.value) })}
            className="tc-stop-slider" aria-label="Ángulo del degradado" />
        </label>

        <button className="tc-grad-delete" onClick={() => onDelete(gradient.id)}>
          🗑 Eliminar este degradado
        </button>
      </div>
    </div>
  );
}

// ─── LivePreview ──────────────────────────────────────────────────────────────

function LivePreview({ families, gradients }: { families: ColorFamily[]; gradients: GradientToken[] }) {
  const allTokens = families.flatMap((f) => f.tokens);
  const gv = (v: string) => allTokens.find((t) => t.variable === v)?.value;

  const heroGrad = stopsToCSS(
    gradients.find((g) => g.variable === '--gradient-hero')?.angle ?? 135,
    gradients.find((g) => g.variable === '--gradient-hero')?.stops ?? [{ color: '#0f0f23', position: 0 }, { color: '#4c1d95', position: 100 }]);
  const primaryGrad = stopsToCSS(
    gradients.find((g) => g.variable === '--gradient-primary')?.angle ?? 135,
    gradients.find((g) => g.variable === '--gradient-primary')?.stops ?? [{ color: '#667eea', position: 0 }, { color: '#764ba2', position: 100 }]);
  const accentGrad = stopsToCSS(
    gradients.find((g) => g.variable === '--gradient-accent')?.angle ?? 135,
    gradients.find((g) => g.variable === '--gradient-accent')?.stops ?? [{ color: '#4facfe', position: 0 }, { color: '#00f2fe', position: 100 }]);

  const textPrimary   = gv('--text-primary')        ?? '#ffffff';
  const textSecondary = gv('--text-secondary')       ?? '#a5f3fc';
  const textMuted     = gv('--text-muted')           ?? '#94a3b8';
  const bgSecondary   = gv('--bg-dark-secondary')    ?? '#1a1a3e';
  const firstKey  = families[0]?.tokens.find((t) => t.isKey)?.value ?? families[0]?.tokens[0]?.value ?? '#00f2fe';
  const secondKey = families[1]?.tokens.find((t) => t.isKey)?.value ?? families[1]?.tokens[0]?.value ?? '#8b5cf6';
  const thirdKey  = families[2]?.tokens.find((t) => t.isKey)?.value ?? families[2]?.tokens[0]?.value ?? '#ec4899';

  return (
    <div className="tc-preview-root">
      {/* Mini hero */}
      <div className="tc-preview-hero" style={{ background: heroGrad }}>
        <div className="tc-preview-badge" style={{ background: accentGrad, color: '#fff' }}>HACKATHON</div>
        <h3 className="tc-preview-title" style={{ color: textPrimary }}>
          GDL<span style={{ color: firstKey }}>Innova</span>
        </h3>
        <p style={{ fontSize: '0.74rem', margin: 0, color: textSecondary }}>24 horas de innovación</p>
        <div className="tc-preview-btns">
          <button className="tc-preview-btn-solid" style={{ background: primaryGrad, color: '#fff' }}>Inscríbete</button>
          <button className="tc-preview-btn-ghost" style={{ borderColor: firstKey, color: firstKey }}>Ver más</button>
        </div>
      </div>
      {/* Key swatches */}
      <div className="tc-preview-swatches">
        {families.slice(0, 5).map((fam) => {
          const c = fam.tokens.find((t) => t.isKey)?.value ?? fam.tokens[0]?.value ?? '#888';
          return (
            <div key={fam.id} className="tc-preview-chip">
              <div className="tc-preview-chip-dot" style={{ background: c }} />
              <span style={{ color: textMuted }}>{fam.name.split('—')[0].trim().slice(0, 7)}</span>
            </div>
          );
        })}
      </div>
      {/* Mini card */}
      <div className="tc-preview-card" style={{ background: bgSecondary, borderColor: `${firstKey}33` }}>
        <div className="tc-preview-card-icon" style={{ background: `${firstKey}22`, color: firstKey }}>⚡</div>
        <div>
          <p className="tc-preview-card-title" style={{ color: textPrimary }}>Track de IA</p>
          <p className="tc-preview-card-desc" style={{ color: textMuted }}>Crea soluciones con inteligencia artificial</p>
        </div>
        <span className="tc-preview-card-badge" style={{ background: `${secondKey}22`, color: thirdKey }}>Popular</span>
      </div>
    </div>
  );
}

// ─── FamilyHeader ─────────────────────────────────────────────────────────────

interface FamilyHeaderProps {
  family: ColorFamily;
  onName:  (v: string) => void;
  onEmoji: (v: string) => void;
  onDelete: () => void;
}
function FamilyHeader({ family, onName, onEmoji, onDelete }: FamilyHeaderProps) {
  return (
    <div className="tc-family-header">
      <input className="tc-family-emoji" value={family.emoji}
        onChange={(e) => onEmoji(e.target.value)} maxLength={2}
        aria-label="Emoji identificador" title="Emoji de la familia" />
      <input className="tc-family-name" value={family.name}
        onChange={(e) => onName(e.target.value)}
        placeholder="Nombre de la familia" aria-label="Nombre de la familia" />
      <button className="tc-family-del" onClick={onDelete} title="Eliminar familia">🗑</button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ThemeConfigurator() {
  const [isOpen,   setIsOpen]   = useState(false);
  const [families, setFamilies] = useState<ColorFamily[]>(buildDefaultFamilies);
  const [grads,    setGrads]    = useState<GradientToken[]>(buildDefaultGradients);
  const [activeTab, setActiveTab] = useState<string>(() => buildDefaultFamilies()[0]?.id ?? 'gradients');
  const [advanced,  setAdvanced]  = useState(false);
  const [preview,   setPreview]   = useState(true);
  const [applied,   setApplied]   = useState(false);
  const [saved,     setSaved]     = useState(false);
  const applyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ── Apply on every change ──────────────────────────────────────────────────
  useEffect(() => {
    applyToDOM(families, grads);
    setApplied(true);
    clearTimeout(applyTimer.current);
    applyTimer.current = setTimeout(() => setApplied(false), 1800);
  }, [families, grads]);

  // Re-apply when panel opens (tokens.css could have reset vars)
  useEffect(() => { if (isOpen) applyToDOM(families, grads); }, [isOpen]); // eslint-disable-line

  // ── Family CRUD ────────────────────────────────────────────────────────────
  const addFamily = useCallback(() => {
    const f = newFamily();
    setFamilies((p) => [...p, f]);
    setActiveTab(f.id);
  }, []);

  const deleteFamily = useCallback((id: string) => {
    setFamilies((p) => {
      const next = p.filter((f) => f.id !== id);
      setActiveTab((cur) => cur === id ? (next[0]?.id ?? 'gradients') : cur);
      return next;
    });
  }, []);

  const patchFam = useCallback(<K extends keyof ColorFamily>(id: string, key: K, val: ColorFamily[K]) =>
    setFamilies((p) => p.map((f) => f.id === id ? { ...f, [key]: val } : f)), []);

  // ── Token CRUD ─────────────────────────────────────────────────────────────
  const patchTok = useCallback(<K extends keyof ColorToken>(fid: string, tid: string, key: K, val: ColorToken[K]) =>
    setFamilies((p) => p.map((f) =>
      f.id === fid ? { ...f, tokens: f.tokens.map((t) => t.id === tid ? { ...t, [key]: val } : t) } : f)), []);

  const toggleKey = useCallback((fid: string, tid: string) =>
    setFamilies((p) => p.map((f) =>
      f.id === fid ? { ...f, tokens: f.tokens.map((t) => t.id === tid ? { ...t, isKey: !t.isKey } : t) } : f)), []);

  const addToken = useCallback((fid: string) =>
    setFamilies((p) => p.map((f) =>
      f.id === fid ? { ...f, tokens: [...f.tokens, newToken(f.name, f.tokens.length)] } : f)), []);

  const deleteToken = useCallback((fid: string, tid: string) =>
    setFamilies((p) => p.map((f) =>
      f.id === fid ? { ...f, tokens: f.tokens.filter((t) => t.id !== tid) } : f)), []);

  // ── Gradient CRUD ──────────────────────────────────────────────────────────
  const updateGrad = useCallback((g: GradientToken) =>
    setGrads((p) => p.map((x) => x.id === g.id ? g : x)), []);

  const deleteGrad = useCallback((id: string) =>
    setGrads((p) => p.filter((g) => g.id !== id)), []);

  // ── Reset / Save ───────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    const f = buildDefaultFamilies();
    setFamilies(f);
    setGrads(buildDefaultGradients());
    setActiveTab(f[0].id);
  }, []);

  const handleSave = useCallback(() => {
    const css = generateCSS(families, grads);
    const blob = new Blob([css], { type: 'text/css;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'tokens.css';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }, [families, grads]);

  // ── Active family ──────────────────────────────────────────────────────────
  const activeFam = families.find((f) => f.id === activeTab);

  return (
    <>
      {/* Trigger */}
      <button className="tc-trigger" onClick={() => setIsOpen(true)} aria-label="Abrir configurador de paleta">
        <span style={{ fontSize: '1.2rem' }}>🎨</span>
        <span className="tc-trigger-lbl">Paleta</span>
      </button>

      {/* Backdrop */}
      {isOpen && <div className="tc-backdrop" onClick={() => setIsOpen(false)} aria-hidden />}

      {/* Panel */}
      <aside className={`tc-panel${isOpen ? ' tc-panel--open' : ''}`} aria-label="Configurador de paleta">

        {/* Header */}
        <div className="tc-header">
          <div className="tc-header-left">
            <span style={{ fontSize: '1.65rem' }}>🎨</span>
            <div>
              <h2 className="tc-header-title">Paleta de colores</h2>
              <p className="tc-header-sub">Diseña tu sistema cromático completo</p>
            </div>
          </div>
          <div className="tc-header-right">
            {applied && <span className="tc-applied-badge">✓ Aplicado</span>}
            <button className="tc-close" onClick={() => setIsOpen(false)} aria-label="Cerrar">✕</button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="tc-toolbar">
          <button className={`tc-tool${preview  ? ' tc-tool--on' : ''}`} onClick={() => setPreview((v) => !v)}>
            👁 Vista previa
          </button>
          <button className={`tc-tool${advanced ? ' tc-tool--on' : ''}`} onClick={() => setAdvanced((v) => !v)}
            title="Muestra los nombres de variables CSS">
            ⚙ Modo avanzado
          </button>
        </div>

        {/* Preview */}
        {preview && <LivePreview families={families} gradients={grads} />}

        {/* Tabs */}
        <nav className="tc-tabs" aria-label="Familias de color">
          {families.map((fam) => (
            <button key={fam.id}
              className={`tc-tab${activeTab === fam.id ? ' tc-tab--on' : ''}`}
              onClick={() => setActiveTab(fam.id)} title={fam.name}>
              <span>{fam.emoji}</span>
              <span className="tc-tab-name">{fam.name.split('—')[0].trim()}</span>
            </button>
          ))}
          <button className={`tc-tab${activeTab === 'gradients' ? ' tc-tab--on' : ''}`}
            onClick={() => setActiveTab('gradients')}>
            <span>🌈</span><span className="tc-tab-name">Degradados</span>
          </button>
          <button className="tc-tab tc-tab--add" onClick={addFamily} title="Nueva familia de colores">
            <span>＋</span><span className="tc-tab-name">Nueva</span>
          </button>
        </nav>

        {/* Content */}
        <div className="tc-content">

          {/* Family panel */}
          {activeFam && (
            <section className="tc-section">
              <FamilyHeader
                family={activeFam}
                onName={(v)  => patchFam(activeFam.id, 'name', v)}
                onEmoji={(v) => patchFam(activeFam.id, 'emoji', v)}
                onDelete={()  => deleteFamily(activeFam.id)}
              />
              <textarea className="tc-family-desc"
                value={activeFam.description}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => patchFam(activeFam.id, 'description', e.target.value)}
                placeholder="Describe el propósito de esta familia..." rows={2} />

              {activeFam.tokens.length === 0 && (
                <p className="tc-empty">Esta familia no tiene tonos todavía — ¡agrega el primero!</p>
              )}
              {activeFam.tokens.map((tok) => (
                <ColorTokenRow key={tok.id}
                  familyId={activeFam.id} token={tok} advanced={advanced}
                  onValue={(f, t, v)    => patchTok(f, t, 'value', v)}
                  onLabel={(f, t, v)    => patchTok(f, t, 'label', v)}
                  onHint={(f, t, v)     => patchTok(f, t, 'hint', v)}
                  onVariable={(f, t, v) => patchTok(f, t, 'variable', v)}
                  onKey={toggleKey}
                  onDelete={deleteToken}
                />
              ))}
              <button className="tc-add-btn" onClick={() => addToken(activeFam.id)}>
                ＋ Agregar tono a esta familia
              </button>
            </section>
          )}

          {/* Gradients panel */}
          {activeTab === 'gradients' && (
            <section className="tc-section">
              <p className="tc-section-desc">
                Los <strong>degradados</strong> fusionan colores para crear atmósferas.
                Ajusta cada parada, su posición y la dirección.
              </p>
              {grads.map((g) => (
                <GradientEditor key={g.id} gradient={g} advanced={advanced}
                  onChange={updateGrad} onDelete={deleteGrad} />
              ))}
              <button className="tc-add-btn" onClick={() => setGrads((p) => [...p, newGradient()])}>
                ＋ Agregar degradado
              </button>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="tc-footer">
          <button className="tc-btn-reset" onClick={handleReset} title="Restaurar paleta original">↺ Restaurar</button>
          <button className="tc-btn-apply" onClick={() => applyToDOM(families, grads)} title="Aplicar colores al sitio ahora">
            ▶ Aplicar
          </button>
          <button className={`tc-btn-save${saved ? ' tc-btn-save--ok' : ''}`} onClick={handleSave}>
            {saved ? '✓ ¡Descargado!' : '⬇ Guardar CSS'}
          </button>
        </div>
        {saved && (
          <div className="tc-save-hint">
            <strong>tokens.css</strong> descargado — reemplaza&nbsp;
            <code>styles/theme/tokens.css</code> para aplicar definitivamente.
          </div>
        )}
      </aside>

      <style>{CSS}</style>
    </>
  );
}

// ─── Inline styles ────────────────────────────────────────────────────────────

const CSS = `
.tc-trigger {
  position:fixed; bottom:2rem; right:2rem; z-index:9000;
  display:flex; align-items:center; gap:.5rem;
  padding:.7rem 1.2rem; border:none; border-radius:9999px;
  background:linear-gradient(135deg,#7c3aed,#0e7490);
  color:#fff; font-size:.9rem; font-weight:700; cursor:pointer;
  box-shadow:0 4px 24px rgba(124,58,237,.45),0 0 0 2px rgba(255,255,255,.08);
  transition:transform 220ms cubic-bezier(.34,1.56,.64,1),box-shadow 200ms;
}
.tc-trigger:hover{transform:scale(1.06) translateY(-2px);box-shadow:0 8px 32px rgba(124,58,237,.6);}
.tc-trigger-lbl{font-size:.85rem;}

.tc-backdrop{
  position:fixed;inset:0;z-index:9010;
  background:rgba(0,0,0,.55);backdrop-filter:blur(4px);
  animation:tcFade 200ms ease;
}
@keyframes tcFade{from{opacity:0}to{opacity:1}}

.tc-panel{
  position:fixed;top:0;right:0;z-index:9020;
  width:min(500px,100vw);height:100dvh;
  display:flex;flex-direction:column;
  background:#0d0d1f;
  border-left:1px solid rgba(255,255,255,.08);
  box-shadow:-8px 0 48px rgba(0,0,0,.7);
  transform:translateX(100%);
  transition:transform 340ms cubic-bezier(.23,1,.32,1);
  overflow:hidden;
}
.tc-panel--open{transform:translateX(0);}

.tc-header{
  display:flex;align-items:center;justify-content:space-between;
  padding:1rem 1.25rem;flex-shrink:0;
  background:linear-gradient(135deg,rgba(124,58,237,.2),rgba(14,116,144,.12));
  border-bottom:1px solid rgba(255,255,255,.07);
}
.tc-header-left{display:flex;align-items:center;gap:.65rem;}
.tc-header-right{display:flex;align-items:center;gap:.5rem;}
.tc-header-title{color:#fff;font-size:1rem;font-weight:800;margin:0;}
.tc-header-sub{color:#a5f3fc;font-size:.72rem;margin:0;}
.tc-applied-badge{
  font-size:.68rem;font-weight:700;color:#10b981;
  background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.3);
  padding:.18rem .5rem;border-radius:9999px;animation:tcFade 200ms ease;
}
.tc-close{
  width:1.8rem;height:1.8rem;border:none;border-radius:50%;
  background:rgba(255,255,255,.07);color:#94a3b8;font-size:.9rem;
  cursor:pointer;transition:all 150ms;
}
.tc-close:hover{background:rgba(255,255,255,.15);color:#fff;}

.tc-toolbar{
  display:flex;gap:.5rem;padding:.5rem 1.25rem;flex-shrink:0;
  border-bottom:1px solid rgba(255,255,255,.05);
}
.tc-tool{
  background:transparent;border:1px solid rgba(255,255,255,.1);
  color:#64748b;border-radius:6px;padding:.28rem .65rem;
  font-size:.72rem;font-weight:600;cursor:pointer;transition:all 150ms;
}
.tc-tool:hover{color:#cbd5e1;border-color:rgba(255,255,255,.2);}
.tc-tool--on{color:#a5f3fc;border-color:rgba(0,242,254,.35);background:rgba(0,242,254,.06);}

/* preview */
.tc-preview-root{
  margin:.55rem 1.25rem;border-radius:12px;overflow:hidden;
  border:1px solid rgba(255,255,255,.07);flex-shrink:0;
}
.tc-preview-hero{
  padding:.8rem 1rem .55rem;
  display:flex;flex-direction:column;gap:.3rem;
}
.tc-preview-badge{
  display:inline-block;align-self:flex-start;
  padding:.17rem .5rem;border-radius:9999px;
  font-size:.6rem;font-weight:800;letter-spacing:.1em;
}
.tc-preview-title{font-size:1.25rem;font-weight:900;margin:0;font-family:var(--font-orbitron,monospace);}
.tc-preview-btns{display:flex;gap:.45rem;margin-top:.2rem;}
.tc-preview-btn-solid{padding:.3rem .75rem;border:none;border-radius:9999px;font-size:.68rem;font-weight:700;cursor:default;}
.tc-preview-btn-ghost{padding:.26rem .7rem;border:1.5px solid;border-radius:9999px;background:transparent;font-size:.68rem;font-weight:700;cursor:default;}
.tc-preview-swatches{
  display:flex;gap:.3rem;flex-wrap:wrap;
  padding:.45rem 1rem;background:rgba(255,255,255,.02);
  border-top:1px solid rgba(255,255,255,.04);
}
.tc-preview-chip{display:flex;flex-direction:column;align-items:center;gap:.15rem;}
.tc-preview-chip-dot{width:1.25rem;height:1.25rem;border-radius:50%;border:1.5px solid rgba(255,255,255,.15);}
.tc-preview-chip span{font-size:.52rem;}
.tc-preview-card{
  display:flex;align-items:center;gap:.55rem;
  margin:0 1rem .7rem;padding:.5rem .65rem;border-radius:10px;border:1px solid;
}
.tc-preview-card-icon{width:1.9rem;height:1.9rem;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:.95rem;flex-shrink:0;}
.tc-preview-card-title{font-size:.76rem;font-weight:700;margin:0;}
.tc-preview-card-desc{font-size:.64rem;margin:.06rem 0 0;}
.tc-preview-card-badge{margin-left:auto;flex-shrink:0;padding:.15rem .42rem;border-radius:9999px;font-size:.58rem;font-weight:700;}

/* tabs */
.tc-tabs{
  display:flex;overflow-x:auto;
  border-bottom:1px solid rgba(255,255,255,.07);
  flex-shrink:0;scrollbar-width:none;
}
.tc-tabs::-webkit-scrollbar{display:none;}
.tc-tab{
  flex:0 0 auto;min-width:3.5rem;max-width:5.5rem;
  padding:.5rem .4rem;
  display:flex;flex-direction:column;align-items:center;gap:.1rem;
  background:transparent;border:none;border-bottom:2px solid transparent;
  color:#475569;font-size:.6rem;font-weight:600;cursor:pointer;
  transition:color 150ms,border-color 150ms;
}
.tc-tab:hover{color:#cbd5e1;}
.tc-tab--on{color:#a5f3fc;border-bottom-color:#00f2fe;}
.tc-tab--add{color:#334155;}
.tc-tab--add:hover{color:#00f2fe;}
.tc-tab-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:5rem;text-align:center;}

/* content */
.tc-content{
  flex:1 1 0;overflow-y:auto;padding:0 1.25rem .5rem;
  scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.1) transparent;
}
.tc-content::-webkit-scrollbar{width:4px;}
.tc-content::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:9999px;}
.tc-section{padding-top:.85rem;}
.tc-section-desc{
  font-size:.74rem;color:#64748b;line-height:1.55;margin:0 0 .85rem;
  padding:.5rem .7rem;
  background:rgba(255,255,255,.03);
  border-left:3px solid rgba(0,242,254,.35);border-radius:0 6px 6px 0;
}
.tc-section-desc strong{color:#a5f3fc;}
.tc-empty{text-align:center;color:#475569;font-size:.78rem;padding:1.5rem 0;}

/* family header */
.tc-family-header{display:flex;align-items:center;gap:.5rem;margin-bottom:.45rem;}
.tc-family-emoji{
  width:2.4rem;text-align:center;font-size:1.25rem;
  background:transparent;border:1px solid rgba(255,255,255,.1);
  border-radius:7px;padding:.18rem;color:#fff;cursor:pointer;
  transition:border-color 150ms;
}
.tc-family-emoji:focus{outline:none;border-color:rgba(0,242,254,.4);}
.tc-family-name{
  flex:1;background:transparent;border:none;
  border-bottom:1px solid rgba(255,255,255,.12);
  color:#e2e8f0;font-size:.95rem;font-weight:700;
  padding:.18rem .08rem;transition:border-color 150ms;
}
.tc-family-name:focus{outline:none;border-bottom-color:#00f2fe;}
.tc-family-del{
  background:transparent;border:1px solid rgba(239,68,68,.2);
  color:#ef4444;border-radius:7px;padding:.18rem .4rem;
  font-size:.78rem;cursor:pointer;transition:all 150ms;
}
.tc-family-del:hover{background:rgba(239,68,68,.1);border-color:rgba(239,68,68,.4);}
.tc-family-desc{
  width:100%;background:rgba(255,255,255,.03);
  border:1px solid rgba(255,255,255,.08);border-radius:8px;
  color:#64748b;font-size:.72rem;padding:.45rem .6rem;
  resize:vertical;line-height:1.5;margin-bottom:.8rem;
  font-family:inherit;transition:border-color 150ms;box-sizing:border-box;
}
.tc-family-desc:focus{outline:none;border-color:rgba(0,242,254,.3);color:#94a3b8;}

/* token row */
.tc-token-row{
  display:flex;align-items:flex-start;gap:.55rem;
  padding:.55rem 0;border-bottom:1px solid rgba(255,255,255,.04);
}
.tc-token-row:last-of-type{border-bottom:none;}
.tc-swatch{
  position:relative;width:2.9rem;height:2.9rem;flex-shrink:0;
  border-radius:9px;border:2px solid rgba(255,255,255,.1);
  cursor:pointer;overflow:hidden;
  display:flex;align-items:flex-end;justify-content:center;
  padding-bottom:.1rem;
  transition:transform 150ms,box-shadow 150ms;
}
.tc-swatch:hover{transform:scale(1.08);box-shadow:0 0 14px var(--glow,#888);}
.tc-swatch-hex{font-size:.4rem;font-weight:800;opacity:.9;pointer-events:none;letter-spacing:.04em;text-shadow:0 1px 2px rgba(0,0,0,.5);}
.tc-swatch-star{position:absolute;top:.1rem;right:.15rem;font-size:.5rem;opacity:.9;}
.tc-hidden-picker{position:absolute;opacity:0;width:0;height:0;pointer-events:none;}
.tc-token-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:.18rem;}
.tc-token-label-input{
  background:transparent;border:none;
  border-bottom:1px solid rgba(255,255,255,.08);
  color:#e2e8f0;font-size:.78rem;font-weight:600;
  padding:.1rem .04rem;width:100%;transition:border-color 150ms;
}
.tc-token-label-input:focus{outline:none;border-bottom-color:#00f2fe;}
.tc-token-hint-input{
  background:transparent;border:none;
  color:#64748b;font-size:.68rem;padding:.06rem .04rem;width:100%;
}
.tc-token-hint-input:focus{outline:none;color:#94a3b8;}
.tc-token-var-input{
  background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.08);
  border-radius:5px;color:#a78bfa;font-size:.63rem;font-family:monospace;
  padding:.13rem .38rem;width:100%;margin-top:.08rem;box-sizing:border-box;
}
.tc-token-var-input:focus{outline:none;border-color:rgba(124,58,237,.4);}
.tc-token-actions{display:flex;flex-direction:column;gap:.22rem;flex-shrink:0;}
.tc-action-btn{
  width:1.5rem;height:1.5rem;border-radius:6px;
  border:1px solid rgba(255,255,255,.1);background:transparent;
  color:#475569;font-size:.68rem;cursor:pointer;transition:all 150ms;
  display:flex;align-items:center;justify-content:center;
}
.tc-action-btn:hover{background:rgba(255,255,255,.07);color:#cbd5e1;}
.tc-action-btn--star{color:#fbbf24;border-color:rgba(251,191,36,.3);background:rgba(251,191,36,.08);}
.tc-action-btn--del:hover{color:#ef4444;border-color:rgba(239,68,68,.3);background:rgba(239,68,68,.08);}

.tc-add-btn{
  width:100%;margin-top:.8rem;padding:.5rem;
  background:rgba(0,242,254,.04);border:1.5px dashed rgba(0,242,254,.2);
  border-radius:10px;color:#a5f3fc;font-size:.75rem;font-weight:700;
  cursor:pointer;transition:all 150ms;
}
.tc-add-btn:hover{background:rgba(0,242,254,.1);border-color:rgba(0,242,254,.4);}

/* gradient card */
.tc-grad-card{margin-bottom:1rem;border:1px solid rgba(255,255,255,.08);border-radius:12px;overflow:hidden;}
.tc-grad-strip{height:3rem;width:100%;}
.tc-grad-body{padding:.7rem;}
.tc-grad-meta{display:flex;flex-direction:column;gap:.22rem;margin-bottom:.65rem;}
.tc-grad-label-input{
  background:transparent;border:none;border-bottom:1px solid rgba(255,255,255,.1);
  color:#e2e8f0;font-size:.82rem;font-weight:700;padding:.08rem .04rem;width:100%;transition:border-color 150ms;
}
.tc-grad-label-input:focus{outline:none;border-bottom-color:#00f2fe;}
.tc-grad-hint-input{background:transparent;border:none;color:#64748b;font-size:.68rem;padding:.06rem .04rem;width:100%;}
.tc-grad-hint-input:focus{outline:none;color:#94a3b8;}
.tc-grad-stop-row{display:flex;align-items:center;gap:.4rem;margin-bottom:.4rem;}
.tc-stop-swatch{
  width:1.4rem;height:1.4rem;border-radius:50%;flex-shrink:0;
  border:2px solid rgba(255,255,255,.2);cursor:pointer;transition:transform 150ms;
}
.tc-stop-swatch:hover{transform:scale(1.15);}
.tc-stop-hex{font-size:.58rem;font-family:monospace;color:#475569;min-width:4rem;}
.tc-stop-slider{flex:1;accent-color:#00f2fe;cursor:pointer;height:3px;}
.tc-stop-pos{font-size:.63rem;color:#475569;min-width:2.1rem;text-align:right;}
.tc-grad-add-stop{
  background:transparent;border:1px dashed rgba(255,255,255,.12);
  border-radius:7px;color:#64748b;font-size:.7rem;padding:.38rem;
  cursor:pointer;width:100%;margin-bottom:.6rem;transition:all 150ms;
}
.tc-grad-add-stop:hover{border-color:rgba(0,242,254,.25);color:#a5f3fc;}
.tc-angle-row{display:flex;flex-direction:column;gap:.22rem;margin-bottom:.55rem;}
.tc-angle-lbl{font-size:.68rem;color:#64748b;font-weight:600;}
.tc-grad-delete{
  width:100%;background:transparent;
  border:1px solid rgba(239,68,68,.2);border-radius:8px;
  color:#ef4444;font-size:.7rem;padding:.38rem;cursor:pointer;transition:all 150ms;
}
.tc-grad-delete:hover{background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.4);}

/* footer */
.tc-footer{
  display:flex;gap:.45rem;
  padding:.8rem 1.25rem;border-top:1px solid rgba(255,255,255,.07);flex-shrink:0;
}
.tc-btn-reset{
  padding:.55rem .85rem;border-radius:8px;
  border:1px solid rgba(255,255,255,.1);background:transparent;
  color:#64748b;font-size:.76rem;font-weight:700;cursor:pointer;transition:all 150ms;
}
.tc-btn-reset:hover{border-color:rgba(255,255,255,.22);color:#cbd5e1;}
.tc-btn-apply{
  padding:.55rem .85rem;border-radius:8px;
  border:1px solid rgba(0,242,254,.3);background:rgba(0,242,254,.07);
  color:#a5f3fc;font-size:.76rem;font-weight:700;cursor:pointer;transition:all 150ms;
}
.tc-btn-apply:hover{background:rgba(0,242,254,.15);border-color:rgba(0,242,254,.5);color:#fff;}
.tc-btn-save{
  flex:1;padding:.55rem .85rem;border-radius:8px;border:none;
  background:linear-gradient(135deg,#7c3aed,#0e7490);
  color:#fff;font-size:.8rem;font-weight:800;cursor:pointer;
  box-shadow:0 2px 14px rgba(124,58,237,.3);transition:all 200ms;
}
.tc-btn-save:hover{transform:translateY(-1px);box-shadow:0 4px 22px rgba(124,58,237,.5);}
.tc-btn-save--ok{background:linear-gradient(135deg,#059669,#10b981);}
.tc-save-hint{
  padding:.55rem 1.25rem;font-size:.7rem;color:#a5f3fc;
  background:rgba(5,150,105,.1);border-top:1px solid rgba(5,150,105,.18);
  flex-shrink:0;animation:tcFade 300ms ease;
}
.tc-save-hint code{font-family:monospace;background:rgba(255,255,255,.08);padding:.03rem .26rem;border-radius:4px;}

@media(max-width:480px){
  .tc-panel{width:100vw;}
  .tc-trigger-lbl{display:none;}
  .tc-trigger{padding:.75rem;border-radius:50%;}
}
`;

