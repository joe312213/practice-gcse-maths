<!--
  Purpose: A topic change resets the shared player's level/example state.

  Main contents:
  - Keyed DemoPlayer boundary that resets playback when the source bank changes.

  Used By: website/src/lib/components/practice/PracticeActivity.svelte,
  website/src/lib/components/practice/TopicPractice.svelte.

  Uses: website/src/lib/components/teaching/DemoPlayer.svelte.

  Libs: none.
-->
<script>
  import DemoPlayer from './DemoPlayer.svelte';
  let { bank, ...props } = $props();
</script>

{#key bank.topic}<DemoPlayer {bank} {...props} />{/key}
