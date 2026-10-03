<script>
  import { getContext } from 'svelte';
  import { Popover } from 'bits-ui';
  import { PALETTES } from '#lib/theme/preferences.mjs';
  const theme = getContext('theme');
  let settings = $state({ mode: 'light', palette: 'sage', saturation: 30, lightness: 94 });
  $effect(() => {
    if ($theme) return $theme.subscribe((value) => (settings = value));
  });
</script>

<div class="theme-controls">
  <Popover.Root>
    <Popover.Trigger
      id="theme-picker"
      class="theme-icon"
      aria-label="Choose colour theme"
      title="Choose colour theme"
      disabled={!$theme}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"
        ><circle cx="7" cy="7" r="3" /><circle cx="17" cy="7" r="3" /><circle
          cx="7"
          cy="17"
          r="3"
        /><circle cx="17" cy="17" r="3" /></svg
      >
    </Popover.Trigger>
    <Popover.Portal>
      <Popover.Content
        id="theme-menu"
        class="theme-menu"
        sideOffset={8}
        align="end"
        collisionPadding={16}
        aria-label="Colour theme"
      >
        <h2>Colour theme</h2>
        <div id="theme-previews">
          {#each ['light', 'dark'] as mode}
            <fieldset class="theme-group">
              <legend>{mode === 'light' ? 'Light' : 'Dark'} themes</legend>
              <div class="theme-preview-grid">
                {#each PALETTES as palette}
                  <button
                    type="button"
                    class="theme-preview"
                    data-theme-choice={`${mode}:${palette.id}`}
                    aria-label={`${palette[mode]} · ${mode}`}
                    aria-pressed={settings.mode === mode && settings.palette === palette.id}
                    onclick={() => $theme.select(mode, palette.id)}
                  >
                    <span
                      class="theme-swatch"
                      data-theme={mode}
                      data-palette={palette.id}
                      aria-hidden="true"
                    ></span><span>{palette[mode]}</span>
                  </button>
                {/each}
              </div>
            </fieldset>
          {/each}
        </div>
        <div class="theme-adjustments">
          <label for="theme-saturation"
            >Saturation <output id="theme-saturation-value" for="theme-saturation"
              >{settings.saturation}%</output
            ></label
          >
          <input
            id="theme-saturation"
            type="range"
            min="0"
            max="100"
            step="5"
            value={settings.saturation}
            oninput={(event) =>
              $theme.adjust(Number(event.currentTarget.value), settings.lightness)}
          />
          <label for="theme-lightness"
            >Background lightness <output id="theme-lightness-value" for="theme-lightness"
              >{settings.lightness}%</output
            ></label
          >
          <input
            id="theme-lightness"
            type="range"
            min={settings.mode === 'dark' ? 5 : 55}
            max={settings.mode === 'dark' ? 45 : 96}
            value={settings.lightness}
            aria-valuetext={`${settings.lightness}% background lightness`}
            oninput={(event) =>
              $theme.adjust(settings.saturation, Number(event.currentTarget.value))}
          />
          <button type="button" id="theme-reset" onclick={() => $theme.reset()}
            >Reset adjustments</button
          >
        </div>
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>
  <button
    type="button"
    id="theme-toggle"
    class="theme-icon"
    disabled={!$theme}
    aria-pressed={settings.mode === 'dark'}
    aria-label={settings.mode === 'dark'
      ? 'Switch to paired light theme'
      : 'Switch to paired dark theme'}
    onclick={() => $theme.toggle()}
  >
    {#if settings.mode === 'dark'}
      <svg viewBox="0 0 24 24" aria-hidden="true"
        ><circle cx="12" cy="12" r="4" /><path
          d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"
        /></svg
      >
    {:else}
      <svg viewBox="0 0 24 24" aria-hidden="true"
        ><path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z" /></svg
      >
    {/if}
  </button>
</div>
