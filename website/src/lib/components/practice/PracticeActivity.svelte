<!--
  Purpose: Compose the active question, teaching reference, answer form and working area with focus management.

  Main contents:
  - focusAnswer
  - submit

  Used By: website/src/lib/components/practice/TopicPractice.svelte

  Uses: website/src/lib/domain/engine.mjs, website/src/lib/domain/stages.mjs, website/src/lib/components/practice/QuestionList.svelte, website/src/lib/components/practice/AnswerForm.svelte, website/src/lib/components/practice/Feedback.svelte, website/src/lib/components/practice/WorkingArea.svelte, website/src/lib/components/practice/Completion.svelte, website/src/lib/components/teaching/Guidance.svelte, website/src/lib/components/teaching/EquationWorking.svelte, website/src/lib/components/teaching/MethodDemo.svelte.

  Libs: svelte (component lifecycle and state), bits-ui (dialog/popover interaction).
-->
<script>
  import { stageTextFor } from '#lib/content/stage-text.mjs';
  import { guidanceFor } from '#lib/content/topic-bank.mjs';
  import { findQuestion } from '#lib/domain/topic-pages.mjs';
  import { latestResponse } from '#lib/domain/reattempts.mjs';
  import MathText from '../teaching/MathText.svelte';
  import CalculationWorking from '../teaching/CalculationWorking.svelte';
  import ProblemTips from '../teaching/ProblemTips.svelte';
  import { onMount, tick } from 'svelte';
  import { Dialog } from 'bits-ui';
  import { LEVELS } from '#lib/domain/engine.mjs';
  import { MODES } from '#lib/domain/stages.mjs';
  import PracticeCountdown from './PracticeCountdown.svelte';
  import PageNavigation from '../ui/PageNavigation.svelte';
  import QuestionList from './QuestionList.svelte';
  import AnswerForm from './AnswerForm.svelte';
  import Feedback from './Feedback.svelte';
  import WorkingArea from './WorkingArea.svelte';
  import Completion from './Completion.svelte';
  import Guidance from '../teaching/Guidance.svelte';
  import EquationWorking from '../teaching/EquationWorking.svelte';
  import DemoPlayer from '../teaching/MethodDemo.svelte';
  import { asset } from '$app/paths';
  let { view, session } = $props();
  let mobile = $state(false),
    container,
    referenceButton = $state();
  const page = $derived(view.page);
  const stageText = $derived(stageTextFor(view.bank, view.mode, page.size));
  const hasProblemTips = $derived(
    view.mode === 'problem' || (view.bank.problemSolvingTopic && view.mode === 'plain'),
  );
  const question = $derived(findQuestion(view.bank, page.items[view.selected].id));
  const response = $derived(view.retrying ? null : latestResponse(page, question.id));
  let assessmentNow = $state(Date.now());
  const canReassess = $derived(view.assessment && assessmentNow >= view.assessment.availableAt);
  onMount(() => {
    const assessmentClock = setInterval(() => {
      assessmentNow = Date.now();
    }, 60000);
    // Match the shared CSS boundary: a narrow viewport presents the reference as a dialog.
    const mediumWidth = getComputedStyle(document.documentElement)
      .getPropertyValue('--breakpoint-viewport-medium')
      .trim();
    const media = matchMedia(`(width < ${mediumWidth})`);
    /**
     * Switch the method reference between dialog and inline presentation at the shared boundary.
     */
    const update = () => (mobile = media.matches);
    update();
    media.addEventListener('change', update);
    return () => {
      clearInterval(assessmentClock);
      media.removeEventListener('change', update);
    };
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
        bank={view.sourceBank}
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
  <section class="card stage-panel question-panel">
    <div class="practice-question-header" class:assessment-header={view.mode === 'assessment'}>
      <div class="practice-question-heading">
        <div class="meta">
          {MODES.find((m) => m[0] === view.mode)?.[1] ?? 'Mixed revision'} · {page.count}/{page.size}
          submitted
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
              >Level <select
                class="choice-field"
                id="level"
                value={view.pageNavigation?.level ?? page.level}
                disabled={Boolean(
                  view.bank.combined ||
                  page.trial ||
                  page.pendingChoice ||
                  (view.practiceSet && page.complete) ||
                  view.practiceSet?.finished,
                )}
                onchange={(event) => session.changeLevel(Number(event.currentTarget.value))}
                >{#each LEVELS as label, index}<option value={index}>{label}</option>{/each}</select
              ></label
            >
          {/if}
        </div>
      </div>
      {#if view.mode !== 'assessment'}
        <div class="practice-question-tools">
          {#if !hasProblemTips}<button
              class="action-button quiet"
              bind:this={referenceButton}
              type="button"
              id="reference"
              aria-expanded={view.reference}
              onclick={() => session.setReference(!view.reference)}>Check method</button
            >{/if}
          {#if ['errors', 'plain', 'problem', 'mixed'].includes(view.mode) && view.practiceSet?.remaining == null}
            {#key page.attempt}<PracticeCountdown
                questions={page.size}
                complete={page.complete}
              />{/key}
          {/if}
        </div>
      {/if}
    </div>
    {#if view.mode === 'assessment' && page.complete && view.assessment}
      <div class="assessment-result">
        <p>
          <strong
            >Assessment complete · {view.assessment.correct} of {view.assessment.size} correct.</strong
          >
        </p>
        <button
          class="action-button quiet reassess-link"
          class:ready={canReassess}
          disabled={!canReassess}
          onclick={() => session.reassess()}>Reassess</button
        >
        {#if !canReassess}<span class="muted"
            >Available {new Date(view.assessment.availableAt).toLocaleDateString('en-GB')}</span
          >{/if}
      </div>
    {/if}
    {#if stageText.intro}<p class="muted">{stageText.intro}</p>{/if}
    {#if stageText.note}<p class="muted">{stageText.note}</p>{/if}
    {#if hasProblemTips}
      <ProblemTips
        teaching={view.sourceBank.problemTeaching}
        level={question.level}
        open={view.tips}
        onopen={session.setProblemTips}
        speed={view.demoSpeed}
        onspeed={session.setDemoSpeed}
      />
    {/if}
    <QuestionList
      bank={view.bank}
      assessment={view.mode === 'assessment'}
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
          {#if question.questionPrefix ?? view.sourceBank.questionPrefix}
            <p class="question-prefix">
              {question.questionPrefix ?? view.sourceBank.questionPrefix}
            </p>
          {/if}
          <p class="selected-equation" class:word-question={question.prose}>
            <MathText text={question.q} />
          </p>
          {#if question.instruction}<p>{question.instruction}</p>{/if}
          {#if view.mode === 'scaffolded'}<Guidance
              guidance={guidanceFor(view.bank.teaching, question.level)}
            />{/if}
          {#if view.mode === 'errors' && !question.investigation}<div class="error-working">
              {#if question.errorSteps}<CalculationWorking
                  {question}
                  steps={question.errorSteps}
                />{:else if question.errorImage}{#key question.errorImage}<div
                    class="error-working-diagram"
                  >
                    <img
                      class="error-working-image"
                      onload={(event) =>
                        event.currentTarget.parentElement.style.setProperty(
                          '--error-image',
                          `url("${event.currentTarget.currentSrc}")`,
                        )}
                      src={asset(question.errorImage)}
                      alt={`Student working for ${question.q}, with a deliberate mistake. Stated answer: ${question.wrong}.`}
                    />
                  </div>{/key}{:else}<EquationWorking rows={question.balance} numbered />{/if}
            </div>{/if}
          <fieldset
            class="answer-controls"
            disabled={!view.retrying && Boolean(view.practiceSet?.finished || page.complete)}
          >
            <AnswerForm
              {question}
              bank={view.sourceBank}
              mode={view.mode}
              {response}
              draft={view.draft}
              draftKey={view.draftKey}
              assisted={page.assisted[question.id]}
              hintVisible={view.hintVisible}
              inputError={view.inputError}
              onsubmit={submit}
              ondraft={session.updateDraft}
              onhint={session.hint}
            />
          </fieldset>
        </div>
      </section>
      <Feedback {question} {response} mode={view.mode} bank={view.sourceBank} />
      {#if view.canRetry && !view.retrying}
        <button
          class="action-button"
          type="button"
          id="retry-question"
          onclick={async () => {
            session.retryQuestion();
            await tick();
            focusAnswer();
          }}>Try this question again</button
        >
      {/if}
      {#key view.draftKey}<WorkingArea
          embedded
          topic={view.bank.topic}
          draft={view.draft}
          onworking={session.updateDraft}
        />{/key}
    </div>
    {#if !view.practiceSet && view.mode !== 'assessment'}
      <PageNavigation
        label="Practice page navigation"
        previousLabel="Previous page of questions"
        nextLabel="Next page of questions"
        previousDisabled={view.pageNavigation.index === 0 || Boolean(page.pendingChoice)}
        nextDisabled={view.pageNavigation.index === view.pageNavigation.total - 1 ||
          Boolean(page.pendingChoice)}
        onprevious={() => {
          session.previousPage();
          focusAnswer();
        }}
        onnext={() => {
          session.nextPage();
          focusAnswer();
        }}><span class="question-code">{question.id}</span></PageNavigation
      >
    {:else}
      <p class="source-ref question-code">{question.id}</p>
    {/if}
    <Completion
      {page}
      practiceSet={view.practiceSet}
      onSetNext={() => session.goSetPage(view.practiceSet.index + 1)}
      mode={view.mode}
      onnext={session.restartPage}
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
          bank={view.sourceBank}
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

<style>
  .reassess-link {
    color: var(--muted);
  }
  .reassess-link.ready {
    color: var(--ink);
    font-weight: 700;
  }
  .practice-question-header {
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
    align-items: start;
    gap: 0.5rem;
  }
  .assessment-header {
    grid-template-columns: minmax(0, 1fr);
  }
  .practice-question-heading {
    min-width: 0;
  }
  .practice-question-heading h2 {
    font-size: clamp(1rem, 5cqw, 1.5rem);
  }
  .practice-question-heading label {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.875rem;
  }
  .practice-question-tools {
    display: grid;
    justify-items: end;
    gap: 0.75rem;
    min-width: 0;
    font-size: 0.875rem;
  }
  .practice-question-tools > button {
    font-size: inherit;
    padding-inline: 0;
  }
  .question-prefix {
    margin-bottom: 0.25rem;
  }
</style>
