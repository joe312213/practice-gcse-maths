<script>
  import { onMount, tick } from 'svelte';
  import { Dialog } from 'bits-ui';
  import { LEVELS } from '#lib/domain/engine.mjs';
  import { MODES } from '#lib/application/session.mjs';
  import QuestionList from './QuestionList.svelte';
  import AnswerForm from './AnswerForm.svelte';
  import Feedback from './Feedback.svelte';
  import Progress from './Progress.svelte';
  import WorkingArea from './WorkingArea.svelte';
  import Completion from './Completion.svelte';
  import Guidance from '../teaching/Guidance.svelte';
  import EquationWorking from '../teaching/EquationWorking.svelte';
  import DemoPlayer from '../teaching/DemoPlayer.svelte';
  let { view, session } = $props();
  let mobile = $state(false),
    container,
    referenceButton = $state();
  const page = $derived(view.page);
  const question = $derived(view.bank.questions.find((q) => q.id === page.items[view.selected].id));
  const response = $derived(page.responses[question.id]);
  onMount(() => {
    const media = matchMedia('(max-width: 767px)');
    const update = () => (mobile = media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  });
  async function focusAnswer() {
    await tick();
    container.querySelector('#error-row-0, #answer')?.focus();
  }
  async function submit() {
    const result = session.submitAnswer();
    await tick();
    if (result.advanced) focusAnswer();
    else if (!result.invalid) container.querySelector('.feedback')?.focus();
  }
</script>

<div bind:this={container} class="layout" class:with-reference={view.reference && !mobile}>
  {#if view.reference && !mobile}
    <aside class="card reference">
      <h2>Method reference</h2>
      <DemoPlayer
        bank={view.bank}
        initialLevel={view.demoLevel}
        onlevel={session.setDemoLevel}
      /><button
        type="button"
        id="close-reference"
        onclick={() => {
          session.setReference(false);
          referenceButton.focus();
        }}>Close reference</button
      >
    </aside>
  {/if}
  <section class="card question-panel">
    <div class="meta">
      {MODES.find((m) => m[0] === view.mode)[1].split(' · ')[1]} · {page.count}/{page.size} submitted
    </div>
    <div class="level-row">
      <h2>
        {view.mode === 'assessment'
          ? 'What can you do already?'
          : view.mode === 'errors'
            ? 'Find and correct the errors'
            : 'Choose a question'}
      </h2>
      {#if view.mode !== 'assessment'}
        <label
          >Challenge <select
            id="level"
            value={page.level}
            disabled={Boolean(page.trial || page.pendingChoice || page.complete)}
            onchange={(event) => session.changeLevel(Number(event.currentTarget.value))}
            >{#each LEVELS as label, index}<option value={index}>{label}</option>{/each}</select
          ></label
        >
        <button
          bind:this={referenceButton}
          type="button"
          id="reference"
          onclick={() => session.setReference(!view.reference)}>Method reference</button
        >
      {/if}
    </div>
    <p class="muted">
      {view.mode === 'assessment'
        ? 'Try all four without hints. This helps you decide where to begin.'
        : view.mode === 'errors'
          ? 'Inspect the written method. Identify each independent mistake, then solve the original equation.'
          : 'Show your working. Submit each answer when you are ready.'}
    </p>
    <QuestionList
      bank={view.bank}
      {page}
      selected={view.selected}
      onselect={(index) => {
        session.select(index);
        focusAnswer();
      }}
    />
    <hr />
    <section id="active-question" aria-labelledby="active-question-title">
      <h3 id="active-question-title">Question {view.selected + 1}</h3>
      <p class="selected-equation">{question.q}</p>
      {#if view.mode === 'scaffolded'}<Guidance
          guidance={view.bank.teaching.guidance[question.level]}
        />{/if}
      {#if view.mode === 'errors'}<EquationWorking rows={question.balance} numbered />{/if}
      <AnswerForm
        {question}
        bank={view.bank}
        mode={view.mode}
        {response}
        draft={view.draft}
        assisted={page.assisted[question.id]}
        inputError={view.inputError}
        onsubmit={submit}
        ondraft={session.updateDraft}
        onhint={session.hint}
      />
      <Feedback {question} {response} mode={view.mode} bank={view.bank} />
      <p class="source-ref">{question.id}</p>
    </section>
    <Completion
      {page}
      mode={view.mode}
      onreview={() => session.switchMode('demo')}
      onnext={session.nextPage}
      onpromotion={session.resolvePromotion}
    />
  </section>
  <aside>
    <Progress mode={view.mode} {page} track={view.track} />
    {#key view.draftKey}<WorkingArea
        number={view.selected + 1}
        paper={view.paper}
        draft={view.draft}
        onpaper={session.setPaper}
        onworking={session.updateDraft}
      />{/key}
  </aside>
</div>
{#if mobile}
  <Dialog.Root open={view.reference} onOpenChange={(open) => session.setReference(open)}>
    <Dialog.Portal>
      <Dialog.Overlay class="dialog-overlay" />
      <Dialog.Content
        class="dialog-panel"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          referenceButton?.focus();
        }}
      >
        <Dialog.Title>Method reference</Dialog.Title><Dialog.Description class="sr-only"
          >Review the method. This question is recorded as assisted.</Dialog.Description
        >
        <DemoPlayer bank={view.bank} initialLevel={view.demoLevel} onlevel={session.setDemoLevel} />
        <Dialog.Close id="dismiss-demo">Close reference</Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
{/if}
