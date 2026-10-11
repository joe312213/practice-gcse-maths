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
  {@render children?.()}
  <div class="footer-links">
    <a href={resolve('/about.html')}>About</a>
    <IssueReport {question} {topic} />
  </div>
</footer>
