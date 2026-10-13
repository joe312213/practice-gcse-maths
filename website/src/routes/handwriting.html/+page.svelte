<!-- Purpose: Local, interactive evaluation of stroke-font clarity, coverage and writing motion. -->
<script>
  import { onMount } from 'svelte';
  import { asset } from '$app/paths';
  import SiteHeader from '#lib/components/ui/SiteHeader.svelte';
  import SiteFooter from '#lib/components/ui/SiteFooter.svelte';
  import StrokeSample from '#lib/components/teaching/StrokeSample.svelte';
  import { characterGroups, missingCharacters } from '#lib/application/handwriting.mjs';
  let fonts = $state([]),
    error = $state(''),
    sample = $state('2x + 3 = 11'),
    family = $state('All');
  onMount(() => {
    const abort = new AbortController();
    Promise.all(
      ['handwriting/pacifico-maths.json', 'handwriting/fonts.json'].map(async (file) => {
        const response = await fetch(asset(file), { signal: abort.signal });
        if (!response.ok) throw new Error('Unable to load the font samples.');
        return response.json();
      }),
    )
      .then(([extended, originals]) => {
        fonts = [extended, ...originals];
      })
      .catch((cause) => {
        if (cause.name !== 'AbortError') error = cause.message;
      });
    return () => abort.abort();
  });
</script>

<svelte:head><title>Handwriting comparison · Maths practice</title></svelte:head>
<SiteHeader back />
<main id="main" tabindex="-1">
  <h1>Handwriting comparison</h1>
  <p>
    Compare the extended Pacifico Maths with the original 16 stroke fonts. Replay writes along the
    supplied pen paths. Pacifico Maths is used for written working in the teaching animations.
  </p>
  <section class="card page-panel">
    <h2>Try the same example in each font</h2>
    <label for="stroke-text">Example to write</label>
    <input id="stroke-text" class="text-field" bind:value={sample} maxlength="80" />
    <label for="stroke-family">Font family</label>
    <select id="stroke-family" class="choice-field" bind:value={family}
      ><option>All</option><option>Hershey</option><option>Vara</option></select
    >
    <p>
      Dashed boxes contain ordinary text for missing characters: they are <strong
        >not available pen strokes</strong
      >. The exact Unicode minus (−) is checked separately from the keyboard hyphen (-).
    </p>
    <p>
      All samples use a 1.5px pen. Compare x with ×, 1 with l, and 0 with O. Serif and bold fonts
      may retrace strokes; their stored order is not necessarily how a teacher would write.
    </p>
    <p>
      Fractions, powers, roots with a bar and vectors also need mathematical layout. A glyph alone
      does not supply that layout. Reduced-motion settings show the completed example immediately.
    </p>
    <p>
      <a href={asset('handwriting/LICENSES.txt')}>Font sources and licences</a> ·
      <a href="https://github.com/techninja/hersheytextjs">Hershey source</a>
      · <a href="https://github.com/akzhy/Vara/tree/master/fonts">Vara source</a>
    </p>
  </section>
  {#if error}<p role="alert">{error}</p>{:else if !fonts.length}<p>Loading font samples…</p>{/if}
  <div class="font-gallery">
    {#each fonts.filter((font) => family === 'All' || font.family === family) as font (font.id)}
      <section class="card page-panel font-card" id={font.id} data-font={font.id}>
        <h2>{font.name.trim()}</h2>
        <p class="muted">{font.family}</p>
        {#if font.id === 'pacifico-maths'}
          <p>
            Pacifico letters and digits with matching maths strokes. Indices reuse the same digit
            shapes.
          </p>
        {/if}
        <StrokeSample {font} text={sample} animated />
        <h3>Letters and numbers</h3>
        <StrokeSample {font} text="ABCDEFGHIJKLMNOPQRSTUVWXYZ" />
        <StrokeSample {font} text="abcdefghijklmnopqrstuvwxyz" />
        <StrokeSample {font} text="0123456789" />
        <h3>Maths symbols</h3>
        <StrokeSample {font} text="+ - − × ÷ = < > ( ) : . % £ /" />
        {#if font.id === 'pacifico-maths'}
          <h3>Maths and units in use</h3>
          {#each ['£12.50 × 3 = £37.50', '25 cm² = 0.0025 m²', 'θ = 30°   π ≈ 3.142'] as example}
            <StrokeSample {font} text={example} animated />
          {/each}
          <StrokeSample {font} text="cm mm km kg g ml L s h °C µm" />
          <h3>Higher maths symbols</h3>
          {#each ['≤ ≥ ≠ ≈ ± √ ∛ π θ ∝ ∞', '∈ ∉ ∪ ∩ ∅ ⊂ ⊆ ′ ″ → ∠ ⊥ ∥', 'α β γ Σ ∑ ℕ ℤ ℝ € μ', 'x² x³ x⁻¹   m² m³   a₁ a₂'] as symbols}
            <StrokeSample {font} text={symbols} />
          {/each}
        {/if}
        <details>
          <summary>Character coverage and Higher GCSE symbols</summary>
          {#each characterGroups as [label, chars]}
            {@const missing = missingCharacters(font, chars)}
            <p><strong>{label}</strong>: {chars}</p>
            <p>{missing.length ? `Missing: ${missing.join(' ')}` : 'All available.'}</p>
          {/each}
          <p>
            Specialist Hershey symbol/Greek sheets use legacy character slots rather than reliable
            Unicode mappings; they are not counted as maths coverage here. Symbols marked missing
            need reviewed paths or a deliberate typeset fallback before adoption.
          </p>
        </details>
      </section>
    {/each}
  </div>
</main>
<SiteFooter />

<style>
  .font-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 28rem), 1fr));
    gap: 1rem;
    margin-block: 1rem;
  }
  .font-card {
    width: 100%;
    min-width: 0;
    margin: 0;
  }
  .font-card h2 {
    margin-top: 0;
  }
  details p {
    overflow-wrap: anywhere;
  }
</style>
