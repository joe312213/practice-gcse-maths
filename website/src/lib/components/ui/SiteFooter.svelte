<!--
  Purpose: Share About and issue-report links while accepting route-specific footer text.

  Main contents:
  - SiteFooter.

  Used By: website/src/lib/components/practice/TopicPractice.svelte,
  website/src/routes/+page.svelte, website/src/routes/about.html/+page.svelte,
  website/src/routes/go.html/+page.svelte, website/src/routes/handwriting.html/+page.svelte,
  website/src/routes/help.html/+page.svelte, website/src/routes/progress.html/+page.svelte.

  Uses: website/src/lib/components/ui/IssueReport.svelte.

  Libs: $app/paths (SvelteKit navigation/route state).
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
    <a href={resolve('/help.html')}>How To &amp; FAQ</a>
    <IssueReport {question} {topic} />
  </div>
</footer>
