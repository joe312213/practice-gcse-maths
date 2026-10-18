<!--
  Purpose: Keep progress explanations and recovery guidance available outside practice pages.

  Main contents:
  - Topic-selection/stage guide and preserved saving, timer and troubleshooting answers.

  Used By: SvelteKit route loading/prerendering.

  Uses: website/src/lib/components/ui/SiteHeader.svelte,
  website/src/lib/components/ui/SiteFooter.svelte.

  Libs: $app/paths (SvelteKit navigation/route state).
-->
<script>
  import { resolve } from '$app/paths';
  import SiteHeader from '#lib/components/ui/SiteHeader.svelte';
  import SiteFooter from '#lib/components/ui/SiteFooter.svelte';
</script>

<svelte:head><title>How To &amp; FAQ · Maths practice</title></svelte:head>
<SiteHeader section="help" back />
<main id="main" tabindex="-1">
  <h1>How To &amp; FAQ</h1>
  <section class="card page-panel">
    <h2>Choose a topic and work through the stages</h2>
    <p>
      On Topics selection page (home), choose a card to learn about that topic and develop the skills you need to answers questions on that topic. Use search to find a topic, or change the
      sort order. On a topic page, you can use the Topic selector to switch topics. Follow the suggested
      order when you are unsure where to start.
    </p>
    <ol>
      <li>
        <strong>Initial assessment:</strong> try a few questions without help to find a useful starting
        level. Try your best, but don't worry about getting any questions wrong. It's just to see where you're currently at for that topic.
      </li>
      <li>
        <strong>Learn the method:</strong> read the setup, open linked words for fuller explanations, and play
        or step through examples. Try another example or level when ready.
      </li>
      <li>
        <strong>Scaffolded practice:</strong> practise with the steps beside you to build confidence before
        working independently.
      </li>
      <li>
        <strong>Spot the error:</strong> find and repair mistakes in someone else’s working. Finding and explaining
        an error helps you avoid it yourself and be more accurate in your working.
      </li>
      <li>
        <strong>Independent practice:</strong> answer without prompts to check what you can do. Use a
        hint or Check method whenever you need help. (Assisted answers are practice, but not counted as independent progress).
      </li>
      <li>
        <strong>Problem solving:</strong> choose and apply the topic method(s) in a word based problem. This helps you to recognised where to apply the method(s), if the question isn't already stated directly as maths process. Watch out for where the answer requires units, and make sure you use the right one.
      </li>
    </ol>
    <p>
      Problem-solving topics have five stages: their Independent practice already covers problem
      solving. You can revisit any stage. After a wrong answer, tap the answer field to try again
      when retry is available. (correct retries within two hours do not raise your progress score).
    </p>
    <h2>How do I save my progress?</h2>
    <p>
      Your answers save in this browser as you work. To keep a copy in OneDrive, select
      <strong>Save to OneDrive</strong> and choose your OneDrive folder. We’ll put your progress in the
      Maths folder and update it as you finish pages or change stages.
    </p>
    <h2>Using another computer?</h2>
    <p>
      Let OneDrive finish syncing first. On <a href={resolve('/progress.html')}>Progress</a>, select
      <strong>Open progress file</strong> and choose your saved file from the Maths folder. Use one computer
      at a time. Your results travel with you; unfinished pages and drawings stay in the original browser.
    </p>
    <h2>Which copy of my progress should I use?</h2>
    <p>
      If your OneDrive file has newer results, we’ll ask whether to use them. This replaces the
      progress on this browser. If you’re unsure, keep your browser progress and download a backup
      before choosing.
    </p>
    <h2>Having trouble saving or opening a file?</h2>
    <p>
      Your browser progress stays here if a save fails. Try <strong>Save progress file</strong>
      on Progress and allow folder access if asked. If you’re using an app’s preview window, download
      a backup first, then open the site in Chrome or Edge and import it there.
    </p>
    <p>
      To restore a backup, choose the Maths progress file ending in <strong>.json</strong>. A file
      that cannot be opened won’t replace your progress. Check any save warning before closing the
      tab: closing too quickly can interrupt a save.
    </p>
    <h2>How do timers work?</h2>
    <p>
      The timer is optional. Use + or − to choose your time, then Start. You can pause or reset it.
      A soft chime sounds when time is up, but you can keep working. Timed Practice sets have their
      own time limit.
    </p>
    <h2>What do the progress bars show?</h2>
    <p>
      They show how you’ve done recently at each level. Select a segment for more detail. Answers
      completed with help don’t raise your score. Weekly figures cover the whole week, so they may
      look different. A dash means there isn’t enough information yet.
    </p>
    <h2>How is practice time counted?</h2>
    <p>
      Time counts while you’re learning or practising. It pauses when you switch tabs or stop
      interacting for two minutes.
    </p>
    <h2>When is a recommended set complete?</h2>
    <p>Finish all four pages. Your answers don’t all need to be correct.</p>
    <h2>Still need help?</h2>
    <p>
      Try refreshing the page. If the problem continues, use <strong>Report an issue</strong>
      below. You can check the report before sending it.
    </p>
  </section>
</main>
<SiteFooter />
