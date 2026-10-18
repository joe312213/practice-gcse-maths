<!--
  Purpose: Render numbered question-selection buttons with answer and selection states.

  Main contents:
  - Component markup, input props and event bindings.

  Used By: website/src/lib/components/practice/PracticeActivity.svelte.

  Uses: website/src/lib/domain/topic-pages.mjs, website/src/lib/domain/reattempts.mjs,
  website/src/lib/components/teaching/MathText.svelte, website/src/lib/domain/engine.mjs,
  website/src/lib/application/question-layout.mjs.

  Libs: none.
-->
<script>
  import { findQuestion } from '#lib/domain/topic-pages.mjs';
  import { latestResponse } from '#lib/domain/reattempts.mjs';
  import MathText from '../teaching/MathText.svelte';
  import { LEVELS } from '#lib/domain/engine.mjs';
  import { fitQuestionRows } from '#lib/application/question-layout.mjs';
  let { bank, page, selected, onselect, assessment = false } = $props();
</script>

<ol
  use:fitQuestionRows
  class="question-list"
  class:assessment
  aria-label="Choose the question to answer"
>
  {#each page.items as item, index (item.id)}
    {@const question = findQuestion(bank, item.id)}
    {@const response = latestResponse(page, item.id)}
    <li class:word-problem={question.prose}>
      <button
        type="button"
        data-question={index}
        class="question-option"
        class:active={index === selected}
        class:correct={response?.correct}
        class:early-reattempt={response?.correct && response.earlyReattempt}
        class:incorrect={response && !response.correct}
        aria-current={index === selected ? 'true' : undefined}
        aria-controls="active-question"
        aria-label={`Question ${index + 1}: ${question.q}${response ? (response.correct ? ', correct' : ', incorrect') : ''}${response?.earlyReattempt ? ', early retry: not counted towards progress' : ''}`}
        onclick={() => onselect(index)}
      >
        <span class="num" aria-hidden="true">{index + 1}</span>
        <span class="question-content"
          ><span class="equation" class:word-question={question.prose}
            ><MathText text={question.q} /></span
          >{#if item.promoted}<span class="level-tag">Now {LEVELS[item.level]}</span>{/if}</span
        >
        <span class="question-outcome" aria-hidden="true"
          >{response ? (response.correct ? '✓' : '✕') : ''}</span
        >
      </button>
    </li>
  {/each}
</ol>
