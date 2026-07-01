// Per-file reading-position memory, persisted to localStorage.

const KEY = "zimd.scroll.v1";

function load(): Record<string, number> {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return {};
}

let positions = load();
let timer: ReturnType<typeof setTimeout> | undefined;

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(positions));
  } catch {
    /* ignore */
  }
}

/** Saved scroll offset for a path (0 if none). */
export function getScroll(path: string): number {
  return positions[path] ?? 0;
}

/** Record a scroll offset for a path (debounced write). */
export function saveScroll(path: string, top: number): void {
  positions[path] = top;
  clearTimeout(timer);
  timer = setTimeout(persist, 250);
}
