<script>
  import { onMount } from 'svelte';
  import { LEVELS } from '#lib/domain/engine.mjs';
  import { createPlayer } from '#lib/application/player.mjs';
  import Guidance from './Guidance.svelte';
  import EquationWorking from './EquationWorking.svelte';
  let { bank, initialLevel = 0, onlevel = () => {} } = $props();
  let level = $state(0),
    example = $state('demo'),
    step = $state(1),
    playing = $state(false);
  let player;
  const exampleId = $props.id();
  const question = $derived(
    example === 'demo'
      ? bank.questions.find((q) => q.type === 'demo' && q.level === level)
      : bank.recap[level],
  );
  const annotations = $derived(
    bank.teaching[example === 'demo' ? 'demoAnnotations' : 'recapAnnotations'][level],
  );
  function restart() {
    player?.dispose();
    step = 1;
    playing = false;
    player = createPlayer({
      length: question.balance.length,
      onFrame: (frame) => {
        step = frame.step;
        playing = frame.playing;
      },
    });
  }
  onMount(() => {
    level = initialLevel;
    restart();
    return () => player?.dispose();
  });
  function chooseLevel(value) {
    level = value;
    onlevel(value);
    restart();
  }
</script>

<div class="demo-body">
  <div class="level-row" role="group" aria-label="Demonstration challenge">
    {#each LEVELS as label, index}<button
        type="button"
        data-demo-level={index}
        aria-pressed={index === level}
        onclick={() => chooseLevel(index)}>{label}</button
      >{/each}
  </div>
  <Guidance guidance={bank.teaching.guidance[level]} />
  <label for={exampleId}>Example</label>
  <select id={exampleId} data-demo-example bind:value={example} onchange={restart}
    ><option value="demo">Worked example</option><option value="recap"
      >{bank.recap[level].title}</option
    ></select
  >
  <p class="selected-equation">
    {question.q ?? `${question.balance[0].l} = ${question.balance[0].r}`}
  </p>
  <div class="demo-controls">
    <button
      type="button"
      class="btn primary"
      id="demo-play"
      onclick={() => (playing ? player.pause() : player.play())}
      >{playing ? 'Pause' : step === question.balance.length ? 'Replay' : 'Play'}</button
    >
    <div class="secondary-controls">
      <button type="button" id="demo-back" disabled={step <= 1} onclick={() => player.go(step - 1)}
        >Previous</button
      >
      <button
        type="button"
        id="demo-next"
        disabled={step >= question.balance.length}
        onclick={() => player.go(step + 1)}>Next</button
      >
      <button
        type="button"
        id="demo-all"
        disabled={step >= question.balance.length}
        onclick={() => player.go(question.balance.length)}>End</button
      >
    </div>
  </div>
  <!-- Visual progress stays readable without announcing every playback frame. -->
  <p class="demo-status">Step {step} of {question.balance.length}{playing ? ' · playing' : ''}</p>
  <div class="demo-working">
    <EquationWorking rows={question.balance} limit={step} {annotations} />
  </div>
  {#if step === question.balance.length}<div class="demo-check">
      {#if question.check}<p>
          <strong>Check:</strong>
          {question.check}
        </p>{/if}{#each question.notes ?? [] as note}<p>{note}</p>{/each}
    </div>{/if}
</div>
