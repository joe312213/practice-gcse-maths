// Storage names and adjustment formulas intentionally match the pre-migration site.
export const PALETTES = [
  { id: 'sage', light: 'Sage', dark: 'Forest' },
  { id: 'blue', light: 'Blue sky', dark: 'Midnight blue' },
  { id: 'rose', light: 'Rose', dark: 'Berry' },
  { id: 'apricot', light: 'Apricot', dark: 'Ember' },
];
const PREFIX = 'maths-starters-';
export function readTheme(storage) {
  const preferences = { mode: 'light', palette: 'sage', tweaks: {} };
  try {
    preferences.mode = storage.getItem(PREFIX + 'theme') === 'dark' ? 'dark' : 'light';
    const palette = storage.getItem(PREFIX + 'palette');
    if (PALETTES.some((p) => p.id === palette)) preferences.palette = palette;
    const tweaks = JSON.parse(storage.getItem(PREFIX + 'theme-adjustments'));
    for (const p of PALETTES)
      for (const mode of ['light', 'dark']) {
        const key = `${mode}:${p.id}`,
          value = tweaks?.[key];
        if (Number.isFinite(value?.saturation) && Number.isFinite(value?.lightness)) {
          preferences.tweaks[key] = {
            saturation: Math.max(0, Math.min(100, value.saturation)),
            lightness: Math.max(
              mode === 'light' ? 55 : 5,
              Math.min(mode === 'light' ? 96 : 45, value.lightness),
            ),
          };
        }
      }
  } catch {
    /* Unavailable/malformed preferences do not block practice. */
  }
  return preferences;
}

/** Browser adapter shared by the practice and About layouts. CSS owns palette values. */
export function createThemeController(storage, root, onWarning = () => {}) {
  const preferences = readTheme(storage),
    listeners = new Set();
  let current;
  function apply(persist = false) {
    const { mode, palette } = preferences;
    root.dataset.theme = mode;
    root.dataset.palette = palette;
    const preset = getComputedStyle(root);
    const values = preferences.tweaks[`${mode}:${palette}`] ?? {
      saturation: Math.round(Number(preset.getPropertyValue('--theme-saturation-default')) * 100),
      lightness: Math.round(Number(preset.getPropertyValue('--theme-bg-default')) * 100),
    };
    root.style.setProperty('--theme-saturation', String(values.saturation / 100));
    root.style.setProperty('--theme-bg-lightness', String(values.lightness / 100));
    current = { mode, palette, ...values };
    for (const listener of listeners) listener(current);
    if (persist)
      try {
        storage.setItem(PREFIX + 'theme', mode);
        storage.setItem(PREFIX + 'palette', palette);
        storage.setItem(PREFIX + 'theme-adjustments', JSON.stringify(preferences.tweaks));
      } catch {
        onWarning('Theme changed, but this browser could not save the preference.');
      }
  }
  apply();
  return {
    subscribe(fn) {
      listeners.add(fn);
      fn(current);
      return () => listeners.delete(fn);
    },
    select(mode, palette) {
      preferences.mode = mode;
      preferences.palette = palette;
      apply(true);
    },
    toggle() {
      preferences.mode = preferences.mode === 'dark' ? 'light' : 'dark';
      apply(true);
    },
    adjust(saturation, lightness) {
      preferences.tweaks[`${preferences.mode}:${preferences.palette}`] = { saturation, lightness };
      apply(true);
    },
    reset() {
      delete preferences.tweaks[`${preferences.mode}:${preferences.palette}`];
      apply(true);
    },
  };
}
