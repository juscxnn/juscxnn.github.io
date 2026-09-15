// ── KBW 2026 dress ad campaign ─────────────────────────────
//
// THE SITE DOES NOT UPDATE ITSELF WHEN A LOT IS CLAIMED.
// When a claim is confirmed (USDC received + tx signature emailed to you):
//   1. Add the lot key to the `status` object below
//   2. Use "sold" (confirmed) or "pending" (payment sent, not yet verified)
//   3. Commit on github.com → the site redeploys automatically in ~1 minute
//
// Lot key format: {girl}-{day}-{side}
//   girl: A | B | C | D
//   day:  d1 (Sep 29) | d2 (Sep 30) | d3 (Oct 1)
//   side: front | back
//
// Example — Girl B, Sep 30, front lot confirmed:
//   status: {
//     "B-d2-front": "sold",
//   },
//
// Sold lots automatically switch to "take over · 2× price" buttons on the page.
// Remove a key to make a lot available again.

export const kbw = {
  event: "Korea Blockchain Week 2026",
  eventDates: "Sep 29 – Oct 1, 2026",
  location: "Walkerhill, Seoul",
  claimDeadline: "2026-09-23T23:59:59+08:00",
  proceedBar: 30000, // USD committed needed to run the campaign
  wallet: "5zim3VG98LahnQTUef8kGbXQ3yTMZzoXK6q5gj1Lfuww",
  chain: "Solana",
  email: "jcxa@proton.me",

  days: [
    { id: "d1", label: "Sep 29", note: "Upbit Institutional Summit + side events" },
    { id: "d2", label: "Sep 30", note: "Main conference, day 1" },
    { id: "d3", label: "Oct 1", note: "Main conference, day 2" },
  ],

  girls: [
    { id: "A", name: "Girl A", handle: "" },
    { id: "B", name: "Girl B", handle: "" },
    { id: "C", name: "Girl C", handle: "" },
    { id: "D", name: "Girl D", handle: "" },
  ],

  prices: { front: 7500, back: 5000 },

  // status per lot: key = "A-d1-front" → "pending" | "sold"
  status: {} as Record<string, "pending" | "sold">,

  // hotspot boxes (% of image): x, y, w, h — auto-detected from the mockups
  hotspots: {
    front: {
      A: { x: 10.0, y: 29.5, w: 8.0, h: 8.5 },
      B: { x: 27.2, y: 32.0, w: 6.8, h: 12.8 },
      C: { x: 71.5, y: 36.5, w: 5.0, h: 11.0 },
      D: { x: 83.4, y: 34.0, w: 9.2, h: 22.4 },
    },
    back: {
      A: { x: 8.7, y: 32.0, w: 7.3, h: 11.0 },
      B: { x: 27.0, y: 32.0, w: 6.8, h: 12.2 },
      C: { x: 67.6, y: 34.2, w: 7.9, h: 10.9 },
      D: { x: 85.7, y: 33.0, w: 6.8, h: 12.0 },
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
};

export function buildLots(): Lot[] {
  const lots: Lot[] = [];
  for (const g of kbw.girls) {
    for (const d of kbw.days) {
      for (const side of ["front", "back"] as const) {
        const id = `${g.id}-${d.id}-${side}`;
        lots.push({
          id,
          girl: g.id,
          girlName: g.name,
          day: d.id,
          dayLabel: d.label,
          dayNote: d.note,
          side,
          price: kbw.prices[side],
          status: kbw.status[id] || "available",
        });
      }
    }
  }
  return lots;
}
