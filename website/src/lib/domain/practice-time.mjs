/**
 * Purpose: Apply active-time rules adapted from T-Level starters commit 69560b2. Clocks are transient and never recover absence as practice.
 *
 * Main contents:
 * - Inactivity constants; initialise, settle, engage, interact, poll and pause operations.
 *
 * Used By: adapters/practice-time.mjs.
 *
 * Uses: No local modules.
 *
 * Libs: None.
 */
export const IDLE_MS = 120000;
export const INTERACTION_POLL_MS = 5000;
/**
 * Ensure attempt has a transient clock at now (milliseconds). Called by timing operations.
 */
export function initialisePractice(attempt, now = Date.now()) {
  attempt.practiceClock ??= {
    milliseconds: 0,
    measuredFrom: now,
    accountedAt: now,
    running: false,
  };
  const clock = attempt.practiceClock;
  clock.expiresAt ??= (clock.lastActivity ?? now) + IDLE_MS;
  clock.interacted ??= false;
  return clock;
}
/**
 * Credit attempt only up to now, its idle expiry or deadline. Calls initialisePractice; used by engage, poll and pause.
 * @example settlePractice(attempt, now); // A delayed poll never credits time beyond idle expiry.
 */
export function settlePractice(attempt, now = Date.now()) {
  if (!attempt.practiceClock) return;
  const clock = initialisePractice(attempt, now);
  const end = Math.min(now, attempt.deadline ?? now, clock.expiresAt);
  if (clock.running) clock.milliseconds += Math.max(0, end - clock.accountedAt);
  clock.accountedAt = Math.max(clock.accountedAt, now);
  if (now >= Math.min(clock.expiresAt, attempt.deadline ?? Infinity)) clock.running = false;
}
// Explicit display/resume starts a fresh inactivity window, without charging absence.
/**
 * Resume attempt at now without crediting absence. Calls initialisePractice and settlePractice; used by interaction and the browser adapter.
 */
export function engagePractice(attempt, now = Date.now()) {
  if (attempt.finished) return;
  const clock = initialisePractice(attempt, now);
  settlePractice(attempt, now);
  clock.accountedAt = now;
  clock.expiresAt = now + IDLE_MS;
  clock.interacted = false;
  clock.running = true;
}
// Hot path: repeated mouse events only set a flag. No timer creation or clock settlement.
/**
 * Record interaction on attempt at optional now; restart an expired clock. Calls engagePractice; used by the browser adapter.
 */
export function notePracticeInteraction(attempt, now) {
  if (attempt.finished) return;
  const clock = attempt.practiceClock;
  if (clock?.running && clock.interacted) return;
  now ??= Date.now();
  if (!clock?.running || now >= clock.expiresAt) engagePractice(attempt, now);
  attempt.practiceClock.interacted = true;
  attempt.saved = now;
}
/**
 * Settle attempt at now before extending an interacted clock. Calls initialisePractice and settlePractice; used by adapter polling.
 */
export function pollPractice(attempt, now = Date.now()) {
  if (attempt.finished || !attempt.practiceClock) return;
  const clock = initialisePractice(attempt, now),
    interacted = clock.interacted;
  // Settle against the old expiry first: delayed callbacks cannot charge a long idle gap.
  settlePractice(attempt, now);
  if (interacted && now < (attempt.deadline ?? Infinity)) {
    clock.expiresAt = now + IDLE_MS;
    clock.running = true;
  }
  clock.interacted = false;
}
/**
 * Settle attempt at now and stop its clock. Calls settlePractice; used on hide, navigation and disposal.
 */
export function pausePractice(attempt, now = Date.now()) {
  settlePractice(attempt, now);
  if (attempt.practiceClock) {
    attempt.practiceClock.running = false;
    attempt.practiceClock.interacted = false;
  }
}
