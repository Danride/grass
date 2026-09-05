export type PatternId = "none" | "stripes" | "dots" | "checker" | "zigzag" | "rings" | "patches";

export interface SkinDef {
  id: string;
  name: string;
  desc: string;
  body: string;
  rim: string;
  blade: string;
  bladeRim: string;
  trail: string;
  ink: string;
  pattern: PatternId;
  cost: number;
}

/* Шкала от чёрного к белому + узорчатые скины за росу */
export const SKINS: SkinDef[] = [
  {
    id: "ugol", name: "Уголь", desc: "Чёрный, как чернозём",
    body: "#101114", rim: "#04050a", blade: "#eef1f4", bladeRim: "#8a929c", trail: "#3a3f47",
    ink: "#2e3238", pattern: "none", cost: 0,
  },
  {
    id: "grafit", name: "Графит", desc: "Острее простого карандаша",
    body: "#2b2f36", rim: "#12141a", blade: "#eef1f4", bladeRim: "#99a1ab", trail: "#5a606b",
    ink: "#454b54", pattern: "none", cost: 0,
  },
  {
    id: "stal", name: "Сталь", desc: "Закалённый характер",
    body: "#5d646e", rim: "#31353c", blade: "#f4f6f8", bladeRim: "#a7aeb8", trail: "#8b939e",
    ink: "#3d434b", pattern: "none", cost: 60,
  },
  {
    id: "tuman", name: "Туман", desc: "Растворяется над полем",
    body: "#9aa3ad", rim: "#666e78", blade: "#ffffff", bladeRim: "#b6bdc6", trail: "#c3cad2",
    ink: "#7c8590", pattern: "none", cost: 120,
  },
  {
    id: "serebro", name: "Серебро", desc: "Блестит на солнце",
    body: "#c9d1d9", rim: "#8f97a1", blade: "#ffffff", bladeRim: "#c0c7cf", trail: "#e2e8ee",
    ink: "#9aa3ad", pattern: "none", cost: 200,
  },
  {
    id: "sneg", name: "Снег", desc: "Белый. Почти святой",
    body: "#f4f7fa", rim: "#b2bac3", blade: "#22262c", bladeRim: "#545b64", trail: "#ffffff",
    ink: "#d4dae1", pattern: "none", cost: 300,
  },
  {
    id: "zebra", name: "Зебра", desc: "Полосы косят первыми",
    body: "#15161a", rim: "#04050a", blade: "#f4f7fa", bladeRim: "#8a929c", trail: "#3a3f47",
    ink: "#f4f7fa", pattern: "stripes", cost: 380,
  },
  {
    id: "dalmatin", name: "Далматин", desc: "Гавкает на сорняки",
    body: "#f4f7fa", rim: "#b2bac3", blade: "#22262c", bladeRim: "#545b64", trail: "#ffffff",
    ink: "#15161a", pattern: "dots", cost: 500,
  },
  {
    id: "shahmaty", name: "Шахматы", desc: "Мат и чебрец",
    body: "#e9edf1", rim: "#aab2bb", blade: "#15161a", bladeRim: "#545b64", trail: "#f4f7fa",
    ink: "#15161a", pattern: "checker", cost: 650,
  },
  {
    id: "molniya", name: "Молния", desc: "Зигзаг по пшенице",
    body: "#2b2f36", rim: "#12141a", blade: "#f4f7fa", bladeRim: "#99a1ab", trail: "#5a606b",
    ink: "#f4f7fa", pattern: "zigzag", cost: 800,
  },
  {
    id: "mishen", name: "Мишень", desc: "Главный на поле — ты",
    body: "#f4f7fa", rim: "#b2bac3", blade: "#22262c", bladeRim: "#545b64", trail: "#ffffff",
    ink: "#15161a", pattern: "rings", cost: 1000,
  },
  {
    id: "panda", name: "Панда", desc: "Бамбук тут не растёт",
    body: "#f4f7fa", rim: "#b2bac3", blade: "#22262c", bladeRim: "#545b64", trail: "#ffffff",
    ink: "#15161a", pattern: "patches", cost: 1250,
  },
];

