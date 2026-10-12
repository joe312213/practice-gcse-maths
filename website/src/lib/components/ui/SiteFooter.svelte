<!--
  Purpose: Share About and issue-report links while accepting route-specific footer text.

  Main contents:
  - SiteFooter.

  Used By: Homepage, TopicPractice, Progress, Puzzles and About routes.

  Uses: IssueReport.svelte.

  Libs: Svelte (props/snippets); $app/paths (base-aware links).
-->
<script>
  import { resolve } from '$app/paths';
  import IssueReport from './IssueReport.svelte';
  let { children, question = null, topic = '' } = $props();
</script>

<footer>
  <p>Developed by Joe Hudson 2026</p>
  {#if children}<p>{@render children()}</p>{/if}
  <div class="footer-links">
    <a href={resolve('/about.html')}>About</a>
    <a href={resolve('/help.html')}>FAQ &amp; troubleshooting</a>
    <IssueReport {question} {topic} />
  </div>
</footer>
