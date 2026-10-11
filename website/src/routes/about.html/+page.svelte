<!--
  Purpose: Present authorship, source credits and the local-progress explanation.

  Main contents:
  - Component markup, input props and event bindings.

  Used By: SvelteKit route loading.

  Uses: SiteHeader.svelte and SiteFooter.svelte.

  Libs: $app/paths (base-aware URLs).
-->
<script>
  import SiteHeader from '#lib/components/ui/SiteHeader.svelte';
  import SiteFooter from '#lib/components/ui/SiteFooter.svelte';
  import { resolve } from '$app/paths';
</script>

<svelte:head><title>About · Maths practice</title></svelte:head>
<SiteHeader section="content" back></SiteHeader>
<main id="main" class="full" tabindex="-1">
  <h1>About Maths practice</h1>
  <section class="card">
    <h2>Author and purpose</h2>
    <p>
      Created by Joe Hudson to help Foundation GCSE Maths students practise accurate methods and
      build confidence through short, regular activities.
    </p>
    <h2>Related Apps</h2>
    <p>
      The theme palettes, controls and puzzles are adapted from <a
        href="https://jhudshcg.github.io/starters/">T-Level starters site</a
      >. Its <a href="https://github.com/jhudshcg/starters">source code</a> also informed the approach
      to practice, feedback and saved progress.
    </p>
    <h2>How it is developed</h2>
    <p>
      This is an agent-augmented development project: I develop specifications and harness related processes, UI design, review and update generated code, set the teaching direction, create and review a
      sample of teaching content. The AI helps with planning, reviewing specs and mostly takes care of code implementation with close human-in-the-loop feedback and review, content preparation
      and testing. Automated maths and behaviour tests are used alongside manual browser and visual checks.
    </p>
    <p>
      The site is still being developed. Checks support review; they do not imply that every topic
      or feature is finished. There are currently many missing topics and planned features,
      hopefully coming soon. Requests and suggestions are welcome.
    </p>
    <h2>Progress tracking feature</h2>
    <p>
      Names and progress are stored in this browser on this device. They are not online accounts and
      are not synchronised across devices.
    </p>
  </section>
</main>
<SiteFooter>
  <a href={resolve('/')}>Return to Maths practice</a>
</SiteFooter>
