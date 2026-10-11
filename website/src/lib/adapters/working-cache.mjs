/**
 * Purpose: Cache temporary drawing and typed working separately from durable progress.
 *
 * Main contents:
 * - WORKING_TTL; createWorkingCache.
 *
 * Used By: TopicPractice.svelte, session.mjs and working-cache tests.
 *
 * Uses: domain/working.mjs for the default canvas height.
 *
 * Libs: None; accepts an injected Storage-compatible object and clock.
 */
import { DEFAULT_WORKING_HEIGHT } from '../domain/working.mjs';

export const WORKING_TTL = 3 * 60 * 60 * 1000;
const prefix = 'maths-working-v1:';
/**
 * Create isolated, expiring working records with an in-memory fallback.
 * Parameters: storage is a Storage-compatible object; warn reports persistence failure; now supplies milliseconds.
 * Used by: TopicPractice and session; calls prune before returning load/save operations.
 * @example const cache = createWorkingCache(sessionStorage); cache.save(key, draft);
 */
export function createWorkingCache(storage, warn = () => {}, now = Date.now) {
  const memory = new Map();
  let nextExpiry = 0;
  let warned = false;
  /**
   * Report unavailable persistence once per cache instance. Called by prune, load and save failure paths.
   */
  function warning() {
    if (!warned) warn('Working is available in this page, but could not be saved for reloading.');
    warned = true;
  }
  /**
   * Remove expired memory/storage records on construction and when the earliest known expiry arrives.
   * Parameter at: current epoch milliseconds; called by load/save. Reads never extend expiry.
   */
  function prune(at) {
    if (at < nextExpiry) return;
    nextExpiry = Infinity;
    for (const [id, record] of memory) {
      if (record.expiresAt <= at) memory.delete(id);
      else nextExpiry = Math.min(nextExpiry, record.expiresAt);
    }
    if (!storage) return;
    for (let i = storage.length - 1; i >= 0; i--) {
      const key = storage.key(i);
      if (!key?.startsWith(prefix)) continue;
      try {
        const record = JSON.parse(storage.getItem(key));
        if (!record || !Number.isFinite(record.expiresAt) || record.expiresAt <= at)
          storage.removeItem(key);
        else nextExpiry = Math.min(nextExpiry, record.expiresAt);
      } catch {
        storage.removeItem(key);
      }
    }
  }
  try {
    prune(now());
  } catch {
    warning();
  }
  return {
    /**
     * Return an isolated working copy for id, or null after expiry. Called by session.resetDraft.
     */
    load(id) {
      const at = now();
      try {
        prune(at);
      } catch {
        warning();
      }
      let record = memory.get(id);
      try {
        record ??= storage ? JSON.parse(storage.getItem(prefix + id)) : null;
      } catch {
        warning();
      }
      if (!record || !Number.isFinite(record.expiresAt) || record.expiresAt <= at) return null;
      nextExpiry = Math.min(nextExpiry, record.expiresAt);
      return structuredClone(record.working);
    },
    /**
     * Cache only drawing/typed working from draft under id, refreshing expiry. Calls prune; used by session.updateDraft.
     */
    save(id, draft) {
      const at = now();
      try {
        prune(at);
      } catch {
        warning();
      }
      const {
        working,
        strokes,
        points,
        guides = [],
        canvasHeight = DEFAULT_WORKING_HEIGHT,
      } = draft;
      const record = {
        expiresAt: at + WORKING_TTL,
        working: structuredClone({ working, strokes, points, guides, canvasHeight }),
      };
      memory.set(id, record);
      nextExpiry = Math.min(nextExpiry, record.expiresAt);
      try {
        storage?.setItem(prefix + id, JSON.stringify(record));
      } catch {
        warning();
      }
    },
  };
}
