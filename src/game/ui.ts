import { UI as STR, ERAS, tx, type Card, type Lang } from "../data/timeline";
import { EMAIL, LINKS, HANDLE } from "../data/site";
import type { HudState, Stats } from "./engine";

export type LogItem = { id: string; label: string; href?: string };

export type Hooks = {
  start: () => void;
  pause: () => void;
  resume: () => void;
  restart: () => void;
  again: () => void;
  sound: (on: boolean) => void;
  theme: (t: "light" | "dark") => void;
  lang: (l: Lang) => void;
  install: () => void;
};

const $ = <T extends HTMLElement>(sel: string) => document.querySelector(sel) as T | null;

export class UI {
  lang: Lang;
  sound: boolean;
  private hooks: Hooks;
  private startScreen = $<HTMLElement>("#screen-start");
  private pauseScreen = $<HTMLElement>("#screen-pause");
  private finaleScreen = $<HTMLElement>("#screen-finale");
  private cards = $<HTMLElement>("#cards");
  private toastEl = $<HTMLElement>("#toast");
  private hudYear = $<HTMLElement>("#hud-year");
  private hudEra = $<HTMLElement>("#hud-era");
  private hudBest = $<HTMLElement>("#hud-best");
  private railFill = $<HTMLElement>("#rail-fill");
  private railTicks = $<HTMLElement>("#rail-ticks");
  private pauseStats = $<HTMLElement>("#pause-stats");
  private pauseLog = $<HTMLElement>("#pause-log");
  private finaleStats = $<HTMLElement>("#finale-stats");
  private finaleLog = $<HTMLElement>("#finale-log");
  private startBest = $<HTMLElement>("#start-best");
  private toastTimer = 0;
  private cardTimers: number[] = [];
  private installBtns: HTMLElement[] = [];

  constructor(hooks: Hooks, opts: { lang: Lang; sound: boolean; best: number }) {
    this.hooks = hooks;
    this.lang = opts.lang;
    this.sound = opts.sound;
    this.bind();
    this.applyLang(opts.lang);
    this.setSound(opts.sound);
    this.setBest(opts.best);
    this.fillStaticLinks();
    this.installBtns = Array.from(document.querySelectorAll<HTMLElement>(".js-install"));
  }

  private bind() {
    $("#btn-start")?.addEventListener("click", () => this.hooks.start());
    $("#btn-pause")?.addEventListener("click", () => this.hooks.pause());
    $("#btn-resume")?.addEventListener("click", () => this.hooks.resume());
    $("#btn-restart")?.addEventListener("click", () => this.hooks.restart());
    $("#btn-again")?.addEventListener("click", () => this.hooks.again());

    document.querySelectorAll<HTMLElement>(".js-lang").forEach((b) =>
      b.addEventListener("click", () => this.hooks.lang(this.lang === "zh" ? "en" : "zh")),
    );
    document.querySelectorAll<HTMLElement>(".js-sound").forEach((b) =>
      b.addEventListener("click", () => this.hooks.sound(!this.sound)),
    );
    document.querySelectorAll<HTMLElement>(".js-install").forEach((b) =>
      b.addEventListener("click", () => this.hooks.install()),
    );
    document.querySelectorAll<HTMLElement>(".js-theme").forEach((b) =>
      b.addEventListener("click", () => {
        const cur = document.documentElement.getAttribute("data-theme");
        this.hooks.theme(cur === "dark" ? "light" : "dark");
      }),
    );

    this.cards?.addEventListener("click", (e) => {
      const t = e.target as HTMLElement;
      if (t.closest(".js-copy")) {
        this.copy(HANDLE, t.closest(".js-copy") as HTMLElement);
      }
    });
    this.finaleScreen?.addEventListener("click", (e) => {
      const t = e.target as HTMLElement;
      if (t.closest(".js-copy")) {
        this.copy(HANDLE, t.closest(".js-copy") as HTMLElement);
      }
    });
  }

