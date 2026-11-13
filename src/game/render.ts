import type { World } from "./world";
import type { Body } from "./physics";

export type Palette = {
  bg: string;
  ink: string;
  muted: string;
  green: string;
  hairlineSoft: string;
  surface: string;
};

export function readPalette(): Palette {
  const s = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => s.getPropertyValue(name).trim() || fallback;
  return {
    bg: v("--bg", "#F7F4EC"),
    ink: v("--ink", "#14140F"),
    muted: v("--muted", "#6B6759"),
    green: v("--green", "#1C5C3A"),
    hairlineSoft: v("--hairline-soft", "rgba(20,20,15,0.08)"),
    surface: v("--surface", "#FFFFFF"),
  };
}

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
};

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

function jitter(seed: number, amp = 1) {
  return Math.sin(seed * 12.9898) * amp;
}

function doodle(ctx: CanvasRenderingContext2D, x1: number, x2: number, y: number, seed: number) {
  const mid = (x1 + x2) / 2;
  ctx.beginPath();
  ctx.moveTo(x1, y + jitter(seed, 0.7));
  ctx.quadraticCurveTo(mid, y + jitter(seed + 1, 1.6), x2, y + jitter(seed + 2, 0.7));
  ctx.stroke();
}

function asterisk(ctx: CanvasRenderingContext2D, size: number) {
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.47, size * 0.19, size * 0.36, (i * Math.PI) / 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

export function draw(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  camY: number,
  world: World,
  player: Body,
  particles: Particle[],
  time: number,
  pal: Palette,
  reduced: boolean,
  shake: number,
) {
  ctx.save();
  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, w, h);

  if (shake > 0 && !reduced) {
    ctx.translate(Math.sin(time * 70) * shake, Math.cos(time * 63) * shake * 0.6);
  }

  /* paper grid */
  ctx.strokeStyle = pal.hairlineSoft;
  ctx.lineWidth = 1;
  const grid = 64;
  const off = ((-camY % grid) + grid) % grid;
  ctx.beginPath();
  for (let y = off; y < h; y += grid) {
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
  }
  for (let x = grid / 2; x < w; x += grid) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
  }
  ctx.stroke();

  /* era bands */
  for (const era of world.eras) {
    const sy = era.topY - camY;
    if (sy > -240 && sy < h + 240) {
      ctx.save();
      ctx.globalAlpha = 0.055;
      ctx.fillStyle = pal.ink;
      ctx.font = `700 96px ${MONO}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(era.id, w / 2, sy + 300);
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = pal.hairlineSoft;
      ctx.setLineDash([2, 7]);
      ctx.beginPath();
      ctx.moveTo(0, sy + 0.5);
      ctx.lineTo(w, sy + 0.5);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = pal.muted;
      ctx.globalAlpha = 0.7;
      ctx.font = `600 10px ${MONO}`;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(`${era.id} · ${era.label.en.toUpperCase()}`, 18, sy - 8);
      ctx.restore();
    }
  }

  /* pickups */
  for (const pk of world.pickups) {
    if (pk.taken) continue;
    const sy = pk.y - camY + Math.sin(time * 2 + pk.x) * 3;
    if (sy < -40 || sy > h + 40) continue;
    ctx.save();
    ctx.translate(pk.x, sy);
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = pk.kind === "study" ? pal.green : pal.ink;
    ctx.fillStyle = pal.bg;
    if (pk.kind === "cert") {
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-8, -8, 16, 16);
      ctx.strokeRect(-8, -8, 16, 16);
      ctx.rotate(-Math.PI / 4);
      ctx.fillStyle = pal.green;
      ctx.beginPath();
      ctx.arc(0, 0, 2.4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.rotate(-0.08);
      ctx.fillRect(-7, -9, 14, 18);
      ctx.strokeRect(-7, -9, 14, 18);
      ctx.beginPath();
      ctx.moveTo(-4, -3);
      ctx.lineTo(4, -3);
      ctx.moveTo(-4, 1);
      ctx.lineTo(4, 1);
      ctx.moveTo(-4, 5);
      ctx.lineTo(1, 5);
      ctx.stroke();
    }
    ctx.restore();
  }

  /* platforms */
  for (const p of world.platforms) {
    if (!p.alive) continue;
    const sy = p.y - camY;
    if (sy < -30 || sy > h + 30) continue;
    const x1 = p.x - p.w / 2;
    const x2 = p.x + p.w / 2;
    ctx.lineCap = "round";

    if (p.card) {
      ctx.strokeStyle = pal.green;
      ctx.lineWidth = p.finale ? 3 : 2.4;
    } else {
      ctx.strokeStyle = pal.ink;
      ctx.lineWidth = 1.7;
    }

    if (p.type === "fragile") {
      ctx.setLineDash([5, 6]);
      ctx.globalAlpha = 0.85;
    }

    doodle(ctx, x1, x2, sy, p.id);
    doodle(ctx, x1 + 3, x2 - 3, sy + 3.4, p.id + 0.5);
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    if (p.type === "moving") {
      ctx.strokeStyle = pal.muted;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x1, sy + 7);
      ctx.lineTo(x1 + 4, sy + 7);
      ctx.moveTo(x2 - 4, sy + 7);
      ctx.lineTo(x2, sy + 7);
      ctx.stroke();
    }

    if (p.spring) {
      ctx.strokeStyle = pal.green;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(p.x - 7, sy);
      const seg = 4;
      for (let i = 0; i < 4; i++) {
        ctx.lineTo(p.x + (i % 2 === 0 ? 7 : -7), sy - seg * (i + 1));
      }
      ctx.stroke();
    }

    if (p.card && !p.finale) {
      ctx.fillStyle = pal.green;
      ctx.font = `600 10px ${MONO}`;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(p.card.year, x1, sy - 12);
      ctx.beginPath();
      ctx.arc(x1 + ctx.measureText(p.card.year).width + 8, sy - 15.5, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    if (p.finale) {
      ctx.save();
      ctx.fillStyle = pal.green;
      ctx.font = `700 13px ${MONO}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText("NOW", p.x, sy - 22);
      ctx.strokeStyle = pal.green;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(p.x + p.w / 2 + 14, sy);
      ctx.lineTo(p.x + p.w / 2 + 14, sy - 44);
      ctx.lineTo(p.x + p.w / 2 + 40, sy - 36);
      ctx.lineTo(p.x + p.w / 2 + 14, sy - 28);
      ctx.stroke();
      ctx.restore();
    }
  }

  /* trail */
  for (const pt of particles) {
    const a = Math.max(0, pt.life / pt.max);
    ctx.globalAlpha = a * 0.6;
    ctx.fillStyle = pt.color;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y - camY, pt.size * a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  /* player */
  const px = player.x;
  const py = player.y - camY;
  const lean = Math.max(-0.35, Math.min(0.35, player.vx / 1400));
  const drawPlayer = (x: number) => {
    ctx.save();
    ctx.translate(x, py);
    ctx.rotate(lean);
    ctx.fillStyle = pal.green;
    ctx.strokeStyle = pal.ink;
    ctx.lineWidth = 1;
    asterisk(ctx, 30);
    ctx.restore();
  };
  drawPlayer(px);
  if (px < 40) drawPlayer(px + w);
  if (px > w - 40) drawPlayer(px - w);

  ctx.restore();
}
