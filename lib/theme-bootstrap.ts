const THEME_BOOTSTRAP_SCRIPT = `(function(){
  try {
    var raw = window.localStorage.getItem('gdlinova-theme-draft-v1');
    if (!raw) return;

    var draft = JSON.parse(raw);
    if (!draft || typeof draft !== 'object') return;

    var root = document.documentElement;
    var set = function (variable, value) {
      if (typeof variable === 'string' && typeof value === 'string' && value.trim().length > 0) {
        root.style.setProperty(variable, value);
      }
    };

    var sectionFallbacks = {
      hero: 'aurora',
      about: 'none',
      schedule: 'none',
      tracks: 'none',
      tech: 'none',
      evaluation: 'none',
      cta: 'none',
      footer: 'none'
    };

    var overlays = {
      none: 'transparent',
      'cyan-mist': 'radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--color-cyan-400) 20%, transparent) 0%, transparent 65%)',
      'purple-glow': 'radial-gradient(circle at 80% 30%, color-mix(in srgb, var(--color-purple-400) 24%, transparent) 0%, transparent 60%)',
      'pink-beam': 'linear-gradient(135deg, color-mix(in srgb, var(--color-pink-400) 16%, transparent) 0%, transparent 60%)',
      aurora: 'linear-gradient(120deg, color-mix(in srgb, var(--color-cyan-400) 14%, transparent) 0%, color-mix(in srgb, var(--color-purple-400) 14%, transparent) 55%, color-mix(in srgb, var(--color-pink-400) 12%, transparent) 100%)',
      vignette: 'radial-gradient(circle at center, transparent 45%, color-mix(in srgb, var(--bg-dark-primary) 62%, transparent) 100%)'
    };

    if (Array.isArray(draft.families)) {
      draft.families.forEach(function (family) {
        if (!family || !Array.isArray(family.tokens)) return;
        family.tokens.forEach(function (token) {
          if (!token || typeof token !== 'object') return;
          set(token.variable, token.value);
        });
      });
    }

    if (Array.isArray(draft.gradients)) {
      draft.gradients.forEach(function (gradient) {
        if (!gradient || typeof gradient !== 'object') return;
        if (typeof gradient.variable !== 'string' || !Array.isArray(gradient.stops) || gradient.stops.length === 0) return;

        var angle = typeof gradient.angle === 'number' ? Math.max(0, Math.min(360, gradient.angle)) : 135;
        var stops = gradient.stops
          .filter(function (stop) {
            return stop && typeof stop.color === 'string' && typeof stop.position === 'number';
          })
          .map(function (stop) {
            var pos = Math.max(0, Math.min(100, stop.position));
            return stop.color + ' ' + pos + '%';
          });

        if (stops.length > 0) {
          set(gradient.variable, 'linear-gradient(' + angle + 'deg, ' + stops.join(', ') + ')');
        }
      });
    }

    set('--section-base-bg', draft.sectionBaseColor);
    set('--particles-palette', draft.particlesPalette);

    var sectionIds = ['hero', 'about', 'schedule', 'tracks', 'tech', 'evaluation', 'cta', 'footer'];
    var sectionFilters = draft.sectionFilters;
    if (sectionFilters && typeof sectionFilters === 'object') {
      sectionIds.forEach(function (sectionId) {
        var selected = typeof sectionFilters[sectionId] === 'string' ? sectionFilters[sectionId] : sectionFallbacks[sectionId];
        var overlay = overlays[selected] || 'transparent';
        set('--section-filter-' + sectionId, overlay);
      });
    }
  } catch (_) {
    // noop: evita romper el render inicial
  }
})();`;

export function getThemeBootstrapScript(): string {
  return THEME_BOOTSTRAP_SCRIPT;
}
