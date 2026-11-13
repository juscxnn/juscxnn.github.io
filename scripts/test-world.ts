import { buildWorld } from "../src/game/world";
import { ERAS, FINALE } from "../src/data/timeline";
import { jumpHeight, reaches } from "../src/game/physics";

let failures = 0;
const ok = (cond: boolean, msg: string) => {
  if (!cond) {
    failures++;
    console.error("FAIL", msg);
  }
};

const H = jumpHeight();
ok(H > 190 && H < 260, `jump height ${H.toFixed(1)} within 190-260`);

for (let seed = 1; seed <= 60; seed++) {
  const w = buildWorld(560, ERAS, FINALE, seed);
  const ps = w.platforms;
  ok(ps.length > 50, `seed ${seed}: ${ps.length} platforms`);

  for (let i = 1; i < ps.length; i++) {
    const a = ps[i - 1];
    const b = ps[i];
    const dy = a.y - b.y;
    const dx = Math.abs(a.x - b.x);
    ok(dy > 0 && dy < H * 0.98, `seed ${seed}: gap ${i} dy=${dy.toFixed(0)}`);
    ok(dx < 215, `seed ${seed}: gap ${i} dx=${dx.toFixed(0)}`);
    ok(b.x > 20 && b.x < w.width - 20, `seed ${seed}: platform ${i} in bounds`);
  }

  ok(ps.some((p) => p.finale), `seed ${seed}: finale platform exists`);
  const cards = ps.filter((p) => p.card).map((p) => p.card!.id);
  for (const era of ERAS) {
    for (const c of era.cards) ok(cards.includes(c.id), `seed ${seed}: card ${c.id} placed`);
  }
  const expectedPickups = ERAS.reduce((n, e) => n + e.pickups.length, 0);
  ok(w.pickups.length === expectedPickups, `seed ${seed}: ${w.pickups.length}/${expectedPickups} pickups`);
  ok(w.eras.length === ERAS.length, `seed ${seed}: ${w.eras.length} eras`);
  ok(w.finaleY < w.eras[w.eras.length - 1].topY, `seed ${seed}: finale above last era`);
}

ok(reaches({ x: 100, y: 0 }, { x: 260, y: -160 }), "diagonal jump is reachable");
ok(!reaches({ x: 100, y: 0 }, { x: 100, y: -400 }), "over-height jump rejected");

console.log(failures === 0 ? "world: all checks passed" : `world: ${failures} failures`);
process.exit(failures === 0 ? 0 : 1);
