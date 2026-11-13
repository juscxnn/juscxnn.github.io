import { studies } from "./studies";
import { LINKS } from "./site";

export type Lang = "en" | "zh";
export type Text = { en: string; zh: string };

export const tx = (t: Text, lang: Lang): string => (lang === "zh" ? t.zh : t.en);

export type CardKind = "era" | "event" | "finale";

export type Card = {
  id: string;
  kind: CardKind;
  year: string;
  title: Text;
  text: Text;
  href?: string;
  code?: string;
};

export type Pickup = {
  id: string;
  kind: "study" | "cert";
  label: string;
  zh?: string;
  href?: string;
};

export type Era = {
  id: string;
  label: Text;
  cards: Card[];
  pickups: Pickup[];
};

const recent = [...studies]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 3);

export const ERAS: Era[] = [
  {
    id: "2014",
    label: { en: "Police SOC", zh: "警察特勤" },
    cards: [
      {
        id: "e2014",
        kind: "era",
        year: "2014",
        title: { en: "Police SOC", zh: "警察特勤" },
        text: {
          en: "Singapore Police Force. Security operations.",
          zh: "新加坡警察部队。安全运营。",
        },
      },
    ],
    pickups: [{ id: "c-ai4i", kind: "cert", label: "AI4I" }],
  },
  {
    id: "2017",
    label: { en: "Robotics sales", zh: "机器人销售" },
    cards: [
      {
        id: "e2017",
        kind: "era",
        year: "2017",
        title: { en: "Robotics sales", zh: "机器人销售" },
        text: {
          en: "Sold robotics. Distribution beats demos.",
          zh: "卖机器人。分发比演示更重要。",
        },
      },
    ],
    pickups: [{ id: "c-crewai", kind: "cert", label: "CrewAI" }],
  },
  {
    id: "2020",
    label: { en: "Maritime", zh: "海事" },
    cards: [
      {
        id: "e2020",
        kind: "era",
        year: "2020",
        title: { en: "Maritime", zh: "海事" },
        text: {
          en: "elxa. Digitised 75% of Singapore's port agency market.",
          zh: "elxa。把新加坡 75% 的港口代理市场数字化。",
        },
        href: LINKS.ZAOBAO,
      },
    ],
    pickups: [
      { id: "c-ux", kind: "cert", label: "UX Design" },
      {
        id: `s-${recent[2].slug}`,
        kind: "study",
        label: recent[2].title,
        href: `/studies/${recent[2].slug}`,
      },
    ],
  },
  {
    id: "2022",
    label: { en: "CopyScouts", zh: "CopyScouts" },
    cards: [
      {
        id: "e2022",
        kind: "era",
        year: "2022",
        title: { en: "CopyScouts", zh: "CopyScouts" },
        text: {
          en: "Built it. Sold it. 14x.",
          zh: "自己做，自己卖。14 倍退出。",
        },
      },
    ],
    pickups: [{ id: "c-ibmi", kind: "cert", label: "IBMI" }],
  },
  {
    id: "2024",
    label: { en: "Podletter", zh: "Podletter" },
    cards: [
      {
        id: "e2024",
        kind: "era",
        year: "2024",
        title: { en: "Podletter", zh: "Podletter" },
        text: {
          en: "7x exit. AI Starter hit #2 on Product Hunt.",
          zh: "7 倍退出。AI Starter 登上 Product Hunt 第 2。",
        },
      },
    ],
    pickups: [
      { id: "c-cdms", kind: "cert", label: "CDMS" },
      {
        id: `s-${recent[1].slug}`,
        kind: "study",
        label: recent[1].title,
        href: `/studies/${recent[1].slug}`,
      },
    ],
  },
  {
    id: "2025",
    label: { en: "Clique", zh: "Clique" },
    cards: [
      {
        id: "e2025",
        kind: "era",
        year: "2025",
        title: { en: "Clique", zh: "Clique" },
        text: {
          en: "Sales lead + product. US$10bn+ in tokens distributed in two years.",
          zh: "销售主管 + 产品。两年分发 100 亿美元+ 代币。",
        },
      },
    ],
    pickups: [
      {
        id: `s-${recent[0].slug}`,
        kind: "study",
        label: recent[0].title,
        href: `/studies/${recent[0].slug}`,
      },
    ],
  },
  {
    id: "2026",
    label: { en: "Gatekeep · Attiteud", zh: "Gatekeep · Attiteud" },
    cards: [
      {
        id: "e2026-gatekeep",
        kind: "era",
        year: "2026",
        title: { en: "Gatekeep", zh: "Gatekeep" },
        text: {
          en: "AI-native operating system for venture. Pitch the bar, not the network.",
          zh: "面向风投的 AI 原生操作系统。对标真实投资人门槛，不靠人脉。",
        },
        href: LINKS.GATEKEEP,
        code: "JCXA",
      },
      {
        id: "e2026-attiteud",
        kind: "event",
        year: "2026",
        title: { en: "Attiteud", zh: "Attiteud" },
        text: {
          en: "Holding company. Owns and builds a portfolio of small tech bets.",
          zh: "控股公司。持有并打造小型科技投资组合。",
        },
        href: LINKS.ATTITEUD,
      },
    ],
    pickups: [],
  },
];