  private fillStaticLinks() {
    document.querySelectorAll<HTMLAnchorElement>(".js-email").forEach((a) => (a.href = `mailto:${EMAIL}`));
    document.querySelectorAll<HTMLAnchorElement>(".js-vcf").forEach((a) => {
      a.href = LINKS.CONTACT;
      a.setAttribute("download", "Justin_Chua.vcf");
    });
    document.querySelectorAll<HTMLAnchorElement>(".js-gatekeep").forEach((a) => (a.href = LINKS.GATEKEEP));
    document.querySelectorAll<HTMLAnchorElement>(".js-attiteud").forEach((a) => (a.href = LINKS.ATTITEUD));
    document.querySelectorAll<HTMLAnchorElement>(".js-linkedin").forEach((a) => (a.href = LINKS.LINKEDIN));
    document.querySelectorAll<HTMLAnchorElement>(".js-github").forEach((a) => (a.href = LINKS.GITHUB));
    document.querySelectorAll<HTMLAnchorElement>(".js-whatsapp").forEach((a) => (a.href = LINKS.WHATSAPP));
    document.querySelectorAll<HTMLAnchorElement>(".js-studies").forEach((a) => (a.href = LINKS.STUDIES));
    document.querySelectorAll<HTMLAnchorElement>(".js-about").forEach((a) => (a.href = LINKS.ABOUT));
  }

