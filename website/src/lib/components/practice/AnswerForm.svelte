<script>
  import ErrorEntries from '../teaching/ErrorEntries.svelte';
  let { question, bank, mode, response, draft, assisted, inputError, onsubmit, ondraft, onhint } =
    $props();
</script>

<form
  id="answer-form"
  onsubmit={(event) => {
    event.preventDefault();
    onsubmit();
  }}
>
  {#if mode === 'errors'}<ErrorEntries
      {question}
      reasons={bank.teaching.errorReasons}
      entries={response?.entries ?? draft.errors}
      disabled={Boolean(response)}
      onchange={(errors) => ondraft({ errors })}
    />{/if}
  <label for="answer">{mode === 'errors' ? 'Final correct value' : 'Value'} of x</label>
  <input
    id="answer"
    class="answer-input"
    autocomplete="off"
    inputmode="text"
    placeholder="e.g. 7, −2 or 1/2"
    value={response?.raw ?? draft.answer}
    disabled={Boolean(response)}
    required
    aria-invalid={inputError ? 'true' : undefined}
    aria-describedby={inputError ? 'input-message' : undefined}
    oninput={(event) => ondraft({ answer: event.currentTarget.value })}
  />
  <p id="input-message" role="alert">{inputError}</p>
  <div class="actions">
    <button class="btn primary" type="submit" disabled={Boolean(response)}>Check answer</button
    >{#if mode !== 'assessment' && !response}<button type="button" id="hint" onclick={onhint}
        >Hint</button
      >{/if}
  </div>
  <p id="hint-text" hidden={!assisted}>
    This question is assisted. Correct answers help you practise but do not increase your success
    score.
  </p>
</form>
