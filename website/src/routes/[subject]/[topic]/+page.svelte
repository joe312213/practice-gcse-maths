<script>
  import TopicPractice from '#lib/components/practice/TopicPractice.svelte';
  let { data } = $props();
</script>

{#key data.topicId}<TopicPractice topicId={data.topicId} />{/key}
