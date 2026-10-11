/**
 * Purpose: Bind active practice timing to session changes and browser lifecycle; save credited time in hourly buckets.
 *
 * Main contents:
 * - createPracticeTimer; bindPracticeTimer.
 *
 * Used By: TopicPractice.svelte and practice-time tests.
 *
 * Uses: domain/practice-time.mjs.
 *
 * Libs: None; browser objects, clock, identifiers and persistence are injected.
 */
import {
  engagePractice,
  pausePractice,
  pollPractice,
  notePracticeInteraction,
  INTERACTION_POLL_MS,
} from '../domain/practice-time.mjs';
const HOUR = 3600000;
/**
 * Coordinate session views with hourly practice records.
 * Parameters: data/save hold durable progress; now/uuid are injected clock and identity functions.
 * Calls domain clock operations; used by bindPracticeTimer and timing tests.
 * @example const timer = createPracticeTimer({ data, save }); timer.select(view);
 */
export function createPracticeTimer({
  data,
  save,
  now = Date.now,
  uuid = () => crypto.randomUUID(),
}) {
  let target = null,
    clock = null,
    visit = null;
  /**
   * Apply operation to the current clock and save newly credited milliseconds in their UTC-hour buckets.
   * Called by timer controls; never assigns an idle gap to a later week.
   */
  function flush(operation) {
    if (!clock) return;
    const before = clock.practiceClock.milliseconds;
    const start = clock.practiceClock.accountedAt;
    operation(clock, now());
    let remaining = clock.practiceClock.milliseconds - before;
    if (!remaining) return;
    let at = start;
    const records = (target.topic.practice ??= []);
    while (remaining > 0) {
      const hour = Math.floor(at / HOUR) * HOUR;
      const duration = Math.min(remaining, hour + HOUR - at);
      let record = records.find((item) => item.id === visit && item.at === hour);
      if (!record) {
        record = {
          id: visit,
          at: hour,
          type: target.type,
          attempt: target.attempt,
          milliseconds: 0,
        };
        records.push(record);
      }
      record.milliseconds += duration;
      at += duration;
      remaining -= duration;
    }
    save(data);
  }
  return {
    select(view, visible = true) {
      const profile = data.profiles.find((item) => item.key === view.profile?.key);
      const scope = `${view.bank.subject}:${view.bank.topic}`;
      const attempt = view.page?.attempt ?? 'demo';
      const key =
        profile && !view.page?.complete && !view.practiceSet?.finished
          ? JSON.stringify([profile.key, scope, view.mode, attempt])
          : null;
      if (key === target?.key) return;
      flush(pausePractice);
      clock = null;
      target = key
        ? {
            key,
            topic: (profile.topics[scope] ??= { tracks: {}, pages: {}, history: [] }),
            type: view.mode,
            attempt,
          }
        : null;
      if (target) {
        if (profile.practiceMeasuredFrom === undefined) {
          profile.practiceMeasuredFrom = now();
          save(data);
        }
        visit = uuid();
        clock = { deadline: view.timingDeadline };
        engagePractice(clock, now());
        if (!visible) pausePractice(clock, now());
      }
    },
    interact() {
      flush(notePracticeInteraction);
    },
    poll() {
      flush(pollPractice);
    },
    pause() {
      flush(pausePractice);
    },
    resume() {
      flush(engagePractice);
    },
  };
}
/**
 * Subscribe session timing to injected document/window interaction and lifecycle events.
 * Options are forwarded to createPracticeTimer. Returns cleanup for timers, listeners and subscription.
 * Used by TopicPractice onMount.
 * @example const stop = bindPracticeTimer(session, { data, save }, document, window);
 */
export function bindPracticeTimer(session, options, document, window) {
  const timer = createPracticeTimer(options);
  const unsubscribe = session.subscribe((view) => timer.select(view, !document.hidden));
  const interact = () => {
    if (!document.hidden) timer.interact();
  };
  const visibility = () => (document.hidden ? timer.pause() : timer.resume());
  const pause = () => timer.pause();
  const resume = () => {
    if (!document.hidden) timer.resume();
  };
  const events = ['pointerdown', 'pointermove', 'keydown', 'input'];
  events.forEach((name) => document.addEventListener(name, interact, { passive: true }));
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('pagehide', pause);
  window.addEventListener('pageshow', resume);
  const interval = window.setInterval(() => {
    if (!document.hidden) timer.poll();
  }, INTERACTION_POLL_MS);
  return () => {
    timer.pause();
    unsubscribe();
    window.clearInterval(interval);
    events.forEach((name) => document.removeEventListener(name, interact));
    document.removeEventListener('visibilitychange', visibility);
    window.removeEventListener('pagehide', pause);
    window.removeEventListener('pageshow', resume);
  };
}
