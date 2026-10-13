<!--
  Purpose: Present answer feedback and available correction explanations.

  Main contents:
  - Component markup, input props and event bindings.

  Used By: website/src/lib/components/practice/PracticeActivity.svelte

  Uses: website/src/lib/components/teaching/EquationWorking.svelte and ArithmeticWorking.svelte.

  Libs: none.
-->
<script>
  import CalculationWorking from '../teaching/CalculationWorking.svelte';
  import MathText from '../teaching/MathText.svelte';
  import ArithmeticWorking from '../teaching/ArithmeticWorking.svelte';
  import EquationWorking from '../teaching/EquationWorking.svelte';
  let { question, response, mode, bank } = $props();
</script>

{#if response}
  <div
    class="feedback"
    class:correct={response.correct}
    class:incorrect={!response.correct}
    role="status"
    tabindex="-1"
  >
    <strong>{response.correct ? 'Correct.' : 'Not quite yet.'}</strong>{#if response.assisted}
      <span>Assisted practice.</span>{/if}
    {#if mode === 'errors' && !question.errorOptions}
      <ul>
        {#each response.details ?? [] as detail, index}<li>
            Error {index + 1}: {detail.rowCorrect ? 'row correct' : 'check the row'}; {detail.reasonCorrect
              ? 'reason correct'
              : 'check the reason'}; {detail.stepCorrect
              ? 'corrected step correct'
              : 'check the corrected step'}.
          </li>{/each}
      </ul>
      <p>
        {response.answerCorrect ? 'Your final value is right.' : 'Check your final value of x.'}
      </p>
    {/if}
    <details>
      <summary>Answer, method and check</summary>
      <p>
        <strong>Answer:</strong>
        {(question.method ?? bank.method) ? '' : 'x = '}<MathText
          text={question.model?.kind === 'fractions' ? `{${question.answer}}` : question.answer}
          unit={question.answerUnit}
        />
      </p>
      {#if question.method_note && question.method !== 'calculation'}<p>
          {question.method_note}
        </p>{/if}
      {#if mode === 'errors' && !question.errorOptions}<ul>
          {#each question.errors as error}<li>
              Row {error.row + 1}: {bank.teaching.errorReasons.find((r) => r.id === error.reason)
                .label} Corrected step: {question.stepOptions.find((s) => s.id === error.correction)
                .text}.
            </li>{/each}
        </ul>{/if}
      <!-- Each method owns its correction drawing. -->
      {#if question.method === 'calculation'}<CalculationWorking
          {question}
        />{:else if question.method ?? bank.method}<ArithmeticWorking
          {question}
        />{:else}<EquationWorking rows={question.correct_balance ?? question.balance} />{/if}
      {#if question.correction}<p>{question.correction}</p>{/if}
      {#if !response.correct && question.error_note && question.error_note !== question.correction}<p
        >
          <strong
            >If you got <MathText
              text={question.model?.kind === 'fractions' ? `{${question.wrong}}` : question.wrong}
            />:</strong
          >
          {question.error_note}
        </p>{/if}
      <p><strong>Check:</strong> <MathText text={question.check} /></p>
    </details>
  </div>
{/if}
