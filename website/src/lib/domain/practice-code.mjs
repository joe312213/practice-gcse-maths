// Fixed 54-bit format; the selected subject supplies the code's namespace.
// Header: challenge(2), pageCount-1(2), timing(2). Four entries: topic(5), type(3), slot(4).
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
export const SET_LEVELS = ['Start', 'Build', 'Confidence', 'Super challenge'];
export const TIMINGS = [0, 5, 10, 15];
export const PAGE_TYPES = [
  { id: 0, mode: 'plain', label: 'Independent practice' },
  { id: 1, mode: 'errors', label: 'Spot the error' },
  { id: 2, mode: 'mixed', label: 'Mixed priority' },
  { id: 3, mode: 'problem', label: 'Problem solving' },
];
function integer(value, max) {
  return Number.isInteger(value) && value >= 0 && value <= max;
}
export function encodePracticeSet({ level, timing, pages }) {
  if (
    !integer(level, 3) ||
    !integer(timing, 3) ||
    !Array.isArray(pages) ||
    pages.length < 1 ||
    pages.length > 4
  )
    throw Error('Choose 1–4 pages, a challenge level and a timing option.');
  let bits = BigInt((level << 4) | ((pages.length - 1) << 2) | timing);
  for (let i = 0; i < 4; i++) {
    const page = pages[i];
    if (page && (!integer(page.topic, 31) || !integer(page.type, 7) || !integer(page.slot, 15)))
      throw Error('A page needs a topic (0–31), type (0–7) and slot (0–15).');
    bits = (bits << 12n) | BigInt(page ? (page.topic << 7) | (page.type << 4) | page.slot : 0);
  }
  return Array.from(
    { length: 9 },
    (_, i) => alphabet[Number((bits >> BigInt(48 - i * 6)) & 63n)],
  ).join('');
}
export function decodePracticeSet(raw) {
  const code = String(raw).trim();
  if (!/^[A-Za-z0-9_-]{9}$/.test(code))
    throw Error('Enter a nine-character Practice set code. Capitals matter.');
  let bits = 0n;
  for (const character of code) bits = (bits << 6n) | BigInt(alphabet.indexOf(character));
  const entries = [];
  for (let i = 0; i < 4; i++) {
    const value = Number(bits & 4095n);
    entries.unshift({ topic: value >> 7, type: (value >> 4) & 7, slot: value & 15 });
    bits >>= 12n;
  }
  const header = Number(bits),
    count = ((header >> 2) & 3) + 1;
  if (entries.slice(count).some((page) => page.topic || page.type || page.slot))
    throw Error('This code has data beyond its stated page count.');
  return { level: header >> 4, timing: header & 3, pages: entries.slice(0, count) };
}

/** Slots are author-managed positions, deliberately reusable; no identity tombstones. */
export function resolvePracticePage(catalogue, banks, entry, level, random = Math.random) {
  const topic = catalogue.topics.find((topic) => topic.code === entry.topic);
  const type = PAGE_TYPES.find((type) => type.id === entry.type);
  const bank = banks.find(
    (bank) => bank.subject === catalogue.subject && bank.topic === topic?.bank,
  );
  const slots = topic?.pages.find(
    (page) => page.type === entry.type && page.level === level,
  )?.slots;
  if (!bank || !type || !slots?.length)
    throw Error(
      `${topic?.title ?? `Topic ${entry.topic}`} · ${type?.label ?? `page type ${entry.type}`} · ${SET_LEVELS[level]} is not available yet.`,
    );
  const index =
    entry.slot === 0 ? Math.floor(random() * slots.length) : (entry.slot - 1) % slots.length;
  const ids = slots[index];
  if (
    !ids?.length ||
    ids.length > 10 ||
    new Set(ids).size !== ids.length ||
    ids.some(
      (id) => !bank.questions.some((q) => q.id === id && q.type === type.mode && q.level === level),
    )
  )
    throw Error('This authored page has invalid question references.');
  return { bank, mode: type.mode, ids, slot: index + 1 };
}
export function setSecondsRemaining(set, now) {
  return set?.deadline ? Math.max(0, Math.ceil((set.deadline - now) / 1000)) : null;
}
