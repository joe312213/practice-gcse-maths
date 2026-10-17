<!-- A topic change resets the shared player's level/example state. -->
<script>
  import DemoPlayer from './DemoPlayer.svelte';
  let { bank, ...props } = $props();
</script>

{#key bank.topic}<DemoPlayer {bank} {...props} />{/key}