export const FINALE: Card = {
  id: "now",
  kind: "finale",
  year: "NOW",
  title: { en: "You made it", zh: "你登顶了" },
  text: {
    en: "Two exits. One holding company. Still shipping.",
    zh: "两次退出。一家控股公司。还在做东西。",
  },
};

export const UI = {
  en: {
    title: "The Climb",
    subtitle: "2014 → now. Auto-bounce. Steer. Every platform is something I did.",
    intro:
      "A Doodle Jump through the timeline. Fall and you restart the era, nothing worse.",
    start: "start climbing",
    howto: "← → or A / D · touch left / right",
    readFlat: "read the flat version",
    sound: "sound",
    language: "language",
    theme: "theme",
    best: "best",
    checkpoint: "checkpoint",
    climbLog: "climb log",
    logEmpty: "Land on stamped platforms to collect milestones.",
    finaleTitle: "You made it.",
    finaleSub: "Two exits. One holding company. Still shipping.",
    contact: "get in touch",
    writing: "writing",
    install: "install app",
    playAgain: "climb again",
    about: "about",
    allWriting: "all writing",
    saveContact: "save contact",
    copyCode: "copy code",
    copied: "copied",
    resume: "resume",
    restart: "restart",
    pause: "pause",
    paused: "paused",
    collected: "collected",
    newBest: "new best",
    era: "era",
    falls: "falls",
    startOver: "from the bottom",
    close: "close",
    langName: "繁中",
    nowGatekeep: "AI-native operating system for venture. Pitch the bar, not the network.",
    nowAttiteud: "Holding company. Owns and builds a portfolio of small tech bets.",
    nowClique: "Sales lead + product. Airdrops and distribution tooling.",
  },
  zh: {
    title: "攀爬",
    subtitle: "2014 → 现在。自动弹跳。左右移动。每块平台都是我做过的事。",
    intro: "一款穿越时间线的 Doodle Jump。掉下去只会重来这一段。",
    start: "开始攀爬",
    howto: "← → 或 A / D · 触屏点左右",
    readFlat: "阅读文字版",
    sound: "声音",
    language: "语言",
    theme: "主题",
    best: "最佳",
    checkpoint: "检查点",
    climbLog: "攀爬日志",
    logEmpty: "落在盖章的平台上收集里程碑。",
    finaleTitle: "你登顶了。",
    finaleSub: "两次退出。一家控股公司。还在做东西。",
    contact: "联系方式",
    writing: "写作",
    install: "安装应用",
    playAgain: "再爬一次",
    about: "关于",
    allWriting: "全部文章",
    saveContact: "保存名片",
    copyCode: "复制邀请码",
    copied: "已复制",
    resume: "继续",
    restart: "重新开始",
    pause: "暂停",
    paused: "已暂停",
    collected: "已收集",
    newBest: "新纪录",
    era: "年代",
    falls: "掉落",
    startOver: "从 2014 开始",
    close: "关闭",
    langName: "EN",
    nowGatekeep: "面向风投的 AI 原生操作系统。对标真实投资人门槛，不靠人脉。",
    nowAttiteud: "控股公司。持有并打造小型科技投资组合。",
    nowClique: "销售主管 + 产品。空投与分发工具。",
  },
} as const;

export type UIKey = keyof (typeof UI)["en"];
