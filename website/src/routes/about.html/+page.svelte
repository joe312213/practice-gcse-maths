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
  import { resolve, asset } from '$app/paths';
</script>

<svelte:head><title>About · Maths practice</title></svelte:head>
<SiteHeader section="content" back></SiteHeader>
<main id="main" class="full" tabindex="-1">
  <h1>About Maths practice</h1>
  <section class="card page-panel">
    <h2>Author and purpose</h2>
    <p>Created by Joe Hudson</p>
    <p>
      The motivation for this app was to help Foundation GCSE Maths students achieve a pass in their
      exams, while developing confidence in basic maths methods, and perhaps even enjoy applying
      maths to some problem solving.
    </p>
    <p>
      Many students retaking do not achieve a pass on their 2nd attempt. The hope is that a bit of
      extra regular practice using this app can build some skill and remove the mystery or fear
      around the maths they need, and encourage better attenance and engagement in their regular
      maths lessons.
    </p>

    <h2>Features</h2>
    <ul>
      <li>Progress tracking with cloud sync, learner feedback and revision prioritization</li>
      <li>Adaptive question challenge level</li>
      <li>Initial assessments per topic</li>
      <li>Learn the method guidance with animated demos</li>
      <li>Scaffolded practice</li>
      <li>Spot the error practice to reinforce method application and checking skills</li>
      <li>Regular question practice</li>
      <li>Written problems based on topic methods</li>
      <li>Activity timers</li>
      <li>Sharable activity codes (great for starters)</li>
      <li>Broad selection of non-maths puzzles to compliment regular maths practice</li>
    </ul>
    <h2>Related Apps</h2>
    <p>
      The theme palettes, controls and puzzles are adapted from <a
        href="https://jhudshcg.github.io/starters/">T-Level starters site</a
      >. Its <a href="https://github.com/jhudshcg/starters">source code</a> also informed the approach
      to practice, feedback and saved progress.
    </p>
    <h2>Libraries Used</h2>
    <p>
      Optional estimates use GNU Go 3.8, copyright the Free Software Foundation and contributors,
      under GPL version 3 or later. <a href={asset('/engines/gnugo/COPYING')}>Licence</a> ·
      <a href={asset('/engines/gnugo/gnugo-3.8.tar.gz')}>GNU Go source</a> ·
      <a href={asset('/engines/gnugo/bridge.c')}>Browser bridge</a> ·
      <a href={asset('/engines/gnugo/worker.js')}>Worker source</a> ·
      <a href={asset('/engines/gnugo/build.sh')}>Build script</a> ·
      <a href={asset('/engines/gnugo/EMSCRIPTEN_LICENSE')}>Emscripten licence</a>.
    </p>
    <h2>How it is developed</h2>
    <p>
      This is an agent-augmented development project: I develop specifications and harness related
      processes, UI design, review and update generated code, set the teaching direction, create and
      review a sample of teaching content. The AI helps with planning, reviewing specs and mostly
      takes care of code implementation with close human-in-the-loop feedback and review, content
      preparation and testing. Automated maths and behaviour tests are used alongside manual browser
      and visual checks.
    </p>
    <p>
      The site is still being developed. Checks support review; they do not imply that every topic
      or feature is finished. There are currently many missing topics and planned features,
      hopefully coming soon. Requests and suggestions are welcome.
    </p>
  </section>
</main>
<SiteFooter>
  <a href={resolve('/')}>Return to Maths practice</a>
</SiteFooter>
