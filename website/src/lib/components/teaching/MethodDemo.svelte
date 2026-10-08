<!--
  Purpose: Select the topic-owned demonstration without coupling playback to a method.
  Main contents: Equation and arithmetic adapter selection.
  Used By: Practice route and PracticeActivity.
  Uses: DemoPlayer and ArithmeticDemo.
  Libs: none.
-->
<script>
  import DemoPlayer from './DemoPlayer.svelte';
  import ArithmeticDemo from './ArithmeticDemo.svelte';
  let { bank, ...props } = $props();
</script>

{#key bank.topic}
  {#if bank.method}<ArithmeticDemo {bank} {...props} />{:else}<DemoPlayer {bank} {...props} />{/if}
{/key}
