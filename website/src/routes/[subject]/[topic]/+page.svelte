<!--
  Purpose: Mount a fresh topic practice session when the resolved topic changes.

  Main contents:
  - Keyed TopicPractice component.

  Used By: SvelteKit subject/topic route.

  Uses: TopicPractice.svelte; adjacent route loader.

  Libs: Svelte (props and keyed lifecycle).
-->
<script>
  import TopicPractice from '#lib/components/practice/TopicPractice.svelte';
  let { data } = $props();
</script>

{#key data.topicId}<TopicPractice topicId={data.topicId} />{/key}
