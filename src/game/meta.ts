export interface SkinDef {
  id: string;
  name: string;
  desc: string;
  body: string;
  rim: string;
  blade: string;
  bladeRim: string;
  trail: string;
  cost: number;
}

export const SKINS: SkinDef[] = [
  {
    id: "classic",
    name: "Газонщик",
    desc: "Верный трудяга с острой косой",
    body: "#74e33f",
    rim: "#2e7d1f",
    blade: "#eef9e2",
    bladeRim: "#9db88c",
    trail: "#8def4a",
    cost: 0,
  },
  {
    id: "sun",
    name: "Подсолнух",
    desc: "Семечки сами себя не соберут",
    body: "#ffd23f",
    rim: "#a06b00",
    blade: "#fff2b0",
    bladeRim: "#c7a24a",
    trail: "#ffd23f",
    cost: 0,
  },
  {
    id: "night",
    name: "Ночной жнец",
    desc: "Косит после заката. Светится",
    body: "#2b3646",
    rim: "#0d141d",
    blade: "#8dff3c",
    bladeRim: "#2e7d1f",
    trail: "#8dff3c",
    cost: 60,
  },
  {
    id: "frost",
    name: "Мороз",
    desc: "Колосья стынут, коса поёт",
    body: "#7fd8ff",
    rim: "#1e6f9e",
    blade: "#eafcff",
    bladeRim: "#7fb3c9",
    trail: "#a8ecff",
    cost: 120,
  },
  {
    id: "gold",
    name: "Золотая коса",
    desc: "Для тех, кто косит с шиком",
    body: "#f5b93f",
    rim: "#8a5a00",
    blade: "#fff6c9",
    bladeRim: "#d8b23f",
    trail: "#ffe38a",
    cost: 240,
  },
  {
    id: "ember",
    name: "Пепелище",
    desc: "После него поле уже не колосится",
    body: "#ff6a3d",
    rim: "#7a1e05",
    blade: "#ffd9a0",
    bladeRim: "#c96a2a",
    trail: "#ff8c3d",
    cost: 380,
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
    skin: "classic",
    unlocked: ["classic", "sun"],
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
    return {
      ...def,
      ...parsed,
      upgrades: { ...def.upgrades, ...(parsed.upgrades ?? {}) },
      best: { ...def.best, ...(parsed.best ?? {}) },
      unlocked: parsed.unlocked?.length ? parsed.unlocked : def.unlocked,
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
  "Дачник",
  "Бабка Зина",
  "Трактор",
  "Крапива",
  "Хрен",
  "Лопух",
  "Пырей",
  "Сныть",
  "Одуван",
  "Борщевик",
  "Клевер",
  "Чертополох",
  "Мятлик",
  "Ревень",
  "Щавель",
  "Укроп",
  "Газонщик-2",
  "Секатор",
  "Комбайнёр",
  "Сеновал",
  "Колосок",
  "Медовик",
  "Тракторист",
  "Хлебороб",
  "Солома",
  "Жнец",
  "Рожь",
  "Овёс",
  "Мельник",
  "Зерно",
  "Ватрушка",
  "Сухарь",
  "Отруби",
  "Каравай",
  "Элеватор",
  "Целина",
  "Помол",
  "Дернина",
  "Просо",
  "Гречиха",
];
