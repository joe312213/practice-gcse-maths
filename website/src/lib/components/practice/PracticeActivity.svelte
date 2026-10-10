<!--
  Purpose: Compose the active question, teaching reference, answer form and working area with focus management.

  Main contents:
  - focusAnswer
  - submit

  Used By: website/src/routes/+page.svelte

  Uses: website/src/lib/domain/engine.mjs, website/src/lib/domain/stages.mjs, website/src/lib/components/practice/QuestionList.svelte, website/src/lib/components/practice/AnswerForm.svelte, website/src/lib/components/practice/Feedback.svelte, website/src/lib/components/practice/Progress.svelte, website/src/lib/components/practice/WorkingArea.svelte, website/src/lib/components/practice/Completion.svelte, website/src/lib/components/teaching/Guidance.svelte, website/src/lib/components/teaching/EquationWorking.svelte, website/src/lib/components/teaching/DemoPlayer.svelte.

  Libs: svelte (component lifecycle and state), bits-ui (dialog/popover interaction).
-->
<script>
  import { onMount, tick } from 'svelte';
  import { Dialog } from 'bits-ui';
  import { LEVELS } from '#lib/domain/engine.mjs';
  import { MODES } from '#lib/domain/stages.mjs';
  import QuestionList from './QuestionList.svelte';
  import AnswerForm from './AnswerForm.svelte';
  import Feedback from './Feedback.svelte';
  import WorkingArea from './WorkingArea.svelte';
  import Completion from './Completion.svelte';
  import Guidance from '../teaching/Guidance.svelte';
  import EquationWorking from '../teaching/EquationWorking.svelte';
  import DemoPlayer from '../teaching/MethodDemo.svelte';
  import { asset } from '$app/paths';
  let { view, session, onstage } = $props();
  let mobile = $state(false),
    container,
    referenceButton = $state();
  const page = $derived(view.page);
  const question = $derived(view.bank.questions.find((q) => q.id === page.items[view.selected].id));
  const response = $derived(page.responses[question.id]);
  onMount(() => {
    const media = matchMedia('(max-width: 767px)');
    /**
     * Apply the current responsive or input change to component state.
     */
    const update = () => (mobile = media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  });
  /**
   * Wait for Svelte DOM updates and focus the first available answer field.
   * Calls: tick.
   * Used by: submit.
   */
  async function focusAnswer() {
    await tick();
    container.querySelector('#error-row-0, #answer')?.focus();
  }
  /**
   * Submit the component's current form and update feedback/focus.
   * Calls: tick, focusAnswer.
   */
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
        speed={view.demoSpeed}
        onspeed={session.setDemoSpeed}
      /><button
        class="action-button"
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
      {MODES.find((m) => m[0] === view.mode)[1]} · {page.count}/{page.size} submitted
    </div>
    <div class="level-row">
      <h2 id="stage-title" tabindex="-1">
        {view.mode === 'assessment'
          ? 'What can you do already?'
          : view.mode === 'errors'
            ? 'Find and correct the errors'
            : 'Choose a question'}
      </h2>
      {#if view.mode !== 'assessment'}
        <label
          >Challenge <select
            class="choice-field"
            id="level"
            value={page.level}
            disabled={Boolean(
              page.trial || page.pendingChoice || page.complete || view.practiceSet?.finished,
            )}
            onchange={(event) => session.changeLevel(Number(event.currentTarget.value))}
            >{#each LEVELS as label, index}<option value={index}>{label}</option>{/each}</select
          ></label
        >
        <button
          class="action-button"
          bind:this={referenceButton}
          type="button"
          id="reference"
          onclick={() => session.setReference(!view.reference)}>Method reference</button
        >
      {/if}
    </div>
    <p class="muted">
      {view.mode === 'assessment'
        ? `Try all ${page.size} without hints. This helps you decide where to begin.`
        : view.mode === 'errors'
          ? 'Inspect the written method. Identify the mistake, correct it, then answer the original question.'
          : 'Show your working. Submit each answer when you are ready.'}
    </p>
    {#if view.mode === 'scaffolded'}<p class="muted">
        These answers help you practise and do not change your independent challenge level.
      </p>{/if}
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
    <div class="question-workspace">
      <section id="active-question" aria-labelledby="active-question-title">
        <h3 id="active-question-title">Question {view.selected + 1}</h3>
        <div class="active-question-content">
          <p class="selected-equation">{question.q}</p>
          {#if question.instruction}<p>{question.instruction}</p>{/if}
          {#if view.mode === 'scaffolded'}<Guidance
              guidance={view.bank.teaching.guidance[question.level]}
            />{/if}
          {#if view.mode === 'errors'}{#if question.errorImage}<img
                class="error-working-image"
                src={asset(question.errorImage)}
                alt={`Student working for ${question.q}, with a deliberate mistake. Stated answer: ${question.wrong}.`}
              />{:else}<EquationWorking rows={question.balance} numbered />{/if}{/if}
          <fieldset class="answer-controls" disabled={Boolean(view.practiceSet?.finished)}>
            <AnswerForm
              {question}
              bank={view.bank}
              mode={view.mode}
              {response}
              draft={view.draft}
              assisted={page.assisted[question.id]}
              hintVisible={view.hintVisible}
              inputError={view.inputError}
              onsubmit={submit}
              ondraft={session.updateDraft}
              onhint={session.hint}
            />
          </fieldset>
          <Feedback {question} {response} mode={view.mode} bank={view.bank} />
          <p class="source-ref">{question.id}</p>
        </div>
      </section>
      {#key view.draftKey}<WorkingArea
          embedded
          topic={view.bank.topic}
          draft={view.draft}
          onworking={session.updateDraft}
        />{/key}
    </div>
    <Completion
      {page}
      practiceSet={view.practiceSet}
      onSetNext={() => session.goSetPage(view.practiceSet.index + 1)}
      mode={view.mode}
      {onstage}
      onnext={session.nextPage}
      onpromotion={session.resolvePromotion}
    />
  </section>
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
        <DemoPlayer
          bank={view.bank}
          initialLevel={view.demoLevel}
          onlevel={session.setDemoLevel}
          speed={view.demoSpeed}
          onspeed={session.setDemoSpeed}
        />
        <Dialog.Close class="action-button" id="dismiss-demo">Close reference</Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
{/if}
