import type { Lang } from "../data/timeline";

const KEY = "climb.v2";

export type Save = {
  best: number;
  seen: string[];
  unlocked: { id: string; label: string; href?: string }[];
  sound: boolean;
  lang: Lang;
  theme: "light" | "dark" | null;
};

const fallback = (): Save => ({
  best: 0,
  seen: [],
  unlocked: [],
  sound: false,
  lang: "en",
  theme: null,
});

export function load(): Save {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback();
    const parsed = JSON.parse(raw) as Partial<Save>;
    return { ...fallback(), ...parsed, seen: parsed.seen ?? [], unlocked: parsed.unlocked ?? [] };
  } catch {
    return fallback();
  }
}

export function save(s: Save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* private mode */
  }
}

export function markSeen(s: Save, id: string): boolean {
  if (s.seen.includes(id)) return false;
  s.seen.push(id);
  return true;
}

export function unlock(s: Save, item: { id: string; label: string; href?: string }): boolean {
  if (s.unlocked.some((u) => u.id === item.id)) return false;
  s.unlocked.push(item);
  return true;
}
