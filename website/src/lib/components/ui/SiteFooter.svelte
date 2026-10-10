<!-- Shared footer links and reporting action; each route may retain its own explanatory copy. -->
<script>
  import { resolve } from '$app/paths';
  import IssueReport from './IssueReport.svelte';
  let { children, question = null, topic = '' } = $props();
</script>

<footer>
  {@render children?.()}
  <div class="footer-links">
    <a href={resolve('/about.html')}>About</a>
    <IssueReport {question} {topic} />
  </div>
</footer>
