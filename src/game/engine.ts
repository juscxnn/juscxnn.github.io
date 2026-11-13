import { buildWorld, type World, type Platform, type PickupEntity } from "./world";
import { stepBody, bounce, landsOn, RADIUS, JUMP_V, SPRING_V, STEP, type Body } from "./physics";
import { draw, readPalette, type Particle, type Palette } from "./render";
import { play } from "./audio";
import { ERAS, FINALE, type Card } from "../data/timeline";

export type HudState = {
  year: string;
  era: { en: string; zh: string };
  progress: number;
  best: number;
  altitude: number;
  marks: number[];
};

export type Stats = { best: number; falls: number; time: number };

export type EngineEvents = {
  card: (card: Card) => void;
  era: (index: number, id: string) => void;
  pickup: (pk: PickupEntity) => void;
  finale: (stats: Stats) => void;
  fall: () => void;
  hud: (h: HudState) => void;
};

export class Engine {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private events: EngineEvents;

  private world!: World;
  private player: Body = { x: 0, y: 0, vx: 0, vy: 0, r: RADIUS };
  private particles: Particle[] = [];
  private camY = 0;
  private width = 0;
  private height = 0;
  private dpr = 1;

  private running = false;
  private input = 0;
  private acc = 0;
  private last = 0;
  private time = 0;
  private anim = 0;
  private raf = 0;

  private checkpoint = 0;
  private falls = 0;
  private best = 0;
  private shake = 0;
  private hudAcc = 0;
  private autopilot = false;
  private fired = new Set<number>();
  private pal: Palette;
  private reduced: boolean;

