/** Short-lived working only: isolated by learner/topic/attempt/question, excluded from progress backups. */
export const WORKING_TTL = 3 * 60 * 60 * 1000;
const prefix = 'maths-working-v1:';
export function createWorkingCache(storage, warn = () => {}, now = Date.now) {
  const memory = new Map();
  let warned = false;
  function warning() {
    if (!warned) warn('Working is available in this page, but could not be saved for reloading.');
    warned = true;
  }
  function prune() {
    if (!storage) return;
    for (let i = storage.length - 1; i >= 0; i--) {
      const key = storage.key(i);
      if (!key?.startsWith(prefix)) continue;
      try {
        const record = JSON.parse(storage.getItem(key));
        if (!record || record.expiresAt <= now()) storage.removeItem(key);
      } catch {
        storage.removeItem(key);
      }
    }
  }
  try {
    prune();
  } catch {
    warning();
  }
  return {
    load(id) {
      let record = memory.get(id);
      try {
        record ??= storage ? JSON.parse(storage.getItem(prefix + id)) : null;
      } catch {
        warning();
      }
      if (!record || record.expiresAt <= now()) return null;
      return structuredClone(record.working);
    },
    save(id, draft) {
      const { working, strokes, points, guides = [], canvasHeight = 230 } = draft;
      const record = {
        expiresAt: now() + WORKING_TTL,
        working: structuredClone({ working, strokes, points, guides, canvasHeight }),
      };
      memory.set(id, record);
      try {
        prune();
        storage?.setItem(prefix + id, JSON.stringify(record));
      } catch {
        warning();
      }
    },
  };
}
