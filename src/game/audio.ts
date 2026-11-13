let ctx: AudioContext | null = null;
let enabled = false;

function ensure() {
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setSound(on: boolean) {
  enabled = on;
  if (on) ensure();
}

export function soundOn() {
  return enabled;
}

type Kind = "bounce" | "spring" | "card" | "pickup" | "fall";

export function play(kind: Kind) {
  if (!enabled) return;
  const ac = ensure();
  if (!ac) return;
  const now = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);

  const env = (peak: number, dur: number) => {
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  };

  if (kind === "bounce") {
    osc.type = "triangle";
    osc.frequency.setValueAtTime(210, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.06);
    env(0.05, 0.07);
  } else if (kind === "spring") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.16);
    env(0.08, 0.2);
  } else if (kind === "card") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.setValueAtTime(990, now + 0.07);
    env(0.06, 0.18);
  } else if (kind === "pickup") {
    osc.type = "triangle";
    osc.frequency.setValueAtTime(1180, now);
    osc.frequency.exponentialRampToValueAtTime(1560, now + 0.08);
    env(0.045, 0.12);
  } else {
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.22);
    env(0.05, 0.26);
  }

  osc.start(now);
  osc.stop(now + 0.3);
}
