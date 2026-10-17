<!--
  Purpose: Present answer feedback and available correction explanations.

  Main contents:
  - Component markup, input props and event bindings.

  Used By: website/src/lib/components/practice/PracticeActivity.svelte

  Uses: website/src/lib/components/teaching/EquationWorking.svelte and ArithmeticWorking.svelte.

  Libs: none.
-->
<script>
  import { workingText } from '#lib/application/error-working.mjs';
  import CalculationWorking from '../teaching/CalculationWorking.svelte';
  import MathText from '../teaching/MathText.svelte';
  import ArithmeticWorking from '../teaching/ArithmeticWorking.svelte';
  import EquationWorking from '../teaching/EquationWorking.svelte';
  let { question, response, mode, bank } = $props();
</script>

{#if response}
  <div
    class="feedback"
    class:investigation-feedback={question.investigation}
    class:correct={response.correct}
    class:early-reattempt={response.correct && response.earlyReattempt}
    class:incorrect={!response.correct}
    role="status"
    tabindex="-1"
  >
    <div class="feedback-summary">
      <strong>{response.correct ? 'Correct.' : 'Not quite yet.'}</strong>{#if response.assisted}
        <span>Assisted practice.</span>{/if}
      {#if response.earlyReattempt}<p>
          Early retry: this answer does not count towards progress. Wait at least two hours after
          your most recent incorrect answer for a retry to count.
        </p>{/if}
      {#if mode === 'errors' && !question.errorOptions && !question.investigation}
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
      {#if question.investigation}
        {#each response.details ?? [] as detail}
          {#if !detail.reasonCorrect}<p>
              <strong
                >{question.locations.find((location) => location.id === detail.location)
                  ?.label}:</strong
              >
              {detail.locationCorrect
                ? 'Recheck the reason for this mistake.'
                : question.consequences.includes(detail.location)
                  ? 'This follows from an earlier mistake. Find where that mistake began.'
                  : 'There is no independent method mistake here.'}
            </p>{/if}
        {/each}
        {#if response.missing}<p>There is still a method mistake to find.</p>{/if}
        <p>
          {response.answerCorrect
            ? 'Your corrected answer is right.'
            : 'Recheck your corrected answer.'}
        </p>
      {/if}
    </div>
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
      {#if mode === 'errors' && !question.errorOptions && !question.investigation}<ul>
          {#each question.errors as error}<li>
              Row {error.row + 1}: {bank.teaching.errorReasons.find((r) => r.id === error.reason)
                .label} Corrected step: {question.stepOptions.find((s) => s.id === error.correction)
                .text}.
            </li>{/each}
        </ul>{/if}
      <!-- Each method owns its correction drawing. -->
      {#if question.investigation}
        <ul>
          {#each question.errors as error}<li>
              {question.locations.find((location) => location.id === error.location)?.label}: {error.feedback}
            </li>{/each}
        </ul>
        <ol>
          {#each question.correctWorking as line}<li>
              <MathText text={workingText(line)} />
            </li>{/each}
        </ol>
      {:else if question.method === 'calculation'}<CalculationWorking
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
