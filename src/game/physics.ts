export const GRAVITY = 2200;
export const JUMP_V = -930;
export const SPRING_V = -1480;
export const MAX_VX = 390;
export const ACCEL = 3200;
export const FRICTION = 2800;
export const RADIUS = 15;
export const STEP = 1 / 60;

export const jumpHeight = (v = JUMP_V, g = GRAVITY) => (v * v) / (2 * g);

export type Body = { x: number; y: number; vx: number; vy: number; r: number };

export function stepBody(b: Body, input: number, dt: number, width: number) {
  if (input !== 0) {
    b.vx += input * ACCEL * dt;
  } else {
    const drag = FRICTION * dt;
    if (Math.abs(b.vx) <= drag) b.vx = 0;
    else b.vx -= Math.sign(b.vx) * drag;
  }
  b.vx = Math.max(-MAX_VX, Math.min(MAX_VX, b.vx));
  b.vy += GRAVITY * dt;
  b.x += b.vx * dt;
  b.y += b.vy * dt;
  if (b.x < -b.r) b.x = width + b.r;
  else if (b.x > width + b.r) b.x = -b.r;
}

export function bounce(b: Body, v = JUMP_V) {
  b.vy = v;
}

export type Rect = { x: number; y: number; w: number; h: number };

export function landsOn(b: Body, p: Rect, prevBottom: number) {
  if (b.vy <= 0) return false;
  const halfW = b.r * 0.86;
  if (b.x + halfW < p.x - p.w / 2 || b.x - halfW > p.x + p.w / 2) return false;
  const bottom = b.y + b.r;
  return prevBottom <= p.y + 1 && bottom >= p.y;
}

export function reaches(a: { x: number; y: number }, b: { x: number; y: number }, maxJump = jumpHeight()) {
  const dy = a.y - b.y;
  if (dy <= 0 || dy > maxJump * 0.96) return false;
  const g = GRAVITY;
  const disc = JUMP_V * JUMP_V - 2 * g * dy;
  if (disc < 0) return false;
  const t = (-JUMP_V + Math.sqrt(disc)) / g;
  return Math.abs(a.x - b.x) <= MAX_VX * t + 24;
}
