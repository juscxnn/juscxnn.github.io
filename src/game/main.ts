import { Engine } from "./engine";
import { UI, type LogItem } from "./ui";
import { load, save, markSeen, unlock } from "./storage";
import { setSound, play } from "./audio";
import { ERAS, tx, type Lang } from "../data/timeline";

const canvas = document.getElementById("world") as HTMLCanvasElement | null;
if (!canvas) throw new Error("game canvas missing");

const state = load();
try {
  const lang = localStorage.getItem("lang");
  if (lang === "zh" || lang === "en") state.lang = lang;
} catch {
  /* ignore */
}

let installEvent: Event & { prompt?: () => Promise<void> } | null = null;
let railBuilt = false;
let resizeRaf = 0;

const ui = new UI(
  {
    start: () => {
      ui.hideStart();
      ui.clearCards();
      setSound(state.sound);
      engine.start();
    },
    pause: () => pause(),
    resume: () => {
      ui.hidePause();
      engine.resume();
    },
    restart: () => {
      ui.hidePause();
      ui.hideFinale();
      ui.clearCards();
      engine.start();
    },
    again: () => {
      ui.hideFinale();
      ui.clearCards();
      engine.start();
    },
    sound: (on) => {
      state.sound = on;
      save(state);
      setSound(on);
      ui.setSound(on);
      if (on) play("pickup");
    },
    theme: (t) => {
      document.documentElement.setAttribute("data-theme", t);
      state.theme = t;
      save(state);
      try {
        localStorage.setItem("theme", t);
      } catch {
        /* ignore */
      }
      engine.refreshPalette();
      ui.applyTheme(t);
    },
    lang: (l) => {
      state.lang = l;
      save(state);
      try {
        localStorage.setItem("lang", l);
      } catch {
        /* ignore */
      }
      ui.applyLang(l);
      ui.setSound(state.sound);
      ui.setLog(buildLog());
    },
    install: () => {
      void installEvent?.prompt?.();
    },
  },
  { lang: state.lang, sound: state.sound, best: state.best },
);

function buildLog(): LogItem[] {
  const items: LogItem[] = [];
  for (const era of ERAS) {
    for (const c of era.cards) {
      if (state.seen.includes(c.id)) {
        items.push({ id: c.id, label: `${c.year} · ${tx(c.title, state.lang)}` });
      }
    }
  }
  for (const u of state.unlocked) items.push({ id: u.id, label: u.label, href: u.href });
  return items;
}

const engine = new Engine(canvas, {
  card: (c) => {
    if (markSeen(state, c.id)) save(state);
    ui.card(c);
  },
  era: () => {},
  pickup: (pk) => {
    const label = state.lang === "zh" && pk.zh ? pk.zh : pk.label;
    if (unlock(state, { id: pk.id, label, href: pk.href })) {
      save(state);
      ui.toast(`${state.lang === "zh" ? "已收集" : "collected"} · ${label}`);
    }
  },
  finale: (stats) => {
    state.best = Math.max(state.best, stats.best);
    save(state);
    ui.setBest(state.best);
    ui.showFinale(stats, buildLog());
  },
  fall: () => {},
  hud: (h) => {
    if (!railBuilt) {
      ui.buildRail(h.marks);
      railBuilt = true;
    }
    ui.hud(h);
    if (h.altitude > state.best) {
      state.best = Math.round(h.altitude);
      ui.setBest(state.best);
    }
  },
});

engine.setBest(state.best);
if (new URLSearchParams(location.search).has("auto")) {
  engine.setAutopilot(true);
  (window as unknown as { __snap: () => unknown }).__snap = () => engine.snapshot();
  (window as unknown as { __tick: (n: number) => void }).__tick = (n: number) => engine.debugTick(n);
}
const themeNow = document.documentElement.getAttribute("data-theme");
ui.applyTheme(themeNow === "dark" ? "dark" : "light");
ui.showStart();

function pause() {
  if (!engine.isRunning) return;
  engine.pause();
  save(state);
  ui.showPause(engine.stats, buildLog());
}

function togglePause() {
  if (engine.isRunning) pause();
  else {
    const paused = !document.getElementById("screen-pause")?.classList.contains("hidden");
    if (paused) {
      ui.hidePause();
      engine.resume();
    }
  }
}

/* keyboard */
const keys = new Set<string>();
const isTyping = () => {
  const el = document.activeElement;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "BUTTON");
};
function syncInput() {
  const left = keys.has("ArrowLeft") || keys.has("KeyA");
  const right = keys.has("ArrowRight") || keys.has("KeyD");
  engine.setInput(left === right ? 0 : left ? -1 : 1);
}
window.addEventListener("keydown", (e) => {
  if (["ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
  keys.add(e.code);
  syncInput();
  if (e.code === "KeyP" || e.code === "Escape") {
    togglePause();
    return;
  }
  if (e.code === "KeyM") {
    state.sound = !state.sound;
    setSound(state.sound);
    ui.setSound(state.sound);
    save(state);
    return;
  }
  if ((e.code === "Space" || e.code === "Enter") && !isTyping()) {
    const startHidden = !document.getElementById("screen-start")?.classList.contains("hidden");
    const pauseHidden = !document.getElementById("screen-pause")?.classList.contains("hidden");
    const finaleHidden = !document.getElementById("screen-finale")?.classList.contains("hidden");
    if (startHidden) {
      ui.hideStart();
      ui.clearCards();
      setSound(state.sound);
      engine.start();
    } else if (pauseHidden) {
      ui.hidePause();
      engine.resume();
    } else if (finaleHidden) {
      ui.hideFinale();
      ui.clearCards();
      engine.start();
    } else if (e.code === "Space") {
      pause();
    }
  }
});
window.addEventListener("keyup", (e) => {
  keys.delete(e.code);
  syncInput();
});

/* pointer */
function pointerDir(e: PointerEvent) {
  const r = canvas.getBoundingClientRect();
  engine.setInput(e.clientX < r.left + r.width / 2 ? -1 : 1);
}
canvas.addEventListener("pointerdown", (e) => {
  canvas.setPointerCapture?.(e.pointerId);
  pointerDir(e);
});
canvas.addEventListener("pointermove", (e) => {
  if (e.buttons > 0) pointerDir(e);
});
canvas.addEventListener("pointerup", () => engine.setInput(0));
canvas.addEventListener("pointercancel", () => engine.setInput(0));
canvas.addEventListener("contextmenu", (e) => e.preventDefault());

/* resize + visibility */
window.addEventListener("resize", () => {
  cancelAnimationFrame(resizeRaf);
  resizeRaf = requestAnimationFrame(() => {
    engine.resize();
    railBuilt = false;
  });
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) pause();
});
window.addEventListener("pagehide", () => save(state));

/* install prompt */
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  installEvent = e as Event & { prompt?: () => Promise<void> };
  ui.canInstall(true);
});
window.addEventListener("appinstalled", () => {
  installEvent = null;
  ui.canInstall(false);
});

/* service worker */
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