  constructor(canvas: HTMLCanvasElement, events: EngineEvents) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas 2d unavailable");
    this.ctx = ctx;
    this.events = events;
    this.pal = readPalette();
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.resize();
    this.raf = requestAnimationFrame(this.frame);
  }

  refreshPalette() {
    this.pal = readPalette();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = Math.max(320, Math.round(rect.width));
    this.height = Math.max(400, Math.round(rect.height));
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const widthChanged = !this.world || Math.abs(this.width - this.world.width) > 24;
    if (widthChanged) {
      this.build();
    }
  }

  private build() {
    const wasCheckpoint = this.world ? this.checkpoint : 0;
    this.world = buildWorld(this.width, ERAS, FINALE);
    this.fired.clear();
    this.checkpoint = Math.min(wasCheckpoint, this.world.eras.length - 1);
    this.respawn(false);
  }

  start() {
    const seed = this.autopilot ? 20260101 : Math.floor(Math.random() * 1e9);
    this.world = buildWorld(this.width, ERAS, FINALE, seed);
    this.checkpoint = 0;
    this.falls = 0;
    this.time = 0;
    this.acc = 0;
    this.fired.clear();
    this.particles = [];
    this.respawn(false);
    this.running = true;
    this.last = 0;
    this.emitHud(true);
  }

  setInput(dir: number) {
    this.input = Math.sign(dir);
  }

  setAutopilot(on: boolean) {
    this.autopilot = on;
  }

  private aim(): number {
    const p = this.player;
    let best: Platform | null = null;
    let bestDy = 250;
    for (const plat of this.world.platforms) {
      if (!plat.alive) continue;
      const dy = p.y - plat.y;
      if (dy < 8 || dy > bestDy) continue;
      if (plat.finale && dy > 150) continue;
      best = plat;
      bestDy = dy;
    }
    if (!best) return 0;
    let dx = best.x - p.x;
    const w = this.width;
    if (dx > w / 2) dx -= w;
    if (dx < -w / 2) dx += w;
    return Math.abs(dx) < 6 ? 0 : Math.sign(dx);
  }

  pause() {
    this.running = false;
  }

  resume() {
    if (!this.world) this.start();
    else this.running = true;
    this.last = 0;
  }

  setBest(best: number) {
    this.best = Math.max(0, best);
  }

  private respawn(countFall: boolean) {
    const mark = this.world.eras[this.checkpoint] ?? this.world.eras[0];
    if (countFall) this.falls++;
    this.player = {
      x: mark.checkpointX,
      y: mark.checkpointY - 46,
      vx: 0,
      vy: JUMP_V * 0.9,
      r: RADIUS,
    };
    this.camY = mark.checkpointY - this.height * 0.72 + 46;
    this.acc = 0;
    this.emitHud(true);
  }

  private eraIndexFor(y: number) {
    const marks = this.world.eras;
    for (let i = marks.length - 1; i >= 0; i--) {
      if (y <= marks[i].topY + 80) return i;
    }
    return 0;
  }

  private emitHud(force = false) {
    if (!this.world) return;
    const idx = this.eraIndexFor(this.player.y);
    const mark = this.world.eras[idx];
    this.events.hud({
      year: mark.id,
      era: mark.label,
      progress: Math.max(0, Math.min(1, -this.player.y / -this.world.finaleY)),
      best: this.best,
      altitude: Math.max(0, -this.player.y),
      marks: this.world.eras.map((m) => -m.topY / -this.world.finaleY),
    });
  }

  private frame = (ts: number) => {
    if (!this.last) this.last = ts;
    const dt = Math.min(0.05, (ts - this.last) / 1000);
    this.last = ts;
    if (this.running) {
      this.acc += dt;
      let guard = 0;
      while (this.acc >= STEP && guard++ < 5) {
        this.update(STEP);
        this.acc -= STEP;
      }
    }
    this.anim += dt;
    this.shake *= Math.pow(0.05, dt);
    this.render();
    this.raf = requestAnimationFrame(this.frame);
  };

  private update(dt: number) {
    this.time += dt;
    const w = this.world;
    const p = this.player;

    for (const plat of w.platforms) {
      if (plat.type === "moving" && plat.alive) {
        plat.x = (plat.baseX ?? plat.x) + Math.sin(this.time * (plat.speed ?? 1) + (plat.phase ?? 0)) * (plat.range ?? 0);
      }
      if (!plat.alive && plat.respawnAt !== undefined && this.time > plat.respawnAt) {
        plat.alive = true;
      }
    }

    const prevBottom = p.y + p.r;
    if (this.autopilot) this.input = this.aim();
    stepBody(p, this.input, dt, this.width);

    if (p.vy > 0) {
      let landed: Platform | null = null;
      for (const plat of w.platforms) {
        if (!plat.alive) continue;
        if (Math.abs(plat.y - (p.y + p.r)) > p.r + 16) continue;
        if (landsOn(p, plat, prevBottom)) {
          if (!landed || plat.y < landed.y) landed = plat;
        }
      }
      if (landed) {
        p.y = landed.y - p.r;
        p.vy = landed.spring ? SPRING_V : JUMP_V;
        if (landed.type === "fragile") {
          landed.alive = false;
          landed.respawnAt = this.time + 4;
        }
        this.shake = landed.spring ? 5 : 2;
        play(landed.spring ? "spring" : "bounce");
        this.spawnTrail(p, landed.spring ? 10 : 5);

        if (landed.card && !this.fired.has(landed.id)) {
          this.fired.add(landed.id);
          this.events.card(landed.card);
          play("card");
        }
        if (landed.era) {
          const idx = w.eras.findIndex((m) => m.id === landed.era);
          if (idx > this.checkpoint) {
            this.checkpoint = idx;
            this.events.era(idx, landed.era);
          }
        }
        if (landed.finale) {
          this.running = false;
          this.events.finale({ best: Math.round(this.best), falls: this.falls, time: this.time });
          return;
        }
      }
    }

    const targetCam = p.y - this.height * 0.55;
    if (targetCam < this.camY) this.camY = targetCam;
    const camCeiling = w.topY - this.height * 0.14;
    if (this.camY < camCeiling) this.camY = camCeiling;

    const altitude = Math.max(0, -p.y);
    if (altitude > this.best) this.best = altitude;

    for (const pk of w.pickups) {
      if (pk.taken) continue;
      const dx = p.x - pk.x;
      const dy = p.y - pk.y;
      if (dx * dx + dy * dy < 30 * 30) {
        pk.taken = true;
        this.events.pickup(pk);
        play("pickup");
        this.burst(pk.x, pk.y, 8);
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life -= dt;
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vy += 380 * dt;
    }

    if (p.y - this.camY > this.height + 150) {
      play("fall");
      this.shake = 9;
      this.events.fall();
      this.particles = [];
      this.respawn(true);
    }

    this.hudAcc += dt;
    if (this.hudAcc > 0.18) {
      this.hudAcc = 0;
      this.emitHud();
    }
  }

  private spawnTrail(p: Body, n: number) {
    for (let i = 0; i < n; i++) {
      this.particles.push({
        x: p.x + (Math.random() * 2 - 1) * 12,
        y: p.y + p.r,
        vx: (Math.random() * 2 - 1) * 60,
        vy: Math.random() * 90,
        life: 0.45,
        max: 0.45,
        size: 2.6,
        color: this.pal.green,
      });
    }
  }

  private burst(x: number, y: number, n: number) {
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * 120,
        vy: Math.sin(a) * 120,
        life: 0.5,
        max: 0.5,
        size: 2.4,
        color: this.pal.green,
      });
    }
  }

  private render() {
    if (!this.world) return;
    draw(
      this.ctx,
      this.width,
      this.height,
      this.camY,
      this.world,
      this.player,
      this.particles,
      this.anim,
      this.pal,
      this.reduced,
      this.shake,
    );
  }

  get stats(): Stats {
    return { best: Math.round(this.best), falls: this.falls, time: this.time };
  }

  get isRunning() {
    return this.running;
  }

  debugTick(n = 1) {
    for (let i = 0; i < n; i++) {
      if (!this.running) break;
      this.update(STEP);
    }
    this.render();
  }

  snapshot() {
    return {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y),
      vy: Math.round(this.player.vy),
      input: this.input,
      cp: this.checkpoint,
      running: this.running,
      ap: this.autopilot,
    };
  }

  destroy() {
    cancelAnimationFrame(this.raf);
  }
}