export type UpgradeId = "blade" | "sweep" | "legs" | "vitality" | "regen";

export interface UpgradeDef {
  id: UpgradeId;
  name: string;
  desc: string;
  max: number;
  base: number;
}

export const UPGRADES: UpgradeDef[] = [
  { id: "blade", name: "Лезвие", desc: "+15% урона косы за уровень", max: 8, base: 25 },
  { id: "sweep", name: "Размах", desc: "+9% к радиусу взмаха за уровень", max: 8, base: 25 },
  { id: "legs", name: "Скороход", desc: "+6% к скорости за уровень", max: 8, base: 20 },
  { id: "vitality", name: "Живучесть", desc: "+18% к запасу сил за уровень", max: 8, base: 30 },
  { id: "regen", name: "Регенерация", desc: "+0.9 восст. сил в секунду", max: 8, base: 35 },
];

export function upgradeCost(def: UpgradeDef, lvl: number): number {
  return Math.round(def.base * Math.pow(1.8, lvl));
}

export interface BestRecords {
  score: number;
  level: number;
  kills: number;
  grass: number;
  time: number;
}

export interface SaveData {
  dew: number;
  name: string;
  skin: string;
  unlocked: string[];
  upgrades: Record<UpgradeId, number>;
  best: BestRecords;
  runs: number;
  totalKills: number;
  totalGrass: number;
  muted: boolean;
}

const KEY = "kosario_save_v1";

export function defaultSave(): SaveData {
  return {
    dew: 0,
    name: "",
    skin: "ugol",
    unlocked: ["ugol", "grafit"],
    upgrades: { blade: 0, sweep: 0, legs: 0, vitality: 0, regen: 0 },
    best: { score: 0, level: 0, kills: 0, grass: 0, time: 0 },
    runs: 0,
    totalKills: 0,
    totalGrass: 0,
    muted: false,
  };
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    const def = defaultSave();
    const ids = SKINS.map((s) => s.id);
    let unlocked = (parsed.unlocked ?? def.unlocked).filter((id) => ids.includes(id));
    if (!unlocked.includes("ugol")) unlocked = ["ugol", ...unlocked];
    if (!unlocked.includes("grafit")) unlocked = ["grafit", ...unlocked];
    let skin = parsed.skin ?? def.skin;
    if (!ids.includes(skin)) skin = "ugol";
    if (!unlocked.includes(skin)) skin = "ugol";
    return {
      ...def,
      ...parsed,
      skin,
      upgrades: { ...def.upgrades, ...(parsed.upgrades ?? {}) },
      best: { ...def.best, ...(parsed.best ?? {}) },
      unlocked,
    };
  } catch {
    return defaultSave();
  }
}

export function persistSave(s: SaveData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage full / private mode — играем без сохранений */
  }
}

export const fmt = (n: number) => Math.round(n).toLocaleString("ru-RU");
export const fmtTime = (sec: number) =>
  Math.floor(sec / 60) + ":" + String(Math.floor(sec % 60)).padStart(2, "0");

export const BOT_NAMES = [
  "Дачник", "Бабка Зина", "Трактор", "Крапива", "Хрен", "Лопух", "Пырей", "Сныть",
  "Одуван", "Борщевик", "Клевер", "Чертополох", "Мятлик", "Ревень", "Щавель", "Укроп",
  "Газонщик-2", "Секатор", "Комбайнёр", "Сеновал", "Колосок", "Медовик", "Тракторист",
  "Хлебороб", "Солома", "Жнец", "Рожь", "Овёс", "Мельник", "Зерно", "Ватрушка",
  "Сухарь", "Отруби", "Каравай", "Элеватор", "Целина", "Помол", "Дернина", "Просо", "Гречиха",
];
