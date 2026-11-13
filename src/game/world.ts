import type { Card, Era } from "../data/timeline";

export type PlatType = "stable" | "moving" | "fragile";

export type Platform = {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  type: PlatType;
  spring?: boolean;
  baseX?: number;
  range?: number;
  phase?: number;
  speed?: number;
  card?: Card;
  era?: string;
  finale?: boolean;
  alive: boolean;
  respawnAt?: number;
};

export type PickupEntity = {
  id: string;
  kind: "study" | "cert";
  label: string;
  zh?: string;
  href?: string;
  x: number;
  y: number;
  taken: boolean;
};

export type EraMark = {
  id: string;
  label: { en: string; zh: string };
  topY: number;
  checkpointY: number;
  checkpointX: number;
  index: number;
};

export type World = {
  width: number;
  startX: number;
  startY: number;
  topY: number;
  platforms: Platform[];
  pickups: PickupEntity[];
  eras: EraMark[];
  finale: Card;
  finaleY: number;
};

export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function buildWorld(width: number, eras: Era[], finale: Card, seed = 20260101): World {
  const W = Math.max(320, width);
  const rng = mulberry32(seed);
  const margin = 56;
  const platforms: Platform[] = [];
  const marks: EraMark[] = [];
  let id = 0;
  let prevX = W / 2;
  let prevY = 0;

  const rollType = (): PlatType => {
    const r = rng();
    if (r < 0.1) return "fragile";
    if (r < 0.23) return "moving";
    return "stable";
  };

  const addPlatform = (x: number, y: number, w: number, type: PlatType, extra: Partial<Platform> = {}) => {
    const p: Platform = { id: id++, x, y, w, h: 14, type, alive: true, ...extra };
    platforms.push(p);
    return p;
  };

  addPlatform(W / 2, 0, 250, "stable");

  const chainTo = (targetY: number, goalX: number | null) => {
    const dy = prevY - targetY;
    const steps = Math.max(1, Math.round(dy / 128));
    const step = dy / steps;
    for (let i = 1; i < steps; i++) {
      prevY -= step;
      if (goalX == null) {
        prevX = clamp(prevX + (rng() * 2 - 1) * 138, margin, W - margin);
      } else {
        const remain = steps - i + 1;
        const dx = clamp((goalX - prevX) / remain, -150, 150);
        prevX = clamp(prevX + dx + (rng() * 2 - 1) * 26, margin, W - margin);
      }
      const type = rollType();
      const spring = type === "stable" && rng() < 0.08;
      addPlatform(prevX, prevY, 96, type, {
        spring,
        baseX: prevX,
        range: type === "moving" ? 46 + rng() * 46 : 0,
        phase: rng() * Math.PI * 2,
        speed: 0.9 + rng() * 0.7,
      });
    }
  };

  eras.forEach((era, index) => {
    const anchorY = prevY - 760;
    const anchorX = clamp(prevX + (rng() * 2 - 1) * 140, margin + 34, W - margin - 34);
    chainTo(anchorY, anchorX);
    addPlatform(anchorX, anchorY, 204, "stable", { card: era.cards[0], era: era.id });
    prevX = anchorX;
    prevY = anchorY;
    marks.push({
      id: era.id,
      label: era.label,
      topY: anchorY,
      checkpointY: anchorY,
      checkpointX: anchorX,
      index,
    });

    for (const card of era.cards.slice(1)) {
      const y = prevY - 760;
      chainTo(y, null);
      const x = clamp(prevX + (rng() * 2 - 1) * 150, margin + 26, W - margin - 26);
      addPlatform(x, y, 172, "stable", { card });
      prevX = x;
      prevY = y;
    }
  });

  const finaleY = prevY - 560;
  chainTo(finaleY, W / 2);
  addPlatform(W / 2, finaleY, 300, "stable", { card: finale, finale: true });
  prevY = finaleY;
  prevX = W / 2;

  const pickups: PickupEntity[] = [];
  const fillers = platforms.filter((p) => !p.card && p.w <= 100);
  if (fillers.length) {
    let ci = Math.floor(fillers.length * 0.3);
    for (const era of eras) {
      for (const pk of era.pickups) {
        const p = fillers[ci % fillers.length];
        ci += 5;
        if (!p) continue;
        pickups.push({ ...pk, x: p.x, y: p.y - 74, taken: false });
      }
    }
  }

  return {
    width: W,
    startX: W / 2,
    startY: 0,
    topY: finaleY,
    platforms,
    pickups,
    eras: marks,
    finale,
    finaleY,
  };
}
