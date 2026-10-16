<!--
  Purpose: Render the current answer input and submit action, including pending promotion choices.

  Main contents:
  - Component markup, input props and event bindings.

  Used By: website/src/lib/components/practice/PracticeActivity.svelte

  Uses: website/src/lib/components/teaching/ErrorEntries.svelte.

  Libs: none.
-->
<script>
  import WrappingSelect from '../ui/WrappingSelect.svelte';
  import ErrorInvestigation from '../teaching/ErrorInvestigation.svelte';
  import ErrorEntries from '../teaching/ErrorEntries.svelte';
  let {
    question,
    bank,
    mode,
    response,
    draft,
    draftKey,
    assisted,
    hintVisible,
    inputError,
    onsubmit,
    ondraft,
    onhint,
  } = $props();
</script>

<form
  id="answer-form"
  onsubmit={(event) => {
    event.preventDefault();
    onsubmit();
  }}
>
  {#if mode === 'errors' && question.investigation}
    {#key draftKey}<ErrorInvestigation
        {question}
        {response}
        entries={response?.entries ?? draft.errors}
        onchange={(errors) => ondraft({ errors })}
      />{/key}
  {:else if mode === 'errors' && question.errorOptions}
    <label for="error-correction">Which correction fixes the working?</label>
    <WrappingSelect
      id="error-correction"
      options={question.errorOptions}
      placeholder="Choose a correction"
      disabled={Boolean(response)}
      value={(response?.entries ?? draft.errors)[0]?.correction ?? ''}
      onchange={(correction) => ondraft({ errors: [{ correction }] })}
    />
  {:else if mode === 'errors'}<ErrorEntries
      {question}
      reasons={bank.teaching.errorReasons}
      entries={response?.entries ?? draft.errors}
      disabled={Boolean(response)}
      onchange={(errors) => ondraft({ errors })}
    />{/if}
  {#if question.calculator}<p class="muted">Calculator allowed.</p>{/if}
  <label for="answer">{mode === 'errors' ? 'Corrected answer' : 'Answer'}</label>
  {#if question.answerUnit}<p id="answer-unit" class="muted">
      Give your answer in {question.answerUnit}.
    </p>{/if}
  <input
    id="answer"
    class="text-field answer-result"
    class:corrected-answer-field={mode === 'errors'}
    data-answer-result={response && mode === 'errors'
      ? response.answerCorrect
        ? 'correct'
        : 'incorrect'
      : undefined}
    autocomplete="off"
    inputmode="text"
    value={response?.raw ?? draft.answer}
    disabled={Boolean(response)}
    required
    aria-invalid={inputError ? 'true' : undefined}
    aria-describedby={[question.answerUnit ? 'answer-unit' : '', inputError ? 'input-message' : '']
      .filter(Boolean)
      .join(' ') || undefined}
    oninput={(event) => ondraft({ answer: event.currentTarget.value })}
  />
  {#if question.method === 'bus'}<p>
      {question.answer.includes(' r ')
        ? 'Give a whole-number answer with a remainder, using r.'
        : question.level === 2 || question.q.includes('decimal')
          ? 'Give a decimal or whole-number answer.'
          : 'Give a whole-number answer.'}
    </p>{/if}
  <p id="input-message" role="alert">{inputError}</p>
  <div class="actions">
    <button class="action-button primary" type="submit" disabled={Boolean(response)}
      >Check answer</button
    >{#if mode !== 'assessment' && !response}<button
        class="action-button"
        type="button"
        id="hint"
        aria-expanded={hintVisible}
        aria-controls="question-hint"
        onclick={onhint}>{hintVisible ? 'Hide hint' : 'Hint'}</button
      >{/if}
  </div>
  <p id="question-hint" hidden={!hintVisible}>{question.hint}</p>
  <p id="hint-text" hidden={!assisted || !hintVisible}>
    This question is assisted. Correct answers help you practise but do not increase your success
    score.
  </p>
</form>
