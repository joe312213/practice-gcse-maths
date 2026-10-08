<!--
  Purpose: Present authorship, source credits and the local-progress explanation.

  Main contents:
  - Component markup, input props and event bindings.

  Used By: SvelteKit route loading.

  Uses: no local module imports.

  Libs: $app/paths (base-aware URLs).
-->
<script>
  import { resolve } from '$app/paths';
</script>

<svelte:head><title>About · Maths practice</title></svelte:head>
<a class="skip" href="#main">Skip to content</a>
<header>
  <a class="brand" href={resolve('/')}>Maths<span> / practice</span></a><a href={resolve('/')}
    >Back to practice</a
  >
</header>
<main id="main" class="full" tabindex="-1">
  <h1>About Maths practice</h1>
  <section class="card">
    <h2>Author and purpose</h2>
    <p>
      Created by Joe Hudson to help Foundation GCSE Maths students practise accurate methods and
      build confidence through short, regular activities.
    </p>
    <h2>Credits</h2>
    <p>
      The theme palettes and controls are adapted from <a
        href="https://jhudshcg.github.io/starters/">T-Level starters site</a
      >. Its <a href="https://github.com/jhudshcg/starters">source code</a> also informed the approach
      to practice, feedback and saved progress.
    </p>
    <h2>How it is developed</h2>
    <p>
      This is an agent-augmented development project: I set the teaching direction and reviewed a
      sample of the material, with OpenAI Codex assisting with implementation, content preparation
      and checks. Automated maths and behaviour tests are used alongside manual browser and visual
      checks.
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
<footer>
  <a href={resolve('/')}>Return to Maths practice</a>
  <a href={resolve('/about.html')} aria-current="page">About</a>
</footer>
