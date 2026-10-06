/**
 * Purpose: Load, apply and persist palette preferences through an observable theme controller.
 *
 * Main contents:
 * - PALETTES
 * - readTheme
 * - createThemeController
 *
 * Used By: website/src/lib/components/ui/ThemeControls.svelte, website/src/routes/+layout.svelte
 *
 * Uses: no local module imports.
 *
 * Libs: none.
 */
// Storage names and adjustment formulas intentionally match the pre-migration site.
export const PALETTES = [
  { id: 'sage', light: 'Sage', dark: 'Forest' },
  { id: 'blue', light: 'Blue sky', dark: 'Midnight blue' },
  { id: 'rose', light: 'Rose', dark: 'Berry' },
  { id: 'apricot', light: 'Apricot', dark: 'Ember' },
];
const PREFIX = 'maths-starters-';
/**
 * Read persisted mode, palette and adjustments, falling back safely on invalid storage.
 * Parameter storage: Storage-compatible adapter.
 * Used by: createThemeController.
 * @example const preferences = readTheme(localStorage);
 */
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

/**
 * Browser adapter shared by the practice and About layouts. CSS owns palette values.
 * Create observable theme controls backed by the supplied root element and storage adapter.
 * Parameter storage: Storage-compatible adapter.
 * Parameter root: document root receiving theme variables.
 * Parameter onWarning: warning callback.
 * Calls: readTheme, apply.
 * @example const theme = createThemeController(localStorage, document.documentElement, showWarning);
 */
export function createThemeController(storage, root, onWarning = () => {}) {
  const preferences = readTheme(storage),
    listeners = new Set();
  let current;
  /**
   * Apply theme variables and optionally persist the current preferences.
   * Parameter persist: whether to save as well as publish.
   * Used by: createThemeController, select, toggle, adjust, reset.
   * @example apply(persist);
   */
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
    /**
     * Register a state listener, publish its initial value and return an unsubscribe function.
     * Parameter fn: callback invoked by this operation.
     */
    subscribe(fn) {
      listeners.add(fn);
      fn(current);
      return () => listeners.delete(fn);
    },
    /**
     * Apply and persist the requested light/dark mode and palette.
     * Parameter mode: learning activity or theme mode, as used here.
     * Parameter palette: named theme palette.
     * Calls: apply.
     */
    select(mode, palette) {
      preferences.mode = mode;
      preferences.palette = palette;
      apply(true);
    },
    /**
     * Switch between light and dark mode and persist the choice.
     * Calls: apply.
     */
    toggle() {
      preferences.mode = preferences.mode === 'dark' ? 'light' : 'dark';
      apply(true);
    },
    /**
     * Save saturation/lightness adjustments for the current palette/mode.
     * Parameter saturation: user saturation adjustment.
     * Parameter lightness: user lightness adjustment.
     * Calls: apply.
     */
    adjust(saturation, lightness) {
      preferences.tweaks[`${preferences.mode}:${preferences.palette}`] = { saturation, lightness };
      apply(true);
    },
    /**
     * Remove the current palette/mode adjustments and reapply its defaults.
     * Calls: apply.
     */
    reset() {
      delete preferences.tweaks[`${preferences.mode}:${preferences.palette}`];
      apply(true);
    },
  };
}
