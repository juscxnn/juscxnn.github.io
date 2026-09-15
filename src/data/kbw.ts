// ── KBW 2026 dress ad campaign ─────────────────────────────
//
// THE SITE DOES NOT UPDATE ITSELF WHEN A LOT IS CLAIMED.
// Easiest: open /kbw-admin, tap the spot, enter brand + logo, save.
// Manual alternative: edit src/data/kbw-status.json on github.com and commit —
// the site redeploys automatically in ~1 minute.
//
// Lot key format: {girl}-{day}-{side}
//   girl: A | B | C | D
//   day:  d1 (Sep 30) | d2 (Oct 1) | d3 (Oct 2)
//   side: front | back
//
// Example — Girl B, Sep 30, front confirmed, with sponsor info:
//   status: {
//     "B-d2-front": {
//       status: "sold",
//       brand: "Acme",
//       url: "https://acme.com",
//       logo: "/kbw/logos/acme.png",   // drop the file in public/kbw/logos/
//     },
//   },
//
// Simpler form also works: "B-d2-front": "sold"  (no logo shown on the dress)
// Sold lots automatically switch to "take over · 2× price" buttons.
// Remove a key to make a lot available again.

import statusData from "./kbw-status.json";

export type LotStatus = "pending" | "sold";

export type SponsorInfo = {
  status: LotStatus;
  brand?: string;
  url?: string;
  logo?: string;
};

export type LotEntry = LotStatus | SponsorInfo;

export const kbw = {
  event: "Korea Blockchain Week 2026",
  eventDates: "Sep 29 – Oct 1, 2026",
  worn: "Sep 30 – Oct 2, 2026",
  location: "Walkerhill, Seoul",
  claimDeadline: "2026-09-23T23:59:59+08:00",
  proceedBar: 30000, // internal only — the minimum to run the trip. NOT displayed on the page.
  wallet: "5zim3VG98LahnQTUef8kGbXQ3yTMZzoXK6q5gj1Lfuww",
  chain: "Solana",
  telegram: "yoloking0",
  email: "jcxa@proton.me",

  days: [
    { id: "d1", label: "Sep 30", note: "Main conference day 1 + side events" },
    { id: "d2", label: "Oct 1", note: "Main conference day 2 + side events" },
    { id: "d3", label: "Oct 2", note: "Side events + dinners" },
  ],

  girls: [
    { id: "A", name: "Girl A", handle: "" },
    { id: "B", name: "Girl B", handle: "" },
    { id: "C", name: "Girl C", handle: "" },
    { id: "D", name: "Girl D", handle: "" },
  ],

  prices: { front: 7500, back: 5000 },

  // status per lot lives in kbw-status.json — edit it via /kbw-admin (or by hand)
  // key = "A-d1-front" → { status, brand, url, logo }
  status: statusData as Record<string, LotEntry>,

  // hotspot boxes (% of image): x, y, w, h — auto-detected from the mockups
  hotspots: {
    front: {
      A: { x: 19.9, y: 28.8, w: 6.2, h: 9.6 },
      B: { x: 37.1, y: 26.9, w: 7.6, h: 9.6 },
      C: { x: 62.0, y: 30.3, w: 7.2, h: 9.6 },
      D: { x: 84.3, y: 30.0, w: 6.5, h: 10.1 },
    },
    back: {
      A: { x: 15.3, y: 28.3, w: 5.8, h: 7.9 },
      B: { x: 37.2, y: 29.0, w: 7.5, h: 8.0 },
      C: { x: 60.2, y: 31.2, w: 5.8, h: 7.0 },
      D: { x: 82.1, y: 30.0, w: 7.2, h: 8.4 },
    },
  },
};

export type Lot = {
  id: string;
  girl: string;
  girlName: string;
  day: string;
  dayLabel: string;
  dayNote: string;
  side: "front" | "back";
  price: number;
  status: "available" | "pending" | "sold";
  brand?: string;
  url?: string;
  logo?: string;
};

export function buildLots(): Lot[] {
  const lots: Lot[] = [];
  for (const g of kbw.girls) {
    for (const d of kbw.days) {
      for (const side of ["front", "back"] as const) {
        const id = `${g.id}-${d.id}-${side}`;
        const entry = kbw.status[id];
        const info: SponsorInfo | null =
          !entry ? null : typeof entry === "string" ? { status: entry } : entry;
        lots.push({
          id,
          girl: g.id,
          girlName: g.name,
          day: d.id,
          dayLabel: d.label,
          dayNote: d.note,
          side,
          price: kbw.prices[side],
          status: info ? info.status : "available",
          brand: info?.brand,
          url: info?.url,
          logo: info?.logo,
        });
      }
    }
  }
  return lots;
}
