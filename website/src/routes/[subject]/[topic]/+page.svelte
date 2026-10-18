<!--
  Purpose: Mount a fresh topic practice session when the resolved topic changes.

  Main contents:
  - Keyed TopicPractice component.

  Used By: SvelteKit route loading/prerendering.

  Uses: website/src/lib/components/practice/TopicPractice.svelte.

  Libs: none.
-->
<script>
  import TopicPractice from '#lib/components/practice/TopicPractice.svelte';
  let { data } = $props();
</script>

{#key data.topicId}<TopicPractice topicId={data.topicId} bankVersions={data.bankVersions} />{/key}