  applyLang(lang: Lang) {
    this.lang = lang;
    document.documentElement.setAttribute("data-lang", lang);
    document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n") as keyof (typeof STR)["en"];
      const orig = el.getAttribute("data-i18n-orig");
      if (orig === null) el.setAttribute("data-i18n-orig", el.textContent ?? "");
      const dict = STR[lang] as Record<string, string>;
      const val = dict[key];
      if (val !== undefined) el.textContent = val;
      else el.textContent = el.getAttribute("data-i18n-orig");
    });
    document.querySelectorAll<HTMLElement>(".js-lang").forEach((b) => (b.textContent = STR[lang].langName));
    if (this.hudEra?.dataset) {
      const id = this.hudEra.getAttribute("data-era");
      const era = ERAS.find((e) => e.id === id);
      if (era) this.hudEra.textContent = tx(era.label, lang);
    }
    this.renderLogs();
  }

  setSound(on: boolean) {
    this.sound = on;
    const label =
      this.lang === "zh" ? (on ? "声音：开" : "声音：关") : on ? "sound: on" : "sound: off";
    document.querySelectorAll<HTMLElement>(".js-sound").forEach((b) => (b.textContent = label));
  }

  applyTheme(t: "light" | "dark") {
    document.documentElement.setAttribute("data-theme", t);
    document.querySelectorAll<HTMLElement>(".js-theme").forEach((b) => {
      b.textContent = t === "dark" ? "light" : "dark";
    });
  }

  setBest(bestPx: number) {
    if (this.startBest) this.startBest.textContent = `${Math.round(bestPx / 10)}m`;
  }

  hud(h: HudState) {
    if (this.hudYear) this.hudYear.textContent = h.year;
    if (this.hudEra) {
      this.hudEra.setAttribute("data-era", h.year === "NOW" ? "2026" : h.year);
      this.hudEra.textContent = tx(h.era, this.lang);
    }
    if (this.hudBest) this.hudBest.textContent = `${Math.round(h.best / 10)}m`;
    if (this.railFill) this.railFill.style.height = `${(h.progress * 100).toFixed(1)}%`;
  }

  buildRail(marks: number[]) {
    if (!this.railTicks) return;
    this.railTicks.innerHTML = "";
    marks.forEach((p, i) => {
      const tick = document.createElement("span");
      tick.className = "rail-tick";
      tick.style.bottom = `${(p * 100).toFixed(1)}%`;
      tick.title = ERAS[i]?.id ?? "";
      this.railTicks.appendChild(tick);
    });
  }

  showStart() {
    this.startScreen?.classList.remove("hidden");
  }

  hideStart() {
    this.startScreen?.classList.add("hidden");
  }

  showPause(stats: Stats, log: LogItem[]) {
    this.pauseScreen?.classList.remove("hidden");
    this.renderStats(this.pauseStats, stats);
    this.log = log;
    this.renderLogs();
    $("#btn-resume")?.focus();
  }

  hidePause() {
    this.pauseScreen?.classList.add("hidden");
  }

  showFinale(stats: Stats, log: LogItem[]) {
    this.hidePause();
    this.finaleScreen?.classList.remove("hidden");
    this.renderStats(this.finaleStats, stats);
    this.log = log;
    this.renderLogs();
    $("#btn-again")?.focus();
  }

  hideFinale() {
    this.finaleScreen?.classList.add("hidden");
  }

  private log: LogItem[] = [];

  setLog(log: LogItem[]) {
    this.log = log;
    this.renderLogs();
  }

  private renderLogs() {
    const targets = [this.pauseLog, this.finaleLog].filter(Boolean) as HTMLElement[];
    for (const el of targets) {
      el.innerHTML = "";
      if (!this.log.length) {
        const p = document.createElement("p");
        p.className = "log-empty";
        p.textContent = STR[this.lang].logEmpty;
        el.appendChild(p);
        continue;
      }
      const ul = document.createElement("ul");
      for (const item of this.log) {
        const li = document.createElement("li");
        if (item.href) {
          const a = document.createElement("a");
          a.href = item.href;
          a.textContent = item.label;
          a.target = "_blank";
          a.rel = "noopener";
          li.appendChild(a);
        } else {
          li.textContent = item.label;
        }
        ul.appendChild(li);
      }
      el.appendChild(ul);
    }
  }

  private renderStats(el: HTMLElement | null, s: Stats) {
    if (!el) return;
    const m = Math.round(s.best / 10);
    const mm = Math.floor(s.time / 60);
    const ss = Math.floor(s.time % 60)
      .toString()
      .padStart(2, "0");
    const u = STR[this.lang];
    el.textContent = `${u.best} ${m}m · ${u.falls} ${s.falls} · ${mm}:${ss}`;
  }

  card(c: Card) {
    if (!this.cards) return;
    while (this.cards.children.length >= 2) this.cards.firstElementChild?.remove();
    const el = document.createElement("article");
    el.className = "card";
    const year = document.createElement("p");
    year.className = "card-year";
    year.textContent = c.year;
    el.appendChild(year);
    const title = document.createElement("h3");
    title.textContent = tx(c.title, this.lang);
    el.appendChild(title);
    const text = document.createElement("p");
    text.textContent = tx(c.text, this.lang);
    el.appendChild(text);
    if (c.code) {
      const btn = document.createElement("button");
      btn.className = "js-copy code";
      btn.textContent = c.code;
      el.appendChild(btn);
    }
    if (c.href) {
      const a = document.createElement("a");
      a.href = c.href;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = "↗";
      a.className = "card-link";
      el.appendChild(a);
    }
    this.cards.appendChild(el);
    requestAnimationFrame(() => el.classList.add("in"));
    const timer = window.setTimeout(() => {
      el.classList.remove("in");
      window.setTimeout(() => el.remove(), 300);
    }, 7000);
    this.cardTimers.push(timer);
  }

  clearCards() {
    this.cardTimers.forEach((t) => clearTimeout(t));
    this.cardTimers = [];
    if (this.cards) this.cards.innerHTML = "";
  }

  toast(text: string) {
    if (!this.toastEl) return;
    this.toastEl.textContent = text;
    this.toastEl.classList.add("show");
    clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => this.toastEl?.classList.remove("show"), 1800);
  }

  private copy(text: string, btn: HTMLElement) {
    const done = () => {
      const old = btn.textContent;
      btn.textContent = STR[this.lang].copied;
      setTimeout(() => (btn.textContent = old), 1400);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => {});
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      done();
    }
  }

  canInstall(can: boolean) {
    this.installBtns.forEach((b) => (b.hidden = !can));
  }
}
