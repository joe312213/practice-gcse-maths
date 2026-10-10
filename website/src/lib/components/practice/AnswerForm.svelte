<!--
  Purpose: Render the current answer input and submit action, including pending promotion choices.

  Main contents:
  - Component markup, input props and event bindings.

  Used By: website/src/lib/components/practice/PracticeActivity.svelte

  Uses: website/src/lib/components/teaching/ErrorEntries.svelte.

  Libs: none.
-->
<script>
  import ErrorEntries from '../teaching/ErrorEntries.svelte';
  let {
    question,
    bank,
    mode,
    response,
    draft,
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
  {#if mode === 'errors' && question.errorOptions}
    <label for="error-correction">Which correction fixes the working?</label>
    <select
      id="error-correction"
      class="choice-field"
      required
      disabled={Boolean(response)}
      value={(response?.entries ?? draft.errors)[0]?.correction ?? ''}
      onchange={(event) => ondraft({ errors: [{ correction: event.currentTarget.value }] })}
    >
      <option value="">Choose a correction</option>
      {#each question.errorOptions as option}<option value={option.id}>{option.text}</option>{/each}
    </select>
  {:else if mode === 'errors'}<ErrorEntries
      {question}
      reasons={bank.teaching.errorReasons}
      entries={response?.entries ?? draft.errors}
      disabled={Boolean(response)}
      onchange={(errors) => ondraft({ errors })}
    />{/if}
  <label for="answer"
    >{bank.method ? 'Answer' : `${mode === 'errors' ? 'Final correct value' : 'Value'} of x`}</label
  >
  <input
    id="answer"
    class="text-field"
    autocomplete="off"
    inputmode="text"
    placeholder={question.answer.includes(' r ') ? 'e.g. 24 r 1' : 'e.g. 7, −2 or 1/2'}
    value={response?.raw ?? draft.answer}
    disabled={Boolean(response)}
    required
    aria-invalid={inputError ? 'true' : undefined}
    aria-describedby={inputError ? 'input-message' : undefined}
    oninput={(event) => ondraft({ answer: event.currentTarget.value })}
  />
  {#if bank.method === 'bus'}<p>
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
