<!--
  Purpose: Render numbered question-selection buttons with answer and selection states.

  Main contents:
  - Component markup, input props and event bindings.

  Used By: website/src/lib/components/practice/PracticeActivity.svelte

  Uses: website/src/lib/domain/engine.mjs.

  Libs: none.
-->
<script>
  import { LEVELS } from '#lib/domain/engine.mjs';
  let { bank, page, selected, onselect } = $props();
</script>

<ol class="question-list" aria-label="Choose the question to answer">
  {#each page.items as item, index (item.id)}
    {@const question = bank.questions.find((q) => q.id === item.id)}
    {@const response = page.responses[item.id]}
    <li>
      <button
        type="button"
        data-question={index}
        class="question-option"
        class:active={index === selected}
        class:correct={response?.correct}
        class:incorrect={response && !response.correct}
        aria-current={index === selected ? 'true' : undefined}
        aria-controls="active-question"
        aria-label={`Question ${index + 1}: ${question.q}${response ? (response.correct ? ', correct' : ', incorrect') : ''}`}
        onclick={() => onselect(index)}
      >
        <span class="num" aria-hidden="true">{index + 1}</span>
        <span class="question-content"
          ><span class="equation">{question.q}</span>{#if item.promoted}<span class="level-tag"
              >Now {LEVELS[item.level]}</span
            >{/if}</span
        >
        <span class="question-outcome" aria-hidden="true"
          >{response ? (response.correct ? '✓' : '✕') : ''}</span
        >
      </button>
    </li>
  {/each}
</ol>
